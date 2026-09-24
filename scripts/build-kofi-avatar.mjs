// Builds public/kofi-avatar.png (800x800) — Ko-fi profile picture.
// Emerald disc + gold ring + vector crescent & star (no emoji glyphs).
// Run: node scripts/build-kofi-avatar.mjs  (needs `sharp` in node_modules)
import sharp from 'sharp';

const S = 800;
const GREEN = '#0F5132';
const GOLD = '#B8944A';

function starPoints(cx, cy, outer, inner, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / n) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <rect width="${S}" height="${S}" fill="${GREEN}"/>
  <circle cx="400" cy="400" r="335" fill="none" stroke="${GOLD}" stroke-width="7" opacity="0.9"/>
  <circle cx="400" cy="400" r="312" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0.45"/>
  <circle cx="385" cy="395" r="150" fill="${GOLD}"/>
  <circle cx="448" cy="348" r="128" fill="${GREEN}"/>
  <polygon points="${starPoints(505, 292, 58, 23)}" fill="${GOLD}"/>
  <text x="400" y="660" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="64" fill="#FFFFFF" opacity="0.95">Hikmah Noor</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/kofi-avatar.png');
console.log('wrote public/kofi-avatar.png');
