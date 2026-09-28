import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode } from '../types';
import { I18N_TRANSLATIONS, AUDIO_ALERTS, LANGUAGES, getLocalizedAlerts } from '../data/mockData';
import { speakSpeech, stopSpeech } from '../utils/speech';

interface AlertsScreenProps {
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  onOpenLangModal?: () => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  currentLang,
  onSelectLang,
  onOpenLangModal,
}) => {
  const t = I18N_TRANSLATIONS[currentLang] || I18N_TRANSLATIONS.en;
  const alerts = getLocalizedAlerts(currentLang);

  const [isPlayingMain, setIsPlayingMain] = useState(false);
  const [speakingSpeed, setSpeakingSpeed] = useState<number>(1.0);
  const [elapsedSeconds, setElapsedSeconds] = useState(4);
  const [playingAlertId, setPlayingAlertId] = useState<string | null>(null);

  const spectrumHeights = [
    'h-3', 'h-8', 'h-11', 'h-5', 'h-9', 'h-12', 'h-6', 'h-10', 'h-4', 'h-7',
  ];
  const [currentHeights, setCurrentHeights] = useState<string[]>(spectrumHeights);
  const timerRef = useRef<number | null>(null);
  const spectrumRef = useRef<number | null>(null);

  // Equalizer animation effect
  useEffect(() => {
    if (isPlayingMain || playingAlertId) {
      spectrumRef.current = window.setInterval(() => {
        const pool = ['h-2', 'h-4', 'h-6', 'h-8', 'h-10', 'h-12'];
        setCurrentHeights((prev) =>
          prev.map(() => pool[Math.floor(Math.random() * pool.length)])
        );
      }, 140);

      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => (prev >= 75 ? 0 : prev + 1));
      }, 1000);
    } else {
      if (spectrumRef.current) clearInterval(spectrumRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentHeights(spectrumHeights);
    }

    return () => {
      if (spectrumRef.current) clearInterval(spectrumRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlayingMain, playingAlertId]);

  const toggleMainBulletin = () => {
    if (isPlayingMain) {
      stopSpeech();
      setIsPlayingMain(false);
    } else {
      stopSpeech();
      setPlayingAlertId(null);
      setIsPlayingMain(true);

      const script =
        currentLang === 'hi'
          ? 'पूर्वोत्तर सड़क बुलेटिन: असम-नागालैंड NH कॉरिडोर पर भूस्खलन। NH-29 पगला पहाड़ बंद है। काजीरंगा NH-715 सुरक्षित है।'
          : currentLang === 'as'
          ? 'উত্তৰ-পূব আঞ্চলিক বাট-পথ বুলেটিন: অসম-নাগালেণ্ড কৰিডৰত ভূমিস্খলন। NH-29 পথ বন্ধ। কাজিৰঙা ৭১৫ পথ সুকলমে চলিছে।'
          : 'Live Regional Road Bulletin for Assam and Nagaland corridors: Heavy landslide at Pagla Pahar on NH-29. Highway closed. Kaziranga corridor NH-715 open.';

      speakSpeech(script, currentLang, speakingSpeed, undefined, () => {
        setIsPlayingMain(false);
      });
    }
  };

  const handlePlayCard = (cardId: string, text: string) => {
    if (playingAlertId === cardId) {
      stopSpeech();
      setPlayingAlertId(null);
    } else {
      stopSpeech();
      setIsPlayingMain(false);
      setPlayingAlertId(cardId);
      speakSpeech(text, currentLang, speakingSpeed, undefined, () => {
        setPlayingAlertId(null);
      });
    }
  };

  const handleReadAll = () => {
    stopSpeech();
    setIsPlayingMain(true);
    const fullText = alerts.map((a) => a.audioText).join(' ... ');
    speakSpeech(fullText, currentLang, speakingSpeed, undefined, () => {
      setIsPlayingMain(false);
    });
  };

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col w-full gap-4 pb-16">
      {/* 1. Massive Audio Player Card */}
      <section className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-slate-100/50 blur-3xl pointer-events-none" />

        {/* Header & Live Broadcast Status */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[26px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                volume_up
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-['Space_Grotesk'] text-base sm:text-lg text-slate-900 uppercase tracking-tight truncate font-bold">
                {t.roadBulletinTitle}
              </span>
              <span className="text-xs font-semibold text-slate-600 truncate">
                {t.roadBulletinSub}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 border border-rose-200 text-rose-700 shrink-0">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span className="font-['Space_Grotesk'] text-xs uppercase tracking-wider font-bold">
              LIVE
            </span>
          </div>
        </div>

        {/* Visualizer & Giant Play Button Container */}
        <div className="flex flex-col items-center justify-center py-4 bg-slate-50/80 border border-slate-200 rounded-xl px-4 gap-3 shadow-2xs relative z-10">
          {/* Animated Spectrum Equalizer Bars */}
          <div className="flex items-end justify-center gap-1.5 h-12 w-full px-2">
            {currentHeights.map((hClass, idx) => (
              <span
                key={idx}
                className={`w-2 rounded-full ${hClass} transition-all duration-150 ${
                  idx % 3 === 0
                    ? 'bg-slate-400'
                    : idx % 2 === 0
                    ? 'bg-slate-600'
                    : 'bg-slate-900'
                }`}
              />
            ))}
          </div>

          {/* Giant Circular Play/Pause Button */}
          <div className="flex items-center justify-center gap-4 w-full">
            <button
              onClick={toggleMainBulletin}
              aria-label="Play or Pause Main Road Bulletin"
              className="min-h-[72px] min-w-[72px] w-20 h-20 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-slate-900/20 transition-all focus:outline-none"
            >
              <span
                className="material-symbols-outlined text-[44px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isPlayingMain ? 'pause' : 'play_arrow'}
              </span>
            </button>
          </div>

          {/* Progress & Corridor Tag */}
          <div className="flex items-center justify-between w-full text-xs text-slate-500 px-1 font-semibold">
            <span className="font-mono text-slate-700 font-bold">
              {formatElapsed(elapsedSeconds)}
            </span>
            <span className="text-slate-700 font-bold tracking-wider uppercase text-center flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-slate-500">
                graphic_eq
              </span>
              Assam-Nagaland NH Corridor
            </span>
            <span className="font-mono text-slate-700 font-bold">1:15</span>
          </div>
        </div>

        {/* Speed Controls: 0.8x and 1.0x */}
        <div className="flex flex-col gap-2 relative z-10">
          <span className="font-['Space_Grotesk'] text-xs font-bold text-slate-600 uppercase tracking-wider">
            {t.speakingSpeed}
          </span>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Audio Playback Speed">
            <button
              onClick={() => setSpeakingSpeed(0.8)}
              className={`min-h-[48px] rounded-xl flex items-center justify-center gap-2 text-sm font-semibold active:scale-95 transition-all shadow-2xs border ${
                speakingSpeed === 0.8
                  ? 'bg-slate-900 border-slate-900 text-white font-bold'
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${
                  speakingSpeed === 0.8 ? 'text-white' : 'text-amber-600'
                }`}
              >
                slow_motion_video
              </span>
              <span>{t.slowSpeed}</span>
            </button>

            <button
              onClick={() => setSpeakingSpeed(1.0)}
              className={`min-h-[48px] rounded-xl flex items-center justify-center gap-2 text-sm font-semibold active:scale-95 transition-all shadow-2xs border ${
                speakingSpeed === 1.0
                  ? 'bg-slate-900 border-slate-900 text-white font-bold'
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${
                  speakingSpeed === 1.0 ? 'text-white' : 'text-slate-600'
                }`}
              >
                play_circle
              </span>
              <span>{t.normalSpeed}</span>
            </button>
          </div>
        </div>

        {/* Language Strip with Native Scripts */}
        <div className="flex flex-col gap-2 pt-1 relative z-10">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-xs font-bold text-slate-600 uppercase tracking-wider">
              {t.voiceLangTitle}
            </span>
            {onOpenLangModal && (
              <button
                onClick={onOpenLangModal}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
              >
                <span>View All 26 Languages</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {LANGUAGES.slice(0, 10).map((lang) => {
              const isCurrent = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => onSelectLang(lang.code)}
                  className={`shrink-0 min-h-[46px] px-3.5 rounded-xl text-sm flex items-center gap-1.5 transition-all border ${
                    isCurrent
                      ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-sm'
                      : 'bg-white text-slate-800 font-semibold border-slate-200 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  {isCurrent && (
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  )}
                  <span>{lang.nativeName}</span>
                </button>
              );
            })}

            {onOpenLangModal && (
              <button
                onClick={onOpenLangModal}
                className="shrink-0 min-h-[46px] px-4 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 hover:bg-slate-200 flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                <span>+16 More</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Route Audio Cards Section */}
      <section className="flex flex-col gap-2.5 mt-1">
        <div className="flex items-center justify-between px-1">
          <span className="font-['Space_Grotesk'] text-base sm:text-lg text-slate-900 uppercase tracking-wide font-bold">
            {t.routeAudioCards}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {t.tapCardToHear}
          </span>
        </div>

        {/* 4 Cards matching Image 8 */}
        {alerts.map((alert) => {
          const isThisPlaying = playingAlertId === alert.id;
          return (
            <article
              key={alert.id}
              onClick={() => handlePlayCard(alert.id, alert.audioText)}
              className={`w-full min-h-[96px] bg-white rounded-2xl p-4 flex items-center justify-between gap-3 border-l-4 ${alert.borderClass} border-y border-r border-slate-200 shadow-2xs active:${alert.bgClass} transition-colors cursor-pointer`}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-13 h-13 rounded-xl ${alert.iconBgClass} flex items-center justify-center shrink-0 border shadow-2xs`}
                >
                  <span
                    className="material-symbols-outlined text-[30px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {alert.icon}
                  </span>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded ${alert.badgeClass} border font-['Space_Grotesk'] text-[11px] font-bold uppercase tracking-wider`}
                    >
                      {alert.categoryNative} • {alert.categoryLabel}
                    </span>
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px]">
                        schedule
                      </span>{' '}
                      {alert.duration}
                    </span>
                  </div>

                  <p className="text-sm text-slate-900 font-bold line-clamp-2 mt-1 leading-snug">
                    {alert.title}
                  </p>
                  <span className="text-xs text-slate-500 mt-0.5 font-medium">
                    {alert.titleNative}
                  </span>
                </div>
              </div>

              <button
                aria-label={`Listen to ${alert.categoryLabel}`}
                className={`min-h-[48px] min-w-[48px] w-12 h-12 rounded-full text-white flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-transform ${
                  alert.category === 'blocked'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : alert.category === 'rain'
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isThisPlaying ? 'graphic_eq' : 'volume_up'}
                </span>
              </button>
            </article>
          );
        })}
      </section>

      {/* 3. Non-Reader Voice Walkthrough Quick Helper */}
      <section className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700 border border-slate-200">
          <span className="material-symbols-outlined text-[26px]">hearing</span>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-['Space_Grotesk'] text-base text-slate-900 font-bold leading-tight">
            {t.noNeedToRead}
          </span>
          <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
            {t.noNeedToReadSub}
          </p>
        </div>
      </section>

      {/* 4. Sticky Driver Audio Action: Read Everything Aloud */}
      <div className="sticky bottom-2 w-full z-40 pt-1">
        <button
          onClick={handleReadAll}
          className="w-full min-h-[64px] bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-xl shadow-slate-900/20 transition-all border border-slate-800 focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[26px] animate-pulse">
                campaign
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-['Space_Grotesk'] text-base uppercase tracking-tight leading-none text-white font-bold">
                {t.readEverything}
              </span>
              <span className="text-xs text-slate-400 mt-1 font-medium">
                {t.readEverythingSub}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[28px] shrink-0 text-amber-400">
            mic
          </span>
        </button>
      </div>
    </div>
  );
};
