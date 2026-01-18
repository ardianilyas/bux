import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PrivacyStore {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  setPrivacyMode: (value: boolean) => void;
}

export const usePrivacyStore = create<PrivacyStore>()(
  persist(
    (set) => ({
      isPrivacyMode: false,
      togglePrivacyMode: () => set((state) => ({ isPrivacyMode: !state.isPrivacyMode })),
      setPrivacyMode: (value: boolean) => set({ isPrivacyMode: value }),
    }),
    {
      name: "bux-privacy-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
