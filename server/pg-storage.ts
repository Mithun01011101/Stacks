import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "./db";
import {
  habits,
  routines,
  routineHabits,
  habitCompletions,
  type Habit,
  type Routine,
  type RoutineHabit,
  type HabitCompletion,
  type InsertHabit,
  type InsertRoutine,
  type InsertRoutineHabit,
  type InsertHabitCompletion,
  type RoutineWithHabits,
} from "@shared/schema";
import type { IStorage } from "./storage";

function requireDb() {
  if (!db) {
    throw new Error("PgStorage requires DATABASE_URL to be set");
  }
  return db;
}

export class PgStorage implements IStorage {
  private db = requireDb();

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const [habit] = await this.db.insert(habits).values(insertHabit).returning();
    return habit;
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    const [habit] = await this.db.select().from(habits).where(eq(habits.id, id));
    return habit;
  }

  async getAllHabits(): Promise<Habit[]> {
    return this.db.select().from(habits);
  }

  async createRoutine(insertRoutine: InsertRoutine): Promise<Routine> {
    const [routine] = await this.db.insert(routines).values(insertRoutine).returning();
    return routine;
  }

  async getRoutine(id: number): Promise<Routine | undefined> {
    const [routine] = await this.db.select().from(routines).where(eq(routines.id, id));
    return routine;
  }

  async getAllRoutines(): Promise<Routine[]> {
    return this.db.select().from(routines);
  }

  async getRoutineWithHabits(id: number): Promise<RoutineWithHabits | undefined> {
    const routine = await this.getRoutine(id);
    if (!routine) return undefined;

    const habitsList = await this.getRoutineHabits(id);
    const today = new Date().toISOString().split("T")[0];
    const completions = await this.getRoutineCompletions(id, today);

    const completedCount = completions.filter((c) => c.completed).length;
    const progress = {
      completed: completedCount,
      total: habitsList.length,
      percentage:
        habitsList.length > 0
          ? Math.round((completedCount / habitsList.length) * 100)
          : 0,
    };

    return { ...routine, habits: habitsList, completions, progress };
  }

  async getAllRoutinesWithHabits(): Promise<RoutineWithHabits[]> {
    const allRoutines = await this.getAllRoutines();
    const routinesWithHabits = await Promise.all(
      allRoutines.map((routine) => this.getRoutineWithHabits(routine.id))
    );
    return routinesWithHabits.filter((r): r is RoutineWithHabits => Boolean(r));
  }

  async deleteRoutine(id: number): Promise<boolean> {
    await this.db.delete(routineHabits).where(eq(routineHabits.routineId, id));
    await this.db.delete(habitCompletions).where(eq(habitCompletions.routineId, id));
    const deleted = await this.db.delete(routines).where(eq(routines.id, id)).returning();
    return deleted.length > 0;
  }

  async addHabitToRoutine(insertRoutineHabit: InsertRoutineHabit): Promise<RoutineHabit> {
    const [routineHabit] = await this.db
      .insert(routineHabits)
      .values(insertRoutineHabit)
      .returning();
    return routineHabit;
  }

  async getRoutineHabits(routineId: number): Promise<(RoutineHabit & { habit: Habit })[]> {
    const rows = await this.db
      .select()
      .from(routineHabits)
      .where(eq(routineHabits.routineId, routineId))
      .orderBy(asc(routineHabits.order));
    if (rows.length === 0) return [];

    const habitRows = await this.db
      .select()
      .from(habits)
      .where(inArray(habits.id, rows.map((rh) => rh.habitId)));
    const habitsById = new Map(habitRows.map((h) => [h.id, h]));

    return rows
      .map((rh) => ({ ...rh, habit: habitsById.get(rh.habitId)! }))
      .filter((rh) => rh.habit);
  }

  async removeHabitFromRoutine(routineId: number, habitId: number): Promise<boolean> {
    const deleted = await this.db
      .delete(routineHabits)
      .where(and(eq(routineHabits.routineId, routineId), eq(routineHabits.habitId, habitId)))
      .returning();
    return deleted.length > 0;
  }

  async toggleHabitCompletion(insertCompletion: InsertHabitCompletion): Promise<HabitCompletion> {
    const [existing] = await this.db
      .select()
      .from(habitCompletions)
      .where(
        and(
          eq(habitCompletions.habitId, insertCompletion.habitId),
          eq(habitCompletions.routineId, insertCompletion.routineId),
          eq(habitCompletions.date, insertCompletion.date)
        )
      );

    if (existing) {
      const completed = !existing.completed;
      const [updated] = await this.db
        .update(habitCompletions)
        .set({ completed, completedAt: completed ? new Date() : null })
        .where(eq(habitCompletions.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await this.db
      .insert(habitCompletions)
      .values({ ...insertCompletion, completed: true, completedAt: new Date() })
      .returning();
    return created;
  }

  async getHabitCompletions(date: string): Promise<HabitCompletion[]> {
    return this.db.select().from(habitCompletions).where(eq(habitCompletions.date, date));
  }

  async getRoutineCompletions(routineId: number, date: string): Promise<HabitCompletion[]> {
    return this.db
      .select()
      .from(habitCompletions)
      .where(and(eq(habitCompletions.routineId, routineId), eq(habitCompletions.date, date)));
  }

  async getStats(): Promise<{
    totalHabits: number;
    activeRoutines: number;
    todayProgress: number;
    currentStreak: number;
    totalCompleted: number;
    longestStreak: number;
  }> {
    const allHabits = await this.getAllHabits();
    const allRoutines = await this.getAllRoutines();
    const allRoutineHabits = await this.db.select().from(routineHabits);
    const allCompletions = await this.db.select().from(habitCompletions);

    const today = new Date().toISOString().split("T")[0];
    const todayCompleted = allCompletions.filter((c) => c.date === today && c.completed).length;
    const totalRoutineHabits = allRoutineHabits.length;
    const todayProgress =
      totalRoutineHabits > 0 ? Math.round((todayCompleted / totalRoutineHabits) * 100) : 0;

    return {
      totalHabits: allHabits.length,
      activeRoutines: allRoutines.length,
      todayProgress,
      // Streaks are not tracked yet; mirrors JsonFileStorage behavior.
      currentStreak: 0,
      totalCompleted: allCompletions.filter((c) => c.completed).length,
      longestStreak: 0,
    };
  }
}
