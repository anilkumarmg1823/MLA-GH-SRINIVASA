"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  FaUserMd, FaHospital, FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt, 
  FaSearch, FaHeartbeat, FaFileAlt, FaCheckCircle, FaAmbulance, 
  FaStethoscope, FaHome, FaAngleRight, FaShareAlt, FaCalendarCheck
} from "react-icons/fa";

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
    village: "",
    disease: "",
    hospitalName: ""
  });
  const [submitted, setSubmitted] = useState(false);

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
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#001438] via-[#002B7F] to-[#0055C4] border-b-4 border-[#FFD700] shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 filter drop-shadow-md">
              <Image src="/party_logo_v2.png" alt="INC Logo" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm sm:text-base text-white tracking-wide">
                {lang === "kn" ? "ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ. ಶಾಸಕರ ಆಸ್ಪತ್ರೆ ನೆರವು ಕೋಶ" : "Dr. Srinivas N. T. MLA Health Referral Cell"}
              </span>
              <span className="text-[#FFD700] text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                Kudligi Constituency Medical Service Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#001438]/80 p-1 rounded-full border border-[#FFD700]/40">
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 text-xs font-black rounded-full transition-all ${
                  lang === "en" ? "bg-[#FFD700] text-slate-900 shadow-md" : "text-white/70 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("kn")}
                className={`px-2.5 py-1 text-xs font-black rounded-full transition-all ${
                  lang === "kn" ? "bg-[#FFD700] text-slate-900 shadow-md" : "text-white/70 hover:text-white"
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            <Link
              href="/"
              className="px-4 py-2 text-xs sm:text-sm font-black bg-[#FFD700] text-slate-900 rounded-full hover:bg-white transition-all shadow-lg flex items-center gap-1.5"
            >
              <FaHome className="w-3.5 h-3.5" />
              <span>{lang === "kn" ? "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ" : "Back to Home"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. DOCTOR MLA HERO BANNER */}
      <section className="relative bg-gradient-to-r from-[#001438] via-[#002B7F] to-[#0055C4] text-white py-12 lg:py-16 overflow-hidden border-b-4 border-[#FFD700] shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
          <Image
            src="/kudligi_people_banner_bg.png"
            alt="Healthcare Background"
            fill
            className="object-cover filter brightness-125 contrast-110 mix-blend-overlay"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 flex flex-col gap-4 text-left">
            
            <div className="inline-flex items-center gap-2 bg-[#FFD700] text-slate-950 font-black text-xs px-4 py-1.5 rounded-full w-fit shadow-lg border border-white">
              <FaUserMd className="w-4 h-4 text-[#001D56]" />
              <span>{lang === "kn" ? "ವೈದ್ಯಕೀಯ ಶಾಸಕರ ಉಚಿತ ಆರೋಗ್ಯ ಸೇವೆ" : "Doctor MLA Special Healthcare Assistance"}</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black leading-snug drop-shadow-md text-white">
              {lang === "kn"
                ? "ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ. ಅವರ ವೈದ್ಯಕೀಯ ನೆರವು & ಸೂಪರ್ ಸ್ಪೆಷಾಲಿಟಿ ಆಸ್ಪತ್ರೆ ಶಿಫಾರಸು ಕೋಶ"
                : "Dr. Srinivas N. T. MLA Free Hospital Referral & Patient Assistance Cell"}
            </h1>

            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-semibold max-w-3xl bg-[#001438]/70 backdrop-blur-md p-4 sm:p-4.5 rounded-2xl border border-[#FFD700]/30 shadow-xl">
              {lang === "kn"
                ? "ತಾವೇ ಖುದ್ದಾಗಿ ವೃತ್ತಿಪರ ವೈದ್ಯರಾಗಿರುವ (MBBS) ಮಾನ್ಯ ಶಾಸಕ ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ. ಅವರು ಕೂಡ್ಲಿಗಿ ಕ್ಷೇತ್ರದ ಪ್ರತಿಯೊಬ್ಬ ಬಡ ಹಾಗೂ ಅಗತ್ಯವಿರುವ ರೋಗಿಗೆ ಬೆಂಗಳೂರು, ಮೈಸೂರು, ಹುಬ್ಬಳ್ಳಿ, ಬಳ್ಳಾರಿ ಮುಂತಾದ ಪ್ರಮುಖ ನಗರಗಳ ಪ್ರಸಿದ್ಧ ಸರಕಾರಿ ಹಾಗೂ ಸೂಪರ್ ಸ್ಪೆಷಾಲಿಟಿ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಉಚಿತ ಹಾಗೂ ರಿಯಾಯಿತಿ ದರದಲ್ಲಿ ಗುಣಮಟ್ಟದ ಚಿಕಿತ್ಸೆ ದೊರೆಯುವಂತೆ ಶಾಸಕರ ಅಧಿಕೃತ ಶಿಫಾರಸು ಪತ್ರ ಹಾಗೂ ವೈದ್ಯಕೀಯ ಕೋಶದ ನೆರವು ಒದಗಿಸುತ್ತಿದ್ದಾರೆ."
                : "Dr. Srinivas N. T. (MBBS), Hon'ble MLA of Kudligi Constituency, personally coordinates free/subsidized medical referrals, emergency ICU admissions, and CM Relief Fund grants for Kudligi patients across top super-specialty hospitals in Bengaluru, Mysuru, Ballari, and Hubballi."}
            </p>

            {/* Emergency Helpline Banner */}
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <a
                href="tel:+919480498694"
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#FFD700] text-slate-950 font-black text-xs sm:text-sm rounded-full shadow-2xl hover:bg-white hover:scale-105 transition-all border-2 border-white"
              >
                <FaPhoneAlt className="w-4 h-4 text-rose-600 animate-bounce" />
                <span>{lang === "kn" ? "ಶಾಸಕರ ವೈದ್ಯಕೀಯ ಕಂಟ್ರೋಲ್ ರೂಂ: 94804 98694" : "MLA Health Helpline: 94804 98694"}</span>
              </a>

              <button
                onClick={() => handleOpenForm(null)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs sm:text-sm rounded-full shadow-2xl hover:scale-105 transition-all border-2 border-white"
              >
                <FaFileAlt className="w-4 h-4" />
                <span>{lang === "kn" ? "ಉಚಿತ ಶಿಫಾರಸು ಪತ್ರಕ್ಕೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ" : "Request Official Referral Letter"}</span>
              </button>
            </div>

          </div>

          {/* Doctor MLA Badge & Photo Card */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative w-64 sm:w-72 lg:w-80 bg-white/10 backdrop-blur-xl p-5 rounded-3xl border-2 border-[#FFD700]/50 shadow-2xl text-center flex flex-col items-center">
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-[#FFD700] shadow-2xl mb-3 bg-white">
                <Image
                  src="/Picsart_26-02-05_14-31-10-288 (1).png"
                  alt="Dr. Srinivas N. T. Doctor MLA"
                  fill
                  sizes="208px"
                  className="object-cover object-top"
                  priority
                />
              </div>
              <span className="bg-[#FFD700] text-slate-950 font-black text-[10px] px-3.5 py-1 rounded-full shadow-md uppercase tracking-wider mb-1">
                ✦ Doctor MLA (MBBS)
              </span>
              <h3 className="font-black text-lg sm:text-xl text-white drop-shadow-sm">
                ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ.
              </h3>
              <p className="text-xs font-bold text-slate-200 mt-0.5">
                {lang === "kn" ? "ಶಾಸಕರು - ಕೂಡ್ಲಿಗಿ ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ" : "MLA - Kudligi Constituency"}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. KEY HEALTHCARE ASSISTANCE STATS */}
      <section className="py-8 bg-white border-b border-slate-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200">
            <FaHeartbeat className="w-7 h-7 text-[#0055C4] mx-auto mb-1.5" />
            <div className="text-2xl sm:text-3xl font-black text-[#001D56]">5,200+</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">{lang === "kn" ? "ರೋಗಿಗಳಿಗೆ ಉಚಿತ ಶಿಫಾರಸು" : "Patients Referred"}</div>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
            <FaHospital className="w-7 h-7 text-amber-600 mx-auto mb-1.5" />
            <div className="text-2xl sm:text-3xl font-black text-[#001D56]">35+</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">{lang === "kn" ? "ಸೂಪರ್ ಸ್ಪೆಷಾಲಿಟಿ ಆಸ್ಪತ್ರೆಗಳು" : "Partnered Hospitals"}</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
            <FaCheckCircle className="w-7 h-7 text-emerald-600 mx-auto mb-1.5" />
            <div className="text-2xl sm:text-3xl font-black text-[#001D56]">₹4.8 ಕೋಟಿ</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">{lang === "kn" ? "ಸಿಎಂ ಪರಿಹಾರ ನಿಧಿ ಮಂಜೂರಾತಿ" : "CM Relief Grants Granted"}</div>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200">
            <FaAmbulance className="w-7 h-7 text-rose-600 mx-auto mb-1.5" />
            <div className="text-2xl sm:text-3xl font-black text-[#001D56]">24x7</div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">{lang === "kn" ? "ತುರ್ತು ಅಂಬುಲೆನ್ಸ್ & ನೆರವು ಕೋಶ" : "24x7 Emergency Cell"}</div>
          </div>
        </div>
      </section>

      {/* 4. SEARCHABLE & FILTERABLE HOSPITAL REFERRAL DIRECTORY TABLE */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="inline-flex items-center gap-2 bg-[#0055C4]/10 border border-[#0055C4]/30 text-[#0055C4] text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full mb-1">
                ✦ {lang === "kn" ? "ಆಸ್ಪತ್ರೆ ಹಾಗೂ ವೈದ್ಯಕೀಯ ಶಿಫಾರಸು ಪಟ್ಟಿ" : "Hospital & Specialist Referral Directory"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#001D56]">
                {lang === "kn" ? "ಉನ್ನತ ಶಿಫಾರಸು ಆಸ್ಪತ್ರೆಗಳು ಹಾಗೂ ತಜ್ಞ ವೈದ್ಯರ ಪಟ್ಟಿ" : "Major Super-Specialty Hospitals & Specialist Directory"}
              </h2>
            </div>

            {/* City Quick Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
                    selectedCity === city.id
                      ? "bg-[#0055C4] text-white shadow-md border border-[#0055C4]"
                      : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-300"
                  }`}
                >
                  {lang === "kn" ? city.labelKn : city.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xl w-full mx-auto">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder={lang === "kn" ? "ಆಸ್ಪತ್ರೆ, ವಿಭಾಗ ಅಥವಾ ವೈದ್ಯರ ಹೆಸರನ್ನು ಹುಡುಕಿ..." : "Search by hospital, specialty or doctor name..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border-2 border-slate-300 focus:border-[#0055C4] outline-none font-bold text-sm shadow-sm"
            />
          </div>

          {/* Directory Data Cards / Table */}
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

                  <div className="text-xs font-bold text-slate-600 bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between">
                    <span>👨‍💼 <strong>{lang === "kn" ? "ಶಾಸಕರ ಆಸ್ಪತ್ರೆ ಪ್ರತಿನಿಧಿ:" : "MLA Nodal Officer:"}</strong></span>
                    <span className="text-[#001D56] font-black">{hospital.nodalOfficerKn}</span>
                  </div>

                </div>

                {/* Card Action Bar */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <a
                    href={`tel:+91${hospital.contactPhone}`}
                    className="w-full sm:w-auto px-4 py-2 bg-[#001D56] hover:bg-[#0055C4] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <FaPhoneAlt className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>{lang === "kn" ? "ಹೆಲ್ಪ್‌ಲೈನ್ ಕರೆ ಮಾಡಿ" : "Call Hospital Cell"}</span>
                  </a>

                  <button
                    onClick={() => handleOpenForm(hospital)}
                    className="w-full sm:w-auto px-4 py-2 bg-[#FFD700] hover:bg-[#FFC000] text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <FaFileAlt className="w-3.5 h-3.5" />
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
              <div className="text-center py-8 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-black mb-2 animate-bounce">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-[#001D56]">
                  {lang === "kn" ? "ಅರ್ಜಿ ಯಶಸ್ವಿಯಾಗಿ ಸ್ವೀಕರಿಸಲ್ಪಟ್ಟಿದೆ!" : "Referral Application Submitted Successfully!"}
                </h3>
                <p className="text-slate-600 text-sm font-bold max-w-md">
                  {lang === "kn"
                    ? "ನಿಮ್ಮ ರೋಗಿಯ ವಿವರಗಳನ್ನು ಮಾನ್ಯ ಶಾಸಕ ಡಾ. ಶ್ರೀನಿವಾಸ್ ಎನ್. ಟಿ. ಅವರ ವೈದ್ಯಕೀಯ ಕಚೇರಿ ಯಶಸ್ವಿಯಾಗಿ ಸ್ವೀಕರಿಸಿದೆ. ಶಾಸಕರ ಆಪ್ತ ವೈದ್ಯಕೀಯ ಸಂಯೋಜಕರು ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ಕರೆ ಮಾಡಿ ಆಸ್ಪತ್ರೆ ಶಿಫಾರಸು ಪತ್ರ ಹಾಗೂ ಉಚಿತ ಆಂಬುಲೆನ್ಸ್ ನೆರವು ನೀಡಲಿದ್ದಾರೆ."
                    : "Your request for Dr. Srinivas N. T. MLA's official hospital referral letter has been received. The MLA Health Assistance Cell will contact you shortly on your registered mobile number."}
                </p>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 w-full text-xs font-bold text-[#001D56] mt-2">
                  📞 ತುರ್ತು ನೆರವಿಗೆ ತಕ್ಷಣ ಕರೆ ಮಾಡಿ: <strong>+91 94804 98694</strong>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-4 px-6 py-2.5 bg-[#0055C4] text-white font-black text-xs rounded-full shadow-lg"
                >
                  {lang === "kn" ? "ಮುಚ್ಚಿ" : "Close Window"}
                </button>
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

                {selectedHospital && (
                  <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-xs font-bold text-[#001D56]">
                    📍 <strong>{lang === "kn" ? "ಆಯ್ಕೆಮಾಡಿದ ಆಸ್ಪತ್ರೆ:" : "Selected Hospital:"}</strong> {selectedHospital.hospitalKn}
                  </div>
                )}

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

                <div className="grid grid-cols-2 gap-3">
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
                    <label className="block text-xs font-black text-slate-700 mb-1">{lang === "kn" ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *" : "Mobile Number *"}</label>
                    <input
                      type="tel"
                      required
                      placeholder="10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs focus:border-[#0055C4] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">{lang === "kn" ? "ಕೂಡ್ಲಿಗಿ ಗ್ರಾಮ / ಹೋಬಳಿ *" : "Village / Hobli in Kudligi *"}</label>
                  <input
                    type="text"
                    required
                    placeholder="ಉದಾ: ಕೊಟ್ಟೂರು / ಕಾನಾಹೊಸಹಳ್ಳಿ / ಹೊಸಹಳ್ಳಿ"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs focus:border-[#0055C4] outline-none"
                  />
                </div>

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
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#001438] via-[#002B7F] to-[#0055C4] text-[#FFD700] font-black text-sm rounded-xl shadow-xl hover:brightness-110 transition-all border-2 border-[#FFD700] mt-2"
                >
                  {lang === "kn" ? "ಶಿಫಾರಸು ಪತ್ರಕ್ಕಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ ➔" : "Submit Referral Application ➔"}
                </button>

              </form>
            )}

          </div>
        </div>
      )}

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
