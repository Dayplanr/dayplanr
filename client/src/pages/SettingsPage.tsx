import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import LanguageSelector from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";

export default function SettingsPage() {
  const { t } = useTranslation();

  const [darkMode, setDarkMode] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [taskReminders, setTaskReminders] = useState(true);
  const [habitReminders, setHabitReminders] = useState(true);
  const [focusReminders, setFocusReminders] = useState(true);
  const [reminderTiming, setReminderTiming] = useState("30min");
  const [reminderStyle, setReminderStyle] = useState("gentle");
  const [incompleteNudges, setIncompleteNudges] = useState(true);

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
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
            <button className="w-full flex items-center justify-between px-4 py-3 hover-elevate" data-testid="button-profile">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{t("profile")}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
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
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {t("delete")}
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
                onCheckedChange={setNotificationsEnabled}
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
            <button className="w-full flex items-center justify-between px-4 py-3 hover-elevate" data-testid="button-theme-color">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-purple-500" />
                <span className="text-foreground">{t("themeColor")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary" />
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
            <Separator />
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-indigo-500" />
                <span className="text-foreground">{t("dark")}</span>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
                data-testid="switch-dark-mode"
              />
            </div>
            <Separator />
            <button className="w-full flex items-center justify-between px-4 py-3 hover-elevate" data-testid="button-app-icon">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-emerald-500" />
                <span className="text-foreground">{t("appIcon")}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
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
                onCheckedChange={setHaptics}
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
                  onCheckedChange={setTaskReminders}
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
                  onCheckedChange={setHabitReminders}
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
                  onCheckedChange={setFocusReminders}
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
                  onCheckedChange={setIncompleteNudges}
                  data-testid="switch-incomplete-nudges"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">{t("timing")}</p>
              <Select value={reminderTiming} onValueChange={setReminderTiming}>
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
              <Select value={reminderStyle} onValueChange={setReminderStyle}>
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
            <button className="w-full flex items-center justify-center gap-2 px-4 py-4 hover-elevate" data-testid="button-logout">
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="text-destructive font-medium">{t("logOut")}</span>
            </button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
