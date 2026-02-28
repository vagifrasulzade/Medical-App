import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useTheme from "@/hooks/use-theme";
import { BottomTabBar } from "../components/BottomTabBar";
import { DoctorCard } from "../components/DoctorCard";
import { NearbyCard } from "../components/NearbyCard";
import { USER_KEY } from "../constant/api";
import { DOCTORS } from "../data/doctor";
import { Doctor } from "../types/doctor.type";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

const FAVORITES_KEY = "favorite_doctors";

const CATEGORIES = [
  { label: "Cardiology",   icon: "heart" as const,                    color: "#FFE5EA", iconColor: "#FF4D6D",  specialty: "Cardiologist"  },
  { label: "Dentistry",    icon: "happy-outline" as const,            color: "#E5EDFF", iconColor: "#3D5AFE",  specialty: "Dentist"       },
  { label: "Neurology",    icon: "flash-outline" as const,            color: "#E5FFF5", iconColor: "#00C896",  specialty: "Neurologist"   },
  { label: "Pediatrics",   icon: "people-outline" as const,           color: "#FFF5E5", iconColor: "#FF9500",  specialty: "Pediatrician"  },
  { label: "Surgery",      icon: "medkit-outline" as const,           color: "#F3E5FF", iconColor: "#9B59B6",  specialty: "Surgeon"       },
  { label: "Therapy",      icon: "chatbubble-ellipses-outline" as const, color: "#E5F6FF", iconColor: "#2196F3", specialty: "Therapist"  },
];

const GENDER_FILTERS = [
  { id: "all",    label: "All",     icon: "apps-outline" as const },
  { id: "male",   label: "Male",    icon: "man-outline" as const },
  { id: "female", label: "Female",  icon: "woman-outline" as const },
];

