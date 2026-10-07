/** Dates as the live blog prints them (Pacific time, as its pages are rendered): "Aug 25" this year, "Oct 2, 2025" before it. */
export function blogDate(iso: string | null | undefined, now = new Date()) {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? iso + "T12:00:00Z" : iso);
  const year = (x: Date) => Number(x.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles", year: "numeric" }));
  const opts: Intl.DateTimeFormatOptions = { timeZone: "America/Los_Angeles", month: "short", day: "numeric", ...(year(d) !== year(now) ? { year: "numeric" } : {}) };
  return d.toLocaleDateString("en-US", opts);
}
