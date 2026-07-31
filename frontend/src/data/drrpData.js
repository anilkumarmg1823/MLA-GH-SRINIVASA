// Official Kudligi Taluk Gram Panchayats & DRRP Projects Dataset (drrp.pdf)
export const GRAM_PANCHAYATS = [
  "Ambaliganur", "Banavikallu", "Belagatta", "Channapura", "Chilakanahatti", "Choranur", 
  "G.Basapur", "Gowripura", "Gudekote", "Gunthagola", "Halasagara", "Hirekumbalgunte", 
  "Hosahalli", "Huchangidurga", "Hulikunte", "Huralihalli", "Jarimale", "Kadekolla", 
  "Kalyanapura", "Kanamadugu", "Kottur", "Kudligi Town", "Kyasapur", "Moraba", 
  "N.D.Halli", "Nimidagalla", "Rampura", "Salhunse", "Shivapura", "Sooladahalli", 
  "T.Rampura", "Ujjini", "Valase", "Virupapur"
];

export const DRRP_PROJECTS = [
  { id: 1, code: "VR18", name: "ಟಿ.ರಾಮಪುರ ರಿಂದ ಎನ್.ಡಿ.ಹಳ್ಳಿ ರಸ್ತೆ ನಿರ್ಮಾಣ ಕಾಮಗಾರಿ", gp: "T.Rampura", destGp: "N.D.Halli", type: "VR Road", lengthKm: 3.75, budget: "₹168.75 ಲಕ್ಷ", status: "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)" },
  { id: 2, code: "VR21", name: "ಟಿ.ರಾಮಪುರ ರಿಂದ ಬೆಳಗಟ್ಟ ರಸ್ತೆ ಆಸ್ಫಾಲ್ಟಿಂಗ್", gp: "T.Rampura", destGp: "Belagatta", type: "VR Road", lengthKm: 2.25, budget: "₹101.25 ಲಕ್ಷ", status: "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)" },
  { id: 3, code: "VR22", name: "SH13 ರಿಂದ ಹಳಸಾಗರ ಸಂಪರ್ಕ ರಸ್ತೆ ಹಾಗೂ ಸೇತುವೆ", gp: "SH13", destGp: "Halasagara", type: "VR Road", lengthKm: 3.00, budget: "₹135.00 ಲಕ್ಷ", status: "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)" },
  { id: 4, code: "VR23", name: "MDR ರಿಂದ ಹುಲಿಕುಂಟೆ ಗ್ರಾಮೀಣ ರಸ್ತೆ ಅಭಿವೃದ್ಧಿ", gp: "MDR", destGp: "Hulikunte", type: "VR Road", lengthKm: 2.50, budget: "₹112.50 ಲಕ್ಷ", status: "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)" },
  { id: 5, code: "VR25", name: "ಕೂಡ್ಲಿಗಿ ಟೌನ್ ರಿಂದ ಶಿವಪುರ ಹೈವೇ ಲಿಂಕ್ ರಸ್ತೆ", gp: "Kudligi Town", destGp: "Shivapura", type: "VR Road", lengthKm: 5.00, budget: "₹225.00 ಲಕ್ಷ", status: "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)" },
  { id: 6, code: "VR26", name: "SH13 ರಿಂದ ಹೊಸಹಳ್ಳಿ ಗ್ರಾಮ ರಸ್ತೆ ಅಗಲೀಕರಣ", gp: "SH13", destGp: "Hosahalli", type: "VR Road", lengthKm: 1.50, budget: "₹67.50 ಲಕ್ಷ", status: "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)" },
  { id: 7, code: "VR27", name: "SH13 ರಿಂದ ವಿರೂಪಾಪುರ ಗ್ರಾಮ ಸಂಪರ್ಕ ರಸ್ತೆ", gp: "SH13", destGp: "Virupapur", type: "VR Road", lengthKm: 2.00, budget: "₹90.00 ಲಕ್ಷ", status: "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)" },
  { id: 8, code: "VR28", name: "SH13 ರಿಂದ ಕ್ಯಾಸಾಪುರ ಪ್ರಮುಖ ರಸ್ತೆ ಅಭಿವೃದ್ಧಿ", gp: "SH13", destGp: "Kyasapur", type: "VR Road", lengthKm: 2.00, budget: "₹90.00 ಲಕ್ಷ", status: "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)" },
  { id: 9, code: "VR29", name: "SH13 ರಿಂದ ಜಿ.ಬಸಾಪೂರ ಪ್ರಮುಖ ರಸ್ತೆ ಕಾಮಗಾರಿ", gp: "SH13", destGp: "G.Basapur", type: "VR Road", lengthKm: 2.00, budget: "₹90.00 ಲಕ್ಷ", status: "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)" },
  { id: 10, code: "VR30", name: "SH13 ರಿಂದ ಎನ್.ಡಿ.ಹಳ್ಳಿ ರಸ್ತೆ ಸುಧಾರಣೆ", gp: "SH13", destGp: "N.D.Halli", type: "VR Road", lengthKm: 2.00, budget: "₹90.00 ಲಕ್ಷ", status: "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)" },
  { id: 11, code: "VR31", name: "ಕ್ಯಾಸಾಪುರ ರಿಂದ ಜಿ.ಬಸಾಪೂರ ಸಂಪರ್ಕ ರಸ್ತೆ", gp: "Kyasapur", destGp: "G.Basapur", type: "VR Road", lengthKm: 2.00, budget: "₹90.00 ಲಕ್ಷ", status: "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)" },
  { id: 12, code: "VR32", name: "ಕ್ಯಾಸಾಪುರ ರಿಂದ ವಿರೂಪಾಪುರ ರಸ್ತೆ ನವೀಕರಣ", gp: "Kyasapur", destGp: "Virupapur", type: "VR Road", lengthKm: 2.00, budget: "₹90.00 ಲಕ್ಷ", status: "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)" },
  { id: 13, code: "VR33", name: "SH13 ರಿಂದ ಬನವಿಕಲ್ಲು ಗ್ರಾಮ ರಸ್ತೆ ಕಾಮಗಾರಿ", gp: "SH13", destGp: "Banavikallu", type: "VR Road", lengthKm: 2.00, budget: "₹90.00 ಲಕ್ಷ", status: "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)" },
  { id: 14, code: "VR37", name: "ಹಳಸಾಗರ ರಿಂದ ಬೆಳಗಟ್ಟ ಹಳ್ಳಿ ರಸ್ತೆ ನವೀಕರಣ", gp: "Halasagara", destGp: "Belagatta", type: "VR Road", lengthKm: 3.00, budget: "₹135.00 ಲಕ್ಷ", status: "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)" },
  { id: 15, code: "VR131", name: "ಉಜ್ಜಿನಿ ಶ್ರೀ ಧರ್ಮಪೀಠ ಪ್ರಮುಖ ರಸ್ತೆ ಸುಧಾರಣೆ", gp: "Ujjini", destGp: "Hirekumbalgunte", type: "VR Road", lengthKm: 10.00, budget: "₹450.00 ಲಕ್ಷ", status: "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)" },
  { id: 16, code: "VR133", name: "ಚೋರನೂರು ಹೋಬಳಿ ಪ್ರಮುಖ ರಸ್ತೆ ವಿಸ್ತರಣೆ", gp: "Choranur", destGp: "Halasagara", type: "VR Road", lengthKm: 5.00, budget: "₹225.00 ಲಕ್ಷ", status: "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)" },
  { id: 17, code: "VR134", name: "ಕೂಡ್ಲಿಗಿ - ಸಂಡೂರು ಮುಖ್ಯ ರಸ್ತೆಯಿಂದ ಹುರಳಿಹಳ್ಳಿ", gp: "Kudligi Town", destGp: "Huralihalli", type: "VR Road", lengthKm: 5.00, budget: "₹225.00 ಲಕ್ಷ", status: "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)" },
  { id: 18, code: "VR250", name: "ಮೊರಬ ರಿಂದ ವಿರೂಪಾಪುರ ಗ್ರಾಮ ರಸ್ತೆ ನಿರ್ಮಾಣ", gp: "Moraba", destGp: "Virupapur", type: "VR Road", lengthKm: 2.25, budget: "₹101.25 ಲಕ್ಷ", status: "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)" },
  { id: 19, code: "VR499", name: "ಕೂಡ್ಲಿಗಿ ಟೌನ್ ರಿಂದ ಜರಿಮಲೆ ಘಾಟ್ ರಸ್ತೆ ವಿಸ್ತರಣೆ", gp: "Kudligi Town", destGp: "Jarimale", type: "VR Road", lengthKm: 14.00, budget: "₹630.00 ಲಕ್ಷ", status: "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)" },
  { id: 20, code: "VR501", name: "ಕೊಟ್ಟೂರು ಟೌನ್ ರಿಂದ ಹುಚಂಗಿದುರ್ಗ ರಸ್ತೆ ಸುಧಾರಣೆ", gp: "Kottur", destGp: "Huchangidurga", type: "MDR Road", lengthKm: 12.00, budget: "₹540.00 ಲಕ್ಷ", status: "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)" },
  { id: 21, code: "VR505", name: "ಗುಡೆಕೋಟೆ ಕೋಟೆ ಪ್ರದೇಶ ಸಂಪರ್ಕ ರಸ್ತೆ ಅಭಿವೃದ್ಧಿ", gp: "Gudekote", destGp: "Kudligi Town", type: "VR Road", lengthKm: 8.50, budget: "₹382.50 ಲಕ್ಷ", status: "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)" },
  { id: 22, code: "VR510", name: "ಚಿಲಕನಹಟ್ಟಿ ಗ್ರಾಮದಿಂದ ಕೆರೆ ರಸ್ತೆ ನಿರ್ಮಾಣ", gp: "Chilakanahatti", destGp: "Belagatta", type: "VR Road", lengthKm: 4.20, budget: "₹189.00 ಲಕ್ಷ", status: "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)" },
  { id: 23, code: "VR515", name: "ಅಂಬಲಿಗನೂರು ಪಂಚಾಯತಿ ಪ್ರಮುಖ ರಸ್ತೆ ಅಭಿವೃದ್ಧಿ", gp: "Ambaliganur", destGp: "Choranur", type: "VR Road", lengthKm: 6.00, budget: "₹270.00 ಲಕ್ಷ", status: "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (In Progress)" },
  { id: 24, code: "VR520", name: "ಕಾನಮಡುಗು ಗ್ರಾಮ ಸಂಪರ್ಕ ರಸ್ತೆ ಆಸ್ಫಾಲ್ಟಿಂಗ್", gp: "Kanamadugu", destGp: "Hosahalli", type: "VR Road", lengthKm: 3.80, budget: "₹171.00 ಲಕ್ಷ", status: "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)" }
];
