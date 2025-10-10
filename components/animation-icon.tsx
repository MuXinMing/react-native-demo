import { useEffect } from "react"
import { View } from "react-native"
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated"

export default function AnimationIcon() {
    const progress = useSharedValue(0)
    useEffect(() => {
        progress.value = withRepeat(withTiming(1, {
            duration: 1000,
            easing: Easing.linear,
        }), -1)
    }, [progress])
    const rStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * 360}deg` }],
    }), [])
    return (
        <View style={{ flexDirection: 'row' }}>
            <Animated.Text style={{ ...rStyle, flexDirection: 'row' }}>123</Animated.Text>

        </View>
    )
}