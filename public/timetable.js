/* ================= TIMETABLE ================= */

async function timetable() {

  try {

    showLoader();

    const res = await fetch("/timetable");

    if (!res.ok) {
      throw new Error("Failed to fetch timetable");
    }

    const data = await res.json();

    hideLoader();

    renderTimetable(data.timetable);

  } catch (err) {

    hideLoader();
    console.error("Timetable error:", err);

    const result = document.getElementById("result");

    result.innerHTML = `
      <div class="card">
        <h3>Error loading timetable</h3>
      </div>
    `;

  }

}


/* ================= RENDER TIMETABLE ================= */

function renderTimetable(data) {

  const result = document.getElementById("result");

  if (!data || !data.periods) {

    result.innerHTML = `
      <div class="card">
        <h3>No timetable available</h3>
      </div>
    `;

    return;

  }

  let html = `
  <div class="card">
  <h2>Timetable</h2>
  <div class="table-wrapper">
  <table class="timetable">
  `;

  /* ---------- HEADER ---------- */

  html += "<tr><th>Day</th>";

  data.periods.forEach(p => {
    html += `<th>${p}</th>`;
  });

  html += "</tr>";

  /* ---------- ROWS ---------- */

  for (const day in data.dayOrders) {

    html += `<tr><td class="day">Day ${day}</td>`;

    const periods = data.dayOrders[day];

    data.periods.forEach((p, index) => {

      const cls = periods.find(x => x.period === index + 1);

      if (cls && cls.subject) {

        html += `
        <td class="class-cell">
          <div class="subject">${cls.subject}</div>
          <div class="room">${cls.room || ""}</div>
        </td>
        `;

      } else {

        html += `<td class="empty">-</td>`;

      }

    });

    html += "</tr>";

  }

  html += `
  </table>
  </div>
  </div>
  `;

  result.innerHTML = html;

}