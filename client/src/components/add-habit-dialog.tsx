import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const habitSchema = z.object({
  action: z.string().min(1, "Action is required"),
  time: z.string().optional(),
  location: z.string().optional(),
});

type HabitForm = z.infer<typeof habitSchema>;

interface AddHabitDialogProps {
  routineId: number;
  routineTitle: string;
  lastHabitAction: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddHabitDialog({ 
  routineId, 
  routineTitle, 
  lastHabitAction, 
  isOpen, 
  onClose 
}: AddHabitDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const habitForm = useForm<HabitForm>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      action: "",
      time: "",
      location: ""
    }
  });

  const addHabitMutation = useMutation({
    mutationFn: (data: { routineId: number; habit: HabitForm }) =>
      api.addHabitToRoutine(data),
    onSuccess: () => {
      toast({
        title: "Habit added!",
        description: "Your new habit has been added to the stack.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/routines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      habitForm.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = () => {
    const habitData = habitForm.getValues();
    
    if (!habitData.action) {
      toast({
        title: "Missing Information",
        description: "Please fill in the habit action.",
        variant: "destructive",
      });
      return;
    }

    addHabitMutation.mutate({
      routineId,
      habit: habitData
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Add Habit to {routineTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Habit Stacking Format */}
          <div className="bg-gradient-to-r from-pastel-emerald to-pastel-amber p-6 rounded-xl">
            <div className="text-lg text-gray-800 leading-relaxed">
              After I{" "}
              <span className="px-3 py-1 bg-gray-100 border-b-2 border-habit-emerald rounded text-habit-emerald font-medium">
                {lastHabitAction}
              </span>, I will{" "}
              <Input
                placeholder="action"
                className="inline-block w-32 mx-1 border-b-2 border-habit-purple bg-transparent focus:border-habit-indigo focus:animate-bounce-subtle transition-all duration-200"
                {...habitForm.register("action")}
              />
              at{" "}
              <Input
                placeholder="time"
                className="inline-block w-24 mx-1 border-b-2 border-habit-amber bg-transparent focus:border-habit-purple focus:animate-bounce-subtle transition-all duration-200"
                {...habitForm.register("time")}
              />
              in{" "}
              <Input
                placeholder="location"
                className="inline-block w-32 mx-1 border-b-2 border-habit-emerald bg-transparent focus:border-habit-purple focus:animate-bounce-subtle transition-all duration-200"
                {...habitForm.register("location")}
              />.
            </div>
            {habitForm.formState.errors.action && (
              <p className="text-red-500 text-sm mt-4">
                {habitForm.formState.errors.action.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={addHabitMutation.isPending}
              className="bg-gradient-to-r from-habit-purple to-habit-indigo text-white font-medium hover:shadow-lg transition-all duration-200"
            >
              {addHabitMutation.isPending ? "Adding..." : "Add Habit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}