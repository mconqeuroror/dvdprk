/** Public env URLs for footer icons. Defaults point at David Perk profiles; override with env on Vercel if needed. */
export function getSocialLinks() {
  return {
    youtube:
      process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE?.trim() ||
      "https://www.youtube.com/@davidperkfx",
    discord:
      process.env.NEXT_PUBLIC_SOCIAL_DISCORD?.trim() || "https://discord.com",
    instagram:
      process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM?.trim() ||
      "https://www.instagram.com/davidperkfx",
    x:
      process.env.NEXT_PUBLIC_SOCIAL_X?.trim() || "https://x.com/davidperkfx",
  };
}
