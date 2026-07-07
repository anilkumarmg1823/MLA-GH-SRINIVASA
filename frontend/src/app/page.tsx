"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUsers, 
  FaHandshake, 
  FaChartLine, 
  FaShieldAlt, 
  FaLaptopCode, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock, 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube,
  FaTimes,
  FaCheckCircle,
  FaInfoCircle
} from "react-icons/fa";

// Interface for localized strings
interface LocalizedString {
  en: string;
  kn: string;
}

// Data structures
const navigation = [
  { name: { en: "Home", kn: "ಹೋಮ್" }, href: "#home" },
  { name: { en: "About MLA", kn: "ಕುರಿತು" }, href: "#about" },
  { name: { en: "Initiatives", kn: "ಅಭಿವೃದ್ಧಿಗಳು" }, href: "#develop" },
  { name: { en: "Media News", kn: "ಮಾಧ್ಯಮ" }, href: "#media" },
  { name: { en: "Gallery", kn: "ಗ್ಯಾಲರಿ" }, href: "#gallery" },
  { name: { en: "E-Petition", kn: "ದೂರುಗಳು" }, href: "#petition" },
  { name: { en: "Contact", kn: "ಸಂಪರ್ಕ" }, href: "#contact" },
];

const pillars = [
  {
    title: { en: "PEOPLE FIRST", kn: "ಜನರೇ ಮೊದಲು" },
    icon: FaUsers,
    color: "from-blue-400 to-indigo-500",
    desc: {
      en: "Addressing citizen grievances directly and introducing direct welfare programs for every household.",
      kn: "ನಾಗರಿಕರ ಅಹವಾಲುಗಳನ್ನು ನೇರವಾಗಿ ಪರಿಹರಿಸುವುದು ಮತ್ತು ಪ್ರತಿ ಮನೆಗೆ ನೇರ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳನ್ನು ತಲುಪಿಸುವುದು."
    }
  },
  {
    title: { en: "TRANSPARENCY", kn: "ಪಾರದರ್ಶಕತೆ" },
    icon: FaHandshake,
    color: "from-cyan-400 to-blue-500",
    desc: {
      en: "Public access to development budgets, expenditure reports, and project execution timelines.",
      kn: "ಅಭಿವೃದ್ಧಿ ಯೋಜನೆಗಳ ಬಜೆಟ್, ವೆಚ್ಚದ ವರದಿಗಳು ಮತ್ತು ಕಾಮಗಾರಿಗಳ ಪ್ರಗತಿಯ ವಿವರಗಳನ್ನು ಮುಕ್ತವಾಗಿ ತಿಳಿಸುವುದು."
    }
  },
  {
    title: { en: "DEVELOPMENT", kn: "ಅಭಿವೃದ್ಧಿ" },
    icon: FaChartLine,
    color: "from-teal-400 to-emerald-500",
    desc: {
      en: "Empowering rural roads, cleaning water channels, boosting irrigation, and upgrading public schools.",
      kn: "ಗ್ರಾಮೀಣ ರಸ್ತೆಗಳ ಸುಧಾರಣೆ, ಕಾಲುವೆಗಳ ಸ್ವಚ್ಛತೆ, ನೀರಾವರಿ ಯೋಜನೆಗಳ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಸರ್ಕಾರಿ ಶಾಲೆಗಳ ನವೀಕರಣ."
    }
  },
  {
    title: { en: "ACCOUNTABILITY", kn: "ಹೊಣೆಗಾರಿಕೆ" },
    icon: FaShieldAlt,
    color: "from-amber-400 to-orange-500",
    desc: {
      en: "Strict audits of public funds to ensure that high-quality works are completed without delay.",
      kn: "ಸಾರ್ವಜನಿಕ ಹಣದ ಕಟ್ಟುನಿಟ್ಟಾದ ಲೆಕ್ಕಪರಿಶೋಧನೆ ಮತ್ತು ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಕಾಮಗಾರಿಗಳನ್ನು ನಿಗದಿತ ಅವಧಿಯಲ್ಲಿ ಮುಗಿಸುವುದು."
    }
  },
  {
    title: { en: "DIGITAL GOVERNANCE", kn: "ಡಿಜಿಟಲ್ ಆಡಳಿತ" },
    icon: FaLaptopCode,
    color: "from-purple-400 to-pink-500",
    desc: {
      en: "Simplifying administration via online grievance redressal and direct WhatsApp-to-MLA communication channels.",
      kn: "ಆನ್‌ಲೈನ್ ಮೂಲಕ ಅರ್ಜಿ ಸ್ವೀಕಾರ ಮತ್ತು ಶಾಸಕರೊಂದಿಗೆ ನೇರ ಸಂಪರ್ಕ ಸಾಧಿಸಲು ತಂತ್ರಜ್ಞಾನದ ಬಳಕೆ."
    }
  }
];

const attractions = [
  {
    title: { en: "Bhadra Dam", kn: "ಭದ್ರಾ ಡ್ಯಾಂ" },
    image: "/assets/bhadra-dam.png",
    location: { en: "Lakkavalli, Tarikere Taluk", kn: "ಲಕ್ಕವಳ್ಳಿ, ತರೀಕೆರೆ ತಾಲೂಕು" },
    desc: {
      en: "Located in Lakkavalli, Tarikere taluk. Built across the Bhadra River, a tributary of the Tungabhadra River. It provides critical irrigation to thousands of acres of agricultural lands in the region and generates hydroelectric power.",
      kn: "ತರೀಕೆರೆ ತಾಲೂಕಿನ ಲಕ್ಕವಳ್ಳಿಯಲ್ಲಿ ಭದ್ರಾ ನದಿಗೆ ಅಡ್ಡಲಾಗಿ ಕಟ್ಟಲಾದ ಪ್ರಮುಖ ಅಣೆಕಟ್ಟು. ಇದು ಈ ಭಾಗದ ಸಾವಿರಾರು ಎಕರೆ ಕೃಷಿ ಭೂಮಿಗೆ ನೀರಾವರಿ ಒದಗಿಸುತ್ತದೆ ಮತ್ತು ಜಲವಿದ್ಯುತ್ ಉತ್ಪಾದನೆಗೆ ನೆರವಾಗಿದೆ."
    }
  },
  {
    title: { en: "Amruthapura", kn: "ಅಮೃತಾಪುರ" },
    image: "/assets/amruthapura.png",
    location: { en: "Tarikere Taluk", kn: "ತರೀಕೆರೆ ತಾಲೂಕು" },
    desc: {
      en: "Home to the famous Amrutesvara Temple, built in 1196 CE by Hoysala commander Amrutheshwara Dandanayaka during the reign of King Veera Ballala II. Famous for its highly ornate star-shaped architecture, relief carvings, and historic temple steps.",
      kn: "ಪ್ರಸಿದ್ಧ ಅಮೃತೇಶ್ವರ ದೇವಾಲಯಕ್ಕೆ ಇದು ಹೆಸರುವಾಸಿಯಾಗಿದೆ. ಇದನ್ನು ಹೊಯ್ಸಳ ದೊರೆ ಎರಡನೇ ವೀರ ಬಲ್ಲಾಳನ ಆಳ್ವಿಕೆಯಲ್ಲಿ ಕ್ರಿ.ಶ 1196 ರಲ್ಲಿ ಸೇನಾ ದಂಡನಾಯಕ ಅಮೃತೇಶ್ವರ ನಿರ್ಮಿಸಿದರು. ಇದು ಅತ್ಯದ್ಭುತ ನಕ್ಷತ್ರಾಕಾರದ ಶಿಲ್ಪಕಲೆಗೆ ಹೆಸರಾಗಿದೆ."
    }
  },
  {
    title: { en: "Kalhatti Giri", kn: "ಕಲತ್ತಿ ಗಿರಿ" },
    image: "/assets/kalhatti-falls.png",
    location: { en: "Near Kemmangundi", kn: "ಕೆಮ್ಮಣ್ಣುಗುಂಡಿ ಹತ್ತಿರ" },
    desc: {
      en: "Also known as Kallathigiri Falls. A popular natural waterfall cascading from a height of 122 meters through rocks. It houses the historical Veerabhadreshwara Temple, a cave shrine built into the cliff and associated with Sage Agastya.",
      kn: "ಕಲ್ಹತ್ತಿಗಿರಿ ಜಲಪಾತ ಎಂದೂ ಕರೆಯಲ್ಪಡುವ ಇದು 122 ಮೀಟರ್ ಎತ್ತರದಿಂದ ಧುಮುಕುವ ಅದ್ಭುತ ಜಲಪಾತ. ಇಲ್ಲಿ ಅಗಸ್ತ್ಯ ಮುನಿಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ಐತಿಹಾಸಿಕ ವೀರಭದ್ರೇಶ್ವರ ಗುಹಾ ದದೇಗುಲ ಮತ್ತು ಅಗಸ್ತ್ಯ ಮುನಿಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರದೇಶ."
    }
  }
];

