import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultSitePayload = {
  heroVideoUrl: "",
  sliderRow1: Array(10).fill(""),
  sliderRow2: Array(10).fill(""),
  successVideos: ["", "", ""],
  freeCourseModules: [
    { tag: "Module 1", videoUrl: "" },
    { tag: "Module 2", videoUrl: "" },
    { tag: "Module 3", videoUrl: "" },
  ],
};

async function main() {
  const username = process.env.ADMIN_SEED_USERNAME ?? "adminDvd";
  const loginAlias = process.env.ADMIN_SEED_LOGIN_ALIAS ?? "adminDVd2340@";
  const password = process.env.ADMIN_PASSWORD ?? "adminDVd2340@";
  const hash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { username },
    create: {
      username,
      loginAlias,
      passwordHash: hash,
    },
    update: {
      passwordHash: hash,
      loginAlias,
    },
  });

  const existing = await prisma.siteSettings.findUnique({
    where: { id: "site" },
  });
  if (!existing) {
    await prisma.siteSettings.create({
      data: {
        id: "site",
        payload: defaultSitePayload,
      },
    });
  }
}

main()
  .then(() => {
    console.log("Seed complete: admin user + site_settings row (if missing).");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
