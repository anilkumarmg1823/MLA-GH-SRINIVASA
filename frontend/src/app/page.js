"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  FaUsers, FaHandshake, FaChartLine, FaShieldAlt, FaLaptop, 
  FaFacebookF, FaTwitter, FaYoutube, FaInstagram, FaPhoneAlt, FaEnvelope 
} from "react-icons/fa";

// Translation Dictionary
const t = {
  en: {
    navbarTitle: "DR. N. T. SRINIVAS",
    navHome: "Home",
    navAbout: "About Us",
    navDevelopments: "Developments",
    navMedia: "Media",
    navGallery: "Gallery",
    navGrievance: "Grievances",
    welcome: "WELCOME TO THE OFFICE OF",
    name: "DR. N. T. SRINIVAS",
    office: "MLA KUDLIGI CONSTITUENCY",
    desc: "Dedicated to serving the citizens of Kudligi constituency with integrity, transparency, and progressive development.",
    aboutHeading: "ABOUT DR. N. T. SRINIVAS",
    aboutDesc: "Dr. N. T. Srinivas is a visionary leader and MLA representing the Kudligi constituency. With a deep-rooted commitment to social progress, infrastructure development, and digital governance, he is working continuously to make Kudligi a model constituency. By bridging the gap between governance and citizens, the MLA office has implemented various schemes in water conservation, education, local agriculture support, and healthcare.",
    devHeading: "DEVELOPMENT SECTORS",
    devDesc: "Key developmental focus areas for progress in Kudligi.",
    devSectors: [
      { title: "Women & Child Care", desc: "Supporting maternal health and child welfare programs." },
      { title: "Quality Education", desc: "Upgrading school infrastructure and digital learning resources." },
      { title: "Agriculture & Farmers", desc: "Promoting sustainable groundnut and cotton farming, and irrigation." },
      { title: "Irrigation Projects", desc: "Improving local lakes, borewell recharge systems, and water supply." },
      { title: "Health & Ecology", desc: "Expanding healthcare accessibility and safeguarding Daroji Bear Sanctuary." }
    ],
    mediaHeading: "IN THE MEDIA",
    mediaDesc: "Latest updates and newspaper highlights from Kudligi.",
    galleryHeading: "PHOTO GALLERY",
    galleryDesc: "Glimpses of local programs and public interactions.",
    formHeading: "SUGGESTIONS & COMPLAINTS",
    formSub: "Connect with your MLA. Log your suggestions or grievances directly.",
    formName: "Full Name",
    formPhone: "Mobile / WhatsApp Number",
    formVillage: "Select Panchayat / Village",
    formSubject: "Subject",
    formMessage: "Message / Grievance Details",
    formSubmit: "SUBMIT COMPLAINT",
    formSuccess: "Thank you! Your grievance has been recorded successfully.",
    dcmName: "D.K. Shivakumar",
    dcmTitle: "Chief Minister",
    footerMotto: "CONNECTING CITIZENS THROUGH TRANSPARENT DIGITAL GOVERNANCE",
    footerCopy: "© 2026 Dr. N. T. Srinivas MLA Office Kudligi. All rights reserved.",
    footerDev: "Designed in accordance with Karnataka MLA digital standard guidelines.",
    values: [
      "PEOPLE FIRST",
      "TRANSPARENCY",
      "DEVELOPMENT",
      "ACCOUNTABILITY",
      "DIGITAL GOVERNANCE"
    ],
    places: ["Kudligi Town", "Kottur", "Hosahalli", "Choranur", "Gundumunugu", "Other Villages"],
    cardDesc: [
      "Gandhi ashes memorial library in Kudligi town, a major historic landmark.",
      "Famous historical temple of Saint Kottureshwara situated nearby.",
      "Unique sloth bear sanctuary and rich biodiversity habitat near Kudligi.",
      "Primary agricultural crops supporting local farming families.",
      "Splendid historical stone monuments of the Vijayanagara empire."
    ]
  },
  kn: {
    navbarTitle: "ಡಾ. ಎನ್. ಟಿ. ಶ್ರೀನಿವಾಸ್",
    navHome: "ಹೋಮ್",
    navAbout: "ಕುರಿತು",
    navDevelopments: "ಅಭಿವೃದ್ಧಿಗಳು",
    navMedia: "ಮಾಧ್ಯಮ",
    navGallery: "ಗ್ಯಾಲರಿ",
    navGrievance: "ದೂರುಗಳು",
    welcome: "ಸ್ವಾಗತ",
    name: "ಡಾ. ಎನ್. ಟಿ. ಶ್ರೀನಿವಾಸ್",
    office: "ಶಾಸಕರು - ಕೂಡ್ಲಿಗಿ ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ",
    desc: "ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರದ ನಾಗರಿಕರಿಗೆ ಪ್ರಾಮಾಣಿಕತೆ, ಪಾರದರ್ಶಕತೆ ಮತ್ತು ಪ್ರಗತಿಪರ ಅಭಿವೃದ್ಧಿಯೊಂದಿಗೆ ಸೇವೆ ಸಲ್ಲಿಸಲು ಸಮರ್ಪಿತವಾಗಿದೆ.",
    aboutHeading: "ಡಾ. ಎನ್. ಟಿ. ಶ್ರೀನಿವಾಸ್ ಅವರ ಬಗ್ಗೆ",
    aboutDesc: "ಡಾ. ಎನ್. ಟಿ. ಶ್ರೀನಿವಾಸ್ ಅವರು ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರವನ್ನು ಪ್ರತಿನಿಧಿಸುವ ಜನಪ್ರಿಯ ಶಾಸಕರಾಗಿದ್ದಾರೆ. ಸಾಮಾಜಿಕ ಪ್ರಗತಿ, ಮೂಲಸೌಕರ್ಯ ಅಭಿವೃದ್ಧಿ ಮತ್ತು ಡಿಜಿಟಲ್ ಆಡಳಿತಕ್ಕೆ ಬದ್ಧರಾಗಿರುವ ಇವರು ಕೂಡ್ಲಿಗಿಯನ್ನು ಮಾದರಿ ಕ್ಷೇತ್ರವನ್ನಾಗಿ ಮಾಡಲು ನಿರಂತರವಾಗಿ ಶ್ರಮಿಸುತ್ತಿದ್ದಾರೆ. ಆಡಳಿತ ಮತ್ತು ಸಾರ್ವಜನಿಕರ ನಡುವಿನ ಅಂತರವನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಶಾಸಕರ ಕಚೇರಿಯು ಶಿಕ್ಷಣ, ನೀರಾವರಿ, ಕೃಷಿ ಮತ್ತು ಆರೋಗ್ಯ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಹಲವಾರು ಸುಧಾರಣೆಗಳನ್ನು ಜಾರಿಗೆ ತಂದಿದೆ.",
    devHeading: "ಅಭಿವೃದ್ಧಿ ಯೋಜನೆಗಳು",
    devDesc: "ಕೂಡ್ಲಿಗಿ ತಾಲೂಕಿನ ಸಮಗ್ರ ಪ್ರಗತಿಗಾಗಿ ನಮ್ಮ ಮುಖ್ಯ ಆದ್ಯತೆಯ ಕ್ಷೇತ್ರಗಳು.",
    devSectors: [
      { title: "ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಕಲ್ಯಾಣ", desc: "ತಾಯಿ-ಮಗುವಿನ ಆರೋಗ್ಯ ಸೇವೆಗಳು ಮತ್ತು ಪೌಷ್ಟಿಕ ಆಹಾರ ಯೋಜನೆಗಳು." },
      { title: "ಗುಣಮಟ್ಟದ ಶಿಕ್ಷಣ", desc: "ಸರ್ಕಾರಿ ಶಾಲೆಗಳ ಮೂಲಸೌಕರ್ಯ ಅಭಿವೃದ್ಧಿ ಮತ್ತು ಕಂಪ್ಯೂಟರ್ ಶಿಕ್ಷಣ." },
      { title: "ರೈತರು ಮತ್ತು ಕೃಷಿ", desc: "ಕಡಲೆಕಾಯಿ, ಹತ್ತಿ ಬೆಳೆಗಳ ಪ್ರೋತ್ಸಾಹ ಮತ್ತು ಕೃಷಿ ಮಾರುಕಟ್ಟೆ ಸುಧಾರಣೆ." },
      { title: "ನೀರಾವರಿ ಮತ್ತು ಕೆರೆ ತುಂಬಿಸುವ ಯೋಜನೆ", desc: "ಕೂಡ್ಲಿಗಿ ತಾಲೂಕಿನ ಸ್ಥಳೀಯ ಕೆರೆಗಳ ನೀರಾವರಿ ಮತ್ತು ಕುಡಿಯುವ ನೀರಿನ ಅಭಿವೃದ್ಧಿ." },
      { title: "ಆರೋಗ್ಯ ಮತ್ತು ಪರಿಸರ ಸಂರಕ್ಷಣೆ", desc: "ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳ ಬಲವರ್ಧನೆ ಮತ್ತು ದರೋಜಿ ಕರಡಿ ಸಂರಕ್ಷಣಾ ಧಾಮದ ರಕ್ಷಣೆ." }
    ],
    mediaHeading: "ಪತ್ರಿಕಾ ಮಾಧ್ಯಮದಲ್ಲಿ",
    mediaDesc: "ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರದ ಇತ್ತೀಚಿನ ಸುದ್ದಿಗಳು ಮತ್ತು ಪತ್ರಿಕಾ ವರದಿಗಳು.",
    galleryHeading: "ಚಿತ್ರ ಗ್ಯಾಲರಿ",
    galleryDesc: "ಕ್ಷೇತ್ರದ ಸಾರ್ವಜನಿಕ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಜನಸಂಪರ್ಕ ಸಭೆಗಳ ಚಿತ್ರಗಳು.",
    formHeading: "ದೂರುಗಳು ಮತ್ತು ಸಲಹೆಗಳು",
    formSub: "ನಿಮ್ಮ ಶಾಸಕರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ. ನಿಮ್ಮ ಅಹವಾಲುಗಳನ್ನು ನೇರವಾಗಿ ದಾಖಲಿಸಿ.",
    formName: "ಪೂರ್ಣ ಹೆಸರು",
    formPhone: "ಮೊಬೈಲ್ / ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆ",
    formVillage: "ಪಂಚಾಯತ್ / ಗ್ರಾಮವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    formSubject: "ವಿಷಯ",
    formMessage: "ವಿವರವಾದ ಸಂದೇಶ / ದೂರು ವಿವರಗಳು",
    formSubmit: "ದೂರು ಸಲ್ಲಿಸಿ",
    formSuccess: "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ.",
    dcmName: "ಡಿ.ಕೆ. ಶಿವಕುಮಾರ್",
    dcmTitle: "ಮುಖ್ಯಮಂತ್ರಿ",
    footerMotto: "ಪಾರದರ್ಶಕ ಡಿಜಿಟಲ್ ಆಡಳಿತದ ಮೂಲಕ ನಾಗರಿಕರನ್ನು ತಲುಪುವುದು",
    footerCopy: "© 2026 ಡಾ. ಎನ್. ಟಿ. ಶ್ರೀನಿವಾಸ್ ಶಾಸಕರ ಕಚೇರಿ ಕೂಡ್ಲಿಗಿ. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
    footerDev: "ಕರ್ನಾಟಕ ಶಾಸಕರ ಡಿಜಿಟಲ್ ಮಾರ್ಗಸೂಚಿಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ.",
    values: [
      "ಜನರೇ ಮೊದಲು",
      "ಪಾರದರ್ಶಕತೆ",
      "ಅಭಿವೃದ್ಧಿ",
      "ಹೊಣೆಗಾರಿಕೆ",
      "ಡಿಜಿಟಲ್ ಆಡಳಿತ"
    ],
    places: ["ಕೂಡ್ಲಿಗಿ ಪಟ್ಟಣ", "ಕೊಟ್ಟೂರು", "ಹೊಸಹಳ್ಳಿ", "ಚೋರನೂರು", "ಗುಂಡುಮುಣುಗು", "ಇತರ ಗ್ರಾಮಗಳು"],
    cardDesc: [
      "ಕೂಡ್ಲಿಗಿ ಪಟ್ಟಣದಲ್ಲಿರುವ ಗಾಂಧಿ ಚಿತಾಭಸ್ಮ ಸ್ಮಾರಕ ಗ್ರಂಥಾಲಯ, ಒಂದು ಐತಿಹಾಸಿಕ ತಾಣ.",
      "ಸಮೀಪದ ಪ್ರಸಿದ್ಧ ಐತಿಹಾಸಿಕ ಕೊಟ್ಟೂರೇಶ್ವರ ಮಹಾದೇವಸ್ಥಾನ.",
      "ಏಷ್ಯಾದ ಪ್ರಮುಖ ದರೋಜಿ ಕರಡಿ ಸಂರಕ್ಷಣಾ ಧಾಮ ಮತ್ತು ಜೀವವೈವಿಧ್ಯದ ತಾಣ.",
      "ಸ್ಥಳೀಯ ಕೂಡ್ಲಿಗಿ ಭಾಗದ ರೈತರ ಪ್ರಮುಖ ಕೃಷಿ ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು.",
      "ವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯದ ವೈಭವದ ಐತಿಹಾಸಿಕ ಕಲ್ಲಿನ ಸ್ಮಾರಕಗಳು."
    ]
  }
};


