import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Zap, 
  AlertTriangle,
  Trophy,
  Calendar,
  CheckCircle2
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Goal } from "@/types/goals";
import {
  getOverallProgress,
  getMilestoneStats,
  getCategoryBreakdown,
  getGoalsAtRisk,
  getFastestProgressingGoal,
  calculateProductivityScore,
} from "@/types/goals";

interface GoalInsightsProps {
  goals: Goal[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(221, 83%, 53%)",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)",
  "hsl(0, 72%, 51%)",
];

export default function GoalInsights({ goals, open, onOpenChange }: GoalInsightsProps) {
  const overallProgress = getOverallProgress(goals);
  const milestoneStats = getMilestoneStats(goals);
  const categoryBreakdown = getCategoryBreakdown(goals);
  const goalsAtRisk = getGoalsAtRisk(goals);
  const fastestGoal = getFastestProgressingGoal(goals);
  
  const completedGoals = goals.filter((g) => g.progress === 100).length;
  const inProgressGoals = goals.filter((g) => g.progress > 0 && g.progress < 100).length;
  
  const challengeGoals = goals.filter((g) => g.challengeDuration > 0);
  
  const avgProductivityScore = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + calculateProductivityScore(g), 0) / goals.length)
    : 0;

  const bestMilestoneGoal = goals.reduce((best, current) => {
    const bestRate = best?.milestones.length 
      ? best.milestones.filter((m) => m.completed).length / best.milestones.length 
      : 0;
    const currentRate = current.milestones.length 
      ? current.milestones.filter((m) => m.completed).length / current.milestones.length 
      : 0;
    return currentRate > bestRate ? current : best;
  }, goals[0]);

  const getMotivationalMessage = () => {
    if (goals.length === 0) return "Set your first goal and start your journey.";
    if (completedGoals > 0) return "Amazing work completing goals! Keep the momentum going.";
    if (overallProgress >= 75) return "You're so close! The finish line is in sight.";
    if (overallProgress >= 50) return "Halfway there! Your dedication is paying off.";
    if (overallProgress >= 25) return "Great start! Small steps lead to big achievements.";
    if (inProgressGoals > 0) return "Every step forward counts. Keep pushing!";
    return "Your goals await. Today is the perfect day to begin.";
  };

  const getProductivityMotivation = () => {
    if (avgProductivityScore >= 80) return "Outstanding! You're operating at peak performance.";
    if (avgProductivityScore >= 60) return "Solid progress! You're building great momentum.";
    if (avgProductivityScore >= 40) return "You're making it happen. Stay consistent!";
    return "Focus on one small win today. It adds up.";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Goal Insights
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
            <p className="text-sm font-medium text-primary" data-testid="text-motivation-message">
              {getMotivationalMessage()}
            </p>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Overall Goal Progress
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Track how consistently you're moving toward your long-term vision.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-semibold font-mono" data-testid="text-total-goals">
                    {goals.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Goals</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-semibold font-mono" data-testid="text-in-progress">
                    {inProgressGoals}
                  </p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-semibold font-mono" data-testid="text-completed-goals">
                    {completedGoals}
                  </p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg text-center">
                  <p className="text-2xl font-semibold font-mono text-primary" data-testid="text-avg-progress">
                    {overallProgress}%
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Milestone Completion Rate
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                See how effectively you're completing the steps that lead to your goals.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-semibold font-mono text-green-600" data-testid="text-completed-milestones">
                    {milestoneStats.completed}
                  </p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-semibold font-mono" data-testid="text-pending-milestones">
                    {milestoneStats.pending}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm font-medium truncate" data-testid="text-best-milestone-goal">
                    {bestMilestoneGoal?.title || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">Best Performing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Goal Categories Breakdown
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Understand where you invest most of your long-term energy.
              </p>
            </CardHeader>
            <CardContent>
              {categoryBreakdown.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {categoryBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No goals yet
                </p>
              )}
            </CardContent>
          </Card>

          {challengeGoals.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Challenge Completion
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Track your progress through your active challenges.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challengeGoals.slice(0, 3).map((goal) => {
                    const daysCompleted = goal.daysWithProgress;
                    const daysLeft = Math.max(0, goal.challengeDuration - daysCompleted);
                    const completionPct = Math.round((daysCompleted / goal.challengeDuration) * 100);
                    
                    return (
                      <div key={goal.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{goal.title}</span>
                          <Badge variant="secondary">{goal.challengeDuration} days</Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div>
                            <p className="font-mono font-semibold">{daysCompleted}</p>
                            <p className="text-muted-foreground">Completed</p>
                          </div>
                          <div>
                            <p className="font-mono font-semibold">{daysLeft}</p>
                            <p className="text-muted-foreground">Left</p>
                          </div>
                          <div>
                            <p className="font-mono font-semibold">{goal.streak}</p>
                            <p className="text-muted-foreground">Streak</p>
                          </div>
                          <div>
                            <p className="font-mono font-semibold">{completionPct}%</p>
                            <p className="text-muted-foreground">Progress</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Fastest-Progressing Goal
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  The goal you're moving toward the quickest.
                </p>
              </CardHeader>
              <CardContent>
                {fastestGoal ? (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="font-medium" data-testid="text-fastest-goal">{fastestGoal.title}</p>
                    <p className="text-sm text-muted-foreground">{fastestGoal.category}</p>
                    <p className="text-2xl font-mono font-semibold mt-2">
                      {fastestGoal.progress}%
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No goals yet
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Goal Productivity Score
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Based on consistency, milestone completion, and progress.
                </p>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-4xl font-mono font-bold" data-testid="text-productivity-score">
                    {avgProductivityScore}
                  </p>
                  <p className="text-sm text-muted-foreground">out of 100</p>
                  <p className="text-xs text-primary mt-2">{getProductivityMotivation()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Consistency Score
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                See how steadily you're progressing toward your goals.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-semibold font-mono" data-testid="text-days-with-progress">
                    {goals.reduce((sum, g) => sum + g.daysWithProgress, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Days with Progress</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-semibold font-mono" data-testid="text-best-streak">
                    {Math.max(...goals.map((g) => g.streak), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Best Streak</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm font-medium" data-testid="text-last-activity">
                    {goals.length > 0 
                      ? goals.reduce((latest, g) => 
                          g.lastActivityAt > latest ? g.lastActivityAt : latest
                        , goals[0].lastActivityAt)
                      : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">Last Activity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {goalsAtRisk.length > 0 && (
            <Card className="border-orange-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  Goals at Risk
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Goals that haven't seen progress recently.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {goalsAtRisk.map((goal) => (
                    <div 
                      key={goal.id} 
                      className="flex items-center justify-between p-2 bg-orange-500/10 rounded-md"
                    >
                      <div>
                        <p className="text-sm font-medium">{goal.title}</p>
                        <p className="text-xs text-muted-foreground">{goal.category}</p>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        {goal.progress}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
