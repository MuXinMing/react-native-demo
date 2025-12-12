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
interface State {
    token: string
    userInfo: UserInfo | null
    hasHydrated: boolean
    logout: () => void
    setToken: (token: string) => void
    setUserInfo: (userInfo: UserInfo) => void
    setHasHydrated: (hasHydrated: boolean) => void
}

export const useAuthStore = create<State>()(persist((set) => ({
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
        const { token, userInfo } = state
        return { token, userInfo }
    },
    onRehydrateStorage: (state) => () => state.setHasHydrated(true)
}))