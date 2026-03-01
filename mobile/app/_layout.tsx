import ThemeProvider from "@/context/theme-provider";
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />       
        <Stack.Screen name="welcome" />       
        <Stack.Screen name="signin" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="set-password" />
        <Stack.Screen name="home" />
        <Stack.Screen name="profile-edit" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="notification-settings" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="password-manager" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="booking-payment" />
        <Stack.Screen name="add-card" />
        <Stack.Screen name="booking-success" />
        <Stack.Screen name="delete-account" />
        <Stack.Screen name="help" />
        <Stack.Screen name="faq" />
        <Stack.Screen name="privacy-policy" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}