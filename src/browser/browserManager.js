const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const { PORTAL_URL } = require("../config/env");

/* ---------- CONFIG ---------- */

const BROWSER_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const STORAGE_TIMEOUT = 24 * 60 * 60 * 1000; // 1 day
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

const STORAGE_DIR = path.resolve(__dirname, "../../storage");

/* ---------- BROWSER ---------- */

let browser = null;

/* sessionId -> { context, page, storageFile, lastActivity } */
const sessions = new Map();

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

  console.log("Browser launched");

}

/* ---------- ENSURE BROWSER ---------- */

async function ensureBrowser() {

  if (!browser || !browser.isConnected()) {

    console.log("Browser missing or crashed, restarting...");

    await startBrowser();

  }

}

/* ---------- CREATE SESSION ---------- */

async function createSession(sessionId) {

  await ensureBrowser();

  if (sessions.has(sessionId)) {

    const session = sessions.get(sessionId);
    session.lastActivity = Date.now();

    return session;

  }

  console.log("Creating new session:", sessionId);

  const storageFile = path.resolve(
    STORAGE_DIR,
    `session_${sessionId}.json`
  );

  const storageExists = fs.existsSync(storageFile);

  let context;

  try {

    context = await browser.newContext(
      storageExists ? { storageState: storageFile } : {}
    );

  } catch (err) {

    console.log("Storage load failed, starting fresh session");

    try {
      fs.unlinkSync(storageFile);
    } catch {}

    context = await browser.newContext();

  }

  const page = await context.newPage();

  /* ---------- PAGE OPTIMIZATIONS ---------- */

  page.setDefaultTimeout(15000);

  await page.route("**/*", route => {

    const type = route.request().resourceType();

    if (
      type === "image" ||
      type === "font" ||
      type === "media"
    ) {
      return route.abort();
    }

    route.continue();

  });

  try {

    await page.addStyleTag({
      content: `
        * {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `
    });

  } catch {}

  /* ---------- OPEN PORTAL ---------- */

  try {

    console.log("Opening SRM portal for:", sessionId);

    await page.goto(PORTAL_URL, {
      waitUntil: "domcontentloaded"
    });

  } catch (err) {

    console.log("Portal load failed:", err.message);

  }

  const session = {
    context,
    page,
    storageFile,
    lastActivity: Date.now()
  };

  sessions.set(sessionId, session);

  return session;

}

/* ---------- GET PAGE ---------- */

function getPage(sessionId) {

  const session = sessions.get(sessionId);

  if (!session) return null;

  return session.page;

}

/* ---------- GET CONTEXT ---------- */

function getContext(sessionId) {

  const session = sessions.get(sessionId);

  if (!session) return null;

  return session.context;

}

/* ---------- TOUCH SESSION ---------- */

function touchSession(sessionId) {

  const session = sessions.get(sessionId);

  if (!session) return;

  session.lastActivity = Date.now();

}

/* ---------- SAVE SESSION ---------- */

async function saveSession(sessionId) {

  const session = sessions.get(sessionId);

  if (!session) return;

  try {

    await session.context.storageState({
      path: session.storageFile
    });

    console.log("Session saved:", session.storageFile);

  } catch (err) {

    console.log("Session save failed:", err.message);

  }

}

/* ---------- DESTROY SESSION ---------- */

async function destroySession(sessionId) {

  const session = sessions.get(sessionId);

  if (!session) return;

  console.log("Destroying browser session:", sessionId);

  try {
    await session.context.close();
  } catch {}

  sessions.delete(sessionId);

}

/* ---------- STORAGE CLEANUP ---------- */

function cleanupStorage() {

  try {

    const files = fs.readdirSync(STORAGE_DIR);

    files.forEach(file => {

      if (!file.startsWith("session_")) return;

      const filePath = path.join(STORAGE_DIR, file);

      const stats = fs.statSync(filePath);

      const age = Date.now() - stats.mtimeMs;

      if (age > STORAGE_TIMEOUT) {

        console.log("Deleting expired storage:", file);

        try {
          fs.unlinkSync(filePath);
        } catch {}

      }

    });

  } catch {}

}

/* ---------- SESSION CLEANUP WORKER ---------- */

setInterval(async () => {

  const now = Date.now();

  for (const [sessionId, session] of sessions) {

    if (now - session.lastActivity > BROWSER_TIMEOUT) {

      console.log("Session timeout:", sessionId);

      await destroySession(sessionId);

    }

  }

  cleanupStorage();

}, CLEANUP_INTERVAL);

/* ---------- SESSION COUNT ---------- */

function sessionCount() {
  return sessions.size;
}

/* ---------- SHUTDOWN BROWSER ---------- */

async function shutdownBrowser() {

  console.log("Closing browser...");

  for (const [sessionId] of sessions) {

    await destroySession(sessionId);

  }

  if (browser) {

    try {
      await browser.close();
    } catch {}

    browser = null;

  }

}

/* ---------- EXPORTS ---------- */

module.exports = {
  startBrowser,
  ensureBrowser,
  createSession,
  getPage,
  getContext,
  saveSession,
  destroySession,
  touchSession,
  sessionCount,
  shutdownBrowser
};
