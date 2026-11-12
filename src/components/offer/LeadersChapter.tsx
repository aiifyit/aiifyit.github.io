import { useEffect, useRef, useState, type ComponentType } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { GraphicFrame, OfferHeading, Packet, QuoteButton } from './OfferMotion';
import partnerCopy from '../../data/offerCopy.json';

type Copy = typeof partnerCopy & { intro: typeof partnerCopy.intro & { cleanArtLabel?: string; cleanArtCaption?: string } };

function ComparisonArt({ clean, cleanLabel = 'A coordinated partner network', cleanCaption = 'Your AI partner' }: { clean: boolean; cleanLabel?: string; cleanCaption?: string }) {
  return <GraphicFrame className="offer-comparison-art" label={clean ? cleanLabel : 'Tangled responsibilities and accumulating costs'}>{running => <svg viewBox="0 0 480 150" aria-hidden="true">{Array.from({ length: clean ? 6 : 14 }, (_, i) => {
    const x = 30 + i * (clean ? 84 : 32);
    const path = clean ? `M${x} 30Q${x} 110 240 110` : `M${x} 20C${460-x} 160 ${x} -30 ${450-x} 125`;
    return <g key={i}><path d={path} className="offer-wire"/><Packet path={path} running={running} delay={i*.4}/><circle cx={x} cy={clean ? 30 : 20} r="4" fill="#A3D7E2"/>{!clean && <text x={x} y="145" textAnchor="middle">$</text>}</g>;
  })}{clean && <><rect x="176" y="91" width="128" height="38" rx="9" className="offer-svg-tile"/><text x="240" y="115" textAnchor="middle">{cleanCaption}</text></>}</svg>}</GraphicFrame>;
}

export default function LeadersChapter({ copy = partnerCopy, cta, Art = ComparisonArt }: { copy?: Copy; cta?: string; Art?: ComponentType<{ clean: boolean; cleanLabel?: string; cleanCaption?: string }> }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: .2 });
  const reduced = useReducedMotion();
  const played = useRef(false);
  const [selected, setSelected] = useState<'hard' | 'ours'>(reduced ? 'ours' : 'hard');
  const ours = selected === 'ours';
  useEffect(() => {
    if (!visible || reduced || played.current) return;
    const timer = window.setTimeout(() => { if (played.current) return; played.current = true; setSelected('ours'); }, 1400);
    return () => window.clearTimeout(timer);
  }, [visible, reduced]);
  return <section id="leaders" className="offer-section offer-advantage" aria-labelledby="leaders-heading"><div className="offer-wrap">
    <p className="offer-eyebrow">{copy.intro.label}</p><OfferHeading id="leaders-heading">{copy.intro.heading}</OfferHeading>
    <p className="offer-advantage-lead">{copy.intro.lead}</p><p className="offer-advantage-question">{copy.intro.question}</p>
    <div ref={ref} className="offer-comparison" data-paused={!visible || reduced}>
      <div className="offer-compare-toolbar"><h3>{copy.intro.compareLabel}</h3><div className="offer-segment" role="group" aria-label={copy.intro.compareLabel}>{(['hard','ours'] as const).map(key => <button key={key} type="button" aria-pressed={key === 'ours' ? !!ours : !ours} onClick={() => { played.current = true; setSelected(key); }}>{copy.intro[key].label}</button>)}</div></div>
      <div className="offer-comparison-grid">{(['hard','ours'] as const).map(key => <article key={key} className={`offer-glass offer-compare-card ${key === 'hard' ? 'is-complex' : 'is-clean'} ${(key === 'ours') === !!ours ? 'is-selected' : ''}`}>
        <h3>{copy.intro[key].label}</h3><p>{copy.intro[key].sub}</p><Art clean={key === 'ours'} cleanLabel={copy.intro.cleanArtLabel} cleanCaption={copy.intro.cleanArtCaption}/>
        <ul>{copy.intro[key].items.map((item,i) => <motion.li key={item} initial={reduced ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: reduced ? 0 : i*.06 }}><span className={`offer-compare-mark offer-compare-mark-${key === 'hard' ? 'no' : 'yes'}`}>{key === 'hard' ? <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.25"/><path d="M7 7l6 6M13 7l-6 6"/></svg> : <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.25"/><path d="M6.2 10.4l2.5 2.5 5.1-5.6"/></svg>}{key === 'hard' && <span className="sr-only">Don't do this</span>}</span><span>{item}</span></motion.li>)}</ul>
      </article>)}</div>
    </div><div className="offer-advantage-close"><p>{copy.intro.closing}</p><QuoteButton cta={cta} /></div>
  </div></section>;
}
