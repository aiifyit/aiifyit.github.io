import type { ComponentPropsWithoutRef } from 'react';

type Variant = 'primary' | 'ghost';
type Size = 'default' | 'sm' | 'lg';

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & (
  | ComponentPropsWithoutRef<'a'>
  | ComponentPropsWithoutRef<'button'>
);

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-bg)] font-semibold',
  ghost:
    'border border-[var(--color-border)] hover:border-[var(--color-text-muted)] text-[var(--color-text)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-6 py-3 text-sm rounded-lg',
  default: 'px-8 py-4 rounded-xl',
  lg: 'px-10 py-5 text-lg rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'default',
  href,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} {...(rest as ComponentPropsWithoutRef<'a'>)}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...(rest as ComponentPropsWithoutRef<'button'>)}>
      {children}
    </button>
  );
}
