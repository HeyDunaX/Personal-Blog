import { useEffect, useRef } from 'react';

const MEDUSAE_CONFIG = {
  // Hover Settings (Di chuột)
  hoverRadius: 0.065,         // Bán kính di chuột
  hoverStrength: 3.0,         // Sức mạnh lơ lửng
  dampingFactor: 0.015,       // Yếu tố cản

  // Halo Settings (Quầng sáng)
  outerOscFreq: 2.6,          // Tần số dao động ngoài
  outerOscStrength: 0.76,     // Sức mạnh dao động ngoài
  outerOscVibIntensity: 0.025, // Cường độ rung dao động ngoài
  outerOscVibSpeed: 0.3,      // Tốc độ rung dao động ngoài
  radiusBase: 3.4,            // Đế bán kính
  radiusAmplitude: 0.5,       // Biên độ bán kính
  shapeAmplitude: 0.75,       // Biên độ hình dạng
  rimWidth: 1.8,              // Chiều rộng vành
  outerStartOffset: 0.4,      // Khoảng cách bắt đầu bên ngoài
  outerEndOffset: 2.2,        // Độ lệch đầu ngoài
  haloWidth: 1.3,             // Độ rộng quầng sáng
  haloHeight: 1.0,            // Halo Height

  // Particles Settings (Các hạt)
  baseSize: 0.016,            // Kích thước cơ bản
  activeSize: 0.044,          // Kích thước hoạt động
  blobWidth: 1.0,             // Chiều rộng khối
  blobHeight: 0.6,            // Chiều cao của khối
  rotationSpeed: 0.1,         // Tốc độ quay
  rotationVibration: 0.2,     // Rung lắc khi quay
  cursorTrackStrength: 1.0,   // Con trỏ theo dõi sức mạnh
  oscillationFactor: 1.0,     // Hệ số dao động

  // Easing Settings (Tham số chuyển động mượt mà)
  morphSpeed: 0.04,           // Tốc độ bay tụ từ từ
  colorTransitionSpeed: 0.05, // Tốc độ chuyển màu mượt mà
};

const extractTextPoints = (text) => {
  const offscreen = document.createElement('canvas');
  const w = 240;
  const h = 80;
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 38px "Space Grotesk", "Inter", "Arial", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const points = [];

  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      if (r > 120) {
        points.push({
          x: (x - w / 2) * 1.5,
          y: (y - h / 2) * 1.5,
        });
      }
    }
  }
  return points;
};

const getConferenceColor = (text, pct) => {
  const pVal = Math.max(0, Math.min(1, pct));
  let c1, c2;
  switch (text) {
    case 'ACL':
      c1 = { r: 123, g: 44, b: 191 };  // #7B2CBF
      c2 = { r: 0, g: 180, b: 216 };   // #00B4D8
      break;
    case 'EMNLP':
      c1 = { r: 11, g: 110, b: 79 };   // #0B6E4F
      c2 = { r: 82, g: 183, b: 136 };  // #52B788
      break;
    case 'NeurIPS':
      c1 = { r: 230, g: 57, b: 70 };   // #E63946
      c2 = { r: 255, g: 183, b: 3 };   // #FFB703
      break;
    case 'ICLR':
      c1 = { r: 255, g: 133, b: 161 }; // #FF85A1
      c2 = { r: 157, g: 2, b: 8 };     // #9D0208
      break;
    default:
      c1 = { r: 0, g: 128, b: 255 };
      c2 = { r: 255, g: 255, b: 255 };
  }
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * pVal),
    g: Math.round(c1.g + (c2.g - c1.g) * pVal),
    b: Math.round(c1.b + (c2.b - c1.b) * pVal),
  };
};

