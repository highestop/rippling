import path from "path";
import { BrowserContext, chromium } from "playwright";
import { afterEach, expect, test } from "vitest";

let browser: BrowserContext | undefined;
const EXTENSION_ID = "nnocgligbafbkepiddmidebakcheiihc";

afterEach(async () => {
  await browser?.close();
});

test("hello", async () => {
  const pathToExtension = path.join(__dirname, "../devtool/dist");
  browser = await chromium.launchPersistentContext("", {
    channel: "chromium",
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });
  const page = await browser.newPage();
  await page.goto(`chrome-extension://${EXTENSION_ID}/index.html`);
  const bodyText = await page
    .locator("body")
    .evaluate((el) => (el.textContent as string).trim());
  expect(bodyText).toBe("Hello Extensions");

  expect(true).toBe(true);
});
