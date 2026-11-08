"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, reducedMotion, withBase } from "@/lib/fx";
import { projects, type Project } from "@/content";

/** Generated cover used until a real project image is supplied. */
function Cover({ p, i }: { p: Project; i: number }) {
  if (p.image) return <Image src={withBase(p.image)} alt={p.title} fill sizes="(max-width:768px) 100vw, 420px" className="object-cover" />;
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
      <span className="absolute bottom-3 left-4 text-[96px] font-[800] leading-none tracking-[-0.06em] text-white/90">
        {String(i + 1).padStart(2, "0")}
      </span>
      <span className="hud absolute right-4 top-6 text-white/70">{p.title}</span>
    </div>
  );
}

export default function Work() {
  const [active, setActive] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);

  // floating preview + "view" cursor follow the pointer; preview tilts with horizontal velocity
  useEffect(() => {
    if (!preview.current || !cursor.current || window.matchMedia("(pointer: coarse)").matches) return;
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
    const ctx = gsap.context(() => {
      gsap.from(".work-row", {
        opacity: 0,
        y: 40,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".work-list", start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const shown = active !== null;

  return (
    <section id="work" ref={root} data-theme="light" className="relative bg-bone px-5 pb-28 md:px-10 md:pb-40">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex items-end justify-between md:mb-12">
          <p className="hud text-ink/50">(02) — Selected work</p>
          <p className="hud text-ink/50">
            Index <sup>{String(projects.length).padStart(2, "0")}</sup>
          </p>
        </div>

        {/* desktop list */}
        <ul className="work-list hidden md:block" onPointerLeave={() => setActive(null)}>
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

        {/* mobile cards */}
        <ul className="grid gap-12 md:hidden">
          {projects.map((p, i) => (
            <li key={p.title}>
              <a href={p.href || "#work"} onClick={(e) => !p.href && e.preventDefault()} className="block">
                <div className="notch relative aspect-[4/3] overflow-hidden">
                  <Cover p={p} i={i} />
                </div>
                <div className="mt-4 flex items-baseline justify-between border-b border-ink/15 pb-4">
                  <span className="text-[34px] leading-none tracking-[-0.04em]">{p.title}</span>
                  <span className="hud text-ink/50">{p.year}</span>
                </div>
                <p className="mt-3 text-[14px] text-ink/60">{p.kind}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* floating preview (desktop) */}
      <div
        ref={preview}
        className="pointer-events-none fixed left-0 top-0 z-40 hidden md:block"
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
      <div ref={cursor} className="pointer-events-none fixed left-0 top-0 z-[45] hidden md:block" aria-hidden>
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
