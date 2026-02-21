import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { Clock, Target, TrendingUp, Trophy, Calendar, ChevronRight } from "lucide-react";
import { format, startOfMonth, eachDayOfInterval, getDay, startOfWeek, endOfWeek, eachWeekOfInterval, startOfYear, endOfYear } from "date-fns";
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

interface SessionData {
  id?: string;
  duration?: number;
  mode?: string;
  completed_at?: string;
  [key: string]: any;
}

interface FocusInsightsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionHistory: SessionData[];
}

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

export default function FocusInsights({
  open,
  onOpenChange,
  sessionHistory = [],
}: FocusInsightsProps) {
  const [showMonthDetails, setShowMonthDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MMMM"));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(1); // Would normally calculate current week

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const todaySessionsList = sessionHistory.filter(s => s.completed_at?.startsWith(todayStr));
  const todayMinutes = todaySessionsList.reduce((acc, s) => acc + (s.duration || 0), 0);
  const todaySessions = todaySessionsList.length;

  let todayPieData = [
    { name: "Pomodoro", value: todaySessionsList.filter(s => s.mode === "pomodoro").length, color: "#8b5cf6" },
    { name: "Deep Work", value: todaySessionsList.filter(s => s.mode === "deepwork").length, color: "#3b82f6" },
    { name: "Custom", value: todaySessionsList.filter(s => s.mode === "custom").length, color: "#10b981" },
  ].filter(d => d.value > 0);

  if (todayPieData.length === 0) {
    todayPieData = [{ name: "No Sessions", value: 1, color: "#e5e7eb" }];
  }

  const getWeekData = () => {
    const weeks = generateWeeks(selectedYear);
    const targetWeek = weeks.find(w => w.value === selectedWeek);
    if (!targetWeek) return [];

    const days = eachDayOfInterval({ start: targetWeek.startDate, end: targetWeek.endDate });

    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const daySessions = sessionHistory.filter(s => s.completed_at?.startsWith(dayStr));
      return {
        day: format(day, "EEE"),
        pomodoro: daySessions.filter(s => s.mode === "pomodoro").reduce((acc, s) => acc + (s.duration || 0), 0),
        deepwork: daySessions.filter(s => s.mode === "deepwork").reduce((acc, s) => acc + (s.duration || 0), 0),
        custom: daySessions.filter(s => s.mode === "custom").reduce((acc, s) => acc + (s.duration || 0), 0),
      };
    });
  };

  const weekData = getWeekData();

  const getMonthData = () => {
    const monthIndex = months.indexOf(selectedMonth);
    const monthStart = new Date(selectedYear, monthIndex, 1);
    const monthEnd = new Date(selectedYear, monthIndex + 1, 0);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const daySessions = sessionHistory.filter(s => s.completed_at?.startsWith(dayStr));
      return {
        date: dayStr,
        minutes: daySessions.reduce((acc, s) => acc + (s.duration || 0), 0)
      };
    });
  };

  const monthData = getMonthData();

  const getYearData = () => {
    return months.map((month, index) => {
      const monthStart = new Date(selectedYear, index, 1);
      const monthEnd = new Date(selectedYear, index + 1, 0);
      const monthSessions = sessionHistory.filter(s => {
        if (!s.completed_at) return false;
        const d = new Date(s.completed_at);
        return d >= monthStart && d <= monthEnd;
      });

      return {
        month: month.substring(0, 3),
        minutes: monthSessions.reduce((acc, s) => acc + (s.duration || 0), 0)
      };
    });
  };

  const yearData = getYearData();

  const getYearTimerRankings = () => {
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);

    const yearSessions = sessionHistory.filter(s => {
      if (!s.completed_at) return false;
      const d = new Date(s.completed_at);
      return d >= yearStart && d <= yearEnd;
    });

    const pomodoro = yearSessions.filter(s => s.mode === "pomodoro").length;
    const deepwork = yearSessions.filter(s => s.mode === "deepwork").length;
    const custom = yearSessions.filter(s => s.mode === "custom").length;

    return [
      { name: "Pomodoro", sessions: pomodoro, color: "#8b5cf6" },
      { name: "Deep Work", sessions: deepwork, color: "#3b82f6" },
      { name: "Custom", sessions: custom, color: "#10b981" },
    ].sort((a, b) => b.sessions - a.sessions);
  };

  const timerRankings = getYearTimerRankings();

  const getTopWeekTimer = () => {
    const totals = {
      Pomodoro: weekData.reduce((acc, d) => acc + d.pomodoro, 0),
      "Deep Work": weekData.reduce((acc, d) => acc + d.deepwork, 0),
      Custom: weekData.reduce((acc, d) => acc + d.custom, 0),
    };
    const max = Math.max(totals.Pomodoro, totals["Deep Work"], totals.Custom);
    if (max === 0) return { name: "None", value: 0 };
    if (totals.Pomodoro === max) return { name: "Pomodoro", value: max };
    if (totals["Deep Work"] === max) return { name: "Deep Work", value: max };
    return { name: "Custom", value: max };
  };

  const topWeekTimer = getTopWeekTimer();

  const getTopMonth = () => {
    if (!yearData.length) return "None";
    const max = yearData.reduce((prev, current) => (prev.minutes > current.minutes) ? prev : current);
    return max.minutes > 0 ? max.month : "None";
  };

  const topMonth = getTopMonth();

  const getHeatmapOpacity = (minutes: number) => {
    if (minutes === 0) return 0.1;
    if (minutes < 30) return 0.3;
    if (minutes < 60) return 0.5;
    if (minutes < 90) return 0.7;
    return 1;
  };

  const renderMonthHeatmap = () => {
    const monthIndex = months.indexOf(selectedMonth);
    const monthStart = new Date(selectedYear, monthIndex, 1);
    const monthEnd = new Date(selectedYear, monthIndex + 1, 0);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
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
              title={`${format(day, "MMM d, yyyy")}: ${minutes} min`}
            >
              <span className="text-xs">{format(day, "d")}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderYearHeatmap = () => {
    const yearMonths = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(selectedYear, i, 1);
      const yearMonth = yearData.find((d) => d.month === format(date, "MMM"));
      return {
        month: format(date, "MMM"),
        minutes: yearMonth?.minutes || 0,
      };
    });

    return (
      <div className="grid grid-cols-4 gap-2">
        {yearMonths.map((m) => (
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
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Select Week</h3>
                <div className="flex gap-2">
                  <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                    <SelectTrigger className="w-32" data-testid="select-week-focus">
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
                    <SelectTrigger className="w-20" data-testid="select-year-focus-weekly">
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
                  <p className="text-xs text-muted-foreground">Top Timer Week {selectedWeek} {selectedYear}</p>
                  <p className="text-sm font-semibold">{topWeekTimer.name}</p>
                </div>
                <Badge>{topWeekTimer.value} mins</Badge>
              </div>
            </TabsContent>

            <TabsContent value="month" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Select Date</h3>
                <div className="flex gap-2">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-32" data-testid="select-month-focus">
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
                    <SelectTrigger className="w-20" data-testid="select-year-focus">
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

              <button
                onClick={() => setShowMonthDetails(true)}
                className="w-full p-3 bg-muted/50 rounded-lg flex items-center justify-between hover-elevate active-elevate-2"
                data-testid="button-month-details"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">View {selectedMonth} {selectedYear} insights</span>
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Select Year</h3>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-20" data-testid="select-year-focus-yearly">
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

              {renderYearHeatmap()}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Timer Ranking</h4>
                <div className="space-y-2">
                  {timerRankings.map((timer, i) => (
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
                  <p className="text-sm font-semibold">{topMonth} {selectedYear}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={showMonthDetails} onOpenChange={setShowMonthDetails}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMonth} {selectedYear} Focus Insights</DialogTitle>
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
                    data={(() => {
                      const monthIndex = months.indexOf(selectedMonth);
                      const monthStart = new Date(selectedYear, monthIndex, 1);
                      const monthEnd = new Date(selectedYear, monthIndex + 1, 0);
                      const mSessions = sessionHistory.filter(s => {
                        if (!s.completed_at) return false;
                        const d = new Date(s.completed_at);
                        return d >= monthStart && d <= monthEnd;
                      });
                      return [
                        { name: "Pomodoro", value: mSessions.filter(s => s.mode === "pomodoro").length },
                        { name: "Deep Work", value: mSessions.filter(s => s.mode === "deepwork").length },
                        { name: "Custom", value: mSessions.filter(s => s.mode === "custom").length },
                      ];
                    })()}
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
                <p className="text-2xl font-semibold font-mono">
                  {monthData.reduce((acc, d) => acc + d.minutes, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Minutes</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-semibold font-mono">
                  {(() => {
                    const monthIndex = months.indexOf(selectedMonth);
                    const monthStart = new Date(selectedYear, monthIndex, 1);
                    const monthEnd = new Date(selectedYear, monthIndex + 1, 0);
                    return sessionHistory.filter(s => {
                      if (!s.completed_at) return false;
                      const d = new Date(s.completed_at);
                      return d >= monthStart && d <= monthEnd;
                    }).length;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-semibold font-mono">
                  {monthData.filter(d => d.minutes > 0).length}
                </p>
                <p className="text-xs text-muted-foreground">Active Days</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
