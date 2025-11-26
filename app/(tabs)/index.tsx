import { deleteBill, getBillList, getMonthlyBillStatistics } from "@/api/bill"
import { Bill } from "@/api/bill/types"
import { BillItem } from "@/components/bill-item"
import { Icon } from "@/components/ui/icon"
import { Separator } from "@/components/ui/separator"
import { Text } from "@/components/ui/text"
import VoiceBookkeeping from "@/components/voice-bookkeeping"
import { NPPlus, NPRound } from "@/lib/math"
import { FlashList } from "@shopify/flash-list"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, getYear, setDefaultOptions } from "date-fns"
import { zhCN } from "date-fns/locale"
import * as Haptics from "expo-haptics"
import { useRouter } from "expo-router"
import { ArrowRight, Menu, Pencil, Search, Trash2 } from "lucide-react-native"
import { Dispatch, Fragment, memo, SetStateAction, useCallback, useMemo, useRef, useState } from "react"
import { Alert, NativeScrollEvent, NativeSyntheticEvent, TouchableOpacity, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import ReanimatedSwipeable, { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable"
import { default as Animated, interpolate, default as Reanimated, SharedValue, useAnimatedReaction, useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { runOnJS } from "react-native-worklets"

setDefaultOptions({ locale: zhCN })
const RightAction = ({ translation, status, setStatus }: { translation: SharedValue<number>, status: string, setStatus: Dispatch<SetStateAction<string>> }) => {
  const style = useAnimatedStyle(() => {
    return {
      //偏移量最小16，为图标的paddingRight距离
      paddingRight: Math.max(Math.abs(translation.value) - 36, 16),
      backgroundColor: translation.value >= -52 ? "grey" : translation.value >= -72 ? "#22c55e" : "#ef4444"
    }
  })

  useAnimatedReaction(
    () => {
      let newStatus = ""
      if (translation.value >= -52) {
        newStatus = "cancel"
      } else if (translation.value <= -52 && translation.value >= -72) {
        newStatus = "edit"
      } else if (translation.value <= -72) {
        newStatus = "delete"
      }
      return newStatus
    },
    (newStatus, oldStatus) => {
      if (oldStatus && newStatus !== oldStatus) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy)
      }
      runOnJS(setStatus)(newStatus)
    },
    [translation]
  )
  return (
    <Reanimated.View className="flex-1 justify-center items-end px-4" style={style}>
      <Text className="text-white">
        <Icon as={status === "cancel" ? ArrowRight : status === "edit" ? Pencil : Trash2} size={20} color="white" />
      </Text>
    </Reanimated.View >
  )
}
const ListItem = memo(({ className, record, onDelete, onEdit }: { className?: string, record: Bill, onDelete: (id: string) => void, onEdit: (id: string) => void }) => {
  const reanimatedSwipeAbleRef = useRef<SwipeableMethods | null>(null)
  const [status, setStatus] = useState("")

  const onSwipeableWillClose = () => {
    if (status === "edit") {
      onEdit(record.id)
    }
    if (status === "delete") {
      onDelete(record.id)
    }
  }
  return (
    <ReanimatedSwipeable
      ref={reanimatedSwipeAbleRef}
      renderRightActions={(_, translation) => <RightAction status={status} setStatus={setStatus} translation={translation} />}
      onSwipeableWillOpen={() => { reanimatedSwipeAbleRef.current?.close() }}
      onSwipeableWillClose={() => onSwipeableWillClose()}
      friction={2}
      activateAfterLongPress={300}
    >
      <BillItem record={record} className={className} />
    </ReanimatedSwipeable>
  )
})
ListItem.displayName = "ListItem"
const RenderItem = memo(({ item: { date, income, expense, items }, onDelete, onEdit }: { item: { date: string, income: string, expense: string, items: Bill[] }, onDelete: (id: string) => void, onEdit: (id: string) => void }) => {
  console.log("render item", date)
  return (
    <View className="gap-y-2">
      <View className="flex-row justify-between">
        <View className="flex-row gap-x-2">
          <Text className="text-xs font-medium">{getYear(date) !== new Date().getFullYear() ? format(date, "yyyy-MM-dd") : format(date, "MM-dd")}</Text>
          <Text className="text-xs text-gray-500">{format(date, "EE")}</Text>
        </View>
        <View className="flex-row gap-x-4">
          <View className="flex-row gap-x-2">
            <Text className="text-xs">收入</Text>
            <Text className="text-xs text-green-500">{income}</Text>
          </View>
          <View className="flex-row gap-x-2">
            <Text className="text-xs">支出</Text>
            <Text className="text-xs text-red-500">{expense}</Text>
          </View>
        </View>
      </View>
      <View className="bg-background rounded-lg overflow-hidden">
        {items.map((record, recordIndex) => (
          <Fragment key={record.id}>
            <ListItem
              record={record}
              onDelete={onDelete}
              onEdit={onEdit}
            />
            {recordIndex !== items.length - 1 && <Separator className="bg-border/50" />}
          </Fragment>
        ))}
      </View>
    </View>
  )
})
RenderItem.displayName = "RenderItem"

export default function HomeScreen() {
  const { top } = useSafeAreaInsets()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [navBarHeight, setNavBarHeight] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [headerContentHeight, setHeaderContentHeight] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const { data: monthlyStatistics } = useQuery({
    retry: false,
    initialData: {
      balance: "0.00",
      income: "0.00",
      expense: "0.00"
    },
    queryKey: ["monthlyBillStatistics"],
    queryFn: async () => {
      const date = new Date()
      const year = date.getFullYear().toString()
      const month = date.getMonth().toString()
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const { data } = await getMonthlyBillStatistics({ year, month, timezone })
      console.log("data", data)
      return data
    }
  })
  const { data: billList, isFetching } = useQuery({
    retry: false,
    initialData: [],
    queryKey: ["billList"],
    queryFn: async () => {
      const { data } = await getBillList()
      return data || []
    },
  })
  const prevBillListGroupByDateRef = useRef<{ date: string, income: string, expense: string, items: Bill[] }[]>([])
  //按日期分组账单
  const billListGroupByDate = useMemo(() => {
    const map = new Map(prevBillListGroupByDateRef.current.map(item => [item.date, item]))
    const grouped = Object.values(billList.reduce<Record<string, { date: string, income: string, expense: string, items: Bill[] }>>((prev, cur) => {
      const date = format(cur.date, "yyyy-MM-dd")
      if (!prev[date]) {
        prev[date] = { date, income: "0.00", expense: "0.00", items: [] }
      }
      prev[date][cur.type] = NPRound(NPPlus(prev[date][cur.type], cur.amount), 2).toFixed(2)
      prev[date].items.push(cur)
      return prev
    }, {}))

    for (let i = 0; i < grouped.length; i++) {
      const { date, expense, income, items } = grouped[i]
      const group = map.get(date)
      if (group) {
        group.expense = expense
        group.income = income
        group.items = items
      } else {
        map.set(date, {
          date,
          expense,
          income,
          items
        })
      }
    }
    const result = [...map.values()]
    prevBillListGroupByDateRef.current = result
    return result
  }, [billList])
  //删除账单
  const { mutate, isPending: deletePending } = useMutation({
    mutationFn: deleteBill,
    onSuccess: (_, id: string) => {
      // queryClient.setQueryData(["billList"], (old: Bill[]) => old.filter(bill => bill.id !== id))
      queryClient.invalidateQueries({ queryKey: ["billList"] })
      queryClient.invalidateQueries({ queryKey: ["monthlyBillStatistics"] })
    },
    onError: (error) => {
      console.log("delete error", error)
    }
  })
  //删除账单
  const handleDeleteRecord = useCallback(async (id: string) => {
    console.log("id", id)
    Alert.alert("", "Are you sure to delete the record?", [
      {
        text: "Cancel",
        style: "default"
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => mutate(id)
      }
    ])
  }, [])
  const handleEditRecord = useCallback((id: string) => {
    router.push(`/bill/${id}`)
  }, [])

  const scrollY = useSharedValue(0)

  const handleInnerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y
    scrollY.value = y
  }
  const headerPaddingTop = useMemo(() => {
    const result = NPPlus(NPRound(top, 1), navBarHeight)
    return result
  }, [top, navBarHeight])

  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, headerContentHeight],
      [0, -headerContentHeight],
      "clamp"
    )
    return { transform: [{ translateY }] }
  })
  const headerContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, headerContentHeight], [1, 0], "clamp")
    return { opacity }
  })

  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ["billList"] })
    await queryClient.invalidateQueries({ queryKey: ["monthlyBillStatistics"] })
    setRefreshing(false)
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1">
        <VoiceBookkeeping refreshBillList={() => queryClient.invalidateQueries({ queryKey: ["billList"] })} />
        <View className="absolute top-0 left-0 right-0 z-20">
          <View style={{ paddingTop: NPRound(top, 1) }}>
            <View className="flex-row items-center p-3" onLayout={(event) => {
              setNavBarHeight(NPRound(event.nativeEvent.layout.height, 1))
            }}>
              <TouchableOpacity>
                <Icon as={Menu} />
              </TouchableOpacity>
              <Text className="flex-1 text-center">账本</Text>
              <TouchableOpacity>
                <Icon as={Search} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Animated.View className="absolute left-0 right-0 z-10" style={headerStyle}>
          <View style={{ paddingTop: headerPaddingTop }} onLayout={(event) => { setHeaderHeight(NPRound(event.nativeEvent.layout.height, 1)) }}>
            {/* 头部主体内容 */}
            <Animated.View className="p-3" style={headerContentStyle} onLayout={(event) => setHeaderContentHeight(NPRound(event.nativeEvent.layout.height, 1))}>
              <View>
                <Text className="text-sm">本月结余</Text>
                <Text className="text-2xl font-medium">{monthlyStatistics.balance}</Text>
              </View>
              <View className="flex-row gap-x-4">
                <View className="flex-row items-center gap-x-2">
                  <Text className="text-xs">本月收入</Text>
                  <Text className="text-sm font-medium">{monthlyStatistics.income}</Text>
                </View>
                <View className="flex-row items-center gap-x-2">
                  <Text className="text-xs">本月支出</Text>
                  <Text className="text-sm font-medium">{monthlyStatistics.expense}</Text>
                </View>
              </View>
            </Animated.View>
            <Animated.Image source={require("../../assets/images/bg1.avif")} className="absolute inset-0 -z-10" style={[{ height: headerHeight }]} />
          </View>
        </Animated.View>
        <FlashList
          contentContainerClassName="px-3 pb-3"
          contentContainerStyle={{ paddingTop: headerHeight + 12 }}
          data={billListGroupByDate}
          showsVerticalScrollIndicator={false}
          onScroll={handleInnerScroll}
          onRefresh={() => handleRefresh()}
          refreshing={refreshing}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => <RenderItem item={item} onDelete={handleDeleteRecord} onEdit={handleEditRecord} />}
          ListEmptyComponent={() => (!refreshing && !isFetching && <Text className="text-center">No data</Text>)}
          ItemSeparatorComponent={() => <View className="h-3"></View>}
        />
      </View>
    </GestureHandlerRootView>
  )
}


