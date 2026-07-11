import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// The client is only created when OPENAI_API_KEY is set; without it the app
// falls back to the built-in coaching responses below.
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  if (!openai) {
    return getFallbackResponse(messages[messages.length - 1]?.content || "");
  }
  try {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are an expert habit coach and motivational advisor specializing in behavior change, based on principles from "Atomic Habits" by James Clear and other evidence-based habit formation research. 

Your role is to:
- Provide personalized advice on building and maintaining habits
- Help users overcome common obstacles and setbacks
- Offer motivation and encouragement for habit consistency
- Suggest specific implementation strategies and techniques
- Help with habit stacking and behavior design
- Address psychological barriers to habit formation

Keep responses:
- Encouraging and supportive but practical
- Concise (2-3 paragraphs maximum)
- Actionable with specific next steps
- Based on proven behavior change principles
- Personalized to the user's specific situation

Focus on implementation intentions, environment design, habit stacking, the 2-minute rule, and identity-based habits when relevant.`
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMessage, ...messages],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    // Handle specific error types with helpful fallback responses
    if (error.code === 'insufficient_quota' || error.status === 429) {
      return getFallbackResponse(messages[messages.length - 1]?.content || "");
    }
    
    if (error.code === 'invalid_api_key' || error.status === 401) {
      throw new Error("API key configuration issue. Please check your OpenAI API key settings.");
    }
    
    if (error.code === 'rate_limit_exceeded') {
      return "I'm experiencing high demand right now. Here's some general advice: Start small with your habits, focus on consistency over perfection, and remember that building habits is a marathon, not a sprint. Try asking again in a moment.";
    }
    
    // Generic network/connection errors
    throw new Error("I'm having trouble connecting right now. Please check your internet connection and try again.");
  }
}

function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Morning routine advice
  if (lowerMessage.includes('morning') || lowerMessage.includes('routine')) {
    return `Here's proven advice for building a morning routine:

**Start Small**: Begin with just 10-15 minutes of morning activities. Maybe just make your bed and drink a glass of water.

**Stack Your Habits**: After you [existing habit like brushing teeth], immediately do your new morning habit. This creates a clear trigger.

**Focus on Identity**: Think "I am someone who starts their day intentionally" rather than just trying to complete tasks.

**Prepare the Night Before**: Set out clothes, prepare coffee, or write down your morning priorities to reduce decision fatigue.

Remember: consistency beats perfection. A simple 10-minute routine done daily is better than an elaborate one done occasionally.`;
  }
  
  // Motivation and consistency
  if (lowerMessage.includes('motivation') || lowerMessage.includes('consistent') || lowerMessage.includes('stick')) {
    return `Motivation challenges are normal - here's how to stay consistent:

**Make it Obvious**: Use visual cues and reminders. Put your workout clothes by your bed, or set phone reminders.

**Make it Easy**: Use the 2-minute rule - when starting a new habit, it should take less than 2 minutes. "Read 30 pages" becomes "read 1 page."

**Track Your Progress**: Use a simple habit tracker or calendar. Seeing your streak builds momentum and accountability.

**Celebrate Small Wins**: Immediately after completing a habit, do something you enjoy (even just saying "Yes!" out loud). This reinforces the positive behavior loop.

The key is environment design over willpower. Set up your space to make good habits easier and bad habits harder.`;
  }
  
  // Breaking bad habits
  if (lowerMessage.includes('break') || lowerMessage.includes('bad habit') || lowerMessage.includes('stop')) {
    return `Breaking bad habits requires a different approach than building good ones:

**Identify the Cue**: What triggers this habit? Boredom, stress, specific locations, or times of day? Understanding the trigger is crucial.

**Replace, Don't Remove**: Instead of just stopping the bad habit, replace it with a better one. If you scroll social media when bored, replace it with reading or a quick walk.

**Change Your Environment**: Make the bad habit harder to do. Remove apps from your phone's home screen, put junk food in hard-to-reach places, or use website blockers.

**Address the Underlying Need**: Bad habits often serve a real need (stress relief, social connection, entertainment). Find healthier ways to meet that same need.

Remember: focus on progress, not perfection. Each time you choose the better option, you're reinforcing your new identity.`;
  }
  
  // General habit advice
  return `Here's some foundational habit advice:

**Start Tiny**: Focus on habits so small you can't fail. "Do 1 pushup" or "read 1 page" builds the neural pathway without overwhelming yourself.

**Use Implementation Intentions**: Be specific about when and where you'll do the habit. "I will [habit] at [time] in [location]" doubles your success rate.

**Focus on Systems, Not Goals**: Instead of "lose 20 pounds," focus on "I am someone who exercises daily." Identity-based habits are more sustainable.

**Stack New Habits**: After I [existing strong habit], I will [new habit]. This leverages existing neural pathways to build new ones.

The most important thing is consistency. A small habit done every day is infinitely more powerful than a big effort done occasionally.`;
}

