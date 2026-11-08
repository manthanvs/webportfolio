"use client";

import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, scroller, reducedMotion, useTouchCursor } from "@/lib/fx";
import Preloader from "./Preloader";
import Header from "./Header";
import Hero from "./Hero";
import Intro from "./Intro";
import Work from "./Work";
import About from "./About";
import Footer from "./Footer";

type Phase = "loading" | "reveal" | "done";

export default function Site() {
  // One phase drives every intro animation, so the loader exit, hero entrance and header never run on separate clocks.
  const [phase, setPhase] = useState<Phase>("loading");
  const onReveal = useCallback(() => setPhase("reveal"), []);
  const onDone = useCallback(() => setPhase("done"), []);
  useTouchCursor();

  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    if (reducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09 });
    scroller.lenis = lenis;
    lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      scroller.lenis = null;
    };
  }, []);

  useEffect(() => {
    if (phase !== "done") return;
    scroller.lenis?.start();
    ScrollTrigger.refresh();
  }, [phase]);

  return (
    <>
      <Preloader onReveal={onReveal} onDone={onDone} />
      <Header visible={phase !== "loading"} />
      <main>
        <Hero play={phase !== "loading"} />
        {/* content sheet: slides up over the pinned hero (desktop), overlaps its bottom edge (mobile) */}
        <div className="relative z-10 -mt-7 overflow-clip rounded-t-[28px] bg-bone shadow-[0_-30px_60px_rgba(0,0,0,0.18)] md:mt-0 md:rounded-t-[44px]">
          <Intro />
          <Work />
          <About />
        </div>
      </main>
      <Footer />
    </>
  );
}
