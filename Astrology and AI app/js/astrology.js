/**
 * AstroCosm astrology.js
 * Core engine for planetary positions, houses, aspects, and synastry (compatibility).
 */

const ZODIAC_SIGNS = [
  { name: "Aries", symbol: "♈", element: "Fire", modality: "Cardinal", ruler: "Mars" },
  { name: "Taurus", symbol: "♉", element: "Earth", modality: "Fixed", ruler: "Venus" },
  { name: "Gemini", symbol: "♊", element: "Air", modality: "Mutable", ruler: "Mercury" },
  { name: "Cancer", symbol: "♋", element: "Water", modality: "Cardinal", ruler: "Moon" },
  { name: "Leo", symbol: "♌", element: "Fire", modality: "Fixed", ruler: "Sun" },
  { name: "Virgo", symbol: "♍", element: "Earth", modality: "Mutable", ruler: "Mercury" },
  { name: "Libra", symbol: "♎", element: "Air", modality: "Cardinal", ruler: "Venus" },
  { name: "Scorpio", symbol: "♏", element: "Water", modality: "Fixed", ruler: "Pluto" },
  { name: "Sagittarius", symbol: "♐", element: "Fire", modality: "Mutable", ruler: "Jupiter" },
  { name: "Capricorn", symbol: "♑", element: "Earth", modality: "Cardinal", ruler: "Saturn" },
  { name: "Aquarius", symbol: "♒", element: "Air", modality: "Fixed", ruler: "Uranus" },
  { name: "Pisces", symbol: "♓", element: "Water", modality: "Mutable", ruler: "Neptune" }
];

const PLANETS = [
  { id: "sun", name: "Sun", symbol: "☉", color: "#f3cf7a" },
  { id: "moon", name: "Moon", symbol: "☽", color: "#eef2f7" },
  { id: "mercury", name: "Mercury", symbol: "☿", color: "#00bcd4" },
  { id: "venus", name: "Venus", symbol: "♀", color: "#e91e63" },
  { id: "mars", name: "Mars", symbol: "♂", color: "#ff5722" },
  { id: "jupiter", name: "Jupiter", symbol: "♃", color: "#9c27b0" },
  { id: "saturn", name: "Saturn", symbol: "♄", color: "#aa8511" }
];

// Helper to normalize degrees to [0, 360)
function norm360(deg) {
  let val = deg % 360;
  if (val < 0) val += 360;
  return val;
}

// Convert birth details to days since Epoch (J2000: Jan 1, 2000, 12:00 UT)
function getDaysSinceEpoch(dateStr, timeStr, timezoneOffsetHours = 0) {
  const birthDateTime = new Date(`${dateStr}T${timeStr}:00`);
  // Convert local birth time to UTC time in ms
  const utcMs = birthDateTime.getTime() + (timezoneOffsetHours * 60 * 60 * 1000);
  const epochMs = Date.UTC(2000, 0, 1, 12, 0, 0);
  return (utcMs - epochMs) / (1000 * 60 * 60 * 24);
}

/**
 * Calculates planetary positions
 * Uses standard Keplerian orbital element approximations relative to J2000.0 epoch
 */
