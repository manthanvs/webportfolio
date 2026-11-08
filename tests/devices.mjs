// Effects and layout across screen sizes (dp), densities and input types. Run: node tests/devices.mjs [url]
// ONLY="iPhone|Pixel" limits it to matching devices. Screenshots → tests/shots/devices.
// This is emulation in Chrome: it complements, not replaces, trying the site on real phones.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const URL = process.argv[2] || "http://localhost:3000";
const OUT = "tests/shots/devices";
mkdirSync(OUT, { recursive: true });

// name, width dp, height dp, density, touch (css px = dp at width=device-width)
const DEVICES = [
  ["Galaxy Fold cover", 280, 653, 3, true],
  ["Low-end Android", 320, 533, 1, true],
  ["iPhone SE 1st gen", 320, 568, 2, true],
  ["Android compact", 360, 640, 1.5, true],
  ["Galaxy S", 360, 780, 3, true],
  ["iPhone SE 3rd gen", 375, 667, 2, true],
  ["iPhone 14", 390, 844, 3, true],
  ["Pixel 7", 412, 915, 2.625, true],
  ["Galaxy Ultra", 412, 883, 3.5, true],
  ["iPhone 15 Pro Max", 430, 932, 3, true],
  ["7-inch tablet", 600, 960, 2, true],
  ["Galaxy Fold inner", 673, 841, 2.625, true],
  ["Phone at custom density 293", 690, 1518, 1.83125, true], // 1264×2780 physical: a phone can be this wide in dp
  ["Phone at custom density 293 sideways", 1518, 690, 1.83125, true],
  ["iPhone SE 1st gen sideways", 568, 320, 2, true],
  ["iPhone SE 3rd gen sideways", 667, 375, 2, true],
  ["iPhone 14 sideways", 844, 390, 3, true],
  ["Pixel 7 sideways", 915, 412, 2.625, true],
  ["7-inch tablet sideways", 960, 600, 2, true],
  ["iPad Mini", 768, 1024, 2, true],
  ["iPad Air", 820, 1180, 2, true],
  ["iPad Pro", 1024, 1366, 2, true],
  ["iPad Air sideways", 1180, 820, 2, true],
  ["Narrow desktop window", 500, 800, 1, false],
  ["Laptop", 1366, 768, 1, false],
  ["Laptop HiDPI", 1440, 900, 2, false],
  ["Desktop FHD", 1920, 1080, 1, false],
  ["Desktop QHD", 2560, 1440, 1, false],
].filter(([name]) => !process.env.ONLY || new RegExp(process.env.ONLY, "i").test(name));

// Where the point between the eyes sits in the About photo, and where the golden section is
const EYES = [0.427, 0.409];
const GOLDEN = 38.2;

