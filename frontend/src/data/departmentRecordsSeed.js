/**
 * Demo Department Records — cover images so cards look real (not empty/red icons).
 * dataUrl is the file users Open/Download; coverUrl is the card preview when set.
 */

const docs = [
  {
    id: "doc-seed-1",
    root: "secretariat",
    category: "petitions",
    title: "Road repair petition — Hirehadagali",
    titleKn: "ರಸ್ತೆ ದುರಸ್ತಿ ಮನವಿ — ಹಿರೇಹಡಗಲಿ",
    fileName: "petition-hirehadagali.pdf",
    mimeType: "application/pdf",
    size: 245760,
    coverUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
    dataUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-07-10T10:20:00.000Z",
    uploadedBy: "Office Staff",
  },
  {
    id: "doc-seed-2",
    root: "secretariat",
    category: "petitions",
    title: "Drinking water supply petition",
    titleKn: "ಕುಡಿಯುವ ನೀರು ಪೂರೈಕೆ ಮನವಿ",
    fileName: "water-petition.jpg",
    mimeType: "image/jpeg",
    size: 412000,
    dataUrl:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-07-12T14:05:00.000Z",
    uploadedBy: "PA Desk",
  },
  {
    id: "doc-seed-3",
    root: "secretariat",
    category: "transfer_letters",
    title: "Teacher transfer — Kudligi taluk",
    titleKn: "ಶಿಕ್ಷಕ ವರ್ಗಾವಣೆ — ಕೂಡ್ಲಿಗಿ ತಾಲ್ಲೂಕು",
    fileName: "transfer-teacher.pdf",
    mimeType: "application/pdf",
    size: 188400,
    coverUrl:
      "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80",
    dataUrl:
      "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-06-28T09:15:00.000Z",
    uploadedBy: "Secretariat Desk",
  },
  {
    id: "doc-seed-4",
    root: "secretariat",
    category: "acknowledgement_letters",
    title: "Petition acknowledgement — June batch",
    titleKn: "ಮನವಿ ಸ್ವೀಕೃತಿ — ಜೂನ್ ಬ್ಯಾಚ್",
    fileName: "ack-june-2026.pdf",
    mimeType: "application/pdf",
    size: 156000,
    coverUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
    dataUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-06-30T11:40:00.000Z",
    uploadedBy: "Records Clerk",
  },
  {
    id: "doc-seed-5",
    root: "secretariat",
    category: "order_letters",
    title: "MLA office order — relief fund",
    titleKn: "ಶಾಸಕರ ಕಚೇರಿ ಆದೇಶ — ಪರಿಹಾರ ನಿಧಿ",
    fileName: "order-relief.pdf",
    mimeType: "application/pdf",
    size: 210500,
    coverUrl:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    dataUrl:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-07-02T16:00:00.000Z",
    uploadedBy: "Admin",
  },
  {
    id: "doc-seed-6",
    root: "secretariat",
    category: "others",
    title: "Constituency meeting minutes",
    titleKn: "ಕ್ಷೇತ್ರ ಸಭೆ ನಡವಳಿ",
    fileName: "meeting-minutes.jpg",
    mimeType: "image/jpeg",
    size: 320000,
    dataUrl:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-07-08T08:30:00.000Z",
    uploadedBy: "PA Desk",
  },
  {
    id: "doc-seed-7",
    root: "department",
    category: "petitions",
    title: "PWD estimate petition copy",
    titleKn: "ಲೋಕೋಪಯೋಗಿ ಅಂದಾಜು ಮನವಿ ನಕಲು",
    fileName: "pwd-petition.pdf",
    mimeType: "application/pdf",
    size: 278000,
    coverUrl:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    dataUrl:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-07-05T13:10:00.000Z",
    uploadedBy: "Department Desk",
  },
  {
    id: "doc-seed-8",
    root: "department",
    category: "acknowledgement_letters",
    title: "Health dept acknowledgement",
    titleKn: "ಆರೋಗ್ಯ ಇಲಾಖೆ ಸ್ವೀಕೃತಿ ಪತ್ರ",
    fileName: "health-ack.pdf",
    mimeType: "application/pdf",
    size: 142000,
    coverUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    dataUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-07-11T10:00:00.000Z",
    uploadedBy: "Department Desk",
  },
  {
    id: "doc-seed-9",
    root: "department",
    category: "acknowledgement_letters",
    title: "School grant acknowledgement scan",
    titleKn: "ಶಾಲಾ ಅನುದಾನ ಸ್ವೀಕೃತಿ ಸ್ಕ್ಯಾನ್",
    fileName: "school-grant-ack.jpg",
    mimeType: "image/jpeg",
    size: 390000,
    dataUrl:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-07-14T15:45:00.000Z",
    uploadedBy: "Records Clerk",
  },
  {
    id: "doc-seed-10",
    root: "department",
    category: "others",
    title: "Inspection photo — tank work",
    titleKn: "ತಪಾಸಣೆ ಛಾಯಾಚಿತ್ರ — ಕೆರೆ ಕಾಮಗಾರಿ",
    fileName: "tank-inspection.jpg",
    mimeType: "image/jpeg",
    size: 510000,
    dataUrl:
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-07-15T12:20:00.000Z",
    uploadedBy: "Field Staff",
  },
  {
    id: "doc-seed-11",
    root: "secretariat",
    category: "order_letters",
    title: "Development works sanction order",
    titleKn: "ಅಭಿವೃದ್ಧಿ ಕಾಮಗಾರಿ ಮಂಜೂರಾತಿ ಆದೇಶ",
    fileName: "sanction-order.pdf",
    mimeType: "application/pdf",
    size: 265000,
    coverUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    dataUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-07-18T09:00:00.000Z",
    uploadedBy: "Admin",
  },
  {
    id: "doc-seed-12",
    root: "secretariat",
    category: "transfer_letters",
    title: "Staff posting transfer letter",
    titleKn: "ಸಿಬ್ಬಂದಿ ನಿಯುಕ್ತಿ ವರ್ಗಾವಣೆ ಪತ್ರ",
    fileName: "posting-transfer.jpg",
    mimeType: "image/jpeg",
    size: 298000,
    dataUrl:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-07-19T17:30:00.000Z",
    uploadedBy: "Secretariat Desk",
  },
  {
    id: "doc-seed-13",
    root: "follow_ups",
    category: "pending",
    status: "pending",
    eGeneratedId: "EGN-2026-0142",
    title: "Follow up — drinking water petition reply",
    titleKn: "ಅನುಸರಣೆ — ಕುಡಿಯುವ ನೀರು ಮನವಿ ಪ್ರತ್ಯುತ್ತರ",
    fileName: "followup-water.pdf",
    mimeType: "application/pdf",
    size: 178000,
    coverUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    dataUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-07-20T10:00:00.000Z",
    uploadedBy: "PA Desk",
  },
  {
    id: "doc-seed-14",
    root: "follow_ups",
    category: "in_progress",
    status: "in_progress",
    eGeneratedId: "EGN-2026-0188",
    title: "Follow up — road repair site inspection",
    titleKn: "ಅನುಸರಣೆ — ರಸ್ತೆ ದುರಸ್ತಿ ತಪಾಸಣೆ",
    fileName: "followup-road.jpg",
    mimeType: "image/jpeg",
    size: 390000,
    dataUrl:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-07-21T08:30:00.000Z",
    uploadedBy: "Field Staff",
  },
  {
    id: "doc-seed-15",
    root: "follow_ups",
    category: "completed",
    status: "completed",
    eGeneratedId: "EGN-2026-0091",
    title: "Follow up closed — scholarship letter",
    titleKn: "ಅನುಸರಣೆ ಮುಗಿದಿದೆ — ವಿದ್ಯಾರ್ಥಿವೇತನ ಪತ್ರ",
    fileName: "followup-scholarship.pdf",
    mimeType: "application/pdf",
    size: 142000,
    coverUrl:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    dataUrl:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    uploadedAt: "2026-07-16T15:45:00.000Z",
    uploadedBy: "Office Staff",
  },
];

export const seedDepartmentRecords = docs;
