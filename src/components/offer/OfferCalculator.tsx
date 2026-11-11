import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  OFFER_SERVICES,
  formatDollars,
  marginView,
  type OfferService,
} from '../../data/offerEconomics.ts';
import copy from '../../data/offerCopy.json';

export interface QuoteCarry {
  seats: string;
  service: OfferService;
  price?: number;
}

interface OfferCalculatorProps {
  service: OfferService;
  onService: (service: OfferService) => void;
  onQuote: (carry: QuoteCarry) => void;
}

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

function Figure({ label, helper, value, emphasis = false }: { label: string; helper?: string; value: number | null; emphasis?: boolean }) {
  const animated = useAnimatedInteger(value ?? 0);
  return (
    <div>
      <p className="text-sm leading-snug text-[var(--offer-muted)]">{label}</p>
      <p className={`offer-numeral mt-3 font-semibold tabular-nums tracking-tight ${emphasis ? 'text-5xl md:text-6xl' : 'text-3xl md:text-4xl'}`}>
        {value === null ? '—' : formatDollars(animated)}
      </p>
      {helper ? <p className="mt-3 text-sm leading-relaxed text-[var(--offer-muted)]">{helper}</p> : null}
    </div>
  );
}

function SpreadBar({ incomplete, showProfit, showNoSpread, monthlyDue, monthlyProfit }: {
  incomplete: boolean;
  showProfit: boolean;
  showNoSpread: boolean;
  monthlyDue: number;
  monthlyProfit: number;
}) {
  const total = monthlyDue + monthlyProfit;
  const dueShare = showProfit && total > 0 ? (monthlyDue / total) * 100 : showNoSpread ? 100 : 0;
  return (
    <div className="mt-8" aria-hidden="true">
      <div className="flex h-2 overflow-hidden rounded-full bg-[var(--offer-line)]">
        <div
          className={`h-full transition-[width] duration-500 ease-out ${showNoSpread ? 'bg-[var(--offer-ink)]/25' : 'bg-[var(--offer-navy)]'}`}
          style={{ width: incomplete ? '0%' : `${dueShare}%` }}
        />
        {showProfit ? <div className="h-full flex-1 bg-[var(--offer-brass)]" /> : null}
      </div>
      {showProfit ? (
        <div className="mt-3 flex justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--offer-muted)]">
          <span className="inline-flex items-center gap-2"><i className="h-2 w-2 bg-[var(--offer-navy)]" />Due to AIify</span>
          <span className="inline-flex items-center gap-2"><i className="h-2 w-2 bg-[var(--offer-brass)]" />Gross profit</span>
        </div>
      ) : null}
    </div>
  );
}

