import React, { useState } from 'react';
import { LanguageCode } from '../types';
import {
  I18N_TRANSLATIONS,
  EMERGENCY_DIALS,
  SHELTERS,
  MAP_IMAGE_URL,
} from '../data/mockData';
import { speakSpeech, triggerVibration } from '../utils/speech';

interface SosScreenProps {
  currentLang: LanguageCode;
}

export const SosScreen: React.FC<SosScreenProps> = ({ currentLang }) => {
  const t = I18N_TRANSLATIONS[currentLang] || I18N_TRANSLATIONS.en;
  const [sosActive, setSosActive] = useState(false);
  const [isSpeakingLocation, setIsSpeakingLocation] = useState(false);

  const handleTriggerSos = () => {
    setSosActive(true);
    triggerVibration([300, 150, 300, 150, 600]);

    const emergencyVoice =
      currentLang === 'hi'
        ? 'आपातकालीन बीकन सक्रिय। आपकी जीपीएस लोकेशन असम पुलिस व एसडीआरएफ बचाव दल को भेजी गई है।'
        : currentLang === 'as'
        ? 'জৰুৰীকালীন সংকেত প্ৰেৰণ কৰা হ’ল। আপোনাৰ GPS অৱস্থান আৰক্ষী আৰু SDRF সাহাৰ্য্যকাৰীলৈ পঠোৱা হৈছে।'
        : 'Emergency beacon broadcasted! Live GPS coordinates sent to Police and SDRF disaster rescue teams.';

    speakSpeech(emergencyVoice, currentLang, 1.0);
  };

  const handleReadLocation = () => {
    setIsSpeakingLocation(true);
    const locationText =
      currentLang === 'hi'
        ? 'आपातकालीन सहायता। वाहन की स्थिति: माइल 42 के पास, राष्ट्रीय राजमार्ग 27, हाफलोंग पास, दिमा हसाओ। अक्षांश 25.1742 उत्तर, देशांतर 93.0219 पूर्व।'
        : currentLang === 'as'
        ? 'জৰুৰীকালীন অৱস্থান: মাইল ৪২ ওচৰত, ৰাষ্ট্ৰীয় ঘাইপথ ২৭, হাফলং পাছ, ডিমা হাছাও। অক্ষাংশ ২৫.১৭৪২ উত্তৰ, দ্ৰাঘিমাংশ ৯৩.০২১৯ পূব।'
        : 'Emergency location dispatch: Vehicle near Mile 42, National Highway 27, Haflong Pass, Dima Hasao district, Assam. Latitude 25.1742 North, Longitude 93.0219 East. Altitude 960 meters.';

    speakSpeech(locationText, currentLang, 0.9, undefined, () => {
      setIsSpeakingLocation(false);
    });
  };

  return (
    <div className="flex flex-col w-full gap-4 pb-16">
      {/* 1. Emergency Assistance Desk Bar */}
      <div className="w-full bg-rose-50 border border-rose-200 p-3 rounded-2xl flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
          <span className="font-['Space_Grotesk'] text-xs sm:text-sm font-bold text-rose-700 tracking-wider uppercase truncate">
            {t.emergencyDesk}
          </span>
        </div>
        <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded uppercase shrink-0 shadow-2xs">
          {t.offlineReady}
        </span>
      </div>

      {/* 2. Giant Glowing Red SOS Trigger Card */}
      <div className="w-full bg-white rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm border border-slate-200/90">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-rose-50 pointer-events-none blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-rose-50 pointer-events-none blur-2xl" />

        <div className="relative flex items-center justify-center my-2">
          {/* Animated pulsing rings */}
          <div className="absolute w-44 h-44 rounded-full bg-rose-200 animate-ping opacity-60" />
          <div className="absolute w-48 h-48 rounded-full bg-rose-100 animate-pulse" />

          {/* Main Round Push Button */}
          <button
            onClick={handleTriggerSos}
            aria-label="Tap for immediate emergency rescue"
            className="relative z-10 w-40 h-40 rounded-full bg-gradient-to-tr from-rose-600 via-red-600 to-rose-500 text-white flex flex-col items-center justify-center shadow-[0_12px_36px_rgba(225,29,72,0.45)] ring-4 ring-rose-100 active:scale-95 transition-transform select-none focus:outline-none cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-[52px] leading-none text-white drop-shadow"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              sos
            </span>
            <span className="font-['Space_Grotesk'] text-xl leading-tight uppercase font-black tracking-wider mt-1 text-white">
              EMERGENCY
            </span>
            <span className="text-xs font-bold tracking-tight text-rose-100">
              {t.sosSub}
            </span>
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center max-w-sm">
          <span className="font-['Space_Grotesk'] text-base sm:text-lg text-slate-900 uppercase font-bold tracking-wide">
            {t.tapForHelp}
          </span>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug font-medium">
            {t.sosDesc}
          </p>
        </div>

        {/* Beacon Confirmation Alert Toast */}
        {sosActive && (
          <div className="mt-4 w-full bg-slate-900 text-white border border-slate-800 p-3 rounded-xl flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-amber-400 text-[24px]">
              check_circle
            </span>
            <span className="text-xs sm:text-sm font-semibold flex-1 text-left">
              Beacon broadcasted! SDRF &amp; Assam/Meghalaya Patrol notified.
            </span>
            <button
              onClick={() => setSosActive(false)}
              className="text-slate-900 hover:text-black text-xs font-bold px-2 py-1 bg-white rounded"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* 3. Your Exact GPS Location Card */}
      <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-900 text-[24px]">
              my_location
            </span>
            <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t.gpsLocationTitle}
            </span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200">
            {t.gpsLocked}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Landmark / পাহাৰীয়া স্থান
          </span>
          <span className="font-['Space_Grotesk'] text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {t.landmark}
          </span>
          <span className="text-xs text-slate-600 font-medium">
            {t.landmarkDetails}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Latitude
            </span>
            <span className="font-['Space_Grotesk'] text-base font-bold text-slate-900 tracking-wide font-mono">
              25.1742° N
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Longitude
            </span>
            <span className="font-['Space_Grotesk'] text-base font-bold text-slate-900 tracking-wide font-mono">
              93.0219° E
            </span>
          </div>
        </div>

        <button
          onClick={handleReadLocation}
          className={`min-h-[50px] w-full rounded-xl font-['Space_Grotesk'] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-sm uppercase tracking-wide border ${
            isSpeakingLocation
              ? 'bg-slate-800 border-slate-800 text-white'
              : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[22px] text-amber-400">
            volume_up
          </span>
          <span>{t.readLocationBtn}</span>
        </button>
      </div>

      {/* 4. Direct 1-Tap Emergency Dials */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
            {t.emergencyDialsTitle}
          </span>
          <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">
              cell_tower
            </span>
            {t.priorityBadge}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {EMERGENCY_DIALS.map((dial, idx) => (
            <a
              key={idx}
              href={`tel:${dial.number.replace(/-/g, '')}`}
              className="min-h-[64px] bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl p-3.5 border border-slate-200/90 flex items-center justify-between gap-3 shadow-2xs transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-12 h-12 rounded-xl ${dial.bgColor} flex items-center justify-center shrink-0 border border-slate-200`}
                >
                  <span className="material-symbols-outlined text-[26px]">
                    {dial.icon}
                  </span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 uppercase tracking-tight truncate">
                    {dial.title}
                  </span>
                  <span className="text-xs text-slate-500 truncate font-medium">
                    {dial.subtitle}
                  </span>
                </div>
              </div>

              {dial.badge ? (
                <div className="flex items-center gap-1 shrink-0 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                  <span className="material-symbols-outlined text-slate-900 text-[18px]">
                    call
                  </span>
                  <span className="font-['Space_Grotesk'] text-xs font-bold text-slate-900">
                    {dial.badge}
                  </span>
                </div>
              ) : (
                <span
                  className={`font-['Space_Grotesk'] text-2xl font-black shrink-0 ${dial.color}`}
                >
                  {dial.number}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* 5. "No Internet? Send Basic SMS" Card */}
      <div className="w-full bg-white border border-slate-200/90 p-4 rounded-2xl flex flex-col gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-700 text-[22px]">
            sms
          </span>
          <span className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
            {t.noInternetTitle}
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          {t.noInternetDesc}
        </p>
        <a
          href="sms:112?body=EMERGENCY%20SOS%20NER%20SARTHI.%20Vehicle%20stuck/breakdown.%20Location:%20NH-27%20Mile%2042,%20Haflong%20Pass.%20GPS:%2025.1742N,93.0219E.%20Need%20Immediate%20Assistance."
          className="min-h-[48px] mt-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 border border-slate-300/90 rounded-xl flex items-center justify-center gap-2 font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <span className="material-symbols-outlined text-slate-700 text-[20px]">
            send_to_mobile
          </span>
          <span>{t.dispatchSmsBtn}</span>
        </a>
      </div>

      {/* 6. Nearby Safe Staging & Shelters */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
            {t.sheltersTitle}
          </span>
          <span className="text-xs font-bold text-slate-700 uppercase">
            {t.onCorridor}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {SHELTERS.map((shelter) => (
            <div
              key={shelter.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs"
            >
              <div
                className={`w-12 h-12 rounded-xl ${shelter.iconBg} flex items-center justify-center shrink-0 border`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {shelter.icon}
                </span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 uppercase tracking-tight truncate">
                    {shelter.name}
                  </span>
                  <span
                    className={`font-['Space_Grotesk'] text-[10px] px-1.5 py-0.5 rounded font-bold uppercase border ${shelter.badgeColor}`}
                  >
                    {shelter.badge}
                  </span>
                </div>
                <span className="text-xs text-slate-500 truncate font-medium">
                  {shelter.desc}
                </span>
              </div>
              <div className="flex flex-col items-end shrink-0 pl-1">
                <span className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                  {shelter.distance}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {shelter.subDist}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Satellite Terrain Emergency Relief Elevation Map */}
      <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 relative h-48 bg-slate-900">
        <div
          className="w-full h-full bg-cover bg-center transition-transform hover:scale-105 duration-700"
          style={{ backgroundImage: `url('${MAP_IMAGE_URL}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg font-['Space_Grotesk'] text-xs font-bold text-slate-900 shadow-sm border border-slate-200">
            NH-27 Pass Sector Elevation Map
          </span>
          <span className="bg-rose-600 text-white px-2.5 py-1 rounded-lg font-['Space_Grotesk'] text-[11px] font-bold flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[15px]">warning</span>
            CAUTION: RAIN TRIGGERED SLIPS
          </span>
        </div>
      </div>
    </div>
  );
};
