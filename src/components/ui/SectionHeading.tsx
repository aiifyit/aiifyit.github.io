interface SectionHeadingProps {
  heading: React.ReactNode;
  subheading?: string;
  subheadingClassName?: string;
  align?: 'center' | 'left';
}

export default function SectionHeading({
  heading,
  subheading,
  subheadingClassName = '',
  align = 'center',
}: SectionHeadingProps) {
  return (
    <div className={`mb-10 md:mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
        {heading}
      </h2>
      {subheading && (
        <p
          className={`mt-6 text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl ${
            align === 'center' ? 'mx-auto' : ''
          } ${subheadingClassName}`}
        >
          {subheading}
        </p>
      )}
    </div>
  );
}
