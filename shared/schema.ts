import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  time: text("time"),
  location: text("location"),
  formattedSentence: text("formatted_sentence").notNull(),
});

export const routines = pgTable("routines", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon").default("fas fa-star"),
  color: text("color").default("habit-purple"),
});

export const routineHabits = pgTable("routine_habits", {
  id: serial("id").primaryKey(),
  routineId: integer("routine_id").notNull(),
  habitId: integer("habit_id").notNull(),
  order: integer("order").notNull(),
  previousHabitId: integer("previous_habit_id"),
  connector: text("connector").default("then"),
});

export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  routineId: integer("routine_id").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  date: text("date").notNull(), // YYYY-MM-DD format
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
});

export const insertRoutineSchema = createInsertSchema(routines).omit({
  id: true,
});

export const insertRoutineHabitSchema = createInsertSchema(routineHabits).omit({
  id: true,
});

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).omit({
  id: true,
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type InsertRoutine = z.infer<typeof insertRoutineSchema>;
export type InsertRoutineHabit = z.infer<typeof insertRoutineHabitSchema>;
export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;

export type Habit = typeof habits.$inferSelect;
export type Routine = typeof routines.$inferSelect;
export type RoutineHabit = typeof routineHabits.$inferSelect;
export type HabitCompletion = typeof habitCompletions.$inferSelect;

// Extended types for frontend use
export type RoutineWithHabits = Routine & {
  habits: (RoutineHabit & { habit: Habit })[];
  completions: HabitCompletion[];
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
};
