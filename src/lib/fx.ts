"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);
export { gsap, ScrollTrigger, SplitText };

/** useLayoutEffect on the client (sets initial animation states before first paint), useEffect on the server. */
export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Single Lenis instance, set by <Site>.
export const scroller: { lenis: Lenis | null } = { lenis: null };

export function scrollTo(target: string | number) {
  if (scroller.lenis) scroller.lenis.scrollTo(target, { duration: 1.4 });
  else if (typeof target === "string") document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  else window.scrollTo({ top: target, behavior: "smooth" });
}

/** Prefix a /public path with the deploy base path ("/webportfolio" on GitHub Pages) — next/image doesn't do it. */
export const withBase = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** How long the loader may wait for the scripts before it leaves by itself. Same delay as .pl-giveup in globals.css. */
const GIVE_UP_MS = 8000;
/** The scripts arrived after the page had already shown itself (or just as it would): no loader, no entrance, nothing re-hidden. */
export const lateStart = typeof window !== "undefined" && performance.now() > GIVE_UP_MS - 500;

/** A real cursor on a wide screen. Same query as the `desk` variant in globals.css. */
export const DESK = "(min-width: 768px) and (hover: hover) and (pointer: fine)";

/**
 * Touch stand-in for hover, read by the `on:` and `group-on:` variants in globals.css. Call once.
 * - Finger down: the hovered look plays on the link or button under it (data-press), held long enough
 *   to be seen on a quick tap, and dropped if the finger turns out to be scrolling.
 * - Scrolling: elements count as hovered around the middle of the screen (data-on). data-focus="line" is the exact
 *   middle, so one row of a list at a time; "zone" is the middle half, for a lone button that may never reach the line.
 */
export function useTouchCursor() {
  useEffect(() => {
    const press = (e: PointerEvent) => {
      const el = e.pointerType === "mouse" ? null : (e.target as Element).closest("a,button");
      if (!el) return;
      const on = setTimeout(() => el.setAttribute("data-press", ""), 70);
      const end = (ev: Event) => {
        clearTimeout(on);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
        if (ev.type === "pointercancel") return el.removeAttribute("data-press");
        el.setAttribute("data-press", "");
        setTimeout(() => el.removeAttribute("data-press"), 400);
      };
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
    };
    document.addEventListener("pointerdown", press, { passive: true });

    const watch = (focus: string, rootMargin: string) => {
      const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.toggleAttribute("data-on", e.isIntersecting)), { rootMargin });
      document.querySelectorAll(`[data-focus=${focus}]`).forEach((el) => io.observe(el));
      return io;
    };
    const watchers = window.matchMedia(DESK).matches ? [] : [watch("line", "-50% 0px -50% 0px"), watch("zone", "-25% 0px -25% 0px")];

    return () => {
      document.removeEventListener("pointerdown", press);
      watchers.forEach((io) => io.disconnect());
    };
  }, []);
}

/** Element drifts toward the pointer while hovered, springs back on leave. */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches || reducedMotion()) return;
    const ease = "elastic.out(1, 0.35)";
    const xTo = gsap.quickTo(el, "x", { duration: 0.9, ease });
    const yTo = gsap.quickTo(el, "y", { duration: 0.9, ease });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return ref;
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_";

/** Returns text that scrambles into place whenever `trigger` changes to true. */
export function useScramble(text: string, trigger: boolean, duration = 380) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!trigger || reducedMotion()) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const settled = Math.floor(p * text.length);
      setOut(
        text
          .split("")
          .map((c, i) => (i < settled || c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join(""),
      );
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, trigger, duration]);
  return trigger ? out : text;
}
