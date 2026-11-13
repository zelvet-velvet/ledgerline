// Fugle MarketData WebSocket (owner, 2026-11-05: live under 5 s): trades for the Taiwan tickers whose chart page is open.
// One socket, opened when a chart asks and closed when none does; auth with the key, then one `trades` subscription per
// code. A trade arrives as `{ event: "data" | "snapshot", channel: "trades", data: { symbol, price, size, bid, ask, time (µs), isTrial? } }`
// (size, bid and ask feed the footprint: prices/flow.ts).
// Dropped sockets come back with a growing wait (1 s … 30 s) while a chart still wants them; while a code is not
// subscribed the chart page keeps polling quotes every 5 s.
const URL = "wss://api.fugle.tw/marketdata/v1.0/stock/streaming";

export class FugleStream {
    private ws: WebSocket | null = null;
    private authed = false;
    private want = new Set<string>();
    private ids = new Map<string, string>();   // code → subscription id (subscribed)
    private retry = 0;
    private timer = 0;
    constructor(private key: () => string, private onTrade: (code: string, price: number, ms: number, raw: Record<string, unknown>) => void) {}

    // is this code streaming now (its quotes need no polling)
    on(code: string): boolean { return this.authed && this.ids.has(code); }

    watch(code: string): void {
        if (!this.key()) return;
        if (!this.want.has(code)) { this.want.add(code); if (this.authed) this.sub(code); }
        this.open();
    }
    unwatch(code: string): void {
        if (!this.want.delete(code)) return;
        const id = this.ids.get(code);
        this.ids.delete(code);
        if (id && this.authed) this.send({ event: "unsubscribe", data: { id } });
        if (!this.want.size) this.close();
    }
    close(): void {
        window.clearTimeout(this.timer);
        const ws = this.ws;
        this.ws = null; this.authed = false; this.ids.clear();
        if (ws) { ws.onclose = null; ws.close(); }
    }
    stop(): void { this.want.clear(); this.close(); }

    private send(m: unknown): void { if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(m)); }
    private sub(code: string): void { this.send({ event: "subscribe", data: { channel: "trades", symbol: code } }); }
    private open(): void {
        if (this.ws || !this.want.size || !this.key()) return;
        let ws: WebSocket;
        try { ws = new WebSocket(URL); } catch { this.later(); return; }
        this.ws = ws;
        ws.onopen = () => this.send({ event: "auth", data: { apikey: this.key() } });
        ws.onmessage = (e) => {
            let m: { event?: string; channel?: string; data?: Record<string, unknown> };
            try { m = JSON.parse(String(e.data)); } catch { return; }
            const d = m.data ?? {};
            if (m.event === "authenticated") { this.authed = true; this.retry = 0; this.want.forEach((c) => this.sub(c)); return; }
            if (m.event === "subscribed" && typeof d.symbol === "string" && typeof d.id === "string") { this.ids.set(d.symbol, d.id); return; }
            if ((m.event === "data" || m.event === "snapshot") && m.channel === "trades" && typeof d.symbol === "string" && !d.isTrial) {
                const price = Number(d.price), us = Number(d.time);
                if (price > 0) this.onTrade(d.symbol, price, us > 0 ? Math.round(us / 1000) : Date.now(), d);
                return;
            }
            if (m.event === "error") console.warn("Ledgerline: Fugle stream", d.message ?? d);
        };
        ws.onclose = () => { this.ws = null; this.authed = false; this.ids.clear(); this.later(); };
        ws.onerror = () => { /* onclose follows */ };
    }
    private later(): void {
        if (!this.want.size) return;
        window.clearTimeout(this.timer);
        this.timer = window.setTimeout(() => this.open(), Math.min(30000, 1000 * 2 ** this.retry++));
    }
}
