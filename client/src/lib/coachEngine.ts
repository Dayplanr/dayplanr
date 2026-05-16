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

// --- Coach Knowledge Base ---
const COACH_KNOWLEDGE: Record<string, { triggers: string[], response: string }> = {
  procrastination: {
    triggers: ["procrastinate", "procrastination", "delay", "laziness", "lazy", "starting"],
    response: "Procrastination is often a signal of overwhelm, not a lack of character. Try the '5-Minute Rule': commit to working on your task for just 5 minutes. The hardest part is breaking the initial inertia. Once you start, your brain's 'Zeigarnik Effect' will want to finish it."
  },
  focus: {
    triggers: ["focus", "distracted", "attention", "concentrate", "distraction", "phone"],
    response: "Focus is a muscle, not a constant state. If you're struggling to concentrate, try 'Time Blocking' or the Pomodoro technique. Also, audit your environment—is your phone within reach? Physical distance from distractions is often more effective than willpower."
  },
  consistency: {
    triggers: ["consistent", "consistency", "habit", "routine", "every day", "give up", "failed"],
    response: "Consistency doesn't mean perfection; it means not quitting after a bad day. If you miss a day, your only goal is to 'never miss twice'. Focus on the 'minimum viable version' of your habit—if you can't work out for an hour, do 10 pushups. Keep the identity alive."
  },
  stress: {
    triggers: ["stress", "stressed", "anxious", "anxiety", "overwhelmed", "too much", "burnout"],
    response: "When you're overwhelmed, your productivity shouldn't be the priority—your nervous system should be. Take a 'Selective Deferral' approach: pick one thing that *must* happen and give yourself permission to ignore the rest for 24 hours. Clarity comes from space."
  }
};

// Dynamic AI response logic
export async function generateCoachResponse(userId: string, userMessage: string) {
  const context = await getCoachContext(userId);
  const profile = await getCoachProfile(userId);
  const lowerMsg = userMessage.toLowerCase();
  
  const habits = context.allHabits;
  const reflections = context.recentReflections;
  const recentMood = reflections[0]?.mood || "balanced";

  // 1. Check Knowledge Base for specific problems
  for (const [key, data] of Object.entries(COACH_KNOWLEDGE)) {
    if (data.triggers.some(t => lowerMsg.includes(t))) {
      return `I hear you on the struggle with ${key}. ${data.response} How does that perspective change your next step?`;
    }
  }

  // 2. Initial Growth Tips (After Onboarding)
  if (lowerMsg.includes("ready to begin this journey") || lowerMsg.includes("shared my vision")) {
    const vision = profile?.data?.ideal_self || "your growth";
    const blocker = profile?.data?.blockers || "obstacles";
    
    return `It's an honor to guide you on your path toward becoming ${vision}. 

I've analyzed your starting point. Here are my first recommendations:

1. **Habit Tip**: Since you mentioned struggle with ${blocker}, try 'Habit Stacking'. Link your hardest habit to your most consistent one.
2. **Task Strategy**: You mentioned being most productive in the ${profile?.data?.productivity || 'day'}. Protect that time by scheduling your most 'Deep Work' tasks then.
3. **Daily Action**: Today, I suggest starting one small task related to your goal of ${profile?.data?.goals || 'improvement'}.

How does this plan sound for our first step together?`;
  }

  // 3. Support for Low Mood/Stress
  if (recentMood === "stressed" || recentMood === "tired") {
    return `Looking at your recent reflections, I see you've been feeling ${recentMood}. Instead of pushing for maximum productivity, what if we focused on 'Maintenance Mode' today? What's the one thing that would make you feel most at peace if finished?`;
  }

  // 4. Default reflective engagement (Personalized)
  const aspiration = profile?.data?.improvement || "growth";
  return `I'm reflecting on your goal to improve ${aspiration}. I've noticed you've been ${context.recentTasks.filter(t => t.completed).length > 0 ? 'making progress on tasks' : 'observing your patterns'} recently. Tell me more about what's currently on your mind regarding your ${aspiration}?`;
}
