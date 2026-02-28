import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import useTheme from "@/hooks/use-theme";
import { Doctor } from "../types/doctor.type";

type Props = {
  doctor: Doctor;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
};

export function NearbyCard({ doctor, isFavorite, onToggleFavorite }: Props) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  const displayName = `Dr. ${doctor.fullName || doctor.name || "Unknown"}`;
  const rating = doctor.rating ?? 4.5;
  const reviewCount = doctor.reviewCount ?? 0;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={{
        backgroundColor: isDark ? "#111827" : "#fff",
        borderRadius: 18,
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        marginBottom: 10,
        shadowColor: "#3D5AFE",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isDark ? 0.16 : 0.08,
        shadowRadius: 10,
        elevation: 3,
      }}
      onPress={() =>
        router.push({ pathname: "/doctor-detail", params: { id: doctor.id } })
      }
    >
      {/* Photo */}
      <View
        style={{
          width: 66,
          height: 66,
          borderRadius: 16,
          backgroundColor: "#EEF1FF",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginRight: 12,
        }}
      >
        {doctor.photo ? (
          <Image source={{ uri: doctor.photo }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <Ionicons name="person-circle-outline" size={44} color="#3D5AFE" />
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: isDark ? "#F9FAFB" : "#1A1A2E" }} numberOfLines={1}>
            {displayName}
          </Text>
          {doctor.gender && (
            <View
              style={{
                backgroundColor: doctor.gender === "female" ? "#FFF0F5" : "#EEF1FF",
                borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1,
              }}
            >
              <Text style={{ fontSize: 10, color: doctor.gender === "female" ? "#FF4D8B" : "#3D5AFE", fontWeight: "700" }}>
                {doctor.gender === "female" ? "♀ female" : "♂ male"}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: 12, color: "#3D5AFE", fontWeight: "600", marginBottom: 4 }}>
          {doctor.specialty}
        </Text>
        {/* Rating row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 1 }}>
            {[1,2,3,4,5].map((s) => (
              <Ionicons key={s} name={rating >= s ? "star" : rating >= s - 0.5 ? "star-half" : "star-outline"} size={11} color="#F59E0B" />
            ))}
          </View>
          <Text style={{ fontSize: 11.5, fontWeight: "700", color: isDark ? "#F9FAFB" : "#1A1A2E" }}>{rating.toFixed(1)}</Text>
          <Text style={{ fontSize: 10.5, color: isDark ? "#9CA3AF" : "#9EA3B8" }}>· {reviewCount} reviews</Text>
        </View>
        {doctor.hospitalName && (
          <Text style={{ fontSize: 10.5, color: isDark ? "#9CA3AF" : "#9EA3B8", marginTop: 3 }} numberOfLines={1}>
            🏥 {doctor.hospitalName}
          </Text>
        )}
      </View>

      {/* Right side */}
      <View style={{ alignItems: "flex-end", gap: 8 }}>
        <TouchableOpacity onPress={() => onToggleFavorite(doctor.id)}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite ? "#FF4D6D" : "#C0C8D8"}
          />
        </TouchableOpacity>
        <Text style={{ fontSize: 13, fontWeight: "800", color: isDark ? "#F9FAFB" : "#1A1A2E" }}>
          {doctor.consultationFee ? `$${doctor.consultationFee}` : "Free"}
        </Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/doctor-detail", params: { id: doctor.id } })}
          style={{ backgroundColor: "#EEF1FF", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}
        >
          <Text style={{ fontSize: 11, color: "#3D5AFE", fontWeight: "700" }}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
