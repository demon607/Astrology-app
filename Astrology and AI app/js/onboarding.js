/**
 * AstroCosm onboarding.js
 * Handles the birth details form on index.html.
 * On submit, saves chart to localStorage and redirects to dashboard.
 */

const CITY_COORDINATES = {
  newyork: { lon: -74.006,  lat: 40.7128,  tz: -5 },
  london:  { lon: -0.1278,  lat: 51.5074,  tz: 0 },
  tokyo:   { lon: 139.6917, lat: 35.6762,  tz: 9 },
  mumbai:  { lon: 72.8777,  lat: 19.0760,  tz: 5.5 },
  sydney:  { lon: 151.2093, lat: -33.8688, tz: 10 }
};

document.addEventListener("DOMContentLoaded", () => {
  const existing = localStorage.getItem("astro_user_chart");
  const editMode = localStorage.getItem("astro_edit_mode");

  // If user has a chart and is NOT editing, skip to dashboard
  if (existing && !editMode) {
    window.location.href = "dashboard.html";
    return;
  }

  const citySelect = document.getElementById("ob-city");
  const coordsRow  = document.getElementById("custom-coords-row");

  // Pre-fill form if coming from profile edit
  if (editMode) {
    localStorage.removeItem("astro_edit_mode");
    try {
      const prefillRaw = localStorage.getItem("astro_edit_prefill");
      if (prefillRaw) {
        const chart = JSON.parse(prefillRaw);
        localStorage.removeItem("astro_edit_prefill");
        const bInfo = chart.birthInfo;

        document.getElementById("ob-name").value = chart.birthInfo.name || "";
        document.getElementById("ob-date").value = bInfo.date || "";
        document.getElementById("ob-time").value = bInfo.time || "12:00";

        // Try to match a city preset
        let matchedKey = "custom";
        for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
          if (
            Math.abs(coords.lon - (bInfo.longitude || 0)) < 0.5 &&
            Math.abs(coords.lat - (bInfo.latitude  || 0)) < 0.5
          ) {
            matchedKey = key;
            break;
          }
        }
        citySelect.value = matchedKey;
        if (matchedKey === "custom") {
          coordsRow.style.display = "flex";
          document.getElementById("ob-lon").value = bInfo.longitude || 0;
          document.getElementById("ob-lat").value = bInfo.latitude  || 0;
          document.getElementById("ob-tz").value  = bInfo.timezoneOffsetHours || 0;
        }
      }
    } catch (e) { /* ignore parse errors */ }
  }

  citySelect.addEventListener("change", () => {
    coordsRow.style.display = citySelect.value === "custom" ? "flex" : "none";
  });

  document.getElementById("onboarding-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("ob-name").value.trim();
    const date = document.getElementById("ob-date").value;
    const time = document.getElementById("ob-time").value;

    let lon, lat, tz;
    const preset = citySelect.value;

    if (preset === "custom") {
      lon = parseFloat(document.getElementById("ob-lon").value);
      lat = parseFloat(document.getElementById("ob-lat").value);
      tz  = parseFloat(document.getElementById("ob-tz").value);
    } else {
      ({ lon, lat, tz } = CITY_COORDINATES[preset]);
    }

    const locationLabel = citySelect.options[citySelect.selectedIndex].text;
    const chart = calculateChart(date, time, locationLabel, lon, lat, tz);
    chart.birthInfo.name = name;

    localStorage.setItem("astro_user_chart", JSON.stringify(chart));

    // Initialize welcome chat only if no existing history
    const existingChat = localStorage.getItem("astro_chat_history");
    if (!existingChat) {
      const welcome = (typeof AI_ASTROLOGER_PROFILE !== "undefined")
        ? AI_ASTROLOGER_PROFILE.welcomeMessage
            .replace("{sun}", chart.sunSign)
            .replace("{moon}", chart.moonSign)
            .replace("{rising}", chart.risingSign)
        : `Welcome! Your Sun is in ${chart.sunSign}, Moon in ${chart.moonSign}, Rising in ${chart.risingSign}.`;

      localStorage.setItem("astro_chat_history", JSON.stringify([
        { sender: "ai", text: welcome }
      ]));
    }

    window.location.href = "dashboard.html";
  });
});
