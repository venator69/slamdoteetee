type BackgroundFeatherProps = {
  className?: string;
};

export function BackgroundFeather({ className = "" }: BackgroundFeatherProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[2] ${className}`}
      aria-hidden
    >
      <div className="bg-feather-top absolute inset-x-0 top-0" />
      <div className="bg-feather-bottom absolute inset-x-0 bottom-0" />
    </div>
  );
}
