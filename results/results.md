# letter-check results

Scored as of 2026-11-18 with `node scripts/evaluate.js`. All letters are made up (no real personal data).
Each letter is checked on up to six things: the kind of letter, the most urgent date, the amount it asks for, whether it is flagged as a likely scam, the documents it asks for, and what happens if you do nothing.

Three sets, in the order they were written:
- **Build set** (16): written while building the rules. It flatters the tool.
- **Held-out set** (10): written with the rules frozen. Its one blind run scored 50 of 56 checks (see `heldout-first-run.md`); three rules were then fixed, so the number below is no longer blind.
- **Fresh set** (6): written after those fixes and scored once; rules not changed afterwards. This is the most honest number here, and it is small.

## Build set: 16 of 16 letters fully right; 95 of 95 checks right

| Letter | Kind | Main deadline | Amount | Scam flag | Documents | What happens |
|---|---|---|---|---|---|---|
| Medicaid renewal | right (health-coverage) | right (2026-12-10) | right (none) | right (false) | right (pay stubs, proof of income) | right (lose-coverage) |
| SNAP interview | right (food-cash-benefits) | right (2026-12-02) | right (none) | right (false) | right (proof of address, photo ID, bank statements) | right (lose-benefits) |
| IRS proposed tax change | right (tax) | right (2026-12-02) | right (1284) | right (false) | right (none) | right (late-fee, court, assume-correct) |
| Electric shutoff notice | right (utility) | right (2026-11-28) | right (312.47) | right (false) | right (none) | right (shutoff, late-fee) |
| Insurance explanation of benefits | right (eob) | right (none) | right (150) | right (false) | right (none) | right (none) |
| Hospital bill | right (medical-bill) | right (2026-12-05) | right (610) | right (false) | right (none) | right (none) |
| Debt collector validation notice | right (debt-collection) | right (2026-12-15) | right (842.19) | right (false) | right (none) | right (late-fee, assume-correct) |
| Insurance prior-authorization denial | right (insurance-denial) | right (2027-05-11) | right (none) | right (false) | right (medical records or doctor's letter) | right (none) |
| Three-day notice to pay rent | right (housing) | right (2026-11-19) | right (1450) | right (false) | right (none) | right (eviction) |
| Jury summons | right (court-jury) | right (2026-11-23) | right (none) | right (false) | right (none) | right (fine) |
| School attendance letter | right (school) | right (2026-11-25) | right (none) | right (false) | right (none) | right (court) |
| Text: unpaid toll | n/a | right (none) | right (6.99) | right (true) | right (none) | right (late-fee) |
| Text: "IRS" arrest threat | right (tax) | right (none) | right (2400) | right (true) | right (none) | right (none) |
| Unemployment overpayment | right (unemployment) | right (2026-11-19) | right (2016) | right (false) | right (none) | right (court, garnish) |
| Vehicle registration renewal | right (vehicle) | right (2026-12-31) | right (85.25) | right (false) | right (proof of insurance) | right (fine) |
| Text: appointment reminder (real) | right (appointment) | right (2026-12-03) | right (none) | right (false) | right (none) | right (none) |

## Held-out set (after fixes; not blind): 8 of 10 letters fully right; 54 of 56 checks right

| Letter | Kind | Main deadline | Amount | Scam flag | Documents | What happens |
|---|---|---|---|---|---|---|
| Marketplace income check | right (health-coverage) | right (2027-02-01) | right (none) | right (false) | right (pay stubs, tax return or W-2) | right (none) |
| Water bill | right (utility) | right (2026-12-01) | right (58.73) | right (false) | right (none) | right (late-fee) |
| Text: fake bank fraud alert | n/a | **wrong**: got 2026-11-18, expected none | right (none) | right (true) | right (none) | right (none) |
| SNAP recertification | right (food-cash-benefits) | right (2026-12-15) | right (none) | right (false) | right (pay stubs, proof of expenses (rent, childcare, medical)) | right (lose-benefits) |
| Credit card statement | n/a | right (2026-12-09) | right (45) | right (false) | right (none) | right (late-fee) |
| Lease non-renewal | right (housing) | right (2027-01-31) | right (none) | right (false) | right (none) | right (eviction) |
| Email: prize claim | n/a | **wrong**: got 2026-11-18, expected none | right (9.95) | right (true) | right (Social Security card or number) | right (none) |
| Social Security disability review | n/a | right (2026-11-20) | right (none) | right (false) | right (none) | right (lose-benefits) |
| Traffic ticket | right (vehicle) | right (2026-12-01) | right (156) | right (false) | right (none) | right (late-fee) |
| School meals application | right (school) | right (none) | right (none) | right (false) | right (none) | right (none) |

## Fresh set (blind): 4 of 6 letters fully right; 32 of 34 checks right

| Letter | Kind | Main deadline | Amount | Scam flag | Documents | What happens |
|---|---|---|---|---|---|---|
| Medicare premium past due | n/a | right (2026-12-25) | right (202.9) | right (false) | right (none) | right (lose-coverage) |
| WIC certification appointment | **wrong**: got appointment, expected food-cash-benefits | right (2026-12-08) | right (none) | right (false) | right (proof of income, proof of address, photo ID) | right (none) |
| Text: fake delivery | n/a | right (none) | **wrong**: got none, expected 1.99 | right (true) | right (none) | right (none) |
| Rent increase notice | right (housing) | right (2026-12-31) | right (none) | right (false) | right (none) | right (none) |
| IRS balance due | right (tax) | right (2026-11-16) | right (734.12) | right (false) | right (none) | right (late-fee) |
| Small claims hearing | right (court-jury) | right (2027-01-06) | right (none) | right (false) | right (none) | right (court) |
