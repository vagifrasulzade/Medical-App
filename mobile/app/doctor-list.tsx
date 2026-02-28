import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { DOCTORS } from "../data/doctor";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

const FAVORITES_KEY = "favorite_doctors";

const SPECIALTIES = [
  { label: "All",           icon: "apps-outline" as const,                   color: "#3D5AFE" },
  { label: "Dentist",       icon: "medical-outline" as const,                color: "#3D5AFE" },
  { label: "Cardiologist",  icon: "heart-outline" as const,                  color: "#FF4D6D" },
  { label: "Neurologist",   icon: "flash-outline" as const,                  color: "#00C896" },
  { label: "Pediatrician",  icon: "happy-outline" as const,                  color: "#FF9500" },
  { label: "Surgeon",       icon: "medkit-outline" as const,                 color: "#9B59B6" },
  { label: "Therapist",     icon: "chatbubble-ellipses-outline" as const,    color: "#2196F3" },
];

const GENDER_TABS = [
  { id: "all",    label: "All",     icon: "apps-outline" as const },
  { id: "male",   label: "Male",    icon: "man-outline" as const },
  { id: "female", label: "Female",  icon: "woman-outline" as const },
];

type Doctor = {
  id: number;
  fullName: string;
  photo?: string;
  specialty: string;
  yearsOfExperience?: number;
  hospitalName?: string;
  consultationFee?: number;
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  gender?: "male" | "female";
};

function StarRow({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginTop: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? "star" : "star-outline"}
          size={10}
          color="#F59E0B"
        />
      ))}
      <Text style={{ fontSize: 10.5, color: "#9EA3B8", marginLeft: 3 }}>{rating.toFixed(1)}</Text>
    </View>
  );
}

