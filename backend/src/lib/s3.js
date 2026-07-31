import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import path from "path";
import { env } from "../config/env.js";

export const s3 = new S3Client({
  region: env.aws.region,
  credentials: {
    accessKeyId: env.aws.accessKeyId,
    secretAccessKey: env.aws.secretAccessKey,
  },
});

function safeName(name = "file") {
  return String(name)
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120);
}

export function buildS3Key(moduleName, originalName) {
  const year = new Date().getFullYear();
  const ext = path.extname(originalName || "") || "";
  const base = path.basename(originalName || "file", ext);
  return `kudligi-mla/${moduleName}/${year}/${randomUUID()}-${safeName(base)}${ext}`;
}

export function publicUrlForKey(key) {
  return `https://${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com/${key}`;
}

export async function uploadBuffer({
  buffer,
  mimeType,
  originalName,
  moduleName = "general",
}) {
  const key = buildS3Key(moduleName, originalName);
  await s3.send(
    new PutObjectCommand({
      Bucket: env.aws.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType || "application/octet-stream",
    })
  );
  return {
    s3Key: key,
    url: publicUrlForKey(key),
    mimeType: mimeType || "application/octet-stream",
  };
}

export async function deleteS3Object(key) {
  if (!key) return;
  try {
    await s3.send(
      new DeleteObjectCommand({ Bucket: env.aws.bucket, Key: key })
    );
  } catch (err) {
    console.warn("S3 delete failed:", key, err.message);
  }
}

export async function getPresignedGetUrl(key, expiresIn = 3600) {
  if (!key) return null;
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.aws.bucket, Key: key }),
    { expiresIn }
  );
}

/** Prefer a fresh presigned GET when s3Key is present (private buckets). */
export async function resolveObjectUrl(url, s3Key, expiresIn = 60 * 60 * 24 * 7) {
  if (s3Key) {
    try {
      return await getPresignedGetUrl(s3Key, expiresIn);
    } catch (err) {
      console.warn("Presign failed:", s3Key, err.message);
    }
  }
  return url;
}

export async function withResolvedUrl(row, extras = {}) {
  if (!row) return row;
  const next = { ...row, ...extras };
  next.url = await resolveObjectUrl(row.url, row.s3Key);
  if (row.coverUrl || row.coverS3Key) {
    next.coverUrl = await resolveObjectUrl(row.coverUrl, row.coverS3Key);
  }
  return next;
}
