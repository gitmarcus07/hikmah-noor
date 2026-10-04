// Full-site SEO quality audit over built dist/*.html (read-only).
// Reports: title/desc length + duplicates, h1 issues, thin pages,
// missing JSON-LD, images without alt.
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html' || e.name.endsWith('.html')) files.push(p);
  }
})(DIST);

const strip = (s) => s.replace(/\s+/g, ' ').trim();
const titles = new Map();
const descs = new Map();
const issues = { noTitle: [], shortTitle: [], longTitle: [], dupTitle: [], noDesc: [], shortDesc: [], longDesc: [], dupDesc: [], noH1: [], multiH1: [], thin: [], noLd: [], imgNoAlt: [] };
let n = 0;

for (const f of files) {
  const x = fs.readFileSync(f, 'utf8');
  const rel = f.replace(/\\/g, '/').replace(/^dist\//, '/').replace(/index\.html$/, '').replace(/\.html$/, '');
  n++;
  const tm = x.match(/<title>([^<]*)<\/title>/);
  const title = tm ? strip(tm[1].replace(/\s*\|\s*Hikmah Noor\s*$/, '')) : '';
  if (!title) issues.noTitle.push(rel);
  else {
    if (title.length < 30) issues.shortTitle.push(`${title.length} :: ${rel} :: ${title.slice(0, 70)}`);
    if (title.length > 65) issues.longTitle.push(`${title.length} :: ${rel} :: ${title.slice(0, 80)}`);
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(rel);
  }
  const dm = x.match(/<meta name="description" content="([^"]*)"/);
  const desc = dm ? dm[1] : '';
  if (!desc) issues.noDesc.push(rel);
  else {
    if (desc.length < 120) issues.shortDesc.push(`${desc.length} :: ${rel}`);
    if (desc.length > 160) issues.longDesc.push(`${desc.length} :: ${rel}`);
    if (!descs.has(desc)) descs.set(desc, []);
    descs.get(desc).push(rel);
  }
  const h1s = [...x.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => strip(m[1].replace(/<[^>]+>/g, '')));
  if (!h1s.length) issues.noH1.push(rel);
  if (h1s.length > 1) issues.multiH1.push(`${h1s.length} :: ${rel}`);
  const body = x.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/g, ' ').replace(/<header[\s\S]*?<\/header>/g, ' ').replace(/<footer[\s\S]*?<\/footer>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  const words = strip(body).split(' ').filter(Boolean).length;
  if (words < 300) issues.thin.push(`${words} :: ${rel}`);
  if (!x.includes('application/ld+json')) issues.noLd.push(rel);
  const imgs = [...x.matchAll(/<img(?![^>]*alt=)[^>]*>/g)];
  if (imgs.length) issues.imgNoAlt.push(`${imgs.length} :: ${rel}`);
}
for (const [t, rs] of titles) if (rs.length > 1) issues.dupTitle.push(`${rs.length}x :: ${t.slice(0, 70)} :: e.g. ${rs[0]}`);
for (const [d, rs] of descs) if (rs.length > 1) issues.dupDesc.push(`${rs.length}x :: ${rs[0]} :: ${d.slice(0, 60)}`);

console.log(`pages=${n}`);
for (const [k, v] of Object.entries(issues)) {
  console.log(`\n== ${k} (${v.length}) ==`);
  for (const line of v.slice(0, 25)) console.log('  ' + line);
  if (v.length > 25) console.log(`  ... +${v.length - 25} more`);
}
