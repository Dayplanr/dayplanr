import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { 
  getCoachMessages, 
  getCoachProfile, 
  saveCoachMessage, 
  updateCoachProfile, 
  generateCoachResponse,
  executeCoachAction
} from "@/lib/coachEngine";
import CoachOnboarding from "@/components/CoachOnboarding";
import CoachChat from "@/components/CoachChat";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useToast } from "@/hooks/use-toast";
import type { CoachMessage, CoachAction } from "@/types/coach";

export default function CoachPage() {
  const { user } = useAuth();
  const { toast } = useToast();
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
      await updateCoachProfile(user.id, {
        onboarding_completed: true,
        ...data
      });

      const welcomeContent = `I've shared my vision: ${data.ideal_self || 'to grow intentionally'}. I'm ready to begin this journey.`;
      const userMsg = await saveCoachMessage(user.id, 'user', welcomeContent);
      
      setIsTyping(true);
      const aiResponse = await generateCoachResponse(user.id, welcomeContent);
      const savedAiMsg = await saveCoachMessage(user.id, 'assistant', aiResponse.content, aiResponse.actions);

      setMessages([userMsg, savedAiMsg]);
      setOnboardingCompleted(true);
    } catch (err) {
      console.error("Error completing onboarding:", err);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    try {
      const userMsg = await saveCoachMessage(user.id, 'user', content);
      setMessages(prev => [...prev, userMsg]);
      
      setIsTyping(true);
      const aiResponse = await generateCoachResponse(user.id, content);
      const aiMsg = await saveCoachMessage(user.id, 'assistant', aiResponse.content, aiResponse.actions);
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = async (action: CoachAction) => {
    if (!user) return;
    try {
      await executeCoachAction(user.id, action);
      toast({
        title: "Success",
        description: `Successfully added: ${action.payload.title}`,
      });
    } catch (err) {
      console.error("Error executing coach action:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add the habit. Please try again.",
      });
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
              onAction={handleAction}
              isTyping={isTyping}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