const heroSlides = [
  {
    image: "/assets/bhadra-forest.png",
    title: {
      en: "One Man's Vision Can Turn Dreams Into Reality",
      kn: "ಒಬ್ಬ ವ್ಯಕ್ತಿಯ ದೂರದೃಷ್ಟಿ ಕನಸನ್ನು ನನಸುಗೊಳಿಸಬಲ್ಲದು"
    },
    subtitle: {
      en: "G H Srinivasa - Driving progress and administrative integrity across Tarikere Constituency.",
      kn: "ಜಿ. ಎಚ್. ಶ್ರೀನಿವಾಸ - ತರೀಕೆರೆ ಕ್ಷೇತ್ರದಲ್ಲಿ ಆಡಳಿತಾತ್ಮಕ ಪ್ರಾಮಾಣಿಕತೆ ಮತ್ತು ಪ್ರಗತಿಯ ಹರಿಕಾರ."
    }
  },
  {
    image: "/assets/bhadra-dam.png",
    title: {
      en: "Dedicated to the Development of Tarikere",
      kn: "ತರೀಕೆರೆಯ ಸರ್ವತೋಮುಖ ಅಭಿವೃದ್ಧಿಗೆ ಬದ್ಧತೆ"
    },
    subtitle: {
      en: "Focusing on irrigation, drinking water facilities, rural roads, and modern agricultural setups.",
      kn: "ನೀರಾವರಿ, ಕುಡಿಯುವ ನೀರಿನ ಸೌಲಭ್ಯ, ಗ್ರಾಮೀಣ ರಸ್ತೆಗಳು ಮತ್ತು ಆಧುನಿಕ ಕೃಷಿ ಪದ್ಧತಿಗಳ ಮೇಲೆ ವಿಶೇಷ ಗಮನ."
    }
  },
  {
    image: "/assets/amruthapura.png",
    title: {
      en: "Preserving Heritage, Advancing Infrastructure",
      kn: "ಪರಂಪರೆಯ ರಕ್ಷಣೆ, ಮೂಲಸೌಕರ್ಯಗಳ ಪ್ರಗತಿ"
    },
    subtitle: {
      en: "Enhancing constituency tourism, upgrading public schools, and modernizing primary health centers.",
      kn: "ಕ್ಷೇತ್ರದ ಪ್ರವಾಸೋದ್ಯಮದ ಅಭಿವೃದ್ಧಿ, ಸರ್ಕಾರಿ ಶಾಲೆಗಳ ನವೀಕರಣ ಮತ್ತು ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳ ಆಧುನೀಕರಣ."
    }
  }
];

const initiatives = [
  {
    title: { en: "Healthcare at Doorsteps", kn: "ಮನೆ ಬಾಗಿಲಿಗೆ ಆರೋಗ್ಯ ಸೇವೆ" },
    category: { en: "Health", kn: "ಆರೋಗ್ಯ" },
    desc: {
      en: "Deploying mobile medical vans to remote villages and conducting free health checkup camps weekly.",
      kn: "ದೂರದ ಹಳ್ಳಿಗಳಿಗೆ ಸಂಚಾರಿ ವೈದ್ಯಕೀಯ ವಾಹನಗಳ ನಿಯೋಜನೆ ಮತ್ತು ಪ್ರತಿ ವಾರ ಉಚಿತ ಆರೋಗ್ಯ ತಪಾಸಣಾ ಶಿಬಿರಗಳ ಆಯೋಜನೆ."
    },
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    title: { en: "Nurturing Public Schools", kn: "ಸರ್ಕಾರಿ ಶಾಲೆಗಳ ಸಬಲೀಕರಣ" },
    category: { en: "Education", kn: "ಶಿಕ್ಷಣ" },
    desc: {
      en: "Upgrading classrooms with smart boards, modern libraries, and distributing solar study lamps to students.",
      kn: "ಸ್ಮಾರ್ಟ್ ಬೋರ್ಡ್‌ಗಳು, ಆಧುನಿಕ ಗ್ರಂಥಾಲಯಗಳೊಂದಿಗೆ ತರಗತಿಗಳ ನವೀಕರಣ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸೋಲಾರ್ ಅಧ್ಯಯನ ದೀಪಗಳ ವಿತರಣೆ."
    },
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    title: { en: "Farmer Support Schemes", kn: "ರೈತರಿಗೆ ನೆರವು ಮತ್ತು ತರಬೇತಿ" },
    category: { en: "Agriculture", kn: "ಕೃಷಿ" },
    desc: {
      en: "Ensuring smooth distribution of high-quality seeds, fertilizers, and organizing modern drip irrigation workshops.",
      kn: "ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಬೀಜಗಳು, ರಸಗೊಬ್ಬರಗಳ ಸುಲಭ ವಿತರಣೆ ಮತ್ತು ಆಧುನಿಕ ಹನಿ ನೀರಾವರಿ ಕಾರ್ಯಾಗಾರಗಳ ಆಯೋಜನೆ."
    },
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    title: { en: "Women Empowerment Centers", kn: "ಮಹಿಳಾ ಸಬಲೀಕರಣ ಕೇಂದ್ರಗಳು" },
    category: { en: "Women Welfare", kn: "ಮಹಿಳಾ ಕಲ್ಯಾಣ" },
    desc: {
      en: "Setting up vocational training centers for tailoring, digital literacy, and supporting local self-help groups (SHGs).",
      kn: "ಹೊಲಿಗೆ, ಡಿಜಿಟಲ್ ಸಾಕ್ಷರತೆಗಾಗಿ ವೃತ್ತಿಪರ ತರಬೇತಿ ಕೇಂದ್ರಗಳ ಸ್ಥಾಪನೆ ಮತ್ತು ಸ್ಥಳೀಯ ಸ್ವಸಹಾಯ ಸಂಘಗಳಿಗೆ ಬೆಂಬಲ."
    },
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    title: { en: "Youth Skill Upgradation", kn: "ಯುವ ಕೌಶಲ್ಯಾಭಿವೃದ್ಧಿ ಯೋಜನೆ" },
    category: { en: "Youth", kn: "ಯುವಜನತೆ" },
    desc: {
      en: "Hosting job fairs in Tarikere and establishing youth fitness centers/playgrounds in every gram panchayat.",
      kn: "ತರೀಕೆರೆಯಲ್ಲಿ ಉದ್ಯೋಗ ಮೇಳಗಳ ಆಯೋಜನೆ ಮತ್ತು ಪ್ರತಿ ಗ್ರಾಮ ಪಂಚಾಯಿತಿಯಲ್ಲಿ ಯುವ ಫಿಟ್ನೆಸ್ ಕೇಂದ್ರಗಳು/ಆಟದ ಮೈದಾನಗಳ ಸ್ಥಾಪನೆ."
    },
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    title: { en: "Senior Citizens Outreach", kn: "ಹಿರಿಯ ನಾಗರಿಕರ ಕಲ್ಯಾಣ" },
    category: { en: "Welfare", kn: "ಕಲ್ಯಾಣ ಯೋಜನೆ" },
    desc: {
      en: "Simplifying pension delivery processes and setting up senior citizen day-care and recreational facilities.",
      kn: "ಪಿಂಚಣಿ ವಿತರಣಾ ಪ್ರಕ್ರಿಯೆಗಳ ಸರಳೀಕರಣ ಮತ್ತು ಹಿರಿಯ ನಾಗರಿಕರ ಆರೈಕೆ ಹಾಗೂ ಮನರಂಜನಾ ಸೌಲಭ್ಯಗಳ ಸ್ಥಾಪನೆ."
    },
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }
];

