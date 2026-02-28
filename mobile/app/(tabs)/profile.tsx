import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useTheme from "@/hooks/use-theme";
import { TOKEN_KEY, USER_KEY } from "../../constant/api";
import { BottomTabBar } from "../../components/BottomTabBar";
import { useAvatarStore } from "../../store/use-avatar.state";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";

type User = {
  fullName?: string;
  role?: string;
};

type MenuItem = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
};

export default function ProfileScreen() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const screenBg = isDark ? "#0F172A" : "#EEF1FF";
  const panelBg = isDark ? "#111827" : "#FFFFFF";
  const titleColor = isDark ? "#93C5FD" : "#2F62F4";
  const textPrimary = isDark ? "#F9FAFB" : "#1A1A2E";
  const mutedText = isDark ? "#9CA3AF" : "#888";

  const [user, setUser] = useState<User | null>(null);
  const { avatar, loadAvatar, clearAvatar, setAvatar } = useAvatarStore();
  const avatarUri = avatar || DEFAULT_AVATAR;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const cached = await AsyncStorage.getItem(USER_KEY);
      await loadAvatar();
      if (cached) {
        const userData = JSON.parse(cached);
        setUser(userData);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") { Alert.alert("Permission Denied", "Camera permission is required"); return; }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled) { await setAvatar(result.assets[0].uri); setShowAvatarModal(false); }
    } catch { Alert.alert("Error", "Failed to capture image"); }
  };

  const handleLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") { Alert.alert("Permission Denied", "Library permission is required"); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled) { await setAvatar(result.assets[0].uri); setShowAvatarModal(false); }
    } catch { Alert.alert("Error", "Failed to pick image"); }
  };

  const handleImageUrl = async () => {
    if (!imageUrlInput.trim() || !imageUrlInput.startsWith("http")) {
      Alert.alert("Error", "Please enter a valid URL starting with http or https"); return;
    }
    await setAvatar(imageUrlInput);
    setImageUrlInput("");
    setShowAvatarModal(false);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    clearAvatar();
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, "hasSeenOnboarding"]);
    router.dismissAll();
    // router.replace("/onboarding");
    router.replace("/signin");

  };

  // Patient menu items
  const menuItems = useMemo<MenuItem[]>(
    () => [
      { label: "Profile", icon: "person-outline", onPress: () => router.push("/profile-edit") },
      { label: "Payment Method", icon: "card-outline", onPress: () => router.push("/payment") },
      { label: "Privacy Policy", icon: "lock-closed-outline", onPress: () => router.push("/privacy-policy") },
      { label: "Settings", icon: "settings-outline", onPress: () => router.push("/settings") },
      { label: "Help", icon: "help-outline", onPress: () => router.push("/help") },
      { label: "Logout", icon: "log-out-outline", onPress: handleLogout },
    ],
    [handleLogout]
  );

  return (
    <View className="flex-1" style={{ backgroundColor: screenBg }}>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Blue header area */}
      <View
        className="items-center pt-6 pb-8"
        style={{ paddingTop: STATUS_BAR_H + 12, backgroundColor: screenBg }}
      >
        <View className="flex-row w-full px-6 items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={titleColor} />
          </TouchableOpacity>
          <Text className="text-[20px] font-bold" style={{ color: titleColor }}>My Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <View className="relative">
          <TouchableOpacity onPress={() => setShowAvatarModal(true)}>
            <Image
              source={{ uri: avatarUri }}
              className="w-[96px] h-[96px] rounded-full"
              style={{ borderWidth: 3, borderColor: "white" }}
            />
            <View className="absolute right-0 bottom-1 w-7 h-7 rounded-full bg-[#2F62F4] items-center justify-center">
              <Ionicons name="camera" size={13} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        <Text className="text-[20px] font-bold mt-3" style={{ color: textPrimary }}>
          {user?.fullName || "John Doe"}
        </Text>
      </View>

      {/* White card section */}
      <View className="flex-1 rounded-t-[32px] pt-4" style={{ backgroundColor: panelBg }}>
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {menuItems.map((item) => {
            const isLogout = item.label === "Logout";
            return (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                className="flex-row items-center py-3"
                activeOpacity={0.8}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: isDark ? "#1F2937" : "#D2DBFF" }}
                >
                  <Ionicons name={item.icon} size={20} color={isLogout ? "#FF4D6D" : "#2F62F4"} />
                </View>
                <Text
                  className="flex-1 text-[16px] font-medium"
                  style={{ color: isLogout ? "#FF4D6D" : textPrimary }}
                >
                  {item.label}
                </Text>
                {!isLogout && <Ionicons name="chevron-forward" size={20} color="#B9C6FF" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <BottomTabBar activeTab="profile" />

      {/* Avatar Modal */}
      <Modal visible={showAvatarModal} transparent animationType="slide" onRequestClose={() => setShowAvatarModal(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="rounded-t-3xl p-6 pb-10" style={{ backgroundColor: panelBg }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[20px] font-semibold" style={{ color: textPrimary }}>Choose Photo</Text>
              <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                <Ionicons name="close" size={26} color="#2F62F4" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleCamera}
              className="flex-row items-center rounded-2xl p-4 mb-3"
              style={{ backgroundColor: isDark ? "#1F2937" : "#F4F5F8" }}
            >
              <View className="w-10 h-10 rounded-full bg-[#2F62F4] items-center justify-center mr-4">
                <Ionicons name="camera" size={20} color="white" />
              </View>
              <Text className="flex-1 text-[16px] font-semibold" style={{ color: textPrimary }}>Take Photo</Text>
              <Ionicons name="chevron-forward" size={20} color="#2F62F4" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLibrary}
              className="flex-row items-center rounded-2xl p-4 mb-3"
              style={{ backgroundColor: isDark ? "#1F2937" : "#F4F5F8" }}
            >
              <View className="w-10 h-10 rounded-full bg-[#2F62F4] items-center justify-center mr-4">
                <Ionicons name="images" size={20} color="white" />
              </View>
              <Text className="flex-1 text-[16px] font-semibold" style={{ color: textPrimary }}>Choose from Library</Text>
              <Ionicons name="chevron-forward" size={20} color="#2F62F4" />
            </TouchableOpacity>

            <View className="rounded-2xl p-4" style={{ backgroundColor: isDark ? "#1F2937" : "#F4F5F8" }}>
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-[#2F62F4] items-center justify-center mr-4">
                  <Ionicons name="link" size={20} color="white" />
                </View>
                <Text className="text-[16px] font-semibold" style={{ color: textPrimary }}>Image URL</Text>
              </View>
              <TextInput
                value={imageUrlInput}
                onChangeText={setImageUrlInput}
                placeholder="Enter image URL"
                placeholderTextColor="#999"
                className="rounded-xl px-4 py-3 text-[14px] mb-3"
                style={{ backgroundColor: isDark ? "#111827" : "#FFFFFF", color: textPrimary }}
              />
              <TouchableOpacity onPress={handleImageUrl} className="bg-[#2F62F4] rounded-xl items-center justify-center py-3">
                <Text className="text-white font-semibold text-[15px]">Set Image URL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout confirmation modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View className="flex-1 justify-end">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowLogoutModal(false)}
          />
          <View className="rounded-t-3xl px-6 pt-12 pb-8 items-center gap-6 " style={{ backgroundColor: panelBg }}>
            <Text className="text-[22px] font-bold text-[#2F62F4] text-center mb-2">Logout</Text>
            <Text className="text-[14px] text-center mb-8" style={{ color: mutedText }}>
              are you sure you want to log out?
            </Text>
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                className="flex-1 py-4 rounded-full bg-[#EEF1FF] items-center"
              >
                <Text className="text-[15px] font-semibold text-[#2F62F4]">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmLogout}
                className="flex-1 py-4 rounded-full bg-[#2F62F4] items-center"
              >
                <Text className="text-[15px] font-bold text-white">Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}