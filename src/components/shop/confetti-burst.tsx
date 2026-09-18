"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
};

function palette() {
  const primary = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
  return [
    `hsl(${primary || "152 55% 27%"})`,
    "hsl(38 55% 62%)",
    "hsl(24 10% 16%)",
    "hsl(40 40% 96%)",
    "hsl(8 48% 52%)",
  ];
}

export function ConfettiBurst({ burst }: { burst: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!burst || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const colors = palette();
    const originX = window.innerWidth / 2;
    const originY = Math.min(220, window.innerHeight * 0.28);
    const particles: Particle[] = Array.from({ length: 86 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 10;
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        w: 5 + Math.random() * 7,
        h: 8 + Math.random() * 10,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.28,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      };
    });

    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => {
        p.vy += 0.18;
        p.vx *= 0.992;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.008;
        if (p.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    const stop = window.setTimeout(() => cancelAnimationFrame(frame), 4200);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(stop);
      window.removeEventListener("resize", resize);
    };
  }, [burst]);

  return (
    <canvas
      ref={canvasRef}
      className="success-no-print pointer-events-none fixed inset-0 z-30"
      aria-hidden="true"
    />
  );
}
