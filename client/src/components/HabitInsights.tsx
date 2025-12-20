import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, BarChart3, Target } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { Habit } from "@/types/habits";
import { computeWeeklyData, computeConsistencyData, computeCompletionRate } from "@/types/habits";

interface HabitInsightsProps {
  habits: Habit[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HabitInsights({ habits, open, onOpenChange }: HabitInsightsProps) {
  const weeklyData = computeWeeklyData(habits);
  const consistencyData = computeConsistencyData(habits, 14);
  const completionRate = computeCompletionRate(habits);

  const donutData = [
    { name: "Completed", value: completionRate },
    { name: "Remaining", value: 100 - completionRate },
  ];

  const totalCompleted = weeklyData.reduce((acc, d) => acc + d.completed, 0);
  const avgDaily = habits.length > 0 ? Math.round(totalCompleted / 7) : 0;
  const bestDay = weeklyData.reduce((best, d) => d.completed > best.completed ? d : best, weeklyData[0]);

  const getMotivationalMessage = () => {
    if (habits.length === 0) return "Start with one simple habit. Consistency builds character.";
    if (completionRate >= 90) return "Incredible! You're mastering your habits. Keep it up!";
    if (completionRate >= 70) return "Strong week! You're building lasting routines.";
    if (completionRate >= 50) return "You're halfway there. Every check mark is a win!";
    if (completionRate >= 25) return "Progress over perfection. You're showing up!";
    return "New week, new opportunities. You've got this!";
  };

  const getStreakMotivation = () => {
    const maxStreak = Math.max(...habits.map((h) => h.streak), 0);
    if (maxStreak >= 30) return "A month-long streak! You're unstoppable.";
    if (maxStreak >= 14) return "Two weeks strong! Habits are becoming second nature.";
    if (maxStreak >= 7) return "One week down! You're building real momentum.";
    if (maxStreak >= 3) return "Three days in a row! Keep the chain going.";
    return "Start your streak today. Day one is always the hardest.";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Habit Insights
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
            <p className="text-sm font-medium text-primary" data-testid="text-motivation-message">
              {getMotivationalMessage()}
            </p>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Weekly Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        `${value} habits`,
                        name === "completed" ? "Completed" : "Total"
                      ]}
                    />
                    <Bar 
                      dataKey="completed" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                      name="completed"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Habits completed per day this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Streak Stability
              </CardTitle>
              <p className="text-xs text-primary">{getStreakMotivation()}</p>
            </CardHeader>
            <CardContent>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={consistencyData}>
                    <XAxis 
                      dataKey="date" 
                      tick={false}
                      axisLine={false}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Consistency"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Consistency trend over the last 14 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--muted))" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold font-mono" data-testid="text-completion-rate">
                      {completionRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">this week</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-xl font-semibold font-mono" data-testid="text-total-habits">
                {totalCompleted}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-xl font-semibold font-mono" data-testid="text-avg-daily">
                {avgDaily}
              </p>
              <p className="text-xs text-muted-foreground">Avg/Day</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-xl font-semibold font-mono" data-testid="text-best-day">
                {bestDay?.day || "-"}
              </p>
              <p className="text-xs text-muted-foreground">Best Day</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
