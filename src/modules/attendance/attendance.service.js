const { ensureBrowser, getPage } = require("../../browser/browserManager");
const scraper = require("./attendance.scraper");
const PQueue = require("p-queue").default;

/* ---------- SCRAPER QUEUE ---------- */
const queue = new PQueue({ concurrency: 5 });

async function getAttendance(sessionId) {

  await ensureBrowser();

  const page = getPage(sessionId);

  if (!page) {
    throw new Error("User not logged in");
  }

  return queue.add(async () => {

    await page.evaluate(() => {
      window.location.hash = "Page:My_Attendance";
    });

    await page.waitForSelector("table");

    return scraper.extract(page);

  });

}

module.exports = { getAttendance };
