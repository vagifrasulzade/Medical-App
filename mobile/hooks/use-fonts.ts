import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function useLayoutFonts(fonts: Record<string, string>) {
    const [loaded, error] = useFonts(fonts)

    useEffect(() => {
        if (loaded ||error){
            SplashScreen.hideAsync();
        }
    },[loaded, error])

    return { loaded, error }
}