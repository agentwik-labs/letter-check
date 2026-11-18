// Made-up example letters. Every name, number and address is invented. Phone numbers use the 555 range.
// `expect` is what a careful person reading the letter would say; tests and scripts/evaluate.js score against it.
// Scored as of TODAY below.
export const TODAY = '2026-11-18';

export const EXAMPLES = [
  {
    id: 'medicaid-renewal',
    title: 'Medicaid renewal',
    text: `Department of Human Services
Notice date: November 10, 2026
Case number: 4410-778-21

Dear Maria Lopez,

It is time to renew your Medicaid coverage. We could not renew it automatically.

Please complete the enclosed renewal form, sign it, and return it with proof of income, such as your last 4 pay stubs, by December 10, 2026. You can mail it, fax it, or upload it at benefits.example.gov.

If we do not get your form and proof by December 10, 2026, your coverage will end on December 31, 2026.

If you disagree with a decision, you have the right to ask for a fair hearing. Free language help is available: call 1-800-555-0199.`,
    expect: { kind: 'health-coverage', deadline: '2026-12-10', amount: null, scam: false, documents: ['pay stubs', 'proof of income'], consequences: ['lose-coverage'] },
  },
  {
    id: 'snap-interview',
    title: 'SNAP interview',
    text: `Notice date: November 12, 2026
Your SNAP interview is scheduled for December 2, 2026 at 10:30 AM. We will call you at the phone number on your application.

Before your interview, please send us: photo ID, proof of address, and your last two bank statements.

If you miss your interview, call us at (555) 201-3344 to reschedule. If you do not complete the interview, your application may be denied.`,
    expect: { kind: 'food-cash-benefits', deadline: '2026-12-02', amount: null, scam: false, documents: ['photo ID', 'proof of address', 'bank statements'], consequences: ['lose-benefits'] },
  },
  {
    id: 'irs-proposed-change',
    title: 'IRS proposed tax change',
    text: `Internal Revenue Service
Notice date: November 2, 2026
Tax year: 2024

We have information that does not match the entries on your 2024 Form 1040. The changes we propose would increase the tax you owe.

Amount you owe: $1,284.00 (includes interest of $61.20)

Respond by: December 2, 2026

If you agree, sign the response form and pay the amount you owe. If you disagree, send us a signed statement explaining why, with copies of any documents that support you.

If you don't respond by December 2, 2026, we will send you a notice of deficiency and the change will stand.`,
    expect: { kind: 'tax', deadline: '2026-12-02', amount: 1284, scam: false, documents: [], consequences: ['court'] },
  },
  {
    id: 'utility-shutoff',
    title: 'Electric shutoff notice',
    text: `FINAL NOTICE - DISCONNECTION OF ELECTRIC SERVICE
Account number: 220019384
Statement date: 11/14/2026

Past due amount: $312.47

To avoid disconnection of your electric service, payment must be received by 11/28/2026. If service is disconnected, a reconnection fee of $50.00 may apply.

If you are having trouble paying, ask about a payment arrangement or energy assistance programs. Call 555-310-2200.`,
    expect: { kind: 'utility', deadline: '2026-11-28', amount: 312.47, scam: false, documents: [], consequences: ['shutoff', 'late-fee'] },
  },
  {
    id: 'eob-not-a-bill',
    title: 'Insurance explanation of benefits',
    text: `EXPLANATION OF BENEFITS
THIS IS NOT A BILL

Patient: Sam Carter
Date of service: 10/14/2026
Provider: Riverside Imaging Center

Amount billed: $1,450.00
Plan discount: $820.00
Plan paid: $480.00
You may owe the provider: $150.00

Questions? Call member services at 1-888-555-0123.`,
    expect: { kind: 'eob', deadline: null, amount: 150, scam: false, documents: [], consequences: [] },
  },
  {
    id: 'hospital-bill',
    title: 'Hospital bill',
    text: `Patient statement
Statement date: 11/05/2026
Guarantor: Dana Price
Date of service: 09/30/2026

Total charges: $3,210.00
Insurance payments: -$2,600.00
Amount due: $610.00

Please pay by 12/05/2026. You can ask for an itemized bill. Financial assistance may be available based on your income. Call 555-430-1188 to ask about a payment plan.`,
    expect: { kind: 'medical-bill', deadline: '2026-12-05', amount: 610, scam: false, documents: [], consequences: [] },
  },
  {
    id: 'debt-validation',
    title: 'Debt collector validation notice',
    text: `Example Recovery Services is a debt collector. We are trying to collect a debt that you owe to Northside Medical Group. We will use any information you give us to help collect the debt.

Our information shows: As of September 1, 2026, you owed $842.19.
Between September 1, 2026 and today, you were charged $0.00 in interest and $0.00 in fees.
Total amount of the debt now: $842.19

How can you dispute the debt? Call or write to us by December 15, 2026, to dispute all or part of the debt. If you do not, we will assume that our information is correct.

Write to: Example Recovery Services, PO Box 1000, Springfield.`,
    expect: { kind: 'debt-collection', deadline: '2026-12-15', amount: 842.19, scam: false, documents: [], consequences: ['assume-correct'] },
  },
  {
    id: 'insurance-denial',
    title: 'Insurance prior-authorization denial',
    text: `Date: November 12, 2026

Dear Member,

We have denied your request for prior authorization for an MRI of the lumbar spine. Based on the information we received, this service is not medically necessary under your plan.

You have the right to appeal this decision. You must file your appeal within 180 days of the date of this letter. Send your appeal and any medical records or a letter of medical necessity from your doctor to: Appeals Unit, PO Box 5000.

If your health could be seriously harmed by waiting, you can ask for an expedited appeal.`,
    expect: { kind: 'insurance-denial', deadline: '2027-05-11', amount: null, scam: false, documents: ['medical records or doctor\'s letter'], consequences: [] },
  },
  {
    id: 'three-day-notice',
    title: 'Three-day notice to pay rent',
    text: `THREE-DAY NOTICE TO PAY RENT OR DELIVER POSSESSION
Date: November 16, 2026

To: Tenant, 12 Example Lane, Unit 4

You are hereby notified that you are indebted to me in the sum of $1,450.00 for the rent and use of the premises, now due and unpaid. I demand payment of the rent or possession of the premises within 3 days (excluding Saturday, Sunday, and legal holidays) after the date of delivery of this notice, to wit: on or before November 19, 2026.

Landlord's name, address and phone number: Example Properties LLC, 555-600-7000`,
    expect: { kind: 'housing', deadline: '2026-11-19', amount: 1450, scam: false, documents: [], consequences: ['eviction'] },
  },
  {
    id: 'jury-summons',
    title: 'Jury summons',
    text: `SUMMONS FOR JURY SERVICE
Date mailed: November 13, 2026

You are summoned to report for jury service on Monday, January 11, 2027 at 8:00 AM at the County Courthouse.

Complete the online juror questionnaire within 10 days of the date this summons was mailed. If you need to ask to be excused or to postpone, do it in the questionnaire.

Failure to appear may result in a fine.`,
    expect: { kind: 'court-jury', deadline: '2026-11-23', amount: null, scam: false, documents: [], consequences: ['fine'] },
  },
  {
    id: 'school-attendance',
    title: 'School attendance letter',
    text: `Dear Parent/Guardian,

Our records show that your student has 5 unexcused absences this school year. Regular attendance is important for your child's success.

Please contact the attendance office at (555) 448-1020 by November 25, 2026 to schedule a conference with the principal.

Further unexcused absences may result in a referral to the truancy program.`,
    expect: { kind: 'school', deadline: '2026-11-25', amount: null, scam: false, documents: [], consequences: ['court'] },
  },
  {
    id: 'toll-text-scam',
    title: 'Text: unpaid toll',
    text: `TollPay Notice: You have an outstanding toll of $6.99. Pay by today to avoid a late fee of $50.00 and suspension of your license: https://ezpass-tollpay-help.xyz/pay Reply Y then reopen this message to activate the link.`,
    expect: { kind: null, deadline: null, amount: 6.99, scam: true, documents: [], consequences: [] },
  },
  {
    id: 'irs-gift-card-scam',
    title: 'Text: "IRS" arrest threat',
    text: `This is the IRS. A warrant has been issued for your arrest due to unpaid taxes of $2,400. To avoid arrest, you must pay immediately using Google Play gift cards. Call agent Smith at 202-555-0147 now.`,
    expect: { kind: 'tax', deadline: null, amount: 2400, scam: true, documents: [], consequences: [] },
  },
  {
    id: 'unemployment-overpayment',
    title: 'Unemployment overpayment',
    text: `Determination date: October 30, 2026
Claimant ID: 88-1002

We find that you were overpaid $2,016.00 in unemployment benefits for the weeks ending August 8, 2026 through September 12, 2026, because you did not report your earnings.

This determination becomes final unless you file an appeal within 20 calendar days of the date of this determination. If you do not repay, we may collect it from your future benefits or your state tax refund.`,
    expect: { kind: 'unemployment', deadline: '2026-11-19', amount: 2016, scam: false, documents: [], consequences: ['court', 'garnish'] },
  },
  {
    id: 'vehicle-registration',
    title: 'Vehicle registration renewal',
    text: `Motor Vehicles Division
Renewal notice

Your vehicle registration expires on 12/31/2026.
Renewal fee: $85.25

Renew online at mvd.example.gov, by mail, or in person. You will need proof of insurance. Driving with an expired registration can result in a fine.`,
    expect: { kind: 'vehicle', deadline: '2026-12-31', amount: 85.25, scam: false, documents: ['proof of insurance'], consequences: ['fine'] },
  },
  {
    id: 'dental-reminder',
    title: 'Text: appointment reminder (real)',
    text: `Reminder: your dental appointment with Bright Smile Dental is on 12/03/2026 at 2:00 PM. Call 555-010-2020 to reschedule.`,
    expect: { kind: 'appointment', deadline: '2026-12-03', amount: null, scam: false, documents: [], consequences: [] },
  },
];
