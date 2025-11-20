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

export function AppSidebar() {
  const [location] = useLocation();

  const items = [
    { title: "Today", url: "/", icon: Calendar },
    { title: "Goals", url: "/goals", icon: Target },
    { title: "Habits", url: "/habits", icon: TrendingUp },
    { title: "Focus", url: "/focus", icon: Timer },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-6">
            <h2 className="text-xl font-semibold text-foreground">ProductivePro</h2>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <a href={item.url} data-testid={`link-sidebar-${item.title.toLowerCase()}`}>
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
