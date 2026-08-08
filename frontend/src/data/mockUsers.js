/** Demo Authenticator base32 secret (must match backend DEMO_TOTP_SECRET / seed). */
export const DEMO_TOTP_SECRET = "BTRSABHTAOR7A2U4DZLNIQI6H5OZSNDT";

export const mockAdmin = {
  email: "admin@mla.local",
  password: "admin123",
  name: "MLA Office Admin",
  nameKn: "ಶಾಸಕರ ಕಚೇರಿ ನಿರ್ವಾಹಕ",
  role: "admin",
};

/** Staff users keyed by phone (10 digits) */
export const mockStaffUsers = {
  "9876543210": {
    phone: "9876543210",
    name: "Development Officer",
    nameKn: "ಅಭಿವೃದ್ಧಿ ಅಧಿಕಾರಿ",
    role: "development",
  },
  "9876543211": {
    phone: "9876543211",
    name: "Department Records Officer",
    nameKn: "ಇಲಾಖಾ ದಾಖಲೆ ಅಧಿಕಾರಿ",
    role: "department_records",
  },
  "9876543213": {
    phone: "9876543213",
    name: "Demands Officer",
    nameKn: "ಬೇಡಿಕೆ ಅಧಿಕಾರಿ",
    role: "demands",
  },
  "9876543214": {
    phone: "9876543214",
    name: "Assembly Q&A Officer",
    nameKn: "ಅಧಿವೇಶನ ಪ್ರಶ್ನೋತ್ತರ ಅಧಿಕಾರಿ",
    role: "assembly_qa",
  },
};

export const STAFF_ROLES = [
  {
    id: "development",
    labelEn: "Development (Works)",
    labelKn: "ಕಾಮಗಾರಿಗಳು",
    enabled: true,
  },
  {
    id: "department_records",
    labelEn: "Department Records",
    labelKn: "ಇಲಾಖಾ ದಾಖಲೆಗಳು",
    enabled: true,
  },
  {
    id: "demands",
    labelEn: "Demands / Requests",
    labelKn: "ಬೇಡಿಕೆಗಳು",
    enabled: true,
  },
  {
    id: "assembly_qa",
    labelEn: "Assembly Q&A / Session Q&A",
    labelKn: "ಅಧಿವೇಶನ ಪ್ರಶ್ನೆ ಮತ್ತು ಉತ್ತರ",
    enabled: true,
  },
];
