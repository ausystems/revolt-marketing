/**
 * The hero: a simulator bay at night, rendered in real time.
 *
 * Camera behind-right of the tee, low. The ball waits on the mat. As scroll progress runs 0 → 1 the ball launches,
 * the tracer draws along its flight, the camera dollies forward and rises with it, and the screen brightens on impact.
 * Everything renders on demand: a frame is drawn only when progress, pointer or size changes.
 *
 * Units are metres. The ball is drawn at 2.2× real size so it reads at hero scale (art direction, not physics).
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const INK = 0x0a0a0a;
const GREEN = new THREE.Color(0x2bb61e);

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
  uniform vec3 uCamera;
  varying float vU;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    if (vU > uProgress) discard;
    // head of the tracer is brightest, the tail cools off
    float head = smoothstep(uProgress - 0.35, uProgress, vU);
    float tail = smoothstep(0.0, 0.08, vU);
    // soft tube: fade at the silhouette so it reads as light, not plastic
    vec3 v = normalize(uCamera - vPosW);
    float rim = pow(max(dot(normalize(vNormalW), v), 0.0), uSoft);
    float a = uOpacity * (0.45 + 0.55 * head) * tail * rim;
    gl_FragColor = vec4(uColor * (0.8 + 0.6 * head), a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function noiseCanvas(size = 256, base = 128, amp = 40) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = base + (Math.random() - 0.5) * amp;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

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

/** What the simulator screen shows: a painted fairway under a bright sky, soft tree line, vignetted. */
function fairwayCanvas(w = 1024, h = 640) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  const horizon = h * 0.47;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, "#8fb9df");
  sky.addColorStop(0.55, "#c9dcea");
  sky.addColorStop(1, "#e6ece4");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, horizon + 2);
  // distant haze and a soft tree line built from overlapping rounds
  ctx.fillStyle = "#7d9a86"; ctx.globalAlpha = 0.55;
  for (let x = -40; x < w + 40; x += 22) { const r = 34 + Math.sin(x * 0.021) * 10 + Math.cos(x * 0.077) * 6; ctx.beginPath(); ctx.arc(x, horizon - 10, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1; ctx.fillStyle = "#33502f";
  for (let x = -40; x < w + 40; x += 16) { const r = 26 + Math.sin(x * 0.033 + 1) * 9 + Math.cos(x * 0.05) * 5; ctx.beginPath(); ctx.arc(x, horizon + 2, r, 0, Math.PI * 2); ctx.fill(); }
  // fairway
  const fw = ctx.createLinearGradient(0, horizon, 0, h);
  fw.addColorStop(0, "#5f9a44");
  fw.addColorStop(0.5, "#4b8c36");
  fw.addColorStop(1, "#356f27");
  ctx.fillStyle = fw; ctx.fillRect(0, horizon + 14, w, h);
  // rough at the edges
  const rough = ctx.createLinearGradient(0, 0, w, 0);
  rough.addColorStop(0, "rgba(40,80,30,0.55)"); rough.addColorStop(0.22, "rgba(40,80,30,0)"); rough.addColorStop(0.78, "rgba(40,80,30,0)"); rough.addColorStop(1, "rgba(40,80,30,0.55)");
  ctx.fillStyle = rough; ctx.fillRect(0, horizon + 14, w, h);
  // mowing stripes, gentle
  ctx.globalAlpha = 0.07; ctx.fillStyle = "#ffffff";
  for (let i = -8; i < 8; i++) { ctx.beginPath(); ctx.moveTo(w * 0.5 + i * 96, horizon + 14); ctx.lineTo(w * 0.5 + i * 150, h); ctx.lineTo(w * 0.5 + (i + 1) * 150, h); ctx.lineTo(w * 0.5 + (i + 1) * 96, horizon + 14); ctx.closePath(); if ((i + 8) % 2) ctx.fill(); }
  ctx.globalAlpha = 1;
  // green, flagstick, flag
  ctx.fillStyle = "#77b558"; ctx.beginPath(); ctx.ellipse(w * 0.62, h * 0.6, 110, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#f4f4f4"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(w * 0.62, h * 0.6); ctx.lineTo(w * 0.62, h * 0.47); ctx.stroke();
  ctx.fillStyle = "#e8402e"; ctx.beginPath(); ctx.moveTo(w * 0.62, h * 0.47); ctx.lineTo(w * 0.62 + 20, h * 0.486); ctx.lineTo(w * 0.62, h * 0.502); ctx.closePath(); ctx.fill();
  // vignette
  const vg = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.4, w * 0.5, h * 0.5, h * 1.0);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  return c;
}

function shadowCanvas(size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(0,0,0,0.85)");
  g.addColorStop(0.5, "rgba(0,0,0,0.35)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  return c;
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

export type BayOptions = { touch?: boolean; reduced?: boolean; onFirstFrame?: () => void; onContextLost?: () => void };

export class BayScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private pmrem: THREE.PMREMGenerator;
  private ball!: THREE.Mesh;
  private ballShadow!: THREE.Mesh;
  private tracerMat!: THREE.ShaderMaterial;
  private glowMat!: THREE.ShaderMaterial;
  private screenMat!: THREE.MeshStandardMaterial;
  private screenLight!: THREE.PointLight;
  private impact!: THREE.Mesh;
  private curve!: THREE.QuadraticBezierCurve3;
  private progress = 0;
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
    const dpr = Math.min(window.devicePixelRatio || 1, opts.touch ? 1.5 : 2);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance", stencil: false });
    this.renderer.setPixelRatio(dpr);
    this.renderer.setClearColor(INK, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = !opts.touch;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.05, 60);
    this.scene.fog = new THREE.FogExp2(INK, 0.045);
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = env;
    this.scene.environmentIntensity = 0.35;

    this.build();
    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);

    this.lostHandler = (e) => { e.preventDefault(); cancelAnimationFrame(this.raf); this.raf = 0; opts.onContextLost?.(); };
    this.restoredHandler = () => this.invalidate();
    canvas.addEventListener("webglcontextlost", this.lostHandler, false);
    canvas.addEventListener("webglcontextrestored", this.restoredHandler, false);
    this.invalidate();
  }

  private track<T extends { dispose(): void }>(d: T) { this.disposables.push(d); return d; }

  private build() {
    const s = this.scene;
    const touch = !!this.opts.touch;

    // --- Floor: dark turf, noise-bumped so the practicals catch it.
    const noise = this.track(new THREE.CanvasTexture(noiseCanvas()));
    noise.wrapS = noise.wrapT = THREE.RepeatWrapping; noise.repeat.set(10, 10);
    const floorMat = this.track(new THREE.MeshStandardMaterial({ color: 0x17251a, roughness: 0.95, metalness: 0, bumpMap: noise, bumpScale: 0.6, envMapIntensity: 0.15 }));
    const floor = new THREE.Mesh(this.track(new THREE.PlaneGeometry(16, 16)), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; s.add(floor);

    // --- Hitting mat.
    const matMat = this.track(new THREE.MeshStandardMaterial({ color: 0x27402a, roughness: 0.9, bumpMap: noise, bumpScale: 0.35, envMapIntensity: 0.12 }));
    const mat = new THREE.Mesh(this.track(new THREE.BoxGeometry(1.5, 0.02, 1.5)), matMat);
    mat.position.set(0, 0.01, 0); mat.receiveShadow = true; s.add(mat);

    // --- Walls and ceiling: near-black, faintly reflective so the screen glow lives on them.
    const wallMat = this.track(new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.8, metalness: 0.05, envMapIntensity: 0.2 }));
    const wallGeo = this.track(new THREE.PlaneGeometry(9, 3.6));
    const left = new THREE.Mesh(wallGeo, wallMat); left.position.set(-2.8, 1.8, -2.2); left.rotation.y = Math.PI / 2; s.add(left);
    const right = new THREE.Mesh(wallGeo, wallMat); right.position.set(2.8, 1.8, -2.2); right.rotation.y = -Math.PI / 2; s.add(right);
    const ceil = new THREE.Mesh(this.track(new THREE.PlaneGeometry(6, 9)), this.track(new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.9 })));
    ceil.position.set(0, 3.4, -2.2); ceil.rotation.x = Math.PI / 2; s.add(ceil);
    const back = new THREE.Mesh(this.track(new THREE.PlaneGeometry(6, 3.6)), wallMat); back.position.set(0, 1.8, -5.5); s.add(back);

    // --- The screen: emissive fairway, and the light it throws onto the bay.
    const fairway = this.track(new THREE.CanvasTexture(fairwayCanvas()));
    fairway.colorSpace = THREE.SRGBColorSpace;
    this.screenMat = this.track(new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.55, metalness: 0, emissive: 0xffffff, emissiveMap: fairway, emissiveIntensity: 0.85 }));
    const screen = new THREE.Mesh(this.track(new THREE.PlaneGeometry(4.6, 2.9)), this.screenMat);
    screen.position.set(0, 1.62, -5.2); s.add(screen);
    const frame = new THREE.Mesh(this.track(new THREE.BoxGeometry(4.9, 3.2, 0.12)), this.track(new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.6 })));
    frame.position.set(0, 1.62, -5.28); s.add(frame);
    this.screenLight = new THREE.PointLight(0xa9d99a, 5.5, 9, 2);
    this.screenLight.position.set(0, 1.6, -4.4); s.add(this.screenLight);

    // --- Practicals: three ceiling discs and one key spot on the tee.
    const discGeo = this.track(new THREE.CircleGeometry(0.11, 24));
    const discMat = this.track(new THREE.MeshBasicMaterial({ color: 0xfff3dc }));
    for (const z of [0.6, -1.6, -3.6]) { const d = new THREE.Mesh(discGeo, discMat); d.position.set(0.9, 3.39, z); d.rotation.x = Math.PI / 2; s.add(d); }
    const key = new THREE.SpotLight(0xfff0d6, 28, 9, 0.55, 0.75, 1.6);
    key.position.set(1.1, 3.3, 0.9); key.target.position.set(0, 0, 0); s.add(key); s.add(key.target);
    if (!touch) { key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.radius = 4; }
    const fill = new THREE.SpotLight(0xdde9ff, 8, 10, 0.7, 0.9, 1.6);
    fill.position.set(-1.6, 3.2, -2.2); fill.target.position.set(0, 0.6, -2.5); s.add(fill); s.add(fill.target);
    s.add(new THREE.HemisphereLight(0x243a24, 0x050505, 0.5));

    // --- Launch monitor beside the mat (a dark box with one green LED).
    const lm = new THREE.Mesh(this.track(new THREE.BoxGeometry(0.22, 0.13, 0.1)), this.track(new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.4, metalness: 0.3 })));
    lm.position.set(-0.78, 0.085, 0.38); lm.rotation.y = 0.4; lm.castShadow = !touch; s.add(lm);
    const led = new THREE.Mesh(this.track(new THREE.CircleGeometry(0.008, 12)), this.track(new THREE.MeshBasicMaterial({ color: 0x2bb61e })));
    led.position.set(-0.735, 0.11, 0.425); led.rotation.y = 0.4; s.add(led);

    // --- The ball.
    const dimples = this.track(new THREE.CanvasTexture(dimpleCanvas()));
    dimples.wrapS = dimples.wrapT = THREE.RepeatWrapping; dimples.repeat.set(4, 2);
    const ballMat = this.track(new THREE.MeshPhysicalMaterial({ color: 0xf4f4f0, roughness: 0.42, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.35, bumpMap: dimples, bumpScale: 0.0022, envMapIntensity: 0.9 }));
    this.ball = new THREE.Mesh(this.track(new THREE.SphereGeometry(0.047, 64, 48)), ballMat);
    this.ball.castShadow = !touch; this.ball.position.set(0, 0.067, 0); s.add(this.ball);
    const shadowTex = this.track(new THREE.CanvasTexture(shadowCanvas()));
    this.ballShadow = new THREE.Mesh(this.track(new THREE.PlaneGeometry(0.26, 0.26)), this.track(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.9 })));
    this.ballShadow.rotation.x = -Math.PI / 2; this.ballShadow.position.set(0.02, 0.021, 0.01); s.add(this.ballShadow);

    // --- The tracer: the ball's flight, drawn as a soft emissive tube and a wider glow.
    this.curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0.067, 0), new THREE.Vector3(0.2, 2.6, -2.3), new THREE.Vector3(0.55, 1.75, -5.15));
    const tubeGeo = this.track(new THREE.TubeGeometry(this.curve, 120, 0.011, 10, false));
    const glowGeo = this.track(new THREE.TubeGeometry(this.curve, 120, 0.05, 10, false));
    const uniforms = () => ({ uProgress: { value: 0 }, uSoft: { value: 1.0 }, uColor: { value: GREEN.clone() }, uOpacity: { value: 1 }, uCamera: { value: new THREE.Vector3() } });
    this.tracerMat = this.track(new THREE.ShaderMaterial({ vertexShader: TRACER_VERT, fragmentShader: TRACER_FRAG, uniforms: uniforms(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    this.glowMat = this.track(new THREE.ShaderMaterial({ vertexShader: TRACER_VERT, fragmentShader: TRACER_FRAG, uniforms: uniforms(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    this.glowMat.uniforms.uSoft.value = 2.6; this.glowMat.uniforms.uOpacity.value = 0.32;
    s.add(new THREE.Mesh(tubeGeo, this.tracerMat));
    s.add(new THREE.Mesh(glowGeo, this.glowMat));

    // --- Impact ring on the screen.
    this.impact = new THREE.Mesh(this.track(new THREE.RingGeometry(0.12, 0.128, 64)), this.track(new THREE.MeshBasicMaterial({ color: 0x2bb61e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })));
    this.impact.position.set(0.55, 1.75, -5.19); s.add(this.impact);
  }

  /** Camera and ball for the current progress. Called on every invalidate. */
  private apply() {
    const p = this.progress;
    const flight = easeInOut(range(p, 0.12, 0.78));
    const dolly = easeInOut(range(p, 0.05, 1));
    // ball
    const pt = this.curve.getPointAt(flight);
    this.ball.position.copy(pt);
    this.ball.visible = flight < 0.985;
    this.ball.rotation.x = -flight * 26; this.ball.rotation.z = flight * 4;
    this.ballShadow.position.set(pt.x + 0.02, 0.021, pt.z + 0.01);
    const sh = 1 - clamp01(pt.y * 1.6);
    (this.ballShadow.material as THREE.MeshBasicMaterial).opacity = 0.9 * sh;
    this.ballShadow.scale.setScalar(1 + (1 - sh) * 1.6);
    // tracer
    this.tracerMat.uniforms.uProgress.value = flight;
    this.glowMat.uniforms.uProgress.value = flight;
    // screen brightens as the shot lands
    const land = range(p, 0.72, 0.95);
    this.screenMat.emissiveIntensity = 0.85 + land * 0.6;
    this.screenLight.intensity = 5.5 + land * 6;
    const ring = range(p, 0.78, 0.98);
    this.impact.scale.setScalar(0.4 + ring * 3.2);
    (this.impact.material as THREE.MeshBasicMaterial).opacity = ring > 0 ? Math.pow(1 - ring, 1.5) * 0.85 : 0;
    // camera: a slow dolly forward and up, following the ball
    const portrait = this.camera.aspect < 0.9;
    const back = portrait ? 1.35 : 1;
    const from = new THREE.Vector3(-2.05 * back, 0.52, 3.0 * back);
    const to = new THREE.Vector3(-0.65, 1.1, 1.05 * back);
    const lookFrom = new THREE.Vector3(0.05, 0.6, -1.9);
    const lookTo = new THREE.Vector3(0.45, 1.45, -5);
    const pos = from.lerp(to, dolly);
    const look = lookFrom.lerp(lookTo, dolly);
    pos.x += this.pointerLerp.x * 0.09; pos.y += this.pointerLerp.y * 0.05;
    if (this.cameraOverride) { pos.copy(this.cameraOverride.pos); look.copy(this.cameraOverride.look); if (this.cameraOverride.fov) { this.camera.fov = this.cameraOverride.fov; this.camera.updateProjectionMatrix(); } }
    this.camera.position.copy(pos);
    this.camera.lookAt(look);
    this.tracerMat.uniforms.uCamera.value.copy(pos);
    this.glowMat.uniforms.uCamera.value.copy(pos);
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
    if (this.disposed) return;
    // pointer parallax eases in; keep drawing until it settles
    this.pointerLerp.lerp(this.pointer, 0.08);
    const settling = this.pointerLerp.distanceTo(this.pointer) > 0.002;
    if (this.needsRender || settling) {
      this.needsRender = false;
      this.apply();
      this.renderer.render(this.scene, this.camera);
      if (!this.firstFrame) { this.firstFrame = true; this.opts.onFirstFrame?.(); }
    }
    if (settling) this.raf = requestAnimationFrame(this.loop);
  };

  resize() {
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.opts.touch ? 1.5 : 2));
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
