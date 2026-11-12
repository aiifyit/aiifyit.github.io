import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { UserRound } from 'lucide-react';
import { GraphicFrame } from '../offer/OfferMotion';
import partnerCopy from '../../data/offerCopy.json';

type Copy = typeof partnerCopy & {
  economics: {
    additionalAccountFee?: string;
    additionalAccountFeeAmount?: number;
  };
};

function OrbitDot({ path, running, delay = 0, duration = 10, r = 3.5 }: { path: string; running: boolean; delay?: number; duration?: number; r?: number }) {
  return running ? <circle r={r} fill="#A3D7E2" className="offer-data-dot"><animateMotion path={path} dur={`${duration}s`} begin={`${-delay}s`} repeatCount="indefinite" /></circle> : null;
}

export function HomeSwarm() {
  const rings = [
    { rx: 118, ry: 52, dur: 18, nodes: 4, delay: 0 },
    { rx: 168, ry: 86, dur: 26, nodes: 5, delay: 2 },
    { rx: 218, ry: 124, dur: 34, nodes: 6, delay: 4 },
  ];
  const cx = 280, cy = 248;
  return (
    <GraphicFrame className="offer-swarm home-swarm" label="A swarm of AI agents orbiting your business">
      {running => (
        <svg viewBox="0 0 560 480" aria-hidden="true">
          <defs>
            <radialGradient id="home-swarm-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A3D7E2" stopOpacity="0.28" />
              <stop offset="70%" stopColor="#A3D7E2" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#A3D7E2" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx={cx} cy={cy} rx="250" ry="160" fill="url(#home-swarm-glow)" />
          {rings.map((ring, ri) => {
            const path = `M${cx - ring.rx} ${cy}A${ring.rx} ${ring.ry} 0 1 1 ${cx + ring.rx} ${cy}A${ring.rx} ${ring.ry} 0 1 1 ${cx - ring.rx} ${cy}`;
            return (
              <g key={ri}>
                <ellipse cx={cx} cy={cy} rx={ring.rx} ry={ring.ry} className={`home-orbit-ring home-orbit-ring-${ri}`} fill="none" />
                {Array.from({ length: ring.nodes }, (_, i) => {
                  const a = (i / ring.nodes) * Math.PI * 2 - Math.PI / 2;
                  const x = cx + Math.cos(a) * ring.rx;
                  const y = cy + Math.sin(a) * ring.ry;
                  return (
                    <g key={i} className="home-node-pulse" style={{ animationDelay: `${-i * 0.8 - ri}s` }}>
                      <circle cx={x} cy={y} r="11" fill="#0d171df2" stroke="#A3D7E2" strokeWidth="1.4" />
                      <circle cx={x} cy={y} r="3.2" fill="#A3D7E2" />
                    </g>
                  );
                })}
                <OrbitDot path={path} running={running} delay={ring.delay} duration={ring.dur} />
                <OrbitDot path={path} running={running} delay={ring.delay + ring.dur / 2} duration={ring.dur} r={2.5} />
              </g>
            );
          })}
          <rect x={cx - 78} y={cy - 34} width="156" height="68" rx="16" fill="#A3D7E2" />
          <text x={cx} y={cy - 4} textAnchor="middle" className="offer-dark-text">Your</text>
          <text x={cx} y={cy + 16} textAnchor="middle" className="offer-dark-text">business</text>
        </svg>
      )}
    </GraphicFrame>
  );
}

export function HomeStepGraphic({ step }: { step: number; variant?: 'partner' | 'direct' }) {
  const labels = [
    'We start with your goals.',
    'Agents assemble around your business.',
    'Weekly build sessions with you.',
    'Agents aim at your goals.',
    'We keep the swarm current.',
  ];
  return (
    <GraphicFrame className="offer-step-art home-step-art" label={labels[step]}>
      {running => (
        <svg viewBox="0 0 520 380" aria-hidden="true">
          <text x="28" y="35" className="offer-svg-kicker">You × AIify</text>
          {step === 0 && <GoalsScene running={running} />}
          {step === 1 && <AssembleScene running={running} />}
          {step === 2 && <WeeklyScene running={running} />}
          {step === 3 && <AimScene running={running} />}
          {step === 4 && <CurrentScene running={running} />}
        </svg>
      )}
    </GraphicFrame>
  );
}

