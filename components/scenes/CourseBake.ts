/**
 * Offline render of the simulator screen's tee view: the hole the bay's projector shows.
 *
 * Not part of the site bundle. It is the source of `public/media/hero/course-*.webp`: a sky with drifting cumulus,
 * two forested ridges, a few hundred lit trees (round-crowned hardwoods, tall pines, spruce), a raised tee box with
 * cross-mown stripes, a swale of rough, a striped fairway climbing to an elevated green, bunkers, a cart path and
 * the shadows the trees throw. Everything is procedural so it can be re-rendered at any size; the layout comes
 * from `course.ts`, shared with the hero so the on-screen ball flight lands where this picture says.
 *
 * To re-render: mount a temporary client page that calls `bakeCourse(2)` (renders at 2x, downsamples to 2560x1600)
 * and save the returned PNG, then encode it with sharp: WebP q78 at 2560 wide and at 1600 wide for touch devices.
 */
import * as THREE from "three";
import { CART_PATH, COURSE, TERRAIN_GLSL, fairwayX, pathDistance, teeCamera, terrain } from "./course";

const NOISE = /* glsl */ `
  float hash11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
  vec3 hash31(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xxy + p3.yzz) * p3.zyx); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p, int oct) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 9; i++) { if (i >= oct) break; s += a * vnoise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 17.1; a *= 0.5; }
    return s;
  }
  /** F1 distance, the cell's random id, and the vector from the feature point (for dome normals). */
  vec4 worley(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float d1 = 9.0; vec2 id = vec2(0.0), rv = vec2(0.0);
    for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = hash22(i + g) * 0.85 + 0.075;
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < d1) { d1 = d; id = i + g; rv = r; }
    }
    return vec4(sqrt(d1), hash12(id), -rv);
  }
  vec3 srgb(vec3 c) { return pow(c, vec3(2.2)); }
  vec3 srgbHex(float r, float g, float b) { return pow(vec3(r, g, b) / 255.0, vec3(2.2)); }
`;

/* ------------------------------------------------------------------------------------------------ sky + ridges */

const SKY_VERT = /* glsl */ `
  varying vec2 vNdc;
  void main() { vNdc = position.xy; gl_Position = vec4(position.xy, 1.0, 1.0); }
`;
const SKY_FRAG = /* glsl */ `
  uniform mat4 uInvProj;
  uniform mat4 uCamWorld;
  uniform vec3 uCamPos;
  uniform vec3 uSun;
  varying vec2 vNdc;
  ${NOISE}

  vec3 sky(vec3 ray) {
    float e = max(ray.y, 0.0);
    vec3 zen = srgbHex(52.0, 118.0, 214.0);
    vec3 mid = srgbHex(104.0, 158.0, 228.0);
    vec3 hor = srgbHex(196.0, 218.0, 236.0);
    vec3 c = mix(hor, mid, smoothstep(0.0, 0.16, e));
    c = mix(c, zen, smoothstep(0.12, 0.6, e));
    // cumulus on a plane 1.6 km up: domain-warped fbm, lit from the sun side, thinning toward the horizon
    if (ray.y > 0.004) {
      float t = (1600.0 - uCamPos.y) / ray.y;
      vec2 q = (uCamPos.xz + ray.xz * t) / 2600.0 + vec2(0.31, 4.7);
      vec2 w = vec2(fbm(q * 1.6 + 3.1, 5), fbm(q * 1.6 - 1.7, 5));
      float n = fbm(q * 2.2 + w * 1.1, 8);
      float det = fbm(q * 14.0 + w, 5);
      float dens = smoothstep(0.5, 0.74, n + (det - 0.5) * 0.16);
      float n2 = fbm((q + uSun.xz * 0.012) * 2.2 + w * 1.1, 8);
      float lit = clamp(0.6 + (n - n2) * 7.0 + (det - 0.5) * 0.4, 0.0, 1.0);
      vec3 shade = srgbHex(170.0, 184.0, 206.0);
      vec3 cc = mix(shade, vec3(1.0), lit);
      cc = mix(cc, hor, smoothstep(0.25, 0.0, e) * 0.55);
      float fade = smoothstep(0.004, 0.09, ray.y);
      c = mix(c, cc, dens * fade);
    }
    return c;
  }

  /** A forested ridge at elevation profile h(th): canopy crowns as worley domes lit from the sun side. */
  vec4 ridge(float th, float el, float base, float amp, float freq, float seed, float hazeAmt, vec3 tint) {
    float h = base + amp * fbm(vec2(th * freq + seed, seed * 1.7), 6);
    vec2 cp = vec2(th, el) * 520.0;
    vec4 wv = worley(cp + seed * 9.0);
    h += 0.0028 * (1.0 - wv.x);                         // ragged crown line
    float edge = fwidth(el) * 1.5;
    float a = smoothstep(h + edge, h - edge, el);
    if (a <= 0.0) return vec4(0.0);
    vec3 n = normalize(vec3(wv.zw * 1.6, 1.0));
    float lit = clamp(0.55 + dot(n.xy, normalize(vec2(-0.7, 0.7))) * 0.55, 0.0, 1.0);
    float gap = smoothstep(0.75, 0.3, wv.x);
    vec3 c = tint * mix(0.36, 1.18, lit) * mix(0.55, 1.0, gap);
    c *= mix(0.9, 1.1, wv.y);
    // valleys between crowns of the far forest read darker; the foot of each ridge sits in haze
    float foot = smoothstep(h - 0.05, h, el);
    vec3 haze = srgbHex(178.0, 204.0, 222.0);
    c = mix(c, haze, clamp(hazeAmt + (1.0 - foot) * 0.18, 0.0, 1.0));
    return vec4(c, a);
  }

  void main() {
    vec4 vp = uInvProj * vec4(vNdc, 1.0, 1.0);
    vec3 ray = normalize((uCamWorld * vec4(normalize(vp.xyz / vp.w), 0.0)).xyz);
    vec3 c = sky(ray);
    float th = atan(ray.x, -ray.z);
    float el = asin(clamp(ray.y, -1.0, 1.0));
    // far ridge (hazy, higher on the left), near ridge (greener, dips behind the green)
    vec4 r1 = ridge(th, el, 0.1 + 0.05 * smoothstep(0.5, -0.6, th), 0.07, 2.3, 3.0, 0.42, srgbHex(64.0, 108.0, 70.0));
    c = mix(c, r1.rgb, r1.a);
    vec4 r2 = ridge(th, el, 0.075 + 0.045 * smoothstep(-0.05, -0.7, th) + 0.03 * smoothstep(0.1, 0.6, th), 0.05, 3.7, 11.0, 0.18, srgbHex(50.0, 100.0, 44.0));
    c = mix(c, r2.rgb, r2.a);
    gl_FragColor = vec4(c, 1.0);
    #include <colorspace_fragment>
  }
`;

