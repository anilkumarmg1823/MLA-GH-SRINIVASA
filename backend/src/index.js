import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.js";
import authRoutes from "./routes/auth.js";
import developmentsRoutes from "./routes/developments.js";
import departmentDocumentsRoutes from "./routes/departmentDocuments.js";
import demandsRoutes from "./routes/demands.js";
import assemblyQaRoutes from "./routes/assemblyQa.js";
import staffAccessRoutes from "./routes/staffAccess.js";
import landingRoutes from "./routes/landing.js";
import complaintsRoutes from "./routes/complaints.js";
import uploadsRoutes from "./routes/uploads.js";
import medicalReferralsRoutes from "./routes/medicalReferrals.js";
import whatsappRoutes from "./routes/whatsapp.js";
import locationsRoutes from "./routes/locations.js";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        env.nodeEnv === "development" ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      const allowed = String(env.corsOrigin || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (allowed.includes(origin) || origin === env.corsOrigin) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Capture raw body for Meta WhatsApp signature verification
app.use(
  express.json({
    limit: "2mb",
    verify: (req, _res, buf) => {
      if (req.originalUrl?.includes("/whatsapp/webhook")) {
        req.rawBody = buf;
      }
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "kudligi-mla-api" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/developments", developmentsRoutes);
app.use("/api/v1/department-documents", departmentDocumentsRoutes);
app.use("/api/v1/demands", demandsRoutes);
app.use("/api/v1/assembly-qa", assemblyQaRoutes);
app.use("/api/v1/staff-access", staffAccessRoutes);
app.use("/api/v1/landing", landingRoutes);
app.use("/api/v1/complaints", complaintsRoutes);
app.use("/api/v1/uploads", uploadsRoutes);
app.use("/api/v1/whatsapp", whatsappRoutes);
app.use("/api/v1/locations", locationsRoutes);

// Medical Referral routes (mounted at /api/v1/medical-referrals & /api/medical-referrals)
app.use("/api/v1/medical-referrals", medicalReferralsRoutes);
app.use("/api/medical-referrals", medicalReferralsRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Kudligi MLA API listening on http://localhost:${env.port}`);
  if (env.whatsapp.enabled) {
    console.log(
      `WhatsApp bot: enabled (phoneNumberId ${
        env.whatsapp.phoneNumberId ? "set" : "MISSING"
      })`
    );
  } else {
    console.log(
      "WhatsApp bot: disabled (set WHATSAPP_ENABLED=true to turn on)"
    );
  }
});
