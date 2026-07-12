import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link2, Loader2, Plus, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { InsertHabit, InsertRoutine } from "@shared/schema";

const routineSchema = z.object({
  title: z.string().min(1, "Give your stack a name"),
  description: z.string().optional(),
  icon: z.string().default("fas fa-star"),
  color: z.string().default("habit-purple"),
});

const habitSchema = z.object({
  action: z.string().min(1, "What will you do? This one's required"),
  time: z.string().optional(),
  location: z.string().optional(),
});

type RoutineForm = z.infer<typeof routineSchema>;
type HabitForm = z.infer<typeof habitSchema>;

interface HabitBuilderProps {
  onClose?: () => void;
}

const fieldClass =
  "h-11 rounded-xl border-input bg-card text-base focus-visible:ring-habit-purple";

export function HabitBuilder({ onClose }: HabitBuilderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stackedHabits, setStackedHabits] = useState<HabitForm[]>([]);

  const routineForm = useForm<RoutineForm>({
    resolver: zodResolver(routineSchema),
    mode: "onBlur",
    defaultValues: {
      title: "",
      description: "",
      icon: "fas fa-star",
      color: "habit-purple"
    }
  });

  const initialHabitForm = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
    mode: "onBlur",
    defaultValues: {
      action: "",
      time: "",
      location: ""
    }
  });

  const createRoutineMutation = useMutation({
    mutationFn: (data: { routine: InsertRoutine; habits: InsertHabit[] }) =>
      api.createRoutine(data),
    onSuccess: () => {
      toast({
        title: "Stack created!",
        description: "You're building momentum — first habit is waiting for you.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/routines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onClose?.();

      // Reset forms
      routineForm.reset();
      initialHabitForm.reset();
      setStackedHabits([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create habit stack. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addStackedHabit = () => {
    setStackedHabits(prev => [...prev, { action: "", time: "", location: "" }]);
  };

  const updateStackedHabit = (index: number, field: keyof HabitForm, value: string) => {
    setStackedHabits(prev =>
      prev.map((habit, i) =>
        i === index ? { ...habit, [field]: value } : habit
      )
    );
  };

  const removeStackedHabit = (index: number) => {
    setStackedHabits(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validate both forms; surface errors inline and focus the first problem
    const routineValid = await routineForm.trigger();
    const habitValid = await initialHabitForm.trigger();
    if (!routineValid) {
      routineForm.setFocus("title");
      return;
    }
    if (!habitValid) {
      initialHabitForm.setFocus("action");
      return;
    }

    const routineData = routineForm.getValues();
    const initialHabitData = initialHabitForm.getValues();

    // Create the initial habit
    const habits: InsertHabit[] = [
      {
        action: initialHabitData.action,
        time: initialHabitData.time || "",
        location: initialHabitData.location || "",
        formattedSentence: `I will ${initialHabitData.action}${initialHabitData.time ? ` at ${initialHabitData.time}` : ''}${initialHabitData.location ? ` in ${initialHabitData.location}` : ''}.`
      }
    ];

    // Add stacked habits
    let previousAction = initialHabitData.action;
    stackedHabits.forEach(habit => {
      if (habit.action) {
        habits.push({
          action: habit.action,
          time: habit.time || "",
          location: habit.location || "",
          formattedSentence: `After I ${previousAction}, I will ${habit.action}${habit.time ? ` at ${habit.time}` : ''}${habit.location ? ` in ${habit.location}` : ''}.`
        });
        previousAction = habit.action;
      }
    });

    createRoutineMutation.mutate({
      routine: routineData,
      habits
    });
  };

  // Live sentence preview for the first habit
  const watchedAction = initialHabitForm.watch("action");
  const watchedTime = initialHabitForm.watch("time");
  const watchedLocation = initialHabitForm.watch("location");

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* The basics */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Stack name <span className="text-habit-purple" aria-hidden="true">*</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g. Morning Flow, Workout Routine"
            className={`mt-1.5 ${fieldClass}`}
            aria-invalid={!!routineForm.formState.errors.title}
            {...routineForm.register("title")}
          />
          {routineForm.formState.errors.title && (
            <p role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {routineForm.formState.errors.title.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="description"
            placeholder="e.g. Start your day with intention"
            className={`mt-1.5 ${fieldClass}`}
            {...routineForm.register("description")}
          />
        </div>
      </div>

      {/* First habit */}
      <div className="rounded-2xl bg-gradient-to-br from-pastel-indigo to-pastel-purple p-4 dark:from-pastel-indigo dark:to-pastel-purple">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-habit-purple to-habit-indigo">
            <Sparkles className="text-white" size={15} />
          </div>
          <h4 className="font-display font-bold text-gray-900 dark:text-gray-50">
            Your first habit
          </h4>
        </div>

        {/* Live sentence preview */}
        <motion.div
          layout
          className="mb-4 rounded-xl border border-border/60 bg-card px-3.5 py-3 text-[15px] leading-relaxed text-gray-800 shadow-soft dark:text-gray-200"
        >
          I will{" "}
          <span className={`rounded-md border-b-2 border-habit-indigo px-1 font-medium ${watchedAction ? "" : "text-muted-foreground"}`}>
            {watchedAction || "…"}
          </span>
          {watchedTime && (
            <>
              {" "}at{" "}
              <span className="rounded-md border-b-2 border-habit-amber px-1 font-medium">
                {watchedTime}
              </span>
            </>
          )}
          {watchedLocation && (
            <>
              {" "}in{" "}
              <span className="rounded-md border-b-2 border-habit-emerald px-1 font-medium">
                {watchedLocation}
              </span>
            </>
          )}
          .
        </motion.div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="first-action" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              What will you do? <span className="text-habit-purple" aria-hidden="true">*</span>
            </Label>
            <Input
              id="first-action"
              placeholder="e.g. drink a glass of water"
              className={`mt-1.5 ${fieldClass}`}
              aria-invalid={!!initialHabitForm.formState.errors.action}
              {...initialHabitForm.register("action")}
            />
            {initialHabitForm.formState.errors.action && (
              <p role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {initialHabitForm.formState.errors.action.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first-time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                When?
              </Label>
              <Input
                id="first-time"
                placeholder="e.g. 7:00 AM"
                className={`mt-1.5 ${fieldClass}`}
                {...initialHabitForm.register("time")}
              />
            </div>
            <div>
              <Label htmlFor="first-location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Where?
              </Label>
              <Input
                id="first-location"
                placeholder="e.g. the kitchen"
                className={`mt-1.5 ${fieldClass}`}
                {...initialHabitForm.register("location")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Habit stacking */}
      <div className="rounded-2xl bg-gradient-to-br from-pastel-emerald to-pastel-amber p-4 dark:from-pastel-emerald dark:to-pastel-amber">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-habit-emerald to-green-500">
            <Link2 className="text-white" size={15} />
          </div>
          <h4 className="font-display font-bold text-gray-900 dark:text-gray-50">
            Stack more habits
          </h4>
        </div>
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          Chain habits together — each new one rides on the last.
        </p>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {stackedHabits.map((habit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative rounded-xl border border-border/60 bg-card p-3.5 shadow-soft"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full p-0 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                  onClick={() => removeStackedHabit(index)}
                  aria-label={`Remove habit ${index + 1}`}
                >
                  <X size={15} />
                </Button>

                <p className="mb-2.5 pr-9 text-sm text-gray-600 dark:text-gray-400">
                  After I{" "}
                  <span className="rounded-md bg-pastel-emerald px-1.5 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
                    {index === 0
                      ? initialHabitForm.watch("action") || "my previous habit"
                      : stackedHabits[index - 1]?.action || "my previous habit"
                    }
                  </span>
                  , I will…
                </p>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`stacked-action-${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      What will you do? <span className="text-habit-purple" aria-hidden="true">*</span>
                    </Label>
                    <Input
                      id={`stacked-action-${index}`}
                      placeholder="e.g. stretch for 2 minutes"
                      className={`mt-1.5 ${fieldClass}`}
                      value={habit.action}
                      onChange={(e) => updateStackedHabit(index, "action", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`stacked-time-${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        When?
                      </Label>
                      <Input
                        id={`stacked-time-${index}`}
                        placeholder="e.g. 7:05 AM"
                        className={`mt-1.5 ${fieldClass}`}
                        value={habit.time}
                        onChange={(e) => updateStackedHabit(index, "time", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`stacked-location-${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Where?
                      </Label>
                      <Input
                        id={`stacked-location-${index}`}
                        placeholder="e.g. the living room"
                        className={`mt-1.5 ${fieldClass}`}
                        value={habit.location}
                        onChange={(e) => updateStackedHabit(index, "location", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Button
            type="button"
            variant="ghost"
            onClick={addStackedHabit}
            className="h-11 w-full rounded-xl border-2 border-dashed border-habit-emerald/40 text-emerald-700 hover:border-habit-emerald hover:bg-pastel-emerald/50 hover:text-emerald-800 active:scale-[0.99] dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            <Plus size={16} className="mr-2" />
            Add another habit
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-1">
        <Button
          type="submit"
          disabled={createRoutineMutation.isPending}
          className="h-12 w-full rounded-full bg-gradient-to-r from-habit-purple to-habit-indigo text-base font-semibold text-white shadow-glow-purple transition-all hover:brightness-110 active:scale-[0.99]"
        >
          {createRoutineMutation.isPending ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Creating…
            </>
          ) : (
            "Create Stack"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onClose?.()}
          className="h-11 w-full rounded-full text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
