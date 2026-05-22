/**
 * AstroCosm tarot.js
 * Major Arcana database, card drawer logic, and astrological reading generator.
 */

const TAROT_DATABASE = [
  {
    id: "fool",
    name: "The Fool",
    symbol: "🌀",
    astrology: "Uranus / Air",
    upright: "New beginnings, clean slate, spontaneous action, leap of faith, boundless energy.",
    reversed: "Recklessness, fear of the unknown, holding back, naive choices, lack of direction.",
    meaning: "The Fool represents a new journey starting with trust and openness. It is time to step into the unknown with curiosity."
  },
  {
    id: "magician",
    name: "The Magician",
    symbol: "⚡",
    astrology: "Mercury",
    upright: "Manifestation, willpower, resourcefulness, creativity, mastery of skills.",
    reversed: "Manipulative behavior, wasted talent, illusions, unfocused energy, blockages.",
    meaning: "The Magician symbolizes channeling cosmic energies down to the physical realm to manifest intentions. You hold the tools."
  },
  {
    id: "priestess",
    name: "The High Priestess",
    symbol: "🌙",
    astrology: "Moon",
    upright: "Intuition, subconscious realms, mystery, inner wisdom, trusting instincts.",
    reversed: "Secret motives, ignored intuition, surface-level focus, fear of depth.",
    meaning: "The High Priestess represents the veil between the seen and unseen. Divine answers come from quiet reflection."
  },
  {
    id: "empress",
    name: "The Empress",
    symbol: "🌸",
    astrology: "Venus",
    upright: "Abundance, creativity, nurturing, connection with nature, fertility of ideas.",
    reversed: "Creative blocks, dependence on others, neglect, smothering tendencies.",
    meaning: "The Empress signifies mother nature's abundance and the growth of projects. Embrace love, art, and sensory pleasure."
  },
  {
    id: "emperor",
    name: "The Emperor",
    symbol: "👑",
    astrology: "Aries",
    upright: "Authority, structure, protection, logical thinking, stability, leadership.",
    reversed: "Tyranny, lack of discipline, power struggles, rigid views, inefficiency.",
    meaning: "The Emperor represents order, establishment, and taking action to build protective foundations."
  },
  {
    id: "hierophant",
    name: "The Hierophant",
    symbol: "🗝️",
    astrology: "Taurus",
    upright: "Tradition, spiritual wisdom, mentorship, conformity, institutional study.",
    reversed: "Rebellion, alternative paths, dogmatic thinking, seeking custom beliefs.",
    meaning: "The Hierophant governs traditional systems of learning and spiritual guidance. Seek alignment with timeless wisdom."
  },
  {
    id: "lovers",
    name: "The Lovers",
    symbol: "💞",
    astrology: "Gemini",
    upright: "Harmonious relationships, alignment of values, major choices, self-love.",
    reversed: "Inner conflict, disharmony, poor choices, misalignment of goals.",
    meaning: "The Lovers signify deep bonds and critical decisions. Choose paths that reflect your authentic soul values."
  },
  {
    id: "chariot",
    name: "The Chariot",
    symbol: "🛡️",
    astrology: "Cancer",
    upright: "Determination, willpower, victory, overcoming hurdles, controlled direction.",
    reversed: "Lack of control, lack of direction, aggression, road-blocks.",
    meaning: "The Chariot commands focus. By harmonizing competing urges, you drive your life forward with absolute intent."
  },
  {
    id: "strength",
    name: "Strength",
    symbol: "🦁",
    astrology: "Leo",
    upright: "Courage, inner fortitude, patience, gentle control, compassion, resilience.",
    reversed: "Self-doubt, raw emotion, weakness, lack of patience, insecurity.",
    meaning: "Strength teaches us that true power comes from quiet endurance and calming the wild beast within through compassion."
  },
  {
    id: "hermit",
    name: "The Hermit",
    symbol: "🏮",
    astrology: "Virgo",
    upright: "Solitude, soul-searching, inner guidance, introspection, mentorship.",
    reversed: "Loneliness, withdrawal, paranoia, refusal to seek wisdom.",
    meaning: "The Hermit invites you to step back from external noise. Light your own path and find truth within."
  },
  {
    id: "wheel",
    name: "Wheel of Fortune",
    symbol: "☸️",
    astrology: "Jupiter",
    upright: "Good luck, destiny, cycles, turning points, sudden shifts, karma.",
    reversed: "Bad luck, resisting change, breaking negative cycles, cosmic delays.",
    meaning: "The Wheel of Fortune reminds us that life is cyclical. Highs and lows are temporary; adapt gracefully to the turning tide."
  },
  {
    id: "justice",
    name: "Justice",
    symbol: "⚖️",
    astrology: "Libra",
    upright: "Fairness, truth, accountability, cause and effect, legal matters.",
    reversed: "Unfairness, dishonesty, lack of accountability, biased judgment.",
    meaning: "Justice requests clear-eyed evaluation. Your actions echo through karma; act with integrity and balance."
  },
  {
    id: "hangedman",
    name: "The Hanged Man",
    symbol: "⏳",
    astrology: "Neptune / Water",
    upright: "Letting go, new perspective, pausing, surrender, sacrifice, spiritual growth.",
    reversed: "Ego resistance, stagnation, stalling, martyr complex, indecision.",
    meaning: "The Hanged Man suggests that by surrendering control and viewing things from a different angle, breakthroughs occur."
  },
  {
    id: "death",
    name: "Death",
    symbol: "💀",
    astrology: "Scorpio",
    upright: "Transformation, endings, transitions, shedding the past, rebirth.",
    reversed: "Fear of change, repeating habits, clinging to decay, resisting endings.",
    meaning: "Death is not physical end, but a deep evolutionary transition. Clear the deadwood to invite new life."
  },
  {
    id: "temperance",
    name: "Temperance",
    symbol: "🧪",
    astrology: "Sagittarius",
    upright: "Balance, moderation, patience, blending forces, alchemy, tranquility.",
    reversed: "Imbalance, overindulgence, discordant combinations, rushing processes.",
    meaning: "Temperance counsels patience and the middle way. Mix diverse elements of life to create a harmonious flow."
  },
  {
    id: "devil",
    name: "The Devil",
    symbol: "⛓️",
    astrology: "Capricorn",
    upright: "Shadow self, attachment, material illusions, self-limitation, addiction.",
    reversed: "Release of fears, detaching from addictions, reclaiming power, shadow work.",
    meaning: "The Devil points to self-imposed chains of fear and materialism. Recognize that you hold the keys to your own freedom."
  },
  {
    id: "tower",
    name: "The Tower",
    symbol: "💥",
    astrology: "Mars",
    upright: "Sudden change, upheaval, revelation, structures collapsing, liberation.",
    reversed: "Avoiding disaster, delaying the inevitable, fear of disruption.",
    meaning: "The Tower shatters false foundations built on illusion. Though chaotic, it leaves room to build a true, solid structure."
  },
  {
    id: "star",
    name: "The Star",
    symbol: "⭐",
    astrology: "Aquarius",
    upright: "Hope, faith, healing, cosmic connection, serenity, renewal, spiritual focus.",
    reversed: "Despair, lack of faith, creative blocks, feeling disconnected.",
    meaning: "The Star pours refreshing water upon your soul. It is a sign of divine protection, cosmic hope, and restoration."
  },
  {
    id: "moon",
    name: "The Moon",
    symbol: "🔮",
    astrology: "Pisces",
    upright: "Illusion, dreams, anxiety, deep instincts, projections, hidden truths.",
    reversed: "Release of fears, clarity, deciphering dreams, uncovering conspiracies.",
    meaning: "The Moon illuminates the shadow world. Walk forward with caution; trust your animal instincts to guide you through confusion."
  },
  {
    id: "sun",
    name: "The Sun",
    symbol: "☀️",
    astrology: "Sun",
    upright: "Success, vitality, joy, clarity, truth, celebration, warmth, confidence.",
    reversed: "Temporary clouds, ego issues, unrealistic optimism, fatigue.",
    meaning: "The Sun radiates positive light. Everything is illuminated; feel the surge of health, success, and genuine joy."
  },
  {
    id: "judgement",
    name: "Judgement",
    symbol: "🔔",
    astrology: "Pluto / Fire",
    upright: "Calling, absolution, awakening, self-evaluation, major life decision.",
    reversed: "Self-doubt, ignoring the call, inner critic, delaying actions.",
    meaning: "Judgement sounds the trumpet of awakening. Evaluate your life choices and rise to answer your true soul's calling."
  },
  {
    id: "world",
    name: "The World",
    symbol: "🌍",
    astrology: "Saturn",
    upright: "Completion, integration, achievement, travel, fulfillment, wholeness.",
    reversed: "Shortcuts, incomplete cycles, delay in victory, lack of closure.",
    meaning: "The World celebrates the successful completion of a major chapter. You have learned your lessons; step into wholeness."
  }
];

