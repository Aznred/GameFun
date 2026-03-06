import { useEffect, useRef } from 'react';

/**
 * Playful animated background — soft gradient shift + floating orbs.
 * Subtle, not distracting. GPU-friendly.
 */
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const orbs: { x: number; y: number; r: number; vx: number; vy: number; hue: number }[] = [];
    const count = 12;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      orbs.length = 0;
      for (let i = 0; i < count; i++) {
        orbs.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: 40 + Math.random() * 80,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          hue: 260 + Math.random() * 60,
        });
      }
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (const o of orbs) {
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < -o.r || o.x > w + o.r) o.vx *= -1;
        if (o.y < -o.r || o.y > h + o.r) o.vy *= -1;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue}, 70%, 60%, 0.12)`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% -20%, rgba(168,85,247,0.25) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 90% 50%, rgba(34,211,238,0.15) 0%, transparent 45%),
            radial-gradient(ellipse 60% 40% at 10% 80%, rgba(236,72,153,0.12) 0%, transparent 40%),
            linear-gradient(180deg, #1a0a2e 0%, #16213e 40%, #0f3460 70%, #1a0a2e 100%)
          `,
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
    </>
  );
}
