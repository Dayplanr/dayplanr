import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import LanguageSelector from "@/components/LanguageSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/hooks/use-toast";
import { useTimerSound } from "@/hooks/useTimerSound";
import { timerSounds } from "@/lib/timerSounds";
import DashboardCustomizer, { type DashboardConfig } from "@/components/DashboardCustomizer";
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
  Palette,
  Moon,
  Globe,
  LogOut,
  ChevronRight,
  ChevronDown,
  Check,
  Volume2,
  Play,
  Settings2,
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
  const { timerSound: hookTimerSound, refreshTimerSound } = useTimerSound();

  // Use local state for immediate UI updates
  const [localTimerSound, setLocalTimerSound] = useState(hookTimerSound);

  // Sync local state with hook state
  useEffect(() => {
    setLocalTimerSound(hookTimerSound);
  }, [hookTimerSound]);

  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTimerSettingsOpen, setIsTimerSettingsOpen] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    modules: {
      summary: true,
      focus: true,
      habits: true,
      insights: true,
    },
    order: ["summary", "focus", "habits", "insights"],
  });

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
      console.log("🔧 Loading user settings...");

      // First try to get existing settings
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No settings found, create default settings
        console.log("🔧 No settings found, creating defaults...");
        const { data: newData, error: insertError } = await supabase
          .from("user_settings")
          .insert({
            user_id: user?.id,
            timer_sound: "radar" // Use new default
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating default settings:", insertError);
        } else {
          console.log("🔧 Created default settings");
          setDisplayName(user?.user_metadata?.full_name || "");
        }
      } else if (data) {
        console.log("🔧 Loaded existing settings:", data);
        setDisplayName(user?.user_metadata?.full_name || "");
        if (data.dashboard_config) {
          setDashboardConfig(data.dashboard_config as DashboardConfig);
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      // Set defaults on error
      setDisplayName(user?.user_metadata?.full_name || "");
    } finally {
      setLoading(false);
    }
  };

  const playPreviewSound = async (soundValue: string) => {
    try {
      console.log(`🔊 Playing preview sound: ${soundValue}`);

      // Import the continuous sound function
      const { startContinuousTimerSound } = await import("@/lib/timerSounds");

      // Create a short preview (3 seconds)
      const continuousSound = await startContinuousTimerSound(soundValue);

      // Stop after 3 seconds for preview
      setTimeout(() => {
        continuousSound.stop();
        console.log(`🔇 Preview sound stopped after 3 seconds`);
      }, 3000);

      console.log("Preview sound started successfully");
    } catch (error) {
      console.error("Error playing preview sound:", error);
      toast({
        title: "Audio Error",
        description: "Could not play preview sound. Please check your browser settings.",
        variant: "destructive",
      });
    }
  };

  const handleTimerSoundChange = async (soundValue: string) => {
    // Update local state immediately for responsive UI
    setLocalTimerSound(soundValue);

    try {
      if (!user?.id) {
        throw new Error("No user ID available");
      }

      // First try to check if user_settings record exists
      const { data: existingData, error: selectError } = await supabase
        .from("user_settings")
        .select("id, timer_sound")
        .eq("user_id", user.id)
        .single();

      let updateError = null;

      if (selectError && selectError.code === 'PGRST116') {
        // Record doesn't exist, create it
        const { error } = await supabase
          .from("user_settings")
          .insert({
            user_id: user.id,
            timer_sound: soundValue
          });
        updateError = error;
      } else if (existingData) {
        // Record exists, update it
        const { error } = await supabase
          .from("user_settings")
          .update({ timer_sound: soundValue })
          .eq("user_id", user.id);
        updateError = error;
      } else {
        // Some other error occurred
        updateError = selectError;
      }

      if (updateError) {
        throw updateError;
      }

      // Store in localStorage as backup
      localStorage.setItem(`timer_sound_${user.id}`, soundValue);

      // Refresh the hook to sync with database
      setTimeout(() => refreshTimerSound(), 100);

      toast({
        title: "Timer Sound Updated",
        description: `Changed to ${timerSounds.find(s => s.value === soundValue)?.name || soundValue}`,
      });

    } catch (error) {
      // Fallback to localStorage
      try {
        localStorage.setItem(`timer_sound_${user?.id}`, soundValue);

        toast({
          title: "Timer Sound Updated (Local)",
          description: `Changed to ${timerSounds.find(s => s.value === soundValue)?.name || soundValue} (saved locally)`,
        });
      } catch (localError) {
        // Revert local state on complete failure
        setLocalTimerSound(hookTimerSound);

        toast({
          title: "Error",
          description: `Failed to save timer sound: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
        });
      }
    }
  };

  const updateSetting = async (key: string, value: any) => {
    if (!user) return;
    try {
      console.log(`🔧 Updating setting ${key} to:`, value);

      // Use upsert to handle cases where user_settings doesn't exist yet
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          [key]: value
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      console.log(`🔧 Setting ${key} updated successfully`);
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      toast({
        title: "Error",
        description: "Failed to save setting.",
        variant: "destructive",
      });
    }
  };

  const saveDashboardConfig = async (newConfig: DashboardConfig) => {
    if (!user) return;
    setDashboardConfig(newConfig);
    await updateSetting("dashboard_config", newConfig);
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
            <CardTitle className="text-base font-semibold">Timer Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            <Collapsible open={isTimerSettingsOpen} onOpenChange={setIsTimerSettingsOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-green-500" />
                      <span className="text-foreground font-medium">Timer Sound</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {timerSounds.find(s => s.value === localTimerSound)?.name || "Radar"}
                      </span>
                      {isTimerSettingsOpen ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-3">
                        Choose a sound that plays when your timer completes.
                      </p>
                      {timerSounds.map((sound) => {
                        const isSelected = localTimerSound === sound.value;

                        return (
                          <div
                            key={sound.value}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                            onClick={() => handleTimerSoundChange(sound.value)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="font-medium">{sound.name}</div>
                                {isSelected && <Check className="w-4 h-4 text-primary" />}
                              </div>
                              <div className="text-sm text-muted-foreground">{sound.description}</div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                playPreviewSound(sound.value);
                              }}
                              className="ml-3"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Preview
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
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
            <CardTitle className="text-base font-semibold">{t("customizeDashboard")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-gray-500" />
                <span className="text-foreground">{t("customizeDashboard")}</span>
              </div>
              <DashboardCustomizer config={dashboardConfig} onUpdate={saveDashboardConfig} />
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
