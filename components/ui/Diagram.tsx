import type { ReactNode } from "react";
import type { SubService } from "@/content/services";

/**
 * One drawing per sub-service: hairlines for the world, a single green tracer for what Revolt does in it.
 * All sixteen share a viewBox (480 × 300), a mono label voice and the same three primitives, so they read as one
 * family. The tracer paths carry class "trace" and draw on reveal (see useReveals).
 */
const G = "#2BB61E";
/** Server and client must agree on every coordinate, so computed geometry is rounded before it reaches the DOM. */
const r2 = (n: number) => Math.round(n * 100) / 100;

function Label({ x, y, children, anchor = "start", dim }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; dim?: boolean }) {
  return (
    <text x={x} y={y} fontFamily="var(--font-geist-mono), ui-monospace, monospace" fontSize="11" textAnchor={anchor} fill="currentColor" opacity={dim ? 0.45 : 0.8}>
      {children}
    </text>
  );
}
function Hair({ d, dash }: { d: string; dash?: boolean }) {
  return <path d={d} stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" fill="none" strokeLinecap="round" strokeDasharray={dash ? "2 4" : undefined} />;
}
function Box({ x, y, w, h, r = 6 }: { x: number; y: number; w: number; h: number; r?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={r} stroke="currentColor" strokeOpacity="0.3" fill="none" />;
}
function Fill({ x, y, w, h, r = 4, o = 0.08 }: { x: number; y: number; w: number; h: number; r?: number; o?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={r} fill="currentColor" fillOpacity={o} />;
}
function Trace({ d, w = 1.75 }: { d: string; w?: number }) {
  return <path className="trace" d={d} stroke={G} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />;
}
function Dot({ x, y, r = 4 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={G} />;
}
function Stop({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={5} fill="none" stroke={G} strokeWidth="1.5" />;
}

const DIAGRAMS: Record<SubService["diagram"], () => ReactNode> = {
  brand: () => (
    <>
      {/* the identity system: mark, palette, type, card, guidelines, joined by one line */}
      <Box x={40} y={50} w={110} h={110} r={12} />
      <circle cx={95} cy={105} r={26} stroke="currentColor" strokeOpacity="0.5" fill="none" />
      <Label x={95} y={185} anchor="middle">logo</Label>
      <Box x={180} y={50} w={110} h={50} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={190 + i * 24} y={60} width={18} height={30} rx="3" fill="currentColor" fillOpacity={[0.9, 0.5, 0.25, 0.1][i]} />)}
      <rect x={190 + 1 * 24} y={60} width={18} height={30} rx="3" fill={G} />
      <Label x={180} y={118} dim>palette</Label>
      <Box x={180} y={130} w={110} h={30} />
      <text x={190} y={152} fontFamily="var(--font-inter), sans-serif" fontWeight="600" fontSize="18" fill="currentColor">Aa</text>
      <Label x={250} y={152} dim>type</Label>
      <Box x={320} y={50} w={120} h={68} r={8} />
      <Hair d="M332 70h60M332 84h40M332 98h50" />
      <Label x={320} y={136} dim>business card</Label>
      <Box x={320} y={148} w={120} h={100} r={8} />
      <Hair d="M332 168h96M332 184h70M332 200h96M332 216h56M332 232h80" />
      <Label x={320} y={266} dim>guidelines pdf</Label>
      <Trace d="M95 105 C 130 40, 200 40, 235 75 C 250 90, 250 120, 235 145 C 260 140, 300 140, 380 84 C 400 110, 400 150, 380 198" />
      <Stop x={95} y={105} />
      <Dot x={380} y={198} />
    </>
  ),
  landing: () => (
    <>
      <Box x={40} y={40} w={70} h={36} r={18} />
      <Label x={75} y={62} anchor="middle">ad</Label>
      <Box x={200} y={30} w={200} h={240} r={14} />
      <Fill x={214} y={46} w={120} h={12} r={3} o={0.35} />
      <Fill x={214} y={64} w={172} h={70} r={6} />
      <Hair d="M214 150h172M214 170h172M214 190h110" />
      <Box x={214} y={208} w={172} h={20} r={5} />
      <rect x={214} y={236} width={172} height={22} rx="11" fill={G} />
      <Label x={300} y={251} anchor="middle">book a bay</Label>
      <Label x={40} y={150} dim>one offer</Label>
      <Label x={40} y={168} dim>one objective</Label>
      <Trace d="M110 58 C 160 58, 170 120, 190 190 C 196 215, 210 240, 300 247" />
      <Dot x={300} y={247} />
    </>
  ),
  profile: () => (
    <>
      <Box x={40} y={40} w={200} h={28} r={14} />
      <Label x={56} y={58}>golf simulator near me</Label>
      <Hair d="M40 100h400" dash />
      <Box x={40} y={120} w={260} h={140} r={12} />
      <Fill x={54} y={134} w={60} h={60} r={8} />
      <Hair d="M126 146h120M126 164h80" />
      {[0, 1, 2, 3, 4].map((i) => <Dot key={i} x={132 + i * 14} y={182} r={3.5} />)}
      <Label x={206} y={186} dim>reviews</Label>
      <Hair d="M54 214h180M54 232h120" />
      <Label x={54} y={252} dim>hours · services · photos</Label>
      <path d="M380 130 c-18 0 -32 14 -32 32 c0 26 32 60 32 60 s32 -34 32 -60 c0 -18 -14 -32 -32 -32z" stroke="currentColor" strokeOpacity="0.4" fill="none" />
      <circle cx={380} cy={162} r={9} fill={G} />
      <Label x={380} y={246} anchor="middle" dim>map pack</Label>
      <Trace d="M240 54 C 300 54, 330 90, 380 150" />
    </>
  ),
  social: () => (
    <>
      <Box x={60} y={40} w={110} h={220} r={18} />
      <Fill x={72} y={54} w={86} h={54} r={8} />
      <Hair d="M72 124h86M72 140h60M72 176h86M72 192h50" />
      <Label x={115} y={282} anchor="middle" dim>facebook page</Label>
      <Box x={310} y={40} w={110} h={220} r={18} />
      <Fill x={322} y={54} w={86} h={86} r={8} />
      <Hair d="M322 156h86M322 172h60M322 208h86M322 224h50" />
      <Label x={365} y={282} anchor="middle" dim>instagram profile</Label>
      <circle cx={240} cy={150} r={22} stroke="currentColor" strokeOpacity="0.4" fill="none" />
      <Label x={240} y={154} anchor="middle">venue</Label>
      <Trace d="M170 100 C 200 100, 200 150, 218 150" />
      <Trace d="M310 100 C 280 100, 280 150, 262 150" />
      <Dot x={218} y={150} r={3} />
      <Dot x={262} y={150} r={3} />
    </>
  ),
  website: () => (
    <>
      {["home", "bays", "events", "about", "book"].map((n, i) => (
        <g key={n}>
          <Box x={30 + i * 88} y={80} w={70} h={96} r={8} />
          <Fill x={38 + i * 88} y={90} w={54} h={8} r={2} o={0.35} />
          <Hair d={`M${38 + i * 88} 112h54M${38 + i * 88} 126h40M${38 + i * 88} 140h54`} />
          <Label x={65 + i * 88} y={200} anchor="middle" dim>{n}</Label>
        </g>
      ))}
      <rect x={390} y={150} width={54} height={16} rx="8" fill={G} />
      <Trace d="M65 128 C 100 128, 110 128, 153 128 S 200 128, 241 128 S 290 128, 329 128 C 360 128, 380 140, 417 158" />
      <Stop x={65} y={128} />
      <Label x={30} y={250} dim>five pages, one path to a booking</Label>
    </>
  ),
  content: () => (
    <>
      <circle cx={110} cy={150} r={56} stroke="currentColor" strokeOpacity="0.35" fill="none" />
      <circle cx={110} cy={150} r={40} stroke="currentColor" strokeOpacity="0.25" fill="none" />
      {[0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2; return <line key={i} x1={r2(110 + Math.cos(a) * 40)} y1={r2(150 + Math.sin(a) * 40)} x2={r2(110 + Math.cos(a + 0.9) * 18)} y2={r2(150 + Math.sin(a + 0.9) * 18)} stroke="currentColor" strokeOpacity="0.35" />; })}
      <Label x={110} y={234} anchor="middle" dim>professional shoot</Label>
      <Box x={230} y={60} w={100} h={72} r={8} />
      <Label x={280} y={150} anchor="middle" dim>photo</Label>
      <Box x={230} y={170} w={100} h={72} r={8} />
      <path d="M272 194 l20 12 l-20 12z" fill="currentColor" fillOpacity="0.5" />
      <Label x={280} y={260} anchor="middle" dim>video</Label>
      <Box x={370} y={90} w={80} h={120} r={10} />
      <Hair d="M382 110h56M382 126h40M382 142h56M382 158h30" />
      <Label x={410} y={230} anchor="middle" dim>ad-ready</Label>
      <Trace d="M150 132 C 190 100, 200 96, 230 96 M150 168 C 190 200, 200 206, 230 206 M330 96 C 350 96, 350 150, 370 150 M330 206 C 350 206, 350 150, 370 150" />
      <Dot x={370} y={150} />
    </>
  ),
  "social-mgmt": () => (
    <>
      {["m", "t", "w", "t", "f", "s", "s"].map((d, i) => <Label key={i} x={60 + i * 52} y={52} anchor="middle" dim>{d}</Label>)}
      {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4, 5, 6].map((c) => <Box key={`${r}${c}`} x={38 + c * 52} y={64 + r * 46} w={44} h={38} r={6} />))}
      {[[0, 1], [0, 4], [1, 2], [1, 5], [2, 0], [2, 3], [3, 1], [3, 4], [3, 6]].map(([r, c]) => <rect key={`${r}${c}`} x={44 + c * 52} y={70 + r * 46} width={32} height={26} rx="4" fill={G} fillOpacity="0.85" />)}
      <Trace d="M112 89 C 200 89, 220 89, 268 89 C 320 89, 200 135, 164 135 C 100 135, 330 181, 216 181 C 100 181, 300 227, 372 227" />
      <Label x={38} y={272} dim>posted, scheduled, answered</Label>
    </>
  ),
  meta: () => (
    <>
      <Box x={40} y={100} w={110} h={90} r={10} />
      <Fill x={50} y={110} w={90} h={44} r={6} />
      <Hair d="M50 166h70M50 180h50" />
      <Label x={95} y={212} anchor="middle" dim>ad creative</Label>
      <circle cx={280} cy={145} r={62} stroke="currentColor" strokeOpacity="0.3" fill="none" />
      <circle cx={340} cy={145} r={62} stroke="currentColor" strokeOpacity="0.3" fill="none" />
      <Label x={250} y={150} anchor="middle" dim>local</Label>
      <Label x={372} y={150} anchor="middle" dim>golfers</Label>
      <Label x={310} y={232} anchor="middle" dim>the audience that books</Label>
      <Trace d="M150 145 C 200 145, 240 145, 310 145" />
      <Dot x={310} y={145} r={6} />
    </>
  ),
  google: () => (
    <>
      <Box x={40} y={50} w={300} h={34} r={17} />
      <Label x={58} y={72}>indoor golf simulator near me</Label>
      <line x1={300} y1={60} x2={300} y2={74} stroke="currentColor" strokeOpacity="0.6" />
      <Box x={40} y={110} w={400} h={70} r={10} />
      <rect x={52} y={122} width={26} height={14} rx="3" fill={G} />
      <Label x={65} y={133} anchor="middle" dim>ad</Label>
      <Fill x={88} y={122} w={180} h={10} r={2} o={0.5} />
      <Hair d="M52 152h300M52 166h220" />
      <Label x={440} y={168} anchor="end" dim>your venue</Label>
      <Box x={40} y={196} w={400} h={30} r={8} />
      <Box x={40} y={236} w={400} h={30} r={8} />
      <Label x={40} y={286} dim>captured at the top, before anyone scrolls</Label>
      <Trace d="M190 84 C 190 100, 120 96, 65 110" />
    </>
  ),
  seo: () => (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <Box x={120} y={44 + i * 44} w={320} h={34} r={8} />
          <Label x={100} y={66 + i * 44} anchor="end" dim>{`#${i + 1}`}</Label>
          <Hair d={`M132 ${56 + i * 44}h140M132 ${68 + i * 44}h90`} />
        </g>
      ))}
      <rect x={120} y={44} width={320} height={34} rx="8" fill={G} fillOpacity="0.14" stroke={G} />
      <Label x={430} y={66} anchor="end">your venue</Label>
      <Trace d="M70 236 C 40 236, 40 61, 76 61 C 90 61, 100 61, 118 61" />
      <Stop x={70} y={236} />
      <Dot x={118} y={61} />
      <Label x={40} y={280} dim>compounding, month after month</Label>
    </>
  ),
  email: () => (
    <>
      <Hair d="M60 200h360" />
      {[["welcome", 90], ["offer", 200], ["come back", 310], ["review", 410]].map(([l, x]) => (
        <g key={l as string}>
          <Label x={x as number} y={236} anchor="middle" dim>{l}</Label>
        </g>
      ))}
      <Box x={60} y={70} w={110} h={70} r={10} />
      <path d="M72 84 l43 30 l43 -30" stroke="currentColor" strokeOpacity="0.45" fill="none" />
      <Label x={115} y={156} anchor="middle" dim>email</Label>
      <Box x={310} y={70} w={110} h={70} r={22} />
      <Hair d="M330 96h70M330 112h44" />
      <Label x={365} y={156} anchor="middle" dim>sms</Label>
      <Trace d="M90 200 C 130 200, 150 200, 200 200 S 270 200, 310 200 S 380 200, 410 200" />
      <Stop x={90} y={200} />
      <Dot x={200} y={200} />
      <Dot x={310} y={200} />
      <Dot x={410} y={200} />
      <Label x={60} y={276} dim>automated, timed to the visit</Label>
    </>
  ),
  rebook: () => (
    <>
      <circle cx={240} cy={150} r={90} stroke="currentColor" strokeOpacity="0.22" fill="none" strokeDasharray="2 5" />
      <Trace d="M240 60 A 90 90 0 1 1 162 195" />
      <path d="M162 195 l-4 -14 M162 195 l14 -3" stroke={G} strokeWidth="1.75" strokeLinecap="round" fill="none" />
      <Stop x={240} y={60} />
      <Dot x={318} y={195} />
      <Dot x={162} y={195} />
      <Label x={240} y={44} anchor="middle">first visit</Label>
      <Label x={330} y={214} anchor="start">follow-up</Label>
      <Label x={150} y={214} anchor="end">return</Label>
      <Label x={240} y={156} anchor="middle" dim>repeat, on autopilot</Label>
    </>
  ),
  review: () => (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const cx = 90 + i * 75, cy = 110, r = 24;
        const pts = Array.from({ length: 10 }, (_, k) => { const a = -Math.PI / 2 + (k * Math.PI) / 5; const rr = k % 2 ? r * 0.45 : r; return `${r2(cx + Math.cos(a) * rr)},${r2(cy + Math.sin(a) * rr)}`; }).join(" ");
        return <polygon key={i} points={pts} fill={i < 5 ? G : "none"} fillOpacity={0.9} stroke={G} strokeWidth="1" />;
      })}
      <Hair d="M60 200h360" />
      <Label x={60} y={226} dim>visit</Label>
      <Label x={230} y={226} anchor="middle" dim>request sent</Label>
      <Label x={420} y={226} anchor="end" dim>review posted</Label>
      <Trace d="M60 200 C 120 200, 180 200, 230 200 S 360 200, 420 200" />
      <Stop x={60} y={200} />
      <Dot x={230} y={200} />
      <Dot x={420} y={200} />
      <Label x={240} y={272} anchor="middle" dim>asked at the right moment, every time</Label>
    </>
  ),
  corporate: () => (
    <>
      {["mon", "tue", "wed", "thu", "fri"].map((d, i) => (
        <g key={d}>
          <Label x={72 + i * 76} y={46} anchor="middle" dim>{d}</Label>
          <Box x={40 + i * 76} y={58} w={64} h={180} r={8} />
          <Hair d={`M40 ${118}h64M40 ${178}h64`.replace(/M40/g, `M${40 + i * 76}`)} />
        </g>
      ))}
      <rect x={122} y={124} width={52} height={50} rx="6" fill={G} fillOpacity="0.85" />
      <rect x={274} y={124} width={52} height={50} rx="6" fill={G} fillOpacity="0.85" />
      <rect x={350} y={124} width={52} height={50} rx="6" fill={G} fillOpacity="0.85" />
      <Label x={40} y={272} dim>weekday afternoons, booked by companies</Label>
      <Trace d="M20 149 C 60 149, 90 149, 122 149 M174 149 C 220 149, 240 149, 274 149 M326 149 C 340 149, 340 149, 350 149" />
    </>
  ),
  community: () => (
    <>
      {[0, 1, 2, 3, 4, 5].map((w) => (
        <g key={w}>
          <Label x={60 + w * 72} y={250} anchor="middle" dim>{`wk ${w + 1}`}</Label>
          <Hair d={`M${60 + w * 72} 60v170`} dash />
        </g>
      ))}
      {[[0, 4], [1, 6], [2, 7], [3, 9], [4, 10], [5, 12]].map(([w, n]) => Array.from({ length: n }, (_, k) => <circle key={`${w}${k}`} cx={60 + w * 72 + ((k % 3) - 1) * 12} cy={210 - Math.floor(k / 3) * 14} r={4} fill="currentColor" fillOpacity={0.35} />))}
      <Trace d="M60 178 C 100 172, 110 166, 132 160 S 190 146, 204 140 S 260 124, 276 118 S 330 104, 348 98 S 400 84, 420 78" />
      <Dot x={420} y={78} />
      <Label x={420} y={64} anchor="end">league night</Label>
      <Label x={40} y={286} dim>players who come back every week</Label>
    </>
  ),
  membership: () => (
    <>
      {[["member", 0], ["plus", 1], ["vip", 2]].map(([n, i]) => (
        <g key={n as string}>
          <Box x={40 + (i as number) * 92} y={70 - (i as number) * 12} w={80} h={120 + (i as number) * 12} r={10} />
          <Label x={80 + (i as number) * 92} y={92 - (i as number) * 12} anchor="middle">{n}</Label>
          <Hair d={`M${52 + (i as number) * 92} ${110 - (i as number) * 12}h56M${52 + (i as number) * 92} ${126 - (i as number) * 12}h40M${52 + (i as number) * 92} ${142 - (i as number) * 12}h56`} />
        </g>
      ))}
      <rect x={224} y={46} width={80} height={144} rx="10" fill={G} fillOpacity="0.1" stroke={G} />
      <Hair d="M340 200h100" />
      {["j", "f", "m", "a", "m", "j"].map((m, i) => <Label key={i} x={346 + i * 18} y={222} anchor="middle" dim>{m}</Label>)}
      <Trace d="M340 200 C 356 196, 366 186, 376 182 S 396 172, 406 166 S 426 150, 440 142" />
      <Dot x={440} y={142} />
      <Label x={440} y={128} anchor="end" dim>recurring</Label>
      <Label x={40} y={272} dim>tiers, perks and renewals that run themselves</Label>
    </>
  ),
};

export default function Diagram({ kind, className = "" }: { kind: SubService["diagram"]; className?: string }) {
  const Draw = DIAGRAMS[kind];
  return (
    <div data-tracer className={`diagram-holder ${className}`} aria-hidden="true">
      <svg className="diagram h-auto w-full" viewBox="0 0 480 300" fill="none">
        <Draw />
      </svg>
    </div>
  );
}
