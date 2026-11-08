"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, lateStart, reducedMotion, withBase } from "@/lib/fx";
import { site } from "@/content";

// All measured from when the visitor opened the page, not from when the scripts arrived.
const MIN_MS = 1200; // never flash past — show at least this long
const FAILSAFE_MS = 7000; // reveal even if an asset hangs
const QUICK_EXIT_MS = 5000; // they've waited long enough: a short fade instead of the full split

/** Resolves once fonts and the hero portrait are ready to paint. */
function assetsReady(): Promise<void> {
  const img = document.querySelector<HTMLImageElement>("[data-hero-portrait] img");
  const image =
    !img || img.complete
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
  return Promise.all([document.fonts.ready, image]).then(() => undefined);
}

/** Last fetched resource as a short file name (next/image URLs are unwrapped). */
function lastResource() {
  const entries = performance.getEntriesByType("resource");
  if (!entries.length) return "";
  try {
    const url = new URL(entries[entries.length - 1].name);
    return decodeURIComponent((url.searchParams.get("url") || url.pathname).split("/").pop() || "");
  } catch {
    return "";
  }
}

/**
 * Hairline loader. Real progress (fonts + hero portrait) drives the bar; when done the bar
 * collapses into a vertical hairline that splits the screen open onto the hero.
 * `onReveal` fires as the split starts (hero entrance), `onDone` when the loader is gone.
 */
export default function Preloader({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const file = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    let ready = false;
    let shown = 0;
    let raf = 0;
    let tl: gsap.core.Timeline | null = null;
    let last = performance.now();

    const finish = () => {
      setGone(true);
      onDone();
    };

    if (lateStart) {
      raf = requestAnimationFrame(() => {
        onReveal();
        finish();
      });
      return () => cancelAnimationFrame(raf);
    }

    el.style.animation = "none"; // the script is here: .pl-giveup can stand down
    assetsReady().then(() => (ready = true));
    const failsafe = setTimeout(() => (ready = true), Math.max(0, FAILSAFE_MS - last));

    const exit = () => {
      if (reducedMotion() || performance.now() > QUICK_EXIT_MS) {
        onReveal();
        tl = gsap.timeline({ onComplete: finish }).to(el, { autoAlpha: 0, duration: 0.4 });
        return;
      }
      tl = gsap
        .timeline({ onComplete: finish })
        .to(q(".pl-row"), { autoAlpha: 0, y: -8, duration: 0.45, ease: "power2.in", stagger: 0.06 }, 0)
        .to(q(".pl-frame"), { autoAlpha: 0, duration: 0.6 }, 0)
        // bar collapses to its centre…
        .to(fill.current, { scaleX: 0, transformOrigin: "50% 50%", duration: 0.6, ease: "expo.inOut" }, 0.2)
        .to(q(".pl-track"), { autoAlpha: 0, duration: 0.3 }, 0.55)
        // …and becomes a vertical hairline that splits the screen
        .to(q(".pl-vline"), { scaleY: 1, duration: 0.8, ease: "expo.inOut" }, 0.5)
        .add(() => {
          el.style.pointerEvents = "none";
          onReveal();
        }, 1.15)
        .to(q(".pl-left"), { xPercent: -101, duration: 1.4, ease: "expo.inOut" }, 1.1)
        .to(q(".pl-right"), { xPercent: 101, duration: 1.4, ease: "expo.inOut" }, 1.1)
        .to(q(".pl-vline"), { autoAlpha: 0, duration: 0.5 }, 1.25);
    };

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      // creep towards 90% while waiting, run to 100% once assets are in
      const target = ready ? 100 : Math.min(90, (now / MIN_MS) * 90);
      shown += (target - shown) * (1 - Math.pow(0.9, dt / 16.7));
      if (ready && now >= MIN_MS && shown > 99.4) shown = 100;
      if (fill.current) fill.current.style.transform = `scaleX(${shown / 100})`;
      if (count.current) count.current.textContent = String(Math.floor(shown)).padStart(3, "0");
      if (file.current) file.current.textContent = lastResource();
      if (shown === 100) return exit();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
      tl?.kill();
    };
  }, [onReveal, onDone]);

  if (gone) return null;

  return (
    <div ref={root} data-preloader className="pl-giveup fixed inset-0 z-[100] text-bone" aria-hidden>
      <div className="pl-left absolute inset-y-0 left-0 w-[calc(50%+1px)] bg-ink" />
      <div className="pl-right absolute inset-y-0 right-0 w-[calc(50%+1px)] bg-ink" />

      {/* inset hairline frame with corner ticks */}
      <div className="pl-frame pointer-events-none absolute inset-4 border border-bone/[0.07] md:inset-6">
        {["-left-[5px] -top-[5px]", "-right-[5px] -top-[5px]", "-bottom-[5px] -left-[5px]", "-bottom-[5px] -right-[5px]"].map((p) => (
          <span key={p} className={`absolute ${p} h-[9px] w-[9px]`}>
            <span className="absolute left-[4px] top-0 h-full w-px bg-bone/40" />
            <span className="absolute left-0 top-[4px] h-px w-full bg-bone/40" />
          </span>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[min(560px,80vw)]">
          {/* MS monogram (transparent cutout, native 497×480): fixed height + auto width keeps its ratio.
              GSAP fades the outer row out on exit, CSS fades the inner mark in — separate elements */}
          <div className="pl-row mx-auto mb-10 w-fit md:mb-12">
            <div className="pl-logo">
              <Image
                src={withBase("/images/logo.webp")}
                alt=""
                width={497}
                height={480}
                priority
                className="h-28 w-auto md:h-36"
                style={{ filter: "brightness(1.3) drop-shadow(0 0 26px color-mix(in srgb, var(--color-signal) 55%, transparent))" }}
              />
            </div>
          </div>
          <div className="pl-row hud flex justify-between gap-6 text-bone/45">
            <span>{site.name}</span>
            <span>{site.role} — Portfolio</span>
          </div>
          <div className="pl-track relative mt-4 h-px bg-bone/15">
            <div ref={fill} className="absolute inset-0 origin-left bg-bone" style={{ transform: "scaleX(0)" }} />
          </div>
          <div className="pl-row hud mt-4 flex justify-between gap-6 text-bone/45">
            <span className="shrink-0 text-bone">
              ▸ Loading — <span ref={count} className="tabular-nums">000</span>%
            </span>
            <span ref={file} className="min-w-0 truncate text-right" />
          </div>
        </div>
      </div>

      <div
        className="pl-vline pointer-events-none absolute top-0 h-full w-px bg-bone/70"
        style={{ left: "calc(50% - 0.5px)", transform: "scaleY(0)" }}
      />
    </div>
  );
}
