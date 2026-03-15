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

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForSelector("table");

    return scraper.extract(page);

  });

}

module.exports = { getMarks };