/* ------------------------------------------------------------------------------------------------------ ground */

const GROUND_VERT = /* glsl */ `
  varying vec3 vW;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const GROUND_FRAG = /* glsl */ `
  uniform vec3 uSun;
  uniform vec3 uCamPos;
  varying vec3 vW;
  ${NOISE}
  ${TERRAIN_GLSL}

  float sdEllipse(vec2 p, vec2 c, vec2 r, float ang) {
    p -= c; float cs = cos(ang), sn = sin(ang);
    p = vec2(cs * p.x + sn * p.y, -sn * p.x + cs * p.y);
    return (length(p / r) - 1.0) * min(r.x, r.y);
  }
  float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
  float sdSeg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }

  float fairwayHalf(float d) { return 16.5 + 3.0 * sin(d / 41.0 + 1.0) - 3.0 * smoothstep(250.0, 318.0, d); }
  float sdFairway(vec2 p) {
    float d = p.y;
    float side = abs(p.x - fairwayX(d)) - fairwayHalf(d);
    float ends = max(27.0 - d, d - 322.0);
    // rounded where the sides meet the ends, as a mower would leave them
    vec2 v = vec2(side, ends) + 11.0;
    return length(max(v, 0.0)) + min(max(v.x, v.y), 0.0) - 11.0;
  }
  float sdGreen(vec2 p) { return sdEllipse(p, vec2(${COURSE.pin.x.toFixed(1)} + 1.5, ${COURSE.pin.d.toFixed(1)} + 2.0), vec2(15.0, 12.5), 0.35); }
  float sdBunkers(vec2 p) {
    float wob = (fbm(p * 0.35, 3) - 0.5) * 1.6;
    float b = sdEllipse(p, vec2(fairwayX(205.0) + 22.0, 205.0), vec2(9.5, 4.2), 0.25);
    b = smin(b, sdEllipse(p, vec2(fairwayX(205.0) + 27.0, 199.0), vec2(5.5, 3.6), -0.4), 2.0);
    b = min(b, smin(sdEllipse(p, vec2(fairwayX(150.0) - 21.0, 152.0), vec2(10.0, 4.0), -0.2), sdEllipse(p, vec2(fairwayX(150.0) - 26.0, 158.0), vec2(5.0, 3.2), 0.3), 2.0));
    b = min(b, sdEllipse(p, vec2(2.5, 330.0), vec2(7.5, 4.2), 0.5));
    b = min(b, smin(sdEllipse(p, vec2(31.5, 327.0), vec2(6.5, 3.6), -0.6), sdEllipse(p, vec2(34.0, 333.0), vec2(4.0, 3.0), 0.2), 1.5));
    return b + wob;
  }
  float sdPath(vec2 p) {
    vec2 pts[${CART_PATH.length}];
    ${CART_PATH.map(([x, d], i) => `pts[${i}] = vec2(${x.toFixed(1)}, ${d.toFixed(1)});`).join(" ")}
    float m = 1e9;
    for (int i = 0; i < ${CART_PATH.length - 1}; i++) m = min(m, sdSeg(p, pts[i], pts[i + 1]));
    return m - 1.35;
  }
  float sdTee(vec2 p) { vec2 q = abs(vec2(p.x, p.y + 10.0)) - vec2(11.2, 17.6); return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.6; }
  float sdIsland(vec2 p) { return sdEllipse(p, vec2(fairwayX(118.0) - 26.0, 118.0), vec2(9.5, 7.0), 0.3) + (fbm(p * 0.2, 3) - 0.5) * 2.4; }

  /** Multi-scale grass texture, octaves fading out as they fall below the pixel footprint. */
  float grass(vec2 p, float base) {
    float fw = max(length(fwidth(p)), 1e-4);
    float n = 0.0, a = 0.5, f = base;
    for (int i = 0; i < 11; i++) {
      float w = 1.0 - smoothstep(0.2, 0.55, fw * f);
      n += a * w * (vnoise(p * f + float(i) * 13.1) - 0.5);
      f *= 2.03; a *= 0.62;
    }
    return n;
  }

  /** Blade-scale grain, faded out once it falls below a pixel. */
  float fineGrain(vec2 p, vec2 f) {
    float fw = max(length(fwidth(p * f)), 1e-4);
    return (vnoise(p * f) - 0.5) * (1.0 - smoothstep(0.35, 0.9, fw));
  }

  void main() {
    vec2 p = vec2(vW.x, -vW.z);                 // (x, distance down the hole)
    float dist = length(vW - uCamPos);
    // terrain normal by central differences of the shared height field
    float e = 0.35;
    vec3 n = normalize(vec3(terrain(p.x - e, p.y) - terrain(p.x + e, p.y), 2.0 * e, -(terrain(p.x, p.y - e) - terrain(p.x, p.y + e))));
    // micro relief (lumps in the rough, gentle undulation in the fairway)
    float lump = fbm(p * 0.09, 4) - 0.5;
    n = normalize(n + vec3(lump * 0.18, 0.0, (fbm(p * 0.09 + 7.0, 4) - 0.5) * 0.18));

    float fw = sdFairway(p), gr = sdGreen(p), bk = sdBunkers(p), pa = sdPath(p), te = sdTee(p), il = sdIsland(p);
    float aa = max(length(fwidth(p)) * 0.8, 0.02);

    // colours
    vec3 rough = srgbHex(76.0, 140.0, 46.0);
    vec3 cut1 = srgbHex(96.0, 160.0, 54.0);
    vec3 fair = srgbHex(118.0, 182.0, 66.0);
    vec3 teeC = srgbHex(112.0, 178.0, 62.0);
    vec3 grn = srgbHex(128.0, 192.0, 78.0);
    vec3 sand = srgbHex(234.0, 224.0, 196.0);
    vec3 path = srgbHex(188.0, 183.0, 170.0);
    vec3 mulch = srgbHex(122.0, 84.0, 52.0);

    // rough: clumpy, patchy, slightly bluer in the hollows
    float mott = fbm(p * 0.035, 4);
    vec3 c = rough * mix(0.8, 1.1, mott);
    c *= 1.0 + grass(p, 0.25) * 0.6;
    c *= 1.0 + fineGrain(p, vec2(26.0, 9.0)) * 0.5 + fineGrain(p, vec2(7.0, 2.6)) * 0.35;
    // tree belts: darker, sparser grass with pine straw showing through
    float belt = smoothstep(27.0, 36.0, abs(p.x - fairwayX(p.y))) * smoothstep(14.0, 30.0, p.y);
    float litter = smoothstep(0.42, 0.72, fbm(p * 0.22, 4));
    vec3 floorC = mix(rough * 0.5, mulch * 0.62, litter * 0.55) * (1.0 + grass(p, 0.6) * 0.5);
    c = mix(c, floorC, belt * 0.85);

    // first cut around the fairway, then the fairway with stripes running toward the green and a soft cross-cut
    float inCut = smoothstep(2.6 + aa, 2.6 - aa, fw);
    c = mix(c, cut1 * (1.0 + grass(p, 0.4) * 0.35), inCut);
    float inFw = smoothstep(aa, -aa, fw);
    float lane = (p.x - fairwayX(p.y)) / 7.5;
    float stripe = smoothstep(0.42, 0.58, abs(fract(lane) - 0.5) * 2.0);
    float xcut = smoothstep(0.4, 0.6, abs(fract((p.y + (p.x - fairwayX(p.y)) * 0.6) / 11.0) - 0.5) * 2.0);
    vec3 fc = fair * mix(0.9, 1.07, stripe) * mix(0.97, 1.03, xcut);
    fc *= 1.0 + grass(p, 0.5) * 0.28 + fineGrain(p, vec2(40.0, 13.0)) * 0.22;
    fc *= mix(0.95, 1.04, fbm(p * 0.05 + 3.0, 3));
    c = mix(c, fc, inFw);

    // tee box: cross-mown checks, a slightly darker bank on its sides and front
    float inTee = smoothstep(aa, -aa, te);
    float m1 = smoothstep(0.44, 0.56, abs(fract((p.x + p.y) / 2.0) - 0.5) * 2.0);
    float m2 = smoothstep(0.44, 0.56, abs(fract((p.x - p.y) / 2.0) - 0.5) * 2.0);
    float chk = (m1 - 0.5) * (m2 - 0.5);
    vec3 tc = teeC * (1.0 + chk * 0.22) * (1.0 + grass(p, 1.2) * 0.32);
    tc *= 1.0 + fineGrain(p, vec2(70.0, 22.0)) * 0.3 + fineGrain(p, vec2(19.0, 6.5)) * 0.22;
    c = mix(c, tc, inTee);
    float bank = smoothstep(0.0, 0.6, abs(terrain(p.x, p.y) - terrain(p.x, p.y + 0.6)) + abs(terrain(p.x + 0.6, p.y) - terrain(p.x, p.y)));
    c *= mix(1.0, 0.86, bank * (1.0 - inTee * 0.3));

    // green, its collar, and the fine stripes of the putting surface
    float inGrn = smoothstep(aa, -aa, gr);
    float collar = smoothstep(1.6 + aa, 1.6 - aa, gr) * (1.0 - inGrn);
    c = mix(c, fair * 1.02, collar);
    float gs = smoothstep(0.4, 0.6, abs(fract((p.x * 0.8 + p.y * 0.6) / 2.4) - 0.5) * 2.0);
    c = mix(c, grn * mix(0.95, 1.05, gs) * (1.0 + grass(p, 1.5) * 0.1), inGrn);

    // mulch under the tree island
    float inIsl = smoothstep(aa, -aa, il);
    vec3 mc = mulch * mix(0.7, 1.15, fbm(p * 1.6, 5)) * (1.0 + grass(p, 2.0) * 0.4);
    c = mix(c, mc, inIsl);

    // cart path: pale concrete, darker joints and a shaded lip
    float inPath = smoothstep(aa, -aa, pa);
    vec3 pc = path * mix(0.92, 1.05, fbm(p * 0.8, 4)) * (1.0 - 0.18 * smoothstep(-0.25, 0.0, pa));
    c = mix(c, pc, inPath);
    c *= mix(1.0, 0.82, smoothstep(0.8, 0.0, pa) * (1.0 - inPath));

    // bunkers: bright raked sand; the far lip faces us (lit), the near lip drops away (shaded), a grass lip around
    float inB = smoothstep(aa, -aa, bk);
    float lipShade = smoothstep(-1.4, 0.0, bk);
    vec3 sc = sand * mix(0.92, 1.04, fbm(p * 2.0, 4));
    sc *= mix(1.0, 0.72, lipShade * smoothstep(-0.2, 0.6, fbm(p * 0.5 + 2.0, 2)));
    c = mix(c, sc, inB);
    c *= mix(1.0, 0.78, smoothstep(1.2, 0.0, bk) * (1.0 - inB));

    // light: sun from behind the golfer's left shoulder, a broad sky fill
    float ndl = max(dot(n, normalize(uSun)), 0.0);
    vec3 lit = c * (0.5 + 0.62 * ndl) + c * srgbHex(150.0, 185.0, 235.0) * 0.08 * n.y;
    // aerial perspective
    vec3 haze = srgbHex(178.0, 204.0, 222.0);
    lit = mix(lit, haze, (1.0 - exp(-dist / 1500.0)) * 0.75);
    gl_FragColor = vec4(lit, 1.0);
    #include <colorspace_fragment>
  }
