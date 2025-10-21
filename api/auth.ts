import { http } from "@/lib/request"
import { UserInfo } from "@/store/auth"

export const login = (data: { email: string, password: string }) => {
    return http.post<{ userInfo: UserInfo, token: string }>("/auth/login", data)
}

export const register = (data: { email: string, password: string, username: string }) => {
    return http.post<{ userInfo: UserInfo, token: string }>("/auth/register", data)
}