// Runs inside the page
function helpers() {
  const vis = (e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && e.checkVisibility({ checkVisibilityCSS: true });
  };
  // where a point of the About photo lands on screen, with object-fit, object-position and the live transform
  const photoPoint = (u, v) => {
    const img = document.querySelector(".ab-img");
    const box = img.getBoundingClientRect();
    const [px, py] = getComputedStyle(img).objectPosition.split(" ").map(parseFloat);
    const c = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
    const dw = img.naturalWidth * c, dh = img.naturalHeight * c;
    return [box.left + (box.width - dw) * (px / 100) + u * dw, box.top + (box.height - dh) * (py / 100) + v * dh];
  };
  window.__t = {
    vis,
    centre(sel, i = 0) {
      const r = document.querySelectorAll(sel)[i].getBoundingClientRect();
      window.scrollBy({ top: r.top + r.height / 2 - innerHeight / 2, behavior: "instant" });
    },
    cutOff() {
      const out = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) {
        const n = w.currentNode, el = n.parentElement;
        if (!n.nodeValue.trim() || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(el.tagName) || el.closest(".sr-only,.marquee-track") || !vis(el)) continue;
        const rg = document.createRange();
        rg.selectNodeContents(n);
        const b = rg.getBoundingClientRect();
        // past the screen edge, or past a clipping mask around it
        const mask = el.closest(".overflow-hidden")?.getBoundingClientRect();
        if (b.left < -1 || b.right > innerWidth + 1 || (mask && b.right > mask.right + 1 && !el.closest(".hero-card"))) out.push(n.nodeValue.trim().slice(0, 24));
      }
      return out;
    },
    smallTargets() {
      return [...document.querySelectorAll("a,button")]
        .filter(vis)
        .map((e) => [e.getBoundingClientRect(), (e.innerText || e.getAttribute("aria-label") || "").trim().slice(0, 20)])
        .filter(([r]) => r.width < 44 || r.height < 44)
        .map(([r, t]) => `${Math.round(r.width)}×${Math.round(r.height)} "${t}"`);
    },
    hero() {
      const box = (s) => document.querySelector(s).getBoundingClientRect();
      const a = box(".hero-depth-a"), b = box(".hero-depth-b"), p = box("[data-hero-portrait]");
      return { a: [a.top, a.bottom], b: [b.top, b.bottom], eyes: p.top + p.height * 0.27, vh: innerHeight };
    },
    rows() {
      return [...document.querySelectorAll(".work-touch-row a")].map((a) => ({
        on: a.hasAttribute("data-on"),
        clip: getComputedStyle(a.querySelector(".notch > span")).clipPath,
        badge: getComputedStyle(a.lastElementChild).scale,
      }));
    },
    golden() {
      const f = document.querySelector(".ab-reveal").getBoundingClientRect();
      const [x, y] = photoPoint(...window.__eyes);
      const inside = (s, [a, b]) => {
        const r = document.querySelector(s).getBoundingClientRect();
        return a > r.left && a < r.right && b > r.top && b < r.bottom;
      };
      const face = { "right eye": photoPoint(0.52, 0.404), "left eye": photoPoint(0.335, 0.415), nose: photoPoint(0.43, 0.5), mouth: photoPoint(0.43, 0.6), chin: photoPoint(0.45, 0.73) };
      const covered = Object.entries(face).flatMap(([k, pt]) => [".ab-depth-2", ".ab-depth-3"].filter((s) => inside(s, pt)).map((s) => `${s} on ${k}`));
      return { x: ((x - f.left) / f.width) * 100, y: ((y - f.top) / f.height) * 100, ratio: f.height / f.width, covered };
    },
    settled() {
      return [".hero-in-row", ".ab-title-in", ".ab-card", ".work-touch-row", ".work-row"].filter((s) =>
        [...document.querySelectorAll(s)].filter(vis).some((e) => {
          const cs = getComputedStyle(e);
          return +cs.opacity < 0.99 || !/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/.test(cs.transform);
        }),
      );
    },
  };
}

const browser = await chromium.launch({ channel: "chrome" });
const rows = [];
let failures = 0;

const scrollThrough = async (page) => {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const { height: vh } = page.viewportSize();
  for (let y = 0; y < height; y += vh * 0.7) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
    await page.waitForTimeout(140);
  }
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(1800); // entrances finish
};

async function checkHero(page, fail, label = "") {
  const h = await page.evaluate(() => window.__t.hero());
  if (h.a[0] < 40 || h.a[1] > h.vh) fail(`hero${label}: first name row outside the screen ${JSON.stringify(h.a.map(Math.round))} of ${h.vh}`);
  if (h.b[1] > h.vh + 1) fail(`hero${label}: surname row below the fold (${Math.round(h.b[1])} > ${h.vh})`);
  if (h.eyes < 60 || h.eyes > h.b[0]) fail(`hero${label}: face out of place (eyes at ${Math.round(h.eyes)}, surname starts ${Math.round(h.b[0])})`);
}

