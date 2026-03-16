exports.extract = async (page) => {

  let marksFrame = null;

  /* ---------- FIND FRAME WITH MARKS TABLE ---------- */

  for (let i = 0; i < 10; i++) {

    for (const frame of page.frames()) {

      try {

        const tables = await frame.locator("table").count();

        if (tables > 1) {
          marksFrame = frame;
          break;
        }

      } catch {}

    }

    if (marksFrame) break;

    await page.waitForTimeout(300);

  }

  if (!marksFrame) {
    return { subjects: [] };
  }

  /* ---------- WAIT FOR ROWS ---------- */

  try {
    await marksFrame.waitForSelector("table > tbody > tr", { timeout: 10000 });
  } catch {
    return { subjects: [] };
  }

  /* ---------- STABILIZATION DELAY ---------- */

  await page.waitForTimeout(300);

  /* ---------- SCRAPE DATA ---------- */

  return marksFrame.evaluate(() => {

    const rows = document.querySelectorAll("table > tbody > tr");

    const results = [];

    rows.forEach((row, index) => {

      if (index === 0) return;

      const cols = row.querySelectorAll("td");

      if (cols.length < 3) return;

      const code = cols[0].innerText.trim();
      const type = cols[1].innerText.trim();
      const perfCell = cols[2];

      const subject = {
        code,
        title: code + " (" + type + ")",
        components: [],
        total: 0,
        max: 0
      };

      const compCells = perfCell.querySelectorAll("td");

      compCells.forEach(cell => {

        const strong = cell.querySelector("strong");

        if (!strong) return;

        const header = strong.innerText.trim();
        const scoreText = cell.innerText.replace(header, "").trim();

        const parts = header.split("/");

        const name = parts[0];
        const max = parseFloat(parts[1]) || 0;
        const score = parseFloat(scoreText) || 0;

        subject.components.push({ name, score, max });

        subject.total += score;
        subject.max += max;

      });

      if (subject.components.length > 0) {
        results.push(subject);
      }

    });

    return { subjects: results };

  });

};
