"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, scroller, reducedMotion, useIsoLayoutEffect, withBase } from "@/lib/fx";
import { site } from "@/content";

/** Infinite marquee; speed follows scroll velocity, direction flips with scroll direction, pauses off-screen. */
function Marquee({ text, dir, className }: { text: string; dir: 1 | -1; className: string }) {
  const box = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el || !box.current || reducedMotion()) return;
    let x = 0;
    let sign = 1;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(box.current);
    const tick = (_t: number, dt: number) => {
      if (!visible) return;
      const v = scroller.lenis?.velocity ?? 0;
      if (Math.abs(v) > 0.5) sign = Math.sign(v);
      x += (dt / 1000) * dir * sign * (2.2 + Math.min(Math.abs(v), 40) * 0.35); // % per second
      x = ((x % 50) + 50) % 50; // track holds two identical halves
      el.style.transform = `translate3d(${-x}%,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, [dir]);
  const half = Array.from({ length: 3 }, (_, i) => (
    <span key={i} className="whitespace-nowrap pr-[0.35em]">
      {text} <span className="font-[200]">—</span>
    </span>
  ));
  return (
    <div ref={box} className={className} aria-hidden>
      <div ref={track} className="marquee-track">
        {half}
        {half}
      </div>
    </div>
  );
}

// sampled from the B&W portrait's studio backdrop: edges #040404–#080808, a faint spotlight (~#0e) behind the head
const BACKDROP = "radial-gradient(42% 48% at 50% 30%, #0e0e0e, transparent 72%), linear-gradient(#060606, #070707 60%, #040404)";
const FADE_X = "linear-gradient(to right, transparent 2%, #000 24%, #000 76%, transparent 98%)";
// fade every photo edge except the bottom so the studio backdrop dissolves into the page
const FADE = `${FADE_X}, linear-gradient(to bottom, transparent 0%, #000 6%)`;

/** KPR-style notched card: full-bleed at p=0, inset card with a top tab and chamfered corner at p=1. */
function cardShape(p: number) {
  const l = 3.5 * p, r = 100 - 3.5 * p, t = 5 * p, b = 100 - 9 * p;
  const tabA = l + (r - l) * 0.36, tabB = l + (r - l) * 0.4;
  const tab = 22 * p, cut = 40 * p;
  return `polygon(${l}% ${t}%, ${tabA}% ${t}%, ${tabB}% calc(${t}% + ${tab}px), ${r}% calc(${t}% + ${tab}px), ${r}% calc(${b}% - ${cut}px), calc(${r}% - ${cut}px) ${b}%, ${l}% ${b}%)`;
}

const pad = (n: number) => String(Math.round(n)).padStart(4, "0");

/**
 * Layers, back to front: name row A → portrait → name row B → HUD.
 * Each layer has an outer element (scroll + pointer parallax) and an inner one (entrance),
 * so the two animation systems never touch the same element.
 */
export default function Hero({ play }: { play: boolean }) {
  const root = useRef<HTMLElement>(null);
  const curX = useRef<HTMLSpanElement>(null);
  const curY = useRef<HTMLSpanElement>(null);

  // hidden start state, applied before first paint (the preloader covers the SSR frame)
  useIsoLayoutEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.set(".hero-in-row", { yPercent: 115 });
      gsap.set(".hero-in-portrait", { scale: 1.16, yPercent: 6, transformOrigin: "50% 100%" });
      gsap.set(".hero-in-hud", { autoAlpha: 0, y: 14 });
    }, root);
    return () => ctx.revert();
  }, []);

  // entrance — starts the moment the preloader splits open
  useEffect(() => {
    if (!play || reducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .to(".hero-in-portrait", { scale: 1, yPercent: 0, duration: 2.2, ease: "expo.out" }, 0)
        .to(".hero-in-row", { yPercent: 0, duration: 1.6, ease: "expo.out", stagger: 0.14 }, 0.1)
        .to(".hero-in-hud", { autoAlpha: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.07 }, 0.55);
    }, root);
    return () => ctx.revert();
  }, [play]);

  // scroll: desktop pins the hero while the content sheet slides over it; layers separate in depth
  // and the frame shrinks into a notched card. Mobile skips the pin and keeps a lighter parallax.
  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const q = gsap.utils.selector(el);
    const card = q(".hero-card")[0] as HTMLElement;
    const mm = gsap.matchMedia();
    mm.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" }, (ctx) => {
      const desktop = !!ctx.conditions?.desktop;
      const shape = { p: 0 };
      gsap
        .timeline({
          defaults: { ease: "none", duration: 1 },
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true, pin: desktop, pinSpacing: false },
        })
        .to(shape, { p: 1, duration: 0.85, onUpdate: () => void (card.style.clipPath = cardShape(shape.p)) }, 0)
        .to(q(".hero-depth-a"), { yPercent: desktop ? -12 : 25 }, 0) // back row drifts least
        .to(q(".hero-depth-p"), { yPercent: desktop ? -3 : 12, scale: 0.94, transformOrigin: "50% 100%" }, 0)
        .to(q(".hero-depth-b"), { yPercent: desktop ? -50 : -12 }, 0) // front row rushes past
        .to(q(".hero-hud-wrap"), { autoAlpha: 0, duration: 0.25 }, 0)
        .to(q(".hero-dim"), { opacity: 0.55 }, 0);
      return () => void (card.style.clipPath = "");
    });
    return () => mm.revert();
  }, []);

  // pointer: layers shift against each other for depth; HUD shows live coordinates
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fine = !window.matchMedia("(pointer: coarse)").matches && !reducedMotion();
    const q = gsap.utils.selector(el);
    const to = (sel: string, prop: string) => gsap.quickTo(q(sel), prop, { duration: 1.2, ease: "power3" });
    const aX = fine ? to(".hero-depth-a", "x") : null;
    const pX = fine ? to(".hero-depth-p", "x") : null;
    const pY = fine ? to(".hero-depth-p", "y") : null;
    const bX = fine ? to(".hero-depth-b", "x") : null;
    const move = (e: PointerEvent) => {
      if (curX.current) curX.current.textContent = pad(e.clientX);
      if (curY.current) curY.current.textContent = pad(e.clientY);
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      aX?.(nx * -30);
      pX?.(nx * 14);
      pY?.(ny * 8);
      bX?.(nx * 44);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    // ink-2 surround (not ink) so the near-black card still reads as a shape when it shrinks on scroll
    <section id="top" data-theme="dark" ref={root} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink-2 text-white">
      <div className="hero-card absolute inset-0 overflow-hidden" style={{ background: BACKDROP }}>
        {/* row A — behind the portrait */}
        <div className="hero-depth-a absolute inset-x-0 top-[17%] md:top-[12%]">
          <div className="overflow-hidden pb-[0.04em]">
            <div className="hero-in-row">
              <Marquee
                text={site.firstName}
                dir={-1}
                className="text-[26vw] font-[700] leading-none tracking-[-0.055em] text-white/90 md:text-[19vw]"
              />
            </div>
          </div>
        </div>

        {/* portrait — flex-centred (no CSS translate for GSAP to fight with) */}
        <div className="hero-depth-p absolute inset-0 flex items-end justify-center">
          {/* square box = the photo's aspect ratio, so the edge mask lands on the photo's edges */}
          <div data-hero-portrait className="hero-in-portrait relative aspect-square w-[140vw] shrink-0 md:h-[94%] md:w-auto">
            <Image
              src={withBase("/images/portrait-bw.jpg")}
              alt={`Portrait of ${site.name}`}
              fill
              priority
              sizes="(max-width: 768px) 140vw, 900px"
              className="object-cover"
              style={{ maskImage: FADE, WebkitMaskImage: FADE, maskComposite: "intersect", WebkitMaskComposite: "source-in" }}
            />
          </div>
        </div>

        {/* row B — crosses in front of the portrait, opposite direction */}
        <div className="hero-depth-b absolute inset-x-0 bottom-[6%] md:bottom-[2%]">
          <div className="overflow-hidden pb-[0.06em]">
            <div className="hero-in-row">
              <Marquee
                text={site.name.split(" ").slice(1).join(" ")}
                dir={1}
                className="text-[26vw] font-[200] leading-none tracking-[-0.05em] md:text-[19vw]"
              />
            </div>
          </div>
        </div>

        <div className="hero-dim pointer-events-none absolute inset-0 bg-ink opacity-0" />

        {/* HUD */}
        <div className="hero-hud-wrap pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0 left-10 hidden items-center md:flex">
            <div className="hero-in-hud space-y-1 text-white/80">
              <p className="hud">◎ Cursor</p>
              <p className="hud tabular-nums">
                X <span ref={curX}>0000</span>
              </p>
              <p className="hud tabular-nums">
                Y <span ref={curY}>0000</span>
              </p>
            </div>
          </div>
          <div className="absolute right-10 top-[38%] hidden md:block">
            <div className="hero-in-hud text-right">
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
          <div className="absolute bottom-10 left-5 md:bottom-8 md:left-10">
            <div className="hero-in-hud flex items-center gap-3 text-white/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
              </span>
              <span className="hud">Scroll to explore</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
