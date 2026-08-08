/**
 * Replace DB developments with backend/data/developmentsFromXlsx.json
 * Usage: node scripts/importDevelopmentsFromXlsx.js
 */
import "dotenv/config";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const jsonPath = join(__dirname, "../data/developmentsFromXlsx.json");
  const rows = JSON.parse(readFileSync(jsonPath, "utf8"));
  console.log(`Loading ${rows.length} developments from JSON…`);

  await prisma.developmentMedia.deleteMany({});
  await prisma.development.deleteMany({});

  const data = rows.map((d) => ({
    gramPanchayat: d.gramPanchayat,
    village: d.village,
    name: d.name,
    nameKn: d.nameKn || d.name || "",
    description: d.description || d.nameKn || d.name || "",
    descriptionKn: d.descriptionKn || d.nameKn || "",
    details: d.details || d.shara || "",
    detailsKn: d.detailsKn || d.shara || "",
    amountSanctioned: Number(d.amountSanctioned) || 0,
    status: d.status || "Ongoing",
    statusKn: d.statusKn || "",
    beneficiaries: d.beneficiaries || "",
    beneficiariesKn: d.beneficiariesKn || "",
    department: d.department || "",
    departmentKn: d.departmentKn || "",
    startDate: d.startDate || null,
    locationNote: d.locationNote || "",
    locationNoteKn: d.locationNoteKn || "",
    yojane: d.yojane || "",
    yojaneKn: d.yojaneKn || "",
  }));

  const BATCH = 200;
  for (let i = 0; i < data.length; i += BATCH) {
    await prisma.development.createMany({ data: data.slice(i, i + BATCH) });
    console.log(`  inserted ${Math.min(i + BATCH, data.length)}/${data.length}`);
  }

  const count = await prisma.development.count();
  console.log(`Done. developments in DB = ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