async function hero(page, slug, fail, touch) {
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForSelector("[data-preloader]", { state: "detached", timeout: 20000 }).catch(() => fail("loader never left"));
  await page.waitForTimeout(2300);
  await page.screenshot({ path: `${OUT}/${slug}-hero.png` });
  await checkHero(page, fail);
  const off = await page.evaluate(() => {
    const r = document.querySelector("[data-hero-portrait]").getBoundingClientRect();
    return Math.abs(r.left + r.width / 2 - innerWidth / 2);
  });
  if (off > 4) fail(`portrait off-centre by ${Math.round(off)}px`);
  if (await page.evaluate(() => window.__t.settled().includes(".hero-in-row"))) fail("hero rows not at rest");
  if (touch) {
    // real browsers lose height to their address bar and toolbar (about 130 dp upright, 80 sideways),
    // and svh is measured with them showing, so it's a page loaded at that height rather than a resize
    const screen = page.viewportSize();
    await page.setViewportSize({ width: screen.width, height: screen.height - (screen.height > screen.width ? 130 : 80) });
    await page.goto(URL, { waitUntil: "load" });
    await page.waitForSelector("[data-preloader]", { state: "detached", timeout: 20000 }).catch(() => fail("loader never left"));
    await page.waitForTimeout(2300);
    await checkHero(page, fail, " with browser bars");
    await page.screenshot({ path: `${OUT}/${slug}-hero-bars.png` });
    await page.setViewportSize(screen);
    await page.goto(URL, { waitUntil: "load" });
    await page.waitForSelector("[data-preloader]", { state: "detached", timeout: 20000 }).catch(() => fail("loader never left"));
    await page.waitForTimeout(800);
  }
}

// Touch: the row crossing the middle of the screen opens; one tap opens the link
async function workTouch(page, slug, fail, touch) {
  const stray = await page.evaluate(() => [...document.querySelectorAll("#work .fixed")].filter(window.__t.vis).length);
  if (stray) fail("cursor preview present without a cursor");
  if (await page.locator(".work-list").isVisible()) fail("hover list shown");
  for (let i = 0; i < 4; i++) {
    await page.evaluate((i) => window.__t.centre(".work-touch-row", i), i);
    await page.waitForTimeout(950);
    const r = await page.evaluate(() => window.__t.rows());
    const open = r.flatMap((x, n) => (x.on ? [n] : []));
    if (open.length !== 1 || open[0] !== i) fail(`row ${i} centred, open rows: [${open}]`);
    if (!/^inset\(0(px)?\)$/.test(r[i].clip)) fail(`row ${i}: cover did not open (${r[i].clip})`);
    if (r[i].badge !== "1") fail(`row ${i}: Visit badge not shown (${r[i].badge})`);
    const closed = r.filter((_, n) => n !== i).every((x) => x.clip.startsWith("inset(50%"));
    if (!closed) fail(`row ${i}: another row stayed open`);
    if (i === 1) await page.screenshot({ path: `${OUT}/${slug}-work.png` });
  }
  // a closed row opens its link on the first tap: no hover step in between
  await page.evaluate(() => window.__t.centre(".work-touch-row", 3));
  await page.waitForTimeout(200);
  const row = page.locator(".work-touch-row a").nth(2);
  await row.scrollIntoViewIfNeeded();
  const [popup] = await Promise.all([page.waitForEvent("popup", { timeout: 4000 }).catch(() => null), touch ? row.tap() : row.click()]);
  if (!popup) fail("first tap on a project did not open it");
  else await popup.close();
}

async function workCursor(page, slug, fail) {
  await page.evaluate(() => window.scrollTo({ top: document.querySelector(".work-list").getBoundingClientRect().top + scrollY - 120, behavior: "instant" }));
  await page.waitForTimeout(1300);
  await page.locator(".work-list a").nth(1).hover();
  await page.waitForTimeout(800);
  const scaled = await page.evaluate(() => [...document.querySelectorAll("#work .notch")].some((n) => n.classList.contains("scale-100")));
  if (!scaled) fail("hover preview did not appear");
  await page.screenshot({ path: `${OUT}/${slug}-work.png` });
  if (await page.evaluate(() => document.querySelector("[data-on]") !== null)) fail("mid-screen focus active with a real cursor");
  await page.mouse.move(2, 2);
}