`;

/* -------------------------------------------------------------------------------------------- tree shadows */

const SHADOW_VERT = /* glsl */ `
  attribute vec4 aShadow;   // centre x, centre d, length along the sun, width
  attribute float aSeed;
  uniform vec2 uDir;        // shadow direction on the ground (x, d)
  varying vec2 vLocal;
  varying float vSeed;
  ${TERRAIN_GLSL}
  void main() {
    vLocal = position.xy;   // -0.5..0.5
    vSeed = aSeed;
    vec2 side = vec2(-uDir.y, uDir.x);
    vec2 g = aShadow.xy + uDir * position.y * aShadow.z + side * position.x * aShadow.w;
    vec3 w = vec3(g.x, terrain(g.x, g.y) + 0.35, -g.y);
    gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
  }
`;
const SHADOW_FRAG = /* glsl */ `
  varying vec2 vLocal;
  varying float vSeed;
  ${NOISE}
  void main() {
    vec2 q = vLocal * 2.0;
    float r = length(q);
    float blot = fbm(q * 2.6 + vSeed * 31.0, 4);
    float a = smoothstep(1.0, 0.55, r + (blot - 0.5) * 0.7);
    // dappled: light leaks through the crown
    a *= mix(0.62, 1.0, smoothstep(0.3, 0.6, fbm(q * 7.0 + vSeed * 13.0, 3)));
    gl_FragColor = vec4(0.0, 0.0, 0.0, a * 0.5);
  }
