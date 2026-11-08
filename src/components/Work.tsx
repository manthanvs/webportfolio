"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { DESK, gsap, reducedMotion, withBase } from "@/lib/fx";
import { projects, type Project } from "@/content";

/** Generated cover used until a real project image is supplied. `bare`: art only, for text laid over it. */
function Cover({ p, i, bare }: { p: Project; i: number; bare?: boolean }) {
  if (p.image) return <Image src={withBase(p.image)} alt={bare ? "" : p.title} fill sizes="(max-width:768px) 100vw, 420px" className="object-cover" />;
  return (
    <div
      className="absolute inset-0"
      style={{
        // dusky purples matching the logo (≈ #884ebc highlight, #301249 shadow at hue 272); hue varies per project
        background: `radial-gradient(80% 70% at 75% 20%, hsl(${p.hue} 45% 52% / .9), transparent 60%),
          radial-gradient(70% 80% at 10% 100%, hsl(${p.hue} 60% 18%), transparent 70%),
          #15161a`,
      }}
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {!bare && (
        <>
          <span className="absolute bottom-3 left-4 text-[96px] font-[800] leading-none tracking-[-0.06em] text-white/90">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="hud absolute right-4 top-6 text-white/70">{p.title}</span>
        </>
      )}
    </div>
  );
}

/** Touch row text. Drawn twice: dark on the page, white inside the scanner, so it changes colour exactly at the moving edge. */
function RowText({ p, i, className = "" }: { p: Project; i: number; className?: string }) {
  const move = "transition-transform duration-700 ease-out-expo";
  return (
    <span className={`flex flex-col justify-between gap-5 pb-5 pt-7 ${className}`}>
      <span className="hud flex justify-between">
        <span className={`${move} group-on:translate-x-4`}>{String(i + 1).padStart(2, "0")}</span>
        <span className={`${move} group-on:-translate-x-4`}>{p.year}</span>
      </span>
      <span className={`block ${move} group-on:translate-x-4`}>
        <span className="block text-[clamp(24px,min(9.4vw,13svh),64px)] font-[450] leading-none tracking-[-0.045em]">{p.title}</span>
        <span className="mt-2.5 block pr-[76px] text-[14px] leading-snug">{p.kind}</span>
      </span>
    </span>
  );
}

