/** Shared CSV / printable PDF helpers for list exports */

function escapeCsv(value) {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function escapeHtml(s) {
  return String(s)
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

export function downloadCsv(headers, rows, filename) {
  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ];
  const bom = "\uFEFF";
  const blob = new Blob([bom + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, filename);
}

export function downloadPdfTable(headers, rows, { title, lang = "en" } = {}) {
  const reportTitle = title || "Report";
  const tableRows = rows
    .map((row) => {
      const cells = row
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
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <button class="no-print" onclick="window.print()" style="margin-bottom:12px;padding:8px 14px;background:#CCBCA5;border:0;border-radius:999px;font-weight:700;cursor:pointer;">
    ${lang === "kn" ? "Save as PDF / Print" : "Save as PDF / Print"}
  </button>
  <h1>${escapeHtml(reportTitle)}</h1>
  <p>Total records: ${rows.length} · ${new Date().toLocaleString(
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
    alert("Please allow pop-ups and try again");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
