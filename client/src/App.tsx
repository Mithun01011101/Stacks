import { useRef, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Layers, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { HomeTab } from "@/pages/home-tab";
import { StatsTab } from "@/pages/stats-tab";
import { AiChatTab } from "@/pages/ai-chat-tab";
import { MotivationTab } from "@/pages/motivation-tab";
import { HabitBuilder } from "@/pages/habit-builder";

const TAB_ORDER = ["home", "stats", "ai-chat", "motivation"];

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const previousTabIndex = useRef(0);

  const handleTabChange = (tab: string) => {
    previousTabIndex.current = TAB_ORDER.indexOf(activeTab);
    setActiveTab(tab);
  };

  // Slide direction: forward tabs enter from the right, backward from the left
  const direction =
    TAB_ORDER.indexOf(activeTab) >= previousTabIndex.current ? 1 : -1;

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
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            {/* Mobile App Header */}
            <header className="glass sticky top-0 z-40 border-b border-border/60">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-habit-purple to-habit-indigo shadow-glow-purple">
                      <Layers className="text-white" size={16} strokeWidth={2.5} />
                    </div>
                    <h1 className="font-display text-lg font-extrabold tracking-tight text-gradient-brand">
                      Stacks
                    </h1>
                  </div>

                  <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="rounded-full bg-gradient-to-r from-habit-purple to-habit-indigo px-4 font-semibold text-white shadow-glow-purple transition-all duration-200 hover:brightness-110 active:scale-95"
                        >
                          <Plus className="mr-1.5" size={16} />
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

            {/* Tab Content — directional slide + fade between tabs.
                popLayout mounts the new tab instantly; the old one exits on top,
                so navigation never waits on an animation to finish. */}
            <main className="relative min-h-screen overflow-x-clip">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 24 * direction }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 * direction }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  {renderActiveTab()}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Mobile Navigation */}
            <MobileNav activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
          <Toaster />
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