`;

/* ------------------------------------------------------------------------------------------------------ trees */

const TREE_VERT = /* glsl */ `
  attribute vec3 aBase;
  attribute vec3 aDim;      // crown width, height, trunk fraction
  attribute vec2 aSeed;     // seed, kind (0 hardwood, 1 pine, 2 spruce)
  uniform vec3 uRight;
  varying vec2 vQ;
  varying vec3 vDim;
  varying vec2 vSeed;
  varying float vDepth;
  void main() {
    float hw = aDim.x * 0.72;
    vec2 q = vec2((uv.x - 0.5) * 2.0 * hw, uv.y * (aDim.y * 1.1 + 1.2) - 0.6);
    vec3 w = aBase + uRight * q.x + vec3(0.0, q.y, 0.0);
    vQ = q; vDim = aDim; vSeed = aSeed;
    vec4 mv = viewMatrix * vec4(w, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const TREE_FRAG = /* glsl */ `
  uniform vec3 uL;          // sun in billboard space (x right, y up, z toward camera)
  varying vec2 vQ;
  varying vec3 vDim;
  varying vec2 vSeed;
  varying float vDepth;
  ${NOISE}

  // foliage palettes per kind: shadow, mid, sunlit
  void palette(float kind, float s, out vec3 dk, out vec3 md, out vec3 lt) {
    if (kind < 0.5) {
      dk = srgbHex(26.0, 52.0, 30.0); md = srgbHex(70.0, 116.0, 44.0); lt = srgbHex(170.0, 202.0, 92.0);
      md = mix(md, srgbHex(96.0, 128.0, 46.0), hash11(s * 7.0) * 0.7);
      lt = mix(lt, srgbHex(150.0, 196.0, 104.0), hash11(s * 9.0) * 0.6);
    } else if (kind < 1.5) {
      dk = srgbHex(22.0, 46.0, 30.0); md = srgbHex(60.0, 104.0, 50.0); lt = srgbHex(146.0, 184.0, 92.0);
    } else {
      dk = srgbHex(14.0, 34.0, 26.0); md = srgbHex(38.0, 78.0, 46.0); lt = srgbHex(104.0, 146.0, 82.0);
    }
    float v = mix(0.84, 1.14, hash11(s * 3.3));
    dk *= v; md *= v; lt *= mix(0.9, 1.07, hash11(s * 5.1));
  }

  /** Bark: a lit cylinder with a darker shadow side and furrowed texture. */
  vec4 trunk(vec2 q, float w, float y0, float y1, float s) {
    float bend = 0.22 * sin(q.y * 0.19 + s * 6.0) * smoothstep(y0, y1, q.y);
    float dx = q.x - bend;
    float hw = w * mix(1.0, 0.5, smoothstep(y0, y1, q.y)) * (1.0 + 0.7 * smoothstep(1.4, 0.0, q.y - y0));
    float px = fwidth(q.x);
    float a = smoothstep(hw + px, hw - px, abs(dx)) * step(y0 - 0.5, q.y) * smoothstep(y1 + 0.5, y1 - 0.5, q.y);
    if (a <= 0.0) return vec4(0.0);
    float nx = clamp(dx / hw, -1.0, 1.0);
    vec3 n = vec3(nx, 0.0, sqrt(1.0 - nx * nx));
    float l = clamp(dot(n, normalize(vec3(uL.x, 0.0, uL.z))) * 0.7 + 0.38, 0.12, 1.15);
    float bark = fbm(vec2(q.x * 10.0, q.y * 1.3) + s * 9.0, 4);
    vec3 c = srgbHex(104.0, 88.0, 74.0) * l * mix(0.62, 1.18, bark);
    return vec4(c, a);
  }

  /** Limb: a tapered segment shaded across its width like the trunk. Returns (coverage, shade). */
  vec2 limb(vec2 q, vec2 a, vec2 b, float w) {
    vec2 pa = q - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    vec2 off = pa - ba * h;
    float d = length(off);
    float ww = w * mix(1.0, 0.3, h);
    float px = fwidth(q.x);
    float side = clamp(dot(off, normalize(vec2(-ba.y, ba.x))) / ww, -1.0, 1.0);
    float l = clamp(-side * sign(uL.x + 1e-4) * 0.45 + 0.6, 0.15, 1.05);
    return vec2(smoothstep(ww + px, ww - px, d), l);
  }

  // leaf-cluster relief: clusters of clusters with leaf-scale grain
  float leafH(vec2 p) {
    vec4 a = worley(p);
    vec4 b = worley(p * 2.35 + 5.2);
    return (1.0 - smoothstep(0.0, 0.9, a.x)) * 0.6 + (1.0 - smoothstep(0.0, 0.85, b.x)) * 0.3 + vnoise(p * 6.5) * 0.2;
  }

  // lobe i of a crown, relative to the crown centre: (x, y, z toward camera), radius, and a vertical squash
  void lobe(int i, int count, float s, float R, float H, float trunkTop, bool pine, out vec3 lc, out float lr, out vec2 sq) {
    float fi = float(i);
    vec3 h3 = hash31(s * 13.7 + fi * 7.31);
    if (!pine) {
      float ang = fi * 2.399 + s;
      float rad = sqrt(fract(fi * 0.618 + h3.x * 0.3)) * 0.62 * R;
      lc = vec3(cos(ang) * rad * 1.05, sin(ang) * rad * 0.82, (h3.z - 0.4) * 0.8 * R);
      lr = R * mix(0.3, 0.5, h3.y);
      if (i == 0) { lc = vec3(0.0, 0.02 * R, 0.1 * R); lr = R * 0.66; }
      sq = vec2(1.0, 1.05);
    } else {
      float c0y = H - (H - trunkTop) * 0.48;
      float yy = mix(trunkTop + R * 0.15, H - R * 0.32, fi / float(count - 1)) + (h3.x - 0.5) * R * 0.3;
      float side = (mod(fi, 2.0) * 2.0 - 1.0) * (0.25 + 0.75 * h3.z);
      lc = vec3(side * 0.55 * R * mix(1.0, 0.55, fi / float(count)), yy - c0y, (h3.y - 0.5) * 0.6 * R);
      lr = R * mix(0.3, 0.46, h3.y) * mix(1.0, 0.7, fi / float(count));
      sq = vec2(0.95, 1.65);
    }
  }

  void main() {
    vec2 q = vQ;
    float W = vDim.x, H = vDim.y, tf = vDim.z;
    float s = vSeed.x, kind = vSeed.y;
    bool pine = kind > 0.5 && kind < 1.5;
    bool spruce = kind > 1.5 && kind < 2.5;
    bool shrub = kind > 2.5;
    vec3 dk, md, lt; palette(shrub ? 0.0 : kind, s, dk, md, lt);
    if (shrub) { dk *= 0.75; md *= 0.78; lt *= 0.8; }
    float R = W * 0.5;
    float trunkTop = H * tf;
    float px = max(fwidth(q.x), 1e-4);
    vec2 c0 = vec2(0.0, pine ? H - (H - trunkTop) * 0.48 : H - R * 0.98);
    int count = pine ? 11 : (shrub ? 7 : 15);

    // ---- wood: trunk, and limbs reaching into the lobes (seen through the crown's gaps)
    vec4 col = vec4(0.0);
    if (!shrub) col = trunk(q, W * (pine ? 0.036 : (spruce ? 0.03 : 0.05)), -0.6, spruce ? H * 0.5 : trunkTop + R * 0.35, s);
    if (!spruce && !shrub) {
      for (int i = 1; i < 7; i++) {
        vec3 lc; float lr; vec2 sq;
        lobe(i, count, s, R, H, trunkTop, pine, lc, lr, sq);
        vec2 a = vec2(0.0, trunkTop * mix(0.8, 1.0, hash11(s + float(i))));
        vec2 b = mix(a, c0 + lc.xy, 0.85);
        vec2 lb = limb(q, a, b, W * (pine ? 0.013 : 0.022));
        float grain = fbm(q * vec2(6.0, 2.0) + float(i) * 5.0, 3);
        col = mix(col, vec4(srgbHex(96.0, 82.0, 70.0) * lb.y * mix(0.7, 1.15, grain), 1.0), lb.x);
      }
    }

    // ---- crown: signed distance to a union of lobes; normals blended across lobes by a soft max of their surfaces
    float D = 1e9, bestZ = 0.0, lobeY = 0.5;
    vec3 nb = vec3(0.0, 0.0, 1.0);
    if (spruce) {
      float y0 = H * 0.05;
      float t = clamp((q.y - y0) / (H - y0), 0.0, 1.0);
      float ph = (q.y - y0) / mix(1.25, 0.6, t) * 6.2832 + s * 5.0 + (fbm(vec2(q.x * 0.35, q.y * 0.2 + s), 3) - 0.5) * 3.0;
      float tier = 0.5 + 0.5 * sin(ph);
      float hw = R * pow(1.0 - t, 0.92) * (0.74 + 0.26 * tier);
      D = max(abs(q.x) - hw, max(y0 - q.y, q.y - H));
      float nx = clamp(q.x / max(hw, 0.05), -1.0, 1.0);
      nb = normalize(vec3(nx * 0.85, 0.3 + 0.45 * (1.0 - tier), sqrt(max(1.0 - nx * nx, 0.05))));
      bestZ = R * 0.5 * sqrt(max(1.0 - nx * nx, 0.0)); lobeY = t;
    } else {
      float wsum = 0.0, zsum = 0.0, ysum = 0.0;
      vec3 nsum = vec3(0.0);
      for (int i = 0; i < 15; i++) {
        if (i >= count) break;
        vec3 lc; float lr; vec2 sq;
        lobe(i, count, s, R, H, trunkTop, pine, lc, lr, sq);
        vec2 dxy = (q - (c0 + lc.xy)) * sq;
        float r = length(dxy);
        float dl = r - lr;
        D = min(D, dl);
        float tt = clamp(r / lr, 0.0, 1.0);
        float z = lc.z + lr * sqrt(max(1.0 - tt * tt, 0.0)) - max(dl, 0.0) * 3.0;
        float w = exp(clamp(z / (0.12 * R), -40.0, 30.0));
        wsum += w;
        nsum += w * normalize(vec3(dxy / lr, sqrt(max(1.0 - tt * tt, 0.06))));
        zsum += w * z;
        ysum += w * (c0.y + lc.y - (H - 2.0 * R)) / (2.0 * R);
      }
      nb = normalize(nsum / wsum); bestZ = zsum / wsum; lobeY = ysum / wsum;
    }

    // ---- leaves: foliage masses (metre scale) made of small, individually lit leaf clusters with gaps between
    float cs = spruce ? 0.42 : (pine ? 0.55 : (shrub ? 0.45 : 0.8));
    float ls = spruce ? 0.11 : (pine ? 0.14 : (shrub ? 0.12 : 0.17));   // leaf-cluster size, metres
    vec2 lp = q / cs + vec2(s * 3.7, s * 1.3);
    vec4 mass = worley(lp);
    vec4 sub = worley(lp * 2.35 + 5.2);
    float h = (1.0 - smoothstep(0.0, 0.9, mass.x)) * 0.62 + (1.0 - smoothstep(0.0, 0.85, sub.x)) * 0.38;
    float detail = smoothstep(ls * 1.6, ls * 0.45, px);        // 1 when leaf clusters resolve, 0 far away
    float Dp = D - (h - 0.5) * cs * 1.7;
    float cov = smoothstep(px, -px, Dp);
    if (cov > 0.0) {
      vec4 lf = worley(q / ls + vec2(s * 11.0, s * 5.0));
      vec2 tilt = (hash22(vec2(lf.y * 91.0, s)) - 0.5) * 1.3;
      float leafIn = smoothstep(0.7, 0.52, lf.x);                // cluster body vs the gap around it
      vec3 nL = normalize(vec3(lf.zw * 1.9 + tilt, 1.0));        // each cluster: a dome with its own tilt
      vec3 nM = normalize(vec3(mass.zw * 1.5 + sub.zw * 0.8, 1.0));
      vec3 n = normalize(nb * 1.1 + vec3(nM.xy, 0.0) * 0.55 + vec3(nL.xy, 0.0) * 0.7 * detail);
      float ndl = dot(n, uL);
      float diff = clamp(ndl * 0.62 + 0.36, 0.0, 1.0);
      diff *= diff;
      vec3 c = mix(dk, md, smoothstep(0.02, 0.42, diff));
      c = mix(c, lt, smoothstep(0.4, 0.95, diff));
      // per-cluster hue: some leaves yellower, some bluer
      float hv = hash12(vec2(lf.y * 37.0, s));
      c *= mix(vec3(0.9, 0.97, 1.08), vec3(1.1, 1.04, 0.86), hv * 0.8 + 0.1);
      // gaps between clusters and between masses look into the crown's shade
      float massIn = smoothstep(0.18, 0.55, h);
      float inside = mix(massIn, massIn * mix(0.25, 1.0, leafIn), detail);
      c *= mix(0.22, 1.0, inside);
      // far side of the crown and its underside are in shadow; skylight catches the rim
      c *= mix(0.58, 1.0, smoothstep(-0.5 * R, 0.55 * R, bestZ));
      c *= mix(0.62, 1.0, smoothstep(-0.05, 0.7, lobeY + n.y * 0.3));
      c += srgbHex(150.0, 190.0, 230.0) * 0.045 * smoothstep(-cs, 0.0, Dp);
      // sky holes: near the silhouette for hardwoods, all through the airy pine crowns
      float edge = smoothstep(-cs * 1.4, 0.0, Dp);
      float th = pine ? 0.36 : 0.26;
      float hole = smoothstep(th + 0.05, th - 0.05, h) * (pine ? mix(0.55, 1.0, edge) : edge);
      hole = max(hole, (1.0 - leafIn) * edge * edge * detail);
      col = mix(col, vec4(c, 1.0), cov * (1.0 - hole));
    }
    if (col.a <= 0.002) discard;
    // aerial perspective by distance
    vec3 haze = srgbHex(178.0, 204.0, 222.0);
    float f = (1.0 - exp(-vDepth / 1400.0)) * 0.82;
    vec3 rgb = mix(col.rgb, haze, f);
    // encode first, then premultiply: blending happens on the encoded framebuffer
    gl_FragColor = vec4(linearToOutputTexel(vec4(rgb, 1.0)).rgb * col.a, col.a);
  }
`;

/* ------------------------------------------------------------------------------------------------- placement */

type Tree = { x: number; d: number; W: number; H: number; tf: number; kind: number; seed: number };

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function plantTrees(): Tree[] {
  const rnd = mulberry32(7);
  const trees: Tree[] = [];
  // smooth value noise for stand density and stand type
  const h2 = (x: number, y: number) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
  const vn = (x: number, y: number) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const a = h2(ix, iy), b = h2(ix + 1, iy), c = h2(ix, iy + 1), d = h2(ix + 1, iy + 1);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  };
  const make = (x: number, d: number, kind: number, scale = 1): Tree => {
    const H = (kind === 0 ? 12 + rnd() * 10 : kind === 1 ? 19 + rnd() * 11 : 11 + rnd() * 10) * scale;
    const W = H * (kind === 0 ? 0.6 + rnd() * 0.25 : kind === 1 ? 0.32 + rnd() * 0.12 : 0.33 + rnd() * 0.1);
    const tf = kind === 0 ? 0.28 + rnd() * 0.12 : kind === 1 ? 0.55 + rnd() * 0.12 : 0.05;
    return { x, d, W, H, tf, kind, seed: rnd() * 100 };
  };
  const standKind = (x: number, d: number) => {
    const n = vn(x / 55 + 3.1, d / 55 + 7.7) + (rnd() - 0.5) * 0.35;
    return n < 0.4 ? 1 : n > 0.8 ? 2 : 0;
  };
  // keep fairway, green, tee and path corridors clear
  const clear = (x: number, d: number) => {
    const fx = fairwayX(d);
    const off = Math.abs(x - fx);
    if (d > 20 && d < 335 && off < 29) return false;
    if (Math.hypot(x - COURSE.pin.x, d - COURSE.pin.d) < 34) return false;
    if (d < 60 && off < 36) return false;
    if (pathDistance(x, d) < 4.5) return false;
    return true;
  };
  // jittered grid with a minimum spacing; density rises away from the fairway and breathes with noise
  const taken = new Map<string, [number, number][]>();
  const cell = 5;
  const key = (x: number, d: number) => `${Math.floor(x / cell)},${Math.floor(d / cell)}`;
  const roomFor = (x: number, d: number, r: number) => {
    const cx = Math.floor(x / cell), cd = Math.floor(d / cell);
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
      for (const [ox, od] of taken.get(`${cx + i},${cd + j}`) ?? []) if (Math.hypot(ox - x, od - d) < r) return false;
    }
    return true;
  };
  const plant = (t: Tree) => {
    const k = key(t.x, t.d);
    if (!taken.has(k)) taken.set(k, []);
    taken.get(k)!.push([t.x, t.d]);
    trees.push(t);
  };
  for (let d = 12; d < 540; d += 4.2) {
    for (let x = -150; x < 170; x += 4.2) {
      const jx = x + (rnd() - 0.5) * 4, jd = d + (rnd() - 0.5) * 4;
      if (!clear(jx, jd)) continue;
      const off = Math.abs(jx - fairwayX(jd));
      const behind = jd > 355;
      let p = behind ? 0.7 : 0.15 + 0.85 * Math.min(1, Math.max(0, (off - 30) / 10));
      p *= 0.35 + 0.75 * vn(jx / 26 + 11, jd / 26 + 5);
      if (off > 110 && !behind) p *= 0.4;
      if (rnd() > p) continue;
      const kind = standKind(jx, jd);
      const t = make(jx, jd, kind, behind ? 1.05 : 1);
      if (!roomFor(jx, jd, Math.max(3.6, t.W * 0.55))) continue;
      plant(t);
    }
  }
  // understory: low shrubs filling the gaps between trunks along the tree line
  for (let i = 0; i < 900; i++) {
    const d = 30 + rnd() * 470;
    const side = rnd() < 0.5 ? -1 : 1;
    const x = fairwayX(d) + side * (31 + rnd() * 40);
    if (!clear(x, d) || pathDistance(x, d) < 4) continue;
    const H = 1.6 + rnd() * 2.8;
    trees.push({ x, d, W: H * (1.3 + rnd() * 0.6), H, tf: 0, kind: 3, seed: rnd() * 100 });
  }
  // a tree island of pines left of the fairway, on its mulch bed
  const ix = fairwayX(118) - 26;
  for (let i = 0; i < 6; i++) plant(make(ix + (rnd() - 0.5) * 13, 118 + (rnd() - 0.5) * 8, rnd() < 0.85 ? 1 : 0));
  // framing trees near the tee
  plant({ x: -27, d: 23, W: 18, H: 26, tf: 0.32, kind: 0, seed: 11.3 });
  plant({ x: 31, d: 29, W: 10, H: 30, tf: 0.6, kind: 1, seed: 47.9 });
  plant({ x: 38, d: 16, W: 16, H: 23, tf: 0.3, kind: 0, seed: 23.1 });
  return trees;
}

