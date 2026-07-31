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

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
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

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Kudligi MLA API listening on http://localhost:${env.port}`);
});
