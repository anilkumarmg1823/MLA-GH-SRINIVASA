import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { DEMO_TOTP_SECRET } from "../src/lib/totp.js";

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

function fullPerms() {
  return { view: true, add: true, edit: true, delete: true, download: true };
}
function emptyPerms() {
  return { view: false, add: false, edit: false, delete: false, download: false };
}

function loadLandingSeed() {
  try {
    const seedPath = join(
      __dirname,
      "../../frontend/src/data/landingContentSeed.js"
    );
    const raw = readFileSync(seedPath, "utf8");
    const match = raw.match(
      /export const landingContentSeed\s*=\s*(\{[\s\S]*?\n\});/
    );
    if (!match) return null;
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${match[1]});`)();
  } catch {
    return null;
  }
}

const FALLBACK_LANDING = {
  brand: {
    blueDeep: "#001438",
    blue: "#001D56",
    blueMid: "#002B7F",
    blueAlt: "#003B95",
    blueBright: "#0055C4",
    blueLight: "#0077E6",
    gold: "#FFD700",
    footerAccent: "#CCBCA5",
    link: "#367AF1",
    surface: "#F8FAFC",
    bg: "#1e2223",
    footerBg: "#0f1314",
  },
  site: {
    nameEn: "DR. SRINIVAS N. T.",
    nameKn: "DR. SRINIVAS N. T.",
    "taglineEn": "MBBS, MD, AIIMS Delhi",
    "taglineKn": "MBBS, MD, AIIMS Delhi",
  },
  copy: { en: {}, kn: {} },
  hero: {
    slides: [],
    video:
      "https://kudligi-mla.s3.us-east-1.amazonaws.com/kudligi-mla/landing/hero_nrega_video.mp4",
    videoS3Key: "kudligi-mla/landing/hero_nrega_video.mp4",
  },
  media: {
    tourScheduleImage: "/tour_schedule_sheet_v10.png",
    tourSchedules: [],
    developmentsVideo:
      "https://kudligi-mla.s3.us-east-1.amazonaws.com/kudligi-mla/landing/developments_bg_video.mp4",
    developmentsVideoS3Key: "kudligi-mla/landing/developments_bg_video.mp4",
  },
  leaders: { items: [] },
  gallery: { items: [] },
  grievance: {
    villages: [
      { value: "kudligi", labelEn: "Kudligi Town", labelKn: "Kudligi Town" },
      { value: "kottur", labelEn: "Kottur", labelKn: "Kottur" },
    ],
  },
  contact: {},
  quickLinks: {},
};

const TOUR_SCHEDULES = [
  {
    id: "ts1",
    date: "2026-07-21",
    title: "Constituency tour — Day 1",
    titleKn: "Constituency tour — Day 1",
    imageUrl: "/tour_schedule_sheet_v10.png",
    s3Key: null,
  },
  {
    id: "ts2",
    date: "2026-07-22",
    title: "Village inspections",
    titleKn: "Village inspections",
    imageUrl: "/tour_schedule_sheet_v10.png",
    s3Key: null,
  },
  {
    id: "ts3",
    date: "2026-07-23",
    title: "Development inauguration",
    titleKn: "Development inauguration",
    imageUrl: "/tour_schedule_sheet.png",
    s3Key: null,
  },
  {
    id: "ts4",
    date: "2026-07-24",
    title: "Public meeting",
    titleKn: "Public meeting",
    imageUrl: "/tour_schedule_sheet_v10.png",
    s3Key: null,
  },
  {
    id: "ts5",
    date: "2026-07-25",
    title: "Scheme review",
    titleKn: "Scheme review",
    imageUrl: "/tour_schedule_sheet.jpg",
    s3Key: null,
  },
  {
    id: "ts6",
    date: "2026-08-02",
    title: "August tour start",
    titleKn: "August tour start",
    imageUrl: "/tour_schedule_sheet_v10.png",
    s3Key: null,
  },
];

function loadDevelopmentsFromXlsx() {
  const jsonPath = join(__dirname, "../data/developmentsFromXlsx.json");
  const rows = JSON.parse(readFileSync(jsonPath, "utf8"));
  return rows.map((d) => ({
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
}

const DEVELOPMENTS = loadDevelopmentsFromXlsx();

function loadDemandsFromXlsx() {
  const jsonPath = join(__dirname, "../data/demandsFromXlsx.json");
  try {
    const rows = JSON.parse(readFileSync(jsonPath, "utf8"));
    return rows.map((d) => ({
      gramPanchayat: d.gramPanchayat,
      village: d.village,
      name: d.name || "ಸಾರ್ವಜನಿಕರು",
      approach: d.approach === "personal" ? "personal" : "civil",
      subject: d.subject,
      status: d.status || "Pending",
    }));
  } catch {
    console.warn("demandsFromXlsx.json missing — using small fallback DEMANDS");
    return [
      {
        gramPanchayat: "Kudligi Town",
        village: "Kudligi",
        name: "ಸಾರ್ವಜನಿಕರು",
        approach: "civil",
        subject: "Street light near temple",
        status: "Pending",
      },
    ];
  }
}

const DEMANDS = loadDemandsFromXlsx();

const DEPT_DOCS = [
  {
    root: "secretariat",
    category: "Orders",
    title: "Secretariat circular — July 2026",
    titleKn: "Secretariat circular — July 2026",
    fileName: "secretariat-circular-july.pdf",
    mimeType: "application/pdf",
    size: 120000,
    url: "/sample-docs/secretariat-circular.pdf",
    uploadedBy: "Admin",
  },
  {
    root: "secretariat",
    category: "Meetings",
    title: "MLA office meeting notes",
    titleKn: "MLA office meeting notes",
    fileName: "meeting-notes.pdf",
    mimeType: "application/pdf",
    size: 88000,
    url: "/sample-docs/meeting-notes.pdf",
    uploadedBy: "Admin",
  },
  {
    root: "department",
    category: "PWD",
    title: "PWD work estimate — CC road",
    titleKn: "PWD work estimate — CC road",
    fileName: "pwd-estimate.pdf",
    mimeType: "application/pdf",
    size: 210000,
    url: "/sample-docs/pwd-estimate.pdf",
    uploadedBy: "Department Records Officer",
    status: "active",
  },
  {
    root: "department",
    category: "Education",
    title: "School grant sanction letter",
    titleKn: "School grant sanction letter",
    fileName: "school-grant.pdf",
    mimeType: "application/pdf",
    size: 150000,
    url: "/sample-docs/school-grant.pdf",
    uploadedBy: "Department Records Officer",
  },
  {
    root: "department",
    category: "RDPR",
    title: "GP development action plan",
    titleKn: "GP development action plan",
    fileName: "gp-action-plan.pdf",
    mimeType: "application/pdf",
    size: 175000,
    url: "/sample-docs/gp-action-plan.pdf",
    uploadedBy: "Admin",
  },
  {
    root: "follow_ups",
    category: "Pending",
    title: "Follow-up — water supply file",
    titleKn: "Follow-up — water supply file",
    fileName: "followup-water.pdf",
    mimeType: "application/pdf",
    size: 64000,
    url: "/sample-docs/followup-water.pdf",
    uploadedBy: "Admin",
    status: "pending",
  },
  {
    root: "follow_ups",
    category: "Closed",
    title: "Follow-up closed — street lights",
    titleKn: "Follow-up closed — street lights",
    fileName: "followup-lights.pdf",
    mimeType: "application/pdf",
    size: 52000,
    url: "/sample-docs/followup-lights.pdf",
    uploadedBy: "Admin",
    status: "closed",
  },
];

function loadAssemblyQaFromImport() {
  const jsonPath = join(__dirname, "../data/assemblyQaFromFolder.json");
  try {
    const rows = JSON.parse(readFileSync(jsonPath, "utf8"));
    return rows.map((q) => ({
      questionNo: q.questionNo || "",
      sessionLabel: q.sessionLabel || "",
      sessionDate: q.sessionDate || null,
      askedBy: q.askedBy === "other" ? "other" : "mla",
      askedByName: q.askedByName || "",
      partyName: q.partyName || "",
      question: q.question,
      questionKn: q.questionKn || q.question || "",
      answer: q.answer || "",
      answerKn: q.answerKn || "",
      status: q.status === "pending" ? "pending" : "answered",
      uploadedBy: q.uploadedBy || "Import",
      files: (q.files || []).map((f) => ({
        fileName: f.fileName,
        mimeType: f.mimeType || "application/pdf",
        size: Number(f.size) || 0,
        url: f.url,
        s3Key: f.s3Key || null,
      })),
    }));
  } catch {
    console.warn(
      "assemblyQaFromFolder.json missing — run: node scripts/importAssemblyQaAndHeroVideo.js"
    );
    return [];
  }
}

const ASSEMBLY_QA = loadAssemblyQaFromImport();

function loadHeroVideoMeta() {
  const jsonPath = join(__dirname, "../data/landingHeroVideo.json");
  try {
    const meta = JSON.parse(readFileSync(jsonPath, "utf8"));
    return {
      video: meta.video || "",
      videoS3Key: meta.s3Key || "kudligi-mla/landing/hero_nrega_video.mp4",
    };
  } catch {
    return { video: "", videoS3Key: "" };
  }
}

function loadDevelopmentsVideoMeta() {
  const jsonPath = join(__dirname, "../data/landingDevelopmentsVideo.json");
  try {
    const meta = JSON.parse(readFileSync(jsonPath, "utf8"));
    return {
      video: meta.video || "",
      developmentsVideoS3Key:
        meta.s3Key || "kudligi-mla/landing/developments_bg_video.mp4",
    };
  } catch {
    return { video: "", developmentsVideoS3Key: "" };
  }
}

const COMPLAINTS = [
  {
    name: "Anand R",
    phone: "9900112233",
    village: "kudligi",
    subject: "Water supply",
    message: "Irregular drinking water supply in ward 4 for last 10 days.",
    status: "new",
  },
  {
    name: "Geetha M",
    phone: "9900223344",
    village: "kottur",
    subject: "Road damage",
    message: "Main road near school has large potholes after rains.",
    status: "new",
  },
  {
    name: "Shivu",
    phone: "9900334455",
    village: "hosahalli",
    subject: "Street light",
    message: "Street light near temple not working for 2 weeks.",
    status: "read",
  },
  {
    name: "Padma",
    phone: "9900445566",
    village: "gudekote",
    subject: "Drainage",
    message: "Overflowing drain behind market causing hygiene issues.",
    status: "read",
  },
  {
    name: "Ravi Kumar",
    phone: "9900556677",
    village: "kanahosahalli",
    subject: "Electricity",
    message: "Frequent power cuts in evening hours.",
    status: "new",
  },
  {
    name: "Savitha",
    phone: "9900667788",
    village: "chiribi",
    subject: "School",
    message: "Request additional classroom for primary school.",
    status: "closed",
  },
  {
    name: "Nagaraj",
    phone: "9900778899",
    village: "other",
    subject: "Pension",
    message: "Need help tracking widow pension application.",
    status: "new",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@mla.local" },
    update: {
      name: "Admin",
      nameKn: "Admin",
      passwordHash,
      role: "admin",
    },
    create: {
      email: "admin@mla.local",
      name: "Admin",
      nameKn: "Admin",
      passwordHash,
      role: "admin",
    },
  });

  const staffSeed = [
    {
      phone: "9876543210",
      name: "Development Officer",
      nameKn: "Development Officer",
      role: "development",
      modules: {
        development: fullPerms(),
        department_records: emptyPerms(),
        demands: emptyPerms(),
        assembly_qa: emptyPerms(),
      },
    },
    {
      phone: "9876543211",
      name: "Department Records Officer",
      nameKn: "Department Records Officer",
      role: "department_records",
      modules: {
        development: emptyPerms(),
        department_records: {
          view: true,
          add: true,
          edit: false,
          delete: false,
          download: true,
        },
        demands: emptyPerms(),
        assembly_qa: emptyPerms(),
      },
    },
    {
      phone: "9876543212",
      name: "Download Clerk",
      nameKn: "Download Clerk",
      role: "staff",
      modules: {
        development: {
          view: true,
          add: false,
          edit: false,
          delete: false,
          download: true,
        },
        department_records: {
          view: true,
          add: false,
          edit: false,
          delete: false,
          download: true,
        },
        demands: emptyPerms(),
        assembly_qa: emptyPerms(),
      },
    },
    {
      phone: "9876543213",
      name: "Demands Officer",
      nameKn: "Demands Officer",
      role: "demands",
      modules: {
        development: emptyPerms(),
        department_records: emptyPerms(),
        demands: {
          view: true,
          add: true,
          edit: true,
          delete: true,
          download: true,
        },
        assembly_qa: emptyPerms(),
      },
    },
    {
      phone: "9876543214",
      name: "Assembly Q&A Officer",
      nameKn: "Assembly Q&A Officer",
      role: "assembly_qa",
      modules: {
        development: emptyPerms(),
        department_records: emptyPerms(),
        demands: emptyPerms(),
        assembly_qa: {
          view: true,
          add: true,
          edit: true,
          delete: false,
          download: true,
        },
      },
    },
  ];

  for (const s of staffSeed) {
    await prisma.user.upsert({
      where: { phone: s.phone },
      update: {
        name: s.name,
        nameKn: s.nameKn,
        role: s.role,
        totpSecret: DEMO_TOTP_SECRET,
        totpEnabled: true,
        permissions: {
          upsert: {
            create: { modules: s.modules },
            update: { modules: s.modules },
          },
        },
      },
      create: {
        phone: s.phone,
        name: s.name,
        nameKn: s.nameKn,
        role: s.role,
        totpSecret: DEMO_TOTP_SECRET,
        totpEnabled: true,
        permissions: { create: { modules: s.modules } },
      },
    });
  }

  const fromFile = loadLandingSeed();
  const landingBase = fromFile || FALLBACK_LANDING;
  const landingData = {
    ...landingBase,
    media: {
      ...(landingBase.media || {}),
      tourScheduleImage:
        landingBase.media?.tourScheduleImage || "/tour_schedule_sheet_v10.png",
      tourSchedules: TOUR_SCHEDULES,
    },
    copy: {
      ...(landingBase.copy || {}),
      en: {
        ...(landingBase.copy?.en || {}),
        grievancesTab: "Complaint",
        formBadge: "Public Complaint Portal",
        formHeading: "COMPLAINTS & SUGGESTIONS",
        formSuccess: "Thank you! Your complaint has been recorded successfully.",
      },
      kn: {
        ...(landingBase.copy?.kn || {}),
        grievancesTab: "Complaint",
        formBadge: "Public Complaint Portal",
        formHeading: "COMPLAINTS & SUGGESTIONS",
        formSuccess: "Thank you! Your complaint has been recorded successfully.",
      },
    },
  };

  await prisma.landingContent.upsert({
    where: { id: "default" },
    update: { data: landingData },
    create: { id: "default", data: landingData },
  });

  // Replace developments with constituency kamagari master (xlsx import)
  await prisma.developmentMedia.deleteMany({});
  await prisma.development.deleteMany({});
  const BATCH = 100;
  for (let i = 0; i < DEVELOPMENTS.length; i += BATCH) {
    const chunk = DEVELOPMENTS.slice(i, i + BATCH).map((d) => ({
      gramPanchayat: d.gramPanchayat,
      village: d.village,
      name: d.name,
      nameKn: d.nameKn || "",
      description: d.description || "",
      descriptionKn: d.descriptionKn || "",
      details: d.details || "",
      detailsKn: d.detailsKn || "",
      amountSanctioned: d.amountSanctioned || 0,
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
    await prisma.development.createMany({ data: chunk });
  }

  // Replace demands with village-visit petitions (Village*.xlsx import)
  await prisma.demand.deleteMany({});
  const DEMAND_BATCH = 200;
  for (let i = 0; i < DEMANDS.length; i += DEMAND_BATCH) {
    await prisma.demand.createMany({
      data: DEMANDS.slice(i, i + DEMAND_BATCH),
    });
  }

  const existingDocKeys = new Set(
    (
      await prisma.departmentDocument.findMany({
        select: { root: true, category: true, title: true, fileName: true },
      })
    ).map((r) => `${r.root}|${r.category}|${r.title}|${r.fileName}`)
  );
  const docsToCreate = DEPT_DOCS.filter(
    (d) =>
      !existingDocKeys.has(`${d.root}|${d.category}|${d.title}|${d.fileName}`)
  );
  if (docsToCreate.length) {
    await prisma.departmentDocument.createMany({ data: docsToCreate });
  }

  // Replace assembly Q&A with imported session PDFs (S3-backed)
  await prisma.assemblyQaFile.deleteMany({});
  await prisma.assemblyQa.deleteMany({});
  for (const qa of ASSEMBLY_QA) {
    const { files, ...rest } = qa;
    await prisma.assemblyQa.create({
      data: {
        ...rest,
        files: files?.length ? { create: files } : undefined,
      },
    });
  }

  // Prefer S3 landing videos when available
  const heroMeta = loadHeroVideoMeta();
  const devMeta = loadDevelopmentsVideoMeta();
  if (heroMeta.video || devMeta.video) {
    const landingRow = await prisma.landingContent.findUnique({
      where: { id: "default" },
    });
    if (landingRow?.data) {
      const data = structuredClone(landingRow.data);
      if (heroMeta.video) {
        data.hero = {
          ...(data.hero || {}),
          video: heroMeta.video,
          videoS3Key: heroMeta.videoS3Key,
        };
      }
      if (devMeta.video) {
        data.media = {
          ...(data.media || {}),
          developmentsVideo: devMeta.video,
          developmentsVideoS3Key: devMeta.developmentsVideoS3Key,
        };
      }
      await prisma.landingContent.update({
        where: { id: "default" },
        data: { data },
      });
    }
  }

  const existingComplaintKeys = new Set(
    (
      await prisma.complaint.findMany({
        select: { phone: true, subject: true, message: true },
      })
    ).map((r) => `${r.phone}|${r.subject}|${r.message}`)
  );
  const complaintsToCreate = COMPLAINTS.filter(
    (c) => !existingComplaintKeys.has(`${c.phone}|${c.subject}|${c.message}`)
  );
  if (complaintsToCreate.length) {
    await prisma.complaint.createMany({ data: complaintsToCreate });
  }

  console.log(
    `Seed complete: admin@mla.local / admin123, staff 9876543210 Authenticator secret ${DEMO_TOTP_SECRET}`
  );
  console.log(
    `Dummy data: developments=${await prisma.development.count()}, demands=${await prisma.demand.count()}, docs=${await prisma.departmentDocument.count()}, qa=${await prisma.assemblyQa.count()}, complaints=${await prisma.complaint.count()}, tourSchedules=${TOUR_SCHEDULES.length}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
