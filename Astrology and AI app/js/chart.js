/**
 * AstroCosm chart.js
 * SVG rendering engine for the interactive birth chart wheel.
 */

// Draw an SVG path for a circle arc (used for zodiac sign segments)
function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

/**
 * Main function to render the interactive SVG birth chart
 */
function renderZodiacChart(containerEl, chartData, onPlacementSelect) {
  if (!containerEl) return;
  containerEl.innerHTML = ""; // Clear existing

  const size = 320;
  const center = size / 2;
  const outerR = 145;
  const zodiacR = 125;
  const houseR = 105;
  const planetR = 85;
  const aspectMaxR = 65;

  const asc = chartData.ascendant;

  // Helper to map longitude (0-360) to SVG screen angle (0-360) where Ascendant is at 180 degrees (left)
  const getScreenAngle = (long) => {
    // Ascendant (asc) goes to 180 degrees (9 o'clock)
    // Angles increase counter-clockwise in standard charts
    return norm360(180 - (long - asc));
  };

  // Create SVG element
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("class", "zodiac-wheel-svg");

  // Define gradients and filter glow effects
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <radialGradient id="nebulaGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#673ab7" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#0b0b26" stop-opacity="0" />
    </radialGradient>
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  `;
  svg.appendChild(defs);

  // Background circle
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  bg.setAttribute("cx", center);
  bg.setAttribute("cy", center);
  bg.setAttribute("r", outerR);
  bg.setAttribute("fill", "url(#nebulaGlow)");
  bg.setAttribute("stroke", "rgba(255, 255, 255, 0.05)");
  bg.setAttribute("stroke-width", "1");
  svg.appendChild(bg);

  // 1. Draw outer zodiac ring segments (30 degrees each)
  const zodiacGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  zodiacGroup.setAttribute("id", "zodiac-ring");

  for (let i = 0; i < 12; i++) {
    const sign = ZODIAC_SIGNS[i];
    const signLongStart = i * 30;
    const signLongEnd = (i + 1) * 30;
    
    // Convert to screen angles
    const angleStart = getScreenAngle(signLongStart);
    const angleEnd = getScreenAngle(signLongEnd);
    
    // Draw divider line
    const linePt = polarToCartesian(center, center, outerR, angleStart);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", center);
    line.setAttribute("y1", center);
    line.setAttribute("x2", linePt.x);
    line.setAttribute("y2", linePt.y);
    line.setAttribute("stroke", "rgba(255, 255, 255, 0.06)");
    line.setAttribute("stroke-width", "1");
    zodiacGroup.appendChild(line);

    // Draw arc boundary
    const arcPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // Swap angles for clockwise/counter-clockwise description
    arcPath.setAttribute("d", describeArc(center, center, zodiacR, angleEnd, angleStart));
    arcPath.setAttribute("fill", "none");
    arcPath.setAttribute("stroke", "rgba(255, 255, 255, 0.12)");
    arcPath.setAttribute("stroke-width", "1");
    zodiacGroup.appendChild(arcPath);

    // Add zodiac sign text/glyph in the middle of segment (15 deg offset)
    const midAngle = getScreenAngle(signLongStart + 15);
    const textPt = polarToCartesian(center, center, (zodiacR + outerR) / 2, midAngle);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", textPt.x);
    text.setAttribute("y", textPt.y + 4); // vertical adjustment
    text.setAttribute("fill", sign.element === "Fire" ? "#ff9800" : sign.element === "Earth" ? "#4caf50" : sign.element === "Air" ? "#00bcd4" : "#2196f3");
    text.setAttribute("font-size", "11");
    text.setAttribute("text-anchor", "middle");
    text.textContent = sign.symbol;
    zodiacGroup.appendChild(text);
  }
  svg.appendChild(zodiacGroup);

  // 2. Draw House division lines (Equal house system based on Ascendant)
  const housesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  for (let h = 0; h < 12; h++) {
    const houseLong = asc + (h * 30);
    const screenAngle = getScreenAngle(houseLong);
    
    // Draw boundary line from aspectMaxR to zodiacR
    const innerPt = polarToCartesian(center, center, aspectMaxR, screenAngle);
    const outerPt = polarToCartesian(center, center, zodiacR, screenAngle);
    
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", innerPt.x);
    line.setAttribute("y1", innerPt.y);
    line.setAttribute("x2", outerPt.x);
    line.setAttribute("y2", outerPt.y);
    line.setAttribute("stroke", h === 0 ? "var(--color-gold)" : "rgba(255, 255, 255, 0.08)");
    line.setAttribute("stroke-width", h === 0 ? "1.5" : "1");
    if (h === 0) {
      line.setAttribute("filter", "url(#goldGlow)");
    }
    housesGroup.appendChild(line);

    // Label House Number
    const labelAngle = getScreenAngle(houseLong + 15);
    const labelPt = polarToCartesian(center, center, aspectMaxR + 10, labelAngle);
    const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    labelText.setAttribute("x", labelPt.x);
    labelText.setAttribute("y", labelPt.y + 3);
    labelText.setAttribute("fill", "rgba(255,255,255,0.25)");
    labelText.setAttribute("font-size", "7");
    labelText.setAttribute("text-anchor", "middle");
    labelText.textContent = h + 1;
    housesGroup.appendChild(labelText);
  }
  svg.appendChild(housesGroup);

  // 3. Draw Aspects (Lines connecting planets in the center)
  const aspectsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const aspects = calculateAspects(chartData);

  aspects.forEach(asp => {
    const pA = chartData.placements.find(p => p.name === asp.planetA);
    const pB = chartData.placements.find(p => p.name === asp.planetB);
    if (!pA || !pB) return;

    const angleA = getScreenAngle(pA.longitude);
    const angleB = getScreenAngle(pB.longitude);

    const ptA = polarToCartesian(center, center, aspectMaxR - 2, angleA);
    const ptB = polarToCartesian(center, center, aspectMaxR - 2, angleB);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", ptA.x);
    line.setAttribute("y1", ptA.y);
    line.setAttribute("x2", ptB.x);
    line.setAttribute("y2", ptB.y);
    line.setAttribute("class", `wheel-aspect-line ${asp.class}`);
    
    // Add title for SVG tooltips
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `${asp.planetA} ${asp.type} ${asp.planetB} (Orb: ${asp.orb}°)`;
    line.appendChild(title);

    aspectsGroup.appendChild(line);
  });
  svg.appendChild(aspectsGroup);

  // 4. Draw Planetary Placements
  const planetsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  
  // To avoid planets overlapping, let's group planets that are close to each other
  // and apply a radial offset if necessary
  const sortedPlacements = [...chartData.placements].sort((a,b) => a.longitude - b.longitude);
  const radialOffsets = {};

  for (let i = 0; i < sortedPlacements.length; i++) {
    let offset = 0;
    const p = sortedPlacements[i];
    
    // Check previous planets
    for (let j = 0; j < i; j++) {
      const prev = sortedPlacements[j];
      let diff = Math.abs(p.longitude - prev.longitude);
      if (diff > 180) diff = 360 - diff;
      if (diff < 6 && radialOffsets[prev.id] === offset) {
        offset += 12; // Shift outward
      }
    }
    radialOffsets[p.id] = offset;
  }

  chartData.placements.forEach(p => {
    // Determine screen position
    const screenAngle = getScreenAngle(p.longitude);
    const currentPlanetR = planetR + radialOffsets[p.id];
    const pt = polarToCartesian(center, center, currentPlanetR, screenAngle);

    // Planet Node Container
    const pNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    pNode.setAttribute("class", "wheel-planet-point");
    pNode.addEventListener("click", () => onPlacementSelect(p));

    // Outer faint glowing circle
    const glowCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    glowCircle.setAttribute("cx", pt.x);
    glowCircle.setAttribute("cy", pt.y);
    glowCircle.setAttribute("r", "10");
    glowCircle.setAttribute("fill", "rgba(255, 255, 255, 0.02)");
    glowCircle.setAttribute("stroke", "rgba(255, 255, 255, 0.15)");
    glowCircle.setAttribute("stroke-width", "0.5");
    pNode.appendChild(glowCircle);

    // Inner point circle
    const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    point.setAttribute("cx", pt.x);
    point.setAttribute("cy", pt.y);
    point.setAttribute("r", "3");
    const planetColor = PLANETS.find(pl => pl.id === p.id)?.color || "var(--color-gold-glow)";
    point.setAttribute("fill", planetColor);
    pNode.appendChild(point);

    // Label Glyph
    const labelPt = polarToCartesian(center, center, currentPlanetR + 13, screenAngle);
    const glyphText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    glyphText.setAttribute("x", labelPt.x);
    glyphText.setAttribute("y", labelPt.y + 3);
    glyphText.setAttribute("fill", planetColor);
    glyphText.setAttribute("font-size", "9");
    glyphText.setAttribute("font-weight", "bold");
    glyphText.setAttribute("text-anchor", "middle");
    glyphText.textContent = p.symbol;
    pNode.appendChild(glyphText);

    // Tooltip hover
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `${p.name} in ${p.signName} (${p.degree}° ${p.minutes}'), House ${p.house}`;
    pNode.appendChild(title);

    planetsGroup.appendChild(pNode);
  });

  svg.appendChild(planetsGroup);
  containerEl.appendChild(svg);
}
