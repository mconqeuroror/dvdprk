import bcrypt from "bcryptjs";
import { validateAdminLogin as validateEnvLogin } from "@/lib/admin-credentials";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

/**
 * When `DATABASE_URL` is set, checks `admin_users` (seeded password hash).
 * Otherwise falls back to env-based credentials (local dev without Postgres).
 */
export async function validateAdminLoginAsync(
  identifier: string,
  password: string,
): Promise<boolean> {
  const id = identifier.trim();

  if (hasDatabaseUrl()) {
    try {
      const user = await prisma.adminUser.findFirst({
        where: {
          OR: [{ username: id }, { loginAlias: id }],
        },
      });
      if (!user) return false;
      return bcrypt.compare(password, user.passwordHash);
    } catch {
      return false;
    }
  }

  return validateEnvLogin(identifier, password);
}
