import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useTheme from "@/hooks/use-theme";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

type NotifType = "appointment" | "reminder" | "payment" | "message" | "promo" | "system" | "result" | "prescription";

interface Notification {
  id: number;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  group: "Today" | "Yesterday" | "Earlier";
}

const INITIAL_NOTIFS: Notification[] = [
  // ── Today ──
  {
    id: 1,
    type: "payment",
    title: "Payment Successful ✅",
    body: "Your payment of $120.00 for the Cardiology consultation with Dr. Sarah Johnson has been received.",
    time: "2 min ago",
    read: false,
    group: "Today",
  },
  {
    id: 2,
    type: "appointment",
    title: "Appointment Completed",
    body: "Your consultation with Dr. Sarah Johnson is complete. We hope you feel better soon! 🩺",
    time: "35 min ago",
    read: false,
    group: "Today",
  },
  {
    id: 3,
    type: "result",
    title: "Lab Results Ready",
    body: "Your blood panel results from City Lab are ready. Tap to view your report.",
    time: "1 hr ago",
    read: false,
    group: "Today",
  },
  {
    id: 4,
    type: "prescription",
    title: "Prescription Issued",
    body: "Dr. Sarah Johnson has sent you a prescription for Amoxicillin 500mg. Pick it up at the pharmacy.",
    time: "1 hr ago",
    read: false,
    group: "Today",
  },
  {
    id: 5,
    type: "message",
    title: "Message from Doctor",
    body: "Dr. Sarah Johnson: \"Rest well and stay hydrated. Contact us if symptoms persist after 3 days.\"",
    time: "2 hrs ago",
    read: false,
    group: "Today",
  },
  {
    id: 6,
    type: "reminder",
    title: "Medication Reminder 💊",
    body: "Time to take Amoxicillin 500mg. Take with food and a full glass of water.",
    time: "4 hrs ago",
    read: true,
    group: "Today",
  },
  {
    id: 7,
    type: "appointment",
    title: "Appointment Confirmed",
    body: "Your follow-up with Dr. Sarah Johnson is set for Friday, March 6 at 11:00 AM.",
    time: "5 hrs ago",
    read: true,
    group: "Today",
  },
  // ── Yesterday ──
  {
    id: 8,
    type: "payment",
    title: "Refund Processed",
    body: "A refund of $30.00 for the cancelled Dermatology session has been credited to your card.",
    time: "Yesterday, 6:45 PM",
    read: true,
    group: "Yesterday",
  },
  {
    id: 9,
    type: "appointment",
    title: "Booking Cancelled",
    body: "Dr. Emily Clark cancelled your appointment due to an emergency. A refund has been initiated.",
    time: "Yesterday, 3:00 PM",
    read: true,
    group: "Yesterday",
  },
  {
    id: 10,
    type: "result",
    title: "Scan Report Available",
    body: "Your chest X-ray report from Metro Radiology is ready. Download it from the app.",
    time: "Yesterday, 1:30 PM",
    read: true,
    group: "Yesterday",
  },
  {
    id: 11,
    type: "promo",
    title: "Special Offer 🎉",
    body: "Get 20% off on your next dental checkup. Valid for 48 hours only!",
    time: "Yesterday, 10:00 AM",
    read: true,
    group: "Yesterday",
  },
  {
    id: 12,
    type: "system",
    title: "Profile Verified ✔",
    body: "Your identity and insurance details have been verified. You can now book premium specialists.",
    time: "Yesterday, 8:00 AM",
    read: true,
    group: "Yesterday",
  },
  // ── Earlier ──
  {
    id: 13,
    type: "appointment",
    title: "Appointment Completed",
    body: "Your Neurology session with Dr. Michael Chen is complete. Rate your experience!",
    time: "Mon, 5:00 PM",
    read: true,
    group: "Earlier",
  },
  {
    id: 14,
    type: "payment",
    title: "Invoice Ready",
    body: "Invoice #INV-2047 for $85.00 (Neurology consultation) is available. Tap to download.",
    time: "Mon, 5:02 PM",
    read: true,
    group: "Earlier",
  },
  {
    id: 15,
    type: "prescription",
    title: "Prescription Renewed",
    body: "Dr. Michael Chen renewed your prescription for Metformin 500mg for the next 3 months.",
    time: "Mon, 5:05 PM",
    read: true,
    group: "Earlier",
  },
  {
    id: 16,
    type: "reminder",
    title: "Follow-up Reminder",
    body: "Your follow-up with Dr. Michael Chen is in 2 days. Prepare your symptom notes.",
    time: "Sun, 9:00 AM",
    read: true,
    group: "Earlier",
  },
  {
    id: 17,
    type: "promo",
    title: "New Specialists Near You",
    body: "3 new Orthopedic specialists have joined in your area. Check availability and book today!",
    time: "Sat, 11:00 AM",
    read: true,
    group: "Earlier",
  },
];

