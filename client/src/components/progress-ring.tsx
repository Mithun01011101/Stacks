import { motion, useReducedMotion } from "framer-motion";

interface ProgressRingProps {
  /** 0–100 */
  percentage: number;
  size?: number;
  strokeWidth?: number;
  /** CSS color for the progress arc */
  color?: string;
  /** CSS color for the track behind the arc */
  trackColor?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ProgressRing({
  percentage,
  size = 64,
  strokeWidth = 6,
  color = "hsl(var(--habit-purple))",
  trackColor = "hsl(var(--habit-purple) / 0.15)",
  children,
  className = "",
}: ProgressRingProps) {
  const reduceMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(clamped)}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduceMotion ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
