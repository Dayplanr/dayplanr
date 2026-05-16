import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Sparkles } from "lucide-react";

interface CoachOnboardingProps {
  onComplete: (data: any) => void;
}

const QUESTIONS = [
  {
    id: "goals",
    question: "What are your current goals?",
    subtext: "Think about what matters most to you right now.",
    placeholder: "I want to focus on..."
  },
  {
    id: "improvement",
    question: "What areas of your life do you want to improve?",
    subtext: "Career, health, relationships, or personal growth?",
    placeholder: "I'd like to improve..."
  },
  {
    id: "blockers",
    question: "What usually blocks your progress?",
    subtext: "Identify the internal or external obstacles.",
    placeholder: "I often struggle with..."
  },
  {
    id: "productivity",
    question: "When do you feel most productive?",
    subtext: "Morning, late night, or somewhere in between?",
    placeholder: "My peak focus is usually..."
  },
  {
    id: "habits",
    question: "What habits are hardest to maintain?",
    subtext: "Be honest about where consistency fails.",
    placeholder: "I find it hard to..."
  },
  {
    id: "ideal_self",
    question: "What does your ideal future self look like?",
    subtext: "Describe the person you are becoming.",
    placeholder: "My ideal self is..."
  }
];

export default function CoachOnboarding({ onComplete }: CoachOnboardingProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");

  const handleNext = () => {
    const updatedAnswers = { ...answers, [QUESTIONS[step].id]: currentAnswer };
    setAnswers(updatedAnswers);
    
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      setCurrentAnswer(answers[QUESTIONS[step + 1].id] || "");
    } else {
      onComplete(updatedAnswers);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setCurrentAnswer(answers[QUESTIONS[step - 1].id] || "");
    }
  };

  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-12 flex flex-col h-full justify-center">
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Onboarding</span>
          </div>
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                {QUESTIONS[step].question}
              </h2>
              <p className="text-muted-foreground text-lg italic font-serif">
                {QUESTIONS[step].subtext}
              </p>
            </div>

            <Textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder={QUESTIONS[step].placeholder}
              className="min-h-[150px] text-lg p-4 bg-background/50 border-border/50 focus:border-primary/50 transition-all resize-none"
              autoFocus
            />

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 0}
                className="text-muted-foreground hover:text-foreground"
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!currentAnswer.trim()}
                className="gap-2 px-8 h-12 text-lg rounded-full shadow-lg shadow-primary/20"
              >
                {step === QUESTIONS.length - 1 ? "Complete Profile" : "Continue"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
