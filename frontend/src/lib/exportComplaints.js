import { downloadCsv, downloadPdfTable } from "@/lib/exportList";

const HEADERS_EN = [
  "Name",
  "Phone",
  "Village",
  "Subject",
  "Message",
  "Status",
  "Date",
];
const HEADERS_KN = [
  "Name",
  "Phone",
  "Village",
  "Subject",
  "Message",
  "Status",
  "Date",
];

function rowToCells(row) {
  return [
    row.name,
    row.phone,
    row.village,
    row.subject,
    row.message,
    row.status,
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
