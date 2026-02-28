import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, Text, View } from "react-native";
import { TOKEN_KEY, USER_KEY } from "../constant/api";

export default function SplashScreen() {
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const seen = await AsyncStorage.getItem("hasSeenOnboarding");
        const [token, user] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        setTimeout(() => {
          if (token && user) {
            router.replace("/home");
          } else if (seen === "true") {
            router.replace("/onboarding");
          } else {
            router.replace("/welcome");
          }
        }, 2200);
      } catch (error) {
        setTimeout(() => router.replace("/welcome"), 2200);
      }
    };
    checkOnboarding();
  }, []);

  return (
    <View className="flex-1 bg-[#3D5AFE] items-center justify-center">
      <Image
        source={require("../assets/images/logo.png")}
        className="w-[120px] h-[120px] mb-6"
        resizeMode="contain"
      />
      <Text className="text-[36px] font-extrabold text-white text-center leading-[42px] tracking-widest mb-2">
        Skin{"\n"}Firts
      </Text>
      <Text className="text-[13px] font-medium text-white/80 tracking-[2px] uppercase">
        Dermatology Center
      </Text>
    </View>
  );
}

