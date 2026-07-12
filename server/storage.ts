
import { 
  type Habit, 
  type Routine, 
  type RoutineHabit, 
  type HabitCompletion,
  type InsertHabit, 
  type InsertRoutine, 
  type InsertRoutineHabit, 
  type InsertHabitCompletion,
  type RoutineWithHabits
} from "@shared/schema";
import { promises as fs } from "fs";
import path from "path";
import { calculateStreaks } from "./streaks";

export interface IStorage {
  createHabit(habit: InsertHabit): Promise<Habit>;
  getHabit(id: number): Promise<Habit | undefined>;
  getAllHabits(): Promise<Habit[]>;
  createRoutine(routine: InsertRoutine): Promise<Routine>;
  getRoutine(id: number): Promise<Routine | undefined>;
  getAllRoutines(): Promise<Routine[]>;
  getRoutineWithHabits(id: number): Promise<RoutineWithHabits | undefined>;
  getAllRoutinesWithHabits(): Promise<RoutineWithHabits[]>;
  deleteRoutine(id: number): Promise<boolean>;
  addHabitToRoutine(routineHabit: InsertRoutineHabit): Promise<RoutineHabit>;
  getRoutineHabits(routineId: number): Promise<(RoutineHabit & { habit: Habit })[]>;
  removeHabitFromRoutine(routineId: number, habitId: number): Promise<boolean>;
  toggleHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  getHabitCompletions(date: string): Promise<HabitCompletion[]>;
  getRoutineCompletions(routineId: number, date: string): Promise<HabitCompletion[]>;
  getStats(): Promise<{
    totalHabits: number;
    activeRoutines: number;
    todayProgress: number;
    currentStreak: number;
    totalCompleted: number;
    longestStreak: number;
  }>;
}

interface StorageData {
  habits: Habit[];
  routines: Routine[];
  routineHabits: RoutineHabit[];
  habitCompletions: HabitCompletion[];
  nextHabitId: number;
  nextRoutineId: number;
  nextRoutineHabitId: number;
  nextCompletionId: number;
}

const DATA_FILE = path.join(process.cwd(), "habits.json");

async function loadData(): Promise<StorageData> {
  try {
    const fileContent = await fs.readFile(DATA_FILE, "utf-8");
    const data = JSON.parse(fileContent);
    
    // Convert date strings back to Date objects for completedAt
    if (data.habitCompletions) {
      data.habitCompletions = data.habitCompletions.map((hc: any) => ({
        ...hc,
        completedAt: hc.completedAt ? new Date(hc.completedAt) : null
      }));
    }
    
    return data;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log("Creating new habits.json file...");
      const initialData: StorageData = {
        habits: [],
        routines: [],
        routineHabits: [],
        habitCompletions: [],
        nextHabitId: 1,
        nextRoutineId: 1,
        nextRoutineHabitId: 1,
        nextCompletionId: 1,
      };
      await saveData(initialData);
      return initialData;
    }
    console.error("Failed to load data from habits.json:", error);
    throw error;
  }
}

async function saveData(data: StorageData): Promise<void> {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save data to habits.json:", error);
    throw error;
  }
}

export class JsonFileStorage implements IStorage {
  private data: StorageData | null = null;
  private initialized = false;

  private async ensureInit(): Promise<StorageData> {
    if (!this.initialized || !this.data) {
      this.data = await loadData();
      this.initialized = true;
    }
    return this.data;
  }

  private async save(): Promise<void> {
    if (this.data) {
      await saveData(this.data);
    }
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    const data = await this.ensureInit();
    return data.habits.find((h) => h.id === id);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const data = await this.ensureInit();
    const habit: Habit = {
      id: data.nextHabitId++,
      action: insertHabit.action,
      time: insertHabit.time || null,
      location: insertHabit.location || null,
      formattedSentence: insertHabit.formattedSentence,
    };
    data.habits.push(habit);
    await this.save();
    return habit;
  }

  async getAllHabits(): Promise<Habit[]> {
    const data = await this.ensureInit();
    return data.habits;
  }

  async createRoutine(insertRoutine: InsertRoutine): Promise<Routine> {
    const data = await this.ensureInit();
    const routine: Routine = {
      id: data.nextRoutineId++,
      title: insertRoutine.title,
      description: insertRoutine.description || null,
      icon: insertRoutine.icon || "fas fa-star",
      color: insertRoutine.color || "habit-purple",
    };
    data.routines.push(routine);
    await this.save();
    return routine;
  }

  async getRoutine(id: number): Promise<Routine | undefined> {
    const data = await this.ensureInit();
    return data.routines.find((r) => r.id === id);
  }

  async getAllRoutines(): Promise<Routine[]> {
    const data = await this.ensureInit();
    return data.routines;
  }

  async getRoutineWithHabits(id: number): Promise<RoutineWithHabits | undefined> {
    const routine = await this.getRoutine(id);
    if (!routine) return undefined;

    const habitsList = await this.getRoutineHabits(id);
    const today = new Date().toISOString().split("T")[0];
    const completions = await this.getRoutineCompletions(id, today);

    const progress = {
      completed: completions.filter((c) => c.completed).length,
      total: habitsList.length,
      percentage:
        habitsList.length > 0
          ? Math.round(
              (completions.filter((c) => c.completed).length / habitsList.length) * 100
            )
          : 0,
    };

    return {
      ...routine,
      habits: habitsList,
      completions,
      progress,
    };
  }

