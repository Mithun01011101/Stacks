import { useState, useEffect } from "react";
import { RefreshCw, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const motivationalQuotes = [
  {
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle"
  },
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    quote: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    quote: "Every master was once a disaster.",
    author: "T. Harv Eker"
  },
  {
    quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb"
  },
  {
    quote: "Your habits are either the best of servants or the worst of masters.",
    author: "Nathaniel Emmons"
  },
  {
    quote: "Small changes can make a big difference. You are the only one who can make it happen.",
    author: "Atomic Habits"
  },
  {
    quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear"
  },
  {
    quote: "Every action you take is a vote for the type of person you wish to become.",
    author: "James Clear"
  },
  {
    quote: "The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become.",
    author: "James Clear"
  },
  {
    quote: "Habits are the compound interest of self-improvement.",
    author: "James Clear"
  },
  {
    quote: "Progress happens when you push through the plateau of latent potential.",
    author: "Atomic Habits"
  },
  {
    quote: "The gap between good and great is sticking to the fundamentals when you don't feel like it.",
    author: "Habit Wisdom"
  },
  {
    quote: "Don't break the chain. Show up every day.",
    author: "Jerry Seinfeld"
  },
  {
    quote: "Motivation gets you started. Habit keeps you going.",
    author: "Jim Ryun"
  }
];

const habitTips = [
  "Start with just 2 minutes to build the habit loop",
  "Stack new habits after existing routines",
  "Focus on identity: 'I am someone who...'",
  "Make it obvious with visual cues",
  "Track your progress daily",
  "Celebrate small wins immediately",
  "Design your environment for success",
  "Use the 1% better rule daily"
];

export function MotivationTab() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    setCurrentQuote(Math.floor(Math.random() * motivationalQuotes.length));
    setCurrentTip(Math.floor(Math.random() * habitTips.length));
  }, []);

  const getNewQuote = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * motivationalQuotes.length);
    } while (newIndex === currentQuote);
    setCurrentQuote(newIndex);
  };

  const getNewTip = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * habitTips.length);
    } while (newIndex === currentTip);
    setCurrentTip(newIndex);
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Daily Inspiration</h1>
        <p className="text-gray-600">Fuel your motivation and stay inspired</p>
      </div>

      {/* Quote of the Day */}
      <div className="bg-gradient-to-br from-habit-purple to-habit-indigo rounded-xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <Heart className="text-white opacity-80" size={24} />
          <Button
            variant="ghost"
            size="sm"
            onClick={getNewQuote}
            className="text-white hover:bg-white/20 p-1"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
        
        <blockquote className="text-lg font-medium leading-relaxed mb-4">
          "{motivationalQuotes[currentQuote]?.quote}"
        </blockquote>
        
        <cite className="text-sm opacity-80">
          — {motivationalQuotes[currentQuote]?.author}
        </cite>
      </div>

      {/* Daily Habit Tip */}
      <div className="bg-gradient-to-br from-habit-emerald to-green-400 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <Sparkles className="text-white opacity-80" size={24} />
          <Button
            variant="ghost"
            size="sm"
            onClick={getNewTip}
            className="text-white hover:bg-white/20 p-1"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Today's Habit Tip</h3>
        <p className="text-base leading-relaxed">
          {habitTips[currentTip]}
        </p>
      </div>

      {/* Habit Building Principles */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">The 4 Laws of Behavior Change</h2>
        
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 border-l-4 border-habit-indigo">
            <h3 className="font-medium text-gray-900 mb-1">1. Make it Obvious</h3>
            <p className="text-sm text-gray-600">Design your environment to make good habits visible and bad habits invisible.</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border-l-4 border-habit-purple">
            <h3 className="font-medium text-gray-900 mb-1">2. Make it Attractive</h3>
            <p className="text-sm text-gray-600">Bundle habits you need to do with habits you want to do.</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border-l-4 border-habit-emerald">
            <h3 className="font-medium text-gray-900 mb-1">3. Make it Easy</h3>
            <p className="text-sm text-gray-600">Start with the smallest version of your habit that feels easy.</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border-l-4 border-habit-amber">
            <h3 className="font-medium text-gray-900 mb-1">4. Make it Satisfying</h3>
            <p className="text-sm text-gray-600">Celebrate immediately after completing your habit.</p>
          </div>
        </div>
      </div>

      {/* Quick Motivation Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Quick Motivation</h2>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-gradient-to-r from-pastel-purple to-purple-50 rounded-lg p-4 border border-habit-purple/20">
            <p className="text-sm font-medium text-gray-800">Remember: You're not starting from zero. You're building on yesterday's progress.</p>
          </div>
          
          <div className="bg-gradient-to-r from-pastel-emerald to-green-50 rounded-lg p-4 border border-habit-emerald/20">
            <p className="text-sm font-medium text-gray-800">Every habit you complete is evidence of the person you're becoming.</p>
          </div>
          
          <div className="bg-gradient-to-r from-pastel-amber to-yellow-50 rounded-lg p-4 border border-habit-amber/20">
            <p className="text-sm font-medium text-gray-800">Small habits compound into extraordinary results over time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}