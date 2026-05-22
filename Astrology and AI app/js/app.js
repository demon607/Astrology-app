/**
 * AstroCosm app.js
 * SPA Router, state manager, form handlers, and view binders.
 */

// City coordinates mapping for presets
const CITY_COORDINATES = {
  newyork: { lon: -74.006, lat: 40.7128, tz: -5 },
  london: { lon: -0.1278, lat: 51.5074, tz: 0 },
  tokyo: { lon: 139.6917, lat: 35.6762, tz: 9 },
  mumbai: { lon: 72.8777, lat: 19.0760, tz: 5.5 },
  sydney: { lon: 151.2093, lat: -33.8688, tz: 10 }
};

// Global App State
const state = {
  userChart: null,
  partnerChart: null,
  compatibility: null,
  activePeriod: "daily", // daily, weekly, monthly
  chatHistory: []
};

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  loadSavedUser();
  setupNavListeners();
  setupOnboardingForm();
  setupCompatibilityForm();
  setupChatForm();
  setupModal();
}

/**
 * Loads user chart from localStorage if it exists
 */
function loadSavedUser() {
  const savedChart = localStorage.getItem("astro_user_chart");
  const savedChat = localStorage.getItem("astro_chat_history");

  if (savedChart) {
    state.userChart = JSON.parse(savedChart);
    
    // Restore chat
    if (savedChat) {
      state.chatHistory = JSON.parse(savedChat);
    } else {
      initializeWelcomeChat();
    }
    
    // Set up UI
    showProfileHeader(true);
    switchView("dashboard");
    renderDashboard();
  } else {
    showProfileHeader(false);
    switchView("onboarding");
  }
}

function showProfileHeader(show) {
  const profileBtn = document.getElementById("header-profile-btn");
  if (!profileBtn) return;
  
  if (show && state.userChart) {
    profileBtn.style.display = "flex";
    document.getElementById("header-user-name").textContent = state.userChart.birthInfo.name || "User";
    const sunPl = state.userChart.placements.find(p => p.id === "sun");
    document.getElementById("header-user-sign").textContent = sunPl ? sunPl.symbol : "✨";
  } else {
    profileBtn.style.display = "none";
  }
}

/**
 * View Router Logic
 */
function switchView(viewId) {
  // Deactivate all views
  document.querySelectorAll(".app-view").forEach(v => v.classList.remove("active"));
  
  // Deactivate all navbar items
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  
  // Activate target view
  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.add("active");
  }
  
  // Highlight navbar item
  const navItem = document.querySelector(`.nav-item[data-target="${viewId}"]`);
  if (navItem) {
    navItem.classList.add("active");
  }

  // Scroll to top
  document.getElementById("main-content-scroll").scrollTop = 0;

  // Run screen-specific renderers
  if (viewId === "dashboard") {
    renderDashboard();
  } else if (viewId === "chart") {
    renderChartScreen();
  } else if (viewId === "compatibility") {
    renderCompatibilityScreen();
  } else if (viewId === "chat") {
    renderChatScreen();
  } else if (viewId === "profile") {
    renderProfileScreen();
  }
}

function setupNavListeners() {
  document.querySelectorAll(".nav-item[data-target]").forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      
      // If user hasn't completed onboarding, do not let them navigate elsewhere
      if (!state.userChart) {
        return;
      }
      
      const target = item.getAttribute("data-target");
      switchView(target);
    });
  });

  // Setup Profile Buttons
  const editBtn = document.getElementById("profile-edit-btn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      if (!state.userChart) return;
      const bInfo = state.userChart.birthInfo;
      document.getElementById("ob-name").value = bInfo.name || "";
      document.getElementById("ob-date").value = bInfo.date || "";
      document.getElementById("ob-time").value = bInfo.time || "12:00";
      
      const select = document.getElementById("ob-city");
      let matchedKey = "custom";
      for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
        if (Math.abs(coords.lon - bInfo.longitude) < 0.1 && Math.abs(coords.lat - bInfo.latitude) < 0.1) {
          matchedKey = key;
          break;
        }
      }
      select.value = matchedKey;
      const coordsRow = document.getElementById("custom-coords-row");
      if (matchedKey === "custom") {
        coordsRow.style.display = "flex";
        document.getElementById("ob-lon").value = bInfo.longitude;
        document.getElementById("ob-lat").value = bInfo.latitude;
        document.getElementById("ob-tz").value = bInfo.timezoneOffsetHours;
      } else {
        coordsRow.style.display = "none";
      }
      switchView("onboarding");
    });
  }

  const clearBtn = document.getElementById("profile-clear-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Reset your profile details and chat history?")) {
        localStorage.removeItem("astro_user_chart");
        localStorage.removeItem("astro_chat_history");
        state.userChart = null;
        state.partnerChart = null;
        state.compatibility = null;
        state.chatHistory = [];
        showProfileHeader(false);
        
        // Clear forms
        document.getElementById("onboarding-form").reset();
        document.getElementById("compatibility-form").reset();
        document.getElementById("comp-results-view").style.display = "none";
        document.getElementById("comp-setup-card").style.display = "block";

        switchView("onboarding");
      }
    });
  }

  // Header quick profile returns to dashboard
  document.getElementById("header-profile-btn").addEventListener("click", () => {
    switchView("dashboard");
  });
}

