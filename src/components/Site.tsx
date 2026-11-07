"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, scroller, reducedMotion } from "@/lib/fx";
import Preloader from "./Preloader";
import Header from "./Header";
import Hero from "./Hero";
import Intro from "./Intro";
import Work from "./Work";
import SignalSection from "./SignalSection";
import About from "./About";
import Footer from "./Footer";

export default function Site() {
  const [ready, setReady] = useState(false);

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
    if (!ready) return;
    scroller.lenis?.start();
    ScrollTrigger.refresh();
  }, [ready]);

  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <Header />
      <main>
        <Hero ready={ready} />
        <Intro />
        <Work />
        <SignalSection />
        <About />
      </main>
      <Footer />
    </>
  );
}
