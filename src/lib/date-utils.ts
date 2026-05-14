import { format, parse, isValid, parseISO } from 'date-fns';

export function toSheetDate(dateString: string | null | undefined): string {
    if (!dateString) return "";
    try {
        const date = parseSafeDate(dateString);
        if (!date || !isValid(date)) return "";
        return format(date, 'yyyy-MM-dd');
    } catch {
        return "";
    }
}

export function toInputDate(dateString: string | null | undefined): string {
    if (!dateString) return "";
    try {
        const date = parseSafeDate(dateString);
        if (!date || !isValid(date)) return "";
        return format(date, 'yyyy-MM-dd');
    } catch {
        return "";
    }
}

export function toDisplayDate(dateString: string | null | undefined): string {
    if (!dateString) return "";
    try {
        const date = parseSafeDate(dateString);
        if (!date || !isValid(date)) return "";
        return format(date, 'dd/MM/yyyy');
    } catch {
        return "";
    }
}

export function parseSafeDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;

    // ISO format YYYY-MM-DD
    if (dateString.includes('-')) {
        const d = parseISO(dateString);
        if (isValid(d)) return d;
    }

    // Sheet format DD/MM/YYYY
    if (dateString.includes('/')) {
        const d = parse(dateString, 'dd/MM/yyyy', new Date());
        if (isValid(d)) return d;
    }

    // Fallback
    const d = new Date(dateString);
    if (isValid(d)) return d;

    return null;
}
