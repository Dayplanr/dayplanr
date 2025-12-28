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

// Helper function to convert hex to HSL format for CSS variables
const hexToHSL = (hex: string): string => {
    // Remove the # if present
    hex = hex.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
};

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
        // Convert hex color to HSL format for CSS variable
        const hslColor = hexToHSL(color);
        document.documentElement.style.setProperty("--primary", hslColor);
    };

    const setDarkMode = async (enabled: boolean) => {
        setDarkModeState(enabled);
        localStorage.setItem("darkMode", String(enabled));
        applyTheme(enabled, themeColor);

        if (user) {
            await supabase
                .from("user_settings")
                .update({ dark_mode: enabled })
                .eq("user_id", user.id);
        }
    };

    const setThemeColor = async (color: string) => {
        setThemeColorState(color);
        localStorage.setItem("themeColor", color);
        applyTheme(darkMode, color);

        if (user) {
            await supabase
                .from("user_settings")
                .update({ theme_color: color })
                .eq("user_id", user.id);
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
