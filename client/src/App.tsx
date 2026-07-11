import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { HomeTab } from "@/pages/home-tab";
import { StatsTab } from "@/pages/stats-tab";
import { AiChatTab } from "@/pages/ai-chat-tab";
import { MotivationTab } from "@/pages/motivation-tab";
import { HabitBuilder } from "@/pages/habit-builder";

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab />;
      case "stats":
        return <StatsTab />;
      case "ai-chat":
        return <AiChatTab />;
      case "motivation":
        return <MotivationTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-background">
          {/* Mobile App Header */}
          <header className="bg-white dark:bg-card shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-habit-purple to-habit-indigo rounded-lg"></div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-50">HabitFlow</h1>
                </div>
                
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-habit-purple to-habit-indigo text-white font-medium hover:shadow-lg transition-all duration-200"
                      >
                        <Plus className="mr-2" size={16} />
                        Create
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
                      <HabitBuilder onClose={() => setIsCreateDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </header>
          
          {/* Tab Content */}
          <main className="min-h-screen">
            {renderActiveTab()}
          </main>
          
          {/* Mobile Navigation */}
          <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
