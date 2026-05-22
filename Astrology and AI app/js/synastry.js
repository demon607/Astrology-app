/**
 * AstroCosm synastry.js
 * Synastry / Compatibility screen logic for synastry.html
 */

const CITY_COORDINATES_SYN = {
  newyork: { lon: -74.006,  lat: 40.7128,  tz: -5 },
  london:  { lon: -0.1278,  lat: 51.5074,  tz: 0 },
  tokyo:   { lon: 139.6917, lat: 35.6762,  tz: 9 },
  mumbai:  { lon: 72.8777,  lat: 19.0760,  tz: 5.5 },
  sydney:  { lon: 151.2093, lat: -33.8688, tz: 10 }
};

document.addEventListener("DOMContentLoaded", () => {
  guardAuth();

  // City select toggle
  const citySelect = document.getElementById("comp-city");
  const coordsRow  = document.getElementById("comp-coords-row");
  citySelect.addEventListener("change", () => {
    coordsRow.style.display = citySelect.value === "custom" ? "flex" : "none";
  });

  // Restore saved results if they exist
  const savedPartner = getSavedPartnerChart();
  const savedCompat  = getSavedCompatibility();
  if (savedPartner && savedCompat) {
    renderResults(getSavedChart(), savedPartner, savedCompat);
  }

  // Form submit
  document.getElementById("compatibility-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const userChart = getSavedChart();
    const name = document.getElementById("comp-name").value.trim();
    const date = document.getElementById("comp-date").value;
    const time = document.getElementById("comp-time").value;

    let lon, lat, tz;
    const preset = citySelect.value;
    if (preset === "custom") {
      lon = parseFloat(document.getElementById("comp-lon").value);
      lat = parseFloat(document.getElementById("comp-lat").value);
      tz  = parseFloat(document.getElementById("comp-tz").value);
    } else {
      ({ lon, lat, tz } = CITY_COORDINATES_SYN[preset]);
    }

    const locationLabel = citySelect.options[citySelect.selectedIndex].text;
    const partnerChart  = calculateChart(date, time, locationLabel, lon, lat, tz);
    partnerChart.birthInfo.name = name;

    const compat = calculateCompatibility(userChart, partnerChart);

    // Persist
    localStorage.setItem("astro_partner_chart",  JSON.stringify(partnerChart));
    localStorage.setItem("astro_compatibility",   JSON.stringify(compat));

    renderResults(userChart, partnerChart, compat);
  });

  // Recalculate button
  document.getElementById("comp-recalculate-btn").addEventListener("click", () => {
    localStorage.removeItem("astro_partner_chart");
    localStorage.removeItem("astro_compatibility");
    document.getElementById("comp-results-view").style.display = "none";
    document.getElementById("comp-setup-card").style.display   = "block";
    document.getElementById("compatibility-form").reset();
    coordsRow.style.display = "none";
  });

  // Modal close
  document.getElementById("modal-close-btn").addEventListener("click", closeModal);
  document.getElementById("placement-modal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("placement-modal")) closeModal();
  });
});

function renderResults(userChart, partnerChart, compat) {
  document.getElementById("comp-setup-card").style.display   = "none";
  document.getElementById("comp-results-view").style.display = "block";

  document.getElementById("comp-title-names").textContent =
    `${userChart.birthInfo.name} & ${partnerChart.birthInfo.name}`;

  const mySun = userChart.placements.find(p => p.id === "sun");
  const pSun  = partnerChart.placements.find(p => p.id === "sun");
  document.getElementById("comp-my-avatar").textContent      = mySun ? mySun.symbol : "✨";
  document.getElementById("comp-partner-avatar").textContent = pSun  ? pSun.symbol  : "✨";

  // Score ring animation
  document.getElementById("comp-score-pct").textContent = `${compat.overall}%`;
  const dashoffset = 377 - (377 * compat.overall) / 100;
  const circleEl   = document.getElementById("comp-score-circle");
  circleEl.style.strokeDashoffset = 377;
  setTimeout(() => { circleEl.style.strokeDashoffset = dashoffset; }, 150);

  // Category bars
  ["love", "mind", "spirit"].forEach(cat => {
    const fill = document.getElementById(`bar-comp-${cat}`);
    const val  = document.getElementById(`val-comp-${cat}`);
    fill.style.width = "0%";
    setTimeout(() => { fill.style.width = `${compat[cat]}%`; }, 100);
    val.textContent = `${compat[cat]}%`;
  });

  // Aspects list
  const listEl = document.getElementById("comp-aspects-list");
  listEl.innerHTML = "";

  if (compat.aspects.length === 0) {
    listEl.innerHTML = `<div style="text-align:center;color:var(--color-starlight-dim);font-size:0.85rem;padding:20px;">No exact orbital aspects found. Your relationship flows on a quiet, harmonious frequency.</div>`;
    return;
  }

  compat.aspects.forEach(asp => {
    const row = document.createElement("div");
    row.className = "placement-item";
    row.addEventListener("click", () => openAspectModal(asp));

    const harmonyLabel = asp.weight > 0.5 ? "Harmonious" : asp.weight < 0 ? "Challenging" : "Neutral";
    const harmonyColor = asp.weight > 0.5
      ? "var(--color-cosmic-cyan)"
      : asp.weight < 0
        ? "var(--color-nebula-pink)"
        : "var(--color-starlight)";

    row.innerHTML = `
      <div class="placement-item-left">
        <span class="planet-symbol" style="color:${asp.weight > 0 ? "var(--color-cosmic-cyan)" : "var(--color-nebula-pink)"}">${asp.symbol}</span>
        <div>
          <div class="planet-name" style="font-size:0.8rem;">${asp.planetA} ${asp.type} ${asp.planetB}</div>
          <div class="planet-house" style="font-size:0.7rem;">Orb: ${asp.orb}°</div>
        </div>
      </div>
      <div class="placement-item-right">
        <span class="sign-name" style="font-size:0.75rem;color:${harmonyColor}">${harmonyLabel}</span>
      </div>
    `;
    listEl.appendChild(row);
  });
}

function openAspectModal(asp) {
  document.getElementById("modal-symbol").textContent = asp.symbol;
  document.getElementById("modal-title").textContent  = `${asp.planetA} ${asp.type} ${asp.planetB}`;

  const aspectMeaning = ASTRO_DATA.compatibilityAspectInterpretations[asp.type] || "Favorable alignments.";
  const text = `This Synastry aspect creates orbital dynamics between your ${asp.planetA} and your partner's ${asp.planetB} with an orb of ${asp.orb}°.\n\n${asp.type} Dynamic: ${aspectMeaning} This indicates that in daily interactions, your ${asp.planetA.toLowerCase()} energy relates to their ${asp.planetB.toLowerCase()} in a ${asp.weight > 0.5 ? "harmonious, mutually expanding way" : "challenging way that stimulates deep evolutionary lessons"}.`;

  document.getElementById("modal-body").textContent = text;
  document.getElementById("placement-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("placement-modal").style.display = "none";
}