// Round buttons: the hover wipe plays while crossing the middle of a touch screen, and under the cursor elsewhere

async function buttons(page, fail, touch) {
  const round = [
    ["About me", "a[href='#about'][data-focus]"],
    ["Get in touch", "#contact a[data-focus]"],
  ];
  for (const [name, sel] of round) {
    // twice: the footer's parallax moves its button as the page scrolls
    for (let i = 0; i < 2; i++) {
      await page.evaluate((s) => window.__t.centre(s), sel);
      await page.waitForTimeout(150);
    }
    if (touch) {
      await page.waitForTimeout(900);
      if (!(await page.evaluate((s) => document.querySelector(s).hasAttribute("data-on"), sel))) fail(`${name}: no focus state mid-screen`);
    } else {
      await page.locator(sel).hover();
      await page.waitForTimeout(900);
    }
    const lift = await page.evaluate((s) => document.querySelector(s).firstElementChild.getBoundingClientRect().top - document.querySelector(s).getBoundingClientRect().top, sel);
    if (Math.abs(lift) > 2) fail(`${name}: hovered fill did not play (${Math.round(lift)}px off)`);
    if (!touch) await page.mouse.move(2, 2);
  }
  if (!touch) return;
  // finger down plays it at once, a scroll that takes over drops it, a real tap holds it long enough to see
  const cdp = await page.context().newCDPSession(page);
  const sel = "#contact button";
  await page.evaluate((s) => window.__t.centre(s), sel);
  await page.waitForTimeout(150);
  const b = await page.locator(sel).first().boundingBox();
  const at = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  const pressed = () => page.evaluate((s) => document.querySelector(s).hasAttribute("data-press"), sel);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [at] });
  await page.waitForTimeout(150);
  if (!(await pressed())) fail("finger down: no press state");
  await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
  await page.waitForTimeout(100);
  if (await pressed()) fail("cancelled touch: press state stuck");
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [at] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(120);
  if (!(await pressed())) fail("quick tap: press state too short to see");
  await page.waitForTimeout(500);
  if (await pressed()) fail("tap: press state stuck");
  await cdp.detach();
}

async function about(page, slug, fail) {
  const stacked = page.viewportSize().width < 768;
  if (stacked) {
    // the scanner has to play when the photo is on screen, not a screen earlier while the text is
    const early = await page.evaluate(() => {
      const c = document.querySelector(".ab-collage").getBoundingClientRect().top + scrollY;
      return c - innerHeight * 0.95;
    });
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), early);
    await page.waitForTimeout(400);
    const clip = await page.evaluate(() => getComputedStyle(document.querySelector(".ab-reveal")).clipPath);
    if (!clip.includes("50%")) fail(`about: photo revealed before it was on screen (${clip})`);
  }
  await page.evaluate(() => window.__t.centre(".ab-collage"));
  await page.waitForTimeout(2300);
  await page.screenshot({ path: `${OUT}/${slug}-about.png` });
  const clip = await page.evaluate(() => getComputedStyle(document.querySelector(".ab-reveal")).clipPath);
  if (clip.includes("50%")) fail("about: scanner reveal did not run");
  const g = await page.evaluate(() => window.__t.golden());
  for (const c of g.covered) fail(`about: ${c}`);
  if (stacked) {
    if (Math.abs(g.x - GOLDEN) > 1.5 || Math.abs(g.y - GOLDEN) > 2.5) fail(`about: eyes at (${g.x.toFixed(1)}, ${g.y.toFixed(1)})%, golden point is ${GOLDEN}%`);
    if (Math.abs(g.ratio - 1.618) > 0.01) fail(`about: frame ratio 1:${g.ratio.toFixed(3)}, not golden`);
  }
}