function GoalsScene({ running }: { running: boolean }) {
  const chips = [
    { x: 86, y: 124, label: 'Goal' },
    { x: 214, y: 124, label: 'Goal' },
    { x: 150, y: 188, label: 'Goal' },
  ];
  return (
    <g>
      <rect x="64" y="72" width="240" height="188" rx="18" className="offer-svg-tile" />
      <text x="184" y="104" textAnchor="middle">Your goals</text>
      {chips.map((chip, i) => (
        <g key={i} className="home-chip-in" style={{ animationDelay: running ? `${i * 0.35}s` : '0s' }}>
          <rect x={chip.x} y={chip.y} width="100" height="40" rx="20" fill="#A3D7E2" />
          <text x={chip.x + 50} y={chip.y + 26} textAnchor="middle" className="offer-dark-text">{chip.label}</text>
        </g>
      ))}
      <rect x="344" y="118" width="132" height="96" rx="16" className="offer-svg-tile" />
      <text x="410" y="154" textAnchor="middle">You</text>
      <text x="410" y="178" textAnchor="middle">+ AIify</text>
      <path d="M304 166H344" className="offer-wire" />
      <OrbitDot path="M304 166H344" running={running} duration={3} />
      <text x="260" y="330" textAnchor="middle">We start with your goals</text>
    </g>
  );
}

function AssembleScene({ running }: { running: boolean }) {
  const cx = 260, cy = 200;
  const nodes = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * 132, y: cy + Math.sin(a) * 100 };
  });
  return (
    <g>
      {nodes.map((n, i) => {
        const path = `M${n.x} ${n.y}L${cx} ${cy}`;
        return (
          <g key={i}>
            <path d={path} className="offer-wire" />
            <OrbitDot path={path} running={running} delay={i * 0.6} duration={5} />
            <g className="home-assemble" style={{ animationDelay: `${-i * 0.45}s` }}>
              <circle cx={n.x} cy={n.y} r="16" fill="#0d171df2" stroke="#A3D7E2" strokeWidth="1.4" />
              <circle cx={n.x} cy={n.y} r="4" fill="#A3D7E2" />
            </g>
          </g>
        );
      })}
      <rect x={cx - 70} y={cy - 28} width="140" height="56" rx="14" fill="#A3D7E2" />
      <text x={cx} y={cy + 6} textAnchor="middle" className="offer-dark-text">Your business</text>
      <text x="260" y="350" textAnchor="middle">Agents assemble around you</text>
    </g>
  );
}

function WeeklyScene({ running }: { running: boolean }) {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  return (
    <g>
      <path d="M70 200H450" className="offer-wire" />
      {weeks.map((label, i) => {
        const x = 86 + i * 108;
        return (
          <g key={label}>
            <g className="home-week-beat" style={{ animationDelay: `${-i * 1.1}s` }}>
              <rect x={x} y="148" width="88" height="104" rx="14" className="offer-svg-tile" />
              <circle cx={x + 44} cy="186" r="14" fill="none" stroke="#A3D7E2" strokeWidth="2" className="home-week-ring" />
              <circle cx={x + 44} cy="186" r="5" fill="#A3D7E2" />
              <text x={x + 44} y="228" textAnchor="middle">{label}</text>
            </g>
            {i < weeks.length - 1 && <OrbitDot path={`M${x + 88} 200H${x + 108}`} running={running} delay={i} duration={4} />}
          </g>
        );
      })}
      <text x="260" y="330" textAnchor="middle">We build with you every week</text>
    </g>
  );
}

function AimScene({ running }: { running: boolean }) {
  const beams = [
    { x: 86, y: 250, label: 'Agent' },
    { x: 86, y: 170, label: 'Agent' },
    { x: 86, y: 90, label: 'Agent' },
  ];
  const target = { x: 360, y: 180 };
  return (
    <g>
      <circle cx={target.x} cy={target.y} r="86" className="home-target-ring" fill="none" />
      <circle cx={target.x} cy={target.y} r="56" className="home-target-ring" fill="none" style={{ animationDelay: '-1.2s' }} />
      <circle cx={target.x} cy={target.y} r="28" fill="#A3D7E2" className="home-node-pulse" />
      <text x={target.x} y={target.y + 5} textAnchor="middle" className="offer-dark-text">Goals</text>
      {beams.map((b, i) => {
        const path = `M${b.x + 70} ${b.y + 20}L${target.x - 30} ${target.y}`;
        return (
          <g key={i}>
            <rect x={b.x} y={b.y} width="70" height="40" rx="10" className="offer-svg-tile" />
            <text x={b.x + 35} y={b.y + 26} textAnchor="middle">{b.label}</text>
            <path d={path} className="offer-wire home-aim-beam" />
            <OrbitDot path={path} running={running} delay={i * 0.7} duration={3.2} />
          </g>
        );
      })}
      <text x="260" y="350" textAnchor="middle">We aim the agents at your goals</text>
    </g>
  );
}