  async getAllRoutinesWithHabits(): Promise<RoutineWithHabits[]> {
    const allRoutines = await this.getAllRoutines();
    const routinesWithHabits = await Promise.all(
      allRoutines.map(async (routine) => {
        const withHabits = await this.getRoutineWithHabits(routine.id);
        return withHabits!;
      })
    );
    return routinesWithHabits.filter(Boolean);
  }

  async deleteRoutine(id: number): Promise<boolean> {
    const data = await this.ensureInit();
    const index = data.routines.findIndex((r) => r.id === id);
    if (index === -1) return false;

    const unlinkedHabitIds = data.routineHabits
      .filter((rh) => rh.routineId === id)
      .map((rh) => rh.habitId);
    data.routineHabits = data.routineHabits.filter(
      (rh) => rh.routineId !== id
    );
    data.habitCompletions = data.habitCompletions.filter(
      (hc) => hc.routineId !== id
    );
    data.routines.splice(index, 1);
    // Drop habit rows that no longer belong to any routine so they don't
    // linger invisibly and inflate the totalHabits stat.
    const stillLinked = new Set(data.routineHabits.map((rh) => rh.habitId));
    data.habits = data.habits.filter(
      (h) => !unlinkedHabitIds.includes(h.id) || stillLinked.has(h.id)
    );
    await this.save();
    return true;
  }

  async addHabitToRoutine(insertRoutineHabit: InsertRoutineHabit): Promise<RoutineHabit> {
    const data = await this.ensureInit();
    const routineHabit: RoutineHabit = {
      id: data.nextRoutineHabitId++,
      routineId: insertRoutineHabit.routineId,
      habitId: insertRoutineHabit.habitId,
      order: insertRoutineHabit.order,
      previousHabitId: insertRoutineHabit.previousHabitId || null,
      connector: insertRoutineHabit.connector || "then",
    };
    data.routineHabits.push(routineHabit);
    await this.save();
    return routineHabit;
  }

  async getRoutineHabits(routineId: number): Promise<(RoutineHabit & { habit: Habit })[]> {
    const data = await this.ensureInit();
    const rHabits = data.routineHabits
      .filter((rh) => rh.routineId === routineId)
      .sort((a, b) => a.order - b.order);

    return rHabits.map((rh) => ({
      ...rh,
      habit: data.habits.find((h) => h.id === rh.habitId)!,
    })).filter((rh) => rh.habit);
  }

  async removeHabitFromRoutine(routineId: number, habitId: number): Promise<boolean> {
    const data = await this.ensureInit();
    const index = data.routineHabits.findIndex(
      (rh) => rh.routineId === routineId && rh.habitId === habitId
    );
    if (index === -1) return false;

    data.routineHabits.splice(index, 1);
    if (!data.routineHabits.some((rh) => rh.habitId === habitId)) {
      data.habits = data.habits.filter((h) => h.id !== habitId);
    }
    await this.save();
    return true;
  }

  async toggleHabitCompletion(insertCompletion: InsertHabitCompletion): Promise<HabitCompletion> {
    const data = await this.ensureInit();
    const existing = data.habitCompletions.find(
      (hc) =>
        hc.habitId === insertCompletion.habitId &&
        hc.routineId === insertCompletion.routineId &&
        hc.date === insertCompletion.date
    );

    if (existing) {
      existing.completed = !existing.completed;
      existing.completedAt = existing.completed ? new Date() : null;
      await this.save();
      return existing;
    } else {
      const completion: HabitCompletion = {
        id: data.nextCompletionId++,
        habitId: insertCompletion.habitId,
        routineId: insertCompletion.routineId,
        date: insertCompletion.date,
        completed: true,
        completedAt: new Date(),
      };
      data.habitCompletions.push(completion);
      await this.save();
      return completion;
    }
  }

  async getHabitCompletions(date: string): Promise<HabitCompletion[]> {
    const data = await this.ensureInit();
    return data.habitCompletions.filter((hc) => hc.date === date);
  }

  async getRoutineCompletions(routineId: number, date: string): Promise<HabitCompletion[]> {
    const data = await this.ensureInit();
    return data.habitCompletions.filter(
      (hc) => hc.routineId === routineId && hc.date === date
    );
  }

  async getStats(): Promise<{
    totalHabits: number;
    activeRoutines: number;
    todayProgress: number;
    currentStreak: number;
    totalCompleted: number;
    longestStreak: number;
  }> {
    const data = await this.ensureInit();
    const today = new Date().toISOString().split("T")[0];
    const todayCompletions = await this.getHabitCompletions(today);
    const todayCompleted = todayCompletions.filter((c) => c.completed).length;
    const totalRoutineHabits = data.routineHabits.length;
    const todayProgress =
      totalRoutineHabits > 0
        ? Math.round((todayCompleted / totalRoutineHabits) * 100)
        : 0;

    const totalCompleted = data.habitCompletions.filter((hc) => hc.completed).length;
    const { currentStreak, longestStreak } = calculateStreaks(
      data.habitCompletions.filter((hc) => hc.completed).map((hc) => hc.date)
    );

    return {
      totalHabits: data.habits.length,
      activeRoutines: data.routines.length,
      todayProgress,
      currentStreak,
      totalCompleted,
      longestStreak,
    };
  }
}

// Use Postgres when a database is configured (hosted deployments); otherwise
// fall back to the local JSON file (desktop use).
import { PgStorage } from "./pg-storage";

export const storage: IStorage = process.env.DATABASE_URL
  ? new PgStorage()
  : new JsonFileStorage();
