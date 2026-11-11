import { useEffect, useId, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import copy from '../../data/offerCopy.json';

export function AgentSwarm() {
  const glowId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const reduced = useReducedMotion();
  return <div ref={ref} className={`offer-swarm offer-graphic ${visible ? 'is-visible' : ''}`} role="img" aria-label="Your brand in front of a client business and its connected AI agents, with AIify fulfilling behind the scenes">
    <svg viewBox="0 0 560 480" aria-hidden="true">
      <defs><radialGradient id={glowId}><stop stopColor="#A3D7E2" stopOpacity=".18"/><stop offset="1" stopColor="#A3D7E2" stopOpacity="0"/></radialGradient></defs>
      <circle cx="280" cy="250" r="240" fill={`url(#${glowId})`}/>
      <g className="offer-back-layer"><rect x="106" y="28" width="390" height="350" rx="20"/><text x="130" y="60">AIify</text><text x="474" y="60" textAnchor="end">FULFILLMENT</text></g>
      <g className="offer-front-layer"><rect x="54" y="86" width="428" height="356" rx="20"/><text x="78" y="120">Your brand</text><circle cx="453" cy="114" r="4" fill="#A3D7E2"/></g>
      <circle cx="270" cy="265" r="126" className="offer-orbit"/><circle cx="270" cy="265" r="80" className="offer-orbit"/>
      {Array.from({ length: 6 }, (_, i) => {
        const a = i * Math.PI / 3;
        const x = 270 + Math.cos(a) * 146, y = 265 + Math.sin(a) * 116;
        return <g key={i}><path d={`M270 265 L${x} ${y}`} className="offer-wire"/><path d={`M270 265 L${x} ${y}`} className="offer-pulse" style={{ animationDelay: `${i * -.7}s` }}/><motion.g initial={false} animate={!reduced && visible ? { y: [0, -4, 0] } : { y: 0 }} transition={{ duration: 5, repeat: Infinity, delay: i * .4 }}><rect x={x - 36} y={y - 22} width="72" height="44" rx="10" className="offer-agent"/><text x={x} y={y + 4} textAnchor="middle" className="offer-agent-label">Agent</text></motion.g></g>;
      })}
      <rect x="193" y="231" width="154" height="68" rx="14" fill="#A3D7E2"/><text x="270" y="260" textAnchor="middle" fill="#12151a" className="offer-core-label">Client</text><text x="270" y="280" textAnchor="middle" fill="#12151a" className="offer-core-label">business</text>
    </svg>
  </div>;
}

export function BrandLayers() {
  const [back, setBack] = useState(false);
  return <div className={`offer-layer-card offer-graphic ${back ? 'is-back' : ''}`}>
    <p className="offer-eyebrow">One offer. Two layers.</p>
    <div className="offer-segment" role="group" aria-label="Explore the white-label layers"><button aria-pressed={!back} onClick={() => setBack(false)}>Your brand</button><button aria-pressed={back} onClick={() => setBack(true)}>AIify</button></div>
    <svg viewBox="0 0 460 300" role="img" aria-label={back ? 'AIify handles setup, weekly building and daily care behind your brand' : 'Your brand owns the relationship with your client'}>
      <g className="offer-layer-back"><rect x="80" y="22" width="340" height="158" rx="12"/><text x="106" y="56">AIify</text><path d="M108 86H390M108 105H340M108 124H366"/></g>
      <g className="offer-layer-front"><rect x="24" y="124" width="340" height="145" rx="12"/><text x="48" y="164">Your brand</text><path d="M157 197H246" className="offer-pulse"/><path d="m237 190 9 7-9 7" fill="none" stroke="currentColor"/><text x="48" y="203">Relationship</text><text x="263" y="203">Client</text></g>
    </svg>
    <p className="offer-graphic-note" aria-live="polite">{back ? copy.intro.points[1].body : copy.intro.points[2].body}</p>
  </div>;
}

const TASKS = ['Workflow updated', 'Dashboard refreshed', 'Instructions organized', 'Agent check complete'];
export function LiveDashboard() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!visible || reduced || paused) return;
    const timer = window.setInterval(() => setTick(t => (t + 1) % TASKS.length), 2800);
    return () => window.clearInterval(timer);
  }, [visible, reduced, paused]);
  return <div ref={ref} className="offer-dashboard offer-graphic">
    <div className="offer-dashboard-top"><span><i /> Agent workspace</span><button type="button" aria-pressed={paused} onClick={() => setPaused(p => !p)}>{paused ? 'Resume' : 'Pause'}</button></div>
    <p className="offer-eyebrow">Illustrative workflow</p>
    <h3>Work moving forward.</h3>
    <div className="offer-dashboard-bars">{['Systems', 'Workflows', 'Agent tasks'].map((label, i) => <div key={label}><span>{label}</span><div className="offer-track"><motion.div initial={false} animate={{ width: `${[66, 85, 48, 100][(tick + i) % 4]}%` }} transition={{ duration: reduced ? 0 : .8 }} /></div></div>)}</div>
    <div className="offer-task-feed" aria-label="Example agent activity">{[0, 1, 2].map((offset) => <motion.div key={`${tick}-${offset}`} initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}><span className="offer-check">✓</span><span>{TASKS[(tick + offset) % TASKS.length]}</span><small>Agent</small></motion.div>)}</div>
    <p className="offer-graphic-note">Illustration of co-management, not client results.</p>
  </div>;
}

