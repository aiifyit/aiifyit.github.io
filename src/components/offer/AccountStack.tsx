import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { UserRound } from 'lucide-react';
import copy from '../../data/offerCopy.json';

export default function AccountStack() {
  const [accounts, setAccounts] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: .5 });
  const reduced = useReducedMotion();
  const added = useRef(0);
  const touched = useRef(false);
  useEffect(() => {
    if (!visible || reduced || touched.current || added.current >= 2) return;
    const timer = window.setInterval(() => {
      if (touched.current) { window.clearInterval(timer); return; }
      added.current += 1;
      setAccounts(count => Math.min(count+1,6));
      if (added.current >= 2) window.clearInterval(timer);
    }, 1300);
    return () => window.clearInterval(timer);
  }, [visible, reduced]);
  return <div ref={ref} className="offer-accounts">
    <div className="offer-account-stack" style={{ height: `${260+(accounts-1)*24}px` }}>{Array.from({ length: accounts }, (_, i) => <motion.div key={i} className="offer-glass offer-account-card" initial={reduced ? false : { opacity: 0, y: 35, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: reduced ? 0 : .45 }} style={{ top: i*24, zIndex: i, left: (accounts-1-i)*5, right: (accounts-1-i)*5 }}>
      <div className="offer-account-title"><h3>{copy.economics.accountLabel}</h3><span>0{i+1}</span></div><div className="offer-account-members">{copy.economics.accountMembers.map(member => <span key={member}><i aria-hidden="true"><UserRound size={16}/></i>{member}</span>)}</div><strong>{copy.economics.accountFee}</strong><div className="offer-account-nodes" aria-hidden="true"><span/>────────<span/>────────<span/></div>
    </motion.div>)}</div>
    <button type="button" className="offer-btn" onClick={() => { touched.current = true; setAccounts(count => count === 6 ? 1 : count+1); }}>{accounts === 6 ? 'Reset' : copy.economics.addLabel}</button>
    <p className="offer-account-total" role="status">{accounts} {accounts === 1 ? 'account' : 'accounts'} · ${(accounts*4000).toLocaleString('en-US')} / month to AIify</p>
  </div>;
}
