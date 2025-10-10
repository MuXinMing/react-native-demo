import { updateUser } from "@/api/user"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
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


export default function Profile() {
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
    const handleLogout = () => {
        logout()
    }
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
    // useEffect(() => {
    //     setForm((prev) => ({
    //         ...prev,
    //         username: userInfo?.username || "",
    //         firstName: userInfo?.firstName || "",
    //         lastName: userInfo?.lastName || ""
    //     }))
    // }, [])
    // const getProfile = async () => {
    //     try {
    //         setLoading(true)
    //         const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user`, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         })
    //         const data = await response.json()
    //         if (response.status !== 200) {
    //             Alert.alert(data.error)
    //             throw new Error(data)
    //         }

    //         const { userInfo } = data
    //         console.log(userInfo, 'userInfo');
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             Alert.alert(error.message)
    //         }
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    return (
        <SafeAreaView className="p-4 gap-y-4">
            <Text variant="h4">Email:{userInfo?.email}</Text>
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
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button>
                        <Text>Log out</Text>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-center">Log out</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">Are you sure to log out?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="flex-1">
                            <Text>Cancel</Text>
                        </AlertDialogCancel>
                        <AlertDialogAction className="flex-1" onPress={() => logout()}>
                            <Text>Confirm</Text>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SafeAreaView >
    )
}