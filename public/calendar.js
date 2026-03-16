async function calendar() {

  const result = document.getElementById("result");

  result.innerHTML = "Loading calendar...";

  const res = await fetch("/calendar");
  const data = await res.json();

  renderCalendar(data.months);

}


function renderCalendar(months) {

  const result = document.getElementById("result");

  const monthNames = Object.keys(months);

  let html = `<div class="month-buttons">`;

  monthNames.forEach(m => {

    html += `
    <button onclick="showMonth('${m}')">
      ${m}
    </button>
    `;

  });

  html += `</div>`;

  html += `<div id="calendarMonth"></div>`;

  result.innerHTML = html;

  showMonth(monthNames[0]);

}


function showMonth(month) {

  const container = document.getElementById("calendarMonth");

  fetch("/calendar")
    .then(res => res.json())
    .then(data => {

      const rows = data.months[month];

      let html = `<h2>${month}</h2><table class="calendar">`;

      html += `
      <tr>
        <th>Date</th>
        <th>Day</th>
        <th>Status</th>
      </tr>
      `;

      rows.forEach(r => {

        const cls = r.type === "holiday" ? "holiday" : "class";

        html += `
        <tr class="${cls}">
          <td>${r.date}</td>
          <td>${r.day}</td>
          <td>${r.detail} ${r.reason || ""}</td>
        </tr>
        `;

      });

      html += `</table>`;

      container.innerHTML = html;

    });

}