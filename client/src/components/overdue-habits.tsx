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
    <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4 mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <Clock className="text-blue-500 dark:text-blue-400" size={20} />
        <h3 className="font-semibold text-blue-800 dark:text-blue-200">Ready to Continue</h3>
      </div>
      
      <div className="space-y-2">
        {overdueHabits.slice(0, 3).map(({ habit, routine, minutesOverdue }) => (
          <div key={`${routine.id}-${habit.id}`} className="bg-white dark:bg-card rounded-lg p-3 border border-blue-100 dark:border-blue-900">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-50">{routine.title}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {habit.action} • {habit.time}
                </p>
              </div>
              
              <Button
                size="sm"
                onClick={() => onToggleCompletion(habit.id, routine.id)}
                className="bg-habit-purple hover:bg-habit-indigo text-white"
              >
                <Clock size={14} className="mr-1" />
                Complete
              </Button>
            </div>
          </div>
        ))}
        
        {overdueHabits.length > 3 && (
          <p className="text-sm text-blue-600 dark:text-blue-300 text-center">
            +{overdueHabits.length - 3} more habits ready
          </p>
        )}
      </div>
    </div>
  );
}