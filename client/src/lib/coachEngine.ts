import { supabase } from "./supabase";
import { format, subDays } from "date-fns";
import type { CoachMessage, CoachProfileData } from "@/types/coach";

export async function getCoachContext(userId: string) {
  const today = format(new Date(), "yyyy-MM-dd");
  const sevenDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd"); // Get more history for better insights

  const [
    { data: tasks },
    { data: habits },
    { data: reflections }
  ] = await Promise.all([
    supabase.from("tasks").select("*").eq("user_id", userId).gte("scheduled_date", sevenDaysAgo),
    supabase.from("habits").select("*").eq("user_id", userId),
    supabase.from("reflections").select("*").eq("user_id", userId).gte("created_at", sevenDaysAgo)
  ]);

  return {
    recentTasks: tasks || [],
    allHabits: habits || [],
    recentReflections: reflections || []
  };
}

export async function saveCoachMessage(userId: string, role: 'user' | 'assistant', content: string) {
  const { data, error } = await supabase
    .from("coach_conversations")
    .insert({ user_id: userId, role, content })
    .select()
    .single();
  
  if (error) throw error;
  return data as CoachMessage;
}

export async function getCoachMessages(userId: string) {
  const { data, error } = await supabase
    .from("coach_conversations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  
  if (error) throw error;
  return data as CoachMessage[];
}

export async function getCoachProfile(userId: string) {
  const { data, error } = await supabase
    .from("coach_profile")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateCoachProfile(userId: string, profileData: Partial<CoachProfileData>) {
  let existingData = {};
  try {
    const { data: existing, error } = await supabase
      .from("coach_profile")
      .select("data")
      .eq("user_id", userId)
      .single();
    
    if (!error && existing) {
      existingData = existing.data || {};
    }
  } catch (e) {
    // Ignore error
  }
  
  const newData = { ...existingData, ...profileData };

  const { error } = await supabase
    .from("coach_profile")
    .upsert({ user_id: userId, data: newData, updated_at: new Date().toISOString() });
  
  if (error) throw error;
}

// Dynamic AI response logic
export async function generateCoachResponse(userId: string, userMessage: string) {
  const context = await getCoachContext(userId);
  const profile = await getCoachProfile(userId);
  
  const habits = context.allHabits;
  const topHabit = habits.sort((a, b) => (b.streak || 0) - (a.streak || 0))[0];
  const reflections = context.recentReflections;
  const recentMood = reflections[0]?.mood || "balanced";

  // Case 1: Initial Growth Tips (After Onboarding)
  if (userMessage.includes("ready to begin this journey")) {
    const vision = profile?.data?.ideal_self || "your growth";
    const blocker = profile?.data?.blockers || "obstacles";
    
    return `It's an honor to guide you on your path toward becoming ${vision}. 

I've analyzed your starting point. Here are my first recommendations:

1. **Habit Tip**: Since you mentioned struggle with ${blocker}, try 'Habit Stacking'. Link your hardest habit to your most consistent one.
2. **Task Strategy**: You mentioned being most productive in the ${profile?.data?.productivity || 'morning'}. Protect that time by scheduling your most 'Deep Work' tasks then.
3. **Daily Action**: Today, I suggest starting one small task related to your goal of ${profile?.data?.goals || 'improvement'}.

How does this plan sound for our first step together?`;
  }

  // Case 2: Momentum Recognition
  if (topHabit && topHabit.streak > 3) {
    return `I see you've maintained a ${topHabit.streak}-day streak for ${topHabit.title}. This consistency is your superpower. How can we apply the same focus to your other ambitions today?`;
  }

  // Case 3: Support for Low Mood/Stress
  if (recentMood === "stressed" || recentMood === "tired") {
    return `Your recent reflections suggest you've been feeling ${recentMood}. In moments like this, your goal is not speed, but kindness. What's one task we can defer to tomorrow to give you space today?`;
  }

  // Case 4: Default reflective engagement
  return `I'm reflecting on your aspiration to improve ${profile?.data?.improvement || 'your life'}. Looking at your tasks today, which one feels like it aligns most with your 'Ideal Self'?`;
}
