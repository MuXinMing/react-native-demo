import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import Toast from "react-native-toast-message"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { useAuthStore } from "./auth"

interface State {
    accessToken: string
    getAsrAccessToken: () => void
    getAsrData: (payload: AsrPayload) => Promise<string>
}
interface AsrPayload {
    format?: string
    rate?: number
    channel?: 1 | 2
    cuid?: string
    speech: string
    len: number
}
const apiKey = "rWyp0CBXjQhmYtsjjx2J8GDr"
const secretKey = "yCTR3hLSpct81NKHBR6eBY7tHENUwFsW"

export const useAsrStore = create<State>()(persist((set, get) => ({
    accessToken: "",
    getAsrAccessToken: async () => {
        try {
            console.log("获取asrToken")
            const url = `https://aip.baidubce.com/oauth/2.0/token?client_id=${apiKey}&client_secret=${secretKey}&grant_type=client_credentials`
            const result = await axios.post(url)
            const { data } = result || {}
            const { access_token, error, error_description } = data || {}
            if (error) {
                Toast.show({
                    type: "error",
                    text1: `${error}:${error_description}`
                })
                return
            }
            set({
                accessToken: access_token || ""
            })
        } catch (error) {
            throw new Error(error as any)
        }
    },
    getAsrData: async ({ format = "m4a", rate = 16000, channel = 1, cuid = useAuthStore.getState().userInfo?.id, speech = "", len = 0 }) => {
        console.log("🚀 ~ asr.ts:45 ~ cuid:", cuid)
        let token = get().accessToken
        if (!token) {
            await get().getAsrAccessToken()
            token = get().accessToken
        }
        const BAIDU_URL = "https://vop.baidu.com/server_api"
        const payload = {
            format,
            rate,
            channel,
            cuid,
            token,
            speech,
            len,
        }
        const { data } = await axios.post(BAIDU_URL, payload)
        const { err_no, err_msg, result = [] } = data
        console.log("🚀 ~ asr.ts:58 ~ data:", data)
        if (err_no === 0) {
            return result.join("").trim()
        } else {
            //token过期重试
            if (err_no === 110 || err_no === 111) {
                await get().getAsrAccessToken()
                return await get().getAsrData({ speech, len })
            }
            Toast.show({
                type: "error",
                text1: err_msg
            })
            return ""
        }
    }
}), {
    name: "asr",
    storage: createJSONStorage(() => AsyncStorage),
    partialize(state) {
        return { accessToken: state.accessToken }
    },
}))