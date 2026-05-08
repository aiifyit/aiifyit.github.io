export default function BackgroundFX() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
    >
      {/* Subtle dot grid with radial fade so it doesn't reach the edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 75%)',
        }}
      />

      {/* Soft accent glow drifting down the page */}
      <div
        className="absolute left-[-10%] top-[60vh] w-[640px] h-[640px] rounded-full blur-[160px] opacity-60"
        style={{ background: 'var(--color-accent-glow)' }}
      />
      <div
        className="absolute right-[-10%] top-[140vh] w-[560px] h-[560px] rounded-full blur-[160px] opacity-50"
        style={{ background: 'var(--color-accent-glow)' }}
      />
      <div
        className="absolute left-[20%] top-[220vh] w-[600px] h-[600px] rounded-full blur-[180px] opacity-40"
        style={{ background: 'var(--color-accent-glow)' }}
      />
    </div>
  );
}
