import { http } from "@/lib/request"
import { Bill } from "./bill/types"

export const createBillByChat = (data: { prompt: string, today: Date, timezone: string }) => {
    return http.post<string | Bill[]>("/chat", data)
}

