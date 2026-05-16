import { supabase } from "./supabase";
import { format, subDays } from "date-fns";
import type { CoachMessage, CoachProfileData } from "@/types/coach";

export async function getCoachContext(userId: string) {
  const today = format(new Date(), "yyyy-MM-dd");
  const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");

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
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'not found'
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
    // Ignore error if profile doesn't exist
  }
  
  const newData = { ...existingData, ...profileData };

  const { error } = await supabase
    .from("coach_profile")
    .upsert({ 
      user_id: userId, 
      data: newData, 
      updated_at: new Date().toISOString() 
    });
  
  if (error) throw error;
}

// Mock AI response for now (to be replaced with actual LLM call)
export async function generateCoachResponse(userId: string, userMessage: string) {
  // In a real scenario, this would call a Supabase Edge Function or LLM API
  // For now, we simulate a calm, thoughtful coach
  const context = await getCoachContext(userId);
  const profile = await getCoachProfile(userId);
  
  // Logic to determine tone and response based on context
  // ...
  
  return "I hear you. Based on your progress with habits this week, I've noticed you're most consistent in the mornings. How does it feel to have that momentum early in the day?";
}
