/**
 * Parse backend/Village*.xlsx (MLA village-visit petitions / ಬೇಡಿಕೆ)
 * → write data/demandsFromXlsx.json → replace Demand rows in DB.
 *
 * Usage: node scripts/importDemandsFromVillageXlsx.js
 */
import "dotenv/config";
import { readdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import { gramPanchayats } from "../../frontend/src/data/gramPanchayats.js";

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(__dirname, "..");

const SKIP_SHEETS = new Set(["Sheet1", "Sheet2", "Sheet3", "Sheet4"]);

/** Sheet tab name → English GP key (covers spelling drift vs master list) */
const SHEET_TO_GP = {
  "Poojarahalli GP": "Pujarahalli",
  ಆಲೂರು: "Alur",
  ಮಾಕನಡಕು: "Makanadaku",
  ಬಡೇಲಡಕು: "Badeladaku",
  ನಾಗರಕಟ್ಟೆ: "Nagarkatte",
  ಉಜ್ಜಿನಿ: "Ujjini",
  ಕಾಳಾಪುರ: "Kalapur",
  ಹಿರೆಕುಂಬಳಕುಂಟೆ: "Hirekumbalgunte",
  ಹೊಸಹಳ್ಳಿ: "Hosahalli",
  ಜುಮ್ಮೋಬನಹಳ್ಳಿ: "Jummobanahalli",
  ಜರ್ಮಲಿ: "Jarmali",
  ಗಂಡಬೊಮ್ಮನಹಳ್ಲಿ: "Gambommanahalli",
  ಹೂಡೆಂ: "Hudem",
  ಬೆಳ್ಳಗಟ್ಟ: "Bellagatta",
  ಚೌಡಾಪುರ: "Chowdapur",
  ಮೊರಬ: "Moraba",
  ಚಿರತಗುಂಡು: "Chirathagundu",
  ಗುಡೇಕೋಟೆ: "Gudekote",
  ಗುಂಡುಮುಣುಗು: "Gundumunugu",
  ನಿಂಬಳಗೇರೆ: "Nimbalagere",
  ಹಾರಕಬಾವಿ: "Harakbavi",
  ಹಿರೇಹೆಗ್ಡಾಳ್: "Hirehegdal",
  ಸೂಲದಹಳ್ಳಿ: "Suladahalli",
  ಶಿವಪುರ: "Shivpur",
  ಅಪ್ಪೇನಹಳ್ಳಿ: "Appenahalli",
  "ಕೂಡ್ಲಿಗಿ ಪಟ್ಟಣ": "Kudligi Town",
  ತೂಲಹಳ್ಳಿ: "Tulahalli",
  ರಾಮದುರ್ಗ: "Ramdurga",
  ಬಣವಿಕಲ್ಲು: "Banavikallu",
  ಕಕ್ಕುಪ್ಪಿ: "Kakkuppi",
  ಹುರುಳಿಹಾಳ್: "Huralihal",
};

function foldKn(s) {
  return String(s || "")
    .normalize("NFC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(s) {
  return foldKn(s).replace(/\s+/g, "");
}

const gpByName = new Map(gramPanchayats.map((g) => [g.name, g]));
const gpByKn = new Map(gramPanchayats.map((g) => [compact(g.nameKn), g]));

function resolveGpEn(sheetName, headerRows) {
  if (SHEET_TO_GP[sheetName]) return SHEET_TO_GP[sheetName];
  const sn = foldKn(sheetName).replace(/\s*GP$/i, "");
  const byKn = gpByKn.get(compact(sn));
  if (byKn) return byKn.name;
  for (const g of gramPanchayats) {
    if (g.name.toLowerCase() === sn.toLowerCase()) return g.name;
  }
  for (const row of headerRows.slice(0, 4)) {
    const text = foldKn(row.join(" "));
    const m = text.match(/ಗ್ರಾಮ\s*ಪಂಚಾಯಿತಿ\s*[:：]?\s*(.+)$/i);
    if (m) {
      const kn = compact(m[1].replace(/ಪಮಚಾಯಿತಿ|ಪಂಚಾಯಿತಿ/g, "").trim());
      const hit = gpByKn.get(kn);
      if (hit) return hit.name;
    }
    if (text.includes("ಕೂಡ್ಲಿಗಿ ಪಟ್ಟಣ")) return "Kudligi Town";
  }
  return sn || "Kudligi Constituency";
}

function resolveVillageEn(gpEn, villageRaw) {
  const raw = foldKn(villageRaw);
  if (!raw) return "";
  const gp = gpByName.get(gpEn);
  if (!gp) return raw;
  const c = compact(raw);
  for (const v of gp.villages) {
    if (compact(v.nameKn) === c || compact(v.name) === c) return v.name;
    if (foldKn(v.nameKn) === raw || foldKn(v.name) === raw) return v.name;
  }
  // light fuzzy: starts-with / includes either way
  for (const v of gp.villages) {
    const kn = compact(v.nameKn);
    if (!kn) continue;
    if (c.includes(kn) || kn.includes(c)) return v.name;
  }
  // keep Excel village text so dashboard can list it via extra options
  return raw;
}

function isHeaderish(a, b, c) {
  const blob = `${a}|${b}|${c}`;
  if (blob.includes("ಮಾನ್ಯ")) return true;
  if (blob.includes("ಗ್ರಾಮ ಪಂಚಾಯಿತಿ") || blob.includes("ಗ್ರಾಮ ಪಮಚಾಯಿತಿ"))
    return true;
  if (a === "ಕ್ರ ಸಂ" || b === "ಗ್ರಾಮದ ಹೆಸರು" || c === "ವಿಷಯ") return true;
  if (b.includes("ವಾರ್ಡ್") && c === "ವಿಷಯ") return true;
  return false;
}

function parseGpSheet(sheetName, sheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const gpEn = resolveGpEn(sheetName, rows);
  const out = [];
  let currentVillage = "";

  for (const row of rows) {
    const a = foldKn(row[0]);
    const b = foldKn(row[1]);
    const c = foldKn(row[2]);
    if (isHeaderish(a, b, c)) continue;
    if (!c && !b) continue;

    // Village / ward in col B when present
    if (b && b !== "ವಿಷಯ" && !b.startsWith("ಗ್ರಾಮ")) {
      // col B may be ward ("5, 6, 7ನೇ ವಾರ್ಡ್") or village name
      const looksLikeSubjectOnly = !c && b.length > 40;
      if (!looksLikeSubjectOnly) {
        currentVillage = b;
      }
    }

    const subject = c || (!currentVillage ? b : "");
    if (!subject || subject === "ವಿಷಯ" || subject.length < 2) continue;

    const villageRaw = currentVillage || gpEn;
    const village = resolveVillageEn(gpEn, villageRaw) || villageRaw;

    out.push({
      gramPanchayat: gpEn,
      village,
      villageRaw,
      name: "ಸಾರ್ವಜನಿಕರು",
      approach: "civil",
      subject,
      status: "Pending",
      sourceSheet: sheetName,
    });
  }
  return out;
}

/** Sheet1 — richer petition list (applicant + phone); use when village/subject present */
function parseSheet1(sheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const out = [];
  for (const row of rows) {
    const villageRaw = foldKn(row[1]);
    const dept = foldKn(row[2]);
    const subject = foldKn(row[3]);
    const school = foldKn(row[4]);
    const applicant = foldKn(row[5]);
    if (!villageRaw || !subject || subject === "ವಿಷಯ") continue;
    if (String(row[0]).includes("ಮಾನ್ಯ") || villageRaw === "ಗ್ರಾಮದ ಹೆಸರು")
      continue;

    // find GP by village across master list
    let gpEn = "Kudligi Constituency";
    let village = villageRaw;
    for (const g of gramPanchayats) {
      const hit = g.villages.find(
        (v) =>
          compact(v.nameKn) === compact(villageRaw) ||
          compact(v.name) === compact(villageRaw)
      );
      if (hit) {
        gpEn = g.name;
        village = hit.name;
        break;
      }
    }

    const parts = [subject];
    if (school) parts.push(school);
    if (dept) parts.push(`(${dept})`);

    out.push({
      gramPanchayat: gpEn,
      village,
      villageRaw,
      name: applicant || "ಸಾರ್ವಜನಿಕರು",
      approach: applicant ? "personal" : "civil",
      subject: parts.join(" — "),
      status: "Pending",
      sourceSheet: "Sheet1",
    });
  }
  return out;
}

function findVillageXlsxFiles() {
  return readdirSync(backendRoot).filter(
    (f) =>
      f.endsWith(".xlsx") &&
      !f.startsWith("~$") &&
      /^Village/i.test(f)
  );
}

function parseAllFiles(files) {
  const all = [];
  for (const file of files) {
    const wb = XLSX.readFile(join(backendRoot, file));
    console.log(`Reading ${file} sheets=${wb.SheetNames.length}`);
    for (const name of wb.SheetNames) {
      if (SKIP_SHEETS.has(name)) continue;
      const parsed = parseGpSheet(name, wb.Sheets[name]);
      console.log(`  ${name}: ${parsed.length} demands`);
      all.push(...parsed);
    }
    // Sheet1 adds applicant-tagged petitions (may partially overlap GP sheets by subject)
    if (wb.Sheets.Sheet1) {
      const s1 = parseSheet1(wb.Sheets.Sheet1);
      console.log(`  Sheet1 (applicant petitions): ${s1.length}`);
      all.push(...s1);
    }
  }

  // de-dupe: gp|village|subject|name
  const seen = new Set();
  const unique = [];
  for (const d of all) {
    const key = `${d.gramPanchayat}|${d.village}|${d.subject}|${d.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(d);
  }
  return unique;
}

async function main() {
  const files = findVillageXlsxFiles();
  if (!files.length) {
    throw new Error("No Village*.xlsx found in backend/");
  }
  console.log("Files:", files.join(", "));

  const rows = parseAllFiles(files);
  const jsonPath = join(backendRoot, "data/demandsFromXlsx.json");
  writeFileSync(jsonPath, JSON.stringify(rows, null, 2), "utf8");
  console.log(`Wrote ${rows.length} demands → ${jsonPath}`);

  const data = rows.map((d) => ({
    gramPanchayat: d.gramPanchayat,
    village: d.village,
    name: d.name || "ಸಾರ್ವಜನಿಕರು",
    approach: d.approach === "personal" ? "personal" : "civil",
    subject: d.subject,
    status: d.status || "Pending",
  }));

  console.log("Replacing Demand table…");
  await prisma.demand.deleteMany({});
  const BATCH = 200;
  for (let i = 0; i < data.length; i += BATCH) {
    await prisma.demand.createMany({ data: data.slice(i, i + BATCH) });
    console.log(`  inserted ${Math.min(i + BATCH, data.length)}/${data.length}`);
  }
  const count = await prisma.demand.count();
  console.log(`Done. demands in DB = ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