export default function OfferCalculator({ service, onService, onQuote }: OfferCalculatorProps) {
  const [seats, setSeats] = useState('10');
  const [price, setPrice] = useState('10000');
  const view = marginView({ seats, price, service });
  const shown = seats.trim() === '' || !Number.isFinite(Number(seats)) ? 0 : Math.max(0, Math.floor(Number(seats)));
  const slots = Math.min(18, Math.max(shown, 12));
  const priceNumber = Number(price);
  const sliderValue = Number.isFinite(priceNumber) ? Math.min(30000, Math.max(0, priceNumber)) : 0;

  const bump = (delta: number) => {
    const current = seats.trim() === '' ? 0 : Number(seats);
    if (!Number.isFinite(current)) return;
    setSeats(String(Math.min(999999, Math.max(0, Math.floor(current) + delta))));
  };

  return (
    <div className="offer-panel offer-calculator mt-12 bg-[var(--offer-card)] p-6 md:p-10">
      <h3 className="text-2xl font-semibold tracking-tight md:text-3xl md:text-4xl">{copy.calculator.heading}</h3>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-2">
        <div>
          <label htmlFor="offer-seats" className="block text-sm font-semibold">{copy.calculator.seats}</label>
          <p id="offer-seats-help" className="mt-1 text-sm leading-relaxed text-[var(--offer-muted)]">
            {copy.calculator.seatsHelp}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button type="button" className="offer-step" aria-label="Fewer seats" onClick={() => bump(-1)}>−</button>
            <input
              id="offer-seats"
              inputMode="numeric"
              autoComplete="off"
              value={seats}
              aria-describedby="offer-seats-help"
              onChange={(event) => setSeats(digitsOnly(event.target.value, 6))}
              className="w-full border border-[var(--offer-line)] bg-white px-4 py-3 text-[var(--offer-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--offer-navy)]"
            />
            <button type="button" className="offer-step" aria-label="More seats" onClick={() => bump(1)}>+</button>
          </div>
          {shown <= 18 ? (
            <div aria-hidden="true" className="mt-4 flex flex-wrap gap-1.5">
              {Array.from({ length: slots }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  tabIndex={-1}
                  onClick={() => setSeats(String(index + 1))}
                  className={`h-3.5 w-3.5 transition-colors ${index < shown ? 'bg-[var(--offer-navy)]' : 'bg-[var(--offer-line)] hover:bg-[var(--offer-brass)]'}`}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor="offer-price" className="block text-sm font-semibold">{copy.calculator.price}</label>
          <p id="offer-price-help" className="mt-1 text-sm leading-relaxed text-[var(--offer-muted)]">
            {copy.calculator.priceHelp}
          </p>
          <div className="mt-3 flex items-center border border-[var(--offer-line)] bg-white focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--offer-navy)]">
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
          <input
            type="range"
            className="offer-scrub offer-scrub-ink mt-4"
            min={0}
            max={30000}
            step={100}
            value={sliderValue}
            aria-label="Adjust your monthly price per seat"
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold">{copy.calculator.coverage}</legend>
        <p className="mt-1 text-sm leading-relaxed text-[var(--offer-muted)]">{copy.calculator.coverageHelp}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {(Object.entries(OFFER_SERVICES) as [OfferService, (typeof OFFER_SERVICES)[OfferService]][]).map(([id, option]) => (
            <label
              key={id}
              className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors hover:border-[var(--offer-navy)] ${
                service === id ? 'border-[var(--offer-navy)] bg-[#f4ecdf] shadow-[inset_0_2px_0_var(--offer-brass)]' : 'border-[var(--offer-line)] bg-white'
              }`}
            >
              <input
                type="radio"
                name="offer-service"
                value={id}
                checked={service === id}
                onChange={() => onService(id)}
                className="mt-1 accent-[var(--offer-navy)]"
              />
              <span className="text-sm leading-relaxed">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-10 bg-[#f6efe4] p-6 md:p-8" aria-live="polite">
        <div className="grid gap-8 md:grid-cols-3">
          <Figure label={copy.calculator.due} value={view.incomplete ? null : view.monthlyDue} />
          {view.showNoSpread ? (
            <p role="status" className="max-w-xl border-l-2 border-[var(--offer-brass)] pl-4 text-base leading-relaxed md:col-span-2">
              {copy.calculator.noSpread}
            </p>
          ) : (
            <>
              <Figure
                label={copy.calculator.monthly}
                helper="(Your price − AIify fulfillment fee) × seats"
                value={view.showProfit ? view.monthlyProfit : null}
                emphasis
              />
              <Figure
                label={copy.calculator.annual}
                helper="Monthly gross profit × 12"
                value={view.showProfit ? view.annualProfit : null}
              />
            </>
          )}
        </div>
        <SpreadBar
          incomplete={view.incomplete}
          showProfit={view.showProfit}
          showNoSpread={view.showNoSpread}
          monthlyDue={view.monthlyDue}
          monthlyProfit={view.monthlyProfit}
        />
      </div>

      <p className="mt-8 text-sm leading-relaxed text-[var(--offer-muted)]">
        {copy.calculator.footnote}
      </p>
      <button
        type="button"
        className="offer-btn mt-6"
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
