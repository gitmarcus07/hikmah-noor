// Generates public/donate-qr.svg — beautiful on-brand UPI QR (emerald on white).
// Run: node scripts/build-donate-qr.mjs
// Source of truth for the VPA lives in src/lib/donate.ts (parts, never displayed).
import QRCode from 'qrcode';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const P1 = '9906273197';
const P2 = '-2';
const P3 = '@ybl';
const VPA = `${P1}${P2}${P3}`;

const params = null; // (kept explicit below — pa must keep raw `@` for PhonePe)
const payload =
  `upi://pay?pa=${VPA}` +
  `&pn=${encodeURIComponent('ABDUL WASEEM AHANGER')}` +
  `&cu=INR` +
  `&tn=${encodeURIComponent('Hikmah Noor Donation')}`;

const svg = await QRCode.toString(payload, {
  type: 'svg',
  errorCorrectionLevel: 'H',
  margin: 2,
  color: { dark: '#0F5132', light: '#ffffff' },
});

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'public', 'donate-qr.svg');
writeFileSync(out, svg);
console.log(`wrote ${out} (${svg.length} bytes) payload=${payload.length} chars`);
