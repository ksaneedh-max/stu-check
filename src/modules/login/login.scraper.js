const { PORTAL_URL } = require("../../config/env");

/* ---------- FIND FIELD ---------- */

async function findField(page, selectors) {

  for (const sel of selectors) {

    const el = page.locator(sel);

    if (await el.count()) {
      return el.first();
    }

  }

  for (const frame of page.frames()) {

    for (const sel of selectors) {

      const el = frame.locator(sel);

      if (await el.count()) {
        return el.first();
      }

    }

  }

  return null;

}


/* ---------- SESSION LIMIT HANDLER ---------- */

async function handleSessionLimit(page) {

  try {

    await page.waitForTimeout(3000);

    const terminateScreen = page.locator("#continue_button");

    if (await terminateScreen.count()) {

      console.log("Session limit detected → terminating old sessions");

      await terminateScreen.first().click();

      await page.waitForTimeout(2000);

      const confirmPopup = page.locator(".confirm-delete_btn");

      if (await confirmPopup.count()) {

        await confirmPopup.first().click();

        await page.waitForTimeout(2000);

      }

    }

  } catch (err) {

    console.log("Session limit handler error:", err.message);

  }

}


/* ---------- CHECK LOGIN PAGE ---------- */

async function detectLoginPage(page) {

  const loginField = await findField(page, [
    "#login_id",
    'input[name="LOGIN_ID"]',
    'input[placeholder="Email Address"]'
  ]);

  return !!loginField;

}


/* ---------- LOGIN SCRAPER ---------- */

async function performLogin(page, { email, password }) {

  await page.goto(PORTAL_URL, {
    waitUntil: "domcontentloaded"
  });

  await page.waitForTimeout(3000);

  const emailField = await findField(page, [
    "#login_id",
    'input[name="LOGIN_ID"]',
    'input[placeholder="Email Address"]',
    'input[type="text"]'
  ]);

  if (!emailField) {
    throw new Error("Login email field not found");
  }

  await emailField.fill(email);

  const nextBtn = await findField(page, [
    "#nextbtn",
    'button[type="submit"]',
    'button:has-text("Next")',
    'button:has-text("Sign in")',
    'input[type="submit"]'
  ]);

  if (!nextBtn) {
    throw new Error("Next button not found");
  }

  await nextBtn.click();

  await page.waitForTimeout(2000);

  const passwordField = await findField(page, [
    "#password",
    'input[name="PASSWORD"]',
    'input[type="password"]'
  ]);

  if (!passwordField) {
    throw new Error("Password field not found");
  }

  await passwordField.fill(password);

  await nextBtn.click();

  await page.waitForTimeout(2000);

  await handleSessionLimit(page);

  try {
    await page.waitForLoadState("networkidle");
  } catch {}

}

module.exports = {
  detectLoginPage,
  performLogin
};
