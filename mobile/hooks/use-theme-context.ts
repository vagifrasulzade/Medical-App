import { ThemeContextType } from "@/types/theme.type";
import { createContext } from "react";

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);