import { supabase } from "./supabase";
import { format, subDays } from "date-fns";
import type { CoachMessage, CoachProfile, CoachAction } from "@/types/coach";

// --- The Growth Strategist Knowledge Base ---
const STRATEGIST_LIBRARY: Record<string, { system: string, action: string, insight: string, triggers?: string[] }> = {
  habits: {
    triggers: ["habit", "habits", "routine", "building habits", "create", "start"],
    system: "Habit Stacking & Anchoring",
    action: "Identify an existing habit you do without thinking (like brushing your teeth or making coffee). 'Anchor' your new habit to it: 'After I [Existing Habit], I will [New Habit]'. Keep the new habit under 2 minutes for the first 14 days.",
    insight: "We don't build habits by willpower; we build them by design. Link the new to the known."
  },
  procrastination: {
    triggers: ["procrastinate", "procrastination", "delay", "laziness", "lazy", "starting", "putting off"],
    system: "The 5-Minute Momentum System",
    action: "Pick your most avoided task. Set a timer for 5 minutes. Your only goal is to start. You have permission to stop after 5 minutes, but you'll likely find the inertia is broken.",
    insight: "Procrastination is often a 'fear of the first step' manifesting as busyness. We solve it with movement, not thought."
  },
  focus: {
    triggers: ["focus", "distracted", "attention", "concentrate", "distraction", "phone", "interrupt"],
    system: "Environment Isolation",
    action: "Put your phone in another room. Close all browser tabs except the one you need. Work in one 25-minute 'Deep Work' block.",
    insight: "Your environment is stronger than your willpower. If you have to fight your surroundings, you've already lost half your energy."
  },
  consistency: {
    triggers: ["consistent", "consistency", "failed", "broken", "streak"],
    system: "The 'Never Miss Twice' Protocol",
    action: "If you miss a habit today, your absolute priority tomorrow is to show up, even for just 1 minute. The floor for your habit should be so low it's impossible to fail (e.g., 1 pushup).",
    insight: "Consistency isn't about perfection; it means not quitting after a bad day. You are becoming the person who doesn't quit."
  },
  overwhelm: {
    triggers: ["overwhelmed", "too much", "stress", "pressure", "anxious", "anxiety"],
    system: "Selective Deferral",
    action: "Look at your list. Pick ONE thing that must happen. Explicitly 'cancel' the rest for the next 4 hours. Focus only on the 'One Thing'.",
    insight: "Overwhelm is the result of trying to solve the future in the present. We regain calm by narrowing our field of vision."
  },
  motivation: {
    triggers: ["motivation", "motivated", "don't feel like", "unmotivated", "drive", "energy", "blah"],
    system: "Action-First Discipline",
    action: "Ignore how you 'feel' for a moment. Complete one tiny, administrative task (like clearing your desk or answering one email) to generate baseline dopamine.",
    insight: "Motivation is a byproduct of progress, not a prerequisite for it. Start moving, and the drive will follow."
  }
};

