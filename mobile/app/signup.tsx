import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { TOKEN_KEY, USER_KEY } from "../constant/api";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
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
  fullName: string;
  password: string;
  email: string;
  phone: string;
  dateOfBirth: string;
};

// Auto-format raw digits → DD / MM / YYYY with real-time clamping
function formatDate(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  const currentYear = new Date().getFullYear();

  let dd = digits.slice(0, 2);
  let mm = digits.slice(2, 4);
  let yyyy = digits.slice(4, 8);

  // Day: first digit > 3 → auto-prepend 0 (e.g. "4" → "04")
  if (dd.length === 1 && parseInt(dd) > 3) dd = "0" + dd;
  // Day: clamp to 01–31
  if (dd.length === 2 && parseInt(dd) > 31) dd = "31";
  if (dd.length === 2 && parseInt(dd) < 1) dd = "01";

  // Month: first digit > 1 → auto-prepend 0 (e.g. "2" → "02")
  if (mm.length === 1 && parseInt(mm) > 1) mm = "0" + mm;
  // Month: clamp to 01–12
  if (mm.length === 2 && parseInt(mm) > 12) mm = "12";
  if (mm.length === 2 && parseInt(mm) < 1) mm = "01";

  // Year: clamp to 1900–currentYear
  if (yyyy.length === 4 && parseInt(yyyy) > currentYear) yyyy = currentYear.toString();
  if (yyyy.length === 4 && parseInt(yyyy) < 1900) yyyy = "1900";

  if (digits.length === 0) return "";
  if (digits.length <= 2) return dd;
  if (digits.length <= 4) return `${dd} / ${mm}`;
  return `${dd} / ${mm} / ${yyyy}`;
}

// Validate DD / MM / YYYY is a real date
function validateDate(value: string) {
  if (!value || value.trim() === "") return "Date of birth is required";
  if (value.length < 14) return "Enter a complete date (DD / MM / YYYY)";
  const [dd, mm, yyyy] = value.split(" / ").map(Number);
  if (mm < 1 || mm > 12) return "Month must be between 01 and 12";
  if (dd < 1 || dd > 31) return "Day must be between 01 and 31";
  if (yyyy < 1900 || yyyy > new Date().getFullYear()) return "Enter a valid year";
  const date = new Date(yyyy, mm - 1, dd);
  if (
    date.getFullYear() !== yyyy ||
    date.getMonth() + 1 !== mm ||
    date.getDate() !== dd
  ) {
    return "Invalid date";
  }
  if (date > new Date()) return "Date of birth cannot be in the future";
  const age = new Date().getFullYear() - yyyy;
  if (age < 5) return "Age must be at least 5 years";
  if (age > 120) return "Enter a valid date of birth";
  return true;
}

