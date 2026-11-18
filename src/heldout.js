// Held-out letters: written after the rules were frozen, scored once, rules not changed afterwards.
// All made up. Scored as of TODAY in examples.js (2026-11-18). kind: null means none of the tool's categories fit,
// so kind is not scored for that letter.
export const HELDOUT = [
  {
    id: 'ho-marketplace-dmi',
    title: 'Marketplace income check',
    text: `Health Insurance Marketplace
Date: November 3, 2026

We need more information to confirm your household income. Please upload or mail documents that show your income, such as a recent tax return or your last 2 pay stubs.

You have 90 days from the date of this notice to send us the documents. If we do not receive them, we may change the amount of help you get to pay for your health coverage.`,
    expect: { kind: 'health-coverage', deadline: '2027-02-01', amount: null, scam: false, documents: ['pay stubs', 'tax return or W-2'], consequences: [] },
  },
  {
    id: 'ho-water-bill',
    title: 'Water bill',
    text: `City Water Utility
Bill date: Nov 8, 2026
Service period: Oct 1, 2026 - Oct 31, 2026

Previous balance: $41.20
Payment received - thank you: -$41.20
Current charges: $58.73
Total amount due: $58.73
Due date: Dec 1, 2026

A late charge of $5.00 will be added if payment is not received by the due date.`,
    expect: { kind: 'utility', deadline: '2026-12-01', amount: 58.73, scam: false, documents: [], consequences: ['late-fee'] },
  },
  {
    id: 'ho-bank-text-scam',
    title: 'Text: fake bank fraud alert',
    text: `Bank Alert: We detected a suspicious charge of $489.00 on your card. If this was not you, tap the link to verify your identity: http://secure-bank-verify.online/login or your account will be locked within 24 hours.`,
    expect: { kind: null, deadline: null, amount: null, scam: true, documents: [], consequences: [] },
  },
  {
    id: 'ho-snap-recert',
    title: 'SNAP recertification',
    text: `Department of Social Services
Notice date: 11/09/2026

Your food assistance benefits end on 12/31/2026 unless you renew. To keep getting benefits, complete the recertification form and return it by 12/15/2026, along with proof of rent and a copy of your most recent pay stub.

We will schedule a phone interview after we get your form. If you do not renew, your case will close.`,
    expect: { kind: 'food-cash-benefits', deadline: '2026-12-15', amount: null, scam: false, documents: ['pay stubs', 'proof of expenses (rent, childcare, medical)'], consequences: ['lose-benefits'] },
  },
  {
    id: 'ho-credit-card-late',
    title: 'Credit card statement',
    text: `Statement closing date: 11/12/2026
New balance: $1,932.18
Minimum payment due: $45.00
Payment due date: 12/09/2026

Late payment warning: If we do not receive your minimum payment by the date listed above, you may have to pay a late fee of up to $41.00.`,
    expect: { kind: null, deadline: '2026-12-09', amount: 45, scam: false, documents: [], consequences: ['late-fee'] },
  },
  {
    id: 'ho-lease-nonrenewal',
    title: 'Lease non-renewal',
    text: `Dear Resident,

This letter is to inform you that your lease at Oak Ridge Apartments will not be renewed. Your lease ends on January 31, 2027. You must vacate the unit and return all keys on or before that date.

Please schedule a move-out inspection with the leasing office. Your security deposit will be returned within 30 days after you move out, minus any deductions.`,
    expect: { kind: 'housing', deadline: '2027-01-31', amount: null, scam: false, documents: [], consequences: ['eviction'] },
  },
  {
    id: 'ho-prize-scam',
    title: 'Email: prize claim',
    text: `Congratulations! You have won a $5,000 Walmart gift card in our customer sweepstakes. To claim your prize, pay a processing fee of $9.95 and confirm your full Social Security number within 48 hours at www.walmart-rewards-claim.top`,
    expect: { kind: null, deadline: null, amount: 9.95, scam: true, documents: [], consequences: [] },
  },
  {
    id: 'ho-ssa-review',
    title: 'Social Security disability review',
    text: `Social Security Administration
Date: November 5, 2026

We are reviewing your disability case to see if you still qualify. Please fill out the enclosed form and return it within 15 days. Include the names of the doctors you saw in the last 12 months.

If you do not return the form, your benefits may stop. If you need help, call us at 1-800-555-0172. We offer free interpreter services.`,
    expect: { kind: null, deadline: '2026-11-20', amount: null, scam: false, documents: [], consequences: ['lose-benefits'] },
  },
  {
    id: 'ho-traffic-ticket',
    title: 'Traffic ticket',
    text: `NOTICE OF INFRACTION
Citation date: 11/01/2026
Violation: Speeding 15 mph over limit
Civil penalty: $156.00

You must pay the civil penalty or elect to request a hearing within 30 days of the citation date. If you fail to respond, your driver's license may be suspended and a late fee added.`,
    expect: { kind: 'vehicle', deadline: '2026-12-01', amount: 156, scam: false, documents: [], consequences: ['late-fee'] },
  },
  {
    id: 'ho-school-lunch',
    title: 'School meals application',
    text: `Dear Parent or Guardian,

Children in your household may be eligible for free or reduced-price school meals. To apply, complete the attached application and return it to your child's school office. Applications can be submitted at any time during the school year.

If you have questions, call the Nutrition Services office at (555) 774-3100.`,
    expect: { kind: 'school', deadline: null, amount: null, scam: false, documents: [], consequences: [] },
  },
];
