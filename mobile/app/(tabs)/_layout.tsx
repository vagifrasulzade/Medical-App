import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },  
      }}
    >
      <Tabs.Screen name="index"     options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} /> }} />
      <Tabs.Screen name="calendar"  options={{ tabBarIcon: ({ color }) => <Ionicons name="calendar" size={20} color={color} /> }} />
      <Tabs.Screen name="favorites" options={{ tabBarIcon: ({ color }) => <Ionicons name="heart" size={20} color={color} /> }} />
      <Tabs.Screen name="profile"   options={{ tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} /> }} />
    </Tabs>
  );
}