import { useQuery, useMutation } from "@tanstack/react-query";
import { Layers, TrendingUp, Flame, CheckCircle, Target, Calendar, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/stats-card";
import { ProgressRing } from "@/components/progress-ring";
import { AnimatedNumber } from "@/components/animated-number";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

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
      <div className="p-4 pb-32">
        <div className="space-y-6">
          <div className="h-8 w-1/2 rounded-xl animate-shimmer"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl animate-shimmer"></div>
            ))}
          </div>
          <div className="h-28 rounded-3xl animate-shimmer"></div>
        </div>
      </div>
    );
  }

  const totalProgress = routines.reduce((acc, r) => acc + r.progress.completed, 0);
  const totalHabits = routines.reduce((acc, r) => acc + r.progress.total, 0);
  const overallProgress = totalHabits > 0 ? Math.round((totalProgress / totalHabits) * 100) : 0;

  return (
    <motion.div
      className="p-4 pb-32 space-y-6"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
    >
      {/* Header */}
      <motion.div variants={sectionVariants}>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-1">
          Your Progress
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Track your habit building journey</p>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div variants={sectionVariants} className="grid grid-cols-2 gap-4">
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
      </motion.div>

      {/* Overall Progress ring card */}
      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden rounded-3xl bg-card border border-border/60 p-5 shadow-soft"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Target className="text-habit-purple" size={18} />
              <h3 className="font-display font-bold text-gray-900 dark:text-gray-50">Overall Progress</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <AnimatedNumber value={totalProgress} /> of {totalHabits} habits completed today
            </p>
          </div>
          <ProgressRing
            percentage={overallProgress}
            size={72}
            strokeWidth={7}
            color="hsl(var(--habit-purple))"
            trackColor="hsl(var(--habit-purple) / 0.14)"
          >
            <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-50">
              {overallProgress}%
            </span>
          </ProgressRing>
        </div>
      </motion.div>

      {/* Secondary stats */}
      <motion.div variants={sectionVariants} className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-gray-50">Completed</h3>
            <CheckCircle className="text-habit-emerald" size={20} />
          </div>
          <p className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            <AnimatedNumber value={stats?.totalCompleted || 0} />
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">All-time habits</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-gray-50">Best Streak</h3>
            <Calendar className="text-habit-amber" size={20} />
          </div>
          <p className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            <AnimatedNumber value={stats?.longestStreak || 0} />
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Days in a row</p>
        </div>
      </motion.div>

      {/* Data Export */}
      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-habit-indigo to-habit-purple p-5 text-white shadow-glow-purple"
      >
        <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
        <div className="relative flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display mb-1 font-bold">Backup Your Data</h3>
            <p className="text-sm text-white/85">Export all your habit stacks and progress</p>
          </div>
          <Button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            variant="ghost"
            className="rounded-full border border-white/40 bg-white/10 text-white hover:bg-white/25 hover:text-white active:scale-95"
          >
            {exportMutation.isPending ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Download size={16} className="mr-2" />
            )}
            {exportMutation.isPending ? "Exporting..." : "Export"}
          </Button>
        </div>
      </motion.div>

      {/* Routine Breakdown */}
      <motion.div variants={sectionVariants} className="space-y-4">
        <h2 className="font-display text-lg font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Stack Performance
        </h2>

        {routines.map((routine) => (
          <div
            key={routine.id}
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex min-w-0 items-center space-x-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-habit-purple to-habit-indigo">
                  <Layers className="text-white" size={16} />
                </div>
                <h3 className="truncate font-medium text-gray-900 dark:text-gray-50">{routine.title}</h3>
              </div>
              <span className="flex-shrink-0 text-sm font-medium tabular-nums text-gray-600 dark:text-gray-400">
                {routine.progress.completed}/{routine.progress.total}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-habit-emerald to-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${routine.progress.percentage}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="text-sm font-medium tabular-nums text-gray-700 dark:text-gray-300">
                {routine.progress.percentage}%
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
