import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "th";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
};

// Translations for English and Thai
const translations = {
  // Auth
  signIn: {
    en: "Sign In",
    th: "เข้าสู่ระบบ",
  },
  signUp: {
    en: "Sign Up",
    th: "ลงทะเบียน",
  },
  email: {
    en: "Email",
    th: "อีเมล",
  },
  password: {
    en: "Password",
    th: "รหัสผ่าน",
  },
  confirmPassword: {
    en: "Confirm Password",
    th: "ยืนยันรหัสผ่าน",
  },
  forgotPassword: {
    en: "Forgot Password?",
    th: "ลืมรหัสผ่าน?",
  },
  signInWithGoogle: {
    en: "Sign In with Google",
    th: "เข้าสู่ระบบด้วย Google",
  },
  
  // Dashboard
  dashboard: {
    en: "Dashboard",
    th: "แดชบอร์ด",
  },
  myRecordings: {
    en: "My Recordings",
    th: "การบันทึกของฉัน",
  },
  noRecordings: {
    en: "No recordings yet",
    th: "ยังไม่มีการบันทึก",
  },
  newRecording: {
    en: "New Recording",
    th: "บันทึกใหม่",
  },
  totalRecordings: {
    en: "Total Recordings",
    th: "การบันทึกทั้งหมด",
  },
  totalDuration: {
    en: "Total Duration",
    th: "ระยะเวลาทั้งหมด",
  },
  uploadAudio: {
    en: "Upload Audio",
    th: "อัปโหลดเสียง",
  },
  
  // Recording
  startRecording: {
    en: "Start Recording",
    th: "เริ่มการบันทึก",
  },
  stopRecording: {
    en: "Stop Recording",
    th: "หยุดการบันทึก",
  },
  pauseRecording: {
    en: "Pause Recording",
    th: "หยุดการบันทึกชั่วคราว",
  },
  resumeRecording: {
    en: "Resume Recording",
    th: "ดำเนินการบันทึกต่อ",
  },
  saveRecording: {
    en: "Save Recording",
    th: "บันทึกการบันทึก",
  },
  discardRecording: {
    en: "Discard Recording",
    th: "ยกเลิกการบันทึก",
  },
  recordingName: {
    en: "Recording Name",
    th: "ชื่อการบันทึก",
  },
  recordingDescription: {
    en: "Description (optional)",
    th: "คำอธิบาย (ไม่จำเป็น)",
  },
  
  // Audio Details
  audioDetails: {
    en: "Audio Details",
    th: "รายละเอียดเสียง",
  },
  fileName: {
    en: "File Name",
    th: "ชื่อไฟล์",
  },
  duration: {
    en: "Duration",
    th: "ระยะเวลา",
  },
  createdAt: {
    en: "Created At",
    th: "สร้างเมื่อ",
  },
  deviceInfo: {
    en: "Device Info",
    th: "ข้อมูลอุปกรณ์",
  },
  rename: {
    en: "Rename",
    th: "เปลี่ยนชื่อ",
  },
  delete: {
    en: "Delete",
    th: "ลบ",
  },
  download: {
    en: "Download",
    th: "ดาวน์โหลด",
  },
  share: {
    en: "Share",
    th: "แชร์",
  },
  
  // User Profile
  userProfile: {
    en: "User Profile",
    th: "โปรไฟล์ผู้ใช้",
  },
  displayName: {
    en: "Display Name",
    th: "ชื่อที่แสดง",
  },
  updateProfile: {
    en: "Update Profile",
    th: "อัปเดตโปรไฟล์",
  },
  changePassword: {
    en: "Change Password",
    th: "เปลี่ยนรหัสผ่าน",
  },
  profilePicture: {
    en: "Profile Picture",
    th: "รูปโปรไฟล์",
  },
  
  // Settings
  settings: {
    en: "Settings",
    th: "การตั้งค่า",
  },
  language: {
    en: "Language",
    th: "ภาษา",
  },
  audioQuality: {
    en: "Audio Quality",
    th: "คุณภาพเสียง",
  },
  autoUpload: {
    en: "Auto Upload",
    th: "อัปโหลดอัตโนมัติ",
  },
  english: {
    en: "English",
    th: "อังกฤษ",
  },
  thai: {
    en: "Thai",
    th: "ไทย",
  },
  
  // Misc
  loading: {
    en: "Loading...",
    th: "กำลังโหลด...",
  },
  save: {
    en: "Save",
    th: "บันทึก",
  },
  cancel: {
    en: "Cancel",
    th: "ยกเลิก",
  },
  confirm: {
    en: "Confirm",
    th: "ยืนยัน",
  },
  error: {
    en: "Error",
    th: "ข้อผิดพลาด",
  },
  success: {
    en: "Success",
    th: "สำเร็จ",
  },
  logout: {
    en: "Logout",
    th: "ออกจากระบบ",
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get the language from localStorage
    const savedLanguage = localStorage.getItem("language") as Language;
    
    // If no saved language, try to detect browser language
    if (!savedLanguage) {
      const browserLang = navigator.language.split("-")[0];
      return browserLang === "th" ? "th" : "en";
    }
    
    return savedLanguage || "en";
  });
  
  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };
  
  const t = (key: keyof typeof translations) => {
    return translations[key]?.[language] || key;
  };
  
  const value = {
    language,
    setLanguage,
    t,
  };
  
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
