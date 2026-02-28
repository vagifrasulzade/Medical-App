import { router } from "expo-router";
import useTheme from "@/hooks/use-theme";
import {
  Image,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_BAR_H = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

export default function WelcomeScreen() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const screenBg = isDark ? "#0F172A" : "#FFFFFF";
  const textSecondary = isDark ? "#9CA3AF" : "#8A8A9B";

  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ paddingTop: STATUS_BAR_H, backgroundColor: screenBg }}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Logo + branding */}
      <View className="items-center mb-6">
        <Image
          source={require("../assets/images/logo-blue.png")}
          className="w-[120px] h-[120px]"
          resizeMode="contain"
        />
        <Text className="text-[38px] font-light text-[#3D5AFE] text-center leading-[46px] tracking-wide mt-5">
          Skin{"\n"}Firts
        </Text>
        <Text className="text-[13px] font-bold text-[#3D5AFE] tracking-[2px] uppercase mt-1.5">
          Dermatology Center
        </Text>
      </View>

      {/* Description */}
      <Text className="text-sm text-center leading-[22px] mb-12 px-2" style={{ color: textSecondary }}>
        Find trusted dermatology specialists, book appointments, and consult doctors online — all in one place.
      </Text>

      {/* Buttons */}
      <View className="w-full gap-3.5">
        <TouchableOpacity
          activeOpacity={0.85}
          className="bg-[#3D5AFE] rounded-full py-[17px] items-center"
          style={{
            shadowColor: "#3D5AFE",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
          onPress={() => router.push("/signin")}
        >
          <Text className="text-white text-base font-bold tracking-wide">Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          className="rounded-full py-[17px] items-center"
          style={{ backgroundColor: isDark ? "#1F2937" : "#E8ECFF" }}
          onPress={() => router.push("/signup")}
        >
          <Text className="text-[#3D5AFE] text-base font-bold tracking-wide">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

