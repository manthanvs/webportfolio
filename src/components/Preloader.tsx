"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { reducedMotion } from "@/lib/fx";

const DURATION = 1600; // ms of counting before the curtain lifts

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [show, setShow] = useState(true);
  const done = useRef(onDone);

  useEffect(() => {
    const total = reducedMotion() ? 0 : DURATION;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = total ? Math.min(1, (now - start) / total) : 1;
      setPct(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setShow(false), total ? 250 : 0);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Monogram inflates from hairline to heavy as loading progresses (variable wght axis).
  const weight = 200 + (pct / 100) * 600;

  return (
    <AnimatePresence onExitComplete={() => done.current()}>
      {show && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] text-bone"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <div className="absolute inset-0 bg-ink" />
          {/* curved trailing edge of the curtain */}
          <motion.div
            className="absolute left-[-10%] top-full h-[14vh] w-[120%] rounded-b-[50%] bg-ink"
            exit={{ scaleY: 0 }}
            style={{ transformOrigin: "top" }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          />
          <div className="relative flex h-full flex-col items-center justify-center gap-10">
            <span
              className="text-[22vw] leading-none tracking-[-0.06em] md:text-[12vw]"
              style={{ fontWeight: weight, fontVariationSettings: `"wdth" ${75 + pct / 4}` }}
            >
              MS
            </span>
            <div className="w-[min(420px,70vw)]">
              <div className="h-px w-full bg-bone/15">
                <div className="h-px bg-bone" style={{ width: `${pct}%` }} />
              </div>
              <div className="hud mt-2 flex justify-between text-bone/60">
                <span>▸ Loading — {String(pct).padStart(3, "0")}%</span>
                <span>Portfolio</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
