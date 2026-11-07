# Manthan Sankpal — Portfolio

Next.js 16 · TypeScript · Tailwind 4 · GSAP (ScrollTrigger, SplitText) · Lenis · Framer Motion

```bash
npm run dev            # http://localhost:3000
npm run build && npm start
npm run test:visual -- http://localhost:3000   # Playwright smoke test (uses installed Chrome), screenshots → tests/shots
```

**Edit your content in `src/content.ts`** — intro, about, email, socials and projects are placeholders (marked TODO).
Add project images to `public/images/work/` and set `image` on a project; otherwise a generated cover is shown.

Photos: `public/images/portrait-bw.jpg` (black & white — hero, About detail strip) and `public/images/portrait.png`
(colour — About main frame, footer avatar). The hero backdrop is sampled from the B&W photo's near-black studio.

Design research and rationale: [`docs/RESEARCH.md`](docs/RESEARCH.md).

| Section | File |
|---|---|
| Intro sequencing (one `loading → reveal → done` phase), content sheet | `src/components/Site.tsx` |
| Preloader (hairline + real progress, split-screen reveal) | `src/components/Preloader.tsx` |
| Header, scramble nav, magnetic menu | `src/components/Header.tsx` |
| Hero (layered marquees, pinned hero → notched card, depth parallax) | `src/components/Hero.tsx` |
| Work list + cursor preview | `src/components/Work.tsx` |
| About (layered collage, scanner reveal, masked lines) | `src/components/About.tsx` |
| Footer | `src/components/Footer.tsx` |
| Shared motion helpers | `src/lib/fx.ts` |

Animation rule used throughout: an element is animated by **one** system only — entrance tweens target inner
elements, scroll/pointer parallax targets their wrappers, CSS transitions never share an element with GSAP transforms.
