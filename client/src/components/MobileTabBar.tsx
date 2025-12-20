import { Calendar, Target, TrendingUp, Timer, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";

export default function MobileTabBar() {
  const [location] = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { icon: Calendar, label: t("today"), path: "/app" },
    { icon: Target, label: t("goals"), path: "/app/goals" },
    { icon: TrendingUp, label: t("habits"), path: "/app/habits" },
    { icon: Timer, label: t("focus"), path: "/app/focus" },
    { icon: Settings, label: t("settings"), path: "/app/settings" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-50">
      <div className="flex items-center justify-around h-16 px-4">
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              data-testid={`link-tab-${tab.label.toLowerCase()}`}
            >
              <button className="flex flex-col items-center justify-center gap-1 hover-elevate active-elevate-2 rounded-md px-3 py-2">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-primary fill-current" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-xs ${
                    isActive ? "text-foreground font-medium" : "text-muted-foreground"
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
