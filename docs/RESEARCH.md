# Reference research & design strategy

Captured 2026-11-08 with the in-app browser (1024×768 desktop viewport), DOM/computed-style
inspection via JS, and a read of each site's public script/stylesheet list.
Nothing below copies source code, assets or branding — it records *patterns*.

Legend: **[O]** observed directly · **[I]** inferred from code names / structure, not seen running · **[?]** not verified

---

## 1. dennissnellenberg.com (primary)

### Stack
- [O] jQuery 3.5, GSAP 3.9.1 + ScrollTrigger, Barba.js 2.10 (page transitions), Locomotive Scroll (smooth scroll, `data-scroll-container`), vanilla-lazyload.
- [O] One custom typeface ("Dennis Sans") at weights 300 / 450 / 800. Body weight is **450**, not 400 — slightly heavier than default, gives the "premium grotesk" feel.

### Palette
- [O] Ink `rgb(28,29,32)` (#1C1D20) — never pure black. Hero bg `rgb(153,157,158)` matches the portrait's studio-grey backdrop so photo and page merge.
- [O] White content sections; dark footer. Essentially monochrome + photography.

### Layout & hierarchy (home, top → bottom)
1. [O] **Preloader** — dark full screen, a dot + "Hello" cycling through languages ("おい", "Guten tag" …), then lifts away. In code it animates a `.rounded-div-wrap.bottom` [I] → the curtain exits with a curved edge.
2. [O] **Hero** (`header.home-header`, ~115vh) — cutout portrait centred, giant name `h1` at **153.6px / line-height 1** running as an infinite horizontal marquee ("Dennis Snellenberg —"). Left: a black pill hugging the left edge "Located in the Netherlands" + rotating globe. Right: "↘" arrow + "Freelance / Designer & Developer" (24.8px).
3. [O] Top bar: "© Code by Dennis" (hover reveals more of the name [I]), plain text nav Work / About / Contact.
4. [O] On scroll the nav collapses into a **round dark hamburger button** pinned top-right (magnetic [I] — `.magnetic` class).
5. [O] **Intro** — large statement paragraph + a large dark circular "About me" button that sits half over the section edge.
6. [O] **Work** — desktop: a list (`mouse-pos-list`, 44 references in JS [I]) with a floating preview image + "View" circle that follow the cursor. Second layout: 2-col tiles with framed screenshots on tinted backgrounds, title 39px below.
7. [O] Pill "More work ¹¹" button with superscript count.
8. [O] **Section joins are curved**: a white section ends in an elliptical bottom edge over the dark footer; the curve height is scroll-scrubbed (`rounded-div`, `scrub` [I]).
9. [O] **Footer** — "Let's work together", round "Get in touch" button, email + phone pills, Version / Local time (live clock) / Socials columns.

### Motion vocabulary
- [I from JS] Eases: `Power4.easeInOut` (curtains), `Expo.easeOut` / `Power4.easeOut` (reveals), `linear` for marquees; typical durations 0.6–1s; marquee loop 18s.
- [O] Marquee direction flips with scroll direction [I: `xPercent` tween + ScrollTrigger direction].
- [O] Everything restrained: no 3D, no colour animation; motion carries the premium feel.

### Responsive
- [?] Not tested at phone width (pane was hidden → rAF throttled). From CSS names: list view → tile grid on mobile [I].

---

## 2. kprverse.com (secondary)

### Stack
- [O] Nuxt (`/_nuxt/entry.*.js`), one WebGL2 `<canvas>` full-viewport, background `.webm` videos (topography loop, object FX). No global THREE (bundled/custom renderer [I]).
- [O] Fonts: ABC Whyte Inktrap (variable, 125–950 weight) for display, IBM Plex Mono for HUD labels, Hexaframe/Fraktion accents, Noto CJK.

### Signature moments
1. [O] **Loader**: hairline progress bar, mono "▶▶ LOADING - 100%" / "LOADING ATTRIBUTES", circular "click to enable sound" control.
2. [O] **Logo weight morph**: "K" drawn as a thin stroke, then the letters inflate to ultra-black weight (variable-font weight animation), then a vertical hairline splits the screen and the illustrated hero is revealed. Scroll is **locked** until the intro finishes.
3. [O] **HUD frame**: the whole site lives inside an inset rounded rectangle with hairline rules; a left rail holds a crosshair glyph and a tiny page counter; top bar has dot-prefixed mono nav (active item marked "•").
4. [O] **Stacked display type** "KEEP. / PROTECT. / REIMAGINE." in ultra-black, tight tracking, staggered horizontally, tiny mono index labels ("01K", "02P") beside each line.
5. [O] **Notched / folder-tab image masks** — images clipped with chamfered tabs instead of plain rectangles.
6. [O] **Scramble text**: every link's DOM contains the label plus random glyphs ("STORY STFP", "JOURNAL JOUOU") → letters scramble on hover/reveal.
7. [O] **WebGL point-cloud wave** drifting over a painted landscape; giant icon glyph overlays; full-bleed colour-field sections (lavender) with a fanned 3D carousel of cards.
8. [O] Terminal/console copy ("// INITIALIZING NEW FILES IN DATABASE").

### What to *not* take
- Scroll-locked intros that run 10s+ (hurts a portfolio), sound, NFT/brand illustration style, the K-P-R letterforms, Whyte Inktrap.

---

## 3. Design strategy — "Signal"

One idea ties it together: **a calm, editorial portfolio (Dennis) that occasionally "tunes in" to an instrument-panel layer (KPR)**. Clean by default; the HUD appears only at specific moments.

| Decision | Source pattern | Original twist |
|---|---|---|
| Studio-grey hero that matches the portrait backdrop | Dennis [O] | Colour sampled from Manthan's own photo (cool lavender-grey) |
| Giant name marquee behind/over portrait, direction tied to scroll | Dennis [O] | Marquee speed reacts to scroll *velocity*, not just direction |
| Monogram preloader | KPR weight morph [O] + Dennis curtain [O] | "MS" monogram inflates 200→800 weight on a variable grotesk while a mono % counter runs; ~1.6s total, never scroll-locked longer |
| Ink #111214 not black, bone #ECEAE5 not white, one accent | Dennis restraint | Accent "signal orange" #FF5A1F used only for live/active states |
| Body grotesk + mono HUD labels | Dennis type / KPR mono [O] | Bricolage Grotesque (variable wght+width) + JetBrains Mono |
| Scramble on nav hover | KPR [O] | Only on nav + section labels, ~350ms |
| Cursor-following project preview | Dennis [O] | Preview uses a chamfered corner mask (KPR notch idea) and tilts with velocity |
| Curved section joins | Dennis [O] | Kept, scrubbed by GSAP |
| Immersive moment | KPR point cloud [O] | Three.js particle "signal field" that the cursor disturbs, scroll-pinned with HUD captions — the one WebGL moment |
| Magnetic round buttons | Dennis [O] | Same mechanic, own styling |

Performance rules: one WebGL canvas, paused when off-screen; `prefers-reduced-motion` disables marquee/scramble/particles; images via `next/image`.

---

## 4. Pass 2 (2026-11-08) — feedback round

Feedback: loader looked off, Home "not working properly", transitions overlapping, remove the Interlude, more
KPRVERSE immersion in About and overall. Captured with Playwright filmstrips (headless Chrome, 1440×900) of both
the old build and kprverse.com, plus a per-element scroll-speed probe and a scan of KPR's public JS bundles.

### Bugs found in pass 1 (observed in filmstrips)
- **Load glitch [O]:** at ~2.9s the curtain lifted onto a fully drawn hero, then at ~3.5s the name rows vanished and
  the portrait re-faded in — the loader exit and hero entrance ran on separate clocks.
- **Hero broke on first scroll [O]:** after 120px of wheel both name rows disappeared. The entrance (`from yPercent 110`)
  and the scroll parallax (`to yPercent -40`) targeted the *same* elements, so the parallax recorded 110 as its start.
- **Menu button lag [I from code]:** a CSS `transition-transform` on the same element as the GSAP magnetic transform.

### KPRVERSE, second look
- [O] Loader: white page, one hairline bar, mono `LOADING — n%` left, the real asset URLs being fetched streaming on the
  right, sound toggle below; a morphing glyph grid resolves into the logo.
- [O] Scroll: the full-bleed hero shrinks into a notched "folder-tab" card; images in a section move at different speeds;
  the next section is revealed through a widening vertical slit; a glyph-grid wipe between sections; eye-detail crops
  in notched frames next to the main art; a 3D fanned carousel (cards at `translateZ` −80…−320px).
- [O] DOM: full-screen sections parked at `translateY(900px)` (100vh) and slid over the previous one; heading lines start
  at `translateY` 0/45/90/135px inside masks (line-by-line reveal).
- [O] Bundles: GSAP + ScrollTrigger (136 refs) and SplitText in the Nuxt entry; OGL (WebGL) in the main bundle.

### Changes
| Area | Change | Source |
|---|---|---|
| Loader | Hairline bar, name/role labels, real progress (fonts + hero portrait), last-loaded file name; bar collapses into a vertical line that splits the screen open | KPR loader + vertical-line intro [O] |
| Sequencing | One `loading → reveal → done` phase in `Site.tsx`; the hero's hidden state is set before first paint and its entrance starts as the split opens | fixes load glitch |
| Hero | Entrance on inner elements, scroll/pointer parallax on wrappers; desktop pins the hero while a rounded content sheet slides over it, the frame shrinking into a notched card with depth-ordered layers; flex centring instead of CSS translate | KPR hero→card + stacked sections [O]; fixes scroll bug |
| Hero photo | Now the B&W portrait (user's choice); backdrop sampled from its near-black studio (edges #040404–#080808, faint ~#0e spotlight) so the masked photo edges vanish; the dark hero continues the ink loader into the split reveal | — |
| Photos | Colour headshot moved to the About main frame; B&W eye-line crop as the About detail strip — both photos in the dossier | — |
| Interlude | Removed, with `three` / `@types/three` | feedback |
| About | Collage at three parallax depths (portrait, 3× eye-line detail, data card using only content.ts facts), scanner reveal with signal edges, stacked heavy type with index labels drifting apart, SplitText masked lines, rotating crosshair | KPR detail crops, line masks, layered parallax, crosshair [O] |
| Header | Magnetic button and its CSS scale-in split onto separate elements; header fades in at reveal | fixes lag |
