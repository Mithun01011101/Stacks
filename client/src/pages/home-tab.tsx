import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import { RoutineCard } from "@/components/routine-card";
import { NotificationSetup } from "@/components/notification-setup";
import { OverdueHabits } from "@/components/overdue-habits";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export function HomeTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addHabitDialog, setAddHabitDialog] = useState<{
    isOpen: boolean;
    routineId: number;
    routineTitle: string;
    lastHabitAction: string;
  }>({
    isOpen: false,
    routineId: 0,
    routineTitle: "",
    lastHabitAction: ""
  });

  const { data: routines = [], isLoading: routinesLoading } = useQuery({
    queryKey: ["/api/routines"],
    queryFn: () => api.getRoutines(),
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: (data: { habitId: number; routineId: number }) => {
      const today = new Date().toISOString().split('T')[0];
      return api.toggleCompletion({
        habitId: data.habitId,
        routineId: data.routineId,
        date: today,
        completed: false
      });
    },
    onSuccess: (completion) => {
      const message = completion.completed 
        ? "Great job! Habit completed" 
        : "Habit marked as incomplete";
      
      toast({
        title: completion.completed ? "Success!" : "Updated",
        description: message,
        duration: 2000,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/routines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update habit completion.",
        variant: "destructive",
      });
    },
  });

  const handleToggleCompletion = (habitId: number, routineId: number) => {
    toggleCompletionMutation.mutate({ habitId, routineId });
  };

  const deleteRoutineMutation = useMutation({
    mutationFn: (routineId: number) => api.deleteRoutine(routineId),
    onSuccess: () => {
      toast({
        title: "Stack deleted",
        description: "Your habit stack has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/routines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete habit stack. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteRoutine = (routineId: number) => {
    deleteRoutineMutation.mutate(routineId);
  };

  const deleteHabitMutation = useMutation({
    mutationFn: ({ habitId, routineId }: { habitId: number; routineId: number }) => 
      api.deleteHabit(habitId, routineId),
    onSuccess: () => {
      toast({
        title: "Habit removed",
        description: "The habit has been removed from your stack.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/routines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteHabit = (habitId: number, routineId: number) => {
    deleteHabitMutation.mutate({ habitId, routineId });
  };

  const handleAddHabit = (routineId: number) => {
    const routine = routines.find(r => r.id === routineId);
    if (routine && routine.habits.length > 0) {
      const lastHabit = routine.habits[routine.habits.length - 1];
      setAddHabitDialog({
        isOpen: true,
        routineId,
        routineTitle: routine.title,
        lastHabitAction: lastHabit.habit.action
      });
    }
  };

  if (routinesLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-4">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">Welcome back!</h1>
        <p className="text-gray-600 dark:text-gray-400">You're building momentum! Keep stacking those habits.</p>
      </div>

      {/* Notification Setup */}
      <div className="mb-4">
        <NotificationSetup />
      </div>

      {/* Overdue Habits */}
      <OverdueHabits 
        routines={routines} 
        onToggleCompletion={handleToggleCompletion} 
      />

      {/* Today's Progress Summary */}
      <div className="bg-gradient-to-r from-habit-purple to-habit-indigo rounded-xl p-4 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Today's Progress</h3>
            <p className="text-sm opacity-90">
              {routines.reduce((acc, r) => acc + r.progress.completed, 0)} of {routines.reduce((acc, r) => acc + r.progress.total, 0)} habits completed
            </p>
          </div>
          <CheckCircle size={24} />
        </div>
      </div>

      {/* Habit Stacks */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Your Habit Stacks</h2>
        
        {routines.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="text-gray-400 dark:text-gray-500" size={24} />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-gray-50 mb-1">No habit stacks yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Tap "Create" to build your first habit stack!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onToggleCompletion={(habitId) => handleToggleCompletion(habitId, routine.id)}
                onStartRoutine={() => {
                  const firstHabit = routine.habits[0];
                  if (firstHabit) {
                    handleToggleCompletion(firstHabit.habitId, routine.id);
                  }
                }}
                onDeleteRoutine={handleDeleteRoutine}
                onDeleteHabit={handleDeleteHabit}
                onAddHabit={handleAddHabit}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Add Habit Dialog */}
      <AddHabitDialog
        routineId={addHabitDialog.routineId}
        routineTitle={addHabitDialog.routineTitle}
        lastHabitAction={addHabitDialog.lastHabitAction}
        isOpen={addHabitDialog.isOpen}
        onClose={() => setAddHabitDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}