/**
 * AstroCosm ai-logs.js
 * AI Conversation Logs screen — ai-logs.html
 * Displays a searchable, filterable history of all Astraea conversations.
 * Depends on: store.js, astrology.js, data.js, nav.js
 */

document.addEventListener("DOMContentLoaded", () => {
  guardAuth();

  const chatHistory = getSavedChatHistory();
  const activeFilter = { type: "all", search: "" };

  // ── Stats calculation ──────────────────────────────────────────────
  function computeStats(messages) {
    const userMsgs = messages.filter(m => m.sender === "user");
    const aiMsgs   = messages.filter(m => m.sender === "ai");

    // Estimate sessions: each time a user message follows an AI welcome = new session
    // Simple heuristic: count AI welcome messages (contains "Greetings, traveler")
    let sessions = 0;
    messages.forEach(m => {
      if (m.sender === "ai" && m.text.includes("Greetings, traveler")) {
        sessions++;
      }
    });
    if (sessions === 0 && messages.length > 0) sessions = 1;

    return {
      total: messages.length,
      user: userMsgs.length,
      ai: aiMsgs.length,
      sessions
    };
  }

  function updateStatsUI(messages) {
    const stats = computeStats(messages);
    animateCounter("stat-total", stats.total);
    animateCounter("stat-user", stats.user);
    animateCounter("stat-ai", stats.ai);
    animateCounter("stat-sessions", stats.sessions);
  }

  function animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const duration = 600;
    const start = parseInt(el.textContent) || 0;
    const diff = target - start;
    if (diff === 0) { el.textContent = target; return; }
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + diff * ease);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ── Render log entries ─────────────────────────────────────────────
  function renderLogs() {
    const container = document.getElementById("logs-entries-container");
    const emptyState = document.getElementById("logs-empty-state");
    const actionsBar = document.getElementById("logs-actions");

    let messages = [...chatHistory];

    // Apply filter
    if (activeFilter.type !== "all") {
      messages = messages.filter(m => m.sender === activeFilter.type);
    }

    // Apply search
    if (activeFilter.search) {
      const query = activeFilter.search.toLowerCase();
      messages = messages.filter(m => m.text.toLowerCase().includes(query));
    }

    // Update stats based on full history (unfiltered)
    updateStatsUI(chatHistory);

    // Empty state
    if (chatHistory.length === 0) {
      container.style.display = "none";
      emptyState.style.display = "flex";
      actionsBar.style.display = "none";
      return;
    }

    container.style.display = "block";
    emptyState.style.display = "none";
    actionsBar.style.display = "flex";

    if (messages.length === 0) {
      container.innerHTML = `
        <div class="logs-no-results">
          <span class="logs-no-results-icon">🔭</span>
          <p>No messages match your search or filter.</p>
        </div>
      `;
      return;
    }

    // Build log entries with session grouping
    container.innerHTML = "";
    let currentSessionIndex = 0;

    messages.forEach((msg, index) => {
      // Session divider — detect welcome messages
      if (msg.sender === "ai" && msg.text.includes("Greetings, traveler")) {
        currentSessionIndex++;
        const sessionDivider = document.createElement("div");
        sessionDivider.className = "log-session-divider";
        sessionDivider.innerHTML = `
          <div class="log-session-line"></div>
          <span class="log-session-label">
            <svg viewBox="0 0 24 24" width="12" height="12">
              <path d="M12 2L2 22h20L12 2z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Session ${currentSessionIndex}
          </span>
          <div class="log-session-line"></div>
        `;
        container.appendChild(sessionDivider);
      }

      const entry = document.createElement("div");
      entry.className = `log-entry ${msg.sender}`;
      entry.style.animationDelay = `${Math.min(index * 0.03, 0.6)}s`;

      // Sender avatar
      const avatar = msg.sender === "ai"
        ? `<div class="log-avatar ai-avatar">
             <svg viewBox="0 0 24 24" width="16" height="16">
               <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
             </svg>
           </div>`
        : `<div class="log-avatar user-avatar">
             <svg viewBox="0 0 24 24" width="16" height="16">
               <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/>
               <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
             </svg>
           </div>`;

      // Sender label
      const senderLabel = msg.sender === "ai" ? "Astraea" : "You";

      // Truncate text for preview
      const plainText = msg.text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\n/g, " ");
      const previewText = plainText.length > 120
        ? plainText.substring(0, 120) + "…"
        : plainText;

      // Timestamp placeholder (relative index as proxy)
      const msgNumber = index + 1;

      entry.innerHTML = `
        ${avatar}
        <div class="log-entry-content">
          <div class="log-entry-header">
            <span class="log-sender-name">${senderLabel}</span>
            <span class="log-msg-number">#${msgNumber}</span>
          </div>
          <p class="log-entry-text">${highlightSearch(previewText, activeFilter.search)}</p>
        </div>
      `;

      // Expand on click
      entry.addEventListener("click", () => {
        entry.classList.toggle("expanded");
        const textEl = entry.querySelector(".log-entry-text");
        if (entry.classList.contains("expanded")) {
          const formattedText = msg.text
            .replace(/\n/g, "<br>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
          textEl.innerHTML = formattedText;
        } else {
          textEl.innerHTML = highlightSearch(previewText, activeFilter.search);
        }
      });

      container.appendChild(entry);
    });
  }

  function highlightSearch(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
    return escaped.replace(regex, '<mark class="log-highlight">$1</mark>');
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // ── Filter tabs ────────────────────────────────────────────────────
  document.querySelectorAll("[data-log-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-log-filter]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter.type = btn.getAttribute("data-log-filter");
      renderLogs();
    });
  });

  // ── Search ─────────────────────────────────────────────────────────
  const searchInput = document.getElementById("logs-search-input");
  let searchDebounce = null;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      activeFilter.search = searchInput.value.trim();
      renderLogs();
    }, 250);
  });

  // ── Clear logs ─────────────────────────────────────────────────────
  document.getElementById("logs-clear-btn").addEventListener("click", () => {
    if (confirm("Clear all AI conversation logs? This will also reset your Astraea chat history.")) {
      patchStore({ chatHistory: [] });
      chatHistory.length = 0;
      renderLogs();
    }
  });

  // ── Initial render ─────────────────────────────────────────────────
  renderLogs();
});
