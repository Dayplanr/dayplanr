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
  Activity
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { format, differenceInDays, subDays, subWeeks, subMonths, subYears, startOfWeek, endOfWeek, eachWeekOfInterval, startOfYear, endOfYear } from "date-fns";
import type { Goal } from "@/types/goals";
import {
  getOverallProgress,
  getMilestoneStats,
  getCategoryBreakdown,
  getFastestProgressingGoal,
  calculateProductivityScore,
} from "@/types/goals";

interface GoalInsightsProps {
  goals: Goal[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Dynamic colors for pie chart - no predefined colors as requested
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
const filterGoalsByTimeframe = (goals: Goal[], timeframe: 'week' | 'month' | 'year', selectedMonth?: string, selectedYear?: number) => {
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
  
  return goals.filter(goal => new Date(goal.createdAt) >= cutoffDate);
};

const getGoalsAtRiskByTimeframe = (goals: Goal[], timeframe: 'week' | 'month' | 'year') => {
  const now = new Date();
  let inactivityDays: number;
  
  switch (timeframe) {
    case 'week':
      inactivityDays = 3; // 3 days for weekly
      break;
    case 'month':
      inactivityDays = 7; // 7 days for monthly
      break;
    case 'year':
      inactivityDays = 30; // 30 days for yearly
      break;
  }
  
  const cutoffDate = subDays(now, inactivityDays);
  
  return goals.filter((goal) => {
    const lastActivity = new Date(goal.lastActivityAt);
    return lastActivity < cutoffDate || goal.progress < 10;
  });
};

const getChallengeProgressByTimeframe = (goals: Goal[], timeframe: 'week' | 'month' | 'year') => {
  const challengeGoals = goals.filter(g => g.challengeDuration > 0);
  const now = new Date();
  
  return challengeGoals.filter(goal => {
    const createdDate = new Date(goal.createdAt);
    switch (timeframe) {
      case 'week':
        return differenceInDays(now, createdDate) <= 7;
      case 'month':
        return differenceInDays(now, createdDate) <= 30;
      case 'year':
        return differenceInDays(now, createdDate) <= 365;
      default:
        return true;
    }
  });
};

const getConsistencyScoreByTimeframe = (goals: Goal[], timeframe: 'week' | 'month' | 'year', selectedMonth?: string, selectedYear?: number) => {
  const filteredGoals = filterGoalsByTimeframe(goals, timeframe, selectedMonth, selectedYear);
  const now = new Date();
  
  let totalPossibleDays: number;
  switch (timeframe) {
    case 'week':
      totalPossibleDays = 7;
      break;
    case 'month':
      totalPossibleDays = 30;
      break;
    case 'year':
      totalPossibleDays = 365;
      break;
  }
  
  const totalDaysWithProgress = filteredGoals.reduce((sum, g) => {
    const goalAge = differenceInDays(now, new Date(g.createdAt));
    const maxDays = Math.min(goalAge + 1, totalPossibleDays);
    return sum + Math.min(g.daysWithProgress, maxDays);
  }, 0);
  
  const bestStreak = Math.max(...filteredGoals.map(g => g.streak), 0);
  
  const lastActivityDate = filteredGoals.length > 0 
    ? filteredGoals.reduce((latest, g) => 
        new Date(g.lastActivityAt) > new Date(latest) ? g.lastActivityAt : latest
      , filteredGoals[0].lastActivityAt)
    : null;
  
  return {
    totalDaysWithProgress,
    bestStreak,
    lastActivityDate: lastActivityDate ? format(new Date(lastActivityDate), "MMM d, yyyy") : "-",
    goalsCount: filteredGoals.length
  };
};

const getProductivityScoreByTimeframe = (goals: Goal[], timeframe: 'week' | 'month' | 'year', selectedMonth?: string, selectedYear?: number) => {
  const filteredGoals = filterGoalsByTimeframe(goals, timeframe, selectedMonth, selectedYear);
  const productivityScores = filteredGoals.map(g => calculateProductivityScore(g));
  
  return filteredGoals.length > 0 && productivityScores.some(s => s > 0)
    ? Math.round(productivityScores.reduce((sum, score) => sum + score, 0) / filteredGoals.length)
    : 0;
};

export default function GoalInsights({ goals, open, onOpenChange }: GoalInsightsProps) {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MMMM"));
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedWeek, setSelectedWeek] = useState(1);
  
  const overallProgress = getOverallProgress(goals);
  const milestoneStats = getMilestoneStats(goals);
  const categoryBreakdown = getCategoryBreakdown(goals);
  const fastestGoal = getFastestProgressingGoal(goals);
  
  const completedGoals = goals.filter((g) => g.progress === 100).length;
  const inProgressGoals = goals.filter((g) => g.progress > 0 && g.progress < 100).length;
  
  // Best performing goal based on milestone progress
  const bestMilestoneGoal = goals.reduce((best, current) => {
    if (!best) return current;
    const bestRate = best.milestones.length 
      ? best.milestones.filter((m) => m.completed).length / best.milestones.length 
      : 0;
    const currentRate = current.milestones.length 
      ? current.milestones.filter((m) => m.completed).length / current.milestones.length 
      : 0;
    return currentRate > bestRate ? current : best;
  }, goals[0]);

  // Dynamic colors for category breakdown
  const pieColors = generateColors(categoryBreakdown.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Goal Insights
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 1. Overall Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Overall Goal Progress
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track how consistently you're moving toward your long-term vision.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold font-mono text-primary" data-testid="text-total-goals">
                    {goals.length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Total Goals Created</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold font-mono text-blue-600" data-testid="text-in-progress">
                    {inProgressGoals}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Goals in Progress</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold font-mono text-green-600" data-testid="text-completed-goals">
                    {completedGoals}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Completed Goals</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg text-center border border-primary/20">
                  <p className="text-3xl font-bold font-mono text-primary" data-testid="text-avg-progress">
                    {overallProgress}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Average Completion %</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Milestone Completion Rate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Milestone Completion Rate
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                See how effectively you're completing the steps that lead to your goals.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center border border-green-200 dark:border-green-800">
                  <p className="text-3xl font-bold font-mono text-green-600" data-testid="text-completed-milestones">
                    {milestoneStats.completed}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Completed Milestones</p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center border border-orange-200 dark:border-orange-800">
                  <p className="text-3xl font-bold font-mono text-orange-600" data-testid="text-pending-milestones">
                    {milestoneStats.pending}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Pending Milestones</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center border border-purple-200 dark:border-purple-800">
                  <div className="text-lg font-semibold text-purple-600 truncate" data-testid="text-best-milestone-goal">
                    {bestMilestoneGoal?.title || "No goals yet"}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Best-Performing Goal</p>
                  {bestMilestoneGoal && (
                    <p className="text-xs text-purple-600 mt-1">
                      {Math.round((bestMilestoneGoal.milestones.filter(m => m.completed).length / bestMilestoneGoal.milestones.length) * 100)}% milestone completion
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Category Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Goal Categories Breakdown
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Understand where you invest most of your long-term energy.
              </p>
            </CardHeader>
            <CardContent>
              {categoryBreakdown.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="h-64 w-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryBreakdown.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} goals`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {categoryBreakdown.map((category, index) => (
                      <div key={category.name} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: pieColors[index] }}
                        />
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">({category.value} goals)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No goals created yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 6. Fastest-Progressing Goal */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Fastest-Progressing Goal
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                The goal you're moving toward the quickest.
              </p>
            </CardHeader>
            <CardContent>
              {fastestGoal ? (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="text-lg font-semibold text-primary" data-testid="text-fastest-goal">
                    {fastestGoal.title}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{fastestGoal.category}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold font-mono text-primary">
                        {fastestGoal.progress}%
                      </p>
                      <p className="text-xs text-muted-foreground">Progress</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">
                        {calculateProductivityScore(fastestGoal)}
                      </p>
                      <p className="text-xs text-muted-foreground">Productivity Score</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No goals created yet</p>
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
                    <SelectTrigger className="w-32" data-testid="select-week-goals">
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
                    <SelectTrigger className="w-20" data-testid="select-year-goals-weekly">
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
                    See how steadily you're progressing toward your goals in week {selectedWeek} of {selectedYear}.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const consistencyData = getConsistencyScoreByTimeframe(goals, 'week');
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border border-blue-200 dark:border-blue-800">
                          <p className="text-3xl font-bold font-mono text-blue-600" data-testid="text-days-with-progress-week">
                            {consistencyData.totalDaysWithProgress}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Days with Progress</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {consistencyData.goalsCount} goal{consistencyData.goalsCount !== 1 ? 's' : ''} tracked
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
                          <p className="text-xs text-purple-600 mt-1">Most recent activity</p>
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
                    Week {selectedWeek} {selectedYear} Goal Productivity Score
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A combined score based on your consistency, milestone completion, and overall progress in week {selectedWeek} of {selectedYear}.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const productivityScore = getProductivityScoreByTimeframe(goals, 'week');
                    const filteredGoals = filterGoalsByTimeframe(goals, 'week');
                    return (
                      <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center border border-primary/20">
                        <p className="text-5xl font-bold font-mono text-primary mb-2" data-testid="text-productivity-score-week">
                          {productivityScore}
                        </p>
                        <p className="text-sm text-muted-foreground">out of 100</p>
                        <p className="text-xs text-primary mt-2">
                          Based on {filteredGoals.length} goal{filteredGoals.length !== 1 ? 's' : ''} in week {selectedWeek} of {selectedYear}
                        </p>
                        {productivityScore === 0 && filteredGoals.length > 0 && (
                          <p className="text-xs text-orange-600 mt-2">
                            Score is 0 - no progress detected
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
                    Weekly Challenge Progress
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track your progress through challenges started this week.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const challengeGoals = getChallengeProgressByTimeframe(goals, 'week');
                    return challengeGoals.length > 0 ? (
                      <div className="space-y-4">
                        {challengeGoals.slice(0, 3).map((goal) => {
                          const daysCompleted = goal.daysWithProgress;
                          const daysLeft = Math.max(0, goal.challengeDuration - daysCompleted);
                          const completionPct = Math.round((daysCompleted / goal.challengeDuration) * 100);
                          
                          return (
                            <div key={goal.id} className="p-4 bg-muted/50 rounded-lg border">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold">{goal.title}</span>
                                <div className="flex gap-2">
                                  <Badge variant="secondary">{goal.challengeDuration}-day challenge</Badge>
                                  <Badge variant="outline">This week</Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-green-600">{daysCompleted}</p>
                                  <p className="text-xs text-muted-foreground">Days Completed</p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-blue-600">{daysLeft}</p>
                                  <p className="text-xs text-muted-foreground">Days Left</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-orange-600">{goal.streak}</p>
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
                        {challengeGoals.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center">
                            And {challengeGoals.length - 3} more challenge{challengeGoals.length - 3 !== 1 ? 's' : ''}...
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No challenge goals started this week</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Goals at Risk - Weekly */}
              <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                    Weekly Goals at Risk
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Goals that haven't seen progress in the last 3 days.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const goalsAtRiskForTimeframe = getGoalsAtRiskByTimeframe(goals, 'week');
                    return goalsAtRiskForTimeframe.length > 0 ? (
                      <div className="space-y-3">
                        {goalsAtRiskForTimeframe.map((goal) => {
                          const daysSinceActivity = differenceInDays(new Date(), new Date(goal.lastActivityAt));
                          const isLowProgress = goal.progress < 10;
                          const isStale = daysSinceActivity > 3;
                          
                          return (
                            <div 
                              key={goal.id} 
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{goal.title}</p>
                                <p className="text-sm text-muted-foreground">{goal.category}</p>
                                <div className="flex gap-2 mt-1">
                                  {isStale && (
                                    <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                                      No progress in {daysSinceActivity} days
                                    </Badge>
                                  )}
                                  {isLowProgress && (
                                    <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                                      Low completion rate ({goal.progress}%)
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-gray-600 border-gray-600 text-xs">
                                    Weekly view
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                  {goal.progress}%
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
                          Great job! No goals at risk this week
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          All goals are making good progress
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
                    <SelectTrigger className="w-32" data-testid="select-month-goals">
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
                    <SelectTrigger className="w-20" data-testid="select-year-goals">
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
                    See how steadily you're progressing toward your goals in {selectedMonth} {selectedYear}.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const consistencyData = getConsistencyScoreByTimeframe(goals, 'month', selectedMonth, selectedYear);
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border border-blue-200 dark:border-blue-800">
                          <p className="text-3xl font-bold font-mono text-blue-600" data-testid="text-days-with-progress-month">
                            {consistencyData.totalDaysWithProgress}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Days with Progress</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {consistencyData.goalsCount} goal{consistencyData.goalsCount !== 1 ? 's' : ''} tracked
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
                          <p className="text-xs text-purple-600 mt-1">Most recent activity</p>
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
                    {selectedMonth} {selectedYear} Goal Productivity Score
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A combined score based on your consistency, milestone completion, and overall progress in {selectedMonth} {selectedYear}.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const productivityScore = getProductivityScoreByTimeframe(goals, 'month', selectedMonth, selectedYear);
                    const filteredGoals = filterGoalsByTimeframe(goals, 'month', selectedMonth, selectedYear);
                    return (
                      <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center border border-primary/20">
                        <p className="text-5xl font-bold font-mono text-primary mb-2" data-testid="text-productivity-score-month">
                          {productivityScore}
                        </p>
                        <p className="text-sm text-muted-foreground">out of 100</p>
                        <p className="text-xs text-primary mt-2">
                          Based on {filteredGoals.length} goal{filteredGoals.length !== 1 ? 's' : ''} in {selectedMonth} {selectedYear}
                        </p>
                        {productivityScore === 0 && filteredGoals.length > 0 && (
                          <p className="text-xs text-orange-600 mt-2">
                            Score is 0 - no progress detected
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
                    Track your progress through challenges started this month.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const challengeGoals = getChallengeProgressByTimeframe(goals, 'month');
                    return challengeGoals.length > 0 ? (
                      <div className="space-y-4">
                        {challengeGoals.slice(0, 3).map((goal) => {
                          const daysCompleted = goal.daysWithProgress;
                          const daysLeft = Math.max(0, goal.challengeDuration - daysCompleted);
                          const completionPct = Math.round((daysCompleted / goal.challengeDuration) * 100);
                          
                          return (
                            <div key={goal.id} className="p-4 bg-muted/50 rounded-lg border">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold">{goal.title}</span>
                                <div className="flex gap-2">
                                  <Badge variant="secondary">{goal.challengeDuration}-day challenge</Badge>
                                  <Badge variant="outline">This month</Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-green-600">{daysCompleted}</p>
                                  <p className="text-xs text-muted-foreground">Days Completed</p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-blue-600">{daysLeft}</p>
                                  <p className="text-xs text-muted-foreground">Days Left</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-orange-600">{goal.streak}</p>
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
                        {challengeGoals.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center">
                            And {challengeGoals.length - 3} more challenge{challengeGoals.length - 3 !== 1 ? 's' : ''}...
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No challenge goals started this month</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Goals at Risk - Monthly */}
              <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                    Monthly Goals at Risk
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Goals that haven't seen progress in the last 7 days.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const goalsAtRiskForTimeframe = getGoalsAtRiskByTimeframe(goals, 'month');
                    return goalsAtRiskForTimeframe.length > 0 ? (
                      <div className="space-y-3">
                        {goalsAtRiskForTimeframe.map((goal) => {
                          const daysSinceActivity = differenceInDays(new Date(), new Date(goal.lastActivityAt));
                          const isLowProgress = goal.progress < 10;
                          const isStale = daysSinceActivity > 7;
                          
                          return (
                            <div 
                              key={goal.id} 
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{goal.title}</p>
                                <p className="text-sm text-muted-foreground">{goal.category}</p>
                                <div className="flex gap-2 mt-1">
                                  {isStale && (
                                    <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                                      No progress in {daysSinceActivity} days
                                    </Badge>
                                  )}
                                  {isLowProgress && (
                                    <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                                      Low completion rate ({goal.progress}%)
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-gray-600 border-gray-600 text-xs">
                                    Monthly view
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                  {goal.progress}%
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
                          Great job! No goals at risk this month
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          All goals are making good progress
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
                  <SelectTrigger className="w-20" data-testid="select-year-goals-yearly">
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
                    See how steadily you're progressing toward your goals in {selectedYear}.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const consistencyData = getConsistencyScoreByTimeframe(goals, 'year', undefined, selectedYear);
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border border-blue-200 dark:border-blue-800">
                          <p className="text-3xl font-bold font-mono text-blue-600" data-testid="text-days-with-progress-year">
                            {consistencyData.totalDaysWithProgress}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Days with Progress</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {consistencyData.goalsCount} goal{consistencyData.goalsCount !== 1 ? 's' : ''} tracked
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
                          <p className="text-xs text-purple-600 mt-1">Most recent activity</p>
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
                    {selectedYear} Goal Productivity Score
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A combined score based on your consistency, milestone completion, and overall progress in {selectedYear}.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const productivityScore = getProductivityScoreByTimeframe(goals, 'year', undefined, selectedYear);
                    const filteredGoals = filterGoalsByTimeframe(goals, 'year', undefined, selectedYear);
                    return (
                      <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center border border-primary/20">
                        <p className="text-5xl font-bold font-mono text-primary mb-2" data-testid="text-productivity-score-year">
                          {productivityScore}
                        </p>
                        <p className="text-sm text-muted-foreground">out of 100</p>
                        <p className="text-xs text-primary mt-2">
                          Based on {filteredGoals.length} goal{filteredGoals.length !== 1 ? 's' : ''} in {selectedYear}
                        </p>
                        {productivityScore === 0 && filteredGoals.length > 0 && (
                          <p className="text-xs text-orange-600 mt-2">
                            Score is 0 - no progress detected
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
                    Track your progress through challenges started this year.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const challengeGoals = getChallengeProgressByTimeframe(goals, 'year');
                    return challengeGoals.length > 0 ? (
                      <div className="space-y-4">
                        {challengeGoals.slice(0, 3).map((goal) => {
                          const daysCompleted = goal.daysWithProgress;
                          const daysLeft = Math.max(0, goal.challengeDuration - daysCompleted);
                          const completionPct = Math.round((daysCompleted / goal.challengeDuration) * 100);
                          
                          return (
                            <div key={goal.id} className="p-4 bg-muted/50 rounded-lg border">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold">{goal.title}</span>
                                <div className="flex gap-2">
                                  <Badge variant="secondary">{goal.challengeDuration}-day challenge</Badge>
                                  <Badge variant="outline">This year</Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-green-600">{daysCompleted}</p>
                                  <p className="text-xs text-muted-foreground">Days Completed</p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-blue-600">{daysLeft}</p>
                                  <p className="text-xs text-muted-foreground">Days Left</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                                  <p className="text-2xl font-bold font-mono text-orange-600">{goal.streak}</p>
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
                        {challengeGoals.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center">
                            And {challengeGoals.length - 3} more challenge{challengeGoals.length - 3 !== 1 ? 's' : ''}...
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No challenge goals started this year</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Goals at Risk - Yearly */}
              <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                    Yearly Goals at Risk
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Goals that haven't seen progress in the last 30 days.
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const goalsAtRiskForTimeframe = getGoalsAtRiskByTimeframe(goals, 'year');
                    return goalsAtRiskForTimeframe.length > 0 ? (
                      <div className="space-y-3">
                        {goalsAtRiskForTimeframe.map((goal) => {
                          const daysSinceActivity = differenceInDays(new Date(), new Date(goal.lastActivityAt));
                          const isLowProgress = goal.progress < 10;
                          const isStale = daysSinceActivity > 30;
                          
                          return (
                            <div 
                              key={goal.id} 
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{goal.title}</p>
                                <p className="text-sm text-muted-foreground">{goal.category}</p>
                                <div className="flex gap-2 mt-1">
                                  {isStale && (
                                    <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                                      No progress in {daysSinceActivity} days
                                    </Badge>
                                  )}
                                  {isLowProgress && (
                                    <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                                      Low completion rate ({goal.progress}%)
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-gray-600 border-gray-600 text-xs">
                                    Yearly view
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                  {goal.progress}%
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
                          Great job! No goals at risk this year
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          All goals are making good progress
                        </p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {goals.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
                <p className="text-muted-foreground">
                  Create your first goal to start tracking your progress and see insights.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}