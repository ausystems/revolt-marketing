/**
 * The hero: a simulator bay at night, rendered in real time.
 *
 * Camera behind-left of the tee, low. The ball waits on a two-tone hitting mat set into the bay's turf. As scroll
 * progress runs 0 → 1 the ball launches and its tracer draws through the air while the camera cranes up and back
 * to take in the whole arc; at the very end the ball meets the screen and the light blooms where it strikes. That
 * is the whole story: nothing moves on the screen. Frames are drawn only on change.
 *
 * The screen is a projector picture: the hole is a baked render (`course.ts`, `CourseBake.ts`), the HUD is drawn
 * live in the site's typeface, and the screen shader adds what a projector does (lifted blacks, a hot spot, the
 * fabric). The picture also lights the bay: walls, turf, mat and ball integrate its glow and the green LED frame.
 *
 * The turf is shell-rendered: stacked slices through a field of strands, so fibres have height, shade down into
 * the pile, lean with the nap (the mat's halves are brushed in opposite directions, the classic two-tone) and sit
 * in shadow around the ball.
 *
 * Units are metres. The ball is drawn at 1.6× real size so it reads at hero scale (art direction, not physics).
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const INK = 0x0a0a0a;
const GREEN = new THREE.Color(0x2bb61e);
const SCREEN = { w: 4.64, h: 2.9, y: 1.62, z: -5.2 };
const BALL_R = 0.0342;
const MAT_TOP = 0.03;
const MAT_PILE = 0.018;
const BALL_REST = new THREE.Vector3(0.06, MAT_TOP + MAT_PILE + BALL_R - 0.009, 0.08);
/** Where the ball meets the screen (UV): just below centre, over the fairway. */
const IMPACT_UV = new THREE.Vector2(0.5, 0.47);

/* --------------------------------------------------------------------------------------------- small helpers */

/** Sine in-out: no jolt at either end, so a scrubbed scroll always feels soft. */
const smooth = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Screen UV → bay-space point on the screen plane. */
const screenPoint = (u: number, v: number, z = SCREEN.z) => new THREE.Vector3((u - 0.5) * SCREEN.w, SCREEN.y + (v - 0.5) * SCREEN.h, z);

