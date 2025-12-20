import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Target, Clock, CheckCircle2, Trophy } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { format, subDays, startOfMonth, eachDayOfInterval, getDay } from "date-fns";

interface TodayInsightsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasksCompleted: number;
  totalTasks: number;
  focusMinutes: number;
  habitsCompleted: number;
  totalHabits: number;
}

const FOCUS_COLOR = "hsl(var(--primary))";
const TASK_COLOR = "#a78bfa";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function TodayInsights({
  open,
  onOpenChange,
  tasksCompleted,
  totalTasks,
  focusMinutes,
  habitsCompleted,
  totalHabits,
}: TodayInsightsProps) {
  const [activeTab, setActiveTab] = useState("weekly");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MMMM"));

  const weeklyData = [
    { day: "Mon", tasks: 5, focus: 45 },
    { day: "Tue", tasks: 8, focus: 90 },
    { day: "Wed", tasks: 3, focus: 30 },
    { day: "Thu", tasks: 6, focus: 60 },
    { day: "Fri", tasks: 4, focus: 75 },
    { day: "Sat", tasks: 2, focus: 20 },
    { day: "Sun", tasks: 1, focus: 15 },
  ];

  const getMonthlyData = (month: string) => {
    const monthIndex = months.indexOf(month);
    const year = new Date().getFullYear();
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0);
    
    return eachDayOfInterval({ start: startDate, end: endDate }).map((date, i) => ({
      day: format(date, "d"),
      tasks: Math.floor(Math.random() * 8) + 1,
      focus: Math.floor(Math.random() * 90) + 10,
    }));
  };

  const monthlyData = getMonthlyData(selectedMonth);

  const yearlyData = months.map((month) => ({
    month: month.substring(0, 3),
    tasks: Math.floor(Math.random() * 150) + 50,
    focus: Math.floor(Math.random() * 1500) + 300,
  }));

  const weeklyProductivityScore = Math.round(
    ((weeklyData.reduce((sum, d) => sum + d.tasks, 0) / 50) * 50) +
    ((weeklyData.reduce((sum, d) => sum + d.focus, 0) / 500) * 50)
  );

  const monthlyProductivityScore = Math.round(
    ((monthlyData.reduce((sum, d) => sum + d.tasks, 0) / 200) * 50) +
    ((monthlyData.reduce((sum, d) => sum + d.focus, 0) / 2000) * 50)
  );

  const yearlyProductivityScore = Math.round(
    ((yearlyData.reduce((sum, d) => sum + d.tasks, 0) / 1500) * 50) +
    ((yearlyData.reduce((sum, d) => sum + d.focus, 0) / 15000) * 50)
  );

  const getMotivationalMessage = () => {
    const completionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
    if (completionRate >= 80) return "Outstanding productivity! You're crushing it today.";
    if (completionRate >= 50) return "Great progress! Keep the momentum going.";
    if (completionRate >= 25) return "You're making headway. Every task counts!";
    if (tasksCompleted > 0) return "You've started strong. Keep pushing!";
    return "A fresh day awaits. Let's make it count!";
  };

  const renderMonthHeatmap = () => {
    const monthIndex = months.indexOf(selectedMonth);
    const year = new Date().getFullYear();
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfWeek = getDay(monthStart);
    const emptyCells = Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1).fill(null);

    const getHeatmapOpacity = (dayNum: number) => {
      const value = (dayNum % 7) * 15;
      if (value === 0) return 0.1;
      if (value < 30) return 0.3;
      if (value < 60) return 0.5;
      if (value < 90) return 0.7;
      return 1;
    };

    return (
      <div className="grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-xs text-center text-muted-foreground">
            {d}
          </div>
        ))}
        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day, i) => (
          <div
            key={day.toISOString()}
            className="aspect-square rounded-sm flex items-center justify-center"
            style={{
              backgroundColor: `hsl(var(--primary) / ${getHeatmapOpacity(i + 1)})`,
            }}
            title={`${format(day, "MMM d")}`}
          >
            <span className="text-xs">{format(day, "d")}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Today Insights
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
            <p className="text-sm font-medium text-primary" data-testid="text-motivation-message">
              {getMotivationalMessage()}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" data-testid="tab-monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" data-testid="tab-yearly">Yearly</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Tasks vs Focus Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="tasks" fill={TASK_COLOR} radius={[4, 4, 0, 0]} name="Tasks" />
                        <Bar yAxisId="right" dataKey="focus" fill={FOCUS_COLOR} radius={[4, 4, 0, 0]} name="Focus (min)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Productivity Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-4xl font-mono font-bold" data-testid="text-weekly-productivity">
                      {weeklyProductivityScore}
                    </p>
                    <p className="text-sm text-muted-foreground">out of 100</p>
                    <p className="text-xs text-primary mt-2">
                      {weeklyProductivityScore >= 70 ? "Excellent week! Keep it up." : "Room to grow. Stay focused!"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-weekly-tasks">
                    {weeklyData.reduce((sum, d) => sum + d.tasks, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Tasks Done</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-weekly-focus">
                    {weeklyData.reduce((sum, d) => sum + d.focus, 0)}m
                  </p>
                  <p className="text-xs text-muted-foreground">Focus Time</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-weekly-best">
                    {weeklyData.reduce((best, d) => d.tasks > best.tasks ? d : best).day}
                  </p>
                  <p className="text-xs text-muted-foreground">Best Day</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Select Month</h3>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-36" data-testid="select-month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{selectedMonth} Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderMonthHeatmap()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Tasks vs Focus Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData.filter((_, i) => i % 3 === 0)}>
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="tasks" stroke={TASK_COLOR} strokeWidth={2} dot={false} name="Tasks" />
                        <Line type="monotone" dataKey="focus" stroke={FOCUS_COLOR} strokeWidth={2} dot={false} name="Focus (min)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Productivity Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-4xl font-mono font-bold" data-testid="text-monthly-productivity">
                      {monthlyProductivityScore}
                    </p>
                    <p className="text-sm text-muted-foreground">out of 100</p>
                    <p className="text-xs text-primary mt-2">
                      {monthlyProductivityScore >= 70 ? "Strong month! You're on fire." : "Keep building momentum!"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-monthly-tasks">
                    {monthlyData.reduce((sum, d) => sum + d.tasks, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Tasks Done</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-monthly-focus">
                    {Math.round(monthlyData.reduce((sum, d) => sum + d.focus, 0) / 60)}h
                  </p>
                  <p className="text-xs text-muted-foreground">Focus Time</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-monthly-avg">
                    {Math.round(monthlyData.reduce((sum, d) => sum + d.tasks, 0) / monthlyData.length)}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg/Day</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="yearly" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Tasks vs Focus Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearlyData}>
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="tasks" fill={TASK_COLOR} radius={[4, 4, 0, 0]} name="Tasks" />
                        <Bar yAxisId="right" dataKey="focus" fill={FOCUS_COLOR} radius={[4, 4, 0, 0]} name="Focus (min)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Productivity Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-4xl font-mono font-bold" data-testid="text-yearly-productivity">
                      {yearlyProductivityScore}
                    </p>
                    <p className="text-sm text-muted-foreground">out of 100</p>
                    <p className="text-xs text-primary mt-2">
                      {yearlyProductivityScore >= 70 ? "Exceptional year! You're unstoppable." : "Building towards greatness!"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-yearly-tasks">
                    {yearlyData.reduce((sum, d) => sum + d.tasks, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Tasks Done</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-yearly-focus">
                    {Math.round(yearlyData.reduce((sum, d) => sum + d.focus, 0) / 60)}h
                  </p>
                  <p className="text-xs text-muted-foreground">Focus Time</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xl font-semibold font-mono" data-testid="text-yearly-best">
                    {yearlyData.reduce((best, d) => d.tasks > best.tasks ? d : best).month}
                  </p>
                  <p className="text-xs text-muted-foreground">Best Month</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
