import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  OFFER_SERVICES,
  formatDollars,
  marginView,
  type OfferService,
} from '../../data/offerEconomics.ts';

export interface QuoteCarry {
  seats: string;
  service: OfferService;
  price?: number;
}

interface OfferCalculatorProps {
  onQuote: (carry: QuoteCarry) => void;
}

const primaryButton =
  'inline-flex items-center justify-center rounded-xl bg-[var(--offer-navy)] px-7 py-3.5 text-sm font-semibold text-[#f4f1ea] transition-colors hover:bg-[var(--offer-navy-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--offer-navy)]';

function digitsOnly(value: string, max: number) {
  return value.replace(/\D/g, '').slice(0, max);
}

function useAnimatedInteger(value: number) {
  const reduced = useReducedMotion() === true;
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    if (reduced) {
      displayRef.current = value;
      return;
    }
    const start = displayRef.current;
    const delta = value - start;
    if (delta === 0) return;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / 420);
      const eased = 1 - (1 - progress) ** 3;
      const next = Math.round(start + delta * eased);
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, value]);

  return reduced ? value : display;
}

function Figure({ label, helper, value }: { label: string; helper?: string; value: number | null }) {
  const animated = useAnimatedInteger(value ?? 0);
  return (
    <div>
      <p className="text-sm leading-snug text-[var(--offer-muted)]">{label}</p>
      <p className="offer-numeral mt-3 text-4xl font-semibold tabular-nums tracking-tight">
        {value === null ? '—' : formatDollars(animated)}
      </p>
      {helper ? <p className="mt-3 text-sm leading-relaxed text-[var(--offer-muted)]">{helper}</p> : null}
    </div>
  );
}

export default function OfferCalculator({ onQuote }: OfferCalculatorProps) {
  const [seats, setSeats] = useState('10');
  const [price, setPrice] = useState('10000');
  const [service, setService] = useState<OfferService>('executive');
  const view = marginView({ seats, price, service });

  return (
    <div className="mt-14 rounded-2xl border border-[var(--offer-line)] bg-[var(--offer-card)] p-6 shadow-[0_24px_70px_-48px_rgba(28,25,21,0.55)] md:p-10">
      <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">Estimate your partner margin</h3>
      <p className="mt-4 max-w-2xl leading-relaxed text-[var(--offer-muted)]">
        Enter your numbers. All results are estimates based on our fulfillment fees and the price you set. They don't include your own sales, delivery, or overhead costs.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <label htmlFor="offer-seats" className="block text-sm font-semibold">Seats you could enroll</label>
          <p id="offer-seats-help" className="mt-1 text-sm leading-relaxed text-[var(--offer-muted)]">
            The number of people (or executives) you think you could bring into the program.
          </p>
          <input
            id="offer-seats"
            inputMode="numeric"
            autoComplete="off"
            value={seats}
            aria-describedby="offer-seats-help"
            onChange={(event) => setSeats(digitsOnly(event.target.value, 6))}
            className="mt-3 w-full rounded-xl border border-[var(--offer-line)] bg-white px-4 py-3 text-[var(--offer-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--offer-navy)]"
          />
        </div>
        <div>
          <label htmlFor="offer-price" className="block text-sm font-semibold">Your monthly price per seat</label>
          <p id="offer-price-help" className="mt-1 text-sm leading-relaxed text-[var(--offer-muted)]">
            What you would charge your client for each seat per month.
          </p>
          <div className="mt-3 flex items-center rounded-xl border border-[var(--offer-line)] bg-white focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--offer-navy)]">
            <span className="pl-4 text-[var(--offer-muted)]" aria-hidden="true">$</span>
            <input
              id="offer-price"
              inputMode="numeric"
              autoComplete="off"
              value={price}
              aria-describedby="offer-price-help"
              onChange={(event) => setPrice(digitsOnly(event.target.value, 8))}
              className="w-full bg-transparent px-3 py-3 text-[var(--offer-ink)] focus-visible:outline-none"
            />
          </div>
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold">Service type</legend>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {(Object.entries(OFFER_SERVICES) as [OfferService, (typeof OFFER_SERVICES)[OfferService]][]).map(([id, option]) => (
            <label
              key={id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors hover:border-[var(--offer-navy)] ${
                service === id ? 'border-[var(--offer-navy)] bg-[#f7f4ee]' : 'border-[var(--offer-line)] bg-white'
              }`}
            >
              <input
                type="radio"
                name="offer-service"
                value={id}
                checked={service === id}
                onChange={() => setService(id)}
                className="mt-1 accent-[var(--offer-navy)]"
              />
              <span className="text-sm leading-relaxed">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-10 border-t border-[var(--offer-line)] pt-8" aria-live="polite">
        <div className="grid gap-8 md:grid-cols-3">
          <Figure label="Estimated monthly amount due to AIify" value={view.incomplete ? null : view.monthlyDue} />
          {view.showNoSpread ? (
            <p role="status" className="max-w-xl text-base leading-relaxed md:col-span-2">
              At this price there is no spread. Your price per seat needs to be above the fulfillment fee for this offer to make you a profit.
            </p>
          ) : (
            <>
              <Figure
                label="Estimated monthly gross profit"
                helper="(Your price − AIify fulfillment fee) × seats"
                value={view.showProfit ? view.monthlyProfit : null}
              />
              <Figure
                label="Estimated annualized gross profit"
                helper="Monthly gross profit × 12"
                value={view.showProfit ? view.annualProfit : null}
              />
            </>
          )}
        </div>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-[var(--offer-muted)]">
        These are estimates, not projections of sales or client results. Your final terms come with your quote.
      </p>
      <button
        type="button"
        className={`${primaryButton} mt-6`}
        onClick={() => onQuote({
          seats,
          service,
          price: price.trim() === '' ? undefined : Number(price),
        })}
      >
        Get a quote
      </button>
    </div>
  );
}
