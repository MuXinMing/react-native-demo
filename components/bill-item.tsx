import { cn } from "@/lib/utils"
import { ChatRecord } from "@/store/record"
import { format } from "date-fns"
import { BusFront, ChefHat, Gamepad2, HandCoins, Hospital, House, ShoppingBag, Wallet, X } from "lucide-react-native"
import { memo } from "react"
import { View } from "react-native"
import { match } from "ts-pattern"
import { Icon } from "./ui/icon"
import { Text } from "./ui/text"
import { formatUtcToZonedTime } from "@/lib/date"

export const BillItem = memo(({ record, className }: { record: ChatRecord, className?: string }) => {
    const iconMapping = {
        catering: ChefHat,
        shopping: ShoppingBag,
        transportation: BusFront,
        entertainment: Gamepad2,
        life: House,
        medical: Hospital,
        salary: Wallet,
        investment: HandCoins,
        other: X
    }
    return (
        <View className={cn("flex-row items-center gap-x-2 p-3 bg-background rounded-lg", className)}>
            <View className="w-10 h-10 justify-center items-center rounded-full bg-muted">
                <Icon as={iconMapping[record.category as keyof typeof iconMapping]} className="text-primary" size={24} />
            </View>
            <View>
                <Text className="text-sm">{record.note}</Text>
                <Text className="text-xs text-muted-foreground">{formatUtcToZonedTime(record.date)}</Text>
            </View>
            <View className="flex-1">
                {match(record)
                    .with({ type: "expense" }, () => (
                        <Text className="text-right text-red-500 font-medium">
                            - ¥{record.amount}
                        </Text>
                    ))
                    .with({ type: "income" }, () => (
                        <Text className="text-right text-green-500 font-medium">
                            + ¥{record.amount}
                        </Text>
                    ))
                    .otherwise(() => null)
                }
            </View>
        </View>
    )
})
BillItem.displayName = "BillItem"