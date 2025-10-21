import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Text } from "@/components/ui/text"
import { useAuthStore } from "@/store/auth"
import { useRouter } from "expo-router"
import { Settings2 } from "lucide-react-native"
import { useState } from "react"
import { TouchableOpacity, View } from "react-native"
import Animated, { interpolate, useAnimatedRef, useAnimatedStyle, useScrollOffset } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"


export default function Profile() {
    const { top } = useSafeAreaInsets()
    const router = useRouter()
    const { userInfo } = useAuthStore()
    const [navBarHeight, setNavBarHeight] = useState(0)
    // const getProfile = async () => {
    //     try {
    //         setLoading(true)
    //         const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user`, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         })
    //         const data = await response.json()
    //         if (response.status !== 200) {
    //             Alert.alert(data.error)
    //             throw new Error(data)
    //         }

    //         const { userInfo } = data
    //         console.log(userInfo, 'userInfo');
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             Alert.alert(error.message)
    //         }
    //     } finally {
    //         setLoading(false)
    //     }
    // }
    const scrollRef = useAnimatedRef<Animated.ScrollView>()
    const scrollOffset = useScrollOffset(scrollRef)
    const navbarStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(scrollOffset.value, [0, 28], [0, 1], "clamp"),
        }
    })
    const usernameStyle = useAnimatedStyle(() => {
        return {
            opacity: scrollOffset.value >= 28 ? 1 : 0
        }
    })
    return (
        <View className="flex-1">
            <Animated.View className="absolute w-full z-10">
                <View style={{ paddingTop: top }} className="z-10">
                    <View className="flex-row justify-between items-center py-2 px-4" onLayout={(event) => setNavBarHeight(event.nativeEvent.layout.height)}>
                        <Animated.Text style={usernameStyle}>
                            <Text variant="large">{userInfo?.username}</Text>
                        </Animated.Text>
                        <TouchableOpacity onPress={() => router.push("/setting")}>
                            <Icon as={Settings2} size={24} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Animated.View className="absolute inset-0 shadow-sm bg-white" style={navbarStyle}></Animated.View>
            </Animated.View>
            <Animated.ScrollView
                ref={scrollRef}
                contentContainerStyle={{ paddingTop: top + navBarHeight }}
                bounces={false}
            >
                <View className="p-4 pt-0 gap-y-4">
                    <View className="flex-row items-center gap-x-2">
                        <Avatar
                            alt="avatar"
                            className="size-10 border-background border-2"
                        >
                            <AvatarImage source={{ uri: "https://github.com/evilrabbit.png" }} />
                            <AvatarFallback>
                                <Text>ER</Text>
                            </AvatarFallback>
                        </Avatar>
                        <Text variant="h4" onPress={() => router.push("/user")}>{userInfo?.username}</Text>
                    </View>
                    <Button onPress={() => router.push("/test")}><Text>test</Text></Button>
                    {/* <Text variant="h4">Email:{userInfo?.email}</Text> */}
                    <View className="flex-row justify-between p-4 rounded-lg bg-primary-foreground">
                        <View className="items-center gap-y-2">
                            <Text className="font-medium">1</Text>
                            <Text className="text-ring/50" variant="small">记账天数</Text>
                        </View>
                        <View className="items-center gap-y-2">
                            <Text className="font-medium">1</Text>
                            <Text className="text-ring/50" variant="small">账单</Text>
                        </View>
                        <View className="items-center gap-y-2">
                            <Text className="font-medium">0</Text>
                            <Text className="text-ring/50" variant="small">净资产</Text>
                        </View>
                    </View>
                    <View style={{ height: 1000 }}></View>
                </View>
            </Animated.ScrollView>
        </View>
    )
}