function calculateChart(dateStr, timeStr, locationName, longitude = 0, latitude = 0, timezoneOffsetHours = 0) {
  const t = getDaysSinceEpoch(dateStr, timeStr, timezoneOffsetHours);
  
  // 1. Calculate Sun Longitude
  // Solar Mean Longitude L = 280.460 + 0.9856474 * t
  // Solar Mean Anomaly g = 357.528 + 0.9856003 * t
  // Ecliptic Longitude lambda = L + 1.915 * sin(g) + 0.020 * sin(2g)
  const sunL = norm360(280.460 + 0.9856474 * t);
  const sunG = norm360(357.528 + 0.9856003 * t) * Math.PI / 180;
  const sunLong = norm360(sunL + 1.915 * Math.sin(sunG) + 0.020 * Math.sin(2 * sunG));

  // 2. Calculate Moon Longitude
  // Moon Mean Longitude L_m = 218.316 + 13.176396 * t
  // Moon Mean Anomaly M_m = 134.963 + 13.064993 * t
  // Adjust for elongation and center equation
  const moonL = norm360(218.316 + 13.176396 * t);
  const moonM = norm360(134.963 + 13.064993 * t) * Math.PI / 180;
  const moonLong = norm360(moonL + 6.289 * Math.sin(moonM) + 1.274 * Math.sin(2 * moonM - moonM)); // Simplified perturbation

  // Helper for inner/outer planets using Keplerian rates & Epicyclic corrections (due to Earth movement)
  // Period (days): Mercury 87.97, Venus 224.7, Mars 686.98, Jupiter 4332.59, Saturn 10759.22
  const calcPlanet = (meanLongEpoch, dailyRate, perihelion, eccentricity, orbitPeriod, isOuter) => {
    // Mean anomaly of planet
    const M_p = norm360((t / orbitPeriod) * 360 + meanLongEpoch - perihelion);
    const M_rad = M_p * Math.PI / 180;
    // Equation of center
    const eqCenter = 2 * eccentricity * Math.sin(M_rad);
    // Heliocentric longitude
    const helioLong = norm360(meanLongEpoch + (t * dailyRate) + eqCenter * 180 / Math.PI);
    
    // Geocentric correction (Simplified epicycle using difference from Sun's longitude)
    const diff = norm360(helioLong - sunLong) * Math.PI / 180;
    const parallaxFactor = isOuter ? 0.35 / (eccentricity + 1.5) : 0.72;
    const geocentricAdjustment = Math.atan2(Math.sin(diff), Math.cos(diff) + parallaxFactor) * 180 / Math.PI;
    
    const finalLong = norm360(helioLong + geocentricAdjustment);
    
    // Retrograde detection: Check velocity by checking position a fraction of a day later
    const tNext = t + 0.05;
    const M_p_next = norm360((tNext / orbitPeriod) * 360 + meanLongEpoch - perihelion);
    const eqCenterNext = 2 * eccentricity * Math.sin(M_p_next * Math.PI / 180);
    const helioLongNext = norm360(meanLongEpoch + (tNext * dailyRate) + eqCenterNext * 180 / Math.PI);
    const diffNext = norm360(helioLongNext - norm360(sunL + 0.9856474 * tNext)) * Math.PI / 180;
    const geocentricAdjustmentNext = Math.atan2(Math.sin(diffNext), Math.cos(diffNext) + parallaxFactor) * 180 / Math.PI;
    const finalLongNext = norm360(helioLongNext + geocentricAdjustmentNext);
    
    // If difference is negative, it's retrograde
    let diffPos = finalLongNext - finalLong;
    if (diffPos > 180) diffPos -= 360;
    if (diffPos < -180) diffPos += 360;
    const isRetrograde = diffPos < 0;

    return { longitude: finalLong, isRetrograde };
  };

  // Planet values (mean long epoch J2000, daily rate, perihelion, eccentricity, period, isOuter)
  const mercury = calcPlanet(252.25, 4.0923, 77.46, 0.2056, 87.97, false);
  const venus = calcPlanet(181.98, 1.6021, 131.56, 0.0068, 224.7, false);
  const mars = calcPlanet(355.43, 0.5240, 336.06, 0.0934, 686.98, true);
  const jupiter = calcPlanet(34.35, 0.0831, 14.28, 0.0484, 4332.59, true);
  const saturn = calcPlanet(50.08, 0.0335, 92.86, 0.0541, 10759.22, true);

  // 3. Calculate Ascendant (Rising Sign)
  // Local Sidereal Time approximation:
  // Hour of day (0-24) local time
  const [bHours, bMinutes] = timeStr.split(":").map(Number);
  const localTimeDecimal = bHours + bMinutes / 60;
  
  // Estimate ascendant based on Sidereal Time
  // Sun is conjunct Ascendant at sunrise (~06:00), MC at noon (12:00), Descendant at sunset (~18:00), IC at midnight (00:00)
  // Local Sidereal time offset: (localTimeDecimal - 6) * 15 degrees
  // Adjust for Day of the Year (vernal equinox Mar 21 is reference)
  // We can calculate Ascendant Longitude = Sun Longitude + 90 degrees + (localTimeDecimal - 12) * 15 degrees
  // Let's refine for longitude offset
  const ascendantLong = norm360(sunLong + 90 + (localTimeDecimal - 12) * 15 + (longitude - (timezoneOffsetHours * 15)));

  // Package planetary placements
  const placements = [
    { id: "sun", name: "Sun", symbol: "☉", longitude: sunLong, isRetrograde: false },
    { id: "moon", name: "Moon", symbol: "☽", longitude: moonLong, isRetrograde: false },
    { id: "mercury", name: "Mercury", symbol: "☿", longitude: mercury.longitude, isRetrograde: mercury.isRetrograde },
    { id: "venus", name: "Venus", symbol: "♀", longitude: venus.longitude, isRetrograde: venus.isRetrograde },
    { id: "mars", name: "Mars", symbol: "♂", longitude: mars.longitude, isRetrograde: mars.isRetrograde },
    { id: "jupiter", name: "Jupiter", symbol: "♃", longitude: jupiter.longitude, isRetrograde: jupiter.isRetrograde },
    { id: "saturn", name: "Saturn", symbol: "♄", longitude: saturn.longitude, isRetrograde: saturn.isRetrograde }
  ];

  // Add Rising Sign as a pseudo planet (Ascendant)
  placements.push({ id: "ascendant", name: "Ascendant (Rising)", symbol: "Asc", longitude: ascendantLong, isRetrograde: false });

  // Map longitudes to zodiac sign and degree
  const detailedPlacements = placements.map(p => {
    const signIndex = Math.floor(p.longitude / 30);
    const sign = ZODIAC_SIGNS[signIndex];
    const degreeInSign = p.longitude % 30;
    
    // Equal House System:
    // 1st House cusp is Ascendant. 2nd Cusp is Ascendant + 30, and so on.
    // Planet's house = 1 + floor((planet_long - ascendant_long) / 30)
    let house = 1 + Math.floor(norm360(p.longitude - ascendantLong) / 30);
    if (p.id === "ascendant") house = 1; // Ascendant defines first house

    return {
      ...p,
      signName: sign.name,
      signSymbol: sign.symbol,
      element: sign.element,
      modality: sign.modality,
      ruler: sign.ruler,
      degree: Math.floor(degreeInSign),
      minutes: Math.floor((degreeInSign % 1) * 60),
      house
    };
  });

  return {
    birthInfo: { date: dateStr, time: timeStr, location: locationName, longitude, latitude, timezoneOffsetHours },
    ascendant: ascendantLong,
    placements: detailedPlacements,
    sunSign: detailedPlacements.find(p => p.id === "sun").signName,
    moonSign: detailedPlacements.find(p => p.id === "moon").signName,
    risingSign: detailedPlacements.find(p => p.id === "ascendant").signName
  };
}

