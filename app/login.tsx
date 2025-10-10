import { login } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Text } from "@/components/ui/text"
import { useAuthStore } from "@/store/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import { Loader2 } from "lucide-react-native"
import { Controller, useForm } from "react-hook-form"
import { TouchableOpacity, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-controller"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"

import { z } from "zod"

const schema = z.object({
    email: z.string().nonempty({ error: "Please enter the email", abort: true }).check(z.email("Please enter the valid email")),
    password: z.string().nonempty("Please enter the password"),
})

export default function Login() {
    const router = useRouter()
    const { top } = useSafeAreaInsets()
    const { setToken, setUserInfo } = useAuthStore()
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: "1065641447@qq.com",
            password: "123456"
        },
        resolver: zodResolver(schema)
    })

    const { mutate: mutateLogin, isPending } = useMutation({
        mutationFn: login,
        onSuccess: ({ data }) => {
            const { token, userInfo } = data
            setToken(token)
            setUserInfo(userInfo)
        },
        onError: (error) => {
            Toast.show({
                type: "error",
                text1: error.message
            })
        }
    })
    return (
        <KeyboardAwareScrollView className="flex-1" bottomOffset={28} showsVerticalScrollIndicator={false}>
            <View className="flex-1 gap-y-4 p-4" style={{ paddingTop: top }}>
                <Text className="text-center" variant="h2">Login</Text>
                <View className="gap-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Input
                                id="email"
                                value={value}
                                onChangeText={onChange}
                                placeholder="Please enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none" />
                        )} />
                    {errors.email?.message && <Text className="text-red-500">{errors.email.message}</Text>}
                </View>
                <View className="gap-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Controller
                        name="password"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Input
                                id="password"
                                value={value}
                                onChangeText={onChange}
                                placeholder="Please enter you password"
                                autoCapitalize="none"
                                secureTextEntry
                            />
                        )} />
                    {errors.password?.message && <Text className="text-red-500">{errors.password.message}</Text>}
                </View>
                <Button disabled={isPending} onPress={handleSubmit((data) => mutateLogin(data))}>
                    {isPending && <View className="pointer-events-none animate-spin">
                        <Icon as={Loader2} className="text-primary-foreground" />
                    </View>}
                    <Text>Sign in</Text>
                </Button>
                <View className="flex-row justify-center">
                    <Text className="flex flex-row items-center justify-center">Don&apos;t have an account ? &nbsp;</Text>
                    <TouchableOpacity onPress={() => router.replace("/register")}><Text className="text-blue-300">Sign up</Text></TouchableOpacity>
                </View>

                {/* <ActivityIndicator color={"purple"} size={"large"}></ActivityIndicator> */}
            </View>
        </KeyboardAwareScrollView>
    )
}