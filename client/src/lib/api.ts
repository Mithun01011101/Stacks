import { apiRequest } from "./queryClient";
import type { 
  Routine, 
  RoutineWithHabits, 
  InsertHabit, 
  InsertRoutine,
  InsertHabitCompletion,
  HabitCompletion
} from "@shared/schema";

export const api = {
  // Routines
  getRoutines: async (): Promise<RoutineWithHabits[]> => {
    const response = await apiRequest("GET", "/api/routines");
    return response.json();
  },

  getRoutine: async (id: number): Promise<RoutineWithHabits> => {
    const response = await apiRequest("GET", `/api/routines/${id}`);
    return response.json();
  },

  createRoutine: async (data: { 
    routine: InsertRoutine; 
    habits: InsertHabit[] 
  }): Promise<RoutineWithHabits> => {
    const response = await apiRequest("POST", "/api/routines", data);
    return response.json();
  },

  deleteRoutine: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/routines/${id}`);
  },

  deleteHabit: async (habitId: number, routineId: number): Promise<void> => {
    await apiRequest("DELETE", `/api/routines/${routineId}/habits/${habitId}`);
  },

  addHabitToRoutine: async (data: { 
    routineId: number; 
    habit: { action: string; time?: string; location?: string; } 
  }): Promise<void> => {
    await apiRequest("POST", `/api/routines/${data.routineId}/habits`, data.habit);
  },

  // Habit completions
  toggleCompletion: async (data: InsertHabitCompletion): Promise<HabitCompletion> => {
    const response = await apiRequest("POST", "/api/completions/toggle", data);
    return response.json();
  },

  getCompletions: async (date: string): Promise<HabitCompletion[]> => {
    const response = await apiRequest("GET", `/api/completions/${date}`);
    return response.json();
  },

  // Stats
  getStats: async (): Promise<{
    totalHabits: number;
    activeRoutines: number;
    todayProgress: number;
    currentStreak: number;
    totalCompleted: number;
    longestStreak: number;
  }> => {
    const response = await apiRequest("GET", "/api/stats");
    return response.json();
  },

  // Export data
  exportData: async (): Promise<void> => {
    const response = await apiRequest("GET", "/api/export");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `habitflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // AI Chat endpoints
  chat: async (messages: { role: string; content: string }[]): Promise<{ response: string }> => {
    const response = await apiRequest("POST", "/api/chat", { messages });
    return response.json();
  },

  getHabitSuggestions: async (context: string): Promise<{ suggestions: string[]; tips: string[] }> => {
    const response = await apiRequest("POST", "/api/habit-suggestions", { context });
    return response.json();
  },
};
