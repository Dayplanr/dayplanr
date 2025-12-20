import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Target, TrendingUp, Timer, ArrowRight, Calendar, Smartphone, Monitor, Flame } from "lucide-react";

export default function LandingPage() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: CheckCircle2,
      title: "Task Management",
      description: "Organize your day with smart task grouping by morning, afternoon, evening, and night.",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set meaningful goals and track your progress with visual indicators and milestones.",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: TrendingUp,
      title: "Habit Building",
      description: "Build lasting habits with streak tracking, completion rates, and accountability.",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: Timer,
      title: "Focus Sessions",
      description: "Stay productive with Pomodoro timers and deep work sessions.",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
    { value: "1M+", label: "Tasks Completed", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
    { value: "500K+", label: "Focus Hours", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
    { value: "8", label: "Languages", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">dayplanr</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/app")} data-testid="button-login-header">
              Login
            </Button>
            <Button onClick={() => navigate("/app")} data-testid="button-get-started-header">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/30 to-orange-50/20 dark:from-blue-900/10 dark:via-purple-900/5 dark:to-orange-900/10" />
          <div className="max-w-6xl mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Stop completing tasks.{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                  Start making progress.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                The all-in-one productivity app that helps you manage tasks, build habits, 
                track goals, and stay focused. Available in 8 languages.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" onClick={() => navigate("/app")} data-testid="button-login">
                  Login
                </Button>
                <Button size="lg" onClick={() => navigate("/app")} data-testid="button-start-free">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {stats.map((stat, index) => (
                <Card key={index} className={`${stat.bgColor} border-0`}>
                  <CardContent className="p-6 text-center">
                    <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Works Everywhere You Do
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Use dayplanr on your desktop browser or mobile device. Your progress syncs seamlessly.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden border-2 border-blue-100 dark:border-blue-900/30">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 flex items-center gap-2 border-b border-blue-100 dark:border-blue-900/30">
                    <Monitor className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-foreground">Desktop Web App</span>
                  </div>
                  <CardContent className="p-0">
                    <div className="bg-card p-4">
                      <div className="flex gap-4">
                        <div className="w-48 bg-muted/50 rounded-lg p-3 space-y-2">
                          <div className="h-6 bg-primary/20 rounded w-20 mb-4" />
                          <div className="h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center px-2 gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-xs">Today</span>
                          </div>
                          <div className="h-8 bg-muted rounded flex items-center px-2 gap-2">
                            <Target className="w-4 h-4 text-purple-600" />
                            <span className="text-xs">Goals</span>
                          </div>
                          <div className="h-8 bg-muted rounded flex items-center px-2 gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs">Habits</span>
                          </div>
                          <div className="h-8 bg-muted rounded flex items-center px-2 gap-2">
                            <Timer className="w-4 h-4 text-orange-600" />
                            <span className="text-xs">Focus</span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex gap-3">
                            <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                              <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                              <div className="text-lg font-bold">75%</div>
                              <div className="text-xs text-muted-foreground">Progress</div>
                            </div>
                            <div className="flex-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                              <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                              <div className="text-lg font-bold">5d</div>
                              <div className="text-xs text-muted-foreground">Streak</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-10 bg-card border rounded-lg flex items-center px-3 gap-2">
                              <div className="w-4 h-4 rounded border-2 border-primary" />
                              <span className="text-sm">Morning workout</span>
                              <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">High</span>
                            </div>
                            <div className="h-10 bg-card border rounded-lg flex items-center px-3 gap-2">
                              <div className="w-4 h-4 rounded border-2 border-primary bg-primary flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm line-through text-muted-foreground">Team meeting</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex justify-center"
              >
                <Card className="w-64 overflow-hidden border-2 border-purple-100 dark:border-purple-900/30">
                  <div className="bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20 p-3 flex items-center justify-center gap-2 border-b border-purple-100 dark:border-purple-900/30">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-sm text-foreground">Mobile App</span>
                  </div>
                  <CardContent className="p-0">
                    <div className="bg-card p-3 space-y-3">
                      <div className="text-center mb-2">
                        <p className="font-semibold">Today</p>
                        <p className="text-xs text-muted-foreground">Friday, Dec 20</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                          <TrendingUp className="w-4 h-4 text-blue-600 mx-auto" />
                          <div className="text-sm font-bold">75%</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
                          <Timer className="w-4 h-4 text-purple-600 mx-auto" />
                          <div className="text-sm font-bold">45m</div>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 text-center">
                          <Flame className="w-4 h-4 text-orange-600 mx-auto" />
                          <div className="text-sm font-bold">5d</div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 text-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                          <div className="text-sm font-bold">2/4</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-9 bg-card border rounded-lg flex items-center px-2 gap-2">
                          <div className="w-1 h-6 bg-red-500 rounded" />
                          <span className="text-xs flex-1">Morning workout</span>
                        </div>
                        <div className="h-9 bg-card border rounded-lg flex items-center px-2 gap-2">
                          <div className="w-1 h-6 bg-yellow-500 rounded" />
                          <span className="text-xs flex-1">Team standup</span>
                        </div>
                      </div>
                      <div className="flex justify-around pt-2 border-t">
                        <Calendar className="w-5 h-5 text-primary" />
                        <Target className="w-5 h-5 text-muted-foreground" />
                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                        <Timer className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-orange-50/50 dark:from-blue-900/10 dark:via-purple-900/5 dark:to-orange-900/10">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything You Need to Stay Productive
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to help you accomplish your goals and build better habits.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover-elevate border-0 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-6 flex gap-4">
                      <div className={`p-3 rounded-xl ${feature.bgColor} h-fit`}>
                        <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Make Real Progress?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Join thousands of users who have already transformed their daily routines with dayplanr.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => navigate("/app")} data-testid="button-login-cta">
                  Login
                </Button>
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90" onClick={() => navigate("/app")} data-testid="button-get-started-cta">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-foreground">dayplanr</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Available in English, German, Spanish, French, Italian, Portuguese, Dutch, and Polish.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
