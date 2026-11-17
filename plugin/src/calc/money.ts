// Whole dollars from a note's value: a number, or a typed "1,000"; a fraction is rounded (money is integer), anything else is 0
// (never NaN: one bad value must not turn a whole month into NaN).
export const int = (v: unknown): number => {
    const n = typeof v === "string" ? (v.trim() === "" ? NaN : Number(v.replace(/,/g, ""))) : typeof v === "number" ? v : NaN;
    return Number.isFinite(n) ? Math.round(n) : 0;
};
