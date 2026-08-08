/**
 * 1) Upload Assembly Q&A PDFs from backend/16ನೇ ವಿಧಾನಸಭೆ 5ನೇ ಅಧಿವೇಶನ
 *    → S3 + replace Demand-like dummy AssemblyQa rows
 * 2) Upload frontend/public/hero_nrega_video.mp4 → S3 (stable key)
 *    → update LandingContent.hero.video (+ write URL into seed JSON)
 *
 * Usage (from backend/): node scripts/importAssemblyQaAndHeroVideo.js
 */
import "dotenv/config";
import {
  createReadStream,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import { basename, dirname, extname, join } from "path";
import { fileURLToPath } from "url";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { env } from "../src/config/env.js";
import { buildS3Key, publicUrlForKey, s3, uploadBuffer } from "../src/lib/s3.js";

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(__dirname, "..");
const repoRoot = join(backendRoot, "..");

const SESSION_LABEL = "16ನೇ ವಿಧಾನಸಭೆ 5ನೇ ಅಧಿವೇಶನ";
const SESSION_DATE = "2025-01-01"; // session approx; adjust in CMS if needed
const HERO_LOCAL = join(repoRoot, "frontend/public/hero_nrega_video.mp4");
const HERO_S3_KEY = "kudligi-mla/landing/hero_nrega_video.mp4";

function findAssemblyRoot() {
  const dirs = readdirSync(backendRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  const hit = dirs.find(
    (n) => n.includes("ಅಧಿವೇಶನ") || n.includes("ವಿಧಾನಸಭೆ")
  );
  if (!hit) throw new Error("Assembly session folder not found under backend/");
  return join(backendRoot, hit);
}

/** Deduplicate PDFs by basename (folder has nested copies) */
function collectUniquePdfs(rootDir) {
  const byName = new Map();
  function walk(dir) {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
        continue;
      }
      if (!ent.name.toLowerCase().endsWith(".pdf")) continue;
      if (!byName.has(ent.name)) byName.set(ent.name, full);
    }
  }
  walk(rootDir);
  return [...byName.entries()].map(([name, path]) => ({ name, path }));
}

function titleFromPdfName(fileName) {
  const base = basename(fileName, extname(fileName)).replace(/_/g, " ").trim();
  return base || fileName;
}

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
  return { s3Key: key, url: publicUrlForKey(key), size, mimeType };
}

async function importAssemblyPdfs() {
  const root = findAssemblyRoot();
  const pdfs = collectUniquePdfs(root);
  console.log(`Assembly folder: ${root}`);
  console.log(`Unique PDFs: ${pdfs.length}`);

  console.log("Clearing existing AssemblyQa + files…");
  await prisma.assemblyQaFile.deleteMany({});
  await prisma.assemblyQa.deleteMany({});

  const manifest = [];
  let i = 0;
  for (const { name, path } of pdfs) {
    i += 1;
    const title = titleFromPdfName(name);
    const buf = readFileSync(path);
    const up = await uploadBuffer({
      buffer: buf,
      mimeType: "application/pdf",
      originalName: name,
      moduleName: "assembly-qa",
    });
    const questionNo = `A-${String(i).padStart(3, "0")}`;
    const row = await prisma.assemblyQa.create({
      data: {
        questionNo,
        sessionLabel: SESSION_LABEL,
        sessionDate: SESSION_DATE,
        askedBy: "mla",
        askedByName: "ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ.",
        partyName: "INC",
        question: title,
        questionKn: title,
        answer: "ಉತ್ತರ ದಾಖಲೆ ಲಗತ್ತಿಸಲಾಗಿದೆ (ಪಿಡಿಎಫ್).",
        answerKn: "ಉತ್ತರ ದಾಖಲೆ ಲಗತ್ತಿಸಲಾಗಿದೆ (ಪಿಡಿಎಫ್).",
        status: "answered",
        uploadedBy: "Import",
        files: {
          create: {
            fileName: name,
            mimeType: "application/pdf",
            size: buf.length,
            url: up.url,
            s3Key: up.s3Key,
          },
        },
      },
      include: { files: true },
    });
    manifest.push({
      id: row.id,
      questionNo,
      sessionLabel: SESSION_LABEL,
      sessionDate: SESSION_DATE,
      askedBy: "mla",
      askedByName: "ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ.",
      partyName: "INC",
      question: title,
      questionKn: title,
      answer: "ಉತ್ತರ ದಾಖಲೆ ಲಗತ್ತಿಸಲಾಗಿದೆ (ಪಿಡಿಎಫ್).",
      answerKn: "ಉತ್ತರ ದಾಖಲೆ ಲಗತ್ತಿಸಲಾಗಿದೆ (ಪಿಡಿಎಫ್).",
      status: "answered",
      uploadedBy: "Import",
      files: row.files.map((f) => ({
        fileName: f.fileName,
        mimeType: f.mimeType,
        size: f.size,
        url: f.url,
        s3Key: f.s3Key,
      })),
    });
    console.log(`  [${i}/${pdfs.length}] ${name}`);
  }

  const jsonPath = join(backendRoot, "data/assemblyQaFromFolder.json");
  writeFileSync(jsonPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Wrote ${manifest.length} records → ${jsonPath}`);
  return manifest.length;
}

async function importHeroVideo() {
  if (!existsSync(HERO_LOCAL)) {
    throw new Error(`Hero video missing: ${HERO_LOCAL}`);
  }
  const mb = (statSync(HERO_LOCAL).size / (1024 * 1024)).toFixed(1);
  console.log(`Uploading hero video (${mb} MB) → s3://${env.aws.bucket}/${HERO_S3_KEY}`);
  const up = await uploadFileStream({
    filePath: HERO_LOCAL,
    mimeType: "video/mp4",
    key: HERO_S3_KEY,
  });
  console.log(`Hero video URL: ${up.url}`);

  // Persist into LandingContent JSON
  const row = await prisma.landingContent.findUnique({ where: { id: "default" } });
  const data = row?.data && typeof row.data === "object" ? structuredClone(row.data) : {};
  data.hero = {
    ...(data.hero || {}),
    video: up.url,
    videoS3Key: up.s3Key,
  };
  await prisma.landingContent.upsert({
    where: { id: "default" },
    create: { id: "default", data },
    update: { data },
  });

  const urlMetaPath = join(backendRoot, "data/landingHeroVideo.json");
  writeFileSync(
    urlMetaPath,
    JSON.stringify({ video: up.url, s3Key: up.s3Key }, null, 2),
    "utf8"
  );
  console.log(`Landing DB hero.video updated; meta → ${urlMetaPath}`);
  return up.url;
}

async function main() {
  console.log(`S3 bucket=${env.aws.bucket} region=${env.aws.region}`);
  const qaCount = await importAssemblyPdfs();
  const videoUrl = await importHeroVideo();
  console.log("\nDone.");
  console.log(`  assemblyQa=${qaCount}`);
  console.log(`  heroVideo=${videoUrl}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
