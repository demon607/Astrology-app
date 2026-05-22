/**
 * AstroCosm astraea.js
 * Astraea Chat screen logic for astraea.html
 */

document.addEventListener("DOMContentLoaded", () => {
  guardAuth();

  const chart = getSavedChart();

  // Load or initialize chat history
  let chatHistory = [];
  try {
    const saved = localStorage.getItem("astro_chat_history");
    chatHistory = saved ? JSON.parse(saved) : [];
  } catch (e) {
    chatHistory = [];
  }

  if (chatHistory.length === 0) {
    const welcome = AI_ASTROLOGER_PROFILE.welcomeMessage
      .replace("{sun}", chart.sunSign)
      .replace("{moon}", chart.moonSign)
      .replace("{rising}", chart.risingSign);
    chatHistory = [{ sender: "ai", text: welcome }];
    localStorage.setItem("astro_chat_history", JSON.stringify(chatHistory));
  }

  // Render existing messages
  const msgBox = document.getElementById("chat-messages-box");
  chatHistory.forEach(msg => appendBubble(msg.sender, msg.text));
  scrollBottom();

  // Quick prompt pills
  const pillBox = document.getElementById("chat-suggestions-box");
  CHAT_QUICK_PROMPTS.forEach(promptText => {
    const pill = document.createElement("div");
    pill.className = "suggestion-pill";
    pill.textContent = promptText;
    pill.addEventListener("click", () => sendMessage(promptText, chart, chatHistory));
    pillBox.appendChild(pill);
  });

  // Chat form
  document.getElementById("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input-field");
    const val   = input.value.trim();
    if (!val) return;
    input.value = "";
    sendMessage(val, chart, chatHistory);
  });
});

function sendMessage(text, chart, chatHistory) {
  chatHistory.push({ sender: "user", text });
  appendBubble("user", text);
  scrollBottom();
  localStorage.setItem("astro_chat_history", JSON.stringify(chatHistory));

  // Typing indicator
  const msgBox   = document.getElementById("chat-messages-box");
  const typingEl = document.createElement("div");
  typingEl.className = "typing-indicator";
  typingEl.innerHTML = "<span></span><span></span><span></span>";
  msgBox.appendChild(typingEl);
  scrollBottom();

  const compat = getSavedCompatibility();

  setTimeout(() => {
    typingEl.remove();
    const response = generateAIResponse(text, chart, compat);
    chatHistory.push({ sender: "ai", text: response });
    appendBubble("ai", response);
    scrollBottom();
    localStorage.setItem("astro_chat_history", JSON.stringify(chatHistory));
  }, 1200);
}

function appendBubble(sender, text) {
  const msgBox = document.getElementById("chat-messages-box");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = text
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  msgBox.appendChild(bubble);
}

function scrollBottom() {
  const msgBox = document.getElementById("chat-messages-box");
  setTimeout(() => { msgBox.scrollTop = msgBox.scrollHeight; }, 50);
}
