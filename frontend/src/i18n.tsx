import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "hi" | "te" | "ta" | "kn";

const dict: Record<Lang, Record<string, string>> = {
  en: {
    appName: "Community Hero AI",
    tagline: "Hyperlocal civic intelligence powered by Google Gemini.",
    heroBody: "Report potholes, leaks, garbage, and more in your language. AI triages, citizens verify, officers assign, contractors fix — and Gemini verifies the fix.",
    getStarted: "Get Started", learnMore: "Learn More", login: "Login", signup: "Sign Up",
    logout: "Logout", dashboard: "Dashboard", report: "Report Issue", map: "Map",
    wards: "Wards", contractors: "Contractors", predictions: "Predictions", squads: "Fix-It Squads",
    leaderboard: "Leaderboard", profile: "Profile", authority: "Officer Console", budget: "Budget",
    notifications: "Notifications", assistant: "AI Assistant", askQuestion: "Ask anything…",
    photo: "Photo", video: "Video", voice: "Voice", description: "Description", ward: "Ward",
    location: "Location", useMyLocation: "Use my location", submit: "Submit Report",
    analyzing: "Analyzing with AI…", category: "Category", severity: "Severity", department: "Department",
    status: "Status", upvotes: "Upvotes", recent: "Recent Reports", noIssues: "No issues yet.",
    email: "Email", password: "Password", name: "Name", role: "Role", citizen: "Citizen",
    officer: "Municipal Officer", contractor: "Contractor", language: "Language",
    welcome: "Welcome", recordVoice: "Hold to record", stopRecording: "Stop", transcribing: "Transcribing…",
  },
  hi: {
    appName: "कम्युनिटी हीरो एआई",
    tagline: "Google Gemini द्वारा संचालित स्थानीय नागरिक बुद्धिमत्ता।",
    heroBody: "गड्ढे, रिसाव, कचरा और अधिक अपनी भाषा में रिपोर्ट करें। एआई वर्गीकृत करता है, नागरिक सत्यापित करते हैं, अधिकारी सौंपते हैं, ठेकेदार ठीक करते हैं।",
    getStarted: "शुरू करें", learnMore: "और जानें", login: "लॉगिन", signup: "साइन अप",
    logout: "लॉगआउट", dashboard: "डैशबोर्ड", report: "शिकायत दर्ज करें", map: "मानचित्र",
    wards: "वार्ड", contractors: "ठेकेदार", predictions: "भविष्यवाणियाँ", squads: "फिक्स-इट टीमें",
    leaderboard: "लीडरबोर्ड", profile: "प्रोफ़ाइल", authority: "अधिकारी कंसोल", budget: "बजट",
    notifications: "सूचनाएं", assistant: "एआई सहायक", askQuestion: "कुछ भी पूछें…",
    photo: "फोटो", video: "वीडियो", voice: "आवाज़", description: "विवरण", ward: "वार्ड",
    location: "स्थान", useMyLocation: "मेरा स्थान उपयोग करें", submit: "रिपोर्ट जमा करें",
    analyzing: "एआई द्वारा विश्लेषण…", category: "श्रेणी", severity: "गंभीरता", department: "विभाग",
    status: "स्थिति", upvotes: "वोट", recent: "हाल की रिपोर्ट", noIssues: "अभी तक कोई शिकायत नहीं।",
    email: "ईमेल", password: "पासवर्ड", name: "नाम", role: "भूमिका", citizen: "नागरिक",
    officer: "नगर अधिकारी", contractor: "ठेकेदार", language: "भाषा",
    welcome: "स्वागत है", recordVoice: "रिकॉर्ड के लिए दबाएँ", stopRecording: "रोकें", transcribing: "ट्रांसक्राइब हो रहा है…",
  },
  te: {
    appName: "కమ్యూనిటీ హీరో ఏఐ",
    tagline: "Google Gemini ద్వారా శక్తినిచ్చిన స్థానిక పౌర మేధస్సు।",
    heroBody: "గుంటలు, లీకులు, చెత్త మరియు మరిన్నింటిని మీ భాషలో నివేదించండి. AI వర్గీకరిస్తుంది, పౌరులు ధృవీకరిస్తారు, అధికారులు కేటాయిస్తారు, కాంట్రాక్టర్లు సరిచేస్తారు।",
    getStarted: "ప్రారంభించండి", learnMore: "మరింత తెలుసుకోండి", login: "లాగిన్", signup: "నమోదు",
    logout: "లాగౌట్", dashboard: "డాష్‌బోర్డ్", report: "సమస్యను నివేదించండి", map: "మ్యాప్",
    wards: "వార్డులు", contractors: "కాంట్రాక్టర్లు", predictions: "అంచనాలు", squads: "ఫిక్స్-ఇట్ బృందాలు",
    leaderboard: "లీడర్‌బోర్డ్", profile: "ప్రొఫైల్", authority: "అధికారి కన్సోల్", budget: "బడ్జెట్",
    notifications: "నోటిఫికేషన్లు", assistant: "AI సహాయకుడు", askQuestion: "ఏదైనా అడగండి…",
    photo: "ఫోటో", video: "వీడియో", voice: "వాయిస్", description: "వివరణ", ward: "వార్డు",
    location: "స్థానం", useMyLocation: "నా స్థానం ఉపయోగించండి", submit: "నివేదికను సమర్పించండి",
    analyzing: "AI తో విశ్లేషిస్తోంది…", category: "వర్గం", severity: "తీవ్రత", department: "విభాగం",
    status: "స్థితి", upvotes: "ఓట్లు", recent: "ఇటీవలి నివేదికలు", noIssues: "ఇంకా సమస్యలు లేవు.",
    email: "ఇమెయిల్", password: "పాస్‌వర్డ్", name: "పేరు", role: "పాత్ర", citizen: "పౌరుడు",
    officer: "మునిసిపల్ అధికారి", contractor: "కాంట్రాక్టర్", language: "భాష",
    welcome: "స్వాగతం", recordVoice: "రికార్డ్ చేయడానికి నొక్కండి", stopRecording: "ఆపు", transcribing: "ట్రాన్స్‌క్రైబ్ చేస్తోంది…",
  },
  ta: {
    appName: "கம்யூனிட்டி ஹீரோ AI",
    tagline: "Google Gemini ஆல் இயக்கப்படும் உள்ளூர் குடிமை அறிவாற்றல்।",
    heroBody: "பள்ளங்கள், கசிவுகள், குப்பைகள் போன்றவற்றை உங்கள் மொழியில் தெரிவிக்கவும். AI வகைப்படுத்துகிறது, குடிமக்கள் சரிபார்க்கிறார்கள், அதிகாரிகள் ஒதுக்குகிறார்கள்।",
    getStarted: "தொடங்கவும்", learnMore: "மேலும் அறிய", login: "உள்நுழை", signup: "பதிவு",
    logout: "வெளியேறு", dashboard: "டாஷ்போர்டு", report: "புகார் அளி", map: "வரைபடம்",
    wards: "வார்டுகள்", contractors: "ஒப்பந்தக்காரர்கள்", predictions: "முன்னறிவிப்புகள்", squads: "சரிசெய் குழுக்கள்",
    leaderboard: "தலைமைப் பலகை", profile: "சுயவிவரம்", authority: "அதிகாரி கன்சோல்", budget: "வரவுசெலவு",
    notifications: "அறிவிப்புகள்", assistant: "AI உதவியாளர்", askQuestion: "எதையும் கேளுங்கள்…",
    photo: "புகைப்படம்", video: "வீடியோ", voice: "குரல்", description: "விளக்கம்", ward: "வார்டு",
    location: "இடம்", useMyLocation: "எனது இடத்தைப் பயன்படுத்து", submit: "அறிக்கை சமர்ப்பி",
    analyzing: "AI பகுப்பாய்வு…", category: "வகை", severity: "தீவிரம்", department: "துறை",
    status: "நிலை", upvotes: "வாக்குகள்", recent: "சமீபத்திய அறிக்கைகள்", noIssues: "இதுவரை சிக்கல்கள் இல்லை.",
    email: "மின்னஞ்சல்", password: "கடவுச்சொல்", name: "பெயர்", role: "பங்கு", citizen: "குடிமகன்",
    officer: "மாநகராட்சி அதிகாரி", contractor: "ஒப்பந்தக்காரர்", language: "மொழி",
    welcome: "வரவேற்பு", recordVoice: "பதிவு செய்ய அழுத்தவும்", stopRecording: "நிறுத்து", transcribing: "எழுத்து வடிவில்…",
  },
  kn: {
    appName: "ಕಮ್ಯುನಿಟಿ ಹೀರೋ AI",
    tagline: "Google Gemini ನಿಂದ ಶಕ್ತಿಪಡೆದ ಸ್ಥಳೀಯ ನಾಗರಿಕ ಬುದ್ಧಿಮತ್ತೆ।",
    heroBody: "ಗುಂಡಿಗಳು, ಸೋರಿಕೆಗಳು, ಕಸ ಮತ್ತು ಇನ್ನಷ್ಟನ್ನು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ವರದಿ ಮಾಡಿ. AI ವರ್ಗೀಕರಿಸುತ್ತದೆ।",
    getStarted: "ಪ್ರಾರಂಭಿಸಿ", learnMore: "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ", login: "ಲಾಗಿನ್", signup: "ಸೈನ್ ಅಪ್",
    logout: "ಲಾಗ್‌ಔಟ್", dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", report: "ಸಮಸ್ಯೆ ವರದಿ", map: "ನಕ್ಷೆ",
    wards: "ವಾರ್ಡ್‌ಗಳು", contractors: "ಗುತ್ತಿಗೆದಾರರು", predictions: "ಮುನ್ಸೂಚನೆಗಳು", squads: "ಫಿಕ್ಸ್-ಇಟ್ ತಂಡಗಳು",
    leaderboard: "ಲೀಡರ್‌ಬೋರ್ಡ್", profile: "ಪ್ರೊಫೈಲ್", authority: "ಅಧಿಕಾರಿ ಕನ್ಸೋಲ್", budget: "ಬಜೆಟ್",
    notifications: "ಅಧಿಸೂಚನೆಗಳು", assistant: "AI ಸಹಾಯಕ", askQuestion: "ಏನಾದರೂ ಕೇಳಿ…",
    photo: "ಫೋಟೋ", video: "ವೀಡಿಯೊ", voice: "ಧ್ವನಿ", description: "ವಿವರಣೆ", ward: "ವಾರ್ಡ್",
    location: "ಸ್ಥಳ", useMyLocation: "ನನ್ನ ಸ್ಥಳ ಬಳಸಿ", submit: "ವರದಿ ಸಲ್ಲಿಸಿ",
    analyzing: "AI ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ…", category: "ವರ್ಗ", severity: "ತೀವ್ರತೆ", department: "ಇಲಾಖೆ",
    status: "ಸ್ಥಿತಿ", upvotes: "ಮತಗಳು", recent: "ಇತ್ತೀಚಿನ ವರದಿಗಳು", noIssues: "ಇನ್ನೂ ಸಮಸ್ಯೆಗಳಿಲ್ಲ.",
    email: "ಇಮೇಲ್", password: "ಪಾಸ್‌ವರ್ಡ್", name: "ಹೆಸರು", role: "ಪಾತ್ರ", citizen: "ನಾಗರಿಕ",
    officer: "ಪುರಸಭಾ ಅಧಿಕಾರಿ", contractor: "ಗುತ್ತಿಗೆದಾರ", language: "ಭಾಷೆ",
    welcome: "ಸ್ವಾಗತ", recordVoice: "ರೆಕಾರ್ಡ್ ಮಾಡಲು ಒತ್ತಿರಿ", stopRecording: "ನಿಲ್ಲಿಸಿ", transcribing: "ಲಿಪ್ಯಂತರ…",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nCtx = createContext<Ctx>(null as any);
export const useI18n = () => useContext(I18nCtx);

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" }, { code: "hi", label: "हिंदी" },
  { code: "te", label: "తెలుగు" }, { code: "ta", label: "தமிழ்" },
  { code: "kn", label: "ಕನ್ನಡ" },
];

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    (localStorage.getItem("lang") as Lang) || "en"
  );
  useEffect(() => { localStorage.setItem("lang", lang); document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: Lang) => setLangState(l);
  const t = (k: string) => dict[lang]?.[k] || dict.en[k] || k;
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}
