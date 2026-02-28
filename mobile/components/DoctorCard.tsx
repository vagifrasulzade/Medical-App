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

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={rating >= s ? "star" : rating >= s - 0.5 ? "star-half" : "star-outline"}
          size={10}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

export function DoctorCard({ doctor, isFavorite, onToggleFavorite }: Props) {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  const displayName = `Dr. ${doctor.fullName || doctor.name || "Unknown"}`;
  const rating = doctor.rating ?? 4.5;
  const reviewCount = doctor.reviewCount ?? 0;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={{
        width: 175,
        marginRight: 14,
        backgroundColor: isDark ? "#111827" : "#fff",
        borderRadius: 20,
        padding: 13,
        shadowColor: "#3D5AFE",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.18 : 0.1,
        shadowRadius: 12,
        elevation: 4,
      }}
      onPress={() =>
        router.push({ pathname: "/doctor-detail", params: { id: doctor.id } })
      }
    >
      {/* Photo */}
      <View
        style={{
          width: "100%",
          height: 108,
          borderRadius: 14,
          backgroundColor: "#EEF1FF",
          marginBottom: 10,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {doctor.photo ? (
          <Image source={{ uri: doctor.photo }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <Ionicons name="person-circle-outline" size={56} color="#3D5AFE" />
        )}
        {/* Verified badge */}
        {doctor.isVerified && (
          <View
            style={{
              position: "absolute", top: 7, left: 7,
              backgroundColor: "#3D5AFE",
              borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2,
              flexDirection: "row", alignItems: "center", gap: 3,
            }}
          >
            <Ionicons name="checkmark-circle" size={9} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 8.5, fontWeight: "700" }}>Verified</Text>
          </View>
        )}
        {/* Gender badge */}
        <View
          style={{
            position: "absolute", top: 7, right: 7,
            backgroundColor: doctor.gender === "female" ? "#FF4D8B" : "#3D5AFE",
            borderRadius: 20, width: 22, height: 22,
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 12 }}>{doctor.gender === "female" ? "♀" : "♂"}</Text>
        </View>
        {/* Favorite button overlay */}
        <TouchableOpacity
          onPress={() => onToggleFavorite(doctor.id)}
          style={{
            position: "absolute", bottom: 7, right: 7,
            backgroundColor: isFavorite ? "#FF4D6D" : "rgba(255,255,255,0.85)",
            borderRadius: 20, width: 26, height: 26,
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={13} color={isFavorite ? "#fff" : "#8A8A9B"} />
        </TouchableOpacity>
      </View>

      {/* Name */}
      <Text style={{ fontSize: 13.5, fontWeight: "800", color: isDark ? "#F9FAFB" : "#1A1A2E", marginBottom: 2 }} numberOfLines={1}>
        {displayName}
      </Text>
      {/* Specialty */}
      <Text style={{ fontSize: 11.5, color: "#3D5AFE", fontWeight: "600", marginBottom: 5 }} numberOfLines={1}>
        {doctor.specialty}
      </Text>
      {/* Rating */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 }}>
        <StarRating rating={rating} />
        <Text style={{ fontSize: 11, fontWeight: "700", color: isDark ? "#F9FAFB" : "#1A1A2E" }}>{rating.toFixed(1)}</Text>
        <Text style={{ fontSize: 10, color: isDark ? "#9CA3AF" : "#9EA3B8" }}>({reviewCount})</Text>
      </View>

      {/* Book button */}
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/doctor-detail", params: { id: doctor.id } })}
        style={{ backgroundColor: "#3D5AFE", borderRadius: 12, paddingVertical: 8, alignItems: "center" }}
      >
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Book Appointment</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
