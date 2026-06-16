import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { BackgroundFeather } from "../components/BackgroundFeather";
import { BrandLogo } from "../brand";
import { media } from "../config/media";
import { PerformanceSection } from "../performance";

const ttNormsLightUrl = "/fonts/TTNorms-Light.woff2";
const ttNormsBoldUrl = "/fonts/TTNorms-Bold.woff2";

const ttNormsLightStyle: CSSProperties = {
  fontFamily: '"TT Norms", system-ui, sans-serif',
  fontWeight: 300,
};

const ttNormsBoldStyle: CSSProperties = {
  fontFamily: '"TT Norms", system-ui, sans-serif',
  fontWeight: 700,
};

const brandText = "SLAM.et";
const tagline = "Simuntaneous Localization and Mapping with Error Tuning";
const howItWorksVideoId = "xsKft9Mwxcg";
const howItWorksVideoSrc = `https://www.youtube.com/embed/${howItWorksVideoId}?autoplay=1&mute=1&rel=0&modestbranding=1`;

async function typeText(
  text: string,
  onUpdate: (value: string) => void,
  speedMs: number,
  isCancelled: () => boolean,
) {
  for (let index = 1; index <= text.length; index++) {
    if (isCancelled()) {
      return;
    }

    onUpdate(text.slice(0, index));
    await new Promise((resolve) => setTimeout(resolve, speedMs));
  }
}

