import { Home, BarChart3, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "ai-chat", label: "AI Coach", icon: MessageCircle },
    { id: "motivation", label: "Inspire", icon: Heart },
  ];

  return (
    <nav
      className="fixed inset-x-3 z-50 mx-auto max-w-md"
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      aria-label="Main navigation"
    >
      <div className="glass grid h-16 grid-cols-4 overflow-hidden rounded-2xl border border-border/60 shadow-lift">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex cursor-pointer flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                isActive
                  ? "text-habit-purple"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-x-1.5 inset-y-1.5 rounded-xl bg-pastel-purple"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <motion.span
                className="relative"
                animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
              </motion.span>
              <span className="relative text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
