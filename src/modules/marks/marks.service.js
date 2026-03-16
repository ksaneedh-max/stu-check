const { ensureBrowser, getPage } = require("../../browser/browserManager");
const scraper = require("./marks.scraper");
const PQueue = require("p-queue").default;

/* ---------- SCRAPER QUEUE ---------- */
const queue = new PQueue({ concurrency: 5 });

async function getMarks(sessionId) {

  await ensureBrowser();

  const page = getPage(sessionId);

  if (!page) {
    throw new Error("User not logged in");
  }

  return queue.add(async () => {

    /* ---------- ENSURE ATTENDANCE PAGE (MARKS IS HERE) ---------- */

    await page.evaluate(() => {
      window.location.hash = "Page:My_Attendance";
    });

    /* ---------- SCROLL TO LOAD MARKS SECTION ---------- */

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    /* ---------- WAIT FOR TABLE ---------- */

    await page.waitForSelector("table", { timeout: 15000 });

    /* ---------- WAIT FOR ROWS ---------- */

    await page.waitForFunction(() => {
      const rows = document.querySelectorAll("table tbody tr");
      return rows.length > 1;
    }, { timeout: 15000 });

    /* ---------- STABILIZATION DELAY ---------- */

    await page.waitForTimeout(400);

    /* ---------- SCRAPE ---------- */

    return scraper.extract(page);

  });

}

module.exports = { getMarks };
