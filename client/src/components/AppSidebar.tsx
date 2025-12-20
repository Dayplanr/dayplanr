import { Calendar, Target, TrendingUp, Timer, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";

export function AppSidebar() {
  const [location] = useLocation();
  const { t } = useTranslation();

  const items = [
    { title: t("today"), url: "/app", icon: Calendar },
    { title: t("goals"), url: "/app/goals", icon: Target },
    { title: t("habits"), url: "/app/habits", icon: TrendingUp },
    { title: t("focus"), url: "/app/focus", icon: Timer },
    { title: t("settings"), url: "/app/settings", icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-6">
            <h2 className="text-xl font-bold text-foreground">dayplanr</h2>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <a href={item.url} data-testid={`link-sidebar-${item.url}`}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
