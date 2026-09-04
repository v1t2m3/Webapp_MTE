import { format, parse, isValid, parseISO } from 'date-fns';

export function toSheetDate(dateString: string | number | null | undefined): string {
    if (!dateString) return "";
    try {
        const date = parseSafeDate(dateString);
        if (!date || !isValid(date)) return "";
        return format(date, 'yyyy-MM-dd');
    } catch {
        return "";
    }
}

export function toInputDate(dateString: string | number | null | undefined): string {
    if (!dateString) return "";
    try {
        const date = parseSafeDate(dateString);
        if (!date || !isValid(date)) return "";
        return format(date, 'yyyy-MM-dd');
    } catch {
        return "";
    }
}

export function toDisplayDate(dateString: string | number | null | undefined): string {
    if (!dateString) return "";
    try {
        const date = parseSafeDate(dateString);
        if (!date || !isValid(date)) return "";
        return format(date, 'dd/MM/yyyy');
    } catch {
        return "";
    }
}

export function parseSafeDate(dateInput: string | number | null | undefined): Date | null {
    if (!dateInput) return null;

    if (typeof dateInput === 'number') {
        const d = new Date(dateInput);
        return isValid(d) ? d : null;
    }

    if (typeof dateInput !== 'string') return null;

    const trimmed = dateInput.trim();
    if (!trimmed || trimmed === "N/A" || trimmed === "undefined" || trimmed === "null") return null;

    try {
        // Handle ISO format YYYY-MM-DD or ISO string with time
        if (trimmed.includes('-')) {
            const dateOnly = trimmed.split('T')[0].split(' ')[0];
            const parts = dateOnly.split('-');

            if (parts.length === 3) {
                if (parts[0].length === 4) {
                    // YYYY-MM-DD
                    const d = parseISO(trimmed);
                    if (isValid(d)) return d;
                    const d2 = parse(dateOnly, 'yyyy-MM-dd', new Date());
                    if (isValid(d2)) return d2;
                } else if (parts[2].length === 4) {
                    // DD-MM-YYYY
                    const d = parse(dateOnly, 'dd-MM-yyyy', new Date());
                    if (isValid(d)) return d;
                }
            }
        }

        // Handle DD/MM/YYYY or YYYY/MM/DD
        if (trimmed.includes('/')) {
            const dateOnly = trimmed.split('T')[0].split(' ')[0];
            const parts = dateOnly.split('/');

            if (parts.length === 3) {
                if (parts[2].length === 4) {
                    // DD/MM/YYYY
                    const d = parse(dateOnly, 'dd/MM/yyyy', new Date());
                    if (isValid(d)) return d;
                    const d2 = parse(dateOnly, 'd/M/yyyy', new Date());
                    if (isValid(d2)) return d2;
                } else if (parts[0].length === 4) {
                    // YYYY/MM/DD
                    const d = parse(dateOnly, 'yyyy/MM/dd', new Date());
                    if (isValid(d)) return d;
                }
            }
        }

        // Fallback standard Date constructor
        const d = new Date(trimmed);
        if (isValid(d)) return d;
    } catch {
        return null;
    }

    return null;
}
