import { updateUser } from "@/api/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Text } from "@/components/ui/text"
import { useAuthStore } from "@/store/auth"
import { useMutation } from "@tanstack/react-query"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"

const User = () => {
    const { userInfo, setUserInfo, logout } = useAuthStore()
    const { control, formState: { errors }, setValue, handleSubmit } = useForm({
        defaultValues: {
            username: "",
            firstName: "",
            lastName: ""
        },
    })
    useEffect(() => {
        setValue("username", userInfo?.username || "")
        setValue("firstName", userInfo?.firstName || "")
        setValue("lastName", userInfo?.lastName || "")
    }, [])

    const { mutate, isPending } = useMutation({
        mutationKey: [],
        mutationFn: updateUser,
        onSuccess: ({ data: userInfo }) => {
            console.log("return userInfo", userInfo)
            setUserInfo(userInfo)
            Toast.show({
                type: "success",
                text1: "Update user successful"
            })
        },
        onError: (error: any) => {
            const { code } = error || {}
            if (code === 40009) {
                Toast.show({
                    type: "error",
                    text1: error.message
                })
            }
        }
    })
    return (
        <SafeAreaView>
            <View className="p-4 gap-y-4">
            <View className="gap-y-2">
                    <Label>Email</Label>
                    <Input value={userInfo?.email} editable={false}/>
                </View>
                <View className="gap-y-2">
                    <Label>Username</Label>
                    <Controller
                        name="username"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Input
                                value={value}
                                onChangeText={onChange}
                                placeholder="Please enter your username"
                                autoCapitalize="none"
                            />
                        )} />
                </View>
                <View className="gap-y-2">
                    <Label>First name</Label>
                    <Controller
                        name="firstName"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Input
                                value={value}
                                onChangeText={onChange}
                                placeholder="Please enter your first name"
                                autoCapitalize="none"
                                keyboardType="url"
                            />
                        )} />
                </View>
                <View className="gap-y-2">
                    <Label>Last name</Label>
                    <Controller
                        name="lastName"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Input
                                value={value}
                                onChangeText={onChange}
                                placeholder="Please enter your last name"
                                autoCapitalize="none"
                                keyboardType="url"
                            />
                        )} />
                </View>
                <Button disabled={isPending} onPress={handleSubmit((data) => mutate(data))}>
                    <Text>Update</Text>
                </Button>
            </View>
        </SafeAreaView>
    )

}
export default User