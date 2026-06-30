import { create } from "zustand";

export interface MobileState {
  currentUser: { id: string; name: string; role: string; walletBalance: number } | null;
  cachedCrops: any[];
  offlineQueue: { type: string; payload: any }[];
  
  setCurrentUser: (user: MobileState["currentUser"]) => void;
  syncCrops: (crops: any[]) => void;
  queueOfflineAction: (type: string, payload: any) => void;
  clearOfflineQueue: () => void;
}

export const useMobileStore = create<MobileState>((set) => ({
  currentUser: {
    id: "user_mob_90",
    name: "Ram Singh (Mobile)",
    role: "Farmer",
    walletBalance: 12450.0
  },
  cachedCrops: [],
  offlineQueue: [],

  setCurrentUser: (user) => set({ currentUser: user }),
  syncCrops: (crops) => set({ cachedCrops: crops }),
  queueOfflineAction: (type, payload) =>
    set((state) => ({ offlineQueue: [...state.offlineQueue, { type, payload }] })),
  clearOfflineQueue: () => set({ offlineQueue: [] })
}));
