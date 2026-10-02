/* ============================================================================
   Minimal MPEG audio frame parser
   ----------------------------------------------------------------------------
   The continuous Quran player concatenates one MP3 per verse into a single
   resource. To know which verse is playing (and to seek verse-by-verse) it
   needs each verse's duration, so the player builds a start-offset timeline
   from the real audio instead of guessing.

   This walks the MPEG frame headers, counting frames and samples. It is exact
   for CBR and VBR files alike as long as the frames are valid MPEG audio
   (EveryAyah files are raw MPEG frames — often with no ID3 tag at all). No
   decoding happens, so it is cheap: a few hundred thousand header reads for a
   whole Para.
   ========================================================================== */

/* Bitrate tables in kbps, indexed by the 4-bit bitrate index (0 = free,
   15 = reserved/invalid; both are skipped by the caller). */
const V1_L1 = [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448];
const V1_L2 = [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384];
const V1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const V2_L1 = [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256];
const V2_L2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];

/** Sample rates by MPEG version bits (0 = MPEG 2.5, 2 = MPEG 2, 3 = MPEG 1). */
const SAMPLE_RATES: Record<number, number[]> = {
  0: [11025, 12000, 8000],
  1: [0, 0, 0], // reserved
  2: [22050, 24000, 16000],
  3: [44100, 48000, 32000],
};

function bitrateFor(versionBits: number, layerBits: number, index: number): number {
  if (versionBits === 3) {
    if (layerBits === 3) return V1_L1[index];
    if (layerBits === 2) return V1_L2[index];
    return V1_L3[index];
  }
  if (layerBits === 3) return V2_L1[index];
  if (layerBits === 2) return V2_L2[index];
  return V2_L2[index]; // MPEG2 / 2.5 Layer III shares the V2 Layer II table
}

/**
 * Duration in seconds of an MP3 file held in memory. Falls back to a 128 kbps
 * estimate only when no valid frame could be found (so a single odd file can
 * never collapse the whole timeline).
 */
export function mp3DurationSeconds(buffer: ArrayBuffer): number {
  const bytes = new Uint8Array(buffer);
  const len = bytes.length;
  let off = 0;

  // Skip an ID3v2 tag if present (synchsafe 28-bit size at bytes 6..9).
  if (len >= 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const size =
      ((bytes[6] & 0x7f) << 21) |
      ((bytes[7] & 0x7f) << 14) |
      ((bytes[8] & 0x7f) << 7) |
      (bytes[9] & 0x7f);
    off = 10 + size;
  }

  let samples = 0;
  let sampleRate = 44100;
  let frames = 0;

  while (off + 4 <= len) {
    // Frame sync: 11 set bits.
    if (bytes[off] !== 0xff || (bytes[off + 1] & 0xe0) !== 0xe0) {
      off++;
      continue;
    }
    const b1 = bytes[off + 1];
    const b2 = bytes[off + 2];
    const versionBits = (b1 >> 3) & 0x03;
    const layerBits = (b1 >> 1) & 0x03; // 3 = Layer I, 2 = Layer II, 1 = Layer III
    const bitrateIdx = (b2 >> 4) & 0x0f;
    const srIdx = (b2 >> 2) & 0x03;
    const padding = (b2 >> 1) & 0x01;

    if (versionBits === 1 || layerBits === 0 || bitrateIdx === 0 || bitrateIdx === 15 || srIdx === 3) {
      off++;
      continue;
    }

    const bitrate = bitrateFor(versionBits, layerBits, bitrateIdx);
    const sr = SAMPLE_RATES[versionBits][srIdx];
    if (!bitrate || !sr) {
      off++;
      continue;
    }

    const mpeg1 = versionBits === 3;
    const samplesPerFrame = layerBits === 3 ? 384 : layerBits === 2 ? 1152 : mpeg1 ? 1152 : 576;

    let frameLen: number;
    if (layerBits === 3) {
      frameLen = Math.floor((12 * bitrate * 1000) / sr + padding) * 4;
    } else if (layerBits === 2) {
      frameLen = Math.floor((144 * bitrate * 1000) / sr) + padding;
    } else {
      frameLen = Math.floor(((mpeg1 ? 144 : 72) * bitrate * 1000) / sr) + padding;
    }

    if (frameLen < 8) {
      off++;
      continue;
    }

    samples += samplesPerFrame;
    sampleRate = sr;
    frames++;
    off += frameLen;
  }

  if (!frames || !sampleRate) return (len * 8) / 128000;
  return samples / sampleRate;
}
