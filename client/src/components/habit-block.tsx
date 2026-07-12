import { Check, Clock, X } from "lucide-react";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HabitTimeIndicator } from "./habit-time-indicator";
import type { Habit, HabitCompletion, RoutineHabit } from "@shared/schema";

interface HabitBlockProps {
  habit: Habit;
  routineHabit: RoutineHabit;
  completion?: HabitCompletion;
  onToggle: () => void;
  onDelete?: () => void;
  color: string;
  isFirst: boolean;
}

export function HabitBlock({
  habit,
  routineHabit,
  completion,
  onToggle,
  onDelete,
  color,
  isFirst
}: HabitBlockProps) {
  const isCompleted = completion?.completed ?? false;
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showCompleteAnimation, setShowCompleteAnimation] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const rippleId = useRef(0);

  const HOLD_DURATION = 800; // 0.8 seconds

  const createRipple = (event: React.MouseEvent | React.TouchEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = 'clientX' in event ? event.clientX - rect.left : event.touches[0].clientX - rect.left;
    const y = 'clientY' in event ? event.clientY - rect.top : event.touches[0].clientY - rect.top;

    const newRipple = { id: rippleId.current++, x, y };
    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleHoldStart = (event: React.MouseEvent | React.TouchEvent) => {
    if (isCompleted) return;

    createRipple(event);
    setIsHolding(true);
    setHoldProgress(0);

    // Progress animation
    const startTime = Date.now();
    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      setHoldProgress(progress);
    }, 16);

    // Complete action after hold duration
    holdTimer.current = setTimeout(() => {
      setShowCompleteAnimation(true);
      onToggle();

      // Reset after animation
      setTimeout(() => {
        setShowCompleteAnimation(false);
        setIsHolding(false);
        setHoldProgress(0);
      }, 600);
    }, HOLD_DURATION);
  };

  const handleHoldEnd = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const colorClasses = {
    'habit-purple': {
      bg: isCompleted
        ? 'bg-gradient-to-br from-pastel-purple to-purple-50 dark:to-purple-950 border-habit-purple/70'
        : 'bg-card border-border',
      text: isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400',
      status: isCompleted ? 'bg-habit-purple text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
      holdRing: 'border-habit-purple'
    },
    'habit-indigo': {
      bg: isCompleted
        ? 'bg-gradient-to-br from-pastel-indigo to-blue-50 dark:to-blue-950 border-habit-indigo/70'
        : 'bg-card border-border',
      text: isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400',
      status: isCompleted ? 'bg-habit-indigo text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
      holdRing: 'border-habit-indigo'
    },
    'habit-emerald': {
      bg: isCompleted
        ? 'bg-gradient-to-br from-pastel-emerald to-green-50 dark:to-green-950 border-habit-emerald/70'
        : 'bg-card border-border',
      text: isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400',
      status: isCompleted ? 'bg-habit-emerald text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
      holdRing: 'border-habit-emerald'
    },
    'habit-amber': {
      bg: isCompleted
        ? 'bg-gradient-to-br from-pastel-amber to-yellow-50 dark:to-yellow-950 border-habit-amber/70'
        : 'bg-card border-border',
      text: isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400',
      status: isCompleted ? 'bg-habit-amber text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
      holdRing: 'border-habit-amber'
    }
  };

  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses['habit-purple'];

  const renderHabitSentence = () => {
    if (isFirst && habit.time && habit.location) {
      // Implementation intention format
      return (
        <div className={`font-medium leading-relaxed ${classes.text}`}>
          I will{" "}
          <span className="rounded-md border-b-2 border-habit-indigo bg-white px-1.5 dark:bg-card">
            {habit.action}
          </span>{" "}
          at{" "}
          <span className="rounded-md border-b-2 border-habit-amber bg-white px-1.5 dark:bg-card">
            {habit.time}
          </span>{" "}
          in{" "}
          <span className="rounded-md border-b-2 border-habit-emerald bg-white px-1.5 dark:bg-card">
            {habit.location}
          </span>.
        </div>
      );
    } else {
      // Habit stacking format
      return (
        <div className={`font-medium leading-relaxed ${classes.text}`}>
          {habit.formattedSentence}
        </div>
      );
    }
  };

  return (
    <div className="flex-shrink-0 group relative">
      {/* Hold progress border */}
      {isHolding && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none z-10">
          <svg className="w-full h-full" viewBox="0 0 280 120" preserveAspectRatio="none">
            {/* Background border */}
            <rect
              x="3"
              y="3"
              width="274"
              height="114"
              rx="16"
              ry="16"
              fill="none"
              stroke="rgba(156, 163, 175, 0.3)"
              strokeWidth="6"
            />
            {/* Progress border */}
            <rect
              x="3"
              y="3"
              width="274"
              height="114"
              rx="16"
              ry="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * (274 + 114)}`}
              strokeDashoffset={`${2 * (274 + 114) * (1 - holdProgress)}`}
              className={`${classes.holdRing} transition-all duration-75`}
            />
          </svg>
        </div>
      )}

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none z-20"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            marginLeft: '-10px',
            marginTop: '-10px',
          }}
        >
          <div className={`w-full h-full rounded-full ${classes.holdRing.replace('border-', 'bg-')} opacity-40 animate-ripple`}></div>
        </div>
      ))}

      {/* Completion flash */}
      {showCompleteAnimation && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none z-20 animate-ping">
          <div className={`w-full h-full rounded-2xl ${classes.bg} opacity-75`}></div>
        </div>
      )}

      <motion.div
        className={`${classes.bg} relative min-w-[280px] cursor-pointer select-none overflow-hidden rounded-2xl border-2 p-4 shadow-soft transition-shadow duration-200 hover:shadow-lift`}
        animate={{ scale: isHolding ? 0.97 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onMouseDown={!isCompleted ? handleHoldStart : undefined}
        onMouseUp={handleHoldEnd}
        onMouseLeave={handleHoldEnd}
        onTouchStart={!isCompleted ? handleHoldStart : undefined}
        onTouchEnd={handleHoldEnd}
      >
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-2 top-2 z-30 h-7 w-7 rounded-full p-0 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 dark:text-gray-500 dark:hover:text-red-400"
            onClick={onDelete}
            aria-label="Remove habit"
          >
            <X size={14} />
          </Button>
        )}
        <div className="mb-3 flex items-center justify-between">
          <motion.div
            key={isCompleted ? "done" : "todo"}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className={`flex h-7 w-7 items-center justify-center rounded-full ${classes.status}`}
          >
            {isCompleted ? <Check size={14} strokeWidth={3} /> : <Clock size={13} />}
          </motion.div>
          {habit.time && (
            <HabitTimeIndicator time={habit.time} isCompleted={isCompleted} />
          )}
        </div>
        {renderHabitSentence()}

        {/* Hold instruction */}
        {!isCompleted && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Hold to complete
          </div>
        )}
      </motion.div>
    </div>
  );
}