async function footerAndMenu(page, slug, fail, touch) {
  const email = page.locator("#contact button").first();
  await email.scrollIntoViewIfNeeded();
  const b = await email.boundingBox();
  if (b.x < 0 || b.x + b.width > page.viewportSize().width) fail("email button runs off the screen");
  await page.waitForTimeout(200);
  if (touch) await email.tap();
  else await email.click();
  await page.waitForTimeout(250);
  if (!(await email.innerText()).includes("Copied")) fail("email copy gave no confirmation");
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${slug}-end.png` });
  // menu: everything reachable on any height
  await page.evaluate(() => window.scrollTo({ top: Math.min(900, document.documentElement.scrollHeight), behavior: "instant" }));
  await page.waitForTimeout(500);
  const btn = page.getByRole("button", { name: "Open menu" });
  if (touch) await btn.tap();
  else await btn.click();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${OUT}/${slug}-menu.png` });
  const aside = page.getByRole("complementary");
  const links = aside.getByRole("link");
  for (let i = 0; i < (await links.count()); i++) {
    await links.nth(i).scrollIntoViewIfNeeded();
    const r = await links.nth(i).boundingBox();
    if (!r || r.y < 0 || r.y + r.height > page.viewportSize().height + 1) fail(`menu: link ${i} unreachable`);
  }
  const contact = aside.getByRole("link", { name: "Contact" });
  await contact.scrollIntoViewIfNeeded();
  if (touch) await contact.tap();
  else await contact.click();
  await page.waitForTimeout(2300);
  if (await aside.count()) fail("menu did not close");
  const at = await page.evaluate(() => Math.abs(document.querySelector("#contact").getBoundingClientRect().top));
  if (at > 40) fail(`menu: Contact stopped ${Math.round(at)}px away`);
}

async function headerSteps(page, fail) {
  const shown = () => page.evaluate(() => getComputedStyle(document.querySelector("header")).visibility !== "hidden");
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: "instant" }));
  await page.waitForTimeout(100);
  await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
  await page.waitForTimeout(900);
  if (await shown()) fail("header still over the text while scrolling down");
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: "instant" }));
  await page.waitForTimeout(900);
  if (!(await shown())) fail("header did not return on scrolling up");
}

async function run([name, width, height, density, touch]) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: density, isMobile: touch, hasTouch: touch });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
  await ctx.addInitScript(helpers);
  await ctx.addInitScript(([e]) => (window.__eyes = e), [EYES]);
  // projects open in a new tab; don't hit the real sites
  await ctx.route(/^https:\/\/(?!fonts)(?!.*localhost)/, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "ok" }));
  const page = await ctx.newPage();
  const problems = [];
  const fail = (m) => problems.push(m);
  page.on("console", (m) => m.type() === "error" && fail(`console: ${m.text().slice(0, 90)}`));
  page.on("pageerror", (e) => fail(`pageerror: ${e.message.slice(0, 90)}`));
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const cursorList = !touch && width >= 768;

  await hero(page, slug, fail, touch);
  if (touch) await headerSteps(page, fail);
  if (cursorList) await workCursor(page, slug, fail);
  await about(page, slug, fail); // before the walk-through, which would play the reveal early
  await scrollThrough(page);
  const unsettled = await page.evaluate(() => window.__t.settled());
  if (unsettled.length) fail(`left hidden or offset after scrolling past: ${unsettled.join(", ")}`);
  const cut = await page.evaluate(() => window.__t.cutOff());
  if (cut.length) fail(`text cut off: ${cut.join(" | ")}`);
  if (touch) {
    const small = await page.evaluate(() => window.__t.smallTargets());
    if (small.length) fail(`tap targets under 44dp: ${small.join(", ")}`);
  }
  if (!cursorList) await workTouch(page, slug, fail, touch);
  await buttons(page, fail, touch);
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) fail("horizontal overflow");
  await footerAndMenu(page, slug, fail, touch);

  const unique = [...new Set(problems)];
  failures += unique.length;
  const kb = await page.evaluate(() => Math.round(performance.getEntriesByType("resource").reduce((t, r) => t + (r.encodedBodySize || 0), 0) / 1024));
  const line = [`${unique.length ? "✗" : "✓"} ${name.padEnd(27)} ${`${width}×${height}`.padEnd(10)} ${`${density}x`.padEnd(7)} ${(touch ? "touch" : "cursor").padEnd(7)} ${String(kb).padStart(5)} KB`];
  for (const p of unique.slice(0, 12)) line.push(`    - ${p}`);
  if (unique.length > 12) line.push(`    … and ${unique.length - 12} more`);
  await ctx.close();
  return line.join("\n");
}

