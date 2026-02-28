import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

export default function PasswordManagerScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword.trim()) {
      Alert.alert("Error", "Please enter your current password");
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }
    if (currentPassword === newPassword) {
      Alert.alert("Error", "New password must be different from current password");
      return;
    }

    setLoading(true);
    try {
      const userRaw = await AsyncStorage.getItem("user");
      if (!userRaw) {
        Alert.alert("Error", "You need to be logged in");
        router.replace("/signin");
        return;
      }
      const currentUser = JSON.parse(userRaw);

      // Verify current password against stored users
      const usersRaw = await AsyncStorage.getItem("users");
      const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
      const storedUser = users.find((u: any) => u.id === currentUser.id);

      if (!storedUser || storedUser.password !== currentPassword) {
        Alert.alert("Error", "Current password is incorrect");
        return;
      }

      // Update password
      const updatedUsers = users.map((u: any) =>
        u.id === currentUser.id ? { ...u, password: newPassword } : u
      );
      await AsyncStorage.setItem("users", JSON.stringify(updatedUsers));

      Alert.alert("Success", "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to change password. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F4F5F8]">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={{ paddingTop: STATUS_BAR_H + 12 }} className="px-6 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#2F62F4" />
          </TouchableOpacity>
          <Text className="text-[20px] font-bold text-[#1A1A2E]">
            Password Manager
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <View className="px-6 mt-5">
        <Label text="Current Password" />
        <PassInput
          value={currentPassword}
          onChangeText={setCurrentPassword}
          show={showCurrent}
          onToggle={() => setShowCurrent((p) => !p)}
        />

        <TouchableOpacity className="self-end mt-2 mb-5">
          <Text className="text-[13px] text-[#2F62F4] font-semibold">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <Label text="New Password" />
        <PassInput
          value={newPassword}
          onChangeText={setNewPassword}
          show={showNew}
          onToggle={() => setShowNew((p) => !p)}
        />

        <View className="mt-6" />
        <Label text="Confirm New Password" />
        <PassInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          show={showConfirm}
          onToggle={() => setShowConfirm((p) => !p)}
        />
      </View>

      <View className="px-6 mt-auto mb-12">
        <TouchableOpacity 
          onPress={handleChangePassword}
          disabled={loading}
          className="h-14 rounded-full bg-[#2F62F4] items-center justify-center"
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold text-[16px]">
              Change Password
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Label({ text }: { text: string }) {
  return (
    <Text className="text-[13px] text-[#5A5A7A] font-semibold mb-2">
      {text}
    </Text>
  );
}

function PassInput({
  value,
  onChangeText,
  show,
  onToggle,
}: {
  value: string;
  onChangeText: (value: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="bg-[#F0F3FF] rounded-2xl px-5 py-3 flex-row items-center">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="flex-1 text-[#1A1A2E] text-[15px]"
        secureTextEntry={!show}
      />
      <TouchableOpacity onPress={onToggle}>
        <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={24} color="#282828" />
      </TouchableOpacity>
    </View>
  );
}
