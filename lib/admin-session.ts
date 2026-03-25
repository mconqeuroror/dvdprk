import { cookies } from "next/headers";

const COOKIE = "dp_admin";

export async function isAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === "1";
}

export async function setAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, "1", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
