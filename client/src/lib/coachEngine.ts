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

// --- Expanded Coach Knowledge Base ---
const COACH_KNOWLEDGE: Record<string, { triggers: string[], response: string }> = {
  procrastination: {
    triggers: ["procrastinate", "procrastination", "delay", "laziness", "lazy", "starting", "putting off"],
    response: "Procrastination is often a signal of overwhelm or fear of failure, not a lack of discipline. Try the '2-Minute Rule': if it takes less than 2 minutes, do it now. For bigger tasks, commit to just the first tiny step. The goal is to lower the barrier to entry until it's impossible to say no."
  },
  focus: {
    triggers: ["focus", "distracted", "attention", "concentrate", "distraction", "phone", "interrupt"],
    response: "Deep focus is a skill that requires protection. Try 'Monk Mode': put your phone in another room, close all unrelated tabs, and set a timer for 25 minutes. If a distracting thought pops up, write it down on a 'distraction list' to deal with later, and immediately return to your task."
  },
  consistency: {
    triggers: ["consistent", "consistency", "habit", "routine", "every day", "give up", "failed", "broken"],
    response: "Consistency is built on 'low-floor' habits. If you're too tired to do your full routine, do the '1-minute version'. The most important thing is to keep the identity of 'someone who shows up' alive. Remember: Never miss twice. One miss is a mistake; two misses is the start of a new habit."
  },
  stress: {
    triggers: ["stress", "stressed", "anxious", "anxiety", "overwhelmed", "too much", "burnout", "pressure"],
    response: "When stress peaks, your priority must shift from 'output' to 'regulation'. Try 'Selective Deferral': Look at your list and pick the 3 things that *truly* matter today. Give yourself explicit permission to ignore the rest. Clarity comes from pruning, not from doing more."
  },
  motivation: {
    triggers: ["motivation", "motivated", "don't feel like", "unmotivated", "drive", "energy", "blah"],
    response: "Motivation is a feeling that follows action, it doesn't precede it. Don't wait for the 'spark'. Instead, focus on 'Action-First' discipline. Start moving, and the motivation will catch up. Also, check your 'Why'—is this goal yours, or someone else's expectation?"
  },
  time: {
    triggers: ["time", "busy", "no time", "running out", "schedule", "too busy", "hours"],
    response: "We don't 'have' time; we 'make' time for what we value. Audit your day: where is your time leaking? Often, it's in the transitions. Try 'Time Boxing'—assigning a specific fixed block to a specific task. If it's not on the calendar, it's just a wish."
  }
};

// Dynamic AI response logic
export async function generateCoachResponse(userId: string, userMessage: string) {
  const context = await getCoachContext(userId);
  const profile = await getCoachProfile(userId);
  const messages = await getCoachMessages(userId);
  const lowerMsg = userMessage.toLowerCase();
  
  const reflections = context.recentReflections;
  const recentMood = reflections[0]?.mood || "balanced";

  // 1. Check Knowledge Base for specific problems
  for (const [key, data] of Object.entries(COACH_KNOWLEDGE)) {
    if (data.triggers.some(t => lowerMsg.includes(t))) {
      return `I hear you on the struggle with ${key}. ${data.response} What's one small way you can apply this to your current situation?`;
    }
  }

  // 2. Initial Growth Tips (After Onboarding)
  if (lowerMsg.includes("ready to begin this journey") || lowerMsg.includes("shared my vision")) {
    const vision = profile?.data?.ideal_self || "your growth";
    const blocker = profile?.data?.blockers || "obstacles";
    
    return `It's an honor to guide you on your path toward becoming ${vision}. 

Based on our onboarding, here is your personalized Growth Strategy:

1. **The ${blocker} Antidote**: Since you mentioned ${blocker} is a challenge, we will focus on 'Small Wins' this week.
2. **Peak Energy Use**: You mentioned being most productive in the ${profile?.data?.productivity || 'day'}. Let's protect those hours for your ${profile?.data?.goals || 'main goals'}.
3. **Intentional Reflection**: Every evening, I want you to log one thing that went well, no matter how small.

How does this strategy feel to you?`;
  }

  // 3. Support for Low Mood/Stress
  if (recentMood === "stressed" || recentMood === "tired") {
    return `I've noticed your recent reflections mention feeling ${recentMood}. In this state, 'Maximum Productivity' is a trap. I recommend 'The Rule of One': pick just ONE task that will make you feel best to finish, and consider the day a victory if you do only that. Which task would that be?`;
  }

  // 4. History-Aware Response (To avoid repeating Case 4)
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
  const aspiration = profile?.data?.improvement || "growth";

  if (lastAssistantMsg?.content.includes("currently on your mind")) {
    return `I'm deeply interested in how your ${aspiration} is evolving. Looking at your habits, you've been ${context.allHabits.some(h => h.streak > 0) ? 'showing up' : 'observing your routine'}. What's one thing you've learned about yourself this week?`;
  }

  // Default reflective engagement
  return `I'm reflecting on your goal to improve ${aspiration}. I've noticed you've been ${context.recentTasks.filter(t => t.completed).length > 0 ? 'moving through your tasks' : 'considering your next steps'} today. How can we make the next hour feel more intentional for you?`;
}