export default function SignUpScreen() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const screenBg = isDark ? "#0F172A" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#1A1A2E";
  const textSecondary = isDark ? "#9CA3AF" : "#8A8A9B";
  const inputBg = isDark ? "#1F2937" : "#F0F3FF";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ mode: "onBlur" });

  const onSubmit = async (data: FormData) => {
    let dob: string | undefined;
    if (data.dateOfBirth?.length === 14) {
      const [dd, mm, yyyy] = data.dateOfBirth.split(" / ");
      dob = `${yyyy}-${mm}-${dd}`;
    }

    try {
      setLoading(true);

      // Get existing users
      const existingRaw = await AsyncStorage.getItem("users");
      const users: any[] = existingRaw ? JSON.parse(existingRaw) : [];

      // Check duplicate email
      const emailExists = users.some(
        (u) => u.email === data.email.toLowerCase().trim()
      );
      if (emailExists) {
        Alert.alert("Sign Up Failed", "An account with this email already exists.");
        return;
      }

      // Create new user object
      const newUser = {
        id: Date.now().toString(),
        fullName: data.fullName.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        phone: data.phone?.trim() || null,
        dateOfBirth: dob || null,
        role: "patient",
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem("users", JSON.stringify(users));

      // Auto sign-in after registration
      const { password: _pw, ...safeUser } = newUser;
      const token = `token_${newUser.id}_${Date.now()}`;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(safeUser));

      router.replace("/signin");
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
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
          New Account
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Full Name */}
        <Text className="text-[15px] font-semibold mb-2 mt-4" style={{ color: textPrimary }}>
          Full name
        </Text>
        <Controller
          control={control}
          name="fullName"
          rules={{
            required: "Full name is required",
            minLength: { value: 2, message: "At least 2 characters" },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`rounded-2xl px-4 py-[14px] text-[14px] ${errors.fullName ? "border border-red-400" : ""}`}
              placeholder="John Doe"
              placeholderTextColor="#A0A0B5"
              style={{ backgroundColor: inputBg, color: textPrimary }}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
            />
          )}
        />
        {errors.fullName && (
          <Text className="text-[12px] text-red-500 mt-1 mb-2 ml-1">{errors.fullName.message}</Text>
        )}
        {!errors.fullName && <View className="mb-4" />}


        {/* Email */}
        <Text className="text-[15px] font-semibold mb-2" style={{ color: textPrimary }}>
          Email
        </Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`rounded-2xl px-4 py-[14px] text-[14px] ${errors.email ? "border border-red-400" : ""}`}
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
        {errors.email && (
          <Text className="text-[12px] text-red-500 mt-1 mb-2 ml-1">{errors.email.message}</Text>
        )}
        {!errors.email && <View className="mb-4" />}


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
            <View className={`rounded-2xl flex-row items-center px-4 ${errors.password ? "border border-red-400" : ""}`} style={{ backgroundColor: inputBg }}>
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
        {errors.password && (
          <Text className="text-[12px] text-red-500 mt-1 mb-2 ml-1">{errors.password.message}</Text>
        )}
        {!errors.password && <View className="mb-4" />}

        {/* Mobile Number */}
        <Text className="text-[15px] font-semibold mb-2" style={{ color: textPrimary }}>
          Mobile Number
        </Text>
        <Controller
          control={control}
          name="phone"
          rules={{
            required: "Mobile number is required",
            pattern: { value: /^\+?[0-9]{7,15}$/, message: "Enter a valid phone number (e.g. +994501234567)" },
            minLength: { value: 7, message: "Phone number is too short" },
            maxLength: { value: 16, message: "Phone number is too long" },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`rounded-2xl px-4 py-[14px] text-[14px] ${errors.phone ? "border border-red-400" : ""}`}
              placeholder="+994501234567"
              placeholderTextColor="#A0A0B5"
              style={{ backgroundColor: inputBg, color: textPrimary }}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
            />
          )}
        />
        {errors.phone && (
          <Text className="text-[12px] text-red-500 mt-1 mb-2 ml-1">{errors.phone.message}</Text>
        )}
        {!errors.phone && <View className="mb-4" />}

        {/* Date of Birth */}
        <Text className="text-[15px] font-bold mb-2 text-center" style={{ color: textPrimary }}>
          Date Of Birth
        </Text>
        <Controller
          control={control}
          name="dateOfBirth"
          rules={{ validate: validateDate }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`rounded-2xl px-4 py-[14px] text-[14px] text-[#3D5AFE] text-center font-medium ${errors.dateOfBirth ? "border border-red-400" : ""}`}
              placeholder="DD / MM / YYYY"
              placeholderTextColor="#A0A0B5"
              style={{ backgroundColor: inputBg }}
              value={value}
              onChangeText={(t) => onChange(formatDate(t))}
              onBlur={onBlur}
              keyboardType="number-pad"
              maxLength={14}
            />
          )}
        />
        {errors.dateOfBirth && (
          <Text className="text-[12px] text-red-500 mt-1 mb-3 ml-1 text-center">{errors.dateOfBirth.message as string}</Text>
        )}
        {!errors.dateOfBirth && <View className="mb-5" />}

        {/* Terms */}
        <Text className="text-[12px] text-center mb-5 leading-[18px]" style={{ color: textSecondary }}>
          By continuing, you agree to{"\n"}
          <Text className="text-[#3D5AFE] font-semibold">Terms of Use</Text>
          <Text> and </Text>
          <Text className="text-[#3D5AFE] font-semibold">Privacy Policy.</Text>
        </Text>

        {/* Sign Up Button */}
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
            {loading ? "Creating account…" : "Sign Up"}
          </Text>
        </TouchableOpacity>

        {/* Social */}
        <Text className="text-[13px] text-center mb-4" style={{ color: textSecondary }}>
          or sign up with
        </Text>
        <View className="flex-row justify-center gap-4 mb-6">
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

        {/* Login link */}
        <View className="flex-row justify-center mb-8">
          <Text className="text-[13px]" style={{ color: textSecondary }}>already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/signin")}>
            <Text className="text-[13px] text-[#3D5AFE] font-semibold">Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
