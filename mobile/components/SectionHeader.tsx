import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  onSeeAll?: () => void;
};

export function SectionHeader({ title, onSeeAll }: Props) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-[17px] font-bold text-[#1A1A2E]">{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text className="text-[13px] text-[#3D5AFE] font-semibold">See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
