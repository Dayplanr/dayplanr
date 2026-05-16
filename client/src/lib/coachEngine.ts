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

// --- The Growth Strategist Knowledge Base ---
const STRATEGIST_LIBRARY: Record<string, { system: string, action: string, insight: string }> = {
  procrastination: {
    system: "The 5-Minute Momentum System",
    action: "Pick your most avoided task. Set a timer for 5 minutes. Your only goal is to start. You have permission to stop after 5 minutes, but you'll likely find the inertia is broken.",
    insight: "Procrastination is often a 'fear of the first step' manifesting as busyness. We solve it with movement, not thought."
  },
  focus: {
    system: "Environment Isolation",
    action: "Put your phone in another room. Close all browser tabs except the one you need. Work in one 25-minute 'Deep Work' block.",
    insight: "Your environment is stronger than your willpower. If you have to fight your surroundings, you've already lost half your energy."
  },
  consistency: {
    triggers: ["consistent", "consistency", "failed", "broken"],
    system: "The 'Never Miss Twice' Protocol",
    action: "If you miss a habit today, your absolute priority tomorrow is to show up, even for just 1 minute. The floor for your habit should be so low it's impossible to fail (e.g., 1 pushup).",
    insight: "Consistency isn't about perfection; it's about identity. You are becoming the person who doesn't quit."
  },
  overwhelm: {
    triggers: ["overwhelmed", "too much", "stress", "pressure"],
    system: "Selective Deferral",
    action: "Look at your list. Pick ONE thing that must happen. Explicitly 'cancel' the rest for the next 4 hours. Focus only on the 'One Thing'.",
    insight: "Overwhelm is the result of trying to solve the future in the present. We regain calm by narrowing our field of vision."
  },
  motivation: {
    system: "Action-First Discipline",
    action: "Ignore how you 'feel' for a moment. Complete one tiny, administrative task (like clearing your desk or answering one email) to generate baseline dopamine.",
    insight: "Motivation is a byproduct of progress, not a prerequisite for it. Start moving, and the drive will follow."
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
  const userAspiration = profile?.data?.improvement || "growth";
  const userVision = profile?.data?.ideal_self || "your best self";

  // 1. Problem-System Matching (The Strategist Approach)
  const problemKey = Object.keys(STRATEGIST_LIBRARY).find(key => 
    lowerMsg.includes(key) || (STRATEGIST_LIBRARY[key] as any).triggers?.some((t: string) => lowerMsg.includes(t))
  );

  if (problemKey) {
    const strat = STRATEGIST_LIBRARY[problemKey];
    return `I understand. When you're struggling with ${problemKey}, we need to move from thinking to a structured system.

**The Strategy: ${strat.system}**
*   **The Insight**: ${strat.insight}
*   **The Action**: ${strat.action}

Focus only on this single adjustment for the next few hours. We will build from there.`;
  }

  // 2. Initial Post-Onboarding Strategy
  if (lowerMsg.includes("ready to begin this journey") || lowerMsg.includes("shared my vision")) {
    const blocker = profile?.data?.blockers || "consistency";
    const productivity = profile?.data?.productivity || "day";

    return `Welcome to your growth journey. I've synthesized your onboarding data into a foundational strategy for becoming ${userVision}.

**Your Core System:**
1. **The ${blocker} Filter**: Whenever you feel ${blocker} creeping in, use the 'Minimum Viable Step'—do 1% of the task to keep momentum.
2. **Energy Protection**: Since you're most productive in the ${productivity}, we will protect that window for your ${profile?.data?.goals || 'main priorities'}. No low-value tasks allowed during this time.
3. **Daily Reflection**: Use the 'Reflect' page each evening. One sentence on what worked. This builds the self-awareness we need to scale.

Let's begin with this structure. No excessive questions—just intentional action.`;
  }

  // 3. Behavioral Adjustment based on Mood/Data
  if (recentMood === "stressed" || recentMood === "tired") {
    return `I've noted that you're feeling ${recentMood}. In this state, 'high-performance' is the wrong goal. 

**The Strategy: Maintenance Mode**
*   **The Goal**: Protect your energy.
*   **The Action**: Complete only your most critical habit. Defer everything else. 
*   **The Mindset**: Resting today is an investment in your consistency tomorrow.

I've simplified your focus. What is the one critical task you'll choose to keep?`;
  }

  // 4. Progress Analysis (Data-Driven)
  const completedToday = context.recentTasks.filter(t => t.completed).length;
  if (completedToday > 3) {
    return `You've completed ${completedToday} tasks today. You have strong momentum. 

**The Strategy: Sustained Focus**
*   **The Insight**: Momentum is easily lost if we overextend. 
*   **The Action**: Before adding anything else, take a 10-minute quiet break. Then, pick one 'deep work' task that aligns with your goal of ${userAspiration}.

You are moving effectively toward becoming ${userVision}. Keep this pace.`;
  }

  // Default: Calm, Insightful Guidance
  return `I'm analyzing your path toward ${userAspiration}. I see you've been ${context.allHabits.some(h => h.streak > 0) ? 'maintaining your core habits' : 'observing your daily patterns'}. 

**Current Insight**: Growth is often quieter than we expect. It's found in the small, boring repetitions. 

Instead of searching for a big breakthrough, identify the one 'micro-habit' you can perform right now that your ${userVision} would be proud of. Do that, then return to your day.`;
}
