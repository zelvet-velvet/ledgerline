// Numbers and dates. Dates are the device's local calendar date ("YYYY-MM-DD"), never UTC.
export const num = (n: unknown): string => Math.round(Number(n) || 0).toLocaleString();
export const pct = (n: number, digits = 1): string => `${(Number(n) || 0).toFixed(digits)}%`;

const pad = (n: number) => String(n).padStart(2, "0");
export const ymd = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = (): string => ymd(new Date());

// A frontmatter date (string "YYYY-MM-DD…", a Date, or junk) as "YYYY-MM-DD", or `fallback`
export const dateStr = (v: unknown, fallback = ""): string => {
    if (v instanceof Date && !isNaN(v.getTime())) return ymd(v);
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(v ?? "").trim());
    return m ? `${m[1]}-${pad(Number(m[2]))}-${pad(Number(m[3]))}` : fallback;
};
// "YYYY-MM-DD" → local midnight
export const localDate = (s: string): Date => { const [y, m, d] = s.split("-").map(Number); return new Date(y || 1970, (m || 1) - 1, d || 1); };

// "Oct 5" (this year) / "Oct 5, 2025" (another year) from "YYYY-MM-DD"; "" stays ""
export const shortDate = (s: string): string => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (!m) return s;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.toLocaleDateString("en", d.getFullYear() === new Date().getFullYear() ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" });
};

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const monthLong = (d: Date): string => d.toLocaleString("en", { month: "long" }) + " " + d.getFullYear();

// "1,234" / " 1234 " → 1234; anything else → NaN
export const parseNum = (v: unknown): number => { const s = String(v ?? "").replace(/,/g, "").trim(); return s === "" ? NaN : Number(s); };
