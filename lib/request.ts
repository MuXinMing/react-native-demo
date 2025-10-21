import { useAuthStore } from "@/store/auth"
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"
import Toast from "react-native-toast-message"

export interface ResponseProps<T> {
    code: number
    message?: string
    data: T
    success: boolean
    timestamp: number
}
export interface PageResponse<T> {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
    items: T[]
}

const instance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 10 * 1000
})
instance.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
instance.interceptors.response.use((response: AxiosResponse) => {
    const { data } = response
    return Promise.resolve(data)
}, (error: AxiosError) => {
    // console.log("error", error.request)
    const { response } = error
    if (response) {
        const { status } = response
        if (status === 401 || status === 403) {
            useAuthStore.getState().logout()
        }
    } else {
        Toast.show({
            type: "error",
            text1: error.message
        })
    }
    return Promise.reject(error.response?.data || {})
})
export const http = {
    get: <T = any>(
        url: string,
        config?: AxiosRequestConfig & { noToken?: boolean }
    ) => instance.get<T, ResponseProps<T>>(url, config),
    post: <T = any, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig & { noToken?: boolean }
    ) => instance.post<T, ResponseProps<T>, D>(url, data, config),
    put: <T = any, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig & { noToken?: boolean }
    ) => instance.put<T, ResponseProps<T>>(url, data, config),
    patch: <T = any, D = any>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig & { noToken?: boolean }
    ) => instance.patch<T, ResponseProps<T>, D>(url, data, config),
    delete: <T = any>(
        url: string,
        config?: AxiosRequestConfig & { noToken?: boolean }
    ) => instance.delete<T, ResponseProps<T>>(url, config)
}
// export const get = <T = any>(
//     url: string,
//     config?: AxiosRequestConfig & { noToken?: boolean }
// ) => instance.get<T, ResponseProps<T>>(url, config)

// export const post = <T = any, D = any>(
//     url: string,
//     data?: D,
//     config?: AxiosRequestConfig & { noToken?: boolean }
// ) => instance.post<T, ResponseProps<T>, D>(url, data, config)

// export const patch = <T = any, D = any>(
//     url: string,
//     data?: D,
//     config?: AxiosRequestConfig & { noToken?: boolean }
// ) => instance.patch<T, ResponseProps<T>, D>(url, data, config)

// export const put = <T = any, D = any>(
//     url: string,
//     data?: D,
//     config?: AxiosRequestConfig & { noToken?: boolean }
// ) => instance.put<T, ResponseProps<T>>(url, data, config)

// export const axiosDelete = <T = any>(url: string, config?: AxiosRequestConfig & { noToken?: boolean }) => instance.delete<T, ResponseProps<T>>(url, config)

export default instance