import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
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

interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  cardName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  isDefault: boolean;
}

export default function PaymentScreen() {
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentType, setPaymentType] = useState<"card" | "bank">("card");

  // Card fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // Bank fields
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const paymentKey = await getPaymentKey();
      if (!paymentKey) {
        setPayments([]);
        return;
      }

      const saved = await AsyncStorage.getItem(paymentKey);
      if (saved) {
        setPayments(JSON.parse(saved));
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error("Failed to load payments:", error);
    }
  };

  const savePayments = async (newPayments: PaymentMethod[]) => {
    try {
      const paymentKey = await getPaymentKey();
      if (!paymentKey) {
        router.replace("/signin");
        return;
      }

      await AsyncStorage.setItem(paymentKey, JSON.stringify(newPayments));
      setPayments(newPayments);
    } catch (error) {
      Alert.alert("Error", "Failed to save payment method");
    }
  };

  const isValidExpiry = (exp: string): boolean => {
    const parts = exp.split("/");
    if (parts.length !== 2 || parts[1].length < 2) return false;
    const month = parseInt(parts[0], 10);
    const year = 2000 + parseInt(parts[1], 10);
    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) return false;
    const now = new Date();
    if (year < now.getFullYear()) return false;
    if (year === now.getFullYear() && month < now.getMonth() + 1) return false;
    return true;
  };

  const formatExpiryInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const addPaymentMethod = () => {
    if (paymentType === "card") {
      if (!cardName.trim() || !cardNumber.trim() || !expiryDate.trim() || !cvv.trim()) {
        Alert.alert("Error", "Please fill in all card details");
        return;
      }
      if (cardNumber.replace(/\s/g, "").length < 13) {
        Alert.alert("Error", "Please enter a valid card number");
        return;
      }
      if (!isValidExpiry(expiryDate)) {
        Alert.alert("Invalid Expiry", "Please enter a valid non-expired date (MM/YY).\nExample: 03/27");
        return;
      }
    } else {
      if (!bankName.trim() || !accountNumber.trim() || !routingNumber.trim()) {
        Alert.alert("Error", "Please fill in all bank details");
        return;
      }
    }

    const newPayment: PaymentMethod = {
      id: Date.now().toString(),
      type: paymentType,
      isDefault: payments.length === 0,
      ...(paymentType === "card" && {
        cardName,
        // Mask card number for security
        cardNumber: `****-****-****-${cardNumber.slice(-4)}`,
        expiryDate,
        cvv: "***",
      }),
      ...(paymentType === "bank" && {
        bankName,
        // Mask account number for security
        accountNumber: `****${accountNumber.slice(-4)}`,
        routingNumber,
      }),
    };

    const updated = [...payments, newPayment];
    savePayments(updated);
    resetForm();
    setShowAddModal(false);
    Alert.alert("Success", "Payment method added successfully");
  };

  const resetForm = () => {
    setCardName("");
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setBankName("");
    setAccountNumber("");
    setRoutingNumber("");
  };

  const deletePayment = (id: string) => {
    Alert.alert(
      "Delete Payment",
      "Are you sure you want to delete this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updated = payments.filter((p) => p.id !== id);
            // Ensure at least one default if remaining
            if (updated.length > 0 && !updated.some((p) => p.isDefault)) {
              updated[0].isDefault = true;
            }
            savePayments(updated);
          },
        },
      ]
    );
  };

  const setAsDefault = (id: string) => {
    const updated = payments.map((p) => ({
      ...p,
      isDefault: p.id === id,
    }));
    savePayments(updated);
  };

  const renderPaymentItem = (item: PaymentMethod) => (
    <View key={item.id} className="bg-white rounded-2xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-full bg-[#2F62F4] items-center justify-center mr-3">
            <Ionicons
              name={item.type === "card" ? "card-outline" : "business-outline"}
              size={24}
              color="white"
            />
          </View>
          <View className="flex-1">
            <Text className="text-[24px] font-semibold text-black" style={{ fontSize: 20 }}>
              {item.type === "card" ? item.cardName : item.bankName}
            </Text>
            <Text className="text-[20px] text-gray-500" style={{ fontSize: 14 }}>
              {item.type === "card" ? item.cardNumber : `Account: ${item.accountNumber}`}
            </Text>
          </View>
        </View>
        {item.isDefault && (
          <View className="bg-[#2F62F4]/10 px-3 py-1 rounded-full">
            <Text className="text-[#2F62F4] font-semibold" style={{ fontSize: 12 }}>
              DEFAULT
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-2">
        {!item.isDefault && (
          <TouchableOpacity
            onPress={() => setAsDefault(item.id)}
            className="flex-1 border border-[#2F62F4] rounded-xl py-2"
          >
            <Text className="text-[#2F62F4] font-semibold text-center" style={{ fontSize: 16 }}>
              Set Default
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => deletePayment(item.id)}
          className="flex-1 bg-red-500/10 rounded-xl py-2"
        >
          <Text className="text-red-500 font-semibold text-center" style={{ fontSize: 16 }}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#F4F5F8]">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={{ paddingTop: STATUS_BAR_H + 12 }} className="px-6 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#2F62F4" />
          </TouchableOpacity>
          <Text className="text-[32px] font-semibold text-[#2F62F4]" style={{ fontSize: 32 }}>
            Payment Methods
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <FlatList
        data={payments}
        renderItem={({ item }) => renderPaymentItem(item)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Ionicons name="wallet-outline" size={48} color="#2F62F4" />
            <Text className="text-[24px] text-gray-500 mt-4 text-center" style={{ fontSize: 18 }}>
              No payment methods added yet
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-[#2F62F4] items-center justify-center"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Add Payment Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[32px] font-semibold text-black" style={{ fontSize: 28 }}>
                Add Payment Method
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color="#2F62F4" />
              </TouchableOpacity>
            </View>

            {/* Type Selector */}
            <View className="flex-row rounded-xl overflow-hidden mb-6 bg-[#F4F5F8]">
              <TouchableOpacity
                onPress={() => setPaymentType("card")}
                className={`flex-1 py-3 ${paymentType === "card" ? "bg-[#2F62F4]" : ""}`}
              >
                <Text
                  className={`text-center font-semibold ${
                    paymentType === "card" ? "text-white" : "text-black"
                  }`}
                  style={{ fontSize: 16 }}
                >
                  Card
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPaymentType("bank")}
                className={`flex-1 py-3 ${paymentType === "bank" ? "bg-[#2F62F4]" : ""}`}
              >
                <Text
                  className={`text-center font-semibold ${
                    paymentType === "bank" ? "text-white" : "text-black"
                  }`}
                  style={{ fontSize: 16 }}
                >
                  Bank Transfer
                </Text>
              </TouchableOpacity>
            </View>

            {paymentType === "card" ? (
              <>
                <Label text="Card Name" />
                <TextInput
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="e.g., My Visa"
                  placeholderTextColor="#999"
                  className="bg-[#DCE2F1] rounded-xl px-4 py-3 text-[30px] text-black mb-4"
                  style={{ fontSize: 16 }}
                />

                <Label text="Card Number" />
                <TextInput
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(text.replace(/\s/g, ""))}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  className="bg-[#DCE2F1] rounded-xl px-4 py-3 text-[30px] text-black mb-4"
                  style={{ fontSize: 16 }}
                  maxLength={16}
                />

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Label text="Expiry" />
                    <TextInput
                      value={expiryDate}
                      onChangeText={(text) => setExpiryDate(formatExpiryInput(text))}
                      placeholder="MM/YY"
                      placeholderTextColor="#999"
                      className="bg-[#DCE2F1] rounded-xl px-4 py-3 text-[30px] text-black"
                      style={{ fontSize: 16 }}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View className="flex-1">
                    <Label text="CVV" />
                    <TextInput
                      value={cvv}
                      onChangeText={setCvv}
                      placeholder="123"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      className="bg-[#DCE2F1] rounded-xl px-4 py-3 text-[30px] text-black"
                      style={{ fontSize: 16 }}
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>
              </>
            ) : (
              <>
                <Label text="Bank Name" />
                <TextInput
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="e.g., Gulf Bank"
                  placeholderTextColor="#999"
                  className="bg-[#DCE2F1] rounded-xl px-4 py-3 text-[30px] text-black mb-4"
                  style={{ fontSize: 16 }}
                />

                <Label text="Account Number" />
                <TextInput
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="Enter account number"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  className="bg-[#DCE2F1] rounded-xl px-4 py-3 text-[30px] text-black mb-4"
                  style={{ fontSize: 16 }}
                />

                <Label text="Routing Number" />
                <TextInput
                  value={routingNumber}
                  onChangeText={setRoutingNumber}
                  placeholder="Enter routing number"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  className="bg-[#DCE2F1] rounded-xl px-4 py-3 text-[30px] text-black"
                  style={{ fontSize: 16 }}
                />
              </>
            )}

            <TouchableOpacity
              onPress={addPaymentMethod}
              className="bg-[#2F62F4] rounded-xl items-center justify-center py-3 mt-6"
            >
              <Text className="text-white font-semibold" style={{ fontSize: 18 }}>
                Add Payment Method
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Label({ text }: { text: string }) {
  return (
    <Text className="text-black font-medium mb-2" style={{ fontSize: 16 }}>
      {text}
    </Text>
  );
}
