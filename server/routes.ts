import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHabitSchema, 
  insertRoutineSchema, 
  insertRoutineHabitSchema, 
  insertHabitCompletionSchema 
} from "@shared/schema";
import { getChatResponse, getHabitSuggestions, type ChatMessage } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Habits routes
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getAllHabits();
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Failed to get habits" });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const validatedData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(validatedData);
      res.status(201).json(habit);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit data" });
    }
  });

  // Routines routes
  app.get("/api/routines", async (req, res) => {
    try {
      const routines = await storage.getAllRoutinesWithHabits();
      res.json(routines);
    } catch (error) {
      res.status(500).json({ message: "Failed to get routines" });
    }
  });

  app.get("/api/routines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const routine = await storage.getRoutineWithHabits(id);
      if (!routine) {
        return res.status(404).json({ message: "Routine not found" });
      }
      res.json(routine);
    } catch (error) {
      res.status(500).json({ message: "Failed to get routine" });
    }
  });

  app.post("/api/routines", async (req, res) => {
    try {
      const { routine: routineData, habits: habitsData } = req.body;
      
      // Validate routine data
      const validatedRoutine = insertRoutineSchema.parse(routineData);
      const routine = await storage.createRoutine(validatedRoutine);

      // Create habits and link them to the routine
      if (habitsData && habitsData.length > 0) {
        let previousHabitId = null;
        
        for (let i = 0; i < habitsData.length; i++) {
          const habitData = habitsData[i];
          const validatedHabit = insertHabitSchema.parse(habitData);
          const habit = await storage.createHabit(validatedHabit);
          
          const routineHabitData = {
            routineId: routine.id,
            habitId: habit.id,
            order: i + 1,
            previousHabitId,
            connector: i === 0 ? null : "then"
          };
          
          const validatedRoutineHabit = insertRoutineHabitSchema.parse(routineHabitData);
          await storage.addHabitToRoutine(validatedRoutineHabit);
          
          previousHabitId = habit.id;
        }
      }

      const routineWithHabits = await storage.getRoutineWithHabits(routine.id);
      res.status(201).json(routineWithHabits);
    } catch (error) {
      console.error('Error creating routine:', error);
      res.status(400).json({ message: "Invalid routine data" });
    }
  });

  app.delete("/api/routines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRoutine(id);
      if (!deleted) {
        return res.status(404).json({ message: "Routine not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete routine" });
    }
  });

  app.delete("/api/routines/:routineId/habits/:habitId", async (req, res) => {
    try {
      const routineId = parseInt(req.params.routineId);
      const habitId = parseInt(req.params.habitId);
      const deleted = await storage.removeHabitFromRoutine(routineId, habitId);
      if (!deleted) {
        return res.status(404).json({ message: "Habit not found in routine" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove habit from routine" });
    }
  });

  app.post("/api/routines/:routineId/habits", async (req, res) => {
    try {
      const routineId = parseInt(req.params.routineId);
      const habitData = req.body;
      
      // Get the routine to find the last habit for stacking
      const routine = await storage.getRoutineWithHabits(routineId);
      if (!routine) {
        return res.status(404).json({ message: "Routine not found" });
      }
      
      // Find the last habit in the stack
      const lastHabit = routine.habits[routine.habits.length - 1];
      const previousAction = lastHabit ? lastHabit.habit.action : "";
      
      // Create the formatted sentence for the new habit
      const formattedSentence = `After I ${previousAction}, I will ${habitData.action}${habitData.time ? ` at ${habitData.time}` : ''}${habitData.location ? ` in ${habitData.location}` : ''}.`;
      
      // Validate and create the habit
      const validatedHabit = insertHabitSchema.parse({
        ...habitData,
        formattedSentence
      });
      const habit = await storage.createHabit(validatedHabit);
      
      // Add to routine
      const routineHabitData = {
        routineId,
        habitId: habit.id,
        order: routine.habits.length + 1,
        previousHabitId: lastHabit ? lastHabit.habitId : null,
        connector: "then"
      };
      
      const validatedRoutineHabit = insertRoutineHabitSchema.parse(routineHabitData);
      await storage.addHabitToRoutine(validatedRoutineHabit);
      
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error adding habit to routine:', error);
      res.status(400).json({ message: "Invalid habit data" });
    }
  });

  // Habit completions routes
  app.post("/api/completions/toggle", async (req, res) => {
    try {
      const validatedData = insertHabitCompletionSchema.parse(req.body);
      const completion = await storage.toggleHabitCompletion(validatedData);
      res.json(completion);
    } catch (error) {
      res.status(400).json({ message: "Invalid completion data" });
    }
  });

  app.get("/api/completions/:date", async (req, res) => {
    try {
      const date = req.params.date;
      const completions = await storage.getHabitCompletions(date);
      res.json(completions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get completions" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Export data route
  app.get("/api/export", async (req, res) => {
    try {
      const routines = await storage.getAllRoutinesWithHabits();
      const allHabits = await storage.getAllHabits();
      const today = new Date().toISOString().split('T')[0];
      const allCompletions = await storage.getHabitCompletions(today);
      
      const exportData = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        data: {
          routines,
          habits: allHabits,
          completions: allCompletions
        }
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="habitflow-backup-${today}.json"`);
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // AI Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Messages array is required" });
      }

      const response = await getChatResponse(messages);
      res.json({ response });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ message: error.message || "Failed to get AI response" });
    }
  });

  app.post("/api/habit-suggestions", async (req, res) => {
    try {
      const { context } = req.body;
      
      if (!context || typeof context !== 'string') {
        return res.status(400).json({ message: "Context string is required" });
      }

      const suggestions = await getHabitSuggestions(context);
      res.json(suggestions);
    } catch (error: any) {
      console.error("Suggestions error:", error);
      res.status(500).json({ message: error.message || "Failed to get habit suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
