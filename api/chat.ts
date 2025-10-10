import { axiosDelete, get, PageResponse } from "@/lib/request"
import { ChatRecord } from "@/store/record"

export const getRecords = (params: { page: number, pageSize: number, date: string | Date, timezone: string }) => {
    return get<PageResponse<ChatRecord>>("/chat/records", { params })
}
export const deleteRecord = (id: string) => {
    return axiosDelete(`/chat/record/${id}`)
}