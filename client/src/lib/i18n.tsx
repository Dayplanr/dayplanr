import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth";

export type Language = "en" | "de";

export const languageNames: Record<Language, string> = {
  en: "English",
  de: "Deutsch",
};

export type TranslationKey =
  | "today" | "goals" | "habits" | "focus" | "dailyProgress" | "tasksComplete" | "focusTime" | "streak" | "complete"
  | "morning" | "afternoon" | "evening" | "night" | "addTask" | "insights" | "settings" | "language" | "theme"
  | "dark" | "light" | "system" | "cancel" | "save" | "delete" | "edit" | "add" | "create" | "title" | "description"
  | "priority" | "high" | "medium" | "low" | "startFocus" | "pauseFocus" | "resumeFocus" | "stopFocus" | "focusSession"
  | "breakTime" | "deepWork" | "pomodoro" | "minutes" | "hours" | "days" | "week" | "month" | "year" | "yesterday"
  | "tomorrow" | "thisWeek" | "thisMonth" | "completed" | "inProgress" | "notStarted" | "overdue" | "onTrack"
  | "habitStreak" | "currentStreak" | "longestStreak" | "completionRate" | "goalProgress" | "addGoal" | "addHabit"
  | "noTasks" | "noGoals" | "noHabits" | "welcomeBack" | "goodMorning" | "goodAfternoon" | "goodEvening" | "of"
  | "account" | "profile" | "personalData" | "privacy" | "deleteAccount" | "connections" | "appleHealth" | "calendar"
  | "notifications" | "appearance" | "themeColor" | "appIcon" | "general" | "haptics" | "logOut" | "reminderSettings"
  | "reminderDescription" | "reminderCategories" | "taskReminders" | "habitReminders" | "focusReminders"
  | "incompleteNudges" | "timing" | "atTime" | "minutesBefore10" | "minutesBefore30" | "hourBefore" | "notificationStyle"
  | "gentle" | "important" | "reminderNote" | "deleteAccountConfirm" | "taskTitle" | "time" | "period" | "newTask"
  | "taskTitlePlaceholder" | "descriptionOptional" | "descriptionPlaceholder" | "startTimeOptional" | "durationOptional"
  | "linkToHabitOptional" | "linkToGoalOptional" | "category" | "noGoal" | "none" | "personal" | "work" | "health"
  | "learning" | "other" | "taskDeleted" | "activeGoals" | "progress" | "customize" | "customizeDashboard"
  | "customizeDashboardDescription" | "moduleVisible" | "moduleHidden" | "reflect" | "reflectProgress"
  | "reflectChallenge" | "reflectNextStep" | "reflectMood" | "reflectSave" | "reflectSaved" | "reflectProgressPlaceholder"
  | "reflectChallengePlaceholder" | "reflectNextStepPlaceholder" | "reflectDescription"
  | "insight_streak_title" | "insight_streak_desc" | "insight_all_done_title" | "insight_all_done_desc"
  | "insight_great_progress_title" | "insight_great_progress_desc" | "insight_weekday_warrior_title"
  | "insight_weekday_warrior_desc" | "insight_goal_inactive_title" | "insight_goal_inactive_desc_days"
  | "insight_goal_inactive_desc_none" | "insight_goal_near_done_title" | "insight_goal_near_done_desc"
  | "insight_goal_fastest_title" | "insight_goal_fastest_desc" | "insight_habit_top_streak_title"
  | "insight_habit_top_streak_desc" | "insight_habit_low_consistency_title" | "insight_habit_low_consistency_desc"
  | "insight_habit_weekday_pattern_title" | "insight_habit_weekday_pattern_desc" | "insight_reflect_mood_productive_title"
  | "insight_reflect_mood_productive_desc" | "insight_reflect_stress_sleep_title" | "insight_reflect_stress_sleep_desc"
  | "insight_reflect_low_moods_title" | "insight_reflect_low_moods_desc" | "insight_reflect_positive_streak_title"
  | "insight_reflect_positive_streak_desc" | "insight_pattern_peak_performance_title" | "insight_pattern_peak_performance_desc"
  | "insight_pattern_habit_champion_title" | "insight_pattern_habit_champion_desc" | "insight_pattern_goal_stall_title"
  | "insight_pattern_goal_stall_desc" | "insight_cat_distraction_title" | "insight_cat_distraction_desc"
  | "insight_cat_energy_title" | "insight_cat_energy_desc" | "insight_cat_time_title" | "insight_cat_time_desc"
  | "insight_cat_focus_title" | "insight_cat_focus_desc" | "insight_cat_overwhelm_title" | "insight_cat_overwhelm_desc"
  | "insight_cat_health_title" | "insight_cat_health_desc"
  | "growth_headline_improving" | "growth_headline_declining" | "growth_headline_steady" | "growth_headline_new"
  | "growth_narrative_improving" | "growth_narrative_declining" | "growth_narrative_steady" | "growth_narrative_generic"
  | "growth_best_day" | "growth_habit_anchor" | "growth_challenge_blocker" | "growth_dominant_mood"
  | "growth_month_total" | "growth_month_habit" | "growth_month_mood" | "growth_year_total" | "growth_year_goals"
  | "growth_year_reflections" | "growth_empty" | "growth_highlight_productive" | "growth_highlight_habit"
  | "growth_highlight_blocker" | "growth_highlight_mood" | "growth_monthly_headline_improving"
  | "growth_monthly_headline_declining" | "growth_monthly_headline_steady" | "growth_monthly_headline_new"
  | "growth_yearly_headline_improving" | "growth_yearly_headline_declining" | "growth_trend_improving"
  | "growth_trend_steady" | "growth_trend_declining"  | "growth_trend_new"
  | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
  | "growth_report" | "growth_report_desc" | "weekly" | "monthly" | "yearly" | "behavioral_trends"
  | "emotional_tone" | "habit_formation" | "positive" | "mixed" | "today_morning_momentum" | "today_morning_greet"
  | "today_afternoon_momentum" | "today_afternoon_greet" | "today_evening_done" | "today_evening_greet"
  | "awareness" | "full_reflection" | "direction" | "no_tasks_planned" | "start_intentionally"
  | "mood_pill_great" | "mood_pill_calm" | "mood_pill_productive" | "mood_pill_focused" | "mood_pill_tired" | "mood_pill_stressed"
  | "reflect_saving" | "emotional_patterns" | "goal_insights" | "error_fetching_goals" | "goal_updated" | "error_updating_goal"
  | "goal_deleted" | "error_deleting_goal" | "habit_insights" | "error_fetching_habits" | "day_unmarked" | "day_marked"
  | "error_updating_habit" | "habit_updated" | "habit_deleted" | "error_deleting_habit" | "delete_habit" | "delete_habit_confirm"
  | "overall_progress" | "category_breakdown" | "fastest_progressing" | "consistency_score" | "productivity_score"
  | "select_week" | "select_date" | "total_goals" | "total_habits" | "completed_goals" | "goals_in_progress"
  | "active_streaks" | "avg_completion" | "avg_success_rate" | "milestones_rate" | "completed_milestones"
  | "pending_milestones" | "best_performing" | "goals_at_risk" | "habits_at_risk" | "no_activity_detected"
  | "out_of_100" | "days_with_progress" | "best_streak" | "last_activity" | "milestoneRateDesc" | "milestone_completion"
  | "categoryBreakdownDesc" | "fastestGoalDesc" | "consistencyDesc" | "productivityDesc" | "habitProgressDesc"
  | "weekly_pattern" | "habitWeeklyPatternDesc" | "bestHabitDesc" | "consistencyHabitDesc" | "productivityHabitDesc"
  | "today_insights" | "tasks_done" | "focus_time" | "best_day" | "best_month" | "avg_per_day" | "tasks_vs_focus"
  | "goal_progress" | "focus_insights" | "sessions" | "no_sessions" | "pomodoro" | "deep_work" | "custom" | "top_timer"
  | "view_insights" | "active_days" | "timer_ranking" | "best_focus_month" | "sessions_by_timer" | "focus_trend" | "total_minutes"
  | "timeline" | "pattern_insights" | "reflection_history" | "no_reflections_yet" | "mood_summary" | "mood_distribution" | "no_mood_data"
  | "mood_great" | "mood_good" | "mood_okay" | "mood_stressed" | "mood_tired" | "mood_bad" | "completion_rate";

