import { BillItem } from "@/components/bill-item"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { useAuthStore } from "@/store/auth"
import { useChat } from "@ai-sdk/react"
import { TextStreamChatTransport, UIMessage } from "ai"
import { fetch as expoFetch } from "expo/fetch"
import { isEmpty, isObject } from "lodash-es"
import { useEffect, useRef, useState } from "react"
import { ScrollView, View } from "react-native"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { match, P } from "ts-pattern"

const transform = (str: string) => {
  try {
    const result = JSON.parse(str)
    return result
  } catch {
    return str
  }
}
const Message = ({ message }: { message: UIMessage }) =>
  match(message)
    .with({ role: "user" }, ({ id, parts }) => parts.map((part, index) =>
      match(part)
        .with({ type: "text" }, ({ text }) => <Text key={`${id}-${index}`}>{text}</Text>)
        .otherwise(() => null)
    ))
    .with({ role: "assistant" }, ({ id, parts }) => parts.map((part, index) =>
      match(part)
        .with({ type: "text" }, ({ text }) => {
          const data = transform(text)
          return match(data)
            .with(P.string, (data) => <Text key={`${id}-${index}`}>{data}</Text>)
            .with(P.when(() => isObject(data)), (data) => <BillItem key={index} record={data} />)
            .with(P.when(() => isEmpty(data)), () => <Text key={`${id}-${index}`}>没有数据</Text>)
            .otherwise(() => null)
        })
        .otherwise(() => null)
    )).otherwise(() => null)

export default function App() {
  const { top } = useSafeAreaInsets()
  const { token } = useAuthStore()
  const [input, setInput] = useState("")
  const scrollRef = useRef<ScrollView>(null)
  const { messages, sendMessage, status } = useChat({
    messages: [{
      id: "1",
      role: "assistant",
      parts: [{
        type: "text",
        text: "你好，请问需要记录什么？"
      }],
    }],
    transport: new TextStreamChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: `${process.env.EXPO_PUBLIC_API_URL}/chat`,
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: () => ({
        today: new Date(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    }),
    onFinish: () => {

      // getRecords(new Date().toISOString().split("T")[0])
    },
    onError: error => console.log(error, "ERROR"),
  })
  useEffect(() => {
    scrollRef.current?.scrollToEnd()
  }, [messages])
  return (
    <KeyboardAvoidingView className="flex-1" style={{ paddingTop: top }} behavior="padding">
      <ScrollView ref={scrollRef} className="flex-1 px-3" showsVerticalScrollIndicator={false}>
        {messages.map(m => (
          <View key={m.id} style={{ marginVertical: 8 }}>
            <View className="gap-y-2">
              <Text style={{ fontWeight: 700 }}>{m.role}</Text>
              <Message message={m} />
            </View>
          </View>
        ))}
      </ScrollView>
      <View className="flex-shrink-0 p-3 flex-row gap-x-2 bg-gray-50">
        <Input
          className="flex-1"
          placeholder="Say something..."
          value={input}
          onChange={e => setInput(e.nativeEvent.text)}
          onSubmitEditing={e => {
            e.preventDefault()
            if (!input || status !== "ready") return
            sendMessage({ text: input })
            setInput("")
          }}
          autoCapitalize="none"
          autoFocus
        />
        <Button
          disabled={!input || status !== "ready"}
          onPress={() => {
            sendMessage({ text: input })
            setInput("")
          }}
        >
          <Text>Send</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}