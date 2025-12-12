import { register } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Text } from "@/components/ui/text"
import { useAuthStore } from "@/store/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import CryptoJS from "crypto-js"
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
    username: z.string().nonempty("Please enter the username"),
    firstName: z.string(),
    lastName: z.string()
})
export default function Register() {
    const router = useRouter()
    const { top } = useSafeAreaInsets()
    const { setToken, setUserInfo } = useAuthStore()
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            username: "",
            email: "",
            password: "",
            firstName: "",
            lastName: ""
        },
        resolver: zodResolver(schema)
    })
    const { mutate: mutateRegister, isPending } = useMutation({
        mutationFn: register,
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

    const handleSignUp = (data: z.infer<typeof schema>) => {
        const hashedPassword = CryptoJS.SHA256(data.password).toString(CryptoJS.enc.Hex)
        mutateRegister({
            ...data,
            password: hashedPassword
        })
    }
    return (
        <KeyboardAwareScrollView className="flex-1" bottomOffset={28} showsVerticalScrollIndicator={false}>
            <View style={{ paddingTop: top }} className="flex-1 p-4 gap-y-4">
                <Text className="text-center" variant="h2">Register</Text>
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
                                autoCapitalize="none" />
                        )} />
                    {errors.email?.message && <Text>{errors.email.message}</Text>}
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
                                placeholder="Please enter your password"
                                autoCapitalize="none"
                                secureTextEntry
                            />
                        )} />
                    {errors.password?.message && <Text>{errors.password.message}</Text>}
                </View>
                <View className="gap-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Controller
                        name="username"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            < Input
                                id="username"
                                value={value}
                                onChangeText={onChange}
                                placeholder="Please enter your username"
                                autoCapitalize="none"
                            />
                        )} />
                    {errors.username?.message && <Text>{errors.username.message}</Text>}

                </View>
                <View className="gap-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Controller
                        name="firstName"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            < Input
                                id="firstName"
                                value={value}
                                onChangeText={onChange}
                                placeholder="Please enter your first name"
                                autoCapitalize="none"
                            />
                        )} />
                    {errors.firstName?.message && <Text>{errors.firstName.message}</Text>}
                </View>
                <View className="gap-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Controller
                        name="lastName"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            < Input
                                id="lastName"
                                value={value}
                                onChangeText={onChange}
                                placeholder="Please enter your last name"
                                autoCapitalize="none"
                            />
                        )} />
                    {errors.lastName?.message && <Text>{errors.lastName.message}</Text>}
                </View>
                <Button disabled={isPending} onPress={handleSubmit(handleSignUp)}>
                    {isPending && <View className="pointer-events-none animate-spin">
                        <Icon as={Loader2} className="text-primary-foreground" />
                    </View>}
                    <Text>Sign up</Text>
                </Button>
                <View className="flex-row justify-center">
                    <Text className="flex flex-row items-center justify-center">Already have an account? &nbsp;</Text>
                    <TouchableOpacity onPress={() => router.replace("/login")}><Text className="text-blue-300">Sign in</Text></TouchableOpacity>
                </View>
            </View>
        </KeyboardAwareScrollView>
    )
}