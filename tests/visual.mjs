// Visual + interaction smoke test. Run: node tests/visual.mjs [url]
// Uses the locally installed Chrome (no Playwright browser download needed).
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const URL = process.argv[2] || "http://localhost:3000";
const OUT = "tests/shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const errors = [];
const fail = (m) => {
  errors.push(m);
  console.error("✗", m);
};

async function run(name, viewport, isMobile) {
  const page = await browser.newPage({ viewport, isMobile, hasTouch: isMobile });
  page.on("console", (m) => m.type() === "error" && fail(`[${name}] console: ${m.text()}`));
  page.on("pageerror", (e) => fail(`[${name}] pageerror: ${e.message}`));
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(3200); // preloader
  if ((await page.locator("[aria-hidden] >> text=MS").count()) > 0) fail(`[${name}] preloader still visible`);
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1))
    fail(`[${name}] horizontal overflow`);
  await page.screenshot({ path: `${OUT}/${name}-01-hero.png` });

  const stops = ["#work", "#about", "#contact"];
  // signal section: sample three scroll depths
  const signalTop = await page.evaluate(() => document.querySelector('[aria-label="Interlude"]').offsetTop);
  const vh = viewport.height;
  const positions = [
    ["02-intro", vh * 1],
    ["03-work", await page.evaluate((s) => document.querySelector(s).offsetTop, stops[0])],
    ["04-signal-a", signalTop + vh * 0.2],
    ["05-signal-c", signalTop + vh * 1.8],
    ["06-about", await page.evaluate((s) => document.querySelector(s).offsetTop, stops[1])],
    ["07-footer", await page.evaluate(() => document.body.scrollHeight)],
  ];
  for (const [label, y] of positions) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${OUT}/${name}-${label}.png` });
  }

  // WebGL canvas exists and has size
  const canvas = await page.evaluate(() => {
    const c = document.querySelector('[aria-label="Interlude"] canvas');
    return c ? [c.width, c.height] : null;
  });
  if (!canvas || !canvas[0]) fail(`[${name}] signal canvas missing`);

  // menu opens / closes
  await page.evaluate(() => window.scrollTo(0, 600));
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
    await page.evaluate(() => window.scrollTo(0, document.querySelector("#work").offsetTop));
    await page.waitForTimeout(1500);
    const row = page.locator("#work ul.work-list a").nth(1);
    const box = await row.boundingBox();
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height / 2, { steps: 8 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${name}-09-work-hover.png` });
    const scaled = await page.evaluate(() =>
      [...document.querySelectorAll("#work .notch")].some((n) => n.classList.contains("scale-100")),
    );
    if (!scaled) fail(`[${name}] work preview did not appear on hover`);
  }
  await page.close();
}

await run("desktop", { width: 1440, height: 900 }, false);
await run("mobile", { width: 390, height: 844 }, true);
await browser.close();
console.log(errors.length ? `\n${errors.length} problem(s)` : "\nAll checks passed");
process.exit(errors.length ? 1 : 0);
