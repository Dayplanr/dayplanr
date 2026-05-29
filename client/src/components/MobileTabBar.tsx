import { Calendar, Target, TrendingUp, Leaf, Brain, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";

export default function MobileTabBar() {
  const [location] = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { icon: Calendar,   label: t("today"),    path: "/app" },
    { icon: Target,     label: t("goals"),    path: "/app/goals" },
    { icon: TrendingUp, label: t("habits"),   path: "/app/habits" },
    { icon: Leaf,       label: t("reflect"),  path: "/app/focus" },
    { icon: Brain,      label: t("insights"), path: "/app/insights" },
    { icon: Settings,   label: t("settings"), path: "/app/settings" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-card-border z-50">
      <div className="flex items-center justify-between h-16 px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              data-testid={`link-tab-${tab.label.toLowerCase()}`}
              className="flex-1"
            >
              <button className="w-full flex flex-col items-center justify-center gap-1 hover-elevate active-elevate-2 rounded-md py-1 px-0.5">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive ? "text-primary scale-110" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-[9px] xs:text-[10px] tracking-tight transition-colors duration-200 ${
                    isActive ? "text-foreground font-semibold" : "text-muted-foreground font-medium"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

