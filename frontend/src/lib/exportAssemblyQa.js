import { downloadCsv, downloadPdfTable } from "@/lib/exportList";

const HEADERS_EN = [
  "Question No",
  "Session",
  "Date",
  "Asked By",
  "Name",
  "Party",
  "Question",
  "Answer",
  "Status",
];
const HEADERS_KN = [
  "ಪ್ರಶ್ನೆ ಸಂಖ್ಯೆ",
  "ಅಧಿವೇಶನ",
  "ದಿನಾಂಕ",
  "ಕೇಳಿದವರು",
  "ಹೆಸರು",
  "ಪಕ್ಷ",
  "ಪ್ರಶ್ನೆ",
  "ಉತ್ತರ",
  "ಸ್ಥಿತಿ",
];

function rowToCells(row, lang) {
  const q = lang === "kn" && row.questionKn ? row.questionKn : row.question;
  const a = lang === "kn" && row.answerKn ? row.answerKn : row.answer;
  return [
    row.questionNo,
    row.sessionLabel,
    row.sessionDate || "",
    row.askedBy,
    row.askedByName,
    row.partyName,
    q,
    a,
    row.status,
  ];
}

export function downloadAssemblyQaExcel(rows, lang = "en", filename) {
  const headers = lang === "kn" ? HEADERS_KN : HEADERS_EN;
  downloadCsv(
    headers,
    rows.map((r) => rowToCells(r, lang)),
    filename || `assembly-qa-${Date.now()}.csv`
  );
}

export function downloadAssemblyQaPdf(rows, lang = "en", title) {
  const headers = lang === "kn" ? HEADERS_KN : HEADERS_EN;
  downloadPdfTable(
    headers,
    rows.map((r) => rowToCells(r, lang)),
    {
      title: title || (lang === "kn" ? "ವಿಧಾನಸಭೆ ಪ್ರಶ್ನೋತ್ತರ ವರದಿ" : "Assembly Q&A Report"),
      lang,
    }
  );
}
