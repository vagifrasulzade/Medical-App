import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { TOKEN_KEY, USER_KEY } from "../constant/api";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useTheme from "@/hooks/use-theme";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

type FormData = {
  emailOrPhone: string;
  password: string;
};

export default function SignInScreen() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const screenBg = isDark ? "#0F172A" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#1A1A2E";
  const textSecondary = isDark ? "#9CA3AF" : "#8A8A9B";
  const inputBg = isDark ? "#1F2937" : "#F0F3FF";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ mode: "onBlur" });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setServerError(null);

      // Load users from AsyncStorage
      const usersRaw = await AsyncStorage.getItem("users");
      const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];

      // Find user by email or phone
      const input = data.emailOrPhone.toLowerCase().trim();
      const user = users.find(
        (u) => u.email === input || u.phone === data.emailOrPhone.trim()
      );
      if (!user) {
        setServerError("Invalid email or mobile number.");
        return;
      }

      if (!user || user.password !== data.password) {
        setServerError("Invalid  password.");
        return;
      }
      else if(!user || (user.email !== input && user.phone !== data.emailOrPhone.trim())){
        setServerError("User not found.");
        return;
      }

      // Generate token and persist session
      const token = `token_${user.id}_${Date.now()}`;
      const { password: _pw, ...safeUser } = user;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(safeUser));

      router.replace("/home");
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: screenBg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View
        className="flex-row items-center px-5 pb-3"
        style={{ paddingTop: STATUS_BAR_H + 10 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="chevron-back" size={24} color="#3D5AFE" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[20px] font-bold text-[#3D5AFE] mr-7">
          Log In
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Welcome */}
        <Text className="text-[30px] font-extrabold text-[#3D5AFE] mt-6 mb-2">
          Welcome
        </Text>
        <Text className="text-[13px] leading-[20px] mb-8" style={{ color: textSecondary }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>

        {/* Email or Phone */}
        <Text className="text-[15px] font-semibold mb-2" style={{ color: textPrimary }}>
          Email or Mobile Number
        </Text>
        <Controller
          control={control}
          name="emailOrPhone"
          rules={{
            required: "Email or phone number is required",
            validate: (v) => {
              const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
              const isPhone = /^\+?[0-9]{7,15}$/.test(v);
              return isEmail || isPhone || "Enter a valid email or phone number";
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`rounded-2xl px-4 py-[14px] text-[14px] ${
                errors.emailOrPhone ? "border border-red-400" : ""
              }`}
              placeholder="example@example.com"
              placeholderTextColor="#A0A0B5"
              style={{ backgroundColor: inputBg, color: textPrimary }}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        {errors.emailOrPhone ? (
          <Text className="text-[12px] text-red-500 mt-1 mb-2 ml-1">
            {errors.emailOrPhone.message}
          </Text>
        ) : (
          <View className="mb-4" />
        )}

        {/* Password */}
        <Text className="text-[15px] font-semibold mb-2" style={{ color: textPrimary }}>
          Password
        </Text>
        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required",
            minLength: { value: 6, message: "At least 6 characters" },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View
              className={`rounded-2xl flex-row items-center px-4 ${
                errors.password ? "border border-red-400" : ""
              }`}
              style={{ backgroundColor: inputBg }}
            >
              <TextInput
                className="flex-1 py-[14px] text-[14px]"
                placeholder="············"
                placeholderTextColor="#A0A0B5"
                style={{ color: textPrimary }}
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#8A8A9B"
                />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.password ? (
          <Text className="text-[12px] text-red-500 mt-1 ml-1">
            {errors.password.message}
          </Text>
        ) : null}

        {/* Server / credential error */}
        {serverError ? (
          <View className="flex-row items-center bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mt-2">
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text className="text-[12px] text-red-500 font-medium ml-2 flex-1">
              {serverError}
            </Text>
          </View>
        ) : null}

        {/* Forget Password */}
        <TouchableOpacity className="items-end mt-2 mb-8" onPress={()=> router.replace("/set-password")}>
          <Text className="text-[13px] text-[#3D5AFE] font-semibold">
            Forget Password
          </Text>
        </TouchableOpacity>

        {/* Log In Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          className="bg-[#3D5AFE] rounded-full py-[17px] items-center mb-5"
          style={{
            shadowColor: "#3D5AFE",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text className="text-white text-[16px] font-bold tracking-wide">
            {loading ? "Logging in…" : "Log In"}
          </Text>
        </TouchableOpacity>

        {/* Social */}
        <Text className="text-[13px] text-center mb-4" style={{ color: textSecondary }}>
          or sign up with
        </Text>
        <View className="flex-row justify-center gap-4 mb-8">
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-[52px] h-[52px] rounded-full bg-[#F0F3FF] items-center justify-center"
          >
            <Ionicons name="logo-google" size={22} color="#3D5AFE" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-[52px] h-[52px] rounded-full bg-[#F0F3FF] items-center justify-center"
          >
            <Ionicons name="logo-facebook" size={22} color="#3D5AFE" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-[52px] h-[52px] rounded-full bg-[#F0F3FF] items-center justify-center"
          >
            <Ionicons name="finger-print-outline" size={22} color="#3D5AFE" />
          </TouchableOpacity>
        </View>

        {/* Sign up link */}
        <View className="flex-row justify-center mb-8">
          <Text className="text-[13px]" style={{ color: textSecondary }}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.replace("/signup")}>
            <Text className="text-[13px] text-[#3D5AFE] font-semibold">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
