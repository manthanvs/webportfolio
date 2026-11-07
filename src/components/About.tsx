"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, reducedMotion } from "@/lib/fx";
import { site } from "@/content";

export default function About() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-reveal", {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: "top 65%" },
      });
      if (reducedMotion()) return;
      gsap.fromTo(
        ".about-img",
        { yPercent: -8 },
        { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".about-frame", start: "top bottom", end: "bottom top", scrub: true } },
      );
      gsap.fromTo(
        ".about-frame",
        { clipPath: "inset(18% 12% 18% 12%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: ".about-frame", start: "top 90%", end: "top 30%", scrub: true } },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={root} data-theme="light" className="relative bg-bone px-5 py-28 md:px-10 md:py-44">
      <div className="mx-auto grid max-w-[1400px] gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <div className="notch relative aspect-[4/5] overflow-hidden">
            <div className="about-frame absolute inset-0 overflow-hidden bg-mist">
            <Image
              src="/images/portrait.png"
              alt={`${site.name}`}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="about-img scale-[1.18] object-cover object-[50%_30%]"
            />
            </div>
          </div>
          <div className="mt-3 flex justify-between">
            <span className="hud text-ink/50">Fig. 01</span>
            <span className="hud text-ink/50">{site.name}</span>
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7 md:pt-16">
          <p className="about-reveal hud mb-10 text-ink/50">(03) — About</p>
          <h2 className="about-reveal text-[clamp(48px,7vw,120px)] font-[500] leading-[0.92] tracking-[-0.05em]">
            Hi, I&apos;m <span className="font-[200] italic">{site.firstName}</span>.
          </h2>
          <div className="mt-12 space-y-6 text-[clamp(17px,1.3vw,20px)] leading-[1.55] text-ink/75">
            {site.about.map((p, i) => (
              <p key={i} className="about-reveal max-w-[52ch]">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
