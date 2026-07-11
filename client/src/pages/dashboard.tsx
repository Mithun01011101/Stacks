import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Layers, TrendingUp, Flame, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { StatsCard } from "@/components/stats-card";
import { RoutineCard } from "@/components/routine-card";
import { HabitBuilder } from "./habit-builder";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

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
        completed: false // Will be toggled on server
      });
    },
    onSuccess: (completion) => {
      const message = completion.completed 
        ? "Great job! Habit completed 🎉" 
        : "Habit marked as incomplete";

      toast({
        title: completion.completed ? "Success!" : "Updated",
        description: message,
        duration: 3000,
      });

      // Invalidate and refetch
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

  if (routinesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 🌟</h2>
        <p className="text-gray-600 text-lg">You're building momentum! Keep stacking those habits.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Active Stacks"
          value={stats?.activeRoutines || 0}
          icon={Layers}
          color="purple"
        />
        <StatsCard
          title="Today's Progress"
          value={`${stats?.todayProgress || 0}%`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatsCard
          title="Streak"
          value={`${stats?.currentStreak || 0} days`}
          icon={Flame}
          color="amber"
        />
        <StatsCard
          title="Total Habits"
          value={stats?.totalHabits || 0}
          icon={CheckCircle}
          color="indigo"
        />
      </div>

      {/* Habit Stacks */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">Your Habit Stacks</h3>
          <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost"
                className="text-habit-purple hover:text-habit-indigo font-medium flex items-center space-x-2 transition-colors"
              >
                <Plus size={16} />
                <span>Create New Stack</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <HabitBuilder onClose={() => setIsBuilderOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {routines.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No habit stacks yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first habit stack to start building momentum!
            </p>
            <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-habit-purple to-habit-indigo text-white">
                  <Plus className="mr-2" size={16} />
                  Create Your First Stack
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <HabitBuilder onClose={() => setIsBuilderOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-6">
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
              />
            ))}
          </div>
        )}
      </div>

      {/* Motivational Footer */}
      {stats && (
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-habit-purple to-habit-indigo rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">You're on fire! 🔥</h3>
            <p className="text-lg opacity-90 mb-4">
              Small habits lead to remarkable results. Keep building those stacks!
            </p>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.totalCompleted}</p>
                <p className="text-sm opacity-75">Habits Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.longestStreak}</p>
                <p className="text-sm opacity-75">Longest Streak</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.activeRoutines}</p>
                <p className="text-sm opacity-75">Stacks Created</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}