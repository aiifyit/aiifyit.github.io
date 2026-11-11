import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import copy from '../../data/offerCopy.json';
import { GraphicFrame, Packet } from './OfferMotion';

function Tile({ x, y, label, width = 100 }: { x: number; y: number; label: string; width?: number }) {
  return <g><rect x={x} y={y} width={width} height="48" rx="10" className="offer-svg-tile"/><text x={x + width / 2} y={y + 29} textAnchor="middle">{label}</text></g>;
}
function Network({ running, cx = 260, cy = 215 }: { running: boolean; cx?: number; cy?: number }) {
  const nodes = Array.from({ length: 6 }, (_, i) => ({ x: cx + Math.cos(i * Math.PI / 3) * 164, y: cy + Math.sin(i * Math.PI / 3) * 106 }));
  return <g><circle cx={cx} cy={cy} r="132" className="offer-orbit"/>{nodes.map((n, i) => {
    const next = nodes[(i + 1) % nodes.length];
    const path = `M${cx} ${cy} Q${n.x} ${cy} ${n.x} ${n.y}`;
    const handoff = `M${n.x} ${n.y} Q${cx} ${cy} ${next.x} ${next.y}`;
    return <g key={i}><path d={path} className="offer-wire"/><path d={handoff} className="offer-wire offer-handoff"/><Packet path={path} running={running} delay={i * .7}/><Packet path={handoff} running={running} delay={i} duration={7}/><g className="offer-spawn" style={{ animationDelay: `${-i}s` }}><Tile x={n.x - 34} y={n.y - 22} width={68} label="Agent"/></g></g>;
  })}<rect x={cx - 68} y={cy - 32} width="136" height="64" rx="13" fill="#A3D7E2"/><text x={cx} y={cy - 2} textAnchor="middle" className="offer-dark-text">Client</text><text x={cx} y={cy + 18} textAnchor="middle" className="offer-dark-text">business</text></g>;
}
export function AgentSwarm() {
  return <GraphicFrame className="offer-swarm" label="Your brand in front, AIify behind it, and a network of agents exchanging work around your client business">{running => <svg viewBox="0 0 560 480" aria-hidden="true"><g className="offer-pointer-back"><g className="offer-depth-back"><rect x="94" y="22" width="430" height="378" rx="22" className="offer-svg-tile"/><text x="120" y="56">AIify</text></g></g><g className="offer-depth-front"><rect x="28" y="80" width="488" height="370" rx="22" className="offer-svg-tile"/><text x="54" y="116">Your brand</text><circle cx="486" cy="109" r="4" className="offer-breathe" fill="#A3D7E2"/><Network running={running} cx={270} cy={270}/></g></svg>}</GraphicFrame>;
}
export function StepGraphic({ step }: { step: number }) {
  return <GraphicFrame className="offer-step-art" label={['Your brand protects the client relationship. You set the price.', 'Agents link around the client business.', 'Weekly sessions and daily check-ins.', 'Quarterly goals feed live dashboards. Illustration.', 'Team members receive the credit. You keep the client.'][step]}>{running => <svg viewBox="0 0 520 380" aria-hidden="true">
    <text x="28" y="35" className="offer-svg-kicker">{step === 3 ? 'Illustration' : 'Your brand × AIify'}</text>
    {step === 0 && <><path d="M112 204H405" className="offer-wire"/><Packet path="M112 204H405" running={running}/><Tile x={326} y={180} label="Client" width={140}/><g className="offer-shield"><path d="M112 85L286 115V213Q286 274 199 310Q112 274 112 213Z" className="offer-svg-tile"/><path d="m169 199 21 21 43-47" fill="none" stroke="#A3D7E2" strokeWidth="3"/><text x="199" y="154" textAnchor="middle">Your brand</text></g><Tile x={279} y={285} width={188} label="You set the price"/></>}
    {step === 1 && <Network running={running}/>}
    {step === 2 && <><circle cx="260" cy="176" r="105" className="offer-orbit"/><circle cx="260" cy="176" r="78" className="offer-orbit"/><Packet path="M260 71A105 105 0 1 1 259.99 71" running={running} duration={12}/><g className="offer-clock"><path d="M260 121V176L292 193" fill="none" stroke="#A3D7E2" strokeWidth="3"/><circle cx="260" cy="176" r="5" fill="#A3D7E2"/></g><text x="260" y="300" textAnchor="middle">~30 min weekly session</text>{['M','T','W','T','F'].map((d,i) => <g key={i} className="offer-day" style={{ animationDelay: `${i * -.8}s` }}><rect x={147 + i * 47} y="325" width="38" height="30" rx="6" className="offer-svg-tile"/><text x={166 + i * 47} y="346" textAnchor="middle">{d}</text></g>)}</>}
    {step === 3 && <><circle cx="132" cy="176" r="79" className="offer-orbit"/><circle cx="132" cy="176" r="48" className="offer-orbit"/>{['Q1','Q2','Q3','Q4'].map((q,i) => <text key={q} x={[132,226,132,39][i]} y={[80,181,285,181][i]} textAnchor="middle">{q}</text>)}<circle cx="132" cy="176" r="9" fill="#A3D7E2"/><path d="M146 176H305" className="offer-wire"/><Packet path="M146 176H305" running={running}/><rect x="282" y="103" width="213" height="175" rx="12" className="offer-svg-tile"/><text x="300" y="132">Live dashboard</text><path d="M303 248H476M303 154V248" className="offer-wire"/><path d="m312 216 34-20 36 7 36-36 45-14" className="offer-chart"/>{[30,47,65,82].map((h,i) => <rect key={i} x={318 + i * 42} y={246-h} width="17" height={h} rx="3" className="offer-chart-bar" style={{ animationDelay: `${i * -.5}s` }}/>)}</>}
    {step === 4 && <><Tile x={30} y={154} width={110} label="Shared wins"/>{['Operations lead','Team lead','Client team'].map((role,i) => { const y = 86 + i * 86; const path = `M140 178C220 178 200 ${y+24} 284 ${y+24}`; return <g key={role}><path d={path} className="offer-wire"/><Packet path={path} running={running} delay={i}/><Tile x={284} y={y} width={205} label={`◇  ${role}`}/></g>; })}<text x="260" y="351" textAnchor="middle">You keep the client</text></>}
  </svg>}</GraphicFrame>;
}
export function BrandLayers() {
  const [back, setBack] = useState(false);
  return <div className={`offer-layer-card offer-graphic ${back ? 'is-back' : ''}`}><p className="offer-eyebrow">One offer. Two layers.</p><div className="offer-segment" role="group" aria-label="Explore the white-label layers"><button aria-pressed={!back} onClick={() => setBack(false)}>Your brand</button><button aria-pressed={back} onClick={() => setBack(true)}>AIify</button></div><GraphicFrame label="Your brand slides over the AIify engine and its orbiting agents">{running => <svg viewBox="0 0 460 300" aria-hidden="true"><g className="offer-layer-back"><rect x="80" y="22" width="350" height="190" rx="14" className="offer-svg-tile"/><text x="104" y="53">AIify engine</text><circle cx="270" cy="125" r="54" className="offer-orbit"/><g className="offer-gear"><path d="M270 93V157M238 125H302M247 102L293 148M247 148L293 102" stroke="#A3D7E2" strokeWidth="9"/><circle cx="270" cy="125" r="18" className="offer-svg-tile"/></g><Packet path="M270 71A54 54 0 1 1 269.99 71" running={running}/><Tile x={108} y={90} width={70} label="Agent"/></g><g className="offer-layer-front"><rect x="24" y="161" width="340" height="115" rx="14" className="offer-svg-tile"/><text x="48" y="194">Your brand</text><path d="M148 239H268" className="offer-wire"/><Packet path="M148 239H268" running={running}/><text x="48" y="244">Relationship</text><text x="285" y="244">Client</text></g></svg>}</GraphicFrame><p className="offer-graphic-note" aria-live="polite">{back ? copy.intro.points[1].body : copy.intro.points[2].body}</p></div>;
}
export function LiveDashboard() {
  return <GraphicFrame className="offer-legacy" label="Illustration: an agent signs into a locked legacy system without an API and pulls packets into live dashboard tiles">{running => <svg viewBox="0 0 520 390" aria-hidden="true"><text x="28" y="34">Illustration</text><rect x="27" y="65" width="248" height="224" rx="14" className="offer-svg-tile"/><path d="M27 104H275" className="offer-wire"/><text x="45" y="91">Legacy system · No API</text><rect x="124" y="141" width="48" height="37" rx="6" className="offer-svg-tile"/><path d="M134 142V132a14 14 0 0 1 28 0v10" fill="none" stroke="#A3D7E2" strokeWidth="2"/><Tile x={61} y={204} width={178} label="Sign in"/><g className="offer-cursor"><path d="m183 224 4 29 8-10 12-2Z" fill="#A3D7E2"/><text x="195" y="277">Agent</text></g>{['Live tiles','Dashboard'].map((t,i) => { const y = 119 + i * 113; const path = `M275 220C319 220 291 ${y+24} 330 ${y+24}`; return <g key={t}><path d={path} className="offer-wire"/><Packet path={path} running={running} delay={i * 2}/><Tile x={330} y={y} width={164} label={t}/><path d={`M346 ${y+64}h26m8 0h40m8 0h37`} className="offer-wire"/></g>; })}<text x="28" y="354" className="offer-svg-kicker">Sign in → Pull numbers → Live dashboards</text></svg>}</GraphicFrame>;
}
export function OwnershipSplit() {
  const [methods, setMethods] = useState(false);
  const reduced = useReducedMotion();
  return <div className="offer-ownership-graphic offer-graphic"><div className="offer-segment" role="group" aria-label="Explore ownership"><button aria-pressed={!methods} onClick={() => setMethods(false)}>Your client work</button><button aria-pressed={methods} onClick={() => setMethods(true)}>AIify methods</button></div><GraphicFrame label="Two separate vaults: your client work and AIify methods">{() => <svg viewBox="0 0 500 285" aria-hidden="true">{[false,true].map((right) => <motion.g key={String(right)} initial={{ x: reduced ? 0 : right ? -25 : 25 }} whileInView={{ x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} opacity={methods === right ? 1 : .55}><rect x={right ? 274 : 20} y="28" width="206" height="226" rx="16" className="offer-svg-tile"/><circle cx={right ? 377 : 123} cy="82" r="23" className="offer-orbit"/><path d={`M${right ? 365 : 111} 82h24m-12-12v24`} stroke="#A3D7E2"/><text x={right ? 377 : 123} y="134" textAnchor="middle">{right ? 'AIify methods' : 'Your client work'}</text>{(right ? ['Methods','Frameworks'] : ['Instructions','Playbooks','Agent setups']).map((t,i) => <text key={t} x={right ? 377 : 123} y={171+i*27} textAnchor="middle" className="offer-svg-kicker">{t}</text>)}</motion.g>)}</svg>}</GraphicFrame><p className="offer-graphic-note" aria-live="polite">{methods ? 'AIify keeps its own methods.' : 'Their instructions, their playbooks, their agent setups.'}</p></div>;
}
export function CountUp({ value, money = false }: { value: number; money?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref);
  const current = useRef(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!ref.current) return;
    const format = (n: number) => `${money ? '$' : ''}${Math.round(n).toLocaleString('en-US')}`;
    if (!visible || reduced) { ref.current.textContent = format(value); if (reduced) current.current = value; return; }
    const control = animate(current.current, value, { duration: .8, onUpdate: n => { current.current = n; if (ref.current) ref.current.textContent = format(n); } });
    return () => control.stop();
  }, [value, visible, reduced, money]);
  return <span ref={ref} aria-hidden="true">{money ? '$' : ''}{value.toLocaleString('en-US')}</span>;
}
export function FeeIllustration() {
  const [executive, setExecutive] = useState(false);
  const reduced = useReducedMotion();
  return <div className="offer-fee-illustration offer-glass"><div className="offer-segment" role="group" aria-label="Compare fixed fulfillment fees"><button aria-pressed={!executive} onClick={() => setExecutive(false)}>Standard</button><button aria-pressed={executive} onClick={() => setExecutive(true)}>Executive</button></div><div className="offer-fee-caption"><span>AIify wholesale fee</span><strong aria-label={executive ? '$4,000 per executive per month' : '$2,000 per seat per month'}><CountUp value={executive ? 4000 : 2000} money/> {executive ? 'per executive' : 'per seat'} per month</strong></div><div className="offer-fee-bar" aria-hidden="true"><motion.div initial={false} animate={{ scaleX: executive ? .4 : .2 }} transition={{ duration: reduced ? 0 : .6 }}/></div><div className="offer-fee-caption"><span>Example partner price</span><strong aria-label="$10,000 a month"><CountUp value={10000} money/> a month</strong></div><p className="offer-graphic-note">{copy.economics.market}</p></div>;
}
export function QuoteAmbient() {
  return <GraphicFrame className="offer-quote-ambient" label="Connected agents ready to support your brand">{running => <svg viewBox="0 0 520 160" aria-hidden="true">{[0,1,2].map(i => { const path = `M25 ${35+i*45}C190 ${35+i*45} 280 80 490 80`; return <g key={i}><path d={path} className="offer-wire"/><Packet path={path} running={running} delay={i}/><circle cx="25" cy={35+i*45} r="5" fill="#A3D7E2"/></g>; })}<circle cx="490" cy="80" r="10" className="offer-breathe" fill="#A3D7E2"/></svg>}</GraphicFrame>;
}
