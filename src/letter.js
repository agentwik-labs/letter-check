// letter-check core: reads the text of a letter, bill, notice or text message and pulls out
// what it wants from you and by when. Pure rules, no network, no model. Runs in the browser and in Node.

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};
const MONTH_RE = '(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, twenty: 20, thirty: 30, forty: 40, 'forty-five': 45, sixty: 60, ninety: 90,
};
const DAY_MS = 86400000;

export function utcDate(y, m, d) {
  const t = Date.UTC(y, m, d);
  const dt = new Date(t);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m || dt.getUTCDate() !== d) return null;
  return dt;
}
export function iso(d) { return d ? d.toISOString().slice(0, 10) : null; }
export function fromIso(s) { const [y, m, d] = s.split('-').map(Number); return utcDate(y, m - 1, d); }
export function daysBetween(a, b) { return Math.round((b - a) / DAY_MS); }
export function addDays(d, n) { return new Date(d.getTime() + n * DAY_MS); }
export function addBusinessDays(d, n) {
  let out = d; let left = n;
  while (left > 0) { out = addDays(out, 1); const w = out.getUTCDay(); if (w !== 0 && w !== 6) left--; }
  return out;
}
export function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

// ---------- sentences and context ----------
function sentenceAround(text, index, length) {
  const stops = /[.!?\n]/;
  let s = index; while (s > 0 && !(stops.test(text[s - 1]) && !/\d/.test(text[s] || '') && !isAbbrev(text, s - 1))) s--;
  let e = index + length; while (e < text.length && !(stops.test(text[e]) && !isAbbrev(text, e) && !/\d/.test(text[e + 1] || ''))) e++;
  return text.slice(s, e + 1).trim();
}
function isAbbrev(text, i) {
  if (text[i] !== '.') return false;
  const before = text.slice(Math.max(0, i - 5), i);
  return /\b(Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|No|St|Ave|Dr|Mr|Mrs|Ms|Inc|U\.S|a\.m|p\.m|A\.M|P\.M)$/i.test(before) || /\b[A-Z]$/.test(before);
}
function before(text, index, n = 90) {
  // The words leading up to a match, cut at the previous line break or sentence end.
  const chunk = text.slice(Math.max(0, index - n), index);
  const cut = Math.max(chunk.lastIndexOf('\n'), chunk.search(/[.!?]\s[^.!?]*$/));
  return cut >= 0 ? chunk.slice(cut + 1) : chunk;
}

