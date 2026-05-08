import { useRef, useEffect, useState } from 'react';
import Button from './Button';

interface CalendlyEmbedProps {
  url: string;
  className?: string;
}

export default function CalendlyEmbed({ url, className = '' }: CalendlyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const separator = url.includes('?') ? '&' : '?';
  const fullUrl = `${url}${separator}background_color=18181b&text_color=fafafa&primary_color=a3d7e2`;

  useEffect(() => {
    if (initializedRef.current) return;

    const tryInit = () => {
      if (window.Calendly && containerRef.current) {
        window.Calendly.initInlineWidget({
          url: fullUrl,
          parentElement: containerRef.current,
        });
        initializedRef.current = true;
        setLoading(false);
        return true;
      }
      return false;
    };

    if (tryInit()) return;

    const interval = setInterval(() => {
      if (tryInit()) clearInterval(interval);
    }, 200);

    const failTimeout = setTimeout(() => {
      clearInterval(interval);
      if (!initializedRef.current) {
        setFailed(true);
        setLoading(false);
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(failTimeout);
      initializedRef.current = false;
    };
  }, [fullUrl]);

  if (failed) {
    return (
      <div className={`flex flex-col items-center gap-4 py-16 ${className}`}>
        <Button href={url} target="_blank" rel="noopener noreferrer" variant="primary" size="lg">
          Book Your Free Strategy Call →
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)] rounded-2xl z-10">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
        </div>
      )}
      <div
        ref={containerRef}
        className="rounded-2xl overflow-hidden border border-[var(--color-border-subtle)] bg-[var(--color-surface)]"
        style={{ minWidth: '320px', height: '720px' }}
      />
    </div>
  );
}