export default function DoctorListScreen() {
  const { specialty: initialSpecialty, search: initialSearch, gender: initialGender } =
    useLocalSearchParams<{ specialty?: string; search?: string; gender?: string }>();

  const [search, setSearch] = useState(initialSearch || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState(
    initialSpecialty
      ? SPECIALTIES.find((s) => s.label === initialSpecialty)?.label ?? "All"
      : "All"
  );
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">(
    (initialGender as any) || "all"
  );
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => { if (initialSpecialty) setSelectedSpecialty(initialSpecialty); }, [initialSpecialty]);
  useEffect(() => { if (initialSearch) setSearch(initialSearch); }, [initialSearch]);
  useEffect(() => { if (initialGender) setGenderFilter(initialGender as any); }, [initialGender]);

  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_KEY).then((v) => {
      if (v) setFavorites(JSON.parse(v));
    });
  }, []);

  const toggleFavorite = async (id: number) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  };

  const displayed = useMemo(() => {
    let list = DOCTORS as Doctor[];
    if (selectedSpecialty !== "All") list = list.filter((d) => d.specialty === selectedSpecialty);
    if (genderFilter !== "all") list = list.filter((d) => d.gender === genderFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.fullName.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          (d.hospitalName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, selectedSpecialty, genderFilter]);

  const pageTitle =
    genderFilter === "male"
      ? "Male Doctors"
      : genderFilter === "female"
      ? "Female Doctors"
      : selectedSpecialty !== "All"
      ? selectedSpecialty
      : "All Doctors";

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F7FE" }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Gradient Header */}
      <LinearGradient
        colors={["#3D5AFE", "#6979F8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: STATUS_BAR_H + 10, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#fff", flex: 1 }}>{pageTitle}</Text>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
            {displayed.length} doctors
          </Text>
        </View>

        {/* Search */}
        <View style={{ backgroundColor: "#fff", borderRadius: 16, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}>
          <Ionicons name="search-outline" size={17} color="#8A8A9B" />
          <TextInput
            placeholder="Search doctors, specialties, hospitals…"
            placeholderTextColor="#A0A0B5"
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, marginLeft: 10, fontSize: 13.5, color: "#1A1A2E" }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={17} color="#8A8A9B" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Gender Toggle */}
      <View style={uiStyles.genderWrap}>
        {GENDER_TABS.map((t) => {
          const active = genderFilter === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setGenderFilter(t.id as any)}
              style={[uiStyles.genderTab, active && uiStyles.genderTabActive]}
            >
              <Ionicons name={t.icon} size={14} color={active ? "#fff" : "#9EA3B8"} />
              <Text style={[uiStyles.genderTabText, { color: active ? "#fff" : "#9EA3B8" }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Specialty filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: "center" , height:80}}
        style={{ flexGrow: 0 }}
      >
        {SPECIALTIES.map((item) => {
          const active = selectedSpecialty === item.label;
          return (
            <TouchableOpacity
              key={item.label}
              onPress={() => setSelectedSpecialty(item.label)}
              style={[
                uiStyles.chip,
                {
                  backgroundColor: active ? item.color : "#fff",
                  borderColor: active ? item.color : "#E8EAFF",
                  elevation: active ? 3 : 0,
                  shadowColor: active ? item.color : undefined,
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                },
              ]}
            >
              <Ionicons name={item.icon} size={13} color={active ? "#fff" : item.color} />
              <Text style={[uiStyles.chipText, { color: active ? "#fff" : "#4A4A6A" }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Doctor list */}
      {displayed.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: "#EEF1FF", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Ionicons name="search-outline" size={38} color="#AAB4FF" />
          </View>
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#1A1A2E", textAlign: "center", marginBottom: 8 }}>No Doctors Found</Text>
          <Text style={{ fontSize: 13, color: "#9EA3B8", textAlign: "center", lineHeight: 20 }}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isFav = favorites.includes(item.id);
            return (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.push({ pathname: "/doctor-detail", params: { id: item.id } })}
                style={cardStyles.card}
              >
                {/* Photo */}
                <View style={cardStyles.photoWrap}>
                  <Image
                    source={{ uri: item.photo }}
                    style={cardStyles.photo}
                    resizeMode="cover"
                  />
                  {item.isVerified && (
                    <View style={cardStyles.verifiedBadge}>
                      <Ionicons name="checkmark" size={9} color="#fff" />
                    </View>
                  )}
                  {item.gender && (
                    <View style={[cardStyles.genderBadge, { backgroundColor: item.gender === "male" ? "#3D5AFE" : "#FF4D8B" }]}>
                      <Text style={cardStyles.genderText}>{item.gender === "male" ? "♂" : "♀"}</Text>
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={cardStyles.info}>
                  <Text style={cardStyles.name} numberOfLines={1}>Dr. {item.fullName}</Text>
                  <Text style={cardStyles.specialty}>{item.specialty}</Text>
                  <StarRow rating={item.rating} />
                  {item.hospitalName ? (
                    <Text style={cardStyles.hospital} numberOfLines={1}>🏥 {item.hospitalName}</Text>
                  ) : null}
                </View>

                {/* Right */}
                <View style={cardStyles.right}>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(item.id)}
                    style={[cardStyles.favBtn, { backgroundColor: isFav ? "#FFF0F3" : "#F4F7FE" }]}
                  >
                    <Ionicons name={isFav ? "heart" : "heart-outline"} size={17} color={isFav ? "#FF4D6D" : "#9EA3B8"} />
                  </TouchableOpacity>
                  <Text style={cardStyles.price}>
                    {item.consultationFee ? `$${item.consultationFee}` : "Free"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: "/doctor-detail", params: { id: item.id } })}
                    style={cardStyles.bookBtn}
                  >
                    <Text style={cardStyles.bookText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const uiStyles = StyleSheet.create({
  genderWrap: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 4,
    marginBottom: 4,
    elevation: 4,
    shadowColor: "#3D5AFE",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  genderTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  genderTabActive: {
    backgroundColor: "#3D5AFE",
  },
  genderTabText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: "flex-start",
    gap: 5,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#3D5AFE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
  },
  photoWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#EEF1FF",
    overflow: "hidden",
    marginRight: 14,
    flexShrink: 0,
  },
  photo: {
    width: 72,
    height: 72,
  },
  verifiedBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 16,
    height: 16,
    borderRadius: 6,
    backgroundColor: "#3D5AFE",
    alignItems: "center",
    justifyContent: "center",
  },
  genderBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  genderText: {
    fontSize: 11,
    color: "#fff",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#1A1A2E",
  },
  specialty: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3D5AFE",
    marginTop: 2,
  },
  hospital: {
    fontSize: 11,
    color: "#9EA3B8",
    marginTop: 4,
  },
  right: {
    alignItems: "flex-end",
    marginLeft: 10,
    gap: 7,
  },
  favBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  price: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1A2E",
  },
  bookBtn: {
    backgroundColor: "#EEF1FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bookText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3D5AFE",
  },
});