/**
 * Screen 1: Onboarding Setup
 */
function setupOnboardingForm() {
  const citySelect = document.getElementById("ob-city");
  const coordsRow = document.getElementById("custom-coords-row");

  citySelect.addEventListener("change", () => {
    if (citySelect.value === "custom") {
      coordsRow.style.display = "flex";
    } else {
      coordsRow.style.display = "none";
    }
  });

  const form = document.getElementById("onboarding-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = document.getElementById("ob-name").value;
    const date = document.getElementById("ob-date").value;
    const time = document.getElementById("ob-time").value;
    
    let lon, lat, tz;
    const cityPreset = citySelect.value;
    
    if (cityPreset === "custom") {
      lon = parseFloat(document.getElementById("ob-lon").value);
      lat = parseFloat(document.getElementById("ob-lat").value);
      tz = parseFloat(document.getElementById("ob-tz").value);
    } else {
      const coords = CITY_COORDINATES[cityPreset];
      lon = coords.lon;
      lat = coords.lat;
      tz = coords.tz;
    }

    // Generate Chart
    const locationLabel = citySelect.options[citySelect.selectedIndex].text;
    const chart = calculateChart(date, time, locationLabel, lon, lat, tz);
    chart.birthInfo.name = name;

    state.userChart = chart;
    localStorage.setItem("astro_user_chart", JSON.stringify(chart));
    
    // Init fresh chat
    state.chatHistory = [];
    initializeWelcomeChat();
    
    showProfileHeader(true);
    switchView("dashboard");
  });
}

/**
 * Screen 2: Dashboard/Horoscope View
 */
function renderDashboard() {
  if (!state.userChart) return;
  
  const welcomeEl = document.getElementById("dash-user-welcome");
  welcomeEl.textContent = `${state.userChart.birthInfo.name}'s Cosmos`;

  const sunSign = state.userChart.sunSign;
  const moonSign = state.userChart.moonSign;
  const risingSign = state.userChart.risingSign;

  // Update big badge symbol
  const sunPl = state.userChart.placements.find(p => p.id === "sun");
  document.getElementById("dash-sign-badge").textContent = sunPl ? sunPl.symbol : "✨";
  
  // Update chip text
  document.getElementById("chip-sun").textContent = sunSign;
  document.getElementById("chip-moon").textContent = moonSign;
  document.getElementById("chip-rising").textContent = risingSign;

  // Render Horoscope Text based on active sub tab
  renderHoroscopeContent();

  // Handle horoscope sub tabs only (exclude tarot tabs that use data-tarot-mode)
  const tabBtns = document.querySelectorAll("#view-dashboard .tab-btn[data-period]");
  tabBtns.forEach(btn => {
    btn.onclick = () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.activePeriod = btn.getAttribute("data-period");
      renderHoroscopeContent();
    };
  });
}

