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

type ContactOption = {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  description: string;
};

const CONTACT_OPTIONS: ContactOption[] = [
  {
    id: "1",
    icon: "headset-outline",
    label: "Customer Service",
    description: "Chat with our support team",
  },
  {
    id: "2",
    icon: "globe-outline",
    label: "Website",
    description: "Visit our website",
  },
  {
    id: "3",
    icon: "logo-whatsapp",
    label: "Whatsapp",
    description: "Message us on WhatsApp",
  },
  {
    id: "4",
    icon: "logo-facebook",
    label: "Facebook",
    description: "Find us on Facebook",
  },
  {
    id: "5",
    icon: "logo-instagram",
    label: "Instagram",
    description: "Follow us on Instagram",
  },
];

export default function HelpCenterScreen() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq");
  const [filteredOptions, setFilteredOptions] = useState(CONTACT_OPTIONS);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim()) {
      const filtered = CONTACT_OPTIONS.filter((option) =>
        option.label.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(CONTACT_OPTIONS);
    }
  };

  return (
    <View className="flex-1 bg-[#F4F5F8]">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Header */}
      <View style={{ paddingTop: STATUS_BAR_H + 12 }} className="bg-[#2F62F4] px-6 pb-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-center text-white text-[36px] font-semibold mb-2" style={{ fontSize: 34 }}>
          Help Center
        </Text>
        <Text className="text-white/80 text-[20px] mb-4 text-center" style={{ fontSize: 16 }}>
          How Can We Help You?
        </Text>

        {/* Search Bar */}
        <View className="bg-white rounded-full flex-row items-center px-4 py-2">
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            value={search}
            onChangeText={handleSearch}
            placeholder="Search..."
            placeholderTextColor="#ccc"
            className="flex-1 ml-3 text-black"
            style={{ fontSize: 16 }}
          />
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row gap-3 px-6 pt-4 mb-6">
        <TouchableOpacity
          onPress={() => setActiveTab("faq")}
          className={`flex-1 rounded-2xl py-3 items-center ${
            activeTab === "faq" ? "bg-[#D2DBFF]" : "bg-white"
          }`}
        >
          <Text
            className={`font-semibold ${activeTab === "faq" ? "text-[#2F62F4]" : "text-gray-700"}`}
            style={{ fontSize: 18 }}
          >
            FAQ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("contact")}
          className={`flex-1 rounded-2xl py-3 items-center ${
            activeTab === "contact" ? "bg-[#2F62F4]" : "bg-[#D2DBFF]"
          }`}
        >
          <Text
            className={`font-semibold ${activeTab === "contact" ? "text-white" : "text-[#2F62F4]"}`}
            style={{ fontSize: 18 }}
          >
            Contact Us
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "faq" ? (
        <View className="flex-1 px-6 pb-6">
          <TouchableOpacity
            onPress={() => router.push("/faq")}
            className="bg-white rounded-2xl p-4 items-center justify-center"
          >
            <Text className="text-[#2F62F4] font-semibold text-center" style={{ fontSize: 18 }}>
              View All FAQs
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOptions}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {}}
              className="bg-white rounded-2xl p-4 mx-6 mb-3 flex-row items-start"
            >
              <View className="w-12 h-12 rounded-full bg-[#2F62F4] items-center justify-center mr-4">
                <Ionicons name={item.icon} size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-black font-semibold" style={{ fontSize: 18 }}>
                  {item.label}
                </Text>
                <Text className="text-gray-500 mt-1" style={{ fontSize: 14 }}>
                  {item.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#2F62F4" />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
