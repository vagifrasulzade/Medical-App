import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface AvatarState {
    avatar: string | null;
    setAvatar: (avatar: string) => Promise<void>;
    loadAvatar: () => Promise<void>;
    clearAvatar: () => void;
}

const getUserAvatarKey = async (): Promise<string | null> => {
    try {
        const raw = await AsyncStorage.getItem("user");
        if (!raw) return null;
        const user = JSON.parse(raw);
        return user?.id ? `user-avatar-${user.id}` : null;
    } catch {
        return null;
    }
};

export const useAvatarStore = create<AvatarState>((set) => ({
    avatar: null,
    setAvatar: async (avatar: string) => {
        set({ avatar });
        try {
            const key = await getUserAvatarKey();
            if (key) await AsyncStorage.setItem(key, avatar);
        } catch (error) {
            console.error("Failed to save avatar to AsyncStorage:", error);
        }
    },
    loadAvatar: async () => {
        try {
            const key = await getUserAvatarKey();
            if (!key) return;
            const savedAvatar = await AsyncStorage.getItem(key);
            set({ avatar: savedAvatar ?? null });
        } catch (error) {
            console.error("Failed to load avatar from AsyncStorage:", error);
        }
    },
    clearAvatar: () => set({ avatar: null }),
}));