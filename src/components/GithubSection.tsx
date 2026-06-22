import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BackgroundFeather } from "./BackgroundFeather";
import { media } from "../config/media";
import { siteLinks } from "../config/site";

const ttNormsBoldStyle: CSSProperties = {
  fontFamily: '"TT Norms", system-ui, sans-serif',
  fontWeight: 700,
};

export function GithubSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="github"
      className="relative scroll-mt-20 overflow-hidden py-32 md:py-40"
    >
      <div
        className="section-bg-media absolute inset-0 bg-cover bg-center invert"
        style={{ backgroundImage: `url(${media.howItWorksBackground})` }}
      />
      <div className="absolute inset-0 bg-slate-950/85" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/70 to-slate-950" />
      <BackgroundFeather />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2
          className={`text-4xl tracking-tight text-white transition-all duration-700 ease-out md:text-5xl ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          style={ttNormsBoldStyle}
        >
          GitHub
          <span
            aria-hidden
            className={`mx-auto mt-4 block h-1 rounded-full bg-cyan-400 transition-all duration-700 ease-out ${
              visible ? "w-24 opacity-100" : "w-0 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          />
        </h2>

        <div
          className={`mt-14 rounded-2xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-sm transition-all duration-700 ease-out md:mt-20 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "350ms" }}
        >
          <p className="text-sm font-medium uppercase tracking-wider text-cyan-400">
            ORB-SLAM3 Drift Corrector Module
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            venator69/ORBSLAM3-Drift-Corrector-module
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 md:text-base">
            Open-source ORB-SLAM3 extension with drift correction for visual,
            visual-inertial, and multi-map SLAM. Includes ROS examples,
            evaluation scripts, and calibration resources.
          </p>
          <a
            href={siteLinks.driftCorrectorRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400"
          >
            View repository on GitHub
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
