import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Target, TrendingUp, Timer, ArrowRight, Check, Globe } from "lucide-react";
import { useTranslation, Language } from "@/lib/i18n";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to dayplanr",
    description: "Your all-in-one productivity companion. Let's get you started in just a few steps.",
    icon: Calendar,
    bgColor: "bg-gradient-to-br from-blue-500 to-purple-600",
  },
  {
    title: "Plan Your Day",
    description: "Create tasks organized by time of day - morning, afternoon, evening, and night.",
    icon: Calendar,
    bgColor: "bg-blue-500",
  },
  {
    title: "Track Your Goals",
    description: "Set meaningful goals and watch your progress grow with visual milestones.",
    icon: Target,
    bgColor: "bg-purple-500",
  },
  {
    title: "Build Better Habits",
    description: "Track daily habits, build streaks, and become the best version of yourself.",
    icon: TrendingUp,
    bgColor: "bg-emerald-500",
  },
  {
    title: "Stay Focused",
    description: "Use focus sessions to eliminate distractions and get into deep work mode.",
    icon: Timer,
    bgColor: "bg-orange-500",
  },
];

const languages: { code: Language; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
];

export function OnboardingModal({ open, onOpenChange, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { language, setLanguage } = useTranslation();
  const isLastStep = currentStep === steps.length;
  const isLanguageStep = currentStep === steps.length;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      onOpenChange(false);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    onOpenChange(false);
  };

  const step = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0">
        <AnimatePresence mode="wait">
          {!isLanguageStep ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              <div className={`${step.bgColor} p-8 flex items-center justify-center`}>
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-2">{step.title}</h2>
                <p className="text-muted-foreground mb-6">{step.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentStep
                            ? "bg-primary"
                            : index < currentStep
                            ? "bg-primary/50"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                    <div className={`w-2 h-2 rounded-full ${isLanguageStep ? "bg-primary" : "bg-muted"}`} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleSkip} data-testid="button-skip-onboarding">
                      Skip
                    </Button>
                    <Button size="sm" onClick={handleNext} data-testid="button-next-onboarding">
                      Next
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="language"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 p-8 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Globe className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-2">Choose Your Language</h2>
                <p className="text-muted-foreground mb-4">Select your preferred language for the app.</p>
                
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                        language === lang.code
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`button-language-${lang.code}`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.name}</span>
                      {language === lang.code && (
                        <Check className="w-4 h-4 text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {steps.map((_, index) => (
                      <div key={index} className="w-2 h-2 rounded-full bg-primary/50" />
                    ))}
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <Button onClick={handleNext} data-testid="button-start-app">
                    Let's Go!
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
