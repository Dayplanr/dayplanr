import { supabase } from "./supabase";
import { calculateGoalProgress, Milestone } from "@/types/goals";

/**
 * Recalculates and updates the progress of a specific goal in the database.
 * Progress is calculated based on both milestones and linked tasks.
 */
export async function updateGoalProgress(goalId: string, userId: string) {
  try {
    // 1. Fetch milestones
    const { data: milestones } = await supabase
      .from("milestones")
      .select("completed")
      .eq("goal_id", goalId);

    // 2. Fetch linked tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("completed")
      .eq("goal_id", goalId)
      .eq("user_id", userId);

    // 3. Calculate new progress
    const ms: Milestone[] = (milestones || []).map(m => ({ completed: m.completed } as any));
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.completed).length || 0;

    const newProgress = calculateGoalProgress(ms, totalTasks, completedTasks);

    // 4. Update goal
    const { error } = await supabase
      .from("goals")
      .update({ 
        progress: newProgress,
        last_activity_at: new Date().toISOString()
      })
      .eq("id", goalId);

    if (error) throw error;
    
    return newProgress;
  } catch (error) {
    console.error("Failed to update goal progress:", error);
    return null;
  }
}
