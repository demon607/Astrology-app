/**
 * AstroCosm data.js
 * Content database for signs, planets, houses, aspects, and dynamic horoscope generations.
 */

const ASTRO_DATA = {
  signs: {
    Aries: {
      tagline: "The Cosmic Pioneer",
      traits: ["Courageous", "Energetic", "Impulsive", "Leader"],
      element: "Fire",
      modality: "Cardinal",
      ruler: "Mars",
      desc: "As the first sign of the zodiac, Aries represents the spark of life and initial creation. You possess an innate drive to initiate projects, lead, and chart new territories. Driven by Mars, you approach obstacles head-on with passion and courage."
    },
    Taurus: {
      tagline: "The Anchor of the Earth",
      traits: ["Reliable", "Patient", "Sensual", "Persistent"],
      element: "Earth",
      modality: "Fixed",
      ruler: "Venus",
      desc: "Taurus represents growth, stability, and the materialization of ideas. Grounded and patient, you have a deep appreciation for beauty, physical comforts, and nature. You build slow, lasting foundations and possess iron-clad persistence."
    },
    Gemini: {
      tagline: "The Weaver of Words",
      traits: ["Adaptable", "Curious", "Witty", "Expressive"],
      element: "Air",
      modality: "Mutable",
      ruler: "Mercury",
      desc: "Gemini represents intellectual exploration, curiosity, and dualism. With an active mind, you love gathering information, sharing stories, and connecting people. You adapt instantly to change and view life as an endless learning experience."
    },
    Cancer: {
      tagline: "The Guardian of the Soul",
      traits: ["Nurturing", "Intuitive", "Protective", "Sentimental"],
      element: "Water",
      modality: "Cardinal",
      ruler: "Moon",
      desc: "Cancer governs the emotional realms, the home, and ancestral roots. Highly intuitive and protective, you absorb the emotional currents of your environment. You seek deep security and express love through nurturing and care."
    },
    Leo: {
      tagline: "The Celestial Sovereign",
      traits: ["Generous", "Creative", "Loyal", "Charismatic"],
      element: "Fire",
      modality: "Fixed",
      ruler: "Sun",
      desc: "Leo is the sign of self-expression, creativity, and inner fire. Ruled by the Sun, you radiate warmth, confidence, and natural leadership. You crave creative recognition and are incredibly loyal and protective of your pride."
    },
    Virgo: {
      tagline: "The Architect of Order",
      traits: ["Analytical", "Helpful", "Detail-oriented", "Modest"],
      element: "Earth",
      modality: "Mutable",
      ruler: "Mercury",
      desc: "Virgo represents purification, synthesis, and dedicated service. You find joy in organizing details, analyzing systems, and helping others refine their lives. Your analytical power is matched only by your devotion to healing."
    },
    Libra: {
      tagline: "The Arbiter of Harmony",
      traits: ["Diplomatic", "Artistic", "Social", "Fair-minded"],
      element: "Air",
      modality: "Cardinal",
      ruler: "Venus",
      desc: "Libra embodies harmony, relationships, and aesthetic balance. You seek equilibrium in all fields, making you an innate peacemaker. Ruled by Venus, you have a refined eye for art and design and flourish in partnerships."
    },
    Scorpio: {
      tagline: "The Alchemist of Shadows",
      traits: ["Intense", "Passionate", "Secretive", "Transformative"],
      element: "Water",
      modality: "Fixed",
      ruler: "Pluto (traditionally Mars)",
      desc: "Scorpio rules the unseen depths, psychological transformation, and shared resources. Intense, magnetic, and fiercely loyal, you are unafraid to dive into life's mysteries. You seek profound spiritual and emotional truth."
    },
    Sagittarius: {
      tagline: "The Wandering Philosopher",
      traits: ["Optimistic", "Adventurous", "Philosophical", "Honest"],
      element: "Fire",
      modality: "Mutable",
      ruler: "Jupiter",
      desc: "Sagittarius is the sign of expansion, wisdom, and boundary-breaking exploration. You seek meaning through travel, philosophy, and optimism. Ruled by Jupiter, you believe in destiny and live life as an open adventure."
    },
    Capricorn: {
      tagline: "The Master Builder",
      traits: ["Disciplined", "Ambitious", "Practical", "Patient"],
      element: "Earth",
      modality: "Cardinal",
      ruler: "Saturn",
      desc: "Capricorn rules structure, legacy, and long-term achievements. Patient and disciplined, you ascend life's mountains through hard work and practical wisdom. You respect tradition and seek to create lasting social monuments."
    },
    Aquarius: {
      tagline: "The Cosmic Visionary",
      traits: ["Independent", "Humanitarian", "Original", "Intellectual"],
      element: "Air",
      modality: "Fixed",
      ruler: "Uranus (traditionally Saturn)",
      desc: "Aquarius represents the collective consciousness, innovation, and social reform. Highly independent and unique, you think outside standard templates. You seek to elevate humanity and build collaborative networks."
    },
    Pisces: {
      tagline: "The Ocean of Oneness",
      traits: ["Empathetic", "Artistic", "Dreamy", "Compassionate"],
      element: "Water",
      modality: "Mutable",
      ruler: "Neptune (traditionally Jupiter)",
      desc: "Pisces is the final sign, representing spiritual integration, dreams, and cosmic dissolution. Highly empathetic and imaginative, you dissolve boundaries between yourself and others. You are a vessel of artistic expression and deep compassion."
    }
  },

  planets: {
    sun: {
      meaning: "Core Identity & Vitality",
      description: "The Sun represents your ego, conscious mind, and basic life force. It dictates how you shine in the world and your primary path of creative self-expression."
    },
    moon: {
      meaning: "Emotional Landscape & Instincts",
      description: "The Moon rules your subconscious, inner security, emotional reactions, and intuitive self. It defines how you seek comfort and nurture others."
    },
    mercury: {
      meaning: "Intellect & Communication",
      description: "Mercury governs your mental processes, learning styles, speech patterns, and daily logistics. It dictates how you conceptualize and share ideas."
    },
    venus: {
      meaning: "Attraction, Love & Values",
      description: "Venus rules romance, aesthetic tastes, money, and personal values. It shows how you express affection, attract beauty, and relate to others."
    },
    mars: {
      meaning: "Action, Desire & Drive",
      description: "Mars defines your physical energy, ambition, anger, and sexual drive. It indicates how you assert yourself, take risks, and overcome conflicts."
    },
    jupiter: {
      meaning: "Luck, Expansion & Wisdom",
      description: "Jupiter governs abundance, philosophical wisdom, optimism, and good fortune. It shows where you seek to grow and discover higher meanings."
    },
    saturn: {
      meaning: "Structure, Discipline & Karma",
      description: "Saturn represents boundaries, discipline, fears, and life lessons. It highlights where you must build mastery through patience and effort."
    }
  },

  houses: {
    1: { name: "1st House of Self & Identity", keyword: "Appearance, first impressions, self-projection" },
    2: { name: "2nd House of Values & Assets", keyword: "Material wealth, self-worth, finances" },
    3: { name: "3rd House of Mind & Communication", keyword: "Short trips, sibling dynamics, local learning" },
    4: { name: "4th House of Home & Ancestry", keyword: "Roots, family foundation, inner sanctuary" },
    5: { name: "5th House of Pleasure & Creation", keyword: "Romance, playfulness, artistic expression, children" },
    6: { name: "6th House of Health & Service", keyword: "Daily routines, wellness, jobs, pet care" },
    7: { name: "7th House of Partnerships", keyword: "Spouse, contracts, business partners, open mirrors" },
    8: { name: "8th House of Rebirth & Secrets", keyword: "Shared resources, intimacy, taboos, deep alchemy" },
    9: { name: "9th House of Philosophy & Travel", keyword: "Higher education, long journeys, belief systems" },
    10: { name: "10th House of Career & Legacy", keyword: "Public status, professional calling, authorities" },
    11: { name: "11th House of Community & Hopes", keyword: "Friendships, alliances, humanitarian wishes" },
    12: { name: "12th House of the Subconscious", keyword: "Solitude, spiritual completion, dreams, hidden strength" }
  },

  placementsInterpretations: {
    "sun": {
      Aries: "Your core path is to be a trail-blazer. You lead with passion but must learn patience.",
      Taurus: "Your identity thrives in stability and sensory pleasures. You build things that endure.",
      Gemini: "You express yourself through learning and communication. A true intellectual butterfly.",
      Cancer: "You are the ultimate emotional anchor. You protect what you love with absolute devotion.",
      Leo: "You shine brightest when creating and expressing yourself. Radiate warmth and inspire others.",
      Virgo: "You express your essence by improving, healing, and analyzing systems. Mastery in details.",
      Libra: "Your journey centers around balance, beauty, and finding harmony in interpersonal bonds.",
      Scorpio: "You have a powerful, magnetic identity that thrives on diving deep into psychological truths.",
      Sagittarius: "You are a seeker of truth, traveling widely in mind and space to expand horizons.",
      Capricorn: "You climb the mountain of achievements with steel-like discipline and patient ambition.",
      Aquarius: "Your core self is dedicated to individual freedom, societal reform, and unique concepts.",
      Pisces: "You find your identity in artistic, spiritual flow, and empathetic connection with the universe."
    },
    "moon": {
      Aries: "Emotionally reactive and independent. You process feelings quickly but can display a hot temper.",
      Taurus: "Needs stability and physical comforts to feel emotionally secure. Grounded, calm, and slow to anger.",
      Gemini: "Processes emotions through discussion and intellectualizing. Needs variety and mental stimulation.",
      Cancer: "Deeply emotional, psychic, and protective. Heavily impacted by home environments and cycles.",
      Leo: "Generous and proud. Feels most secure when appreciated, praised, and allowed creative freedom.",
      Virgo: "Expresses emotional security through organization, cleaning, and offering practical services.",
      Libra: "Craves peace and relationships. Can become unsettled by confrontation, striving always for harmony.",
      Scorpio: "Feels emotions with immense intensity. Deeply private, seeking emotional vulnerability and trust.",
      Sagittarius: "Needs freedom and exploration to feel safe. Processes stress through travel and humor.",
      Capricorn: "Controls and structures emotional expressions. Seeks safety in career, duty, and concrete plans.",
      Aquarius: "Highly independent and slightly detached emotionally. Loves deep conversation but needs space.",
      Pisces: "An emotional sponge absorbing all nearby energies. Dreamy, artistic, and boundaryless."
    }
  },

  compatibilityAspectInterpretations: {
    "Conjunction": "A powerful convergence of energies. You think as one, feeling an immediate, intense magnetic pull. Your actions mirror each other.",
    "Trine": "The absolute peak of compatibility. Energies flow effortlessly. There is natural understanding, validation, and comfort between you.",
    "Sextile": "Friendly and supportive aspect. You create opportunities for each other and spark creative joint ventures.",
    "Square": "Friction and dynamic tension. You challenge each other's beliefs, triggering growth but also requiring constant effort to maintain peace.",
    "Opposition": "A mirror relationship. Opposites attract, representing your missing half. However, it can swing between intense desire and total division."
  },

  // Dynamic Generator parts for Horoscopes
  horoscopePhrases: {
    intro: [
      "As the cosmos align, a subtle shift in your planetary configuration highlights new possibilities.",
      "The planetary currents today ripple through your core placement, triggering deep inner reflections.",
      "With celestial energies charging your charts, you are entering an active phase of cosmic alignment.",
      "Celestial configurations signal a critical crossroads in your personal cycle this season."
    ],
    sunFocus: {
      Aries: "Your ruling planet Mars urges you to act courageously. Take charge of your trajectory.",
      Taurus: "Venus illuminates your security sectors. Focus on creating comfort and grounding your plans.",
      Gemini: "Mercury quickens your mental fields. Network, share ideas, and let your curiosity guide you.",
      Cancer: "The Moon draws your focus inward. Focus on home foundations and honor emotional boundaries.",
      Leo: "The Sun amplifies your creative presence. step into the spotlight and let your natural charisma shine.",
      Virgo: "Mercury highlights your routine sector. Cleanse, organize, and streamline your habits.",
      Libra: "Venus brings grace to your relationships. Cultivate balance and express your aesthetic eye.",
      Scorpio: "Pluto urges deep alchemical shifts. Release what is stale to unlock hidden personal power.",
      Sagittarius: "Jupiter expands your vision. Embrace optimism, plan travel, or study something profound.",
      Capricorn: "Saturn demands structure and responsibility. Your hard work is building a lasting foundation.",
      Aquarius: "Uranus sparks innovative ideas. Dare to break rules and express your unique vision.",
      Pisces: "Neptune heightens your dream state. Trust your psychic intuition and dive into creative works."
    },
    moonFocus: {
      Aries: "Emotional impulses are high; channel this energy into sports or creative projects rather than arguments.",
      Taurus: "Nurture yourself with good food, comfortable fabrics, and connection with nature today.",
      Gemini: "Journal, talk to friends, or read. Your mind needs stimulation to process underlying emotions.",
      Cancer: "Make time for family and cocoon in your personal sanctuary. Emotional security is key.",
      Leo: "Pamper yourself and express your feelings through art. Don't hide your true colors.",
      Virgo: "Tidying your space will bring immediate mental relief. Focus on small, actionable steps.",
      Libra: "Seek pleasant company or decorative improvements to soothe your mind. Avoid harsh vibes.",
      Scorpio: "A great day for meditation, depth therapy, or intimate sharing. Confront your shadows.",
      Sagittarius: "A sense of wanderlust dominates. Learn something new or try a different route home.",
      Capricorn: "Focus on duties first. Completing chores will give you the emotional satisfaction you need.",
      Aquarius: "Connect with a group or research humanitarian causes. Space out and breathe.",
      Pisces: "Your sensitivity is at a peak. Protect your energy field, meditate, and let your dreams guide you."
    },
    dimensions: ["Love & Heart", "Career & Wealth", "Health & Energy"]
  }
};