/**
 * Draws specified number of unique random cards
 */
function drawTarotCards(count) {
  const deck = [...TAROT_DATABASE];
  const results = [];
  
  for (let i = 0; i < count; i++) {
    if (deck.length === 0) break;
    const randIndex = Math.floor(Math.random() * deck.length);
    const card = deck.splice(randIndex, 1)[0];
    
    // 30% chance of card being reversed
    const isReversed = Math.random() < 0.3;
    
    results.push({
      card,
      isReversed
    });
  }
  
  return results;
}

/**
 * Synthesizes a detailed reading that blends the card with user's chart details
 */
function generateTarotReading(drawnCards, userChart, type = "daily") {
  if (!userChart) return null;
  
  const sun = userChart.sunSign;
  const moon = userChart.moonSign;
  const rising = userChart.risingSign;
  
  const readings = [];
  
  drawnCards.forEach((draw, idx) => {
    const card = draw.card;
    const isReversed = draw.isReversed;
    const orientation = isReversed ? "Reversed" : "Upright";
    
    // Choose custom advice based on user's Sun sign
    let astrologicalAstroQuote = "";
    
    // Element mapping for signs
    const signElements = {
      Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
      Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
      Gemini: "Air", Libra: "Air", Aquarius: "Air",
      Cancer: "Water", Scorpio: "Water", Pisces: "Water"
    };
    
    const element = signElements[sun] || "Ether";
    
    if (element === "Fire") {
      astrologicalAstroQuote = `As a dynamic **Fire sign (${sun})**, the energy of ${card.name} is urging you to channel your passion. Avoid hasty moves and focus your flame into constructive creativity.`;
    } else if (element === "Earth") {
      astrologicalAstroQuote = `For a grounded **Earth sign (${sun})**, ${card.name} highlights structural foundations. Focus on physical habits, patience, and turning celestial concepts into tangible growth.`;
    } else if (element === "Air") {
      astrologicalAstroQuote = `To an intellectual **Air sign (${sun})**, ${card.name} speaks directly to your mental structures and relationships. Open your channels of communication and seek objective clarity.`;
    } else { // Water
      astrologicalAstroQuote = `As an intuitive **Water sign (${sun})**, ${card.name} resonates deeply with your emotional currents. Allow yourself to feel the transitions, trusting your psychic compass.`;
    }
    
    // Add position-specific context for 3-card spreads
    let positionHeader = "";
    let positionAdvice = "";
    
    if (type === "three-card") {
      if (idx === 0) {
        positionHeader = "Past";
        positionAdvice = `In the **Past** position, ${card.name} shows the foundational energies that shaped your current situation. You have experienced these lessons; carry the wisdom, not the baggage.`;
      } else if (idx === 1) {
        positionHeader = "Present";
        positionAdvice = `In the **Present** position, ${card.name} indicates your current crossroad. Focus on this focal point today to realign your path.`;
      } else {
        positionHeader = "Future";
        positionAdvice = `In the **Future** position, ${card.name} shines a beacon on the upcoming landscape. Aligning with your **Moon in ${moon}** and **Rising in ${rising}**, prepare for this energy by remaining adaptable.`;
      }
    } else {
      positionHeader = "Daily Focus";
      positionAdvice = `Today's cosmic guidance advises you to mediate on ${card.name}. Blend its core lessons with your rising intent (**Rising in ${rising}**) to navigate this transit with maximum alignment.`;
    }
    
    readings.push({
      cardId: card.id,
      name: card.name,
      symbol: card.symbol,
      astrology: card.astrology,
      orientation: orientation,
      meaning: isReversed ? card.reversed : card.upright,
      detail: card.meaning,
      positionHeader: positionHeader,
      astroAdvice: astrologicalAstroQuote,
      positionAdvice: positionAdvice
    });
  });
  
  return readings;
}