const mediaClippings = [
  {
    title: { en: "Tarikere MLA reviews drinking water supply progress in Lakkavalli", kn: "ಲಕ್ಕವಳ್ಳಿಯಲ್ಲಿ ಕುಡಿಯುವ ನೀರು ಪೂರೈಕೆ ಪ್ರಗತಿ ಪರಿಶೀಲಿಸಿದ ಶಾಸಕರು" },
    date: { en: "June 2026", kn: "ಜೂನ್ 2026" },
    paper: { en: "Prajavani", kn: "ಪ್ರಜಾವಾಣಿ" },
    month: "June",
    snippet: { en: "MLA G H Srinivasa visited several water filtration plants to address local supply complaints.", kn: "ಸ್ಥಳೀಯ ಕುಡಿಯುವ ನೀರಿನ ಸಮಸ್ಯೆ ನಿವಾರಿಸಲು ಶಾಸಕ ಜಿ. ಎಚ್. ಶ್ರೀನಿವಾಸ ಹಲವು ಫಿಲ್ಟರೇಶನ್ ಘಟಕಗಳಿಗೆ ಭೇಟಿ ನೀಡಿದರು." }
  },
  {
    title: { en: "MLA launches educational solar kit distribution drive", kn: "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸೋಲಾರ್ ಅಧ್ಯಯನ ದೀಪಗಳನ್ನು ವಿತರಿಸಿದ ಶಾಸಕರು" },
    date: { en: "June 2026", kn: "ಜೂನ್ 2026" },
    paper: { en: "Udayavani", kn: "ಉದಯವಾಣಿ" },
    month: "June",
    snippet: { en: "Over 500 rural students of government schools in Tarikere received free solar study kits.", kn: "ತರೀಕೆರೆಯ ಸರ್ಕಾರಿ ಶಾಲೆಗಳ 500ಕ್ಕೂ ಹೆಚ್ಚು ಗ್ರಾಮೀಣ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಉಚಿತ ಸೋಲಾರ್ ದೀಪಗಳನ್ನು ವಿತರಿಸಲಾಯಿತು." }
  },
  {
    title: { en: "Health camp in Ajjampura treats over 1,200 rural patients", kn: "ಅಜ್ಜಂಪುರದಲ್ಲಿ ನಡೆದ ಬೃಹತ್ ಆರೋಗ್ಯ ಶಿಬಿರದಲ್ಲಿ 1200ಕ್ಕೂ ಹೆಚ್ಚು ಜನರಿಗೆ ಚಿಕಿತ್ಸೆ" },
    date: { en: "May 2026", kn: "ಮೇ 2026" },
    paper: { en: "Kannada Prabha", kn: "ಕನ್ನಡ ಪ್ರಭ" },
    month: "May",
    snippet: { en: "Free medical diagnostics, eye surgery screenings, and medicines distributed by the MLA team.", kn: "ಶಾಸಕರ ತಂಡದಿಂದ ಉಚಿತ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ, ಕಣ್ಣಿನ ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ ಸ್ಕ್ರೀನಿಂಗ್ ಮತ್ತು ಔಷಧಗಳ ವಿತರಣೆ ಮಾಡಲಾಯಿತು." }
  },
  {
    title: { en: "New road network connectivity project approved for Tarikere villages", kn: "ತರೀಕೆರೆಯ ಗ್ರಾಮೀಣ ರಸ್ತೆಗಳ ಸಂಪರ್ಕ ಯೋಜನೆಗೆ ಶಾಸಕರಿಂದ ಅನುಮೋದನೆ" },
    date: { en: "May 2026", kn: "ಮೇ 2026" },
    paper: { en: "Vijaya Karnataka", kn: "ವಿಜಯ ಕರ್ನಾಟಕ" },
    month: "May",
    snippet: { en: "A budget of 12 Crores approved for asphalt works connecting 18 major rural layouts.", kn: "18 ಪ್ರಮುಖ ಗ್ರಾಮೀಣ ಬಡಾವಣೆಗಳನ್ನು ಸಂಪರ್ಕಿಸುವ ಡಾಂಬರೀಕರಣ ಕಾಮಗಾರಿಗಳಿಗೆ 12 ಕೋಟಿ ರೂ. ಬಜೆಟ್ ಮಂಜೂರಾಗಿದೆ." }
  },
  {
    title: { en: "Farmers convention outlines drip irrigation subsidies in constituency", kn: "ಕ್ಷೇತ್ರದಲ್ಲಿ ಹನಿ ನೀರಾವರಿ ಸಹಾಯಧನದ ಬಗ್ಗೆ ರೈತರ ಸಮಾವೇಶದಲ್ಲಿ ಶಾಸಕರ ವಿವರಣೆ" },
    date: { en: "April 2026", kn: "ಏಪ್ರಿಲ್ 2026" },
    paper: { en: "Samyukta Karnataka", kn: "ಸಂಯುಕ್ತ ಕರ್ನಾಟಕ" },
    month: "April",
    snippet: { en: "Farmers in dry areas to receive up to 90% subsidy for micro-irrigation installations.", kn: "ಒಣ ಪ್ರದೇಶದ ರೈತರಿಗೆ ಸೂಕ್ಷ್ಮ ನೀರಾವರಿ ಅಳವಡಿಕೆಗೆ ಶೇಕಡಾ 90 ರವರೆಗೆ ಸಹಾಯಧನ ನೀಡಲಾಗುವುದು." }
  }
];

const galleryPhotos = [
  { image: "/assets/bhadra-dam.png", title: { en: "Inspection of Bhadra Dam Reservoir", kn: "ಭದ್ರಾ ಅಣೆಕಟ್ಟು ಜಲಾಶಯದ ಪರಿಶೀಲನೆ" } },
  { image: "/assets/amruthapura.png", title: { en: "Visit to historical Amrutesvara Temple", kn: "ಐತಿಹಾಸಿಕ ಅಮೃತೇಶ್ವರ ದೇವಾಲಯಕ್ಕೆ ಭೇಟಿ" } },
  { image: "/assets/kalhatti-falls.png", title: { en: "Public amenities review at Kalhatti Falls", kn: "ಕಲ್ಹತ್ತಿ ಜಲಪಾತದಲ್ಲಿ ಸಾರ್ವಜನಿಕ ಸೌಲಭ್ಯಗಳ ಪರಿಶೀಲನೆ" } },
  { image: "/assets/arecanut.png", title: { en: "Discussion with Tarikere Arecanut Growers", kn: "ತರೀಕೆರೆ ಅಡಿಕೆ ಬೆಳೆಗಾರರೊಂದಿಗೆ ಸಂವಾದ" } }
];

