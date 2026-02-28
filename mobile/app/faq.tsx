import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

type FAQItem = {
  id: string;
  category: "popular" | "general" | "services";
  question: string;
  answer: string;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "1",
    category: "popular",
    question: "How do I schedule an appointment?",
    answer:
      "You can schedule an appointment by selecting a doctor from the list, choosing your preferred date and time, and confirming the booking. Our system will send you a confirmation message.",
  },
  {
    id: "2",
    category: "popular",
    question: "What payment methods do you accept?",
    answer:
      "We accept credit cards, debit cards, and bank transfers. All payments are secured with industry-standard encryption to protect your financial information.",
  },
  {
    id: "3",
    category: "popular",
    question: "Can I cancel or reschedule my appointment?",
    answer:
      "Yes, you can cancel or reschedule your appointment up to 24 hours before the scheduled time through the app without any penalty.",
  },
  {
    id: "4",
    category: "general",
    question: "How do I create an account?",
    answer:
      "Tap the Sign Up button, enter your email, create a password, and fill in your basic information. You'll receive a verification email to confirm your account.",
  },
  {
    id: "5",
    category: "general",
    question: "How do I recover my password?",
    answer:
      "Click 'Forgot Password' on the login screen, enter your email, and follow the reset instructions sent to your email address.",
  },
  {
    id: "6",
    category: "general",
    question: "Is my medical data secure?",
    answer:
      "Yes, we use encrypted connections and follow HIPAA compliance standards to protect all your medical information and personal data.",
  },
  {
    id: "7",
    category: "services",
    question: "What types of doctors are available?",
    answer:
      "We have various medical specialists including general practitioners, cardiologists, dermatologists, pediatricians, and many more.",
  },
  {
    id: "8",
    category: "services",
    question: "How long does a typical consultation take?",
    answer:
      "Most consultations last between 15-30 minutes, depending on your condition and the doctor's assessment. The duration will be confirmed at booking.",
  },
];

const CATEGORIES = [
  { id: "popular", label: "Popular Topic", icon: "flame-outline" },
  { id: "general", label: "General", icon: "help-circle-outline" },
  { id: "services", label: "Services", icon: "medical-outline" },
];

export default function FAQScreen() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory ? item.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <View className="flex-1 bg-[#F4F5F8]">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Header */}
      <View style={{ paddingTop: STATUS_BAR_H + 12 }} className="bg-[#2F62F4] px-6 pb-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-[36px] font-semibold mb-2 text-center" style={{ fontSize: 34 }}>
          FAQ
        </Text>
        <Text className="text-white/80 text-[20px] mb-4 text-center" style={{ fontSize: 16 }}>
          Frequently Asked Questions
        </Text>

        {/* Search Bar */}
        <View className="bg-white rounded-full flex-row items-center px-4 py-2">
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search FAQs..."
            placeholderTextColor="#ccc"
            className="flex-1 ml-3 text-black"
            style={{ fontSize: 16 }}
          />
        </View>
      </View>

      {/* Categories */}
      <FlatList
        data={CATEGORIES}
        horizontal
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              setActiveCategory(activeCategory === item.id ? null : item.id)
            }
            className={`flex-1 mx-2 mt-4 px-6 py-3 rounded-3xl justify-center items-center ${
              activeCategory === item.id ? "bg-[#2F62F4]" : "bg-[#D2DBFF]"
            }`}
          >
            <Text
              className={`font-semibold text-center ${
                activeCategory === item.id ? "text-white" : "text-[#2F62F4]"
              }`}
              style={{ fontSize: 14 }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
        showsHorizontalScrollIndicator={false}
      />

      {/* FAQ Items */}
      <FlatList<FAQItem>
        data={filteredItems}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
            className="bg-white rounded-2xl p-3 mx-6 mb-4"
          >
            <View className="flex-row items-start justify-between">
              <Text
                className="flex-1 text-gray-800 font-semibold mr-3"
                style={{ fontSize: 16 }}
              >
                {item.question}
              </Text>
              <Ionicons
                name={expandedId === item.id ? "chevron-up" : "chevron-down"}
                size={20}
                color="#2F62F4"
              />
            </View>

            {expandedId === item.id && (
              <Text className="text-gray-600 mt-3 leading-relaxed" style={{ fontSize: 14 }}>
                {item.answer}
              </Text>
            )}
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, paddingHorizontal: 0 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Ionicons name="help-circle-outline" size={48} color="#2F62F4" />
            <Text className="text-gray-500 mt-4 text-center" style={{ fontSize: 16 }}>
              No FAQs found matching your search
            </Text>
          </View>
        }
      />
    </View>
  );
}
