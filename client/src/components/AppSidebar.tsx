import { Calendar, Target, TrendingUp, Timer } from "lucide-react";
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
import LanguageSelector from "@/components/LanguageSelector";

export function AppSidebar() {
  const [location] = useLocation();
  const { t } = useTranslation();

  const items = [
    { title: t("today"), url: "/", icon: Calendar },
    { title: t("goals"), url: "/goals", icon: Target },
    { title: t("habits"), url: "/habits", icon: TrendingUp },
    { title: t("focus"), url: "/focus", icon: Timer },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-6">
            <h2 className="text-xl font-semibold text-foreground">ProductivePro</h2>
            <LanguageSelector />
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
