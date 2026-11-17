---
budget:
  - name: Food
    quota: 60
    daily: true
    spending:
      - breakfast
      - lunch
      - dinner
      - snack
      - coffee
  - name: Entertainment
    quota: 20
    daily: true
    spending:
      - fun
  - name: Misc
    quota: 20
    daily: true
    spending:
      - misc
one_time:
  - taxi
sticker: lucide//utensils
---
# Daily Expenses

Daily groups share what living leaves after the fixed bills, by `quota` percent. Each `spending` item is a field in the day notes. `one_time` lists the one-offs that count as spending; any other number in a day note (a rating, another plugin's count) does not.
