import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TOKEN_KEY, USER_KEY } from "../constant/api";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

export default function DeleteAccountScreen() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password to confirm deletion");
      return;
    }

    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data and appointments will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      // Get current logged-in user
      const userRaw = await AsyncStorage.getItem(USER_KEY);
      if (!userRaw) {
        Alert.alert("Error", "You need to be logged in");
        router.replace("/signin");
        return;
      }
      const currentUser = JSON.parse(userRaw);

      // Load all users and verify password
      const usersRaw = await AsyncStorage.getItem("users");
      const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
      const userRecord = users.find((u) => u.id === currentUser.id);

      if (!userRecord || userRecord.password !== password) {
        Alert.alert("Error", "Incorrect password. Please try again.");
        return;
      }

      // Remove user from users list
      const updatedUsers = users.filter((u) => u.id !== currentUser.id);
      await AsyncStorage.setItem("users", JSON.stringify(updatedUsers));

      // Remove appointments belonging to this user
      const apptRaw = await AsyncStorage.getItem("appointments");
      if (apptRaw) {
        const appointments: any[] = JSON.parse(apptRaw);
        const updatedAppts = appointments.filter((a) => a.patientId !== currentUser.id);
        await AsyncStorage.setItem("appointments", JSON.stringify(updatedAppts));
      }

      // Clear session data
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, "user_avatar_uri"]);

      Alert.alert("Success", "Your account has been deleted", [
        {
          text: "OK",
          onPress: () => {
            router.dismissAll();
            router.replace("/signin");
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to delete account. Please try again.");
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
          <Text className="text-[32px] font-semibold text-[#2F62F4]" style={{ fontSize: 32 }}>
            Delete Account
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 mb-8">
          <View className="flex-row">
            <Ionicons name="warning-outline" size={24} color="#ef4444" />
            <Text className="flex-1 ml-3 text-red-600 font-medium" style={{ fontSize: 16 }}>
              Deleting your account is permanent. You will lose all your data, appointments, and medical history.
            </Text>
          </View>
        </View>

        <Text className="text-[32px] font-semibold text-black mb-3" style={{ fontSize: 28 }}>
          What will be deleted?
        </Text>

        <View className="space-y-3 mb-8">
          <DeleteItem icon="calendar-outline" text="All your appointments" />
          <DeleteItem icon="document-outline" text="Your medical records" />
          <DeleteItem icon="star-outline" text="Saved favorites and preferences" />
          <DeleteItem icon="card-outline" text="Payment methods on file" />
          <DeleteItem icon="person-outline" text="Your profile and personal data" />
        </View>

        <Text className="text-[32px] font-semibold text-black mb-4" style={{ fontSize: 28 }}>
          Confirm Password
        </Text>

        <Text className="text-[20px] text-gray-600 mb-3" style={{ fontSize: 14 }}>
          Enter your password to confirm account deletion
        </Text>

        <View className="bg-[#DCE2F1] rounded-2xl px-5 py-3 flex-row items-center mb-8">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#999"
            className="flex-1 text-[#2F62F4]"
            style={{ fontSize: 16 }}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#282828"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleDeleteAccount}
          disabled={loading}
          className="bg-red-500 rounded-full items-center justify-center h-14 mb-4"
        >
          {loading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text className="text-white font-semibold" style={{ fontSize: 18 }}>
              Delete My Account
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          disabled={loading}
          className="border border-[#2F62F4] rounded-full items-center justify-center h-14 mb-8"
        >
          <Text className="text-[#2F62F4] font-semibold" style={{ fontSize: 18 }}>
            Cancel
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function DeleteItem({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
}) {
  return (
    <View className="flex-row items-center">
      <View className="w-6 h-6 rounded-full bg-red-100 items-center justify-center mr-3">
        <Ionicons name={icon} size={16} color="#ef4444" />
      </View>
      <Text className="text-[20px] text-gray-700 font-medium" style={{ fontSize: 16 }}>
        {text}
      </Text>
    </View>
  );
}
