"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  size: number;
  alpha: number;
  type: "dot" | "globe" | "chart" | "ship";
  rotX: number; rotY: number;
  rotSpeed: number;
}

export default function TrxaGlobeVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;

    const particles: Particle[] = [];
    const count = 60;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: (Math.random() - 0.5) * w * 1.5,
        y: (Math.random() - 0.5) * h * 1.2,
        z: Math.random() * 800 + 200,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.3 + 0.1,
        type: Math.random() < 0.7 ? "dot" : Math.random() < 0.5 ? "chart" : "globe",
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    // Globe center
    let globeAngle = 0;
    const globeLines: { lat: number; lon: number; lat2: number; lon2: number }[] = [];
    for (let i = 0; i < 40; i++) {
      const lat = (Math.random() - 0.5) * Math.PI;
      const lon = Math.random() * Math.PI * 2;
      const lat2 = lat + (Math.random() - 0.5) * 0.5;
      const lon2 = lon + (Math.random() - 0.5) * 0.5;
      globeLines.push({ lat, lon, lat2, lon2 });
    }

    let anim = 0;

    const drawRing = (gx: number, gy: number, radius: number, tilt: number) => {
      ctx.save();
      ctx.translate(gx, gy);
      ctx.scale(1, tilt);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(216, 14, 22, 0.08)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    const drawGlobe = (gx: number, gy: number, scale: number) => {
      const r = 120 * scale;
      
      // Outer glow
      const grad = ctx.createRadialGradient(gx, gy, r * 0.5, gx, gy, r * 1.5);
      grad.addColorStop(0, `rgba(216, 14, 22, 0.06)`);
      grad.addColorStop(1, `rgba(216, 14, 22, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(gx - r * 1.5, gy - r * 1.5, r * 3, r * 3);

      // Globe outline
      ctx.beginPath();
      ctx.arc(gx, gy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(216, 14, 22, 0.15)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Rings
      drawRing(gx, gy, r, 0.4);
      drawRing(gx, gy, r * 0.7, 0.6);

      // Lines on globe
      globeLines.forEach(line => {
        const x1 = gx + Math.cos(line.lon + globeAngle) * Math.cos(line.lat) * r * 0.8;
        const y1 = gy + Math.sin(line.lat) * r * 0.8;
        const x2 = gx + Math.cos(line.lon2 + globeAngle) * Math.cos(line.lat2) * r * 0.8;
        const y2 = gy + Math.sin(line.lat2) * r * 0.8;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(216, 14, 22, ${0.06 + Math.sin(line.lon * 3) * 0.04})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };

    const drawMiniIcon = (px: number, py: number, type: Particle["type"], scale: number) => {
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(scale, scale);
      
      if (type === "globe") {
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(216, 14, 22, 0.3)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-8, 0); ctx.lineTo(8, 0);
        ctx.moveTo(0, -8); ctx.lineTo(0, 8);
        ctx.stroke();
      } else if (type === "chart") {
        ctx.beginPath();
        ctx.moveTo(-6, 4); ctx.lineTo(-2, 0); ctx.lineTo(2, 2); ctx.lineTo(6, -4);
        ctx.strokeStyle = `rgba(216, 14, 22, 0.3)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw large globe in background
      drawGlobe(cx + w * 0.15, cy, 1.2);
      globeAngle += 0.002;

      // Second smaller globe
      drawGlobe(cx - w * 0.25, cy + h * 0.15, 0.7);

      // Connection lines between particles
      particles.forEach((p, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && p.z > 100 && q.z > 100) {
            ctx.beginPath();
            ctx.moveTo(p.x + cx, p.y + cy);
            ctx.lineTo(q.x + cx, q.y + cy);
            ctx.strokeStyle = `rgba(216, 14, 22, ${0.03 * (1 - dist / 200)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      // Draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.rotY += p.rotSpeed;

        // Wrap
        if (p.x < -w) p.x = w;
        if (p.x > w) p.x = -w;
        if (p.y < -h) p.y = h;
        if (p.y > h) p.y = -h;
        if (p.z < 100) { p.vz = Math.abs(p.vz); }
        if (p.z > 1000) { p.vz = -Math.abs(p.vz); }

        const scale = 400 / (p.z + 200);
        const screenX = p.x * scale + cx;
        const screenY = p.y * scale + cy;
        const alpha = p.alpha * scale;

        if (scale < 0.1) return;

        if (p.type === "dot") {
          const pulse = Math.sin(Date.now() * 0.001 + p.x * 0.01) * 0.3 + 0.7;
          ctx.beginPath();
          ctx.arc(screenX, screenY, p.size * scale * pulse * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(216, 14, 22, ${alpha * pulse})`;
          ctx.fill();

          // Glow for larger dots
          if (p.size > 1.5) {
            ctx.beginPath();
            ctx.arc(screenX, screenY, p.size * scale * 4 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(216, 14, 22, ${alpha * 0.1 * pulse})`;
            ctx.fill();
          }
        } else {
          drawMiniIcon(screenX, screenY, p.type, scale * 1.5);
        }
      });

      anim = requestAnimationFrame(draw);
    };

    anim = requestAnimationFrame(draw);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 1 }}
    />
  );
}