// The golden point at rest (no parallax offset), on the 4:5 frames too
async function goldenAtRest() {
  const out = [];
  for (const [width, height, touch] of [
    [390, 844, true],
    [844, 390, true],
    [768, 1024, true],
    [1440, 900, false],
  ]) {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: touch, hasTouch: touch, reducedMotion: "reduce" });
    await ctx.addInitScript(helpers);
    await ctx.addInitScript(([e]) => (window.__eyes = e), [EYES]);
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: "load" });
    await page.waitForSelector("[data-preloader]", { state: "detached", timeout: 20000 }).catch(() => failures++);
    await page.evaluate(() => window.__t.centre(".ab-reveal"));
    await page.waitForTimeout(500);
    const g = await page.evaluate(() => window.__t.golden());
    const bad = Math.abs(g.x - GOLDEN) > 0.5 || Math.abs(g.y - GOLDEN) > 0.5;
    if (bad) failures++;
    out.push(`${bad ? "✗" : "✓"} ${width}×${height}: frame 1:${g.ratio.toFixed(3)}, eyes at (${g.x.toFixed(1)}%, ${g.y.toFixed(1)}%)`);
    await ctx.close();
  }
  rows.push("", `About photo, golden point ${GOLDEN}% × ${GOLDEN}%, parallax at rest:`, ...out.map((l) => `  ${l}`));
}

// Slow or failed scripts must never leave the visitor stuck behind the loader, and a late start must not re-hide the page
async function slowScripts() {
  const out = [];
  for (const [label, delay] of [
    ["never arrive", null],
    ["take 5.5s", 5500],
    ["take 11s", 11000],
  ]) {
    const problems = [];
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(helpers);
    await ctx.route(/\.js(\?|$)/, async (r) => {
      if (delay === null) return r.abort();
      await new Promise((go) => setTimeout(go, delay));
      r.continue().catch(() => {});
    });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => problems.push(e.message.slice(0, 90)));
    await page.goto(URL, { waitUntil: "commit" });
    // what a visitor is looking at, nine seconds in
    await page.waitForTimeout(9000);
    const blocked = await page.evaluate(() => {
      const l = document.querySelector("[data-preloader]");
      return !!l && getComputedStyle(l).visibility !== "hidden" && +getComputedStyle(l).opacity > 0.01;
    });
    if (blocked) problems.push("loader still covering the page at 9s");
    if (!(await page.locator("#top .marquee-track").first().isVisible())) problems.push("name not visible at 9s");
    if ((await page.locator(".work-touch-row a").count()) !== 4) problems.push("project links missing");
    if (delay !== null) {
      await page.waitForFunction(() => document.documentElement.classList.contains("lenis"), null, { timeout: 15000 }).catch(() => problems.push("scripts never took over"));
      await page.waitForTimeout(delay > 8000 ? 500 : 3000);
      if (await page.locator("[data-preloader]").count()) problems.push("loader still in the page after the scripts ran");
      const st = await page.evaluate(() => {
        window.scrollTo({ top: 600, behavior: "instant" });
        return { settled: window.__t.settled(), lenisStopped: document.documentElement.classList.contains("lenis-stopped"), header: getComputedStyle(document.querySelector("header")).opacity };
      });
      await page.waitForTimeout(150);
      if (st.settled.includes(".hero-in-row")) problems.push("name rows hidden by a late start");
      if (st.lenisStopped) problems.push("scrolling still locked");
      if ((await page.evaluate(() => scrollY)) < 500) problems.push("page does not scroll");
    }
    failures += problems.length;
    out.push(`${problems.length ? "✗" : "✓"} scripts ${label}${problems.length ? `: ${problems.join("; ")}` : ""}`);
    await ctx.close();
  }
  rows.push("", "Slow connections (390×844):", ...out.map((l) => `  ${l}`));
}

