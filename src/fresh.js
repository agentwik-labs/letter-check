// Fresh set: written after the held-out fixes, scored once, rules not changed afterwards.
// All made up. Scored as of TODAY in examples.js (2026-11-18). kind: null means no category fits (not scored).
export const FRESH = [
  {
    id: 'fr-medicare-premium',
    title: 'Medicare premium past due',
    text: `Notice date: November 6, 2026

Your Medicare premium payment is past due. Amount due: $202.90.

Pay by December 25, 2026 to keep your coverage. If we do not receive payment by that date, your Part B coverage will end. You can pay online, by phone, or by mail.`,
    expect: { kind: null, deadline: '2026-12-25', amount: 202.9, scam: false, documents: [], consequences: ['lose-coverage'] },
  },
  {
    id: 'fr-wic-appointment',
    title: 'WIC certification appointment',
    text: `WIC Program
Your certification appointment is on Tuesday, December 8, 2026 at 9:15 AM at the Eastside Clinic.

Please bring: photo ID for you and your child, proof of address, proof of income, and your child's immunization record.

If you cannot come, please call 555-280-1400 to reschedule.`,
    expect: { kind: 'food-cash-benefits', deadline: '2026-12-08', amount: null, scam: false, documents: ['photo ID', 'proof of address', 'proof of income'], consequences: [] },
  },
  {
    id: 'fr-package-scam',
    title: 'Text: fake delivery',
    text: `USPS: Your package is on hold because the address is incomplete. Please confirm your address and pay a $1.99 redelivery fee here: https://usps-redeliver-parcel.icu/home`,
    expect: { kind: null, deadline: null, amount: 1.99, scam: true, documents: [], consequences: [] },
  },
  {
    id: 'fr-rent-increase',
    title: 'Rent increase notice',
    text: `Dear Resident,

Effective February 1, 2027, your monthly rent will increase from $1,325.00 to $1,410.00. If you do not wish to renew your lease at the new rate, please give written notice to the leasing office by December 31, 2026.`,
    expect: { kind: 'housing', deadline: '2026-12-31', amount: null, scam: false, documents: [], consequences: [] },
  },
  {
    id: 'fr-irs-balance-due',
    title: 'IRS balance due',
    text: `Internal Revenue Service
Notice date: October 26, 2026

You have unpaid taxes for tax year 2025. Amount due: $734.12.

Pay by November 16, 2026 to avoid more penalties and interest. If you can't pay the full amount, you may be able to set up a payment plan online.`,
    expect: { kind: 'tax', deadline: '2026-11-16', amount: 734.12, scam: false, documents: [], consequences: ['late-fee'] },
  },
  {
    id: 'fr-court-hearing',
    title: 'Small claims hearing',
    text: `NOTICE OF HEARING
Case No. 2026-SC-01482

A hearing in this small claims case is set for January 6, 2027 at 1:30 PM, Courtroom 4B. You must appear in person. If you do not appear, the court may enter a default judgment against you.`,
    expect: { kind: 'court-jury', deadline: '2027-01-06', amount: null, scam: false, documents: [], consequences: ['court'] },
  },
];
