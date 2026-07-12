import { useEffect, useRef, useState } from "react";
import { Layers, MoreHorizontal, PartyPopper, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HabitChain } from "./habit-chain";
import { ProgressRing } from "./progress-ring";
import { ConfettiBurst } from "./confetti-burst";
import type { RoutineWithHabits } from "@shared/schema";

interface RoutineCardProps {
  routine: RoutineWithHabits;
  onToggleCompletion: (habitId: number) => void;
  onStartRoutine?: () => void;
  onDeleteRoutine?: (routineId: number) => void;
  onDeleteHabit?: (habitId: number, routineId: number) => void;
  onAddHabit?: (routineId: number) => void;
}

export function RoutineCard({
  routine,
  onToggleCompletion,
  onStartRoutine,
  onDeleteRoutine,
  onDeleteHabit,
  onAddHabit
}: RoutineCardProps) {
  const getIconColorClasses = (color: string) => {
    const classes = {
      'habit-amber': 'bg-gradient-to-br from-habit-amber to-orange-400',
      'habit-purple': 'bg-gradient-to-br from-habit-purple to-indigo-600',
      'habit-indigo': 'bg-gradient-to-br from-habit-indigo to-blue-600',
      'habit-emerald': 'bg-gradient-to-br from-habit-emerald to-green-600'
    };
    return classes[color as keyof typeof classes] || classes['habit-purple'];
  };

  const isAllComplete =
    routine.progress.total > 0 &&
    routine.progress.completed === routine.progress.total;

  // Fire confetti only when the stack *transitions* to fully complete
  const [showConfetti, setShowConfetti] = useState(false);
  const wasAllComplete = useRef(isAllComplete);
  useEffect(() => {
    if (isAllComplete && !wasAllComplete.current) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 900);
      return () => clearTimeout(timer);
    }
    wasAllComplete.current = isAllComplete;
  }, [isAllComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="relative overflow-hidden rounded-3xl border-border/60 shadow-soft transition-shadow duration-300 hover:shadow-lift">
        {showConfetti && <ConfettiBurst />}
        <CardContent className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center space-x-3">
              <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${getIconColorClasses(routine.color || 'habit-purple')} shadow-soft`}>
                <Layers className="text-white" size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="font-display truncate text-lg font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  {routine.title}
                </h4>
                {routine.description && (
                  <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                    {routine.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              <ProgressRing
                percentage={routine.progress.percentage}
                size={44}
                strokeWidth={4.5}
                color={isAllComplete ? "hsl(var(--habit-emerald))" : "hsl(var(--habit-purple))"}
                trackColor="hsl(var(--habit-purple) / 0.14)"
              >
                <span className="text-[10px] font-bold tabular-nums text-gray-700 dark:text-gray-300">
                  {routine.progress.completed}/{routine.progress.total}
                </span>
              </ProgressRing>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 w-11 rounded-full p-0"
                    aria-label="Stack options"
                  >
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onDeleteRoutine?.(routine.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 focus:text-red-700 dark:focus:text-red-300"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete Stack
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <HabitChain
            routine={routine}
            onToggleCompletion={onToggleCompletion}
            onDeleteHabit={onDeleteHabit}
            onAddHabit={onAddHabit}
          />

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full bg-habit-emerald"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {routine.progress.completed} completed
                </span>
              </div>
              {routine.progress.total - routine.progress.completed > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {routine.progress.total - routine.progress.completed} remaining
                  </span>
                </div>
              )}
            </div>

            {isAllComplete ? (
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-pastel-emerald px-3 py-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
              >
                <PartyPopper size={14} />
                All complete!
              </motion.div>
            ) : (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Hold any habit to complete it
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
