import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Zap, 
  AlertTriangle,
  Trophy,
  Calendar,
  CheckCircle2,
  Activity,
  Sparkles
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";
import { format, differenceInDays, subDays, subWeeks, subMonths, subYears, startOfWeek, endOfWeek, eachWeekOfInterval, startOfYear, endOfYear } from "date-fns";
import type { Habit } from "@/types/habits";
import { computeWeeklyData, computeConsistencyData, computeCompletionRate } from "@/types/habits";

interface HabitInsightsProps {
  habits: Habit[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Dynamic colors for pie chart
const generateColors = (count: number) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 360) / count;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
};

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

// Helper functions for time-based filtering
const filterHabitsByTimeframe = (habits: Habit[], timeframe: 'week' | 'month' | 'year', selectedMonth?: string, selectedYear?: number) => {
  const now = new Date();
  let cutoffDate: Date;
  
  switch (timeframe) {
    case 'week':
      cutoffDate = subWeeks(now, 1);
      break;
    case 'month':
      if (selectedMonth && selectedYear) {
        const monthIndex = months.indexOf(selectedMonth);
        cutoffDate = new Date(selectedYear, monthIndex, 1);
      } else {
        cutoffDate = subMonths(now, 1);
      }
      break;
    case 'year':
      if (selectedYear) {
        cutoffDate = new Date(selectedYear, 0, 1);
      } else {
        cutoffDate = subYears(now, 1);
      }
      break;
  }
  
  return habits.filter(habit => {
    // Filter by habits that have activity in the timeframe
    return habit.completedDates.some(date => new Date(date) >= cutoffDate);
  });
};
const getHabitsAtRiskByTimeframe = (habits: Habit[], timeframe: 'week' | 'month' | 'year') => {
  const now = new Date();
  let inactivityDays: number;
  
  switch (timeframe) {
    case 'week':
      inactivityDays = 2; // 2 days for weekly
      break;
    case 'month':
      inactivityDays = 5; // 5 days for monthly
      break;
    case 'year':
      inactivityDays = 14; // 14 days for yearly
      break;
  }
  
  const cutoffDate = subDays(now, inactivityDays);
  
  return habits.filter((habit) => {
    const lastCompletedDate = habit.completedDates.length > 0 
      ? new Date(Math.max(...habit.completedDates.map(d => new Date(d).getTime())))
      : new Date(0);
    
    const hasLowSuccessRate = habit.successRate < 30;
    const hasLowStreak = habit.streak === 0;
    const isInactive = lastCompletedDate < cutoffDate;
    
    return hasLowSuccessRate || hasLowStreak || isInactive;
  });
};

const getChallengeHabitsByTimeframe = (habits: Habit[], timeframe: 'week' | 'month' | 'year') => {
  const challengeHabits = habits.filter(h => h.scheduleType === 'challenge' && h.challengeDays > 0);
  const now = new Date();
  
  return challengeHabits.filter(habit => {
    const hasRecentActivity = habit.completedDates.some(date => {
      const completedDate = new Date(date);
      switch (timeframe) {
        case 'week':
          return differenceInDays(now, completedDate) <= 7;
        case 'month':
          return differenceInDays(now, completedDate) <= 30;
        case 'year':
          return differenceInDays(now, completedDate) <= 365;
        default:
          return true;
      }
    });
    return hasRecentActivity;
  });
};

const getConsistencyScoreByTimeframe = (habits: Habit[], timeframe: 'week' | 'month' | 'year', selectedMonth?: string, selectedYear?: number) => {
  const filteredHabits = filterHabitsByTimeframe(habits, timeframe, selectedMonth, selectedYear);
  
  let totalConsistency = 0;
  let bestStreak = 0;
  let totalCompletions = 0;
  
  filteredHabits.forEach(habit => {
    switch (timeframe) {
      case 'week':
        totalConsistency += habit.weeklyConsistency || 0;
        break;
      case 'month':
        totalConsistency += habit.monthlyConsistency || 0;
        break;
      case 'year':
        totalConsistency += habit.successRate || 0;
        break;
    }
    
    bestStreak = Math.max(bestStreak, habit.bestStreak || 0);
    totalCompletions += habit.completedDates.length;
  });
  
  const avgConsistency = filteredHabits.length > 0 
    ? Math.round(totalConsistency / filteredHabits.length) 
    : 0;
  
  const lastActivityDate = filteredHabits.length > 0 
    ? filteredHabits.reduce((latest, h) => {
        const habitLastDate = h.completedDates.length > 0 
          ? h.completedDates[h.completedDates.length - 1]
          : '1970-01-01';
        return habitLastDate > latest ? habitLastDate : latest;
      }, '1970-01-01')
    : null;
  
  return {
    avgConsistency,
    bestStreak,
    totalCompletions,
    lastActivityDate: lastActivityDate ? format(new Date(lastActivityDate), "MMM d, yyyy") : "-",
    habitsCount: filteredHabits.length
  };
};

