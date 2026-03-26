import { randomInt } from "crypto";

const ALPHANUM = "abcdefghijklmnopqrstuvwxyz0123456789";

/** Short, URL-safe slug (8 chars). */
export function randomUtmSlug(): string {
  let s = "";
  for (let i = 0; i < 8; i++) {
    s += ALPHANUM[randomInt(ALPHANUM.length)]!;
  }
  return s;
}
