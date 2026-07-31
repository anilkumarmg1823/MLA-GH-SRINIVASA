import "dotenv/config";
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "us-east-1";
const bucket = process.env.AWS_S3_BUCKET || "kudligi-mla";

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function main() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log(`Bucket "${bucket}" already exists`);
  } catch {
    const input = { Bucket: bucket };
    if (region !== "us-east-1") {
      input.CreateBucketConfiguration = { LocationConstraint: region };
    }
    await s3.send(new CreateBucketCommand(input));
    console.log(`Created bucket "${bucket}"`);
  }

  try {
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ["*"],
              AllowedMethods: ["GET", "PUT", "POST", "HEAD"],
              AllowedOrigins: [
                process.env.CORS_ORIGIN || "http://localhost:3000",
                "*",
              ],
              ExposeHeaders: ["ETag"],
              MaxAgeSeconds: 3000,
            },
          ],
        },
      })
    );
    console.log("CORS applied");
  } catch (e) {
    console.warn("CORS setup skipped:", e.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
