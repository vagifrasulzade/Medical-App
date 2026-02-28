import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { USER_KEY } from "../constant/api";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;
const PAYMENT_KEY_PREFIX = "user_payment_methods";

const getPaymentKey = async () => {
  const userRaw = await AsyncStorage.getItem(USER_KEY);
  if (!userRaw) return null;
  const user = JSON.parse(userRaw);
  return `${PAYMENT_KEY_PREFIX}_${String(user.id)}`;
};

export default function AddCardScreen() {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const isValidCardNumber = (num: string) =>
    num.replace(/\s/g, "").length === 16;

  const isValidExpiry = (exp: string) => {
    const parts = exp.split("/");
    if (parts.length !== 2 || parts[1].length < 2) return false;
    const month = parseInt(parts[0], 10);
    const year = parseInt("20" + parts[1], 10);
    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) return false;
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth() + 1;
    if (year < nowYear) return false;
    if (year === nowYear && month < nowMonth) return false;
    return true;
  };

  const isValidCvv = (c: string) => c.length >= 3 && c.length <= 4;

  const handleSave = async () => {
    const newErrors = { cardName: "", cardNumber: "", expiry: "", cvv: "" };
    let valid = true;

    if (!cardName.trim()) {
      newErrors.cardName = "Card holder name is required";
      valid = false;
    }
    if (!isValidCardNumber(cardNumber)) {
      newErrors.cardNumber = "Enter a valid 16-digit card number";
      valid = false;
    }
    if (!isValidExpiry(expiry)) {
      newErrors.expiry = "Enter a valid non-expired date (MM/YY)";
      valid = false;
    }
    if (!isValidCvv(cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    try {
      const paymentKey = await getPaymentKey();
      if (!paymentKey) {
        router.replace("/signin");
        return;
      }

      const raw = await AsyncStorage.getItem(paymentKey);
      const existing = raw ? JSON.parse(raw) : [];
      const newCard = {
        id: Date.now().toString(),
        type: "card",
        cardName,
        cardNumber: cardNumber.replace(/\s/g, ""),
        expiryDate: expiry,
        cvv,
        isDefault: existing.length === 0,
      };
      await AsyncStorage.setItem(paymentKey, JSON.stringify([...existing, newCard]));
      router.back();
    } catch {}
  };

  const displayNumber = cardNumber || "000 000 000 00";
  const displayName = cardName || "John Doe";
  const displayExpiry = expiry || "04/28";

  return (
    <View className="flex-1 bg-white">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View
        className="px-6 flex-row items-center"
        style={{ paddingTop: STATUS_BAR_H + 12, paddingBottom: 16 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#3D5AFE" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[20px] font-bold text-[#3D5AFE]">Add Card</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Card visual */}
      <View className="mx-6 rounded-3xl overflow-hidden mb-8"
        style={{ height: 180, backgroundColor: "#3D5AFE" }}
      >
        {/* Glossy blobs */}
        <View
          className="absolute"
          style={{
            width: 200, height: 200, borderRadius: 100,
            backgroundColor: "rgba(255,255,255,0.10)",
            top: -60, right: -40,
          }}
        />
        <View
          className="absolute"
          style={{
            width: 150, height: 150, borderRadius: 75,
            backgroundColor: "rgba(255,255,255,0.07)",
            bottom: -30, left: 20,
          }}
        />

        {/* Chip */}
        <View className="absolute top-5 right-6 w-10 h-7 rounded-md border-2 border-white/60" />

        {/* Card number */}
        <Text
          className="absolute text-white text-[18px] font-bold tracking-widest"
          style={{ bottom: 52, left: 24 }}
        >
          {displayNumber}
        </Text>

        {/* Bottom row */}
        <View className="absolute bottom-5 left-6 right-6 flex-row justify-between items-end">
          <View>
            <Text className="text-white/60 text-[10px]">Card Holder Name</Text>
            <Text className="text-white text-[13px] font-bold">{displayName}</Text>
          </View>
          <View>
            <Text className="text-white/60 text-[10px]">Expiry Date</Text>
            <Text className="text-white text-[13px] font-bold">{displayExpiry}</Text>
          </View>
          {/* Card icon */}
          <View
            className="w-9 h-9 border-2 border-white/40 rounded-md items-center justify-center"
          >
            <View className="flex-row flex-wrap w-5 h-5 gap-[2px]">
              {[0,1,2,3].map(i => (
                <View key={i} className="w-[8px] h-[8px] rounded-[1px] bg-white/50" />
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Form */}
      <View className="px-6 gap-5">
        {/* Card Holder Name */}
        <View>
          <Text className="text-[13px] text-[#1A1A2E] font-medium mb-2">Card Holder Name</Text>
          <TextInput
            value={cardName}
            onChangeText={(v) => {
              setCardName(v);
              if (errors.cardName) setErrors((e) => ({ ...e, cardName: "" }));
            }}
            placeholder="John Doe"
            placeholderTextColor="#C0C8D8"
            style={{
              backgroundColor: "#F4F5FF",
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 16,
              fontSize: 15,
              color: "#1A1A2E",
              borderWidth: errors.cardName ? 1.5 : 0,
              borderColor: errors.cardName ? "#FF4D6D" : "transparent",
            }}
          />
          {!!errors.cardName && (
            <Text style={{ color: "#FF4D6D", fontSize: 12, marginTop: 4, marginLeft: 4 }}>
              {errors.cardName}
            </Text>
          )}
        </View>

        {/* Card Number */}
        <View>
          <Text className="text-[13px] text-[#1A1A2E] font-medium mb-2">Card Number</Text>
          <TextInput
            value={cardNumber}
            onChangeText={(v) => {
              setCardNumber(formatCardNumber(v));
              if (errors.cardNumber) setErrors((e) => ({ ...e, cardNumber: "" }));
            }}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor="#C0C8D8"
            keyboardType="numeric"
            style={{
              backgroundColor: "#F4F5FF",
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 16,
              fontSize: 15,
              color: "#1A1A2E",
              letterSpacing: 2,
              borderWidth: errors.cardNumber ? 1.5 : 0,
              borderColor: errors.cardNumber ? "#FF4D6D" : "transparent",
            }}
          />
          {!!errors.cardNumber && (
            <Text style={{ color: "#FF4D6D", fontSize: 12, marginTop: 4, marginLeft: 4 }}>
              {errors.cardNumber}
            </Text>
          )}
        </View>

        {/* Expiry + CVV */}
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="text-[13px] text-[#1A1A2E] font-medium mb-2">Expiry Date</Text>
            <TextInput
              value={expiry}
              onChangeText={(v) => {
                setExpiry(formatExpiry(v));
                if (errors.expiry) setErrors((e) => ({ ...e, expiry: "" }));
              }}
              placeholder="MM/YY"
              placeholderTextColor="#C0C8D8"
              keyboardType="numeric"
              style={{
                backgroundColor: "#F4F5FF",
                borderRadius: 16,
                paddingHorizontal: 20,
                paddingVertical: 16,
                fontSize: 15,
                color: "#1A1A2E",
                borderWidth: errors.expiry ? 1.5 : 0,
                borderColor: errors.expiry ? "#FF4D6D" : "transparent",
              }}
            />
            {!!errors.expiry && (
              <Text style={{ color: "#FF4D6D", fontSize: 11, marginTop: 4, marginLeft: 4 }}>
                {errors.expiry}
              </Text>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-[13px] text-[#1A1A2E] font-medium mb-2">CVV</Text>
            <TextInput
              value={cvv}
              onChangeText={(v) => {
                setCvv(v.replace(/\D/g, "").slice(0, 4));
                if (errors.cvv) setErrors((e) => ({ ...e, cvv: "" }));
              }}
              placeholder="•••"
              placeholderTextColor="#C0C8D8"
              keyboardType="numeric"
              secureTextEntry
              style={{
                backgroundColor: "#F4F5FF",
                borderRadius: 16,
                paddingHorizontal: 20,
                paddingVertical: 16,
                fontSize: 15,
                color: "#1A1A2E",
                borderWidth: errors.cvv ? 1.5 : 0,
                borderColor: errors.cvv ? "#FF4D6D" : "transparent",
              }}
            />
            {!!errors.cvv && (
              <Text style={{ color: "#FF4D6D", fontSize: 11, marginTop: 4, marginLeft: 4 }}>
                {errors.cvv}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Save button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6 bg-white"
        style={{ paddingBottom: Platform.OS === "ios" ? 36 : 20, paddingTop: 12 }}
      >
        <TouchableOpacity
          onPress={handleSave}
          className="rounded-full py-5 items-center justify-center"
          style={{ backgroundColor: "#3D5AFE" }}
          activeOpacity={0.85}
        >
          <Text className="text-white text-[16px] font-bold">Save Card</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
