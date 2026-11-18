// Scores letter-check against the made-up example letters and writes results/.
// Usage: node scripts/evaluate.js            (prints and writes results/results.md + results.json)
import { writeFileSync, mkdirSync } from 'node:fs';
import { analyze } from '../src/letter.js';
import { EXAMPLES, TODAY } from '../src/examples.js';
import { HELDOUT } from '../src/heldout.js';
import { FRESH } from '../src/fresh.js';

const FIELDS = ['kind', 'deadline', 'amount', 'scam', 'documents', 'consequences'];

export function score(example) {
  const r = analyze(example.text, { today: TODAY });
  const e = example.expect;
  const got = {
    kind: r.kind.id,
    deadline: r.primaryDeadline ? r.primaryDeadline.date : null,
    amount: r.amountDue ? r.amountDue.value : null,
    scam: r.scam.level === 'high',
    documents: r.documents,
    consequences: r.consequences.map((c) => c.id),
  };
  const checks = {};
  for (const f of FIELDS) {
    if (!(f in e)) continue;
    if (f === 'kind' && e.kind === null) continue; // a short scam text has no fair "kind"
    if (f === 'documents' || f === 'consequences') {
      const missing = e[f].filter((x) => !got[f].includes(x));
      checks[f] = { ok: missing.length === 0, expected: e[f], got: got[f], note: missing.length ? `missed ${missing.join(', ')}` : '' };
    } else {
      checks[f] = { ok: got[f] === e[f], expected: e[f], got: got[f] };
    }
  }
  return { id: example.id, title: example.title, checks };
}

function run(set) {
  const rows = set.map(score);
  let right = 0; let wrong = 0;
  for (const row of rows) for (const c of Object.values(row.checks)) (c.ok ? right++ : wrong++);
  const perfect = rows.filter((r) => Object.values(r.checks).every((c) => c.ok)).length;
  return { rows, right, wrong, perfect, letters: rows.length };
}

function table(name, res) {
  const lines = [`## ${name}: ${res.perfect} of ${res.letters} letters fully right; ${res.right} of ${res.right + res.wrong} checks right`, '',
    '| Letter | Kind | Main deadline | Amount | Scam flag | Documents | What happens |', '|---|---|---|---|---|---|---|'];
  const cell = (c) => (!c ? 'n/a' : c.ok ? `right (${fmt(c.got)})` : `**wrong**: got ${fmt(c.got)}, expected ${fmt(c.expected)}`);
  for (const r of res.rows) lines.push(`| ${r.title} | ${FIELDS.map((f) => cell(r.checks[f])).join(' | ')} |`);
  return lines.join('\n');
}
function fmt(v) { return Array.isArray(v) ? (v.length ? v.join(', ') : 'none') : v === null ? 'none' : String(v); }

if (import.meta.url === `file://${process.argv[1]}`) {
  const dev = run(EXAMPLES);
  const held = run(HELDOUT);
  const fresh = run(FRESH);
  const md = ['# letter-check results', '',
    `Scored as of ${TODAY} with \`node scripts/evaluate.js\`. All letters are made up (no real personal data).`,
    'Each letter is checked on up to six things: the kind of letter, the most urgent date, the amount it asks for, whether it is flagged as a likely scam, the documents it asks for, and what happens if you do nothing.',
    '', 'Three sets, in the order they were written:',
    '- **Build set** (16): written while building the rules. It flatters the tool.',
    '- **Held-out set** (10): written with the rules frozen. Its one blind run scored 50 of 56 checks (see `heldout-first-run.md`); three rules were then fixed, so the number below is no longer blind.',
    '- **Fresh set** (6): written after those fixes and scored once; rules not changed afterwards. This is the most honest number here, and it is small.', '',
    table('Build set', dev), '', table('Held-out set (after fixes; not blind)', held), '', table('Fresh set (blind)', fresh), ''].join('\n');
  mkdirSync(new URL('../results/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../results/results.md', import.meta.url), md);
  writeFileSync(new URL('../results/results.json', import.meta.url), JSON.stringify({ today: TODAY, build: dev, heldout: held, heldoutFirstBlindRun: { right: 50, checks: 56, perfect: 6, letters: 10 }, fresh }, null, 2) + '\n');
  console.log(md);
}
