import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "./animated-number";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

export function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const colorClasses = {
    purple: "bg-pastel-purple text-habit-purple",
    emerald: "bg-pastel-emerald text-habit-emerald",
    amber: "bg-pastel-amber text-habit-amber",
    indigo: "bg-pastel-indigo text-habit-indigo"
  };

  // Animate the numeric part of values like 12, "85%", or "3 days"
  const renderValue = () => {
    if (typeof value === "number") {
      return <AnimatedNumber value={value} />;
    }
    const match = /^(\d+)(.*)$/.exec(value);
    if (match) {
      return <AnimatedNumber value={parseInt(match[1], 10)} suffix={match[2]} />;
    }
    return value;
  };

  return (
    <Card className="rounded-2xl border-border/60 shadow-soft transition-shadow duration-300 hover:shadow-lift">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              {renderValue()}
            </p>
          </div>
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon size={22} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
