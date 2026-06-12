export type BrandLogoProps = {
  text?: string;
  className?: string;
  inverted?: boolean;
};

export function BrandLogo({
  text = "SLAM.et",
  className = "",
  inverted = false,
}: BrandLogoProps) {
  const dotIndex = text.indexOf(".");
  const primaryClass = inverted ? "text-slate-900" : "text-white";
  const accentClass = inverted ? "text-red-600" : "text-cyan-400";

  if (dotIndex === -1) {
    return (
      <span className={`font-black tracking-tight ${primaryClass} ${className}`}>
        {text}
      </span>
    );
  }

  return (
    <span className={`inline-block font-black tracking-tight ${className}`}>
      <span className={primaryClass}>{text.slice(0, dotIndex)}</span>
      <span className={accentClass}>{text.slice(dotIndex)}</span>
    </span>
  );
}