// A slow phone dragging through the whole page with real touch events: does it scroll, and do the effects keep up?
async function slowPhone() {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForSelector("[data-preloader]", { state: "detached", timeout: 30000 }).catch(() => failures++);
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    window.__f = [];
    let last = performance.now();
    const tick = (now) => {
      window.__f.push(now - last);
      last = now;
      window.__raf = requestAnimationFrame(tick);
    };
    window.__raf = requestAnimationFrame(tick);
  });
  const distance = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let n = Math.ceil(distance / 380) + 2; n > 0; n--) {
    // start low on the screen, away from the buttons
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 20, y: 500 }] });
    for (let i = 1; i <= 12; i++) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 20, y: 500 - i * 33 }] });
      await page.waitForTimeout(16);
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(300);
  const { f, y, max } = await page.evaluate(() => {
    cancelAnimationFrame(window.__raf);
    return { f: window.__f.slice(1), y: scrollY, max: document.documentElement.scrollHeight - innerHeight };
  });
  const s = [...f].sort((a, b) => a - b);
  const pct = (p) => Math.round(s[Math.floor((s.length - 1) * p)]);
  const long = f.filter((t) => t > 100).length;
  if (Math.abs(max - y) > 2) failures++;
  rows.push("", `Slow phone (360×640, 4× slower CPU), touch dragging through the page:`);
  rows.push(`  ${Math.abs(max - y) > 2 ? `✗ stopped ${Math.round(max - y)}px short · ` : ""}${f.length} frames · median ${pct(0.5)} ms · 95th percentile ${pct(0.95)} ms · ${long} over 100 ms`);
  await ctx.close();
}

// Page must be readable without JavaScript
async function noJs() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "load" });
  const ok = (await page.locator(".work-touch-row a").count()) === 4 && !(await page.locator("[data-preloader]").isVisible());
  if (!ok) failures++;
  rows.push(`${ok ? "✓" : "✗"} JavaScript off: no loader in the way, project links there`);
  await ctx.close();
}

// Rotating or resizing across the layouts must not strand the page
async function resizing() {
  const problems = [];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(helpers);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => problems.push(e.message.slice(0, 90)));
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForSelector("[data-preloader]", { state: "detached", timeout: 20000 }).catch(() => problems.push("loader never left"));
  await page.waitForTimeout(800);
  for (const [w, h] of [[844, 390], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(700);
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) problems.push(`overflow at ${w}×${h}`);
    const he = await page.evaluate(() => window.__t.hero());
    if (he.b[1] > he.vh + 1) problems.push(`surname below the fold at ${w}×${h}`);
  }
  failures += problems.length;
  rows.push(`${problems.length ? "✗" : "✓"} Rotating the phone${problems.length ? `: ${problems.join("; ")}` : ""}`);
  await ctx.close();
}

// four at a time
const queue = [...DEVICES];
const results = new Map();
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let d = queue.shift(); d; d = queue.shift()) results.set(d[0], await run(d).catch((e) => (failures++, `✗ ${d[0]}: ${e.message.split("\n")[0]}`)));
  }),
);
for (const [name] of DEVICES) rows.push(results.get(name));

await goldenAtRest();
await slowScripts();
await slowPhone();
rows.push("");
await noJs();
await resizing();
await browser.close();
console.log(rows.join("\n"));
console.log(failures ? `\n${failures} problem(s)` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