// ---------- dates ----------
function findDates(text, letterYear) {
  const found = [];
  const push = (index, length, date, yearAssumed = false) => {
    if (date && !found.some((f) => f.index === index)) found.push({ index, length, date, yearAssumed, raw: text.slice(index, index + length) });
  };
  let m;
  const named = new RegExp(`\\b${MONTH_RE}\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b`, 'gi');
  while ((m = named.exec(text))) {
    const mon = MONTHS[m[1].slice(0, m[1].toLowerCase().startsWith('sept') ? 4 : 3).toLowerCase()];
    const day = Number(m[2]);
    if (day < 1 || day > 31) continue;
    if (m[3]) push(m.index, m[0].length, utcDate(Number(m[3]), mon, day));
    else if (letterYear) push(m.index, m[0].length, utcDate(letterYear, mon, day), true);
  }
  const dayFirst = new RegExp(`\\b(\\d{1,2})\\s+${MONTH_RE}\\.?,?\\s+(\\d{4})\\b`, 'gi');
  while ((m = dayFirst.exec(text))) {
    const mon = MONTHS[m[2].slice(0, 3).toLowerCase()];
    push(m.index, m[0].length, utcDate(Number(m[3]), mon, Number(m[1])));
  }
  const numeric = /\b(\d{1,2})[/-](\d{1,2})[/-](\d{4}|\d{2})\b/g;
  while ((m = numeric.exec(text))) {
    let y = Number(m[3]); if (y < 100) y += 2000;
    push(m.index, m[0].length, utcDate(y, Number(m[1]) - 1, Number(m[2])));
  }
  const isoRe = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
  while ((m = isoRe.exec(text))) push(m.index, m[0].length, utcDate(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return found.sort((a, b) => a.index - b.index);
}

const LETTER_DATE_CUE = /(notice date|bill date|billing date|citation date|(statement )?closing date|print date|date printed|letter date|date of (this )?(notice|letter|determination|decision)|determination date|decision date|statement date|date mailed|mailed on|mail date|issue date|date issued|^\s*date\s*:?\s*$|^\s*dated?\s*:?\s*$)/i;
const INFO_CUE = /(date of service|service date|dates? of service|date of birth|\bdob\b|born|tax year|period|as of|since|received your|we received|last day worked|from\s*$|through\s*$|admitted|visit on|on your visit|filed on|issued on|account opened|last payment|payment received|incurred|charge[- ]?off)/i;
const APPOINTMENT_CUE = /(appointment|interview|hearing|court date|report for|scheduled for|is scheduled|summoned|appear (in court |before )?on|session on|conference on|meeting on|pickup)/i;
const DUE_CUE = /(due|pay(ment)?\s+(must\s+be\s+)?(by|before|received)|must be (received|paid|returned|submitted|postmarked)|respond|reply|return|send|submit|deadline|no later than|on or before|\bby\b|before|expire|ends?\b|end on|terminate|shut ?off|disconnect|cancel|vacate|renew|appeal|dispute|complete|contact|call|reschedule|final|until)/i;
const CONSEQUENCE_DATE_CUE = /(coverage will end|benefits will (stop|end)|will (end|stop|close|be (terminated|closed|cancell?ed|disconnected|suspended)) on|effective)/i;

function classifyDate(text, f) {
  const lead = before(text, f.index, 110);
  const sentence = sentenceAround(text, f.index, f.length);
  const lineStart = text.lastIndexOf('\n', f.index) + 1;
  const linePrefix = text.slice(lineStart, f.index);
  const prevLine = text.slice(text.lastIndexOf('\n', lineStart - 2) + 1, Math.max(lineStart - 1, 0));
  if (LETTER_DATE_CUE.test(linePrefix) || (linePrefix.trim() === '' && LETTER_DATE_CUE.test(prevLine))) return { kind: 'letter', sentence };
  if (INFO_CUE.test(lead.slice(-60))) return { kind: 'info', sentence };
  if (APPOINTMENT_CUE.test(lead) || (APPOINTMENT_CUE.test(sentence) && !DUE_CUE.test(lead.slice(-30)))) return { kind: 'appointment', sentence };
  if (CONSEQUENCE_DATE_CUE.test(lead.slice(-60))) return { kind: 'consequence', sentence };
  if (DUE_CUE.test(lead.slice(-60))) return { kind: 'deadline', sentence };
  if (linePrefix.trim() === '' && f.index < 200) return { kind: 'letter', sentence };
  return { kind: 'other', sentence };
}

function relativeDeadlines(text) {
  const out = [];
  const num = '(\\d{1,3}|' + Object.keys(NUMBER_WORDS).join('|') + ')';
  const re = new RegExp(`(within|in|no later than|before the end of|you have)\\s+(?:the\\s+next\\s+)?${num}(?:\\s*\\(\\d+\\))?[-\\s]+(calendar\\s+|business\\s+|working\\s+)?(day|days|hours)\\b`, 'gi');
  let m;
  while ((m = re.exec(text))) {
    const n = /^\d+$/.test(m[2]) ? Number(m[2]) : NUMBER_WORDS[m[2].toLowerCase()];
    const sentence = sentenceAround(text, m.index, m[0].length);
    const business = /business|working/i.test(m[3] || '') || /excluding saturday|excluding weekends|not counting (saturdays|weekends)/i.test(sentence);
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 120);
    const fromReceipt = /(receive|receipt|delivery|deliver|get this|you got)/i.test(after.slice(0, 60));
    // "within 30 days after you move out" counts from a future event, not from the letter: no date to compute.
    if (/^\s*(after|of|from)\s+(you|your|the day you|the end of|we|move|moving)\b/i.test(after) && !/^\s*(after|of|from)\s+(you\s+)?(receiv|get|got)/i.test(after)) continue;
    out.push({ index: m.index, n, unit: m[4].toLowerCase().startsWith('hour') ? 'hours' : 'days', business, fromReceipt, sentence });
  }
  return out;
}

// ---------- money ----------
const DUE_AMOUNT_CUE = /(amount due|penalty:|civil penalty|fine amount|fine:|pay a [\w ]{0,20}fee of|processing fee|total due|balance due|due now|past due|now due|minimum (payment )?due|amount (you )?owe|you owe|you may owe|we say you owe|you were overpaid|overpaid|overpayment of|patient responsibility|your responsibility|pay(ment)? of|balance of|sum of|total amount|renewal fee|fee:|outstanding|unpaid|owed|amount:|please pay|to pay|indebted)/i;
const NOT_DUE_CUE = /(late fee|reconnect|reconnection|fee of .*may|plan paid|insurance paid|insurance payment|plan discount|discount|adjustment|amount billed|total charges|charges|allowed|previous balance|payments? received|credit|deposit|could reduce|up to|limit|maximum|income (of|limit)|earn|wages|refund)/i;

function findAmounts(text) {
  const out = [];
  const re = /(-?)\$\s?(\d{1,3}(?:,\d{3})+|\d+)(\.\d{2})?/g;
  let m;
  while ((m = re.exec(text))) {
    const value = Number((m[2] + (m[3] || '')).replace(/,/g, ''));
    const lead = before(text, m.index, 70).slice(-55);
    const sentence = sentenceAround(text, m.index, m[0].length);
    const negative = m[1] === '-' || /\(\s*$/.test(text.slice(0, m.index));
    let role = 'other';
    if (NOT_DUE_CUE.test(lead)) role = 'other';
    else if (DUE_AMOUNT_CUE.test(lead)) role = 'due';
    else if (DUE_AMOUNT_CUE.test(sentence) && !NOT_DUE_CUE.test(sentence)) role = 'due';
    if (negative) role = 'other';
    out.push({ index: m.index, value, raw: m[0], role, sentence });
  }
  return out;
}

// ---------- kinds ----------
const KINDS = [
  { id: 'health-coverage', label: 'Health coverage renewal or change (Medicaid, CHIP, Marketplace)', re: /\b(medicaid|chip|medi-cal|medical assistance|renewal form|redetermination|health coverage|marketplace)\b/gi },
  { id: 'food-cash-benefits', label: 'Food or cash benefits (SNAP, TANF, WIC)', re: /\b(snap|food stamps|food assistance|ebt|tanf|cash assistance|wic|benefits interview)\b/gi },
  { id: 'tax', label: 'Tax notice', re: /\b(irs|internal revenue|department of revenue|tax year|form 1040|cp\d{2,4}|notice of deficiency|tax return|taxes)\b/gi },
  { id: 'eob', label: 'Insurance explanation of benefits (EOB)', re: /\b(explanation of benefits|this is not a bill|plan paid|allowed amount|plan discount)\b/gi },
  { id: 'insurance-denial', label: 'Insurance denial', re: /\b(denied|denial|not medically necessary|prior authorization|adverse benefit|appeal)\b/gi },
  { id: 'medical-bill', label: 'Medical bill', re: /\b(patient|date of service|hospital|clinic|provider|guarantor|financial assistance|itemized|statement)\b/gi },
  { id: 'debt-collection', label: 'Debt collection', re: /\b(debt collector|collection agency|collect a debt|original creditor|validation|dispute (all or part of )?the debt|collections?)\b/gi },
  { id: 'utility', label: 'Utility bill or shutoff notice', re: /\b(disconnect(ion)?|shut ?off|electric|water service|gas service|utility|kwh|meter|service termination)\b/gi },
  { id: 'housing', label: 'Housing, rent or eviction notice', re: /\b(landlord|tenant|eviction|evict|vacate|lease|rent|premises|possession)\b/gi },
  { id: 'court-jury', label: 'Court or jury notice', re: /\b(jury|juror|summons|summoned|court|clerk of|case no|plaintiff|defendant)\b/gi },
  { id: 'school', label: 'School notice', re: /\b(student|school|absences?|attendance|tardy|parent\/guardian|guardian|principal|truancy)\b/gi },
  { id: 'unemployment', label: 'Unemployment notice', re: /\b(unemployment|reemployment|claimant|weekly claims?|benefit year)\b/gi },
  { id: 'vehicle', label: 'Vehicle, license or DMV notice', re: /\b(registration|vehicle|license plate|dmv|motor vehicles?|driver'?s license|emissions)\b/gi },
  { id: 'appointment', label: 'Appointment reminder', re: /\b(appointment|reminder|reschedule)\b/gi },
];

function guessKind(text) {
  let best = null;
  for (const k of KINDS) {
    const n = (text.match(k.re) || []).length;
    if (n && (!best || n > best.n)) best = { ...k, n };
  }
  return best ? { id: best.id, label: best.label } : { id: 'unknown', label: 'Not sure what kind of letter this is' };
}

// ---------- what it asks, what happens, your rights ----------
const ACTIONS = [
  { id: 'nothing', label: 'Nothing to pay right now: this says it is not a bill. Keep it, and compare it with any bill that comes later.', re: /this is not a bill|no action (is )?(needed|required)|you do not need to (do anything|take any action|respond)/i },
  { id: 'pay', label: 'Pay an amount, or call to set up a payment plan.', re: /\b(pay(?! ?stubs?| ?checks?)|payment must|please remit|remit|payment (is )?due|amount due|balance due|i demand payment)\b/i },
  { id: 'send-documents', label: 'Send documents or proof.', re: /\b(send|submit|provide|upload|return|bring|mail|fax)\b[^.]{0,80}\b(proof|cop(y|ies)|documents?|pay ?stubs?|verification|statements?|records|receipts?|id)\b/i },
  { id: 'sign-return', label: 'Fill in, sign and return a form.', re: /\bsign\b[^.]{0,60}\b(form|return|statement)\b|\bcomplete (and sign )?(the|this|your) (enclosed |attached |online )?(\w+ )?(form|questionnaire|renewal)|\breturn the (enclosed|attached)\b/i },
  { id: 'attend', label: 'Go to (or answer the phone for) an appointment, interview or hearing.', re: /\b(interview|appointment|hearing|report for jury|appear in court|conference)\b[^.]{0,80}\b(scheduled|on|at)\b|\byou are summoned\b/i },
  { id: 'call', label: 'Call or contact them.', re: /\b(call|contact|phone)\b[^.]{0,40}\b(us|the|our|office|at|\d{3})\b/i },
  { id: 'renew', label: 'Renew something before it expires.', re: /\brenew(al)?\b[^.]{0,60}\b(by|before|expires?|online|form)\b|\bexpires? on\b/i },
  { id: 'appeal', label: 'If you disagree, file an appeal or dispute before the deadline.', re: /\b(file (an |your )?appeal|appeal (this|the) (decision|determination)|request a (fair )?hearing|to dispute (all or part of )?the debt)\b/i },
  { id: 'respond', label: 'Answer them in writing (agree, or explain why you disagree).', re: /\b(respond|response|reply)\b[^.]{0,40}\b(by|within|to this)\b/i },
  { id: 'move-out', label: 'Pay what they say you owe, or move out. Get legal help quickly.', re: /\b(deliver possession|vacate|quit the premises|move out)\b/i },
];

const CONSEQUENCES = [
  { id: 'lose-coverage', label: 'Your health coverage may end.', re: /coverage (will|may|could) (end|stop|be terminated)|lose (your )?(health )?coverage|(medicaid|chip) (will|may) end/i },
  { id: 'lose-benefits', label: 'Your benefits may stop or your application may be denied.', re: /benefits (will|may|could) (stop|end|be (closed|stopped|terminated|reduced))|application (will|may|could) be denied|case (will|may) (be )?close|denied for failure/i },
  { id: 'shutoff', label: 'Your service may be shut off.', re: /disconnect|shut ?off|service (will|may) be (terminated|suspended|interrupted)/i },
  { id: 'late-fee', label: 'You may be charged a late fee or extra charges.', re: /late (fee|charge)|reconnection fee|additional (fees|charges)|penalt(y|ies)|interest/i },
  { id: 'collections', label: 'It may be sent to collections or reported to credit bureaus.', re: /(sent|referred|turned over) to (a )?collection|credit (bureau|report)|report(ed)? .{0,20}credit/i },
  { id: 'eviction', label: 'Your landlord may start an eviction case in court.', re: /eviction|possession of the premises|deliver possession|vacate|terminat\w* (your|the) (lease|rental agreement|tenancy)/i },
  { id: 'court', label: 'It may go to court, or a decision may be made without you.', re: /notice of deficiency|lawsuit|sue you|judgment|default|referral to (the )?(court|state attorney|truancy)|legal action|without your input|becomes? final/i },
  { id: 'garnish', label: 'Money may be taken from your wages, bank account or refunds.', re: /garnish|levy|offset|intercept|withhold (your|future)|collect (it )?from your/i },
  { id: 'fine', label: 'You may get a fine or penalty.', re: /\bfine\b|\bfined\b|contempt/i },
  { id: 'assume-correct', label: 'They will treat their information as correct if you do not answer.', re: /assume (that )?(our information|the debt|it) is (correct|valid)|considered (valid|correct)|if you (do not|don't) respond[^.]*(we will|the change)/i },
];

const RIGHTS = [
  { id: 'appeal', label: 'You can appeal or ask for a hearing. Check the deadline for this.', re: /\b(appeal|fair hearing|request a hearing|reconsideration|external review|internal review)\b/i },
  { id: 'dispute', label: 'You can dispute it (say it is wrong) in writing.', re: /\bdispute\b|\bverification of the debt\b/i },
  { id: 'payment-plan', label: 'You may be able to set up a payment plan.', re: /payment (plan|arrangement|agreement)|installment/i },
  { id: 'financial-help', label: 'Financial help or charity care may be available. Ask for it.', re: /financial assistance|charity care|hardship|assistance program|liheap|energy assistance|discount program/i },
  { id: 'itemized', label: 'You can ask for an itemized bill (every charge listed).', re: /itemized/i },
  { id: 'interpreter', label: 'Free language help or interpreter is offered.', re: /interpreter|language (assistance|help|services)|free language|in your language|habla espa/i },
  { id: 'legal-help', label: 'Free legal help is mentioned.', re: /legal aid|legal services|free legal|attorney|lawyer/i },
  { id: 'reschedule', label: 'You can reschedule.', re: /reschedul/i },
];

const DOCUMENTS = [
  ['pay stubs', /pay ?stubs?|pay ?checks?|paycheck stubs/i],
  ['proof of income', /proof of (income|earnings)|income verification|verification of income/i],
  ['proof of address', /proof of (address|residency|residence)/i],
  ['photo ID', /photo id|identification|driver'?s license or|state id/i],
  ['bank statements', /bank statements?/i],
  ['tax return or W-2', /tax return|w-2|1099/i],
  ['birth certificate', /birth certificate/i],
  ['Social Security card or number', /social security (card|number)/i],
  ['proof of expenses (rent, childcare, medical)', /proof of (rent|childcare|child care|medical expenses|expenses|shelter costs)|rent receipt/i],
  ['medical records or doctor\'s letter', /medical records|letter of medical necessity|doctor'?s (letter|note|statement)/i],
  ['proof of insurance', /proof of insurance/i],
  ['the signed form', /sign(ed)? (and return|the (enclosed|attached)?\s*form)|signature page|return the (enclosed|attached)/i],
];

// ---------- scam signs ----------
const SCAM_SIGNS = [
  { id: 'gift-card', label: 'Asks for payment in gift cards. Real agencies and companies do not do this.', re: /gift ?cards?|google play card|itunes card|apple card|steam card|target card/i, weight: 3 },
  { id: 'crypto-wire', label: 'Asks for crypto, a wire transfer or a payment app. These are hard to get back.', re: /bitcoin|crypto|btc|wire (the )?(money|transfer|funds)|western union|moneygram|zelle|cash ?app|venmo|bitcoin atm/i, weight: 3 },
  { id: 'arrest', label: 'Threatens arrest or police over a payment. Government agencies do not call or text to threaten arrest.', re: /\b(arrest|warrant|police|deport|jail)\b/i, weight: 2 },
  { id: 'urgent', label: 'Pushes you to act within hours. Scammers rush you so you do not stop to check.', re: /within (24|48|12|2) hours|immediately|act now|today only|final warning|urgent|right away|as soon as possible to avoid|by today/i, weight: 1 },
  { id: 'secret-info', label: 'Asks for a password, PIN, verification code or your full Social Security number.', re: /(password|\bpin\b|verification code|one-time code|security code|login|full social security|ssn)/i, weight: 2 },
  { id: 'prize', label: 'Says you won something or are owed money you did not expect.', re: /you('ve| have)? won|winner|prize|lottery|sweepstakes|claim your (reward|refund)|unclaimed/i, weight: 2 },
  { id: 'odd-link', label: 'Has a link that is not an official address (short link or odd ending such as .top, .xyz, .icu).', re: /(https?:\/\/)?[\w.-]+\.(top|xyz|icu|vip|cc|click|info|live|shop|online|site|cyou|buzz|rest|sbs|cfd|lol)\b|bit\.ly|tinyurl|t\.co\/|cutt\.ly|rb\.gy/i, weight: 2 },
  { id: 'toll-delivery', label: 'Matches a common text scam: unpaid toll, failed delivery, or bank "fraud alert" with a link.', re: /unpaid toll|outstanding toll|toll (balance|notice|services)|package (could not|cannot|can't) be delivered|redelivery|incomplete address|suspicious (activity|charge)[^.]{0,60}(reply|click|tap)/i, weight: 2 },
  { id: 'reply-code', label: 'Asks you to reply with a letter or number, or to tap a link to "verify".', re: /reply ['"]?(y|yes|1)['"]?|reply with|tap (the )?link|click (the |this )?link|verify your (account|identity)/i, weight: 1 },
];

function scamCheck(text) {
  const signs = SCAM_SIGNS.filter((s) => s.re.test(text));
  let score = signs.reduce((a, s) => a + s.weight, 0);
  // An official letter with a case number, an appeal right and a mailing address is less likely to be a scam,
  // but it does not cancel strong signs like gift cards.
  const official = /(case (number|no)|notice number|account number|claim (number|no)|fair hearing|appeal|po box|p\.o\. box)/i.test(text);
  if (official && !signs.some((s) => s.weight >= 3)) score -= 1;
  const level = score >= 3 ? 'high' : score >= 2 ? 'some' : 'low';
  return { level, score, signs: signs.map(({ id, label }) => ({ id, label })) };
}

// ---------- plain words ----------
export const GLOSSARY = {
  'adverse benefit determination': 'the insurer decided not to pay or not to approve something',
  'allowed amount': 'the most your insurance plan counts for this service',
  'balance billing': 'a provider billing you for the gap between their price and what insurance paid',
  'claimant': 'the person asking for the benefit (you)',
  'coinsurance': 'your share of the cost, as a percent, after the deductible',
  'copay': 'a set amount you pay for a visit or prescription',
  'deductible': 'what you pay each year before insurance starts paying',
  'deficiency': 'more tax the IRS says you owe',
  'delinquent': 'late or past due',
  'determination': 'a decision',
  'eligibility': 'whether you qualify',
  'explanation of benefits': 'a summary from your insurer of what it paid; not a bill',
  'fair hearing': 'a meeting with a judge or officer where you can say why a decision on your benefits is wrong',
  'garnishment': 'money taken from your pay or bank account to pay a debt',
  'guarantor': 'the person responsible for paying the bill',
  'in arrears': 'behind on payments',
  'levy': 'a legal seizure of money or property to pay a debt',
  'lien': 'a legal claim on your property until a debt is paid',
  'medically necessary': 'needed to diagnose or treat a health problem, by the insurer\'s rules',
  'notice of deficiency': 'a formal IRS letter saying you owe more tax; it starts a deadline to go to Tax Court',
  'original creditor': 'the company you first owed the money to',
  'overpayment': 'they say they paid you more than you should have received and may want it back',
  'patient responsibility': 'what you are expected to pay',
  'possession': 'the right to live in the home; giving possession means moving out',
  'prior authorization': 'approval your insurer wants before a service or drug',
  'pro rata': 'divided in proportion',
  'reconsideration': 'asking them to look at the decision again',
  'redetermination': 'a check of whether you still qualify',
  'renewal': 'the check, often yearly, to keep your coverage or benefits going',
  'summons': 'an official order to appear in court or for jury duty',
  'to wit': 'namely',
  'validation notice': 'a debt collector\'s letter saying what debt they claim and how to dispute it',
  'verification': 'proof',
  'waiver': 'giving up a right, or them excusing you from something',
  'write-off': 'a debt the company stopped trying to collect on its own books',
};

function glossary(text) {
  const lower = text.toLowerCase();
  return Object.entries(GLOSSARY).filter(([term]) => new RegExp(`\\b${term.replace(/[-]/g, '[- ]')}\\b`).test(lower)).map(([term, meaning]) => ({ term, meaning }));
}

// ---------- privacy: strip personal numbers before asking an AI ----------
export function redact(text) {
  return text
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
    .replace(/\b(?:ssn|social security (?:number|no\.?))\s*:?\s*[\dX*-]{4,}/gi, '[SSN]')
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[EMAIL]')
    .replace(/\b(ID|[Nn]umber|[Nn]o\.|#)(\s*:?\s*)(?=[A-Z0-9-]*\d)[A-Z0-9][A-Z0-9-]{3,}\b/g, '$1$2[NUMBER]')
    .replace(/\b([Dd]ear|ATTN:?|[Aa]ttn:?|[Tt]o:|[Pp]atient:?|[Nn]ame:?|[Tt]enant:|[Cc]laimant:|[Gg]uarantor:?|[Ss]tudent:|[Mm]ember:|[Bb]orrower:|[Dd]ebtor:)\s+((?:[Mm]rs?|[Mm]s|[Dd]r)\.?\s+)?[A-Z][a-zA-Z'-]+(?:\s+[A-Z]\.?(?![a-z]))?(?:\s+[A-Z][a-zA-Z'-]+){0,2}/g, (m, cue) => `${cue} [NAME]`)
    .replace(/\b\d{1,6}\s+(?:[A-Z][a-z]+\s){1,3}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Way|Pl|Place|Cir|Circle|Pkwy|Hwy|Trl|Terrace|Ter)\b\.?(?:,?\s*(?:Apt|Unit|#)\s*\w+)?/g, '[ADDRESS]')
    .replace(/\(?\b(?!8(00|88|77|66|55|44|33)\b)\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g, '[PHONE]')
    .replace(/\b(?:[A-Z]{1,4}-?)?\d[\d-]{6,}\d\b/g, (m) => (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(m) || /^\d{4}-\d{2}-\d{2}$/.test(m) || /^(1-)?8(00|88|77|66|55|44|33)-\d{3}-\d{4}$/.test(m) ? m : '[NUMBER]'));
}

export const LANGUAGES = ['English', 'Spanish', 'Chinese', 'Vietnamese', 'Tagalog', 'Arabic', 'French', 'Haitian Creole', 'Korean', 'Russian', 'Portuguese', 'Somali'];

export function buildPrompt(text, language = 'English') {
  return [
    `I got this letter. Explain it to me in plain ${language}, like you would to a friend, using short sentences.`,
    '1. Who sent it and why, in one sentence.',
    '2. What I have to do, as a checklist, with the exact date for each step.',
    '3. What happens if I do nothing.',
    '4. My rights: can I appeal, dispute or ask for help, and by when?',
    '5. Anything that looks like a scam, and how to check it is real (use the phone number on the official website, not the one in the letter).',
    '6. Three questions I should ask when I call them.',
    'Only use what the letter says. If something is not in the letter, say "the letter does not say". Do not guess dates or amounts.',
    '',
    '--- LETTER (personal details removed) ---',
    redact(text).trim(),
  ].join('\n');
}

// ---------- calendar file ----------
export function toICS(deadline, title = 'Letter deadline') {
  const d = deadline.date.replace(/-/g, '');
  const next = iso(addDays(fromIso(deadline.date), 1)).replace(/-/g, '');
  const esc = (s) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, ' ');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//letter-check//EN', 'BEGIN:VEVENT',
    `UID:${d}-${Math.abs(hash(deadline.sentence || title))}@letter-check`,
    `DTSTAMP:${d}T000000Z`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next}`,
    `SUMMARY:${esc(title)}`, `DESCRIPTION:${esc((deadline.sentence || '').slice(0, 300))}`,
    'BEGIN:VALARM', 'TRIGGER:-P3D', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)} in 3 days`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
}
function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }

// ---------- main ----------
export function analyze(input, opts = {}) {
  const text = String(input || '').replace(/\r\n?/g, '\n').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/–|—/g, '-');
  const today = opts.today ? (typeof opts.today === 'string' ? fromIso(opts.today) : opts.today) : (() => { const n = new Date(); return utcDate(n.getFullYear(), n.getMonth(), n.getDate()); })();
  if (!text.trim()) return null;

  // Pass 1: full-year dates to find the letter date and year; pass 2 picks up "December 3" with the year assumed.
  const firstPass = findDates(text, null).map((f) => ({ ...f, ...classifyDate(text, f) }));
  let letterDate = firstPass.find((f) => f.kind === 'letter')?.date || null;
  const year = (letterDate || today).getUTCFullYear();
  const dates = findDates(text, year).map((f) => ({ ...f, ...classifyDate(text, f) }));
  if (!letterDate) letterDate = dates.find((f) => f.kind === 'letter')?.date || null;
  for (const f of dates) if (f.yearAssumed && letterDate && f.date < letterDate) f.date = utcDate(f.date.getUTCFullYear() + 1, f.date.getUTCMonth(), f.date.getUTCDate());

  const deadlines = [];
  for (const f of dates) {
    if (!['deadline', 'appointment', 'consequence'].includes(f.kind)) continue;
    if (deadlines.some((d) => d.date === iso(f.date) && d.kind === f.kind)) continue;
    deadlines.push({ date: iso(f.date), kind: f.kind, sentence: f.sentence, approximate: f.yearAssumed, how: f.yearAssumed ? 'year not written; assumed' : 'written in the letter' });
  }
  for (const r of relativeDeadlines(text)) {
    if (r.unit === 'hours') { deadlines.push({ date: iso(today), kind: 'deadline', sentence: r.sentence, approximate: true, how: `within ${r.n} hours` }); continue; }
    // Skip "within 3 days ... to wit: on or before <date>" when the same sentence already gave the date.
    if (dates.some((f) => f.kind === 'deadline' && sentenceAround(text, f.index, f.length) === r.sentence)) continue;
    const base = r.fromReceipt ? null : letterDate;
    const start = base || today;
    const date = r.business ? addBusinessDays(start, r.n) : addDays(start, r.n);
    deadlines.push({
      date: iso(date), kind: 'deadline', sentence: r.sentence, approximate: true,
      how: `${r.n} ${r.business ? 'business ' : ''}days from ${base ? 'the date on the letter' : (r.fromReceipt ? 'when you got it (counted from today)' : 'today (no letter date found)')}`,
    });
  }
  const upcoming = deadlines.filter((d) => d.kind !== 'consequence' && fromIso(d.date) >= (letterDate && letterDate < today ? letterDate : today))
    .sort((a, b) => a.date.localeCompare(b.date));
  for (const d of deadlines) d.daysLeft = daysBetween(today, fromIso(d.date));
  deadlines.sort((a, b) => a.date.localeCompare(b.date));

  const amounts = findAmounts(text);
  const due = amounts.filter((a) => a.role === 'due');
  const strongDue = due.find((a) => /(amount due|total due|balance due|amount you owe|you owe|past due|patient responsibility|overpaid|sum of|renewal fee|outstanding|please pay)/i.test(before(text, a.index, 60)));
  const mainAmount = strongDue || due[0] || null;

  const notABill = /this is not a bill|not a bill/i.test(text);
  const actions = ACTIONS.filter((a) => a.re.test(text)).map(({ id, label }) => ({ id, label }));
  const filteredActions = notABill ? actions.filter((a) => a.id !== 'pay') : actions;
  const consequences = CONSEQUENCES.filter((c) => c.re.test(text)).map(({ id, label }) => ({ id, label }));
  const rights = RIGHTS.filter((r) => r.re.test(text)).map(({ id, label }) => ({ id, label }));
  const documents = DOCUMENTS.filter(([, re]) => re.test(text)).map(([name]) => name);
  const scam = scamCheck(text);
  const kind = guessKind(text);
  const phones = [...new Set((text.match(/(?:1[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g) || []).map((p) => p.trim()))];
  const links = [...new Set(text.match(/\bhttps?:\/\/[^\s)]+|\bwww\.[^\s)]+|\b(?:[\w-]+\.)+(?:gov|com|org|net|us)\b(?:\/[^\s)]*)?/gi) || [])].filter((l) => !/@/.test(l));

  const primary = upcoming[0] || null;
  return {
    kind,
    letterDate: iso(letterDate),
    primaryDeadline: primary,
    deadlines,
    amountDue: mainAmount ? { value: mainAmount.value, raw: mainAmount.raw, sentence: mainAmount.sentence, notABill } : null,
    amounts: amounts.map(({ value, raw, role }) => ({ value, raw, role })),
    actions: filteredActions,
    documents,
    consequences,
    rights,
    scam,
    glossary: glossary(text),
    contacts: { phones, links },
    today: iso(today),
  };
}
