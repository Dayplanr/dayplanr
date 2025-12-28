import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { notificationService } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";

interface Task {
    id: string;
    title: string;
    time?: string;
    scheduled_date?: string;
    completed: boolean;
}

export function useNotifications() {
    const { user } = useAuth();
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!user || isInitialized.current) return;

        const initializeNotifications = async () => {
            // Load user settings
            await notificationService.loadSettings(user.id);

            // Check if notifications are enabled in settings
            const { data: settings } = await supabase
                .from("user_settings")
                .select("notifications_enabled")
                .eq("user_id", user.id)
                .single();

            if (settings?.notifications_enabled) {
                // Request permission if not already granted
                await notificationService.requestPermission();
            }

            isInitialized.current = true;
        };

        initializeNotifications();

        // Cleanup on unmount
        return () => {
            notificationService.cancelAllNotifications();
        };
    }, [user]);

    return {
        requestPermission: () => notificationService.requestPermission(),
        scheduleTaskNotification: (task: Task) => notificationService.scheduleTaskNotification(task),
        cancelNotification: (id: string) => notificationService.cancelNotification(id),
        scheduleIncompleteNudge: (tasks: Task[], date: string) =>
            notificationService.scheduleIncompleteNudge(tasks, date),
        getPermissionStatus: () => notificationService.getPermissionStatus(),
        canShowNotifications: () => notificationService.canShowNotifications(),
        getScheduledCount: () => notificationService.getScheduledCount(),
        showTestNotification: () => notificationService.showTestNotification(),
    };
}
