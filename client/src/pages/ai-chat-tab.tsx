import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Lightbulb, Target, Zap, MessageCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5" aria-label="AI is thinking">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-habit-purple/60"
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function AiChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: (userMessage: string) => {
      const newMessages = [...messages, { role: 'user' as const, content: userMessage, timestamp: new Date().toISOString() }];
      return api.chat(newMessages.map(m => ({ role: m.role, content: m.content })));
    },
    onSuccess: (data, userMessage) => {
      const userMsg: ChatMessage = { role: 'user', content: userMessage, timestamp: new Date().toISOString() };
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.response, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, userMsg, assistantMsg]);
      setInput("");
    },
    onError: (error: any) => {
      // Don't show error toast for quota issues since we have fallback responses
      if (!error.message?.includes("quota") && !error.message?.includes("high demand")) {
        toast({
          title: "Chat Error",
          description: error.message || "Failed to get AI response",
          variant: "destructive"
        });
      }
    }
  });

  const suggestionsMutation = useMutation({
    mutationFn: (context: string) => api.getHabitSuggestions(context),
    onSuccess: (data) => {
      const suggestionsText = `Here are some personalized habit suggestions:\n\n**Habits to try:**\n${data.suggestions.map(s => `• ${s}`).join('\n')}\n\n**Tips:**\n${data.tips.map(t => `• ${t}`).join('\n')}`;

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: suggestionsText,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);
    },
    onError: (error: any) => {
      toast({
        title: "Suggestions Error",
        description: error.message || "Failed to get habit suggestions",
        variant: "destructive"
      });
    }
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    chatMutation.mutate(input.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    {
      icon: Target,
      label: "Morning Routine",
      prompt: "Help me build a productive morning routine that I can stick to",
      color: "bg-gradient-to-br from-habit-purple to-indigo-500"
    },
    {
      icon: Zap,
      label: "Break Bad Habits",
      prompt: "I want to break my bad habit of checking social media too much. What strategies can help?",
      color: "bg-gradient-to-br from-habit-indigo to-blue-500"
    },
    {
      icon: Lightbulb,
      label: "Motivation Tips",
      prompt: "I'm struggling to stay motivated with my habits. What can I do to maintain consistency?",
      color: "bg-gradient-to-br from-habit-emerald to-green-500"
    }
  ];

  return (
    <div className="flex h-[calc(100dvh-57px)] flex-col">
      {/* Header */}
      <div className="glass border-b border-border/60 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-habit-purple to-habit-indigo shadow-glow-purple">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-gray-900 dark:text-gray-50">
              AI Habit Coach
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized advice and motivation</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="py-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-habit-purple to-habit-indigo shadow-glow-purple">
              <MessageCircle className="h-9 w-9 text-white" />
            </div>
            <h3 className="font-display mb-2 text-lg font-bold text-gray-900 dark:text-gray-50">
              Start Your Habit Journey
            </h3>
            <p className="mx-auto mb-6 max-w-md text-gray-600 dark:text-gray-400">
              Ask me anything about building habits, staying motivated, or overcoming challenges.
            </p>

            {/* Quick Prompts */}
            <div className="mx-auto grid max-w-lg gap-3">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Try asking about:</p>
              {quickPrompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.06, duration: 0.3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="cursor-pointer rounded-2xl border-border/60 shadow-soft transition-shadow duration-200 hover:shadow-lift"
                    onClick={() => setInput(prompt.prompt)}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${prompt.color}`}>
                        <prompt.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{prompt.label}</p>
                        <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{prompt.prompt}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => suggestionsMutation.mutate("I want to build better daily habits")}
                disabled={suggestionsMutation.isPending}
                className="mt-2 rounded-full"
              >
                {suggestionsMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lightbulb className="mr-2 h-4 w-4" />
                )}
                Get Quick Suggestions
              </Button>
            </div>
          </motion.div>
        )}

        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 shadow-soft ${
              message.role === 'user'
                ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-habit-purple to-habit-indigo text-white'
                : 'rounded-2xl rounded-bl-md border border-border/60 bg-card text-gray-900 dark:text-gray-100'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              <div className={`mt-2 text-xs ${
                message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}

        {chatMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-border/60 bg-card p-4 shadow-soft">
              <TypingIndicator />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input — bottom padding clears the floating nav */}
      <div
        className="glass border-t border-border/60 p-4"
        style={{ paddingBottom: "calc(5.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about habits, motivation, or building better routines..."
              className="min-h-[60px] max-h-32 resize-none rounded-2xl border-border bg-card focus:border-habit-purple"
              disabled={chatMutation.isPending}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            aria-label="Send message"
            className="h-11 w-11 self-end rounded-full bg-gradient-to-br from-habit-purple to-habit-indigo p-0 text-white shadow-glow-purple transition-all hover:brightness-110 active:scale-95"
          >
            {chatMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessages([])}
              className="rounded-full text-xs"
            >
              Clear Chat
            </Button>
          )}

          <Badge variant="secondary" className="rounded-full text-xs">
            Powered by GPT-4o • Expert Habit Advice
          </Badge>
        </div>
      </div>
    </div>
  );
}
