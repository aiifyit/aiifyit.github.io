import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = 'modal-title';

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    closeBtnRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-bg)]/80 backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              {title ? (
                <h3
                  id={titleId}
                  className="text-xl font-semibold text-[var(--color-text)]"
                >
                  {title}
                </h3>
              ) : (
                <span />
              )}
              <button
                ref={closeBtnRef}
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
