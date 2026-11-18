# Held-out set, first and only blind run (2026-11-18)

Scored once with the rules frozen, before any change: **6 of 10 letters fully right; 50 of 56 checks right.**

Misses on that run:

| Letter | Field | Got | Expected | Cause |
|---|---|---|---|---|
| Text: fake bank fraud alert | Main deadline | 2026-11-18 (today) | none | "within 24 hours" is read as a deadline of today. The scam warning shows above it, but the page still shows a date. |
| Lease non-renewal | Main deadline | 2026-12-18 | 2027-01-31 | "returned within 30 days after you move out" was counted from today. |
| Email: prize claim | Main deadline | 2026-11-18 (today) | none | Same as the bank text: "within 48 hours". |
| Email: prize claim | Amount | none | 9.95 | "pay a processing fee of $9.95" was not read as an amount to pay. |
| Traffic ticket | Main deadline | 2026-12-18 | 2026-12-01 | "Citation date" was not recognised as the letter's date, so "within 30 days of the citation date" was counted from today. |
| Traffic ticket | Amount | none | 156 | "Civil penalty: $156.00" was not read as an amount to pay. |

After this run, three rules were changed (relative days that count from a future event are skipped; "citation date", "bill date" and "closing date" count as the letter's date; "penalty" and "pay a ... fee of" count as amounts to pay). The held-out set now scores 54 of 56, but it is no longer blind. See `results.md` for the fresh set written after those fixes.
