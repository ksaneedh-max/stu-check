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

    /* ---------- OPEN ATTENDANCE PAGE ---------- */

    await page.evaluate((hash) => {
      location.hash = hash;
    }, "Page:My_Attendance");
    await page.waitForTimeout(1000);


    /* ---------- WAIT FOR NETWORK TO SETTLE ---------- */

    await page.waitForLoadState("networkidle");


    /* ---------- WAIT UNTIL ATTENDANCE TABLE LOADS ---------- */

    let attendanceFrame = null;

    for (let attempt = 0; attempt < 40; attempt++) {

      for (const frame of page.frames()) {

        try {

          const rowCount = await frame.locator("table tbody tr").count();

          if (rowCount > 1) {
            attendanceFrame = frame;
            break;
          }

        } catch {}

      }

      if (attendanceFrame) break;

      await page.waitForTimeout(250);
    }

    if (!attendanceFrame) {
      throw new Error("Attendance table failed to load");
    }

    /* ---------- RUN SCRAPER ---------- */

    return scraper.extract(page);

  });

}

module.exports = { getAttendance };
