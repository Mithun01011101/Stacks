import { useQuery, useMutation } from "@tanstack/react-query";
import { Layers, TrendingUp, Flame, CheckCircle, Target, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/stats-card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export function StatsTab() {
  const { toast } = useToast();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: () => api.getStats(),
  });

  const { data: routines = [] } = useQuery({
    queryKey: ["/api/routines"],
    queryFn: () => api.getRoutines(),
  });

  const exportMutation = useMutation({
    mutationFn: () => api.exportData(),
    onSuccess: () => {
      toast({
        title: "Data Exported",
        description: "Your habit data has been downloaded as a backup file.",
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalProgress = routines.reduce((acc, r) => acc + r.progress.completed, 0);
  const totalHabits = routines.reduce((acc, r) => acc + r.progress.total, 0);
  const overallProgress = totalHabits > 0 ? Math.round((totalProgress / totalHabits) * 100) : 0;

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Progress</h1>
        <p className="text-gray-600">Track your habit building journey</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
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
          title="Current Streak"
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

      {/* Data Export Section */}
      <div className="bg-gradient-to-r from-habit-indigo to-habit-purple rounded-xl p-4 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Backup Your Data</h3>
            <p className="text-sm opacity-90">Export all your habit stacks and progress</p>
          </div>
          <Button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            variant="ghost"
            className="text-white border-white hover:bg-white/20"
          >
            <Download size={16} className="mr-2" />
            {exportMutation.isPending ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Detailed Analytics</h2>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Overall Progress</h3>
            <Target className="text-habit-purple" size={20} />
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-habit-purple to-habit-indigo h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">{overallProgress}%</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {totalProgress} of {totalHabits} total habits completed today
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Completed</h3>
              <CheckCircle className="text-habit-emerald" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalCompleted || 0}</p>
            <p className="text-xs text-gray-500">All-time habits</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Best Streak</h3>
              <Calendar className="text-habit-amber" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.longestStreak || 0}</p>
            <p className="text-xs text-gray-500">Days in a row</p>
          </div>
        </div>
      </div>

      {/* Routine Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Stack Performance</h2>
        
        {routines.map((routine) => (
          <div key={routine.id} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 bg-gradient-to-br from-habit-purple to-habit-indigo rounded-lg flex items-center justify-center`}>
                  <i className={`${routine.icon} text-white text-sm`}></i>
                </div>
                <h3 className="font-medium text-gray-900">{routine.title}</h3>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {routine.progress.completed}/{routine.progress.total}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-habit-emerald to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${routine.progress.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">{routine.progress.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}