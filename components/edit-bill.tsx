import { ChatRecord } from "@/store/record"
import { format } from "date-fns"
import { memo, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { View } from "react-native"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

export const EditBill = memo(({ editRecordInfo }: { editRecordInfo: ChatRecord }) => {
    const { control, handleSubmit, formState: { } } = useForm({
        defaultValues: editRecordInfo
    })
    useEffect(() => {
        console.log("mounted")
    }, [])
    return (
        <View className="gap-y-3">
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
                        <Input value={String(value)} onChangeText={onChange} keyboardType="numeric" />
                    )} />
            </View>
            <View className="gap-y-2">
                <Label>Date</Label>
                <Controller
                    name="date"
                    control={control}
                    render={({ field: { value } }) => (
                        <Input value={format(value,"yyyy-MM-dd HH:mm:ss")} readOnly />
                    )} />
            </View>
        </View>
    )
})
EditBill.displayName = "EditBill"