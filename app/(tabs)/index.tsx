import { deleteRecord, getRecords } from "@/api/chat"
import { BillItem } from "@/components/bill-item"
import { EditBill } from "@/components/edit-bill"
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Text } from "@/components/ui/text"
import { ChatRecord } from "@/store/record"
import { TZDate } from "@date-fns/tz"
import { FlashList } from "@shopify/flash-list"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import * as Haptics from "expo-haptics"
import { ArrowRight, Loader2, Pencil, Trash2 } from "lucide-react-native"
import { Dispatch, memo, SetStateAction, useEffect, useMemo, useRef, useState } from "react"
import { Alert, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import ReanimatedSwipeable, { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import Reanimated, { SharedValue, useAnimatedReaction, useAnimatedStyle } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { runOnJS } from "react-native-worklets"

const RightAction = ({ translation, status, setStatus }: { translation: SharedValue<number>, status: string, setStatus: Dispatch<SetStateAction<string>> }) => {
  const style = useAnimatedStyle(() => {
    // console.log("translation", translation.value)
    return {
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
      //   scheduleOnRN(()=>setDisplayText(newText))
    },
    [translation]
  )
  return (
    <Reanimated.View className="flex-1 justify-center items-end px-4 rounded-lg" style={style}>
      <Text className="text-white">
        <Icon as={status === "cancel" ? ArrowRight : status === "edit" ? Pencil : Trash2} size={20} color="white" />
      </Text>
    </Reanimated.View >
  )
}
const ListItem = memo(({ record, onDelete, onEdit }: { record: ChatRecord, onDelete: (id: string) => void, onEdit: (id: string) => void }) => {
  const reanimatedSwipeAbleRef = useRef<SwipeableMethods | null>(null)
  const [isSwipe, setIsSwipe] = useState(false)
  const [status, setStatus] = useState("")
  const onSwipeableWillClose = () => {
    setIsSwipe(false)
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
      enableTrackpadTwoFingerGesture
      onSwipeableOpenStartDrag={() => setIsSwipe(true)}
      onSwipeableWillOpen={() => { reanimatedSwipeAbleRef.current?.close() }}
      onSwipeableWillClose={() => onSwipeableWillClose()}
      friction={2}>
      <BillItem record={record} className={isSwipe ? "rounded-tr-none rounded-br-none" : ""} />
    </ReanimatedSwipeable>
  )
})
ListItem.displayName = "ListItem"

export default function HomeScreen() {
  const queryClient = useQueryClient()
  const { top, bottom } = useSafeAreaInsets()
  const [selectDate, setSelectDate] = useState(new Date())
  const [showDate, setShowDate] = useState(false)
  const handleConfirm = (date: Date) => {
    setSelectDate(date)
    setShowDate(false)
  }
  const handleCancel = () => {
    setShowDate(false)
  }
  const [refreshing, setRefreshing] = useState(false)
  const { data: billRecordData, hasNextPage, error, isFetching, fetchNextPage } = useInfiniteQuery({
    queryKey: ["chatRecords"],
    initialPageParam: {
      page: 1,
      pageSize: 10,
    },
    retry: false,
    queryFn: async ({ pageParam: { page, pageSize } }) => {
      const date = format(selectDate, "yyyy-MM-dd")
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      console.log("date", date)

      const { data } = await getRecords({ page, pageSize, date, timezone })
      console.log("data", data)
      return data
    },
    getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
      // console.log("lastPage", lastPage)
      // console.log("allPages", allPages)
      // console.log("lastPageParam", lastPageParam) 
      const { hasNext, page, pageSize } = lastPage
      if (hasNext)
        return {
          pageSize,
          page: page + 1
        }
      return null
    },
  })
  const records = useMemo(() => billRecordData?.pages.reduce<ChatRecord[]>((prev, cur) => prev.concat(cur.items), []) || [], [billRecordData])
  const { mutate } = useMutation({
    mutationFn: deleteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatRecords"] })
    },
    onError: (error) => {
      console.log("delete error", error)
    }
  })
  const handleDeleteRecord = async (id: string) => {
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
  }
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRecordInfo, setEditRecord] = useState<ChatRecord | null>(null)
  const handleEditRecord = (id: string) => {
    const recordInfo = records.find(record => record.id === id)
    setEditRecord(recordInfo || null)
    setDialogOpen(true)
  }
  useEffect(() => {
    !isFetching && queryClient.resetQueries({ queryKey: ["chatRecords"] })
  }, [selectDate])
  return (
    <View className="flex-1 h-full p-3 pb-0" style={{ paddingTop: top }}>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-medium">{selectDate.toLocaleDateString()}</Text>
        <Button onPress={() => setShowDate(true)}><Text>选择日期</Text></Button>
      </View>
      <DateTimePickerModal isVisible={showDate} date={selectDate} mode="date" onConfirm={handleConfirm} onCancel={handleCancel} modalStyleIOS={{ paddingBottom: bottom }} />
      <View className="flex-row justify-between gap-x-2 mb-3">
        <View className="flex-1 flex-row justify-between items-center p-3 rounded-lg bg-background">
          <Text>收入</Text>
          <Text className="text-green-500">+ ¥10000</Text>
        </View>
        <View className="flex-1 flex-row justify-between items-center p-3 rounded-lg bg-background">
          <Text>支出</Text>
          <Text className="text-red-500">- ¥1000</Text>
        </View>
      </View>
      <GestureHandlerRootView>
        <FlashList
          contentContainerClassName="pb-3"
          showsVerticalScrollIndicator={false}
          data={records}
          onEndReached={() => {
            hasNextPage && fetchNextPage()
          }}
          onEndReachedThreshold={0.1}
          refreshing={refreshing}
          onRefresh={async () => {
            if (!isFetching) {
              setRefreshing(true)
              await queryClient.resetQueries({ queryKey: ["chatRecords"] })
              setRefreshing(false)
            }
          }}
          renderItem={({ item }) => <ListItem key={item.id} record={item} onDelete={handleDeleteRecord} onEdit={handleEditRecord} />}
          ItemSeparatorComponent={() => <View className="h-3"></View>}
          ListEmptyComponent={() => (!refreshing && !isFetching && <Text className="text-center">No data</Text>)}
          ListFooterComponent={() => (
            !refreshing && isFetching && <View className="items-center mt-3"><Text><View className="pointer-events-none animate-spin"><Icon as={Loader2} size={24} className="text-gray-500" /></View></Text></View>
          )}
        />
      </GestureHandlerRootView>
      <AlertDialog open={dialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit record</AlertDialogTitle>
          </AlertDialogHeader>
          {<EditBill editRecordInfo={editRecordInfo!} />}
          <AlertDialogFooter>
            <Button className="flex-1" variant="outline" onPress={() => setDialogOpen(false)}><Text>Cancel</Text></Button>
            <Button className="flex-1"><Text>Confirm</Text></Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  )
}


