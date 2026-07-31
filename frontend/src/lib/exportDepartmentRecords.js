import { downloadCsv, downloadPdfTable } from "@/lib/exportList";

const HEADERS_EN = [
  "Root",
  "Category",
  "Title",
  "File",
  "Status",
  "Uploaded By",
  "Uploaded At",
];
const HEADERS_KN = [
  "Root",
  "Category",
  "Title",
  "File",
  "Status",
  "Uploaded By",
  "Uploaded At",
];

function rowToCells(row, lang) {
  const title = lang === "kn" && row.titleKn ? row.titleKn : row.title;
  return [
    row.root,
    row.category,
    title,
    row.fileName,
    row.status || "",
    row.uploadedBy || "",
    row.uploadedAt ? String(row.uploadedAt).slice(0, 10) : "",
  ];
}

export function downloadDepartmentRecordsExcel(rows, lang = "en", filename) {
  const headers = lang === "kn" ? HEADERS_KN : HEADERS_EN;
  downloadCsv(
    headers,
    rows.map((r) => rowToCells(r, lang)),
    filename || `department-records-${Date.now()}.csv`
  );
}

export function downloadDepartmentRecordsPdf(rows, lang = "en", title) {
  const headers = lang === "kn" ? HEADERS_KN : HEADERS_EN;
  downloadPdfTable(
    headers,
    rows.map((r) => rowToCells(r, lang)),
    {
      title: title || "Department Records Report",
      lang,
    }
  );
}
