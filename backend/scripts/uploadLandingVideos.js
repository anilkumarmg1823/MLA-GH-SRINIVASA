/**
 * Upload landing videos (hero + developments bg) to private S3 and
 * patch LandingContent with stable keys + public URL placeholders.
 *
 * Usage (from backend/): node scripts/uploadLandingVideos.js
 * Options:
 *   --hero-only
 *   --developments-only
 */
import "dotenv/config";
import {
  createReadStream,
  existsSync,
  statSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { env } from "../src/config/env.js";
import { publicUrlForKey, s3 } from "../src/lib/s3.js";

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(__dirname, "..");
const repoRoot = join(backendRoot, "..");

const HERO_LOCAL = join(repoRoot, "frontend/public/CM Kudalagi Pgm.mp4");
const HERO_S3_KEY = "kudligi-mla/landing/hero_cm_kudalagi_pgm.mp4";

const DEV_LOCAL = join(repoRoot, "frontend/public/lv_0_20251107090516.mp4");
const DEV_S3_KEY = "kudligi-mla/landing/developments_bg_video.mp4";

const args = new Set(process.argv.slice(2));
const heroOnly = args.has("--hero-only");
const devOnly = args.has("--developments-only");

async function uploadFileStream({ filePath, mimeType, key }) {
  const size = statSync(filePath).size;
  await s3.send(
    new PutObjectCommand({
      Bucket: env.aws.bucket,
      Key: key,
      Body: createReadStream(filePath),
      ContentType: mimeType,
      ContentLength: size,
    })
  );
  return { s3Key: key, url: publicUrlForKey(key), size };
}

async function patchLanding(mutator) {
  const row = await prisma.landingContent.findUnique({
    where: { id: "default" },
  });
  const data =
    row?.data && typeof row.data === "object" ? structuredClone(row.data) : {};
  mutator(data);
  await prisma.landingContent.upsert({
    where: { id: "default" },
    create: { id: "default", data },
    update: { data },
  });
  return data;
}

async function uploadHero() {
  if (!existsSync(HERO_LOCAL)) {
    throw new Error(`Hero video missing: ${HERO_LOCAL}`);
  }
  const mb = (statSync(HERO_LOCAL).size / (1024 * 1024)).toFixed(1);
  console.log(
    `Uploading hero (${mb} MB) → s3://${env.aws.bucket}/${HERO_S3_KEY}`
  );
  const up = await uploadFileStream({
    filePath: HERO_LOCAL,
    mimeType: "video/mp4",
    key: HERO_S3_KEY,
  });
  await patchLanding((data) => {
    data.hero = {
      ...(data.hero || {}),
      video: up.url,
      videoS3Key: up.s3Key,
    };
  });
  writeFileSync(
    join(backendRoot, "data/landingHeroVideo.json"),
    JSON.stringify({ video: up.url, s3Key: up.s3Key }, null, 2),
    "utf8"
  );
  console.log(`Hero OK: ${up.url}`);
  return up;
}

async function uploadDevelopmentsBg() {
  if (!existsSync(DEV_LOCAL)) {
    throw new Error(`Developments video missing: ${DEV_LOCAL}`);
  }
  const mb = (statSync(DEV_LOCAL).size / (1024 * 1024)).toFixed(1);
  console.log(
    `Uploading developments bg (${mb} MB) → s3://${env.aws.bucket}/${DEV_S3_KEY}`
  );
  const up = await uploadFileStream({
    filePath: DEV_LOCAL,
    mimeType: "video/mp4",
    key: DEV_S3_KEY,
  });
  await patchLanding((data) => {
    data.media = {
      ...(data.media || {}),
      developmentsVideo: up.url,
      developmentsVideoS3Key: up.s3Key,
    };
  });
  writeFileSync(
    join(backendRoot, "data/landingDevelopmentsVideo.json"),
    JSON.stringify({ video: up.url, s3Key: up.s3Key }, null, 2),
    "utf8"
  );
  console.log(`Developments bg OK: ${up.url}`);
  return up;
}

async function main() {
  console.log(`S3 bucket=${env.aws.bucket} region=${env.aws.region}`);
  const doHero = !devOnly;
  const doDev = !heroOnly;
  if (doHero) await uploadHero();
  if (doDev) await uploadDevelopmentsBg();
  console.log("\nDone. Restart backend if it was already running, then hard-refresh the landing page.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
