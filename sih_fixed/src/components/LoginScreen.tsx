import React, { useState } from 'react';
import { LanguageCode, DriverProfile, UserRole } from '../types';
import { LANGUAGES, I18N_TRANSLATIONS } from '../data/mockData';
import { speakSpeech } from '../utils/speech';

interface LoginScreenProps {
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  onOpenLangModal: () => void;
  onLoginSuccess: (profile: DriverProfile) => void;
  onSkipLogin: (role?: UserRole) => void;
}

// Preset test profiles for 1-tap instant access
const PRESET_ACCOUNTS: DriverProfile[] = [
  {
    role: 'driver',
    name: 'Rajeshwar Singh',
    phone: '9876543210',
    vehicleNumber: 'AS-01-EC-9921',
    vehicleType: 'Heavy Commercial Truck',
    licenseNumber: 'AS-1420180004921',
    homeHub: 'Guwahati Logistics Park (NH-27)',
    isGuest: false,
  },
  {
    role: 'civilian',
    name: 'Ananya Sharma',
    phone: '9832104567',
    vehicleNumber: 'AS-01-AZ-7700',
    vehicleType: 'Passenger / Private',
    licenseNumber: 'AS-0120210034567',
    homeHub: 'Shillong Highway Route',
    travelMode: 'Personal Vehicle',
    isGuest: false,
  },
  {
    role: 'field_officer',
    name: 'Inspector S. K. Baruah',
    phone: '9435012345',
    department: 'Border Roads Organisation (BRO)',
    badgeNumber: 'BRO-PATROL-409',
    patrolSector: 'NH-27 KM 142 (Lumding - Dima Hasao)',
    vehicleNumber: 'GOV-BRO-409',
    vehicleType: 'Emergency Fleet',
    isGuest: false,
  },
];

// Featured primary languages prominently shown on Step 1
const FEATURED_LANG_CODES: LanguageCode[] = [
  'as', // Assamese
  'hi', // Hindi
  'bn', // Bengali
  'en', // English
  'brx', // Bodo
  'mni', // Manipuri
  'mzo', // Mizo
  'kha', // Khasi
  'grt', // Garo
  'ne', // Nepali
  'pa', // Punjabi
  'or', // Odia
];

const NE_LANG_CODES: LanguageCode[] = [
  'as', // Assamese
  'bn', // Bengali (Tripura & Barak Valley)
  'brx', // Bodo
  'mni', // Manipuri (Meitei)
  'mzo', // Mizo
  'kha', // Khasi
  'grt', // Garo
  'ne', // Nepali
];

