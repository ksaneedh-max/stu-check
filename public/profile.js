async function loadProfile() {

  const result = document.getElementById("result");

  result.innerHTML = "Loading profile...";

  try {

    const res = await fetch("/profile");
    const data = await res.json();

    renderProfile(data);

  } catch (err) {

    result.innerHTML = "Failed to load profile";

  }

}

function renderProfile(data) {

  const result = document.getElementById("result");

  result.innerHTML = `
  
  <div class="profile-card">

    <h2>${data.name}</h2>

    <div class="profile-grid">

      <div><b>Reg No</b><br>${data.regNo}</div>

      <div><b>Program</b><br>${data.program}</div>

      <div><b>Department</b><br>${data.department}</div>

      <div><b>Semester</b><br>${data.semester}</div>

      <div><b>Batch</b><br>${data.batch}</div>

      <div><b>Mobile</b><br>${data.mobile}</div>

    </div>

  </div>

  `;

}