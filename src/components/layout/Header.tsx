import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useActiveSection } from '../../hooks/useActiveSection';
import { NAV_ITEMS } from '../../data/constants';
import Container from '../ui/Container';
import Logo from '../ui/Logo';

const SECTION_IDS = ['hero', 'process', 'about', 'services', 'results', 'cta'];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = useActiveSection(SECTION_IDS);
  const location = useLocation();
  const onMarketing = location.pathname === '/';

  // Hash anchors work as-is on the marketing page; off-page they need a leading slash
  const navHref = (hash: string) => (onMarketing ? hash : `/${hash}`);
  const homeHref = onMarketing ? '#hero' : '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border-subtle)]'
          : 'bg-transparent'
      }`}
    >
      <Container className="flex items-center h-18 py-4">
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <a href={homeHref} aria-label="AIify home" className="flex items-center">
            <Logo className="h-10" />
          </a>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const sectionId = item.href.replace('#', '');
            const isActive = onMarketing && activeSection === sectionId;
            return (
              <a
                key={item.href}
                href={navHref(item.href)}
                aria-current={isActive ? 'true' : undefined}
                className={`text-sm transition-colors duration-200 ${
                  isActive
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="block h-0.5 mt-0.5 bg-[var(--color-accent)] rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right: Desktop CTA / Mobile Hamburger */}
        <div className="flex-1 flex justify-end">
          <div className="hidden md:block">
            <Link
              to="/book"
              className="inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-bg)] font-semibold px-5 py-2.5 text-sm rounded-lg"
            >
              Book a Call
            </Link>
          </div>
          <button
            className="md:hidden p-2 text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-lg"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </Container>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[var(--color-bg)]/95 backdrop-blur-xl flex flex-col"
          >
            <Container className="flex items-center justify-between h-18 py-4">
              <a
                href={homeHref}
                aria-label="AIify home"
                className="flex items-center"
                onClick={() => setMobileOpen(false)}
              >
                <Logo className="h-10" />
              </a>
              <button
                className="p-2 text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-lg"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </Container>
            <nav className="flex flex-col items-center justify-center flex-1 gap-8">
              {NAV_ITEMS.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={navHref(item.href)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-2xl font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_ITEMS.length * 0.05 }}
              >
                <Link
                  to="/book"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-bg)] font-semibold px-10 py-5 text-lg rounded-xl"
                >
                  Book a Call
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