const TYPE_META: Record<
  NotifType,
  { icon: any; bg: string; iconColor: string; darkBg: string }
> = {
  appointment: {
    icon: "calendar",
    bg: "#E8EDFF",
    iconColor: "#3D5AFE",
    darkBg: "#1e2a5e",
  },
  reminder: {
    icon: "alarm",
    bg: "#FFF3E0",
    iconColor: "#FF9500",
    darkBg: "#4a2e00",
  },
  payment: {
    icon: "card",
    bg: "#E8F5E9",
    iconColor: "#00C853",
    darkBg: "#003d1a",
  },
  message: {
    icon: "chatbubble-ellipses",
    bg: "#FCE4EC",
    iconColor: "#F44365",
    darkBg: "#4a0018",
  },
  promo: {
    icon: "gift",
    bg: "#F3E5FF",
    iconColor: "#9B59B6",
    darkBg: "#2d0045",
  },
  system: {
    icon: "shield-checkmark",
    bg: "#E0F7FA",
    iconColor: "#00BCD4",
    darkBg: "#003840",
  },
  result: {
    icon: "document-text",
    bg: "#E8F5E9",
    iconColor: "#2E7D32",
    darkBg: "#1a3a1a",
  },
  prescription: {
    icon: "medkit",
    bg: "#FFF8E1",
    iconColor: "#F9A825",
    darkBg: "#3a2a00",
  },
};

