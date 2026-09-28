import React, { useState } from 'react';
import { LanguageCode, UserRole, DriverProfile } from '../types';
import { I18N_TRANSLATIONS } from '../data/mockData';
import { speakSpeech, stopSpeech } from '../utils/speech';

interface StatusScreenProps {
  currentLang: LanguageCode;
  userProfile?: DriverProfile | null;
  onSelectRole?: (role: UserRole) => void;
  onOpenReportModal: () => void;
  onOpenRouteModal: () => void;
  onOpenFieldOfficerModal?: () => void;
  onSelectTab: (tab: 'status' | 'route' | 'alerts' | 'sos') => void;
  onSelectLang?: (lang: LanguageCode) => void;
  onOpenLangModal?: () => void;
}

export const StatusScreen: React.FC<StatusScreenProps> = ({
  currentLang,
  userProfile,
  onSelectRole,
  onOpenReportModal,
  onOpenRouteModal,
  onOpenFieldOfficerModal,
  onSelectTab,
  onSelectLang,
  onOpenLangModal,
}) => {
  const t = I18N_TRANSLATIONS[currentLang] || I18N_TRANSLATIONS.en;
  const [activeSpeechCard, setActiveSpeechCard] = useState<string | null>(null);
  const [radarZoomed, setRadarZoomed] = useState(false);

  // Active Role defaults to profile role or driver
  const activeRole: UserRole = userProfile?.role || 'driver';

  const handleSpeak = (key: string, text: string) => {
    if (activeSpeechCard === key) {
      stopSpeech();
      setActiveSpeechCard(null);
      return;
    }
    setActiveSpeechCard(key);
    speakSpeech(
      text,
      currentLang,
      1.0,
      () => setActiveSpeechCard(key),
      () => setActiveSpeechCard(null)
    );
  };

  return (
    <div className="flex flex-col w-full gap-4 pb-12">
      {/* 0. User Identity & Role Selection Console */}
      <section className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </div>
            <div>
              <h2 className="font-['Space_Grotesk'] text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight">
                User Identity & Mode • পৰিচয় নিৰ্বাচন
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Select who is using this terminal to customize safety feeds & reporting
              </p>
            </div>
          </div>

          {/* Current Active Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
            <span className="text-slate-600">Active:</span>
            <span className="capitalize">{activeRole.replace('_', ' ')}</span>
          </div>
        </div>

        {/* 3 Identity Selection Buttons - Prioritizing Local Citizens, Commuters & Public */}
        <div className="grid grid-cols-3 gap-2">
          {/* Option 1: Civilian / Local Resident */}
          <button
            type="button"
            onClick={() => onSelectRole?.('civilian')}
            className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all relative ${
              activeRole === 'civilian'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activeRole === 'civilian' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                <span className="material-symbols-outlined text-[20px]">directions_car</span>
              </div>
              {activeRole === 'civilian' && (
                <span className="material-symbols-outlined text-amber-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              )}
            </div>
            <div>
              <span className={`font-['Space_Grotesk'] text-xs font-bold block ${activeRole === 'civilian' ? 'text-white' : 'text-slate-900'}`}>
                Civilian & Local
              </span>
              <span className={`text-[10px] hidden sm:block ${activeRole === 'civilian' ? 'text-slate-300' : 'text-slate-500'}`}>
                Residents, Commuters & Taxis
              </span>
            </div>
          </button>

          {/* Option 2: Commercial Logistics */}
          <button
            type="button"
            onClick={() => onSelectRole?.('driver')}
            className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all relative ${
              activeRole === 'driver'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activeRole === 'driver' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                <span className="material-symbols-outlined text-[20px]">commute</span>
              </div>
              {activeRole === 'driver' && (
                <span className="material-symbols-outlined text-amber-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              )}
            </div>
            <div>
              <span className={`font-['Space_Grotesk'] text-xs font-bold block ${activeRole === 'driver' ? 'text-white' : 'text-slate-900'}`}>
                Logistics & Fleet
              </span>
              <span className={`text-[10px] hidden sm:block ${activeRole === 'driver' ? 'text-slate-300' : 'text-slate-500'}`}>
                Goods & Inter-State Transit
              </span>
            </div>
          </button>

          {/* Option 3: Field Officer */}
          <button
            type="button"
            onClick={() => onSelectRole?.('field_officer')}
            className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all relative ${
              activeRole === 'field_officer'
                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activeRole === 'field_officer' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                <span className="material-symbols-outlined text-[20px]">shield_person</span>
              </div>
              {activeRole === 'field_officer' && (
                <span className="material-symbols-outlined text-amber-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              )}
            </div>
            <div>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-slate-900 block">
                Field Officer
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:block">
                BRO, Police & Patrol
              </span>
            </div>
          </button>
        </div>

        {/* Dynamic Context Banner according to Identity */}
        {activeRole === 'field_officer' ? (
          <div className="bg-amber-950/90 text-amber-200 border border-amber-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                <span className="material-symbols-outlined text-[20px]">emergency</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white tracking-tight">
                  Field Officer Patrol Console Active
                </p>
                <p className="text-[11px] text-amber-300/80 truncate">
                  Authority to submit live landslide, road collapse, and accident bulletins.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenFieldOfficerModal}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold font-['Space_Grotesk'] uppercase flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">mic</span>
                <span>Voice Memo</span>
              </button>

              <button
                type="button"
                onClick={onOpenFieldOfficerModal}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold font-['Space_Grotesk'] uppercase flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">sms</span>
                <span>SMS Dispatch</span>
              </button>
            </div>
          </div>
        ) : activeRole === 'civilian' ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-800">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-600 text-[18px]">info</span>
              <span><strong>Civilian Mode:</strong> Displaying passenger car clearance, mountain tourist alerts & public emergency shelters.</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-800">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-700 text-[18px]">commute</span>
              <span><strong>Logistics Mode:</strong> Monitoring heavy multi-axle axle weights, Siliguri corridor bottlenecks & convoy hold bays.</span>
            </div>
          </div>
        )}
      </section>

      {/* 1. Monsoon Radar Alert Marquee Banner */}
      <div className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white p-3 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-[20px] text-white animate-spin"
              style={{ animationDuration: '6s' }}
            >
              radar
            </span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
            <span className="text-xs sm:text-sm font-semibold truncate font-['Work_Sans']">
              {t.radarAlert}
            </span>
          </div>
        </div>
        <button
          onClick={() =>
            handleSpeak(
              'monsoon',
              currentLang === 'hi'
                ? 'मानसून चेतावनी: दिमा हसाओ और मेघालय में भारी बारिश जारी है। सतर्क रहें।'
                : currentLang === 'as'
                ? 'বতৰ সংকেত: ডিমা হাছাও আৰু মেঘালয়ত ধাৰাসাৰ বৰষুণ হৈছে। সাৱধানে গাড়ী চলাওক।'
                : 'Monsoon Radar Alert: High-intensity rainfall in Dima Hasao and Meghalaya plateau. Proceed with caution.'
            )
          }
          aria-label="Listen Monsoon Alert"
          className="w-9 h-9 rounded-xl bg-white/25 hover:bg-white/35 active:scale-95 flex items-center justify-center shrink-0 transition-transform ml-2"
        >
          <span className="material-symbols-outlined text-white text-[20px]">
            {activeSpeechCard === 'monsoon' ? 'graphic_eq' : 'volume_up'}
          </span>
        </button>
      </div>

      {/* 2. Audio Co-Pilot Card */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-['Space_Grotesk'] text-xs font-bold text-slate-700 uppercase tracking-wide">
              {t.audioCopilot}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenLangModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Change language dialect"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-600">
              support_agent
            </span>
            <span>অসমীয়া / हिन्दी</span>
          </button>
        </div>

        {/* Audio Banner Trigger */}
        <button
          onClick={() =>
            handleSpeak(
              'bolo-suno',
              currentLang === 'hi'
                ? 'नमस्ते। सारथी रोड रिपोर्ट: 20 सड़कें सुरक्षित हैं। 2 सड़कों पर बारिश है। NH-29 पगला पहाड़ भूस्खलन से बंद है।'
                : currentLang === 'as'
                ? 'নমস্কাৰ। সাৰথী পথ বাৰ্তা: ২০ টা পথ সম্পূৰ্ণ খোলা। ২ টা পথত সাৱধানতা। NH-29 পাগলাপাহাৰত ভূমিস্খলনৰ বাবে পথ বন্ধ।'
                : 'Welcome to Audio Co-Pilot. 20 highways clear and open to drive. 2 segments at caution. National Highway 29 at Pagla Pahar is currently closed due to a landslide.'
            )
          }
          className="w-full min-h-[76px] rounded-2xl bg-slate-900 hover:bg-slate-800 text-white p-4 flex items-center justify-between shadow-md active:scale-[0.99] transition-transform text-left border border-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-amber-400 text-[28px]">
                {activeSpeechCard === 'bolo-suno' ? 'graphic_eq' : 'volume_up'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] text-lg font-bold uppercase tracking-wide">
                {t.boloSuno}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {t.tapToHear}
              </span>
            </div>
          </div>
          {/* Audio Equalizer Waves */}
          <div className="flex items-end gap-1 h-8 px-2">
            <span className="w-1.5 bg-slate-500 rounded-full h-4 animate-pulse" />
            <span
              className="w-1.5 bg-slate-400 rounded-full h-7 animate-pulse"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-1.5 bg-white rounded-full h-8 animate-pulse"
              style={{ animationDelay: '300ms' }}
            />
            <span
              className="w-1.5 bg-slate-400 rounded-full h-5 animate-pulse"
              style={{ animationDelay: '200ms' }}
            />
            <span
              className="w-1.5 bg-slate-500 rounded-full h-6 animate-pulse"
              style={{ animationDelay: '400ms' }}
            />
          </div>
        </button>

        {/* Quick Regional Voice Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold text-slate-600">
          <span className="shrink-0 text-[11px] font-bold text-slate-400 uppercase">
            {t.speaks}
          </span>
          {[
            { code: 'as' as LanguageCode, label: 'অসমীয়া' },
            { code: 'hi' as LanguageCode, label: 'हिन्दी' },
            { code: 'en' as LanguageCode, label: 'English' },
            { code: 'bn' as LanguageCode, label: 'বাংলা' },
            { code: 'mzo' as LanguageCode, label: 'Mizo' },
          ].map((pill) => {
            const isActive = currentLang === pill.code;
            return (
              <button
                key={pill.code}
                type="button"
                onClick={() => onSelectLang?.(pill.code)}
                className={`shrink-0 px-2.5 py-1 rounded-lg transition-all font-semibold ${
                  isActive
                    ? 'bg-slate-900 text-white border border-slate-900 shadow-xs'
                    : 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
          {onOpenLangModal && (
            <button
              type="button"
              onClick={onOpenLangModal}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all font-semibold text-[11px] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">translate</span>
              <span>+21 More</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Live Traffic Light Status Section - All Options in ONE Unified Compact List */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-slate-700 text-[18px]">
              traffic
            </span>
            <h2 className="font-['Space_Grotesk'] text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t.liveStatusTitle}
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold tracking-wider uppercase">
            {t.autoSynced}
          </span>
        </div>

        {/* All Highway Status Options in ONE unified list with small text */}
        <div className="w-full bg-white border border-slate-200/90 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
          {/* Option 1: Safe & Open Roads */}
          <div className="p-3 sm:p-3.5 flex flex-col gap-2 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs mt-0.5">
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-['Space_Grotesk'] text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                      {t.clearTitle}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold tracking-wider uppercase">
                      {t.clearStatus}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug font-normal">
                    {t.clearDesc}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  handleSpeak(
                    'clear-roads',
                    `${t.clearTitle}. ${t.clearStatus}. ${t.clearDesc}`
                  )
                }
                className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 shrink-0 flex items-center gap-1 active:scale-95 transition-transform"
                title="Listen in chosen language"
                aria-label="Listen clear roads status"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {activeSpeechCard === 'clear-roads' ? 'graphic_eq' : 'volume_up'}
                </span>
                <span className="text-[10px] font-bold uppercase">{t.sunoBtn}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-[10px] pl-10.5">
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-900 font-bold">
                NH-27 SAFE
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-900 font-bold">
                GS ROAD CLEAR
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 font-medium">
                Speed ~50 km/h
              </span>
            </div>
          </div>

          {/* Option 2: Caution / Weather Alerts */}
          <div className="p-3 sm:p-3.5 flex flex-col gap-2 hover:bg-amber-50/20 transition-colors">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs mt-0.5">
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    warning
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-['Space_Grotesk'] text-xs sm:text-sm font-bold text-amber-950 tracking-tight">
                      {t.cautionTitle}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold tracking-wider uppercase">
                      {t.cautionStatus}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug font-normal">
                    {t.cautionDesc}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  handleSpeak(
                    'caution-roads',
                    `${t.cautionTitle}. ${t.cautionStatus}. ${t.cautionDesc}`
                  )
                }
                className="h-8 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 shrink-0 flex items-center gap-1 active:scale-95 transition-transform"
                title="Listen in chosen language"
                aria-label="Listen caution roads status"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {activeSpeechCard === 'caution-roads' ? 'graphic_eq' : 'volume_up'}
                </span>
                <span className="text-[10px] font-bold uppercase">{t.sunoBtn}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-[10px] pl-10.5">
              <span className="px-2 py-0.5 rounded bg-amber-100/80 border border-amber-300 text-amber-900 font-bold">
                NH-06 SLIP
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100/80 border border-amber-300 text-amber-900 font-bold">
                DENSE FOG
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 font-medium">
                Visibility &lt; 20m
              </span>
            </div>
          </div>

          {/* Option 3: Blocked / Closed Highways */}
          <div className="p-3 sm:p-3.5 flex flex-col gap-2 hover:bg-rose-50/20 transition-colors">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200 shadow-2xs mt-0.5">
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    block
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-['Space_Grotesk'] text-xs sm:text-sm font-bold text-rose-950 tracking-tight">
                      {t.blockedTitle}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 border border-rose-300 text-rose-900 text-[10px] font-bold tracking-wider uppercase">
                      {t.blockedStatus}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug font-normal">
                    {t.blockedDesc}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  handleSpeak(
                    'blocked-roads',
                    `${t.blockedTitle}. ${t.blockedStatus}. ${t.blockedDesc}`
                  )
                }
                className="h-8 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 shrink-0 flex items-center gap-1 active:scale-95 transition-transform"
                title="Listen in chosen language"
                aria-label="Listen blocked roads status"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {activeSpeechCard === 'blocked-roads' ? 'graphic_eq' : 'volume_up'}
                </span>
                <span className="text-[10px] font-bold uppercase">{t.sunoBtn}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-[10px] pl-10.5">
              <span className="px-2 py-0.5 rounded bg-rose-100/80 border border-rose-300 text-rose-900 font-bold">
                NH-29 PAGLA PAHAR
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-100/80 border border-rose-300 text-rose-900 font-bold">
                NO ENTRY
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 font-medium">
                Clearing in ~6h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Hill Truck Convoy Radar */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-900 text-[24px]">
              near_me
            </span>
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 uppercase tracking-wide">
              {t.convoyRadarTitle}
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold uppercase">
            {t.gpsActive}
          </span>
        </div>

        {/* Live Corridor Map Card */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-300 bg-slate-800 flex items-center justify-center">
          {/* Stylized background terrain grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

          {/* Road contour curve representation */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180">
            <path
              d="M 20 140 Q 120 40, 240 100 T 380 40"
              fill="none"
              stroke="#64748b"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Active convoy path */}
            <path
              d="M 20 140 Q 120 40, 200 85"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Blocked section ahead */}
            <path
              d="M 200 85 Q 240 100, 290 80"
              fill="none"
              stroke="#ef4444"
              strokeWidth="6"
              strokeDasharray="4 4"
            />

            {/* Truck Icon on path */}
            <circle cx="200" cy="85" r="9" fill="#475569" stroke="#fff" strokeWidth="2" />
            <circle cx="280" cy="82" r="10" fill="#dc2626" stroke="#fff" strokeWidth="2" />
            <text x="274" y="86" fill="#fff" fontSize="12" fontWeight="bold">✕</text>
          </svg>

          {/* Callout overlays */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md p-2 rounded-lg shadow-md border border-slate-200 max-w-[210px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              {t.currentCorridor}
            </span>
            <span className="font-['Space_Grotesk'] text-xs font-bold text-slate-900 block">
              {t.guwahatiKohima}
            </span>
            <span className="text-[10px] font-semibold text-slate-600 block">
              {t.convoyLine}
            </span>
          </div>

          {/* Blocked and safe parking indicators */}
          <div className="absolute top-3 right-3 bg-rose-600 text-white px-2 py-0.5 rounded text-[11px] font-bold uppercase shadow-sm animate-pulse">
            {t.blockedAhead}
          </div>

          <button
            type="button"
            onClick={onOpenRouteModal}
            title="Inspect 22 cached North East corridors in low connectivity"
            className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-300 shadow-md flex items-center gap-1.5 text-left hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600">offline_pin</span>
            <div className="flex flex-col leading-tight">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Offline Cache</span>
              <span className="text-[10px] font-bold text-slate-800">22 Corridors Ready</span>
            </div>
          </button>

          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-300 shadow-md text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              {t.safeParkingLabel || 'SAFE PARKING'}
            </span>
            <span className="font-['Space_Grotesk'] text-xs font-black text-slate-900 block">
              {t.safeParkingDistance || '12 KM AWAY'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Siliguri Lifeline & All-India Radar */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">
                hub
              </span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
                {t.siliguriTitle}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {t.siliguriSub}
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              handleSpeak(
                'siliguri',
                'Siliguri Lifeline: The 22 kilometer Chicken’s Neck corridor connecting all eight North-Eastern states to mainland India is 100% clear. NH-27 East-West and NH-12 are flowing freely.'
              )
            }
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center shrink-0 text-slate-700"
            title="Listen Siliguri Corridor status"
          >
            <span className="material-symbols-outlined text-[20px]">
              {activeSpeechCard === 'siliguri' ? 'graphic_eq' : 'volume_up'}
            </span>
          </button>
        </div>

        {/* Radar Graphic Box */}
        <div className="w-full bg-zinc-950 rounded-xl p-4 text-white flex flex-col gap-3 relative overflow-hidden border border-zinc-800">
          <div className="flex items-center justify-between text-xs z-10">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              {t.chickensNeckBanner || 'CHICKEN’S NECK: 100% CLEAR'}
            </span>
            <span className="text-zinc-400 font-mono text-[11px]">
              {t.gatewayLabel || '22 km GATEWAY'}
            </span>
          </div>

          {/* Schematic SVG Map of Chicken's neck and 8 NE States */}
          <div className="relative h-32 w-full flex items-center justify-center bg-black/60 rounded-lg border border-zinc-800/80 p-2">
            <svg viewBox="0 0 360 110" className="w-full h-full">
              {/* Mainland path */}
              <path
                d="M 20 60 L 90 60"
                stroke="#52525b"
                strokeWidth="4"
                strokeDasharray="3 3"
              />
              <text x="18" y="50" fill="#a1a1aa" fontSize="8" fontFamily="sans-serif">
                DELHI / GUJARAT
              </text>

              {/* Kolkata path */}
              <path
                d="M 50 100 L 100 65"
                stroke="#52525b"
                strokeWidth="4"
                strokeDasharray="3 3"
              />
              <text x="35" y="105" fill="#a1a1aa" fontSize="8" fontFamily="sans-serif">
                KOLKATA PORT
              </text>

              {/* Chicken's Neck funnel */}
              <rect
                x="105"
                y="45"
                width="65"
                height="30"
                rx="6"
                fill="#334155"
                opacity="0.85"
                stroke="#64748b"
                strokeWidth="1.5"
              />
              <text
                x="110"
                y="58"
                fill="#f1f5f9"
                fontSize="8"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                SILIGURI CHOKE
              </text>
              <text
                x="110"
                y="69"
                fill="#cbd5e1"
                fontSize="7"
                fontFamily="sans-serif"
              >
                22 km Funnel
              </text>

              {/* Pipeline connecting to NE */}
              <path
                d="M 170 60 L 220 50 L 260 30"
                stroke="#94a3b8"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 220 50 L 280 65 L 340 75"
                stroke="#94a3b8"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* NE Hub Nodes */}
              <circle cx="220" cy="50" r="4" fill="#cbd5e1" />
              <text x="215" y="42" fill="#fff" fontSize="8" fontWeight="bold">
                GHY HUB
              </text>

              <circle cx="260" cy="30" r="3.5" fill="#94a3b8" />
              <text x="265" y="32" fill="#cbd5e1" fontSize="7">
                ARUNACHAL
              </text>

              <circle cx="280" cy="65" r="3.5" fill="#f59e0b" />
              <text x="285" y="67" fill="#fde68a" fontSize="7">
                NAGALAND
              </text>

              <circle cx="340" cy="75" r="3.5" fill="#f43f5e" />
              <text x="315" y="90" fill="#fecdd3" fontSize="7">
                MANIPUR / MIZO
              </text>
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block font-semibold">
                NH-27 East-West Corridor
              </span>
              <span className="text-amber-400 font-bold text-xs">
                Gujarat / Delhi → Flowing
              </span>
            </div>
            <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block font-semibold">
                NH-12/19 Sea Port
              </span>
              <span className="text-amber-400 font-bold text-xs">
                Kolkata Port → Active
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setRadarZoomed(!radarZoomed);
              onSelectTab('route');
            }}
            className="w-full min-h-[46px] mt-1 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white rounded-xl font-['Space_Grotesk'] text-xs font-bold flex items-center justify-between px-3 border border-zinc-800 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-amber-400">
                zoom_in_map
              </span>
              {t.tapToZoom}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold border border-amber-400/30">
              LIVE GPS
            </span>
          </button>
        </div>
      </div>

      {/* 6. Driver Quick Touch Actions (1-Tap Controls) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 uppercase tracking-wide">
            {t.quickTouchTitle}
          </h2>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t.oneTap}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {/* 1. Check My Safe Route */}
          <button
            onClick={onOpenRouteModal}
            className="w-full min-h-[64px] bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl p-3.5 border border-slate-200/90 shadow-sm flex items-center justify-between gap-3 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200">
                <span className="material-symbols-outlined text-[26px]">
                  fork_right
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
                  {t.checkRoute}
                </span>
                <span className="text-xs text-slate-500 truncate">
                  {t.checkRouteSub}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-2 py-1 rounded bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                NH-27/29
              </span>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">
                arrow_forward
              </span>
            </div>
          </button>

          {/* 2. Report Broken Road */}
          <button
            onClick={onOpenReportModal}
            className="w-full min-h-[64px] bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl p-3.5 border border-slate-200/90 shadow-sm flex items-center justify-between gap-3 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                <span className="material-symbols-outlined text-[26px]">
                  add_a_photo
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
                    {t.reportRoad}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">
                    VOICE/PHOTO
                  </span>
                </div>
                <span className="text-xs text-slate-500 truncate">
                  {t.reportRoadSub}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-amber-600 text-[24px] shrink-0">
              mic
            </span>
          </button>

          {/* 3. Field Officer Official Incident Dispatch (SMS & Voice) */}
          <button
            type="button"
            onClick={onOpenFieldOfficerModal}
            className={`w-full min-h-[64px] rounded-2xl p-3.5 border shadow-sm flex items-center justify-between gap-3 text-left transition-all ${
              activeRole === 'field_officer'
                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 hover:bg-amber-100/50'
                : 'bg-white hover:bg-slate-50 border-slate-200/90'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                activeRole === 'field_officer'
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                <span className="material-symbols-outlined text-[26px]">
                  shield_person
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
                    Field Officer Incident Desk
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 text-[10px] font-bold uppercase">
                    SMS & VOICE
                  </span>
                </div>
                <span className="text-xs text-slate-500 truncate">
                  BRO & Highway Patrol Official Landslide/Accident Dispatch
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-amber-700">
              <span className="material-symbols-outlined text-[20px]">mic</span>
              <span className="material-symbols-outlined text-[20px]">sms</span>
            </div>
          </button>

          {/* 4. Call 112 Highway Police */}
          <a
            href="tel:112"
            className="w-full min-h-[68px] bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-2xl p-3.5 shadow-md shadow-rose-600/25 flex items-center justify-between gap-3 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[28px]">
                  local_police
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] text-sm sm:text-base font-bold uppercase tracking-wide">
                  {t.call112}
                </span>
                <span className="text-xs text-rose-100 font-medium">
                  {t.call112Sub}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white text-rose-600 flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">
                call
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
