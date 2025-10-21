import { http } from "@/lib/request"
import { UserInfo } from "@/store/auth"

export const updateUser = (data: Pick<UserInfo, "username" | "firstName" | "lastName">) => {
    return http.put<UserInfo>("/user", data)
}