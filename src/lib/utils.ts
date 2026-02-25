import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isSameMonth, isSameYear } from "date-fns"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatScheduleTime(startDate: string, endDate?: string) {
    if (!startDate) return "";

    const start = parseISO(startDate);
    if (!endDate || startDate === endDate) {
        return format(start, 'dd/MM/yyyy');
    }

    const end = parseISO(endDate);

    if (isSameMonth(start, end) && isSameYear(start, end)) {
        return `${format(start, 'dd')} - ${format(end, 'dd/MM/yyyy')}`;
    }

    if (isSameYear(start, end)) {
        return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM/yyyy')}`;
    }

    return `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
}
