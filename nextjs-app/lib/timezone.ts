const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Convert a Date to the local date string (YYYY-MM-DD) in the given timezone.
 */
export function toLocalDateString(date: Date, timezone: string): string {
  return date.toLocaleDateString('en-CA', { timeZone: timezone });
}

/**
 * Get midnight UTC for a given local date string (YYYY-MM-DD).
 */
export function localDateToUtcMidnight(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Get the current local date as midnight UTC for the given timezone.
 */
export function todayAsUtcMidnight(timezone: string): Date {
  return localDateToUtcMidnight(toLocalDateString(new Date(), timezone));
}

/**
 * Validate that a string is a valid IANA timezone identifier.
 */
export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize timezone input: return the timezone if valid, otherwise 'UTC'.
 */
export function sanitizeTimezone(tz?: string | null): string {
  return tz && isValidTimezone(tz) ? tz : 'UTC';
}

export { DAY_MS };
