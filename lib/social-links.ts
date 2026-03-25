/** Public env URLs for footer icons. Falls back to platform home if unset (override on Vercel). */
export function getSocialLinks() {
  return {
    youtube:
      process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE?.trim() ||
      "https://www.youtube.com",
    discord:
      process.env.NEXT_PUBLIC_SOCIAL_DISCORD?.trim() || "https://discord.com",
    instagram:
      process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM?.trim() ||
      "https://www.instagram.com",
  };
}