/**
 * Calculates astrological aspects between planets in a single chart (Natal Aspects)
 * or between two charts (Synastry Aspects)
 */
const ASPECT_TYPES = [
  { name: "Conjunction", angle: 0, orb: 8, symbol: "☌", class: "conjunction", weight: 1.0 },
  { name: "Sextile", angle: 60, orb: 6, symbol: "⚹", class: "sextile", weight: 0.6 },
  { name: "Square", angle: 90, orb: 8, symbol: "□", class: "square", weight: -0.8 },
  { name: "Trine", angle: 120, orb: 8, symbol: "△", class: "trine", weight: 0.9 },
  { name: "Opposition", angle: 180, orb: 8, symbol: "☍", class: "opposition", weight: -0.7 }
];

function calculateAspects(chartA, chartB = null) {
  const isSynastry = chartB !== null;
  const aspects = [];

  const placementsA = chartA.placements.filter(p => p.id !== "ascendant");
  const placementsB = isSynastry 
    ? chartB.placements.filter(p => p.id !== "ascendant")
    : chartA.placements.filter(p => p.id !== "ascendant");

  for (let i = 0; i < placementsA.length; i++) {
    const pA = placementsA[i];
    
    // For single chart, compare each planet pair only once
    const startIndex = isSynastry ? 0 : i + 1;
    
    for (let j = startIndex; j < placementsB.length; j++) {
      const pB = placementsB[j];
      
      // Don't compare same planet with itself in synastry/natal
      if (pA.id === pB.id && !isSynastry) continue;

      let diff = Math.abs(pA.longitude - pB.longitude);
      if (diff > 180) diff = 360 - diff;

      for (const aspect of ASPECT_TYPES) {
        if (Math.abs(diff - aspect.angle) <= aspect.orb) {
          aspects.push({
            planetA: pA.name,
            planetAId: pA.id,
            planetASymbol: pA.symbol,
            planetB: pB.name,
            planetBId: pB.id,
            planetBSymbol: pB.symbol,
            type: aspect.name,
            symbol: aspect.symbol,
            class: aspect.class,
            angle: aspect.angle,
            weight: aspect.weight,
            diff: diff.toFixed(1),
            orb: Math.abs(diff - aspect.angle).toFixed(1)
          });
          break; // Stop looking for other aspects on this planet pair
        }
      }
    }
  }

  return aspects;
}

