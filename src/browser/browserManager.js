const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const STORAGE_FILE =
  process.env.STORAGE_STATE_PATH ||
  path.resolve(__dirname, "../../storage/state.json");

let browser = null;
let context = null;
let page = null;

async function startBrowser() {
  if (browser) return;

  console.log("Launching Chromium...");

  browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  });

  await createContextAndPage();
}

async function createContextAndPage() {
  try {
    if (page && !page.isClosed()) await page.close();
  } catch {}

  try {
    if (context) await context.close();
  } catch {}

  const storageExists = fs.existsSync(STORAGE_FILE);

  context = await browser.newContext(
    storageExists ? { storageState: STORAGE_FILE } : {}
  );

  page = await context.newPage();
}

async function ensureBrowser() {
  try {
    if (!browser) {
      await startBrowser();
      return;
    }

    if (!context) {
      await createContextAndPage();
      return;
    }

    if (!page || page.isClosed()) {
      page = await context.newPage();
    }
  } catch (err) {
    console.log("Browser recovery triggered:", err.message);

    try {
      if (browser) await browser.close();
    } catch {}

    browser = null;
    context = null;
    page = null;

    await startBrowser();
  }
}

function getPage() {
  return page;
}

function getContext() {
  return context;
}

module.exports = {
  startBrowser,
  ensureBrowser,
  getPage,
  getContext,
  STORAGE_FILE
};
