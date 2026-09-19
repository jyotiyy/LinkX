/**
 * Development/demo seed data for LinkX.
 * This data is NOT meant for production use.
 *
 * Run with: npm run prisma:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding development/demo data...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@linkx.dev" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@linkx.dev",
      passwordHash,
    },
  });

  const demoUrls = [
    {
      originalUrl: "https://github.com",
      shortCode: "gh4x7q",
      customAlias: "github",
      clickCount: 3,
    },
    {
      originalUrl: "https://developer.mozilla.org/en-US/",
      shortCode: "mdn9kz",
      customAlias: null,
      clickCount: 1,
    },
  ];

  for (const urlData of demoUrls) {
    const url = await prisma.url.upsert({
      where: { shortCode: urlData.shortCode },
      update: {},
      create: {
        originalUrl: urlData.originalUrl,
        shortCode: urlData.shortCode,
        customAlias: urlData.customAlias,
        clickCount: urlData.clickCount,
        userId: demoUser.id,
      },
    });

    // Create a couple of demo click records for the first URL
    if (urlData.customAlias === "github") {
      const existingClicks = await prisma.click.count({ where: { urlId: url.id } });
      if (existingClicks === 0) {
        await prisma.click.createMany({
          data: [
            { urlId: url.id, userAgent: "Mozilla/5.0 (demo seed)", referer: "https://twitter.com" },
            { urlId: url.id, userAgent: "Mozilla/5.0 (demo seed)", referer: "https://google.com" },
            { urlId: url.id, userAgent: "Mozilla/5.0 (demo seed)", referer: null },
          ],
        });
      }
    }
  }

  console.log("✅ Seed complete.");
  console.log("   Demo login -> email: demo@linkx.dev  password: Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
