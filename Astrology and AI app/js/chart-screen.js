/**
 * AstroCosm chart-screen.js
 * Birth Chart screen logic for chart.html
 */

document.addEventListener("DOMContentLoaded", () => {
  guardAuth();

  const chart = getSavedChart();

  // Render SVG wheel
  const container = document.getElementById("chart-svg-container");
  renderZodiacChart(container, chart, (placement) => openModal(placement));

  // Render placement list
  const listEl = document.getElementById("chart-placements-list");
  listEl.innerHTML = "";

  chart.placements.forEach(p => {
    const item = document.createElement("div");
    item.className = "placement-item";
    item.addEventListener("click", () => openModal(p));

    item.innerHTML = `
      <div class="placement-item-left">
        <span class="planet-symbol">${p.symbol}</span>
        <div>
          <div class="planet-name">${p.name}</div>
          <div class="planet-house">House ${p.house}</div>
        </div>
      </div>
      <div class="placement-item-right">
        <div class="sign-name">${p.signName}</div>
        <div class="sign-degree">${p.degree}° ${p.minutes}'${p.isRetrograde ? " Rx" : ""}</div>
      </div>
    `;

    listEl.appendChild(item);
  });

  // Modal close
  document.getElementById("modal-close-btn").addEventListener("click", closeModal);
  document.getElementById("placement-modal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("placement-modal")) closeModal();
  });
});

function openModal(placement) {
  document.getElementById("modal-symbol").textContent = placement.symbol;
  document.getElementById("modal-title").textContent  = `${placement.name} in ${placement.signName}`;

  let desc = ASTRO_DATA.placementsInterpretations[placement.id]?.[placement.signName];
  if (!desc) {
    const signTheme   = ASTRO_DATA.signs[placement.signName];
    const planetTheme = ASTRO_DATA.planets[placement.id] || { meaning: "Vibration" };
    desc = `Having **${placement.name}** placed in **${placement.signName}** means your **${planetTheme.meaning.toLowerCase()}** is colored by the traits of the sign: ${signTheme?.traits.join(", ")}. You express this placement on the cusp of **House ${placement.house}** (${ASTRO_DATA.houses[placement.house]?.keyword || "personal affairs"}), indicating that your activities in this house are heavily influenced by the ruling planet **${placement.ruler}**.`;
  }

  document.getElementById("modal-body").innerHTML = desc
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  document.getElementById("placement-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("placement-modal").style.display = "none";
}
