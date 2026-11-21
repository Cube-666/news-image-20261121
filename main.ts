// The World Today — Saturday 21 November 2026.
// Entry for make.fun "Sum up 21 November's world news in one image"
// (news-image-20261121). The front page artwork is entry.png, drawn
// up front; this script's only job is to place a byte-exact copy of
// it at /output/entry.png so the grader can read it.

import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The intake caps a single file at 1 MiB.
const SIZE_LIMIT = 1024 * 1024;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const artwork = resolve(scriptDir, "entry.png");
const destination = resolve("/output", "entry.png");

function fingerprint(data) {
  return createHash("sha256").update(data).digest("hex");
}

function main() {
  const meta = statSync(artwork);
  if (!meta.isFile()) {
    throw new Error("entry.png is not a regular file");
  }
  if (meta.size > SIZE_LIMIT) {
    throw new Error(`entry.png is ${meta.size} bytes, above the 1 MiB cap`);
  }

  const original = readFileSync(artwork);
  const expected = fingerprint(original);

  mkdirSync("/output", { recursive: true });
  copyFileSync(artwork, destination);

  // Re-read the source as well as the copy: if the artwork changed
  // mid-run, the two digests would disagree and the run must fail
  // rather than hand in a half-written image.
  const sourceNow = readFileSync(artwork);
  const delivered = readFileSync(destination);
  if (
    delivered.length !== original.length ||
    sourceNow.length !== original.length ||
    fingerprint(delivered) !== expected ||
    fingerprint(sourceNow) !== expected
  ) {
    throw new Error("the copy at /output/entry.png does not match entry.png");
  }

  console.log(`wrote /output/entry.png (${delivered.length} bytes, sha256 ${expected})`);
}

main();
