exports.extract = async (page) => {

  let attendanceFrame = null;

  /* ---------- FIND FRAME WITH ATTENDANCE TABLE ---------- */

  for (const frame of page.frames()) {

    try {

      const rows = await frame.locator("table tbody tr").count();

      if (rows > 0) {
        attendanceFrame = frame;
        break;
      }

    } catch {}

  }

  if (!attendanceFrame) {
    return { courses: [] };
  }

  /* ---------- SCRAPE DATA ---------- */

  return attendanceFrame.evaluate(() => {

    const rows = document.querySelectorAll("table tbody tr");

    const data = [];

    rows.forEach(row => {

      const cols = row.querySelectorAll("td");

      /* ---------- SKIP HEADER OR INVALID ROWS ---------- */

      if (!cols || cols.length < 9) return;

      const code = cols[0].innerText.trim();
      const title = cols[1].innerText.trim();
      const faculty = cols[3].innerText.trim();
      const slot = cols[4].innerText.trim();
      const room = cols[5].innerText.trim();

      const conductedText = cols[6].innerText.trim();
      const absentText = cols[7].innerText.trim();
      const attendanceText = cols[8].innerText.trim();

      const conducted = parseInt(conductedText);
      const absent = parseInt(absentText);

      /* ---------- IGNORE BAD ROWS ---------- */

      if (isNaN(conducted) || code === "" || title === "") {
        return;
      }

      data.push({
        code,
        title,
        faculty,
        slot,
        room,
        conducted,
        absent,
        attendance: attendanceText
      });

    });

    return { courses: data };

  });

};