export function WeeklyRhythm({ active }: { active: number }) {
  const reduced = useReducedMotion();
  const labels = ['30-minute session', 'Daily check-ins', 'Quarterly goals'];
  return <div className="offer-rhythm offer-graphic">
    <svg viewBox="0 0 480 300" role="img" aria-label={active === 1 ? 'At the start, a 30-minute build-with-you session every week' : active === 2 ? 'Remote check-ins every day to keep the swarm working' : 'Goals set inside the system every quarter'}>
      <circle cx="240" cy="144" r="99" className="offer-orbit"/><circle cx="240" cy="144" r="73" className="offer-orbit"/>
      <motion.path d="M240 45A99 99 0 0 1 339 144" fill="none" stroke="#7DC1D0" strokeWidth="5" strokeLinecap="round" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }}/>
      <path d="M240 86V144L273 164" fill="none" stroke="#12151a" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="240" cy="144" r="6" fill="#12151a"/>
      {['M', 'T', 'W', 'T', 'F'].map((d, i) => <g key={i}><rect x={119 + i * 50} y="245" width="42" height="34" rx="6" fill={active === 2 || i === 2 ? '#A3D7E2' : '#e8efed'}/><text x={140 + i * 50} y="267" textAnchor="middle">{d}</text></g>)}
    </svg><p className="offer-rhythm-label">{labels[active - 1]}</p>
  </div>;
}

export function TeamCredit() {
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();
  const roles = ['Operations lead', 'Team lead', 'Client team'];
  const wins = ['Their playbooks', 'Their agent setups', 'Their dashboards'];
  return <div className="offer-credit-card offer-graphic"><p className="offer-eyebrow">The credit stays with their people</p><h3>Built together.<br/>Credited to their team.</h3>
    <div className="offer-role-list" role="group" aria-label="Explore team credit">{roles.map((role, i) => <button key={role} aria-pressed={i === selected} onClick={() => setSelected(i)}><span className="offer-role-icon" aria-hidden="true">{['↗', '✳', '◇'][i]}</span>{role}<span aria-hidden="true">↗</span></button>)}</div>
    <motion.div key={selected} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="offer-win" aria-live="polite"><span>{wins[selected]}</span><strong>✓ {roles[selected]}</strong></motion.div><p className="offer-graphic-note">Illustrative team roles</p>
  </div>;
}

export function OwnershipSplit() {
  const [methods, setMethods] = useState(false);
  return <div className="offer-ownership-graphic offer-graphic"><div className="offer-segment" role="group" aria-label="Explore ownership"><button aria-pressed={!methods} onClick={() => setMethods(false)}>Your client work</button><button aria-pressed={methods} onClick={() => setMethods(true)}>AIify methods</button></div>
    <svg viewBox="0 0 460 245" role="img" aria-label={methods ? 'AIify keeps its own methods' : 'You own client-specific instructions, playbooks and agent setups'}><path d="M230 26V222" stroke="#ccd7d6" strokeDasharray="4 6"/>{[false, true].map((right) => <g key={String(right)} opacity={methods === right ? 1 : .3} className="offer-ownership-side"><rect x={right ? 269 : 39} y="58" width="150" height="122" rx="12" fill={right ? '#e0e8e5' : '#A3D7E2'}/><path d={right ? 'M302 100h84m-84 18h68m-68 18h76' : 'M72 100h84m-84 18h68m-68 18h76'} stroke="#12151a" strokeWidth="4"/><text x={right ? 344 : 114} y="213" textAnchor="middle">{right ? 'AIify' : 'Yours'}</text></g>)}</svg>
    <p className="offer-graphic-note" aria-live="polite">{methods ? 'AIify keeps its own methods.' : 'Their instructions, their playbooks, their agent setups.'}</p></div>;
}

export function FeeIllustration() {
  const [executive, setExecutive] = useState(false);
  const reduced = useReducedMotion();
  return <div className="offer-fee-illustration">
    <div className="offer-segment" role="group" aria-label="Compare fixed fulfillment fees"><button aria-pressed={!executive} onClick={() => setExecutive(false)}>Standard</button><button aria-pressed={executive} onClick={() => setExecutive(true)}>Executive</button></div>
    <div className="offer-fee-caption" aria-live="polite"><span>AIify wholesale fee</span><strong>{executive ? '$4,000 per executive per month' : '$2,000 per seat per month'}</strong></div>
    <div className="offer-fee-bar" aria-hidden="true"><motion.div initial={false} animate={{ width: executive ? '40%' : '20%' }} transition={{ duration: reduced ? 0 : .6 }} /></div>
    <p className="offer-graphic-note">{copy.economics.market}</p>
  </div>;
}
