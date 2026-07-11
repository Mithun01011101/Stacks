import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HabitChain } from "./habit-chain";
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

  const getProgressColor = () => {
    return routine.progress.completed > 0 ? 'text-habit-emerald' : 'text-gray-400 dark:text-gray-500';
  };

  const getNextIncompleteHabit = () => {
    return routine.habits.find(h => 
      !routine.completions.some(c => c.habitId === h.habitId && c.completed)
    );
  };

  const nextHabit = getNextIncompleteHabit();

  return (
    <Card className="hover:shadow-lg transition-all duration-300 animate-slide-in">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${getIconColorClasses(routine.color || 'habit-purple')} rounded-lg flex items-center justify-center`}>
              <i className={`${routine.icon} text-white`}></i>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-gray-50">{routine.title}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{routine.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
              <p className={`text-lg font-semibold ${getProgressColor()}`}>
                {routine.progress.completed}/{routine.progress.total} complete
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
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

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-habit-emerald rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {routine.progress.completed} completed
              </span>
            </div>
            {routine.progress.total - routine.progress.completed > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {routine.progress.total - routine.progress.completed} remaining
                </span>
              </div>
            )}
          </div>
          
          {routine.progress.completed === routine.progress.total ? (
            <div className="text-sm text-habit-emerald font-medium">
              🎉 All Complete!
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Hold any habit to complete it
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
