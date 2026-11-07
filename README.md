# Manthan Sankpal — Portfolio

Personal developer portfolio of **Manthan Sankpal**: an editorial, motion-driven site with a cinematic intro,
layered parallax and a scroll-stacked layout.

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · GSAP (ScrollTrigger, SplitText) · Lenis · Framer Motion

## How this was made

I designed and built this website with the help of **Artificial Intelligence** (Claude Code by Anthropic) and
**[Reverse Engineer Anything (REA)](https://github.com/morluto/rea)**.

Two award-level sites served as references: [Dennis Snellenberg](https://dennissnellenberg.com/) for layout,
typography and motion, and [KPRVERSE](https://kprverse.com/) for immersive transitions and layered parallax.
Their structure, scroll behaviour and animation patterns were studied following REA's reverse-engineering workflow,
together with browser and Playwright inspection (frame-by-frame recordings and scroll-speed measurements). The
findings are documented in [`docs/RESEARCH.md`](docs/RESEARCH.md) and were reworked into an original design —
no code, assets or branding were copied from either site.

## Highlights

- **Loader** — hairline bar driven by real asset progress; it collapses into a vertical line that splits the screen
  open onto the hero.
- **Hero** — black-and-white portrait between two name marquees whose speed follows scroll velocity; on desktop it
  pins while the content sheet slides over it and the frame shrinks into a notched card.
- **Selected work** — project index with a cursor-following preview that tilts with pointer velocity.
- **About** — a layered "dossier": portrait, detail crop and profile card at three parallax depths, a scanner-style
  reveal and line-by-line masked copy.
- **Details** — magnetic buttons, scramble-text navigation, a header that adapts to light and dark sections, and
  full `prefers-reduced-motion` support.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
npm run test:visual -- http://localhost:3000   # Playwright smoke test (uses installed Chrome), screenshots → tests/shots
```

## Editing content

All personal content lives in [`src/content.ts`](src/content.ts): name, role, email, social links and projects.
The intro line and About paragraphs are still placeholder copy marked `TODO`.

Projects use a generated cover until you add an image to `public/images/work/` and set `image` on the project.

Photos: `public/images/portrait-bw.jpg` (black & white — hero, About detail strip) and `public/images/portrait.png`
(colour — About main frame, footer avatar). The hero backdrop is sampled from the B&W photo's near-black studio.

## Project structure

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

## Connect

- GitHub — [github.com/manthanvs](https://github.com/manthanvs)
- LinkedIn — [linkedin.com/in/manthanvs](https://www.linkedin.com/in/manthanvs/)
- LeetCode — [leetcode.com/u/manthanvs](https://leetcode.com/u/manthanvs/)
- HackerRank — [hackerrank.com/profile/manthanvs](https://www.hackerrank.com/profile/manthanvs)
- Email — [manthansankpal745@gmail.com](mailto:manthansankpal745@gmail.com)
"# portfolio2" 
