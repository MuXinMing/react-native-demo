import { http, PageResponse } from "@/lib/request"
import { Bill, BillCategory, BillInfo, MonthlyBillStatistics } from "./types"

//账单分页
export const getBillPage = (params: { page: number, pageSize: number, date: string | Date, timezone: string }) => {
    return http.get<PageResponse<Bill>>("/bills", { params })
}
//账单列表
export const getBillList = () => {
    return http.get<Bill[]>("/bills/all")
}
//账单详情
export const getBillInfo = (id: string) => {
    return http.get<BillInfo>(`/bills/${id}`)
}
//更新账单
export const updateBill = ({ id, category, type, note, amount, date }: { id: string, category: BillCategory, type: "income" | "expense", note: string, amount: string, date: string }) => {
    return http.put(`/bills/${id}`, {
        category,
        type,
        note,
        amount,
        date
    })
}
//删除账单
export const deleteBill = (id: string) => {
    return http.delete(`/bills/${id}`)
}

export const getMonthlyBillStatistics = (params: { year: string, month: string, timezone: string }) => {
    return http.get<MonthlyBillStatistics>("/bills/statistics/monthly", { params })
}