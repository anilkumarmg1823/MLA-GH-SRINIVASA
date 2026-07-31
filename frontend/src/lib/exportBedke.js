/** Export Bedke / demands as Excel-friendly CSV or printable PDF */

function escapeCsv(value) {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function approachLabel(approach, lang) {
  if (approach === "personal") {
    return lang === "kn" ? "ವೈಯಕ್ತಿಕ" : "Personal";
  }
  return lang === "kn" ? "ಸಿವಿಲ್" : "Civil";
}

function statusLabel(status, lang) {
  if (status === "Pending") return lang === "kn" ? "ಬಾಕಿ" : "Pending";
  return status || "";
}

function rowToCells(row, lang) {
  return [
    row.gramPanchayat,
    row.village,
    row.name,
    approachLabel(row.approach, lang),
    row.subject,
    statusLabel(row.status, lang),
    row.createdAt ? String(row.createdAt).slice(0, 10) : "",
  ];
}

const HEADERS_EN = [
  "Gram Panchayat",
  "Village",
  "Name",
  "Approach",
  "Subject",
  "Status",
  "Date",
];

const HEADERS_KN = [
  "ಗ್ರಾಮ ಪಂಚಾಯತ್",
  "ಗ್ರಾಮ",
  "ಹೆಸರು",
  "ವಿಧಾನ",
  "ವಿಷಯ",
  "ಸ್ಥಿತಿ",
  "ದಿನಾಂಕ",
];

export function downloadBedkeExcel(rows, lang = "en", filename) {
  const headers = lang === "kn" ? HEADERS_KN : HEADERS_EN;
  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => rowToCells(row, lang).map(escapeCsv).join(",")),
  ];
  const bom = "\uFEFF";
  const blob = new Blob([bom + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, filename || `bedke-${Date.now()}.csv`);
}

export function downloadBedkePdf(rows, lang = "en", title) {
  const headers = lang === "kn" ? HEADERS_KN : HEADERS_EN;
  const reportTitle =
    title || (lang === "kn" ? "ಬೇಡಿಕೆಗಳು ವರದಿ" : "Demands / Bedke Report");

  const tableRows = rows
    .map((row) => {
      const cells = rowToCells(row, lang)
        .map(
          (c) =>
            `<td style="border:1px solid #ccc;padding:6px 8px;font-size:11px;vertical-align:top;">${escapeHtml(
              String(c ?? "")
            )}</td>`
        )
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  const headerCells = headers
    .map(
      (h) =>
        `<th style="border:1px solid #999;padding:6px 8px;background:#CCBCA5;color:#1e2223;font-size:11px;text-align:left;">${escapeHtml(
          h
        )}</th>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(reportTitle)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 18px; margin: 0 0 8px; }
    p { font-size: 12px; color: #555; margin: 0 0 16px; }
    table { border-collapse: collapse; width: 100%; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <button class="no-print" onclick="window.print()" style="margin-bottom:12px;padding:8px 14px;background:#CCBCA5;border:0;border-radius:999px;font-weight:700;cursor:pointer;">
    ${lang === "kn" ? "PDF ಉಳಿಸಿ / ಮುದ್ರಿಸಿ" : "Save as PDF / Print"}
  </button>
  <h1>${escapeHtml(reportTitle)}</h1>
  <p>${lang === "kn" ? "ಒಟ್ಟು ದಾಖಲೆಗಳು" : "Total records"}: ${rows.length} · ${new Date().toLocaleString(
    lang === "kn" ? "kn-IN" : "en-IN"
  )}</p>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${tableRows || `<tr><td colspan="${headers.length}">—</td></tr>`}</tbody>
  </table>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert(
      lang === "kn"
        ? "ಪಾಪ್‌ಅಪ್ ಅನ್ನು ಅನುಮತಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ"
        : "Please allow pop-ups and try again"
    );
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
