const startup = document.getElementById("startup");
const app = document.getElementById("app");

const loginSection = document.getElementById("loginSection");
const actionSection = document.getElementById("actionSection");

const loader = document.getElementById("loader");
const result = document.getElementById("result");


/* ---------------- STARTUP ---------------- */

document.addEventListener("DOMContentLoaded", async function () {

  startup.style.display = "flex";
  app.classList.add("hidden");

  try {

    const minDelay = new Promise(resolve => setTimeout(resolve, 1000));

    const res = await fetch("/status", {
      cache: "no-store",
      credentials: "include"
    });

    if (!res.ok) {
      throw new Error("Status request failed");
    }

    const data = await res.json();

    await minDelay;

    startup.style.display = "none";
    app.classList.remove("hidden");

    if (data.logged_in) {
      showLoggedInUI();
    } else {
      showLoggedOutUI();
    }

  } catch (err) {

    console.error("Status check failed:", err);

    startup.style.display = "none";
    app.classList.remove("hidden");

    showLoggedOutUI();

  }

});


/* ---------------- UI ---------------- */

function showLoggedInUI() {

  result.innerHTML = "";

  loginSection.classList.add("hidden");
  actionSection.classList.remove("hidden");

}

function showLoggedOutUI() {

  result.innerHTML = "";

  loginSection.classList.remove("hidden");
  actionSection.classList.add("hidden");

}


/* ---------------- LOADER ---------------- */

function showLoader() {
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}


/* ---------------- LOGIN ---------------- */

async function login() {

  showLoader();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    hideLoader();
    alert("Enter email and password");
    return;
  }

  try {

    const res = await fetch("/login", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      credentials: "include",

      body: JSON.stringify({
        email,
        password
      })

    });

    const data = await res.json();

    hideLoader();

    if (data.status === "login_success" || data.status === "already_logged_in") {

      showLoggedInUI();

      result.innerHTML = `
        <div class="course">
          <h3>Login Successful</h3>
          <p>You are now logged in.</p>
        </div>
      `;

    } else {

      alert("Login failed");

    }

  } catch (err) {

    hideLoader();
    alert("Login request failed");

  }

}


/* ---------------- ATTENDANCE ---------------- */

async function attendance() {

  showLoader();
  result.innerHTML = "";

  try {

    const res = await fetch("/attendance", {
      credentials: "include"
    });

    const data = await res.json();

    hideLoader();

    if (!data.courses) {

      result.innerHTML = `
        <div class="course">
          <h3>Error</h3>
          <p>Failed to load attendance</p>
        </div>
      `;

      return;

    }

    let html = "";

    data.courses.forEach(c => {

      const conducted = parseInt(c.conducted);
      const absent = parseInt(c.absent);

      const present = conducted - absent;

      const required = Math.ceil(conducted * 0.75);

      const margin = present - required;

      let marginClass = "margin-good";

      if (margin < 0) {
        marginClass = "margin-bad";
      }

      const marginText =
        margin >= 0
          ? `+${margin} classes safe`
          : `${margin} classes shortage`;

      html += `
        <div class="course">

          <h3>${c.title}</h3>

          <p><b>Total Classes:</b> ${conducted}</p>
          <p><b>Present:</b> ${present}</p>
          <p><b>Absent:</b> ${absent}</p>

          <p class="${marginClass}">
            Margin: ${marginText}
          </p>

        </div>
      `;

    });

    result.innerHTML = html;

  } catch (err) {

    hideLoader();

    result.innerHTML = `
      <div class="course">
        <h3>Error</h3>
        <p>Attendance request failed</p>
      </div>
    `;

  }

}


/* ---------------- MARKS ---------------- */

async function marks() {

  showLoader();
  result.innerHTML = "";

  try {

    const res = await fetch("/marks", {
      credentials: "include"
    });

    const data = await res.json();

    hideLoader();

    if (!data.subjects) {

      result.innerHTML = `
        <div class="course">
          <h3>Error</h3>
          <p>Failed to load marks</p>
        </div>
      `;

      return;

    }

    let html = "";

    data.subjects.forEach(s => {

      html += `<div class="course"><h3>${s.title}</h3>`;

      s.components.forEach(c => {

        html += `
          <p>${c.name}: ${c.score}/${c.max}</p>
        `;

      });

      html += `
        <p><b>Total:</b> ${s.total}/${s.max}</p>
      `;

      html += `</div>`;

    });

    result.innerHTML = html;

  } catch (err) {

    hideLoader();

    result.innerHTML = `
      <div class="course">
        <h3>Error</h3>
        <p>Marks request failed</p>
      </div>
    `;

  }

}


/* ---------------- LOGOUT ---------------- */

async function logout() {

  try {

    await fetch("/logout", {
      method: "POST",
      credentials: "include"
    });

    showLoggedOutUI();

    result.innerHTML = `
      <div class="course">
        <h3>Logged Out</h3>
        <p>Your session has been cleared.</p>
      </div>
    `;

  } catch {

    alert("Logout failed");

  }

}