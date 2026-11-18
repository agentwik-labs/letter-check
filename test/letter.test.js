import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze, redact, buildPrompt, toICS, addBusinessDays, fromIso, iso } from '../src/letter.js';
import { EXAMPLES, TODAY } from '../src/examples.js';
import { HELDOUT } from '../src/heldout.js';
import { FRESH } from '../src/fresh.js';
import { score } from '../scripts/evaluate.js';

const a = (text) => analyze(text, { today: TODAY });

test('empty input gives null', () => { assert.equal(analyze('   '), null); });

test('reads named, numeric and ISO dates', () => {
  assert.equal(a('Please return the form by Dec. 4, 2026.').primaryDeadline.date, '2026-12-04');
  assert.equal(a('Payment must be received by 12/04/26.').primaryDeadline.date, '2026-12-04');
  assert.equal(a('Respond by 2026-12-04.').primaryDeadline.date, '2026-12-04');
  assert.equal(a('Send it no later than 4 December 2026.').primaryDeadline.date, '2026-12-04');
});

test('a date with no year takes the year of the letter', () => {
  const r = a('Notice date: November 20, 2026\nReturn the form by January 5.');
  assert.equal(r.primaryDeadline.date, '2027-01-05');
  assert.equal(r.primaryDeadline.approximate, true);
});

test('dates of service and birth are not deadlines', () => {
  const r = a('Date of service: 12/01/2026\nDate of birth: 01/02/1980\nThis is not a bill.');
  assert.equal(r.primaryDeadline, null);
});

test('"within N days" counts from the letter date', () => {
  const r = a('Date: November 1, 2026\nYou must appeal within 30 days of the date of this letter.');
  assert.equal(r.primaryDeadline.date, '2026-12-01');
  assert.match(r.primaryDeadline.how, /date on the letter/);
});

test('business days skip weekends', () => {
  assert.equal(iso(addBusinessDays(fromIso('2026-11-20'), 3)), '2026-11-25'); // Fri + 3 business days = Wed
});

test('"within 30 days after you move out" is not turned into a date', () => {
  const r = a('Your deposit will be returned within 30 days after you move out.');
  assert.equal(r.primaryDeadline, null);
});

test('the amount due beats fees and insurance payments', () => {
  const r = a('Total charges: $900.00\nInsurance paid: $700.00\nAmount due: $200.00\nA late fee of $25.00 may apply.');
  assert.equal(r.amountDue.value, 200);
});

test('"this is not a bill" removes the pay step', () => {
  const r = a('EXPLANATION OF BENEFITS. THIS IS NOT A BILL. You may owe the provider: $40.00');
  assert.ok(!r.actions.some((x) => x.id === 'pay'));
  assert.ok(r.actions.some((x) => x.id === 'nothing'));
  assert.equal(r.amountDue.notABill, true);
});

test('"pay stubs" is not a request to pay', () => {
  const r = a('Send your last 4 pay stubs by December 1, 2026.');
  assert.ok(!r.actions.some((x) => x.id === 'pay'));
  assert.deepEqual(r.documents, ['pay stubs']);
});

test('gift-card demand is flagged high; a plain reminder is not', () => {
  assert.equal(a('Pay the IRS now with gift cards or face arrest.').scam.level, 'high');
  assert.equal(a('Reminder: your appointment is on 12/03/2026. Call 555-010-2020 to reschedule.').scam.level, 'low');
});

test('redact strips SSNs, account numbers, emails, names, street addresses and local phones', () => {
  const t = 'Dear Maria Lopez,\nSSN: 123-45-6789\nAccount number: 220019384\nEmail jo@example.com\nClaimant ID: 88-1002\n12 Example Lane, Unit 4\nCall (555) 201-3344 or 1-800-555-0199 by 12/10/2026.';
  const r = redact(t);
  assert.match(r, /Dear \[NAME\],/);
  for (const secret of ['Maria', 'Lopez', 'opez', '123-45-6789', '220019384', 'jo@example.com', '88-1002', '12 Example Lane', '201-3344']) assert.ok(!r.includes(secret), `leaked ${secret}: ${r}`);
  assert.ok(r.includes('800-555-0199'), 'keeps toll-free numbers');
  assert.ok(r.includes('12/10/2026'), 'keeps dates');
});

test('the AI prompt names the language and carries the redacted letter', () => {
  const p = buildPrompt('Dear Sam Carter, pay $5 by 12/01/2026.', 'Spanish');
  assert.match(p, /plain Spanish/);
  assert.ok(!p.includes('Sam Carter'));
});

test('calendar file is a valid all-day event with a reminder', () => {
  const ics = toICS({ date: '2026-12-10', sentence: 'Return the form; sign it, by December 10.' }, 'Deadline');
  assert.match(ics, /DTSTART;VALUE=DATE:20261210/);
  assert.match(ics, /DTEND;VALUE=DATE:20261211/);
  assert.match(ics, /TRIGGER:-P3D/);
  assert.match(ics, /DESCRIPTION:Return the form\\; sign it\\, by December 10\./);
});

for (const e of EXAMPLES) {
  test(`build set: ${e.title}`, () => {
    for (const [field, c] of Object.entries(score(e).checks)) assert.ok(c.ok, `${field}: got ${JSON.stringify(c.got)}, expected ${JSON.stringify(c.expected)}`);
  });
}

// Held-out and fresh sets: lock in the recorded score so a change that makes them worse fails.
function total(set) { let ok = 0; for (const e of set) for (const c of Object.values(score(e).checks)) if (c.ok) ok++; return ok; }
test('held-out set does not get worse than 54 of 56 checks', () => { assert.ok(total(HELDOUT) >= 54); });
test('fresh set does not get worse than 32 of 34 checks', () => { assert.ok(total(FRESH) >= 32); });
