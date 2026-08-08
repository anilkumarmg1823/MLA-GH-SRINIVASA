import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError, asyncHandler, ok } from "../middleware/error.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

/** Simple IP Rate Limit for public referral submissions */
const submitHits = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;

function assertRateLimit(ip) {
  const key = ip || "unknown";
  const now = Date.now();
  const hits = (submitHits.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    throw new AppError(429, "RATE_LIMITED", "ಬಹಳಷ್ಟು ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಅರ್ಜಿಗಳು ಸಲ್ಲಿಕೆಯಾಗಿವೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.");
  }
  hits.push(now);
  submitHits.set(key, hits);
}

/** Helper to generate unique reference ID like REF-2026-89412 */
function generateReferenceId() {
  const year = new Date().getFullYear();
  const randomCode = Math.floor(10005 + Math.random() * 89990);
  return `REF-${year}-${randomCode}`;
}

/** Helper to check & apply 1-week auto-completion lifecycle */
async function applyAutoCompletion(referral) {
  if (referral.status === "APPROVED" && referral.approvedAt) {
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const isOlderThan7Days = Date.now() - new Date(referral.approvedAt).getTime() > sevenDaysMs;
    if (isOlderThan7Days) {
      const updated = await prisma.medicalReferral.update({
        where: { id: referral.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date()
        }
      });
      return updated;
    }
  }
  return referral;
}

// 1. POST /api/medical-referrals - Public Application Submission
const createSchema = z.object({
  patientName: z.string().trim().min(2, "ರೋಗಿಯ ಹೆಸರು ಕನಿಷ್ಠ 2 ಅಕ್ಷರಗಳಾಗಿರಬೇಕು").max(120),
  age: z.coerce.number().int().min(1, "ಸರಿಯಾದ ವಯಸ್ಸನ್ನು ನಮೂದಿಸಿ").max(120),
  mobile: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 10, "ದಯವಿಟ್ಟು 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ"),
  gramPanchayat: z.string().trim().optional().default(""),
  village: z.string().trim().min(1, "ಗ್ರಾಮ / ಹೋಬಳಿ ಆಯ್ಕೆ ಮಾಡಿ"),
  hospitalName: z.string().trim().min(2, "ಆಸ್ಪತ್ರೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ"),
  disease: z.string().trim().min(2, "ರೋಗದ ವಿವರ ಅಥವಾ ಸಮಸ್ಯೆಯನ್ನು ನಮೂದಿಸಿ")
});

router.post(
  "/",
  asyncHandler(async (req, res) => {
    assertRateLimit(req.ip || req.headers["x-forwarded-for"]);
    const body = createSchema.parse(req.body);

    // Check if there is an active (non-completed / non-rejected) referral for this mobile number
    const activeReferrals = await prisma.medicalReferral.findMany({
      where: {
        mobile: body.mobile,
        status: {
          in: ["APPLIED", "IN_PROCESS", "APPROVED"]
        }
      },
      orderBy: { createdAt: "desc" }
    });

    let hasActive = false;
    let activeRefId = "";

    for (const item of activeReferrals) {
      const updated = await applyAutoCompletion(item);
      if (updated.status !== "COMPLETED" && updated.status !== "REJECTED") {
        hasActive = true;
        activeRefId = updated.referenceId;
        break;
      }
    }

    if (hasActive) {
      throw new AppError(
        400,
        "ACTIVE_REFERRAL_EXISTS",
        `ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ (Ref: ${activeRefId}) ಈಗಾಗಲೇ ಸಕ್ರಿಯ ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಅರ್ಜಿ ಚಾಲ್ತಿಯಲ್ಲಿದೆ. ಆ ಅರ್ಜಿಯ ಚಿಕಿತ್ಸೆ ಪೂರ್ಣಗೊಂಡ ನಂತರವೇ ಹೊಸ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಸಾಧ್ಯ.`
      );
    }

    let referenceId = generateReferenceId();
    // Ensure reference ID uniqueness
    let exists = await prisma.medicalReferral.findUnique({ where: { referenceId } });
    while (exists) {
      referenceId = generateReferenceId();
      exists = await prisma.medicalReferral.findUnique({ where: { referenceId } });
    }

    const row = await prisma.medicalReferral.create({
      data: {
        referenceId,
        patientName: body.patientName,
        age: body.age,
        mobile: body.mobile,
        gramPanchayat: body.gramPanchayat || "",
        village: body.village,
        hospitalName: body.hospitalName,
        disease: body.disease,
        status: "APPLIED"
      }
    });

    return ok(res, row, 201);
  })
);

