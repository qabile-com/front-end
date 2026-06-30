'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  life: number;
  max: number;
  hue: number;
  sat: number;
  flick: number;
}

export function EmberCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let parts: Particle[] = [];
    let raf = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const countParts = () => {
      const area = window.innerWidth * window.innerHeight;
      return Math.min(80, Math.max(28, Math.round(area / 28000)));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.floor(window.innerWidth * dpr);
      h = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    const spawn = (initial: boolean): Particle => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + Math.random() * 40 * dpr,
      r: (0.6 + Math.random() * 1.8) * dpr,
      vy: (0.22 + Math.random() * 0.65) * dpr,
      vx: (Math.random() - 0.5) * 0.28 * dpr,
      life: 0,
      max: 220 + Math.random() * 280,
      hue: 18 + Math.random() * 26,
      sat: 88 + Math.random() * 10,
      flick: Math.random() * Math.PI * 2,
    });

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i]!;
        p.life++;
        p.y -= p.vy;
        p.x += p.vx + Math.sin(p.life * 0.02 + p.flick) * 0.22 * dpr;
        const lr = p.life / p.max;
        const alpha = Math.sin(Math.min(lr, 1) * Math.PI) * 0.82;
        const fl = 0.7 + Math.sin(p.life * 0.3 + p.flick) * 0.3;
        if (p.y < -10 * dpr || p.life > p.max) parts[i] = spawn(false);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5);
        g.addColorStop(0, `hsla(${p.hue + 14},${p.sat}%,72%,${alpha * fl})`);
        g.addColorStop(0.4, `hsla(${p.hue},${p.sat}%,55%,${alpha * fl * 0.7})`);
        g.addColorStop(1, `hsla(${p.hue},${p.sat}%,45%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        parts = Array.from({ length: countParts() }, () => spawn(true));
      }, 200);
    };

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else frame();
    };

    resize();
    parts = Array.from({ length: countParts() }, () => spawn(true));
    frame();
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} id="embers" className="pointer-events-none fixed inset-0 z-0" />;
}
