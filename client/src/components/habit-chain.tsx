import { useRef, useState, useEffect } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HabitBlock } from "./habit-block";
import type { RoutineWithHabits } from "@shared/schema";

interface HabitChainProps {
  routine: RoutineWithHabits;
  onToggleCompletion: (habitId: number) => void;
  onDeleteHabit?: (habitId: number, routineId: number) => void;
  onAddHabit?: (routineId: number) => void;
}

export function HabitChain({ routine, onToggleCompletion, onDeleteHabit, onAddHabit }: HabitChainProps) {
  const colors = ['habit-indigo', 'habit-purple', 'habit-emerald', 'habit-amber'];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [velocity, setVelocity] = useState(0);

  const startDrag = (clientX: number) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(clientX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    setStartTime(Date.now());
    setVelocity(0);
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.scrollBehavior = 'auto';
  };

  const endDrag = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
      scrollRef.current.style.scrollBehavior = 'smooth';
      
      // Apply momentum scrolling
      if (Math.abs(velocity) > 0.5) {
        const momentum = velocity * 300;
        scrollRef.current.scrollLeft += momentum;
      }
    }
  };

  const handleDrag = (clientX: number) => {
    if (!isDragging || !scrollRef.current) return;
    
    const x = clientX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    const newScrollLeft = scrollLeft - walk;
    
    // Calculate velocity for momentum
    const currentTime = Date.now();
    const timeDiff = currentTime - startTime;
    if (timeDiff > 0) {
      setVelocity(-walk / timeDiff);
    }
    
    scrollRef.current.scrollLeft = newScrollLeft;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startDrag(e.pageX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDrag(e.pageX);
  };

  const handleMouseUp = () => {
    endDrag();
  };

  const handleMouseLeave = () => {
    endDrag();
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      handleDrag(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    endDrag();
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.style.cursor = 'grab';
    }
  }, []);

  return (
    <div className="relative">
      <div 
        ref={scrollRef}
        className="flex items-center space-x-4 overflow-x-auto pb-4 scrollbar-hide drag-scroll select-none"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {routine.habits.map((routineHabit, index) => {
          const completion = routine.completions.find(
            c => c.habitId === routineHabit.habitId
          );
          const color = colors[index % colors.length];
          
          return (
            <div key={routineHabit.id} className="flex items-center space-x-4">
              <HabitBlock
                habit={routineHabit.habit}
                routineHabit={routineHabit}
                completion={completion}
                onToggle={() => onToggleCompletion(routineHabit.habitId)}
                onDelete={onDeleteHabit ? () => onDeleteHabit(routineHabit.habitId, routine.id) : undefined}
                color={color}
                isFirst={index === 0}
              />
              
              {index < routine.habits.length - 1 && (
                <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                  <ArrowRight size={20} />
                </div>
              )}
            </div>
          );
        })}
        
        {/* Add habit button */}
        {onAddHabit && (
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
              <ArrowRight size={20} />
            </div>
            <Button
              variant="ghost"
              onClick={() => onAddHabit(routine.id)}
              className="flex-shrink-0 w-[280px] h-[120px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-habit-purple hover:bg-pastel-purple/40 dark:hover:bg-pastel-purple/30 transition-all duration-200 group active:scale-[0.98]"
            >
              <div className="flex flex-col items-center space-y-2 text-gray-400 dark:text-gray-500 group-hover:text-habit-purple">
                <Plus size={24} />
                <span className="text-sm font-medium">Add Habit</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
