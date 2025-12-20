import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Target, TrendingUp, Timer, ArrowRight, Zap, Calendar, BarChart3 } from "lucide-react";

export default function LandingPage() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: CheckCircle2,
      title: "Task Management",
      description: "Organize your day with smart task grouping by morning, afternoon, evening, and night.",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set meaningful goals and track your progress with visual indicators and milestones.",
    },
    {
      icon: TrendingUp,
      title: "Habit Building",
      description: "Build lasting habits with streak tracking, completion rates, and accountability.",
    },
    {
      icon: Timer,
      title: "Focus Sessions",
      description: "Stay productive with Pomodoro timers and deep work sessions.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "1M+", label: "Tasks Completed" },
    { value: "500K+", label: "Focus Hours" },
    { value: "8", label: "Languages" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">ProductivePro</span>
          </div>
          <Button onClick={() => navigate("/app")} data-testid="button-get-started-header">
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </header>

      <main>
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
          <div className="max-w-6xl mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Achieve More,{" "}
                <span className="text-primary">Every Day</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                The all-in-one productivity app that helps you manage tasks, build habits, 
                track goals, and stay focused. Available in 8 languages.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate("/app")} data-testid="button-start-free">
                  Start Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/app")} data-testid="button-see-demo">
                  See Demo
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
                <Card key={index} className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-card/30">
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
                  <Card className="h-full hover-elevate">
                    <CardContent className="p-6 flex gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 h-fit">
                        <feature.icon className="w-6 h-6 text-primary" />
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
                Your Day, Organized
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Smart time-based task organization helps you focus on what matters most.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="text-center p-6">
                  <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Daily Planning</h3>
                  <p className="text-sm text-muted-foreground">
                    Plan your day with intuitive task scheduling and time blocks.
                  </p>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="text-center p-6">
                  <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Progress Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your productivity trends and celebrate your wins.
                  </p>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="text-center p-6">
                  <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                  <p className="text-sm text-muted-foreground">
                    Add tasks, start focus sessions, and log habits in seconds.
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary/5">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Transform Your Productivity?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of users who have already improved their daily routines with ProductivePro.
              </p>
              <Button size="lg" onClick={() => navigate("/app")} data-testid="button-get-started-cta">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">ProductivePro</span>
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