export async function getCoachMessages(userId: string): Promise<CoachMessage[]> {
  const { data, error } = await supabase
    .from("coach_conversations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function saveCoachMessage(userId: string, role: 'user' | 'assistant', content: string, actions?: CoachAction[]) {
  const { data, error } = await supabase
    .from("coach_conversations")
    .insert({
      user_id: userId,
      role,
      content,
      actions
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function executeCoachAction(userId: string, action: CoachAction) {
  if (action.type === 'create_habit') {
    const { error } = await supabase
      .from("habits")
      .insert({
        user_id: userId,
        title: action.payload.title,
        schedule_type: action.payload.schedule_type || 'daily',
        selected_days: action.payload.selected_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        streak: 0,
        best_streak: 0,
        completed_dates: []
      });
    
    if (error) throw error;
    return true;
  }
  return false;
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

export async function updateCoachProfile(userId: string, profileData: any) {
  const { error } = await supabase
    .from("coach_profile")
    .upsert({
      user_id: userId,
      data: profileData,
      updated_at: new Date().toISOString()
    });
  
  if (error) throw error;
}

async function getCoachContext(userId: string) {
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
  
  const [tasks, habits, reflections] = await Promise.all([
    supabase.from("tasks").select("*").eq("user_id", userId).gte("created_at", thirtyDaysAgo),
    supabase.from("habits").select("*").eq("user_id", userId),
    supabase.from("reflections").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5)
  ]);

  return {
    recentTasks: tasks.data || [],
    allHabits: habits.data || [],
    recentReflections: reflections.data || []
  };
}

// Dynamic AI response logic
export async function generateCoachResponse(userId: string, userMessage: string): Promise<{ content: string, actions?: CoachAction[] }> {
  const context = await getCoachContext(userId);
  const profile = await getCoachProfile(userId);
  const lowerMsg = userMessage.toLowerCase().trim();
  
  const reflections = context.recentReflections;
  const recentMood = reflections[0]?.mood || "balanced";
  
  // Clean up profile data
  const userAspiration = (profile?.data?.improvement || "growth").replace(/\s+/g, ' ').trim();
  const userVision = (profile?.data?.ideal_self || "your best self").replace(/\s+/g, ' ').trim();
  const userGoals = (profile?.data?.goals || "").replace(/\s+/g, ' ').trim();

  // 1. Habit Selection Mode (Specific Suggestion + Actions)
  if (lowerMsg.includes("which") || lowerMsg.includes("what") || lowerMsg.includes("suggest")) {
    if (lowerMsg.includes("habit")) {
      const isFitness = userGoals.includes("fat") || userGoals.includes("muscle") || userGoals.includes("health");
      
      const actions: CoachAction[] = isFitness ? [
        { type: 'create_habit', label: 'Add Protein Breakfast', payload: { title: 'Protein-First Breakfast', schedule_type: 'daily' } },
        { type: 'create_habit', label: 'Add 10m Bodyweight', payload: { title: '10-Minute Bodyweight Session', schedule_type: 'daily' } }
      ] : [
        { type: 'create_habit', label: 'Add Deep Work', payload: { title: '5-Minute Deep Work', schedule_type: 'daily' } },
        { type: 'create_habit', label: 'Add Reflection', payload: { title: 'One-Line Reflection', schedule_type: 'daily' } }
      ];

      return {
        content: `Based on your goal to reach '${userVision}', we should move from broad aspirations to specific 'Anchor Habits'. 

**The Strategy: The Foundational Three**
*   **Recommendation 1**: ${isFitness ? 'Protein-First Breakfast' : '5-Minute Deep Work'}
*   **Recommendation 2**: ${isFitness ? '10-Minute Bodyweight Session' : 'One-Line Reflection'}

**The Insight**: Don't try to do too much at once. Pick the ONE that feels easiest to start today. I can add it to your list immediately.`,
        actions
      };
    }
  }

  // 2. Problem-System Matching (The Strategist Approach)
  const problemKey = Object.keys(STRATEGIST_LIBRARY).find(key => 
    lowerMsg.includes(key) || STRATEGIST_LIBRARY[key].triggers?.some((t: string) => lowerMsg.includes(t))
  );

  if (problemKey) {
    const strat = STRATEGIST_LIBRARY[problemKey];
    return { 
      content: `I understand. When you're struggling with ${problemKey}, we need to move from thinking to a structured system.

**The Strategy: ${strat.system}**

**The Insight**: ${strat.insight}

**The Action**: ${strat.action}

Focus only on this single adjustment for the next few hours. We will build from there.` 
    };
  }

  // 3. Behavioral Adjustment based on Mood/Data
  if (recentMood === "stressed" || recentMood === "tired") {
    return { 
      content: `I've noted that you're feeling ${recentMood}. In this state, 'high-performance' is the wrong goal. 

**The Strategy: Maintenance Mode**
*   **The Insight**: Resting today is a strategic investment in your consistency tomorrow.
*   **The Action**: Complete only your most critical 1-minute habit. Defer everything else. Give yourself explicit permission to recharge.

Your system is now in Maintenance Mode. Focus on recovery.` 
    };
  }

  // 4. Progress Analysis (Data-Driven)
  const completedToday = context.recentTasks.filter(t => t.completed).length;
  if (completedToday > 3) {
    return { 
      content: `You've completed ${completedToday} tasks today. You have strong momentum. 

**The Strategy: Sustained Focus**
*   **The Insight**: Momentum is easily lost if we overextend into burnout. 
*   **The Action**: Take a 10-minute quiet break now. Then, pick one high-value 'deep work' task that aligns with your goal of ${userAspiration}. 

You are moving effectively toward becoming ${userVision}. Stay steady.` 
    };
  }

  // Default: Calm, Systemic Observation
  return { 
    content: `I'm currently observing your trajectory toward ${userAspiration}. 

**The Strategy: The Micro-Win Protocol**
*   **The Insight**: Consistency is a battle against over-ambition. Your ${userVision} identity is built in the small, boring repetitions, not the giant leaps.
*   **The Action**: Identify the one tiny, 1-minute action you can take right now. Do it, then return to your day. 

This builds the 'habit of showing up' which is the foundation for everything else.` 
  };
}
