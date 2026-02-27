import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LanguageProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { AppSidebar } from "@/components/AppSidebar";
import MobileTabBar from "@/components/MobileTabBar";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import TodayPage from "@/pages/TodayPage";
import GoalsPage from "@/pages/GoalsPage";
import CreateGoalPage from "@/pages/CreateGoalPage";
import HabitsPage from "@/pages/HabitsPage";
import AddHabitPage from "@/pages/AddHabitPage";
import AddTaskPage from "@/pages/AddTaskPage";
import FocusPage from "@/pages/FocusPage";
import SettingsPage from "@/pages/SettingsPage";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AuthProvider, useAuth } from "./lib/auth";
import { Redirect } from "wouter";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect to="/auth" />;

  return <Component />;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/app">
        <ProtectedRoute component={TodayPage} />
      </Route>
      <Route path="/app/tasks/new">
        <ProtectedRoute component={AddTaskPage} />
      </Route>
      <Route path="/app/goals">
        <ProtectedRoute component={GoalsPage} />
      </Route>
      <Route path="/app/goals/new">
        <ProtectedRoute component={CreateGoalPage} />
      </Route>
      <Route path="/app/habits">
        <ProtectedRoute component={HabitsPage} />
      </Route>
      <Route path="/app/habits/new">
        <ProtectedRoute component={AddHabitPage} />
      </Route>
      <Route path="/app/focus">
        <ProtectedRoute component={FocusPage} />
      </Route>
      <Route path="/app/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
              <AppContent />
              <Toaster />
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isAppRoute = location.startsWith("/app");
  const { user, loading } = useAuth();

  // Show nothing while checking for existing session
  if (loading) {
    return <LoadingScreen />;
  }

  // If user is logged in but at root/auth, redirect to app
  if (user && !isAppRoute) {
    return <Redirect to="/app" />;
  }

  return isAppRoute ? (
    <AppLayout />
  ) : (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

export default App;
