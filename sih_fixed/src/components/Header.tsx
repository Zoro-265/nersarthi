import React from 'react';
import { LanguageCode, DriverProfile } from '../types';
import { I18N_TRANSLATIONS, LANGUAGES } from '../data/mockData';
import { useConnectivity } from '../utils/useConnectivity';

interface HeaderProps {
  currentLang: LanguageCode;
  driverProfile: DriverProfile | null;
  onOpenLangModal: () => void;
  onOpenProfileModal: () => void;
  onSelectTab: (tab: 'status' | 'route' | 'alerts' | 'sos') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  driverProfile,
  onOpenLangModal,
  onOpenProfileModal,
  onSelectTab,
}) => {
  const t = I18N_TRANSLATIONS[currentLang] || I18N_TRANSLATIONS.en;
  const currentLangObj = LANGUAGES.find((l) => l.code === currentLang);
  const isGuest = !driverProfile || driverProfile.isGuest;
  const { isEffectiveOffline } = useConnectivity();

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
      <div className="max-w-4xl mx-auto h-20 px-4 flex items-center justify-between gap-2">
        {/* Left: Brand & Navigation Road Crest (Universal for Locals & Travelers) */}
        <button
          onClick={() => onSelectTab('status')}
          className="flex items-center gap-2.5 min-w-0 flex-1 text-left focus:outline-none group"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 group-hover:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm transition-colors">
            <span
              className="material-symbols-outlined text-white text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              route
            </span>
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            {t.brand && t.brand !== 'SIH' && (
              <div className="flex items-baseline gap-1">
                <span className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 uppercase tracking-tight truncate">
                  {t.brand}
                </span>
              </div>
            )}
            <span
              className={`${
                t.brand && t.brand !== 'SIH'
                  ? 'text-xs font-semibold text-slate-600'
                  : "font-['Space_Grotesk'] text-base sm:text-lg font-bold text-slate-900"
              } truncate tracking-tight`}
            >
              {t.subBrand}
            </span>
          </div>
        </button>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Offline Shadow Zone Indicator */}
          {isEffectiveOffline && (
            <button
              type="button"
              onClick={() => onSelectTab('route')}
              title="Operating from local highway cache in low-connectivity area"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-700 animate-pulse">
                cloud_off
              </span>
              <span>Offline Cache Active</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={onOpenLangModal}
            aria-label="Change Language"
            className="min-h-[46px] px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-200 rounded-xl flex items-center gap-1.5 text-slate-800 text-sm font-semibold border border-slate-200 focus:outline-none transition-colors"
          >
            <span className="material-symbols-outlined text-slate-800 text-[20px]">
              translate
            </span>
            <span className="font-bold text-xs text-slate-900 max-w-[80px] truncate">
              {currentLangObj ? currentLangObj.nativeName : 'অ/हि/En'}
            </span>
          </button>

          {/* Emergency SOS Call 112 direct button */}
          <button
            onClick={() => onSelectTab('sos')}
            aria-label="Emergency SOS Call 112"
            className="min-h-[46px] min-w-[50px] px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all focus:outline-none"
          >
            <span
              className="material-symbols-outlined text-[22px] animate-pulse text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              e911_emergency
            </span>
            <span className="font-['Space_Grotesk'] text-sm font-bold pr-0.5">112</span>
          </button>

          {/* Profile / Driver Status Avatar Button */}
          <button
            onClick={onOpenProfileModal}
            aria-label="Driver Profile & Fleet Settings"
            className="min-h-[46px] px-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-200 rounded-xl flex items-center gap-1.5 border border-slate-200 focus:outline-none transition-colors"
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${
                isGuest ? 'bg-slate-600' : 'bg-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isGuest ? 'no_accounts' : 'person'}
              </span>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-bold text-slate-900 leading-tight max-w-[80px] truncate">
                {isGuest ? 'Guest' : driverProfile?.name?.split(' ')[0] || 'Driver'}
              </span>
              <span className="text-[9px] text-slate-500 font-semibold tracking-tight uppercase">
                {isGuest ? 'Tap to login' : driverProfile?.vehicleNumber || 'Profile'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
