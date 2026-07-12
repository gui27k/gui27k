import React, { useEffect, useRef } from "react";

interface RainEffectProps {
  rippleOnClick?: boolean;
  intensity?: number; // 1 to 5
}

interface Drop {
  x: number;
  y: number;
  vy: number;
  length: number;
  opacity: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

export const RainEffect: React.FC<RainEffectProps> = ({
  rippleOnClick = true,
  intensity = 3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initialize drops
    const drops: Drop[] = [];
    const maxDrops = intensity * 40;

    for (let i = 0; i < maxDrops; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        vy: 4 + Math.random() * 6,
        length: 10 + Math.random() * 15,
        opacity: 0.05 + Math.random() * 0.12,
      });
    }

    // Initialize ripples
    let ripples: Ripple[] = [];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Create ripple at random or specific position
    const createRipple = (x: number, y: number, isLarge = false) => {
      ripples.push({
        x,
        y,
        radius: 1,
        maxRadius: isLarge ? 50 + Math.random() * 40 : 15 + Math.random() * 15,
        opacity: isLarge ? 0.6 : 0.15 + Math.random() * 0.15,
        speed: isLarge ? 1.5 : 0.5 + Math.random() * 0.5,
      });

      // Cap ripples array to prevent performance memory leak
      if (ripples.length > 100) {
        ripples.shift();
      }
    };

    // Listen for click to spawn user ripples
    const handleClick = (e: MouseEvent) => {
      if (!rippleOnClick) return;
      createRipple(e.clientX, e.clientY, true);
    };

    window.addEventListener("click", handleClick);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw and update drops
      ctx.strokeStyle = "rgba(174, 207, 238, 0.15)";
      ctx.lineWidth = 1;
      
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.length);
        ctx.strokeStyle = `rgba(174, 207, 238, ${d.opacity})`;
        ctx.stroke();

        // Update position
        d.y += d.vy;

        // If drop hits the bottom or hits a random splash height
        if (d.y > height) {
          // 30% chance to create small ripple on screen bottom/mid bounds
          if (Math.random() < 0.15) {
            createRipple(d.x, height - Math.random() * 150);
          }
          // Reset drop to top
          d.y = -20;
          d.x = Math.random() * width;
          d.vy = 4 + Math.random() * 6;
        }
      }

      // 2. Draw and update ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${r.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Update ripple parameters
        r.radius += r.speed;
        r.opacity -= r.speed / r.maxRadius;

        // Remove dead ripples
        if (r.opacity <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      // 3. Periodically spawn background ripples at random spots
      if (Math.random() < 0.08) {
        createRipple(Math.random() * width, Math.random() * height);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, rippleOnClick]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      id="rain-canvas"
    />
  );
};
