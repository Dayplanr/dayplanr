import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOODS = [
  { id: "great", emoji: "✨", label: "Great" },
  { id: "good", emoji: "😊", label: "Good" },
  { id: "okay", emoji: "😐", label: "Okay" },
  { id: "stressed", emoji: "😰", label: "Stressed" },
  { id: "tired", emoji: "😴", label: "Tired" },
];

export default function ReflectPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [challenge, setChallenge] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!selectedMood && !progress && !challenge && !nextStep) return;
    
    setIsSaving(true);
    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    setIsSaved(true);
    
    toast({
      title: t("reflectSaved"),
      description: t("reflectDescription"),
    });

    // Reset saved state after 3 seconds
    setTimeout(() => {
      setIsSaved(false);
      setSelectedMood(null);
      setProgress("");
      setChallenge("");
      setNextStep("");
    }, 3000);
  };

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4 bg-[#F8F6F2]">
      <div className="max-w-3xl mx-auto p-[24px] space-y-8 animate-in fade-in duration-700 ease-out">
        
        {/* Header */}
        <div className="pt-4 pb-2">
          <h1 className="text-3xl font-semibold text-[#111111] tracking-tight">
            {t("reflect")}
          </h1>
          <p className="text-[15px] text-[#8A8A8A] mt-2">
            {t("reflectDescription")}
          </p>
        </div>

        <div className="flex flex-col gap-[16px]">
          {/* Mood Section */}
          <div 
            className="bg-[#FFFFFF] p-[20px] rounded-2xl shadow-sm border border-black/5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both"
          >
            <label className="block text-xs uppercase text-[#8A8A8A] font-semibold tracking-wider mb-4">
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
                      ? "bg-[#C8B6A6] text-white shadow-md" 
                      : "bg-[#F8F6F2] text-[#8A8A8A] hover:bg-[#F0EFEA]"}
                  `}
                >
                  <span className="text-lg">{mood.emoji}</span>
                  <span className={`text-sm font-medium ${selectedMood === mood.id ? "text-white" : "text-[#111111]"}`}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Progress Card */}
          <div 
            className="bg-[#FFFFFF] p-[20px] rounded-2xl shadow-sm border border-black/5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both focus-within:ring-2 focus-within:ring-[#C8B6A6]/30 transition-shadow"
          >
            <label htmlFor="progress" className="block text-xs uppercase text-[#8A8A8A] font-semibold tracking-wider mb-3">
              {t("reflectProgress")}
            </label>
            <textarea
              id="progress"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder={t("reflectProgressPlaceholder")}
              className="w-full bg-transparent resize-none outline-none text-[#111111] placeholder:text-[#8A8A8A]/60 min-h-[80px] transition-all text-[15px]"
            />
          </div>

          {/* Challenge Card */}
          <div 
            className="bg-[#FFFFFF] p-[20px] rounded-2xl shadow-sm border border-black/5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both focus-within:ring-2 focus-within:ring-[#C8B6A6]/30 transition-shadow"
          >
            <label htmlFor="challenge" className="block text-xs uppercase text-[#8A8A8A] font-semibold tracking-wider mb-3">
              {t("reflectChallenge")}
            </label>
            <textarea
              id="challenge"
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder={t("reflectChallengePlaceholder")}
              className="w-full bg-transparent resize-none outline-none text-[#111111] placeholder:text-[#8A8A8A]/60 min-h-[80px] transition-all text-[15px]"
            />
          </div>

          {/* Next Step Card */}
          <div 
            className="bg-[#FFFFFF] p-[20px] rounded-2xl shadow-sm border border-black/5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both focus-within:ring-2 focus-within:ring-[#C8B6A6]/30 transition-shadow"
          >
            <label htmlFor="nextStep" className="block text-xs uppercase text-[#8A8A8A] font-semibold tracking-wider mb-3">
              {t("reflectNextStep")}
            </label>
            <textarea
              id="nextStep"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder={t("reflectNextStepPlaceholder")}
              className="w-full bg-transparent resize-none outline-none text-[#111111] placeholder:text-[#8A8A8A]/60 min-h-[80px] transition-all text-[15px]"
            />
          </div>
        </div>

        {/* Sticky Save Button */}
        <div className="sticky bottom-24 md:bottom-8 pt-4 pb-4 bg-gradient-to-t from-[#F8F6F2] via-[#F8F6F2] to-transparent z-10 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving || isSaved || (!selectedMood && !progress && !challenge && !nextStep)}
            className={`
              h-12 px-8 rounded-full font-medium text-white transition-all duration-500 ease-out shadow-lg
              ${isSaved ? "bg-emerald-500 hover:bg-emerald-600 scale-105" : "bg-[#111111] hover:bg-[#222222] hover:scale-[1.02] active:scale-[0.98]"}
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
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
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
    </div>
  );
}
