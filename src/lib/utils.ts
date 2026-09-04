import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isSameMonth, isSameYear, isValid } from "date-fns"
import { parseSafeDate } from "./date-utils"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatScheduleTime(startDate: string | null | undefined, endDate?: string | null) {
    if (!startDate) return "";

    try {
        const start = parseSafeDate(startDate);
        if (!start || !isValid(start)) return startDate || "";

        if (!endDate || startDate === endDate) {
            return format(start, 'dd/MM/yyyy');
        }

        const end = parseSafeDate(endDate);
        if (!end || !isValid(end)) {
            return format(start, 'dd/MM/yyyy');
        }

        if (isSameMonth(start, end) && isSameYear(start, end)) {
            return `${format(start, 'dd')} - ${format(end, 'dd/MM/yyyy')}`;
        }

        if (isSameYear(start, end)) {
            return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM/yyyy')}`;
        }

        return `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
    } catch {
        return startDate || "";
    }
}
