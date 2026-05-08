import { useState } from 'react';
import Button from './Button';

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  consent: boolean;
}

interface LeadFormProps {
  onSubmit: (data: LeadFormData) => void | Promise<void>;
  submitting?: boolean;
  className?: string;
}

const initialState: LeadFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  consent: false,
};

const inputClasses =
  'w-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-colors';

const labelClasses =
  'block text-sm font-medium text-[var(--color-text)] mb-2';

export default function LeadForm({ onSubmit, submitting = false, className = '' }: LeadFormProps) {
  const [form, setForm] = useState<LeadFormData>(initialState);

  const update = <K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSubmit(form);
      setForm(initialState);
    } catch {
      // Parent surfaces the error; keep the user's input so they can retry.
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-5 ${className}`}>
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="lead-name" className={labelClasses}>
            Name
          </label>
          <input
            id="lead-name"
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className={inputClasses}
            placeholder="Jane Doe"
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="lead-email" className={labelClasses}>
            Email
          </label>
          <input
            id="lead-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClasses}
            placeholder="jane@company.com"
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="lead-phone" className={labelClasses}>
            Phone
          </label>
          <input
            id="lead-phone"
            type="tel"
            required
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={inputClasses}
            placeholder="(555) 123-4567"
            disabled={submitting}
          />
        </div>
        <div>
          <label htmlFor="lead-company" className={labelClasses}>
            Company
          </label>
          <input
            id="lead-company"
            type="text"
            required
            autoComplete="organization"
            value={form.company}
            onChange={(e) => update('company', e.target.value)}
            className={inputClasses}
            placeholder="Acme Inc."
            disabled={submitting}
          />
        </div>
      </div>

      <label className="flex items-start gap-3 text-sm text-[var(--color-text-muted)] cursor-pointer select-none">
        <input
          type="checkbox"
          required
          checked={form.consent}
          onChange={(e) => update('consent', e.target.checked)}
          disabled={submitting}
          className="mt-1 h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-surface-2)] accent-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        />
        <span>
          You may contact me by phone or text about my inquiry. We won't spam
          you or share your info.
        </span>
      </label>

      <Button
        type="submit"
        variant="primary"
        size="sm"
        className="w-full disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={submitting}
      >
        {submitting ? 'Submitting…' : 'Submit'}
      </Button>
    </form>
  );
}
