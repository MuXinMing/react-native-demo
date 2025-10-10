// SwipeableDeleteItem.tsx
import * as Haptics from "expo-haptics"
import React, { useState } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable"
import Reanimated, { SharedValue, useAnimatedReaction, useAnimatedStyle } from "react-native-reanimated"
import { runOnJS } from "react-native-worklets"
import { Text } from "./ui/text"


type Props = {
    item: { id: string; title: string };
    onDelete: (id: string) => void;
};
export default function SwipeableDeleteItem({ item, onDelete }: Props) {
    const [displayText, setDisplayText] = useState("删除")
    // 渲染右侧的删除背景
    const RenderRightActions = (progress: SharedValue<number>, translation: SharedValue<number>) => {
        const style = useAnimatedStyle(() => {
            // console.log(progress.value, "progress")
            console.log("translation", translation.value)
            return {
                justifyContent: "center",
                alignItems: "flex-end",
                paddingHorizontal: 12,
                flex: 1,
                backgroundColor: translation.value >= -64 ? "grey" : translation.value >= -96 ? "green" : "red"
            }
        })
        useAnimatedReaction(
            () => {
                let newText = ""
                if (translation.value >= -64) {
                    newText = "取消"
                } else if (translation.value <= -64 && translation.value >= -96) {
                    newText = "编辑"
                } else if (translation.value <= -96) {
                    newText = "删除"
                }
                return newText
            },
            (newText, oldText) => {
                if (oldText && newText !== oldText) {
                    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy)
                }
                runOnJS(setDisplayText)(newText)
                //   scheduleOnRN(()=>setDisplayText(newText))
            },
            [translation]
        )
        return (
            <Reanimated.View style={style}>
                <Text className="text-white">{displayText}</Text>
            </Reanimated.View >
        )
    }

    // 当滑动完全打开（拖到底）时执行删除逻辑
    const handleSwipeOpen = (direction: "left" | "right") => {
        if (direction === "left") {
            // 延迟执行删除，避免视觉突兀
            // setTimeout(() => {
            //     onDelete(item.id)
            //     // swipeableRef.current?.close() // 关闭 Swipeable
            // }, 120)
        }
    }
    const handleSwipeClose = () => {
        console.log("close")
        console.log("displayText", displayText)
    }
    return (
        <ReanimatedSwipeable
            friction={2}
            renderRightActions={RenderRightActions}
            onSwipeableOpen={handleSwipeOpen}
            onSwipeableWillClose={handleSwipeClose}
        // onSwipeableClose={handleSwipeClose}
        >
            <TouchableOpacity activeOpacity={0.9} style={styles.item}>
                <Text style={styles.title}>{item.title}</Text>
            </TouchableOpacity>
        </ReanimatedSwipeable>
    )
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: "#fff",
        padding: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 16,
    },
    deleteContainer: {
        justifyContent: "center",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        flex: 1,
    },
    deleteText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
})
