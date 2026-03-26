"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-session";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { randomUtmSlug } from "@/lib/utm-slug";

function trimOrEmpty(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

export async function createUtmLinkAction(formData: FormData) {
  if (!(await isAdminSession())) redirect("/admin");
  if (!hasDatabaseUrl()) redirect("/admin/utm?error=nodb");

  const name = trimOrEmpty(formData.get("name"));
  const destinationUrl = trimOrEmpty(formData.get("destinationUrl"));
  const utmSource = trimOrEmpty(formData.get("utmSource"));
  const utmMedium = trimOrEmpty(formData.get("utmMedium"));
  const utmCampaign = trimOrEmpty(formData.get("utmCampaign"));
  const utmContent = trimOrEmpty(formData.get("utmContent")) || null;
  const utmTerm = trimOrEmpty(formData.get("utmTerm")) || null;

  if (!name || !destinationUrl || !utmSource || !utmMedium || !utmCampaign) {
    redirect("/admin/utm?error=required");
  }

  let slug = "";
  for (let attempt = 0; attempt < 8; attempt++) {
    slug = randomUtmSlug();
    const exists = await prisma.utmTrackedLink.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!exists) break;
    if (attempt === 7) redirect("/admin/utm?error=slug");
  }

  const row = await prisma.utmTrackedLink.create({
    data: {
      slug,
      name,
      destinationUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
    },
  });

  revalidatePath("/admin/utm");
  revalidatePath(`/admin/utm/${row.id}`);
  redirect(`/admin/utm/${row.id}?created=1`);
}

export async function deleteUtmLinkAction(formData: FormData) {
  if (!(await isAdminSession())) redirect("/admin");
  if (!hasDatabaseUrl()) redirect("/admin/utm?error=nodb");

  const id = trimOrEmpty(formData.get("id"));
  if (!id) redirect("/admin/utm?error=required");

  await prisma.utmTrackedLink.deleteMany({ where: { id } });
  revalidatePath("/admin/utm");
  redirect("/admin/utm?deleted=1");
}