/**
 * Generates a detailed, context-aware horoscope paragraph based on Sun and Moon signs
 */
function generateHoroscope(sunSign, moonSign, period = "daily") {
  const introList = ASTRO_DATA.horoscopePhrases.intro;
  const sunList = ASTRO_DATA.horoscopePhrases.sunFocus;
  const moonList = ASTRO_DATA.horoscopePhrases.moonFocus;

  // Pseudo-random index selection based on sign name letters to make it consistent for the user profile
  const hash = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return Math.abs(h);
  };

  const periodBonus = {
    daily: "Your day brings a focus on micro-decisions. Align your calendar with your core objectives.",
    weekly: "This week requires macro-planning. Steady efforts will yield significant growth by the weekend.",
    monthly: "This month marks a long-term transition. A major chapter is closing, clearing paths for cosmic renewal."
  };

  const sunPart = sunList[sunSign] || "Embrace your core values.";
  const moonPart = moonList[moonSign] || "Listen to your inner voice.";
  const introPart = introList[hash(sunSign + moonSign + period) % introList.length];

  // Love, Career, Health stats
  const statSeed = hash(sunSign + period);
  const loveVal = 45 + (statSeed % 51); // 45-95%
  const careerVal = 40 + ((statSeed >> 1) % 56);
  const healthVal = 50 + ((statSeed >> 2) % 46);

  const fullText = `${introPart} **${sunPart}** As your solar energy blends with your lunar landscape, **${moonPart}** ${periodBonus[period]} Rest assured that the stars are paving a path for alignment and personal transformation.`;

  return {
    text: fullText,
    stats: {
      love: loveVal,
      career: careerVal,
      health: healthVal
    }
  };
}
