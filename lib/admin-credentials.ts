/**
 * Admin sign-in until Postgres + hashed passwords exist.
 * Set ADMIN_USERNAME / ADMIN_PASSWORD in production (see .env.example).
 *
 * Optional: ADMIN_IDENTIFIER_ALT — second accepted “username” value (e.g. legacy login string).
 */
export function getAdminIdentifiers(): { primary: string; alternate: string | null } {
  const primary = (process.env.ADMIN_USERNAME ?? "adminDvd").trim();
  const alternateRaw = process.env.ADMIN_IDENTIFIER_ALT?.trim();
  const alternate =
    alternateRaw && alternateRaw !== primary ? alternateRaw : null;
  return { primary, alternate };
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "adminDVd2340@";
}

export function validateAdminLogin(
  identifier: string,
  password: string,
): boolean {
  const id = identifier.trim();
  const { primary, alternate } = getAdminIdentifiers();
  const idOk = id === primary || (alternate !== null && id === alternate);
  if (!idOk) return false;
  const expected = getAdminPassword();
  if (!expected) return false;
  return password === expected;
}
