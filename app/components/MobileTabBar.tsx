"use client";

import { Calendar, Target, TrendingUp, Timer } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileTabBar() {
  const pathname = usePathname();

  const tabs = [
    { icon: Calendar, label: "Today", path: "/" },
    { icon: Target, label: "Goals", path: "/goals" },
    { icon: TrendingUp, label: "Habits", path: "/habits" },
    { icon: Timer, label: "Focus", path: "/focus" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-50">
      <div className="flex items-center justify-around h-16 px-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              data-testid={`link-tab-${tab.label.toLowerCase()}`}
              className="flex flex-col items-center justify-center gap-1 hover-elevate active-elevate-2 rounded-md px-3 py-2"
            >
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}
