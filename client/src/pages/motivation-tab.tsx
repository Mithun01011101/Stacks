import { useState, useEffect } from "react";
import { RefreshCw, Quote, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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

const fourLaws = [
  {
    number: 1,
    title: "Make it Obvious",
    body: "Design your environment to make good habits visible and bad habits invisible.",
    chip: "bg-gradient-to-br from-habit-indigo to-blue-500",
  },
  {
    number: 2,
    title: "Make it Attractive",
    body: "Bundle habits you need to do with habits you want to do.",
    chip: "bg-gradient-to-br from-habit-purple to-indigo-500",
  },
  {
    number: 3,
    title: "Make it Easy",
    body: "Start with the smallest version of your habit that feels easy.",
    chip: "bg-gradient-to-br from-habit-emerald to-green-500",
  },
  {
    number: 4,
    title: "Make it Satisfying",
    body: "Celebrate immediately after completing your habit.",
    chip: "bg-gradient-to-br from-habit-amber to-orange-400",
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function MotivationTab() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [quoteSpin, setQuoteSpin] = useState(0);
  const [tipSpin, setTipSpin] = useState(0);

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
    setQuoteSpin((s) => s + 360);
  };

  const getNewTip = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * habitTips.length);
    } while (newIndex === currentTip);
    setCurrentTip(newIndex);
    setTipSpin((s) => s + 360);
  };

  return (
    <motion.div
      className="p-4 pb-32 space-y-6"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
    >
      {/* Header */}
      <motion.div variants={sectionVariants}>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-1">
          Daily Inspiration
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Fuel your motivation and stay inspired</p>
      </motion.div>

      {/* Quote of the Day */}
      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-habit-purple to-habit-indigo p-6 text-white shadow-glow-purple"
      >
        <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
        <div className="relative mb-4 flex items-start justify-between">
          <Quote className="text-white/70" size={26} fill="currentColor" />
          <Button
            variant="ghost"
            size="sm"
            onClick={getNewQuote}
            aria-label="New quote"
            className="h-11 w-11 rounded-full p-0 text-white hover:bg-white/20 hover:text-white"
          >
            <motion.span
              animate={{ rotate: quoteSpin }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="inline-flex"
            >
              <RefreshCw size={16} />
            </motion.span>
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative"
          >
            <blockquote className="mb-4 font-display text-lg font-semibold leading-relaxed">
              "{motivationalQuotes[currentQuote]?.quote}"
            </blockquote>
            <cite className="text-sm not-italic text-white/80">
              — {motivationalQuotes[currentQuote]?.author}
            </cite>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Daily Habit Tip */}
      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-habit-emerald to-green-400 p-6 text-white"
      >
        <div className="pointer-events-none absolute -left-8 -bottom-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative mb-4 flex items-start justify-between">
          <Sparkles className="text-white/80" size={24} />
          <Button
            variant="ghost"
            size="sm"
            onClick={getNewTip}
            aria-label="New tip"
            className="h-11 w-11 rounded-full p-0 text-white hover:bg-white/20 hover:text-white"
          >
            <motion.span
              animate={{ rotate: tipSpin }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="inline-flex"
            >
              <RefreshCw size={16} />
            </motion.span>
          </Button>
        </div>

        <h3 className="font-display relative mb-2 text-lg font-bold">Today's Habit Tip</h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentTip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative text-base leading-relaxed"
          >
            {habitTips[currentTip]}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Habit Building Principles */}
      <motion.div variants={sectionVariants} className="space-y-4">
        <h2 className="font-display text-lg font-bold tracking-tight text-gray-900 dark:text-gray-50">
          The 4 Laws of Behavior Change
        </h2>

        <div className="space-y-3">
          {fourLaws.map((law) => (
            <div
              key={law.number}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft"
            >
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${law.chip}`}
              >
                {law.number}
              </div>
              <div>
                <h3 className="mb-0.5 font-semibold text-gray-900 dark:text-gray-50">{law.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{law.body}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Motivation Cards */}
      <motion.div variants={sectionVariants} className="space-y-4">
        <h2 className="font-display text-lg font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Quick Motivation
        </h2>

        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-2xl border border-habit-purple/20 bg-gradient-to-r from-pastel-purple to-purple-50 p-4 dark:to-purple-950">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Remember: You're not starting from zero. You're building on yesterday's progress.
            </p>
          </div>

          <div className="rounded-2xl border border-habit-emerald/20 bg-gradient-to-r from-pastel-emerald to-green-50 p-4 dark:to-green-950">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Every habit you complete is evidence of the person you're becoming.
            </p>
          </div>

          <div className="rounded-2xl border border-habit-amber/20 bg-gradient-to-r from-pastel-amber to-yellow-50 p-4 dark:to-yellow-950">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Small habits compound into extraordinary results over time.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