/** Hex-packed dimples drawn as radial gradients: the bump map for the ball. */
function dimpleCanvas(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  const r = size / 26;
  const dx = r * 2.15, dy = dx * 0.866;
  for (let row = -1; row < size / dy + 1; row++) {
    for (let col = -1; col < size / dx + 1; col++) {
      const x = col * dx + (row % 2 ? dx / 2 : 0), y = row * dy;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 0.95);
      g.addColorStop(0, "#5a5a5a");
      g.addColorStop(0.75, "#6f6f6f");
      g.addColorStop(1, "#808080");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return c;
}

/**
 * The strand field the turf shells slice through. R: blade height (cones, so blades taper toward the tip),
 * G: per-blade tint, B/A: the blade's surface normal across its width plus a random lean.
 */
function strandTexture(size: number, cells: number, seed: number, minPeak = 0.55) {
  const data = new Uint8Array(size * size * 4);
  const hgt = new Float32Array(size * size);
  const rnd = mulberry32(seed);
  const cs = size / cells;
  for (let cy = 0; cy < cells; cy++) for (let cx = 0; cx < cells; cx++) {
    const n = rnd() < 0.55 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const x0 = (cx + rnd()) * cs, y0 = (cy + rnd()) * cs;
      const r = cs * (0.42 + rnd() * 0.4);
      const peak = minPeak + rnd() * (1 - minPeak);
      const tint = rnd();
      const lean = rnd() * Math.PI * 2;
      for (let yy = Math.floor(y0 - r); yy <= Math.ceil(y0 + r); yy++) {
        for (let xx = Math.floor(x0 - r); xx <= Math.ceil(x0 + r); xx++) {
          const dx = xx + 0.5 - x0, dy = yy + 0.5 - y0;
          const dd = Math.hypot(dx, dy) / r;
          if (dd >= 1) continue;
          const hv = peak * (1 - dd);
          const i = (((yy % size) + size) % size) * size + (((xx % size) + size) % size);
          if (hv <= hgt[i]) continue;
          hgt[i] = hv;
          const nx = Math.max(-1, Math.min(1, (dx / r) * 0.85 + Math.cos(lean) * 0.3));
          const ny = Math.max(-1, Math.min(1, (dy / r) * 0.85 + Math.sin(lean) * 0.3));
          data[i * 4] = Math.round(hv * 255);
          data[i * 4 + 1] = Math.round(tint * 255);
          data[i * 4 + 2] = Math.round((0.5 + 0.5 * nx) * 255);
          data[i * 4 + 3] = Math.round((0.5 + 0.5 * ny) * 255);
        }
      }
    }
  }
  for (let i = 0; i < size * size; i++) if (hgt[i] === 0) { data[i * 4 + 1] = 128; data[i * 4 + 2] = 128; data[i * 4 + 3] = 128; }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/** Quilted acoustic panels (pillows with soft seams) as a tangent-space normal map. */
function quiltTexture(size = 256) {
  const data = new Uint8Array(size * size * 4);
  const h = (x: number, y: number) => {
    const u = ((x % 1) + 1) % 1 * 2 - 1, v = ((y % 1) + 1) % 1 * 2 - 1;
    const e = (t: number) => Math.max(0, 1 - Math.pow(Math.abs(t), 7));
    return Math.sqrt(e(u) * e(v * 0.98));
  };
  const s = 1 / size;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const fx = (x + 0.5) * s, fy = (y + 0.5) * s;
    const gx = (h(fx + s, fy) - h(fx - s, fy)) * 3.5, gy = (h(fx, fy + s) - h(fx, fy - s)) * 3.5;
    const l = Math.hypot(gx, gy, 1);
    const i = (y * size + x) * 4;
    data[i] = Math.round((0.5 - (gx / l) * 0.5) * 255);
    data[i + 1] = Math.round((0.5 - (gy / l) * 0.5) * 255);
    data[i + 2] = Math.round((0.5 + (1 / l) * 0.5) * 255);
    data[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/** A soft radial falloff for glows. */
function glowCanvas(size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

/* ------------------------------------------------------------------------------------------ the simulator HUD */

type HudFont = string;
const TILES: [string, string, string][] = [
  ["BALL SPEED", "0.0", "158.4"], ["CLUB SPEED", "---", "107.9"],
  ["BACK SPIN", "0", "2,486"], ["CLUB PATH", "0.0", "1.4"],
  ["VLA", "0.0", "12.8"], ["CLUB AoA", "0.0", "2.1"],
  ["HLA", "0.0", "0.6"], ["FACE TO TARGET", "0.0", "0.3"],
  ["SIDE SPIN", "0", "214"], ["FACE TO PATH", "0.0", "-1.1"],
  ["PEAK HEIGHT", "0.0", "31.6"], ["CARRY", "0.0", "274.5"],
];
const PANEL = "rgba(19, 32, 47, 0.9)";
const PANEL_HI = "rgba(34, 51, 70, 0.96)";

function hudText(ctx: CanvasRenderingContext2D, font: HudFont, s: string, x: number, y: number, size: number, weight: number, align: CanvasTextAlign, color = "#fff", squeeze = 0.84) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(squeeze, 1);
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color;
  ctx.fillText(s, 0, 0);
  ctx.restore();
}

function panel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill = PANEL) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** The toolbar's line icons, drawn in a 40px box centred at (x, y). */
function icon(ctx: CanvasRenderingContext2D, kind: number, x: number, y: number, k: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  if (kind === 0) { // scorecard
    ctx.roundRect(-12, -16, 24, 32, 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.moveTo(-6, 1); ctx.lineTo(6, 1); ctx.moveTo(-6, 8); ctx.lineTo(3, 8); ctx.stroke();
  } else if (kind === 1) { // ball
    ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.stroke();
    for (const [a, b] of [[-5, -4], [4, -5], [-1, 3], [6, 4], [-6, 6]]) { ctx.beginPath(); ctx.arc(a, b, 1.7, 0, Math.PI * 2); ctx.fill(); }
  } else if (kind === 2) { // golfer at the flag
    ctx.moveTo(-4, 16); ctx.lineTo(-4, -16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-4, -16); ctx.lineTo(10, -11); ctx.lineTo(-4, -6); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(2, 16, 10, 3, 0, 0, Math.PI * 2); ctx.stroke();
  } else if (kind === 3) { // camera
    ctx.roundRect(-15, -9, 21, 18, 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -3); ctx.lineTo(15, -8); ctx.lineTo(15, 8); ctx.lineTo(6, 3); ctx.closePath(); ctx.stroke();
  } else { // undo
    ctx.arc(1, 2, 11, -Math.PI * 0.95, Math.PI * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, -6); ctx.lineTo(-10, 4); ctx.lineTo(-2, -3); ctx.stroke();
  }
  ctx.restore();
}

/**
 * The simulator's HUD, in the layout real launch-monitor software uses: toolbar and shot-data tiles on the left,
 * wind at the top, the hole at top right, club and hand bottom left. A still screen, waiting for the shot.
 */
function drawHud(w: number, h: number, font: HudFont) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  const k = w / 2560;
  ctx.scale(k, k);
  const m = 34;

  // toolbar
  panel(ctx, m, 128, 604, 92, 12);
  ctx.save(); ctx.beginPath(); ctx.roundRect(m, 128, 92, 92, [12, 0, 0, 12]); ctx.fillStyle = PANEL_HI; ctx.fill(); ctx.restore();
  icon(ctx, 0, m + 46, 174, 1);
  for (let i = 1; i <= 4; i++) icon(ctx, i, m + 92 + (i - 0.5) * 78, 174, 1);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(m + 92, 140, 2, 68);
  for (const [i, a, b] of [[0, "ROUND", "EDIT"], [1, "QUICK", "CTP"]] as const) {
    const cx = m + 92 + 4 * 78 + (i + 0.5) * 100;
    hudText(ctx, font, a, cx, 168, 25, 700, "center");
    hudText(ctx, font, b, cx, 198, 25, 700, "center");
  }

  // shot-data tiles, two columns
  const tw = 170, th = 120, gap = 5, ty = 232;
  TILES.forEach(([label, idle], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = m + col * (tw + gap), y = ty + row * (th + gap);
    const r: [number, number, number, number] = [row === 0 && col === 0 ? 12 : 4, row === 0 && col === 1 ? 12 : 4, row === 5 && col === 1 ? 12 : 4, row === 5 && col === 0 ? 12 : 4];
    ctx.beginPath(); ctx.roundRect(x, y, tw, th, r); ctx.fillStyle = PANEL; ctx.fill();
    hudText(ctx, font, idle, x + tw / 2, y + 66, 60, 700, "center");
    hudText(ctx, font, label, x + tw / 2, y + 100, label.length > 11 ? 19 : 22, 650, "center", "rgba(255,255,255,0.92)", 0.86);
  });

  // club and hand
  const by = 1600 - m - 2 * 96 - 6;
  for (const [i, a, b] of [[0, "Driver", "CLUB"], [1, "RH", "HAND"]] as const) {
    panel(ctx, m, by + i * 102, 112, 96, 10);
    hudText(ctx, font, a, m + 56, by + i * 102 + 46, 34, 700, "center");
    hudText(ctx, font, b, m + 56, by + i * 102 + 80, 20, 650, "center", "rgba(255,255,255,0.85)");
  }

  // wind
  const wx = 1280, wy = 36;
  panel(ctx, wx - 205, wy, 410, 78, 16);
  hudText(ctx, font, "4 MPH", wx - 128, wy + 52, 38, 700, "center");
  hudText(ctx, font, "NE", wx + 120, wy + 52, 38, 700, "center");
  ctx.beginPath(); ctx.arc(wx, wy + 44, 46, 0, Math.PI * 2); ctx.fillStyle = "#f4f6f8"; ctx.fill();
  ctx.save(); ctx.translate(wx, wy + 44); ctx.rotate(Math.PI * 0.25);
  ctx.beginPath(); ctx.moveTo(0, -27); ctx.lineTo(15, 18); ctx.lineTo(0, 9); ctx.lineTo(-15, 18); ctx.closePath();
  ctx.fillStyle = "#2a6fdb"; ctx.fill(); ctx.restore();

  // the hole
  const hx = 2560 - m - 290, hy = 36;
  ctx.beginPath(); ctx.roundRect(hx, hy, 112, 112, 12); ctx.fillStyle = "#f4f6f8"; ctx.fill();
  hudText(ctx, font, "1", hx + 56, hy + 84, 80, 700, "center", "#111821", 0.9);
  panel(ctx, hx + 118, hy, 172, 112, 12);
  hudText(ctx, font, "PAR 4", hx + 204, hy + 71, 44, 700, "center");
  return c;
}

/* ------------------------------------------------------------------------------------------------- shaders */

const TRACER_VERT = /* glsl */ `
  varying float vU;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vU = uv.x;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const TRACER_FRAG = /* glsl */ `
  uniform float uProgress;
  uniform float uSoft;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uWhite;       // how white-hot this layer burns (the core is nearly white, the halo pure green)
  uniform vec3 uCamera;
  varying float vU;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    if (vU > uProgress) discard;
    // brightest at the ball, cooling along the tail; it fades in from the tee and melts into the ball at the tip
    float head = smoothstep(uProgress - 0.3, uProgress, vU);
    float tail = smoothstep(0.0, 0.06, vU);
    float tip = smoothstep(uProgress, uProgress - 0.006, vU);
    // soft tube: fade at the silhouette so it reads as light, not plastic
    vec3 v = normalize(uCamera - vPosW);
    float rim = pow(max(dot(normalize(vNormalW), v), 0.0), uSoft);
    float a = uOpacity * (0.5 + 0.5 * head) * tail * mix(1.0, tip, 0.6) * rim;
    vec3 c = mix(uColor, vec3(1.0), uWhite * (0.75 + 0.25 * head)) * (0.85 + 0.6 * head);
    gl_FragColor = vec4(c, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const SCREEN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const SCREEN_FRAG = /* glsl */ `
  uniform sampler2D uCourse;
  uniform sampler2D uHud;
  uniform float uGain;         // projector brightness
  uniform vec2 uImpact;        // where the ball strikes (uv)
  uniform float uHit;          // 0..1: the strike blooms, then settles to a soft glow
  uniform vec3 uGreen;
  uniform float uAspect;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 asp = vec2(uAspect, 1.0);
    vec3 col = texture2D(uCourse, uv).rgb;
    vec4 hud = texture2D(uHud, uv);
    col = mix(col, hud.rgb, hud.a);
    // the projector: a hot spot, lifted blacks, the weave of the impact screen
    vec2 cc = (vUv - 0.5) * asp;
    float hot = 1.0 - dot(cc, cc) * 0.2;
    float weave = 1.0 + 0.025 * (sin(vUv.x * 2800.0) * sin(vUv.y * 1750.0));
    col = col * hot * weave * uGain + vec3(0.004, 0.005, 0.006) * uGain;
    // the strike: light blooms where the ball meets the fabric (a white core in a green halo), then settles
    if (uHit > 0.0) {
      vec2 hd = (vUv - uImpact) * asp;
      float r2 = dot(hd, hd);
      float flash = smoothstep(0.0, 0.5, uHit);
      float settle = 1.0 - 0.38 * smoothstep(0.5, 1.0, uHit);
      vec3 bloom = vec3(1.0, 1.0, 0.96) * exp(-r2 / 0.00003) * 2.2
                 + mix(uGreen, vec3(1.0), 0.25) * exp(-r2 / 0.0009) * 0.85
                 + uGreen * exp(-r2 / 0.008) * 0.26;
      col += bloom * flash * settle;
    }
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * The screen as a light. Each patch of the picture (3×2) lights the bay with its own colour; the LED frame's three
 * runs add their green. Injected into standard materials after three.js has done its own lights.
 */
const SL_DECL = /* glsl */ `
  uniform vec3 uSLCenter;
  uniform vec3 uSLRight;
  uniform vec3 uSLUp;
  uniform vec3 uSLColors[6];
  uniform float uSLPower;
  uniform vec3 uLEDA[3];
  uniform vec3 uLEDB[3];
  uniform vec3 uLEDColor;
  uniform float uLEDPower;
  uniform sampler2D uSLTex;
  uniform float uSLSpec;
  varying vec3 vSLW;
  vec3 screenIrradiance(vec3 P, vec3 N) {
    vec3 nS = normalize(cross(uSLRight, uSLUp));
    vec3 E = vec3(0.0);
    for (int j = 0; j < 2; j++) for (int i = 0; i < 3; i++) {
      vec2 g = vec2((float(i) + 0.5) / 3.0, (float(j) + 0.5) / 2.0) * 2.0 - 1.0;
      vec3 L = uSLCenter + uSLRight * g.x + uSLUp * g.y - P;
      float d2 = max(dot(L, L), 0.05);
      L *= inversesqrt(d2);
      E += uSLColors[j * 3 + i] * max(dot(N, L), 0.0) * max(dot(nS, -L), 0.0) / d2;
    }
    return E * uSLPower;
  }
  vec3 ledIrradiance(vec3 P, vec3 N) {
    float E = 0.0;
    for (int k = 0; k < 3; k++) for (int i = 0; i < SL_LED; i++) {
      vec3 L = mix(uLEDA[k], uLEDB[k], (float(i) + 0.5) / float(SL_LED)) - P;
      float d2 = max(dot(L, L), 0.02);
      E += max(dot(N, L * inversesqrt(d2)), 0.0) / d2;
    }
    return uLEDColor * E * uLEDPower * 4.0 / float(SL_LED);
  }
`;
const SL_MAIN = /* glsl */ `
  {
    vec3 slN = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
    reflectedLight.directDiffuse += BRDF_Lambert(material.diffuseColor) * (screenIrradiance(vSLW, slN) + ledIrradiance(vSLW, slN));
    #ifdef SL_SPEC
    {
      // a soft mirror image of the screen in glossy surfaces
      vec3 V = normalize(cameraPosition - vSLW);
      vec3 R = reflect(-V, slN);
      vec3 nS = normalize(cross(uSLRight, uSLUp));
      float dn = dot(R, nS);
      if (dn < -1e-3) {
        float t = dot(uSLCenter - vSLW, nS) / dn;
        if (t > 0.0) {
          vec3 Hp = vSLW + R * t - uSLCenter;
          vec2 g = vec2(dot(Hp, uSLRight) / dot(uSLRight, uSLRight), dot(Hp, uSLUp) / dot(uSLUp, uSLUp));
          float rough = material.roughness;
          float spread = t * rough * rough * 0.35 + 0.015;
          float inside = smoothstep(1.0 + spread, 1.0 - spread, max(abs(g.x), abs(g.y)));
          vec3 sc = textureLod(uSLTex, g * 0.5 + 0.5, clamp(log2(spread * 900.0), 0.0, 8.0)).rgb;
          float F = 0.04 + 0.96 * pow(1.0 - max(dot(slN, V), 0.0), 5.0);
          reflectedLight.indirectSpecular += sc * inside * F * uSLSpec;
        }
      }
    }
    #endif
  }
`;

/* ----------------------------------------------------------------------------------------------------- scene */

export type BayOptions = { touch?: boolean; reduced?: boolean; onFirstFrame?: () => void; onContextLost?: () => void };

type SharedUniforms = Record<string, THREE.IUniform>;

export class BayScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private pmrem: THREE.PMREMGenerator;
  private ball!: THREE.Mesh;
  private tracerMats: THREE.ShaderMaterial[] = [];
  private screenMat!: THREE.ShaderMaterial;
  private ballGlow!: THREE.Sprite;
  private hitGlow!: THREE.Sprite;
  private screenGlowMat!: THREE.MeshBasicMaterial;
  private curve!: THREE.QuadraticBezierCurve3;
  private sl: SharedUniforms;
  private turfMats: THREE.Material[] = [];
  /** Scratch vectors, reused every frame so a scroll never feeds the garbage collector. */
  private tmp = { ball: new THREE.Vector3(), pos: new THREE.Vector3(), look: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3() };
  private turfBall = new THREE.Vector4(0, -10, 0, BALL_R);
  private wasLow = true;
  /** Device pixel ratio in use; stepped down if consecutive frames come in slow (a weaker GPU). */
  private dpr = 1;
  private lastFrame = 0;
  private slowFrames = 0;
  private progress = 0;
  private ready = false;
  /** Optional fixed camera (used for rendering stills); when set, the scroll camera is bypassed. */
  private cameraOverride: { pos: THREE.Vector3; look: THREE.Vector3; fov?: number } | null = null;
  private pointer = new THREE.Vector2();
  private pointerLerp = new THREE.Vector2();
  private needsRender = true;
  private raf = 0;
  private disposed = false;
  private firstFrame = false;
  private ro?: ResizeObserver;
  private disposables: { dispose(): void }[] = [];
  private lostHandler: (e: Event) => void;
  private restoredHandler: () => void;

  constructor(private canvas: HTMLCanvasElement, private host: HTMLElement, private opts: BayOptions = {}) {
    const dpr = (this.dpr = Math.min(window.devicePixelRatio || 1, opts.touch ? 1.5 : 1.75));
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance", stencil: false });
    this.renderer.setPixelRatio(dpr);
    this.renderer.setClearColor(INK, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = !opts.touch;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;  // redrawn only while the ball is low enough to cast on the mat

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.05, 60);
    this.scene.fog = new THREE.FogExp2(INK, 0.03);
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = env;
    this.scene.environmentIntensity = 0.22;

    // the screen-as-light uniforms, shared by every lit material
    const half = { r: new THREE.Vector3(SCREEN.w / 2, 0, 0), u: new THREE.Vector3(0, SCREEN.h / 2, 0) };
    this.sl = {
      uSLCenter: { value: new THREE.Vector3(0, SCREEN.y, SCREEN.z) },
      uSLRight: { value: half.r },
      uSLUp: { value: half.u },
      uSLColors: { value: Array.from({ length: 6 }, () => new THREE.Color(0.3, 0.45, 0.3)) },
      uSLPower: { value: 1 },
      uLEDA: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] },
      uLEDB: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] },
      uLEDColor: { value: GREEN.clone() },
      uLEDPower: { value: 0.02 },
      uSLTex: { value: null },
      uSLSpec: { value: 0 },
    };

    this.build();
    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);

    this.lostHandler = (e) => { e.preventDefault(); cancelAnimationFrame(this.raf); this.raf = 0; opts.onContextLost?.(); };
    this.restoredHandler = () => this.invalidate();
    canvas.addEventListener("webglcontextlost", this.lostHandler, false);
    canvas.addEventListener("webglcontextrestored", this.restoredHandler, false);
  }

  private track<T extends { dispose(): void }>(d: T) { this.disposables.push(d); return d; }

  /** Patch a material so the screen and the LED frame light it. `spec` adds the screen's reflection (standard only). */
  private lit<T extends THREE.MeshStandardMaterial | THREE.MeshLambertMaterial>(m: T, spec = 0, extra?: (s: THREE.WebGLProgramParametersWithUniforms) => void, key = "lit", led = 4) {
    m.defines = { ...(m.defines ?? {}), SL_LED: led, ...(spec > 0 ? { SL_SPEC: "" } : {}) };
    m.onBeforeCompile = (s) => {
      Object.assign(s.uniforms, this.sl, { uSLSpec: { value: spec } });
      s.vertexShader = s.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vSLW;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvSLW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      s.fragmentShader = s.fragmentShader
        .replace("#include <common>", "#include <common>\n" + SL_DECL)
        .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n" + SL_MAIN);
      extra?.(s);
    };
    m.customProgramCacheKey = () => `${key}-${spec}-${led}`;
    return m;
  }

  /**
   * Shell-rendered turf: `shells` stacked slices through a strand field. Fibres taper, lean with `nap`, shade down
   * into the pile, and darken where the ball sits on them.
   */
  private turf(o: { w: number; d: number; x: number; z: number; y: number; shells: number; pile: number; strands: THREE.Texture; density: number; thatch: number; blade: number; tip: number; ao: number; nap: [number, number]; key: string; mottle?: number; curl?: number; lambert?: boolean }) {
    const pos: number[] = [], nor: number[] = [], uvs: number[] = [], hh: number[] = [], idx: number[] = [];
    for (let s = o.shells; s >= 0; s--) {
      const b = pos.length / 3;
      for (const [x, z, u, v] of [[-o.w / 2, -o.d / 2, 0, 0], [o.w / 2, -o.d / 2, 1, 0], [-o.w / 2, o.d / 2, 0, 1], [o.w / 2, o.d / 2, 1, 1]]) {
        pos.push(x, 0, z); nor.push(0, 1, 0); uvs.push(u, v); hh.push(s / o.shells);
      }
      idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3);
    }
    const g = this.track(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.setAttribute("aH", new THREE.Float32BufferAttribute(hh, 1));
    g.setIndex(idx);
    // the bay floor is diffuse-only (it is most of the frame and it is in shade); the mat keeps its sheen
    const m = this.track(o.lambert
      ? new THREE.MeshLambertMaterial({ color: 0xffffff, alphaTest: 0.5, alphaToCoverage: true })
      : new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.78, metalness: 0, alphaTest: 0.5, alphaToCoverage: true, envMapIntensity: 0.5 }));
    const u = {
      uStrands: { value: o.strands }, uDensity: { value: o.density }, uPile: { value: o.pile }, uNap: { value: new THREE.Vector2(...o.nap) },
      uThatch: { value: new THREE.Color(o.thatch) }, uBlade: { value: new THREE.Color(o.blade) }, uTip: { value: new THREE.Color(o.tip) },
      uAoMin: { value: o.ao }, uMottle: { value: o.mottle ?? 0.25 }, uCurl: { value: o.curl ?? 0.02 }, uBall: { value: new THREE.Vector4(0, -10, 0, BALL_R) },
    };
    this.lit(m, 0, (s) => {
      Object.assign(s.uniforms, u);
      s.vertexShader = s.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float aH;\nuniform float uPile;\nuniform vec2 uNap;\nvarying float vH;\nvarying vec3 vTW;")
        .replace("#include <begin_vertex>", `#include <begin_vertex>
          vH = aH;
          transformed.y += aH * uPile;
          transformed.xz += uNap * uPile * 0.55 * aH * aH;
          vTW = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
      s.fragmentShader = s.fragmentShader
        .replace("#include <common>", `#include <common>
          uniform sampler2D uStrands; uniform float uDensity; uniform vec2 uNap;
          uniform vec3 uThatch; uniform vec3 uBlade; uniform vec3 uTip; uniform float uAoMin; uniform float uMottle; uniform float uCurl; uniform vec4 uBall;
          varying float vH; varying vec3 vTW;
          float tHash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
          float tNoise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 w = f * f * (3.0 - 2.0 * f);
            return mix(mix(tHash(i), tHash(i + vec2(1, 0)), w.x), mix(tHash(i + vec2(0, 1)), tHash(i + vec2(1, 1)), w.x), w.y); }`)
        .replace("#include <color_fragment>", `#include <color_fragment>
          float h = vH;
          // fibres lean in tufts: a slow field bends the strand field more the higher up the pile we slice
          vec2 curl = vec2(tNoise(vTW.xz * 11.0) - 0.5, tNoise(vTW.xz * 11.0 + 31.7) - 0.5) + 0.35 * vec2(tNoise(vTW.xz * 37.0 + 3.1) - 0.5, tNoise(vTW.xz * 37.0 + 9.4) - 0.5);
          vec2 suv = vTW.xz * uDensity + curl * h * h * uCurl;
          vec4 st = texture2D(uStrands, suv);
          // far away the strand field is mip-averaged; lower the bar so the tips, not the thatch, stay on top
          float lod = log2(max(max(length(dFdx(suv)), length(dFdy(suv))) * 512.0, 1.0));
          float bar = h * mix(1.0, 0.32, smoothstep(0.6, 3.2, lod));
          if (h > 0.001 && st.r < bar - 0.09) discard;
          diffuseColor.a = h < 0.001 ? 1.0 : (st.r - bar) * 7.0 + 0.5;
          vec3 tc = mix(uThatch, uBlade, smoothstep(0.0, 0.45, h));
          tc = mix(tc, uTip, smoothstep(0.55, 1.0, h) * 0.7);
          tc *= 0.78 + 0.44 * st.g;
          tc *= 1.0 + (tNoise(vTW.xz * 3.1) - 0.5) * uMottle + (tNoise(vTW.xz * 0.9 + 7.0) - 0.5) * uMottle;
          tc *= mix(uAoMin, 1.0, pow(h, 0.72));
          float bd = length(vTW - uBall.xyz) - uBall.w;
          tc *= mix(0.22, 1.0, smoothstep(0.0, uBall.w * 1.9, bd));
          diffuseColor.rgb *= tc;`)
        .replace("#include <normal_fragment_begin>", `#include <normal_fragment_begin>
          {
            vec3 nW = normalize(vec3((st.b - 0.5) * 2.6 + uNap.x * h * 1.1, 1.0, (st.a - 0.5) * 2.6 + uNap.y * h * 1.1));
            normal = normalize((viewMatrix * vec4(nW, 0.0)).xyz);
          }`);
    }, o.key, 2);
    m.userData.uBall = u.uBall;
    this.turfMats.push(m);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(o.x, o.y, o.z);
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    return mesh;
  }

  private build() {
    const s = this.scene;
    const touch = !!this.opts.touch;
    const aniso = this.renderer.capabilities.getMaxAnisotropy();

    // --- Floor: a dark backing plane, then the bay's turf (longer, darker pile) wall to wall.
    const under = new THREE.Mesh(this.track(new THREE.PlaneGeometry(16, 16)), this.track(new THREE.MeshStandardMaterial({ color: 0x0b120c, roughness: 1 })));
    under.rotation.x = -Math.PI / 2; under.position.y = -0.002; s.add(under);
    const floorStrands = this.track(strandTexture(512, 80, 3, 0.45));
    floorStrands.anisotropy = aniso;
    this.turf({ w: 5.6, d: 9.2, x: 0, z: -0.75, y: 0, shells: touch ? 7 : 10, pile: 0.017, strands: floorStrands, density: 3.1, thatch: 0x07100a, blade: 0x14331a, tip: 0x466b30, ao: 0.14, nap: [0.12, 0.3], key: "floor", mottle: 0.36, curl: 0.05, lambert: true });

    // --- Hitting mat: a 26 mm foam base with a bound edge, its turf brushed in opposite directions on each half.
    const base = new THREE.Mesh(this.track(new THREE.BoxGeometry(1.52, MAT_TOP, 1.52)), this.lit(this.track(new THREE.MeshStandardMaterial({ color: 0x101210, roughness: 0.82, envMapIntensity: 0.4 }))));
    base.position.set(0, MAT_TOP / 2, 0); base.receiveShadow = true; base.castShadow = false; s.add(base);
    const matStrands = this.track(strandTexture(512, 112, 9, 0.6));
    matStrands.anisotropy = aniso;
    const half = { w: 0.74, d: 1.48, shells: touch ? 10 : 20, pile: MAT_PILE, strands: matStrands, density: 3.6, ao: 0.2, mottle: 0.2, curl: 0.03 };
    this.turf({ ...half, x: -0.37, z: 0, y: MAT_TOP, thatch: 0x0a1c0d, blade: 0x23562a, tip: 0x5f8f45, nap: [0.05, 0.85], key: "mat-a" });
    this.turf({ ...half, x: 0.37, z: 0, y: MAT_TOP, thatch: 0x0a1c0d, blade: 0x255a2a, tip: 0x67974a, nap: [-0.05, -0.85], key: "mat-b" });

    // --- Walls and ceiling: quilted acoustic panels, so the screen's glow rolls over every pillow.
    const quilt = this.track(quiltTexture());
    quilt.anisotropy = aniso;
    const wallMat = (rx: number, ry: number) => {
      const q = quilt.clone(); this.track(q);
      q.repeat.set(rx, ry); q.needsUpdate = true;
      return this.lit(this.track(new THREE.MeshStandardMaterial({ color: 0x1a1c1b, roughness: 0.9, metalness: 0, normalMap: q, normalScale: new THREE.Vector2(1.1, 1.1), envMapIntensity: 0.25 })), 0, undefined, "wall");
    };
    const wallGeo = this.track(new THREE.PlaneGeometry(9.2, 3.4));
    const left = new THREE.Mesh(wallGeo, wallMat(9.2 / 0.9, 3.4 / 0.85)); left.position.set(-2.8, 1.7, -0.75); left.rotation.y = Math.PI / 2; s.add(left);
    const right = new THREE.Mesh(wallGeo, wallMat(9.2 / 0.9, 3.4 / 0.85)); right.position.set(2.8, 1.7, -0.75); right.rotation.y = -Math.PI / 2; s.add(right);
    const ceil = new THREE.Mesh(this.track(new THREE.PlaneGeometry(5.6, 9.2)), wallMat(5.6 / 0.9, 9.2 / 0.9)); ceil.position.set(0, 3.4, -0.75); ceil.rotation.x = Math.PI / 2; s.add(ceil);

    // --- The screen: projector picture in a padded black surround.
    const surround = this.lit(this.track(new THREE.MeshStandardMaterial({ color: 0x0c0d0c, roughness: 0.86, envMapIntensity: 0.2 })), 0, undefined, "surround");
    const frameGeo = this.track(new THREE.BoxGeometry(1, 1, 0.2));
    const piece = (w: number, h: number, x: number, y: number) => { const p = new THREE.Mesh(frameGeo, surround); p.scale.set(w, h, 1); p.position.set(x, y, SCREEN.z - 0.02); s.add(p); };
    const sx = SCREEN.w / 2, top = SCREEN.y + SCREEN.h / 2, bot = SCREEN.y - SCREEN.h / 2;
    piece(5.6, 3.4 - top, 0, (3.4 + top) / 2);         // above
    piece(5.6, bot, 0, bot / 2);                        // below
    piece(2.8 - sx, SCREEN.h, -(sx + 2.8) / 2, SCREEN.y); // left
    piece(2.8 - sx, SCREEN.h, (sx + 2.8) / 2, SCREEN.y);  // right

    this.screenMat = this.track(new THREE.ShaderMaterial({
      vertexShader: SCREEN_VERT,
      fragmentShader: SCREEN_FRAG,
      uniforms: {
        uCourse: { value: null }, uHud: { value: null }, uGain: { value: 1 },
        uImpact: { value: IMPACT_UV.clone() }, uHit: { value: 0 },
        uGreen: { value: GREEN.clone() }, uAspect: { value: SCREEN.w / SCREEN.h },
      },
      fog: false,
    }));
    const screen = new THREE.Mesh(this.track(new THREE.PlaneGeometry(SCREEN.w, SCREEN.h)), this.screenMat);
    screen.position.set(0, SCREEN.y, SCREEN.z); s.add(screen);

    // a camera's bloom around the bright picture
    const glowTex = this.track(new THREE.CanvasTexture(glowCanvas()));
    this.screenGlowMat = this.track(new THREE.MeshBasicMaterial({ map: glowTex, color: 0x9fd08a, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    const sg = new THREE.Mesh(this.track(new THREE.PlaneGeometry(SCREEN.w * 1.7, SCREEN.h * 1.9)), this.screenGlowMat);
    sg.position.set(0, SCREEN.y, SCREEN.z + 0.05); s.add(sg);

    // --- The green LED frame around the enclosure opening, and its glow.
    const lz = SCREEN.z + 0.16, lx = sx + 0.17, ly = top + 0.16;
    const runs: [THREE.Vector3, THREE.Vector3][] = [
      [new THREE.Vector3(-lx, 0.02, lz), new THREE.Vector3(-lx, ly, lz)],
      [new THREE.Vector3(-lx, ly, lz), new THREE.Vector3(lx, ly, lz)],
      [new THREE.Vector3(lx, ly, lz), new THREE.Vector3(lx, 0.02, lz)],
    ];
    runs.forEach(([a, b], i) => { (this.sl.uLEDA.value as THREE.Vector3[])[i].copy(a); (this.sl.uLEDB.value as THREE.Vector3[])[i].copy(b); });
    const ledMat = this.track(new THREE.MeshBasicMaterial({ color: GREEN.clone().multiplyScalar(2.2), fog: false }));
    const ledGlowMat = this.track(new THREE.MeshBasicMaterial({ map: glowTex, color: GREEN.clone(), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    const stripGeo = this.track(new THREE.BoxGeometry(1, 1, 1));
    const glowGeo = this.track(new THREE.PlaneGeometry(1, 1));
    for (const [a, b] of runs) {
      const len = a.distanceTo(b), mid = a.clone().add(b).multiplyScalar(0.5), vertical = Math.abs(a.x - b.x) < 1e-3;
      const strip = new THREE.Mesh(stripGeo, ledMat);
      strip.scale.set(vertical ? 0.014 : len, vertical ? len : 0.014, 0.014);
      strip.position.copy(mid); s.add(strip);
      // the glow: a soft band along the strip (stretched radial falloff)
      const gl = new THREE.Mesh(glowGeo, ledGlowMat);
      gl.scale.set(vertical ? 0.22 : len + 0.22, vertical ? len + 0.22 : 0.22, 1);
      gl.position.copy(mid).add(new THREE.Vector3(0, 0, 0.01)); s.add(gl);
    }

    // --- Practicals: ceiling cans, one warm key on the tee, a cool fill toward the screen.
    const discGeo = this.track(new THREE.CircleGeometry(0.09, 24));
    const discMat = this.track(new THREE.MeshBasicMaterial({ color: 0xfff3dc }));
    for (const z of [0.9, -1.4]) { const d = new THREE.Mesh(discGeo, discMat); d.position.set(0.9, 3.39, z); d.rotation.x = Math.PI / 2; s.add(d); }
    const key = new THREE.SpotLight(0xffeccf, 17, 9, 0.5, 0.85, 1.6);
    key.position.set(0.9, 3.35, 0.9); key.target.position.set(0, 0, 0); s.add(key); s.add(key.target);
    if (!touch) { key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0002; key.shadow.normalBias = 0.002; key.shadow.radius = 5; key.shadow.camera.near = 1; key.shadow.camera.far = 6; }
    const fill = new THREE.SpotLight(0xdde9ff, 5, 10, 0.75, 0.9, 1.6);
    fill.position.set(-1.6, 3.2, -1.4); fill.target.position.set(0, 0.4, -3); s.add(fill); s.add(fill.target);
    s.add(new THREE.HemisphereLight(0x1d2a1f, 0x050505, 0.35));

    // --- Launch monitor on the turf beside the mat: a rounded unit, glass face, twin lenses, status light.
    const lmMat = this.lit(this.track(new THREE.MeshStandardMaterial({ color: 0x23262a, roughness: 0.42, metalness: 0.25, envMapIntensity: 0.9 })), 0.5, undefined, "lm");
    const lm = new THREE.Group();
    const body = new THREE.Mesh(this.track(new RoundedBoxGeometry(0.21, 0.155, 0.12, 4, 0.018)), lmMat);
    body.castShadow = !touch; body.receiveShadow = true; lm.add(body);
    const glass = this.lit(this.track(new THREE.MeshStandardMaterial({ color: 0x040506, roughness: 0.08, metalness: 0.2, envMapIntensity: 1.2 })), 1.1, undefined, "glass");
    const face = new THREE.Mesh(this.track(new RoundedBoxGeometry(0.18, 0.115, 0.01, 3, 0.004)), glass);
    face.position.set(0, 0.008, 0.058); lm.add(face);
    const lensMat = this.lit(this.track(new THREE.MeshStandardMaterial({ color: 0x0b1018, roughness: 0.04, metalness: 0.7, envMapIntensity: 1.4 })), 1.2, undefined, "lens");
    const ringMat = this.track(new THREE.MeshStandardMaterial({ color: 0x3a3f45, roughness: 0.3, metalness: 0.8 }));
    for (const x of [-0.048, 0.048]) {
      const ring = new THREE.Mesh(this.track(new THREE.RingGeometry(0.017, 0.022, 32)), ringMat); ring.position.set(x, 0.018, 0.0645); lm.add(ring);
      const lens = new THREE.Mesh(this.track(new THREE.CircleGeometry(0.017, 32)), lensMat); lens.position.set(x, 0.018, 0.064); lm.add(lens);
    }
    const led = new THREE.Mesh(this.track(new THREE.CircleGeometry(0.004, 12)), this.track(new THREE.MeshBasicMaterial({ color: GREEN.clone().multiplyScalar(2.5) })));
    led.position.set(0, -0.032, 0.0645); lm.add(led);
    const foot = new THREE.Mesh(this.track(new THREE.BoxGeometry(0.17, 0.012, 0.09)), this.track(new THREE.MeshStandardMaterial({ color: 0x0c0d0e, roughness: 0.7 })));
    foot.position.set(0, -0.083, -0.005); lm.add(foot);
    // on the floor turf to the golfer's side, its face turned to the ball (and three-quarters to us)
    lm.position.set(-0.98, 0.017 + 0.089, 0.42);
    lm.lookAt(BALL_REST.x - 0.2, 0.017 + 0.089, BALL_REST.z + 1.1);
    s.add(lm);

    // --- The ball.
    const dimples = this.track(new THREE.CanvasTexture(dimpleCanvas()));
    dimples.wrapS = dimples.wrapT = THREE.RepeatWrapping; dimples.repeat.set(4, 2);
    const ballMat = this.lit(this.track(new THREE.MeshPhysicalMaterial({ color: 0xf4f4f0, roughness: 0.36, metalness: 0, clearcoat: 0.4, clearcoatRoughness: 0.3, bumpMap: dimples, bumpScale: 0.0016, envMapIntensity: 0.7 })), 0.9, undefined, "ball");
    this.ball = new THREE.Mesh(this.track(new THREE.SphereGeometry(BALL_R, 64, 48)), ballMat);
    this.ball.castShadow = !touch; this.ball.position.copy(BALL_REST); s.add(this.ball);

    // --- The tracer: the ball's flight to the screen, a soft emissive tube and a wider glow. The arc tops out a
    // little past halfway and is already falling as it meets the screen.
    const hit = screenPoint(IMPACT_UV.x, IMPACT_UV.y, SCREEN.z + BALL_R);
    this.curve = new THREE.QuadraticBezierCurve3(BALL_REST.clone(), new THREE.Vector3(0.05, 2.75, -2.15), hit);
    // three layers of light: a white-hot core, a saturated green body, a soft halo, so it reads over the dark bay
    // and over the bright picture alike
    for (const [radius, white, opacity, soft] of [[0.0058, 0.72, 1.0, 0.6], [0.017, 0.12, 0.6, 1.3], [0.056, 0, 0.3, 2.6]]) {
      const m = this.track(new THREE.ShaderMaterial({
        vertexShader: TRACER_VERT, fragmentShader: TRACER_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        uniforms: { uProgress: { value: 0 }, uSoft: { value: soft }, uColor: { value: GREEN.clone() }, uOpacity: { value: opacity }, uWhite: { value: white }, uCamera: { value: new THREE.Vector3() } },
      }));
      const tube = new THREE.Mesh(this.track(new THREE.TubeGeometry(this.curve, 220, radius, 12, false)), m);
      tube.frustumCulled = false;
      s.add(tube);
      this.tracerMats.push(m);
    }

    // --- Light: a soft halo travels with the ball, and a bloom answers on the screen where it strikes.
    this.ballGlow = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: glowTex, color: 0xc4f7b6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false })));
    this.ballGlow.scale.setScalar(0.15); s.add(this.ballGlow);
    this.hitGlow = new THREE.Sprite(this.track(new THREE.SpriteMaterial({ map: glowTex, color: 0x9ff08f, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false })));
    this.hitGlow.position.copy(hit).setZ(SCREEN.z + 0.06); this.hitGlow.scale.setScalar(0.9); s.add(this.hitGlow);

    this.load(touch);
  }

  /** The picture: course render and HUD (in the site's own typeface), then the first frame. */
  private async load(touch: boolean) {
    const url = touch ? "/media/hero/course-1600.webp" : "/media/hero/course-2560.webp";
    const course = await new THREE.TextureLoader().loadAsync(url).catch(() => null);
    if (this.disposed) { course?.dispose(); return; }
    try { await document.fonts.ready; } catch { /* draw with the fallback */ }
    if (this.disposed) { course?.dispose(); return; }
    const font = getComputedStyle(document.body).fontFamily || "Helvetica, Arial, sans-serif";
    const W = touch ? 1600 : 2560, H = touch ? 1000 : 1600;
    const mk = (c: HTMLCanvasElement) => {
      const t = this.track(new THREE.CanvasTexture(c));
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      return t;
    };
    const hud = mk(drawHud(W, H, font));
    const u = this.screenMat.uniforms;
    if (course) {
      this.track(course);
      course.colorSpace = THREE.SRGBColorSpace;
      course.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      u.uCourse.value = course;
      this.sl.uSLTex.value = course;
      // the screen's light: the picture's average colour in each of six patches
      const img = course.image as HTMLImageElement;
      const c = document.createElement("canvas");
      c.width = 3; c.height = 2;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, 3, 2);
      const px = ctx.getImageData(0, 0, 3, 2).data;
      const cols = this.sl.uSLColors.value as THREE.Color[];
      // canvas rows run top-down; patch j = 0 is the bottom row
      for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) {
        const o = ((1 - j) * 3 + i) * 4;
        cols[j * 3 + i].setRGB(px[o] / 255, px[o + 1] / 255, px[o + 2] / 255, THREE.SRGBColorSpace);
      }
    }
    u.uHud.value = hud;
    this.ready = true;
    this.invalidate();
  }

  /** Camera, ball, tracer and screen for the current progress. Called on every invalidate. */
  private apply() {
    // reduced motion: the settled story (shot complete) seen from where the page opens
    const p = this.opts.reduced ? 1 : this.progress;
    const cp = this.opts.reduced ? 0 : this.progress;
    const t = this.tmp;

    // 1. the shot: off the mat, through the air, and into the screen
    const flight = smooth(range(p, 0.05, 0.965));
    const pt = this.curve.getPointAt(flight, t.ball);
    const hit = range(p, 0.945, 1);
    this.ball.position.copy(pt);
    const gone = smooth(range(hit, 0.12, 0.42));            // the ball vanishes into its own light
    this.ball.scale.setScalar(1 - gone * 0.9);
    this.ball.visible = gone < 0.999;
    this.ball.rotation.x = -flight * 30; this.ball.rotation.z = flight * 4;
    for (const m of this.tracerMats) m.uniforms.uProgress.value = flight;
    const airborne = range(flight, 0.0, 0.04);
    this.ballGlow.position.copy(pt);
    (this.ballGlow.material as THREE.SpriteMaterial).opacity = 0.42 * airborne * (1 - gone);

    // 2. the strike: a bloom of light where it lands on the screen; it settles and stays (the story ends here)
    const su = this.screenMat.uniforms;
    su.uHit.value = hit;
    const flash = smooth(range(hit, 0.15, 0.55)), settle = 1 - 0.4 * smooth(range(hit, 0.55, 1));
    (this.hitGlow.material as THREE.SpriteMaterial).opacity = 0.55 * flash * settle;
    this.hitGlow.scale.setScalar(0.55 + 0.45 * flash);
    // a touch dimmer under the headline, full brightness once it has scrolled away
    const gain = 0.86 + smooth(range(cp, 0.02, 0.2)) * 0.14;
    su.uGain.value = gain;
    this.sl.uSLPower.value = 5.5 * gain;
    this.screenGlowMat.opacity = 0.09 * gain;

    // the ball's shade on the turf follows it while it is near the ground; so does its cast shadow
    this.turfBall.set(pt.x, pt.y < 0.4 ? pt.y : -10, pt.z, BALL_R);
    const low = pt.y < 0.9;
    if (low || this.wasLow) this.renderer.shadowMap.needsUpdate = true;
    this.wasLow = low;
    for (const m of this.turfMats) (m.userData.uBall as THREE.IUniform<THREE.Vector4>).value.copy(this.turfBall);

    // 3. the camera: a slow, gentle rise from where the page opens, holding the whole arc in frame as it draws
    const k = smooth(range(cp, 0, 1));
    const portrait = this.camera.aspect < 0.9;
    const back = portrait ? 1.35 : 1;
    const pos = t.pos.set(-2.05 * back, 0.52, 3.0 * back).lerp(portrait ? t.a.set(-2.8, 0.72, 4.0) : t.a.set(-2.12, 0.8, 2.82), k);
    pos.y += Math.sin(Math.PI * k) * 0.06;                   // the move breathes: a touch higher mid-way
    const look = (portrait ? t.look.set(0.2, 0.62, -1.9) : t.look.set(0.05, 0.6, -1.9)).lerp(portrait ? t.b.set(0.16, 0.8, -2.0) : t.b.set(0.1, 0.9, -2.3), k);
    // while the ball is in the air the eye drifts after it, then settles
    look.lerp(pt, 0.08 * Math.sin(Math.PI * flight));
    pos.x += this.pointerLerp.x * 0.09; pos.y += this.pointerLerp.y * 0.05;
    if (this.cameraOverride) { pos.copy(this.cameraOverride.pos); look.copy(this.cameraOverride.look); if (this.cameraOverride.fov) { this.camera.fov = this.cameraOverride.fov; this.camera.updateProjectionMatrix(); } }
    this.camera.position.copy(pos);
    this.camera.lookAt(look);
    for (const m of this.tracerMats) m.uniforms.uCamera.value.copy(pos);
  }

  setProgress(p: number) { const v = clamp01(p); if (v === this.progress) return; this.progress = v; this.invalidate(); }
  setCamera(pos: [number, number, number] | null, look?: [number, number, number], fov?: number) {
    this.cameraOverride = pos && look ? { pos: new THREE.Vector3(...pos), look: new THREE.Vector3(...look), fov } : null;
    this.invalidate();
  }
  /** Render now and return the frame as a PNG data URL (stills). */
  snapshot() { this.apply(); this.renderer.render(this.scene, this.camera); return this.canvas.toDataURL("image/png"); }
  setPointer(x: number, y: number) { this.pointer.set(x, y); this.invalidate(); }

  invalidate() {
    this.needsRender = true;
    if (!this.raf && !this.disposed) this.raf = requestAnimationFrame(this.loop);
  }

  private loop = () => {
    this.raf = 0;
    if (this.disposed || !this.ready) return;
    // pointer parallax eases in; keep drawing until it settles
    this.pointerLerp.lerp(this.pointer, 0.08);
    const settling = this.pointerLerp.distanceTo(this.pointer) > 0.002;
    if (this.needsRender || settling) {
      this.needsRender = false;
      this.apply();
      this.renderer.render(this.scene, this.camera);
      if (!this.firstFrame) { this.firstFrame = true; this.opts.onFirstFrame?.(); }
      this.adapt();
    }
    if (settling) this.raf = requestAnimationFrame(this.loop);
  };

  /** While frames run back to back (a scroll), a sustained run of slow ones steps the resolution down. */
  private adapt() {
    const now = performance.now(), dt = now - this.lastFrame;
    this.lastFrame = now;
    if (dt > 100) return;
    this.slowFrames = dt > 22 ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 1);
    if (this.slowFrames > 12 && this.dpr > 1) {
      this.dpr = Math.max(1, this.dpr - 0.25);
      this.slowFrames = 0;
      this.resize();
    }
  }

  resize() {
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.dpr));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w / h < 0.9 ? 44 : 32;
    this.camera.updateProjectionMatrix();
    this.invalidate();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.canvas.removeEventListener("webglcontextlost", this.lostHandler);
    this.canvas.removeEventListener("webglcontextrestored", this.restoredHandler);
    this.disposables.forEach((d) => d.dispose());
    this.scene.environment?.dispose();
    this.pmrem.dispose();
    this.renderer.dispose();
  }
}
