/**
 * AstroCosm nav.js
 * Shared navigation bar renderer and header profile updater.
 * Injected into every screen page.
 */

const NAV_ITEMS = [
  {
    target: "dashboard.html",
    label: "Feed",
    svg: `<svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zM12 6l7.5 13h-15L12 6z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    target: "chart.html",
    label: "Birth Chart",
    svg: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="12" y1="2" x2="12" y2="22" stroke-width="1.5"/><line x1="2" y1="12" x2="22" y2="12" stroke-width="1.5"/></svg>`
  },
  {
    target: "synastry.html",
    label: "Synastry",
    svg: `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  {
    target: "tarot.html",
    label: "Tarot",
    svg: `<svg viewBox="0 0 24 24"><rect x="4" y="3" width="7" height="13" rx="1.5" stroke-width="2"/><rect x="13" y="8" width="7" height="13" rx="1.5" stroke-width="2"/></svg>`
  },
  {
    target: "astraea.html",
    label: "Astraea",
    svg: `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    target: "profile.html",
    label: "Profile",
    svg: `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke-width="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke-width="2" stroke-linecap="round"/></svg>`
  }
];

function renderNav() {
  const navbar = document.getElementById("app-navbar");
  if (!navbar) return;

  // Determine current page filename
  const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";

  navbar.innerHTML = NAV_ITEMS.map(item => {
    const isActive = currentPage === item.target;
    return `
      <a class="nav-item${isActive ? " active" : ""}" href="${item.target}" aria-label="${item.label}">
        ${item.svg}
        <span>${item.label}</span>
      </a>
    `;
  }).join("");
}

function renderHeaderProfile() {
  const chart = getSavedChart();
  const btn = document.getElementById("header-profile-btn");
  if (!btn) return;

  if (chart) {
    btn.style.display = "flex";
    document.getElementById("header-user-name").textContent = chart.birthInfo.name || "User";
    const sunPl = chart.placements.find(p => p.id === "sun");
    document.getElementById("header-user-sign").textContent = sunPl ? sunPl.symbol : "✨";
    btn.addEventListener("click", () => { window.location.href = "dashboard.html"; });
  } else {
    btn.style.display = "none";
  }
}

function getSavedChart() {
  try {
    const raw = localStorage.getItem("astro_user_chart");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function getSavedPartnerChart() {
  try {
    const raw = localStorage.getItem("astro_partner_chart");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function getSavedCompatibility() {
  try {
    const raw = localStorage.getItem("astro_compatibility");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function guardAuth() {
  // Redirect to onboarding if no chart saved
  if (!getSavedChart()) {
    window.location.href = "index.html";
  }
}

// Auto-run on every page load
document.addEventListener("DOMContentLoaded", () => {
  renderNav();
  renderHeaderProfile();
});
