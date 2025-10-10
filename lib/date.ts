import { TZDate } from "@date-fns/tz"
import { format, FormatOptions } from "date-fns"

export const formatUtcToZonedTime = (
    date: string | Date | number,
    {
        formatStr = "yyyy-MM-dd HH:mm:ss",
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
        formatOptions
    }: { formatStr?: string, timezone?: string, formatOptions?: FormatOptions } = {}) => {
    date = new Date(date)
    const timezoneDate = new TZDate(date, timezone)
    console.log("timezoneDate", timezoneDate)
    return format(timezoneDate, formatStr, formatOptions)
}