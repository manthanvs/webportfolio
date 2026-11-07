"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { scrollTo, scroller, useMagnetic, useScramble } from "@/lib/fx";
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
      className="group relative inline-block px-3 py-2"
    >
      <span className="hud !text-[12px]">{text}</span>
      <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 scale-0 rounded-full bg-current transition-transform duration-300 group-hover:scale-100" />
    </a>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [light, setLight] = useState(false); // true when the header sits over a bone section
  const [open, setOpen] = useState(false);
  const menuBtn = useMagnetic<HTMLButtonElement>(0.3);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 140);
      const under = document.elementFromPoint(window.innerWidth / 2, 40)?.closest("[data-theme]");
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
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${light ? "text-ink" : "text-white"}`}
      >
        <div className="flex items-center justify-between px-5 py-5 md:px-10 md:py-7">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollTo(0);
            }}
            className="group pointer-events-auto flex items-center gap-2 text-[15px]"
          >
            <span className="transition-transform duration-500 ease-out-expo group-hover:rotate-[360deg]">©</span>
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

      {/* Round menu button: always on mobile, appears after scroll on desktop */}
      <button
        ref={menuBtn}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className={`fixed right-4 top-4 z-[70] grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-ink text-bone transition-transform duration-500 ease-out-expo md:right-8 md:top-6 md:h-[72px] md:w-[72px] ${
          scrolled || open ? "scale-100" : "scale-100 md:scale-0"
        } ${open ? "!bg-signal !text-ink" : ""}`}
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
              className="fixed inset-y-0 right-0 z-[65] flex w-full flex-col justify-between bg-ink-2 px-8 pb-10 pt-28 text-bone sm:w-[460px] md:px-14"
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
                        className="group relative flex items-center text-[clamp(44px,9vw,64px)] leading-[1.1] tracking-[-0.03em]"
                      >
                        <span className="absolute -left-5 h-2 w-2 scale-0 rounded-full bg-signal transition-transform duration-300 group-hover:scale-100" />
                        <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-2">{l.label}</span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <p className="hud mb-3 text-bone/50">Socials</p>
                <div className="flex flex-wrap gap-6 text-[15px]">
                  {site.socials.filter((s) => s.href).length ? (
                    site.socials
                      .filter((s) => s.href)
                      .map((s) => (
                        <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="hover:text-signal">
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
