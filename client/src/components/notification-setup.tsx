import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";

export function NotificationSetup() {
  const { permission, requestPermission, scheduleHabitReminders } = useNotifications();
  const { toast } = useToast();

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      scheduleHabitReminders();
      toast({
        title: "Notifications Enabled",
        description: "You'll receive reminders for your habits at the right time.",
      });
    } else {
      toast({
        title: "Permission Denied",
        description: "Enable notifications in your browser settings to get habit reminders.",
        variant: "destructive",
      });
    }
  };

  if (permission.granted) {
    return (
      <div className="bg-gradient-to-r from-habit-emerald to-green-400 rounded-lg p-4 text-white">
        <div className="flex items-center space-x-3">
          <Bell size={20} />
          <div>
            <h3 className="font-medium">Notifications Active</h3>
            <p className="text-sm opacity-90">You'll get reminders when it's time for your habits</p>
          </div>
        </div>
      </div>
    );
  }

  if (permission.denied) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <BellOff size={20} className="text-gray-500 dark:text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-50">Notifications Blocked</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Enable in your browser settings to get habit reminders</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-habit-amber to-orange-400 rounded-lg p-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell size={20} />
          <div>
            <h3 className="font-medium">Get Habit Reminders</h3>
            <p className="text-sm opacity-90">Never miss a habit with mobile notifications</p>
          </div>
        </div>
        <Button
          onClick={handleEnableNotifications}
          variant="ghost"
          className="text-white border-white hover:bg-white/20"
        >
          Enable
        </Button>
      </div>
    </div>
  );
}