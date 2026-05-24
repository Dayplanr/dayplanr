import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Check, Sparkles, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import ReflectInsights from "@/components/ReflectInsights";
import InsightCarousel from "@/components/InsightCarousel";
import { generateReflectInsights } from "@/lib/insightEngine";

const MOODS = [
  { id: "great", emoji: "✨", label: "Great" },
  { id: "bad", emoji: "👎", label: "Bad" },
  { id: "okay", emoji: "😐", label: "Okay" },
  { id: "stressed", emoji: "😰", label: "Stressed" },
  { id: "tired", emoji: "😴", label: "Tired" },
];

interface Reflection {
  id: string;
  mood: string | null;
  progress: string | null;
  challenge: string | null;
  next_step: string | null;
  created_at: string;
}

export default function ReflectPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const MOODS = [
    { id: "great", emoji: "✨", label: t("mood_great") },
    { id: "okay", emoji: "😐", label: t("mood_okay") },
    { id: "stressed", emoji: "😰", label: t("mood_stressed") },
    { id: "tired", emoji: "😴", label: t("mood_tired") },
    { id: "bad", emoji: "👎", label: t("mood_bad") },
  ];

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [challenge, setChallenge] = useState("");
  const [nextStep, setNextStep] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const [history, setHistory] = useState<Reflection[]>([]);
  const [showInsights, setShowInsights] = useState(false);

  const reflectInsights = useMemo(() =>
    generateReflectInsights(
      history.map(r => ({ id: r.id, mood: r.mood, progress: r.progress, challenge: r.challenge, next_step: r.next_step, created_at: r.created_at })),
      [], // tasks not loaded on this page; insights degrade gracefully
      t
    ), [history, t]
  );

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("reflections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching reflections:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Please sign in to save reflections", variant: "destructive" });
      return;
    }
    if (!selectedMood && !progress && !challenge && !nextStep) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase.from("reflections").insert({
        user_id: user.id,
        mood: selectedMood,
        progress: progress.trim() || null,
        challenge: challenge.trim() || null,
        next_step: nextStep.trim() || null,
      });

      if (error) throw error;

      setIsSaved(true);
      toast({
        title: t("reflectSaved"),
        description: t("reflectDescription"),
      });

      fetchHistory();

      // Reset saved state after 3 seconds
      setTimeout(() => {
        setIsSaved(false);
        setSelectedMood(null);
        setProgress("");
        setChallenge("");
        setNextStep("");
      }, 3000);
    } catch (error: any) {
      toast({ title: "Error saving reflection", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      key={language}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto pb-20 md:pb-4 bg-background/50"
    >
      <div className="max-w-3xl mx-auto p-[24px] space-y-8 animate-in fade-in duration-700 ease-out">
        
        {/* Header */}
        <div className="pt-4 pb-2 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("reflect")}
            </h1>
            <p className="text-[15px] text-muted-foreground mt-2">
              {t("reflectDescription")}
            </p>
          </div>
          <Button
            onClick={() => setShowInsights(true)}
            variant="outline"
            size="icon"
            className="rounded-full h-11 w-11 border-border/50 bg-background/50 hover:bg-accent backdrop-blur-sm shadow-sm"
          >
            <TrendingUp className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-[16px]">
          {/* Mood Section */}
          <div 
            className="bg-card p-[20px] rounded-2xl shadow-sm border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both"
          >
            <label className="block text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-4">
              {t("reflectMood")}
            </label>
            <div className="flex flex-wrap gap-3">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300
                    hover:scale-[1.03] active:scale-[0.97]
                    ${selectedMood === mood.id 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-muted text-muted-foreground hover:bg-accent"}
                  `}
                >
                  <span className="text-lg">{mood.emoji}</span>
                  <span className={`text-sm font-medium ${selectedMood === mood.id ? "text-primary-foreground" : "text-foreground"}`}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Progress Card */}
          <div 
            className="bg-card p-[20px] rounded-2xl shadow-sm border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both focus-within:ring-2 focus-within:ring-primary/30 transition-shadow"
          >
            <label htmlFor="progress" className="block text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">
              {t("reflectProgress")}
            </label>
            <textarea
              id="progress"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder={t("reflectProgressPlaceholder")}
              className="w-full bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground/60 min-h-[80px] transition-all text-[15px]"
            />
          </div>

          {/* Challenge Card */}
          <div 
            className="bg-card p-[20px] rounded-2xl shadow-sm border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both focus-within:ring-2 focus-within:ring-primary/30 transition-shadow"
          >
            <label htmlFor="challenge" className="block text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">
              {t("reflectChallenge")}
            </label>
            <textarea
              id="challenge"
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder={t("reflectChallengePlaceholder")}
              className="w-full bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground/60 min-h-[80px] transition-all text-[15px]"
            />
          </div>

          {/* Next Step Card */}
          <div 
            className="bg-card p-[20px] rounded-2xl shadow-sm border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both focus-within:ring-2 focus-within:ring-primary/30 transition-shadow"
          >
            <label htmlFor="nextStep" className="block text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">
              {t("reflectNextStep")}
            </label>
            <textarea
              id="nextStep"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder={t("reflectNextStepPlaceholder")}
              className="w-full bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground/60 min-h-[80px] transition-all text-[15px]"
            />
          </div>
        </div>

        {/* Reflect Insights Carousel */}
        {reflectInsights.length > 0 && (
          <div className="pb-2">
            <InsightCarousel insights={reflectInsights} label={t("emotional_patterns")} compact />
          </div>
        )}

        {/* Sticky Save Button */}
        <div className="sticky bottom-24 md:bottom-8 pt-4 pb-4 bg-gradient-to-t from-background/50 via-background/50 to-transparent z-10 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving || isSaved || (!selectedMood && !progress && !challenge && !nextStep)}
            className={`
              h-12 px-8 rounded-full font-medium text-primary-foreground transition-all duration-500 ease-out shadow-lg
              ${isSaved ? "bg-emerald-500 hover:bg-emerald-600 scale-105" : "bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"}
              disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed
            `}
          >
            {isSaved ? (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5 animate-in zoom-in duration-300" />
                {t("reflectSaved")}
              </span>
            ) : isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {t("reflect_saving")}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t("reflectSave")}
              </span>
            )}
          </Button>
        </div>

      </div>

      <ReflectInsights 
        open={showInsights} 
        onOpenChange={setShowInsights} 
        history={history} 
      />
    </motion.div>
  );
}
