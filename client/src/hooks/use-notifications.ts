import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });

  const { data: routines = [] } = useQuery({
    queryKey: ["/api/routines"],
    queryFn: () => api.getRoutines(),
  });

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      return;
    }

    // Update permission state
    const updatePermission = () => {
      setPermission({
        granted: Notification.permission === 'granted',
        denied: Notification.permission === 'denied',
        default: Notification.permission === 'default'
      });
    };

    updatePermission();
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission({
        granted: result === 'granted',
        denied: result === 'denied',
        default: result === 'default'
      });
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const scheduleHabitReminders = () => {
    if (!permission.granted) return;

    routines.forEach(routine => {
      routine.habits.forEach(routineHabit => {
        const habit = routineHabit.habit;
        if (habit.time) {
          scheduleNotification(habit, routine.title);
        }
      });
    });
  };

  const scheduleNotification = (habit: any, routineTitle: string) => {
    if (!permission.granted) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Parse habit time (e.g., "7:00 AM", "14:30")
    const timeStr = habit.time;
    let targetTime: Date;

    try {
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        // 12-hour format
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let hour24 = hours;
        
        if (period === 'PM' && hours !== 12) hour24 += 12;
        if (period === 'AM' && hours === 12) hour24 = 0;
        
        targetTime = new Date();
        targetTime.setHours(hour24, minutes, 0, 0);
      } else {
        // 24-hour format
        const [hours, minutes] = timeStr.split(':').map(Number);
        targetTime = new Date();
        targetTime.setHours(hours, minutes, 0, 0);
      }

      // If time has passed today, schedule for tomorrow
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      const timeUntilReminder = targetTime.getTime() - now.getTime();

      // Schedule the notification
      setTimeout(() => {
        showNotification(habit, routineTitle);
      }, timeUntilReminder);

    } catch (error) {
      console.error('Error parsing habit time:', error);
    }
  };

  const showNotification = (habit: any, routineTitle: string) => {
    if (!permission.granted) return;

    const notification = new Notification(`Time for ${routineTitle}!`, {
      body: `It's time to ${habit.action}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `habit-${habit.id}`,
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  };

  const showDailyReminder = () => {
    if (!permission.granted) return;

    const incompleteHabits = routines.reduce((count, routine) => {
      return count + (routine.progress.total - routine.progress.completed);
    }, 0);

    if (incompleteHabits > 0) {
      new Notification('HabitFlow Reminder', {
        body: `You have ${incompleteHabits} habits left to complete today!`,
        icon: '/favicon.ico',
        tag: 'daily-reminder'
      });
    }
  };

  return {
    permission,
    requestPermission,
    scheduleHabitReminders,
    showDailyReminder
  };
}