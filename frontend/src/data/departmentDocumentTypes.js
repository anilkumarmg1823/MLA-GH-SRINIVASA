/** Fixed taxonomy for Department Records module */

export const FOLLOW_UP_STATUSES = [
  { id: "pending", labelEn: "Pending", labelKn: "ಬಾಕಿ" },
  { id: "in_progress", labelEn: "In Progress", labelKn: "ಪ್ರಗತಿಯಲ್ಲಿದೆ" },
  { id: "completed", labelEn: "Completed", labelKn: "ಪೂರ್ಣಗೊಂಡಿದೆ" },
];

export const DOC_ROOTS = [
  {
    id: "secretariat",
    labelEn: "Secretariat",
    labelKn: "ಸಚಿವಾಲಯ",
    categories: [
      { id: "petitions", labelEn: "Petitions", labelKn: "ಮನವಿಗಳು" },
      {
        id: "transfer_letters",
        labelEn: "Transfer Letters",
        labelKn: "ವರ್ಗಾವಣೆ ಪತ್ರಗಳು",
      },
      {
        id: "acknowledgement_letters",
        labelEn: "Acknowledgement Letters",
        labelKn: "ಸ್ವೀಕೃತತ್ವದ ಪತ್ರಗಳು",
      },
      {
        id: "order_letters",
        labelEn: "Order Letters",
        labelKn: "ಆದೇಶ ಪತ್ರಗಳು",
      },
      { id: "others", labelEn: "Others", labelKn: "ಇತರೆ" },
    ],
  },
  {
    id: "department",
    labelEn: "Department",
    labelKn: "ಇಲಾಖೆ",
    categories: [
      { id: "petitions", labelEn: "Petitions", labelKn: "ಮನವಿಗಳು" },
      {
        id: "acknowledgement_letters",
        labelEn: "Acknowledgement Letters",
        labelKn: "ಸ್ವೀಕೃತತ್ವದ ಪತ್ರಗಳು",
      },
      { id: "others", labelEn: "Others", labelKn: "ಇತರೆ" },
    ],
  },
  {
    id: "follow_ups",
    labelEn: "Follow Ups",
    labelKn: "ಅನುಸರಣೆ",
    categories: FOLLOW_UP_STATUSES.map((s) => ({ ...s })),
  },
];

export function isFollowUpsRoot(rootId) {
  return rootId === "follow_ups";
}

export function getFollowUpStatusLabel(statusId, lang) {
  const status =
    FOLLOW_UP_STATUSES.find((s) => s.id === statusId) || FOLLOW_UP_STATUSES[0];
  return lang === "kn" ? status.labelKn : status.labelEn;
}

export function getRootById(rootId) {
  return DOC_ROOTS.find((r) => r.id === rootId) || DOC_ROOTS[0];
}

export function getCategory(rootId, categoryId) {
  const root = getRootById(rootId);
  return root.categories.find((c) => c.id === categoryId) || root.categories[0];
}

export function getRootLabel(rootId, lang) {
  const root = getRootById(rootId);
  return lang === "kn" ? root.labelKn : root.labelEn;
}

export function getCategoryLabel(rootId, categoryId, lang) {
  const cat = getCategory(rootId, categoryId);
  return lang === "kn" ? cat.labelKn : cat.labelEn;
}
