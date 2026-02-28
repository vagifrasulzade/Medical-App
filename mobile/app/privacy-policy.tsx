import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

export default function PrivacyPolicyScreen() {
  return (
    <View className="flex-1 bg-[#F4F5F8]">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={{ paddingTop: STATUS_BAR_H + 12 }} className="px-6 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#2F62F4" />
          </TouchableOpacity>
          <Text className="text-[32px] font-semibold text-[#2F62F4]" style={{ fontSize: 32 }}>
            Privacy Policy
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-500 text-[14px] mb-6" style={{ fontSize: 12 }}>
          Last Update: 02/24/2026
        </Text>

        {/* Introduction */}
        <Text className="text-gray-700 text-[16px] leading-relaxed mb-8" style={{ fontSize: 15 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ac diam quam. Aenean
          arcu metus, bibendum ut rhoncus at, volutpat et luctus. Morbi pellentesque enim vel
          neque auctor, a ultricies orci malesuada. Vestibulum lobortis enim vel neque auctor, a
          ultrices orci facilisis. Nam egestas nulla posuere neque, sed accumsan risus.
        </Text>

        {/* Terms & Conditions */}
        <View className="mb-8">
          <Text className="text-black font-bold text-[20px] mb-4" style={{ fontSize: 18 }}>
            Terms & Conditions
          </Text>

          {[1, 2, 3, 4].map((num) => (
            <View key={num} className="mb-4">
              <Text className="text-black font-semibold text-[16px] mb-2" style={{ fontSize: 15 }}>
                {num}. Ut lacinia justo sit amet sodales consectetuer
              </Text>
              <Text className="text-gray-700 text-[14px] leading-relaxed" style={{ fontSize: 13 }}>
                Prain malesuada eleifend fermentum. Donec consequentur, nunc consequentur. Donec
                aliquam rhoncus augue ut, duis laurus. Ex egot rutrum pharetra, lectus nisl
                posuere risus, vel facilisis nulla neque cum.
              </Text>
            </View>
          ))}
        </View>

        {/* Data Security */}
        <View className="mb-8">
          <Text className="text-black font-bold text-[20px] mb-4" style={{ fontSize: 18 }}>
            Data Security
          </Text>
          <Text className="text-gray-700 text-[14px] leading-relaxed mb-4" style={{ fontSize: 13 }}>
            Nunc auctor tortor in dolor luctus, quis eusmod urna tincidunt. Aenean arcu metus,
            bibendum ut rhoncus at, volutpat et luctus. Morbi pellentesque enim vel neque auctor,
            a ultrices orci malesuada orci sitier ultricies. Vestibulum lobortis enim vel neque
            auctor, a ultricies orci facilisis. Nam egestas nulla posuere neque.
          </Text>
        </View>

        {/* User Rights */}
        <View className="mb-12">
          <Text className="text-black font-bold text-[20px] mb-4" style={{ fontSize: 18 }}>
            Your Rights
          </Text>
          <Text className="text-gray-700 text-[14px] leading-relaxed" style={{ fontSize: 13 }}>
            You have the right to access, modify, and delete your personal data. To exercise these
            rights, please contact our privacy team. We are committed to protecting your privacy
            and will respond to all requests within 30 days.
          </Text>
        </View>

        {/* Contact */}
        <View className="bg-[#D2DBFF] rounded-2xl p-4 mb-12">
          <Text className="text-[#2F62F4] font-semibold mb-2" style={{ fontSize: 14 }}>
            Have Questions?
          </Text>
          <Text className="text-[#2F62F4] text-[13px]">
            Contact our privacy team at privacy@medicalapp.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
