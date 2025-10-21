import { BusFront, ChefHat, Gamepad2, HandCoins, Hospital, House, LucideIcon, ShoppingBag, Wallet, X } from "lucide-react-native"

// type:catering, shopping, transportation, entertainment, life, medical, salary, investment, other;
export const BillCategoryList = ["catering", "shopping", "transportation", "entertainment", "life", "medical", "salary", "investment", "other"] as const
export type BillCategory = typeof BillCategoryList[number]

export const BillCategoryIconMapping: Record<BillCategory, LucideIcon> = {
    catering: ChefHat,
    shopping: ShoppingBag,
    transportation: BusFront,
    entertainment: Gamepad2,
    life: House,
    medical: Hospital,
    salary: Wallet,
    investment: HandCoins,
    other: X
}
export interface Bill {
    id: string
    category: BillCategory
    note: string
    date: string
    amount: string
    type: "expense" | "income",
}
export type BillInfo = Bill

export interface MonthlyBillStatistics{
    balance:string
    income:string
    expense:string
}