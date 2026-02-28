import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { USER_KEY } from "../constant/api";


const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

const PAYMENT_KEY_PREFIX = "user_payment_methods";

const APPOINTMENTS_KEY = "appointments";

const getPaymentKey = async () => {
  const userRaw = await AsyncStorage.getItem(USER_KEY);
  if (!userRaw) return null;
  const user = JSON.parse(userRaw);
  return `${PAYMENT_KEY_PREFIX}_${String(user.id)}`;
};

type PaymentMethod = {
  id: string;
  type: "card" | "bank";
  cardName?: string;
  cardNumber?: string;
  expiryDate?: string;
  isDefault: boolean;
};

// Returns true if card is past its expiry month
const isCardExpired = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  const [mm, yy] = expiryDate.split("/");
  if (!mm || !yy) return false;
  const month = parseInt(mm, 10);
  const year = 2000 + parseInt(yy, 10);
  if (isNaN(month) || isNaN(year)) return false;
  // Card is valid through the last day of the expiry month
  // so expiry passes when first day of the NEXT month arrives
  const now = new Date();
  const expiryEnd = new Date(year, month, 1); // month is 1-based → day 1 of next month
  return expiryEnd <= now;
};

const EXTRA_METHODS = [
  { id: "apple", label: "Apple Pay",  icon: "logo-apple" as const },
  { id: "paypal", label: "Paypal",    icon: "logo-paypal" as const },
  { id: "google", label: "Google Pay", icon: "logo-google" as const },
];

