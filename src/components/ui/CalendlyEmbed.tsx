import { useEffect, useState } from 'react';
import Button from './Button';

interface CalendlyEmbedProps {
  url: string;
  className?: string;
}

function CalendarFrame({ url, onRetry }: { url: string; onRetry: () => void }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setStatus(current => current === 'loading' ? 'failed' : current);
    }, 15000);
    return () => window.clearTimeout(timeout);
  }, []);

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
        <p role="status" className="text-[var(--color-text-muted)]">
          The embedded calendar couldn’t load. Try again, or use the direct calendar link above.
        </p>
        <Button type="button" variant="ghost" onClick={onRetry}>
          Retry calendar
        </Button>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border-subtle)] bg-[var(--color-surface)]" aria-busy={status === 'loading'}>
      {status === 'loading' && (
        <div role="status" className="absolute inset-0 flex flex-col gap-4 items-center justify-center bg-[var(--color-surface)] z-10 pointer-events-none">
          <div aria-hidden="true" className="w-12 h-12 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin motion-reduce:animate-none" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading available times…</p>
        </div>
      )}
      <iframe
        title="Book a free 30-minute strategy call with AIify It"
        src={url}
        className="block w-full border-0"
        style={{ height: '720px' }}
        referrerPolicy="no-referrer"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('failed')}
      />
    </div>
  );
}

export default function CalendlyEmbed({ url, className = '' }: CalendlyEmbedProps) {
  const [attempt, setAttempt] = useState(0);
  const fullUrl = new URL(url);
  fullUrl.searchParams.set('background_color', '18181b');
  fullUrl.searchParams.set('text_color', 'fafafa');
  fullUrl.searchParams.set('primary_color', 'a3d7e2');

  return (
    <div className={className}>
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Button href={url} target="_blank" rel="noopener noreferrer" variant="primary">
          Open calendar in a new tab ↗
        </Button>
        <p className="text-sm text-[var(--color-text-muted)]">
          Choose a time below, or open Calendly directly if times don’t appear.
        </p>
        <button type="button" onClick={() => setAttempt(current => current + 1)} className="text-sm text-[var(--color-accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">
          Reload embedded calendar
        </button>
      </div>
      {/* Direct iframe embedding is supported by Calendly. Each retry or URL
          change mounts a fresh frame; React removes the old one and its timer.
          No shared script, global listeners, or inbound page UTMs are inherited. */}
      <CalendarFrame key={`${fullUrl.toString()}:${attempt}`} url={fullUrl.toString()} onRetry={() => setAttempt(current => current + 1)} />
    </div>
  );
}
