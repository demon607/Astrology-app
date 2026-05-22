/**
 * AstroCosm tarot-screen.js
 * Tarot screen logic for tarot.html
 */

let tarotMode       = "daily";
let selectedCards   = [];
let maxCards        = 1;

document.addEventListener("DOMContentLoaded", () => {
  guardAuth();

  // Mode tabs
  document.querySelectorAll(".tab-btn[data-tarot-mode]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn[data-tarot-mode]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      tarotMode = btn.getAttribute("data-tarot-mode");
      resetDeck();
    });
  });

  // Reset button
  document.getElementById("tarot-reset-btn").addEventListener("click", resetDeck);

  buildDeck();
});

function buildDeck() {
  maxCards = tarotMode === "three-card" ? 3 : 1;
  selectedCards = [];

  const slotsContainer = document.getElementById("tarot-slots-container");
  slotsContainer.style.display = tarotMode === "three-card" ? "flex" : "none";

  document.getElementById("tarot-reading-panel").style.display = "none";

  const deckEl = document.getElementById("tarot-deck");
  deckEl.innerHTML = "";

  // Create shuffled deck of card backs
  const totalCards = TAROT_DATABASE.length;
  const spread = 180; // degrees of fan
  const startAngle = -spread / 2;

  TAROT_DATABASE.forEach((card, i) => {
    const cardEl = document.createElement("div");
    cardEl.className = "tarot-card-back";
    cardEl.dataset.cardId = card.id;

    const angle = startAngle + (spread / (totalCards - 1)) * i;
    cardEl.style.setProperty("--card-angle", `${angle}deg`);
    cardEl.style.setProperty("--card-index", i);

    cardEl.innerHTML = `<span class="tarot-card-back-symbol">✦</span>`;

    cardEl.addEventListener("click", () => selectCard(card, cardEl));
    deckEl.appendChild(cardEl);
  });
}

function selectCard(card, cardEl) {
  if (selectedCards.length >= maxCards) return;
  if (selectedCards.find(c => c.card.id === card.id)) return;

  const isReversed = Math.random() < 0.3;
  selectedCards.push({ card, isReversed });

  // Flip visual
  cardEl.classList.add("selected");
  cardEl.innerHTML = `<span class="tarot-card-face-symbol">${card.symbol}</span><span class="tarot-card-face-name">${card.name}</span>`;

  if (selectedCards.length === maxCards) {
    setTimeout(() => showReading(), 400);
  }
}

function showReading() {
  const chart = getSavedChart();
  const readings = generateTarotReading(selectedCards, chart, tarotMode);
  if (!readings) return;

  const panel = document.getElementById("tarot-reading-panel");
  const list  = document.getElementById("tarot-reading-results-list");
  list.innerHTML = "";

  readings.forEach(r => {
    const block = document.createElement("div");
    block.style.cssText = "margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--glass-border);";
    block.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <span style="font-size:2rem;">${r.symbol}</span>
        <div>
          <div style="font-family:var(--font-display);font-size:0.95rem;color:var(--color-gold-glow);">${r.name}</div>
          <div style="font-size:0.75rem;color:var(--color-starlight-dim);">${r.orientation} · ${r.astrology}</div>
        </div>
        ${tarotMode === "three-card" ? `<span style="margin-left:auto;font-size:0.7rem;background:rgba(255,255,255,0.05);padding:4px 10px;border-radius:10px;color:var(--color-starlight-dim);">${r.positionHeader}</span>` : ""}
      </div>
      <p style="font-size:0.85rem;color:var(--color-starlight);margin-bottom:8px;line-height:1.5;">${r.meaning}</p>
      <p style="font-size:0.8rem;color:var(--color-starlight-dim);line-height:1.5;margin-bottom:8px;">${r.detail}</p>
      <p style="font-size:0.8rem;color:var(--color-cosmic-cyan);line-height:1.5;">${r.astroAdvice.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>
    `;
    list.appendChild(block);
  });

  panel.style.display = "block";
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetDeck() {
  buildDeck();
}
