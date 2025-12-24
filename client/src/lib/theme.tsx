import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth";

interface ThemeContextType {
    darkMode: boolean;
    setDarkMode: (enabled: boolean) => void;
    themeColor: string;
    setThemeColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [darkMode, setDarkModeState] = useState(false);
    const [themeColor, setThemeColorState] = useState("#8b5cf6");

    useEffect(() => {
        const loadThemeSettings = async () => {
            // 1. Try localStorage first for immediate UI application
            const savedDarkMode = localStorage.getItem("darkMode") === "true";
            const savedThemeColor = localStorage.getItem("themeColor") || "#8b5cf6";

            setDarkModeState(savedDarkMode);
            setThemeColorState(savedThemeColor);
            applyTheme(savedDarkMode, savedThemeColor);

            // 2. If user is logged in, sync from database
            if (user) {
                const { data, error } = await supabase
                    .from("user_settings")
                    .select("dark_mode, theme_color")
                    .eq("user_id", user.id)
                    .single();

                if (data) {
                    setDarkModeState(data.dark_mode);
                    setThemeColorState(data.theme_color || "#8b5cf6");
                    applyTheme(data.dark_mode, data.theme_color || "#8b5cf6");

                    localStorage.setItem("darkMode", String(data.dark_mode));
                    localStorage.setItem("themeColor", data.theme_color || "#8b5cf6");
                }
            }
        };

        loadThemeSettings();
    }, [user]);

    const applyTheme = (dark: boolean, color: string) => {
        if (dark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        document.documentElement.style.setProperty("--primary", color);
    };

    const setDarkMode = async (enabled: boolean) => {
        setDarkModeState(enabled);
        localStorage.setItem("darkMode", String(enabled));
        applyTheme(enabled, themeColor);

        if (user) {
            await supabase
                .from("user_settings")
                .upsert({ user_id: user.id, dark_mode: enabled }, { onConflict: 'user_id' });
        }
    };

    const setThemeColor = async (color: string) => {
        setThemeColorState(color);
        localStorage.setItem("themeColor", color);
        applyTheme(darkMode, color);

        if (user) {
            await supabase
                .from("user_settings")
                .upsert({ user_id: user.id, theme_color: color }, { onConflict: 'user_id' });
        }
    };

    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode, themeColor, setThemeColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
