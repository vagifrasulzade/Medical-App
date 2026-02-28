import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Platform, TouchableOpacity, View } from "react-native";

type Tab = "home" | "calendar" | "favorites" | "map" | "profile";

type Props = {
  activeTab?: Tab;
};

const TABS: {
  key: Tab;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  route: string;
}[] = [
  { key: "home", icon: "home-outline", route: "/(tabs)" },
  { key: "favorites", icon: "heart", route: "/(tabs)/favorites" },
  { key: "profile", icon: "person-outline", route: "/(tabs)/profile" },
  { key: "calendar", icon: "calendar-outline", route: "/(tabs)/calendar" },
  { key: "map", icon: "location-outline", route: "/map" },
];

export function BottomTabBar({ activeTab = "home" }: Props) {
  return (
    <View
      className="absolute flex-row items-center"
      style={{
        left: 16,
        right: 16,
        bottom: Platform.OS === "ios" ? 46 : 36,
        height: 54,
        borderRadius: 27,
        backgroundColor: "#2E61E8",
        shadowColor: "#1E46B6",
        shadowOpacity: 0.22,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 8,
        paddingHorizontal: 8,
        justifyContent: "space-between",
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            className="items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isActive ? "rgba(255,255,255,0.24)" : "transparent",
            }}
            onPress={() => router.push(tab.route as any)}
          >
            <Ionicons
              name={tab.icon}
              size={21}
              color={isActive ? "#FFFFFF" : "rgba(255,255,255,0.70)"}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}