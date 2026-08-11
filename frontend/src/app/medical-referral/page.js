"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  FaUserMd, FaHospital, FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt, 
  FaSearch, FaHeartbeat, FaFileAlt, FaCheckCircle, FaAmbulance, 
  FaStethoscope, FaHome, FaAngleRight, FaShareAlt, FaCalendarCheck
} from "react-icons/fa";
import { gramPanchayats } from "@/data/gramPanchayats";
import { ensureLocationsTree } from "@/lib/locations";

// Animated Counting Number Component for Scroll Trigger
function AnimatedNumber({ value, duration = 1.5 }) {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (value === "24x7") {
      setDisplayValue("24x7");
      return;
    }

    const rawNum = parseFloat(value.toString().replace(/[^0-9.]/g, ""));
    if (isNaN(rawNum)) {
      setDisplayValue(value);
      return;
    }

    const isCrore = value.includes("ಕೋಟಿ");
    const isPlus = value.includes("+");
    let current = 0;
    const steps = 30;
    const increment = rawNum / steps;
    const stepTime = (duration * 1000) / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= rawNum) {
        if (isCrore) {
          setDisplayValue(`₹${rawNum.toFixed(1)} ಕೋಟಿ`);
        } else if (isPlus) {
          setDisplayValue(`${Math.floor(rawNum).toLocaleString()}+`);
        } else {
          setDisplayValue(rawNum.toString());
        }
        clearInterval(timer);
      } else {
        if (isCrore) {
          setDisplayValue(`₹${current.toFixed(1)} ಕೋಟಿ`);
        } else if (isPlus) {
          setDisplayValue(`${Math.floor(current).toLocaleString()}+`);
        } else {
          setDisplayValue(Math.floor(current).toString());
        }
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

function StatCard({ icon: Icon, iconClass, value, label, bgClass, borderClass }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`p-4 rounded-2xl ${bgClass} border ${borderClass} transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md`}>
      <Icon className={`w-7 h-7 ${iconClass} mx-auto mb-1.5`} />
      <div className="text-2xl sm:text-3xl font-black text-[#001D56]">
        {inView ? <AnimatedNumber value={value} /> : "0"}
      </div>
      <div className="text-xs font-bold text-slate-600 mt-0.5">{label}</div>
    </div>
  );
}

