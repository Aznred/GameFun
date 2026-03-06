import React, { useEffect, useRef } from 'react';

/**
 * Subtle animated arcade background: floating dots + slow gradient shift.
 * GPU-friendly (transform, opacity). Very low CPU usage.
 */
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const dots: { x: number; y: number; vx: number; vy: number; radius: number; opacity: number }[] = [];
    const dotCount = 28;
    const maxRadius = 2;
    const speed = 0.12;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initDots();
    };

    const initDots = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      dots.length = 0;
      for (let i = 0; i < dotCount; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          radius: 0.4 + Math.random() * maxRadius,
          opacity: 0.15 + Math.random() * 0.2,
        });
      }
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        d.x = Math.max(0, Math.min(w, d.x));
        d.y = Math.max(0, Math.min(h, d.y));

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${d.opacity})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      {/* Base gradient */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(167, 139, 250, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 45%),
            radial-gradient(ellipse 50% 30% at 20% 70%, rgba(244, 114, 182, 0.05) 0%, transparent 40%),
            linear-gradient(180deg, #0f0d1a 0%, #0a0812 50%, #0f0d1a 100%)
          `,
        }}
      />
      {/* Subtle grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          animation: 'gridShift 30s linear infinite',
        }}
      />
      {/* Floating dots (canvas) */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
      <style>{`
        @keyframes gridShift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(48px, 48px); }
        }
      `}</style>
    </>
  );
}
