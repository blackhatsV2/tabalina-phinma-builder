import { randomInt } from "node:crypto";

// No 0/O, 1/I/L: a student reading the code off a slip, or Justine
// reading it aloud, can't mix them up.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** A random six-character access code, e.g. "K7MPX3". Server only. */
export function newAccessCode() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}
