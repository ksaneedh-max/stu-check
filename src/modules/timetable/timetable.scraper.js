exports.extractTimetable = async (page, slotMap) => {

  /* ---------- WAIT FOR TIMETABLE TABLE ---------- */

  try {
    await page.waitForSelector("table[border='5']", { timeout: 15000 });
  } catch {
    return { periods: [], dayOrders: {} };
  }

  /* ---------- WAIT FOR ROWS ---------- */

  await page.waitForFunction(() => {
    const table = document.querySelector("table[border='5']");
    if (!table) return false;
    return table.querySelectorAll("tr").length > 3;
  });

  /* ---------- STABILIZATION DELAY ---------- */

  await page.waitForTimeout(300);

  /* ---------- SCRAPE TIMETABLE ---------- */

  return page.evaluate((slotMap) => {

    const result = {
      periods: [],
      dayOrders: {}
    };

    const table = document.querySelector("table[border='5']");

    if (!table) return result;

    const rows = table.querySelectorAll("tr");

    /* ---------- GET PERIOD TIMINGS ---------- */

    const timeRow = rows[0].querySelectorAll("td");

    for (let i = 1; i < timeRow.length; i++) {
      result.periods.push(timeRow[i].innerText.trim());
    }

    /* ---------- PARSE DAY ORDERS ---------- */

    for (let r = 3; r < rows.length; r++) {

      const cols = rows[r].querySelectorAll("td");

      if (!cols || cols.length < 2) continue;

      const dayText = cols[0].innerText.trim();

      const dayMatch = dayText.match(/\d+/);

      if (!dayMatch) continue;

      const day = dayMatch[0];

      result.dayOrders[day] = [];

      for (let c = 1; c < cols.length; c++) {

        let slot = cols[c].innerText.trim();

        if (!slot) continue;

        slot = slot.split("/")[0].trim();

        const subject = slotMap[slot];

        result.dayOrders[day].push({
          period: c,
          slot,
          subject: subject ? subject.title : null,
          faculty: subject ? subject.faculty : null,
          room: subject ? subject.room : null
        });

      }

    }

    return result;

  }, slotMap);

};