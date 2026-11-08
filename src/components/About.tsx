"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, SplitText, reducedMotion, useScramble } from "@/lib/fx";
import { site } from "@/content";

function Scramble({ text, on, className }: { text: string; on: boolean; className?: string }) {
  return <span className={className}>{useScramble(text, on, 700)}</span>;
}

// Only facts already in src/content.ts — nothing invented.
const FILE = [
  ["Name", site.name],
  ["Role", site.role],
  ["Edition", "Vol. 01"],
] as const;

/**
 * KPR-inspired dossier: a layered collage (portrait, detail crop, data card) at three parallax
 * depths, a scanner-style image reveal, stacked display type that drifts apart on scroll, and
 * line-masked copy. Entrance pieces animate inner elements; scroll pieces animate their wrappers.
 */
export default function About() {
  const root = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: el, start: "top 70%", once: true, onEnter: () => setInView(true) });
      if (reducedMotion()) return;

      // one-shot entrance
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 70%" } })
        .from(".ab-rule", { scaleX: 0, duration: 1.2, ease: "expo.inOut" }, 0)
        .from(".ab-title-in", { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.1 }, 0.15)
        // scanner: the portrait opens from a centre line, two signal edges travel out with it
        .fromTo(".ab-reveal", { clipPath: "inset(50% 0% 50% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" }, 0.1)
        .fromTo(".ab-scan-top", { top: "50%" }, { top: "0%", duration: 1.5, ease: "expo.inOut" }, 0.1)
        .fromTo(".ab-scan-bot", { top: "50%" }, { top: "100%", duration: 1.5, ease: "expo.inOut" }, 0.1)
        .to(".ab-scan-top, .ab-scan-bot", { autoAlpha: 0, duration: 0.5 }, 1.35)
        .fromTo(".ab-frag", { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.inOut" }, 0.55)
        .from(".ab-card", { autoAlpha: 0, y: 40, duration: 1.1, ease: "expo.out" }, 0.8);

      // copy: masked line-by-line reveal, re-split on resize
      SplitText.create(".ab-copy", {
        type: "lines",
        mask: "lines",
        linesClass: "ab-l",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 105,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.07,
            scrollTrigger: { trigger: self.elements[0], start: "top 88%" },
          }),
      });

      // scrubbed depth: the further forward a layer sits, the faster it travels
      const sc = { trigger: el, start: "top bottom", end: "bottom top", scrub: true };
      gsap.fromTo(".ab-depth-1", { y: 50 }, { y: -50, ease: "none", scrollTrigger: sc });
      gsap.fromTo(".ab-img", { yPercent: -7 }, { yPercent: 7, ease: "none", scrollTrigger: sc });
      gsap.fromTo(".ab-depth-2", { y: 140 }, { y: -140, ease: "none", scrollTrigger: sc });
      gsap.fromTo(".ab-depth-3", { y: 200 }, { y: -160, ease: "none", scrollTrigger: sc });
      gsap.fromTo(".ab-cross", { rotate: -45, y: 80 }, { rotate: 135, y: -80, ease: "none", scrollTrigger: sc });
      gsap.fromTo(".ab-line-1", { xPercent: -4 }, { xPercent: 4, ease: "none", scrollTrigger: sc });
      gsap.fromTo(".ab-line-2", { xPercent: 6 }, { xPercent: -6, ease: "none", scrollTrigger: sc });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={root} data-theme="light" className="relative overflow-hidden bg-bone px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1400px]">
        <div className="relative mb-14 flex items-end justify-between gap-6 pb-3 md:mb-24">
          <Scramble text="(03) — About" on={inView} className="hud text-ink/50" />
          <span className="hud text-ink/40">Fig. 01 — Profile</span>
          <span className="ab-rule absolute inset-x-0 bottom-0 h-px origin-left bg-ink/15" />
        </div>

        <div className="grid gap-24 md:grid-cols-12 md:gap-10">
          {/* text — first on mobile */}
          <div className="md:order-2 md:col-span-6 md:col-start-7 md:pt-6">
            <h2
              aria-label={`Hi, I'm ${site.firstName}.`}
              className="text-[clamp(48px,6.4vw,112px)] font-[800] uppercase leading-[0.88] tracking-[-0.045em]"
            >
              <span className="ab-line-1 block" aria-hidden>
                <span className="block overflow-hidden pb-[0.05em]">
                  <span className="ab-title-in block">
                    <span className="hud mr-[0.4em] inline-block align-top !text-[11px] font-[400] normal-case text-ink/40">01H</span>
                    Hi, I&apos;m
                  </span>
                </span>
              </span>
              <span className="ab-line-2 block pl-[10%]" aria-hidden>
                <span className="block overflow-hidden pb-[0.05em]">
                  <span className="ab-title-in block">
                    <span className="hud mr-[0.4em] inline-block align-top !text-[11px] font-[400] normal-case text-ink/40">
                      02{site.firstName[0]}
                    </span>
                    {site.firstName}.
                  </span>
                </span>
              </span>
            </h2>
            <div className="mt-12 max-w-[52ch] space-y-6 text-[clamp(17px,1.3vw,20px)] leading-[1.55] text-ink/75 md:mt-16">
              {site.about.map((p, i) => (
                <p key={i} className="ab-copy">
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* layered collage */}
          <div className="relative pb-10 md:order-1 md:col-span-6 md:pb-0">
            <svg
              viewBox="0 0 100 100"
              className="ab-cross pointer-events-none absolute -left-2 top-[40%] z-10 h-20 w-20 text-signal md:-left-10 md:h-28 md:w-28"
              aria-hidden
            >
              <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M50 4v30M50 66v30M4 50h30M66 50h30" stroke="currentColor" strokeWidth="1.2" />
            </svg>

            <div className="ab-depth-1 relative w-[84%]">
              {/* 1.18 scale leaves headroom for the ±7% parallax */}
              <div className="notch relative aspect-[4/5] overflow-hidden">
                <div className="ab-reveal absolute inset-0 overflow-hidden bg-mist">
                  <Image
                    src="/images/portrait.jpg"
                    alt={site.name}
                    fill
                    sizes="(max-width: 768px) 84vw, 40vw"
                    className="ab-img scale-[1.18] object-cover object-[50%_30%]"
                  />
                </div>
                <span className="ab-scan-top pointer-events-none absolute inset-x-0 top-1/2 h-px bg-signal" />
                <span className="ab-scan-bot pointer-events-none absolute inset-x-0 top-1/2 h-px bg-signal" />
              </div>
              <p className="hud mt-3 text-ink/50">Fig. 01</p>
            </div>

            <div className="ab-depth-2 absolute right-0 top-[6%] w-[36%]">
              {/* bone tab keeps the label legible whether it floats over the dark photo or the page */}
              <p className="hud mb-1 inline-block bg-bone px-2 py-1 text-ink/60">Detail — 01</p>
              <div className="notch-sm relative aspect-[16/10] overflow-hidden">
                <div className="ab-frag absolute inset-0 overflow-hidden bg-ink">
                  {/* B&W eye-line strip: the square photo is top-aligned in this 16:10 box, which puts the eyes
                      (photo y≈27%) at 44% of the box; zooming 4× about that point centres them */}
                  <Image
                    src="/images/portrait-bw.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 55vw" // shown at 4× zoom, so request a larger file
                    className="object-cover object-top"
                    style={{ transform: "scale(4)", transformOrigin: "50% 44%" }}
                  />
                </div>
              </div>
            </div>

            <div className="ab-depth-3 absolute -bottom-4 right-[3%] w-[64%] md:-bottom-16 md:w-[54%]">
              <div data-theme="dark" className="ab-card notch-sm bg-ink px-5 pb-5 pt-6 text-bone md:px-6 md:pb-6 md:pt-7">
                <p className="hud text-signal">{"// File 03 — Profile"}</p>
                <dl className="mt-4 space-y-2">
                  {FILE.map(([k, v]) => (
                    <div key={k} className="hud flex items-baseline gap-2">
                      <dt className="text-bone/45">{k}</dt>
                      <span className="mb-[3px] flex-1 border-b border-dotted border-bone/20" />
                      <dd className="text-right">
                        <Scramble text={v} on={inView} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
