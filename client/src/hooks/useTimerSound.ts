import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const useTimerSound = () => {
  const { user } = useAuth();
  const [timerSound, setTimerSound] = useState("bell");
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
        console.log("🔊 No user settings found, using default 'bell' sound");
        // If no settings exist, create default settings
        const { error: insertError } = await supabase
          .from("user_settings")
          .insert({
            user_id: user?.id,
            timer_sound: "bell"
          });
        
        if (insertError) {
          console.error("Error creating default user settings:", insertError);
        } else {
          console.log("🔊 Created default user settings with 'bell' sound");
        }
        setTimerSound("bell");
      } else if (data && data.timer_sound) {
        console.log("🔊 Loaded timer sound setting:", data.timer_sound);
        setTimerSound(data.timer_sound);
      } else {
        console.log("🔊 No timer sound in settings, using default 'bell'");
        setTimerSound("bell");
      }
    } catch (error) {
      console.error("Error loading timer sound setting:", error);
      setTimerSound("bell"); // Fallback to default
    } finally {
      setLoading(false);
    }
  };

  return {
    timerSound,
    loading,
    refreshTimerSound: loadTimerSound, // Add refresh function
  };
};