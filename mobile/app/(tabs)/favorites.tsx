import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BottomTabBar } from "../../components/BottomTabBar";
import useTheme from "@/hooks/use-theme";
import { DOCTORS } from "../../data/doctor";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const FAVORITES_KEY = "favorite_doctors";

type Doctor = {
  id: number;
  fullName: string;
  photo?: string;
  specialty: string;
  yearsOfExperience?: number;
  hospitalName?: string;
  consultationFee?: number;
  isVerified?: boolean;
};

export default function FavoritesScreen() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const screenBg = isDark ? "#0F172A" : "#F5F7FF";
  const headerBg = isDark ? "#111827" : "#FFFFFF";
  const headerBorder = isDark ? "#1F2937" : "#F0F0F5";
  const titleColor = isDark ? "#F9FAFB" : "#1A1A2E";
  const subtitleColor = isDark ? "#9CA3AF" : "#8A8A9B";
  const cardBg = isDark ? "#111827" : "#FFFFFF";

  const [favorites, setFavorites] = useState<Doctor[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      const ids: number[] = raw ? JSON.parse(raw) : [];
      setFavorites((DOCTORS as Doctor[]).filter((d) => ids.includes(d.id)));
    } catch {
      // silently fail
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadFavorites(); }, []);

  const removeFavorite = async (id: number) => {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    const ids: number[] = raw ? JSON.parse(raw) : [];
    const updated = ids.filter((f) => f !== id);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    setFavorites((prev) => prev.filter((d) => d.id !== id));
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: screenBg }}>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View
        className="px-5 pb-4 border-b"
        style={{ paddingTop: STATUS_BAR_H + 12, backgroundColor: headerBg, borderBottomColor: headerBorder }}
      >
        <View className="flex-row items-center mb-1">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-[#F0F3FF] items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={18} color="#3D5AFE" />
          </TouchableOpacity>
          <Text className="text-[22px] font-bold" style={{ color: titleColor }}>Favorites</Text>
        </View>
        <Text className="text-[13px] mt-0.5 pl-12" style={{ color: subtitleColor }}>
          {favorites.length > 0 ? `${favorites.length} saved doctor${favorites.length > 1 ? "s" : ""}` : "Your saved doctors"}
        </Text>
      </View>

      <ScrollView
          className="flex-1 px-5 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3D5AFE" />
          }
        >
          {favorites.length === 0 ? (
            <View className="items-center mt-20">
              <Ionicons name="heart-outline" size={64} color="#C0C8FF" />
              <Text className="text-[16px] font-semibold text-[#1A1A2E] mt-4">
                No favorites yet
              </Text>
              <Text className="text-[13px] text-[#8A8A9B] mt-1 text-center px-8">
                Tap the heart icon on any doctor to save them here.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/home" as any)}
                className="bg-[#3D5AFE] rounded-full px-6 py-3 mt-6"
              >
                <Text className="text-white font-bold text-[14px]">Browse Doctors</Text>
              </TouchableOpacity>
            </View>
          ) : (
            favorites.map((doctor) => {
              const displayName = `Dr. ${doctor.fullName}`;
              return (
                <TouchableOpacity
                  key={doctor.id}
                  activeOpacity={0.88}
                  onPress={() => router.push({ pathname: "/doctor-detail" as any, params: { id: doctor.id } })}
                  className="rounded-3xl flex-row items-center p-4 mb-3"
                  style={{
                    backgroundColor: cardBg,
                    shadowColor: "#000",
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  {/* Photo */}
                  <View className="w-[64px] h-[64px] rounded-2xl bg-[#F0F3FF] items-center justify-center overflow-hidden mr-4">
                    {doctor.photo ? (
                      <Image source={{ uri: doctor.photo }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Ionicons name="person-circle-outline" size={42} color="#3D5AFE" />
                    )}
                    {doctor.isVerified && (
                      <View className="absolute bottom-0 right-0 bg-[#3D5AFE] rounded-full w-5 h-5 items-center justify-center">
                        <Ionicons name="checkmark" size={11} color="#fff" />
                      </View>
                    )}
                  </View>

                  {/* Info */}
                  <View className="flex-1">
                    <Text className="text-[14px] font-bold" style={{ color: titleColor }} numberOfLines={1}>
                      {displayName}
                    </Text>
                    <Text className="text-[12px] text-[#3D5AFE] font-medium mt-0.5">
                      {doctor.specialty}
                    </Text>
                    {doctor.hospitalName ? (
                      <Text className="text-[11px] mt-0.5" style={{ color: subtitleColor }} numberOfLines={1}>
                        {doctor.hospitalName}
                      </Text>
                    ) : null}
                    <Text className="text-[12px] font-semibold mt-1" style={{ color: titleColor }}>
                      {doctor.consultationFee ? `$${doctor.consultationFee}` : "Free"}
                    </Text>
                  </View>

                  {/* Remove heart */}
                  <TouchableOpacity
                    onPress={() => removeFavorite(doctor.id)}
                    className="w-9 h-9 rounded-full bg-[#FFE8EC] items-center justify-center"
                  >
                    <Ionicons name="heart" size={18} color="#FF4D6D" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}
          <View className="h-28" />
        </ScrollView>

      <BottomTabBar activeTab="favorites" />
    </View>
  );
}
