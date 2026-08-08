import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { getPresignedGetUrl } from "../src/lib/s3.js";

const prisma = new PrismaClient();
const HERO_KEY = "kudligi-mla/landing/hero_nrega_video.mp4";
const url =
  "https://kudligi-mla.s3.us-east-1.amazonaws.com/kudligi-mla/landing/hero_nrega_video.mp4";

async function main() {
  console.log("qa", await prisma.assemblyQa.count());
  console.log("files", await prisma.assemblyQaFile.count());
  const L = await prisma.landingContent.findUnique({ where: { id: "default" } });
  console.log("hero", L?.data?.hero?.video);

  const res = await fetch(url, { method: "HEAD" });
  console.log("public HEAD", res.status, res.statusText);

  const signed = await getPresignedGetUrl(HERO_KEY, 60 * 60);
  const res2 = await fetch(signed, { method: "HEAD" });
  console.log("presigned HEAD", res2.status, res2.statusText);
  if (res.status >= 400 && res2.status < 400) {
    console.log("Bucket is private — use landing GET resolve for video");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
