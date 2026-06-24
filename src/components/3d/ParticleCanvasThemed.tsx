"use client";

import { useRef, useEffect } from "react";

interface ParticleCanvasThemedProps {
  opacity?: number;
  color?: string;
  particleCount?: number;
  connectionDist?: number;
}

export function ParticleCanvasThemed({
  opacity = 0.3,
  color = "216, 14, 22",
  particleCount = 70,
  connectionDist = 150,
}: ParticleCanvasThemedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    // Simple Perlin-ish noise for organic movement
    const particles: {
      x: number; y: number;
      vx: number; vy: number;
      size: number; alpha: number;
      phase: number; speed: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.35 + 0.1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
      });
    }

    let anim = 0;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.005;

      particles.forEach((p, i) => {
        // Organic noise movement
        p.x += p.vx + Math.sin(time * p.speed + p.phase) * 0.15;
        p.y += p.vy + Math.cos(time * p.speed + p.phase) * 0.15;

        if (p.x < 0) { p.x = w; }
        else if (p.x > w) { p.x = 0; }
        if (p.y < 0) { p.y = h; }
        else if (p.y > h) { p.y = 0; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.alpha * opacity})`;
        ctx.fill();

        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${color}, ${0.04 * (1 - dist / connectionDist) * opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      anim = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener("resize", onResize);
    };
  }, [opacity, color, particleCount, connectionDist]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >

    </canvas>
  );
}
