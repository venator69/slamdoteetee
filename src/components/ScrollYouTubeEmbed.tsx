import { useEffect, useRef, useState } from "react";

type ScrollYouTubeEmbedProps = {
  videoId: string;
  title: string;
  className?: string;
};

export function ScrollYouTubeEmbed({
  videoId,
  title,
  className = "",
}: ScrollYouTubeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const src = visible
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1&enablejsapi=1`
    : undefined;

  return (
    <div ref={containerRef} className={`aspect-video w-full bg-slate-900 ${className}`}>
      {src ? (
        <iframe
          className="h-full w-full"
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : null}
    </div>
  );
}
