import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { InsertHabit, InsertRoutine } from "@shared/schema";

const routineSchema = z.object({
  title: z.string().min(1, "Stack name is required"),
  description: z.string().optional(),
  icon: z.string().default("fas fa-star"),
  color: z.string().default("habit-purple"),
});

const habitSchema = z.object({
  action: z.string().min(1, "Action is required"),
  time: z.string().optional(),
  location: z.string().optional(),
});

type RoutineForm = z.infer<typeof routineSchema>;
type HabitForm = z.infer<typeof habitSchema>;

interface HabitBuilderProps {
  onClose?: () => void;
}

export function HabitBuilder({ onClose }: HabitBuilderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stackedHabits, setStackedHabits] = useState<HabitForm[]>([]);

  const routineForm = useForm<RoutineForm>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "fas fa-star",
      color: "habit-purple"
    }
  });

  const initialHabitForm = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
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
        title: "Success! 🎉",
        description: "Your habit stack has been created. You're building momentum!",
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

  const onSubmit = () => {
    const routineData = routineForm.getValues();
    const initialHabitData = initialHabitForm.getValues();

    if (!routineData.title || !initialHabitData.action) {
      toast({
        title: "Missing Information",
        description: "Please fill in the stack name and first habit action.",
        variant: "destructive",
      });
      return;
    }

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

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Create Your Habit Stack
        </DialogTitle>
      </DialogHeader>

      {/* Stack Name */}
      <div>
        <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Stack Name
        </Label>
        <Input
          id="title"
          placeholder="e.g., Morning Flow, Workout Routine"
          className="mt-2"
          {...routineForm.register("title")}
        />
        {routineForm.formState.errors.title && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {routineForm.formState.errors.title.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Description (optional)
        </Label>
        <Input
          id="description"
          placeholder="e.g., Start your day with intention"
          className="mt-2"
          {...routineForm.register("description")}
        />
      </div>

      {/* First Habit */}
      <div className="bg-gradient-to-r from-pastel-indigo to-pastel-purple p-6 rounded-xl">
        <div className="space-y-4">
          <div className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
            I will{" "}
            <Input
              placeholder="action"
              className="inline-block w-32 mx-1 border-b-2 border-habit-indigo bg-transparent focus:border-habit-purple focus:animate-bounce-subtle transition-all duration-200"
              {...initialHabitForm.register("action")}
            />
            at{" "}
            <Input
              placeholder="time"
              className="inline-block w-24 mx-1 border-b-2 border-habit-amber bg-transparent focus:border-habit-purple focus:animate-bounce-subtle transition-all duration-200"
              {...initialHabitForm.register("time")}
            />
            in{" "}
            <Input
              placeholder="location"
              className="inline-block w-32 mx-1 border-b-2 border-habit-emerald bg-transparent focus:border-habit-purple focus:animate-bounce-subtle transition-all duration-200"
              {...initialHabitForm.register("location")}
            />.
          </div>
          {initialHabitForm.formState.errors.action && (
            <p className="text-red-500 dark:text-red-400 text-sm">
              {initialHabitForm.formState.errors.action.message}
            </p>
          )}
        </div>
      </div>

      {/* Habit Stacking */}
      <div className="bg-gradient-to-r from-pastel-emerald to-pastel-amber p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
          🔗 Stack Another Habit?
        </h4>
        <div className="space-y-4">
          {stackedHabits.map((habit, index) => (
            <div key={index} className="bg-white dark:bg-card p-4 rounded-lg border-l-4 border-habit-purple relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => removeStackedHabit(index)}
              >
                <X size={16} />
              </Button>
              <div className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed pr-8">
                After I{" "}
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 border-b-2 border-habit-emerald rounded text-habit-emerald font-medium">
                  {index === 0 
                    ? initialHabitForm.watch("action") || "previous habit"
                    : stackedHabits[index - 1]?.action || "previous habit"
                  }
                </span>, I will{" "}
                <Input
                  placeholder="action"
                  className="inline-block w-32 mx-1 border-b-2 border-habit-purple bg-transparent focus:border-habit-indigo focus:animate-bounce-subtle transition-all duration-200"
                  value={habit.action}
                  onChange={(e) => updateStackedHabit(index, "action", e.target.value)}
                />
                at{" "}
                <Input
                  placeholder="time"
                  className="inline-block w-24 mx-1 border-b-2 border-habit-amber bg-transparent focus:border-habit-purple focus:animate-bounce-subtle transition-all duration-200"
                  value={habit.time}
                  onChange={(e) => updateStackedHabit(index, "time", e.target.value)}
                />
                in{" "}
                <Input
                  placeholder="location"
                  className="inline-block w-32 mx-1 border-b-2 border-habit-emerald bg-transparent focus:border-habit-purple focus:animate-bounce-subtle transition-all duration-200"
                  value={habit.location}
                  onChange={(e) => updateStackedHabit(index, "location", e.target.value)}
                />.
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="ghost"
            onClick={addStackedHabit}
            className="text-habit-purple hover:text-habit-indigo font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus size={16} />
            <span>Add Another Habit to Stack</span>
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onClose?.()}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={createRoutineMutation.isPending}
          className="bg-gradient-to-r from-habit-purple to-habit-indigo text-white font-medium hover:shadow-lg transition-all duration-200"
        >
          {createRoutineMutation.isPending ? "Creating..." : "Create Stack"}
        </Button>
      </div>
    </div>
  );
}