function renderHoroscopeContent() {
  if (!state.userChart) return;

  const sun = state.userChart.sunSign;
  const moon = state.userChart.moonSign;
  const validPeriods = ["daily", "weekly", "monthly"];
  const period = validPeriods.includes(state.activePeriod) ? state.activePeriod : "daily";
  if (state.activePeriod !== period) state.activePeriod = period;

  // Generate Horoscope Paragraph
  const reading = generateHoroscope(sun, moon, period);

  // Update DOM
  document.getElementById("horo-period-title").textContent = `${period.charAt(0).toUpperCase() + period.slice(1)} Reading`;
  
  // Format Date label
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  let dateText = new Date().toLocaleDateString('en-US', options);
  if (period === "weekly") {
    dateText = "Current Cosmic Cycle";
  } else if (period === "monthly") {
    const monthYear = { month: 'long', year: 'numeric' };
    dateText = new Date().toLocaleDateString('en-US', monthYear);
  }
  document.getElementById("horo-date").textContent = dateText;
  
  // Insert Text with bold sections
  document.getElementById("horo-text").innerHTML = reading.text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Trigger progress bar widths & animate values
  const loveFill = document.getElementById("bar-love");
  const careerFill = document.getElementById("bar-career");
  const healthFill = document.getElementById("bar-health");

  // Reset width first to allow transit animation
  loveFill.style.width = "0%";
  careerFill.style.width = "0%";
  healthFill.style.width = "0%";

  setTimeout(() => {
    loveFill.style.width = `${reading.stats.love}%`;
    careerFill.style.width = `${reading.stats.career}%`;
    healthFill.style.width = `${reading.stats.health}%`;
  }, 100);

  document.getElementById("val-love").textContent = `${reading.stats.love}%`;
  document.getElementById("val-career").textContent = `${reading.stats.career}%`;
  document.getElementById("val-health").textContent = `${reading.stats.health}%`;
}

/**
 * Screen 3: Birth Chart View & Modal Click Details
 */
function renderChartScreen() {
  if (!state.userChart) return;

  const container = document.getElementById("chart-svg-container");
  
  // Render SVG interactive elements
  renderZodiacChart(container, state.userChart, (placement) => {
    openPlacementModal(placement);
  });

  // Render Placements Listing underneath
  const listContainer = document.getElementById("chart-placements-list");
  listContainer.innerHTML = "";

  state.userChart.placements.forEach(p => {
    const item = document.createElement("div");
    item.className = "placement-item";
    item.addEventListener("click", () => openPlacementModal(p));

    const left = document.createElement("div");
    left.className = "placement-item-left";
    left.innerHTML = `
      <span class="planet-symbol">${p.symbol}</span>
      <div>
        <div class="planet-name">${p.name}</div>
        <div class="planet-house">House ${p.house}</div>
      </div>
    `;

    const right = document.createElement("div");
    right.className = "placement-item-right";
    right.innerHTML = `
      <div class="sign-name">${p.signName}</div>
      <div class="sign-degree">${p.degree}° ${p.minutes}'${p.isRetrograde ? " Rx" : ""}</div>
    `;

    item.appendChild(left);
    item.appendChild(right);
    listContainer.appendChild(item);
  });
}

function openPlacementModal(placement) {
  const modal = document.getElementById("placement-modal");
  document.getElementById("modal-symbol").textContent = placement.symbol;
  
  // Set details
  document.getElementById("modal-title").textContent = `${placement.name} in ${placement.signName}`;
  
  // Extract custom text from placementsInterpretations or generate general trait breakdown
  let desc = ASTRO_DATA.placementsInterpretations[placement.id]?.[placement.signName];
  if (!desc) {
    // Generate text if specific combination isn't defined
    const signTheme = ASTRO_DATA.signs[placement.signName];
    const planetTheme = ASTRO_DATA.planets[placement.id] || { meaning: "Vibration" };
    desc = `Having **${placement.name}** placed in **${placement.signName}** means your **${planetTheme.meaning.toLowerCase()}** is colored by the traits of the sign: ${signTheme?.traits.join(", ")}. You express this placement on the cusp of **House ${placement.house}** (${ASTRO_DATA.houses[placement.house]?.keyword || 'personal affairs'}), indicating that your activities in this house are heavily influenced by the ruling planet **${placement.ruler}**.`;
  }
  
  document.getElementById("modal-body").innerHTML = desc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  modal.style.display = "flex";
}

