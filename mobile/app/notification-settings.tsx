import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Platform, StatusBar, Switch, Text, TouchableOpacity, View } from "react-native";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

export default function NotificationSettingsScreen() {
  const [general, setGeneral] = useState(true);
  const [sound, setSound] = useState(true);
  const [soundCall, setSoundCall] = useState(true);
  const [vibrate, setVibrate] = useState(false);
  const [offers, setOffers] = useState(false);
  const [payments, setPayments] = useState(true);
  const [promo, setPromo] = useState(false);
  const [cashback, setCashback] = useState(true);

  return (
    <View className="flex-1 bg-[#F4F5F8]">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={{ paddingTop: STATUS_BAR_H + 12 }} className="px-6 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#2F62F4" />
          </TouchableOpacity>
          <Text className="text-[32px] font-semibold text-[#2F62F4]" style={{ fontSize: 32 }}>
            Notification Setting
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <View className="px-6 mt-4 gap-6">
        <SwitchRow label="General Notification" value={general} onValueChange={setGeneral} />
        <SwitchRow label="Sound" value={sound} onValueChange={setSound} />
        <SwitchRow label="Sound Call" value={soundCall} onValueChange={setSoundCall} />
        <SwitchRow label="Vibrate" value={vibrate} onValueChange={setVibrate} />
        <SwitchRow label="Special Offers" value={offers} onValueChange={setOffers} />
        <SwitchRow label="Payments" value={payments} onValueChange={setPayments} />
        <SwitchRow label="Promo And Discount" value={promo} onValueChange={setPromo} />
        <SwitchRow label="Cashback" value={cashback} onValueChange={setCashback} />
      </View>
    </View>
  );
}

function SwitchRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center">
      <Text className="flex-1 text-black" style={{ fontSize: 38 }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#C3CCEF", true: "#2F62F4" }}
        thumbColor="#F6F7FB"
      />
    </View>
  );
}
