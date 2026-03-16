exports.extractSubjects = async (page) => {

  /* ---------- WAIT FOR SUBJECT TABLE ---------- */

  try {
    await page.waitForSelector("table.course_tbl", { timeout: 15000 });
  } catch {
    return { batch: null, slotMap: {} };
  }

  /* ---------- WAIT FOR TABLE ROWS ---------- */

  await page.waitForFunction(() => {
    const rows = document.querySelectorAll("table.course_tbl tbody tr");
    return rows.length > 1;
  });

  /* ---------- STABILIZATION DELAY ---------- */

  await page.waitForTimeout(300);

  /* ---------- SCRAPE SUBJECT DATA ---------- */

  return page.evaluate(() => {

    /* ---------- GET BATCH ---------- */

    let batch = null;

    const cells = Array.from(document.querySelectorAll("td"));

    for (let i = 0; i < cells.length; i++) {

      if (cells[i].innerText.trim() === "Batch:") {

        batch = cells[i + 1]?.innerText.trim() || null;

        break;

      }

    }

    /* ---------- GET SUBJECT TABLE ---------- */

    const rows = document.querySelectorAll("table.course_tbl tbody tr");

    const slotMap = {};

    rows.forEach((row, index) => {

      if (index === 0) return;

      const cols = row.querySelectorAll("td");

      if (!cols || cols.length < 10) return;

      const code = cols[1].innerText.trim();
      const title = cols[2].innerText.trim();
      const faculty = cols[7].innerText.trim();
      const slot = cols[8].innerText.trim();
      const room = cols[9].innerText.trim();

      slotMap[slot] = {
        code,
        title,
        faculty,
        room
      };

    });

    return {
      batch,
      slotMap
    };

  });

};