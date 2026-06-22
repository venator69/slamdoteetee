import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BackgroundFeather } from "./BackgroundFeather";
import { media } from "../config/media";
import { contacts, type ContactPerson } from "../config/site";

const ttNormsBoldStyle: CSSProperties = {
  fontFamily: '"TT Norms", system-ui, sans-serif',
  fontWeight: 700,
};

type ContactGroupProps = {
  heading: string;
  people: readonly ContactPerson[];
  visible: boolean;
  delayMs: number;
};

function ContactGroup({ heading, people, visible, delayMs }: ContactGroupProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-sm transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <p className="text-sm font-medium uppercase tracking-wider text-cyan-400">
        {heading}
      </p>
      <ul className="mt-6 space-y-8">
        {people.map((person) => (
          <li key={person.email}>
            <p className="text-xl font-semibold text-white md:text-2xl">
              {person.name}
            </p>
            <p className="mt-1 text-sm text-slate-300 md:text-base">
              {person.detail}
            </p>
            <a
              href={`mailto:${person.email}`}
              className="mt-3 inline-block text-sm text-cyan-400 transition hover:text-cyan-300"
            >
              {person.email}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContactsSection() {
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
      id="contacts"
      className="relative scroll-mt-20 overflow-hidden py-32 md:py-40"
    >
      <div
        className="section-bg-media absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${media.performanceBackground})` }}
      />
      <div className="absolute inset-0 bg-slate-950/90" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950" />
      <BackgroundFeather />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2
            className={`text-4xl tracking-tight text-white transition-all duration-700 ease-out md:text-5xl ${
              visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
            style={ttNormsBoldStyle}
          >
            Contacts
            <span
              aria-hidden
              className={`mx-auto mt-4 block h-1 rounded-full bg-cyan-400 transition-all duration-700 ease-out ${
                visible ? "w-24 opacity-100" : "w-0 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            />
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:mt-20 md:grid-cols-2">
          <ContactGroup
            {...contacts.developedBy}
            visible={visible}
            delayMs={400}
          />
          <ContactGroup
            {...contacts.supervisedBy}
            visible={visible}
            delayMs={520}
          />
        </div>
      </div>
    </section>
  );
}
