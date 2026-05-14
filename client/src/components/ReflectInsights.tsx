import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Clock, PieChart as PieChartIcon, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, startOfYear, endOfYear, getMonth, getYear } from "date-fns";
import { useTranslation } from "@/lib/i18n";

const MOODS = [
  { id: "great", emoji: "✨", label: "Great", color: "#10b981" }, // Emerald
  { id: "okay", emoji: "😐", label: "Okay", color: "#6366f1" }, // Indigo
  { id: "stressed", emoji: "😰", label: "Stressed", color: "#f59e0b" }, // Amber
  { id: "tired", emoji: "😴", label: "Tired", color: "#6b7280" }, // Gray
  { id: "bad", emoji: "👎", label: "Bad", color: "#ef4444" }, // Red
];

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
  const weeks = eachWeekOfInterval({ start: yearStart, end: yearEnd }, { weekStartsOn: 1 });

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

interface Reflection {
  id: string;
  mood: string | null;
  progress: string | null;
  challenge: string | null;
  next_step: string | null;
  created_at: string;
}

interface ReflectInsightsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: Reflection[];
}

export default function ReflectInsights({ open, onOpenChange, history }: ReflectInsightsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("days");
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MMMM"));

  // Calculate weekly data (Mood counts for the selected week)
  const weeklyData = useMemo(() => {
    const weeks = generateWeeks(selectedYear);
    const targetWeek = weeks.find(w => w.value === selectedWeek);
    if (!targetWeek) return [];

    const weekReflections = history.filter(item => {
      const date = new Date(item.created_at);
      return date >= targetWeek.startDate && date <= targetWeek.endDate;
    });

    return MOODS.map(mood => ({
      name: mood.emoji + " " + mood.label,
      count: weekReflections.filter(r => r.mood === mood.id).length,
      color: mood.color,
    }));
  }, [history, selectedWeek, selectedYear]);

  // Calculate monthly data (Mood counts for the selected month)
  const monthlyData = useMemo(() => {
    const monthIndex = months.indexOf(selectedMonth);
    const monthReflections = history.filter(item => {
      const date = new Date(item.created_at);
      return date.getFullYear() === selectedYear && date.getMonth() === monthIndex;
    });

    return MOODS.map(mood => ({
      name: mood.emoji + " " + mood.label,
      value: monthReflections.filter(r => r.mood === mood.id).length,
      color: mood.color,
    })).filter(data => data.value > 0); // Only show moods that occurred
  }, [history, selectedMonth, selectedYear]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Reflection Insights
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="days">Days</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            {/* DAYS TAB */}
            <TabsContent value="days" className="mt-4">
              {history.length === 0 ? (
                <p className="text-muted-foreground text-sm italic text-center p-8 bg-card rounded-2xl border border-border/50">
                  No reflections yet. Start checking in to build your history.
                </p>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => {
                    const moodData = MOODS.find(m => m.id === item.mood);
                    return (
                      <div key={item.id} className="bg-card p-4 rounded-xl shadow-sm border border-border/50 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-border/30 pb-3">
                          <span className="text-sm font-medium text-foreground">
                            {format(new Date(item.created_at), "EEEE, MMM d, yyyy")}
                          </span>
                          {moodData && (
                            <span className="bg-muted px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 font-medium">
                              {moodData.emoji} {moodData.label}
                            </span>
                          )}
                        </div>
                        {item.progress && (
                          <div>
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold mb-1">{t("reflectProgress")}</p>
                            <p className="text-[13px] text-foreground/90 whitespace-pre-wrap">{item.progress}</p>
                          </div>
                        )}
                        {item.challenge && (
                          <div className="mt-1">
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold mb-1">{t("reflectChallenge")}</p>
                            <p className="text-[13px] text-foreground/90 whitespace-pre-wrap">{item.challenge}</p>
                          </div>
                        )}
                        {item.next_step && (
                          <div className="mt-1">
                            <p className="text-[11px] uppercase text-muted-foreground font-semibold mb-1">{t("reflectNextStep")}</p>
                            <p className="text-[13px] text-foreground/90 whitespace-pre-wrap">{item.next_step}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* WEEKLY TAB */}
            <TabsContent value="weekly" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Select Week</h3>
                <div className="flex gap-2">
                  <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                    <SelectTrigger className="w-32">
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
                    <SelectTrigger className="w-20">
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

              <div className="bg-card border border-border/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Mood Summary</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                      <RechartsTooltip
                        cursor={{ fill: "hsl(var(--muted))" }}
                        contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                        {weeklyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            {/* MONTHLY TAB */}
            <TabsContent value="monthly" className="space-y-4 mt-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">Select Month</h3>
                <div className="flex gap-2">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-32">
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
                    <SelectTrigger className="w-20">
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

              <div className="bg-card border border-border/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <PieChartIcon className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Mood Distribution</h3>
                </div>
                {monthlyData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={monthlyData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {monthlyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-sm text-muted-foreground italic">
                    No mood data for this month.
                  </div>
                )}
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