export default function Work() {
  const [active, setActive] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);

  // floating preview + "view" cursor follow the pointer; preview tilts with horizontal velocity
  useEffect(() => {
    if (!preview.current || !cursor.current || !window.matchMedia(DESK).matches) return;
    const pX = gsap.quickTo(preview.current, "x", { duration: 0.8, ease: "power3" });
    const pY = gsap.quickTo(preview.current, "y", { duration: 0.8, ease: "power3" });
    const rot = gsap.quickTo(preview.current, "rotation", { duration: 0.6, ease: "power3" });
    const cX = gsap.quickTo(cursor.current, "x", { duration: 0.45, ease: "power3" });
    const cY = gsap.quickTo(cursor.current, "y", { duration: 0.45, ease: "power3" });
    let last = 0;
    const move = (e: PointerEvent) => {
      pX(e.clientX);
      pY(e.clientY);
      cX(e.clientX);
      cY(e.clientY);
      if (!reducedMotion()) rot(gsap.utils.clamp(-8, 8, (e.clientX - last) * 0.6));
      last = e.clientX;
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    if (reducedMotion()) return;
    const desk = window.matchMedia(DESK).matches;
    const ctx = gsap.context(() => {
      gsap.from(desk ? ".work-row" : ".work-touch-row", {
        opacity: 0,
        y: 40,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: desk ? ".work-list" : ".work-touch-list", start: "top 80%" },
      });
      // depth: each cover's art drifts inside its frame while the page moves
      if (!desk)
        gsap.utils.toArray<HTMLElement>(".work-art").forEach((art) =>
          gsap.fromTo(art, { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: art.parentElement, start: "top bottom", end: "bottom top", scrub: true } }),
        );
    }, root);
    return () => ctx.revert();
  }, []);

  const shown = active !== null;

  return (
    <section id="work" ref={root} data-theme="light" className="relative bg-bone px-5 pb-28 md:px-10 md:pb-40">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-4 flex items-end justify-between desk:mb-12">
          <p className="hud text-ink/50">(02) — Selected work</p>
          <p className="hud text-ink/50">
            Index <sup>{String(projects.length).padStart(2, "0")}</sup>
          </p>
        </div>
        <p className="hud mb-8 text-ink/50 desk:hidden">Scroll to preview · Tap to open</p>

        {/* with a cursor: hover a row, its cover floats along */}
        <ul className="work-list hidden desk:block" onPointerLeave={() => setActive(null)}>
          <li className="hud grid grid-cols-12 border-b border-ink/15 pb-3 text-ink/40">
            <span className="col-span-1">No.</span>
            <span className="col-span-6">Project</span>
            <span className="col-span-4">Discipline</span>
            <span className="col-span-1 text-right">Year</span>
          </li>
          {projects.map((p, i) => (
            <li key={p.title} className="work-row">
              <a
                href={p.href || "#work"}
                target={p.href ? "_blank" : undefined}
                rel="noreferrer"
                onClick={(e) => !p.href && e.preventDefault()}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className={`grid cursor-none grid-cols-12 items-center border-b border-ink/15 py-10 transition-opacity duration-500 lg:py-12 ${
                  shown && active !== i ? "opacity-30" : "opacity-100"
                }`}
              >
                <span className="hud col-span-1 text-ink/50">{String(i + 1).padStart(2, "0")}</span>
                <span
                  className={`col-span-6 text-[clamp(40px,5.6vw,92px)] font-[450] leading-none tracking-[-0.045em] transition-transform duration-700 ease-out-expo ${
                    active === i ? "translate-x-4" : ""
                  }`}
                >
                  {p.title}
                </span>
                <span className="col-span-4 text-[15px] text-ink/70">{p.kind}</span>
                <span className="hud col-span-1 text-right text-ink/50">{p.year}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* touch: no hover, so the row crossing the middle of the screen scans open. A tap always opens the link. */}
        <ul className="work-touch-list border-t border-ink/15 desk:hidden">
          {projects.map((p, i) => (
            <li key={p.title} className="work-touch-row border-b border-ink/15">
              <a
                href={p.href || "#work"}
                target={p.href ? "_blank" : undefined}
                rel="noreferrer"
                onClick={(e) => !p.href && e.preventDefault()}
                data-focus="line"
                className="group relative block"
              >
                <RowText p={p} i={i} className="min-h-[clamp(148px,24svh,220px)]" />
                {/* the About portrait's scanner: the cover opens from a centre line, signal edges travel out with it */}
                <span className="notch absolute inset-0" aria-hidden>
                  <span className="absolute inset-0 overflow-hidden text-white transition-[clip-path] duration-[600ms] ease-in-out-quart [clip-path:inset(50%_0)] group-on:[clip-path:inset(0)]">
                    <span className="work-art absolute inset-x-0 -inset-y-[14%] block">
                      <Cover p={p} i={i} bare />
                    </span>
                    <RowText p={p} i={i} className="absolute inset-0" />
                  </span>
                </span>
                <span className="absolute inset-x-0 top-1/2 h-px bg-signal opacity-0 transition-[top] duration-[600ms] ease-in-out-quart group-on:top-0 group-on:animate-[scan-edge_.7s_both]" aria-hidden />
                <span className="absolute inset-x-0 top-1/2 h-px bg-signal opacity-0 transition-[top] duration-[600ms] ease-in-out-quart group-on:top-full group-on:animate-[scan-edge_.7s_both]" aria-hidden />
                <span
                  className="absolute bottom-3 right-3 grid size-[52px] scale-0 place-items-center rounded-full bg-signal text-[13px] text-bone transition-transform duration-500 ease-out-expo group-on:scale-100 group-on:delay-200"
                  aria-hidden
                >
                  {p.href ? "Visit" : "Soon"}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* floating preview: needs a real cursor */}
      <div
        ref={preview}
        className="pointer-events-none fixed left-0 top-0 z-40 hidden desk:block"
        style={{ width: 0, height: 0 }}
        aria-hidden
      >
        <div
          className={`notch absolute -left-[200px] -top-[150px] h-[300px] w-[400px] overflow-hidden transition-transform duration-500 ease-out-expo ${
            shown ? "scale-100" : "scale-0"
          }`}
        >
          <div
            className="absolute inset-0 transition-transform duration-700 ease-out-expo"
            style={{ transform: `translateY(${-(active ?? 0) * 100}%)` }}
          >
            {projects.map((p, i) => (
              <div key={p.title} className="relative h-full w-full">
                <Cover p={p} i={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div ref={cursor} className="pointer-events-none fixed left-0 top-0 z-[45] hidden desk:block" aria-hidden>
        <div
          className={`absolute -left-11 -top-11 grid h-[88px] w-[88px] place-items-center rounded-full bg-signal text-[14px] text-bone transition-transform duration-500 ease-out-expo ${
            shown ? "scale-100" : "scale-0"
          }`}
        >
          {projects[active ?? 0]?.href ? "Visit" : "Soon"}
        </div>
      </div>
    </section>
  );
}
