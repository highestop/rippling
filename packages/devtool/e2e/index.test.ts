import { BrowserContext, chromium } from "playwright";
import { test, expect } from "@playwright/test";

let browser: BrowserContext | undefined;
const EXTENSION_ID = "nnocgligbafbkepiddmidebakcheiihc";
const EXTENSION_PATH = "packages/devtool/dist";

test("hello", async () => {
  browser = await chromium.launchPersistentContext("", {
    channel: "chromium",
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });
  const page = await browser.newPage();
  await page.goto(`chrome-extension://${EXTENSION_ID}/panel.html`);

  const bodyText = await page.getByText("StoreInspector").textContent();
  expect(bodyText).toBe("StoreInspector");

  expect(true).toBe(true);

  await browser.close();
});
