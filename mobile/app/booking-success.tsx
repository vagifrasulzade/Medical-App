import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

export default function BookingSuccessScreen() {
  const params = useLocalSearchParams<{
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
  }>();

  return (
    <View className="flex-1 bg-[#3D5AFE]">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.replace("/home")}
        style={{ position: "absolute", top: STATUS_BAR_H + 10, left: 20, zIndex: 10 }}
      >
        <Ionicons name="chevron-back" size={26} color="white" />
      </TouchableOpacity>

      {/* Main content */}
      <View className="flex-1 items-center justify-center px-8">
        {/* Big checkmark circle */}
        <View
          className="border-4 border-white rounded-full items-center justify-center mb-8"
          style={{ width: 140, height: 140 }}
        >
          <Ionicons name="checkmark" size={80} color="white" />
        </View>

        <Text className="text-white text-[32px] font-bold mb-2">Congratulation</Text>
        <Text className="text-white/80 text-[16px] mb-10">Payment is Successfully</Text>

        {/* Booking detail card */}
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 24,
            padding: 24,
            width: "100%",
          }}
        >
          <Text className="text-white/80 text-[13px] text-center mb-1">
            You have successfully booked an appointment with
          </Text>
          <Text className="text-white text-[18px] font-bold text-center mb-5">
            {params.doctorName || "Dr. Unknown"}
          </Text>
          <View className="flex-row justify-center gap-8">
            <View className="flex-row items-center gap-2">
              <Ionicons name="calendar-outline" size={18} color="rgba(255,255,255,0.9)" />
              <Text className="text-white text-[13px] font-medium">{params.date}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons name="alarm-outline" size={18} color="rgba(255,255,255,0.9)" />
              <Text className="text-white text-[13px] font-medium">{params.time}</Text>
            </View>
          </View>
        </View>

        {/* Go home button */}
        <TouchableOpacity
          onPress={() => router.replace("/home")}
          className="mt-6 bg-white rounded-full w-full px-15 py-4"
          activeOpacity={0.85}
        >
          <Text className="text-[#3D5AFE] text-center text-[20px] font-[500]">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