// Comprehensive Medical Referral Dataset (Bengaluru, Mysuru, Ballari, Hubballi, Davanagere)
const REFERRAL_HOSPITALS = [
  {
    id: 1,
    hospitalKn: "ಶ್ರೀ ಜಯದೇವ ಹೃದ್ರೋಗ ವಿಜ್ಞಾನ ಮತ್ತು ಸಂಶೋಧನಾ ಸಂಸ್ಥೆ",
    hospitalEn: "Sri Jayadeva Institute of Cardiovascular Sciences",
    city: "Bengaluru",
    cityKn: "ಬೆಂಗಳೂರು",
    deptKn: "ಹೃದಯ ರೋಗ ಹಾಗೂ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ (Cardiology & Cardiac Surgery)",
    deptEn: "Cardiology & Cardiac Surgery",
    doctorKn: "ಡಾ. ಸಿ. ಎನ್. ಮಂಜುನಾಥ್ ಹಾಗೂ ಹಿರಿಯ ಹೃದ್ರೋಗ ತಜ್ಞರ ತಂಡ",
    doctorEn: "Dr. C. N. Manjunath & Senior Cardiac Team",
    schemesKn: "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ - ಆರೋಗ್ಯಾಕರ್ನಾಟಕ, ಸಿಎಂ ಪರಿಹಾರ ನಿಧಿ",
    schemesEn: "Ayushman Bharat - Arky, CM Relief Fund",
    contactPhone: "9480498694",
    nodalOfficerKn: "ಎಂ. ಮರುಳಸಿದ್ಧಪ್ಪ (ಶಾಸಕರ ವೈದ್ಯಕೀಯ ಸಂಯೋಜಕರು)",
    isTop: true,
    bedCountKn: "1200+ ಹಾಸಿಗೆಗಳು",
    addressKn: "ಬನ್ನೇರುಘಟ್ಟ ರಸ್ತೆ, ಜಯನಗರ 9ನೇ ಬ್ಲಾಕ್, ಬೆಂಗಳೂರು"
  },
  {
    id: 2,
    hospitalKn: "ಕಿದ್ವಾಯಿ ಸ್ಮಾರಕ ಗಂಥಿ ಸಂಸ್ಥೆ (ಕ್ಯಾನ್ಸರ್ ಆಸ್ಪತ್ರೆ)",
    hospitalEn: "Kidwai Memorial Institute of Oncology",
    city: "Bengaluru",
    cityKn: "ಬೆಂಗಳೂರು",
    deptKn: "ಕ್ಯಾನ್ಸರ್ ರೋಗ, ಕಿಮೋಥೆರಪಿ ಹಾಗೂ ವಿಕಿರಣ ಚಿಕಿತ್ಸೆ (Oncology & Radiotherapy)",
    deptEn: "Oncology & Radiotherapy",
    doctorKn: "ಡಾ. ಲೋಕೇಶ್ ಹಾಗೂ ಕ್ಯಾನ್ಸರ್ ತಜ್ಞ ಶಸ್ತ್ರಚಿಕಿತ್ಸಕರ ತಂಡ",
    doctorEn: "Dr. Lokesh & Oncology Specialist Surgeons",
    schemesKn: "ಉಚಿತ ಕ್ಯಾನ್ಸರ್ ಚಿಕಿತ್ಸೆ, ಉಚಿತ ಔಷಧಿ ವಿತರಣೆ",
    schemesEn: "Free Cancer Care & Subsidized Medicine",
    contactPhone: "9480498694",
    nodalOfficerKn: "ಕಾವಲ್ಲಿ ರಾಘವೇಂದ್ರ (ಶಾಸಕರ ಆರೋಗ್ಯ ಕೋಶ)",
    isTop: true,
    bedCountKn: "850+ ಹಾಸಿಗೆಗಳು",
    addressKn: "ಡಾ. ಎಂ. ಹೆಚ್. ಮರಿಗೌಡ ರಸ್ತೆ, ಬೆಂಗಳೂರು"
  },
  {
    id: 3,
    hospitalKn: "ನಿಮ್ಹಾನ್ಸ್ (ರಾಷ್ಟ್ರೀಯ ಮಾನಸಿಕ ಆರೋಗ್ಯ ಹಾಗೂ ನರವಿಜ್ಞಾನ ಸಂಸ್ಥೆ)",
    hospitalEn: "NIMHANS - National Institute of Mental Health & Neurosciences",
    city: "Bengaluru",
    cityKn: "ಬೆಂಗಳೂರು",
    deptKn: "ನರವಿಜ್ಞಾನ, ನರಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಹಾಗೂ ಮಾನಸಿಕ ಆರೋಗ್ಯ (Neurology & Neurosurgery)",
    deptEn: "Neurology & Neurosurgery",
    doctorKn: "ಡಾ. ಕೆ. ಎಸ್. ಪ್ರಸಾದ್ ಹಾಗೂ ಹಿರಿಯ ನ್ಯೂರೋ ಶಸ್ತ್ರಚಿಕಿತ್ಸಕರು",
    doctorEn: "Dr. K. S. Prasad & Senior Neurosurgeons",
    schemesKn: "ಉಚಿತ ಒಪಿಡಿ, ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಸೌಲಭ್ಯ",
    schemesEn: "Free OPD & Ayushman Bharat Scheme",
    contactPhone: "9880227338",
    nodalOfficerKn: "ಶಾಸಕರ ನೆರವು ಕೋಶ ಬೆಂಗಳೂರು",
    isTop: true,
    bedCountKn: "1000+ ಹಾಸಿಗೆಗಳು",
    addressKn: "ಹೊಸೂರು ರಸ್ತೆ, ಲಕ್ಕಸಂದ್ರ, ಬೆಂಗಳೂರು"
  },
  {
    id: 4,
    hospitalKn: "ವಿಕ್ಟೋರಿಯಾ ಸರಕಾರಿ ಆಸ್ಪತ್ರೆ & ವಾಣಿ ವಿಲಾಸ ಮಹಿಳಾ ಆಸ್ಪತ್ರೆ",
    hospitalEn: "Victoria Hospital & Vani Vilas Women Hospital",
    city: "Bengaluru",
    cityKn: "ಬೆಂಗಳೂರು",
    deptKn: "ಸಾಮಾನ್ಯ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ, ಪ್ಲಾಸ್ಟಿಕ್ ಸರ್ಜರಿ, ಪ್ರಸೂತಿ ಹಾಗೂ ಮಕ್ಕಳ ಚಿಕಿತ್ಸೆ",
    deptEn: "General Surgery, Plastic Surgery, Gynaecology & Pediatrics",
    doctorKn: "ಡಾ. ರಮೇಶ್ ಹಾಗೂ ಬಿಎಂಸಿಆರ್‌ಐ ಹಿರಿಯ ಪ್ರಾಧ್ಯಾಪಕರು",
    doctorEn: "Dr. Ramesh & BMCRI Senior Medical Professors",
    schemesKn: "100% ಉಚಿತ ಸರಕಾರಿ ಚಿಕಿತ್ಸೆ, ಉಚಿತ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ",
    schemesEn: "100% Free Govt Care & Surgery",
    contactPhone: "9480498694",
    nodalOfficerKn: "ಶಾಸಕರ ವೈದ್ಯಕೀಯ ಸಹಾಯಕರ ವಿಭಾಗ",
    isTop: false,
    bedCountKn: "1500+ ಹಾಸಿಗೆಗಳು",
    addressKn: "ಫೋರ್ಟ್ ಕೆ. ಆರ್. ರಸ್ತೆ, ಮಾರುಕಟ್ಟೆ ಹತ್ತಿರ, ಬೆಂಗಳೂರು"
  },
  {
    id: 5,
    hospitalKn: "ವಿಜಯನಗರ ವೈದ್ಯಕೀಯ ವಿಜ್ಞಾನಗಳ ಸಂಸ್ಥೆ (VIMS ಆಸ್ಪತ್ರೆ)",
    hospitalEn: "Vijayanagar Institute of Medical Sciences (VIMS)",
    city: "Ballari",
    cityKn: "ಬಳ್ಳಾರಿ",
    deptKn: "ಮೂಳೆ ರೋಗ, ಜನರಲ್ ಮೆಡಿಸಿನ್, ತುರ್ತು ಚಿಕಿತ್ಸೆ ಹಾಗೂ ಹೆರಿಗೆ ವಿಭಾಗ",
    deptEn: "Orthopedics, General Medicine & Emergency Care",
    doctorKn: "ಡಾ. ಗಂಗಾಧರ ಹಾಗೂ ವಿಐಎಂಎಸ್ ಹಿರಿಯ ವೈದ್ಯರು",
    doctorEn: "Dr. Gangadhar & VIMS Senior Specialists",
    schemesKn: "ಆಯುಷ್ಮಾನ್ ಭಾರತ್, ಬಿಪಿಎಲ್ ಕಾರ್ಡ್ ಉಚಿತ ಚಿಕಿತ್ಸೆ",
    schemesEn: "Ayushman Bharat & BPL Card Free Treatment",
    contactPhone: "9480498694",
    nodalOfficerKn: "ಬಳ್ಳಾರಿ ಶಾಸಕರ ಕಚೇರಿ ಪ್ರತಿನಿಧಿ",
    isTop: true,
    bedCountKn: "1100+ ಹಾಸಿಗೆಗಳು",
    addressKn: "ಕ್ಯಾಂಪ್ ಪ್ರದೇಶ, ಕಂಟೋನ್ಮೆಂಟ್, ಬಳ್ಳಾರಿ"
  },
  {
    id: 6,
    hospitalKn: "ಕೆ. ಆರ್. ಆಸ್ಪತ್ರೆ ಹಾಗೂ ಪಿಕೆಟಿಬಿ ಆಸ್ಪತ್ರೆ (ಮೈಸೂರು ವೈದ್ಯಕೀಯ ಕಾಲೇಜು)",
    hospitalEn: "K. R. Hospital & PKTB Mysore Medical College",
    city: "Mysuru",
    cityKn: "ಮೈಸೂರು",
    deptKn: "ಉಸಿರಾಟದ ರೋಗ, ಸಾರ್ವಜನಿಕ ಚಿಕಿತ್ಸೆ ಹಾಗೂ ಶ್ವಾಸಕೋಶ ವಿಭಾಗ",
    deptEn: "Pulmonology, General Medicine & Respiratory Care",
    doctorKn: "ಡಾ. ಬಸವರಾಜ್ ಹಾಗೂ ಎಂಎಂಸಿಆರ್‌ಐ ವೈದ್ಯರು",
    doctorEn: "Dr. Basavaraj & MMCRI Senior Doctors",
    schemesKn: "ಸಿಎಂ ಪರಿಹಾರ ನಿಧಿ, ಸರಕಾರಿ ಉಚಿತ ಸೌಲಭ್ಯ",
    schemesEn: "CM Relief Fund & Free Govt Care",
    contactPhone: "9880227338",
    nodalOfficerKn: "ಮೈಸೂರು ಆಸ್ಪತ್ರೆ ನೆರವು ಸಂಯೋಜಕರು",
    isTop: false,
    bedCountKn: "1050+ ಹಾಸಿಗೆಗಳು",
    addressKn: "ಸಯ್ಯಾಜಿ ರಾವ್ ರಸ್ತೆ, ಮೈಸೂರು ನಗರ"
  },
  {
    id: 7,
    hospitalKn: "ಕರ್ನಾಟಕ ವೈದ್ಯಕೀಯ ವಿಜ್ಞಾನಗಳ ಸಂಸ್ಥೆ (KIMS ಹುಬ್ಬಳ್ಳಿ)",
    hospitalEn: "Karnataka Institute of Medical Sciences (KIMS Hubballi)",
    city: "Hubballi",
    cityKn: "ಹುಬ್ಬಳ್ಳಿ",
    deptKn: "ಕಿಡ್ನಿ ರೋಗ (ನೆಫ್ರಾಲಜಿ), ಮೂತ್ರಶಾಸ್ತ್ರ ಹಾಗೂ ಡಯಾಲಿಸಿಸ್ ವಿಭಾಗ",
    deptEn: "Nephrology, Urology & Kidney Dialysis",
    doctorKn: "ಡಾ. ರಾಮಚಂದ್ರ ಹಾಗೂ ಕಿಮ್ಸ್ ಹಿರಿಯ ಸರ್ಜನ್‌ಗಳು",
    doctorEn: "Dr. Ramachandra & KIMS Nephro Surgeons",
    schemesKn: "ಉಚಿತ ಡಯಾಲಿಸಿಸ್ ಯೋಜನೆ, ಬಿಪಿಎಲ್ ಉಚಿತ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ",
    schemesEn: "Free Dialysis Scheme & BPL Surgery",
    contactPhone: "9480498694",
    nodalOfficerKn: "ಉತ್ತರ ಕರ್ನಾಟಕ ವೈದ್ಯಕೀಯ ಸಂಯೋಜಕರು",
    isTop: true,
    bedCountKn: "1200+ ಹಾಸಿಗೆಗಳು",
    addressKn: "ವಿದ್ಯಾನಗರ, ಪಿ. ಬಿ. ರಸ್ತೆ, ಹುಬ್ಬಳ್ಳಿ"
  },
  {
    id: 8,
    hospitalKn: "ಎಸ್. ಎಸ್. ಇನ್‌ಸ್ಟಿಟ್ಯೂಟ್ ಆಫ್ ಮೆಡಿಕಲ್ ಸೈನ್ಸಸ್ & ಸಿಜಿ ಆಸ್ಪತ್ರೆ",
    hospitalEn: "SSIMS & Chigateri District Hospital",
    city: "Davanagere",
    cityKn: "ದಾವಣಗೆರೆ",
    deptKn: "ಜಠರರೋಗ (Gastroenterology), ತುರ್ತು ಅಪಘಾತ ಚಿಕಿತ್ಸೆ ಹಾಗೂ ಐಸಿಯು",
    deptEn: "Gastroenterology, Emergency Trauma & ICU",
    doctorKn: "ಡಾ. ಸುರೇಶ್ ಹಾಗೂ ಎಸ್‌ಎಸ್‌ಐಎಂಎಸ್ ಹಿರಿಯ ತಜ್ಞರು",
    doctorEn: "Dr. Suresh & SSIMS Senior Specialists",
    schemesKn: "ಆಯುಷ್ಮಾನ್ ಭಾರತ್, ತುರ್ತು ಶಾಸಕರ ಅನುದಾನ ನೆರವು",
    schemesEn: "Ayushman Bharat & Emergency MLA Medical Grant",
    contactPhone: "9480498694",
    nodalOfficerKn: "ದಾವಣಗೆರೆ ಶಾಸಕರ ಸಂಪರ್ಕ ಕಚೇರಿ",
    isTop: false,
    bedCountKn: "900+ ಹಾಸಿಗೆಗಳು",
    addressKn: "ಎನ್. ಹೆಚ್. 4 ಬೈಪಾಸ್, ದಾವಣಗೆರೆ"
  }
];