function setupModal() {
  const modal = document.getElementById("placement-modal");
  const closeBtn = document.getElementById("modal-close-btn");
  
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Tapping background closes modal
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

/**
 * Screen 4: Compatibility View
 */
function setupCompatibilityForm() {
  const citySelect = document.getElementById("comp-city");
  const coordsRow = document.getElementById("comp-coords-row");

  citySelect.addEventListener("change", () => {
    if (citySelect.value === "custom") {
      coordsRow.style.display = "flex";
    } else {
      coordsRow.style.display = "none";
    }
  });

  const form = document.getElementById("compatibility-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!state.userChart) return;

    const name = document.getElementById("comp-name").value;
    const date = document.getElementById("comp-date").value;
    const time = document.getElementById("comp-time").value;
    
    let lon, lat, tz;
    const cityPreset = citySelect.value;
    
    if (cityPreset === "custom") {
      lon = parseFloat(document.getElementById("comp-lon").value);
      lat = parseFloat(document.getElementById("comp-lat").value);
      tz = parseFloat(document.getElementById("comp-tz").value);
    } else {
      const coords = CITY_COORDINATES[cityPreset];
      lon = coords.lon;
      lat = coords.lat;
      tz = coords.tz;
    }

    const locationLabel = citySelect.options[citySelect.selectedIndex].text;
    const partnerChart = calculateChart(date, time, locationLabel, lon, lat, tz);
    partnerChart.birthInfo.name = name;

    state.partnerChart = partnerChart;
    state.compatibility = calculateCompatibility(state.userChart, partnerChart);

    renderCompatibilityResults();
  });

  document.getElementById("comp-recalculate-btn").addEventListener("click", () => {
    state.partnerChart = null;
    state.compatibility = null;
    document.getElementById("comp-results-view").style.display = "none";
    document.getElementById("comp-setup-card").style.display = "block";
    form.reset();
  });
}

function renderCompatibilityScreen() {
  if (state.compatibility && state.partnerChart) {
    renderCompatibilityResults();
  } else {
    document.getElementById("comp-results-view").style.display = "none";
    document.getElementById("comp-setup-card").style.display = "block";
  }
}

function renderCompatibilityResults() {
  if (!state.userChart || !state.partnerChart || !state.compatibility) return;

  // Toggle screens
  document.getElementById("comp-setup-card").style.display = "none";
  document.getElementById("comp-results-view").style.display = "block";

  // Set Names
  const myName = state.userChart.birthInfo.name;
  const pName = state.partnerChart.birthInfo.name;
  document.getElementById("comp-title-names").textContent = `${myName} & ${pName}`;

  // Badges
  const mySun = state.userChart.placements.find(p => p.id === "sun");
  const pSun = state.partnerChart.placements.find(p => p.id === "sun");
  
  document.getElementById("comp-my-avatar").textContent = mySun ? mySun.symbol : "✨";
  document.getElementById("comp-partner-avatar").textContent = pSun ? pSun.symbol : "✨";

  // Score percent animation
  const score = state.compatibility.overall;
  document.getElementById("comp-score-pct").textContent = `${score}%`;

  // Circle animation offset
  // Circumference of R=60 circle is 2 * PI * 60 = 377
  const dashoffset = 377 - (377 * score) / 100;
  const circleEl = document.getElementById("comp-score-circle");
  
  // Trigger SVG draw animation
  circleEl.style.strokeDashoffset = 377;
  setTimeout(() => {
    circleEl.style.strokeDashoffset = dashoffset;
  }, 150);

  // Animate category bars
  const loveFill = document.getElementById("bar-comp-love");
  const mindFill = document.getElementById("bar-comp-mind");
  const spiritFill = document.getElementById("bar-comp-spirit");

  loveFill.style.width = "0%";
  mindFill.style.width = "0%";
  spiritFill.style.width = "0%";

  setTimeout(() => {
    loveFill.style.width = `${state.compatibility.love}%`;
    mindFill.style.width = `${state.compatibility.mind}%`;
    spiritFill.style.width = `${state.compatibility.spirit}%`;
  }, 100);

  document.getElementById("val-comp-love").textContent = `${state.compatibility.love}%`;
  document.getElementById("val-comp-mind").textContent = `${state.compatibility.mind}%`;
  document.getElementById("val-comp-spirit").textContent = `${state.compatibility.spirit}%`;

  // Render synastry aspect detail rows
  const aspectContainer = document.getElementById("comp-aspects-list");
  aspectContainer.innerHTML = "";

  if (state.compatibility.aspects.length === 0) {
    aspectContainer.innerHTML = `<div style="text-align: center; color: var(--color-starlight-dim); font-size: 0.85rem; padding: 20px;">No exact orbital aspects found. Your relationship flows on a quiet, harmonious frequency.</div>`;
    return;
  }

  state.compatibility.aspects.forEach(asp => {
    const row = document.createElement("div");
    row.className = "placement-item";
    
    // Detail click shows interpretation of aspect
    row.addEventListener("click", () => {
      const modal = document.getElementById("placement-modal");
      document.getElementById("modal-symbol").textContent = asp.symbol;
      document.getElementById("modal-title").textContent = `${asp.planetA} ${asp.type} ${asp.planetB}`;
      
      const aspectMeaning = ASTRO_DATA.compatibilityAspectInterpretations[asp.type] || "Favorable alignments.";
      const interpretation = `This Synastry aspect creates orbital dynamics between your **${asp.planetA}** and your partner's **${asp.planetB}** with an orb of **${asp.orb}°**.\n\n**${asp.type} Dynamic:** ${aspectMeaning} This indicates that in daily interactions, your ${asp.planetA.toLowerCase()} energy relates to their ${asp.planetB.toLowerCase()} in a ${asp.weight > 0.5 ? 'harmonious, mutually expanding way' : 'challenging way that stimulates deep evolutionary lessons'}.`;
      
      document.getElementById("modal-body").textContent = interpretation;
      modal.style.display = "flex";
    });

    row.innerHTML = `
      <div class="placement-item-left">
        <span class="planet-symbol" style="color: ${asp.weight > 0 ? 'var(--color-cosmic-cyan)' : 'var(--color-nebula-pink)'}">${asp.symbol}</span>
        <div>
          <div class="planet-name" style="font-size: 0.8rem;">${asp.planetA} ${asp.type} ${asp.planetB}</div>
          <div class="planet-house" style="font-size: 0.7rem;">Orb: ${asp.orb}°</div>
        </div>
      </div>
      <div class="placement-item-right">
        <span class="sign-name" style="font-size: 0.75rem; color: ${asp.weight > 0.5 ? 'var(--color-cosmic-cyan)' : asp.weight < 0 ? 'var(--color-nebula-pink)' : 'var(--color-starlight)'}">
          ${asp.weight > 0.5 ? 'Harmonious' : asp.weight < 0 ? 'Challenging' : 'Neutral'}
        </span>
      </div>
    `;

    aspectContainer.appendChild(row);
  });
}

