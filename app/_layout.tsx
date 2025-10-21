import { useColorScheme } from "@/hooks/use-color-scheme"
import { useAuthStore } from "@/store/auth"
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { PortalHost } from "@rn-primitives/portal"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SplashScreen, Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import "../global.css"

const queryClient = new QueryClient()
SplashScreen.preventAutoHideAsync()

export default function AppLayout() {
    const colorScheme = useColorScheme()
    const { top } = useSafeAreaInsets()
    const { token, hasHydrated } = useAuthStore()
    const [isReady, setIsReady] = useState(false)
    useEffect(() => {
        if (hasHydrated) {
            setIsReady(true)
        }
    }, [hasHydrated])
    useEffect(() => {
        if (isReady) {
            SplashScreen.hideAsync()
        }
    }, [isReady])
    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <QueryClientProvider client={queryClient}>
                <KeyboardProvider>
                    <StatusBar style="auto" />
                    <Stack>
                        <Stack.Protected guard={!!token}>
                            <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "none" }} />
                            <Stack.Screen name="bill/[billParams]" options={{ headerShown: false }} />
                            <Stack.Screen name="user" options={{ headerShown: false }} />
                            <Stack.Screen name="setting" options={{ headerShown: false }} />
                            <Stack.Screen name="test" options={{ headerShown: false }} />
                            <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
                        </Stack.Protected>
                        <Stack.Protected guard={!token}>
                            <Stack.Screen name="login" options={{ headerShown: false, animation: "none" }} />
                            <Stack.Screen name="register" options={{ headerShown: false, animation: "none" }} />
                        </Stack.Protected>
                    </Stack>
                    <Toast topOffset={top} />
                    <PortalHost />
                </KeyboardProvider>
            </QueryClientProvider>
        </ThemeProvider>
    )
}