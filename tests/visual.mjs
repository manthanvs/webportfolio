// Visual + interaction smoke test. Run: node tests/visual.mjs [url]
// Uses the locally installed Chrome (no Playwright browser download needed).
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const URL = process.argv[2] || "http://localhost:3000";
const OUT = "tests/shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const errors = [];
const fail = (m) => {
  errors.push(m);
  console.error("✗", m);
};

// document-relative top (sections live inside a positioned wrapper, so offsetTop is not enough)
const docTop = (page, sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, sel);
const isIdentity = (tf) => tf === "none" || /^matrix\(1, 0, 0, 1, 0, 0\)$/.test(tf);

async function run(name, viewport, isMobile) {
  const page = await browser.newPage({ viewport, isMobile, hasTouch: isMobile });
  page.on("console", (m) => m.type() === "error" && fail(`[${name}] console: ${m.text()}`));
  page.on("pageerror", (e) => fail(`[${name}] pageerror: ${e.message}`));
  const vh = viewport.height;

  await page.goto(URL, { waitUntil: "commit" });
  await page.waitForSelector("[data-preloader]");
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${name}-00-loader.png` });
  await page.waitForSelector("[data-preloader]", { state: "detached", timeout: 12000 }).catch(() => fail(`[${name}] preloader never left`));
  await page.waitForTimeout(2200); // hero entrance settles
  await page.screenshot({ path: `${OUT}/${name}-01-hero.png` });

  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) fail(`[${name}] horizontal overflow`);
  if (!(await page.evaluate(() => document.querySelector("header").className.includes("text-white"))))
    fail(`[${name}] header not light over the dark hero`);

  // regression: entrance offsets must be cleared, and a small scroll must not knock the name rows out of view
  const rows = await page.evaluate(() => [...document.querySelectorAll(".hero-in-row")].map((e) => getComputedStyle(e).transform));
  if (!rows.length || !rows.every(isIdentity)) fail(`[${name}] hero rows not at rest after entrance: ${rows}`);
  await page.mouse.move(viewport.width / 2, vh / 2);
  await page.mouse.wheel(0, 150);
  await page.waitForTimeout(1200);
  const rowBoxes = await page.evaluate(() =>
    [".hero-depth-a", ".hero-depth-b"].map((s) => {
      const r = document.querySelector(s).getBoundingClientRect();
      return [Math.round(r.top), Math.round(r.bottom)];
    }),
  );
  if (!rowBoxes.every(([t, b]) => b > 0 && t < vh)) fail(`[${name}] hero rows left the viewport after a small scroll: ${JSON.stringify(rowBoxes)}`);

  if (!isMobile) {
    // portrait stays centred after a resize
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.setViewportSize({ width: 1180, height: 800 });
    await page.waitForTimeout(900);
    const c = await page.evaluate(() => {
      const r = document.querySelector("[data-hero-portrait]").getBoundingClientRect();
      return r.left + r.width / 2;
    });
    if (Math.abs(c - 590) > 4) fail(`[${name}] portrait off-centre after resize: ${c}`);
    await page.setViewportSize(viewport);
    await page.waitForTimeout(900);
  }

  const positions = [
    ["02-stack", vh * 0.55],
    ["03-intro", vh * 1.15],
    ["04-work", await docTop(page, "#work")],
    ["05-about", (await docTop(page, "#about")) + vh * 0.15],
    ["06-about-deep", (await docTop(page, "#about")) + vh * 0.75],
    ["07-footer", await page.evaluate(() => document.body.scrollHeight)],
  ];
  for (const [label, y] of positions) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(label.startsWith("05") ? 2600 : 1600);
    await page.screenshot({ path: `${OUT}/${name}-${label}.png` });
    if (label === "04-work" && !(await page.evaluate(() => document.querySelector("header").className.includes("text-ink"))))
      fail(`[${name}] header not dark over the light Work section`);
    if (label === "05-about") {
      const about = await page.evaluate(() => ({
        card: document.querySelector("#about dl")?.textContent ?? "",
        clip: getComputedStyle(document.querySelector(".ab-reveal")).clipPath,
        lines: document.querySelectorAll("#about .ab-copy .ab-l-mask").length,
        // both photos must be decoded: B&W main frame + colour detail strip
        photos: [...document.querySelectorAll("#about img")]
          .filter((i) => i.complete && i.naturalWidth > 0)
          .map((i) => (i.currentSrc.includes("portrait-bw") ? "bw" : i.currentSrc.includes("portrait.png") ? "colour" : "?")),
      }));
      if (!about.photos.includes("bw") || !about.photos.includes("colour")) fail(`[${name}] about photos not both loaded: ${about.photos}`);
      if (!about.card.includes("Manthan Sankpal")) fail(`[${name}] about data card did not settle: "${about.card}"`);
      if (about.clip.includes("50%")) fail(`[${name}] about portrait reveal did not run: ${about.clip}`);
      if (!about.lines) fail(`[${name}] about copy was not line-split`);
    }
  }

  // contact + project links from content.ts render
  const links = await page.evaluate(() => ({
    socials: [...document.querySelectorAll("#contact a[target=_blank]")].map((a) => a.hostname),
    mail: document.querySelector('#contact a[href^="mailto:"]')?.getAttribute("href") ?? "",
    work: document.querySelectorAll("#work a[href^='http']").length,
  }));
  if (links.socials.length < 4 || !links.mail) fail(`[${name}] footer links missing: ${JSON.stringify(links)}`);
  if (!links.work) fail(`[${name}] project links missing`);

  // menu opens / closes and navigates
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(1000);
  if (!(await page.getByRole("complementary").isVisible())) fail(`[${name}] menu did not open`);
  await page.screenshot({ path: `${OUT}/${name}-08-menu.png` });
  await page.getByRole("complementary").getByRole("link", { name: "Contact" }).click();
  await page.waitForTimeout(2600);
  if (await page.getByRole("complementary").count()) fail(`[${name}] menu did not close`);
  const atContact = await page.evaluate(() => Math.abs(document.querySelector("#contact").getBoundingClientRect().top) < 40);
  if (!atContact) fail(`[${name}] menu link did not scroll to #contact`);

  if (!isMobile) {
    // project hover preview
    await page.evaluate(async (y) => window.scrollTo(0, y), await docTop(page, "#work"));
    await page.waitForTimeout(1500);
    const row = page.locator("#work ul.work-list a").nth(1);
    const box = await row.boundingBox();
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height / 2, { steps: 8 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${name}-09-work-hover.png` });
    const scaled = await page.evaluate(() => [...document.querySelectorAll("#work .notch")].some((n) => n.classList.contains("scale-100")));
    if (!scaled) fail(`[${name}] work preview did not appear on hover`);
  }
  await page.close();
}

// prefers-reduced-motion: loader must still leave and nothing may stay hidden
async function reduced() {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  page.on("pageerror", (e) => fail(`[reduced] pageerror: ${e.message}`));
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-preloader]", { state: "detached", timeout: 10000 }).catch(() => fail("[reduced] preloader never left"));
  const hidden = await page.evaluate(() =>
    [".hero-in-row", ".hero-in-portrait", ".hero-in-hud", ".ab-title-in", ".ab-card"].filter((s) =>
      [...document.querySelectorAll(s)].some((e) => {
        const cs = getComputedStyle(e);
        return cs.visibility === "hidden" || +cs.opacity < 0.99 || !(cs.transform === "none" || cs.transform === "matrix(1, 0, 0, 1, 0, 0)");
      }),
    ),
  );
  if (hidden.length) fail(`[reduced] elements left hidden/offset: ${hidden}`);
  await page.close();
}

await run("desktop", { width: 1440, height: 900 }, false);
await run("mobile", { width: 390, height: 844 }, true);
await reduced();
await browser.close();
console.log(errors.length ? `\n${errors.length} problem(s)` : "\nAll checks passed");
process.exit(errors.length ? 1 : 0);