// 2. GET /api/medical-referrals/status - Status Lookup by Ref ID OR Mobile Number
router.get(
  "/status",
  asyncHandler(async (req, res) => {
    const { ref, mobile } = req.query;

    if (!ref && !mobile) {
      throw new AppError(400, "MISSING_PARAM", "ದಯವಿಟ್ಟು ರೆಫರೆನ್ಸ್ ಐಡಿ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.");
    }

    if (ref) {
      const cleanRef = String(ref).trim().toUpperCase();
      const referral = await prisma.medicalReferral.findUnique({
        where: { referenceId: cleanRef }
      });
      if (!referral) {
        throw new AppError(404, "NOT_FOUND", "ಈ ರೆಫರೆನ್ಸ್ ಐಡಿ ಹೊಂದಿರುವ ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಸಿಕ್ಕಿಲ್ಲ.");
      }
      const processed = await applyAutoCompletion(referral);
      return ok(res, { referrals: [processed] });
    }

    if (mobile) {
      const cleanMobile = String(mobile).trim().replace(/\D/g, "");
      const referrals = await prisma.medicalReferral.findMany({
        where: { mobile: cleanMobile },
        orderBy: { createdAt: "desc" }
      });
      if (!referrals || referrals.length === 0) {
        throw new AppError(404, "NOT_FOUND", "ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಯಾವುದೇ ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಸಲ್ಲಿಕೆಯಾಗಿಲ್ಲ.");
      }
      const processed = await Promise.all(referrals.map(r => applyAutoCompletion(r)));
      return ok(res, { referrals: processed });
    }
  })
);

// 3. GET /api/medical-referrals/panchayats - Grama Panchayats & Villages list
router.get(
  "/panchayats",
  asyncHandler(async (req, res) => {
    const panchayats = [
      {
        gpNameKn: "ಕೂಡ್ಲಿಗಿ ಪಟ್ಟಣ ಪಂಚಾಯಿತಿ (Kudligi Town)",
        gpNameEn: "Kudligi Town Panchayat",
        villages: ["ಕೂಡ್ಲಿಗಿ ಟೌನ್ (Kudligi Town)", "ವಾರ್ಡ್ ನಂ 1", "ವಾರ್ಡ್ ನಂ 2", "ವಾರ್ಡ್ ನಂ 3", "ಇತರೆ"]
      },
      {
        gpNameKn: "ಕೊಟ್ಟೂರು ತಾಲೂಕು (Kotturu)",
        gpNameEn: "Kotturu Taluk",
        villages: ["ಕೊಟ್ಟೂರು ಪಟ್ಟಣ", "ಉಜ್ಜಿನಿ", "ತೂಲಹಳ್ಳಿ", "ಕೊಟ್ಟೂರು ಇತರೆ"]
      },
      {
        gpNameKn: "ಕಾನಾಹೊಸಹಳ್ಳಿ ಗ್ರಾಮ ಪಂಚಾಯಿತಿ",
        gpNameEn: "Kana Hosahalli GP",
        villages: ["ಕಾನಾಹೊಸಹಳ್ಳಿ", "ಚಿರಿಬಿ", "ಬಣವಿಕಲ್ಲು", "ಇತರೆ"]
      },
      {
        gpNameKn: "ಹೊಸಹಳ್ಳಿ ಗ್ರಾಮ ಪಂಚಾಯಿತಿ",
        gpNameEn: "Hosahalli GP",
        villages: ["ಹೊಸಹಳ್ಳಿ", "ಹೂವಿನಹಡಗಲಿ ರಸ್ತೆ", "ಇತರೆ"]
      },
      {
        gpNameKn: "ಗುಡೇಕೋಟೆ ಗ್ರಾಮ ಪಂಚಾಯಿತಿ",
        gpNameEn: "Gudekote GP",
        villages: ["ಗುಡೇಕೋಟೆ", "ಕರಡಿ ಸಂರಕ್ಷಣಾ ಧಾಮ ವ್ಯಾಪ್ತಿ", "ಇತರೆ"]
      },
      {
        gpNameKn: "ರಾಂಪುರ / ಚಳ್ಳಕೆರೆ ರಸ್ತೆ",
        gpNameEn: "Rampura Region",
        villages: ["ರಾಂಪುರ", "ಮೋರಬ", "ಹುಲಿಕುಂಟೆ", "ಇತರೆ"]
      }
    ];

    return ok(res, { panchayats });
  })
);