/**
 * Calculates a detailed Compatibility Score between two charts
 */
function calculateCompatibility(chartA, chartB) {
  const synastryAspects = calculateAspects(chartA, chartB);
  
  // Categorize aspects and compute score adjustments
  // Categories: Love & Attraction (Sun-Venus, Venus-Mars, Moon-Venus), 
  //             Mind & Communication (Mercury-Mercury, Mercury-Uranus, Sun-Mercury),
  //             Spirit & Soul (Sun-Sun, Moon-Moon, Sun-Moon, Saturn aspects)
  let loveScore = 70;
  let mindScore = 70;
  let spiritScore = 70;

  synastryAspects.forEach(asp => {
    const ids = [asp.planetAId, asp.planetBId];
    const weight = asp.weight;

    // Love & Attraction
    if (ids.includes("venus") && (ids.includes("mars") || ids.includes("sun") || ids.includes("moon") || ids.includes("venus"))) {
      loveScore += weight * 20;
    }
    // Mind & Communication
    if (ids.includes("mercury") && (ids.includes("mercury") || ids.includes("sun") || ids.includes("jupiter"))) {
      mindScore += weight * 20;
    }
    // Spirit & Soul
    if ((ids.includes("sun") && ids.includes("moon")) || (ids.includes("moon") && ids.includes("moon")) || (ids.includes("sun") && ids.includes("sun"))) {
      spiritScore += weight * 25;
    } else if (ids.includes("saturn")) {
      // Saturn adds stability but also lessons
      spiritScore += weight * 10;
    }
  });

  // Clamp values to [10, 99]
  const clamp = val => Math.max(10, Math.min(99, Math.round(val)));

  loveScore = clamp(loveScore);
  mindScore = clamp(mindScore);
  spiritScore = clamp(spiritScore);

  const overallScore = clamp((loveScore + mindScore + spiritScore) / 3);

  return {
    overall: overallScore,
    love: loveScore,
    mind: mindScore,
    spirit: spiritScore,
    aspects: synastryAspects
  };
}
