import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
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
import { USER_KEY } from "../../constant/api";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const APPOINTMENTS_KEY = "appointments";

type Appointment = {
  id: string;
  userId: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "approved" | "cancelled";
  notes?: string;
  cancelReason?: string;
};

const parseTimeToMinutes = (time: string) => {
  const [hours, minutes] = (time || "").split(":").map((value) => parseInt(value, 10));
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const formatMinutesToTime = (total: number) => {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const normalizeStatus = (status: unknown): Appointment["status"] => {
  if (status === "approved" || status === "pending" || status === "cancelled") return status;
  if (status === "confirmed") return "approved";
  return "pending";
};

const normalizeAppointment = (raw: any): Appointment => {
  const startTime = raw.startTime || "";
  const durationMinutes = parseInt(raw.duration || "30", 10);
  const startMinutes = parseTimeToMinutes(startTime);
  const computedEndTime =
    startMinutes === null || isNaN(durationMinutes)
      ? ""
      : formatMinutesToTime(startMinutes + durationMinutes);

  return {
    id: String(raw.id),
    userId: String(raw.userId ?? raw.patientId ?? ""),
    doctorId: Number(raw.doctorId ?? 0),
    doctorName: raw.doctorName || "Unknown",
    doctorSpecialty: raw.doctorSpecialty || raw.specialty || "General",
    date: raw.date || "",
    startTime,
    endTime: raw.endTime || computedEndTime,
    status: normalizeStatus(raw.status),
    notes: raw.notes,
    cancelReason: raw.cancelReason,
  };
};

const STATUS_CONFIG = {
  pending:   { label: "Pending",   bg: "#FFF8E8", text: "#F59E0B", icon: "time-outline" as const },
  approved:  { label: "Confirmed", bg: "#E8FFF3", text: "#10B981", icon: "checkmark-circle-outline" as const },
  cancelled: { label: "Cancelled", bg: "#FFE8EC", text: "#EF4444", icon: "close-circle-outline" as const },
};

const FILTERS = ["All", "Pending", "Confirmed", "Cancelled"] as const;
type Filter = typeof FILTERS[number];

const filterToStatus: Record<Filter, string | null> = {
  All:       null,
  Pending:   "pending",
  Confirmed: "approved",
  Cancelled: "cancelled",
};

export default function CalendarScreen() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const screenBg = isDark ? "#0F172A" : "#F5F7FF";
  const headerBg = isDark ? "#111827" : "#FFFFFF";
  const headerBorder = isDark ? "#1F2937" : "#F0F0F5";
  const titleColor = isDark ? "#F9FAFB" : "#1A1A2E";
  const subtitleColor = isDark ? "#9CA3AF" : "#8A8A9B";
  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const cardShadow = isDark ? "#000000" : "#000";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadAppointments = useCallback(async (filter: Filter = activeFilter) => {
    try {
      const userRaw = await AsyncStorage.getItem(USER_KEY);
      if (!userRaw) { router.replace("/signin"); return; }
      const user = JSON.parse(userRaw);
      const uid: string = user.id;
      setCurrentUserId(uid);

      const raw = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      const allRaw: any[] = raw ? JSON.parse(raw) : [];
      const all: Appointment[] = allRaw.map(normalizeAppointment);

      const mine = all.filter((a) => a.userId === uid);
      const status = filterToStatus[filter];
      setAppointments(status ? mine.filter((a) => a.status === status) : mine);
    } catch {
      // silently fail
    } finally {
      setRefreshing(false);
    }
  }, [activeFilter]);

  useEffect(() => { loadAppointments(); }, []);

  const onFilterChange = (f: Filter) => {
    setActiveFilter(f);
    loadAppointments(f);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const handleCancel = async (id: string) => {
    try {
      const raw = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      const all: Appointment[] = raw ? JSON.parse(raw) : [];
      const updated = all.map((a) =>
        String(a.id) === id ? { ...a, status: "cancelled" as const } : a
      );
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
      loadAppointments();
    } catch {}
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
          <Text className="text-[22px] font-bold" style={{ color: titleColor }}>Appointments</Text>
        </View>
        <Text className="text-[13px] mt-0.5 pl-12" style={{ color: subtitleColor }}>
          Your bookings
        </Text>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => onFilterChange(f)}
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor: activeFilter === f ? "#3D5AFE" : "#F0F3FF",
                borderWidth: 1.5,
                borderColor: activeFilter === f ? "#3D5AFE" : "#E8ECFF",
              }}
            >
              <Text
                className="text-[13px] font-semibold"
                style={{ color: activeFilter === f ? "#fff" : "#8A8A9B" }}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
          className="flex-1 px-5 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3D5AFE" />
          }
        >
          {appointments.length === 0 ? (
            <View className="items-center mt-20">
              <Ionicons name="calendar-outline" size={64} color="#C0C8FF" />
              <Text className="text-[16px] font-semibold text-[#1A1A2E] mt-4">
                No appointments
              </Text>
              <Text className="text-[13px] text-[#8A8A9B] mt-1">
                {activeFilter === "All" ? "You have no appointments yet." : `No ${activeFilter.toLowerCase()} appointments.`}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/home" as any)}
                className="bg-[#3D5AFE] rounded-full px-6 py-3 mt-6"
              >
                <Text className="text-white font-bold text-[14px]">Find a Doctor</Text>
              </TouchableOpacity>
            </View>
          ) : (
            appointments.map((apt) => {
              const cfg = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG.pending;
              // const doctorDisplayName = `Dr. ${apt.doctorName}`;
              const doctorDisplayName = `${apt.doctorName}`;


              return (
                <View
                  key={apt.id}
                  className="rounded-3xl p-4 mb-3"
                  style={{
                    backgroundColor: cardBg,
                    shadowColor: cardShadow,
                    shadowOpacity: isDark ? 0.2 : 0.06,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  {/* Status badge */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View
                      className="flex-row items-center px-3 py-1 rounded-full"
                      style={{ backgroundColor: cfg.bg }}
                    >
                      <Ionicons name={cfg.icon} size={13} color={cfg.text} />
                      <Text
                        className="text-[12px] font-semibold ml-1"
                        style={{ color: cfg.text }}
                      >
                        {cfg.label}
                      </Text>
                    </View>
                    <Text className="text-[12px]" style={{ color: subtitleColor }}>
                      {apt.date}
                    </Text>
                  </View>

                  {/* Main info */}
                  <View className="flex-row items-center">
                    <View className="w-11 h-11 rounded-2xl bg-[#F0F3FF] items-center justify-center mr-3">
                      <Ionicons name="person-circle-outline" size={28} color="#3D5AFE" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[14px] font-bold" style={{ color: titleColor }}>
                        {doctorDisplayName}
                      </Text>
                      <Text className="text-[12px] text-[#3D5AFE] font-medium">
                        {apt.doctorSpecialty}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[15px] font-bold" style={{ color: titleColor }}>
                        {apt.startTime}
                      </Text>
                      <Text className="text-[11px]" style={{ color: subtitleColor }}>
                        – {apt.endTime}
                      </Text>
                    </View>
                  </View>

                  {apt.notes ? (
                    <Text className="text-[12px] mt-2 pl-1" style={{ color: subtitleColor }}>
                      📝 {apt.notes}
                    </Text>
                  ) : null}

                  {apt.cancelReason ? (
                    <Text className="text-[12px] text-red-400 mt-1 pl-1">
                      ✖ {apt.cancelReason}
                    </Text>
                  ) : null}

                  {/* Cancel button — active appointments */}
                  {apt.status !== "cancelled" && (
                    <TouchableOpacity
                      onPress={() => handleCancel(apt.id)}
                      className="mt-3 border border-red-200 rounded-xl py-2 items-center"
                    >
                      <Text className="text-[13px] text-red-400 font-semibold">
                        Cancel Appointment
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
          <View className="h-28" />
        </ScrollView>

      <BottomTabBar activeTab="calendar" />
    </View>
  );
}
