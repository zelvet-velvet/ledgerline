---
monthly_plan: 22000
rebalance_threshold: 5
single_stock_cap: 15000
emergency_min: 20000
fx_fallback:
  USD: 32
allocation:
  - key: etf
    label: ETFs
    pct: 70
  - key: stock
    label: Single stocks
    pct: 20
  - key: bond
    label: Bonds
    pct: 10
watchlist:
  - ticker: "0050"
  - ticker: "2330"
  - ticker: "2317"
  - ticker: "2454"
  - ticker: VOO
  - ticker: QQQ
assets:
  - ticker: "0050"
    name: Yuanta Taiwan Top 50
    category: etf
    currency: TWD
    market: tw
    broker: Broker A
    dca:
      amount: 10000
      day: 6
    transactions:
      - type: BUY
        shares: 60
        price: 158.2
        date: 2026-09-08
        settled: 2026-09-10
      - type: BUY
        shares: 62
        price: 161.5
        date: 2026-10-06
        settled: 2026-10-08
      - type: BUY
        shares: 60
        price: 165.4
        date: 2026-11-06
        settled: 2026-11-10
  - ticker: "2330"
    name: TSMC
    category: stock
    currency: TWD
    market: tw
    broker: Broker A
    transactions:
      - type: BUY
        shares: 10
        price: 1025
        date: 2026-10-15
        settled: 2026-10-17
  - ticker: VOO
    name: Vanguard S&P 500 ETF
    category: etf
    currency: USD
    market: us
    broker: Broker B
    transactions:
      - type: BUY
        shares: 1.5
        price: 612.4
        fx: 31.85
        date: 2026-10-21
        settled: 2026-10-22
  - ticker: "00679B"
    name: Yuanta US Treasury 20+
    category: bond
    currency: TWD
    market: tw
    broker: Broker A
    transactions:
      - type: BUY
        shares: 200
        price: 27.9
        date: 2026-10-06
        settled: 2026-10-08
sticker: lucide//trending-up
---
# Investment

Holdings (`assets` with their trades), the target mix (`allocation`), the watchlist and your rules: `single_stock_cap` (most cost in one single stock), `emergency_min` (the emergency fund to keep before a buy).