const COMMON_LANG_CODES: LanguageCode[] = [
  'as', // Assamese
  'hi', // Hindi
  'bn', // Bengali
  'en', // English
  'pa', // Punjabi
  'mr', // Marathi
  'gu', // Gujarati
  'ta', // Tamil
  'te', // Telugu
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  currentLang,
  onSelectLang,
  onOpenLangModal,
  onLoginSuccess,
  onSkipLogin,
}) => {
  // Step 1: Language selection first; Step 2: Login options
  const [currentStep, setCurrentStep] = useState<'language' | 'login'>('language');

  // Selected language in Step 1
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<LanguageCode>(currentLang);
  const [langCategory, setLangCategory] = useState<'all' | 'ne' | 'common'>('all');
  const [langSearchQuery, setLangSearchQuery] = useState('');

  // Step 2 Login states (defaulted to civilian for local travelers)
  const [selectedRole, setSelectedRole] = useState<UserRole>('civilian');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email' | 'google' | 'apple'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccessNotice, setAuthSuccessNotice] = useState('');

  const t = I18N_TRANSLATIONS[selectedLanguageCode] || I18N_TRANSLATIONS.en;
  const currentLangObj = LANGUAGES.find((l) => l.code === selectedLanguageCode);

  // Audio helper for step 1 (Language selection)
  const handleHearLanguageIntro = (langCode: LanguageCode, greeting?: string) => {
    const chosenLang = LANGUAGES.find((l) => l.code === langCode);
    const speech =
      greeting ||
      chosenLang?.sampleGreeting ||
      'Welcome to Co-Pilot. Please choose your language.';
    speakSpeech(speech, langCode, 1.0);
  };

  // Step 1: Proceed to Login page
  const handleConfirmLanguageAndProceed = () => {
    onSelectLang(selectedLanguageCode);
    setCurrentStep('login');

    const welcomeMsg =
      selectedLanguageCode === 'hi'
        ? 'भाषा चुनी गई। कृपया लॉगिन करें या सीधे आगे बढ़ें।'
        : selectedLanguageCode === 'as'
        ? 'ভাষা নিৰ্বাচিত হ’ল। অনুগ্ৰহ কৰি লগইন কৰক বা পোনপটীয়াভাৱে আগবাঢ়ক।'
        : selectedLanguageCode === 'bn'
        ? 'ভাষা নির্বাচিত হলো। অনুগ্রহ করে লগইন করুন অথবা সরাসরি এগিয়ে যান।'
        : 'Language selected. Please sign in or tap Skip to continue.';
    speakSpeech(welcomeMsg, selectedLanguageCode, 1.0);
  };

  // Audio guide for Step 2
  const handleAudioGuidanceStep2 = () => {
    const text =
      selectedLanguageCode === 'hi'
        ? 'Co-Pilot में आपका स्वागत है। आप गूगल, ऐप्पल, मोबाइल नंबर या ईमेल से लॉगिन कर सकते हैं। तुरंत आगे बढ़ने के लिए स्किप बटन दबाएं।'
        : selectedLanguageCode === 'as'
        ? 'Co-Pilot ত স্বাগতম। আপুনি গুগল, এপল, মোবাইল নম্বৰ বা ইমেইলৰ জৰিয়তে প্ৰৱেশ কৰিব পাৰে। পলম নকৰি পোনপটীয়াকৈ আগবাঢ়িবলৈ স্কিপ বুটাম টিপক।'
        : selectedLanguageCode === 'bn'
        ? 'Co-Pilot এ স্বাগতম। আপনি গুগল, অ্যাপল, মোবাইল নম্বর বা ইমেইল দিয়ে লগইন করতে পারেন। সরাসরি যেতে স্কিপ চাপুন।'
        : 'Welcome to Co-Pilot. Sign in using Google, Apple ID, Phone OTP, or Email. You can also tap Skip for Now to enter immediately without an account.';
    speakSpeech(text, selectedLanguageCode, 1.0);
  };

  // Final login handler
  const handleCompleteLogin = (profile: DriverProfile) => {
    localStorage.setItem('sarthi_driver_profile', JSON.stringify(profile));
    onLoginSuccess(profile);
  };

  // 1-Tap OAuth Sign-In (Google / Apple)
  const handleOAuthSignIn = (provider: 'Google' | 'Apple') => {
    setIsSubmitting(true);
    setErrorMessage('');
    setAuthSuccessNotice(`Connecting to ${provider}...`);

    setTimeout(() => {
      setIsSubmitting(false);
      const profile: DriverProfile = {
        role: selectedRole,
        name:
          provider === 'Google'
            ? selectedRole === 'field_officer'
              ? 'Gov Patrol Officer (Google Auth)'
              : selectedRole === 'civilian'
              ? 'Civilian Commuter (Google)'
              : 'Highway Driver (Google)'
            : selectedRole === 'field_officer'
            ? 'BRO Officer (Apple ID)'
            : selectedRole === 'civilian'
            ? 'Civilian Traveler (Apple)'
            : 'Fleet Driver (Apple)',
        phone: '9876501234',
        vehicleNumber:
          selectedRole === 'field_officer'
            ? 'GOV-PATROL-BRO'
            : selectedRole === 'civilian'
            ? 'AS-01-CIVIL-2024'
            : 'AS-01-EC-9921',
        vehicleType:
          selectedRole === 'field_officer'
            ? 'Emergency Fleet'
            : selectedRole === 'civilian'
            ? 'Passenger / Private'
            : 'Heavy Commercial Truck',
        department:
          selectedRole === 'field_officer'
            ? 'Border Roads Organisation (BRO)'
            : undefined,
        badgeNumber:
          selectedRole === 'field_officer' ? 'BRO-PATROL-409' : undefined,
        homeHub: 'Guwahati - Siliguri Corridor',
        isGuest: false,
      };
      handleCompleteLogin(profile);
    }, 600);
  };

  // Phone OTP Flow
  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOtpSent(true);
      setOtpCode('4921');
    }, 450);
  };

  const handleVerifyPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage('Please enter the 4-digit verification code');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleCompleteLogin({
        role: selectedRole,
        name:
          fullName.trim() ||
          (selectedRole === 'field_officer'
            ? 'Field Inspector'
            : selectedRole === 'civilian'
            ? 'Civilian Traveler'
            : 'Highway Driver'),
        phone: phone || '9876543210',
        vehicleNumber:
          vehicleNumber.trim().toUpperCase() ||
          (selectedRole === 'field_officer'
            ? 'GOV-BRO-409'
            : selectedRole === 'civilian'
            ? 'AS-01-PVT-2026'
            : 'AS-01-EC-9921'),
        vehicleType:
          selectedRole === 'field_officer'
            ? 'Emergency Fleet'
            : selectedRole === 'civilian'
            ? 'Passenger / Private'
            : 'Heavy Commercial Truck',
        department:
          selectedRole === 'field_officer'
            ? 'Border Roads Organisation (BRO)'
            : undefined,
        badgeNumber:
          selectedRole === 'field_officer' ? 'BRO-PATROL-409' : undefined,
        homeHub: 'NH Highway Corridor',
        isGuest: false,
      });
    }, 400);
  };

  // Email Sign In Flow
  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleCompleteLogin({
        role: selectedRole,
        name:
          fullName.trim() ||
          email.split('@')[0] ||
          (selectedRole === 'field_officer'
            ? 'Officer'
            : selectedRole === 'civilian'
            ? 'Civilian'
            : 'Driver'),
        phone: phone || '9876543210',
        vehicleNumber:
          vehicleNumber.trim().toUpperCase() ||
          (selectedRole === 'field_officer' ? 'GOV-PATROL-BRO' : 'AS-01-TR-8819'),
        vehicleType:
          selectedRole === 'field_officer'
            ? 'Emergency Fleet'
            : selectedRole === 'civilian'
            ? 'Passenger / Private'
            : 'Heavy Commercial Truck',
        department:
          selectedRole === 'field_officer'
            ? 'Border Roads Organisation (BRO)'
            : undefined,
        badgeNumber:
          selectedRole === 'field_officer' ? 'BRO-PATROL-409' : undefined,
        homeHub: 'North East Corridor',
        isGuest: false,
      });
    }, 500);
  };

  const handleQuickLogin = (preset: DriverProfile) => {
    handleCompleteLogin(preset);
  };

  const displayedLanguages = LANGUAGES.filter((l) => {
    const q = langSearchQuery.toLowerCase().trim();
    if (q) {
      return (
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
      );
    }
    if (langCategory === 'ne') {
      return NE_LANG_CODES.includes(l.code);
    }
    if (langCategory === 'common') {
      return COMMON_LANG_CODES.includes(l.code);
    }
    return true; // 'all'
  });

  // =========================================================================
  // RENDER STEP 1: WHITE UI LANGUAGE SELECTION FIRST (ZERO BLUE, ZERO GREEN)
  // =========================================================================
  if (currentStep === 'language') {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white relative">
        {/* Top Floating App Bar */}
        <header className="w-full max-w-4xl mx-auto px-4 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md">
              <span className="material-symbols-outlined text-[24px]">route</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-slate-900 tracking-tight uppercase">
                  Co-Pilot
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                National & North-East Road Watch
              </p>
            </div>
          </div>
        </header>

        {/* Main Language Choice View */}
        <main className="w-full max-w-2xl mx-auto px-4 py-3 sm:py-5 flex-1 flex flex-col justify-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col gap-3.5 sm:gap-4">
            {/* Visual Headings & Audio Voice Assistant */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Choose Your Language
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                  প্ৰথমে আপোনাৰ ভাষা বাছনি কৰক • अपनी भाषा चुनें
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select your preferred language. Bulletins, voice radar & SOS will speak in this language.
                </p>
              </div>

              {/* Audio Listen Button */}
              <button
                type="button"
                onClick={() =>
                  handleHearLanguageIntro(
                    selectedLanguageCode,
                    'Welcome to SIH. Please choose your language to continue.'
                  )
                }
                title="Tap to listen in audio"
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[17px] text-amber-600">volume_up</span>
                <span className="hidden sm:inline">Listen</span>
                <span className="sm:hidden">Listen</span>
              </button>
            </div>

            {/* Prominent Search Option & Quick Filters */}
            <div className="flex flex-col gap-2">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px] pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={langSearchQuery}
                  onChange={(e) => setLangSearchQuery(e.target.value)}
                  placeholder="Search language, script, or state (e.g. Assamese, Hindi, বাংলা, Mizo)..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                />
                {langSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setLangSearchQuery('')}
                    className="absolute right-2.5 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 text-[11px] cursor-pointer"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Filter Tabs & Live Count */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLangCategory('all');
                      setLangSearchQuery('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      langCategory === 'all' && !langSearchQuery
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({LANGUAGES.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLangCategory('ne');
                      setLangSearchQuery('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      langCategory === 'ne' && !langSearchQuery
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>North-East</span>
                    <span className="text-[10px] opacity-80">(8)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLangCategory('common');
                      setLangSearchQuery('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      langCategory === 'common' && !langSearchQuery
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Common ({COMMON_LANG_CODES.length})
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 font-medium shrink-0 ml-2">
                  {displayedLanguages.length} {displayedLanguages.length === 1 ? 'language' : 'languages'}
                </span>
              </div>
            </div>

            {/* Grid of Compact, Smaller Language Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] sm:max-h-[340px] overflow-y-auto pr-1">
              {displayedLanguages.map((lang) => {
                const isSelected = selectedLanguageCode === lang.code;
                return (
                  <div
                    key={lang.code}
                    className={`relative rounded-xl p-2.5 sm:p-3 border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/15'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
                    }`}
                    onClick={() => {
                      setSelectedLanguageCode(lang.code);
                      handleHearLanguageIntro(lang.code, lang.sampleGreeting);
                    }}
                  >
                    {/* Left text: Native name & English name */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-sm sm:text-base leading-tight truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {lang.nativeName}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-2xs">
                            <span className="material-symbols-outlined text-[12px] font-black">check</span>
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] truncate mt-0.5 flex items-center gap-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        <span className="font-semibold">{lang.name}</span>
                        <span>•</span>
                        <span className="truncate opacity-80">{lang.region}</span>
                      </div>
                    </div>

                    {/* Speaker preview button */}
                    <button
                      type="button"
                      aria-label={`Hear sample in ${lang.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLanguageCode(lang.code);
                        handleHearLanguageIntro(lang.code, lang.sampleGreeting);
                      }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title="Hear pronunciation sample"
                    >
                      <span className="material-symbols-outlined text-[16px]">volume_up</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Empty Search State */}
            {displayedLanguages.length === 0 && (
              <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[28px]">search_off</span>
                <p className="text-xs font-semibold text-slate-700">
                  No languages matching "{langSearchQuery}"
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLangSearchQuery('');
                    setLangCategory('all');
                  }}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Selected Language indicator line */}
            <div className="flex items-center justify-between text-xs px-1 text-slate-500">
              <span className="truncate">Voice engine: <strong className="text-slate-800 font-semibold">{currentLangObj?.ttsLang}</strong></span>
              <span className="truncate ml-2 text-right">Selected: <strong className="text-slate-900 font-bold">{currentLangObj?.nativeName} ({currentLangObj?.name})</strong></span>
            </div>

            {/* Action Buttons: Continue to Login OR Skip directly */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
              {/* Primary: Continue in Selected Language */}
              <button
                id="proceed-to-login-btn"
                type="button"
                onClick={handleConfirmLanguageAndProceed}
                className="flex-1 min-h-[46px] sm:min-h-[48px] bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-['Space_Grotesk'] font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Continue in {currentLangObj?.nativeName || 'Selected Language'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>

              {/* Secondary: Skip to App directly */}
              <button
                id="step1-skip-bottom-btn"
                type="button"
                onClick={() => onSkipLogin('driver')}
                className="sm:w-36 min-h-[46px] sm:min-h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Skip for Now</span>
                <span className="material-symbols-outlined text-[16px]">fast_forward</span>
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-4xl mx-auto px-4 py-4 text-center text-xs text-slate-500 border-t border-slate-100">
          Co-Pilot • Multi-Lingual Road Watch & Highway Emergency • 24x7 Lifeline
        </footer>
      </div>
    );
  }

  // =========================================================================
  // RENDER STEP 2: WHITE UI LOGIN PAGE (ZERO BLUE, ZERO GREEN)
  // =========================================================================
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white relative">
      {/* Top Floating App Bar */}
      <header className="w-full max-w-4xl mx-auto px-4 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
        {/* Brand Crest */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md">
            <span className="material-symbols-outlined text-[24px]">route</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-slate-900 tracking-tight uppercase">
                Co-Pilot
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              National & North-East Road Watch
            </p>
          </div>
        </div>

        {/* Language Selection */}
        <div className="flex items-center gap-2">
          {/* Change Language Button */}
          <button
            onClick={() => setCurrentStep('language')}
            aria-label="Change Language"
            title="Return to language selection"
            className="h-10 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-slate-700 text-[18px]">
              translate
            </span>
            <span className="font-bold max-w-[70px] sm:max-w-none truncate">
              {currentLangObj ? currentLangObj.nativeName : 'Language'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-lg mx-auto px-4 py-6 flex-1 flex flex-col justify-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-5">
          {/* Card Header & Voice Guidance with Skip for Now */}
          <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {selectedRole === 'field_officer'
                    ? 'Field Officer Portal'
                    : selectedRole === 'civilian'
                    ? 'Civilian Travel Login'
                    : 'Sign In to Co-Pilot'}
                </h1>
                <button
                  type="button"
                  onClick={handleAudioGuidanceStep2}
                  aria-label="Listen to voice instructions"
                  title="Listen in your language"
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-amber-600 flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">volume_up</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Choose how you want to sign in. Simple, secure, and accessible for everyone.
              </p>
            </div>

            {/* Skip for Now Button inside Main Card */}
            <button
              id="skip-for-now-card-btn"
              onClick={() => onSkipLogin(selectedRole)}
              aria-label="Skip login and enter directly"
              className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
            >
              <span>Skip for now</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          {/* User Persona Selector (Driver / Civilian / Field Officer) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Select User Identity • পৰিচয় নিৰ্বাচন
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('civilian');
                  setOtpSent(false);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold font-['Space_Grotesk'] flex flex-col items-center gap-0.5 transition-all ${
                  selectedRole === 'civilian'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">directions_car</span>
                <span className="truncate text-[11px]">Local</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('driver');
                  setOtpSent(false);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold font-['Space_Grotesk'] flex flex-col items-center gap-0.5 transition-all ${
                  selectedRole === 'driver'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">commute</span>
                <span className="truncate text-[11px]">Fleet / Freight</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('field_officer');
                  setOtpSent(false);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold font-['Space_Grotesk'] flex flex-col items-center gap-0.5 transition-all ${
                  selectedRole === 'field_officer'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">shield_person</span>
                <span className="truncate text-[11px]">Officer 🛡️</span>
              </button>
            </div>
          </div>

          {/* Fast Social Logins: Google & Apple ID (NO BLUE, NO GREEN) */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Fast 1-Tap Sign In • পোনপটীয়া প্ৰৱেশ
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Google Sign In */}
              <button
                id="google-login-btn"
                type="button"
                disabled={isSubmitting}
                onClick={() => handleOAuthSignIn('Google')}
                className="h-12 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-98 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2.5 border border-slate-300 shadow-xs transition-all disabled:opacity-50"
              >
                {/* Monochrome Google G Icon - No Blue or Green */}
                <svg className="w-4 h-4 fill-slate-900 shrink-0" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Apple ID Sign In */}
              <button
                id="apple-login-btn"
                type="button"
                disabled={isSubmitting}
                onClick={() => handleOAuthSignIn('Apple')}
                className="h-12 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-semibold text-xs flex items-center justify-center gap-2.5 shadow-xs transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.77-11.7-14.19-6.3-9.78-11.4-21.2-15.3-34.25-3.9-13.06-5.86-25.04-5.86-35.95 0-14.78 3.75-26.83 11.24-36.16 7.49-9.33 16.74-14.11 27.75-14.35 5.01 0 10.37 1.25 16.08 3.77 5.71 2.51 9.4 3.83 11.07 3.94 1.34 0 5.3-1.42 11.88-4.25 6.58-2.84 12.44-4.04 17.58-3.61 13.51.64 24.36 5.86 32.55 15.65-11.98 7.28-17.75 17.3-17.33 30.06.43 9.9 4.28 18.06 11.55 24.47 5.01 4.45 10.78 7.39 17.3 8.81-2.4 7.29-5.34 14.88-8.83 22.77zM119.22 31.84c0-7.29 2.58-14.07 7.74-20.35 5.15-6.28 11.55-10.28 19.19-12-0.22 1.52-.33 2.93-.33 4.23 0 7.29-2.73 14.28-8.19 20.97-5.46 6.69-12.16 10.49-20.1 11.39-.22-1.41-.31-2.82-.31-4.24z" />
                </svg>
                <span>Continue with Apple ID</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-0.5">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              OR USE CREDENTIALS
            </span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Switch between Mobile Phone OTP & Email */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('phone');
                setOtpSent(false);
                setErrorMessage('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold font-['Space_Grotesk'] uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                loginMethod === 'phone'
                  ? 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              <span>Phone No. (OTP)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMethod('email');
                setOtpSent(false);
                setErrorMessage('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold font-['Space_Grotesk'] uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                loginMethod === 'email'
                  ? 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              <span>Email Option</span>
            </button>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Auth Success/Loading Notice */}
          {authSuccessNotice && (
            <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-900 shrink-0 animate-spin">
                sync
              </span>
              <span>{authSuccessNotice}</span>
            </div>
          )}

          {/* PHONE OTP METHOD */}
          {loginMethod === 'phone' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendPhoneOtp} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Phone Number • মোবাইল নম্বৰ</span>
                      <span className="text-[10px] text-slate-500 font-normal">SMS OTP</span>
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-300 bg-white focus-within:border-slate-900 transition-colors">
                      <span className="px-3.5 py-3 bg-slate-100 text-slate-700 text-xs font-bold border-r border-slate-200 flex items-center gap-1">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        maxLength={10}
                        className="w-full px-3 py-3 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">
                        Full Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rajeshwar Singh"
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">
                        {selectedRole === 'field_officer'
                          ? 'Patrol Unit / Vehicle'
                          : 'Vehicle No. (Optional)'}
                      </label>
                      <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="e.g. AS-01-EC-9921"
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 uppercase focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    id="phone-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[48px] bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 mt-1"
                  >
                    <span>Get Verification Code (SMS)</span>
                    <span className="material-symbols-outlined text-[18px]">sms</span>
                  </button>
                </form>
              ) : (
                /* OTP Verification form */
                <form onSubmit={handleVerifyPhoneOtp} className="flex flex-col gap-3">
                  <div className="text-center py-1">
                    <p className="text-xs font-semibold text-slate-900">
                      OTP Sent to +91 {phone}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Enter the 4-digit code (Testing demo code: <strong className="text-slate-900">4921</strong>)
                    </p>
                  </div>

                  <div className="flex justify-center my-1">
                    <input
                      type="text"
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="4921"
                      className="w-44 h-14 bg-slate-50 border-2 border-slate-900 text-center font-['Space_Grotesk'] text-2xl font-bold tracking-widest text-slate-900 rounded-2xl focus:outline-none shadow-inner"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                    <span>Code not received?</span>
                    <button
                      type="button"
                      onClick={() => setOtpCode('4921')}
                      className="text-slate-900 font-bold hover:underline"
                    >
                      Auto-fill (4921)
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[48px] bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <span>Verify & Continue</span>
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-xs text-slate-500 hover:text-slate-900 text-center"
                  >
                    Edit Phone Number
                  </button>
                </form>
              )}
            </div>
          )}

          {/* EMAIL METHOD */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailSignIn} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address • ইমেইল ঠিকনা
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-300 bg-white focus-within:border-slate-900 transition-colors">
                  <span className="px-3 py-2.5 bg-slate-100 text-slate-500 text-xs border-r border-slate-200 flex items-center">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@highway.gov.in or personal email"
                    className="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password (or leave blank for 1-click link)
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-300 bg-white focus-within:border-slate-900 transition-colors">
                  <span className="px-3 py-2.5 bg-slate-100 text-slate-500 text-xs border-r border-slate-200 flex items-center">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                id="email-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[48px] bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 mt-1"
              >
                <span>Continue with Email</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          )}

          {/* 1-Tap Quick Demo Profiles (No Blue, No Green) */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                1-Tap Quick Test Profiles • তাৎক্ষণিক প্ৰৱেশ
              </span>
              <span className="text-[10px] text-amber-700 font-bold">No typing needed</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {PRESET_ACCOUNTS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleQuickLogin(preset)}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        preset.role === 'field_officer'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-200 text-slate-900 border border-slate-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {preset.role === 'field_officer'
                          ? 'shield_person'
                          : preset.role === 'civilian'
                          ? 'directions_car'
                          : 'local_shipping'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {preset.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md font-mono uppercase">
                          {preset.role?.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 truncate block">
                        {preset.department || preset.vehicleType || preset.travelMode} • {preset.badgeNumber || preset.vehicleNumber}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-900 text-[20px]">
                    login
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Prominent "Skip for Now" Action at Bottom */}
          <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2">
            <button
              id="skip-for-now-bottom-btn"
              type="button"
              onClick={() => onSkipLogin(selectedRole)}
              className="w-full min-h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-2xl font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 shadow-2xs"
            >
              <span className="material-symbols-outlined text-slate-700 text-[18px]">
                no_accounts
              </span>
              <span>
                Skip for now • Enter as {selectedRole === 'field_officer' ? 'Patrol Officer' : selectedRole === 'civilian' ? 'Civilian' : 'Guest Driver'}
              </span>
              <span className="material-symbols-outlined text-slate-600 text-[16px]">
                arrow_forward
              </span>
            </button>
            <p className="text-[11px] text-slate-500 text-center">
              No account required. Live corridor status, emergency SOS 112, and voice bulletins remain 100% active.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto px-4 py-4 text-center text-xs text-slate-500 border-t border-slate-100">
        Co-Pilot • Ministry of Road Transport & Highways Compliant • 24x7 North East Lifeline
      </footer>
    </div>
  );
};
