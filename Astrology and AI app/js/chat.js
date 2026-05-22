/**
 * AstroCosm chat.js
 * Sophisticated, context-aware client-side AI Astrologer (Astraea).
 * Leverages the user's birth chart data to provide deep, custom astrological answers.
 */

const AI_ASTROLOGER_PROFILE = {
  name: "Astraea",
  title: "AI Cosmic Guide",
  welcomeMessage: "Greetings, traveler. I am **Astraea**, your guide through the cosmic currents. I have analyzed your birth chart: your **Sun in {sun}**, **Moon in {moon}**, and **Rising in {rising}** paint a fascinating cosmic path. What questions do you have about your destiny, love, or career today?"
};

const CHAT_QUICK_PROMPTS = [
  "Explain my 'Big Three' signs",
  "What is my soul's purpose according to my chart?",
  "How does my Venus sign affect my relationships?",
  "What does my 10th house say about my career path?",
  "Are any of my planets retrograde?"
];

// Contextual responses based on keyword matching and chart data
function generateAIResponse(userMessage, chartData, compatibilityData = null) {
  if (!chartData) {
    return "I need your birth details before I can inspect the alignments of the stars for you. Please complete your profile first!";
  }

  const msg = userMessage.toLowerCase();
  const sun = chartData.sunSign;
  const moon = chartData.moonSign;
  const rising = chartData.risingSign;

  // Retrieve placements for reference
  const getPl = (id) => chartData.placements.find(p => p.id === id);
  const sunPl = getPl("sun");
  const moonPl = getPl("moon");
  const venusPl = getPl("venus");
  const marsPl = getPl("mars");
  const mercPl = getPl("mercury");
  const jupPl = getPl("jupiter");
  const satPl = getPl("saturn");

  // A helper function to build custom replies
  
  // 1. Big Three / Explanation of Chart
  if (msg.includes("big three") || msg.includes("big 3") || msg.includes("explain my chart") || msg.includes("my signs")) {
    return `✨ **Your Cosmic Blueprint (The Big Three)** ✨

Your chart reveals a dynamic interplay between three core forces:

1. **Sun in ${sun} (Cusp of the ${sunPl.house} House):**
   *Represents your core essence, identity, and willpower.*
   With the Sun here, you are meant to radiate the traits of **${sun}**. Your basic drive is to build self-expression and follow your creative fire.
   
2. **Moon in ${moon} (Cusp of the ${moonPl.house} House):**
   *Represents your emotional landscape, instincts, and comfort zone.*
   You process feelings through the lens of **${moon}**. You seek emotional security through ${moonPl.element === 'Water' ? 'deep emotional bonds' : moonPl.element === 'Earth' ? 'stability and material comfort' : moonPl.element === 'Air' ? 'intellectual variety and socialization' : 'adventure and active pursuits'}.
   
3. **Rising in ${rising}:**
   *Represents your mask, first impressions, and the lens through which you view the world.*
   As a **${rising} Ascendant**, you present yourself as someone who is ${ASTRO_DATA.signs[rising]?.traits.join(", ").toLowerCase() || 'charismatic'}. This sign rules your 1st House, marking how you initiate new beginnings.

🔮 **Astraea's Guidance:** Focus on balancing your ${sunPl.element} Sun and ${moonPl.element} Moon today. Let the natural leadership of your Rising Sign guide your external affairs.`;
  }

  // 2. Career / Money / Purpose
  if (msg.includes("career") || msg.includes("money") || msg.includes("wealth") || msg.includes("purpose") || msg.includes("success") || msg.includes("job") || msg.includes("10th house")) {
    const mcHouse = chartData.placements.find(p => p.house === 10);
    const moneyHouse = chartData.placements.find(p => p.house === 2);
    
    let mcStr = mcHouse ? `Your 10th House (Career & legacy) is occupied by **${mcHouse.name}** in **${mcHouse.signName}**.` : `Your Midheaven aligns near **${rising}**, suggesting your career is deeply linked to your personal identity.`;
    let moneyStr = moneyHouse ? `Your 2nd House (Personal finance) contains **${moneyHouse.name}**.` : `Your assets are ruled by standard solar alignments.`;

    return `🪐 **Career, Legacy & Abundance Analysis** 🪐

Astrology dictates that professional fulfillment lies at the intersection of your Saturn (discipline), Jupiter (luck), and your 2nd, 6th, and 10th houses.

* **Your Career Indicator:**
  ${mcStr} This indicates that in public spheres, you are called to act with the discipline of **${mcHouse ? mcHouse.signName : sun}**.
  
* **Financial Alignments:**
  ${moneyStr} This shows your relationship with material security and self-worth is flavored by this placement's qualities.
  
* **Wisdom & Expansion (Jupiter):**
  Your Jupiter is in **${jupPl.signName}** (House ${jupPl.house}). This is where your cosmic luck resides! You expand your wealth and opportunities when you lean into **${jupPl.signName}** energies (learning, travel, philosophical openness).

💼 **Astraea's Professional Tip:** With Saturn in **${satPl.signName}** (House ${satPl.house}), your career success requires patience. Avoid shortcuts. Build your legacy brick by brick.`;
  }

  // 3. Love / Romance / Venus / Relationships
  if (msg.includes("love") || msg.includes("romance") || msg.includes("relationship") || msg.includes("partner") || msg.includes("venus") || msg.includes("compatibility")) {
    let compSection = "";
    if (compatibilityData) {
      compSection = `\n\n❤️ **Current Synastry Context:**
You have calculated compatibility with your partner, resulting in a **${compatibilityData.overall}% Overall Connection**. Your Synastry shows strong **${compatibilityData.love > 75 ? 'romantic chemistry' : 'karmic lessons'}** which aligns with your Venus placements.`;
    }

    return `💖 **Love, Attraction & Relationship Alignment** 💖

In your birth chart, love is governed by **Venus** (what you attract and value) and **Mars** (how you chase desire and express passion).

* **Your Venus is in ${venusPl.signName} (House ${venusPl.house}):**
  In romance, you seek the characteristics of **${venusPl.signName}**. You express affection through ${venusPl.signName === 'Taurus' || venusPl.signName === 'Libra' ? 'sensory beauty, harmony, and gift-giving' : venusPl.signName === 'Aries' || venusPl.signName === 'Leo' || venusPl.signName === 'Sagittarius' ? 'passionate adventures, directness, and grand gestures' : venusPl.signName === 'Cancer' || venusPl.signName === 'Scorpio' || venusPl.signName === 'Pisces' ? 'deep emotional intimacy, psychic safety, and nurturing support' : 'engaging conversations, intellectual ideas, and social freedom'}. You attract partners who match this vibration.

* **Your Mars is in ${marsPl.signName} (House ${marsPl.house}):**
  This dictates your drive, passion, and sexual chemistry. Having Mars in **${marsPl.signName}** means you are motivated by challenges and seek exciting, active engagements in relationships.${compSection}

🔮 **Astraea's Relationship Guide:** To attract healthy relationships, ensure your Venus in **${venusPl.signName}** is fully expressed. Do not suppress your emotional needs to keep a false peace.`;
  }

  // 4. Retrograde
  if (msg.includes("retrograde") || msg.includes("rx")) {
    const retrogrades = chartData.placements.filter(p => p.isRetrograde);
    let retroList = "";
    
    if (retrogrades.length > 0) {
      retroList = `Currently, the following planets were **Retrograde (Rx)** at your moment of birth:
${retrogrades.map(r => `* **${r.name} Rx** in **${r.signName}** (House ${r.house}) - This indicates that the planet's energy is turned inward, requiring deep introspection and karmic re-evaluation in this lifetime.`).join("\n")}`;
    } else {
      retroList = `Your natal chart contains **no retrograde planets**! This suggests your planetary energies are projected directly outward into the external world. However, you are still affected by current planetary transits.`;
    }

    return `🌀 **The Spiral of Retrogrades** 🌀

When a planet is retrograde, its orbital path relative to Earth makes it appear to move backward. Natal retrogrades point to areas of internalized growth, past-life reflections, and deferred lessons.

${retroList}

🌌 **Current Cosmic Advice:** During any Mercury Retrograde phase, double-check your texts, avoid signing major contracts, and treat delays as cosmic invitations to rest.`;
  }

  // 5. Default Response / General Cosmic Guidance
  return `🌌 **Cosmic Stream Reading for ${sun} Sun & ${rising} Rising** 🌌

I hear your query and have cast my gaze upon the current configurations of the solar system.

* **The Sun** is illuminating your core desires, urging you to embody the confidence of your **${sun}** essence.
* **The Moon** in **${moon}** urges you to pay close attention to your body's signals and emotional triggers today.
* **Mercury in ${mercPl.signName}** encourages you to communicate with clarity, avoiding hasty words.

✨ **Your Daily Tarot/Cosmic Rune:** *The Star (Hope and Alignment)*. Trust that the universe is matching you with the people and circumstances necessary for your evolution.

Do you have a more specific question, traveler? Feel free to ask about your **Love life (Venus/Mars)**, **Career path (Midheaven/Saturn)**, or the meaning of a **specific planet placement** in your chart!`;
}
