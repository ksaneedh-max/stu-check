const fs = require("fs");
const { getPage, STORAGE_FILE } = require("../../browser/browserManager");

async function logoutService() {

  const page = getPage();

  if (!page) {
    return { status: "not_logged_in" };
  }

  try {

    console.log("Logging out from SRM...");

    /* open profile menu */
    const profileMenu = page.locator("#zc-account-settings");

    if (await profileMenu.count() > 0) {
      await profileMenu.click();
      await page.waitForTimeout(1000);
    }

    /* click logout */
    const logoutBtn = page.locator("#portalLogout");

    if (await logoutBtn.count() > 0) {
      await logoutBtn.click();
      await page.waitForTimeout(3000);
    }

    /* clear stored session */
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        fs.unlinkSync(STORAGE_FILE);
        console.log("Storage state cleared");
      }
    } catch {}

    return { status: "logged_out" };

  } catch (err) {

    console.log("LOGOUT ERROR:", err);

    return {
      error: "Logout failed"
    };

  }

}

module.exports = logoutService;