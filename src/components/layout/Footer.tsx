import { useLocation } from 'react-router-dom';
import Container from '../ui/Container';
import Logo from '../ui/Logo';
import { NAV_ITEMS } from '../../data/constants';

export default function Footer() {
  const location = useLocation();
  const onMarketing = location.pathname === '/';
  const navHref = (hash: string) => (onMarketing ? hash : `/${hash}`);

  return (
    <footer className="relative bg-[var(--color-bg)] border-t border-[var(--color-border-subtle)] py-12">
      <Container className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Logo + Copyright */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Logo className="h-8" />
          <p className="text-sm text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} AIify It. All rights reserved.
          </p>
        </div>

        {/* Right: Nav Links */}
        <nav className="flex flex-wrap items-center justify-center gap-6" aria-label="Footer navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={navHref(item.href)}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
