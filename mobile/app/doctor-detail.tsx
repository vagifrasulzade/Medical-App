import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DOCTORS } from "../data/doctor";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

const FAVORITES_KEY = "favorite_doctors";

type Availability = {
  workingDays?: string[];
  startTime?: string;
  endTime?: string;
  slotDurationMinutes?: number;
};

type Doctor = {
  id: number;
  fullName: string;
  photo?: string;
  specialty: string;
  yearsOfExperience?: number;
  hospitalName?: string;
  hospitalAddress?: string;
  consultationFee?: number;
  description?: string;
  isVerified?: boolean;
  lat?: number;
  lng?: number;
  rating?: number;
  reviewCount?: number;
  gender?: "male" | "female";
  reviews?: { name: string; rating: number; comment: string }[];
  availability?: Availability;
};

const DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function openInMaps(lat?: number, lng?: number, label?: string) {
  if (!lat || !lng) return;
  const url =
    Platform.OS === "ios"
      ? `maps://?q=${encodeURIComponent(label || "Hospital")}&ll=${lat},${lng}`
      : `geo:${lat},${lng}?q=${encodeURIComponent(label || "Hospital")}`;
  Linking.openURL(url).catch(() =>
    Alert.alert("Cannot open Maps", "Please install Google Maps or Apple Maps.")
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <Text style={{ fontSize: 13, color: "#9EA3B8" }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1A2E" }}>{value}</Text>
    </View>
  );
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function buildCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const cells: ({ fullDate: string; day: number; dayName: string } | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayName = DAY_FULL[date.getDay() === 0 ? 6 : date.getDay() - 1];
    cells.push({ fullDate, day: d, dayName });
  }
  return cells;
}

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const doctor = useMemo(
    () => (DOCTORS as unknown as Doctor[]).find((d) => d.id === Number(id)) ?? null,
    [id]
  );
  const [isFavorite, setIsFavorite] = useState(false);

  const _today = new Date();
  const todayStr = `${_today.getFullYear()}-${String(_today.getMonth() + 1).padStart(2, "0")}-${String(_today.getDate()).padStart(2, "0")}`;
  const [calendarYear, setCalendarYear] = useState(_today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(_today.getMonth());
  const [selectedDate, setSelectedDate] = useState({
    fullDate: todayStr,
    dayName: DAY_FULL[_today.getDay() === 0 ? 6 : _today.getDay() - 1],
  });
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const ALL_SLOTS = [
    "09:00","09:30","10:00","10:30","11:00","11:30",
    "14:00","14:30","15:00","15:30","16:00","16:30",
  ];

  const [bookingFor, setBookingFor] = useState<"self" | "other">("self");
  const [patientFullName, setPatientFullName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState<"Male" | "Female" | "Other">("Male");
  const [problem, setProblem] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_KEY).then((v) => {
      if (v) setIsFavorite((JSON.parse(v) as number[]).includes(Number(id)));
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    AsyncStorage.getItem("appointments")
      .then((raw) => {
        const all = raw ? JSON.parse(raw) : [];
        const booked = all
          .filter(
            (a: any) =>
              a.doctorId === Number(id) &&
              a.date === selectedDate.fullDate &&
              a.status !== "cancelled"
          )
          .map((a: any) => a.startTime);
        setSlots(ALL_SLOTS.filter((s) => !booked.includes(s)));
      })
      .finally(() => setSlotsLoading(false));
  }, [id, selectedDate]);

  const toggleFavorite = async () => {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    const favs: number[] = stored ? JSON.parse(stored) : [];
    const docId = Number(id);
    const updated = isFavorite ? favs.filter((f) => f !== docId) : [...favs, docId];
    setIsFavorite(!isFavorite);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  };

  if (!doctor) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F0F3FF", alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <Ionicons name="alert-circle-outline" size={56} color="#C0C8FF" />
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#1A1A2E", marginTop: 16 }}>Doctor not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, backgroundColor: "#3D5AFE", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 14 }}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayName = `Dr. ${doctor.fullName}`;
  const workingDays = doctor.availability?.workingDays || [];

  return (
    <View style={{ flex: 1, backgroundColor: "#F0F3FF" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Hero Header ── */}
      <LinearGradient
        colors={["#3D5AFE", "#6979F8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: STATUS_BAR_H, paddingBottom: 76, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Doctor Profile</Text>
          <TouchableOpacity
            onPress={toggleFavorite}
            style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: isFavorite ? "#FF4D6D" : "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: "center" }}>
          <View style={{ width: 96, height: 96, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 3, borderColor: "rgba(255,255,255,0.45)" }}>
            {doctor.photo ? (
              <Image source={{ uri: doctor.photo }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <Ionicons name="person-circle-outline" size={64} color="rgba(255,255,255,0.85)" />
            )}
          </View>
          {doctor.isVerified && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.22)", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 8 }}>
              <Ionicons name="checkmark-circle" size={12} color="#fff" />
              <Text style={{ fontSize: 11, color: "#fff", fontWeight: "600" }}>Verified Doctor</Text>
            </View>
          )}
          <Text style={{ color: "#fff", fontSize: 21, fontWeight: "800", marginTop: 6 }}>{displayName}</Text>
          <Text style={{ color: "rgba(255,255,255,0.82)", fontSize: 14, marginTop: 2 }}>{doctor.specialty}</Text>
          {doctor.hospitalName && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
              <Ionicons name="business-outline" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{doctor.hospitalName}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* ── Stats floating card ── */}
    <View style={{ marginHorizontal: 20, marginTop: -44, backgroundColor: "#fff", borderRadius: 22, paddingVertical: 16, paddingHorizontal: 8, flexDirection: "row", justifyContent: "space-around", shadowColor: "#3D5AFE", shadowOpacity: 0.13, shadowRadius: 18, elevation: 8 }}>
      {[
        { icon: "time-outline" as const,   val: doctor.yearsOfExperience ? `${doctor.yearsOfExperience} yr` : "—",         label: "Experience" },
        { icon: "people-outline" as const,   val: doctor.reviewCount      ? `${doctor.reviewCount}+`          : "N/A",       label: "Patients" },
        { icon: "star" as const,             val: doctor.rating           ? `${doctor.rating} ★`              : "N/A",       label: "Rating" },
        { icon: "cash-outline" as const,     val: doctor.consultationFee  ? `$${doctor.consultationFee}`      : "Free",      label: "Fee" },
      ].map((s, i, arr) => (
        <View key={s.label} style={{ alignItems: "center", flex: 1 }}>
        <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: "#EEF1FF", alignItems: "center", justifyContent: "center", marginBottom: 5 }}>
          <Ionicons name={s.icon} size={17} color="#3D5AFE" />
        </View>
        <Text style={{ fontSize: 13, fontWeight: "800", color: "#1A1A2E" }}>{s.val}</Text>
        <Text style={{ fontSize: 11, color: "#9EA3B8", marginTop: 1 }}>{s.label}</Text>
        {i < arr.length - 1 && (
          <View style={{ position: "absolute", right: 0, top: "10%", bottom: "10%", width: 1, backgroundColor: "#F0F0F5" }} />
        )}
        </View>
      ))}
    </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 130 }}>

        {/* About */}
        {doctor.description && (
          <View style={C.card}>
            <CardTitle icon="information-circle-outline" title="About" />
            <Text style={{ fontSize: 13.5, color: "#6B7189", lineHeight: 22 }}>{doctor.description}</Text>
          </View>
        )}

        {/* Hospital */}
        {doctor.hospitalName && (
          <View style={C.card}>
            <CardTitle icon="business-outline" title="Hospital" />
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FF", borderRadius: 14, padding: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#EEF1FF", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="business" size={22} color="#3D5AFE" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A2E" }}>{doctor.hospitalName}</Text>
                <Text style={{ fontSize: 12, color: "#9EA3B8", marginTop: 2 }}>Medical Center</Text>
              </View>
              {doctor.lat && doctor.lng && (
                <TouchableOpacity
                  onPress={() => openInMaps(doctor.lat, doctor.lng, doctor.hospitalName)}
                  style={{ backgroundColor: "#3D5AFE", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Ionicons name="navigate" size={13} color="#fff" />
                  <Text style={{ fontSize: 12, color: "#fff", fontWeight: "600" }}>Map</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Working Days */}
        {workingDays.length > 0 && (
          <View style={C.card}>
            <CardTitle icon="calendar-outline" title="Working Days" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {DAY_FULL.map((day) => {
                const active = workingDays.includes(day);
                return (
                  <View key={day} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: active ? "#3D5AFE" : "#F0F3FF" }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: active ? "#fff" : "#9EA3B8" }}>{day.slice(0, 3)}</Text>
                  </View>
                );
              })}
            </View>
            {doctor.availability?.startTime && (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 7, backgroundColor: "#F0F3FF", borderRadius: 12, padding: 10 }}>
                <Ionicons name="time-outline" size={14} color="#3D5AFE" />
                <Text style={{ fontSize: 13, color: "#6B7189" }}>
                  {doctor.availability.startTime} – {doctor.availability.endTime}{"  ·  "}{doctor.availability.slotDurationMinutes ?? 30} min/slot
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Reviews */}
        {doctor.reviews && doctor.reviews.length > 0 && (
          <View style={C.card}>
            <CardTitle icon="chatbubble-ellipses-outline" title="Patient Reviews" />
            {doctor.reviews.map((r, i) => (
              <View
                key={i}
                style={{ backgroundColor: "#F5F7FF", borderRadius: 14, padding: 13, marginBottom: i < doctor.reviews!.length - 1 ? 10 : 0 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#EEF1FF", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="person-outline" size={16} color="#3D5AFE" />
                    </View>
                    <Text style={{ fontSize: 13.5, fontWeight: "700", color: "#1A1A2E" }}>{r.name}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#FFF7E0", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Ionicons name="star" size={11} color="#F59E0B" />
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#F59E0B" }}>{r.rating}.0</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: "#6B7189", lineHeight: 20 }}>{r.comment}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Date Picker */}
        <View style={C.card}>
          <CardTitle icon="calendar" title="Select Date" />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear((y) => y - 1); } else setCalendarMonth((m) => m - 1); }}
              style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#F0F3FF", alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="chevron-back" size={18} color="#3D5AFE" />
            </TouchableOpacity>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A2E" }}>{MONTH_NAMES[calendarMonth]} {calendarYear}</Text>
            <TouchableOpacity
              onPress={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear((y) => y + 1); } else setCalendarMonth((m) => m + 1); }}
              style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#F0F3FF", alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="chevron-forward" size={18} color="#3D5AFE" />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", marginBottom: 6 }}>
            {["Mo","Tu","We","Th","Fr","Sa","Su"].map((wd) => (
              <Text key={wd} style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: "700", color: "#9EA3B8" }}>{wd}</Text>
            ))}
          </View>

          {(() => {
            const cells = buildCalendarGrid(calendarYear, calendarMonth);
            const rows: (typeof cells[0])[][] = [];
            for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
            const last = rows[rows.length - 1];
            while (last.length < 7) last.push(null);
            return rows.map((row, ri) => (
              <View key={ri} style={{ flexDirection: "row", marginBottom: 3 }}>
                {row.map((cell, ci) => {
                  if (!cell) return <View key={ci} style={{ flex: 1, paddingVertical: 14 }} />;
                  const isSelected = selectedDate.fullDate === cell.fullDate;
                  const isToday = todayStr === cell.fullDate;
                  const isPast = cell.fullDate < todayStr;
                  const isWorkDay = workingDays.length === 0 || workingDays.includes(cell.dayName);
                  const disabled = isPast || !isWorkDay;
                  return (
                    <TouchableOpacity
                      key={ci}
                      disabled={disabled}
                      onPress={() => setSelectedDate({ fullDate: cell.fullDate, dayName: cell.dayName })}
                      activeOpacity={0.75}
                      style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 9, marginHorizontal: 1, borderRadius: 12, backgroundColor: isSelected ? "#3D5AFE" : isToday ? "#EEF1FF" : "transparent" }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: isSelected || isToday ? "700" : "500", color: isSelected ? "#fff" : isToday ? "#3D5AFE" : disabled ? "#D0D5E8" : "#1A1A2E" }}>
                        {cell.day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ));
          })()}

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14, gap: 8, backgroundColor: "#EEF1FF", borderRadius: 12, padding: 11 }}>
            <Ionicons name="calendar-sharp" size={15} color="#3D5AFE" />
            <Text style={{ fontSize: 13, color: "#3D5AFE", fontWeight: "600" }}>{selectedDate.dayName}, {selectedDate.fullDate}</Text>
          </View>
        </View>

        {/* Patient Details */}
        <View style={C.card}>
          <CardTitle icon="person-outline" title="Patient Details" />

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
            {(["self", "other"] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setBookingFor(opt)}
                style={{ flex: 1, paddingVertical: 11, borderRadius: 14, alignItems: "center", backgroundColor: bookingFor === opt ? "#3D5AFE" : "#F0F3FF" }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: bookingFor === opt ? "#fff" : "#9EA3B8" }}>
                  {opt === "self" ? "👤 Yourself" : "👥 Another"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {bookingFor === "other" && (
            <>
              <FormField label="FULL NAME" placeholder="Jane Doe" value={patientFullName} onChangeText={setPatientFullName} />
              <FormField label="AGE" placeholder="30" value={patientAge} onChangeText={setPatientAge} keyboardType="numeric" />
            </>
          )}

          <Text style={C.fieldLabel}>GENDER</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            {(["Male", "Female", "Other"] as const).map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setPatientGender(g)}
                style={{ flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: "center", backgroundColor: patientGender === g ? "#3D5AFE" : "#F0F3FF" }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: patientGender === g ? "#fff" : "#6B7189" }}>
                  {g === "Male" ? "♂ Male" : g === "Female" ? "♀ Female" : "Other"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={C.fieldLabel}>DESCRIBE PROBLEM</Text>
          <TextInput
            value={problem}
            onChangeText={setProblem}
            placeholder="Describe your symptoms or reason for visit..."
            placeholderTextColor="#C0C8D8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ backgroundColor: "#F5F7FF", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: "#1A1A2E", minHeight: 100, borderWidth: 1.5, borderColor: problem ? "#3D5AFE" : "transparent" }}
          />
        </View>

        {/* Time Slots */}
        <View style={C.card}>
          <CardTitle icon="time-outline" title="Available Time Slots" />
          {slotsLoading ? (
            <ActivityIndicator color="#3D5AFE" style={{ marginVertical: 16 }} />
          ) : slots.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 24, backgroundColor: "#F5F7FF", borderRadius: 14 }}>
              <Ionicons name="calendar-outline" size={38} color="#C0C8FF" />
              <Text style={{ fontSize: 13.5, color: "#9EA3B8", marginTop: 8 }}>No slots available for this day</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => setSelectedSlot(isSelected ? null : slot)}
                    style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: isSelected ? "#3D5AFE" : "#F0F3FF", flexDirection: "row", alignItems: "center", gap: 5 }}
                  >
                    <Ionicons name="time-outline" size={13} color={isSelected ? "#fff" : "#3D5AFE"} />
                    <Text style={{ fontSize: 13.5, fontWeight: "700", color: isSelected ? "#fff" : "#3D5AFE" }}>{slot}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>

      {/* ── Book Button ── */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 30 : 16, shadowColor: "#3D5AFE", shadowOpacity: 0.1, shadowRadius: 16, elevation: 10 }}>
        <TouchableOpacity
          disabled={!selectedSlot}
          onPress={() => setShowConfirm(true)}
          style={{ borderRadius: 18, overflow: "hidden" }}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={selectedSlot ? ["#3D5AFE", "#6979F8"] : ["#D0D5E8", "#D0D5E8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
          >
            <Ionicons name="calendar-sharp" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
              {selectedSlot ? `Book Appointment · ${selectedSlot}` : "Select a Time Slot First"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Confirm Modal ── */}
      <Modal transparent visible={showConfirm} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 36 : 24, paddingHorizontal: 24 }}>
            <View style={{ width: 40, height: 4, backgroundColor: "#E0E4F4", borderRadius: 2, alignSelf: "center", marginBottom: 20 }} />

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => setShowConfirm(false)}
                style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#F0F3FF", alignItems: "center", justifyContent: "center" }}
              >
                <Ionicons name="chevron-down" size={20} color="#3D5AFE" />
              </TouchableOpacity>
              <Text style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: "800", color: "#1A1A2E" }}>Confirm Booking</Text>
              <View style={{ width: 34 }} />
            </View>

            {/* Doctor strip */}
            <LinearGradient
              colors={["#3D5AFE", "#6979F8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 }}
            >
              <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.22)", overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
                {doctor.photo ? (
                  <Image source={{ uri: doctor.photo }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                ) : (
                  <Ionicons name="person-circle-outline" size={38} color="rgba(255,255,255,0.85)" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}>{displayName}</Text>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{doctor.specialty}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}>{doctor.consultationFee ? `$${doctor.consultationFee}` : "Free"}</Text>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>fee</Text>
              </View>
            </LinearGradient>

            {/* Date / Time pills */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F0F3FF", borderRadius: 14, padding: 11 }}>
                <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: "#3D5AFE", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="calendar-sharp" size={15} color="#fff" />
                </View>
                <View>
                  <Text style={{ fontSize: 10, color: "#9EA3B8", fontWeight: "600" }}>DATE</Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1A2E" }}>{selectedDate.fullDate}</Text>
                </View>
              </View>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F0F3FF", borderRadius: 14, padding: 11 }}>
                <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: "#3D5AFE", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="time-sharp" size={15} color="#fff" />
                </View>
                <View>
                  <Text style={{ fontSize: 10, color: "#9EA3B8", fontWeight: "600" }}>TIME</Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#1A1A2E" }}>{selectedSlot}</Text>
                </View>
              </View>
            </View>

            {/* Patient summary */}
            <View style={{ backgroundColor: "#F8F9FF", borderRadius: 16, padding: 14, marginBottom: 18 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#9EA3B8", marginBottom: 10, letterSpacing: 0.5 }}>PATIENT INFO</Text>
              <InfoRow label="Booking For" value={bookingFor === "other" ? "Another Person" : "Yourself"} />
              {bookingFor === "other" && patientFullName ? <InfoRow label="Full Name" value={patientFullName} /> : null}
              {bookingFor === "other" && patientAge ? <InfoRow label="Age" value={patientAge} /> : null}
              <InfoRow label="Gender" value={patientGender} />
              {doctor.consultationFee ? <InfoRow label="Consultation Fee" value={`$${doctor.consultationFee}`} /> : null}
              {problem ? <InfoRow label="Problem" value={problem.length > 40 ? problem.slice(0, 40) + "…" : problem} /> : null}
            </View>

            <TouchableOpacity
              onPress={() => {
                setShowConfirm(false);
                router.push({
                  pathname: "/booking-payment",
                  params: {
                    doctorId:        String(doctor.id),
                    doctorName:      displayName,
                    specialty:       doctor.specialty,
                    photo:           doctor.photo || "",
                    consultationFee: String(doctor.consultationFee || 0),
                    slotDuration:    String(doctor.availability?.slotDurationMinutes || 30),
                    date:            selectedDate.fullDate,
                    time:            selectedSlot || "",
                    dayName:         selectedDate.dayName,
                    bookingFor,
                    patientFullName,
                    patientAge,
                    patientGender,
                    problem,
                    notes: [
                      bookingFor === "other" ? "Booking For: Another Person" : "Booking For: Yourself",
                      bookingFor === "other" && patientFullName ? `Name: ${patientFullName}` : "",
                      bookingFor === "other" && patientAge ? `Age: ${patientAge}` : "",
                      `Gender: ${patientGender}`,
                      problem ? `Problem: ${problem}` : "",
                    ].filter(Boolean).join(" | "),
                  },
                });
              }}
              disabled={bookingLoading}
              style={{ borderRadius: 18, overflow: "hidden" }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#3D5AFE", "#6979F8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
              >
                {bookingLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>Proceed to Payment</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const C = {
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#3D5AFE",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  } as const,
  fieldLabel: {
    fontSize: 11.5,
    color: "#9EA3B8",
    fontWeight: "700" as const,
    marginBottom: 8,
    letterSpacing: 0.4,
  },
};

function CardTitle({ icon, title }: { icon: any; title: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#EEF1FF", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={17} color="#3D5AFE" />
      </View>
      <Text style={{ fontSize: 15, fontWeight: "800", color: "#1A1A2E" }}>{title}</Text>
    </View>
  );
}

function FormField({ label, placeholder, value, onChangeText, keyboardType }: { label: string; placeholder: string; value: string; onChangeText: (t: string) => void; keyboardType?: any }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={C.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#C0C8D8"
        keyboardType={keyboardType}
        style={{ backgroundColor: "#F5F7FF", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 14, color: "#1A1A2E", borderWidth: 1.5, borderColor: value ? "#3D5AFE" : "transparent" }}
      />
    </View>
  );
}