/**
 * Screen 5: AI Astrologer Chat Screen
 */
function initializeWelcomeChat() {
  if (!state.userChart) return;
  
  const sun = state.userChart.sunSign;
  const moon = state.userChart.moonSign;
  const rising = state.userChart.risingSign;

  const welcomeText = AI_ASTROLOGER_PROFILE.welcomeMessage
    .replace("{sun}", sun)
    .replace("{moon}", moon)
    .replace("{rising}", rising);

  state.chatHistory = [
    { sender: "ai", text: welcomeText }
  ];
  localStorage.setItem("astro_chat_history", JSON.stringify(state.chatHistory));
}

function renderChatScreen() {
  if (!state.userChart) return;

  const msgBox = document.getElementById("chat-messages-box");
  msgBox.innerHTML = "";

  // Draw chat bubbles
  state.chatHistory.forEach(msg => {
    appendChatBubbleDOM(msg.sender, msg.text);
  });

  // Render suggestion pills
  const pillBox = document.getElementById("chat-suggestions-box");
  pillBox.innerHTML = "";

  CHAT_QUICK_PROMPTS.forEach(promptText => {
    const pill = document.createElement("div");
    pill.className = "suggestion-pill";
    pill.textContent = promptText;
    pill.addEventListener("click", () => {
      submitChatMessage(promptText);
    });
    pillBox.appendChild(pill);
  });

  scrollToChatBottom();
}

function appendChatBubbleDOM(sender, text) {
  const msgBox = document.getElementById("chat-messages-box");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  
  // Format markdown lists and bolding
  bubble.innerHTML = text
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  msgBox.appendChild(bubble);
}

function scrollToChatBottom() {
  const msgBox = document.getElementById("chat-messages-box");
  // Small timeout to let elements render first
  setTimeout(() => {
    msgBox.scrollTop = msgBox.scrollHeight;
  }, 50);
}

