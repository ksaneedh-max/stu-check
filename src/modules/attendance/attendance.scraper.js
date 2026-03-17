exports.extract = async (page) => {

  try {

    let attendanceFrame = null;

    /* ---------- FAST PATH (most cases) ---------- */

    try {

      const table = await page.waitForSelector(
        "table tbody tr",
        { timeout: 5000 }
      );

      if (table) {
        attendanceFrame = page;
      }

    } catch {}



    /* ---------- FRAME SEARCH ---------- */

    if (!attendanceFrame) {

      for (const frame of page.frames()) {

        try {

          const table = await frame.waitForSelector(
            "table tbody tr",
            { timeout: 4000 }
          );

          if (table) {
            attendanceFrame = frame;
            break;
          }

        } catch {}

      }

    }



    /* ---------- SECOND PASS (SLOW NETWORK FALLBACK) ---------- */

    if (!attendanceFrame) {

      await page.waitForTimeout(3000);

      for (const frame of page.frames()) {

        try {

          const table = await frame.waitForSelector(
            "table tbody tr",
            { timeout: 8000 }
          );

          if (table) {
            attendanceFrame = frame;
            break;
          }

        } catch {}

      }

    }



    /* ---------- FINAL GLOBAL SEARCH ---------- */

    if (!attendanceFrame) {

      const table = await page.$("table tbody tr");

      if (table) {
        attendanceFrame = page;
      }

    }



    if (!attendanceFrame) {
      throw new Error("Attendance table not found");
    }



    /* ---------- SCRAPE ---------- */

    const courses = await attendanceFrame.$$eval(
      "table tbody tr",
      (rows) => {

        const data = [];

        rows.forEach((row, index) => {

          if (index === 0) return;

          const cols = row.querySelectorAll("td");
          if (cols.length < 9) return;

          const code = cols[0].innerText.trim();
          const title = cols[1].innerText.trim();
          const faculty = cols[3].innerText.trim();
          const slot = cols[4].innerText.trim();
          const room = cols[5].innerText.trim();

          const conducted = parseInt(cols[6].innerText.trim());
          const absent = parseInt(cols[7].innerText.trim());
          const attendance = cols[8].innerText.trim();

          if (!code || !title || isNaN(conducted)) return;

          data.push({
            code,
            title,
            faculty,
            slot,
            room,
            conducted,
            absent,
            attendance
          });

        });

        return data;

      }
    );



    /* ---------- VALIDATION FALLBACK ---------- */

    if (!courses || courses.length === 0) {

      console.log("Attendance empty → retrying extraction");

      const rows = await attendanceFrame.$$("table tbody tr");

      if (rows.length > 1) {

        const retry = [];

        for (let i = 1; i < rows.length; i++) {

          const cols = await rows[i].$$("td");
          if (cols.length < 9) continue;

          retry.push({
            code: await cols[0].innerText(),
            title: await cols[1].innerText(),
            faculty: await cols[3].innerText(),
            slot: await cols[4].innerText(),
            room: await cols[5].innerText(),
            conducted: parseInt(await cols[6].innerText()),
            absent: parseInt(await cols[7].innerText()),
            attendance: await cols[8].innerText()
          });

        }

        return { courses: retry };

      }

    }



    return { courses };

  } catch (err) {

    console.error("Attendance scrape error:", err.message);

    return { courses: [] };

  }

};
