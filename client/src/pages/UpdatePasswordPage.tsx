import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function UpdatePasswordPage() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when it detects a recovery token in the URL hash.
    // We must wait for this event before calling updateUser, otherwise the session is missing.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setSessionReady(true);
      }
    });

    // Also check if there's already an active session (e.g. user navigated back)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionReady) {
      toast({
        title: "Session not ready",
        description: "Please use the link from your email to reset your password.",
        variant: "destructive",
      });
      return;
    }

    if (!password || password.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      navigate("/app");
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <img src="/logo-new.png?v=4" alt="dayplanr logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Update password</h1>
            <p className="text-muted-foreground mt-2">Enter your new password below</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              {!sessionReady ? (
                <div className="flex flex-col items-center py-6 gap-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-sm">Verifying your reset link…</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password (min 6 chars)"
                        className="pl-10 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating…
                      </>
                    ) : (
                      <>
                        Update Password
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