function setupChatForm() {
  const form = document.getElementById("chat-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input-field");
    const val = input.value.trim();
    if (!val) return;
    
    input.value = "";
    submitChatMessage(val);
  });
}

function submitChatMessage(userText) {
  if (!state.userChart) return;

  // Append user bubble
  state.chatHistory.push({ sender: "user", text: userText });
  appendChatBubbleDOM("user", userText);
  scrollToChatBottom();

  // Save chat state
  localStorage.setItem("astro_chat_history", JSON.stringify(state.chatHistory));

  // Render Typing dots
  const msgBox = document.getElementById("chat-messages-box");
  const typingEl = document.createElement("div");
  typingEl.className = "typing-indicator";
  typingEl.innerHTML = "<span></span><span></span><span></span>";
  msgBox.appendChild(typingEl);
  scrollToChatBottom();

  // Simulate AI delay
  setTimeout(() => {
    // Remove typing dots
    typingEl.remove();

    // Generate and append AI response
    const aiResponse = generateAIResponse(userText, state.userChart, state.compatibility);
    state.chatHistory.push({ sender: "ai", text: aiResponse });
    appendChatBubbleDOM("ai", aiResponse);
    scrollToChatBottom();

    // Save chat state
    localStorage.setItem("astro_chat_history", JSON.stringify(state.chatHistory));
  }, 1200);
}

/**
 * Screen 6: Profile & Settings Screen Details
 */
function renderProfileScreen() {
  if (!state.userChart) return;

  const chart = state.userChart;
  
  // Basic info
  document.getElementById("profile-name-title").textContent = chart.birthInfo.name;
  const sunPl = chart.placements.find(p => p.id === "sun");
  document.getElementById("profile-avatar").textContent = sunPl ? sunPl.symbol : "✨";
  
  const bInfo = chart.birthInfo;
  const birthDateFormatted = new Date(bInfo.date + "T00:00:00").toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  let [hours, minutes] = bInfo.time.split(":").map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeFormatted = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  document.getElementById("profile-birth-summary").textContent = `Born ${birthDateFormatted} at ${timeFormatted} in ${bInfo.location}`;

  // Elemental calculations
  const planetsOnly = chart.placements.filter(p => p.id !== "ascendant");
  const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalities = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  
  planetsOnly.forEach(p => {
    if (elements[p.element] !== undefined) elements[p.element]++;
    if (modalities[p.modality] !== undefined) modalities[p.modality]++;
  });

  const totalPlanets = planetsOnly.length || 1;

  // Render elements
  const elementsBox = document.getElementById("profile-elements-box");
  elementsBox.innerHTML = "";
  
  const elementColors = {
    Fire: "#ff9800",
    Earth: "#4caf50",
    Air: "#00bcd4",
    Water: "#2196f3"
  };

  Object.entries(elements).forEach(([elName, count]) => {
    const pct = Math.round((count / totalPlanets) * 100);
    const row = document.createElement("div");
    row.className = "dimension-row";
    row.innerHTML = `
      <span class="dimension-label">${elName}</span>
      <div class="dimension-bar-bg">
        <div class="dimension-bar-fill" style="width: 0%; background: ${elementColors[elName] || 'var(--color-gold)'};"></div>
      </div>
      <span class="dimension-value">${pct}%</span>
    `;
    elementsBox.appendChild(row);
    setTimeout(() => {
      row.querySelector(".dimension-bar-fill").style.width = `${pct}%`;
    }, 100);
  });

  // Render modalities
  const modalitiesBox = document.getElementById("profile-modalities-box");
  modalitiesBox.innerHTML = "";

  Object.entries(modalities).forEach(([modName, count]) => {
    const pct = Math.round((count / totalPlanets) * 100);
    const row = document.createElement("div");
    row.className = "dimension-row";
    row.innerHTML = `
      <span class="dimension-label">${modName}</span>
      <div class="dimension-bar-bg">
        <div class="dimension-bar-fill" style="width: 0%; background: linear-gradient(90deg, var(--color-nebula-violet) 0%, var(--color-gold-glow) 100%);"></div>
      </div>
      <span class="dimension-value">${pct}%</span>
    `;
    modalitiesBox.appendChild(row);
    setTimeout(() => {
      row.querySelector(".dimension-bar-fill").style.width = `${pct}%`;
    }, 100);
  });
}