type Translations = Record<TranslationKey, string>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
  en: {
    today: "Today",
    goals: "Goals",
    habits: "Habits",
    focus: "Focus",
    dailyProgress: "Daily Progress",
    tasksComplete: "tasks complete",
    focusTime: "Focus Time",
    streak: "Streak",
    complete: "complete",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    night: "Night",
    addTask: "Add Task",
    insights: "Insights",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    system: "System",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    create: "Create",
    title: "Title",
    description: "Description",
    priority: "Priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    startFocus: "Start Focus",
    pauseFocus: "Pause",
    resumeFocus: "Resume",
    stopFocus: "Stop",
    focusSession: "Focus Session",
    breakTime: "Break Time",
    deepWork: "Deep Work",
    pomodoro: "Pomodoro",
    minutes: "minutes",
    hours: "hours",
    days: "days",
    week: "week",
    month: "month",
    year: "year",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    thisWeek: "This Week",
    thisMonth: "This Month",
    completed: "Completed",
    inProgress: "In Progress",
    notStarted: "Not Started",
    overdue: "Overdue",
    onTrack: "On Track",
    habitStreak: "Habit Streak",
    currentStreak: "Current Streak",
    longestStreak: "Longest Streak",
    completionRate: "Completion Rate",
    goalProgress: "Goal Progress",
    addGoal: "Add Goal",
    addHabit: "Add Habit",
    noTasks: "No tasks",
    noGoals: "No goals yet",
    noHabits: "No habits yet",
    welcomeBack: "Welcome back",
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    of: "of",
    account: "Account",
    profile: "Profile",
    personalData: "Personal Data",
    privacy: "Privacy",
    deleteAccount: "Delete Account",
    connections: "Connections",
    appleHealth: "Apple Health",
    calendar: "Calendar",
    notifications: "Notifications",
    appearance: "Appearance",
    themeColor: "Theme Color",
    appIcon: "App Icon",
    general: "General",
    haptics: "Haptics",
    logOut: "Log Out",
    reminderSettings: "Reminder Settings",
    reminderDescription: "Customize smart reminders to support your daily planning, habits, and goals.",
    reminderCategories: "Reminder Categories",
    taskReminders: "Task Reminders",
    habitReminders: "Habit Reminders",
    focusReminders: "Focus Reminders",
    incompleteNudges: "Incomplete Task Nudges",
    timing: "Timing",
    atTime: "At scheduled time",
    minutesBefore10: "10 minutes before",
    minutesBefore30: "30 minutes before",
    hourBefore: "1 hour before",
    notificationStyle: "Notification Style",
    gentle: "Gentle",
    important: "Important",
    reminderNote: "Reminders are designed to be supportive and non-intrusive, helping you stay on track without creating pressure.",
    deleteAccountConfirm: "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.",
    taskTitle: "Task Title",
    time: "Time",
    period: "Period",
    newTask: "New Task",
    taskTitlePlaceholder: "What do you need to do?",
    descriptionOptional: "Description (Optional)",
    descriptionPlaceholder: "Add more details...",
    startTimeOptional: "Start Time (Optional)",
    durationOptional: "Duration (Optional)",
    linkToHabitOptional: "Link to Habit (Optional)",
    linkToGoalOptional: "Link to Goal (Optional)",
    category: "Category",
    noGoal: "No goal",
    none: "None",
    personal: "Personal",
    work: "Work",
    health: "Health",
    learning: "Learning",
    other: "Other",
    taskDeleted: "Task Deleted",
    activeGoals: "Active Goals",
    progress: "Daily Progress",
    customize: "Customize",
    customizeDashboard: "Customize Dashboard",
    customizeDashboardDescription: "Toggle and reorder your dashboard modules to fit your flow.",
    moduleVisible: "Visible",
    moduleHidden: "Hidden",
    reflect: "Reflect",
    reflectProgress: "Progress",
    reflectChallenge: "Challenge",
    reflectNextStep: "Next Step",
    reflectMood: "How are you feeling?",
    reflectSave: "Save Reflection",
    reflectSaved: "Reflection saved",
    reflectProgressPlaceholder: "What went well today?",
    reflectChallengePlaceholder: "What was difficult?",
    reflectNextStepPlaceholder: "What's one thing to focus on tomorrow?",
    reflectDescription: "Take a moment to check in with yourself.",
    insight_streak_title: "{{count}}-Day Streak 🔥",
    insight_streak_desc: "You've completed tasks for {{count}} days in a row. Keep this momentum going!",
    insight_all_done_title: "All Tasks Done",
    insight_all_done_desc: "You've completed everything scheduled for today. Excellent focus!",
    insight_great_progress_title: "Great Progress",
    insight_great_progress_desc: "{{count}} of {{total}} tasks done today. You're on track!",
    insight_weekday_warrior_title: "Weekday Warrior",
    insight_weekday_warrior_desc: "You complete significantly more tasks on weekdays. Use that weekday energy!",
    insight_goal_inactive_title: "Goal Needs Attention",
    insight_goal_inactive_desc_days: "\"{{title}}\" hasn't had activity in {{count}} days. Even one small step counts.",
    insight_goal_inactive_desc_none: "\"{{title}}\" hasn't been started yet. What's one action you can take today?",
    insight_goal_near_done_title: "Almost There",
    insight_goal_near_done_desc: "\"{{title}}\" is {{percent}}% complete. You're in the final stretch!",
    insight_goal_fastest_title: "Leading Goal",
    insight_goal_fastest_desc: "\"{{title}}\" is your strongest goal at {{percent}}% complete.",
    insight_habit_top_streak_title: "Strongest Streak",
    insight_habit_top_streak_desc: "\"{{title}}\" has a {{count}}-day streak. This is becoming a true habit!",
    insight_habit_low_consistency_title: "Consistency Opportunity",
    insight_habit_low_consistency_desc: "\"{{title}}\" has the lowest consistency. Linking it to an existing habit might help.",
    insight_habit_weekday_pattern_title: "Weekday Consistency",
    insight_habit_weekday_pattern_desc: "You complete habits {{percent}}% more often on weekdays. Protect your weekend routine too.",
    insight_reflect_mood_productive_title: "Mood Matters",
    insight_reflect_mood_productive_desc: "Your most productive days align with feeling \"{{mood}}\". Protect what creates that state.",
    insight_reflect_stress_sleep_title: "Sleep & Stress Link",
    insight_reflect_stress_sleep_desc: "Stress and low energy appear together in your reflections. Rest may be your most powerful productivity tool.",
    insight_reflect_low_moods_title: "Take Care of Yourself",
    insight_reflect_low_moods_desc: "You've logged lower moods recently. It's okay to slow down. Rest is not wasted time.",
    insight_reflect_positive_streak_title: "Positive Momentum",
    insight_reflect_positive_streak_desc: "You've been feeling good lately. Notice what's working and double down on it.",
    insight_pattern_peak_performance_title: "Peak Performance",
    insight_pattern_peak_performance_desc: "You complete the most tasks when you feel \"{{mood}}\". Protect the conditions that create this state.",
    insight_pattern_habit_champion_title: "Habit Champion",
    insight_pattern_habit_champion_desc: "\"{{title}}\" is your strongest habit with a {{count}}-day streak. Habits like this compound over time.",
    insight_pattern_goal_stall_title: "Goals Need Attention",
    insight_pattern_goal_stall_desc: "{{count}} goal{{plural}} stalled. Reconnecting with your 'why' can reignite progress.",
    insight_cat_distraction_title: "Digital Distractions",
    insight_cat_distraction_desc: "Digital distractions frequently appear in your challenges. Try setting your phone to Do Not Disturb during focus blocks.",
    insight_cat_energy_title: "Energy Management",
    insight_cat_energy_desc: "Sleep or fatigue is a recurring challenge. A consistent bedtime routine could unlock significant energy gains.",
    insight_cat_time_title: "Time Awareness",
    insight_cat_time_desc: "Time management comes up repeatedly. Try time-blocking your mornings to protect your most focused hours.",
    insight_cat_focus_title: "Focus Patterns",
    insight_cat_focus_desc: "You mention struggling with focus. Starting with just 5 minutes of focused work often breaks the inertia.",
    insight_cat_overwhelm_title: "Overwhelm Signals",
    insight_cat_overwhelm_desc: "Feelings of overwhelm appear in your data. Breaking goals into smaller daily actions could reduce this significantly.",
    insight_cat_health_title: "Energy & Nutrition",
    insight_cat_health_desc: "Nutrition and hydration appear as challenges. Small habits like keeping water nearby can noticeably lift your energy.",
    growth_headline_improving: "A stronger week than the last",
    growth_headline_declining: "A quieter week — room to rebuild",
    growth_headline_steady: "Staying consistent this week",
    growth_headline_new: "Starting to build your patterns",
    growth_narrative_improving: "You completed {{current}} tasks this week — more than the {{prev}} last week.",
    growth_narrative_declining: "You completed {{current}} tasks, slightly less than last week's {{prev}}. Every week is a fresh start.",
    growth_narrative_steady: "Consistent pace: {{current}} tasks completed, similar to last week.",
    growth_narrative_generic: "You completed {{count}} tasks this week.",
    growth_best_day: "{{day}} was your most productive day.",
    growth_habit_anchor: "\"{{title}}\" was consistent — routines compound powerfully.",
    growth_challenge_blocker: "{{challenge}} appeared as your main obstacle.",
    growth_dominant_mood: "Your dominant emotional tone was \"{{mood}}\".",
    growth_month_total: "Over the past 30 days you completed {{count}} tasks.",
    growth_month_habit: "\"{{title}}\" was your anchor, completed on {{percent}}% of days.",
    growth_month_mood: "Your dominant emotional tone was \"{{mood}}\".",
    growth_year_total: "This year you completed {{count}} tasks.",
    growth_year_goals: "You finished {{count}} goals.",
    growth_year_reflections: "You've built a record of {{count}} reflections.",
    growth_empty: "Keep going — patterns take time to form. Every small action builds self-awareness.",
    growth_highlight_productive: "Most productive: {{day}}",
    growth_highlight_habit: "Top habit: {{title}}",
    growth_highlight_blocker: "Main blocker: {{challenge}}",
    growth_highlight_mood: "Mood: {{mood}}",
    growth_monthly_headline_improving: "Growing stronger this month",
    growth_monthly_headline_declining: "A reflective month",
    growth_monthly_headline_steady: "Reliable consistency",
    growth_monthly_headline_new: "Your first month of growth",
    growth_yearly_headline_improving: "A year of meaningful growth",
    growth_yearly_headline_declining: "Reflecting on your year",
    growth_trend_improving: "Improving",
    growth_trend_steady: "Steady",
    growth_trend_declining: "Declining",
    growth_trend_new: "New",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    growth_report: "Growth Report",
    growth_report_desc: "Understanding your behavior and progress.",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
    behavioral_trends: "Behavioral Trends",
    emotional_tone: "Emotional Tone",
    habit_formation: "Habit Formation",
    positive: "Positive",
    mixed: "Mixed",
    today_morning_momentum: "You're starting with great momentum.",
    today_morning_greet: "Good morning. What's your main intention for today?",
    today_afternoon_momentum: "Solid progress so far. Keep this focused energy.",
    today_afternoon_greet: "The afternoon is a fresh chance to move forward.",
    today_evening_done: "A truly intentional day. Rest well.",
    today_evening_greet: "The evening is for gentle reflection and winding down.",
    awareness: "Awareness",
    full_reflection: "Full Reflection",
    direction: "Direction",
    no_tasks_planned: "No tasks planned yet. Small intentional actions create long-term growth.",
    start_intentionally: "Start your day intentionally",
    mood_pill_great: "✨ Great",
    mood_pill_calm: "😌 Calm",
    mood_pill_productive: "🔋 Productive",
    mood_pill_focused: "🧘 Focused",
    mood_pill_tired: "😴 Tired",
    mood_pill_stressed: "😟 Stressed",
    reflect_saving: "Saving...",
    emotional_patterns: "Emotional Patterns",
    goal_insights: "Goal Insights",
    error_fetching_goals: "Error fetching goals",
    goal_updated: "Goal updated successfully",
    error_updating_goal: "Error updating goal",
    goal_deleted: "Goal deleted",
    error_deleting_goal: "Error deleting goal",
    habit_insights: "Habit Insights",
    error_fetching_habits: "Error fetching habits",
    day_unmarked: "Day unmarked",
    day_marked: "Day marked",
    error_updating_habit: "Error updating habit",
    habit_updated: "Habit updated",
    habit_deleted: "Habit deleted",
    error_deleting_habit: "Error deleting habit",
    delete_habit: "Delete Habit",
    delete_habit_confirm: "Are you sure you want to delete this habit? This action cannot be undone and all your progress will be lost.",
    overall_progress: "Overall Progress",
    category_breakdown: "Category Breakdown",
    fastest_progressing: "Fastest Progressing",
    consistency_score: "Consistency Score",
    productivity_score: "Productivity Score",
    select_week: "Select Week",
    select_date: "Select Date",
    total_goals: "Total Goals",
    total_habits: "Total Habits",
    completed_goals: "Completed Goals",
    goals_in_progress: "Goals in Progress",
    active_streaks: "Active Streaks",
    avg_completion: "Avg. Completion",
    avg_success_rate: "Avg. Success Rate",
    milestones_rate: "Milestone Completion Rate",
    completed_milestones: "Completed Milestones",
    pending_milestones: "Pending Milestones",
    best_performing: "Best Performing",
    goals_at_risk: "Goals at Risk",
    habits_at_risk: "Habits at Risk",
    no_activity_detected: "No activity detected",
    out_of_100: "out of 100",
    days_with_progress: "Days with Progress",
    best_streak: "Best Streak",
    last_activity: "Last Activity",
    milestoneRateDesc: "See how effectively you're completing the steps that lead to your goals.",
    milestone_completion: "milestone completion",
    categoryBreakdownDesc: "Understand where you invest most of your long-term energy.",
    fastestGoalDesc: "The goal you're moving toward the quickest.",
    consistencyDesc: "See how steadily you're progressing toward your goals.",
    productivityDesc: "A combined score based on your consistency and milestone completion.",
    habitProgressDesc: "Track your consistency and progress across all habits.",
    weekly_pattern: "Weekly Completion Pattern",
    habitWeeklyPatternDesc: "See which days you're most consistent with your habits.",
    bestHabitDesc: "The habit you're most consistent with.",
    consistencyHabitDesc: "See how consistently you're maintaining your habits.",
    productivityHabitDesc: "A combined score based on your consistency and streaks.",
    today_insights: "Today Insights",
    tasks_done: "Tasks Done",
    focus_time: "Focus Time",
    best_day: "Best Day",
    best_month: "Best Month",
    avg_per_day: "Avg/Day",
    tasks_vs_focus: "Tasks vs Focus Time",
    goal_progress: "Goal Progress",
    focus_insights: "Focus Insights",
    sessions: "Sessions",
    no_sessions: "No Sessions",
    custom: "Custom",
    top_timer: "Top Timer",
    view_insights: "View Insights",
    active_days: "Active Days",
    timer_ranking: "Timer Ranking",
    best_focus_month: "Best Focus Month",
    sessions_by_timer: "Sessions by Timer",
    focus_trend: "Focus Trend",
    total_minutes: "Total Minutes",
    timeline: "Timeline",
    pattern_insights: "Pattern Insights",
    reflection_history: "Reflection History",
    no_reflections_yet: "No reflections yet. Start checking in to build your history.",
    mood_summary: "Mood Summary",
    mood_distribution: "Mood Distribution",
    no_mood_data: "No mood data for this month.",
    emotional_tone: "Emotional Tone",
    positive: "Positive",
    mixed: "Mixed",
    habit_formation: "Habit Formation",
    growth_empty: "Not enough data yet for pattern insights.",
  },
  de: {
    today: "Heute",
    goals: "Ziele",
    habits: "Gewohnheiten",
    focus: "Fokus",
    dailyProgress: "Tagesfortschritt",
    tasksComplete: "Aufgaben erledigt",
    focusTime: "Fokuszeit",
    streak: "Serie",
    complete: "erledigt",
    morning: "Morgen",
    afternoon: "Nachmittag",
    evening: "Abend",
    night: "Nacht",
    addTask: "Aufgabe hinzufügen",
    insights: "Einblicke",
    settings: "Einstellungen",
    language: "Sprache",
    theme: "Design",
    dark: "Dunkel",
    light: "Hell",
    system: "System",
    cancel: "Abbrechen",
    save: "Speichern",
    delete: "Löschen",
    edit: "Bearbeiten",
    add: "Hinzufügen",
    create: "Erstellen",
    title: "Titel",
    description: "Beschreibung",
    priority: "Priorität",
    high: "Hoch",
    medium: "Mittel",
    low: "Niedrig",
    startFocus: "Fokus starten",
    pauseFocus: "Pause",
    resumeFocus: "Fortsetzen",
    stopFocus: "Stopp",
    focusSession: "Fokus-Sitzung",
    breakTime: "Pausenzeit",
    deepWork: "Deep Work",
    pomodoro: "Pomodoro",
    minutes: "Minuten",
    hours: "Stunden",
    days: "Tage",
    week: "Woche",
    month: "Monat",
    year: "Jahr",
    yesterday: "Gestern",
    tomorrow: "Morgen",
    thisWeek: "Diese Woche",
    thisMonth: "Dieser Monat",
    completed: "Erledigt",
    inProgress: "In Bearbeitung",
    notStarted: "Nicht begonnen",
    overdue: "Überfällig",
    onTrack: "Auf Kurs",
    habitStreak: "Gewohnheits-Serie",
    currentStreak: "Aktuelle Serie",
    longestStreak: "Längste Serie",
    completionRate: "Abschlussrate",
    goalProgress: "Zielfortschritt",
    addGoal: "Ziel hinzufügen",
    addHabit: "Gewohnheit hinzufügen",
    noTasks: "Keine Aufgaben",
    noGoals: "Noch keine Ziele",
    noHabits: "Noch keine Gewohnheiten",
    welcomeBack: "Willkommen zurück",
    goodMorning: "Guten Morgen",
    goodAfternoon: "Guten Tag",
    goodEvening: "Guten Abend",
    of: "von",
    account: "Konto",
    profile: "Profil",
    personalData: "Persönliche Daten",
    privacy: "Datenschutz",
    deleteAccount: "Konto löschen",
    connections: "Verbindungen",
    appleHealth: "Apple Health",
    calendar: "Kalender",
    notifications: "Benachrichtigungen",
    appearance: "Darstellung",
    themeColor: "Designfarbe",
    appIcon: "App-Symbol",
    general: "Allgemein",
    haptics: "Haptik",
    logOut: "Abmelden",
    reminderSettings: "Erinnerungseinstellungen",
    reminderDescription: "Passen Sie intelligente Erinnerungen an, um Ihre tägliche Planung, Gewohnheiten und Ziele zu unterstützen.",
    reminderCategories: "Erinnerungskategorien",
    taskReminders: "Aufgaben-Erinnerungen",
    habitReminders: "Gewohnheits-Erinnerungen",
    focusReminders: "Fokus-Erinnerungen",
    incompleteNudges: "Unerledigte Aufgaben-Hinweise",
    timing: "Zeitpunkt",
    atTime: "Zur geplanten Zeit",
    minutesBefore10: "10 Minuten vorher",
    minutesBefore30: "30 Minuten vorher",
    hourBefore: "1 Stunde vorher",
    notificationStyle: "Benachrichtigungsstil",
    gentle: "Sanft",
    important: "Wichtig",
    reminderNote: "Erinnerungen sind unterstützend und unaufdringlich gestaltet, um Ihnen zu helfen, auf Kurs zu bleiben, ohne Druck zu erzeugen.",
    deleteAccountConfirm: "Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden und alle Ihre Daten werden dauerhaft gelöscht.",
    taskTitle: "Aufgabentitel",
    time: "Zeit",
    period: "Zeitraum",
    newTask: "Neue Aufgabe",
    taskTitlePlaceholder: "Was musst du tun?",
    descriptionOptional: "Beschreibung (Optional)",
    descriptionPlaceholder: "Mehr Details hinzufügen...",
    startTimeOptional: "Startzeit (Optional)",
    durationOptional: "Dauer (Optional)",
    linkToHabitOptional: "Mit Gewohnheit verknüpfen (Optional)",
    linkToGoalOptional: "Mit Ziel verknüpfen (Optional)",
    category: "Kategorie",
    noGoal: "Kein Ziel",
    none: "Keine",
    personal: "Persönlich",
    work: "Arbeit",
    health: "Gesundheit",
    learning: "Lernen",
    other: "Andere",
    taskDeleted: "Aufgabe gelöscht",
    activeGoals: "Aktive Ziele",
    progress: "Täglicher Fortschritt",
    customize: "Anpassen",
    customizeDashboard: "Dashboard anpassen",
    customizeDashboardDescription: "Schalte deine Dashboard-Module um und ordne sie neu an.",
    moduleVisible: "Sichtbar",
    moduleHidden: "Verborgen",
    reflect: "Reflektieren",
    reflectProgress: "Fortschritt",
    reflectChallenge: "Herausforderung",
    reflectNextStep: "Nächster Schritt",
    reflectMood: "Wie fühlst du dich?",
    reflectSave: "Reflexion speichern",
    reflectSaved: "Reflexion gespeichert",
    reflectProgressPlaceholder: "Was lief heute gut?",
    reflectChallengePlaceholder: "Was war schwierig?",
    reflectNextStepPlaceholder: "Worauf möchtest du dich morgen konzentrieren?",
    reflectDescription: "Nimm dir einen Moment Zeit für dich.",
  },

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const { user } = useAuth();

  useEffect(() => {
    // Load persisted language from Supabase or localStorage
    const loadSettings = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("user_settings")
          .select("language")
          .eq("user_id", user.id)
          .single();

        if (data?.language && (data.language in languageNames)) {
          setLanguageState(data.language as Language);
          localStorage.setItem("language", data.language);
        }
      } else {
        const saved = localStorage.getItem("language");
        if (saved && (saved in languageNames)) {
          setLanguageState(saved as Language);
        }
      }
    };

    loadSettings();
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);

    if (user) {
      await supabase
        .from("user_settings")
        .update({ language: lang })
        .eq("user_id", user.id);
    }
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let translation = translations[language][key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key} in language: ${language}`);
      translation = translations.en[key] || key;
    }
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        translation = translation.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}

export function useLanguage() {
  return useTranslation();
}