export function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayedBrand, setDisplayedBrand] = useState("");
  const [displayedTagline, setDisplayedTagline] = useState("");
  const [isBrandDone, setIsBrandDone] = useState(false);
  const [isTaglineDone, setIsTaglineDone] = useState(false);
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const [slamVisualizationVisible, setSlamVisualizationVisible] = useState(false);
  const howItWorksRef = useRef<HTMLElement>(null);
  const slamVisualizationRef = useRef<HTMLElement>(null);
  const slamVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const id = decodeURIComponent(location.hash.slice(1));
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
  }, [location.hash]);

  useEffect(() => {
    const section = howItWorksRef.current;
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setHowItWorksVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = slamVisualizationRef.current;
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSlamVisualizationVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = slamVideoRef.current;
    if (!video || !slamVisualizationVisible) {
      return;
    }

    void video.play();
  }, [slamVisualizationVisible]);

  useEffect(() => {
    let cancelled = false;

    const runTyping = async () => {
      await typeText(brandText, setDisplayedBrand, 110, () => cancelled);
      if (cancelled) {
        return;
      }

      setIsBrandDone(true);
      await new Promise((resolve) => setTimeout(resolve, 350));

      await typeText(tagline, setDisplayedTagline, 70, () => cancelled);
      if (cancelled) {
        return;
      }

      setIsTaglineDone(true);
    };

    void runTyping();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <style>
        {`
          @font-face {
            font-family: "TT Norms";
            src: url("${ttNormsLightUrl}") format("woff2");
            font-weight: 300;
            font-style: normal;
            font-display: swap;
          }

          @font-face {
            font-family: "TT Norms";
            src: url("${ttNormsBoldUrl}") format("woff2");
            font-weight: 700;
            font-style: normal;
            font-display: swap;
          }

          @keyframes howItWorksGlow {
            0%, 100% {
              text-shadow: 0 0 0 transparent;
            }
            50% {
              text-shadow: 0 0 24px rgba(34, 211, 238, 0.35);
            }
          }
        `}
      </style>

      <section id="main" className="relative h-screen overflow-hidden scroll-mt-20">
        <div
          className="section-bg-media absolute inset-0 bg-cover bg-center scale-110 animate-pulse"
          style={{
            backgroundImage: `url(${media.heroBackground})`,
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-slate-950" />
        <BackgroundFeather />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 min-h-[1.2em] text-6xl md:text-8xl">
            <BrandLogo text={displayedBrand} />
            {!isBrandDone && (
              <span className="animate-pulse text-cyan-400">|</span>
            )}
          </div>

          <h1
            className="min-h-[80px] text-3xl tracking-tight text-white md:text-5xl"
            style={ttNormsLightStyle}
          >
            {displayedTagline}
            {isBrandDone && !isTaglineDone && (
              <span className="animate-pulse text-cyan-400">|</span>
            )}
          </h1>

          <p
            className="
              mt-6
              max-w-3xl
              text-lg
              md:text-xl
              text-slate-300
              opacity-0
              animate-[fadeUp_1s_ease-out_1s_forwards]
            "
          >
            Real-time ORBSLAM3 based SLAM with AI powered Error Tuning that
            achieves sub-meter accuracy for 10 meters, Semantic Mapping support,
            and intelligent, that can achieve sub-100ms latency on Raspberry Pi 5.
          </p>

          <div
            className="
              mt-10
              flex
              gap-4
              opacity-0
              animate-[fadeUp_1s_ease-out_1.5s_forwards]
            "
          >
            <button
              type="button"
              onClick={() => navigate(user ? "/dashboard" : "/login")}
              className="
                rounded-lg
                bg-cyan-500
                px-8
                py-3
                font-semibold
                text-white
                transition
                hover:scale-105
                hover:bg-cyan-400
              "
            >
              Get Started
            </button>

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("How it works")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="
                rounded-lg
                border
                border-white/20
                bg-white/5
                px-8
                py-3
                font-semibold
                text-white
                backdrop-blur-md
                transition
                hover:bg-white/10
              "
            >
              View Demo
            </button>
          </div>
        </div>
      </section>

      <div className="section-spacer" aria-hidden />

      <section
        ref={howItWorksRef}
        id="How it works"
        className="relative min-h-screen scroll-mt-20 overflow-hidden py-32 md:py-40"
      >
        <div
          className="section-bg-media absolute inset-0 bg-cover bg-center invert"
          style={{ backgroundImage: `url(${media.howItWorksBackground})` }}
        />
        <div className="absolute inset-0 bg-slate-950/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/70 to-slate-950" />
        <BackgroundFeather />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
          <h2
            className={`text-4xl tracking-tight text-white transition-all duration-700 ease-out md:text-5xl ${
              howItWorksVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            style={{
              ...ttNormsBoldStyle,
              animation: howItWorksVisible
                ? "howItWorksGlow 2.5s ease-in-out 0.6s 1"
                : undefined,
            }}
          >
            How does it work?
            <span
              aria-hidden
              className={`mx-auto mt-4 block h-1 rounded-full bg-cyan-400 transition-all duration-700 ease-out ${
                howItWorksVisible ? "w-24 opacity-100" : "w-0 opacity-0"
              }`}
              style={{ transitionDelay: "250ms" }}
            />
          </h2>
          <div
            className={`mt-14 w-full overflow-hidden rounded-xl shadow-2xl shadow-cyan-500/10 ring-1 ring-white/10 transition-all duration-700 ease-out md:mt-20 ${
              howItWorksVisible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-12 scale-95 opacity-0"
            }`}
            style={{ transitionDelay: "350ms" }}
          >
            <div className="aspect-video w-full bg-slate-900">
              {howItWorksVisible && (
                <iframe
                  className="h-full w-full"
                  src={howItWorksVideoSrc}
                  title="How SLAM.et works"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="section-spacer" aria-hidden />

      <section
        ref={slamVisualizationRef}
        id="Slam Visualization"
        className="relative min-h-screen scroll-mt-20 overflow-hidden py-32 md:py-40"
      >
        <div
          className="section-bg-media absolute inset-0 bg-cover bg-center invert"
          style={{ backgroundImage: `url(${media.howItWorksBackground})` }}
        />
        <div className="absolute inset-0 bg-slate-950/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/70 to-slate-950" />
        <BackgroundFeather />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
          <h2
            className={`text-4xl tracking-tight text-white transition-all duration-700 ease-out md:text-5xl ${
              slamVisualizationVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            style={{
              ...ttNormsBoldStyle,
              animation: slamVisualizationVisible
                ? "howItWorksGlow 2.5s ease-in-out 0.6s 1"
                : undefined,
            }}
          >
            SLAM Visualization
            <span
              aria-hidden
              className={`mx-auto mt-4 block h-1 rounded-full bg-cyan-400 transition-all duration-700 ease-out ${
                slamVisualizationVisible ? "w-24 opacity-100" : "w-0 opacity-0"
              }`}
              style={{ transitionDelay: "250ms" }}
            />
          </h2>
          <div
            className={`mt-14 w-full overflow-hidden rounded-xl shadow-2xl shadow-cyan-500/10 ring-1 ring-white/10 transition-all duration-700 ease-out md:mt-20 ${
              slamVisualizationVisible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-12 scale-95 opacity-0"
            }`}
            style={{ transitionDelay: "350ms" }}
          >
            <div className="aspect-video w-full bg-slate-900">
              {slamVisualizationVisible && (
                <video
                  ref={slamVideoRef}
                  className="h-full w-full object-cover"
                  src={media.slamVisualizationVideo}
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="section-spacer" aria-hidden />

      <PerformanceSection />
    </div>
  );
}
