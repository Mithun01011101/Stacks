import { motion, useReducedMotion } from "framer-motion";

const PARTICLE_COLORS = [
  "hsl(var(--habit-purple))",
  "hsl(var(--habit-indigo))",
  "hsl(var(--habit-emerald))",
  "hsl(var(--habit-amber))",
];

const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const distance = 46 + (i % 3) * 22;
  return {
    id: i,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance - 18,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    size: i % 2 === 0 ? 7 : 5,
    rotation: (i % 4) * 90 + 45,
  };
});

/** One-shot celebratory burst, centered on its parent (parent needs `relative`). */
export function ConfettiBurst() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible">
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: [0, 1.2, 0.9],
            opacity: [1, 1, 0],
            rotate: p.rotation,
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}
