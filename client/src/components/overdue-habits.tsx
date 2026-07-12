import { AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RoutineWithHabits } from "@shared/schema";

interface OverdueHabitsProps {
  routines: RoutineWithHabits[];
  onToggleCompletion: (habitId: number, routineId: number) => void;
}

export function OverdueHabits({ routines, onToggleCompletion }: OverdueHabitsProps) {
  const getCurrentTime = () => new Date();
  
  const parseHabitTime = (timeStr: string) => {
    const now = new Date();
    let targetTime: Date;

    try {
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let hour24 = hours;
        
        if (period === 'PM' && hours !== 12) hour24 += 12;
        if (period === 'AM' && hours === 12) hour24 = 0;
        
        targetTime = new Date();
        targetTime.setHours(hour24, minutes || 0, 0, 0);
      } else {
        const [hours, minutes] = timeStr.split(':').map(Number);
        targetTime = new Date();
        targetTime.setHours(hours, minutes || 0, 0, 0);
      }
      return targetTime;
    } catch {
      return null;
    }
  };

  const getOverdueHabits = () => {
    const now = getCurrentTime();
    const overdueHabits: Array<{
      habit: any;
      routine: RoutineWithHabits;
      minutesOverdue: number;
    }> = [];

    routines.forEach(routine => {
      routine.habits.forEach(routineHabit => {
        const habit = routineHabit.habit;
        const isCompleted = routine.completions.some(
          c => c.habitId === habit.id && c.completed
        );

        if (!isCompleted && habit.time) {
          const habitTime = parseHabitTime(habit.time);
          if (habitTime) {
            const timeDiff = now.getTime() - habitTime.getTime();
            const minutesOverdue = Math.floor(timeDiff / (1000 * 60));
            
            if (minutesOverdue > 15) { // Consider overdue after 15 minutes
              overdueHabits.push({
                habit,
                routine,
                minutesOverdue
              });
            }
          }
        }
      });
    });

    return overdueHabits.sort((a, b) => b.minutesOverdue - a.minutesOverdue);
  };

  const overdueHabits = getOverdueHabits();

  if (overdueHabits.length === 0) return null;

  const formatOverdueTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="mb-4 rounded-2xl border border-pastel-indigo bg-pastel-indigo/50 p-4 dark:border-habit-indigo/30 dark:bg-pastel-indigo/40">
      <div className="mb-3 flex items-center space-x-2">
        <Clock className="text-habit-indigo" size={20} />
        <h3 className="font-display font-bold text-gray-900 dark:text-gray-50">Ready to Continue</h3>
      </div>

      <div className="space-y-2">
        {overdueHabits.slice(0, 3).map(({ habit, routine, minutesOverdue }) => (
          <div key={`${routine.id}-${habit.id}`} className="rounded-xl border border-border/60 bg-card p-3 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-50">{routine.title}</span>
                </div>
                <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                  {habit.action} • {habit.time}
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => onToggleCompletion(habit.id, routine.id)}
                className="flex-shrink-0 rounded-full bg-habit-purple text-white hover:bg-habit-indigo active:scale-95"
              >
                <Clock size={14} className="mr-1" />
                Complete
              </Button>
            </div>
          </div>
        ))}

        {overdueHabits.length > 3 && (
          <p className="text-center text-sm text-habit-indigo dark:text-indigo-300">
            +{overdueHabits.length - 3} more habits ready
          </p>
        )}
      </div>
    </div>
  );
}