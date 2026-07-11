import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Lightbulb, Target, Zap, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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
      color: "bg-habit-purple"
    },
    {
      icon: Zap,
      label: "Break Bad Habits",
      prompt: "I want to break my bad habit of checking social media too much. What strategies can help?",
      color: "bg-habit-indigo"
    },
    {
      icon: Lightbulb,
      label: "Motivation Tips",
      prompt: "I'm struggling to stay motivated with my habits. What can I do to maintain consistency?",
      color: "bg-habit-emerald"
    }
  ];

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-habit-purple to-habit-indigo flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">AI Habit Coach</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Get personalized advice and motivation</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-habit-purple to-habit-indigo flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Start Your Habit Journey</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Ask me anything about building habits, staying motivated, or overcoming challenges.
            </p>
            
            {/* Quick Prompts */}
            <div className="grid gap-3 max-w-lg mx-auto">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Try asking about:</p>
              {quickPrompts.map((prompt, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border border-slate-200 dark:border-slate-700"
                  onClick={() => setInput(prompt.prompt)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${prompt.color} flex items-center justify-center`}>
                      <prompt.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{prompt.label}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{prompt.prompt}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => suggestionsMutation.mutate("I want to build better daily habits")}
                disabled={suggestionsMutation.isPending}
                className="mt-2"
              >
                {suggestionsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Lightbulb className="w-4 h-4 mr-2" />
                )}
                Get Quick Suggestions
              </Button>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-4 ${
              message.role === 'user' 
                ? 'bg-habit-purple text-white' 
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              <div className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 max-w-[80%]">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about habits, motivation, or building better routines..."
              className="min-h-[60px] max-h-32 resize-none border-slate-300 dark:border-slate-600 focus:border-habit-purple dark:focus:border-habit-purple"
              disabled={chatMutation.isPending}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            className="bg-habit-purple hover:bg-habit-purple/90 text-white px-4 self-end"
          >
            {chatMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessages([])}
              className="text-xs"
            >
              Clear Chat
            </Button>
          )}
          
          <Badge variant="secondary" className="text-xs">
            Powered by GPT-4o • Expert Habit Advice
          </Badge>
        </div>
      </div>
    </div>
  );
}