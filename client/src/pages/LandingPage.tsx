import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Target, TrendingUp, Timer, ArrowRight, Calendar, Smartphone, Monitor, Flame, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

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
    { value: "100%", label: "Free", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
  ];

  return (
    <div className="min-h-screen bg-background text-sm md:text-base">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/logo-new.png?v=4" alt="dayplanr logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-foreground">dayplanr</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button size="sm" onClick={() => navigate("/app")} data-testid="button-dashboard-header">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth?mode=login")} data-testid="button-login-header">
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate("/auth?mode=signup")} data-testid="button-get-started-header">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/30 to-orange-50/20 dark:from-blue-900/10 dark:via-purple-900/5 dark:to-orange-900/10" />
          <div className="max-w-6xl mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Stop completing tasks.{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent whitespace-nowrap">
                  Start making progress.
                </span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                The all-in-one productivity app that helps you manage tasks, build habits,
                track goals, and stay focused.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {user ? (
                  <Button size="default" onClick={() => navigate("/app")} data-testid="button-dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="default" onClick={() => navigate("/auth?mode=login")} data-testid="button-login">
                      Login
                    </Button>
                    <Button size="default" onClick={() => navigate("/auth?mode=signup")} data-testid="button-start-free">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}
              </div>
            </motion.div>







            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
            >
              {stats.map((stat, index) => (
                <Card key={index} className={`${stat.bgColor} border-0 shadow-sm`}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Works Everywhere You Do
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
                Use dayplanr on your desktop browser or mobile device. Your progress syncs seamlessly across all platforms.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Desktop Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-2xl mx-auto mb-8"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Desktop Experience</h3>
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm md:text-base max-w-3xl text-left tracking-tight">
                    Full-featured web application with comprehensive dashboards,<br />detailed analytics, and powerful productivity tools designed for focused work&nbsp;sessions.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-muted-foreground">Comprehensive dashboard views</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      <span className="text-sm text-muted-foreground">Advanced analytics and insights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      <span className="text-sm text-muted-foreground">Keyboard shortcuts for power users</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Desktop Experience Section */}
              <div className="mt-16">


                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
                    <Card className="overflow-hidden border-2 border-blue-100 dark:border-blue-900/30 shadow-xl">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 flex items-center gap-2 border-b border-blue-100 dark:border-blue-900/30">
                        <div className="flex gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="bg-white dark:bg-gray-700 rounded px-2 py-0.5 text-[10px] text-muted-foreground max-w-[100px] mx-auto">
                            dayplanr.app
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-0">
                        <img src="/desktop-habits.png" alt="dayplanr desktop app showing habits tracking" className="w-full h-auto" />
                      </CardContent>
                    </Card>


                  </div>
                </motion.div>
              </div>


            </div>

            {/* Mobile Experience Section */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center mt-16">
              {/* Mobile Screenshots - Left Side */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center gap-4 flex-wrap">
                  <Card className="max-w-[280px] overflow-hidden border-2 border-purple-100 dark:border-purple-900/30 shadow-xl">
                    <div className="bg-black p-2 flex justify-center">
                      <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
                    </div>
                    <CardContent className="p-0">
                      <img src="/mobile-screenshot-1.png" alt="dayplanr mobile app screenshot 1" className="w-full h-auto" />
                    </CardContent>
                  </Card>


                </div>
              </motion.div>

              {/* Mobile Text - Right Side */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Mobile Experience</h3>
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm md:text-base">
                    Native-like mobile experience designed for productivity on the go, with touch-optimized interfaces and quick actions.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      <span className="text-sm text-muted-foreground">Touch-optimized interface</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      <span className="text-sm text-muted-foreground">Quick task creation and completion</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-sm text-muted-foreground">Offline mode for uninterrupted productivity</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>


          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-orange-50/50 dark:from-blue-900/10 dark:via-purple-900/5 dark:to-orange-900/10">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Everything You Need to Stay Productive
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
                Link your daily tasks to meaningful goals and lasting habits. Every completed task becomes a step toward your dreams.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover-elevate border-0 bg-card/80 backdrop-blur-sm shadow-sm">
                    <CardContent className="p-5 flex gap-3">
                      <div className={`p-2.5 rounded-lg ${feature.bgColor} h-fit`}>
                        <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Ready to Make Real Progress?
              </h2>
              <p className="text-white/80 mb-6 max-w-lg mx-auto text-sm md:text-base">
                Join thousands of users who have already transformed their daily routines with dayplanr.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="default" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => navigate("/auth?mode=login")} data-testid="button-login-cta">
                  Login
                </Button>
                <Button size="default" className="bg-white text-purple-600 hover:bg-white/90" onClick={() => navigate("/auth?mode=signup")} data-testid="button-get-started-cta">
                  Get Started Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded flex items-center justify-center overflow-hidden">
                <img src="/logo-new.png?v=4" alt="dayplanr logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-foreground text-sm">dayplanr</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} dayplanr. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div >
  );
}
