import { Check, Clock, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
      bg: isCompleted ? 'bg-gradient-to-br from-pastel-purple to-purple-50 dark:to-purple-950 border-habit-purple' : 'bg-gradient-to-br from-gray-50 dark:from-gray-800 to-gray-100 dark:to-gray-700 border-gray-300 dark:border-gray-600 border-dashed',
      text: isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400',
      status: isCompleted ? 'bg-habit-purple text-white' : 'bg-gray-300 dark:bg-gray-600 text-white',
      statusBg: isCompleted ? 'bg-white dark:bg-card text-habit-purple' : 'bg-white dark:bg-card text-gray-500 dark:text-gray-400',
      holdRing: 'border-habit-purple'
    },
    'habit-indigo': {
      bg: isCompleted ? 'bg-gradient-to-br from-pastel-indigo to-blue-50 dark:to-blue-950 border-habit-indigo' : 'bg-gradient-to-br from-gray-50 dark:from-gray-800 to-gray-100 dark:to-gray-700 border-gray-300 dark:border-gray-600 border-dashed',
      text: isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400',
      status: isCompleted ? 'bg-habit-indigo text-white' : 'bg-gray-300 dark:bg-gray-600 text-white',
      statusBg: isCompleted ? 'bg-white dark:bg-card text-habit-indigo' : 'bg-white dark:bg-card text-gray-500 dark:text-gray-400',
      holdRing: 'border-habit-indigo'
    },
    'habit-emerald': {
      bg: isCompleted ? 'bg-gradient-to-br from-pastel-emerald to-green-50 dark:to-green-950 border-habit-emerald' : 'bg-gradient-to-br from-gray-50 dark:from-gray-800 to-gray-100 dark:to-gray-700 border-gray-300 dark:border-gray-600 border-dashed',
      text: isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400',
      status: isCompleted ? 'bg-habit-emerald text-white' : 'bg-gray-300 dark:bg-gray-600 text-white',
      statusBg: isCompleted ? 'bg-white dark:bg-card text-habit-emerald' : 'bg-white dark:bg-card text-gray-500 dark:text-gray-400',
      holdRing: 'border-habit-emerald'
    },
    'habit-amber': {
      bg: isCompleted ? 'bg-gradient-to-br from-pastel-amber to-yellow-50 dark:to-yellow-950 border-habit-amber' : 'bg-gradient-to-br from-gray-50 dark:from-gray-800 to-gray-100 dark:to-gray-700 border-gray-300 dark:border-gray-600 border-dashed',
      text: isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400',
      status: isCompleted ? 'bg-habit-amber text-white' : 'bg-gray-300 dark:bg-gray-600 text-white',
      statusBg: isCompleted ? 'bg-white dark:bg-card text-habit-amber' : 'bg-white dark:bg-card text-gray-500 dark:text-gray-400',
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
          <span className="border-b-2 border-habit-indigo bg-white dark:bg-card px-1 rounded">
            {habit.action}
          </span>{" "}
          at{" "}
          <span className="border-b-2 border-habit-amber bg-white dark:bg-card px-1 rounded">
            {habit.time}
          </span>{" "}
          in{" "}
          <span className="border-b-2 border-habit-emerald bg-white dark:bg-card px-1 rounded">
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
        <div className="absolute inset-0 rounded-xl pointer-events-none z-10">
          <svg className="w-full h-full" viewBox="0 0 280 120" preserveAspectRatio="none">
            {/* Background border */}
            <rect
              x="3"
              y="3"
              width="274"
              height="114"
              rx="12"
              ry="12"
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
              rx="12"
              ry="12"
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

      {/* Completion animation */}
      {showCompleteAnimation && (
        <div className="absolute inset-0 rounded-xl pointer-events-none z-20 animate-ping">
          <div className={`w-full h-full rounded-xl ${classes.bg} opacity-75`}></div>
        </div>
      )}
      
      <div 
        className={`${classes.bg} border-2 rounded-xl p-4 min-w-[280px] transition-all duration-200 cursor-pointer select-none overflow-hidden relative
          ${isCompleted ? 'hover:shadow-lg' : 'hover:shadow-lg active:scale-95'}
          ${showCompleteAnimation ? 'animate-pulse' : ''}
        `}
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
            className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 z-30"
            onClick={onDelete}
          >
            <X size={14} />
          </Button>
        )}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${classes.status}`}>
              {isCompleted ? <Check size={12} /> : <Clock size={12} />}
            </div>
          </div>
          {habit.time && (
            <HabitTimeIndicator time={habit.time} isCompleted={isCompleted} />
          )}
        </div>
        {renderHabitSentence()}
        
        {/* Hold instruction */}
        {!isCompleted && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 opacity-60">
            Hold to complete
          </div>
        )}
      </div>
    </div>
  );
}
