import { Bill } from "@/api/bill/types"
import { createBillByChat } from "@/api/chat"
import { BillItem } from "@/components/bill-item"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Text } from "@/components/ui/text"
import { cn } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { format, getYear } from "date-fns"
import { Loader2, Send } from "lucide-react-native"
import { Fragment, memo, useEffect, useRef, useState } from "react"
import { ScrollView, View } from "react-native"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { match, P } from "ts-pattern"
interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string | Bill[]
}

const Message = memo(({ message }: { message: ChatMessage }) =>
  <View style={{ marginVertical: 8 }}>
    <View className={cn(["gap-y-2"], { "items-end": message.role === "user" })}>
      <Text className="font-bold">{message.role}</Text>
      {
        match(message)
          .with({ role: P.union("user", "assistant"), content: P.string }, ({ id, content }) => <Text key={`${id}`}>{content}</Text>)
          .with({ role: "assistant", content: P.array() }, ({ id, content }) => {
            console.log("🚀 ~ chat.tsx:33 ~ Message ~ content:", content)
            //按日期分组账单
            const billListGroupByDate =
              Object.values(content.reduce<Record<string, { date: string, items: Bill[] }>>((prev, cur) => {
                const date = format(cur.date, "yyyy-MM-dd")
                if (!prev[date]) {
                  prev[date] = { date, items: [] }
                }
                prev[date].items.push(cur)
                return prev
              }, {}))

            return billListGroupByDate.map(({ date, items }, index) => (
              <Fragment key={`${id}-${index}`}>
                <View className="flex-row gap-x-2">
                  <Text className="text-xs font-medium">{getYear(date) !== new Date().getFullYear() ? format(date, "yyyy-MM-dd") : format(date, "MM-dd")}</Text>
                  <Text className="text-xs text-gray-500">{format(date, "EE")}</Text>
                </View>
                <View className="bg-background rounded-lg overflow-hidden">
                  {
                    items.map((billInfo: Bill, index) => (
                      <Fragment key={billInfo.id}>
                        <BillItem key={billInfo.id} record={billInfo} className="rounded-lg" />
                        {index !== items.length - 1 && <Separator className="bg-border/50" />}
                      </Fragment>
                    ))
                  }
                </View>
              </Fragment>
            ))
          })
          .otherwise(() => null)}
    </View>
  </View>)

Message.displayName = "Message"
export default function App() {
  const { top } = useSafeAreaInsets()
  const scrollRef = useRef<ScrollView>(null)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: Math.random().toString(),
    role: "assistant",
    content: "你好，请问需要记录什么？"
  }])

  const { mutate, isPending: createBillPending } = useMutation({
    mutationKey: ["createBillByChat"],
    mutationFn: createBillByChat,
    onSuccess: ({ data }) => {
      console.log("🚀 ~ chat.tsx:72 ~ App ~ data:", data)
      setMessages((prev) => [...prev, { id: Math.random().toString(), role: "assistant", content: data }])
    }
  })

  const sendMessage = () => {
    setMessages((prev) => [...prev, { id: Math.random().toString(), role: "user", content: input }])
    mutate({
      prompt: input,
      today: new Date(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
    setInput("")
  }

  useEffect(() => {
    scrollRef.current?.scrollToEnd()
  }, [messages])

  return (
    <KeyboardAvoidingView className="flex-1" style={{ paddingTop: top }} behavior="padding">
      <ScrollView ref={scrollRef} className="flex-1 px-3" showsVerticalScrollIndicator={false}>
        {messages.map(message => <Message key={message.id} message={message} />)}
      </ScrollView>
      <View className="flex-shrink-0 p-3 flex-row gap-x-2 bg-primary-foreground">
        <Input
          className="flex-1"
          placeholder="Say something..."
          value={input}
          onChange={e => setInput(e.nativeEvent.text)}
          onSubmitEditing={e => {
            e.preventDefault()
            if (!input || createBillPending) return
            sendMessage()
          }}
          autoCapitalize="none"
          autoFocus
        />
        <Button
          disabled={!input || createBillPending}
          onPress={() => sendMessage()}
        >
          {createBillPending ?
            <View className="animate-spin">
              <Icon className="text-primary-foreground" as={Loader2} />
            </View> :
            <Icon as={Send} className="text-primary-foreground"></Icon>}
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}