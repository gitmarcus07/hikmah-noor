// Phase 10 PWA icon generator: brand-geometric app icons, zero dependencies.
// Draws (in raw RGBA + zlib) an emerald field with a gold crescent + star,
// matching the site brand (#07352A / #D4AF37). Outputs:
//   public/icons/icon-192.png   (any)
//   public/icons/icon-512.png   (any)
//   public/icons/icon-maskable-512.png (maskable: art inset to the safe zone)
// Re-runnable: node scripts/build-pwa-icons.mjs (also validates output).
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync, inflateSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'icons');

const BG = [7, 53, 42, 255];      // deep emerald (site brand)
const GOLD = [212, 175, 55, 255]; // brand gold
const GOLD_SOFT = [247, 224, 139, 255];

function crc32(buf) {
  let table = crc32.t;
  if (!table) {
    table = crc32.t = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** Minimal truecolor+alpha PNG (filter 0). */
function pngRGBA(w, h, px) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    px.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit truecolor+alpha
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function drawIcon(size, artScale) {
  const px = Buffer.alloc(size * size * 4);
  const R = size / 2;
  // field
  for (let i = 0; i < size * size; i++) {
    px[i * 4] = BG[0]; px[i * 4 + 1] = BG[1]; px[i * 4 + 2] = BG[2]; px[i * 4 + 3] = 255;
  }
  // subtle radial lightening toward the top (deterministic, cheap)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - R) / R, dy = (y - R * 0.7) / R;
      const d = Math.sqrt(dx * dx + dy * dy);
      const lift = Math.max(0, 1 - d) * 14;
      const i = (y * size + x) * 4;
      px[i] += lift; px[i + 1] += lift; px[i + 2] += lift * 0.6;
    }
  }
  const set = (x, y, c) => {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255;
  };
  const disc = (cx, cy, r, c) => {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const dx = (x - cx) / r, dy = (y - cy) / r;
        if (dx * dx + dy * dy <= 1) set(x, y, c);
      }
    }
  };
  const ring = (cx, cy, r, w, c) => {
    for (let y = Math.floor(cy - r - w); y <= Math.ceil(cy + r + w); y++) {
      for (let x = Math.floor(cx - r - w); x <= Math.ceil(cx + r + w); x++) {
        const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (Math.abs(d - r) <= w / 2) set(x, y, c);
      }
    }
  };
  const star8 = (cx, cy, r, c) => {
    for (let a = 0; a < 8; a++) {
      const t = (a / 8) * Math.PI * 2 + Math.PI / 8;
      for (let s = 0; s <= r; s += 0.5) set(cx + Math.cos(t) * s, cy + Math.sin(t) * s, c);
    }
    disc(cx, cy, r * 0.32, c);
  };
  // crescent: gold disc with field-colored offset disc
  const cr = R * 0.52 * artScale;
  const ccx = R - cr * 0.18, ccy = R - cr * 0.06;
  disc(ccx, ccy, cr, GOLD);
  disc(ccx + cr * 0.42, ccy - cr * 0.16, cr * 0.86, BG);
  // gold ring + soft highlight arc
  ring(R, R, cr * 1.42, Math.max(2, size * 0.008), GOLD);
  // 8-point star at the crescent opening
  star8(ccx + cr * 0.95, ccy - cr * 0.1, cr * 0.30, GOLD_SOFT);
  return pngRGBA(size, size, px);
}

/** Validate a PNG file: signature, IHDR dims, IDAT inflates to w*h*4+rows. */
export function checkPng(path, w, h) {
  const b = readFileSync(path);
  const sig = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => b[i] === v);
  const W = b.readUInt32BE(16), H = b.readUInt32BE(20);
  let pos = 8, idat = [];
  while (pos < b.length) {
    const len = b.readUInt32BE(pos);
    const type = b.toString('ascii', pos + 4, pos + 8);
    if (type === 'IDAT') idat.push(b.subarray(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  return sig && W === w && H === h && raw.length === (w * 4 + 1) * h;
}

mkdirSync(OUT, { recursive: true });
const jobs = [
  ['icon-192.png', 192, 1],
  ['icon-512.png', 512, 1],
  ['icon-maskable-512.png', 512, 0.72],
];
for (const [name, size, scale] of jobs) {
  const p = join(OUT, name);
  writeFileSync(p, drawIcon(size, scale));
  const ok = checkPng(p, size, size);
  console.log(`${ok ? 'OK ' : 'X  '} ${name} (${size}x${size})`);
  if (!ok) process.exit(1);
}
console.log('pwa icons: 3 files, valid PNG, brand geometric mark');
