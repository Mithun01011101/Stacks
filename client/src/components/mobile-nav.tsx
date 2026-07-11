import { Home, BarChart3, Heart, MessageCircle } from "lucide-react";

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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive 
                  ? "text-habit-purple bg-pastel-purple" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}