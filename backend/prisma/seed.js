import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

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
    taglineEn: "Nimmondige",
    taglineKn: "Nimmondige",
  },
  copy: { en: {}, kn: {} },
  hero: { slides: [] },
  media: {
    tourScheduleImage: "/tour_schedule_sheet_v10.png",
    tourSchedules: [],
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

const DEVELOPMENTS = [
  {
    gramPanchayat: "Kudligi Town",
    village: "Kudligi",
    name: "CC Road — Main Market",
    nameKn: "CC Road — Main Market",
    description: "Concrete road improvement in market area",
    amountSanctioned: 4500000,
    status: "Ongoing",
    department: "PWD",
    yojane: "NREGA / State",
    beneficiaries: "Local traders & residents",
    startDate: "2025-11-01",
    locationNote: "Near bus stand",
  },
  {
    gramPanchayat: "Kudligi Town",
    village: "Kudligi",
    name: "Drinking water pipeline",
    nameKn: "Drinking water pipeline",
    description: "New distribution line for ward 3-5",
    amountSanctioned: 2800000,
    status: "Completed",
    department: "RDPR",
    yojane: "Jal Jeevan",
    beneficiaries: "1200 households",
    startDate: "2025-04-01",
  },
  {
    gramPanchayat: "Kottur",
    village: "Kottur",
    name: "Anganwadi renovation",
    nameKn: "Anganwadi renovation",
    description: "Roof and flooring upgrade",
    amountSanctioned: 950000,
    status: "Ongoing",
    department: "Women & Child",
    yojane: "ICDS",
    beneficiaries: "Children & mothers",
    startDate: "2026-01-15",
  },
  {
    gramPanchayat: "Kottur",
    village: "Salhunse",
    name: "Check dam repair",
    nameKn: "Check dam repair",
    description: "Irrigation support structure",
    amountSanctioned: 1600000,
    status: "Ongoing",
    department: "Minor Irrigation",
    yojane: "State MI",
    beneficiaries: "Farmers",
    startDate: "2025-12-01",
  },
  {
    gramPanchayat: "Hosahalli",
    village: "Hosahalli",
    name: "GP office compound wall",
    nameKn: "GP office compound wall",
    description: "Security compound for GP premises",
    amountSanctioned: 720000,
    status: "Completed",
    department: "RDPR",
    yojane: "14th FC",
    beneficiaries: "Public",
    startDate: "2025-06-01",
  },
  {
    gramPanchayat: "Hosahalli",
    village: "Kanamadugu",
    name: "Street lights — solar",
    nameKn: "Street lights — solar",
    description: "40 solar street lights",
    amountSanctioned: 1100000,
    status: "Ongoing",
    department: "Energy",
    yojane: "Gram Jyoti",
    beneficiaries: "Village residents",
    startDate: "2026-02-01",
  },
  {
    gramPanchayat: "Gudekote",
    village: "Gudekote",
    name: "School classroom block",
    nameKn: "School classroom block",
    description: "Additional classrooms for high school",
    amountSanctioned: 5200000,
    status: "Ongoing",
    department: "Education",
    yojane: "Samagra Shiksha",
    beneficiaries: "Students",
    startDate: "2025-09-01",
  },
  {
    gramPanchayat: "Ujjini",
    village: "Ujjini",
    name: "Community hall",
    nameKn: "Community hall",
    description: "Multi-purpose hall for GP",
    amountSanctioned: 3500000,
    status: "Proposed",
    department: "RDPR",
    yojane: "State Grant",
    beneficiaries: "Public",
    startDate: "2026-06-01",
  },
  {
    gramPanchayat: "Choranur",
    village: "Choranur",
    name: "Drainage channel",
    nameKn: "Drainage channel",
    description: "Storm water drain along main road",
    amountSanctioned: 1900000,
    status: "Ongoing",
    department: "PWD",
    yojane: "NREGA",
    beneficiaries: "Households",
    startDate: "2026-01-01",
  },
  {
    gramPanchayat: "Kudligi Town",
    village: "Kudligi",
    name: "Park & walking track",
    nameKn: "Park & walking track",
    description: "Public recreation space",
    amountSanctioned: 2100000,
    status: "Completed",
    department: "Urban Development",
    yojane: "AMRUT / Local",
    beneficiaries: "Citizens",
    startDate: "2024-10-01",
  },
];

const DEMANDS = [
  {
    gramPanchayat: "Kudligi Town",
    village: "Kudligi",
    name: "Ramesh K",
    approach: "civil",
    subject: "Street light near temple",
    status: "Pending",
  },
  {
    gramPanchayat: "Kottur",
    village: "Kottur",
    name: "Lakshmi Devi",
    approach: "personal",
    subject: "Pension document assistance",
    status: "InProgress",
  },
  {
    gramPanchayat: "Hosahalli",
    village: "Hosahalli",
    name: "Basavaraj",
    approach: "civil",
    subject: "Road repair after rains",
    status: "Pending",
  },
  {
    gramPanchayat: "Gudekote",
    village: "Gudekote",
    name: "Manjula",
    approach: "civil",
    subject: "Drinking water shortage",
    status: "Completed",
  },
  {
    gramPanchayat: "Ujjini",
    village: "Ujjini",
    name: "Suresh N",
    approach: "personal",
    subject: "Medical referral letter",
    status: "Pending",
  },
];

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

const ASSEMBLY_QA = [
  {
    questionNo: "Q-12",
    sessionLabel: "Budget Session 2026",
    sessionDate: "2026-03-12",
    askedBy: "mla",
    askedByName: "Dr. Srinivas N. T.",
    partyName: "INC",
    question: "Steps taken for drinking water in Kudligi taluk?",
    questionKn: "Steps taken for drinking water in Kudligi taluk?",
    answer: "Jal Jeevan Mission works sanctioned for 18 GPs; 9 completed.",
    answerKn: "Jal Jeevan Mission works sanctioned for 18 GPs; 9 completed.",
    status: "answered",
    uploadedBy: "Admin",
  },
  {
    questionNo: "Q-18",
    sessionLabel: "Budget Session 2026",
    sessionDate: "2026-03-14",
    askedBy: "mla",
    askedByName: "Dr. Srinivas N. T.",
    partyName: "INC",
    question: "Status of CC roads under NREGA?",
    questionKn: "Status of CC roads under NREGA?",
    answer: "Works ongoing in 6 GPs; completion targeted before monsoon.",
    answerKn: "Works ongoing in 6 GPs; completion targeted before monsoon.",
    status: "answered",
    uploadedBy: "Admin",
  },
  {
    questionNo: "Q-31",
    sessionLabel: "Monsoon Session 2026",
    sessionDate: "2026-07-08",
    askedBy: "other",
    askedByName: "Opposition Member",
    partyName: "BJP",
    question: "Details of irrigation tank desilting?",
    questionKn: "Details of irrigation tank desilting?",
    answer: "",
    answerKn: "",
    status: "pending",
    uploadedBy: "Assembly Q&A Officer",
  },
  {
    questionNo: "Q-33",
    sessionLabel: "Monsoon Session 2026",
    sessionDate: "2026-07-10",
    askedBy: "mla",
    askedByName: "Dr. Srinivas N. T.",
    partyName: "INC",
    question: "Update on school infrastructure grants?",
    questionKn: "Update on school infrastructure grants?",
    answer: "Two classroom blocks sanctioned; tender stage.",
    answerKn: "Two classroom blocks sanctioned; tender stage.",
    status: "answered",
    uploadedBy: "Admin",
  },
  {
    questionNo: "Q-40",
    sessionLabel: "Monsoon Session 2026",
    sessionDate: "2026-07-15",
    askedBy: "other",
    askedByName: "Other MLA",
    partyName: "JD(S)",
    question: "Bus connectivity to remote villages?",
    questionKn: "Bus connectivity to remote villages?",
    answer: "",
    answerKn: "",
    status: "pending",
    uploadedBy: "Assembly Q&A Officer",
  },
];

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

  const existingDevKeys = new Set(
    (
      await prisma.development.findMany({
        select: { gramPanchayat: true, village: true, name: true },
      })
    ).map((r) => `${r.gramPanchayat}|${r.village}|${r.name}`)
  );
  for (const d of DEVELOPMENTS) {
    const key = `${d.gramPanchayat}|${d.village}|${d.name}`;
    if (existingDevKeys.has(key)) continue;
    await prisma.development.create({
      data: {
        ...d,
        descriptionKn: d.descriptionKn || "",
        details: d.details || "",
        detailsKn: d.detailsKn || "",
        statusKn: d.statusKn || "",
        beneficiariesKn: d.beneficiariesKn || "",
        departmentKn: d.departmentKn || "",
        locationNote: d.locationNote || "",
        locationNoteKn: d.locationNoteKn || "",
        yojaneKn: d.yojaneKn || "",
        media: {
          create: [
            {
              url: "/gp_building_3d_v2.png",
              mimeType: "image/png",
              type: "image",
            },
          ],
        },
      },
    });
  }

  const existingDemandKeys = new Set(
    (
      await prisma.demand.findMany({
        select: { gramPanchayat: true, village: true, name: true, subject: true },
      })
    ).map((r) => `${r.gramPanchayat}|${r.village}|${r.name}|${r.subject}`)
  );
  const demandsToCreate = DEMANDS.filter(
    (d) =>
      !existingDemandKeys.has(
        `${d.gramPanchayat}|${d.village}|${d.name}|${d.subject}`
      )
  );
  if (demandsToCreate.length) {
    await prisma.demand.createMany({ data: demandsToCreate });
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

  const existingQaKeys = new Set(
    (
      await prisma.assemblyQa.findMany({
        select: { question: true, askedByName: true },
      })
    ).map((r) => `${r.askedByName}|${r.question}`)
  );
  for (const qa of ASSEMBLY_QA) {
    if (existingQaKeys.has(`${qa.askedByName || ""}|${qa.question}`)) continue;
    await prisma.assemblyQa.create({ data: qa });
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
    "Seed complete: admin@mla.local / admin123, staff 9876543210 OTP 123456"
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