const heroSlides = [
  {
    id: 1,
    image: "/Picsart_24-10-06_16-56-21-680.png",
    titleEn: "FREE HEALTH CLINIC INITIATIVE",
    titleKn: "ಉಚಿತ ಆರೋಗ್ಯ ಚಿಕಿತ್ಸಾಲಯ ಯೋಜನೆ",
    subEn: "MLA's Bold Steps to Support Rural Health Care",
    subKn: "ಬಡವರ ಆರೋಗ್ಯದತ್ತ ಶಾಸಕರ ದಿಟ್ಟ ಹೆಜ್ಜೆ",
    descEn: "Bringing quality medical checkups, free medicines, and diagnostic support to every family in Kudligi.",
    descKn: "ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರದ ಪ್ರತಿ ಮನೆ-ಮನೆಗೂ ಉಚಿತ ಚಿಕಿತ್ಸೆ, ಸಲಹೆ ಮತ್ತು ಉತ್ತಮ ಔಷಧಗಳನ್ನು ತಲುಪಿಸುವ ಗುರಿ.",
    taglineEn: "HEALTH INITIATIVES",
    taglineKn: "ಉಚಿತ ಆರೋಗ್ಯ ಯೋಜನೆ"
  },
  {
    id: 2,
    image: "/Picsart_24-11-21_17-11-01-713 (1).png",
    titleEn: "QUALITY EDUCATION & DIGITAL CLASSROOMS",
    titleKn: "ಗುಣಮಟ್ಟದ ಶಿಕ್ಷಣ ಮತ್ತು ಡಿಜಿಟಲ್ ಶಾಲೆಗಳು",
    subEn: "Upgrading Infrastructure & Promoting Modern Learning",
    subKn: "ಸರ್ಕಾರಿ ಶಾಲೆಗಳ ಆಧುನೀಕರಣ ಮತ್ತು ಕಂಪ್ಯೂಟರ್ ಶಿಕ್ಷಣ",
    descEn: "Empowering students in Kudligi with computer labs, school upgrades, and modern teaching aids.",
    descKn: "ಕೂಡ್ಲಿಗಿ ತಾಲೂಕಿನ ಸರ್ಕಾರಿ ಶಾಲಾ ಮಕ್ಕಳಿಗೆ ಸುಧಾರಿತ ಮೂಲಸೌಕರ್ಯ ಮತ್ತು ಡಿಜಿಟಲ್ ಕಲಿಯುವಿಕೆಯ ಅವಕಾಶ.",
    taglineEn: "EDUCATION REFORMS",
    taglineKn: "ಶಿಕ್ಷಣ ಸುಧಾರಣೆಗಳು"
  },
  {
    id: 3,
    image: "/Picsart_25-02-07_15-07-09-010.png",
    titleEn: "AGRICULTURAL GROWTH & WATER PROJECTS",
    titleKn: "ಕೃಷಿ ಅಭಿವೃದ್ಧಿ ಮತ್ತು ಕೆರೆ ತುಂಬಿಸುವ ಯೋಜನೆ",
    subEn: "Supporting Farmers and Lakes Rejuvenation",
    subKn: "ರೈತರಿಗೆ ಪ್ರೋತ್ಸಾಹ ಮತ್ತು ಕೆರೆಗಳ ಪುನಶ್ಚೇತನ",
    descEn: "Expanding irrigation projects and providing modern resources to the farming community in Kudligi.",
    descKn: "ಸ್ಥಳೀಯ ಕೆರೆಗಳಿಗೆ ನೀರು ತುಂಬಿಸುವ ಮೂಲಕ ಅಂತರ್ಜಲ ವೃದ್ಧಿ ಮತ್ತು ರೈತರಿಗೆ ಸಕಾಲಿಕ ನೆರವು.",
    taglineEn: "FARMERS FIRST",
    taglineKn: "ರೈತ ಮಿತ್ರ ಯೋಜನೆ"
  },
  {
    id: 4,
    image: "/Picsart_25-05-30_00-27-50-672.png",
    titleEn: "INFRASTRUCTURE & COMMUNITY CONNECT",
    titleKn: "ಮೂಲಸೌಕರ್ಯ ಮತ್ತು ಜನಸಂಪರ್ಕ ಅಭಿವೃದ್ಧಿ",
    subEn: "Building Road Networks and Public Grievance Portals",
    subKn: "ಗ್ರಾಮೀಣ ರಸ್ತೆಗಳ ಸುಧಾರಣೆ ಮತ್ತು ಸುಗಮ ಜನಸಂಪರ್ಕ",
    descEn: "Ensuring transparent governance and rapid connectivity upgrades across all village sectors.",
    descKn: "ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸುಲಭ ಹಾಗೂ ಪಾರದರ್ಶಕ ಡಿಜಿಟಲ್ ಜನಸಂಪರ್ಕ ಮತ್ತು ರಸ್ತೆಗಳ ಅಭಿವೃದ್ಧಿ.",
    taglineEn: "PUBLIC CONNECT",
    taglineKn: "ಪಾರದರ್ಶಕ ಜನಸಂಪರ್ಕ"
  }
];

