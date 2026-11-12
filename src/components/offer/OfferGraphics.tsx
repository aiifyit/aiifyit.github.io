import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import { GraphicFrame, Packet } from './OfferMotion';

function Tile({ x, y, label, width = 100 }: { x: number; y: number; label: string; width?: number }) {
  return <g><rect x={x} y={y} width={width} height="48" rx="10" className="offer-svg-tile"/><text x={x + width / 2} y={y + 29} textAnchor="middle">{label}</text></g>;
}
function Network({ running, cx = 260, cy = 215, center = ['Client', 'business'] }: { running: boolean; cx?: number; cy?: number; center?: [string, string] }) {
  const nodes = Array.from({ length: 6 }, (_, i) => ({ x: cx + Math.cos(i * Math.PI / 3) * 164, y: cy + Math.sin(i * Math.PI / 3) * 106 }));
  return <g><circle cx={cx} cy={cy} r="132" className="offer-orbit"/>{nodes.map((n, i) => {
    const next = nodes[(i + 1) % nodes.length];
    const path = `M${cx} ${cy} Q${n.x} ${cy} ${n.x} ${n.y}`;
    const handoff = `M${n.x} ${n.y} Q${cx} ${cy} ${next.x} ${next.y}`;
    return <g key={i}><path d={path} className="offer-wire"/><path d={handoff} className="offer-wire offer-handoff"/><Packet path={path} running={running} delay={i * .7}/><Packet path={handoff} running={running} delay={i} duration={7}/><g className="offer-spawn" style={{ animationDelay: `${-i}s` }}><Tile x={n.x - 34} y={n.y - 22} width={68} label="Agent"/></g></g>;
  })}<rect x={cx - 68} y={cy - 32} width="136" height="64" rx="13" fill="#A3D7E2"/><text x={cx} y={cy - 2} textAnchor="middle" className="offer-dark-text">{center[0]}</text><text x={cx} y={cy + 18} textAnchor="middle" className="offer-dark-text">{center[1]}</text></g>;
}
export function AgentSwarm({ variant = 'partner' }: { variant?: 'partner' | 'direct' }) {
  const direct = variant === 'direct';
  const label = direct
    ? 'AIify with you, and a network of agents exchanging work around your business'
    : 'Your brand in front, AIify behind it, and a network of agents exchanging work around your client business';
  const front = direct ? 'Your company' : 'Your brand';
  const center: [string, string] = direct ? ['Your', 'business'] : ['Client', 'business'];
  return <GraphicFrame className="offer-swarm" label={label}>{running => <svg viewBox="0 0 560 480" aria-hidden="true"><g className="offer-pointer-back"><g className="offer-depth-back"><rect x="94" y="22" width="430" height="378" rx="22" className="offer-svg-tile"/><text x="120" y="56">AIify</text></g></g><g className="offer-depth-front"><rect x="28" y="80" width="488" height="370" rx="22" className="offer-svg-tile"/><text x="54" y="116">{front}</text><circle cx="486" cy="109" r="4" className="offer-breathe" fill="#A3D7E2"/><Network running={running} cx={270} cy={270} center={center}/></g></svg>}</GraphicFrame>;
}
export function StepGraphic({ step, variant = 'partner' }: { step: number; variant?: 'partner' | 'direct' }) {
  const direct = variant === 'direct';
  const labels = direct
    ? ['We start with your goals.', 'Agents link around your business.', 'Weekly build sessions.', 'Goals feed the agents. Illustration.', 'Your team and the work you own.']
    : ['The client stays locked inside your brand.', 'Agents link around the client business.', 'Weekly build sessions.', 'Quarterly goals feed live dashboards. Illustration.', 'Client team wins flow into your brand.'];
  const kicker = step === 3 ? 'Illustration' : (direct ? 'You × AIify' : 'Your brand × AIify');
  const step0Title = direct ? 'Your company' : 'Your brand';
  const step0Tile = direct ? 'Goals' : 'Client';
  const step0Caption = direct ? 'We start with your goals' : 'The client stays yours';
  const weeklyCaption = direct ? 'Weekly build session' : '~30 min weekly session';
  const step4Roles = direct ? ['Your team', 'Results', 'The work'] : ['Client team', 'Results', 'Shared wins'];
  const step4Title = direct ? 'You own it' : 'Your brand';
  const step4Sub = direct ? '◇ Yours' : '◇ Credit';
  const step4Caption = direct ? 'The work is yours' : 'The credit goes to your brand';
  const center: [string, string] = direct ? ['Your', 'business'] : ['Client', 'business'];
  return <GraphicFrame className="offer-step-art" label={labels[step]}>{running => <svg viewBox="0 0 520 380" aria-hidden="true">
    <text x="28" y="35" className="offer-svg-kicker">{kicker}</text>
    {step === 0 && <><rect x="76" y="76" width="368" height="252" rx="24" className="offer-svg-tile"/><text x="104" y="116">{step0Title}</text><path d="M130 208H390" className="offer-wire"/><Packet path="M130 208H390" running={running}/><Tile x={185} y={184} label={step0Tile} width={150}/><rect x="374" y="108" width="26" height="22" rx="4" fill="#A3D7E2"/><path d="M380 108v-8a7 7 0 0 1 14 0v8" stroke="#A3D7E2" strokeWidth="3" fill="none"/><text x="260" y="290" textAnchor="middle">{step0Caption}</text></>}
    {step === 1 && <Network running={running} center={center}/>}
    {step === 2 && <><circle cx="260" cy="176" r="105" className="offer-orbit"/><circle cx="260" cy="176" r="78" className="offer-orbit"/><Packet path="M260 71A105 105 0 1 1 259.99 71" running={running} duration={12}/><g className="offer-clock"><path d="M260 121V176L292 193" fill="none" stroke="#A3D7E2" strokeWidth="3"/><circle cx="260" cy="176" r="5" fill="#A3D7E2"/></g><text x="260" y="300" textAnchor="middle">{weeklyCaption}</text>{['M','T','W','T','F'].map((d,i) => <g key={i} className="offer-day" style={{ animationDelay: `${i * -.8}s` }}><rect x={147 + i * 47} y="325" width="38" height="30" rx="6" className="offer-svg-tile"/><text x={166 + i * 47} y="346" textAnchor="middle">{d}</text></g>)}</>}
    {step === 3 && <><circle cx="132" cy="176" r="79" className="offer-orbit"/><circle cx="132" cy="176" r="48" className="offer-orbit"/>{['Q1','Q2','Q3','Q4'].map((q,i) => <text key={q} x={[132,226,132,39][i]} y={[80,181,285,181][i]} textAnchor="middle">{q}</text>)}<circle cx="132" cy="176" r="9" fill="#A3D7E2"/><path d="M146 176H305" className="offer-wire"/><Packet path="M146 176H305" running={running}/><rect x="282" y="103" width="213" height="175" rx="12" className="offer-svg-tile"/><text x="300" y="132">Goals → agents</text><path d="M303 248H476M303 154V248" className="offer-wire"/><path d="m312 216 34-20 36 7 36-36 45-14" className="offer-chart"/>{[30,47,65,82].map((h,i) => <rect key={i} x={318 + i * 42} y={246-h} width="17" height={h} rx="3" className="offer-chart-bar" style={{ animationDelay: `${i * -.5}s` }}/>)}</>}
    {step === 4 && <>{step4Roles.map((role,i) => { const y = 80 + i * 84; const path = `M210 ${y+24}C270 ${y+24} 270 190 325 190`; return <g key={role}><Tile x={28} y={y} width={182} label={role}/><path d={path} className="offer-wire"/><Packet path={path} running={running} delay={i}/></g>; })}<rect x="325" y="143" width="170" height="94" rx="18" className="offer-svg-tile"/><text x="410" y="180" textAnchor="middle">{step4Title}</text><text x="410" y="210" textAnchor="middle">{step4Sub}</text><text x="260" y="351" textAnchor="middle">{step4Caption}</text></>}

  </svg>}</GraphicFrame>;
}
export function LiveDashboard() {
  return <GraphicFrame className="offer-legacy" label="Illustration: an agent signs into a locked legacy system without an API and pulls packets into live dashboard tiles">{running => <svg viewBox="0 0 520 390" aria-hidden="true"><text x="28" y="34">Illustration</text><rect x="27" y="65" width="248" height="224" rx="14" className="offer-svg-tile"/><path d="M27 104H275" className="offer-wire"/><text x="45" y="91">Legacy system · No API</text><rect x="124" y="141" width="48" height="37" rx="6" className="offer-svg-tile"/><path d="M134 142V132a14 14 0 0 1 28 0v10" fill="none" stroke="#A3D7E2" strokeWidth="2"/><Tile x={61} y={204} width={178} label="Sign in"/><g className="offer-cursor"><path d="m183 224 4 29 8-10 12-2Z" fill="#A3D7E2"/><text x="195" y="277">Agent</text></g>{['Live tiles','Dashboard'].map((t,i) => { const y = 119 + i * 113; const path = `M275 220C319 220 291 ${y+24} 330 ${y+24}`; return <g key={t}><path d={path} className="offer-wire"/><Packet path={path} running={running} delay={i * 2}/><Tile x={330} y={y} width={164} label={t}/><path d={`M346 ${y+64}h26m8 0h40m8 0h37`} className="offer-wire"/></g>; })}<text x="28" y="354" className="offer-svg-kicker">Sign in → Pull numbers → Live dashboards</text></svg>}</GraphicFrame>;
}
export function OwnershipSplit({ variant = 'partner' }: { variant?: 'partner' | 'direct' }) {
  const reduced = useReducedMotion();
  const direct = variant === 'direct';
  const label = direct
    ? 'Your vault holds your swarms, data, work, playbooks, and setups'
    : 'Your vault locks away the client relationship, data, client-specific work, brand, and price';
  const items = direct
    ? ['Your swarms', 'Your data', 'Your work', 'Your playbooks', 'Your setups']
    : ['Client relationship', 'Client data', 'Client-specific work', 'Your brand', 'Your price'];
  return <div><GraphicFrame className="offer-vault" label={label}>{running => <svg viewBox="0 0 500 400" aria-hidden="true"><rect x="22" y="20" width="456" height="360" rx="22" className="offer-svg-tile"/><text x="52" y="60">Yours</text>{items.map((item, i) => <motion.g key={item} initial={{ x: reduced ? 0 : -18, opacity: reduced ? 1 : 0 }} animate={running || reduced ? { x: 0, opacity: 1 } : undefined} transition={{ delay: reduced ? 0 : i * .22, duration: .4 }}><rect x="48" y={85+i*54} width="404" height="44" rx="8" className="offer-svg-tile"/><text x="66" y={113+i*54}>{item}</text><motion.g initial={{ scale: reduced ? 1 : .7 }} animate={running || reduced ? { scale: 1 } : undefined} transition={{ delay: reduced ? 0 : i*.22+.25, type: 'spring' }} style={{ transformOrigin: `420px ${107+i*54}px` }}><rect x="411" y={103+i*54} width="18" height="14" rx="3" fill="#A3D7E2"/><path d={`M415 ${103+i*54}v-5a5 5 0 0 1 10 0v5`} fill="none" stroke="#A3D7E2" strokeWidth="2"/></motion.g></motion.g>)}</svg>}</GraphicFrame><p className="offer-methods-chip">AIify keeps its own methods</p></div>;
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
export function QuoteAmbient({ variant = 'partner' }: { variant?: 'partner' | 'direct' }) {
  const label = variant === 'direct' ? 'Connected agents ready to support your work' : 'Connected agents ready to support your brand';
  return <GraphicFrame className="offer-quote-ambient" label={label}>{running => <svg viewBox="0 0 520 160" aria-hidden="true">{[0,1,2].map(i => { const path = `M25 ${35+i*45}C190 ${35+i*45} 280 80 490 80`; return <g key={i}><path d={path} className="offer-wire"/><Packet path={path} running={running} delay={i}/><circle cx="25" cy={35+i*45} r="5" fill="#A3D7E2"/></g>; })}<circle cx="490" cy="80" r="10" className="offer-breathe" fill="#A3D7E2"/></svg>}</GraphicFrame>;
}
