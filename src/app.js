import { analyze, buildPrompt, toICS, formatDate, fromIso, LANGUAGES } from './letter.js';
import { EXAMPLES, TODAY } from './examples.js';

const $ = (id) => document.getElementById(id);
const letter = $('letter');
const out = $('out');
let exampleMode = false;

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else n.setAttribute(k, v);
  }
  for (const k of kids.flat(Infinity)) if (k != null) n.append(k);
  return n;
}
const card = (title, cls, ...kids) => el('div', { class: `card ${cls || ''}` }, title ? el('h2', { text: title }) : null, ...kids);
const list = (items, cls) => el('ul', cls ? { class: cls } : {}, items.map((t) => el('li', { text: t })));

function daysText(n) {
  if (n < 0) return `${-n} day${n === -1 ? '' : 's'} ago`;
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  return `${n} days from today`;
}
const kindWord = { deadline: 'Deadline', appointment: 'Appointment', consequence: 'Change takes effect' };

function render(r) {
  out.replaceChildren();
  if (!r) return;
  const parts = [];

  if (r.scam.level !== 'low') {
    parts.push(card(r.scam.level === 'high' ? 'This looks like a scam' : 'Some scam warning signs', `scam-${r.scam.level}`,
      list(r.scam.signs.map((s) => s.label)),
      el('p', { class: 'small', text: 'Do not use the link or phone number in the message. Look up the real company or agency yourself and contact them directly. In the US you can report scams at reportfraud.ftc.gov.' })));
  }

  const facts = [el('p', { class: 'small kind' }, el('b', { text: 'Looks like: ' }), r.kind.label)];
  if (r.amountDue) {
    facts.push(el('p', { class: 'amount' }, el('b', { text: r.amountDue.notABill ? 'Amount mentioned: ' : 'Amount they ask for: ' }), r.amountDue.raw,
      r.amountDue.notABill ? ' (the letter says it is not a bill)' : ''));
  }

  const p = r.primaryDeadline;
  if (p) {
    const cls = p.daysLeft <= 7 ? 'urgent' : p.daysLeft <= 21 ? 'soon' : '';
    const label = p.kind === 'appointment' ? 'Next appointment' : 'Most urgent deadline';
    const a = el('a', { class: 'btn secondary', download: 'letter-deadline.ics', href: 'data:text/calendar;charset=utf-8,' + encodeURIComponent(toICS(p, `${label}: ${r.kind.label}`)) }, 'Add to my calendar');
    parts.push(card(label, cls,
      el('div', { class: 'big' }, formatDate(fromIso(p.date)), ' ', el('span', { class: 'when', text: `(${daysText(p.daysLeft)})` })),
      p.approximate ? el('p', { class: 'small', text: `Worked out as ${p.how}. Check this on the letter: the start date or counting rules can differ.` }) : null,
      el('p', { class: 'quote', text: p.sentence }),
      ...facts,
      el('div', { class: 'row' }, a)));
  } else {
    parts.push(card('Deadline', '', el('p', { text: 'No deadline found. Read the letter again for words like "by", "within" or "before", and check the back of the page.' }), ...facts));
  }

  if (r.actions.length) parts.push(card('What it asks you to do', '', list(r.actions.map((a) => a.label), 'check')));
  if (r.documents.length) parts.push(card('Documents to get ready', '', list(r.documents, 'check')));
  if (r.consequences.length) parts.push(card('If you do nothing', '', list(r.consequences.map((c) => c.label))));
  if (r.rights.length) parts.push(card('Your options', '', list(r.rights.map((c) => c.label))));

  const others = r.deadlines.filter((d) => d !== p);
  if (others.length) {
    parts.push(card('Other dates in the letter', '', el('ul', {}, others.map((d) => el('li', {},
      el('b', { text: `${kindWord[d.kind]}: ${formatDate(fromIso(d.date))}` }), ` (${daysText(d.daysLeft)})`,
      el('div', { class: 'quote', text: d.sentence }))))));
  }
  if (r.glossary.length) parts.push(card('Words explained', '', el('dl', {}, r.glossary.map((g) => [el('dt', { text: g.term }), el('dd', { text: g.meaning })]))));
  const c = r.contacts;
  if (c.phones.length || c.links.length) {
    parts.push(card('Phone numbers and links in the letter', '', list([...c.phones, ...c.links]),
      el('p', { class: 'small', text: 'Before you call or click, check the number or address against the official website you find yourself.' })));
  }
  if (exampleMode) parts.unshift(el('p', { class: 'small', text: `Example letter: counted as if today were ${formatDate(fromIso(TODAY))}.` }));
  out.replaceChildren(...parts);

  $('ai').classList.remove('hidden');
  updatePrompt();
}

function updatePrompt() { $('prompt').value = buildPrompt(letter.value, $('lang').value); }

function run() {
  const r = analyze(letter.value, exampleMode ? { today: TODAY } : {});
  render(r);
  if (r) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

for (const e of EXAMPLES) $('example').append(el('option', { value: e.id, text: e.title }));
for (const l of LANGUAGES) $('lang').append(el('option', { value: l, text: l }));
$('example').addEventListener('change', (ev) => {
  const e = EXAMPLES.find((x) => x.id === ev.target.value);
  if (!e) return;
  letter.value = e.text; exampleMode = true; run();
});
letter.addEventListener('input', () => { exampleMode = false; });
$('go').addEventListener('click', run);
$('lang').addEventListener('change', updatePrompt);
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('prompt').value); $('copied').textContent = 'Copied. Paste it into any AI chat.'; } catch {
    $('prompt').select(); $('copied').textContent = 'Select all and copy.';
  }
});