/* ---------------------------------------------------------------------------------------------------- render */

function groundGeometry() {
  const nx = 260, nd = 640;
  const pos: number[] = [], idx: number[] = [];
  for (let j = 0; j <= nd; j++) {
    const d = -40 + 2600 * Math.pow(j / nd, 2.8);
    for (let i = 0; i <= nx; i++) {
      const t = (i / nx) * 2 - 1;
      const x = Math.sign(t) * 900 * Math.pow(Math.abs(t), 1.9);
      pos.push(x, terrain(x, d), -d);
    }
  }
  for (let j = 0; j < nd; j++) for (let i = 0; i < nx; i++) {
    const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, e = c + 1;
    idx.push(a, b, c, b, e, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

export function bakeCourse(scale = 2): string {
  const W = COURSE.width * scale, H = COURSE.height * scale;
  const canvas = document.createElement("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: false });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  const cam = teeCamera();
  const camera = new THREE.PerspectiveCamera(cam.fov, W / H, 2, 8000);
  camera.position.set(...cam.pos);
  camera.lookAt(...cam.look);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  const scene = new THREE.Scene();
  // sun behind the golfer's left shoulder, fairly high
  const sun = new THREE.Vector3(-0.62, 0.6, 0.5).normalize();

  const sky = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, depthTest: false, depthWrite: false,
    uniforms: { uInvProj: { value: camera.projectionMatrixInverse }, uCamWorld: { value: camera.matrixWorld }, uCamPos: { value: camera.position }, uSun: { value: sun } },
  }));
  sky.frustumCulled = false; sky.renderOrder = -10; scene.add(sky);

  const ground = new THREE.Mesh(groundGeometry(), new THREE.ShaderMaterial({
    vertexShader: GROUND_VERT, fragmentShader: GROUND_FRAG,
    uniforms: { uSun: { value: sun }, uCamPos: { value: camera.position } },
  }));
  ground.frustumCulled = false; ground.renderOrder = 0; scene.add(ground);

  const trees = plantTrees();
  // far to near, so premultiplied blending composites correctly in one draw
  const cp = camera.position;
  trees.sort((a, b) => Math.hypot(b.x - cp.x, -b.d - cp.z) - Math.hypot(a.x - cp.x, -a.d - cp.z));

  // shadows on the ground: thrown away from the sun
  const dir = new THREE.Vector2(-sun.x, sun.z).normalize();   // ground (x, d) direction of the shadow
  const sGeo = new THREE.InstancedBufferGeometry();
  sGeo.copy(new THREE.PlaneGeometry(1, 1, 6, 6) as unknown as THREE.InstancedBufferGeometry);
  const sh: number[] = [], ss: number[] = [];
  const reach = Math.hypot(sun.x, sun.z) / sun.y;
  for (const t of trees) {
    if (t.kind === 3) { sh.push(t.x, t.d, t.W * 0.9, t.W * 0.8); ss.push(t.seed); continue; }
    const crownY = t.H - t.W * 0.5;
    const len = t.W * 1.0 + crownY * reach * 0.5;
    const cx = t.x + dir.x * crownY * reach * 0.62, cd = t.d + dir.y * crownY * reach * 0.62;
    sh.push(cx, cd, len, t.W * 0.95); ss.push(t.seed);
    sh.push(t.x, t.d, t.W * 0.35, t.W * 0.28); ss.push(t.seed + 3);   // contact shade at the foot
  }
  sGeo.setAttribute("aShadow", new THREE.InstancedBufferAttribute(new Float32Array(sh), 4));
  sGeo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(ss), 1));
  sGeo.instanceCount = ss.length;
  const shadows = new THREE.Mesh(sGeo, new THREE.ShaderMaterial({
    vertexShader: SHADOW_VERT, fragmentShader: SHADOW_FRAG, transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    uniforms: { uDir: { value: dir } },
  }));
  shadows.frustumCulled = false; shadows.renderOrder = 1; scene.add(shadows);

  // trees
  const tGeo = new THREE.InstancedBufferGeometry();
  const quad = new THREE.PlaneGeometry(1, 1);
  quad.translate(0, 0.5, 0);
  tGeo.copy(quad as unknown as THREE.InstancedBufferGeometry);
  const base: number[] = [], dim: number[] = [], seed: number[] = [];
  for (const t of trees) {
    base.push(t.x, terrain(t.x, t.d) - 0.2, -t.d);
    dim.push(t.W, t.H, t.tf);
    seed.push(t.seed, t.kind);
  }
  tGeo.setAttribute("aBase", new THREE.InstancedBufferAttribute(new Float32Array(base), 3));
  tGeo.setAttribute("aDim", new THREE.InstancedBufferAttribute(new Float32Array(dim), 3));
  tGeo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(seed), 2));
  tGeo.instanceCount = trees.length;
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  right.y = 0; right.normalize();
  // the sun expressed in billboard space (x right, y up, z toward the camera)
  const toCam = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 2);
  toCam.y = 0; toCam.normalize();
  const L = new THREE.Vector3(sun.dot(right), sun.y, sun.dot(toCam)).normalize();
  const treeMesh = new THREE.Mesh(tGeo, new THREE.ShaderMaterial({
    vertexShader: TREE_VERT, fragmentShader: TREE_FRAG, transparent: true, depthWrite: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    uniforms: { uRight: { value: right }, uL: { value: L } },
  }));
  treeMesh.frustumCulled = false; treeMesh.renderOrder = 2; scene.add(treeMesh);

  // the pin (no tee markers or balls anywhere on the picture: nothing on the screen should read as a golf ball)
  const py = terrain(COURSE.pin.x, COURSE.pin.d);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 6.2, 8), new THREE.MeshBasicMaterial({ color: 0xf4f1e8 }));
  pole.position.set(COURSE.pin.x, py + 3.1, -COURSE.pin.d); pole.renderOrder = 3; scene.add(pole);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.45), new THREE.MeshBasicMaterial({ color: 0xf2c418, side: THREE.DoubleSide }));
  flag.position.set(COURSE.pin.x + 1.1, py + 5.45, -COURSE.pin.d); flag.renderOrder = 3; scene.add(flag);

  renderer.render(scene, camera);

  // downsample the supersampled frame with the browser's high-quality resampler
  const out = document.createElement("canvas");
  out.width = COURSE.width; out.height = COURSE.height;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, out.width, out.height);
  const url = out.toDataURL("image/png");

  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    (m.material as THREE.Material | undefined)?.dispose?.();
  });
  renderer.dispose();
  renderer.forceContextLoss();
  return url;
}
