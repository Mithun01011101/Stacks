import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { RoutineCard } from "@/components/routine-card";
import { NotificationSetup } from "@/components/notification-setup";
import { OverdueHabits } from "@/components/overdue-habits";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import { ProgressRing } from "@/components/progress-ring";
import { AnimatedNumber } from "@/components/animated-number";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

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

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: () => api.getStats(),
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
        <div className="space-y-4">
          <div className="h-8 w-1/2 rounded-xl animate-shimmer"></div>
          <div className="h-32 rounded-3xl animate-shimmer"></div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-48 rounded-3xl animate-shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  const completedToday = routines.reduce((acc, r) => acc + r.progress.completed, 0);
  const totalToday = routines.reduce((acc, r) => acc + r.progress.total, 0);
  const todayPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const currentStreak = stats?.currentStreak ?? 0;
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      className="p-4 pb-32 space-y-4"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
    >
      {/* Welcome */}
      <motion.div variants={sectionVariants} className="mb-6">
        <p className="mb-1 text-sm font-medium text-muted-foreground">{todayLabel}</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
          {getGreeting()}!
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          You're building momentum — keep stacking those habits.
        </p>
      </motion.div>

      {/* Today's Progress hero */}
      <motion.div
        variants={sectionVariants}
        className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-habit-purple via-habit-purple to-habit-indigo p-5 text-white shadow-glow-purple"
      >
        {/* decorative highlights */}
        <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 right-16 h-28 w-28 rounded-full bg-white/5" />

        <div className="relative flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold">Today's Progress</h3>
            <p className="mt-0.5 text-sm text-white/85">
              <AnimatedNumber value={completedToday} /> of {totalToday} habits completed
            </p>
            {currentStreak > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
                <Flame size={14} className="text-habit-amber" fill="currentColor" />
                <AnimatedNumber value={currentStreak} suffix={` day streak`} />
              </div>
            )}
          </div>
          <ProgressRing
            percentage={todayPercentage}
            size={76}
            strokeWidth={7}
            color="white"
            trackColor="rgba(255,255,255,0.25)"
          >
            <span className="text-sm font-bold tabular-nums">{todayPercentage}%</span>
          </ProgressRing>
        </div>
      </motion.div>

      {/* Notification Setup */}
      <motion.div variants={sectionVariants} className="mb-4">
        <NotificationSetup />
      </motion.div>

      {/* Overdue Habits */}
      <motion.div variants={sectionVariants}>
        <OverdueHabits
          routines={routines}
          onToggleCompletion={handleToggleCompletion}
        />
      </motion.div>

      {/* Habit Stacks */}
      <motion.div variants={sectionVariants} className="space-y-4">
        <h2 className="font-display text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Your Habit Stacks
        </h2>

        {routines.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-habit-purple to-habit-indigo shadow-glow-purple">
              <Sparkles className="text-white" size={26} />
            </div>
            <h3 className="font-display mb-1 font-bold text-gray-900 dark:text-gray-50">
              No habit stacks yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tap "Create" above to build your first habit stack!
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
      </motion.div>

      {/* Add Habit Dialog */}
      <AddHabitDialog
        routineId={addHabitDialog.routineId}
        routineTitle={addHabitDialog.routineTitle}
        lastHabitAction={addHabitDialog.lastHabitAction}
        isOpen={addHabitDialog.isOpen}
        onClose={() => setAddHabitDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </motion.div>
  );
}
