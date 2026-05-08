interface GradientTextProps {
  children: React.ReactNode;
}

export default function GradientText({ children }: GradientTextProps) {
  return (
    <span className="bg-gradient-to-r from-[#A3D7E2] to-[#7DC1D0] bg-clip-text text-transparent">
      {children}
    </span>
  );
}