// 4. GET /api/medical-referrals/:id/pdf - Printable Official Referral Letter HTML
router.get(
  "/:id/pdf",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    let referral = await prisma.medicalReferral.findFirst({
      where: {
        OR: [{ id }, { referenceId: id }]
      }
    });

    if (!referral) {
      throw new AppError(404, "NOT_FOUND", "Referral record not found");
    }

    referral = await applyAutoCompletion(referral);

    const formattedDate = new Date(referral.createdAt).toLocaleDateString("kn-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    const html = `
<!DOCTYPE html>
<html lang="kn">
<head>
  <meta charset="UTF-8">
  <title>ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಪತ್ರ - ${referral.referenceId}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 6mm 8mm;
    }
    @media print {
      body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .letterhead { border: 2px solid #002B7F !important; box-shadow: none !important; margin: 0 auto !important; }
    }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 15px; }
    .letterhead {
      max-width: 780px;
      margin: 0 auto;
      background: white;
      border: 3px solid #002B7F;
      padding: 25px 30px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      position: relative;
      overflow: hidden;
      min-height: 260mm;
      display: flex;
      flex-col;
      justify-content: space-between;
    }
    .watermark {
      position: absolute;
      top: 52%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 320px;
      opacity: 0.05;
      pointer-events: none;
      z-index: 0;
    }
    .content-z { position: relative; z-index: 1; }
    .gold-bar { height: 5px; background: linear-gradient(90deg, #001438, #002B7F, #FFD700, #0055C4); margin-bottom: 15px; border-radius: 3px; }
    .header-row { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #002B7F; padding-bottom: 12px; }
    .brand-title { color: #001D56; font-size: 19px; font-weight: 900; margin: 0; line-height: 1.2; }
    .sub-title { color: #0055C4; font-size: 12px; font-weight: 800; margin-top: 3px; }
    .ref-badge { background: #002B7F; color: #FFD700; padding: 5px 12px; font-size: 12px; font-weight: 900; border-radius: 16px; font-mono: true; border: 1px solid #FFD700; white-space: nowrap; }
    .meta-box { display: flex; justify-content: space-between; background: #f1f5f9; padding: 10px 14px; border-radius: 8px; margin: 15px 0; font-size: 12px; font-weight: 700; border-left: 4px solid #0055C4; }
    .body-content { line-height: 1.6; font-size: 13px; margin: 15px 0; }
    .body-content p { margin: 8px 0; }
    .patient-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 12.5px; }
    .patient-table th, .patient-table td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    .patient-table th { background: #002B7F; color: white; width: 35%; font-weight: 800; }
    .patient-table td { background: #fafafa; font-weight: 700; color: #0f172a; }
    .signature-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 25px; padding-top: 15px; border-t: 1px solid #e2e8f0; }
    .seal-box { border: 2px dashed #0055C4; padding: 8px 16px; border-radius: 40px; text-align: center; color: #0055C4; font-weight: 900; font-size: 11px; background: #f0f7ff; }
    .sig-box { text-align: center; }
    .sig-box strong { color: #001D56; font-size: 14px; display: block; }
  </style>
</head>

<body>
  <div class="no-print" style="max-width: 780px; margin: 0 auto 12px auto; text-align: right;">
    <button onclick="window.print()" style="background: #0055C4; color: white; font-weight: bold; border: none; padding: 9px 18px; border-radius: 20px; cursor: pointer; font-size: 13px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
      🖨️ ಮುದ್ರಿಸಿ / PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (Print / Save Single Page PDF)
    </button>
  </div>

  <div class="letterhead">
    
    <!-- Unique Background Caduceus Medical Emblem Watermark -->
    <svg class="watermark" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>

    <div class="content-z">
      <div class="gold-bar"></div>
      
      <div class="header-row">
        <div>
          <h1 class="brand-title">ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ. <span style="font-size: 14px; font-weight: 700; color: #0055C4;">(MBBS, MD - AIIMS Delhi)</span></h1>
          <div class="sub-title">ಮಾನ್ಯ ಶಾಸಕರು, ಕೂಡ್ಲಿಗಿ ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ | ವೈದ್ಯಕೀಯ ನೆರವು ಹಾಗೂ ಶಿಫಾರಸು ಕೋಶ</div>
        </div>
        <div class="ref-badge">
          ${referral.referenceId}
        </div>
      </div>

      <div class="meta-box">
        <div>📅 ದಿನಾಂಕ: <strong>${formattedDate}</strong></div>
        <div>📍 ಸ್ಥಳ: <strong>ಕೂಡ್ಲಿಗಿ ಶಾಸಕರ ಕಚೇರಿ</strong></div>
        <div>📌 ಸ್ಥಿತಿ: <strong style="color: #047857;">${referral.status === "APPROVED" || referral.status === "COMPLETED" ? "✓ ಅಧಿಕೃತವಾಗಿ ಅನುಮೋದಿಸಲಾಗಿದೆ (Approved)" : "⏳ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (In Process)"}</strong></div>
      </div>

      <div class="body-content">
        <p><strong>ಗೆ,</strong><br>
        ಮಾನ್ಯ ನಿರ್ದೇಶಕರು / ಮುಖ್ಯ ವೈದ್ಯಾಧಿಕಾರಿಗಳು,<br>
        <strong style="color: #001D56; font-size: 14px;">${referral.hospitalName}</strong></p>

        <p style="background: #f8fafc; padding: 6px 10px; border-left: 3px solid #FFD700; font-weight: 800;">
          <strong>ವಿಷಯ:</strong> ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರದ ಬಡ ರೋಗಿಗೆ ಉಚಿತ / ರಿಯಾಯಿತಿ ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆ ಶಿಫಾರಸು ಮಾಡುವ ಬಗ್ಗೆ.
        </p>

        <p>ಕೂಡ್ಲಿಗಿ ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರದ ನಿವಾಸಿಯಾದ ಕೆಳಗಿನ ರೋಗಿಗೆ ನಿಮ್ಮ ಪ್ರಸಿದ್ಧ ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ತುರ್ತು ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ ಹಾಗೂ ಅತ್ಯುತ್ತಮ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ/ಚಿಕಿತ್ಸಾ ಸೌಲಭ್ಯ ಒದಗಿಸಿಕೊಡಲು ಈ ಮೂಲಕ ಅಧಿಕೃತವಾಗಿ ಶಿಫಾರಸು ಮಾಡಲಾಗುತ್ತಿದೆ.</p>

        <table class="patient-table">
          <tr><th>ರೋಗಿಯ ಹೆಸರು (Patient Name)</th><td><strong>${referral.patientName}</strong></td></tr>
          <tr><th>ವಯಸ್ಸು (Age)</th><td>${referral.age} ವರ್ಷಗಳು</td></tr>
          <tr><th>ಸಂಪರ್ಕ ಮೊಬೈಲ್ (Mobile)</th><td>${referral.mobile}</td></tr>
          <tr><th>ಗ್ರಾಮ / ಹೋಬಳಿ (Village/Hobli)</th><td>${referral.village} (ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರ)</td></tr>
          <tr><th>ಶಿಫಾರಸು ಆಸ್ಪತ್ರೆ (Hospital)</th><td><strong>${referral.hospitalName}</strong></td></tr>
          <tr><th>ರೋಗದ ವಿವರ / ರೋಗನಿರ್ಣಯ</th><td>${referral.disease}</td></tr>
        </table>

        <p style="font-size: 12.5px; color: #334155;">
          ರೋಗಿಗೆ ಆಯುಷ್ಮಾನ್ ಭಾರತ್ - ಆರೋಗ್ಯಾಕರ್ನಾಟಕ ಅಥವಾ ಶಾಸಕರ ಉಚಿತ ನೆರವು ಕೋಶದಡಿಯಲ್ಲಿ ಸಾಧ್ಯವಿರುವ ಗರಿಷ್ಠ ವೈದ್ಯಕೀಯ ರಿಯಾಯಿತಿ ಹಾಗೂ ಸಕಾಲಿಕ ಚಿಕಿತ್ಸೆ ನೀಡಲು ಕೋರಲಾಗಿದೆ.
        </p>
      </div>

      <div class="signature-section">
        <div class="seal-box">
          ✓ ಶಾಸಕರ ಅಧಿಕೃತ ವೈದ್ಯಕೀಯ ಮೊಹರು<br>
          HEALTH CELL OFFICIAL SEAL
        </div>
        <div class="sig-box">
          <strong>(ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ.)</strong>
          <span style="font-size: 12px; color: #475569; font-weight: 700;">ಮಾನ್ಯ ಶಾಸಕರು, ಕೂಡ್ಲಿಗಿ ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ</span>
        </div>
      </div>

    </div>

  </div>

  <script>
    window.onload = function() {
      if (window.location.search.includes("autoprint=true")) {
        window.print();
      }
    };
  </script>
</body>
</html>
    `;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(html);
  })
);

// 5. GET /api/medical-referrals/admin - Admin list with pagination & status filters
router.get(
  "/admin",
  asyncHandler(async (req, res) => {
    const { status, search } = req.query;

    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { patientName: { contains: q, mode: "insensitive" } },
        { referenceId: { contains: q, mode: "insensitive" } },
        { mobile: { contains: q } },
        { village: { contains: q, mode: "insensitive" } },
        { hospitalName: { contains: q, mode: "insensitive" } }
      ];
    }

    const items = await prisma.medicalReferral.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100
    });

    const processed = await Promise.all(items.map(r => applyAutoCompletion(r)));
    return ok(res, { referrals: processed });
  })
);

// 6. PATCH /api/medical-referrals/admin/:id - Admin update status, hospitalName & notes
const updateStatusSchema = z.object({
  status: z.enum(["APPLIED", "IN_PROCESS", "APPROVED", "COMPLETED", "REJECTED"]).optional(),
  hospitalName: z.string().trim().optional(),
  adminNotes: z.string().optional().default("")
});

router.patch(
  "/admin/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const body = updateStatusSchema.parse(req.body);

    const existing = await prisma.medicalReferral.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, "NOT_FOUND", "Referral record not found");
    }

    const data = {};
    if (body.status) {
      data.status = body.status;
      if (body.status === "APPROVED" && !existing.approvedAt) {
        data.approvedAt = new Date();
      }
      if (body.status === "COMPLETED" && !existing.completedAt) {
        data.completedAt = new Date();
      }
    }

    if (body.hospitalName) {
      data.hospitalName = body.hospitalName;
    }

    if (body.adminNotes !== undefined) {
      data.adminNotes = body.adminNotes;
    }

    const updated = await prisma.medicalReferral.update({
      where: { id },
      data
    });

    return ok(res, updated);
  })
);

export default router;
