const { ensureBrowser, getPage } = require("../../browser/browserManager");
const subjectScraper = require("./subject.scraper");
const timetableScraper = require("./timetable.scraper");

const PQueue = require("p-queue").default;

const queue = new PQueue({ concurrency: 5 });

async function getTimetable(sessionId) {

  await ensureBrowser();

  const page = getPage(sessionId);

  if (!page) {
    throw new Error("User not logged in");
  }

  return queue.add(async () => {

    /* ---------- OPEN SUBJECT PAGE ---------- */

    await page.evaluate(() => {
      window.location.hash = "Page:My_Time_Table_2023_24";
    });

    /* wait for subject table */
    await page.waitForSelector("table.course_tbl", { timeout: 15000 });

    /* ensure rows exist */
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll("table.course_tbl tbody tr");
      return rows.length > 1;
    });

    /* stabilization delay */
    await page.waitForTimeout(400);

    const { batch, slotMap } =
      await subjectScraper.extractSubjects(page);

    /* ---------- OPEN TIMETABLE PAGE ---------- */

    if (batch === "1") {

      await page.evaluate(() => {
        window.location.hash =
          "Page:Unified_Time_Table_2025_Batch_1";
      });

    } else {

      await page.evaluate(() => {
        window.location.hash =
          "Page:Unified_Time_Table_2025_batch_2";
      });

    }

    /* wait for timetable table */
    await page.waitForSelector("table[border='5']", { timeout: 15000 });

    /* ensure rows exist */
    await page.waitForFunction(() => {
      const table = document.querySelector("table[border='5']");
      if (!table) return false;
      return table.querySelectorAll("tr").length > 3;
    });

    /* stabilization delay */
    await page.waitForTimeout(400);

    const timetable =
      await timetableScraper.extractTimetable(page, slotMap);

    return {
      batch,
      timetable
    };

  });

}

module.exports = { getTimetable };