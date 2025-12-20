import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { I18nProvider } from "@/lib/i18n";
import { AppSidebar } from "@/components/AppSidebar";
import MobileTabBar from "@/components/MobileTabBar";
import LandingPage from "@/pages/LandingPage";
import TodayPage from "@/pages/TodayPage";
import GoalsPage from "@/pages/GoalsPage";
import CreateGoalPage from "@/pages/CreateGoalPage";
import HabitsPage from "@/pages/HabitsPage";
import AddHabitPage from "@/pages/AddHabitPage";
import AddTaskPage from "@/pages/AddTaskPage";
import FocusPage from "@/pages/FocusPage";
import SettingsPage from "@/pages/SettingsPage";

function AppRouter() {
  return (
    <Switch>
      <Route path="/app" component={TodayPage} />
      <Route path="/app/tasks/new" component={AddTaskPage} />
      <Route path="/app/goals" component={GoalsPage} />
      <Route path="/app/goals/new" component={CreateGoalPage} />
      <Route path="/app/habits" component={HabitsPage} />
      <Route path="/app/habits/new" component={AddHabitPage} />
      <Route path="/app/focus" component={FocusPage} />
      <Route path="/app/settings" component={SettingsPage} />
    </Switch>
  );
}

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <main className="flex-1 overflow-hidden">
          <AppRouter />
        </main>
        <MobileTabBar />
      </div>
    </SidebarProvider>
  );
}

function App() {
  const [location] = useLocation();
  const isAppRoute = location.startsWith("/app");

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          {isAppRoute ? (
            <AppLayout />
          ) : (
            <Switch>
              <Route path="/" component={LandingPage} />
            </Switch>
          )}
          <Toaster />
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
