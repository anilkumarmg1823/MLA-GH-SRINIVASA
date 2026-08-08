import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const row = await prisma.landingContent.findUnique({ where: { id: "default" } });
  const data = structuredClone(row.data || {});
  data.hero = {
    ...(data.hero || {}),
    video:
      "https://kudligi-mla.s3.us-east-1.amazonaws.com/kudligi-mla/landing/hero_nrega_video.mp4",
    videoS3Key: "kudligi-mla/landing/hero_nrega_video.mp4",
  };
  await prisma.landingContent.update({
    where: { id: "default" },
    data: { data },
  });
  console.log(JSON.stringify(data.hero, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
