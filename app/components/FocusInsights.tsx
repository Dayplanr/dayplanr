import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Target, TrendingUp, Trophy, Calendar, ChevronRight } from "lucide-react";
import { format, startOfMonth, eachDayOfInterval, getDay } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface FocusInsightsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todayMinutes: number;
  todaySessions: number;
  weekData: { day: string; pomodoro: number; deepwork: number; custom: number }[];
  monthData: { date: string; minutes: number }[];
  yearData: { month: string; minutes: number }[];
}

export default function FocusInsights({
  open,
  onOpenChange,
  todayMinutes,
  todaySessions,
  weekData,
  monthData,
  yearData,
}: FocusInsightsProps) {
  const [showMonthDetails, setShowMonthDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("today");

  const todayPieData = [
    { name: "Pomodoro", value: 65, color: "#8b5cf6" },
    { name: "Deep Work", value: 25, color: "#3b82f6" },
    { name: "Custom", value: 10, color: "#10b981" },
  ];

  const getHeatmapOpacity = (minutes: number) => {
    if (minutes === 0) return 0.1;
    if (minutes < 30) return 0.3;
    if (minutes < 60) return 0.5;
    if (minutes < 90) return 0.7;
    return 1;
  };

  const renderMonthHeatmap = () => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const days = eachDayOfInterval({ start: monthStart, end: today });
    const firstDayOfWeek = getDay(monthStart);
    const emptyCells = Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1).fill(null);

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
        {days.map((day) => {
          const dayData = monthData.find((d) => d.date === format(day, "yyyy-MM-dd"));
          const minutes = dayData?.minutes || 0;
          return (
            <div
              key={day.toISOString()}
              className="aspect-square rounded-sm flex items-center justify-center"
              style={{
                backgroundColor: `hsl(var(--primary) / ${getHeatmapOpacity(minutes)})`,
              }}
              title={`${format(day, "MMM d")}: ${minutes} min`}
            >
              <span className="text-xs">{format(day, "d")}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderYearHeatmap = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(new Date().getFullYear(), i, 1);
      const yearMonth = yearData.find((d) => d.month === format(date, "MMM"));
      return {
        month: format(date, "MMM"),
        minutes: yearMonth?.minutes || 0,
      };
    });

    return (
      <div className="grid grid-cols-4 gap-2">
        {months.map((m) => (
          <div
            key={m.month}
            className="p-3 rounded-md text-center"
            style={{
              backgroundColor: `hsl(var(--primary) / ${getHeatmapOpacity(m.minutes / 10)})`,
            }}
          >
            <p className="text-xs font-medium">{m.month}</p>
            <p className="text-sm font-mono">{m.minutes}m</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Focus Insights
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="today" data-testid="tab-today">Today</TabsTrigger>
              <TabsTrigger value="week" data-testid="tab-week">Week</TabsTrigger>
              <TabsTrigger value="month" data-testid="tab-month">Month</TabsTrigger>
              <TabsTrigger value="year" data-testid="tab-year">Year</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Focus Minutes</span>
                  </div>
                  <p className="text-2xl font-semibold font-mono" data-testid="text-today-minutes">
                    {todayMinutes}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Sessions</span>
                  </div>
                  <p className="text-2xl font-semibold font-mono" data-testid="text-today-sessions">
                    {todaySessions}
                  </p>
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={todayPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {todayPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4">
                {todayPieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="week" className="space-y-4 mt-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekData}>
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="pomodoro" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="deepwork" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="custom" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Top Timer This Week</p>
                  <p className="text-sm font-semibold">Pomodoro</p>
                </div>
                <Badge>12 sessions</Badge>
              </div>
            </TabsContent>

            <TabsContent value="month" className="space-y-4 mt-4">
              <button
                onClick={() => setShowMonthDetails(true)}
                className="w-full p-3 bg-muted/50 rounded-lg flex items-center justify-between hover-elevate active-elevate-2"
                data-testid="button-month-details"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">View detailed monthly insights</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              {renderMonthHeatmap()}
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthData.slice(-14)}>
                    <XAxis dataKey="date" tick={false} />
                    <Tooltip
                      labelFormatter={(label) => format(new Date(label), "MMM d")}
                    />
                    <Line
                      type="monotone"
                      dataKey="minutes"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="year" className="space-y-4 mt-4">
              {renderYearHeatmap()}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Timer Ranking</h4>
                <div className="space-y-2">
                  {[
                    { name: "Pomodoro", sessions: 156, color: "#8b5cf6" },
                    { name: "Deep Work", sessions: 78, color: "#3b82f6" },
                    { name: "Morning Focus", sessions: 45, color: "#10b981" },
                  ].map((timer, i) => (
                    <div
                      key={timer.name}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{i + 1}</span>
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: timer.color }}
                        />
                        <span className="text-sm">{timer.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {timer.sessions} sessions
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg flex items-center gap-3">
                <Trophy className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Best Focus Month</p>
                  <p className="text-sm font-semibold">October 2024</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={showMonthDetails} onOpenChange={setShowMonthDetails}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Monthly Focus Insights</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Calendar Heatmap</h4>
              {renderMonthHeatmap()}
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Sessions by Timer</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Pomodoro", value: 42 },
                      { name: "Deep Work", value: 18 },
                      { name: "Custom", value: 12 },
                    ]}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Focus Trend</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthData}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(val) => format(new Date(val), "d")}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(label) => format(new Date(label), "MMM d")}
                    />
                    <Line
                      type="monotone"
                      dataKey="minutes"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-semibold font-mono">1,245</p>
                <p className="text-xs text-muted-foreground">Total Minutes</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-semibold font-mono">72</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-semibold font-mono">17</p>
                <p className="text-xs text-muted-foreground">Active Days</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
