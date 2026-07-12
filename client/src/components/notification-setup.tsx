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
      <div className="rounded-2xl bg-gradient-to-r from-habit-emerald to-green-400 p-4 text-white shadow-soft">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="font-semibold">Notifications Active</h3>
            <p className="text-sm text-white/85">You'll get reminders when it's time for your habits</p>
          </div>
        </div>
      </div>
    );
  }

  if (permission.denied) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-muted">
            <BellOff size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-50">Notifications Blocked</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Enable in your browser settings to get habit reminders</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-habit-amber to-orange-400 p-4 text-white shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="font-semibold">Get Habit Reminders</h3>
            <p className="text-sm text-white/85">Never miss a habit with mobile notifications</p>
          </div>
        </div>
        <Button
          onClick={handleEnableNotifications}
          variant="ghost"
          className="rounded-full border border-white/40 bg-white/10 text-white hover:bg-white/25 hover:text-white active:scale-95"
        >
          Enable
        </Button>
      </div>
    </div>
  );
}