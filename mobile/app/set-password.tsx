import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
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
  Alert,
} from "react-native";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

type FormData = {
  password: string;
  confirmPassword: string;
};

export default function SetPasswordScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ mode: "onBlur" });

  const passwordValue = watch("password");

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      // TODO: call reset-password API endpoint with new password
      Alert.alert("Success", "Your password has been updated.", [
        { text: "OK", onPress: () => router.replace("/signin") },
      ]);
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View
        className="flex-row items-center px-5 pb-3"
        style={{ paddingTop: STATUS_BAR_H + 10 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="chevron-back" size={24} color="#3D5AFE" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[20px] font-bold text-[#3D5AFE] mr-7">
          Set Password
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Description */}
        <Text className="text-[13px] text-[#8A8A9B] leading-[20px] mt-4 mb-8">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>

        {/* Password */}
        <Text className="text-[15px] font-semibold text-[#1A1A2E] mb-2">
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
              className={`bg-[#F0F3FF] rounded-2xl flex-row items-center px-4 ${
                errors.password ? "border border-red-400" : ""
              }`}
            >
              <TextInput
                className="flex-1 py-[14px] text-[14px] text-[#1A1A2E]"
                placeholder="············"
                placeholderTextColor="#A0A0B5"
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
          <Text className="text-[12px] text-red-500 mt-1 mb-2 ml-1">
            {errors.password.message}
          </Text>
        ) : (
          <View className="mb-5" />
        )}

        {/* Confirm Password */}
        <Text className="text-[15px] font-semibold text-[#1A1A2E] mb-2">
          Confirm Password
        </Text>
        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: "Please confirm your password",
            validate: (v) =>
              v === passwordValue || "Passwords do not match",
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View
              className={`bg-[#F0F3FF] rounded-2xl flex-row items-center px-4 ${
                errors.confirmPassword ? "border border-red-400" : ""
              }`}
            >
              <TextInput
                className="flex-1 py-[14px] text-[14px] text-[#1A1A2E]"
                placeholder="············"
                placeholderTextColor="#A0A0B5"
                secureTextEntry={!showConfirm}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
              <TouchableOpacity onPress={() => setShowConfirm((p) => !p)}>
                <Ionicons
                  name={showConfirm ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#8A8A9B"
                />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.confirmPassword ? (
          <Text className="text-[12px] text-red-500 mt-1 mb-2 ml-1">
            {errors.confirmPassword.message}
          </Text>
        ) : (
          <View className="mb-8" />
        )}

        {/* Create New Password Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          className="bg-[#3D5AFE] rounded-full py-[17px] items-center"
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
            {loading ? "Saving…" : "Create New Password"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
