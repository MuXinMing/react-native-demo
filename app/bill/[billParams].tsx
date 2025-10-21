import { getBillInfo, updateBill } from "@/api/bill"
import { BillCategory, BillCategoryIconMapping, BillCategoryList, BillInfo } from "@/api/bill/types"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Text } from "@/components/ui/text"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { TriggerRef } from "@rn-primitives/tooltip"
import { useMutation, useQuery } from "@tanstack/react-query"
import { formatNumeral, NumeralThousandGroupStyles } from "cleave-zen"
import { format } from "date-fns"
import { router, useLocalSearchParams } from "expo-router"
import { Loader2 } from "lucide-react-native"
import { memo, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Keyboard, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"

const BillCategoryItem = memo(({ value, onChange, billCategory }: { value: BillCategory, onChange: (...event: any[]) => void, billCategory: BillCategory }) => {
    const tooltipTriggerRef = useRef<TriggerRef>(null)

    return (
        <Tooltip>
            <TooltipTrigger ref={tooltipTriggerRef}>
                <TouchableOpacity activeOpacity={0.75} onPress={() => onChange(billCategory)} onLongPress={() => tooltipTriggerRef.current?.open()}>
                    <View className={cn("w-10 h-10 justify-center items-center rounded-full", [value === billCategory ? "bg-primary" : "bg-primary-foreground"])}>
                        <Icon as={BillCategoryIconMapping[billCategory]} size={24} className={cn([value === billCategory ? "text-primary-foreground" : "text-primary"])} />
                    </View>
                </TouchableOpacity>
            </TooltipTrigger>
            <TooltipContent>
                <Text className={cn("text-primary-foreground")}>{billCategory}</Text>
            </TooltipContent>
        </Tooltip>
    )
})
BillCategoryItem.displayName = "BillCategoryItem"
export default function Bill() {
    const { top, bottom } = useSafeAreaInsets()
    const { billParams } = useLocalSearchParams()
    const { control, handleSubmit, setValue } = useForm<BillInfo>({
        defaultValues: {
            id: "",
            category: "other",
            note: "",
            date: new Date().toLocaleDateString(),
            amount: "",
            type: "income"
        }
    })
    const { isFetching } = useQuery({
        queryKey: ["getBillInfo", billParams],
        queryFn: async () => {
            const { data } = await getBillInfo(billParams as string)
            console.log("data", data)
            for (const key in data) {
                const value = data[key as keyof BillInfo]
                setValue(key as keyof BillInfo, value)
            }
            return data
        },
        enabled: billParams !== "new",
        retry: false,
    })
    const [isVisible, setIsVisible] = useState(false)
    const handleConfirm = (date: Date) => {
        setValue("date", date.toISOString())
        setIsVisible(false)
    }
    const handleCancel = () => {
        setIsVisible(false)
    }
    const { mutate, isPending: updatePending } = useMutation({
        mutationFn: updateBill,
        onSuccess: () => {
            router.replace("/")
        },
        onError: (error) => {
            console.log("error", error)
            Toast.show({
                type: "error",
                text1: "Update bill failed"
            })
        }
    })
    if (isFetching) return null
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className="flex-1 gap-y-3 px-3" style={{ paddingTop: top, paddingBottom: bottom }}>
                <Text variant="h2">{billParams === "new" ? "Create bill" : "Edit bill"}</Text>
                <View className="gap-y-2">
                    <Label className="justify-center">Category</Label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <View className="flex-row flex-wrap gap-y-4 gap-x-4">
                                {BillCategoryList.map((billCategory, index) => <BillCategoryItem key={index} value={value} onChange={onChange} billCategory={billCategory} />)}
                            </View>
                        )} />
                </View>
                <View className="gap-y-2">
                    <Label>Type</Label>
                    <Controller
                        name="type"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Select
                                value={{
                                    value,
                                    label: value === "expense" ? "Expense" : "Income"
                                }}
                                onValueChange={(option) => onChange(option?.value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Please select the type" />
                                </SelectTrigger>
                                <SelectContent className="w-full" insets={{ left: 12, right: 12 }}>
                                    <SelectGroup>
                                        {[
                                            {
                                                label: "Income",
                                                value: "income"
                                            },
                                            {
                                                label: "Expense",
                                                value: "expense"
                                            }
                                        ].map((type) => (
                                            <SelectItem key={type.value} label={type.label} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )} />
                </View>
                <View className="gap-y-2">
                    <Label>Note</Label>
                    <Controller
                        name="note"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Input value={value} onChangeText={onChange} />
                        )} />
                </View>
                <View className="gap-y-2">
                    <Label>Amount</Label>
                    <Controller
                        name="amount"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Input
                                value={value}
                                onChangeText={onChange}
                                onBlur={() => {
                                    const text = Number(value).toFixed(2)
                                    const newText = formatNumeral(text, {
                                        numeralThousandsGroupStyle: NumeralThousandGroupStyles.NONE,
                                        numeralPositiveOnly: true,
                                        numeralDecimalScale: 2
                                    })
                                    onChange(newText)
                                }}
                                keyboardType="numeric"
                            />
                        )}
                    />
                </View>
                <View className="gap-y-2">
                    <Label>Date</Label>
                    <Controller
                        name="date"
                        control={control}
                        render={({ field: { value } }) => (
                            <>
                                <TouchableOpacity activeOpacity={1} onPress={() => setIsVisible(true)}>
                                    <View pointerEvents="none">
                                        <Input value={format(value, "yyyy-MM-dd HH:mm")} readOnly />
                                    </View>
                                </TouchableOpacity>
                                <DateTimePickerModal isVisible={isVisible} date={new Date(value)} mode="datetime" onConfirm={handleConfirm} onCancel={handleCancel} modalStyleIOS={{ paddingBottom: bottom }} />
                            </>
                        )} />
                </View>
                <Button
                    onPress={() => {
                        Keyboard.dismiss()
                        handleSubmit((data) => {
                            console.log("data", data)
                            mutate(data)
                        })()
                    }}
                    disabled={updatePending}
                >
                    {updatePending && <View className="pointer-events-none animate-spin">
                        <Icon as={Loader2} className="text-primary-foreground" />
                    </View>}
                    <Text>Save</Text>
                </Button>
            </View>
        </TouchableWithoutFeedback >

    )
}