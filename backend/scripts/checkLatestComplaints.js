import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
const rows = await p.complaint.findMany({
  orderBy: { createdAt: "desc" },
  take: 8,
});
console.log(
  JSON.stringify(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      subject: r.subject,
      source: r.source,
      gp: r.gramPanchayat,
      village: r.village,
      phone: r.phone,
      waPhone: r.waPhone,
      photos: r.photos,
      language: r.language,
      createdAt: r.createdAt,
    })),
    null,
    2
  )
);
const sessions = await p.waSession.findMany({ take: 5, orderBy: { updatedAt: "desc" } });
console.log(
  "sessions",
  JSON.stringify(
    sessions.map((s) => ({
      waPhone: s.waPhone,
      step: s.step,
      lang: s.lang,
      draft: s.draft,
      updatedAt: s.updatedAt,
    })),
    null,
    2
  )
);
await p.$disconnect();