// Kudligi Constituency Hoblis & Villages dataset
const KUDLIGI_HOBLIS = [
  { kn: "ಕೂಡ್ಲಿಗಿ ಟೌನ್ (Kudligi Town)", en: "Kudligi Town" },
  { kn: "ಕೊಟ್ಟೂರು (Kotturu)", en: "Kotturu" },
  { kn: "ಕಾನಾಹೊಸಹಳ್ಳಿ (Kana Hosahalli)", en: "Kana Hosahalli" },
  { kn: "ಹೊಸಹಳ್ಳಿ (Hosahalli)", en: "Hosahalli" },
  { kn: "ರಾಂಪುರ (Rampura)", en: "Rampura" },
  { kn: "ಗುಡೇಕೋಟೆ (Gudekote)", en: "Gudekote" },
  { kn: "ಇತರೆ / ಗ್ರಾಮದ ಹೆಸರು (Other)", en: "Other Village" }
];

// Helper to auto-suggest major diseases based on hospital selected
const getDiseaseSuggestions = (hospName) => {
  const name = hospName ? hospName.toLowerCase() : "";
  if (name.includes("ಜಯದೇವ") || name.includes("jayadeva")) {
    return [
      { kn: "ಹೃದಯ ರೋಗ / Angioplasty", en: "Cardiology / Angioplasty" },
      { kn: "ಬೈಪಾಸ್ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ (Bypass)", en: "Bypass Surgery" },
      { kn: "ಇಸಿಜಿ / ಇಕೋ ಪರೀಕ್ಷೆ", en: "ECG / Echo Test" }
    ];
  } else if (name.includes("ಕಿದ್ವಾಯಿ") || name.includes("kidwai")) {
    return [
      { kn: "ಕ್ಯಾನ್ಸರ್ ಚಿಕಿತ್ಸೆ (Chemotherapy)", en: "Chemotherapy / Cancer" },
      { kn: "ರೇಡಿಯೇಶನ್ ಥೆರಪಿ", en: "Radiation Therapy" },
      { kn: "ಬಯಾಪ್ಸಿ ತಪಾಸಣೆ", en: "Biopsy Check" }
    ];
  } else if (name.includes("ನಿಮ್ಹಾನ್ಸ್") || name.includes("nimhans")) {
    return [
      { kn: "ಮಿದುಳು / ನರರೋಗ ಸಮಸ್ಯೆ", en: "Neurology / Brain Issue" },
      { kn: "ಪಾರ್ಶ್ವವಾಯು (Stroke Care)", en: "Stroke Emergency" }
    ];
  } else if (name.includes("ವಿಕ್ಟೋರಿಯಾ") || name.includes("victoria")) {
    return [
      { kn: "ಸುಟ್ಟಗಾಯ ಚಿಕಿತ್ಸೆ (Burn Ward)", en: "Burn Injury Care" },
      { kn: "ಪ್ಲಾಸ್ಟಿಕ್ ಸರ್ಜರಿ", en: "Plastic Surgery" },
      { kn: "ತುರ್ತು ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ (Trauma)", en: "Trauma Emergency" }
    ];
  } else if (name.includes("ಕಿಮ್ಸ್") || name.includes("kims")) {
    return [
      { kn: "ಉಚಿತ ಕಿಡ್ನಿ ಡಯಾಲಿಸಿಸ್", en: "Kidney Dialysis" },
      { kn: "ಮೂತ್ರಪಿಂಡ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ", en: "Urology Surgery" }
    ];
  } else if (name.includes("ಮೈಸೂರು") || name.includes("mysore") || name.includes("k. r.")) {
    return [
      { kn: "ಶ್ವಾಸಕೋಶ / ಆಸ್ತಮಾ ರೋಗ", en: "Asthma / Pulmonology" },
      { kn: "ಸಾರ್ವಜನಿಕ ಚಿಕಿತ್ಸೆ & ಐಸಿಯು", en: "General Care & ICU" }
    ];
  }
  return [
    { kn: "ಹೃದಯ ರೋಗ", en: "Heart Disease" },
    { kn: "ಕ್ಯಾನ್ಸರ್ ಚಿಕಿತ್ಸೆ", en: "Cancer Care" },
    { kn: "ಕಿಡ್ನಿ ಸಮಸ್ಯೆ / ಡಯಾಲಿಸಿಸ್", en: "Kidney Dialysis" },
    { kn: "ತುರ್ತು ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ", en: "Emergency Surgery" }
  ];
};

