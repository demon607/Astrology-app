/**
 * AstroCosm profile.js
 * Profile & Settings screen logic for profile.html
 */

const CITY_COORDINATES_PROF = {
  newyork: { lon: -74.006,  lat: 40.7128,  tz: -5 },
  london:  { lon: -0.1278,  lat: 51.5074,  tz: 0 },
  tokyo:   { lon: 139.6917, lat: 35.6762,  tz: 9 },
  mumbai:  { lon: 72.8777,  lat: 19.0760,  tz: 5.5 },
  sydney:  { lon: 151.2093, lat: -33.8688, tz: 10 }
};

document.addEventListener("DOMContentLoaded", () => {
  guardAuth();

  const chart = getSavedChart();
  renderProfile(chart);

  // Edit birth details → go back to onboarding with pre-filled data
  document.getElementById("profile-edit-btn").addEventListener("click", () => {
    // Back up chart data so onboarding can pre-fill the form
    const raw = localStorage.getItem("astro_user_chart");
    if (raw) localStorage.setItem("astro_edit_prefill", raw);
    localStorage.setItem("astro_edit_mode", "true");
    // Remove chart so onboarding doesn't auto-redirect
    localStorage.removeItem("astro_user_chart");
    window.location.href = "index.html";
  });

  // Reset all data
  document.getElementById("profile-clear-btn").addEventListener("click", () => {
    if (!confirm("Reset your profile details and chat history?")) return;
    localStorage.removeItem("astro_user_chart");
    localStorage.removeItem("astro_chat_history");
    localStorage.removeItem("astro_partner_chart");
    localStorage.removeItem("astro_compatibility");
    localStorage.removeItem("astro_edit_mode");
    window.location.href = "index.html";
  });
});

function renderProfile(chart) {
  const sunPl = chart.placements.find(p => p.id === "sun");
  document.getElementById("profile-avatar").textContent     = sunPl ? sunPl.symbol : "✨";
  document.getElementById("profile-name-title").textContent = chart.birthInfo.name;

  const bInfo = chart.birthInfo;
  const birthDate = new Date(bInfo.date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });
  let [h, m] = bInfo.time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const timeStr = `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
  document.getElementById("profile-birth-summary").textContent =
    `Born ${birthDate} at ${timeStr} in ${bInfo.location}`;

  // Element & modality counts
  const planetsOnly = chart.placements.filter(p => p.id !== "ascendant");
  const elements    = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalities  = { Cardinal: 0, Fixed: 0, Mutable: 0 };

  planetsOnly.forEach(p => {
    if (elements[p.element]   !== undefined) elements[p.element]++;
    if (modalities[p.modality] !== undefined) modalities[p.modality]++;
  });

  const total = planetsOnly.length || 1;

  const elementColors = {
    Fire: "#ff9800", Earth: "#4caf50", Air: "#00bcd4", Water: "#2196f3"
  };

  const elemBox = document.getElementById("profile-elements-box");
  elemBox.innerHTML = "";
  Object.entries(elements).forEach(([name, count]) => {
    const pct = Math.round((count / total) * 100);
    const row = document.createElement("div");
    row.className = "dimension-row";
    row.innerHTML = `
      <span class="dimension-label">${name}</span>
      <div class="dimension-bar-bg">
        <div class="dimension-bar-fill" style="width:0%;background:${elementColors[name]};"></div>
      </div>
      <span class="dimension-value">${pct}%</span>
    `;
    elemBox.appendChild(row);
    setTimeout(() => { row.querySelector(".dimension-bar-fill").style.width = `${pct}%`; }, 100);
  });

  const modBox = document.getElementById("profile-modalities-box");
  modBox.innerHTML = "";
  Object.entries(modalities).forEach(([name, count]) => {
    const pct = Math.round((count / total) * 100);
    const row = document.createElement("div");
    row.className = "dimension-row";
    row.innerHTML = `
      <span class="dimension-label">${name}</span>
      <div class="dimension-bar-bg">
        <div class="dimension-bar-fill" style="width:0%;background:linear-gradient(90deg,var(--color-nebula-violet) 0%,var(--color-gold-glow) 100%);"></div>
      </div>
      <span class="dimension-value">${pct}%</span>
    `;
    modBox.appendChild(row);
    setTimeout(() => { row.querySelector(".dimension-bar-fill").style.width = `${pct}%`; }, 100);
  });
}