export default function BookingPaymentScreen() {
  const params = useLocalSearchParams<{
    doctorId: string;
    doctorName: string;
    specialty: string;
    photo: string;
    consultationFee: string;
    slotDuration: string;
    date: string;
    time: string;
    dayName: string;
    bookingFor: string;
    patientFullName: string;
    patientAge: string;
    patientGender: string;
    problem: string;
    notes: string;
  }>();

  const fee = parseFloat(params.consultationFee || "0");
  const duration = params.slotDuration || "30";

  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("add_card");
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const paymentKey = await getPaymentKey();
      if (!paymentKey) {
        setCards([]);
        return;
      }

      const raw = await AsyncStorage.getItem(paymentKey);
      if (raw) {
        const all: PaymentMethod[] = JSON.parse(raw);
        setCards(all.filter((p) => p.type === "card"));
        const def = all.find((p) => p.isDefault);
        if (def) setSelectedMethod(def.id);
        else if (all.length > 0) setSelectedMethod(all[0].id);
      } else {
        setCards([]);
      }
    } catch {}
  };

  const selectedCard = cards.find((c) => c.id === selectedMethod);
  const selectedExtra = EXTRA_METHODS.find((m) => m.id === selectedMethod);

  const methodLabel = selectedCard
    ? `**** ${selectedCard.cardNumber?.slice(-4) || "****"}`
    : selectedExtra
    ? selectedExtra.label
    : "Add Card";

  const goToSuccess = () => {
    router.replace({
      pathname: "/booking-success",
      params: {
        doctorName: params.doctorName,
        specialty: params.specialty,
        date: params.date,
        time: params.time,
      },
    });
  };

  const handlePay = async () => {
    // Block payment if an expired card is selected
    if (selectedCard && isCardExpired(selectedCard.expiryDate)) {
      Alert.alert(
        "Card Expired",
        `The card ending in ${selectedCard.cardNumber?.slice(-4)} expired on ${selectedCard.expiryDate}. Please select a different payment method.`
      );
      return;
    }
    setLoading(true);
    try {
      const userRaw = await AsyncStorage.getItem(USER_KEY);
      if (!userRaw) {
        Alert.alert("Login Required", "Please sign in to book.");
        setLoading(false);
        return;
      }
      const user = JSON.parse(userRaw);

      const raw = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      const all: any[] = raw ? JSON.parse(raw) : [];

      const isActiveStatus = (status: unknown) => {
        return status === "pending" || status === "approved" || status === "confirmed";
      };

      const currentUserId = String(user.id);
      const doctorId = Number(params.doctorId);
      const date = params.date;
      const startTime = params.time;

      const hasSameBooking = all.some((item) => {
        const itemUserId = String(item.userId ?? item.patientId ?? "");
        return (
          itemUserId === currentUserId &&
          Number(item.doctorId) === doctorId &&
          item.date === date &&
          item.startTime === startTime &&
          isActiveStatus(item.status)
        );
      });

      if (hasSameBooking) {
        Alert.alert("Already Booked", "You already have this appointment.");
        setLoading(false);
        return;
      }

      const slotTaken = all.some((item) => {
        return (
          Number(item.doctorId) === doctorId &&
          item.date === date &&
          item.startTime === startTime &&
          isActiveStatus(item.status)
        );
      });

      if (slotTaken) {
        Alert.alert("Slot Unavailable", "This time slot was just booked. Please choose another time.");
        setLoading(false);
        router.back();
        return;
      }

      const parseTimeToMinutes = (time: string) => {
        const [hours, minutes] = (time || "").split(":").map((v) => parseInt(v, 10));
        if (isNaN(hours) || isNaN(minutes)) return null;
        return hours * 60 + minutes;
      };

      const formatMinutesToTime = (total: number) => {
        const hours = Math.floor(total / 60);
        const minutes = total % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      };

      const startMinutes = parseTimeToMinutes(params.time || "");
      const durationMinutes = parseInt(params.slotDuration || "30", 10);
      const endTime =
        startMinutes === null || isNaN(durationMinutes)
          ? params.time
          : formatMinutesToTime(startMinutes + durationMinutes);

      const newAppointment = {
        id: Date.now().toString(),
        userId: currentUserId,
        patientId: currentUserId,
        doctorId,
        doctorName: params.doctorName,
        doctorSpecialty: params.specialty,
        specialty: params.specialty,
        photo: params.photo,
        date,
        startTime,
        endTime,
        duration: params.slotDuration,
        fee: fee,
        bookingFor: params.bookingFor,
        patientFullName: params.patientFullName,
        patientAge: params.patientAge,
        patientGender: params.patientGender,
        problem: params.problem,
        notes: params.notes,
        status: "approved",
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify([...all, newAppointment]));
      goToSuccess();
    } catch {
      goToSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={p.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Gradient header */}
      <LinearGradient
        colors={["#3D5AFE", "#6979F8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[p.header, { paddingTop: STATUS_BAR_H + 10 }]}
      >
        <View style={p.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={p.headerTitle}>Payment</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={p.amountLabel}>Total Amount</Text>
        <Text style={p.amountValue}>$ {fee.toFixed(2)}</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        style={p.scrollCard}
      >
        <View style={p.scrollInner}>

          {/* Doctor card */}
          <View style={p.doctorCard}>
            <View style={p.doctorPhoto}>
              {params.photo ? (
                <Image source={{ uri: params.photo }} style={p.doctorPhotoImg} resizeMode="cover" />
              ) : (
                <View style={p.doctorPhotoFallback}>
                  <Ionicons name="person-circle-outline" size={40} color="#3D5AFE" />
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={p.doctorName}>{params.doctorName}</Text>
              <Text style={p.doctorSpecialty}>{params.specialty}</Text>
              <View style={p.doctorBadgeRow}>
                <View style={p.badgePill}>
                  <Ionicons name="star" size={11} color="#FFB800" />
                  <Text style={p.badgeText}>5</Text>
                </View>
                <View style={p.badgePill}>
                  <Ionicons name="chatbubble-ellipses-outline" size={11} color="#3D5AFE" />
                  <Text style={p.badgeText}>60</Text>
                </View>
              </View>
            </View>
            <View style={p.ribbonBadge}>
              <Ionicons name="ribbon-outline" size={18} color="#3D5AFE" />
            </View>
          </View>

          {/* Appointment summary */}
          <View style={[p.section, p.sectionBorder]}>
            <View style={p.row}>
              <Text style={p.rowLabel}>Date / Hour</Text>
              <Text style={p.rowValue}>{params.date}  {params.time}</Text>
            </View>
            <View style={p.row}>
              <Text style={p.rowLabel}>Duration</Text>
              <Text style={p.rowValue}>{duration} Minutes</Text>
            </View>
            <View style={p.row}>
              <Text style={p.rowLabel}>Booking for</Text>
              <Text style={p.rowValue}>
                {params.bookingFor === "other" ? "Another Person" : "Yourself"}
              </Text>
            </View>
          </View>

          {/* Bill breakdown */}
          <View style={[p.section, p.sectionBorder]}>
            <View style={p.row}>
              <Text style={p.rowLabel}>Amount</Text>
              <Text style={p.rowValue}>${fee.toFixed(2)}</Text>
            </View>
            <View style={p.row}>
              <Text style={p.rowLabel}>Duration</Text>
              <Text style={p.rowValue}>{duration} Minutes</Text>
            </View>
            <View style={[p.row, p.totalRow]}>
              <Text style={p.totalLabel}>Total</Text>
              <Text style={p.totalLabel}>${fee.toFixed(2)}</Text>
            </View>
          </View>

          {/* Payment method row */}
          <View style={p.row}>
            <Text style={p.rowLabel}>Payment Method</Text>
            <View style={p.methodRight}>
              <Text style={p.rowValue}>{methodLabel}</Text>
              <TouchableOpacity onPress={() => setShowMethodModal(true)}>
                <Text style={p.changeBtn}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Pay Now button */}
      <View style={[p.payBtnWrap, { paddingBottom: Platform.OS === "ios" ? 36 : 20 }]}>
        <TouchableOpacity onPress={handlePay} disabled={loading} style={p.payBtn}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={p.payBtnText}>Pay Now</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Payment method picker modal */}
      <Modal
        visible={showMethodModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMethodModal(false)}
      >
        <View style={p.modalOverlay}>
          <View style={p.modalSheet}>
            <View style={p.modalHeader}>
              <Text style={p.modalTitle}>Payment Method</Text>
              <TouchableOpacity onPress={() => setShowMethodModal(false)}>
                <Ionicons name="close" size={24} color="#3D5AFE" />
              </TouchableOpacity>
            </View>

            <Text style={p.modalSection}>Credit & Debit Card</Text>

            {cards.map((card) => {
              const expired = isCardExpired(card.expiryDate);
              return (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => {
                    if (expired) {
                      Alert.alert("Card Expired", `This card expired on ${card.expiryDate} and cannot be used.`);
                      return;
                    }
                    setSelectedMethod(card.id);
                    setShowMethodModal(false);
                  }}
                  style={[p.methodRow, { backgroundColor: expired ? "#FFF5F5" : "#F4F5FF", opacity: expired ? 0.85 : 1 }]}
                >
                  <Ionicons name="card-outline" size={22} color={expired ? "#FF4D6D" : "#3D5AFE"} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[p.methodRowText, { color: expired ? "#FF4D6D" : "#3D5AFE" }]}>
                      **** {card.cardNumber?.slice(-4)} — {card.cardName}
                    </Text>
                    {expired && (
                      <Text style={p.expiredSub}>Expired {card.expiryDate}</Text>
                    )}
                  </View>
                  {expired ? (
                    <View style={p.expiredBadge}>
                      <Text style={p.expiredBadgeText}>EXPIRED</Text>
                    </View>
                  ) : (
                    <View style={[p.radio, {
                      borderColor: selectedMethod === card.id ? "#3D5AFE" : "#C0C8E0",
                      backgroundColor: selectedMethod === card.id ? "#3D5AFE" : "transparent",
                    }]} />
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={() => { setShowMethodModal(false); router.push("/add-card"); }}
              style={[p.methodRow, { backgroundColor: "#F4F5FF", marginBottom: 20 }]}
            >
              <Ionicons name="card-outline" size={22} color="#3D5AFE" />
              <Text style={[p.methodRowText, { flex: 1, marginLeft: 12 }]}>Add New Card</Text>
              <View style={[p.radio, { borderColor: "#3D5AFE" }]}>
                <View style={p.radioDot} />
              </View>
            </TouchableOpacity>

            <Text style={p.modalSection}>More Payment Option</Text>
            {EXTRA_METHODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => { setSelectedMethod(m.id); setShowMethodModal(false); }}
                style={[p.methodRow, { backgroundColor: "#F4F5FF" }]}
              >
                <Ionicons name={m.icon} size={22} color="#3D5AFE" />
                <Text style={[p.methodRowText, { flex: 1, marginLeft: 12 }]}>{m.label}</Text>
                <View style={[p.radio, { borderColor: selectedMethod === m.id ? "#3D5AFE" : "#C0C8E0" }]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const p = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 24, paddingBottom: 40 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700", color: "#fff" },
  amountLabel: { textAlign: "center", color: "rgba(255,255,255,0.8)", fontSize: 14 },
  amountValue: { textAlign: "center", color: "#fff", fontSize: 42, fontWeight: "800", marginTop: 4 },
  scrollCard: { marginTop: -20, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: "#fff" },
  scrollInner: { paddingHorizontal: 24, paddingTop: 24 },
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  doctorPhoto: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#E0E5FF", overflow: "hidden", marginRight: 16 },
  doctorPhotoImg: { width: 60, height: 60 },
  doctorPhotoFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  doctorName: { fontSize: 15, fontWeight: "700", color: "#1A1A2E" },
  doctorSpecialty: { fontSize: 12, color: "#3D5AFE", marginTop: 2 },
  doctorBadgeRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  badgePill: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, gap: 4 },
  badgeText: { fontSize: 11, color: "#555" },
  ribbonBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#E8ECFF", alignItems: "center", justifyContent: "center" },
  section: { marginBottom: 24, paddingBottom: 24, gap: 16 },
  sectionBorder: { borderBottomWidth: 1, borderBottomColor: "#F0F0F5" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { fontSize: 13, color: "#3D5AFE", fontWeight: "500" },
  rowValue: { fontSize: 13, fontWeight: "600", color: "#1A1A2E" },
  totalRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F0F0F5" },
  totalLabel: { fontSize: 14, fontWeight: "800", color: "#1A1A2E" },
  methodRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  changeBtn: { fontSize: 13, color: "#3D5AFE", fontWeight: "700" },
  payBtnWrap: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 12, backgroundColor: "#fff" },
  payBtn: { backgroundColor: "#3D5AFE", borderRadius: 999, height: 54, justifyContent: "center", alignItems: "center" },
  payBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#3D5AFE" },
  modalSection: { fontSize: 14, fontWeight: "700", color: "#1A1A2E", marginBottom: 12 },
  methodRow: { flexDirection: "row", alignItems: "center", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 12 },
  methodRowText: { fontSize: 14, fontWeight: "500", color: "#3D5AFE" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#3D5AFE" },
  expiredSub: { fontSize: 11, color: "#FF4D6D", fontWeight: "600", marginTop: 2 },
  expiredBadge: { backgroundColor: "#FF4D6D", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  expiredBadgeText: { fontSize: 10, color: "#fff", fontWeight: "700" },
});
