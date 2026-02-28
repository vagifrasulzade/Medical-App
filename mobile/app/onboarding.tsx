import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Slide data ───────────────────────────────────────────────────────────────
type Slide = {
  id: string;
  title: string;
  image: ImageSourcePropType | null;
  bgColor: string;
};

const slides: Slide[] = [
  {
    id: "1",
    title: "Consult only with a doctor\nyou trust",
    image: require('../assets/images/doctor.png'),
    bgColor: "#EEF1FF",
  },
  {
    id: "2",
    title: "Find a lot of specialist\ndoctors in one place",
    image: require('../assets/images/doctor2.png'),
    bgColor: "#EAF0FF",
  },
  {
    id: "3",
    title: "Get connect our Online\nConsultation",
    image: require('../assets/images/doctor3.png'),
    bgColor: "#E8EDFD",
  },
];

// ─── Arrow icon ───────────────────────────────────────────────────────────────
function ArrowRight() {
  return (
    <View className="w-5 h-5 justify-center items-center">
      <View className="absolute w-4 h-[2.5px] bg-white rounded" />
      <View
        className="absolute right-0 w-[9px] h-[2.5px] bg-white rounded"
        style={{ transform: [{ rotate: "45deg" }, { translateY: -3 }] }}
      />
      <View
        className="absolute right-0 w-[9px] h-[2.5px] bg-white rounded"
        style={{ transform: [{ rotate: "-45deg" }, { translateY: 3 }] }}
      />
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setActiveIndex(index);
  };

  const finishOnboarding = useCallback(async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/welcome");
  }, []);

  const goNext = useCallback(() => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      finishOnboarding();
    }
  }, [activeIndex, finishOnboarding]);

  const CARD_HEIGHT = SCREEN_H * 0.35;
  const IMAGE_HEIGHT = SCREEN_H - CARD_HEIGHT;

  const renderSlide = useCallback(({ item }: { item: Slide }) => (
    <View className="flex-1" style={{ width: SCREEN_W }}>
      {/* Doctor image area */}
      <View
        className="w-full items-center justify-end"
        style={{ height: IMAGE_HEIGHT, backgroundColor: item.bgColor }}
      >
        {item.image ? (
          <Image source={item.image} className="w-full h-full" resizeMode="contain" />
        ) : (
          <View className="flex-1 items-center justify-center gap-3">
            <View className="w-20 h-20 rounded-full bg-[#E8ECFF] border-[3px] border-[#3D5AFE]" />
            <Text className="text-sm text-[#8A8A9B] text-center leading-5">
              Doctor photo{"\n"}(add image)
            </Text>
          </View>
        )}
      </View>

      {/* Bottom white card */}
      <View
        className="bg-white rounded-tl-[32px] rounded-tr-[32px] px-7 pt-8 pb-6 justify-between"
        style={{
          height: CARD_HEIGHT,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Text className="text-[24px] font-extrabold text-[#1A1A2E] leading-[34px]">
          {item.title}
        </Text>

        {/* Dots + Button row */}
        <View className="flex-row items-center justify-between">
          {/* Dots */}
          <View className="flex-row items-center gap-2">
            {slides.map((_, i) =>
              i === activeIndex ? (
                <View key={i} className="h-1.5 w-6 rounded-full bg-[#3D5AFE]" />
              ) : (
                <View key={i} className="h-1.5 w-5 rounded-full bg-[#D0D0D0]" />
              )
            )}
          </View>

          {/* Next / Done button */}
          <TouchableOpacity
            onPress={goNext}
            activeOpacity={0.85}
            className="w-[58px] h-[58px] rounded-full bg-[#3D5AFE] items-center justify-center"
            style={{
              shadowColor: "#3D5AFE",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <ArrowRight />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [activeIndex, goNext]);

  return (
    <View className="flex-1 bg-white">
      {/* Skip */}
      <TouchableOpacity
        onPress={finishOnboarding}
        className="absolute top-14 right-6 z-10"
        activeOpacity={0.7}
      >
        <Text className="text-[15px] font-medium text-[#8A8A9B]">Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={renderSlide}
        extraData={activeIndex}
      />
    </View>
  );
}