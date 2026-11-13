---
accounts:
  - key: main
    label: Everyday
    bank: Bank A
  - key: emergency
    label: Emergency
    bank: Bank A
    line: emgy_fund
    target: 90000
  - key: travel
    label: Travel
    bank: Bank A
    line: travel_fund
  - key: loan
    label: Loan reserve
    bank: Bank A
    line: student_loan
  - key: etf_cash
    label: ETF cash
    bank: Bank B
    line: investment
    bucket: etf
  - key: stock_cash
    label: Stock cash
    bank: Bank B
    bucket: stock
entries:
  - date: 2026-09-01
    account: main
    amount: 18500
    kind: opening
    note: Starting balance
  - date: 2026-09-01
    account: emergency
    amount: 32000
    kind: opening
    note: Starting balance
  - date: 2026-09-01
    account: travel
    amount: 21000
    kind: opening
    note: Starting balance
  - date: 2026-09-01
    account: loan
    amount: 12000
    kind: opening
    note: Starting balance
  - date: 2026-09-01
    account: etf_cash
    amount: 46000
    kind: opening
    note: Starting balance
  - date: 2026-09-01
    account: stock_cash
    amount: 15000
    kind: opening
    note: Starting balance
  - date: 2026-10-12
    account: travel
    amount: -14800
    kind: expense
    note: Japan flights
sticker: lucide//wallet
---
# Accounts

Where the money sits. Balances are the sum of the entries; a buy in Invest books its cost here.
