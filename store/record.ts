import { create } from "zustand"

export interface ChatRecord {
    id: string,
    amount: string,
    category: string,
    type: "expense" | "income",
    note: string,
    date: string,
}
interface RecordState {
    refresh: boolean
    setRefresh: () => void
}
export const useRecordStore = create<RecordState>((set, get) => ({
    refresh: false,
    setRefresh: () => set({ refresh: !get().refresh })
}))