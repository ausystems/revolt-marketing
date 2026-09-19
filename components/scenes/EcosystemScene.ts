/**
 * The ecosystem: four tracers, one from each system, converging on one venue.
 * An elevated three-quarter view of a dark floor. The venue is a small lit bay at the centre. As scroll progress
 * runs 0 → 1 the four shots are taken in sequence; each one lands and the venue brightens a notch.
 * Render on demand. Labels are HTML, projected from the launch points (see projectLaunch).
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const INK = 0x0a0a0a;
const GREEN = new THREE.Color(0x2bb61e);

const VERT = /* glsl */ `
  varying float vU; varying vec3 vN; varying vec3 vP;
  void main(){ vU = uv.x; vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position,1.0); vP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }
`;
const FRAG = /* glsl */ `
  uniform float uProgress; uniform float uSoft; uniform vec3 uColor; uniform float uOpacity; uniform vec3 uCamera;
  varying float vU; varying vec3 vN; varying vec3 vP;
  void main(){
    if (vU > uProgress) discard;
    float head = smoothstep(uProgress - 0.3, uProgress, vU);
    float tail = smoothstep(0.0, 0.06, vU);
    float rim = pow(max(dot(normalize(vN), normalize(uCamera - vP)), 0.0), uSoft);
    gl_FragColor = vec4(uColor * (0.85 + 0.5 * head), uOpacity * (0.5 + 0.5 * head) * tail * rim);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Launch points: four quadrants around the venue, in system order (01 top-left … 04 bottom-right when viewed). */
const LAUNCH = [
  new THREE.Vector3(-3.1, 0.05, -1.4),
  new THREE.Vector3(3.1, 0.05, -1.2),
  new THREE.Vector3(-2.9, 0.05, 1.9),
  new THREE.Vector3(3.0, 0.05, 1.8),
];
/** Each shot's window of the overall progress. */
const WINDOWS: [number, number][] = [[0.06, 0.4], [0.24, 0.58], [0.42, 0.76], [0.6, 0.94]];

export type EcoOptions = { touch?: boolean; onFirstFrame?: () => void; onContextLost?: () => void; onResize?: () => void };

export class EcosystemScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private pmrem: THREE.PMREMGenerator;
  private tracers: THREE.ShaderMaterial[] = [];
  private glows: THREE.ShaderMaterial[] = [];
  private balls: THREE.Mesh[] = [];
  private curves: THREE.QuadraticBezierCurve3[] = [];
  private rings: THREE.Mesh[] = [];
  private screenMat!: THREE.MeshStandardMaterial;
  private venueLight!: THREE.PointLight;
  private progress = 0;
  private needsRender = true;
  private raf = 0;
  private disposed = false;
  private first = false;
  private ro?: ResizeObserver;
  private disposables: { dispose(): void }[] = [];
  private lost: (e: Event) => void;
  private restored: () => void;

  constructor(private canvas: HTMLCanvasElement, private host: HTMLElement, private opts: EcoOptions = {}) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance", stencil: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.touch ? 1.5 : 2));
    this.renderer.setClearColor(INK, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60);
    this.scene.fog = new THREE.FogExp2(INK, 0.06);
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.3;
    this.build();
    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.lost = (e) => { e.preventDefault(); cancelAnimationFrame(this.raf); this.raf = 0; opts.onContextLost?.(); };
    this.restored = () => this.invalidate();
    canvas.addEventListener("webglcontextlost", this.lost, false);
    canvas.addEventListener("webglcontextrestored", this.restored, false);
    this.invalidate();
  }
  private track<T extends { dispose(): void }>(d: T) { this.disposables.push(d); return d; }

  private build() {
    const s = this.scene;
    // Floor: matte ink with a faint radial lift under the venue.
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "#1a1f1a"); g.addColorStop(0.55, "#101210"); g.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    const floorTex = this.track(new THREE.CanvasTexture(c)); floorTex.colorSpace = THREE.SRGBColorSpace;
    const floor = new THREE.Mesh(this.track(new THREE.PlaneGeometry(22, 22)), this.track(new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.92, metalness: 0.02, envMapIntensity: 0.25 })));
    floor.rotation.x = -Math.PI / 2; s.add(floor);

    // The venue: a low slab and a small lit screen.
    const slab = new THREE.Mesh(this.track(new THREE.BoxGeometry(1.3, 0.06, 0.9)), this.track(new THREE.MeshStandardMaterial({ color: 0x1c2a1d, roughness: 0.85, envMapIntensity: 0.3 })));
    slab.position.set(0, 0.03, 0); s.add(slab);
    const sc = document.createElement("canvas"); sc.width = 256; sc.height = 160;
    const sctx = sc.getContext("2d")!;
    const sky = sctx.createLinearGradient(0, 0, 0, 160); sky.addColorStop(0, "#bcd8ea"); sky.addColorStop(0.5, "#e6efe6"); sky.addColorStop(0.52, "#5c9d41"); sky.addColorStop(1, "#3a7a2b");
    sctx.fillStyle = sky; sctx.fillRect(0, 0, 256, 160);
    const screenTex = this.track(new THREE.CanvasTexture(sc)); screenTex.colorSpace = THREE.SRGBColorSpace;
    this.screenMat = this.track(new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.5, emissive: 0xffffff, emissiveMap: screenTex, emissiveIntensity: 0.55 }));
    const screen = new THREE.Mesh(this.track(new THREE.PlaneGeometry(1.0, 0.56)), this.screenMat);
    screen.position.set(0, 0.34, -0.42); s.add(screen);
    const frame = new THREE.Mesh(this.track(new THREE.BoxGeometry(1.36, 0.66, 0.05)), this.track(new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.6 })));
    frame.position.set(0, 0.34, -0.46); s.add(frame);
    const walls = this.track(new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.8, envMapIntensity: 0.2 }));
    for (const x of [-0.66, 0.66]) { const w = new THREE.Mesh(this.track(new THREE.BoxGeometry(0.04, 0.5, 0.9)), walls); w.position.set(x, 0.28, 0); s.add(w); }
    const matInner = new THREE.Mesh(this.track(new THREE.BoxGeometry(0.5, 0.012, 0.42)), this.track(new THREE.MeshStandardMaterial({ color: 0x2b4a2c, roughness: 0.9 })));
    matInner.position.set(0, 0.066, 0.12); s.add(matInner);
    const teeBall = new THREE.Mesh(this.track(new THREE.SphereGeometry(0.022, 24, 16)), this.track(new THREE.MeshPhysicalMaterial({ color: 0xf4f4f0, roughness: 0.45, clearcoat: 0.3 })));
    teeBall.position.set(0, 0.094, 0.14); s.add(teeBall);
    this.venueLight = new THREE.PointLight(0xa9d99a, 2.5, 4, 2); this.venueLight.position.set(0, 0.5, -0.1); s.add(this.venueLight);
    const top = new THREE.SpotLight(0xfff0d6, 14, 8, 0.6, 0.8, 1.5); top.position.set(0.6, 3.2, 1.2); top.target.position.set(0, 0, 0); s.add(top); s.add(top.target);
    s.add(new THREE.HemisphereLight(0x223322, 0x050505, 0.45));

    // Four shots.
    const ballGeo = this.track(new THREE.SphereGeometry(0.05, 32, 24));
    const ballMat = this.track(new THREE.MeshPhysicalMaterial({ color: 0xf4f4f0, roughness: 0.45, clearcoat: 0.3, envMapIntensity: 0.8 }));
    const ringGeo = this.track(new THREE.RingGeometry(0.5, 0.52, 64));
    const target = new THREE.Vector3(0, 0.38, -0.36);
    LAUNCH.forEach((p, i) => {
      const ctrl = new THREE.Vector3(p.x * 0.45, 1.9 + i * 0.12, p.z * 0.45);
      const curve = new THREE.QuadraticBezierCurve3(p.clone(), ctrl, target.clone());
      this.curves.push(curve);
      const uniforms = () => ({ uProgress: { value: 0 }, uSoft: { value: 1 }, uColor: { value: GREEN.clone() }, uOpacity: { value: 1 }, uCamera: { value: new THREE.Vector3() } });
      const t = this.track(new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: uniforms(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      const gl = this.track(new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: uniforms(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      gl.uniforms.uSoft.value = 2.6; gl.uniforms.uOpacity.value = 0.3;
      s.add(new THREE.Mesh(this.track(new THREE.TubeGeometry(curve, 100, 0.012, 8, false)), t));
      s.add(new THREE.Mesh(this.track(new THREE.TubeGeometry(curve, 100, 0.05, 8, false)), gl));
      this.tracers.push(t); this.glows.push(gl);
      const b = new THREE.Mesh(ballGeo, ballMat); b.position.copy(p); s.add(b); this.balls.push(b);
      // a small tee pad at each launch
      const pad = new THREE.Mesh(this.track(new THREE.CircleGeometry(0.22, 32)), this.track(new THREE.MeshStandardMaterial({ color: 0x1a261b, roughness: 0.9 })));
      pad.rotation.x = -Math.PI / 2; pad.position.set(p.x, 0.005, p.z); s.add(pad);
      // landing ripple on the floor under the venue
      const ring = new THREE.Mesh(ringGeo, this.track(new THREE.MeshBasicMaterial({ color: 0x2bb61e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })));
      ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.012, 0); s.add(ring); this.rings.push(ring);
    });
  }

  private apply() {
    const p = this.progress;
    let landed = 0;
    WINDOWS.forEach(([a, b], i) => {
      const t = easeInOut(range(p, a, b));
      this.tracers[i].uniforms.uProgress.value = t;
      this.glows[i].uniforms.uProgress.value = t;
      const pt = this.curves[i].getPointAt(t);
      this.balls[i].position.copy(pt);
      this.balls[i].visible = t < 0.995;
      const r = range(p, b, b + 0.12);
      this.rings[i].scale.setScalar(0.4 + r * 2.4);
      (this.rings[i].material as THREE.MeshBasicMaterial).opacity = r > 0 ? Math.pow(1 - r, 1.4) * 0.35 : 0;
      landed += range(p, b - 0.02, b + 0.03);
    });
    this.screenMat.emissiveIntensity = 0.55 + landed * 0.28;
    this.venueLight.intensity = 2.5 + landed * 1.6;
    // a restrained orbit: eight degrees over the whole scroll
    const az = -0.16 + p * 0.28;
    const r = this.camera.aspect < 0.9 ? 11.5 : this.camera.aspect < 1.5 ? 10.2 : 9.0;
    const el = this.camera.aspect < 0.9 ? 0.74 : 0.6;
    this.camera.position.set(Math.sin(az) * r * Math.cos(el), Math.sin(el) * r, Math.cos(az) * r * Math.cos(el));
    this.camera.lookAt(0, 0.35, -0.1);
    this.tracers.forEach((m) => m.uniforms.uCamera.value.copy(this.camera.position));
    this.glows.forEach((m) => m.uniforms.uCamera.value.copy(this.camera.position));
  }

  /** Screen-space position (0..1) of each launch point, for the HTML labels. */
  projectLaunch(): { x: number; y: number; active: number }[] {
    this.camera.updateMatrixWorld();
    return LAUNCH.map((p, i) => {
      const v = p.clone().project(this.camera);
      return { x: v.x * 0.5 + 0.5, y: -v.y * 0.5 + 0.5, active: range(this.progress, WINDOWS[i][0] - 0.03, WINDOWS[i][0] + 0.05) };
    });
  }

  setProgress(p: number) { const v = clamp01(p); if (v === this.progress) return; this.progress = v; this.invalidate(); }
  getProgress() { return this.progress; }
  snapshot() { this.apply(); this.renderer.render(this.scene, this.camera); return this.canvas.toDataURL("image/png"); }
  invalidate() { this.needsRender = true; if (!this.raf && !this.disposed) this.raf = requestAnimationFrame(this.loop); }
  private loop = () => {
    this.raf = 0;
    if (this.disposed || !this.needsRender) return;
    this.needsRender = false;
    this.apply();
    this.renderer.render(this.scene, this.camera);
    if (!this.first) { this.first = true; this.opts.onFirstFrame?.(); }
  };
  resize() {
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.opts.touch ? 1.5 : 2));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.apply();
    this.opts.onResize?.();
    this.invalidate();
  }
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.canvas.removeEventListener("webglcontextlost", this.lost);
    this.canvas.removeEventListener("webglcontextrestored", this.restored);
    this.disposables.forEach((d) => d.dispose());
    this.scene.environment?.dispose();
    this.pmrem.dispose();
    this.renderer.dispose();
  }
}
