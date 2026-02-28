import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { USER_KEY } from "../constant/api";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

export default function ProfileEditScreen() {
  const [fullName, setFullName] = useState("John Doe");
  const [phone, setPhone] = useState("+123 567 89000");
  const [email, setEmail] = useState("johndoe@example.com");
  const [dob, setDob] = useState("");

  useEffect(() => {
    (async () => {
      const cached = await AsyncStorage.getItem(USER_KEY);
      if (cached) {
        const user = JSON.parse(cached);
        setFullName(user.fullName || "John Doe");
        setPhone(user.phone || "+123 567 89000");
        setEmail(user.email || "johndoe@example.com");
        setDob(user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("en-GB") : "");
      }
    })();
  }, []);

  const onUpdate = async () => {
    const raw = await AsyncStorage.getItem(USER_KEY);
    const user = raw ? JSON.parse(raw) : {};
    await AsyncStorage.setItem(
      USER_KEY,
      JSON.stringify({
        ...user,
        fullName,
        phone,
        email,
      })
    );
    router.back();
  };

  return (
    <View className="flex-1 bg-[#F4F5F8]">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={{ paddingTop: STATUS_BAR_H + 12 }} className="px-6 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#2F62F4" />
          </TouchableOpacity>
          <Text className="text-[34px] font-semibold text-[#2F62F4]" style={{ fontSize: 34 }}>
            Profile
          </Text>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons name="settings-outline" size={22} color="#2F62F4" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-[34px] font-medium text-black mb-2" style={{ fontSize: 32 }}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          className="bg-[#DCE2F1] rounded-2xl px-5 py-4 text-[30px] text-black mb-6"
          style={{ fontSize: 30 }}
        />

        <Text className="text-[34px] font-medium text-black mb-2" style={{ fontSize: 32 }}>Phone Number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          className="bg-[#DCE2F1] rounded-2xl px-5 py-4 text-[30px] text-black mb-6"
          style={{ fontSize: 30 }}
        />

        <Text className="text-[34px] font-medium text-black mb-2" style={{ fontSize: 32 }}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          className="bg-[#DCE2F1] rounded-2xl px-5 py-4 text-[30px] text-black mb-6"
          style={{ fontSize: 30 }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text className="text-[34px] font-medium text-black mb-2" style={{ fontSize: 32 }}>Date Of Birth</Text>
        <TextInput
          value={dob}
          onChangeText={setDob}
          placeholder="DD / MM / YYYY"
          placeholderTextColor="#2F62F4"
          className="bg-[#DCE2F1] rounded-2xl px-5 py-4 text-[30px] text-[#2F62F4]"
          style={{ fontSize: 30 }}
        />

        <TouchableOpacity
          onPress={onUpdate}
          className="bg-[#2F62F4] rounded-full items-center justify-center mt-12 mb-14"
          style={{ height: 56 }}
        >
          <Text className="text-white font-semibold" style={{ fontSize: 34 }}>Update Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
