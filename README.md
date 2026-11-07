# Manthan Sankpal — Portfolio

Next.js 16 · TypeScript · Tailwind 4 · GSAP/ScrollTrigger · Lenis · Framer Motion · Three.js

```bash
npm run dev            # http://localhost:3000
npm run build && npm start
npm run test:visual -- http://localhost:3000   # Playwright smoke test (uses installed Chrome), screenshots → tests/shots
```

**Edit your content in `src/content.ts`** — intro, about, email, socials and projects are placeholders (marked TODO).
Add project images to `public/images/work/` and set `image` on a project; otherwise a generated cover is shown.

Design research and rationale: [`docs/RESEARCH.md`](docs/RESEARCH.md).

| Section | File |
|---|---|
| Preloader (monogram weight morph + curtain) | `src/components/Preloader.tsx` |
| Header, scramble nav, magnetic menu | `src/components/Header.tsx` |
| Hero (layered dual marquee, velocity-driven) | `src/components/Hero.tsx` |
| Work list + cursor preview | `src/components/Work.tsx` |
| WebGL "signal field" interlude | `src/components/SignalSection.tsx`, `SignalField.tsx` |
| About, Footer | `src/components/About.tsx`, `Footer.tsx` |
| Shared motion helpers | `src/lib/fx.ts` |
