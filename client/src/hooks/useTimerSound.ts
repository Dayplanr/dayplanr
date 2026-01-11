import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { timerSounds } from "@/lib/timerSounds";

export const useTimerSound = () => {
  const { user } = useAuth();
  const [timerSound, setTimerSound] = useState("radar"); // Updated default to radar
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTimerSound();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadTimerSound = async () => {
    try {
      console.log("🔊 Loading timer sound setting for user:", user?.id);
      
      const { data, error } = await supabase
        .from("user_settings")
        .select("timer_sound")
        .eq("user_id", user?.id)
        .single();

      if (error) {
        console.log("🔊 Database error, checking localStorage fallback:", error);
        
        // Check localStorage fallback
        const localSound = localStorage.getItem(`timer_sound_${user?.id}`);
        if (localSound && timerSounds.find(s => s.value === localSound)) {
          console.log("🔊 Using localStorage timer sound:", localSound);
          setTimerSound(localSound);
        } else {
          console.log("🔊 No valid fallback found, using default 'radar' sound");
          setTimerSound("radar");
        }
      } else if (data && data.timer_sound) {
        console.log("🔊 Loaded timer sound setting from database:", data.timer_sound);
        setTimerSound(data.timer_sound);
        // Also save to localStorage for future fallback
        localStorage.setItem(`timer_sound_${user?.id}`, data.timer_sound);
      } else {
        console.log("🔊 No timer sound in database settings, using default 'radar'");
        setTimerSound("radar");
      }
    } catch (error) {
      console.error("Error loading timer sound setting:", error);
      
      // Try localStorage fallback
      const localSound = localStorage.getItem(`timer_sound_${user?.id}`);
      if (localSound && timerSounds.find(s => s.value === localSound)) {
        console.log("🔊 Using localStorage fallback:", localSound);
        setTimerSound(localSound);
      } else {
        setTimerSound("radar"); // Fallback to default
      }
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription to user_settings changes
  useEffect(() => {
    if (!user) return;

    console.log("🔊 Setting up real-time subscription for timer sound changes");
    
    const subscription = supabase
      .channel(`user_settings_${user.id}`) // Unique channel per user
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("🔊 Real-time timer sound setting change detected:", payload);
          
          // Only update if it's a different value to avoid loops
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (payload.new && payload.new.timer_sound && payload.new.timer_sound !== timerSound) {
              console.log("🔊 Updating timer sound via real-time to:", payload.new.timer_sound);
              setTimerSound(payload.new.timer_sound);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("🔊 Timer sound subscription status:", status);
      });

    return () => {
      console.log("🔊 Cleaning up timer sound subscription");
      subscription.unsubscribe();
    };
  }, [user, timerSound]); // Add timerSound to dependencies

  return {
    timerSound,
    loading,
    refreshTimerSound: loadTimerSound, // Manual refresh function
  };
};