export default function HomeScreen() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const screenBg = isDark ? "#0F172A" : "#F4F7FE";
  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#1A1A2E";
  const textSecondary = isDark ? "#9CA3AF" : "#9EA3B8";
  const segmentBg = isDark ? "#111827" : "#FFFFFF";

  const [search, setSearch] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("there");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");

  const loadFavorites = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      if (raw) setFavoriteIds(JSON.parse(raw));
    } catch {}
  }, []);

  const toggleFavorite = useCallback(
    async (id: number) => {
      try {
        const updated = favoriteIds.includes(id)
          ? favoriteIds.filter((f) => f !== id)
          : [...favoriteIds, id];
        setFavoriteIds(updated);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      } catch {}
    },
    [favoriteIds]
  );

  const loadUser = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(USER_KEY);
      if (cached) {
        const u = JSON.parse(cached);
        setUserName(u.fullName?.split(" ")[0] || "there");
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadUser();
    loadFavorites();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  // Filtered doctor lists
  const allDoctors = useMemo(() => DOCTORS as Doctor[], []);

  const stats = useMemo(() => {
    const total = allDoctors.reduce((sum, d) => sum + (d.reviewCount ?? 0), 0);
    const avg = allDoctors.reduce((sum, d) => sum + (d.rating ?? 0), 0) / allDoctors.length;
    const patients = total >= 1000 ? `${(total / 1000).toFixed(1).replace(".0", "")}k+` : `${total}+`;
    return { doctors: `${allDoctors.length}+`, patients, avgRating: avg.toFixed(1) };
  }, [allDoctors]);

  const topRated = useMemo(
    () =>
      [...allDoctors]
        .filter((d) => genderFilter === "all" || d.gender === genderFilter)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 6),
    [genderFilter, allDoctors]
  );

  const nearbyDoctors = useMemo(
    () =>
      allDoctors
        .filter((d) => genderFilter === "all" || d.gender === genderFilter)
        .slice(0, 5),
    [genderFilter, allDoctors]
  );

  const maleDoctors = useMemo(
    () => allDoctors.filter((d) => d.gender === "male"),
    [allDoctors]
  );

  const femaleDoctors = useMemo(
    () => allDoctors.filter((d) => d.gender === "female"),
    [allDoctors]
  );

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning ☀️";
    if (h < 18) return "Good afternoon 🌤";
    return "Good evening 🌙";
  };

  return (
    <View style={{ flex: 1, backgroundColor: screenBg }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Hero Header ── */}
      <LinearGradient
        colors={["#3D5AFE", "#6979F8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: STATUS_BAR_H + 12, paddingBottom: 28, paddingHorizontal: 20 }}
      >
        {/* Top row */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <View>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{getGreeting()}</Text>
            <Text style={{ color: "#fff", fontSize: 21, fontWeight: "800", marginTop: 1 }} numberOfLines={1}>
              {userName} 👋
            </Text>
          </View>
          <TouchableOpacity
            style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}
            onPress={() => router.push("/notification-settings" as any)}
          >
            <Ionicons name="notifications-outline" size={21} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push("/doctor-list" as any)}
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 13,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Ionicons name="search-outline" size={18} color="#8A8A9B" />
          <Text style={{ flex: 1, marginLeft: 10, fontSize: 14, color: "#A0A0B5" }}>Search doctors, specialties…</Text>
          <View style={{ backgroundColor: "#EEF1FF", borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ color: "#3D5AFE", fontSize: 11, fontWeight: "700" }}>Search</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Gender Filter Tabs ── */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: segmentBg,
          marginHorizontal: 20,
          marginTop: -1,
          borderRadius: 18,
          padding: 5,
          shadowColor: "#3D5AFE",
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
          marginBottom: 6,
        }}
      >
        {GENDER_FILTERS.map((f) => {
          const active = genderFilter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              onPress={() => setGenderFilter(f.id as any)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                paddingVertical: 10,
                borderRadius: 14,
                backgroundColor: active ? "#3D5AFE" : "transparent",
              }}
            >
              <Ionicons name={f.icon} size={15} color={active ? "#fff" : "#9EA3B8"} />
              <Text style={{ fontSize: 13, fontWeight: "700", color: active ? "#fff" : "#9EA3B8" }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3D5AFE" />}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 110 }}
      >        

        {/* ── Quick Stats ── */}
        <View style={{ flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 18 }}>
          {[
            { color: "#E5F6FF", icon: "people" as const,   iconColor: "#2196F3", val: stats.doctors,          label: "Doctors"     },
            { color: "#E5EDFF", icon: "calendar" as const, iconColor: "#3D5AFE", val: stats.patients,         label: "Patients"    },
            { color: "#E5FFF5", icon: "star" as const,     iconColor: "#00C896", val: `${stats.avgRating} ★`, label: "Avg. Rating" },
          ].map((s) => (
            <View
              key={s.label}
              style={{ flex: 1, backgroundColor: cardBg, borderRadius: 18, padding: 14, alignItems: "center", shadowColor: "#3D5AFE", shadowOpacity: isDark ? 0.15 : 0.06, shadowRadius: 10, elevation: 2 }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: s.color, alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                <Ionicons name={s.icon} size={18} color={s.iconColor} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "800", color: textPrimary }}>{s.val}</Text>
              <Text style={{ fontSize: 10.5, color: textSecondary, marginTop: 1, textAlign: "center" }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Categories ── */}
        <View style={{ marginBottom: 20 }}>
          <SectionRow title="Categories" onSeeAll={() => router.push("/doctor-list" as any)} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.label}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: "/doctor-list" as any, params: { specialty: cat.specialty } })}
                style={{ alignItems: "center", width: 72 }}
              >
                <View style={{ width: 62, height: 62, borderRadius: 18, backgroundColor: cat.color, alignItems: "center", justifyContent: "center", marginBottom: 7, shadowColor: cat.iconColor, shadowOpacity: 0.15, shadowRadius: 6, elevation: 2 }}>
                  <Ionicons name={cat.icon} size={28} color={cat.iconColor} />
                </View>
                <Text style={{ fontSize: 10.5, fontWeight: "600", color: isDark ? "#D1D5DB" : "#3A3A4A", textAlign: "center" }}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Top Rated Doctors ── */}
        {topRated.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <SectionRow
              title="Top Rated"
              badge="⭐"
              onSeeAll={() => router.push("/doctor-list" as any)}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}>
              {topRated.map((doc) => (
                <DoctorCard
                  key={String(doc.id)}
                  doctor={doc}
                  isFavorite={favoriteIds.includes(doc.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Male Doctors (shown when All or Male) ── */}
        {(genderFilter === "all" || genderFilter === "male") && maleDoctors.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <SectionRow
              title="Male Doctors"
              badge="♂"
              badgeColor="#3D5AFE"
              onSeeAll={() => router.push({ pathname: "/doctor-list" as any, params: { gender: "male" } })}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}>
              {maleDoctors.map((doc) => (
                <DoctorCard
                  key={String(doc.id)}
                  doctor={doc}
                  isFavorite={favoriteIds.includes(doc.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Female Doctors (shown when All or Female) ── */}
        {(genderFilter === "all" || genderFilter === "female") && femaleDoctors.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <SectionRow
              title="Female Doctors"
              badge="♀"
              badgeColor="#FF4D8B"
              onSeeAll={() => router.push({ pathname: "/doctor-list" as any, params: { gender: "female" } })}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}>
              {femaleDoctors.map((doc) => (
                <DoctorCard
                  key={String(doc.id)}
                  doctor={doc}
                  isFavorite={favoriteIds.includes(doc.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Nearby Doctors ── */}
        {nearbyDoctors.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
            <SectionRow
              title="Nearby Doctors"
              badge="📍"
              onSeeAll={() => router.push("/doctor-list" as any)}
            />
            {nearbyDoctors.map((doc) => (
              <NearbyCard
                key={doc.id}
                doctor={doc}
                isFavorite={favoriteIds.includes(doc.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </View>
        )}

        {/* ── Health Tip Banner ── */}
        <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
          <LinearGradient
            colors={["#00C896", "#00A87E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 20, padding: 18, flexDirection: "row", alignItems: "center", gap: 14 }}
          >
            <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="shield-checkmark-outline" size={26} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800", marginBottom: 3 }}>Health Tip</Text>
              <Text style={{ color: "rgba(255,255,255,0.88)", fontSize: 12, lineHeight: 18 }}>
                Schedule your preventive check-up on time. Early diagnosis saves lives.
              </Text>
            </View>
          </LinearGradient>
        </View>

      </ScrollView>

      <BottomTabBar activeTab="home" />
    </View>
  );
}

// ─── Section Header helper ────────────────────────────────────────────────────
function SectionRow({
  title,
  badge,
  badgeColor,
  onSeeAll,
}: {
  title: string;
  badge?: string;
  badgeColor?: string;
  onSeeAll?: () => void;
}) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        {badge && (
          <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: badgeColor ? badgeColor + "20" : "#FFF5D6", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 13, color: badgeColor }}>{badge}</Text>
          </View>
        )}
        <Text style={{ fontSize: 16, fontWeight: "800", color: isDark ? "#F9FAFB" : "#1A1A2E" }}>{title}</Text>
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <Text style={{ fontSize: 12.5, color: "#3D5AFE", fontWeight: "600" }}>See All</Text>
          <Ionicons name="chevron-forward" size={14} color="#3D5AFE" />
        </TouchableOpacity>
      )}
    </View>
  );
}

