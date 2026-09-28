import React, { useState, useMemo } from 'react';
import { LanguageCode } from '../types';
import { LANGUAGES } from '../data/mockData';
import { speakSpeech } from '../utils/speech';

interface LanguageModalProps {
  currentLang: LanguageCode;
  onClose: () => void;
  onSelectLang: (lang: LanguageCode) => void;
}

const REGION_CATEGORIES = [
  'All',
  'North East',
  'North & Central',
  'Western India',
  'Southern India',
  'Eastern & Others',
];

export const LanguageModal: React.FC<LanguageModalProps> = ({
  currentLang,
  onClose,
  onSelectLang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredLanguages = useMemo(() => {
    return LANGUAGES.filter((item) => {
      // Category filter
      let matchesCategory = true;
      if (activeCategory === 'North East') {
        matchesCategory = ['as', 'bn', 'brx', 'mni', 'mzo', 'ne', 'kha', 'grt'].includes(item.code);
      } else if (activeCategory === 'North & Central') {
        matchesCategory = ['hi', 'pa', 'ur', 'doi', 'ks', 'mai'].includes(item.code);
      } else if (activeCategory === 'Western India') {
        matchesCategory = ['gu', 'mr', 'kok', 'sd'].includes(item.code);
      } else if (activeCategory === 'Southern India') {
        matchesCategory = ['ta', 'te', 'kn', 'ml'].includes(item.code);
      } else if (activeCategory === 'Eastern & Others') {
        matchesCategory = ['or', 'sat', 'sa', 'en'].includes(item.code);
      }

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.nativeName.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const handleTestVoice = (lang: (typeof LANGUAGES)[0]) => {
    onSelectLang(lang.code);
    speakSpeech(lang.sampleGreeting, lang.code, 1.0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">
                  translate
                </span>
              </div>
              <div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 uppercase tracking-tight">
                  Languages of India • ভাষা
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  26 National & Regional Languages for Voice Co-Pilot & Navigation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close language selector"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Hindi, Punjabi, Bengali, Tamil, Gujarati, Odia..."
              className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {REGION_CATEGORIES.map((cat) => {
              const isCatActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                    isCatActive
                      ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Language List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {filteredLanguages.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No matching languages found for "{searchQuery}"
            </div>
          ) : (
            filteredLanguages.map((item) => {
              const isSelected = currentLang === item.code;
              return (
                <button
                  key={item.code}
                  onClick={() => {
                    handleTestVoice(item);
                    onClose();
                  }}
                  className={`w-full min-h-[58px] rounded-2xl p-3.5 flex items-center justify-between border transition-all text-left group ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0">{item.flag}</span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className={`font-['Space_Grotesk'] text-base sm:text-lg font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {item.nativeName}
                        </span>
                        <span className={`text-xs font-semibold truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          ({item.name})
                        </span>
                      </div>
                      <span className={`text-[11px] font-medium truncate ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        {item.region}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title="Listen to sample audio"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakSpeech(item.sampleGreeting, item.code, 1.0);
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        volume_up
                      </span>
                    </div>
                    {isSelected && (
                      <span
                        className="material-symbols-outlined text-amber-500 text-[24px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Active: <strong className="text-slate-800">{LANGUAGES.find((l) => l.code === currentLang)?.nativeName || currentLang}</strong>
          </span>
          <button
            onClick={onClose}
            className="min-h-[42px] px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-['Space_Grotesk'] text-xs font-bold uppercase transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
