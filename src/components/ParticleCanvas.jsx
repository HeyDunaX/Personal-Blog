import { useEffect, useRef } from 'react';

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
};

export default function ParticleCanvas({ enabled, themeName }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const particleCount = 160;
    // Multi-color palette (Google brands inspired)
    const colorsDark = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#A06AB4'];
    const colorsLight = ['#1A73E8', '#D93025', '#F9AB00', '#1E8E3E', '#9333EA'];
    const colors = themeName === 'dark' ? colorsDark : colorsLight;

    const particles = Array.from({ length: particleCount }, () => {
      const colorHex = colors[Math.floor(Math.random() * colors.length)];
      return {
        // Angles on torus surface
        theta: Math.random() * Math.PI * 2,
        phi: Math.random() * Math.PI * 2,
        // Large orbital radius (spanning section height)
        orbitRadius: Math.random() * 150 + 200, 
        // Torus tube thickness
        tubeRadius: Math.random() * 25 + 15,
        // Angular rotation speeds (8x slower)
        speedTheta: (Math.random() * 0.001 + 0.0004) * (Math.random() > 0.5 ? 1 : -1),
        speedPhi: Math.random() * 0.002 + 0.0008,
        // Base sizes & colors
        size: Math.random() * 0.7 + 0.4,
        color: colorHex,
        rgb: hexToRgb(colorHex),
        // 3D positioning
        x3d: (Math.random() - 0.5) * window.innerWidth,
        y3d: (Math.random() - 0.5) * window.innerHeight,
        z3d: (Math.random() - 0.5) * 200,
        // 3D velocity vectors
        vx3d: 0,
        vy3d: 0,
        vz3d: 0,
        // Previous frame cache (for speed streaks)
        prevX3d: 0,
        prevY3d: 0,
        prevZ3d: 0,
        attraction: 0.0015 + Math.random() * 0.003
      };
    });

    // Initialize previous coordinates to start position
    particles.forEach(p => {
      p.prevX3d = p.x3d;
      p.prevY3d = p.y3d;
      p.prevZ3d = p.z3d;
    });

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isMouseActive = false;

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
      isMouseActive = true;
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
      }
    };

    const handleTouchMove = (event) => {
      if (event.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.touches[0].clientX - rect.left;
        mouseY = event.touches[0].clientY - rect.top;
        isMouseActive = true;
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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    let rafId;

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      let targetX = mouseX;
      let targetY = mouseY;

      if (!isMouseActive) {
        // Idle center floating orbit
        const time = Date.now() * 0.0008;
        targetX = window.innerWidth / 2 + Math.sin(time) * 120;
        targetY = window.innerHeight / 2 + Math.cos(time * 0.7) * 120;
      }

      // Toroidal tilt parameters (gives 3D orientation)
      const tiltX = 1.0; 
      const tiltY = 0.45;

      particles.forEach((p) => {
        // 1. Update angles around torus surface
        p.theta += p.speedTheta;
        p.phi += p.speedPhi;

        // 2. Generate 3D coordinates relative to center on standard horizontal torus
        const targetX3D = (p.orbitRadius + p.tubeRadius * Math.cos(p.phi)) * Math.cos(p.theta);
        const targetY3D = (p.orbitRadius + p.tubeRadius * Math.cos(p.phi)) * Math.sin(p.theta);
        const targetZ3D = p.tubeRadius * Math.sin(p.phi);

        // 3. Rotate 3D target coordinates around X and Y axes for perspective angle
        const y1 = targetY3D * Math.cos(tiltX) - targetZ3D * Math.sin(tiltX);
        const z1 = targetY3D * Math.sin(tiltX) + targetZ3D * Math.cos(tiltX);
        const x1 = targetX3D * Math.cos(tiltY) - z1 * Math.sin(tiltY);
        const z2 = targetX3D * Math.sin(tiltY) + z1 * Math.cos(tiltY);

        // 4. Drag particle positions towards target 3D coordinates with spring physics
        const dx = x1 - p.x3d;
        const dy = y1 - p.y3d;
        const dz = z2 - p.z3d;
        
        const pull = isMouseActive ? 1.0 : 0.25;
        p.vx3d += dx * p.attraction * pull;
        p.vy3d += dy * p.attraction * pull;
        p.vz3d += dz * p.attraction * pull;

        // Brownian motion noise
        p.vx3d += (Math.random() - 0.5) * 0.05;
        p.vy3d += (Math.random() - 0.5) * 0.05;
        p.vz3d += (Math.random() - 0.5) * 0.05;

        // Apply friction (reduced damping from 0.88 to 0.95 for smooth inertia)
        p.vx3d *= 0.95;
        p.vy3d *= 0.95;
        p.vz3d *= 0.95;

        // Move particle
        p.x3d += p.vx3d;
        p.y3d += p.vy3d;
        p.z3d += p.vz3d;

        // 5. 3D perspective projection with near plane clipping
        const focalLength = 300;
        const nearPlane = -focalLength + 50; // -250px

        if (p.z3d <= nearPlane || p.prevZ3d <= nearPlane) {
          if (p.z3d <= nearPlane) {
            p.z3d = nearPlane + 10;
            p.vz3d = 0;
          }
          p.prevX3d = p.x3d;
          p.prevY3d = p.y3d;
          p.prevZ3d = p.z3d;
          return;
        }

        const scale = focalLength / (focalLength + p.z3d);
        const screenX = targetX + p.x3d * scale;
        const screenY = targetY + p.y3d * scale;
        const drawSize = p.size * scale;

        // Calculate previous frame's screen coordinates for rendering streaks
        const prevScale = focalLength / (focalLength + p.prevZ3d);
        const prevScreenX = targetX + p.prevX3d * prevScale;
        const prevScreenY = targetY + p.prevY3d * prevScale;

        // Update coordinate history
        p.prevX3d = p.x3d;
        p.prevY3d = p.y3d;
        p.prevZ3d = p.z3d;

        // 6. Render speed streaks with perspective depth alpha
        context.beginPath();
        const alpha = Math.min(1.0, Math.max(0.12, (scale - 0.5) * 1.5));
        context.strokeStyle = `rgba(${p.rgb.r}, ${p.rgb.g}, ${p.rgb.b}, ${alpha})`;
        context.lineWidth = drawSize * 1.5;
        context.lineCap = 'round';
        context.moveTo(screenX, screenY);
        context.lineTo(prevScreenX, prevScreenY);
        context.stroke();
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
