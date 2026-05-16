import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { 
  getCoachMessages, 
  getCoachProfile, 
  saveCoachMessage, 
  updateCoachProfile, 
  generateCoachResponse 
} from "@/lib/coachEngine";
import CoachOnboarding from "@/components/CoachOnboarding";
import CoachChat from "@/components/CoachChat";
import { LoadingScreen } from "@/components/LoadingScreen";
import type { CoachMessage } from "@/types/coach";

export default function CoachPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!user) return;

    const initCoach = async () => {
      try {
        const [profile, history] = await Promise.all([
          getCoachProfile(user.id),
          getCoachMessages(user.id)
        ]);

        if (profile?.data?.onboarding_completed) {
          setOnboardingCompleted(true);
        }
        setMessages(history);
      } catch (err) {
        console.error("Error initializing coach:", err);
      } finally {
        setLoading(false);
      }
    };

    initCoach();
  }, [user]);

  const handleOnboardingComplete = async (data: any) => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Update profile
      await updateCoachProfile(user.id, {
        onboarding_completed: true,
        ...data
      });

      // 2. Add first user message to history
      const welcomeContent = `I've shared my vision: ${data.ideal_self || 'to grow intentionally'}. I'm ready to begin this journey.`;
      await saveCoachMessage(user.id, 'user', welcomeContent);
      
      // 3. Generate first AI response dynamically
      const aiResponse = await generateCoachResponse(user.id, welcomeContent);
      const savedAiMsg = await saveCoachMessage(user.id, 'assistant', aiResponse);

      setMessages([
        { id: 'initial-user', role: 'user', content: welcomeContent, created_at: new Date().toISOString() },
        savedAiMsg
      ]);
      setOnboardingCompleted(true);
    } catch (err) {
      console.error("Error completing onboarding:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    try {
      // 1. Save user message
      const userMsg = await saveCoachMessage(user.id, 'user', content);
      setMessages(prev => [...prev, userMsg]);
      
      // 2. Generate AI response
      setIsTyping(true);
      const aiContent = await generateCoachResponse(user.id, content);
      const aiMsg = await saveCoachMessage(user.id, 'assistant', aiContent);
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="h-full bg-background overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {!onboardingCompleted ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto"
          >
            <CoachOnboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-hidden"
          >
            <CoachChat 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isTyping={isTyping}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
