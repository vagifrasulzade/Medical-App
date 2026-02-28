import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import useTheme from "@/hooks/use-theme";
import { Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

export default function SettingsScreen() {
  const { theme, colorScheme, toggleTheme } = useTheme();

  const isDark = colorScheme === "dark";
  const screenBg = isDark ? "#0F172A" : "#F4F5F8";
  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const titleColor = isDark ? "#93C5FD" : "#2F62F4";
  const textColor = isDark ? "#E5E7EB" : "#000000";
  const borderColor = isDark ? "#1F2937" : "#E5E7EB";

  return (
    <View className="flex-1" style={{ backgroundColor: screenBg }}>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={{ paddingTop: STATUS_BAR_H + 12 }} className="px-6 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={titleColor} />
          </TouchableOpacity>
          <Text className="text-[34px] font-semibold" style={{ fontSize: 34, color: titleColor }}>
            Settings
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <View className="px-6">
        <View
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: cardBg, borderWidth: 1, borderColor }}
        >
          <Text style={{ color: textColor, fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
            Theme
          </Text>
          <View className="flex-row gap-2">
            <ThemeOption
              label="Light"
              selected={theme === "light"}
              onPress={() => toggleTheme("light")}
              isDark={isDark}
            />
            <ThemeOption
              label="Dark"
              selected={theme === "dark"}
              onPress={() => toggleTheme("dark")}
              isDark={isDark}
            />
            <ThemeOption
              label="System"
              selected={theme === "system"}
              onPress={() => toggleTheme("system")}
              isDark={isDark}
            />
          </View>
        </View>
      </View>

      <View className="px-6 mt-4 gap-6">
        <Row
          icon="bulb-outline"
          label="Notification Setting"
          onPress={() => router.push("/notification-settings")}
          textColor={textColor}
          iconColor={titleColor}
        />
        <Row
          icon="key-outline"
          label="Password Manager"
          onPress={() => router.push("/password-manager")}
          textColor={textColor}
          iconColor={titleColor}
        />
        <Row
          icon="person-outline"
          label="Delete Account"
          onPress={() => router.push("/delete-account")}
          textColor={textColor}
          iconColor={titleColor}
        />
      </View>
    </View>
  );
}

function ThemeOption({
  label,
  selected,
  onPress,
  isDark,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 rounded-xl py-2 items-center"
      style={{
        backgroundColor: selected ? "#2F62F4" : isDark ? "#1F2937" : "#EEF2FF",
      }}
    >
      <Text style={{ color: selected ? "#FFFFFF" : isDark ? "#D1D5DB" : "#374151", fontWeight: "600" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Row({
  icon,
  label,
  onPress,
  textColor,
  iconColor,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  textColor: string;
  iconColor: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center">
      <Ionicons name={icon} size={30} color={iconColor} />
      <Text className="flex-1 ml-8 font-medium" style={{ fontSize: 38, color: textColor }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={28} color={iconColor} />
    </TouchableOpacity>
  );
}
