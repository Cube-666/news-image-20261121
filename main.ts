// "The World Today" — Saturday 21 November 2026 in one image.
// Node 22, standard library only. The entry image lives beside this file as
// entry.png: a front-page newspaper with the day's verified news. This program
// hands that exact image to the grader by copying it byte for byte into the
// output folder, so two runs always produce identical bytes. No network, no
// clock, no randomness — just one file copy.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SOURCE = new URL('./entry.png', import.meta.url);
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const MAX_BYTES = 1024 * 1024;

// A whole PNG starts with its 8-byte signature — refuse anything else, so a
// truncated or misnamed file can never reach the judge as entry.png.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!readFileSync(SOURCE).subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error('entry.png does not start with the PNG signature — refusing to hand in a broken image');
}

const size = statSync(SOURCE).size;
if (size > MAX_BYTES) {
  throw new Error(`entry.png is ${size} bytes, over the 1 MiB gate — refusing to hand in a rejected image`);
}

mkdirSync(OUT_DIR, { recursive: true });
copyFileSync(SOURCE, join(OUT_DIR, 'entry.png'));

// Integrity check: the handed-in copy must be the same file, byte for byte.
// A size match alone could hide a different image, so compare sha256 digests.
const digest = (b) => createHash('sha256').update(b).digest('hex');
if (digest(readFileSync(join(OUT_DIR, 'entry.png'))) !== digest(readFileSync(SOURCE))) {
  throw new Error('copied entry.png does not match the source bytes — output is not deterministic');
}
