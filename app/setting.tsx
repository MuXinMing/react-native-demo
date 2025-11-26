import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { useAuthStore } from "@/store/auth"
import { useState } from "react"
import { ScrollView } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

const Setting = () => {
    const { bottom } = useSafeAreaInsets()
    const { logout } = useAuthStore()
    const [open, setOpen] = useState(false)
    const [buttonHeight, setButtonHeight] = useState(0)
    return (
        <SafeAreaView className="flex-1">
            <ScrollView
                contentContainerClassName="px-3"
                contentContainerStyle={{ paddingBottom: buttonHeight + 12 }}
            >
                <Text variant="h2">Setting</Text>
                {/* <View style={{ height: 1000, backgroundColor: "purple" }}></View> */}
            </ScrollView>
            <Button
                variant="destructive"
                className="absolute left-3 right-3 bottom-3"
                style={{ bottom }}
                onPress={() => setOpen(true)}
                onLayout={(event) => setButtonHeight(event.nativeEvent.layout.height)}
            >
                <Text>Log out</Text>
            </Button>
            <AlertDialog open={open}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-center">Log out</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">Are you sure to log out?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="flex-1" onPress={() => setOpen(false)}>
                            <Text>Cancel</Text>
                        </AlertDialogCancel>
                        <AlertDialogAction className="flex-1" onPress={() => logout()}>
                            <Text>Confirm</Text>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SafeAreaView>
    )
}
export default Setting