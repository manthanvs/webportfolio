"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap, ScrollTrigger } from "@/lib/fx";

const SignalField = dynamic(() => import("./SignalField"), { ssr: false });

const STEPS = [
  { tag: "01 / Noise", line: "Every idea starts as noise." },
  { tag: "02 / Signal", line: "Engineering finds the pattern." },
  { tag: "03 / Form", line: "Design makes it something you can feel." },
];

/** Sticky WebGL stage; scrolling through 300vh tunes the field from chaos to order. */
export default function SignalSection() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => {
        progress.current = s.progress;
        setPct(Math.round(s.progress * 100));
        setStep(Math.min(STEPS.length - 1, Math.floor(s.progress * STEPS.length)));
      },
    });
    return () => st.kill();
  }, []);

  useEffect(() => {
    gsap.fromTo(".signal-line", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: "expo.out" });
  }, [step]);

  return (
    <section ref={root} data-theme="dark" className="relative h-[300vh] bg-ink text-bone" aria-label="Interlude">
      {/* curved join from the light section above */}
      <div className="absolute inset-x-0 top-0 z-10 h-[10vh] overflow-hidden">
        <div className="absolute left-[-10%] top-[-100%] h-[200%] w-[120%] rounded-b-[50%] bg-bone" />
      </div>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <SignalField progress={progress} />

        {/* HUD frame */}
        <div className="pointer-events-none absolute inset-4 border border-bone/10 md:inset-8" />
        <div className="pointer-events-none absolute inset-x-4 top-[84px] flex justify-between border-t border-bone/10 p-4 md:inset-x-8 md:top-[112px] md:p-5">
          <span className="hud text-bone/50">(—) Interlude</span>
          <span className="hud tabular-nums text-bone/50">Signal {String(pct).padStart(3, "0")}%</span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-[12%] px-8 md:bottom-[14%] md:px-16">
          <div className="mb-5 flex gap-2">
            {STEPS.map((s, i) => (
              <span key={s.tag} className={`h-px w-10 transition-colors duration-500 ${i <= step ? "bg-signal" : "bg-bone/20"}`} />
            ))}
          </div>
          <p className="hud mb-3 text-signal">{STEPS[step].tag}</p>
          <div className="overflow-hidden">
            <p
              key={step}
              className="signal-line max-w-[16ch] text-[clamp(38px,6.4vw,104px)] font-[300] leading-[0.98] tracking-[-0.045em]"
              style={{ fontVariationSettings: '"wdth" 80' }}
            >
              {STEPS[step].line}
            </p>
          </div>
        </div>

        <p className="hud pointer-events-none absolute bottom-10 right-10 hidden text-bone/40 md:block">Move the cursor ↯</p>
      </div>
      {/* curved join into the light section below */}
      <div className="absolute inset-x-0 bottom-0 z-10 h-[10vh] overflow-hidden">
        <div className="absolute bottom-[-100%] left-[-10%] h-[200%] w-[120%] rounded-t-[50%] bg-bone" />
      </div>
    </section>
  );
}