function NotifRow({
  item,
  isDark,
  onRead,
  onDelete,
}: {
  item: Notification;
  isDark: boolean;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const meta = TYPE_META[item.type];
  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#1A1A2E";
  const textSecondary = isDark ? "#9CA3AF" : "#9EA3B8";
  const unreadDot = "#3D5AFE";
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start(() => onDelete(item.id));
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateX: slideAnim }],
        opacity: opacityAnim,
        marginBottom: 10,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onRead(item.id)}
        style={{
          flexDirection: "row",
          backgroundColor: cardBg,
          borderRadius: 18,
          padding: 14,
          shadowColor: isDark ? "#000" : "#3D5AFE",
          shadowOpacity: isDark ? 0.3 : 0.07,
          shadowRadius: 12,
          elevation: 4,
          alignItems: "flex-start",
          borderWidth: item.read ? 0 : 1.5,
          borderColor: item.read ? "transparent" : "#3D5AFE33",
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 15,
            backgroundColor: isDark ? meta.darkBg : meta.bg,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 13,
            marginTop: 1,
          }}
        >
          <Ionicons name={meta.icon} size={22} color={meta.iconColor} />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
            <Text
              style={{
                flex: 1,
                fontSize: 14.5,
                fontWeight: item.read ? "600" : "800",
                color: textPrimary,
              }}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.read && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: unreadDot,
                  marginLeft: 6,
                }}
              />
            )}
          </View>
          <Text
            style={{ fontSize: 13, color: textSecondary, lineHeight: 18.5 }}
            numberOfLines={2}
          >
            {item.body}
          </Text>
          <Text style={{ fontSize: 11.5, color: meta.iconColor, marginTop: 6, fontWeight: "600" }}>
            {item.time}
          </Text>
        </View>

        {/* Delete */}
        <TouchableOpacity
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ marginLeft: 8, marginTop: 2 }}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={isDark ? "#374151" : "#E5E7EB"}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const screenBg = isDark ? "#0F172A" : "#F4F7FE";
  const textPrimary = isDark ? "#F9FAFB" : "#1A1A2E";
  const textSecondary = isDark ? "#9CA3AF" : "#9EA3B8";
  const groupLabelColor = isDark ? "#6B7280" : "#9EA3B8";

  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const deleteNotif = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const groups: Array<"Today" | "Yesterday" | "Earlier"> = [
    "Today",
    "Yesterday",
    "Earlier",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: screenBg }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={["#3D5AFE", "#6979F8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: STATUS_BAR_H + 14,
          paddingBottom: 24,
          paddingHorizontal: 20,
        }}
      >
        {/* Back + Title */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <Text
              style={{ color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: 0.2 }}
            >
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View
                style={{
                  backgroundColor: "#FF4D6D",
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 2,
                  marginTop: 4,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                  {unreadCount} new
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={markAllRead}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="checkmark-done" size={21} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 20,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: 14,
            gap: 0,
          }}
        >
          {[
            { label: "Total", value: notifications.length, icon: "notifications" },
            { label: "Unread", value: unreadCount, icon: "ellipse" },
            { label: "Read", value: notifications.length - unreadCount, icon: "checkmark-circle" },
          ].map((stat, i) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                alignItems: "center",
                borderRightWidth: i < 2 ? 1 : 0,
                borderRightColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Ionicons name={stat.icon as any} size={18} color="rgba(255,255,255,0.85)" />
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 3 }}>
                {stat.value}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* ── List ── */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          /* Empty State */
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 28,
                backgroundColor: isDark ? "#1F2937" : "#EEF1FF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <Ionicons name="notifications-off-outline" size={44} color="#3D5AFE" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: textPrimary, marginBottom: 6 }}>
              All caught up!
            </Text>
            <Text style={{ fontSize: 14, color: textSecondary, textAlign: "center", lineHeight: 20 }}>
              No notifications here.{"\n"}Check back later.
            </Text>
          </View>
        ) : (
          <>
            {/* Clear All */}
            <TouchableOpacity
              onPress={clearAll}
              style={{
                alignSelf: "flex-end",
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 14,
                backgroundColor: isDark ? "#1F2937" : "#FFE5EA",
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                gap: 4,
              }}
            >
              <Ionicons name="trash-outline" size={14} color="#FF4D6D" />
              <Text style={{ color: "#FF4D6D", fontSize: 12, fontWeight: "700" }}>
                Clear All
              </Text>
            </TouchableOpacity>

            {groups.map((group) => {
              const items = notifications.filter((n) => n.group === group);
              if (items.length === 0) return null;
              return (
                <View key={group}>
                  {/* Group Label */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 10,
                      marginTop: 4,
                    }}
                  >
                    <View
                      style={{
                        height: 1,
                        flex: 1,
                        backgroundColor: isDark ? "#1F2937" : "#E5E7EB",
                      }}
                    />
                    <Text
                      style={{
                        marginHorizontal: 10,
                        fontSize: 12,
                        fontWeight: "700",
                        color: groupLabelColor,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {group}
                    </Text>
                    <View
                      style={{
                        height: 1,
                        flex: 1,
                        backgroundColor: isDark ? "#1F2937" : "#E5E7EB",
                      }}
                    />
                  </View>

                  {items.map((n) => (
                    <NotifRow
                      key={n.id}
                      item={n}
                      isDark={isDark}
                      onRead={markRead}
                      onDelete={deleteNotif}
                    />
                  ))}

                  <View style={{ height: 6 }} />
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}
