"use client";

import { useEffect, useRef } from "react";
import { gsap, scrollTo, useMagnetic, reducedMotion } from "@/lib/fx";
import { site } from "@/content";

export default function Intro() {
  const root = useRef<HTMLElement>(null);
  const btn = useMagnetic<HTMLAnchorElement>(0.3);

  useEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      // words brighten one by one as the paragraph crosses the viewport
      gsap.fromTo(
        ".intro-word",
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: { trigger: ".intro-copy", start: "top 80%", end: "bottom 45%", scrub: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} data-theme="light" className="relative bg-bone px-5 pb-28 pt-24 md:px-10 md:pb-44 md:pt-40">
      <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-12">
        <p className="hud text-ink/50 md:col-span-3">(01) — Intro</p>
        <div className="md:col-span-9">
          <p className="intro-copy text-[clamp(30px,4.3vw,68px)] font-[450] leading-[1.08] tracking-[-0.03em]">
            {site.intro.split(" ").map((w, i) => (
              <span key={i} className="intro-word inline-block pr-[0.25em]">
                {w}
              </span>
            ))}
          </p>
          <div className="mt-14 flex items-center justify-between gap-6 md:mt-20">
            <p className="hud max-w-[260px] text-ink/60">
              Selected work, a short story, and a way to reach me — all below.
            </p>
            <a
              ref={btn}
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#about");
              }}
              data-focus="zone"
              className="group relative grid size-[clamp(112px,37vw,144px)] shrink-0 place-items-center overflow-hidden rounded-full bg-ink text-bone md:size-48"
            >
              <span className="absolute inset-0 translate-y-full rounded-full bg-signal transition-transform duration-700 ease-out-expo group-on:translate-y-0" />
              <span className="relative text-[17px]">About me</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
