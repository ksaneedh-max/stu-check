const { chromium } = require("playwright");

/* ---------- BROWSER INSTANCE ---------- */

let browser = null;

/* ---------- SESSION MANAGER ---------- */

const sessionManager = require("./sessionManager");

/* give browser access to sessionManager (prevents circular dependency) */
sessionManager.setBrowserGetter(() => browser);

/* ---------- START BROWSER ---------- */

async function startBrowser() {

  if (browser && browser.isConnected()) return;

  console.log("Launching Chromium...");

  browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  });

  browser.on("disconnected", () => {
    console.log("Browser crashed/disconnected");
    browser = null;
  });

  console.log("Browser launched");

}

/* ---------- ENSURE BROWSER ---------- */

async function ensureBrowser() {

  if (!browser || !browser.isConnected()) {
    await startBrowser();
  }

}

/* ---------- GET BROWSER ---------- */

function getBrowser() {
  return browser;
}

/* ---------- SHUTDOWN ---------- */

async function shutdownBrowser() {

  console.log("Closing browser...");

  /* destroy all active sessions first */
  if (sessionManager.destroyAllSessions) {
    await sessionManager.destroyAllSessions();
  }

  if (browser) {
    try { await browser.close(); } catch {}
    browser = null;
  }

}

/* ---------- EXPORTS ---------- */

module.exports = {
  startBrowser,
  ensureBrowser,
  shutdownBrowser,
  getBrowser,

  /* re-export session functions */
  ...sessionManager
};
