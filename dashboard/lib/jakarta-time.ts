const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Convert a datetime-local value interpreted as Asia/Jakarta to a UTC Date. */
export function parseJakartaDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}:00+07:00`);
  if (Number.isNaN(parsed.getTime()) || toJakartaDateTimeInput(parsed) !== value) return null;
  return parsed;
}

/** Format a UTC value for an HTML datetime-local input in Asia/Jakarta. */
export function toJakartaDateTimeInput(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return new Date(date.getTime() + JAKARTA_OFFSET_MS).toISOString().slice(0, 16);
}

export function formatJakartaDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(value instanceof Date ? value : new Date(value));
}
