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

/**
 * Get the UTC offset in milliseconds for a specific timezone at a given moment.
 * Positive = east of UTC, negative = west of UTC.
 */
export function getTimezoneOffsetMs(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)!.value);

  const localMs = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return localMs - date.getTime();
}

/**
 * Convert a local date string (YYYY-MM-DD) to the UTC time of midnight in the given timezone.
 * Example: "2026-03-12" in America/New_York (UTC-4) → 2026-03-12T04:00:00Z
 */
export function localDateToLocalMidnightUtc(dateStr: string, timezone: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utcMidnight = new Date(Date.UTC(y, m - 1, d));
  const offset = getTimezoneOffsetMs(utcMidnight, timezone);
  const result = new Date(utcMidnight.getTime() - offset);
  // Re-check offset at the result time in case of DST transition
  const offset2 = getTimezoneOffsetMs(result, timezone);
  if (offset2 !== offset) {
    return new Date(utcMidnight.getTime() - offset2);
  }
  return result;
}

/**
 * Get the UTC time of the start of today (local midnight) in the given timezone.
 */
export function todayLocalStartUtc(timezone: string): Date {
  return localDateToLocalMidnightUtc(toLocalDateString(new Date(), timezone), timezone);
}

/**
 * Get the day of week (0=Sunday) for a local date string (YYYY-MM-DD).
 */
export function localDateDayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/**
 * Add or subtract days from a date string (YYYY-MM-DD) and return a new date string.
 */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export { DAY_MS };