const galleryItems = [
  {
    title: "National Heritage Monument",
    kannada: "ರಾಷ್ಟ್ರೀಯ ಪ್ರತಾತ್ಮ ಸ್ಮಾರಕ",
    image: "/gallery_monument_gate.png",
    desc: "ಕೂಡ್ಲಿಗಿ ಪಟ್ಟಣದಲ್ಲಿರುವ ರಾಷ್ಟ್ರೀಯ ಪ್ರತಾತ್ಮ ಸ್ಮಾರಕ — ಐತಿಹಾಸಿಕ ಮಹತ್ವದ ಪ್ರವಾಸಿ ತಾಣ.",
    descEn: "The National Heritage Monument in Kudligi town — a significant historical landmark.",
  },
  {
    title: "Sri Kottureshwara Temple",
    kannada: "ಶ್ರೀ ಕೊಟ್ಟೂರೇಶ್ವರ ಮಹಾದೇವಸ್ಥಾನ",
    image: "/gallery_temple.png",
    desc: "ಕೊಟ್ಟೂರಿನ ಪ್ರಸಿದ್ಧ ಶ್ರೀ ಕೊಟ್ಟೂರೇಶ್ವರ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನ — ಧಾರ್ಮಿಕ ಪ್ರವಾಸಿ ಕೇಂದ್ರ.",
    descEn: "The famous Sri Kottureshwara Swami temple in Kottur — a revered religious landmark.",
  },
  {
    title: "Daroji Bear Sanctuary",
    kannada: "ದರೋಜಿ ಕರಡಿ ಸಂರಕ್ಷಣಾ ಧಾಮ",
    image: "/gallery_daroji.png",
    desc: "ಏಷ್ಯಾದ ಅತಿ ದೊಡ್ಡ ದರೋಜಿ ಕರಡಿ ಸಂರಕ್ಷಣಾ ಧಾಮ — ಜೀವವೈವಿಧ್ಯ ಸಂರಕ್ಷಣೆಯ ತಾಣ.",
    descEn: "Daroji Sloth Bear Sanctuary — Asia's largest bear sanctuary and biodiversity haven.",
  },
];