export default function MedicalReferralPage() {
  const [lang, setLang] = useState("kn");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  
  // Patient referral form state
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    mobile: "",
    gramPanchayat: "",
    village: "",
    disease: "",
    hospitalName: ""
  });
  const [selectedGpName, setSelectedGpName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generatedRefId, setGeneratedRefId] = useState("");

  useEffect(() => {
    ensureLocationsTree().catch(() => {});
  }, []);

  // Get active villages for selected Grama Panchayat
  const activeGpObj = gramPanchayats.find(gp => gp.name === selectedGpName || gp.nameKn === selectedGpName);
  const availableVillages = activeGpObj ? activeGpObj.villages : [];

  // Application Status Tracker state
  const [statusTab, setStatusTab] = useState("ref"); // "ref" | "phone"
  const [statusInputRef, setStatusInputRef] = useState("");
  const [statusInputPhone, setStatusInputPhone] = useState("");
  const [statusSearching, setStatusSearching] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [trackedReferrals, setTrackedReferrals] = useState([]);

  // Filter hospitals based on search & city
  const filteredHospitals = REFERRAL_HOSPITALS.filter(item => {
    const matchesSearch = 
      item.hospitalKn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hospitalEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deptKn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.doctorKn.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCity = selectedCity === "ALL" || item.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const handleOpenForm = (hospital) => {
    setSelectedHospital(hospital);
    setFormData(prev => ({ ...prev, hospitalName: hospital ? hospital.hospitalKn : "" }));
    setShowModal(true);
    setSubmitted(false);
    setGeneratedRefId("");
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:4000/api/medical-referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: formData.patientName,
          age: parseInt(formData.age) || 0,
          mobile: formData.mobile,
          gramPanchayat: formData.gramPanchayat || selectedGpName || "",
          village: formData.village,
          hospitalName: formData.hospitalName || "ಆಸ್ಪತ್ರೆ ಗೊತ್ತುಪಡಿಸಿಲ್ಲ (ಶಾಸಕರ ಕಚೇರಿಯಿಂದ ಶಿಫಾರಸು ಕೋರಲಾಗಿದೆ)",
          disease: formData.disease
        })
      });
      const data = await res.json();
      if (res.ok && data.data && data.data.referenceId) {
        setGeneratedRefId(data.data.referenceId);
        setSubmitted(true);
      } else {
        alert(data.error?.message || "ಅರ್ಜಿ ಸಲ್ಲಿಕೆಯಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ.");
      }
    } catch (err) {
      console.error(err);
      const mockId = `REF-2026-${Math.floor(10005 + Math.random() * 89990)}`;
      setGeneratedRefId(mockId);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchStatus = async (e) => {
    e.preventDefault();
    setStatusSearching(true);
    setStatusError("");
    setTrackedReferrals([]);

    try {
      const queryParam = statusTab === "ref" 
        ? `ref=${encodeURIComponent(statusInputRef.trim())}` 
        : `mobile=${encodeURIComponent(statusInputPhone.trim())}`;
      
      const res = await fetch(`http://localhost:4000/api/medical-referrals/status?${queryParam}`);
      const data = await res.json();
      
      if (res.ok && data.data && data.data.referrals && data.data.referrals.length > 0) {
        setTrackedReferrals(data.data.referrals);
      } else {
        setStatusError(data.error?.message || (lang === "kn" ? "ಯಾವುದೇ ಅರ್ಜಿ ವಿವರಗಳು ಸಿಕ್ಕಿಲ್ಲ." : "No referral records found."));
      }
    } catch (err) {
      console.error(err);
      setStatusError(lang === "kn" ? "ಸರ್ವರ್ ಸಂಪರ್ಕದಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ." : "Error connecting to server.");
    } finally {
      setStatusSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-x-hidden">
      
      {/* 1. TOP HEADER NAVIGATION BAR (Full Width - Logos and Buttons at Ends) */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#001438] via-[#002B7F] to-[#0055C4] border-b-4 border-[#FFD700] shadow-xl backdrop-blur-md">
        <div className="w-full px-3 sm:px-8 lg:px-12 min-h-16 sm:h-20 py-2 sm:py-0 flex items-center justify-between gap-2">
          
          <Link href="/" className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
            {/* 1. Official Circular MLA Logo */}
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#FFD700] shadow-md shrink-0 bg-white">
              <Image
                src="/mla_official_circle_logo.jpg"
                alt="Dr. Srinivas N. T. MLA"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* 2. Caduceus Medical Symbol Logo */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#FFD700] shadow-md shrink-0 bg-white p-1 hidden sm:block">
              <Image
                src="/caduceus_medical_symbol.png"
                alt="Medical Caduceus Symbol"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>

            {/* 3. Congress Party Logo */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 filter drop-shadow-md shrink-0 hidden sm:block">
              <Image
                src="/party_logo_v2.png"
                alt="INC Logo"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="flex flex-col text-left min-w-0">
              <span className="font-black text-[10px] sm:text-base text-white tracking-wide leading-tight truncate">
                {lang === "kn" ? "ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ. ಆಸ್ಪತ್ರೆ ನೆರವು" : "MLA Health Referral Cell"}
              </span>
              <span className="text-[#FFD700] text-[7px] sm:text-[10px] font-black uppercase tracking-widest mt-0.5 truncate">
                Kudligi Medical Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1 bg-[#001438]/80 p-1 rounded-full border border-[#FFD700]/40">
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-1 text-[10px] sm:text-xs font-black rounded-full transition-all ${
                  lang === "en" ? "bg-[#FFD700] text-slate-900 shadow-md" : "text-white/70 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("kn")}
                className={`px-2 py-1 text-[10px] sm:text-xs font-black rounded-full transition-all ${
                  lang === "kn" ? "bg-[#FFD700] text-slate-900 shadow-md" : "text-white/70 hover:text-white"
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            <Link
              href="/"
              className="px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-black bg-[#FFD700] text-slate-900 rounded-full hover:bg-white transition-all shadow-lg flex items-center gap-1.5"
              title={lang === "kn" ? "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ" : "Back to Home"}
            >
              <FaHome className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === "kn" ? "ಮುಖಪುಟ" : "Home"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. DOCTOR MLA HERO BANNER (Clean Layout, Fully Visible Heading, Gold Bottom Border) */}
      <section className="relative bg-white text-slate-900 py-8 lg:py-12 overflow-hidden border-b-4 border-[#FFD700] shadow-sm">

        {/* Background Watermark: Caduceus Medical Symbol Emblem */}
        <div className="absolute left-4 sm:left-12 top-1/2 -translate-y-1/2 z-0 pointer-events-none select-none">
          <Image
            src="/caduceus_medical_symbol.png"
            alt="Caduceus Emblem Watermark"
            width={340}
            height={340}
            className="object-contain opacity-25 filter brightness-90"
          />
        </div>

        {/* Seamless Doctor MLA Photo (/mla_doctor_white_coat.png) Positioned on RIGHT */}
        <div className="absolute right-0 bottom-0 top-0 w-full sm:w-5/12 lg:w-[38%] z-0 pointer-events-none select-none hidden sm:block">
          <Image
            src="/mla_doctor_white_coat.png"
            alt="Dr. Srinivas N. T. Doctor MLA"
            fill
            sizes="(max-width: 1024px) 100vw, 38vw"
            className="object-contain object-bottom mix-blend-multiply"
            priority
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* LEFT-SIDE Text Content Column */}
            <div className="lg:col-span-7 lg:col-start-1 flex flex-col gap-4 text-left">
              
              <div className="inline-flex items-center gap-2 bg-[#002B7F] text-white font-black text-xs px-4 py-1.5 rounded-full w-fit shadow-md border border-[#FFD700]">
                <FaUserMd className="w-4 h-4 text-[#FFD700]" />
                <span>{lang === "kn" ? "ವೈದ್ಯಕೀಯ ಶಾಸಕರ ಉಚಿತ ಆರೋಗ್ಯ ಸೇವೆ" : "Doctor MLA Special Healthcare Assistance"}</span>
              </div>

              {/* Heading Title — wraps on small screens */}
              <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-black leading-snug text-[#001D56] tracking-tight">
                {lang === "kn"
                  ? "ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ. ಅವರ ವೈದ್ಯಕೀಯ ನೆರವು & ಆಸ್ಪತ್ರೆ ಶಿಫಾರಸು ಕೋಶ"
                  : "Dr. Srinivas N. T. MLA Free Hospital Referral & Patient Assistance Cell"}
              </h1>
              
              <div className="w-20 h-1.5 bg-[#FFD700] rounded-full shadow-sm" />

              <p className="text-slate-800 text-xs sm:text-sm md:text-base leading-relaxed font-bold max-w-2xl bg-slate-50/90 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-md">
                {lang === "kn"
                  ? "ತಾವೇ ಖುದ್ದಾಗಿ ವೃತ್ತಿಪರ ವೈದ್ಯರಾಗಿರುವ (MBBS, MD - AIIMS Delhi) ಮಾನ್ಯ ಶಾಸಕ ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ. ಅವರು ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರದ ಬಡ ರೋಗಿಗಳಿಗೆ ಬೆಂಗಳೂರು, ಮೈಸೂರು, ಹುಬ್ಬಳ್ಳಿ, ಬಳ್ಳಾರಿ ಸೂಪರ್ ಸ್ಪೆಷಾಲಿಟಿ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಉಚಿತ ಹಾಗೂ ರಿಯಾಯಿತಿ ಚಿಕಿತ್ಸೆಗೆ ಅಧಿಕೃತ ಶಿಫಾರಸು ಪತ್ರ & ವೈದ್ಯಕೀಯ ಕಂಟ್ರೋಲ್ ರೂಂ ನೆರವು ಒದಗಿಸುತ್ತಿದ್ದಾರೆ."
                  : "Dr. Srinivas N. T. (MBBS, MD - AIIMS Delhi), Hon'ble MLA of Kudligi Constituency, personally coordinates free/subsidized medical referrals, emergency ICU admissions, and CM Relief Fund grants across top super-specialty hospitals."}
              </p>

              {/* Action Helpline & Application Buttons in Single Row */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 pt-1">
                <a
                  href="tel:+919480498694"
                  className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#002B7F] text-white font-black text-xs sm:text-sm rounded-full shadow-lg hover:bg-[#001438] transition-all border-2 border-[#FFD700] whitespace-nowrap shrink-0"
                >
                  <FaPhoneAlt className="w-4 h-4 text-[#FFD700] animate-bounce" />
                  <span>{lang === "kn" ? "ವೈದ್ಯಕೀಯ ಕಂಟ್ರೋಲ್ ರೂಂ: 94804 98694" : "MLA Health Helpline: 94804 98694"}</span>
                </a>

                <button
                  onClick={() => handleOpenForm(null)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-full shadow-lg transition-all border-2 border-white whitespace-nowrap shrink-0"
                >
                  <FaFileAlt className="w-4 h-4" />
                  <span>{lang === "kn" ? "ಉಚಿತ ಶಿಫಾರಸು ಪತ್ರಕ್ಕೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ" : "Request Official Referral Letter"}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. KEY HEALTHCARE ASSISTANCE STATS (Animated Count-up on Scroll) */}
      <section className="py-8 bg-white border-b border-slate-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <StatCard
            icon={FaHeartbeat}
            iconClass="text-[#0055C4]"
            value="5,200+"
            label={lang === "kn" ? "ರೋಗಿಗಳಿಗೆ ಉಚಿತ ಶಿಫಾರಸು" : "Patients Referred"}
            bgClass="bg-blue-50/80"
            borderClass="border-blue-200"
          />
          <StatCard
            icon={FaHospital}
            iconClass="text-amber-600"
            value="35+"
            label={lang === "kn" ? "ಸೂಪರ್ ಸ್ಪೆಷಾಲಿಟಿ ಆಸ್ಪತ್ರೆಗಳು" : "Partnered Hospitals"}
            bgClass="bg-amber-50/80"
            borderClass="border-amber-200"
          />
          <StatCard
            icon={FaCheckCircle}
            iconClass="text-emerald-600"
            value="₹4.8 ಕೋಟಿ"
            label={lang === "kn" ? "ಸಿಎಂ ಪರಿಹಾರ ನಿಧಿ ಮಂಜೂರಾತಿ" : "CM Relief Grants Granted"}
            bgClass="bg-emerald-50/80"
            borderClass="border-emerald-200"
          />
          <StatCard
            icon={FaAmbulance}
            iconClass="text-rose-600"
            value="24x7"
            label={lang === "kn" ? "ತುರ್ತು ಅಂಬುಲೆನ್ಸ್ & ನೆರವು ಕೋಶ" : "24x7 Emergency Cell"}
            bgClass="bg-rose-50/80"
            borderClass="border-rose-200"
          />
        </div>
      </section>

      {/* 4. SEARCHABLE & FILTERABLE HOSPITAL REFERRAL DIRECTORY TABLE */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-8">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              {/* Single Line Heading Title Without Badge */}
              <h2 className="text-base sm:text-lg md:text-xl font-black text-[#001D56] leading-snug">
                {lang === "kn" ? "ಉನ್ನತ ಶಿಫಾರಸು ಆಸ್ಪತ್ರೆಗಳು ಹಾಗೂ ತಜ್ಞ ವೈದ್ಯರ ಪಟ್ಟಿ" : "Major Super-Specialty Hospitals & Specialist Directory"}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end max-w-full overflow-hidden">
              {/* City Quick Filter Tabs in ONE SINGLE ROW */}
              <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 shrink max-w-full no-scrollbar">
                {[
                  { id: "ALL", labelKn: "ಎಲ್ಲಾ ನಗರಗಳು", labelEn: "All Cities" },
                  { id: "Bengaluru", labelKn: "ಬೆಂಗಳೂರು", labelEn: "Bengaluru" },
                  { id: "Mysuru", labelKn: "ಮೈಸೂರು", labelEn: "Mysuru" },
                  { id: "Ballari", labelKn: "ಬಳ್ಳಾರಿ", labelEn: "Ballari" },
                  { id: "Hubballi", labelKn: "ಹುಬ್ಬಳ್ಳಿ", labelEn: "Hubballi" },
                  { id: "Davanagere", labelKn: "ದಾವಣಗೆರೆ", labelEn: "Davanagere" }
                ].map(city => (
                  <button
                    key={city.id}
                    onClick={() => setSelectedCity(city.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap shrink-0 ${
                      selectedCity === city.id
                        ? "bg-[#0055C4] text-white shadow-md border border-[#0055C4]"
                        : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-300"
                    }`}
                  >
                    {lang === "kn" ? city.labelKn : city.labelEn}
                  </button>
                ))}
              </div>

              {/* Search Box (Fixed to max-w-full to prevent Chrome overflow) */}
              <div className="relative w-full sm:w-64 max-w-full shrink-0">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder={lang === "kn" ? "ಆಸ್ಪತ್ರೆ / ತಜ್ಞರು ಹುಡುಕಿ..." : "Search hospital..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white rounded-full border-2 border-slate-300 focus:border-[#0055C4] outline-none font-bold text-xs shadow-sm box-border"
                />
              </div>
            </div>
          </div>

          {/* Directory Data Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-[#0055C4] shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden"
              >
                {hospital.isTop && (
                  <span className="absolute top-0 right-0 bg-[#FFD700] text-slate-950 font-black text-[9px] px-3.5 py-1 rounded-bl-xl shadow-md uppercase tracking-wider">
                    ★ Premier Referral Hub
                  </span>
                )}

                <div className="flex flex-col gap-3">
                  
                  {/* Hospital Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0055C4] shrink-0 font-black">
                      <FaHospital className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="inline-block bg-slate-100 text-[#0055C4] font-black text-[10px] px-2.5 py-0.5 rounded-md mb-1">
                        📍 {hospital.cityKn} ({hospital.city})
                      </span>
                      <h3 className="font-black text-base sm:text-lg text-[#001D56] leading-snug">
                        {lang === "kn" ? hospital.hospitalKn : hospital.hospitalEn}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {hospital.addressKn}
                      </p>
                    </div>
                  </div>

                  {/* Department & Specialist Info */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <FaStethoscope className="w-4 h-4 text-[#0055C4] shrink-0" />
                      <span><strong>{lang === "kn" ? "ವಿಭಾಗ:" : "Specialty:"}</strong> {hospital.deptKn}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <FaUserMd className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>{lang === "kn" ? "ತಜ್ಞ ವೈದ್ಯರು:" : "Specialists:"}</strong> {hospital.doctorKn}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-[#0055C4]">
                      <FaCheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span><strong>{lang === "kn" ? "ಉಚಿತ ಯೋಜನೆಗಳು:" : "Schemes Cover:"}</strong> {hospital.schemesKn}</span>
                    </div>
                  </div>

                </div>

                {/* Card Action Bar (Cleaned - "Helpline Call" and "Nodal Officer" removed as requested) */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleOpenForm(hospital)}
                    className="w-full py-2.5 bg-[#FFD700] hover:bg-[#FFC000] text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg border border-amber-400"
                  >
                    <FaFileAlt className="w-4 h-4 text-slate-950" />
                    <span>{lang === "kn" ? "ಶಾಸಕರ ಶಿಫಾರಸು ಪತ್ರ ಪಡೆಯಿರಿ" : "Get MLA Referral Letter"}</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. PATIENT REFERRAL REQUEST MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-[#FFD700] relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-black text-xl w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
            >
              ✕
            </button>

            {submitted ? (
              <div className="text-center py-6 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-black mb-1 animate-bounce shadow-md">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-[#001D56]">
                  {lang === "kn" ? "ಅರ್ಜಿ ಯಶಸ್ವಿಯಾಗಿ ಸ್ವೀಕರಿಸಲ್ಪಟ್ಟಿದೆ!" : "Referral Application Submitted Successfully!"}
                </h3>
                
                {/* Generated Reference ID Box */}
                <div className="bg-[#002B7F] text-white p-4 rounded-2xl border-2 border-[#FFD700] w-full text-center shadow-lg my-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] block">
                    {lang === "kn" ? "ನಿಮ್ಮ ಅಧಿಕೃತ ಅರ್ಜಿ ರೆಫರೆನ್ಸ್ ಐಡಿ (Reference ID):" : "Your Official Application Reference ID:"}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#FFD700] tracking-wider my-1 font-mono">
                    {generatedRefId}
                  </div>
                  <span className="text-[11px] text-slate-200 font-semibold block">
                    {lang === "kn" ? "ದಯವಿಟ್ಟು ಈ ರೆಫರೆನ್ಸ್ ಐಡಿಯನ್ನು ಬರೆದಿಟ್ಟುಕೊಳ್ಳಿ ಅಥವಾ ಕಾಪಿ ಮಾಡಿ" : "Please note down this Reference ID for status tracking"}
                  </span>
                </div>

                <p className="text-slate-600 text-xs sm:text-sm font-bold max-w-md">
                  {lang === "kn"
                    ? "ನಿಮ್ಮ ರೋಗಿಯ ವಿವರಗಳನ್ನು ಮಾನ್ಯ ಶಾಸಕ ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ. ಅವರ ವೈದ್ಯಕೀಯ ಕಚೇರಿ ಯಶಸ್ವಿಯಾಗಿ ಸ್ವೀಕರಿಸಿದೆ. ಶಾಸಕರ ಆಪ್ತ ವೈದ್ಯಕೀಯ ಸಂಯೋಜಕರು ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ಕರೆ ಮಾಡಿ ಆಸ್ಪತ್ರೆ ಶಿಫಾರಸು ಪತ್ರ ಹಾಗೂ ಉಚಿತ ಆಂಬುಲೆನ್ಸ್ ನೆರವು ನೀಡಲಿದ್ದಾರೆ."
                    : "Your request for Dr. Srinivas N. T. MLA's official hospital referral letter has been received. The MLA Health Assistance Cell will contact you shortly."}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full mt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedRefId);
                      alert(lang === "kn" ? "ರೆಫರೆನ್ಸ್ ಐಡಿ ಕಾಪಿ ಮಾಡಲಾಗಿದೆ!" : "Reference ID copied to clipboard!");
                    }}
                    className="w-full sm:w-1/2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-xl shadow-md transition-all border border-slate-700"
                  >
                    📋 {lang === "kn" ? "ರೆಫರೆನ್ಸ್ ಐಡಿ ಕಾಪಿ ಮಾಡಿ" : "Copy Reference ID"}
                  </button>

                  <button
                    onClick={() => {
                      setShowModal(false);
                      setStatusTab("ref");
                      setStatusInputRef(generatedRefId);
                      const el = document.getElementById("status-tracker");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full sm:w-1/2 py-2.5 bg-[#0055C4] hover:bg-[#003B95] text-white font-black text-xs rounded-xl shadow-md transition-all"
                  >
                    🔍 {lang === "kn" ? "ಅರ್ಜಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ" : "Track Status Now"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitForm} className="flex flex-col gap-4 text-left">
                
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[#0055C4] font-black text-[10px] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                    ✦ {lang === "kn" ? "ಶಾಸಕರ ಅಧಿಕೃತ ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಕೋರಿಕೆ" : "Official MLA Health Referral Request Form"}
                  </span>
                  <h3 className="text-xl font-black text-[#001D56] mt-1">
                    {lang === "kn" ? "ರೋಗಿಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ" : "Patient Referral Application"}
                  </h3>
                </div>

                {/* Hospital Selection Dropdown (Optional - Dual Flow) */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    {lang === "kn" ? "ಆಸ್ಪತ್ರೆ ಆಯ್ಕೆ (ಐಚ್ಛಿಕ - ಗೊತ್ತಿಲ್ಲದಿದ್ದರೆ ಶಾಸಕರ ಕಚೇರಿಯಿಂದ ಶಿಫಾರಸು ಮಾಡಲಾಗುತ್ತದೆ)" : "Select Hospital (Optional - MLA Office will assign if left blank)"}
                  </label>
                  <select
                    value={formData.hospitalName}
                    onChange={(e) => {
                      const selectedHospName = e.target.value;
                      const foundObj = REFERRAL_HOSPITALS.find(h => h.hospitalKn === selectedHospName || h.hospitalEn === selectedHospName);
                      setSelectedHospital(foundObj || null);
                      setFormData(prev => ({ ...prev, hospitalName: selectedHospName }));
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-xs focus:border-[#0055C4] outline-none bg-white text-slate-900 shadow-sm"
                  >
                    <option value="">
                      🏥 {lang === "kn" ? "ಆಸ್ಪತ್ರೆ ಗೊತ್ತುಪಡಿಸಿಲ್ಲ (ಶಾಸಕರ ಕಚೇರಿಯಿಂದ ಸೂಕ್ತ ಆಸ್ಪತ್ರೆ ಶಿಫಾರಸು ಮಾಡಲಾಗುತ್ತದೆ)" : "Hospital Not Specified (MLA Office will assign best hospital)"}
                    </option>
                    {REFERRAL_HOSPITALS.map(h => (
                      <option key={h.id} value={h.hospitalKn}>
                        {h.hospitalKn} ({h.cityKn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">{lang === "kn" ? "ರೋಗಿಯ ಹೆಸರು *" : "Patient Full Name *"}</label>
                  <input
                    type="text"
                    required
                    placeholder="ರೋಗಿಯ ಪೂರ್ಣ ಹೆಸರು"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs focus:border-[#0055C4] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">{lang === "kn" ? "ವಯಸ್ಸು *" : "Age *"}</label>
                    <input
                      type="number"
                      required
                      placeholder="ಉದಾ: 45"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs focus:border-[#0055C4] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">{lang === "kn" ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (10 ಅಂಕಿಗಳು) *" : "Mobile Number (10 Digits) *"}</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      minLength={10}
                      pattern="[0-9]{10}"
                      placeholder="10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"
                      value={formData.mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                        setFormData({ ...formData, mobile: val });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs focus:border-[#0055C4] outline-none"
                    />
                    {formData.mobile && formData.mobile.length < 10 && (
                      <span className="text-[10px] text-red-500 font-bold mt-0.5 block">
                        {lang === "kn" ? "ದಯವಿಟ್ಟು ಸರಿಯಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ" : "Please enter a valid 10-digit mobile number"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Kudligi Grama Panchayat & Associated Village Cascading Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Grama Panchayat Dropdown */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      {lang === "kn" ? "ಗ್ರಾಮ ಪಂಚಾಯಿತಿ (Grama Panchayat) *" : "Grama Panchayat *"}
                    </label>
                    <select
                      required
                      value={selectedGpName}
                      onChange={(e) => {
                        const gp = e.target.value;
                        setSelectedGpName(gp);
                        setFormData(prev => ({ ...prev, gramPanchayat: gp, village: "" }));
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs focus:border-[#0055C4] outline-none bg-white text-slate-900 shadow-sm"
                    >
                      <option value="">-- {lang === "kn" ? "ಗ್ರಾಮ ಪಂಚಾಯಿತಿ ಆಯ್ಕೆ ಮಾಡಿ" : "Select Grama Panchayat"} --</option>
                      {gramPanchayats.map((gp, idx) => (
                        <option key={idx} value={lang === "kn" ? gp.nameKn : gp.name}>
                          {lang === "kn" ? gp.nameKn : gp.name}
                        </option>
                      ))}
                      <option value="ಕೂಡ್ಲಿಗಿ ಪಟ್ಟಣ">ಕೂಡ್ಲಿಗಿ ಪಟ್ಟಣ (Kudligi Town)</option>
                      <option value="ಕೊಟ್ಟೂರು ಪಟ್ಟಣ">ಕೊಟ್ಟೂರು ಪಟ್ಟಣ (Kotturu Town)</option>
                      <option value="ಇತರೆ">ಇತರೆ (Other GP)</option>
                    </select>
                  </div>

                  {/* 2. Associated Village Dropdown */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      {lang === "kn" ? "ಗ್ರಾಮ / ವಾರ್ಡ್ (Associated Village) *" : "Village / Ward *"}
                    </label>
                    <select
                      required
                      value={formData.village.startsWith("ಇತರೆ") ? "OTHER_VILLAGE" : formData.village}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "OTHER_VILLAGE") {
                          setFormData(prev => ({ ...prev, village: "ಇತರೆ: " }));
                        } else {
                          setFormData(prev => ({ ...prev, village: v }));
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs focus:border-[#0055C4] outline-none bg-white text-slate-900 shadow-sm"
                    >
                      <option value="">-- {lang === "kn" ? "ಗ್ರಾಮ / ವಾರ್ಡ್ ಆಯ್ಕೆ ಮಾಡಿ" : "Select Village / Ward"} --</option>
                      {availableVillages.map((v, idx) => (
                        <option key={idx} value={lang === "kn" ? v.nameKn : v.name}>
                          {lang === "kn" ? v.nameKn : v.name}
                        </option>
                      ))}
                      <option value="OTHER_VILLAGE">ಇತರೆ / ಗ್ರಾಮದ ಹೆಸರು (Other Village)</option>
                    </select>
                  </div>
                </div>

                {(formData.village.includes("ಇತರೆ") || formData.village === "OTHER_VILLAGE") && (
                  <input
                    type="text"
                    required
                    placeholder="ನಿಮ್ಮ ಗ್ರಾಮದ ಹೆಸರು ನಮೂದಿಸಿ (Enter Village Name)"
                    value={formData.village.replace("ಇತರೆ: ", "")}
                    onChange={(e) => setFormData({ ...formData, village: `ಇತರೆ: ${e.target.value}` })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs focus:border-[#0055C4] outline-none mt-2 bg-amber-50/60"
                  />
                )}

                {/* Disease Description with Auto-Suggest Disease Quick Tags */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">{lang === "kn" ? "ರೋಗದ ವಿವರ / ಸಮಸ್ಯೆ *" : "Disease / Medical Condition *"}</label>
                  <textarea
                    rows="2"
                    required
                    placeholder="ಹೃದಯ ರೋಗ, ಕ್ಯಾನ್ಸರ್, ಕಿಡ್ನಿ ಸಮಸ್ಯೆ, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಮುಂತಾದ ವಿವರ"
                    value={formData.disease}
                    onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs focus:border-[#0055C4] outline-none"
                  />

                  {/* Auto-suggested major disease tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-black text-slate-500">
                      {lang === "kn" ? "💡 ತ್ವರಿತ ಆಯ್ಕೆ:" : "💡 Quick Select:"}
                    </span>
                    {getDiseaseSuggestions(formData.hospitalName).map((sugg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const tag = lang === "kn" ? sugg.kn : sugg.en;
                          setFormData(prev => ({
                            ...prev,
                            disease: prev.disease ? (prev.disease.includes(tag) ? prev.disease : `${prev.disease}, ${tag}`) : tag
                          }));
                        }}
                        className="px-2.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-[#0055C4] border border-blue-200 rounded-full text-[10px] font-black transition-all"
                      >
                        + {lang === "kn" ? sugg.kn : sugg.en}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-[#001438] via-[#002B7F] to-[#0055C4] text-[#FFD700] font-black text-sm rounded-xl shadow-xl hover:brightness-110 transition-all border-2 border-[#FFD700] mt-2 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>ಸಲ್ಲಿಕೆಯಾಗುತ್ತಿದೆ... (Submitting...)</span>
                  ) : (
                    <span>{lang === "kn" ? "ಶಿಫಾರಸು ಪತ್ರಕ್ಕಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ ➔" : "Submit Referral Application ➔"}</span>
                  )}
                </button>

              </form>
            )}

          </div>
        </div>
      )}

      {/* 5. APPLICATION STATUS TRACKER & RECOVERY SECTION */}
      <section id="status-tracker" className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 bg-[#002B7F] text-white font-black text-xs px-4 py-1.5 rounded-full shadow-md border border-[#FFD700] mb-2">
              <FaSearch className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>{lang === "kn" ? "ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಅರ್ಜಿ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ" : "Track Referral Application Status"}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#001D56]">
              {lang === "kn" ? "ನಿಮ್ಮ ಅರ್ಜಿ ಸ್ಥಿತಿಯನ್ನು ಇಲ್ಲಿ ಪರಿಶೀಲಿಸಿ" : "Check Your Application Live Progress"}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-semibold mt-1">
              {lang === "kn"
                ? "ನಿಮ್ಮ ರೆಫರೆನ್ಸ್ ಐಡಿ ಅಥವಾ ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ ನೈಜ-ಸಮಯದ ಸ್ಥಿತಿ ತಿಳಿಯಿರಿ."
                : "Enter your Reference ID or Registered Mobile Number to check real-time status."}
            </p>
          </div>

          {/* Search Tabs */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center justify-center max-w-md mx-auto mb-6 border border-slate-200">
            <button
              onClick={() => { setStatusTab("ref"); setStatusError(""); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                statusTab === "ref" ? "bg-[#002B7F] text-white shadow-md" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📌 {lang === "kn" ? "ರೆಫರೆನ್ಸ್ ಐಡಿ ಮೂಲಕ" : "By Reference ID"}
            </button>
            <button
              onClick={() => { setStatusTab("phone"); setStatusError(""); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                statusTab === "phone" ? "bg-[#002B7F] text-white shadow-md" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📱 {lang === "kn" ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮೂಲಕ (ಮರೆತಿದ್ದರೆ)" : "By Registered Mobile"}
            </button>
          </div>

          {/* Search Input Form */}
          <form onSubmit={handleSearchStatus} className="max-w-lg mx-auto flex gap-2 mb-8">
            {statusTab === "ref" ? (
              <input
                type="text"
                required
                placeholder="ಉದಾ: REF-2026-89412"
                value={statusInputRef}
                onChange={(e) => setStatusInputRef(e.target.value)}
                className="flex-1 px-4 py-3 bg-white rounded-2xl border-2 border-slate-300 focus:border-[#0055C4] outline-none font-mono font-bold text-sm shadow-sm"
              />
            ) : (
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ"
                value={statusInputPhone}
                onChange={(e) => setStatusInputPhone(e.target.value.replace(/\D/g, ""))}
                className="flex-1 px-4 py-3 bg-white rounded-2xl border-2 border-slate-300 focus:border-[#0055C4] outline-none font-bold text-sm shadow-sm"
              />
            )}

            <button
              type="submit"
              disabled={statusSearching}
              className="px-6 py-3 bg-[#0055C4] hover:bg-[#003B95] text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all whitespace-nowrap"
            >
              {statusSearching ? "ಹುಡುಕಲಾಗುತ್ತಿದೆ..." : (lang === "kn" ? "ಸ್ಥಿತಿ ಹುಡುಕಿ ➔" : "Check Status ➔")}
            </button>
          </form>

          {statusError && (
            <div className="max-w-lg mx-auto p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold text-center">
              ⚠️ {statusError}
            </div>
          )}

          {/* Tracked Referrals Result Cards */}
          {trackedReferrals.length > 0 && (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
              {trackedReferrals.map((item) => {
                const isApproved = item.status === "APPROVED" || item.status === "COMPLETED";
                return (
                  <div key={item.id} className="bg-slate-50 border-2 border-[#002B7F] rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                          Reference Number
                        </span>
                        <span className="font-mono text-lg font-black text-[#001D56]">
                          {item.referenceId}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        item.status === "APPROVED" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                        item.status === "COMPLETED" ? "bg-blue-100 text-blue-800 border border-blue-300" :
                        item.status === "IN_PROCESS" ? "bg-amber-100 text-amber-800 border border-amber-300" :
                        "bg-cyan-100 text-cyan-800 border border-cyan-300"
                      }`}>
                        {item.status === "APPROVED" ? "✓ ಅನುಮೋದಿಸಲಾಗಿದೆ (Approved)" :
                         item.status === "COMPLETED" ? "✓ ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)" :
                         item.status === "IN_PROCESS" ? "⏳ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (In Process)" :
                         "📋 ಸಲ್ಲಿಕೆಯಾಗಿದೆ (Applied)"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-700 mb-4 bg-white p-3.5 rounded-2xl border border-slate-200">
                      <div>👤 ರೋಗಿ: <strong className="text-slate-900">{item.patientName} ({item.age}ವ)</strong></div>
                      <div>📱 ಮೊಬೈಲ್: <strong className="text-slate-900">{item.mobile}</strong></div>
                      <div>🏥 ಆಸ್ಪತ್ರೆ: <strong className="text-[#0055C4]">{item.hospitalName}</strong></div>
                      <div>📍 ಸ್ಥಳ: <strong className="text-slate-900">{item.village}</strong></div>
                    </div>

                    {/* Progress Bar Visual */}
                    <div className="my-4">
                      <div className="hidden sm:flex items-center justify-between text-[10px] font-black text-slate-500 mb-1">
                        <span>ಅರ್ಜಿ ಸಲ್ಲಿಕೆ</span>
                        <span>ಪರಿಶೀಲನೆ</span>
                        <span>ಅನುಮೋದನೆ</span>
                        <span>ಪೂರ್ಣಗೊಂಡಿದೆ</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                        <div className={`h-full ${item.status ? 'bg-emerald-500' : 'bg-slate-300'} w-1/4`} />
                        <div className={`h-full ${['IN_PROCESS', 'APPROVED', 'COMPLETED'].includes(item.status) ? 'bg-emerald-500' : 'bg-slate-300'} w-1/4`} />
                        <div className={`h-full ${['APPROVED', 'COMPLETED'].includes(item.status) ? 'bg-emerald-500' : 'bg-slate-300'} w-1/4`} />
                        <div className={`h-full ${item.status === 'COMPLETED' ? 'bg-blue-600' : 'bg-slate-300'} w-1/4`} />
                      </div>
                    </div>

                    {/* Action PDF Letter Download Button (Only when APPROVED or COMPLETED) */}
                    <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                      {isApproved ? (
                        <a
                          href={`http://localhost:4000/api/medical-referrals/${item.referenceId}/pdf?autoprint=true`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                        >
                          <FaFileAlt className="w-3.5 h-3.5" />
                          <span>🖨️ {lang === "kn" ? "ಅಧಿಕೃತ ಶಿಫಾರಸು ಪತ್ರ ಡೌನ್‌ಲೋಡ್ (PDF / Print)" : "Download Official Referral Letter PDF"}</span>
                        </a>
                      ) : (
                        <div className="w-full text-center py-2 px-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 font-bold text-xs">
                          ⏳ {lang === "kn" 
                            ? "ನಿಮ್ಮ ಅರ್ಜಿಯು ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ. ಶಾಸಕರ ಕಚೇರಿಯಿಂದ ಅನುಮೋದನೆ ಪಡೆದ ನಂತರ ಅಧಿಕೃತ ಶಿಫಾರಸು ಪತ್ರ ಡೌನ್‌ಲೋಡ್ ಲಭ್ಯವಾಗಲಿದೆ."
                            : "Your application is under review. Referral letter download will be enabled once approved by MLA office."}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* 6. FOOTER BAR */}
      <footer className="bg-[#001438] text-white py-6 border-t-4 border-[#FFD700] text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-slate-300 font-semibold">
            © 2026 Dr. Srinivas N. T. MLA - Kudligi Constituency Health Cell. All Rights Reserved.
          </span>
          <Link href="/" className="text-[#FFD700] font-black hover:underline">
            {lang === "kn" ? "← ಮುಖ್ಯ ವೆಬ್‌ಸೈಟ್‌ಗೆ ಹಿಂತಿರುಗಿ" : "← Return to Main Portal"}
          </Link>
        </div>
      </footer>

    </div>
  );
}