export default function Home() {
  const [lang, setLang] = useState<'en' | 'kn'>('en');
  
  // Hero Carousel State
  // Grievance Portal Form State
  const [petitionName, setPetitionName] = useState('');
  const [petitionPhone, setPetitionPhone] = useState('');
  const [petitionWhatsapp, setPetitionWhatsapp] = useState('');
  const [petitionArea, setPetitionArea] = useState('');
  const [petitionVillage, setPetitionVillage] = useState('');
  const [petitionSubject, setPetitionSubject] = useState('');
  const [petitionText, setPetitionText] = useState('');
  const [petitionSuccess, setPetitionSuccess] = useState(false);
  
  // Modals & Interactive States
  const [activeAttraction, setActiveAttraction] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [selectedMediaMonth, setSelectedMediaMonth] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = (obj: LocalizedString) => obj[lang];

  const handlePetitionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPetitionSuccess(true);
    setTimeout(() => setPetitionSuccess(false), 4500);
    setPetitionName('');
    setPetitionPhone('');
    setPetitionWhatsapp('');
    setPetitionArea('');
    setPetitionVillage('');
    setPetitionSubject('');
    setPetitionText('');
  };


  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-800 font-sans selection:bg-orange-500 selection:text-white">
      {/* Left Floating Social Sidebar */}
      <div className="fixed left-0 top-1/3 z-50 flex flex-col gap-1.5 bg-[#03152a]/95 p-2 rounded-r-xl border-y border-r border-white/10 shadow-[0_4px_25px_rgba(0,0,0,0.3)] backdrop-blur-sm select-none">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-300 hover:text-orange-400 hover:scale-110 transition-all duration-200">
          <FaFacebook className="text-lg" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-300 hover:text-orange-400 hover:scale-110 transition-all duration-200">
          <FaInstagram className="text-lg" />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-300 hover:text-orange-400 hover:scale-110 transition-all duration-200">
          <FaYoutube className="text-lg" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-300 hover:text-orange-400 hover:scale-110 transition-all duration-200">
          <FaTwitter className="text-lg" />
        </a>
      </div>

      {/* Right Floating Grievance Tab */}
      <a
        href="#petition"
        className="fixed right-0 top-[45%] z-50 origin-bottom-right translate-x-[42%] translate-y-[-50%] rotate-270 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-[10px] sm:text-xs px-5 py-3 rounded-t-xl border border-b-0 border-white/20 shadow-[0_4px_25px_rgba(0,0,0,0.25)] transition-all duration-300 select-none tracking-widest flex items-center gap-2 cursor-pointer"
      >
        <FaEnvelope className="text-xs" />
        {lang === "en" ? "SUBMIT GRIEVANCE" : "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ"}
      </a>
      {/* Unified Sky-Blue Header and Full-Width Hero Container */}
      <div className="bg-gradient-to-br from-[#0da2e7] via-[#008bdb] to-[#005ea2] relative overflow-hidden w-full">
        
        {/* Dot Matrix Pattern in Top-Left Corner, matching mockup */}
        <div className="absolute top-24 left-8 grid grid-cols-6 gap-1 opacity-45 pointer-events-none select-none">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-white" />
          ))}
        </div>

        {/* Background image overlay of mountains for premium vibe */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-[0.08] pointer-events-none"
          style={{ backgroundImage: `url('/assets/bhadra-forest.png')` }}
        />

        {/* Mesh lighting effects in background */}
        <div className="absolute top-0 right-1/4 w-[250px] h-[250px] bg-white/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] bg-cyan-300/20 rounded-full blur-[100px] pointer-events-none" />

        {/* 1. Header (Transparent glassmorphic navbar inside the gradient container) */}
        <header className="relative z-40 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            
            {/* Logo / Title */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Karnataka State Emblem */}
              <div className="relative h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 bg-white/10 rounded-full p-1 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Image
                  src="/assets/karnataka-emblem.png"
                  alt="Government of Karnataka Emblem"
                  width={38}
                  height={38}
                  className="object-contain filter brightness-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
                />
              </div>

              {/* Separator Line */}
              <div className="h-8 w-[1px] bg-white/20 hidden xs:block" />

              {/* Karnataka Map constituency badge */}
              <div className="relative h-11 w-9 sm:h-12 sm:w-10 flex-shrink-0 bg-white/5 rounded-lg border border-white/10 hidden xs:flex items-center justify-center overflow-hidden hover:bg-white/10 transition-colors group">
                <Image
                  src="/assets/karnataka-map-transparent.png"
                  alt="Tarikere constituency map"
                  width={32}
                  height={42}
                  className="object-contain transform scale-110 group-hover:scale-120 transition-transform duration-300"
                />
              </div>

              {/* Separator Line */}
              <div className="h-8 w-[1px] bg-white/20" />

              {/* Title Text */}
              <div>
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent leading-tight select-none">
                  {lang === "en" ? "G H SRINIVASA" : "ಜಿ. ಎಚ್. ಶ್ರೀನಿವಾಸ"}
                </h2>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-cyan-200 font-black leading-none mt-1 select-none">
                  {lang === "en" ? "MLA Office Tarikere" : "ಶಾಸಕರ ಕಚೇರಿ ತರೀಕೆರೆ"}
                </p>
              </div>
            </div>

            {/* Nav Items - Desktop */}
            <nav className="hidden lg:flex items-center gap-6">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-slate-100 hover:text-white transition-colors py-2 relative group"
                >
                  {item.name[lang]}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>

            {/* Action Buttons (Language Switcher) */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLang(lang === "en" ? "kn" : "en")}
                className="px-4 py-1.5 rounded-full border border-white/30 bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
              >
                {lang === "en" ? "ಕನ್ನಡ" : "English"}
              </button>
            </div>
          </div>
        </header>

        {/* 2. Hero Section - Premium Static Banner */}
        <section id="home" className="relative min-h-[640px] lg:min-h-[700px] w-full overflow-hidden bg-gradient-to-br from-[#06182c] via-[#020e1d] to-[#041d38] flex items-center py-16 sm:py-20 lg:py-24">
          
          {/* Glowing Ambient Circles for aesthetic depth */}
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
              
              {/* Left Column: Welcome, Map & Badges */}
              <div className="lg:col-span-8 flex flex-col items-start text-left">
                
                {/* Welcome Label */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {lang === "en" ? "Welcome To" : "ಸ್ವಾಗತ"}
                </div>
                
                {/* Main Name Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-none tracking-tight drop-shadow-md">
                  G H SRINIVASA
                </h1>
                
                         {/* Portrait card frame */}
                <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/5] overflow-hidden flex flex-col justify-end group select-none">
                  {/* Photo of G H Srinivasa */}
                  <img 
                    src="/mla-photo.png" 
                    alt="MLA G H Srinivasa" 
                    className="absolute inset-0 w-full h-full object-contain z-0 object-bottom group-hover:scale-105 transition-transform duration-700 filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]"
                  />

                  {/* MLA Details */}full">
                  
                  {/* Karnataka Map sub-card */}
                  <div className="md:col-span-5 flex justify-center items-center">
                    <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center bg-slate-900/40 rounded-3xl p-4 border border-white/5 shadow-2xl backdrop-blur-md overflow-hidden group">
                      <img 
                        src="/assets/karnataka-map-transparent.png" 
                        alt="Karnataka Map" 
                        className="w-full h-full object-contain opacity-75 group-hover:opacity-90 transition-all duration-500"
                      />
                      {/* Pulsing Pin over Chikkamagaluru/Tarikere */}
                      <div className="absolute top-[63%] left-[41%] transform -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center">
                        <span className="absolute w-8 h-8 rounded-full bg-orange-500 opacity-75 animate-pulse-ring" />
                        <span className="absolute w-3.5 h-3.5 rounded-full bg-orange-500 animate-pulse-dot shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                        <div className="absolute top-full mt-2.5 whitespace-nowrap bg-slate-950/95 border border-white/10 px-2.5 py-1 rounded-lg shadow-xl text-[10px] text-white font-extrabold tracking-wide uppercase select-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          {lang === "en" ? "Tarikere Taluk" : "ತರೀಕೆರೆ ತಾಲೂಕು"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges / Pillars container */}
                  <div className="md:col-span-7 flex flex-col gap-3">
                    <span className="text-[10px] font-extrabold text-slate-500 tracking-widest uppercase mb-1 select-none">
                      {lang === "en" ? "Governing Pillars" : "ಆಡಳಿತಾತ್ಮಕ ಸ್ತಂಭಗಳು"}
                    </span>
                    {pillars.map((pillar, idx) => {
                      const Icon = pillar.icon;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 px-4.5 py-2.5 rounded-2xl transition-all duration-300 select-none shadow-sm cursor-pointer hover:translate-x-1.5"
                        >
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center text-white text-sm shadow-md`}>
                            <Icon />
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
                              {lang === "en" ? pillar.title.en : pillar.title.kn}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                              {lang === "en" ? pillar.desc.en : pillar.desc.kn}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Quick CTA Actions */}
                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="#petition"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-600/20 active:scale-95 transition-all cursor-pointer text-center select-none"
                  >
                    {lang === "en" ? "File E-Petition" : "ಡಿಜಿಟಲ್ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ"}
                  </a>
                  <a
                    href="#about"
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider active:scale-95 transition-all cursor-pointer backdrop-blur-sm text-center select-none"
                  >
                    {lang === "en" ? "MLA Profile" : "ಶಾಸಕರ ಪರಿಚಯ"}
                  </a>
                </div>

              </div>

              {/* Right Column: MLA Photo Card Frame */}
              <div className="lg:col-span-4 flex justify-center items-center relative">
                
                {/* Glowing Aura Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-3xl opacity-15 animate-pulse pointer-events-none" />
                
                {/* Saffron & Green Accent Lines behind card */}
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-green-500/10 rounded-[3rem] blur-2xl pointer-events-none" />

                {/* Portrait card frame */}
                <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/5] rounded-[2.5rem] p-4 bg-white/5 border-2 border-white/20 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col justify-end group">
                  {/* Glossy inner frame border */}
                  <div className="absolute inset-2 border border-white/10 rounded-[2rem] pointer-events-none z-10" />
                  
                  {/* Vignette Shadow Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/15 to-slate-950/90 z-0" />
                  
                  {/* Photo of G H Srinivasa */}
                  <img 
                    src="/mla-photo.png" 
                    alt="MLA G H Srinivasa" 
                    className="absolute inset-0 w-full h-full object-cover z-0 object-top group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* MLA Details */}
                  <div className="relative z-10 text-center pb-2">
                    <h3 className="text-lg font-extrabold text-white tracking-wide drop-shadow-md">
                      {lang === "en" ? "G.H. SRINIVASA" : "ಜಿ. ಎಚ್. ಶ್ರೀನಿವಾಸ"}
                    </h3>
                    <p className="text-[10px] text-orange-400 font-bold tracking-widest uppercase mt-0.5 drop-shadow-sm select-none">
                      {lang === "en" ? "Member of Legislative Assembly" : "ಶಾಸಕರು, ತರೀಕೆರೆ ಕ್ಷೇತ್ರ"}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Ribbon Border separator at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 grid grid-cols-2 z-30 select-none">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500" />
            <div className="bg-gradient-to-r from-emerald-600 to-green-600" />
          </div>
        </section>
      </div>

      {/* 3. About MLA Section */}
      <section id="about" className="py-20 px-4 md:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left side: Styled framed portrait of the MLA */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative p-2 bg-white rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] max-w-sm w-full transform hover:scale-[1.01] transition-transform duration-500 border border-slate-100">
              {/* Top Border Accent (National flag colors) */}
              <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 rounded-t-2xl mb-2" />
              
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
                <Image
                  src="/mla-photo.png"
                  alt="G H Srinivasa"
                  fill
                  sizes="(max-width: 384px) 100vw, 384px"
                  className="object-cover object-top hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
              
              <div className="pt-4 pb-2 text-center select-none bg-white rounded-b-2xl">
                <h4 className="text-xl font-black text-slate-900 leading-tight">
                  {lang === "en" ? "G. H. SRINIVASA" : "ಜಿ. ಎಚ್. ಶ್ರೀನಿವಾಸ"}
                </h4>
                <p className="text-xs font-bold text-orange-600 mt-1 uppercase tracking-widest">
                  {lang === "en" ? "MLA - Tarikere Constituency" : "ಶಾಸಕರು - ತರೀಕೆರೆ ಕ್ಷೇತ್ರ"}
                </p>
              </div>
            </div>
          </div>

          {/* Right side: Biography */}
          <div className="lg:col-span-7 text-left">
            <span className="px-3.5 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-xs font-bold text-orange-600 uppercase tracking-widest inline-block mb-4">
              {lang === "en" ? "Leader Profile" : "ನಾಯಕರ ಪರಿಚಯ"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              {lang === "en" 
                ? "Dedicated to Accessible & Clean Governance" 
                : "ಪ್ರಾಮಾಣಿಕ ಮತ್ತು ಸುಲಭ ಲಭ್ಯತೆಯ ಆಡಳಿತಕ್ಕೆ ಬದ್ಧತೆ"}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mt-4 rounded-full" />
            
            <div className="mt-6 space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              <p>
                {lang === "en"
                  ? "G H Srinivasa represents the Tarikere Constituency in the Karnataka Legislative Assembly. Known for his simplistic lifestyle and direct accessibility, he has committed his tenure to addressing grassroots problems."
                  : "ಜಿ. ಎಚ್. ಶ್ರೀನಿವಾಸ ಅವರು ಕರ್ನಾಟಕ ವಿಧಾನಸಭೆಯಲ್ಲಿ ತರೀಕೆರೆ ಕ್ಷೇತ್ರವನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತಿದ್ದಾರೆ. ತಮ್ಮ ಸರಳ ಜೀವನಶೈಲಿ ಮತ್ತು ಜನಸಾಮಾನ್ಯರಿಗೆ ಸುಲಭವಾಗಿ ಲಭ್ಯವಾಗುವ ಗುಣಕ್ಕೆ ಹೆಸರಾಗಿರುವ ಅವರು, ತಳಮಟ್ಟದ ಸಮಸ್ಯೆಗಳ ನಿವಾರಣೆಗೆ ಶ್ರಮಿಸುತ್ತಿದ್ದಾರೆ."}
              </p>
              <p>
                {lang === "en"
                  ? "His approach bridges the gap between public administration and citizens by leveraging digital tools (like e-grievance registration) combined with physical constituency visits. His leadership is focused heavily on upgrading infrastructure, enhancing local education standards, and farming community development."
                  : "ಅವರ ಕಾರ್ಯವೈಖರಿಯು ಕ್ಷೇತ್ರ ಪ್ರವಾಸಗಳ ಜೊತೆಗೆ ಡಿಜಿಟಲ್ ತಂತ್ರಜ್ಞಾನವನ್ನು (ಡಿಜಿಟಲ್ ಅಹವಾಲು ಸಲ್ಲಿಕೆಯಂತಹ) ಬಳಸಿಕೊಳ್ಳುವ ಮೂಲಕ ಆಡಳಿತ ಮತ್ತು ನಾಗರಿಕರ ನಡುವಿನ ಸಂಪರ್ಕವನ್ನು ಬಲಪಡಿಸುತ್ತದೆ. ಮೂಲಸೌಕರ್ಯಗಳ ನವೀಕರಣ, ಶಿಕ್ಷಣದ ಗುಣಮಟ್ಟ ಹೆಚ್ಚಳ ಮತ್ತು ಕೃಷಿ ಸಮುದಾಯದ ಅಭಿವೃದ್ಧಿಗೆ ಇವರು ಶ್ರಮಿಸುತ್ತಿದ್ದಾರೆ."}
              </p>
            </div>

            {/* Small Highlights Grid */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                <div className="text-xl font-bold text-orange-600">90%+</div>
                <div className="text-xs text-slate-600 font-semibold mt-1">
                  {lang === "en" ? "Grievance Resolution Rate" : "ದೂರುಗಳ ಪರಿಹಾರ ದರ"}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="text-xl font-bold text-emerald-600">24/7</div>
                <div className="text-xs text-slate-600 font-semibold mt-1">
                  {lang === "en" ? "Digital Desk Monitoring" : "ಡಿಜಿಟಲ್ ಡೆಸ್ಕ್ ಮೇಲ್ವಿಚಾರಣೆ"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Welfare & Initiatives Section */}
      <section id="develop" className="py-20 bg-slate-50 border-y border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <span className="px-3.5 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-xs font-bold text-orange-600 uppercase tracking-widest inline-block mb-3">
              {lang === "en" ? "Key Sectors" : "ಪ್ರಮುಖ ಕ್ಷೇತ್ರಗಳು"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {lang === "en" ? "Constituency Initiatives & Welfare" : "ಕ್ಷೇತ್ರದ ಅಭಿವೃದ್ಧಿ ಮತ್ತು ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು"}
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto mt-4 rounded-full" />
            <p className="mt-4 text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed">
              {lang === "en"
                ? "Comprehensive development programs designed to empower community segments and establish top-tier facilities."
                : "ಪ್ರತಿ ವರ್ಗದ ಜನರನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸಲು ಮತ್ತು ಕ್ಷೇತ್ರದಲ್ಲಿ ಉನ್ನತ ದರ್ಜೆಯ ಸೌಲಭ್ಯಗಳನ್ನು ನಿರ್ಮಿಸಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಯೋಜನೆಗಳು."}
            </p>
          </div>

          {/* Initiatives Card Grid with Play buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {initiatives.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.06)] hover:scale-[1.02] transition-all duration-300 overflow-hidden group flex flex-col justify-between"
              >
                {/* Thumbnail Header with Play Overlay */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  {/* Background Thumbnail Image based on categories */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center filter brightness-90 group-hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url('/assets/bhadra-forest.png')` }}
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors" />
                  
                  {/* Video Play Button Overlay */}
                  <button
                    onClick={() => setActiveVideo(item.youtubeUrl)}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-orange-600/90 border border-white/40 text-white flex items-center justify-center shadow-lg hover:bg-orange-500 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                    aria-label="Play video"
                  >
                    <svg className="w-5 h-5 fill-current ml-1" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  
                  {/* Category Badge */}
                  <span className="absolute top-4 left-4 px-2.5 py-1 rounded bg-slate-900/80 text-[10px] font-black text-orange-400 border border-orange-500/30 uppercase tracking-wider">
                    {t(item.category)}
                  </span>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 leading-snug group-hover:text-orange-600 transition-colors">
                      {t(item.title)}
                    </h3>
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      {t(item.desc)}
                    </p>
                  </div>
                  
                  {/* Watch video action link */}
                  <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <button
                      onClick={() => setActiveVideo(item.youtubeUrl)}
                      className="text-xs font-black text-orange-600 hover:text-orange-500 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      {lang === "en" ? "Watch Video" : "ವಿಡಿಯೋ ವೀಕ್ಷಿಸಿ"} &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Attractions / Regional Highlights Grid (The bottom 5 cards from mockup) */}
      <section id="attractions" className="py-16 px-4 md:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            {lang === "en" ? "Constituency Highlights & Culture" : "ಕ್ಷೇತ್ರದ ಪ್ರಮುಖ ಪ್ರವಾಸಿ ತಾಣಗಳು ಮತ್ತು ಕೃಷಿ"}
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-600 mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {lang === "en" 
              ? "Discover the spectacular landscapes, rich heritage, and agricultural resources that define Tarikere constituency."
              : "ತರೀಕೆರೆ ಕ್ಷೇತ್ರವನ್ನು ಪ್ರತಿನಿಧಿಸುವ ಭವ್ಯ ಪ್ರಕೃತಿ ಸೌಂದರ್ಯ, ಶ್ರೀಮಂತ ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆ ಮತ್ತು ಕೃಷಿ ಸಂಪತ್ತನ್ನು ಅನ್ವೇಷಿಸಿ."}
          </p>
        </div>

        {/* 5 columns layout for desktop, responsive grid for mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {attractions.map((attr, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setActiveAttraction(idx)}
              className="bg-[#0c3968] p-2 border-2 border-white/20 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.3)] cursor-pointer group flex flex-col justify-between"
            >
              {/* Card Image Wrapper with double frame style */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-900 border border-white/10">
                <Image
                  src={attr.image}
                  alt={attr.title[lang]}
                  fill
                  sizes="(max-width: 768px) 100vw, 20vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </div>

              {/* White Capsule Label Bottom (exactly like the mockup!) */}
              <div className="mt-3 mb-1 px-1">
                <div className="bg-white text-[#031d3b] font-black text-center py-2.5 rounded-full border-2 border-[#005ea2] shadow-[0_4px_10px_rgba(0,0,0,0.25)] group-hover:bg-[#008bdb] group-hover:text-white group-hover:border-white transition-all duration-300">
                  <h3 className="text-xs sm:text-sm font-extrabold select-none">
                    {lang === "en" ? attr.title.en : attr.title.kn}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Attraction Details Modal */}
      <AnimatePresence>
        {activeAttraction !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveAttraction(null)}
              className="fixed inset-0 bg-[#020d1c]/90 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-[#052b54] border border-cyan-400/40 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveAttraction(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900/60 flex items-center justify-center border border-white/20 text-white hover:bg-red-600 hover:border-white transition-all cursor-pointer"
              >
                <FaTimes />
              </button>

              {/* Modal Image Header */}
              <div className="relative h-64 sm:h-80 w-full">
                <Image
                  src={attractions[activeAttraction].image}
                  alt={attractions[activeAttraction].title[lang]}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#052b54] via-[#052b54]/40 to-transparent" />
                <div className="absolute bottom-6 left-6 pr-6">
                  <span className="text-xs text-yellow-400 uppercase tracking-widest font-black block mb-1">
                    {attractions[activeAttraction].location[lang]}
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-md">
                    {attractions[activeAttraction].title[lang]}
                  </h3>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8">
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
                  {attractions[activeAttraction].desc[lang]}
                </p>
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setActiveAttraction(null)}
                    className="px-6 py-2.5 rounded-full bg-[#ffd700] hover:bg-[#ffea75] text-[#03172e] text-xs font-black shadow-lg hover:shadow-yellow-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    {lang === "en" ? "Close Details" : "ವಿವರಣೆ ಮುಚ್ಚಿ"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Media Press Section */}
      <section id="media" className="py-20 max-w-7xl mx-auto px-4 md:px-8 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-xs font-bold text-orange-600 uppercase tracking-widest inline-block mb-3">
            {lang === "en" ? "Press Releases" : "ಮಾಧ್ಯಮ ಮತ್ತು ವರದಿಗಳು"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {lang === "en" ? "Constituency News & Media Archives" : "ಮಾಧ್ಯಮಗಳಲ್ಲಿ ಮೂಡಿಬಂದ ಪ್ರಮುಖ ವರದಿಗಳು"}
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* Monthly Filtering Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {["all", "June", "May", "April"].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMediaMonth(m)}
              className={`px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                selectedMediaMonth === m
                  ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/10"
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              {m === "all" ? (lang === "en" ? "All Months" : "ಎಲ್ಲಾ ತಿಂಗಳು") : (lang === "en" ? `${m} 2026` : `${m === "June" ? "ಜೂನ್" : m === "May" ? "ಮೇ" : "ಏಪ್ರಿಲ್"} 2026`)}
            </button>
          ))}
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mediaClippings
            .filter((clip) => selectedMediaMonth === "all" || clip.month === selectedMediaMonth)
            .map((clip, idx) => (
              <motion.div
                key={idx}
                layout
                className="p-6 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.05)] hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Header Source & Date */}
                  <div className="flex items-center justify-between text-xs font-bold text-orange-600 mb-4 select-none">
                    <span className="px-2.5 py-1 rounded-md bg-orange-50 border border-orange-100">
                      {clip.paper[lang]}
                    </span>
                    <span className="text-slate-400">
                      {clip.date[lang]}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-base font-black text-slate-800 leading-snug">
                    {clip.title[lang]}
                  </h3>
                  
                  {/* Snippet */}
                  <p className="mt-3 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                    {clip.snippet[lang]}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-black text-slate-400 select-none">
                  <span>{lang === "en" ? "Verified Clipping" : "ಪರಿಶೀಲಿಸಿದ ಪ್ರಕಟಣೆ"}</span>
                  <span className="text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer">
                    {lang === "en" ? "Read Clipping" : "ವರದಿ ಓದಿ"} &rarr;
                  </span>
                </div>
              </motion.div>
            ))}
        </div>
      </section>

      {/* 6. Constituency Gallery Section */}
      <section id="gallery" className="py-20 bg-slate-50 border-y border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="px-3.5 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-xs font-bold text-orange-600 uppercase tracking-widest inline-block mb-3">
              {lang === "en" ? "Public Events" : "ಚಿತ್ರ ಗ್ಯಾಲರಿ"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {lang === "en" ? "Constituency Outreach & Rallies" : "ಜನಸಂಪರ್ಕ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಕಾರ್ಯಕ್ರಮಗಳು"}
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto mt-4 rounded-full" />
          </div>

          {/* Horizontal Scroll Gallery */}
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            {galleryPhotos.map((photo, idx) => (
              <div
                key={idx}
                className="min-w-[280px] sm:min-w-[360px] aspect-[4/3] rounded-3xl bg-slate-900 relative overflow-hidden group shadow-lg border border-slate-100 flex-shrink-0"
              >
                <Image
                  src={photo.image}
                  alt={t(photo.title)}
                  fill
                  sizes="(max-width: 768px) 280px, 360px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90 group-hover:brightness-95"
                />
                {/* Bottom Title Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">
                    {lang === "en" ? "Tarikere Events" : "ತರೀಕೆರೆ ಕಾರ್ಯಕ್ರಮ"}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {t(photo.title)}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Player Modal */}
      <AnimatePresence>
        {activeVideo !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideo(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Video Modal Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-3xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center border border-white/20 text-white hover:bg-red-600 hover:border-white transition-all cursor-pointer"
              >
                <FaTimes />
              </button>
              <iframe
                src={activeVideo}
                title="YouTube video player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Digital Grievance Portal (E-Petition) */}
      <section id="petition" className="py-20 px-4 md:px-8 max-w-4xl mx-auto scroll-mt-20">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-[0_15px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-center mb-10">
            <span className="px-3.5 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-xs font-bold text-orange-600 uppercase tracking-widest inline-block mb-3 select-none">
              {lang === "en" ? "Digital Grievance Cell" : "ಡಿಜಿಟಲ್ ಕುಂದುಕೊರತೆ ಕೋಶ"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {lang === "en" ? "Submit E-Petition to MLA Office" : "ಶಾಸಕರ ಕಚೇರಿಗೆ ಡಿಜಿಟಲ್ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ"}
            </h2>
            <p className="mt-3 text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-medium">
              {lang === "en" 
                ? "Send your petitions, local grievances, and developmental suggestions directly to the MLA Office. Your concern will be logged and audited."
                : "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಸಮಸ್ಯೆಗಳು, ಊರಿನ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಕ್ಷೇತ್ರದ ಅಭಿವೃದ್ಧಿಯ ಸಲಹೆಗಳನ್ನು ನೇರವಾಗಿ ಶಾಸಕರ ಕಚೇರಿಗೆ ಕಳುಹಿಸಿ."}
            </p>
          </div>

          <form onSubmit={handlePetitionSubmit} className="space-y-6 relative z-10 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name field */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 select-none">
                  {lang === "en" ? "Your Name" : "ನಿಮ್ಮ ಹೆಸರು"} *
                </label>
                <input
                  type="text"
                  required
                  value={petitionName}
                  onChange={(e) => setPetitionName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                  placeholder={lang === "en" ? "Enter your name" : "ನಿಮ್ಮ ಹೆಸರನ್ನು ಬರೆಯಿರಿ"}
                />
              </div>

              {/* Mobile Phone field */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 select-none">
                  {lang === "en" ? "Mobile Number" : "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"} *
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={petitionPhone}
                  onChange={(e) => setPetitionPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                  placeholder={lang === "en" ? "10-digit mobile number" : "10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* WhatsApp field */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 select-none">
                  {lang === "en" ? "WhatsApp Number" : "ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆ"}
                </label>
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  value={petitionWhatsapp}
                  onChange={(e) => setPetitionWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                  placeholder={lang === "en" ? "10-digit WhatsApp number" : "10 ಅಂಕಿಯ ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆ"}
                />
              </div>

              {/* Area Selection Dropdown */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 select-none">
                  {lang === "en" ? "Select Panchayat / Taluk Area" : "ಪಂಚಾಯತ್ / ತಾಲೂಕು ವ್ಯಾಪ್ತಿ"} *
                </label>
                <select
                  required
                  value={petitionArea}
                  onChange={(e) => setPetitionArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium cursor-pointer"
                >
                  <option value="">{lang === "en" ? "-- Choose Area --" : "-- ವ್ಯಾಪ್ತಿ ಆಯ್ಕೆಮಾಡಿ --"}</option>
                  <option value="Tarikere Town">{lang === "en" ? "Tarikere Town (ತರೀಕೆರೆ ಪಟ್ಟಣ)" : "ತರೀಕೆರೆ ಪಟ್ಟಣ"}</option>
                  <option value="Lakkavalli Grama">{lang === "en" ? "Lakkavalli Grama (ಲಕ್ಕವಳ್ಳಿ ಗ್ರಾಮ)" : "ಲಕ್ಕವಳ್ಳಿ ಗ್ರಾಮ"}</option>
                  <option value="Ajjampura Grama">{lang === "en" ? "Ajjampura Grama (ಅಜ್ಜಂಪುರ ಗ್ರಾಮ)" : "ಅಜ್ಜಂಪುರ ಗ್ರಾಮ"}</option>
                  <option value="Lingadahalli Grama">{lang === "en" ? "Lingadahalli Grama (ಲಿಂಗದಹಳ್ಳಿ ಗ್ರಾಮ)" : "ಲಿಂಗದಹಳ್ಳಿ ಗ್ರಾಮ"}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Village / Ward field */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 select-none">
                  {lang === "en" ? "Village Name / Ward Number" : "ಗ್ರಾಮದ ಹೆಸರು / ವಾರ್ಡ್ ಸಂಖ್ಯೆ"} *
                </label>
                <input
                  type="text"
                  required
                  value={petitionVillage}
                  onChange={(e) => setPetitionVillage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                  placeholder={lang === "en" ? "Village Name / Ward Number" : "ಗ್ರಾಮ / ವಾರ್ಡ್ ಸಂಖ್ಯೆ"}
                />
              </div>

              {/* Subject field */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 select-none">
                  {lang === "en" ? "Grievance Subject" : "ಅರ್ಜಿಯ ವಿಷಯ"} *
                </label>
                <input
                  type="text"
                  required
                  value={petitionSubject}
                  onChange={(e) => setPetitionSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                  placeholder={lang === "en" ? "Subject of your grievance" : "ಅರ್ಜಿಯ ವಿಷಯ ನಮೂದಿಸಿ"}
                />
              </div>
            </div>

            {/* Petition Text (Message) field */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 select-none">
                {lang === "en" ? "Detailed Description" : "ವಿವರವಾದ ವಿವರಣೆ"} *
              </label>
              <textarea
                required
                rows={4}
                value={petitionText}
                onChange={(e) => setPetitionText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium resize-none"
                placeholder={lang === "en" ? "Write details of your grievance..." : "ನಿಮ್ಮ ಅರ್ಜಿಯ ಸಂಪೂರ್ಣ ವಿವರವನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ..."}
              />
            </div>

            {/* Submit button & Status message */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm cursor-pointer select-none"
              >
                {lang === "en" ? "Submit Petition" : "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ"}
              </button>
            </div>
          </form>

          <AnimatePresence>
            {petitionSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 20 }}
                  className="max-w-md flex flex-col items-center bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl relative text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 text-3xl mb-4 animate-bounce">
                    <FaCheckCircle />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800">
                    {lang === "en" ? "Petition Submitted!" : "ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಲಾಗಿದೆ!"}
                  </h3>
                  <p className="mt-2.5 text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
                    {lang === "en" 
                      ? "Thank you! Your grievance has been logged successfully. The Tarikere MLA Office administrative team will review it and contact you shortly."
                      : "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಅಹವಾಲನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ. ಶಾಸಕರ ಕಚೇರಿ ಸಿಬ್ಬಂದಿಯು ಇದನ್ನು ಪರಿಶೀಲಿಸಿ ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲಿದ್ದಾರೆ."}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 8. Contact Details Section */}
      <section id="contact" className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-200 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Office Contacts */}
          <div className="lg:col-span-5 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">
              {lang === "en" ? "MLA Office Contact Info" : "ಶಾಸಕರ ಸಂಪರ್ಕ ಕಚೇರಿ"}
            </h2>
            <div className="w-16 h-1 bg-orange-500 rounded-full mb-8" />

            <div className="space-y-6">
              
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 flex-shrink-0 mt-1 shadow-sm">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
                    {lang === "en" ? "Office Location" : "ಕಚೇರಿ ವಿಳಾಸ"}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {lang === "en" 
                      ? "MLA Office, Near Govt Hospital, Tarikere taluk, Chikkamagaluru District, Karnataka - 577228"
                      : "ಶಾಸಕರ ಸಂಪರ್ಕ ಕಚೇರಿ, ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆ ಹತ್ತಿರ, ತರೀಕೆರೆ ತಾಲೂಕು, ಚಿಕ್ಕಮಗಳೂರು ಜಿಲ್ಲೆ, ಕರ್ನಾಟಕ - 577228"}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 flex-shrink-0 mt-1 shadow-sm">
                  <FaPhoneAlt />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
                    {lang === "en" ? "Phone Helpline" : "ದೂರವಾಣಿ ಸಹಾಯವಾಣಿ"}
                  </h4>
                  <p className="text-slate-600 text-sm font-semibold">
                    +91 8261 222099 / +91 94481 23456
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 flex-shrink-0 mt-1 shadow-sm">
                  <FaEnvelope />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
                    {lang === "en" ? "Email Address" : "ಇಮೇಲ್ ವಿಳಾಸ"}
                  </h4>
                  <p className="text-slate-600 text-sm font-semibold">
                    contact@ghsrinivasa.in
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 flex-shrink-0 mt-1 shadow-sm">
                  <FaClock />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
                    {lang === "en" ? "Working Hours" : "ಕೆಲಸದ ಸಮಯ"}
                  </h4>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed">
                    {lang === "en"
                      ? "Monday - Saturday: 9:30 AM - 5:30 PM (Sunday Closed)"
                      : "ಸೋಮವಾರ - ಶನಿವಾರ: ಬೆಳಿಗ್ಗೆ 9:30 ರಿಂದ ಸಂಜೆ 5:30 ರವರೆಗೆ (ಭಾನುವಾರ ರಜೆ)"}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Google Maps Embed Placeholder & Social handles */}
          <div className="lg:col-span-7 flex flex-col justify-between text-left">
            <div className="w-full h-64 sm:h-80 rounded-3xl overflow-hidden border border-slate-100 relative bg-slate-900 shadow-md">
              
              {/* Fallback Beautiful Map Graphic */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: `url('/assets/karnataka-map-transparent.png')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              {/* Map Info Box */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-slate-900/95 border border-white/10">
                <h4 className="text-sm font-extrabold text-white mb-1">
                  {lang === "en" ? "Tarikere Taluk Administration Map" : "ತರೀಕೆರೆ ತಾಲೂಕು ಆಡಳಿತ ನಕ್ಷೆ"}
                </h4>
                <p className="text-[11px] text-slate-300 leading-normal mb-3 font-medium">
                  {lang === "en"
                    ? "MLA Office serves the entire Tarikere Assembly constituency comprising Ajjampura, Lakkavalli, and surrounding hoblis."
                    : "ಶಾಸಕರ ಕಚೇರಿಯು ಅಜ್ಜಂಪುರ, ಲಕ್ಕವಳ್ಳಿ ಮತ್ತು ಸುತ್ತಮುತ್ತಲಿನ ಹೋಬಳಿಗಳನ್ನು ಒಳಗೊಂಡ ತರೀಕೆರೆ ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ ವ್ಯಾಪ್ತಿಗೆ ಸೇವೆ ನೀಡುತ್ತದೆ."}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-orange-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping inline-block" />
                  <span>{lang === "en" ? "Active Digital Node" : "ಸಕ್ರಿಯ ಡಿಜಿಟಲ್ ನೋಡ್"}</span>
                </div>
              </div>
            </div>

            {/* Social Connection handles */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-white/5">
              <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                {lang === "en" ? "Follow G H Srinivasa on Socials:" : "ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳಲ್ಲಿ ಶಾಸಕರನ್ನು ಫಾಲೋ ಮಾಡಿ:"}
              </span>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-blue-500 hover:bg-white hover:border-blue-500 transition-all cursor-pointer">
                  <FaFacebook className="text-base" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-white hover:border-cyan-400 transition-all cursor-pointer">
                  <FaTwitter className="text-base" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-pink-500 hover:bg-white hover:border-pink-500 transition-all cursor-pointer">
                  <FaInstagram className="text-base" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-white hover:border-red-500 transition-all cursor-pointer">
                  <FaYoutube className="text-base" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-8 bg-[#020e1d] text-center border-t border-white/10 select-none">
        <p className="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} {lang === "en" ? "G H Srinivasa MLA Office Tarikere. All Rights Reserved." : "ಜಿ. ಎಚ್. ಶ್ರೀನಿವಾಸ ಶಾಸಕರ ಕಚೇರಿ ತರೀಕೆರೆ. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ."}
        </p>
        <p className="text-[10px] text-slate-500 mt-2 tracking-wide">
          {lang === "en" ? "Powered by Digital Governance Initiative" : "ಡಿಜಿಟಲ್ ಗವರ್ನೆನ್ಸ್ ಇನಿಶಿಯೇಟಿವ್ ತಂತ್ರಜ್ಞಾನ ಆಧಾರಿತ"}
        </p>
      </footer>

    </div>
  );
}
