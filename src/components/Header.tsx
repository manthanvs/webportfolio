"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { scrollTo, scroller, useMagnetic, useScramble, withBase } from "@/lib/fx";
import { site } from "@/content";

const LINKS = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function NavLink({ label, href, onNavigate }: { label: string; href: string; onNavigate?: () => void }) {
  const [hover, setHover] = useState(false);
  const text = useScramble(label, hover);
  const ref = useMagnetic<HTMLAnchorElement>(0.4);
  return (
    <a
      ref={ref}
      href={href}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onClick={(e) => {
        e.preventDefault();
        onNavigate?.();
        scrollTo(href);
      }}
      className="group relative inline-block px-3 py-2 touch:py-3.5"
    >
      <span className="hud !text-[12px]">{text}</span>
      <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 scale-0 rounded-full bg-current transition-transform duration-300 group-on:scale-100" />
    </a>
  );
}

export default function Header({ visible }: { visible: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [light, setLight] = useState(false); // true when the header sits over a bone section
  const [open, setOpen] = useState(false);
  const [away, setAway] = useState(false); // touch: the name steps aside while scrolling down, so it never sits on the text
  const menuBtn = useMagnetic<HTMLButtonElement>(0.3);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 140);
      if (Math.abs(y - last) > 6) {
        setAway(y > last && y > 140);
        last = y;
      }
      // sample under the name (left), where legibility matters — skipping the header's own (clickable) name link;
      // dark images inside light sections declare data-theme="dark"
      const under = document
        .elementsFromPoint(48, 40)
        .find((el) => !el.closest("header"))
        ?.closest("[data-theme]");
      setLight(under?.getAttribute("data-theme") === "light");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) scroller.lenis?.stop();
    else scroller.lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-[color,opacity,translate,visibility] duration-700 ease-out-expo ${
          light ? "text-ink" : "text-white"
        } ${visible ? "opacity-100" : "-translate-y-3 opacity-0"} ${away ? "touch:invisible touch:-translate-y-3 touch:opacity-0" : ""}`}
      >
        <div className="flex items-center justify-between px-5 py-5 md:px-10 md:py-7">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollTo(0);
            }}
            className="group pointer-events-auto -my-2 flex items-center gap-2.5 py-2 text-[15px]"
          >
            {/* transparent MS mark at its native 99×96 ratio; over dark sections a soft purple glow
                lifts the dark metal M off the background */}
            <Image
              src={withBase("/images/logo-sm.webp")}
              alt=""
              width={99}
              height={96}
              className="h-[30px] w-auto shrink-0 transition-[scale,filter] duration-500 ease-out-expo group-on:scale-110"
              style={{ filter: light ? "none" : "brightness(1.6) drop-shadow(0 0 6px color-mix(in srgb, var(--color-signal-soft) 65%, transparent))" }}
            />
            <span className="overflow-hidden">
              <span className="inline-block">{site.name}</span>
            </span>
          </a>
          <nav
            className={`pointer-events-auto hidden items-center gap-1 transition-opacity duration-300 md:flex ${
              scrolled ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            aria-label="Primary"
          >
            {LINKS.map((l) => (
              <NavLink key={l.href} {...l} />
            ))}
          </nav>
        </div>
      </header>

      {/* Round menu button: always on mobile, appears after scroll on desktop.
          The wrapper owns the CSS scale-in; the button owns the GSAP magnetic transform — never both on one element. */}
      <div
        className={`fixed right-4 top-4 z-[70] transition-[scale,opacity] duration-500 ease-out-expo md:right-8 md:top-6 ${
          scrolled || open ? "scale-100" : "scale-100 md:scale-0"
        } ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <button
          ref={menuBtn}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className={`grid h-14 w-14 place-items-center rounded-full border border-white/10 transition-[background-color,color,scale] duration-300 data-press:scale-90 md:h-[72px] md:w-[72px] ${
            open ? "bg-signal text-bone" : "bg-ink text-bone"
          }`}
        >
          <span className="relative block h-3 w-6">
            <span
              className={`absolute left-0 h-px w-full bg-current transition-transform duration-500 ${open ? "top-1/2 rotate-45" : "top-0"}`}
            />
            <span
              className={`absolute left-0 h-px w-full bg-current transition-transform duration-500 ${open ? "top-1/2 -rotate-45" : "bottom-0"}`}
            />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-[60] bg-ink/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="menu"
              // short screens (a phone held sideways) scroll inside the panel, so every link stays reachable
              data-lenis-prevent
              className="fixed inset-y-0 right-0 z-[65] flex w-full flex-col justify-between gap-8 overflow-y-auto overscroll-contain bg-ink-2 px-8 pb-10 pt-[clamp(72px,13svh,112px)] text-bone sm:w-[460px] md:px-14"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            >
              {/* curved leading edge */}
              <motion.div
                className="absolute inset-y-[-10%] left-0 hidden w-[120px] -translate-x-[60%] rounded-[50%] bg-ink-2 sm:block"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                exit={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                style={{ transformOrigin: "right" }}
              />
              <div className="relative">
                <p className="hud mb-8 border-b border-bone/15 pb-4 text-bone/50">Navigation</p>
                <ul className="space-y-1">
                  {[{ label: "Home", href: "#top" }, ...LINKS].map((l, i) => (
                    <motion.li
                      key={l.href}
                      initial={{ x: 80, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.15 + i * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <a
                        href={l.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setOpen(false);
                          setTimeout(() => scrollTo(l.href === "#top" ? 0 : l.href), 350);
                        }}
                        className="group relative flex items-center text-[clamp(34px,min(11.5vw,10svh),64px)] leading-[1.1] tracking-[-0.03em]"
                      >
                        <span className="absolute -left-5 h-2 w-2 scale-0 rounded-full bg-signal transition-transform duration-300 group-on:scale-100" />
                        <span className="transition-transform duration-500 ease-out-expo group-on:translate-x-2">{l.label}</span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <p className="hud mb-3 text-bone/50">Socials</p>
                <div className="flex flex-wrap gap-x-6 text-[15px] touch:-my-1 desk:gap-y-6">
                  {site.socials.filter((s) => s.href).length ? (
                    site.socials
                      .filter((s) => s.href)
                      .map((s) => (
                        <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="transition-colors on:text-signal-soft touch:flex touch:h-11 touch:items-center">
                          {s.label}
                        </a>
                      ))
                  ) : (
                    <span className="text-bone/40">Add links in src/content.ts</span>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