function CurrentScene({ running }: { running: boolean }) {
  const nodes = [
    { x: 120, y: 150 }, { x: 230, y: 110 }, { x: 340, y: 130 },
    { x: 160, y: 250 }, { x: 280, y: 230 }, { x: 390, y: 240 },
  ];
  const sweep = 'M80 190C160 80 280 300 440 160';
  return (
    <g>
      {nodes.map((n, i) => (
        <g key={i} className="home-refresh" style={{ animationDelay: `${-i * 0.7}s` }}>
          <circle cx={n.x} cy={n.y} r="18" fill="#0d171df2" stroke="#A3D7E2" strokeWidth="1.4" />
          <circle cx={n.x} cy={n.y} r="4.5" fill="#A3D7E2" />
        </g>
      ))}
      <path d={sweep} className="home-sweep-path" fill="none" />
      <OrbitDot path={sweep} running={running} duration={6} r={5} />
      <rect x="170" y="300" width="180" height="40" rx="20" fill="#A3D7E2" />
      <text x="260" y="326" textAnchor="middle" className="offer-dark-text">We keep it current</text>
    </g>
  );
}

export function HomeComparisonArt({ clean, cleanLabel = 'A coordinated swarm built and run with you', cleanCaption = 'Your AI swarm' }: { clean: boolean; cleanLabel?: string; cleanCaption?: string }) {
  return (
    <GraphicFrame className="offer-comparison-art" label={clean ? cleanLabel : 'A growing in-house load of hiring, training, and cost'}>
      {running => (
        <svg viewBox="0 0 480 150" aria-hidden="true">
          {clean ? (
            <g>
              {['Build', 'Aim', 'Own'].map((label, i) => {
                const x = 46 + i * 118;
                return (
                  <g key={label} className="home-step-stone" style={{ animationDelay: running ? `${i * 0.35}s` : '0s' }}>
                    <rect x={x} y="36" width="100" height="50" rx="14" fill="#A3D7E2" />
                    <text x={x + 50} y="68" textAnchor="middle" className="offer-dark-text">{label}</text>
                    {i < 2 && <path d={`M${x + 104} 61H${x + 118}`} className="offer-wire" />}
                  </g>
                );
              })}
              <rect x="176" y="102" width="128" height="36" rx="9" className="offer-svg-tile" />
              <text x="240" y="125" textAnchor="middle">{cleanCaption}</text>
            </g>
          ) : (
            <g>
              {['Hire', 'Train', 'Tools', 'Payroll'].map((label, i) => {
                const x = 28 + i * 118;
                const h = 36 + i * 10;
                return (
                  <g key={label} className="home-cost-stack" style={{ animationDelay: `${-i * 0.4}s` }}>
                    <rect x={x} y={110 - h} width="96" height={h} rx="10" className="offer-svg-tile" />
                    <text x={x + 48} y={110 - h + 22} textAnchor="middle">{label}</text>
                    <text x={x + 48} y="138" textAnchor="middle">$</text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      )}
    </GraphicFrame>
  );
}

export function HomeProofGraphic() {
  const tasks = ['Brief ready', 'Follow-up sent', 'Plan updated'];
  return (
    <GraphicFrame className="offer-legacy home-proof" label="Illustration: an executive and their chief of staff working with a shared AI swarm">
      {running => (
        <svg viewBox="0 0 520 390" aria-hidden="true">
          <text x="28" y="34">Illustration</text>
          <circle cx="260" cy="108" r="36" fill="#A3D7E2" className="home-node-pulse" />
          <text x="260" y="113" textAnchor="middle" className="offer-dark-text">Swarm</text>
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const x = 260 + Math.cos(a) * 62;
            const y = 108 + Math.sin(a) * 38;
            return <circle key={i} cx={x} cy={y} r="6" fill="#A3D7E2" className="home-node-pulse" style={{ animationDelay: `${-i}s` }} />;
          })}
          <rect x="28" y="186" width="214" height="150" rx="16" className="offer-svg-tile" />
          <text x="135" y="218" textAnchor="middle">Executive</text>
          <rect x="278" y="186" width="214" height="150" rx="16" className="offer-svg-tile" />
          <text x="385" y="218" textAnchor="middle">Chief of staff</text>
          {tasks.map((task, i) => {
            const y = 244 + i * 26;
            const left = `M260 144C260 144 200 ${y} 150 ${y}`;
            const right = `M260 144C260 144 320 ${y} 370 ${y}`;
            return (
              <g key={task}>
                <path d={left} className="offer-wire" />
                <path d={right} className="offer-wire" />
                <OrbitDot path={left} running={running} delay={i * 1.1} duration={5} />
                <OrbitDot path={right} running={running} delay={i * 1.1 + 0.5} duration={5} />
                <text x="86" y={y + 5}>{task}</text>
                <text x="336" y={y + 5}>{task}</text>
              </g>
            );
          })}
          <text x="28" y="368" className="offer-svg-kicker">One account, at work</text>
        </svg>
      )}
    </GraphicFrame>
  );
}

export function HomeOwnership({ variant: _unusedVariant }: { variant?: 'partner' | 'direct' } = {}) {
  void _unusedVariant;
  const reduced = useReducedMotion();
  const items = [
    { label: 'Your swarms', x: 190, y: 36 },
    { label: 'Your data', x: 28, y: 150 },
    { label: 'Your work', x: 352, y: 150 },
    { label: 'Your playbooks', x: 70, y: 292 },
    { label: 'Your setups', x: 300, y: 292 },
  ];
  return (
    <div>
      <GraphicFrame className="offer-vault home-ownership" label="Your swarms, data, work, playbooks, and setups held around you">
        {running => (
          <svg viewBox="0 0 500 400" aria-hidden="true">
            <circle cx="250" cy="200" r="118" className="home-orbit-ring home-orbit-ring-0" fill="none" />
            <circle cx="250" cy="200" r="54" fill="#A3D7E2" />
            <text x="250" y="206" textAnchor="middle" className="offer-dark-text">Yours</text>
            {items.map((item, i) => (
              <motion.g
                key={item.label}
                initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.86 }}
                animate={running || reduced ? { opacity: 1, scale: 1 } : undefined}
                transition={{ delay: reduced ? 0 : i * 0.16, duration: 0.4 }}
              >
                <rect x={item.x} y={item.y} width="140" height="44" rx="12" className="offer-svg-tile" />
                <text x={item.x + 70} y={item.y + 28} textAnchor="middle">{item.label}</text>
              </motion.g>
            ))}
          </svg>
        )}
      </GraphicFrame>
      <p className="offer-methods-chip">AIify keeps its own methods</p>
    </div>
  );
}

export function HomeQuoteAmbient() {
  const paths = [
    'M40 80C120 20 200 20 260 80C320 140 400 140 480 80',
    'M40 80C120 140 200 140 260 80C320 20 400 20 480 80',
    'M40 80H480',
  ];
  return (
    <GraphicFrame className="offer-quote-ambient home-quote-ambient" label="Connected agents ready to support your work">
      {running => (
        <svg viewBox="0 0 520 160" aria-hidden="true">
          {paths.map((path, i) => (
            <g key={i}>
              <path d={path} className="offer-wire" fill="none" />
              <OrbitDot path={path} running={running} delay={i * 1.2} duration={7} />
            </g>
          ))}
          <circle cx="40" cy="80" r="8" fill="#A3D7E2" />
          <circle cx="260" cy="80" r="14" fill="#A3D7E2" className="home-node-pulse" />
          <circle cx="480" cy="80" r="8" fill="#A3D7E2" />
        </svg>
      )}
    </GraphicFrame>
  );
}

export function HomeAccountStack({ copy = partnerCopy }: { copy?: Copy }) {
  const firstAccountFee = copy.economics.accountFeeAmount;
  const additionalAccountFee = copy.economics.additionalAccountFeeAmount ?? firstAccountFee;
  const [accounts, setAccounts] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.5 });
  const reduced = useReducedMotion();
  const added = useRef(0);
  const touched = useRef(false);
  useEffect(() => {
    if (!visible || reduced || touched.current || added.current >= 2) return;
    const timer = window.setInterval(() => {
      if (touched.current) { window.clearInterval(timer); return; }
      added.current += 1;
      setAccounts(count => Math.min(count + 1, 6));
      if (added.current >= 2) window.clearInterval(timer);
    }, 1300);
    return () => window.clearInterval(timer);
  }, [visible, reduced]);
  return (
    <div ref={ref} className="offer-accounts home-accounts">
      <div className="home-account-rail" aria-hidden="true" />
      <div className="home-account-ledger">
        {Array.from({ length: accounts }, (_, i) => (
          <motion.div
            key={i}
            className="offer-glass home-account-row"
            initial={reduced ? false : { opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduced ? 0 : 0.4 }}
          >
            <div className="offer-account-title">
              <h3>{copy.economics.accountLabel}</h3>
              <span>0{i + 1}</span>
            </div>
            <div className="offer-account-members">
              {copy.economics.accountMembers.map(member => (
                <span key={member}><i aria-hidden="true"><UserRound size={16} /></i>{member}</span>
              ))}
            </div>
            <strong>{i === 0 ? copy.economics.accountFee : (copy.economics.additionalAccountFee ?? copy.economics.accountFee)}</strong>
          </motion.div>
        ))}
      </div>
      <button
        type="button"
        className="offer-btn"
        onClick={() => { touched.current = true; setAccounts(count => count === 6 ? 1 : count + 1); }}
      >
        {accounts === 6 ? 'Reset' : copy.economics.addLabel}
      </button>
      <p className="offer-account-total" role="status">
        {accounts} {accounts === 1 ? 'account' : 'accounts'} · ${(firstAccountFee + (accounts - 1) * additionalAccountFee).toLocaleString('en-US')} / month to AIify
      </p>
    </div>
  );
}

