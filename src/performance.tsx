import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  Battery100Icon,
  BoltIcon,
  CubeIcon,
  FireIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";

import { BackgroundFeather } from "./components/BackgroundFeather";
import { media } from "./config/media";

const ttNormsBoldStyle: CSSProperties = {
  fontFamily: '"TT Norms", system-ui, sans-serif',
  fontWeight: 700,
};

type PerformanceStat = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  subtitle: string;
  icon: string;
  FallbackIcon: ComponentType<SVGProps<SVGSVGElement>>;
};

const performanceStats: PerformanceStat[] = [
  {
    label: "Accuracy",
    value: 0.07,
    suffix: " m",
    decimals: 1,
    subtitle: "Sub-meter drift within a 10 m trajectory",
    icon: "/icons/performance/accuracy.png",
    FallbackIcon: ViewfinderCircleIcon,
  },
  {
    label: "Precision",
    value: 0.04,
    prefix: "±",
    suffix: " m",
    decimals: 2,
    subtitle: "Repeatable pose error after error tuning",
    icon: "/icons/performance/precision.png",
    FallbackIcon: SparklesIcon,
  },
  {
    label: "Latency",
    value: 85,
    suffix: " ms",
    subtitle: "End-to-end frame-to-pose pipeline",
    icon: "/icons/performance/latency.png",
    FallbackIcon: BoltIcon,
  },
  {
    label: "Heat resistance",
    value: 70,
    suffix: " °C",
    subtitle: "Stable operation under sustained load",
    icon: "/icons/performance/heat-resistance.png",
    FallbackIcon: FireIcon,
  },
  {
    label: "Dust resistance",
    value: 54,
    prefix: "IP",
    subtitle: "Protected against dust ingress in field use",
    icon: "/icons/performance/dust-resistance.png",
    FallbackIcon: ShieldCheckIcon,
  },
  {
    label: "Operating time",
    value: 2,
    suffix: " h",
    subtitle: "Continuous runtime on a compact power pack",
    icon: "/icons/performance/operating-time.png",
    FallbackIcon: Battery100Icon,
  },
  {
    label: "Mass",
    value: 670,
    suffix: " g",
    subtitle: "Total payload including compute module",
    icon: "/icons/performance/mass.png",
    FallbackIcon: CubeIcon,
  },
];

function StatIcon({ stat }: { stat: PerformanceStat }) {
  const [useFallback, setUseFallback] = useState(false);
  const Icon = stat.FallbackIcon;

  if (useFallback) {
    return <Icon className="mx-auto h-9 w-9 text-cyan-400" aria-hidden />;
  }

  return (
    <img
      src={stat.icon}
      alt=""
      className="mx-auto h-9 w-9 object-contain"
      onError={() => setUseFallback(true)}
    />
  );
}

function useAnimatedNumber(
  target: number,
  active: boolean,
  durationMs = 1400,
  decimals = 0,
) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!active) {
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      const current = target * eased;

      setDisplay(
        decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString(),
      );

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, durationMs, decimals]);

  return display;
}

function StatCard({
  stat,
  active,
  delayMs,
}: {
  stat: PerformanceStat;
  active: boolean;
  delayMs: number;
}) {
  const animated = useAnimatedNumber(
    stat.value,
    active,
    1400,
    stat.decimals ?? 0,
  );

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-all duration-700 ease-out ${
        active ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <StatIcon stat={stat} />
      <p className="mt-4 text-sm font-medium uppercase tracking-wider text-slate-400">
        {stat.label}
      </p>
      <p
        className="mt-3 text-4xl tracking-tight text-white md:text-5xl"
        style={ttNormsBoldStyle}
      >
        {stat.prefix}
        {animated}
        {stat.suffix}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-slate-400 md:text-sm">
        {stat.subtitle}
      </p>
    </div>
  );
}

export function PerformanceSection() {
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
      id="Testbench"
      className="relative scroll-mt-20 overflow-hidden py-32 md:py-40"
    >
      <div
        className="section-bg-media absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${media.performanceBackground})` }}
      />
      <div className="absolute inset-0 bg-slate-950/85" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/70 to-slate-950" />
      <BackgroundFeather />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2
            className={`text-4xl tracking-tight text-white transition-all duration-700 ease-out md:text-5xl ${
              visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={ttNormsBoldStyle}
          >
            How does it perform?
            <span
              aria-hidden
              className={`mx-auto mt-4 block h-1 rounded-full bg-cyan-400 transition-all duration-700 ease-out ${
                visible ? "w-24 opacity-100" : "w-0 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            />
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-20 lg:grid-cols-3 xl:grid-cols-4">
          {performanceStats.map((stat, index) => (
            <StatCard
              key={stat.label}
              stat={stat}
              active={visible}
              delayMs={400 + index * 80}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

