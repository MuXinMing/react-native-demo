import { createBillByAi } from "@/api/bill"
import { useAsrStore } from "@/store/asr"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useMutation } from "@tanstack/react-query"
import {
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorder,
    useAudioRecorderState
} from "expo-audio"
import { File } from "expo-file-system"
import { Check, Mic, X } from "lucide-react-native"
import { FC, memo, useState } from "react"
import { Dimensions } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { runOnJS } from "react-native-worklets"
import { Button } from "./ui/button"
import { Icon } from "./ui/icon"
import { Text } from "./ui/text"

interface Props {
    refreshBillList: () => void
}
const VoiceBookkeeping: FC<Props> = ({ refreshBillList }) => {
    const tabBarHeight = useBottomTabBarHeight()
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
    const { top } = useSafeAreaInsets()
    const { getAsrData } = useAsrStore()
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
    const recorderState = useAudioRecorderState(audioRecorder)

    const startRecord = async () => {
        await audioRecorder.prepareToRecordAsync()
        await setAudioModeAsync({
            allowsRecording: true,
            playsInSilentMode: true
        })
        audioRecorder.record()
    }
    const stopRecord = async () => {
        await audioRecorder.stop()
    }
    //是否打开了语音识别窗口
    const [open, setOpen] = useState(false)
    //语音识别文本
    const [text, setText] = useState("")
    //是否取消录音
    const [isCancelRecording, setIsCancelRecording] = useState(false)
    //动画进度
    const progress = useSharedValue(0)
    const handleOpen = () => {
        progress.value = withTiming(1, { duration: 300 })
        setOpen(true)
    }
    const handleClose = () => {
        progress.value = withTiming(0, { duration: 300 })
        setOpen(false)
        setText("")
        setIsCancelRecording(false)
    }
    const { mutate, isPending: getAsrDataPending } = useMutation({
        mutationKey: ["getAsrData"],
        mutationFn: getAsrData,
        onSuccess: (result) => {
            if (!result) {
                handleClose()
            } else {
                setText(result)
            }
        },
    })
    const getText = async () => {
        await stopRecord()
        if (isCancelRecording || !audioRecorder.uri) return
        const audioData = new File(audioRecorder.uri)
        mutate({ speech: audioData.base64Sync(), len: audioData.size })
    }
    const { mutate: createBillMutate, isPending: createBillPending } = useMutation({
        mutationKey: ["createBillByAi"],
        mutationFn: createBillByAi,
        onSuccess: () => {
            handleClose()
            refreshBillList()
        }
    })
    const overlayStyle = useAnimatedStyle(() => {
        const borderRadius = interpolate(progress.value, [0, 1], [32, 0])
        const width = interpolate(progress.value, [0, 1], [64, SCREEN_WIDTH])
        const height = interpolate(progress.value, [0, 1], [64, SCREEN_HEIGHT])
        const right = interpolate(progress.value, [0, 1], [16, 0])
        const bottom = interpolate(progress.value, [0, 1], [16, 0])
        const top = interpolate(progress.value, [0, 1], [SCREEN_HEIGHT - 64 - 16 - tabBarHeight, 0])
        const left = interpolate(progress.value, [0, 1], [SCREEN_WIDTH - 16 - 64, 0])
        const opacity = interpolate(progress.value, [0, 1], [0, 1])

        return {
            left,
            top,
            right,
            bottom,
            width,
            height,
            borderRadius,
            opacity
        }
    })
    const checkButtonStyle = useAnimatedStyle(() => {
        const opacity = interpolate(progress.value, [0, 1], [0, 1])
        const scale = interpolate(progress.value, [0, 1], [0, 1])
        return {
            opacity,
            transform: [{ scale }]
        }
    })

    const longPress = Gesture.LongPress()
        .shouldCancelWhenOutside(false)
        .maxDistance(1000)
        .minDuration(300)
        .onStart(() => {
            runOnJS(handleOpen)()
            //开始记录语音
            runOnJS(startRecord)()
        })
        .onEnd(() => {
            //识别语音
            runOnJS(getText)()
        })
    //录音按钮圆心在屏幕中的坐标
    const buttonCenterX = SCREEN_WIDTH - 16 - 32
    const buttonCenterY = SCREEN_HEIGHT - tabBarHeight - 16 - 32
    const pan = Gesture.Pan()
        .onUpdate((e) => {
            const distance = Math.sqrt(
                (e.absoluteX - buttonCenterX) ** 2 + (e.absoluteY - buttonCenterY) ** 2
            )
            const isOutside = distance > 32
            runOnJS(setIsCancelRecording)(isOutside)
        })
        .onEnd((e) => {
            const distance = Math.sqrt(
                (e.absoluteX - buttonCenterX) ** 2 + (e.absoluteY - buttonCenterY) ** 2
            )
            const isOutside = distance > 32
            runOnJS(setIsCancelRecording)(isOutside)
            if (isOutside) {
                runOnJS(handleClose)()
                //停止录音
                runOnJS(stopRecord)()
            }
        })
    const composed = Gesture.Simultaneous(longPress, pan)

    return (
        <>
            <GestureDetector gesture={composed}>
                <Animated.View className="absolute bottom-4 right-4 z-[999]">
                    <Button
                        className="w-16 h-16 items-center justify-center rounded-full"
                        onPress={() => {
                            if (open) {
                                handleClose()
                            }
                        }}
                        disabled={getAsrDataPending || createBillPending}
                    >
                        <Icon as={open ? X : Mic} size={24} className="text-primary-foreground" />
                    </Button>
                </Animated.View>
            </GestureDetector >
            <Animated.View className="absolute right-4 bottom-[96] z-[60]" style={checkButtonStyle}>
                <Button
                    className="w-16 h-16 items-center justify-center rounded-full"
                    onPress={() => createBillMutate({
                        prompt: text,
                        today: new Date().toISOString(),
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    })}
                    disabled={!text || createBillPending}
                >
                    <Icon as={Check} size={24} className="text-primary-foreground" />
                </Button>
            </Animated.View>
            <Animated.View className="absolute bg-primary-foreground/75 z-[50]" style={[overlayStyle]}>
                <Animated.View style={[{ paddingTop: top + 12 }]}>
                    <Text className="text-center" variant="h2">
                        语音结果
                    </Text>
                    <Text className="text-center" variant="h4">{recorderState.isRecording ? isCancelRecording ? "松开手指取消录音" : "正在录音..." : getAsrDataPending ? "语音识别中" : text}</Text>
                </Animated.View>
            </Animated.View>
        </>
    )
}
export default memo(VoiceBookkeeping)