export async function getHabitSuggestions(context: string): Promise<{
  suggestions: string[];
  tips: string[];
}> {
  // Always return fallback suggestions to ensure reliability
  const fallbackSuggestions = {
    suggestions: [
      "Start with a 2-minute version of your desired habit",
      "Stack new habits after existing routines you already do",
      "Focus on consistency over perfection - aim for daily completion"
    ],
    tips: [
      "Make your habit obvious by setting visual cues and reminders",
      "Start small and gradually increase difficulty over time",
      "Celebrate small wins immediately to build positive reinforcement"
    ]
  };

  if (!openai) {
    return getContextualFallbackSuggestions(context);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a habit formation expert. Provide 3 specific habit suggestions and 3 practical tips based on the user's context. Respond with JSON in this format: { 'suggestions': ['habit1', 'habit2', 'habit3'], 'tips': ['tip1', 'tip2', 'tip3'] }"
        },
        {
          role: "user",
          content: context
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 400,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"suggestions":[],"tips":[]}');
    
    return {
      suggestions: result.suggestions || fallbackSuggestions.suggestions,
      tips: result.tips || fallbackSuggestions.tips
    };
  } catch (error: any) {
    console.error("OpenAI suggestions error:", error);
    
    // For quota/rate limit errors, return enhanced fallback suggestions
    if (error.code === 'insufficient_quota' || error.status === 429) {
      return getContextualFallbackSuggestions(context);
    }
    
    // For other errors, return basic fallback
    return fallbackSuggestions;
  }
}

function getContextualFallbackSuggestions(context: string): {
  suggestions: string[];
  tips: string[];
} {
  const lowerContext = context.toLowerCase();
  
  if (lowerContext.includes('morning') || lowerContext.includes('wake')) {
    return {
      suggestions: [
        "Make your bed immediately after waking up",
        "Drink a full glass of water before coffee or breakfast", 
        "Do 5 minutes of stretching or light movement"
      ],
      tips: [
        "Prepare everything the night before to reduce morning decisions",
        "Start with just one morning habit and add more after 2 weeks",
        "Connect your new habit to something you already do every morning"
      ]
    };
  }
  
  if (lowerContext.includes('exercise') || lowerContext.includes('workout') || lowerContext.includes('fitness')) {
    return {
      suggestions: [
        "Do 10 push-ups or squats right after brushing your teeth",
        "Take a 5-minute walk around the block after lunch",
        "Do 1 minute of stretching before going to bed"
      ],
      tips: [
        "Lay out your workout clothes the night before",
        "Start with bodyweight exercises that require no equipment",
        "Track your workouts with a simple calendar checkmark"
      ]
    };
  }
  
  if (lowerContext.includes('read') || lowerContext.includes('book') || lowerContext.includes('learn')) {
    return {
      suggestions: [
        "Read 1 page of a book before checking your phone in the morning",
        "Listen to a 10-minute educational podcast during your commute",
        "Spend 5 minutes reviewing notes or flashcards before dinner"
      ],
      tips: [
        "Keep books and reading materials visible in your living space",
        "Use apps or bookmarks to make resuming reading effortless",
        "Set a specific time each day dedicated to learning"
      ]
    };
  }
  
  // Default suggestions for general habit building
  return {
    suggestions: [
      "Start with a 2-minute version of your desired habit",
      "Stack new habits after routines you already do consistently",
      "Track your progress with a simple daily checkmark system"
    ],
    tips: [
      "Make your habit obvious with visual cues and environmental design",
      "Focus on showing up daily rather than perfect performance",
      "Celebrate small wins immediately after completing the habit"
    ]
  };
}