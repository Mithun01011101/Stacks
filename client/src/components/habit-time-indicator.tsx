import { Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HabitTimeIndicatorProps {
  time: string;
  isCompleted: boolean;
}

export function HabitTimeIndicator({ time, isCompleted }: HabitTimeIndicatorProps) {
  if (!time) return null;

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

  const getTimeStatus = () => {
    const now = getCurrentTime();
    const habitTime = parseHabitTime(time);
    
    if (!habitTime) return 'scheduled';
    
    const timeDiff = habitTime.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    
    if (isCompleted) return 'completed';
    if (minutesDiff <= -30) return 'overdue'; // 30 minutes past
    if (minutesDiff <= 0) return 'due-now';
    if (minutesDiff <= 30) return 'due-soon'; // Within 30 minutes
    return 'scheduled';
  };

  const status = getTimeStatus();
  
  const statusConfig = {
    completed: {
      color: 'bg-habit-emerald text-white',
      icon: Clock,
      text: time
    },
    overdue: {
      color: 'bg-habit-indigo text-white',
      icon: Clock,
      text: time
    },
    'due-now': {
      color: 'bg-habit-amber text-white',
      icon: Clock,
      text: time
    },
    'due-soon': {
      color: 'bg-habit-indigo text-white',
      icon: Clock,
      text: time
    },
    scheduled: {
      color: 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      icon: Clock,
      text: time
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center space-x-1 px-2 py-1`}>
      <Icon size={12} />
      <span className="text-xs font-medium">{config.text}</span>
    </Badge>
  );
}