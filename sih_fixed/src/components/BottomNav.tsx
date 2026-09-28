import React from 'react';
import { TabType, LanguageCode } from '../types';
import { I18N_TRANSLATIONS } from '../data/mockData';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentLang: LanguageCode;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  currentLang,
}) => {
  const t = I18N_TRANSLATIONS[currentLang] || I18N_TRANSLATIONS.en;

  const tabs: { id: TabType; label: string; icon: string; isSos?: boolean }[] = [
    { id: 'status', label: t.statusTab, icon: 'traffic' },
    { id: 'route', label: t.routeTab, icon: 'fork_right' },
    { id: 'alerts', label: t.alertsTab, icon: 'volume_up' },
    { id: 'sos', label: t.sosTab, icon: 'emergency', isSos: true },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-[env(safe-area-inset-bottom,0px)] bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
      <div className="max-w-4xl mx-auto flex justify-between items-center h-20 px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          let btnClass =
            'flex flex-col items-center justify-center min-h-[56px] min-w-[56px] flex-1 py-1 rounded-xl transition-all select-none ';

          if (tab.isSos) {
            if (isActive) {
              btnClass +=
                'bg-rose-50 text-rose-600 shadow-[inset_0_0_0_1.5px_rgba(225,29,72,0.4)]';
            } else {
              btnClass += 'text-rose-600 hover:text-rose-700 hover:bg-rose-50/50';
            }
          } else if (isActive) {
            btnClass +=
              'bg-slate-900 text-white shadow-sm';
          } else {
            btnClass += 'text-slate-500 hover:text-slate-900 hover:bg-slate-50';
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={btnClass}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`material-symbols-outlined text-[26px] ${
                  tab.isSos ? 'text-rose-600' : ''
                }`}
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {tab.icon}
              </span>
              <span
                className={`font-['Space_Grotesk'] text-xs uppercase tracking-tight mt-0.5 ${
                  isActive ? 'font-bold' : 'font-semibold'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
