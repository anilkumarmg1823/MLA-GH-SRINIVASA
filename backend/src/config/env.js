import "dotenv/config";

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  demoTotpSecret:
    process.env.DEMO_TOTP_SECRET || "BTRSABHTAOR7A2U4DZLNIQI6H5OZSNDT",
  databaseUrl: required("DATABASE_URL"),
  aws: {
    accessKeyId: required("AWS_ACCESS_KEY_ID"),
    secretAccessKey: required("AWS_SECRET_ACCESS_KEY"),
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.AWS_S3_BUCKET || "kudligi-mla",
  },
  whatsapp: {
    enabled: String(process.env.WHATSAPP_ENABLED || "").toLowerCase() === "true",
    token: process.env.WHATSAPP_TOKEN || "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
    appSecret: process.env.WHATSAPP_APP_SECRET || "",
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || "kudligi-wa-verify-change-me",
    apiVersion: process.env.WHATSAPP_API_VERSION || "v21.0",
    templates: {
      replyKn: process.env.WHATSAPP_TEMPLATE_REPLY_KN || "complaint_reply_kn",
      replyEn: process.env.WHATSAPP_TEMPLATE_REPLY_EN || "complaint_reply_en",
      registeredKn:
        process.env.WHATSAPP_TEMPLATE_REGISTERED_KN || "complaint_registered_kn",
      registeredEn:
        process.env.WHATSAPP_TEMPLATE_REGISTERED_EN || "complaint_registered_en",
    },
  },
};
