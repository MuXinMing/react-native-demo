import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
export interface UserInfo {
    id: string
    email: string
    username: string
    firstName?: string
    lastName?: string
}
interface AuthState {
    token: string
    userInfo: UserInfo | null
    hasHydrated: boolean
    logout: () => void
    setToken: (token: string) => void
    setUserInfo: (userInfo: UserInfo) => void
    setHasHydrated: (hasHydrated: boolean) => void
}

export const useAuthStore = create(persist<AuthState>((set,get) => ({
    token: "",
    userInfo: null,
    hasHydrated: false,
    logout: () => {
        set({ token: "", userInfo: null })
    },
    setToken: (token) => set({ token }),
    setUserInfo: (userInfo) => set({ userInfo }),
    setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
}), {
    name: "auth",
    storage: createJSONStorage(() => AsyncStorage),
    partialize(state) {
        return { ...state, hasHydrated: false }
    },
    onRehydrateStorage: (state) => () => {
        state.setHasHydrated(true)
    },
}))