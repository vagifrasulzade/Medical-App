import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function TabIndex() {
  useEffect(() => {
    router.replace("/home");
  }, []);
  return <View className="flex-1 bg-[#F5F7FF]" />;
}
