import { ThemeContext } from "@/hooks/use-theme-context";
import { ThemeType } from "@/types/theme.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

interface ThemeProviderProps {
    children: React.ReactNode;
}

const THEME_PREFERENCE_KEY = "app_theme_preference";

export default function ThemeProvider({ children }: ThemeProviderProps) {

    const [appTheme, setAppTheme] = useState<ThemeType>("system");
    const systemColorScheme = useSystemColorScheme();

    useEffect(() => {
        const loadStoredTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
                if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
                    setAppTheme(savedTheme);
                }
            } catch {
            }
        };

        loadStoredTheme();
    }, []);

    const toggleTheme = async (theme: ThemeType) => {
        setAppTheme(theme);
        try {
            await AsyncStorage.setItem(THEME_PREFERENCE_KEY, theme);
        } catch {
        }
    }

    const getColorSchema = (): "light" | "dark" => {
        if (appTheme === "light") return "light";
        if (appTheme === "dark") return "dark";
        return systemColorScheme === "light" ? "light" : "dark";
    }

    return (
        <ThemeContext.Provider
            value={{
                theme: appTheme,
                colorScheme: getColorSchema(),
                toggleTheme: toggleTheme,
            }}>
            {children}
        </ThemeContext.Provider>
    )

}