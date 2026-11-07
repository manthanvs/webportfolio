"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, scroller, reducedMotion } from "@/lib/fx";
import { site } from "@/content";

/** Infinite marquee; speed follows scroll velocity and direction flips with scroll direction. */
function Marquee({ text, dir, className }: { text: string; dir: 1 | -1; className: string }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el || reducedMotion()) return;
    let x = 0;
    let sign = 1;
    const tick = (_t: number, dt: number) => {
      const v = scroller.lenis?.velocity ?? 0;
      if (Math.abs(v) > 0.5) sign = Math.sign(v);
      x += (dt / 1000) * dir * sign * (2.2 + Math.min(Math.abs(v), 40) * 0.35); // % per second
      x = ((x % 50) + 50) % 50; // track holds two identical halves
      el.style.transform = `translate3d(${-x}%,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [dir]);
  const half = Array.from({ length: 3 }, (_, i) => (
    <span key={i} className="whitespace-nowrap pr-[0.35em]">
      {text} <span className="font-[200]">—</span>
    </span>
  ));
  return (
    <div className={className} aria-hidden>
      <div ref={track} className="marquee-track">
        {half}
        {half}
      </div>
    </div>
  );
}

const FADE =
  "linear-gradient(to right, transparent 2%, #000 24%, #000 76%, transparent 98%), linear-gradient(to bottom, transparent 0%, #000 6%)";

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // entrance + scroll parallax
  useEffect(() => {
    if (!ready || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-row", { yPercent: 110, duration: 1.4, ease: "expo.out", stagger: 0.1 });
      gsap.from(".hero-portrait", { scale: 1.08, opacity: 0, duration: 1.6, ease: "expo.out" });
      gsap.from(".hero-hud", { opacity: 0, y: 12, duration: 1, delay: 0.4, stagger: 0.08, ease: "expo.out" });
      if (reducedMotion()) return;
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-portrait", { yPercent: 14, ease: "none", scrollTrigger: st });
      gsap.to(".hero-row-a", { yPercent: -40, ease: "none", scrollTrigger: st });
      gsap.to(".hero-row-b", { yPercent: 40, ease: "none", scrollTrigger: st });
      gsap.to(".hero-dim", { opacity: 0.6, ease: "none", scrollTrigger: st });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  const pad = (n: number) => String(Math.round(n)).padStart(4, "0");

  return (
    <section
      id="top"
      data-theme="dark"
      ref={root}
      className="relative h-[100svh] min-h-[620px] overflow-hidden text-white"
      // tones sampled from the portrait's studio backdrop (dark top → light lower half)
      style={{ background: "linear-gradient(to bottom, #6f6e74 0%, #8e8d93 32%, #a2a1a7 62%, #abaab0 100%)" }}
    >
      {/* row A sits behind the portrait */}
      <div className="absolute inset-x-0 top-[17%] z-0 overflow-hidden md:top-[12%]">
        <div className="hero-row hero-row-a">
          <Marquee
            text={site.firstName}
            dir={-1}
            className="text-[26vw] font-[700] leading-[0.9] tracking-[-0.055em] text-white/90 md:text-[19vw]"
          />
        </div>
      </div>

      {/* box matches the photo's aspect ratio exactly so the edge mask lands on the photo's edges */}
      <div className="hero-portrait absolute bottom-0 left-1/2 z-10 aspect-[1752/1690] w-[128vw] -translate-x-1/2 md:h-[94%] md:w-auto">
        <Image
          src="/images/portrait.png"
          alt={`Portrait of ${site.name}`}
          fill
          priority
          sizes="(max-width: 768px) 128vw, 900px"
          className="object-cover"
          style={{
            // fade every photo edge except the bottom so the studio backdrop dissolves into the page
            maskImage: FADE,
            WebkitMaskImage: FADE,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />
      </div>

      {/* row B crosses in front of the portrait, opposite direction */}
      <div className="absolute inset-x-0 bottom-[6%] z-20 overflow-hidden md:bottom-[3%]">
        <div className="hero-row hero-row-b">
          <Marquee
            text={site.name.split(" ").slice(1).join(" ")}
            dir={1}
            className="text-[26vw] font-[200] leading-[0.9] tracking-[-0.05em] md:text-[19vw]"
          />
        </div>
      </div>

      <div className="hero-dim pointer-events-none absolute inset-0 z-30 bg-ink opacity-0" />

      {/* HUD layer */}
      <div className="pointer-events-none absolute inset-0 z-40 hidden md:block">
        <div className="hero-hud absolute left-10 top-1/2 -translate-y-1/2 space-y-1 text-white/80">
          <p className="hud">◎ Cursor</p>
          <p className="hud tabular-nums">X {pad(pos.x)}</p>
          <p className="hud tabular-nums">Y {pad(pos.y)}</p>
        </div>
        <div className="hero-hud absolute right-10 top-[38%] text-right">
          <svg width="18" height="18" viewBox="0 0 18 18" className="mb-6 ml-auto" aria-hidden>
            <path d="M1 1l16 16M17 4v13H4" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <p className="text-[clamp(20px,1.8vw,28px)] leading-[1.25]">
            {site.role}
            <br />
            <span className="text-white/70">Portfolio — Vol. 01</span>
          </p>
        </div>
      </div>

      <div className="hero-hud absolute bottom-5 left-5 z-40 flex items-center gap-3 text-white/80 md:bottom-8 md:left-10">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
        </span>
        <span className="hud">Scroll to explore</span>
      </div>
    </section>
  );
}
