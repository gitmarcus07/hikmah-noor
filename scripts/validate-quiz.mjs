// Quiz library validator: unique slugs/cats, 10 questions each,
// 4 options + valid answer index + non-empty explanation per question.
// Run: npm run content:quiz
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const txt = await readFile(join(ROOT, 'src', 'data', 'quizzes.ts'), 'utf8');

let errors = 0;
const fail = (msg) => { errors++; console.error('❌ ' + msg); };

const cats = [...txt.matchAll(/slug: '([^']+)', title:/g)].map((m) => m[1]);
const catSet = new Set(cats);
const quizzes = [...txt.matchAll(/\{ slug: '([^']+)', cat: '([^']+)'/g)].map((m) => ({ slug: m[1], cat: m[2] }));
if (new Set(quizzes.map((q) => q.slug)).size !== quizzes.length) fail('duplicate quiz slugs');
for (const q of quizzes) if (!catSet.has(q.cat)) fail(`quiz ${q.slug} has unknown category: ${q.cat}`);

const starts = [...txt.matchAll(/\{ slug: '[^']+', cat: '/g)].map((m) => m.index);
const required = ['title:', 'desc:', 'questions:', 'keywords:', 'aliases:'];
starts.forEach((s, i) => {
  const e = i + 1 < starts.length ? starts[i + 1] : txt.length;
  const body = txt.slice(s, e);
  const slug = quizzes[i]?.slug ?? `#${i + 1}`;
  for (const f of required) if (!body.includes(f)) fail(`quiz ${slug} missing ${f}`);
  const qs = [...body.matchAll(/\{ q: '/g)].length;
  if (qs !== 10) fail(`quiz ${slug} has ${qs} questions, expected 10`);
  const opts = [...body.matchAll(/options: \[/g)].length;
  if (opts !== 10) fail(`quiz ${slug} has ${opts} option sets, expected 10`);
  const ans = [...body.matchAll(/answer: (\d)/g)].map((m) => Number(m[1]));
  if (ans.length !== 10 || ans.some((a) => a < 0 || a > 3)) fail(`quiz ${slug} has bad answer indexes`);
  const whys = [...body.matchAll(/why: '/g)].length;
  if (whys !== 10) fail(`quiz ${slug} has ${whys} explanations, expected 10`);
});

console.log(`\n📊 Quiz cats: ${cats.length} — ${cats.join(', ')}`);
console.log(`📊 Quizzes: ${quizzes.length} — ${quizzes.map((q) => q.slug).join(', ')}`);
if (errors) { console.error(`\n${errors} error(s). Fix before building.`); process.exit(1); }
console.log('\n✅ quizzes.ts valid — unique slugs, 10 questions each with answers + explanations.');
