import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
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
import { format, subDays, startOfMonth, eachDayOfInterval, getDay, startOfWeek, endOfWeek, eachWeekOfInterval, startOfYear, endOfYear } from "date-fns";

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

const generateYears = () => {
  return [2026, 2027, 2028, 2029, 2030];
};

const generateWeeks = (year: number) => {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 11, 31));
  const weeks = eachWeekOfInterval({ start: yearStart, end: yearEnd }, { weekStartsOn: 1 }); // Monday start

  return weeks.map((weekStart, index) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    return {
      value: index + 1,
      label: `Week ${index + 1}`,
      dateRange: `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`,
      startDate: weekStart,
      endDate: weekEnd
    };
  });
};

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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(1);

  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  useEffect(() => {
    if (open && user) {
      const fetchData = async () => {
        setLoading(true);
        const [tasksRes, focusRes] = await Promise.all([
          supabase.from("tasks").select("scheduled_date, completed").eq("user_id", user.id).eq("completed", true),
          supabase.from("focus_sessions").select("completed_at, duration").eq("user_id", user.id)
        ]);

        if (tasksRes.data) setTaskHistory(tasksRes.data);
        if (focusRes.data) setSessionHistory(focusRes.data);
        setLoading(false);
      };
      fetchData();
    }
  }, [open, user]);

  const getWeeklyData = () => {
    const weeks = generateWeeks(selectedYear);
    const targetWeek = weeks.find(w => w.value === selectedWeek);
    if (!targetWeek) return [];

    const days = eachDayOfInterval({ start: targetWeek.startDate, end: targetWeek.endDate });

    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dTasks = taskHistory.filter(t => t.scheduled_date === dayStr);
      const dSessions = sessionHistory.filter(s => s.completed_at?.startsWith(dayStr));

      return {
        day: format(day, "EEE"),
        tasks: dTasks.length,
        focus: dSessions.reduce((acc, s) => acc + (s.duration || 0), 0)
      };
    });
  };

  const weeklyData = getWeeklyData();

  const getMonthlyData = () => {
    const monthIndex = months.indexOf(selectedMonth);
    const monthStart = new Date(selectedYear, monthIndex, 1);
    const monthEnd = new Date(selectedYear, monthIndex + 1, 0);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dTasks = taskHistory.filter(t => t.scheduled_date === dayStr);
      const dSessions = sessionHistory.filter(s => s.completed_at?.startsWith(dayStr));

      return {
        day: format(day, "d"),
        tasks: dTasks.length,
        focus: dSessions.reduce((acc, s) => acc + (s.duration || 0), 0)
      };
    });
  };

  const monthlyData = getMonthlyData();

  const getYearlyData = () => {
    return months.map((month, index) => {
      const monthStart = new Date(selectedYear, index, 1);
      const monthEnd = new Date(selectedYear, index + 1, 0);

      const mTasks = taskHistory.filter(t => {
        if (!t.scheduled_date) return false;
        const d = new Date(t.scheduled_date);
        return d >= monthStart && d <= monthEnd;
      });

      const mSessions = sessionHistory.filter(s => {
        if (!s.completed_at) return false;
        const d = new Date(s.completed_at);
        return d >= monthStart && d <= monthEnd;
      });

      return {
        month: month.substring(0, 3), // Jan
        tasks: mTasks.length,
        focus: mSessions.reduce((acc, s) => acc + (s.duration || 0), 0)
      };
    });
  };

  const yearlyData = getYearlyData();

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

  const renderMonthHeatmap = () => {
    const monthIndex = months.indexOf(selectedMonth);
    const monthStart = new Date(selectedYear, monthIndex, 1);
    const monthEnd = new Date(selectedYear, monthIndex + 1, 0);
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
            title={`${format(day, "MMM d, yyyy")}`}
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" data-testid="tab-monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" data-testid="tab-yearly">Yearly</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Select Week</h3>
                <div className="flex gap-2">
                  <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                    <SelectTrigger className="w-32" data-testid="select-week-today">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateWeeks(selectedYear).map((week) => (
                        <SelectItem key={week.value} value={week.value.toString()}>
                          {week.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-20" data-testid="select-year-today-weekly">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateYears().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(() => {
                const weeks = generateWeeks(selectedYear);
                const currentWeek = weeks.find(w => w.value === selectedWeek);
                return (
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm font-medium">
                      {currentWeek ? currentWeek.dateRange : 'Week not found'} {selectedYear}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Selected week range</p>
                  </div>
                );
              })()}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Week {selectedWeek} {selectedYear} - Tasks vs Focus Time
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
                    Week {selectedWeek} {selectedYear} Productivity Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-4xl font-mono font-bold" data-testid="text-weekly-productivity">
                      {weeklyProductivityScore}
                    </p>
                    <p className="text-sm text-muted-foreground">out of 100</p>
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
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Select Date</h3>
                <div className="flex gap-2">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-32" data-testid="select-month">
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
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-20" data-testid="select-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateYears().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{selectedMonth} {selectedYear} Activity</CardTitle>
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Select Year</h3>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-20" data-testid="select-year-yearly">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {generateYears().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {selectedYear} Tasks vs Focus Time
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
