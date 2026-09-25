// Builds public/og-cover-v2.jpg (1200x630) — branded WhatsApp/social preview.
// Run: node scripts/build-og-cover.mjs  (needs `sharp` in node_modules)
import sharp from 'sharp';

const W = 1200;
const H = 630;
const INK = '#17201B';
const MUTED = '#68736D';
const GREEN = '#0F5132';
const DEEP = '#093B25';
const GOLD = '#B8944A';
const IVORY = '#FAF8F2';

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${IVORY}"/>
  <rect width="${W}" height="10" fill="${GOLD}"/>
  <rect y="${H - 10}" width="${W}" height="10" fill="${GREEN}"/>
  <circle cx="1095" cy="150" r="110" fill="${GREEN}" opacity="0.07"/>
  <circle cx="1062" cy="118" r="110" fill="${IVORY}" opacity="0.95"/>
  <circle cx="105" cy="560" r="120" fill="none" stroke="${GOLD}" stroke-width="3" opacity="0.35"/>
  <circle cx="105" cy="560" r="86" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0.25"/>
  <text x="600" y="150" text-anchor="middle" font-family="Verdana, Geneva, sans-serif" font-size="30" letter-spacing="8" fill="${GREEN}">AUTHENTIC ISLAMIC KNOWLEDGE</text>
  <text x="600" y="285" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="132" fill="${DEEP}">Hikmah Noor</text>
  <text x="600" y="350" text-anchor="middle" font-family="Verdana, Geneva, sans-serif" font-size="42" fill="${MUTED}">Quran  •  Duas  •  Prophets  •  Tools</text>
  <line x1="430" y1="392" x2="770" y2="392" stroke="${GOLD}" stroke-width="2" opacity="0.7"/>
  <rect x="592" y="384" width="16" height="16" transform="rotate(45 600 392)" fill="${GOLD}"/>
  <g font-family="Verdana, Geneva, sans-serif" font-size="32" font-weight="bold">
    <rect x="234" y="428" width="220" height="64" rx="32" fill="${GREEN}"/>
    <text x="344" y="471" text-anchor="middle" fill="#FFFFFF">114 Surahs</text>
    <rect x="470" y="428" width="200" height="64" rx="32" fill="${GREEN}"/>
    <text x="570" y="471" text-anchor="middle" fill="#FFFFFF">300 Duas</text>
    <rect x="686" y="428" width="280" height="64" rx="32" fill="${GREEN}"/>
    <text x="826" y="471" text-anchor="middle" fill="#FFFFFF">4 Languages</text>
  </g>
  <text x="600" y="556" text-anchor="middle" font-family="Verdana, Geneva, sans-serif" font-size="30" fill="${MUTED}">hikmahnoor.in  —  free, no account needed</text>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 88, mozjpeg: true }).toFile('public/og-cover-v2.jpg');
console.log('wrote public/og-cover-v2.jpg');
