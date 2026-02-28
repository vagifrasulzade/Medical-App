export type ThemeType = "light" | "dark" | "system";

export type ThemeContextType = {
    theme: ThemeType;
    colorScheme: "light" | "dark",
    toggleTheme: (theme: ThemeType) => void;
}