export default function ParticleCanvas({ enabled, themeName }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    // Generate text points cache synchronously
    const texts = ['ACL', 'EMNLP', 'NeurIPS', 'ICLR'];
    const textPointsCache = {};
    texts.forEach(txt => {
      textPointsCache[txt] = extractTextPoints(txt);
    });

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Increase grid count to 90x40 (3600 particles) for high-density, razor-sharp logo letters
    const countX = 90;
    const countY = 40;
    const particleCount = countX * countY;
    const particles = [];

    // Helper functions for smoothstep and GLSL noise matching
    const smoothstep = (edge0, edge1, x) => {
      const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return t * t * (3.0 - 2.0 * t);
    };

    const hash = (x, y) => {
      const sinVal = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return sinVal - Math.floor(sinVal);
    };

    const noise = (x, y) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const fx = x - ix;
      const fy = y - iy;

      const ux = fx * fx * (3.0 - 2.0 * fx);
      const uy = fy * fy * (3.0 - 2.0 * fy);

      const a = hash(ix, iy);
      const b = hash(ix + 1, iy);
      const c = hash(ix, iy + 1);
      const d = hash(ix + 1, iy + 1);

      const mixAB = a + (b - a) * ux;
      const mixCD = c + (d - c) * ux;
      return mixAB + (mixCD - mixAB) * uy;
    };

    // Initialize particles from extracted points (or fallback pattern)
    const initParticles = (pts) => {
      const isPointsAvailable = pts && pts.length > 0;
      particles.length = 0;

      // Coordinate grids in Medusae are from [-20, 20] on X and [-11, 11] on Y
      const gridWidth = 40;
      const gridHeight = 22;
      const jitter = 0.25;

      let index = 0;
      for (let y = 0; y < countY; y++) {
        for (let x = 0; x < countX; x++) {
          const u = x / (countX - 1);
          const v = y / (countY - 1);

          let px = (u - 0.5) * gridWidth;
          let py = (v - 0.5) * gridHeight;

          // Add subtle organic jitter to break grid patterns
          px += (Math.random() - 0.5) * jitter;
          py += (Math.random() - 0.5) * jitter;

          let homeX = 0;
          let homeY = 0;
          let color = { r: 255, g: 255, b: 255 };
          let hasHome = false;

          if (isPointsAvailable) {
            const pt = pts[index % pts.length];
            homeX = pt.x;
            homeY = pt.y;
            const pct = (pt.x + 100) / 200;
            color = getConferenceColor('ACL', pct);
            hasHome = true;
          } else {
            const angle = Math.random() * Math.PI * 2;
            const rad = Math.random() * 120 + 80;
            homeX = Math.cos(angle) * rad;
            homeY = Math.sin(angle) * rad;
            color = { r: 66, g: 133, b: 244 };
            hasHome = false;
          }

          particles.push({
            baseX: px,
            baseY: py,
            aRandom: Math.random(),
            // Text target coordinates (in canvas pixels)
            homeX,
            homeY,
            hasHome,
            // Track current coordinates smoothly
            x: (px / 40) * canvas.width + canvas.width / 2,
            y: -(py / 22) * canvas.height + canvas.height / 2,
            morphJitterX: (Math.random() - 0.5) * 5.0, // subtle dispersion
            morphJitterY: (Math.random() - 0.5) * 5.0,
            opacity: 0.5 + Math.random() * 0.5,
            size: Math.random() * 0.5 + 1.1, // crisp circle radius for logo
            color,
            currR: color.r,
            currG: color.g,
            currB: color.b,
          });

          index++;
        }
      }
    };

    // Initialize particles with first conference text
    initParticles(textPointsCache['ACL']);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isMouseActive = false;
    let lastMouseMoveTime = Date.now();

    // Eased coordinates of the jellyfish mouse target (in OpenGL coordinates)
    let glMouseX = 0;
    let glMouseY = 0;

    // Weight of the logo state (0.0 = Medusae swarm, 1.0 = logo)
    let logoWeight = 0.0;
    let currentTextIndex = -1;

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
      isMouseActive = true;
      lastMouseMoveTime = Date.now();
    };

    const handleMouseLeave = () => {
      isMouseActive = false;
    };

    const handleTouchStart = (event) => {
      if (event.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.touches[0].clientX - rect.left;
        mouseY = event.touches[0].clientY - rect.top;
        isMouseActive = true;
        lastMouseMoveTime = Date.now();
      }
    };

    const handleTouchMove = (event) => {
      if (event.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.touches[0].clientX - rect.left;
        mouseY = event.touches[0].clientY - rect.top;
        isMouseActive = true;
        lastMouseMoveTime = Date.now();
      }
    };

    const handleTouchEnd = () => {
      isMouseActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    let rafId;

    const draw = () => {
      // Clear canvas completely to keep particles sharp and glowy
      context.clearRect(0, 0, canvas.width, canvas.height);

      const baseScale = Math.min(canvas.width, canvas.height) / 450;
      const logoScale = Math.max(0.8, Math.min(baseScale, 2.2));

      const now = Date.now();
      const t = now * 0.001; // clock elapsed time in seconds

      // Convert Canvas mouse pixels to OpenGL coordinates [-20, 20] x [-11, 11]
      const baseGlMouseX = isMouseActive ? ((mouseX / canvas.width) * 2 - 1) * 20 : 0;
      const baseGlMouseY = isMouseActive ? (-(mouseY / canvas.height) * 2 + 1) * 11 : 0;

      let targetGlMouseX = baseGlMouseX;
      let targetGlMouseY = baseGlMouseY;

      // Add dynamic hover target jitter when active (cursor.radius: 0.065, cursor.strength: 3)
      if (isMouseActive) {
        const jitterRadius = 22 * MEDUSAE_CONFIG.hoverRadius; // min(40, 22) * radius
        const jitterX = (Math.sin(t * 0.35) + Math.sin(t * 0.77 + 1.2)) * 0.5;
        const jitterY = (Math.cos(t * 0.31) + Math.sin(t * 0.63 + 2.4)) * 0.5;
        targetGlMouseX += jitterX * jitterRadius * MEDUSAE_CONFIG.hoverStrength;
        targetGlMouseY += jitterY * jitterRadius * MEDUSAE_CONFIG.hoverStrength;
      }

      // Mouse drag easing matching uMouse updates in Medusae (dragFactor: 0.015)
      glMouseX += (targetGlMouseX - glMouseX) * MEDUSAE_CONFIG.dampingFactor;
      glMouseY += (targetGlMouseY - glMouseY) * MEDUSAE_CONFIG.dampingFactor;

      // State weight targets: gather ONLY when mouse is active but stationary, and ONLY on desktop devices (width >= 1024)
      let targetLogoWeight = 0.0;
      const isDesktopDevice = window.innerWidth >= 1024;
      if (isDesktopDevice && isMouseActive) {
        const isMoving = now - lastMouseMoveTime < 1200; // stationary threshold: 1.2s
        if (!isMoving) {
          targetLogoWeight = 1.0;
        }
      }

      // Interpolate logo weight smoothly (using slower speed 0.02 for ultra-smoothness)
      logoWeight += (targetLogoWeight - logoWeight) * 0.02;

      // Cycle text index every 6 seconds
      const cycleInterval = 6.0;
      const activeTextIndex = Math.floor(t / cycleInterval) % texts.length;

      if (activeTextIndex !== currentTextIndex) {
        currentTextIndex = activeTextIndex;
        const activeText = texts[activeTextIndex];
        const points = textPointsCache[activeText];
        if (points && points.length > 0) {
          particles.forEach((p, idx) => {
            const pt = points[idx % points.length];
            p.homeX = pt.x;
            p.homeY = pt.y;
            const pct = (pt.x + 100) / 200;
            p.color = getConferenceColor(activeText, pct);
          });
        }
      }

      const isLight = themeName === 'light';

      // Colors from MEDUSAE_DEFAULTS: base color (solid blue) and shifting active colors (light blue, red, gold)
      const baseR = 0, baseG = 0, baseB = 255;
      const c1R = 66, c1G = 133, c1B = 245;   // #4285f5
      const c2R = 235, c2G = 66, c2B = 54;    // #eb4236
      const c3R = 250, c3G = 186, c3B = 3;    // #faba03

      particles.forEach((p) => {
        // --- 1. ALIVE FLOW (Base layer) ---
        let posX = p.baseX;
        let posY = p.baseY;

        const driftSpeed = t * 0.15;
        const dx = Math.sin(driftSpeed + posY * 0.5) + Math.sin(driftSpeed * 0.5 + posY * 2.0);
        const dy = Math.cos(driftSpeed + posX * 0.5) + Math.cos(driftSpeed * 0.5 + posX * 2.0);

        posX += dx * 0.25;
        posY += dy * 0.25;

        // --- 2. THE JELLYFISH HALO ---
        const relToMouseX = posX - glMouseX;
        const relToMouseY = posY - glMouseY;

        // Halo Scale bounds: Width: 1.3, Height: 1.0
        const scaleX = MEDUSAE_CONFIG.haloWidth;
        const scaleY = MEDUSAE_CONFIG.haloHeight;
        const distFromMouse = Math.sqrt((relToMouseX / scaleX) ** 2 + (relToMouseY / scaleY) ** 2);
        
        const dirToMouseLen = Math.sqrt(relToMouseX * relToMouseX + relToMouseY * relToMouseY);
        const dirToMouseX = relToMouseX / (dirToMouseLen + 0.0001);
        const dirToMouseY = relToMouseY / (dirToMouseLen + 0.0001);

        const shapeFactor = noise(dirToMouseX * 2.0, dirToMouseY * 2.0 + t * 0.1);

        // Halo settings: radiusBase: 2.4, radiusAmplitude: 0.5, shapeAmplitude: 0.75, rimWidth: 1.8
        const radiusBase = MEDUSAE_CONFIG.radiusBase;
        const radiusAmplitude = MEDUSAE_CONFIG.radiusAmplitude;
        const shapeAmplitude = MEDUSAE_CONFIG.shapeAmplitude;
        const rimWidth = MEDUSAE_CONFIG.rimWidth;
        const outerStartOffset = MEDUSAE_CONFIG.outerStartOffset;
        const outerEndOffset = MEDUSAE_CONFIG.outerEndOffset;

        const breathCycle = Math.sin(t * 0.8);
        const baseRadius = radiusBase + breathCycle * radiusAmplitude;
        const currentRadius = baseRadius + shapeFactor * shapeAmplitude;

        const rimInfluence = smoothstep(rimWidth, 0.0, Math.abs(distFromMouse - currentRadius));
        const pushAmt = (breathCycle * 0.5 + 0.5) * 0.5;

        posX += dirToMouseX * pushAmt * rimInfluence;
        posY += dirToMouseY * pushAmt * rimInfluence;

        // --- 3. OUTER OSCILLATION ---
        const outerInfluence = smoothstep(baseRadius + outerStartOffset, baseRadius + outerEndOffset, distFromMouse);
        const outerOscVibration = Math.sin(t * MEDUSAE_CONFIG.outerOscVibSpeed) * MEDUSAE_CONFIG.outerOscVibIntensity;
        const outerOsc = Math.sin(t * MEDUSAE_CONFIG.outerOscFreq + posX * 0.6 + posY * 0.6) + outerOscVibration; // frequency: 2.6
        posX += dirToMouseX * outerOsc * MEDUSAE_CONFIG.outerOscStrength * outerInfluence;       // strength: 0.76
        posY += dirToMouseY * outerOsc * MEDUSAE_CONFIG.outerOscStrength * outerInfluence;

        // Convert the OpenGL units [-20, 20] x [-11, 11] back to Canvas pixel coordinates (OpenGL Y is up, Canvas Y is down)
        const freePixelX = (posX / 40) * canvas.width;
        const freePixelY = -(posY / 22) * canvas.height;

        // --- 4. TEXT MORPHING TARGETS ---
        const logoCenterX = isMouseActive ? mouseX : canvas.width / 2;
        const logoCenterY = isMouseActive ? mouseY : canvas.height / 2;
        const textTargetX = logoCenterX + (p.homeX + p.morphJitterX) * logoScale;
        const textTargetY = logoCenterY + (p.homeY + p.morphJitterY) * logoScale;

        const freeX = canvas.width / 2 + freePixelX;
        const freeY = canvas.height / 2 + freePixelY;

        const targetX = (1 - logoWeight) * freeX + logoWeight * textTargetX;
        const targetY = (1 - logoWeight) * freeY + logoWeight * textTargetY;

        // Smooth flight of particle coordinates
        p.x += (targetX - p.x) * MEDUSAE_CONFIG.morphSpeed;
        p.y += (targetY - p.y) * MEDUSAE_CONFIG.morphSpeed;

        // --- 5. PARTICLE ROTATION ---
        const oscPhase = p.aRandom * Math.PI * 2;
        const osc = 0.5 + 0.5 * Math.sin(t * 0.6 + oscPhase) * MEDUSAE_CONFIG.oscillationFactor;
        const speedScale = (0.55 + 0.8 * osc);
        const jitterScale = (0.7 + 0.75 * osc) * 0.95;
        // Rotation settings: speed: 0.1, jitter: 0.2
        const jitter = Math.sin(t * MEDUSAE_CONFIG.rotationSpeed * speedScale + posX * 0.35 + posY * 0.35) * (MEDUSAE_CONFIG.rotationVibration * jitterScale);

        const perpX = -dirToMouseY;
        const perpY = dirToMouseX;
        const jitteredDirX = dirToMouseX + perpX * jitter;
        const jitteredDirY = dirToMouseY + perpY * jitter;
        const jitteredDirLen = Math.max(Math.sqrt(jitteredDirX * jitteredDirX + jitteredDirY * jitteredDirY), 0.0001);

        const finalDirX = jitteredDirX / jitteredDirLen;
        const finalDirY = jitteredDirY / jitteredDirLen;
        const angle = Math.atan2(finalDirY, finalDirX);

        // --- 6. SIZE & SCALE ---
        // Base size: 0.016, Active size: 0.044
        const baseSize = MEDUSAE_CONFIG.baseSize + Math.sin(t + posX) * 0.003;
        const activeSize = MEDUSAE_CONFIG.activeSize;
        const currentScale = baseSize + rimInfluence * activeSize;
        const stretch = rimInfluence * 0.02 * MEDUSAE_CONFIG.cursorTrackStrength;

        // OpenGL units to canvas pixel size (X ratio) with 2.2x visibility scale
        // Blob width: 1.0, Blob height: 0.6
        const pxWidth = (currentScale + stretch) * MEDUSAE_CONFIG.blobWidth * (canvas.width / 40) * 2.2;
        const pxHeight = currentScale * MEDUSAE_CONFIG.blobHeight * (canvas.width / 40) * 2.2;

        // --- 7. COLOR-SHIFTING FRAGMENT SHADER PORT ---
        const timeFactor = t * 1.2;
        const p1 = Math.sin(posX * 0.8 + timeFactor);
        const p2 = Math.sin(posY * 0.8 + timeFactor * 0.8 + p1);

        // Blend One (Blue) and Two (Red)
        const t1 = p1 * 0.5 + 0.5;
        let actR = c1R + (c2R - c1R) * t1;
        let actG = c1G + (c2G - c1G) * t1;
        let actB = c1B + (c2B - c1B) * t1;

        // Blend with Three (Yellow)
        const t2 = p2 * 0.5 + 0.5;
        actR = actR + (c3R - actR) * t2;
        actG = actG + (c3G - actG) * t2;
        actB = actB + (c3B - actB) * t2;

        // Blend Active Color with Base Color (Solid Blue) using rim influence
        const blendFactor = smoothstep(0.1, 0.8, rimInfluence);
        let r = Math.round(baseR + (actR - baseR) * blendFactor);
        let g = Math.round(baseG + (actG - baseG) * blendFactor);
        let b = Math.round(baseB + (actB - baseB) * blendFactor);

        // Adapt colors for light theme background
        if (isLight && logoWeight < 0.05) {
          // Make base particles darker slate blue in light theme for readability
          r = Math.round(30 + (actR - 30) * blendFactor);
          g = Math.round(41 + (actG - 41) * blendFactor);
          b = Math.round(59 + (actB - 59) * blendFactor);
        }

        // --- 8. AUTHENTIC CONFERENCE COLORS ---
        const logoR = p.color.r;
        const logoG = p.color.g;
        const logoB = p.color.b;

        const finalR = Math.round((1 - logoWeight) * r + logoWeight * logoR);
        const finalG = Math.round((1 - logoWeight) * g + logoWeight * logoG);
        const finalB = Math.round((1 - logoWeight) * b + logoWeight * logoB);

        // Smooth color transition
        p.currR += (finalR - p.currR) * MEDUSAE_CONFIG.colorTransitionSpeed;
        p.currG += (finalG - p.currG) * MEDUSAE_CONFIG.colorTransitionSpeed;
        p.currB += (finalB - p.currB) * MEDUSAE_CONFIG.colorTransitionSpeed;

        // Compute opacity
        const baseAlpha = 1.0;
        const finalAlpha = baseAlpha * (0.4 + (0.95 - 0.4) * rimInfluence) * (1 - logoWeight) + logoWeight * 0.9;

        // --- 9. GEOMETRY MORPHING (Rotate capsules in swarm, morph to unrotated circles in logo) ---
        // horizontal radius rx, vertical radius ry
        const rx = (1 - logoWeight) * (pxWidth / 2) + logoWeight * (p.size * 0.85);
        const ry = (1 - logoWeight) * (pxHeight / 2) + logoWeight * (p.size * 0.85);
        const targetAngle = (1 - logoWeight) * angle;

        context.save();
        context.translate(p.x, p.y);
        context.rotate(targetAngle);
        context.beginPath();
        // Draw ellipse centered at (0, 0)
        context.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        context.fillStyle = `rgba(${Math.round(p.currR)}, ${Math.round(p.currG)}, ${Math.round(p.currB)}, ${finalAlpha})`;
        context.fill();
        context.restore();
      });

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, themeName]);

  if (!enabled) return null;

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />;
}
