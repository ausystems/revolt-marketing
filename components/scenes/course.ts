/**
 * The virtual hole on the simulator screen.
 *
 * The course the screen shows: its terrain, its layout and its tee camera. `CourseBake.ts` renders the hole into
 * `public/media/hero/course-*.webp`, which `BayScene.ts` projects onto the bay's screen.
 *
 * Course space: metres, three.js axes. The tee camera looks down -z, so a point `d` metres down the hole sits at
 * z = -d, and +x is to the golfer's right.
 */

export const COURSE = {
  /** Bake resolution (16:10, the bay screen's aspect). */
  width: 2560,
  height: 1600,
  /** Tee camera: eye height above the tee box, distance behind the ball, pitch (deg, negative looks down), vertical fov. */
  eye: 2.9,
  back: 6.4,
  pitch: -6.2,
  fov: 50,
  /** The tee box is a platform this high above the ground around it. */
  teeTop: 0.5,
  pin: { x: 16, d: 338 },
} as const;

const sm = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Fairway centre line (x) at distance d: straight off the tee, drifting right toward an elevated green. */
export const fairwayX = (d: number) => 13 * sm(70, 320, d) + 2.2 * Math.sin(d / 52);

/** Ground height at (x, d): a raised tee box, a shallow swale, then a steady climb to the green, banks up into the trees. */
export function terrain(x: number, d: number) {
  const tee = COURSE.teeTop * (1 - sm(6, 9.5, d)) * (1 - sm(10, 13.5, Math.abs(x))) * sm(-30, -26, d);
  const swale = -1.6 * sm(12, 70, d) * (1 - sm(70, 160, d));
  const climb = 12.5 * sm(60, 335, d);
  const off = Math.max(Math.abs(x - fairwayX(d)) - 26, 0);
  return tee + swale + climb + 6.5 * (1 - Math.exp(-off / 38));
}

/** The cart path, as (x, d) points from beside the tee into the woods left of the green. */
export const CART_PATH: [number, number][] = [
  [-13, -12], [-14.5, 6], [-18.5, 28], [-25.5, 58], [-33.5, 95], [-41, 140], [-44, 190], [-40, 240], [-33, 285], [-20, 322], [-6, 352],
];

/** Distance from (x, d) to the cart path's centre line. */
export function pathDistance(x: number, d: number) {
  let m = Infinity;
  for (let i = 0; i < CART_PATH.length - 1; i++) {
    const [ax, ad] = CART_PATH[i], [bx, bd] = CART_PATH[i + 1];
    const px = x - ax, pd = d - ad, vx = bx - ax, vd = bd - ad;
    const h = Math.min(1, Math.max(0, (px * vx + pd * vd) / (vx * vx + vd * vd)));
    m = Math.min(m, Math.hypot(px - vx * h, pd - vd * h));
  }
  return m;
}

/** GLSL twin of `fairwayX` and `terrain` (keep in step). */
export const TERRAIN_GLSL = /* glsl */ `
  float fairwayX(float d) { return 13.0 * smoothstep(70.0, 320.0, d) + 2.2 * sin(d / 52.0); }
  float terrain(float x, float d) {
    float tee = ${COURSE.teeTop.toFixed(3)} * (1.0 - smoothstep(6.0, 9.5, d)) * (1.0 - smoothstep(10.0, 13.5, abs(x))) * smoothstep(-30.0, -26.0, d);
    float swale = -1.6 * smoothstep(12.0, 70.0, d) * (1.0 - smoothstep(70.0, 160.0, d));
    float climb = 12.5 * smoothstep(60.0, 335.0, d);
    float off = max(abs(x - fairwayX(d)) - 26.0, 0.0);
    return tee + swale + climb + 6.5 * (1.0 - exp(-off / 38.0));
  }
`;

/** Tee camera position and the point it looks at. */
export function teeCamera() {
  const y = COURSE.teeTop + COURSE.eye;
  const p = (COURSE.pitch * Math.PI) / 180;
  const pos: [number, number, number] = [0, y, COURSE.back];
  const look: [number, number, number] = [0, y + Math.sin(p) * 10, COURSE.back - Math.cos(p) * 10];
  return { pos, look, fov: COURSE.fov };
}
