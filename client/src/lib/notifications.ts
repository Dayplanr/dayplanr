import { supabase } from "./supabase";

interface UserSettings {
    notifications_enabled: boolean;
    task_reminders: boolean;
    habit_reminders: boolean;
    focus_reminders: boolean;
    incomplete_nudges: boolean;
    morning_summary: boolean;
    reminder_timing: string;
    reminder_style: string;
}

interface Task {
    id: string;
    title: string;
    time?: string;
    scheduled_date?: string;
    completed: boolean;
}

interface ScheduledNotification {
    taskId: string;
    timeoutId: number;
}

class NotificationService {
    private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
    private settings: UserSettings | null = null;

    // Request notification permission
    async requestPermission(): Promise<NotificationPermission> {
        if (!("Notification" in window)) {
            console.warn("Notifications not supported in this browser");
            return "denied";
        }

        if (Notification.permission === "granted") {
            return "granted";
        }

        if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            return permission;
        }

        return Notification.permission;
    }

    // Check if notifications are available and permitted
    canShowNotifications(): boolean {
        return "Notification" in window && Notification.permission === "granted";
    }

    // Get notification permission status
    getPermissionStatus(): NotificationPermission {
        if (!("Notification" in window)) {
            return "denied";
        }
        return Notification.permission;
    }

    // Load user settings from database
    async loadSettings(userId: string): Promise<void> {
        const { data, error } = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (data && !error) {
            this.settings = data;
        }
    }

    // Calculate when to show notification based on timing setting
    private calculateNotificationTime(taskTime: string, scheduledDate: string): Date | null {
        console.log("[Notifications] Calculating notification time for:", { taskTime, scheduledDate });

        if (!taskTime || !scheduledDate) {
            console.log("[Notifications] Missing taskTime or scheduledDate");
            return null;
        }

        // Parse task time (format: "HH:MM AM/PM")
        const [time, meridiem] = taskTime.split(" ");
        if (!time) {
            console.error("[Notifications] Invalid task time format:", taskTime);
            return null;
        }

        let [hours, minutes] = time.split(":").map(Number);

        if (meridiem === "PM" && hours !== 12) hours += 12;
        if (meridiem === "AM" && hours === 12) hours = 0;

        console.log("[Notifications] Parsed time:", { hours, minutes, meridiem });

        // Create date object for the task
        const taskDate = new Date(scheduledDate);
        taskDate.setHours(hours, minutes, 0, 0);
        console.log("[Notifications] Task date/time:", taskDate.toLocaleString());

        // Apply timing offset based on settings
        const timing = this.settings?.reminder_timing || "30min";
        let offsetMinutes = 0;

        switch (timing) {
            case "10min":
                offsetMinutes = 10;
                break;
            case "30min":
                offsetMinutes = 30;
                break;
            case "1hour":
                offsetMinutes = 60;
                break;
            case "attime":
            default:
                offsetMinutes = 0;
                break;
        }

        console.log("[Notifications] Timing offset:", offsetMinutes, "minutes");

        // Subtract offset to get notification time
        const notificationTime = new Date(taskDate.getTime() - offsetMinutes * 60 * 1000);
        console.log("[Notifications] Notification will show at:", notificationTime.toLocaleString());
        console.log("[Notifications] Current time:", new Date().toLocaleString());

        // Only schedule if notification time is in the future
        if (notificationTime.getTime() <= Date.now()) {
            console.log("[Notifications] Notification time is in the past, not scheduling");
            return null;
        }

        return notificationTime;
    }

    // Show a notification
    private showNotification(title: string, body: string, tag: string): void {
        console.log("[Notifications] showNotification triggered for:", { title, body, tag });
        
        if (!this.canShowNotifications()) {
            console.error("[Notifications] Cannot show notification - permission status is:", Notification.permission);
            return;
        }

        const style = this.settings?.reminder_style || "gentle";
        
        const options: NotificationOptions = {
            body,
            tag,
            icon: "/logo-new.png", // Use public asset path
            badge: "/logo-new.png",
            requireInteraction: style === "important",
            silent: style === "gentle",
        };

        try {
            console.log("[Notifications] Attempting new Notification instantiation...");
            const notification = new Notification(title, options);
            
            notification.onshow = () => console.log("[Notifications] Notification successfully shown!");
            notification.onerror = (err) => console.error("[Notifications] Notification instance error:", err);

            if (style === "gentle") {
                setTimeout(() => notification.close(), 5000);
            }

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        } catch (error) {
            console.error("[Notifications] Critical error during notification creation:", error);
        }
    }

    // Test notification - shows immediately
    showTestNotification(): void {
        console.log("[Notifications] Showing test notification immediately");
        this.showNotification(
            "Test Notification",
            "If you see this, notifications are working! 🎉",
            "test-notification"
        );
    }

    // Schedule notification for a task
    scheduleTaskNotification(task: Task): void {
        console.log("[Notifications] Attempting to schedule notification for task:", task);

        if (!this.settings?.notifications_enabled) {
            console.log("[Notifications] Notifications are disabled in settings");
            return;
        }

        if (!this.settings?.task_reminders) {
            console.log("[Notifications] Task reminders are disabled in settings");
            return;
        }

        if (!task.time || !task.scheduled_date || task.completed) {
            console.log("[Notifications] Task is missing time/date or is completed:", {
                hasTime: !!task.time,
                hasDate: !!task.scheduled_date,
                completed: task.completed
            });
            return;
        }

        // Cancel existing notification for this task
        this.cancelNotification(task.id);

        const notificationTime = this.calculateNotificationTime(task.time, task.scheduled_date);
        console.log("[Notifications] Calculated notification time:", notificationTime);

        if (!notificationTime) {
            console.log("[Notifications] Notification time is in the past or invalid");
            return;
        }

        const delay = notificationTime.getTime() - Date.now();
        console.log(`[Notifications] Scheduling notification in ${Math.round(delay / 1000)} seconds`);

        const timeoutId = window.setTimeout(() => {
            console.log("[Notifications] Showing notification for task:", task.title);
            this.showNotification(
                "Task Reminder",
                `⏰ ${task.title}`,
                `task-${task.id}`
            );
            this.scheduledNotifications.delete(task.id);
        }, delay);

        this.scheduledNotifications.set(task.id, {
            taskId: task.id,
            timeoutId,
        });

        console.log(`[Notifications] Successfully scheduled notification. Total scheduled: ${this.scheduledNotifications.size}`);
    }

    // Schedule notification for incomplete tasks (end of day nudge)
    scheduleIncompleteNudge(incompleteTasks: Task[], date: string): void {
        if (!this.settings?.notifications_enabled || !this.settings?.incomplete_nudges) {
            return;
        }

        if (incompleteTasks.length === 0) return;

        // Schedule for 8 PM on the given date
        const nudgeTime = new Date(date);
        nudgeTime.setHours(20, 0, 0, 0);

        const delay = nudgeTime.getTime() - Date.now();
        if (delay <= 0) return;

        const nudgeId = `incomplete-${date}`;
        this.cancelNotification(nudgeId);

        const timeoutId = window.setTimeout(() => {
            this.showNotification(
                "Incomplete Tasks",
                `You have ${incompleteTasks.length} incomplete task${incompleteTasks.length > 1 ? 's' : ''} today`,
                nudgeId
            );
            this.scheduledNotifications.delete(nudgeId);
        }, delay);

        this.scheduledNotifications.set(nudgeId, {
            taskId: nudgeId,
            timeoutId,
        });
    }

    // Schedule morning summary notification
    scheduleMorningSummary(date: string, taskCount: number): void {
        if (!this.settings?.notifications_enabled || !this.settings?.morning_summary) {
            console.log("[Notifications] Morning summary disabled");
            return;
        }

        // Schedule for 8 AM on the given date
        const summaryTime = new Date(date);
        summaryTime.setHours(8, 0, 0, 0);

        const delay = summaryTime.getTime() - Date.now();
        if (delay <= 0) {
            console.log("[Notifications] Morning summary time is in the past");
            return;
        }

        const summaryId = `summary-${date}`;
        this.cancelNotification(summaryId);

        const timeoutId = window.setTimeout(() => {
            const body = taskCount > 0 
                ? `You have ${taskCount} tasks planned for today. Let's make it intentional! ✨`
                : "Your day is a fresh canvas. What will you create today? 🎨";
            
            this.showNotification(
                "Your Daily Plan",
                body,
                summaryId
            );
            this.scheduledNotifications.delete(summaryId);
        }, delay);

        this.scheduledNotifications.set(summaryId, {
            taskId: summaryId,
            timeoutId,
        });
        console.log("[Notifications] Scheduled morning summary at 8:00 AM");
    }

    // Schedule notification for a habit
    scheduleHabitReminder(habit: { id: string; title: string; time?: string }, date: string): void {
        if (!this.settings?.notifications_enabled || !this.settings?.habit_reminders || !habit.time) {
            return;
        }

        const notificationTime = this.calculateNotificationTime(habit.time, date);
        if (!notificationTime) return;

        const habitId = `habit-${habit.id}`;
        this.cancelNotification(habitId);

        const delay = notificationTime.getTime() - Date.now();
        const timeoutId = window.setTimeout(() => {
            this.showNotification(
                "Habit Reminder",
                `✨ Time for: ${habit.title}`,
                habitId
            );
            this.scheduledNotifications.delete(habitId);
        }, delay);

        this.scheduledNotifications.set(habitId, {
            taskId: habitId,
            timeoutId,
        });
    }

    // Cancel a specific notification
    cancelNotification(id: string): void {
        const scheduled = this.scheduledNotifications.get(id);
        if (scheduled) {
            clearTimeout(scheduled.timeoutId);
            this.scheduledNotifications.delete(id);
        }
    }

    // Cancel all notifications
    cancelAllNotifications(): void {
        this.scheduledNotifications.forEach((scheduled) => {
            clearTimeout(scheduled.timeoutId);
        });
        this.scheduledNotifications.clear();
    }

    // Get count of scheduled notifications
    getScheduledCount(): number {
        return this.scheduledNotifications.size;
    }
}

// Export singleton instance
export const notificationService = new NotificationService();
