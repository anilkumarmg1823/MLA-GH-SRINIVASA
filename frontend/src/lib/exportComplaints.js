import { downloadCsv, downloadPdfTable } from "@/lib/exportList";

const HEADERS_EN = [
  "Source",
  "Name",
  "Phone",
  "Gram Panchayat",
  "Village",
  "Subject",
  "Message",
  "Status",
  "Reply",
  "Date",
];
const HEADERS_KN = [
  "Source",
  "Name",
  "Phone",
  "Gram Panchayat",
  "Village",
  "Subject",
  "Message",
  "Status",
  "Reply",
  "Date",
];

function rowToCells(row) {
  return [
    row.source || "web",
    row.name,
    row.phone,
    row.gramPanchayat || "",
    row.village,
    row.subject,
    row.message,
    row.status,
    row.replyText || "",
    row.createdAt ? String(row.createdAt).slice(0, 10) : "",
  ];
}

export function downloadComplaintsExcel(rows, lang = "en", filename) {
  const headers = lang === "kn" ? HEADERS_KN : HEADERS_EN;
  downloadCsv(
    headers,
    rows.map(rowToCells),
    filename || `complaints-${Date.now()}.csv`
  );
}

export function downloadComplaintsPdf(rows, lang = "en", title) {
  const headers = lang === "kn" ? HEADERS_KN : HEADERS_EN;
  downloadPdfTable(headers, rows.map(rowToCells), {
    title: title || "Complaints Report",
    lang,
  });
}
