import React, { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const PARTICLE_COUNT = 12;
const SPEED = 120;
const DURATION_MS = 450;

/**
 * Spawns a short burst of particles at (clientX, clientY).
 * Uses requestAnimationFrame for smooth, low-cost animation.
 */
export function useParticleBurst() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const idRef = useRef(0);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const burst = useCallback((clientX: number, clientY: number, color = 'rgba(167, 139, 250, 0.9)') => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.5;
      const speed = SPEED * (0.6 + Math.random() * 0.4);
      newParticles.push({
        id: ++idRef.current,
        x: clientX,
        y: clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: DURATION_MS,
        color,
        size: 3 + Math.random() * 4,
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
    setParticles(particlesRef.current);

    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      particlesRef.current = particlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + (p.vx * 16) / 1000,
          y: p.y + (p.vy * 16) / 1000,
          life: p.life + 16,
        }))
        .filter((p) => p.life < p.maxLife);
      setParticles([...particlesRef.current]);
      if (particlesRef.current.length > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  return { particles, burst };
}

interface ParticleClickEffectProps {
  children: React.ReactNode;
  color?: string;
  onParticleBurst?: (x: number, y: number) => void;
  disabled?: boolean;
}

/**
 * Wraps a button or clickable element and triggers a particle burst on click.
 */
export function ParticleClickEffect({
  children,
  color = 'rgba(167, 139, 250, 0.9)',
  onParticleBurst,
  disabled = false,
}: ParticleClickEffectProps) {
  const { particles, burst } = useParticleBurst();

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    const { clientX, clientY } = e;
    burst(clientX, clientY, color);
    onParticleBurst?.(clientX, clientY);
  };

  return (
    <>
      <div onClick={handleClick} style={{ display: 'inline-block' }}>
        {children}
      </div>
      {particles.length > 0 &&
        createPortal(
          <div
            className="particle-layer"
            aria-hidden
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          >
            {particles.map((p) => (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size,
                  marginLeft: -p.size / 2,
                  marginTop: -p.size / 2,
                  borderRadius: '50%',
                  background: p.color,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                  opacity: 1 - p.life / p.maxLife,
                  transform: 'translateZ(0)',
                }}
              />
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