export default function Home() {
  const [lang, setLang] = useState("kn"); // Default to Kannada
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const currentText = t[lang];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen w-full bg-[#1e2223] text-white flex flex-col justify-between font-sans relative selection:bg-[#367AF1] selection:text-white">
      
      {/* 1. FLOATING SOCIAL SIDEBAR (Right Margin) */}
      <div className="fixed right-0 top-[40%] -translate-y-1/2 z-40 hidden xl:flex flex-col bg-[#282c2d] border-y border-l border-[#CCBCA5]/30 rounded-l-md shadow-xl">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-3 text-white hover:text-[#367AF1] transition-colors border-b border-[#CCBCA5]/10">
          <FaFacebookF className="w-5 h-5" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-3 text-white hover:text-[#367AF1] transition-colors border-b border-[#CCBCA5]/10">
          <FaInstagram className="w-5 h-5" />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-3 text-white hover:text-[#367AF1] transition-colors border-b border-[#CCBCA5]/10">
          <FaYoutube className="w-5 h-5" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-3 text-white hover:text-[#367AF1] transition-colors">
          <FaTwitter className="w-5 h-5" />
        </a>
      </div>

      {/* 2. FLOATING GRIEVANCES VERTICAL TAB (Right Margin, sitting below the social sidebar) */}
      <button 
        onClick={() => handleScroll("grievance-form")}
        className="fixed right-0 top-[60%] -translate-y-1/2 z-40 bg-[#367AF1] hover:bg-[#367AF1]/90 text-white font-extrabold px-4 py-2 text-xs sm:text-sm rounded-l-md shadow-2xl transition-all duration-300 transform origin-right rotate-270 translate-x-[40%] translate-y-[100%] hover:translate-x-0 hidden xl:block"
        style={{ transformOrigin: "right bottom" }}
      >
        {currentText.navGrievance} / ಸಲಹೆಗಳು
      </button>

      {/* Raw CSS Injection for Scrolling Wave and Background Float Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes waveMove {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, -45px) scale(1.18); }
        }
        @keyframes heroWave1 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes heroWave2 {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes heroWave3 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-wave-1 {
          animation: waveMove 12s linear infinite;
        }
        .animate-wave-2 {
          animation: waveMove 18s linear infinite;
        }
        .animate-wave-3 {
          animation: waveMove 26s linear infinite;
        }
        .rotate-270 {
          transform: rotate(-90deg);
        }
      `}} />

      {/* Sticky Top Header */}
      <header className="sticky top-0 z-50 bg-[#282c2d]/95 border-b-2 border-[#CCBCA5] shadow-lg backdrop-blur-md">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          
          {/* Logo Brand Header - Side-by-Side State Seal and Party Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Government State Seal (Hidden on mobile for responsiveness) */}
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 hidden md:block filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
              <Image
                src="/karnataka_logo.png"
                alt="Government of Karnataka Seal"
                fill
                sizes="(max-width: 640px) 36px, 44px"
                className="object-contain"
                priority
              />
            </div>
            
            {/* Congress Party Logo */}
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
              <Image
                src="/party_logo_v2.png"
                alt="Indian National Congress Hand Logo"
                fill
                sizes="(max-width: 640px) 36px, 44px"
                className="object-contain"
                priority
              />
            </div>

            <div className="flex flex-col text-left">
              <span className="font-black text-xs sm:text-base tracking-wider uppercase text-white leading-tight">
                {currentText.navbarTitle}
              </span>
              <span className="text-[#CCBCA5] text-[8px] sm:text-[10px] font-black uppercase tracking-widest mt-0.5">
                Nimmondige | ನಿಮ್ಮೊಂದಿಗೆ
              </span>
            </div>
          </div>

          {/* Navigation Items (Changed to xl:flex to avoid overlapping on md/lg screens) */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-black tracking-wide shrink-0">
            <button onClick={() => handleScroll("home")} className="text-[#CCBCA5] hover:text-[#367AF1] transition-colors">{currentText.navHome}</button>
            <button onClick={() => handleScroll("about")} className="text-white/80 hover:text-[#367AF1] transition-colors">{currentText.navAbout}</button>
            <button onClick={() => handleScroll("developments")} className="text-white/80 hover:text-[#367AF1] transition-colors">{currentText.navDevelopments}</button>
            <button onClick={() => handleScroll("media")} className="text-white/80 hover:text-[#367AF1] transition-colors">{currentText.navMedia}</button>
            <button onClick={() => handleScroll("gallery")} className="text-white/80 hover:text-[#367AF1] transition-colors">{currentText.navGallery}</button>
            <button onClick={() => handleScroll("grievance-form")} className="text-white/80 hover:text-[#367AF1] transition-colors">{currentText.navGrievance}</button>
          </nav>

          {/* Header Action Badges, Language Selector & Login Button */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-[#1e2223]/80 p-1 rounded-full border border-white/20 h-fit">
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-black rounded-full transition-all duration-300 ${
                  lang === "en" 
                    ? "bg-[#367AF1] text-white shadow-md" 
                    : "text-white/60 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("kn")}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-black rounded-full transition-all duration-300 ${
                  lang === "kn" 
                    ? "bg-[#367AF1] text-white shadow-md" 
                    : "text-white/60 hover:text-white"
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            {/* D.K. Shivakumar Chief Minister Badge (Hidden on mobile to save space) */}
            <div className="hidden md:flex items-center gap-2 bg-[#1e2223] px-3 py-1 rounded-full border border-[#CCBCA5]/40 shadow-sm h-fit">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#CCBCA5] bg-white shrink-0">
                <Image
                  src="/cm_photo.png"
                  alt="D.K. Shivakumar"
                  fill
                  sizes="32px"
                  className="object-cover object-top"
                />
              </div>
              <div className="flex flex-col text-left justify-center">
                <span className="text-white font-extrabold text-[10px] leading-tight tracking-wide">
                  {currentText.dcmName}
                </span>
                <span className="text-[#CCBCA5] font-extrabold text-[8px] tracking-wide leading-normal">
                  {currentText.dcmTitle}
                </span>
              </div>
            </div>

            {/* Login Button */}
            <button 
              onClick={() => alert(lang === "kn" ? "ಲಾಗಿನ್ ಪೋರ್ಟಲ್ ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ!" : "Login Portal coming soon!")}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs md:text-sm font-black text-[#CCBCA5] border-2 border-[#CCBCA5] rounded-full hover:bg-[#CCBCA5] hover:text-[#1e2223] transition-all duration-300 shadow-md whitespace-nowrap"
            >
              {lang === "kn" ? "ಲಾಗಿನ್" : "LOGIN"}
            </button>

          </div>
        </div>
      </header>

      {/* 3. HERO BANNER AREA (Full-Cover Animated Carousel) */}
      <section id="home" className="relative w-full overflow-hidden flex flex-col justify-center border-t border-b border-[#CCBCA5]/20 min-h-[520px] lg:h-[660px] bg-[#1e2223]">
        

        {/* BACKGROUND LAYER 1: Boosted opacity spotlights & rays */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">

          {/* Strong radial gold spotlight behind MLA photo position */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 60% 75% at 78% 55%, rgba(204,188,165,0.32) 0%, rgba(54,122,241,0.15) 45%, transparent 72%)"
          }} />

          {/* Strong blue ambient glow top-left */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 50% 55% at 5% 15%, rgba(54,122,241,0.28) 0%, transparent 65%)"
          }} />

          {/* Extra gold center glow */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 30% 40% at 45% 50%, rgba(204,188,165,0.12) 0%, transparent 60%)"
          }} />

          {/* Diagonal cross-hatch line texture */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.12,
            backgroundImage: [
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 40px)",
              "repeating-linear-gradient(-45deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 40px)"
            ].join(", ")
          }} />

        </div>

        {/* ANIMATED WAVE LAYERS at the bottom of hero section */}
        <div className="absolute bottom-0 left-0 right-0 z-[2] pointer-events-none overflow-hidden" style={{ height: "220px" }}>

          {/* Wave 1 - slowest, gold, tallest */}
          <div style={{ position: "absolute", bottom: 0, left: 0, width: "200%", height: "100%", animation: "heroWave1 18s linear infinite" }}>
            <svg viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
              <path d="M0,120 C180,180 360,60 540,110 C720,160 900,40 1080,100 C1260,160 1350,80 1440,120 L1440,220 L0,220 Z" fill="rgba(204,188,165,0.08)" />
            </svg>
          </div>
          <div style={{ position: "absolute", bottom: 0, left: "-100%", width: "200%", height: "100%", animation: "heroWave1 18s linear infinite" }}>
            <svg viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
              <path d="M0,120 C180,180 360,60 540,110 C720,160 900,40 1080,100 C1260,160 1350,80 1440,120 L1440,220 L0,220 Z" fill="rgba(204,188,165,0.08)" />
            </svg>
          </div>

          {/* Wave 2 - medium speed, blue */}
          <div style={{ position: "absolute", bottom: 0, left: 0, width: "200%", height: "80%", animation: "heroWave2 12s linear infinite" }}>
            <svg viewBox="0 0 1440 180" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
              <path d="M0,80 C200,140 400,20 600,80 C800,140 1000,30 1200,90 C1320,130 1380,60 1440,80 L1440,180 L0,180 Z" fill="rgba(54,122,241,0.10)" />
            </svg>
          </div>
          <div style={{ position: "absolute", bottom: 0, left: "-100%", width: "200%", height: "80%", animation: "heroWave2 12s linear infinite" }}>
            <svg viewBox="0 0 1440 180" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
              <path d="M0,80 C200,140 400,20 600,80 C800,140 1000,30 1200,90 C1320,130 1380,60 1440,80 L1440,180 L0,180 Z" fill="rgba(54,122,241,0.10)" />
            </svg>
          </div>

          {/* Wave 3 - fastest, bright gold outline edge */}
          <div style={{ position: "absolute", bottom: 0, left: 0, width: "200%", height: "55%", animation: "heroWave3 8s linear infinite" }}>
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
              <path d="M0,50 C240,100 480,10 720,55 C960,100 1200,20 1440,50 L1440,120 L0,120 Z" fill="rgba(204,188,165,0.14)" />
            </svg>
          </div>
          <div style={{ position: "absolute", bottom: 0, left: "-100%", width: "200%", height: "55%", animation: "heroWave3 8s linear infinite" }}>
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
              <path d="M0,50 C240,100 480,10 720,55 C960,100 1200,20 1440,50 L1440,120 L0,120 Z" fill="rgba(204,188,165,0.14)" />
            </svg>
          </div>

        </div>

        {/* Semi-transparent Dark Overlay on the left for text readability */}
        <div className="absolute inset-0 z-[3]" style={{ background: "linear-gradient(to right, rgba(30,34,35,0.85) 0%, rgba(30,34,35,0.60) 45%, rgba(30,34,35,0.10) 100%)" }} />

        {/* Hero Content grid container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-10 lg:py-0">
          
          {/* Left Column: Action details & titles */}
          <div className="lg:col-span-7 flex flex-col gap-5 text-left items-start justify-center">
            
            {/* Tagline Badge */}
            <motion.div 
              key={`tag-${currentSlide}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-[#CCBCA5]/20 border border-[#CCBCA5]/40 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-[#CCBCA5] backdrop-blur-md"
            >
              {lang === "kn" ? heroSlides[currentSlide].taglineKn : heroSlides[currentSlide].taglineEn}
            </motion.div>

            {/* MLA Name Badge */}
            <motion.div 
              key={`name-${currentSlide}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#CCBCA5] text-xs font-black tracking-widest uppercase flex items-center gap-3"
            >
              <span className="h-[2px] w-5 bg-[#CCBCA5]" />
              {currentText.name}
              <span className="h-[2px] w-5 bg-[#CCBCA5]" />
            </motion.div>

            {/* Initiative Main Title */}
            <motion.h1 
              key={`title-${currentSlide}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
              className="text-2xl sm:text-4xl lg:text-5.5xl font-black tracking-tight text-white leading-tight max-w-2xl font-sans"
            >
              {lang === "kn" ? heroSlides[currentSlide].titleKn : heroSlides[currentSlide].titleEn}
            </motion.h1>

            {/* Subtitle */}
            <motion.h3 
              key={`sub-${currentSlide}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#CCBCA5] font-extrabold text-sm sm:text-base lg:text-lg tracking-wide leading-tight max-w-xl"
            >
              {lang === "kn" ? heroSlides[currentSlide].subKn : heroSlides[currentSlide].subEn}
            </motion.h3>

            {/* Detailed Description */}
            <motion.p 
              key={`desc-${currentSlide}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/80 text-xs sm:text-sm leading-relaxed font-sans max-w-xl text-justify"
            >
              {lang === "kn" ? heroSlides[currentSlide].descKn : heroSlides[currentSlide].descEn}
            </motion.p>

            {/* Read More button */}
            <motion.button 
              key={`btn-${currentSlide}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => handleScroll("about")}
              className="bg-[#367AF1] hover:bg-[#367AF1]/90 text-white font-extrabold text-xs sm:text-sm py-3 px-6 rounded-full shadow-lg transition-colors tracking-widest mt-1.5 uppercase"
            >
              {lang === "kn" ? "ಹೆಚ್ಚಿನ ಮಾಹಿತಿ" : "READ MORE"}
            </motion.button>

          </div>

          {/* Right Column: Bigger uncropped portrait */}
          <motion.div 
            key={`img-${currentSlide}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 h-[320px] sm:h-[440px] lg:h-[600px] w-full relative flex items-end justify-center lg:justify-end"
          >
            <div className="relative w-full h-full max-w-[280px] sm:max-w-[340px] lg:max-w-none">
              <Image
                src={heroSlides[currentSlide].image}
                alt={lang === "kn" ? heroSlides[currentSlide].titleKn : heroSlides[currentSlide].titleEn}
                fill
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 340px, 500px"
                className="object-contain object-center lg:object-right"
                priority
              />
            </div>
          </motion.div>

        </div>

        {/* Carousel Navigation Arrows */}
        <button 
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 border border-white/20 hover:bg-[#367AF1] text-white flex items-center justify-center transition-colors shadow-lg text-lg"
        >
          ❮
        </button>
        <button 
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 border border-white/20 hover:bg-[#367AF1] text-white flex items-center justify-center transition-colors shadow-lg text-lg"
        >
          ❯
        </button>

        {/* Indicator dots — z-40 so they float above the wave layer */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? "bg-[#367AF1] w-6" : "bg-white/40 hover:bg-white w-2.5"
              }`}
            />
          ))}
        </div>

      </section>

      {/* 4. ABOUT SECTION — Compact, rich with stats */}
      <section id="about" className="relative bg-[#282c2d] py-8 sm:py-10 border-b border-[#CCBCA5]/20 overflow-hidden">

        {/* Vidhana Soudha low-opacity background */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <Image
            src="/vidhana_soudha_bg.png"
            alt="Vidhana Soudha background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            style={{ opacity: 0.08 }}
          />
          {/* Extra dark vignette so text stays readable */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(40,44,45,0.7) 100%)" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center py-8 sm:py-10">
          
          {/* Photo on Left */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="p-1 rounded-[20px] bg-[#CCBCA5] shadow-2xl w-full max-w-[260px] lg:max-w-none">
              <div className="relative overflow-hidden rounded-[16px] border-4 border-[#1e2223] bg-[#1e2223] aspect-[3/4]">
                <Image 
                  src="/Picsart_26-02-05_14-31-10-288 (1).png"
                  alt="Dr. N. T. Srinivas"
                  fill
                  sizes="(max-width: 1024px) 260px, 340px"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* Right: Heading + stats + description */}
          <div className="lg:col-span-8 flex flex-col gap-4 text-center lg:text-left items-center lg:items-start">
            
            {/* Constituency badge */}
            <span className="inline-flex items-center gap-2 bg-[#367AF1]/15 border border-[#367AF1]/40 text-[#CCBCA5] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              ✦ {lang === "kn" ? "ಕೂಡ್ಲಿಗಿ ಶಾಸನ ಸಭಾ ಕ್ಷೇತ್ರ" : "Kudligi Legislative Constituency"}
            </span>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wide text-[#CCBCA5]">
              {currentText.aboutHeading}
            </h2>
            <div className="w-12 h-1 bg-[#367AF1] rounded-full" />

            <p className="text-white/80 text-sm leading-relaxed text-justify font-sans max-w-2xl">
              {currentText.aboutDesc}
            </p>

          {/* Stats row — animated on scroll */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-1">
              {[
                { num: "2023", label: lang === "kn" ? "ಆಯ್ಕೆ ವರ್ಷ" : "Elected Year" },
                { num: "160+", label: lang === "kn" ? "ಗ್ರಾಮ ಸಂಪರ್ಕ" : "Villages Connected" },
                { num: "50+", label: lang === "kn" ? "ಯೋಜನೆಗಳು" : "Initiatives" },
                { num: "1 L+", label: lang === "kn" ? "ಫಲಾನುಭವಿಗಳು" : "Beneficiaries" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex flex-col items-center lg:items-start bg-[#1e2223]/60 border border-[#CCBCA5]/20 rounded-xl px-3 py-2.5 gap-0.5"
                >
                  <span className="text-xl sm:text-2xl font-black text-[#367AF1]">{s.num}</span>
                  <span className="text-white/60 text-[10px] font-semibold uppercase tracking-wide leading-tight">{s.label}</span>
                </motion.div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* 5. DEVELOPMENTS FOCUS SECTOR CARDS (ಅಭಿವೃದ್ಧಿಗಳು) */}
      <section id="developments" className="bg-[#1e2223] py-12 border-b border-[#CCBCA5]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-[#CCBCA5] drop-shadow-md">
              {currentText.devHeading}
            </h2>
            <p className="text-white/70 text-xs sm:text-sm mt-2">{currentText.devDesc}</p>
            <div className="w-16 h-1 bg-[#367AF1] mx-auto mt-2 rounded-full" />
          </div>

          {/* Developments Grid — each card has one themed image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {currentText.devSectors.map((sec, index) => {
              const sectorImages = [
                "/sector_women_children.png",   // Women & Children
                "/sector_education.png",         // Education
                "/sector_agriculture.png",       // Agriculture
                "/sector_irrigation.png",        // Irrigation & Lakes
                "/sector_environment.png",       // Health & Environment
              ];
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -6 }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="group relative flex flex-col rounded-2xl bg-[#282c2d] border-2 border-[#CCBCA5]/20 hover:border-[#CCBCA5]/60 transition-all duration-300 shadow-lg overflow-hidden"
                >
                  {/* Card image at top — taller for more impact */}
                  <div className="relative w-full h-[200px] overflow-hidden shrink-0">
                    <Image
                      src={sectorImages[index]}
                      alt={sec.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Gradient fade from image into card body */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#282c2d]" />
                    {/* Sector number badge */}
                    <span className="absolute top-2 left-3 text-[#CCBCA5] text-[10px] font-black uppercase tracking-widest bg-[#1e2223]/70 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Card text body */}
                  <div className="flex flex-col gap-2 p-4 pt-2">
                    <h3 className="text-white font-extrabold text-sm group-hover:text-[#367AF1] transition-colors leading-tight">
                      {sec.title}
                    </h3>
                    <p className="text-white/65 text-[11px] leading-relaxed font-sans">
                      {sec.desc}
                    </p>
                  </div>
                  
                  {/* Hover indicator bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#367AF1] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. MEDIA GALLERY (ಮಾಧ್ಯಮ - Newspaper Highlights) */}
      <section id="media" className="bg-[#282c2d] py-16 border-b border-[#CCBCA5]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
          
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-[#CCBCA5] drop-shadow-md">
              {currentText.mediaHeading}
            </h2>
            <p className="text-white/70 text-xs sm:text-sm mt-2">{currentText.mediaDesc}</p>
            <div className="w-16 h-1 bg-[#367AF1] mx-auto mt-2 rounded-full" />
          </div>

          {/* Newspaper Snippets Row — using actual newspaper image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: lang === "kn" ? "ಗಡಿ ಕನ್ನಡಿಗ" : "Gadi Kannadiga",
                headline: lang === "kn"
                  ? "ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಾಸಕ ಡಾ. ಎನ್.ಟಿ. ಶ್ರೀನಿವಾಸ ಅವರ ಅಭಿವೃದ್ಧಿ ಕಾರ್ಯಗಳಿಗೆ ಭಾರಿ ಮೆಚ್ಚುಗೆ"
                  : "MLA Dr. N.T. Srinivas's development works receive wide appreciation in Kudligi",
                date: "May 2024",
              },
              {
                label: lang === "kn" ? "ವಿಜಯ ಕರ್ನಾಟಕ" : "Vijaya Karnataka",
                headline: lang === "kn"
                  ? "ಕೂಡ್ಲಿಗಿ ತಾಲ್ಲೂಕಿನಲ್ಲಿ ನೂತನ ಶಾಲಾ ಕಟ್ಟಡ ಉದ್ಘಾಟನೆ — ಶ್ರೀನಿವಾಸ ಅವರ ಶ್ರಮ ಫಲ"
                  : "New school building inaugurated in Kudligi — MLA's efforts bear fruit",
                date: "Feb 2024",
              },
              {
                label: lang === "kn" ? "ಪ್ರಜಾವಾಣಿ" : "Prajavani",
                headline: lang === "kn"
                  ? "ರೈತರ ಮನೆ ಬಾಗಿಲಿಗೆ ಯೋಜನೆ: ಡಾ. ಶ್ರೀನಿವಾಸ ಮತ್ತೊಂದು ಮೈಲಿಗಲ್ಲು"
                  : "Scheme at farmers' doorstep: Dr. Srinivas marks another milestone",
                date: "Jan 2024",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="relative overflow-hidden rounded-2xl border-2 border-[#CCBCA5]/20 bg-[#1e2223] group shadow-lg hover:border-[#CCBCA5]/50 transition-all duration-300"
              >
                {/* Newspaper Image */}
                <div className="relative w-full h-[220px] overflow-hidden">
                  <Image
                    src="/news_media_card.png"
                    alt={item.label}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Dark gradient over image bottom */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#1e2223]" />
                  {/* Source badge top-left */}
                  <span className="absolute top-3 left-3 bg-[#367AF1] text-white text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase">
                    {item.label}
                  </span>
                  <span className="absolute top-3 right-3 bg-black/60 text-white/70 text-[10px] font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                    {item.date}
                  </span>
                </div>

                {/* Card text */}
                <div className="p-4 pt-3 flex flex-col gap-2">
                  <h4 className="text-white font-extrabold text-sm leading-snug group-hover:text-[#CCBCA5] transition-colors">
                    {item.headline}
                  </h4>
                  <span className="text-[#367AF1] text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    → {lang === "kn" ? "ಪೂರ್ಣ ವರದಿ ಓದಿ" : "Read Full Report"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. GALLERY SECTION — Alternating image + content layout */}
      <section id="gallery" className="bg-[#1e2223] py-12 border-b border-[#CCBCA5]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-[#CCBCA5] drop-shadow-md">
              {currentText.galleryHeading}
            </h2>
            <p className="text-white/70 text-xs sm:text-sm mt-2">{currentText.galleryDesc}</p>
            <div className="w-16 h-1 bg-[#367AF1] mx-auto mt-2 rounded-full" />
          </div>

          {/* Alternating rows */}
          <div className="flex flex-col gap-8">
            {galleryItems.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex flex-col lg:flex-row ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  } gap-0 rounded-2xl overflow-hidden border border-[#CCBCA5]/20 bg-[#282c2d] shadow-xl group`}
                >
                  {/* Image side */}
                  <div className="relative w-full lg:w-1/2 h-[280px] lg:h-[340px] overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Subtle side gradient for blending */}
                    <div className={`absolute inset-0 ${
                      isEven
                        ? "bg-gradient-to-r from-transparent to-[#282c2d]/60"
                        : "bg-gradient-to-l from-transparent to-[#282c2d]/60"
                    }`} />
                    {/* Index badge */}
                    <span className="absolute top-3 left-3 bg-[#1e2223]/70 text-[#CCBCA5] text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-sm">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Content side */}
                  <div className="w-full lg:w-1/2 flex flex-col justify-center gap-4 px-6 py-8 lg:px-10">
                    <span className="text-[#367AF1] text-[10px] font-black uppercase tracking-widest">
                      ✦ {lang === "kn" ? "ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರ" : "Kudligi Constituency"}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#CCBCA5] leading-tight">
                      {lang === "kn" ? item.kannada : item.title}
                    </h3>
                    <div className="w-10 h-1 bg-[#367AF1] rounded-full" />
                    <p className="text-white/75 text-sm leading-relaxed font-sans">
                      {lang === "kn" ? item.desc : item.descEn}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Kudligi Farmers Feature Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row-reverse gap-0 rounded-2xl overflow-hidden border border-[#CCBCA5]/20 bg-[#282c2d] shadow-xl group"
          >
            {/* Farmers image */}
            <div className="relative w-full lg:w-1/2 h-[280px] lg:h-[340px] overflow-hidden shrink-0">
              <Image
                src="/gallery_farmers.png"
                alt="Kudligi Farmers"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#282c2d]/60" />
            </div>
            {/* Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center gap-4 px-6 py-8 lg:px-10">
              <span className="text-[#367AF1] text-[10px] font-black uppercase tracking-widest">
                ✦ {lang === "kn" ? "ಕೃಷಿ ಮತ್ತು ರೈತ" : "Agriculture & Farmers"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#CCBCA5] leading-tight">
                {lang === "kn" ? "ಕೂಡ್ಲಿಗಿ ರೈತರ ಪ್ರಮುಖ ಬೆಳೆಗಳು" : "Kudligi's Agricultural Crops"}
              </h3>
              <div className="w-10 h-1 bg-[#367AF1] rounded-full" />
              <p className="text-white/75 text-sm leading-relaxed font-sans">
                {lang === "kn"
                  ? "ಸ್ಥಳೀಯ ಕೂಡ್ಲಿಗಿ ಭಾಗದ ರೈತರ ಪ್ರಮುಖ ಕೃಷಿ ವಾಣಿಜ್ಯ ಬೆಳೆಗಳಾದ ಕಡಲೆಕಾಯಿ, ಹತ್ತಿ ಮತ್ತು ಮೆಣಸಿನಕಾಯಿ ಬೇಸಾಯ ಮಾಡಲಾಗುತ್ತದೆ. ಶಾಸಕ ಡಾ. ಶ್ರೀನಿವಾಸ ಅವರು ರೈತರಿಗೆ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಸೌಲಭ್ಯ ತಲುಪಿಸಲು ಶ್ರಮಿಸುತ್ತಿದ್ದಾರೆ."
                  : "The Kudligi region is known for its commercial crops including groundnut, cotton, and chilli. MLA Dr. Srinivas actively works to ensure government agricultural schemes reach every farmer in the constituency."}
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 8. COMPLAINTS & SUGGESTIONS INPUT FORM (ದೂರುಗಳು) */}
      <section id="grievance-form" className="bg-[#282c2d] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-[#CCBCA5] drop-shadow-md">
              {currentText.formHeading}
            </h2>
            <p className="text-white/70 text-xs sm:text-sm mt-1">{currentText.formSub}</p>
            <div className="w-16 h-1 bg-[#367AF1] mx-auto mt-2 rounded-full" />
          </motion.div>

          {/* Form Card Grid */}
          <div className="bg-[#1e2223] rounded-2xl border-2 border-[#CCBCA5]/30 p-6 sm:p-10 shadow-2xl">
            {formSubmitted ? (
              <div className="text-center py-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#367AF1] text-white flex items-center justify-center text-3xl font-black shadow-lg">
                  ✓
                </div>
                <span className="text-white font-black text-lg mt-2">
                  {currentText.formSuccess}
                </span>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
                
                {/* Row 1: Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[#CCBCA5] text-xs font-black uppercase tracking-wider">
                      {currentText.formName} *
                    </label>
                    <input 
                      type="text" 
                      required 
                      className="bg-[#282c2d] border border-white/20 rounded-md p-3 text-white text-sm focus:border-[#367AF1] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[#CCBCA5] text-xs font-black uppercase tracking-wider">
                      {currentText.formPhone} *
                    </label>
                    <input 
                      type="tel" 
                      required 
                      className="bg-[#282c2d] border border-white/20 rounded-md p-3 text-white text-sm focus:border-[#367AF1] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Row 2: Dropdown selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#CCBCA5] text-xs font-black uppercase tracking-wider">
                    {currentText.formVillage} *
                  </label>
                  <select 
                    required 
                    className="bg-[#282c2d] border border-white/20 rounded-md p-3 text-white text-sm focus:border-[#367AF1] focus:outline-none transition-colors"
                  >
                    <option value="">-- Select Village --</option>
                    {currentText.places.map((place, i) => (
                      <option key={i} value={place}>{place}</option>
                    ))}
                  </select>
                </div>

                {/* Row 3: Subject */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#CCBCA5] text-xs font-black uppercase tracking-wider">
                    {currentText.formSubject}
                  </label>
                  <input 
                    type="text" 
                    className="bg-[#282c2d] border border-white/20 rounded-md p-3 text-white text-sm focus:border-[#367AF1] focus:outline-none transition-colors"
                  />
                </div>

                {/* Row 4: Message */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#CCBCA5] text-xs font-black uppercase tracking-wider">
                    {currentText.formMessage} *
                  </label>
                  <textarea 
                    rows={4} 
                    required 
                    className="bg-[#282c2d] border border-white/20 rounded-md p-3 text-white text-sm focus:border-[#367AF1] focus:outline-none transition-colors resize-none font-sans"
                  />
                </div>

                {/* Submit button */}
                <button 
                  type="submit" 
                  className="bg-[#367AF1] hover:bg-[#367AF1]/95 text-white font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-md shadow-lg transition-colors tracking-widest mt-2 uppercase"
                >
                  {currentText.formSubmit}
                </button>

              </form>
            )}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-[#0f1314] border-t-2 border-[#CCBCA5]/50 relative z-10">

        {/* Top footer bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-start">

          {/* LEFT: MLA circular badge + tagline */}
          <div className="flex flex-col items-center md:items-start gap-4">
            {/* Circular badge — orbit text effect using SVG */}
            <div className="relative w-[160px] h-[160px] shrink-0">
              {/* Orbit ring */}
              <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "18s" }}>
                <defs>
                  <path id="orbitPath" d="M80,80 m-64,0 a64,64 0 1,1 128,0 a64,64 0 1,1 -128,0" />
                </defs>
                <text fill="#CCBCA5" fontSize="8.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="2.5">
                  <textPath href="#orbitPath" startOffset="0%">
                    ✦ ಕೂಡ್ಲಿಗಿ ವಿಧಾನಸಭಾ ✦ ಅಭಿವೃದ್ಧಿ ಮತ್ತು ಬದಲಾವಣೆ ✦ ನಿಮ್ಮೊಂದಿಗೆ
                  </textPath>
                </text>
              </svg>
              {/* Inner circle photo */}
              <div className="absolute inset-[16px] rounded-full overflow-hidden border-4 border-[#CCBCA5] shadow-2xl bg-[#282c2d]">
                <Image
                  src="/Picsart_26-02-05_14-31-10-288 (1).png"
                  alt="Dr. N. T. Srinivas"
                  fill
                  sizes="128px"
                  className="object-cover object-top"
                />
              </div>
            </div>

            <div className="text-center md:text-left">
              <p className="text-[#CCBCA5] font-black text-sm tracking-widest uppercase">
                {lang === "kn" ? "ಡಾ. ಎನ್. ಟಿ. ಶ್ರೀನಿವಾಸ್" : "Dr. N. T. Srinivas"}
              </p>
              <p className="text-white/50 text-[11px] mt-0.5">
                {lang === "kn" ? "ಶಾಸಕರು, ಕೂಡ್ಲಿಗಿ" : "MLA, Kudligi Constituency"}
              </p>
              <p className="text-white/40 text-[10px] mt-3 leading-relaxed max-w-[200px]">
                {currentText.footerMotto}
              </p>
            </div>
          </div>

          {/* CENTER: Quick links */}
          <div className="flex flex-col items-center gap-4">
            <h4 className="text-[#CCBCA5] font-black text-sm uppercase tracking-widest border-b border-[#CCBCA5]/30 pb-2 w-full text-center">
              {lang === "kn" ? "ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು" : "Quick Links"}
            </h4>
            <nav className="flex flex-col gap-2 text-center">
              {[
                { id: "home", label: currentText.navHome },
                { id: "about", label: currentText.navAbout },
                { id: "developments", label: currentText.navDevelopments },
                { id: "media", label: currentText.navMedia },
                { id: "gallery", label: currentText.navGallery },
                { id: "grievance-form", label: currentText.navGrievance },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleScroll(link.id)}
                  className="text-white/60 hover:text-[#CCBCA5] text-xs font-semibold tracking-wider transition-colors"
                >
                  → {link.label}
                </button>
              ))}
            </nav>

            {/* Values tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {currentText.values.map((v, i) => (
                <span key={i} className="text-[9px] font-black text-[#367AF1] border border-[#367AF1]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {v}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: Contact + Social */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <h4 className="text-[#CCBCA5] font-black text-sm uppercase tracking-widest border-b border-[#CCBCA5]/30 pb-2 w-full text-center md:text-right">
              {lang === "kn" ? "ಸಂಪರ್ಕ ಮಾಡಿ" : "Contact Us"}
            </h4>

            <div className="flex flex-col gap-2 text-right items-center md:items-end">
              <a href="tel:+919480498694" className="flex items-center gap-2 text-white/60 hover:text-[#CCBCA5] text-xs transition-colors">
                <FaPhoneAlt className="w-3 h-3 text-[#367AF1] shrink-0" />
                <span>+91 94804 98694</span>
              </a>
              <a href="mailto:ntsrinivas.mla@gmail.com" className="flex items-center gap-2 text-white/60 hover:text-[#CCBCA5] text-xs transition-colors">
                <FaEnvelope className="w-3 h-3 text-[#367AF1] shrink-0" />
                <span>ntsrinivas.mla@gmail.com</span>
              </a>
              <p className="text-white/40 text-[10px] max-w-[200px] text-center md:text-right leading-relaxed mt-1">
                {lang === "kn"
                  ? "ಶಾಸಕರ ಕಚೇರಿ, ಕೂಡ್ಲಿಗಿ ತಾಲೂಕ್, ವಿಜಯನಗರ ಜಿಲ್ಲೆ, ಕರ್ನಾಟಕ"
                  : "MLA Office, Kudligi Taluk, Vijayanagara District, Karnataka"}
              </p>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-2">
              {[
                { icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
                { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
                { icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
                { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-[#282c2d] border border-[#CCBCA5]/20 flex items-center justify-center text-white/60 hover:text-[#367AF1] hover:border-[#367AF1] transition-all duration-300"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>

            {/* Logos row */}
            <div className="flex items-center gap-4 mt-2 opacity-60">
              <div className="relative w-10 h-10">
                <Image src="/karnataka_logo.png" alt="Karnataka Seal" fill className="object-contain" sizes="40px" />
              </div>
              <div className="relative w-10 h-10">
                <Image src="/party_logo_v2.png" alt="INC Logo" fill className="object-contain" sizes="40px" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#CCBCA5]/10 py-4 px-4 text-center flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
          <span className="text-white/30 text-[10px]">{currentText.footerCopy}</span>
          <span className="text-white/20 text-[10px]">{currentText.footerDev}</span>
        </div>

      </footer>

    </div>
  );
}
