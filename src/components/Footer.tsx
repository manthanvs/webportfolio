"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, scrollTo, useMagnetic, reducedMotion, withBase } from "@/lib/fx";
import { site } from "@/content";

function useClock() {
  const [now, setNow] = useState<string>("--:--");
  useEffect(() => {
    const fmt = () =>
      setNow(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" }));
    fmt();
    const id = setInterval(fmt, 15_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const cta = useMagnetic<HTMLAnchorElement>(0.35);
  const top = useMagnetic<HTMLButtonElement>(0.4);
  const time = useClock();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      // curved bone edge flattens as the footer scrolls in
      gsap.fromTo(
        ".footer-curve",
        { height: "12vh" },
        { height: "0vh", ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 20%", scrub: true } },
      );
      gsap.from(".footer-inner", {
        yPercent: -25,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const socials = site.socials.filter((s) => s.href);

  return (
    <footer
      id="contact"
      ref={root}
      data-theme="dark"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink text-bone"
      // deep purple from the logo, glowing softly behind the contact button
      style={{ backgroundImage: "radial-gradient(55% 55% at 85% 62%, color-mix(in srgb, var(--color-signal-deep) 80%, transparent), transparent 70%)" }}
    >
      <div className="footer-curve absolute inset-x-0 top-0 z-10 h-[12vh] overflow-hidden">
        <div className="absolute left-[-10%] top-[-100%] h-[200%] w-[120%] rounded-b-[50%] bg-bone" />
      </div>

      <div className="footer-inner mx-auto w-full max-w-[1400px] px-5 pb-8 pt-36 md:px-10 md:pt-52">
        <div className="flex items-center gap-5">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-mist md:h-24 md:w-24">
            <Image src={withBase("/images/portrait.jpg")} alt="" fill sizes="96px" className="scale-150 object-cover object-[50%_25%]" />
          </div>
          <h2 className="text-[clamp(44px,8vw,132px)] font-[450] leading-[0.95] tracking-[-0.05em]">
            Let&apos;s build
          </h2>
        </div>
        <h2 className="text-[clamp(44px,8vw,132px)] font-[200] leading-[0.95] tracking-[-0.05em]">
          something together
        </h2>

        <div className="relative mt-28 md:mt-24">
          <div className="h-px w-full bg-bone/15" />
          <a
            ref={cta}
            href={site.email ? `mailto:${site.email}` : "#contact"}
            onClick={(e) => !site.email && e.preventDefault()}
            className="group absolute right-[4%] top-0 -mt-16 grid h-32 w-32 place-items-center overflow-hidden rounded-full bg-signal text-bone md:right-[6%] md:-mt-26 md:h-52 md:w-52"
          >
            <span className="absolute inset-0 translate-y-full rounded-full bg-bone transition-transform duration-700 ease-out-expo group-hover:translate-y-0" />
            <span className="relative text-[17px] transition-colors duration-500 group-hover:text-ink">Get in touch</span>
          </a>
        </div>

        <div className="mt-28 flex flex-wrap gap-3 md:mt-20">
          {site.email ? (
            <button
              onClick={() => {
                navigator.clipboard?.writeText(site.email);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
              className="rounded-full border border-bone/20 px-7 py-5 text-[15px] transition-colors hover:border-bone hover:bg-bone hover:text-ink"
            >
              {copied ? "Copied ✓" : site.email}
            </button>
          ) : (
            <span className="rounded-full border border-dashed border-bone/25 px-7 py-5 text-[15px] text-bone/50">
              Add your email in src/content.ts
            </span>
          )}
        </div>

        <div className="mt-24 grid grid-cols-2 gap-8 border-t border-bone/10 pt-6 md:grid-cols-4">
          <div>
            {/* sign-off: transparent MS mark at its native 497×480 ratio */}
            <Image
              src={withBase("/images/logo.webp")}
              alt={`${site.name} logo`}
              width={497}
              height={480}
              className="h-14 w-auto"
              // brightened so the dark metal M reads on the ink background
              style={{ filter: "brightness(1.6) drop-shadow(0 0 14px color-mix(in srgb, var(--color-signal) 60%, transparent))" }}
            />
          </div>
          <div>
            <p className="hud mb-2 text-bone/40">Your local time</p>
            <p className="text-[14px] tabular-nums">{time}</p>
          </div>
          <div>
            <p className="hud mb-2 text-bone/40">Socials</p>
            <div className="flex flex-wrap gap-4 text-[14px]">
              {socials.length ? (
                socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="hover:text-signal-soft">
                    {s.label}
                  </a>
                ))
              ) : (
                <span className="text-bone/40">—</span>
              )}
            </div>
          </div>
          <div className="flex items-end justify-start md:justify-end">
            <button
              ref={top}
              onClick={() => scrollTo(0)}
              className="hud rounded-full border border-bone/20 px-5 py-3 transition-colors hover:border-signal-soft hover:text-signal-soft"
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
