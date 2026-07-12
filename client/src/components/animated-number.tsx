import { useEffect, useRef } from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  /** Rendered after the number, e.g. "%" or " days" */
  suffix?: string;
  className?: string;
}

/** Counts up to `value` with a spring-eased tween; snaps instantly for reduced motion. */
export function AnimatedNumber({ value, suffix = "", className = "" }: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    if (reduceMotion) {
      if (ref.current) ref.current.textContent = `${value}${suffix}`;
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = `${Math.round(latest)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [value, suffix, reduceMotion, motionValue]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {value}
      {suffix}
    </span>
  );
}