const getProductivityScoreByTimeframe = (habits: Habit[], timeframe: 'week' | 'month' | 'year', selectedMonth?: string, selectedYear?: number) => {
  const filteredHabits = filterHabitsByTimeframe(habits, timeframe, selectedMonth, selectedYear);
  
  if (filteredHabits.length === 0) return 0;
  
  let totalScore = 0;
  
  filteredHabits.forEach(habit => {
    let score = 0;
    
    // Base score from success rate (40%)
    score += (habit.successRate || 0) * 0.4;
    
    // Streak bonus (30%)
    const streakScore = Math.min((habit.streak || 0) * 10, 100);
    score += streakScore * 0.3;
    
    // Consistency bonus (30%)
    const consistencyScore = timeframe === 'week' 
      ? habit.weeklyConsistency || 0
      : timeframe === 'month' 
        ? habit.monthlyConsistency || 0
        : habit.successRate || 0;
    score += consistencyScore * 0.3;
    
    totalScore += Math.min(score, 100);
  });
  
  return Math.round(totalScore / filteredHabits.length);
};

export default function HabitInsights({ habits, open, onOpenChange }: HabitInsightsProps) {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MMMM"));
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedWeek, setSelectedWeek] = useState(1);
  
  const weeklyData = computeWeeklyData(habits);
  const completionRate = computeCompletionRate(habits);
  
  // Overall metrics
  const totalHabits = habits.length;
  const activeHabits = habits.filter(h => h.streak > 0).length;
  const challengeHabits = habits.filter(h => h.scheduleType === 'challenge').length;
  const avgSuccessRate = habits.length > 0 
    ? Math.round(habits.reduce((sum, h) => sum + (h.successRate || 0), 0) / habits.length)
    : 0;
  
  // Category breakdown
  const categoryBreakdown = habits.reduce((acc, habit) => {
    acc[habit.category] = (acc[habit.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryData = Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value }));
  const pieColors = generateColors(categoryData.length);
  
  // Best performing habit
  const bestHabit = habits.reduce((best, current) => {
    const bestScore = (best?.successRate || 0) + (best?.streak || 0);
    const currentScore = (current.successRate || 0) + (current.streak || 0);
    return currentScore > bestScore ? current : best;
  }, habits[0]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Habit Insights
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 1. Overall Habit Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Overall Habit Progress
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your consistency and progress across all habits.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold font-mono text-primary" data-testid="text-total-habits">
                    {totalHabits}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Total Habits</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold font-mono text-green-600" data-testid="text-active-habits">
                    {activeHabits}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Active Streaks</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold font-mono text-blue-600" data-testid="text-challenge-habits">
                    {challengeHabits}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Challenge Habits</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg text-center border border-primary/20">
                  <p className="text-3xl font-bold font-mono text-primary" data-testid="text-avg-success">
                    {avgSuccessRate}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Average Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Weekly Completion Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Weekly Completion Pattern
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                See which days you're most consistent with your habits.
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
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
                      dataKey="total" 
                      fill="hsl(var(--muted))" 
                      radius={[4, 4, 0, 0]} 
                      name="total"
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
            </CardContent>
          </Card>

          {/* 3. Category Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Habit Categories Breakdown
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Understand where you focus your habit-building energy.
              </p>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="h-64 w-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} habits`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {categoryData.map((category, index) => (
                      <div key={category.name} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: pieColors[index] }}
                        />
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">({category.value} habits)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No habits created yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. Best Performing Habit */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Best Performing Habit
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                The habit you're most consistent with.
              </p>
            </CardHeader>
            <CardContent>
              {bestHabit ? (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="text-lg font-semibold text-primary" data-testid="text-best-habit">
                    {bestHabit.title}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{bestHabit.category}</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold font-mono text-primary">
                        {bestHabit.successRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold font-mono text-primary">
                        {bestHabit.streak}
                      </p>
                      <p className="text-xs text-muted-foreground">Current Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold font-mono text-primary">
                        {bestHabit.bestStreak || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Best Streak</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No habits created yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Time-based Insights with Tabs */}
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>

            {/* Weekly Content */}
            <TabsContent value="weekly" className="space-y-6 mt-6">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Select Week</h3>
                <div className="flex gap-2">
                  <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                    <SelectTrigger className="w-32" data-testid="select-week-habits">
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
                    <SelectTrigger className="w-20" data-testid="select-year-habits-weekly">
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

              {/* Consistency Score - Weekly */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Week {selectedWeek} {selectedYear} Consistency Score
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    See how consistently you're maintaining your habits in week {selectedWeek} of {selectedYear}.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const consistencyData = getConsistencyScoreByTimeframe(habits, 'week');
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border border-blue-200 dark:border-blue-800">
                          <p className="text-3xl font-bold font-mono text-blue-600" data-testid="text-consistency-week">
                            {consistencyData.avgConsistency}%
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Weekly Consistency</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {consistencyData.habitsCount} habit{consistencyData.habitsCount !== 1 ? 's' : ''} tracked
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center border border-green-200 dark:border-green-800">
                          <p className="text-3xl font-bold font-mono text-green-600" data-testid="text-best-streak-week">
                            {consistencyData.bestStreak}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Best Streak</p>
                          <p className="text-xs text-green-600 mt-1">Week {selectedWeek} {selectedYear}</p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center border border-purple-200 dark:border-purple-800">
                          <p className="text-lg font-semibold text-purple-600" data-testid="text-last-activity-week">
                            {consistencyData.lastActivityDate}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Last Activity Date</p>
                          <p className="text-xs text-purple-600 mt-1">Most recent completion</p>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Productivity Score - Weekly */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Week {selectedWeek} {selectedYear} Habit Productivity Score
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A combined score based on your consistency, streaks, and success rates in week {selectedWeek} of {selectedYear}.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const productivityScore = getProductivityScoreByTimeframe(habits, 'week');
                    const filteredHabits = filterHabitsByTimeframe(habits, 'week');
                    return (
                      <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center border border-primary/20">
                        <p className="text-5xl font-bold font-mono text-primary mb-2" data-testid="text-productivity-score-week">
                          {productivityScore}
                        </p>
                        <p className="text-sm text-muted-foreground">out of 100</p>
                        <p className="text-xs text-primary mt-2">
                          Based on {filteredHabits.length} active habit{filteredHabits.length !== 1 ? 's' : ''} in week {selectedWeek} of {selectedYear}
                        </p>
                        {productivityScore === 0 && filteredHabits.length > 0 && (
                          <p className="text-xs text-orange-600 mt-2">
                            Score is 0 - no activity detected
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Challenge Progress - Weekly */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Week {selectedWeek} {selectedYear} Challenge Progress
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track your progress through challenge habits in week {selectedWeek} of {selectedYear}.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const challengeHabits = getChallengeHabitsByTimeframe(habits, 'week');
                    return challengeHabits.length > 0 ? (
                      <div className="space-y-4">
                        {challengeHabits.slice(0, 3).map((habit) => {
                          const completionPct = habit.challengeDays > 0 
                            ? Math.round((habit.challengeCompleted / habit.challengeDays) * 100)
                            : 0;
                          const daysLeft = Math.max(0, habit.challengeDays - habit.challengeCompleted);
                          
                          return (
                            <div key={habit.id} className="p-4 bg-muted/50 rounded-lg border">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold">{habit.title}</span>
                                <div className="flex gap-2">
                                  <Badge variant="secondary">{habit.challengeDays}-day challenge</Badge>
                                  <Badge variant="outline">Week {selectedWeek} {selectedYear}</Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-green-600">{habit.challengeCompleted}</p>
                                  <p className="text-xs text-muted-foreground">Days Completed</p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-blue-600">{daysLeft}</p>
                                  <p className="text-xs text-muted-foreground">Days Left</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-orange-600">{habit.streak}</p>
                                  <p className="text-xs text-muted-foreground">Current Streak</p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-purple-600">{completionPct}%</p>
                                  <p className="text-xs text-muted-foreground">Completion %</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {challengeHabits.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center">
                            And {challengeHabits.length - 3} more challenge{challengeHabits.length - 3 !== 1 ? 's' : ''}...
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No challenge habits active in week {selectedWeek} of {selectedYear}</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Habits at Risk - Weekly */}
              <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                    Week {selectedWeek} {selectedYear} Habits at Risk
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Habits that need attention in week {selectedWeek} of {selectedYear}.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const habitsAtRisk = getHabitsAtRiskByTimeframe(habits, 'week');
                    return habitsAtRisk.length > 0 ? (
                      <div className="space-y-3">
                        {habitsAtRisk.map((habit) => {
                          const lastCompletedDate = habit.completedDates.length > 0 
                            ? new Date(Math.max(...habit.completedDates.map(d => new Date(d).getTime())))
                            : new Date(0);
                          const daysSinceActivity = differenceInDays(new Date(), lastCompletedDate);
                          const hasLowSuccessRate = habit.successRate < 30;
                          const hasLowStreak = habit.streak === 0;
                          
                          return (
                            <div 
                              key={habit.id} 
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{habit.title}</p>
                                <p className="text-sm text-muted-foreground">{habit.category}</p>
                                <div className="flex gap-2 mt-1">
                                  {daysSinceActivity > 2 && (
                                    <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                                      Inactive {daysSinceActivity} days
                                    </Badge>
                                  )}
                                  {hasLowSuccessRate && (
                                    <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                                      Low success rate ({habit.successRate}%)
                                    </Badge>
                                  )}
                                  {hasLowStreak && (
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
                                      No streak
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                  {habit.successRate}%
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Trophy className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <p className="text-sm text-green-600 font-medium">
                          Great job! No habits at risk in week {selectedWeek} of {selectedYear}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          All habits are on track
                        </p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
            {/* Monthly Content */}
            <TabsContent value="monthly" className="space-y-6 mt-6">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Select Date</h3>
                <div className="flex gap-2">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-32" data-testid="select-month-habits">
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
                    <SelectTrigger className="w-20" data-testid="select-year-habits">
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

              {/* Consistency Score - Monthly */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {selectedMonth} {selectedYear} Consistency Score
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    See how consistently you're maintaining your habits in {selectedMonth} {selectedYear}.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const consistencyData = getConsistencyScoreByTimeframe(habits, 'month', selectedMonth, selectedYear);
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border border-blue-200 dark:border-blue-800">
                          <p className="text-3xl font-bold font-mono text-blue-600" data-testid="text-consistency-month">
                            {consistencyData.avgConsistency}%
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Monthly Consistency</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {consistencyData.habitsCount} habit{consistencyData.habitsCount !== 1 ? 's' : ''} tracked
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center border border-green-200 dark:border-green-800">
                          <p className="text-3xl font-bold font-mono text-green-600" data-testid="text-best-streak-month">
                            {consistencyData.bestStreak}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Best Streak</p>
                          <p className="text-xs text-green-600 mt-1">{selectedMonth} {selectedYear}</p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center border border-purple-200 dark:border-purple-800">
                          <p className="text-lg font-semibold text-purple-600" data-testid="text-last-activity-month">
                            {consistencyData.lastActivityDate}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Last Activity Date</p>
                          <p className="text-xs text-purple-600 mt-1">Most recent completion</p>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Productivity Score - Monthly */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {selectedMonth} {selectedYear} Habit Productivity Score
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A combined score based on your consistency, streaks, and success rates in {selectedMonth} {selectedYear}.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const productivityScore = getProductivityScoreByTimeframe(habits, 'month', selectedMonth, selectedYear);
                    const filteredHabits = filterHabitsByTimeframe(habits, 'month', selectedMonth, selectedYear);
                    return (
                      <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center border border-primary/20">
                        <p className="text-5xl font-bold font-mono text-primary mb-2" data-testid="text-productivity-score-month">
                          {productivityScore}
                        </p>
                        <p className="text-sm text-muted-foreground">out of 100</p>
                        <p className="text-xs text-primary mt-2">
                          Based on {filteredHabits.length} active habit{filteredHabits.length !== 1 ? 's' : ''} in {selectedMonth} {selectedYear}
                        </p>
                        {productivityScore === 0 && filteredHabits.length > 0 && (
                          <p className="text-xs text-orange-600 mt-2">
                            Score is 0 - no activity detected
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Challenge Progress - Monthly */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Monthly Challenge Progress
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track your progress through challenge habits this month.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const challengeHabits = getChallengeHabitsByTimeframe(habits, 'month');
                    return challengeHabits.length > 0 ? (
                      <div className="space-y-4">
                        {challengeHabits.slice(0, 3).map((habit) => {
                          const completionPct = habit.challengeDays > 0 
                            ? Math.round((habit.challengeCompleted / habit.challengeDays) * 100)
                            : 0;
                          const daysLeft = Math.max(0, habit.challengeDays - habit.challengeCompleted);
                          
                          return (
                            <div key={habit.id} className="p-4 bg-muted/50 rounded-lg border">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold">{habit.title}</span>
                                <div className="flex gap-2">
                                  <Badge variant="secondary">{habit.challengeDays}-day challenge</Badge>
                                  <Badge variant="outline">This month</Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-green-600">{habit.challengeCompleted}</p>
                                  <p className="text-xs text-muted-foreground">Days Completed</p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-blue-600">{daysLeft}</p>
                                  <p className="text-xs text-muted-foreground">Days Left</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-orange-600">{habit.streak}</p>
                                  <p className="text-xs text-muted-foreground">Current Streak</p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-purple-600">{completionPct}%</p>
                                  <p className="text-xs text-muted-foreground">Completion %</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {challengeHabits.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center">
                            And {challengeHabits.length - 3} more challenge{challengeHabits.length - 3 !== 1 ? 's' : ''}...
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No challenge habits active this month</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Habits at Risk - Monthly */}
              <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                    Monthly Habits at Risk
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Habits that need attention this month.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const habitsAtRisk = getHabitsAtRiskByTimeframe(habits, 'month');
                    return habitsAtRisk.length > 0 ? (
                      <div className="space-y-3">
                        {habitsAtRisk.map((habit) => {
                          const lastCompletedDate = habit.completedDates.length > 0 
                            ? new Date(Math.max(...habit.completedDates.map(d => new Date(d).getTime())))
                            : new Date(0);
                          const daysSinceActivity = differenceInDays(new Date(), lastCompletedDate);
                          const hasLowSuccessRate = habit.successRate < 30;
                          const hasLowStreak = habit.streak === 0;
                          
                          return (
                            <div 
                              key={habit.id} 
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{habit.title}</p>
                                <p className="text-sm text-muted-foreground">{habit.category}</p>
                                <div className="flex gap-2 mt-1">
                                  {daysSinceActivity > 5 && (
                                    <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                                      Inactive {daysSinceActivity} days
                                    </Badge>
                                  )}
                                  {hasLowSuccessRate && (
                                    <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                                      Low success rate ({habit.successRate}%)
                                    </Badge>
                                  )}
                                  {hasLowStreak && (
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
                                      No streak
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                  {habit.successRate}%
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Trophy className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <p className="text-sm text-green-600 font-medium">
                          Great job! No habits at risk this month
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          All habits are on track
                        </p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Yearly Content */}
            <TabsContent value="yearly" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Select Year</h3>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-20" data-testid="select-year-habits-yearly">
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

              {/* Consistency Score - Yearly */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {selectedYear} Consistency Score
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    See how consistently you're maintaining your habits in {selectedYear}.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const consistencyData = getConsistencyScoreByTimeframe(habits, 'year', undefined, selectedYear);
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border border-blue-200 dark:border-blue-800">
                          <p className="text-3xl font-bold font-mono text-blue-600" data-testid="text-consistency-year">
                            {consistencyData.avgConsistency}%
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Yearly Consistency</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {consistencyData.habitsCount} habit{consistencyData.habitsCount !== 1 ? 's' : ''} tracked
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center border border-green-200 dark:border-green-800">
                          <p className="text-3xl font-bold font-mono text-green-600" data-testid="text-best-streak-year">
                            {consistencyData.bestStreak}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Best Streak</p>
                          <p className="text-xs text-green-600 mt-1">{selectedYear}</p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center border border-purple-200 dark:border-purple-800">
                          <p className="text-lg font-semibold text-purple-600" data-testid="text-last-activity-year">
                            {consistencyData.lastActivityDate}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Last Activity Date</p>
                          <p className="text-xs text-purple-600 mt-1">Most recent completion</p>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Productivity Score - Yearly */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {selectedYear} Habit Productivity Score
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A combined score based on your consistency, streaks, and success rates in {selectedYear}.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const productivityScore = getProductivityScoreByTimeframe(habits, 'year', undefined, selectedYear);
                    const filteredHabits = filterHabitsByTimeframe(habits, 'year', undefined, selectedYear);
                    return (
                      <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center border border-primary/20">
                        <p className="text-5xl font-bold font-mono text-primary mb-2" data-testid="text-productivity-score-year">
                          {productivityScore}
                        </p>
                        <p className="text-sm text-muted-foreground">out of 100</p>
                        <p className="text-xs text-primary mt-2">
                          Based on {filteredHabits.length} active habit{filteredHabits.length !== 1 ? 's' : ''} in {selectedYear}
                        </p>
                        {productivityScore === 0 && filteredHabits.length > 0 && (
                          <p className="text-xs text-orange-600 mt-2">
                            Score is 0 - no activity detected
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Challenge Progress - Yearly */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Yearly Challenge Progress
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track your progress through challenge habits this year.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const challengeHabits = getChallengeHabitsByTimeframe(habits, 'year');
                    return challengeHabits.length > 0 ? (
                      <div className="space-y-4">
                        {challengeHabits.slice(0, 3).map((habit) => {
                          const completionPct = habit.challengeDays > 0 
                            ? Math.round((habit.challengeCompleted / habit.challengeDays) * 100)
                            : 0;
                          const daysLeft = Math.max(0, habit.challengeDays - habit.challengeCompleted);
                          
                          return (
                            <div key={habit.id} className="p-4 bg-muted/50 rounded-lg border">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold">{habit.title}</span>
                                <div className="flex gap-2">
                                  <Badge variant="secondary">{habit.challengeDays}-day challenge</Badge>
                                  <Badge variant="outline">This year</Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-green-600">{habit.challengeCompleted}</p>
                                  <p className="text-xs text-muted-foreground">Days Completed</p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-blue-600">{daysLeft}</p>
                                  <p className="text-xs text-muted-foreground">Days Left</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-orange-600">{habit.streak}</p>
                                  <p className="text-xs text-muted-foreground">Current Streak</p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-purple-600">{completionPct}%</p>
                                  <p className="text-xs text-muted-foreground">Completion %</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {challengeHabits.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center">
                            And {challengeHabits.length - 3} more challenge{challengeHabits.length - 3 !== 1 ? 's' : ''}...
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No challenge habits active this year</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Habits at Risk - Yearly */}
              <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                    Yearly Habits at Risk
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Habits that need attention this year.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const habitsAtRisk = getHabitsAtRiskByTimeframe(habits, 'year');
                    return habitsAtRisk.length > 0 ? (
                      <div className="space-y-3">
                        {habitsAtRisk.map((habit) => {
                          const lastCompletedDate = habit.completedDates.length > 0 
                            ? new Date(Math.max(...habit.completedDates.map(d => new Date(d).getTime())))
                            : new Date(0);
                          const daysSinceActivity = differenceInDays(new Date(), lastCompletedDate);
                          const hasLowSuccessRate = habit.successRate < 30;
                          const hasLowStreak = habit.streak === 0;
                          
                          return (
                            <div 
                              key={habit.id} 
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{habit.title}</p>
                                <p className="text-sm text-muted-foreground">{habit.category}</p>
                                <div className="flex gap-2 mt-1">
                                  {daysSinceActivity > 14 && (
                                    <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                                      Inactive {daysSinceActivity} days
                                    </Badge>
                                  )}
                                  {hasLowSuccessRate && (
                                    <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                                      Low success rate ({habit.successRate}%)
                                    </Badge>
                                  )}
                                  {hasLowStreak && (
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
                                      No streak
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                  {habit.successRate}%
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Trophy className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <p className="text-sm text-green-600 font-medium">
                          Great job! No habits at risk this year
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          All habits are on track
                        </p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}