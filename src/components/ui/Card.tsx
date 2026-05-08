interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export default function Card({ className = '', children }: CardProps) {
  return (
    <div
      className={`bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-8 transition-all duration-200 hover:border-[var(--color-border)] hover:scale-[1.02] ${className}`}
    >
      {children}
    </div>
  );
}
