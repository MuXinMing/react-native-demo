import { getRecords } from "@/api/chat"
import { create } from "zustand"

export interface ChatRecord {
    id: string,
    amount: number,
    category: string,
    type: "expense" | "income",
    note: string,
    date: string,
}
interface RecordState {
    records: ChatRecord[],
    getRecords: (params: any) => void
}
export const useRecordStore = create<RecordState>((set) => ({
    records: [],
    getRecords: async ({ page, pageSize, date }: any = {}) => {
        const { data } = await getRecords({ page, pageSize, date })
        const { items } = data
        set({
            records: items
        })
    }
}))