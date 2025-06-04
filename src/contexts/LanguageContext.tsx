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
  recordingTips: {
    en: "Recording Tips",
    th: "คำแนะนำการบันทึก",
  },
  recordingTips1: {
    en: "Speak clearly and at a consistent pace",
    th: "พูดชัดเจนและอย่างสม่ำเสมอ",
  },
  recordingTips2: {
    en: "Find a quiet location without background noise",
    th: "หาสถานที่ที่สงบไม่มีเสียงรบกวน",
  },
  recordingTips3: {
    en: "Keep your device's microphone about 6-12 inches from your mouth",
    th: "ระยะห่างระหว่างอุปกรณ์กับปากคุณประมาณ 6-12 นิ้ว",
  },
  recordingTips4: {
    en: "Avoid touching or moving your device while recording",
    th: "หลีกเลี่ยงการสัมผัสหรือการเคลื่อนที่ของอุปกรณ์ขณะการบันทึก",
  },
  recordingTips5: {
    en: "Do a short test recording first to check audio quality",
    th: "ทำการบันทึกทดสอบสั้นๆ ก่อนเพื่อตรวจสอบคุณภาพเสียง",
  },
  areYouAbsolutelySure: {
    en: "Are you absolutely sure?",
    th: "คุณต้องการลบทั้งหมดหรือไม่?",
  },
  deleteAllRecordingsDescription: {
    en: "This action cannot be undone. This will permanently delete all your files.",
    th: "การดำเนินการนี้ไม่สามารถยกเลิกได้ การดำเนินการนี้จะลบไฟล์ทั้งหมดอย่างถาวร",
  },
  recordings: {
    en: "recordings",
    th: "ไฟล์",
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
  deleteAllRecordings: {
    en: "Delete All Recordings",
    th: "ลบไฟล์ทั้งหมด",
  },
  yesDeleteAll: {
    en: "Yes, delete all",
    th: "ใช่, ลบทั้งหมด",
  },
  generateTranscription: {
    en: "Generate Transcription",
    th: "ถอดความเสียง",
  },


  // Audio Detail
  audioNotFound: {
    en: "Audio not found",
    th: "ไม่พบเสียง",
  },
  audioDetailsUpdated: {
    en: "Audio details updated",
    th: "อัปเดตรายละเอียดเสียง",
  },
  audioDetailsUpdatedSuccess: {
    en: "Audio details updated successfully",
    th: "อัปเดตรายละเอียดเสียงสำเร็จ",
  },
  audioDetailsUpdatedError: {
    en: "Failed to update audio details",
    th: "ล้มเหลวการอัปเดตรายละเอียดเสียง",
  },
  audioDeleted: {
    en: "Audio deleted",
    th: "ลบเสียง",
  },
  // Transcribe
  transcribe: {
    en: "Transcribe",
    th: "ถอดความ",
  },
  transcribeAudio: {
    en: "Transcribe Audio",
    th: "ถอดความเสียง",
  },
  transcribeButton: {
    en: "Generate Transcription",
    th: "ถอดความเสียง",
  },
  transcribeError: {
    en: "Please enter your API Key to proceed with transcription.",
    th: "กรุณาป้อนคีย์ API เพื่อดำเนินการถอดรหัสเสียง",
  },
  transcribeQuotaExceeded: {
    en: "You have exceeded the API quota. Please wait 24 hours or use a new API key with remaining credits.",
    th: "คุณใช้ API เกินโควตาแล้ว กรุณารอ 24 ชั่วโมง หรือใช้ API Key ใหม่ที่มีเครดิตเหลืออยู่",
  },
  transcribeSuccess: {
    en: "Transcription generated successfully",
    th: "ถอดรหัสเสียงสำเร็จ",
  },
  transcribeErrorBodyText: {
    en: "No additional error information from API.",
    th: "ไม่มีข้อมูลข้อผิดพลาดเพิ่มเติมจาก API",
  },
  audioCapture: {
    en: "Audio Capture",
    th: "บันทึกเสียงจากหน้าจอ",
  },

  // Audio Capture Page
  audioCaptureLimitations: {
    en: "Audio Recording Limitations and Guidelines",
    th: "ข้อจำกัดและคำแนะนำเกี่ยวกับการบันทึกเสียง"
  },
  knownLimitations: {
    en: "Known Limitations:",
    th: "ข้อจำกัดที่ควรทราบ:"
  },
  browserSupport: {
    en: "Some browsers (like Safari, Firefox) may not support MediaRecorder for tab or screen audio",
    th: "เบราว์เซอร์บางตัว (เช่น Safari, Firefox) อาจไม่รองรับ MediaRecorder สำหรับเสียงจากแท็บหรือหน้าจอ"
  },
  tabAudioSharing: {
    en: "Tab audio sharing is limited to specific cases, e.g., Chrome requires selecting 'Share tab audio' when sharing screen",
    th: "การแชร์เสียงจากแท็บทำได้เฉพาะบางกรณี เช่น Chrome ต้องเลือก 'Share tab audio' ตอนแชร์หน้าจอ"
  },
  displayMediaLimitation: {
    en: "Audio recording from getDisplayMedia only works with tab audio, not microphone",
    th: "การบันทึกเสียงจาก getDisplayMedia จะใช้ได้เฉพาะเสียงจากแท็บ ไม่ใช่เสียงจากไมโครโฟน"
  },
  multiSourceLimitation: {
    en: "Cannot record from multiple tabs or audio sources simultaneously",
    th: "ไม่สามารถบันทึกพร้อมกันหลายแท็บหรือหลายแหล่งเสียงได้"
  },
  supportedFeatures: {
    en: "Supported Features:",
    th: "คุณสมบัติที่รองรับ:"
  },
  supportedBrowsers: {
    en: "Supported browsers: Chrome (recommended), Edge (some versions)",
    th: "รองรับเบราว์เซอร์: Chrome (แนะนำ), Edge (บางเวอร์ชัน)"
  },
  supportedAudioFormat: {
    en: "Supported audio format: audio/webm (Opus codec)",
    th: "รองรับรูปแบบเสียง: audio/webm (Opus codec)"
  },
  waveformSupport: {
    en: "Supports real-time waveform visualization using AnalyserNode",
    th: "รองรับการแสดงภาพ waveform แบบเรียลไทม์จาก AnalyserNode"
  },
  screenRecordingSupport: {
    en: "Can record audio with screen video (but this code only uses audio)",
    th: "สามารถบันทึกเสียงพร้อมวิดีโอหน้าจอได้ (แต่ในโค้ดนี้จะใช้เสียงเท่านั้น)"
  },
  testingRecommendation: {
    en: "* It's recommended to test before actual use in each browser to prevent errors",
    th: "* แนะนำให้ทดสอบก่อนใช้งานจริงในแต่ละเบราว์เซอร์เพื่อป้องกันข้อผิดพลาด"
  },
  previewRecording: {
    en: "Preview Recording:",
    th: "ตัวอย่างการบันทึก:"
  },
  recordingInProgress: {
    en: "Recording in progress",
    th: "กำลังบันทึก"
  },

  // Authentication Error Messages
  invalidCredentials: {
    en: "Invalid email or password. Please check your credentials and try again.",
    th: "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบข้อมูลและลองอีกครั้ง"
  },
  userNotFound: {
    en: "No account found with this email address.",
    th: "ไม่พบบัญชีที่ใช้อีเมลนี้"
  },
  wrongPassword: {
    en: "Incorrect password. Please try again.",
    th: "รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง"
  },
  invalidEmailFormat: {
    en: "Invalid email address format.",
    th: "รูปแบบอีเมลไม่ถูกต้อง"
  },
  userDisabled: {
    en: "This account has been disabled. Please contact support.",
    th: "บัญชีนี้ถูกปิดการใช้งาน กรุณาติดต่อฝ่ายสนับสนุน"
  },
  tooManyRequests: {
    en: "Too many failed attempts. Please try again later.",
    th: "พยายามเข้าสู่ระบบล้มเหลวหลายครั้ง กรุณาลองอีกครั้งในภายหลัง"
  },
  networkError: {
    en: "Network error. Please check your internet connection.",
    th: "ข้อผิดพลาดของเครือข่าย กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต"
  },
  loginError: {
    en: "An error occurred during login. Please try again.",
    th: "เกิดข้อผิดพลาดระหว่างการเข้าสู่ระบบ กรุณาลองอีกครั้ง"
  },
  loginSuccess: {
    en: "Successfully logged in",
    th: "เข้าสู่ระบบสำเร็จ"
  },
  googleLoginSuccess: {
    en: "Successfully logged in with Google",
    th: "เข้าสู่ระบบด้วย Google สำเร็จ"
  },
  enterValidEmail: {
    en: "Please enter a valid email address",
    th: "กรุณากรอกอีเมลที่ถูกต้อง"
  },
  passwordMinLength: {
    en: "Password must be at least 6 characters",
    th: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
  },
  enterPassword: {
    en: "Enter your password",
    th: "กรอกรหัสผ่าน"
  },
  invalidEmailField: {
    en: "Invalid email format",
    th: "รูปแบบอีเมลไม่ถูกต้อง"
  },
  invalidCredentialsField: {
    en: "Invalid credentials",
    th: "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง"
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
