import { useContext } from "react";
import { ThemeContext } from "./use-theme-context";



export default function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("Use Theme must be used within a Theme Provider");
    }
    return context;
}