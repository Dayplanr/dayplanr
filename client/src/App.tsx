import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import MobileTabBar from "@/components/MobileTabBar";
import TodayPage from "@/pages/TodayPage";
import GoalsPage from "@/pages/GoalsPage";
import CreateGoalPage from "@/pages/CreateGoalPage";
import HabitsPage from "@/pages/HabitsPage";
import AddHabitPage from "@/pages/AddHabitPage";
import FocusPage from "@/pages/FocusPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TodayPage} />
      <Route path="/goals" component={GoalsPage} />
      <Route path="/goals/new" component={CreateGoalPage} />
      <Route path="/habits" component={HabitsPage} />
      <Route path="/habits/new" component={AddHabitPage} />
      <Route path="/focus" component={FocusPage} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <div className="flex h-screen w-full">
            <div className="hidden md:block">
              <AppSidebar />
            </div>
            <main className="flex-1 overflow-hidden">
              <Router />
            </main>
            <MobileTabBar />
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
