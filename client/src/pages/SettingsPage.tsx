import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import LanguageSelector from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Trash2,
  Bell,
  Palette,
  Moon,
  Smartphone,
  Globe,
  Vibrate,
  LogOut,
  Clock,
  Timer,
  ChevronRight,
  ListTodo,
  Sparkles,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { darkMode, setDarkMode, themeColor, setThemeColor } = useTheme();
  const { toast } = useToast();

  const [haptics, setHaptics] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [habitReminders, setHabitReminders] = useState(true);
  const [focusReminders, setFocusReminders] = useState(true);
  const [reminderTiming, setReminderTiming] = useState("30min");
  const [reminderStyle, setReminderStyle] = useState("gentle");
  const [incompleteNudges, setIncompleteNudges] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const themeColors = [
    { name: "Violet", value: "#8b5cf6" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Emerald", value: "#10b981" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Orange", value: "#f59e0b" },
    { name: "Indigo", value: "#6366f1" },
  ];

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (data) {
        setHaptics(data.haptics_enabled);
        setNotificationsEnabled(data.notifications_enabled);
        setTaskReminders(data.task_reminders);
        setHabitReminders(data.habit_reminders);
        setFocusReminders(data.focus_reminders);
        setReminderTiming(data.reminder_timing);
        setReminderStyle(data.reminder_style);
        setIncompleteNudges(data.incomplete_nudges);
        setDisplayName(user?.user_metadata?.full_name || "");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("user_settings")
        .update({ [key]: value })
        .eq("user_id", user.id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      toast({
        title: "Error",
        description: "Failed to save setting.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdatingPassword(true);
    try {
      // 1. Update Display Name if changed
      const currentFullName = user?.user_metadata?.full_name || "";
      if (displayName !== currentFullName) {
        const { error: profileError } = await supabase.auth.updateUser({
          data: { full_name: displayName }
        });
        if (profileError) throw profileError;
      }

      // 2. Update Password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match.",
            variant: "destructive",
          });
          return;
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (passwordError) throw passwordError;

        setNewPassword("");
        setConfirmPassword("");
      }

      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await supabase.from("tasks").delete().eq("user_id", user?.id);
      await supabase.from("habits").delete().eq("user_id", user?.id);
      await supabase.from("goals").delete().eq("user_id", user?.id);
      await supabase.from("user_settings").delete().eq("user_id", user?.id);

      await signOut();
      toast({
        title: "Account Deleted",
        description: "Your data has been permanently removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("settings")}</h1>
        </div>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t("account")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-3 hover-elevate" data-testid="button-profile">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">{t("profile")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{displayName || user?.email}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("profile")}</DialogTitle>
                  <DialogDescription>Update your personal information.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Display Name</label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input value={user?.email || ""} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold">Change Password</h4>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Password</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdateProfile} disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? "Saving..." : "Save Profile"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Separator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-3 hover-elevate" data-testid="button-delete-account">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-destructive" />
                    <span className="text-destructive">{t("deleteAccount")}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("deleteAccount")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("deleteAccountConfirm")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : t("delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t("connections")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-amber-500" />
                <span className="text-foreground">{t("notifications")}</span>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={(val) => {
                  setNotificationsEnabled(val);
                  updateSetting("notifications_enabled", val);
                }}
                data-testid="switch-notifications"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t("appearance")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-3 hover-elevate" data-testid="button-theme-color">
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-purple-500" />
                    <span className="text-foreground">{t("themeColor")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full ring-2 ring-offset-2 ring-primary" style={{ backgroundColor: themeColor }} />
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("themeColor")}</DialogTitle>
                  <DialogDescription>Choose a primary color for your workspace.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4 py-4">
                  {themeColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setThemeColor(color.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${themeColor === color.value ? "border-primary bg-primary/10" : "border-transparent hover:bg-accent"
                        }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full shadow-sm"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-xs font-medium">{color.name}</span>
                      {themeColor === color.value && <Check className="w-3 h-3 text-primary" />}
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Separator />
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-indigo-500" />
                <span className="text-foreground">{t("dark")}</span>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                data-testid="switch-dark-mode"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t("general")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-500" />
                <span className="text-foreground">{t("language")}</span>
              </div>
              <LanguageSelector />
            </div>
            <Separator />
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Vibrate className="w-5 h-5 text-orange-500" />
                <span className="text-foreground">{t("haptics")}</span>
              </div>
              <Switch
                checked={haptics}
                onCheckedChange={(val) => {
                  setHaptics(val);
                  updateSetting("haptics_enabled", val);
                }}
                data-testid="switch-haptics"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t("reminderSettings")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              {t("reminderDescription")}
            </p>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">{t("reminderCategories")}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ListTodo className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-foreground">{t("taskReminders")}</span>
                </div>
                <Switch
                  checked={taskReminders}
                  onCheckedChange={(val) => {
                    setTaskReminders(val);
                    updateSetting("task_reminders", val);
                  }}
                  data-testid="switch-task-reminders"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span className="text-sm text-foreground">{t("habitReminders")}</span>
                </div>
                <Switch
                  checked={habitReminders}
                  onCheckedChange={(val) => {
                    setHabitReminders(val);
                    updateSetting("habit_reminders", val);
                  }}
                  data-testid="switch-habit-reminders"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Timer className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-foreground">{t("focusReminders")}</span>
                </div>
                <Switch
                  checked={focusReminders}
                  onCheckedChange={(val) => {
                    setFocusReminders(val);
                    updateSetting("focus_reminders", val);
                  }}
                  data-testid="switch-focus-reminders"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-foreground">{t("incompleteNudges")}</span>
                </div>
                <Switch
                  checked={incompleteNudges}
                  onCheckedChange={(val) => {
                    setIncompleteNudges(val);
                    updateSetting("incomplete_nudges", val);
                  }}
                  data-testid="switch-incomplete-nudges"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">{t("timing")}</p>
              <Select
                value={reminderTiming}
                onValueChange={(val) => {
                  setReminderTiming(val);
                  updateSetting("reminder_timing", val);
                }}
              >
                <SelectTrigger data-testid="select-reminder-timing">
                  <SelectValue placeholder={t("timing")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attime">{t("atTime")}</SelectItem>
                  <SelectItem value="10min">{t("minutesBefore10")}</SelectItem>
                  <SelectItem value="30min">{t("minutesBefore30")}</SelectItem>
                  <SelectItem value="1hour">{t("hourBefore")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">{t("notificationStyle")}</p>
              <Select
                value={reminderStyle}
                onValueChange={(val) => {
                  setReminderStyle(val);
                  updateSetting("reminder_style", val);
                }}
              >
                <SelectTrigger data-testid="select-reminder-style">
                  <SelectValue placeholder={t("notificationStyle")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gentle">{t("gentle")}</SelectItem>
                  <SelectItem value="important">{t("important")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("reminderNote")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 hover-elevate"
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="text-destructive font-medium">{t("logOut")}</span>
            </button>
          </CardContent>
        </Card>

      </div>
    </div >
  );
}
