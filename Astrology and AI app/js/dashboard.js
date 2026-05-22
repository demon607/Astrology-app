/**
 * AstroCosm dashboard.js
 * Horoscope Feed screen logic for dashboard.html
 */

let activePeriod = "daily";

document.addEventListener("DOMContentLoaded", () => {
  guardAuth();

  const chart = getSavedChart();

  // Populate header chips
  document.getElementById("dash-user-welcome").textContent = `${chart.birthInfo.name}'s Cosmos`;

  const sunPl = chart.placements.find(p => p.id === "sun");
  document.getElementById("dash-sign-badge").textContent = sunPl ? sunPl.symbol : "✨";
  document.getElementById("chip-sun").textContent    = chart.sunSign;
  document.getElementById("chip-moon").textContent   = chart.moonSign;
  document.getElementById("chip-rising").textContent = chart.risingSign;

  // Period tab listeners
  document.querySelectorAll(".tab-btn[data-period]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn[data-period]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activePeriod = btn.getAttribute("data-period");
      renderHoroscope(chart);
    });
  });

  renderHoroscope(chart);
});

function renderHoroscope(chart) {
  const reading = generateHoroscope(chart.sunSign, chart.moonSign, activePeriod);

  document.getElementById("horo-period-title").textContent =
    activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1) + " Reading";

  const opts = { month: "long", day: "numeric", year: "numeric" };
  let dateText = new Date().toLocaleDateString("en-US", opts);
  if (activePeriod === "weekly")  dateText = "Current Cosmic Cycle";
  if (activePeriod === "monthly") dateText = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  document.getElementById("horo-date").textContent = dateText;

  document.getElementById("horo-text").innerHTML = reading.text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Animate bars
  const loveFill   = document.getElementById("bar-love");
  const careerFill = document.getElementById("bar-career");
  const healthFill = document.getElementById("bar-health");

  loveFill.style.width   = "0%";
  careerFill.style.width = "0%";
  healthFill.style.width = "0%";

  setTimeout(() => {
    loveFill.style.width   = `${reading.stats.love}%`;
    careerFill.style.width = `${reading.stats.career}%`;
    healthFill.style.width = `${reading.stats.health}%`;
  }, 100);

  document.getElementById("val-love").textContent   = `${reading.stats.love}%`;
  document.getElementById("val-career").textContent = `${reading.stats.career}%`;
  document.getElementById("val-health").textContent = `${reading.stats.health}%`;
}
