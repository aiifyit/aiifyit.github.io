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

      {/* Two soft accent glows — kept small blur for GPU perf */}
      <div
        className="absolute left-[-10%] top-[60vh] w-[480px] h-[480px] rounded-full opacity-50"
        style={{
          background: 'var(--color-accent-glow)',
          filter: 'blur(100px)',
        }}
      />
      <div
        className="absolute right-[-10%] top-[160vh] w-[480px] h-[480px] rounded-full opacity-40"
        style={{
          background: 'var(--color-accent-glow)',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
}
