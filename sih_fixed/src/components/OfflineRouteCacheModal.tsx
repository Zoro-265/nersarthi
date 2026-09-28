import React, { useState } from 'react';
import { LanguageCode } from '../types';
import {
  EnrichedRoadSegment,
  RouteCacheMetadata,
  filterCachedSegments,
  syncRouteCache,
} from '../utils/routeCache';
import { speakSpeech } from '../utils/speech';

interface OfflineRouteCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
  cachedSegments: EnrichedRoadSegment[];
  cacheMeta: RouteCacheMetadata;
  currentLang: LanguageCode;
  isEffectiveOffline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulateOffline: () => void;
  onCacheUpdated: (newSegments: EnrichedRoadSegment[], newMeta: RouteCacheMetadata) => void;
  onSelectSegmentFromCache?: (segment: EnrichedRoadSegment) => void;
}

export const OfflineRouteCacheModal: React.FC<OfflineRouteCacheModalProps> = ({
  isOpen,
  onClose,
  cachedSegments,
  cacheMeta,
  currentLang,
  isEffectiveOffline,
  isSimulatedOffline,
  onToggleSimulateOffline,
  onCacheUpdated,
  onSelectSegmentFromCache,
}) => {
  const [selectedState, setSelectedState] = useState<string>('all');
  const [shadowZoneOnly, setShadowZoneOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const states = [
    { code: 'all', name: 'All 8 States' },
    { code: 'AS', name: 'Assam' },
    { code: 'AR', name: 'Arunachal Pradesh' },
    { code: 'ML', name: 'Meghalaya' },
    { code: 'NL', name: 'Nagaland' },
    { code: 'MN', name: 'Manipur' },
    { code: 'MZ', name: 'Mizoram' },
    { code: 'TR', name: 'Tripura' },
    { code: 'SK', name: 'Sikkim' },
  ];

  const filteredSegments = filterCachedSegments(cachedSegments, {
    stateCode: selectedState,
    shadowZoneOnly,
    searchQuery,
  });

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    setTimeout(() => {
      const res = syncRouteCache();
      setIsSyncing(false);
      setSyncFeedback('✅ Cache synchronized! All 22 highway segments updated for offline use.');
      onCacheUpdated(cachedSegments, res.meta);
      setTimeout(() => setSyncFeedback(null), 4000);
    }, 650);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cachedSegments, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sarthi_ne_highway_cache_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSpeakSegment = (e: React.MouseEvent, seg: EnrichedRoadSegment) => {
    e.stopPropagation();
    const text = `${seg.name}, ${seg.hw}. ${seg.state}. Altitude ${seg.elevationFt} feet. Clearance: ${seg.clearance}. Nearest safe shelter: ${seg.nearestShelter.name}, ${seg.nearestShelter.distanceKm} km away. Bypass: ${seg.bypassRoute}. Emergency: ${seg.emergencyDesk}.`;
    speakSpeech(text, currentLang, 1.0);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-[24px]">save</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Space_Grotesk'] text-lg font-bold uppercase tracking-tight">
                  Offline Highway Cache
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  v{cacheMeta.version}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                North East India Low-Connectivity &amp; Shadow Zone Highway Database
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Telemetry Bar & Controls */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500">Cached Segments</span>
              <span className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                {cacheMeta.totalSegments} Corridors
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Highway Span</span>
              <span className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                {cacheMeta.totalKm} km
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500">Cache Footprint</span>
              <span className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                {cacheMeta.sizeKb} KB Local
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500">Offline Status</span>
              <span className="font-['Space_Grotesk'] text-base font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                100% Ready
              </span>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{isSyncing ? 'Synchronizing...' : 'Refresh / Preload Cache'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Download JSON backup for offline inspection"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-500">
                  download
                </span>
                <span>Export Pack</span>
              </button>
            </div>

            {/* Simulated Shadow Zone Toggle */}
            <label className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl cursor-pointer select-none text-xs">
              <input
                type="checkbox"
                checked={isSimulatedOffline}
                onChange={onToggleSimulateOffline}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-amber-900">
                Simulate Zero-Signal Shadow Zone
              </span>
            </label>
          </div>

          {syncFeedback && (
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl animate-in fade-in">
              {syncFeedback}
            </div>
          )}

          {isEffectiveOffline && (
            <div className="text-xs bg-amber-100/80 border border-amber-300 text-amber-900 px-3 py-2 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-700 text-[18px]">
                cloud_off
              </span>
              <span>
                <strong>Shadow Zone Active:</strong> All routing, clearances, and emergency coordinates are served instantly from this local device cache without internet access.
              </span>
            </div>
          )}
        </div>

        {/* Filters & Search */}
        <div className="p-3 sm:px-4 border-b border-slate-100 flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search highway (e.g., NH-27, Pagla Pahar, Sela, Sonapur, Aizawl)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* High-Risk Shadow Zone Quick Filter */}
            <button
              type="button"
              onClick={() => setShadowZoneOnly(!shadowZoneOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                shadowZoneOnly
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                warning
              </span>
              <span>Critical Shadow Zones Only</span>
            </button>
          </div>

          {/* State Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {states.map((st) => (
              <button
                key={st.code}
                type="button"
                onClick={() => setSelectedState(st.code)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedState === st.code
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>

        {/* Cached Segment List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
            <span>
              Showing {filteredSegments.length} of {cachedSegments.length} Cached Highway Corridors
            </span>
            <span>Last Synced: {new Date(cacheMeta.lastUpdated).toLocaleTimeString()}</span>
          </div>

          {filteredSegments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">
                content_paste_off
              </span>
              No cached highway segments match your query.
            </div>
          ) : (
            filteredSegments.map((seg) => {
              const isExpanded = expandedId === seg.id;
              const isHighShadow = seg.shadowZoneRisk === 'High';

              return (
                <div
                  key={seg.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isExpanded ? 'border-slate-400 shadow-md ring-1 ring-slate-400' : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Card Header row */}
                  <div
                    className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                    onClick={() => setExpandedId(isExpanded ? null : seg.id)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex flex-col items-center justify-center w-12 h-11 rounded-xl bg-slate-900 text-white shrink-0">
                        <span className="text-[10px] uppercase font-bold text-amber-400 leading-none">
                          {seg.hw.split('-')[0]}
                        </span>
                        <span className="font-['Space_Grotesk'] text-sm font-extrabold leading-none mt-0.5">
                          {seg.hw.split('-')[1] || seg.hw}
                        </span>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 truncate">
                            {seg.name}
                          </span>
                          {isHighShadow && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 uppercase">
                              Shadow Zone
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <span>{seg.state}</span>
                          <span>•</span>
                          <span>{seg.lenKm} km</span>
                          <span>•</span>
                          <span>{seg.elevationFt.toLocaleString()} ft alt</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleSpeakSegment(e, seg)}
                        title="Listen to offline voice briefing"
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-amber-600">
                          volume_up
                        </span>
                      </button>

                      <div className="w-6 h-6 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-[20px]">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detailed Offline Dossier */}
                  {isExpanded && (
                    <div className="px-3 sm:px-4 pb-3.5 pt-1 border-t border-slate-100 bg-slate-50/60 flex flex-col gap-2.5 text-xs animate-in fade-in">
                      {/* Clearance & Hazard info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            Clearance Condition
                          </span>
                          <span className="font-semibold text-slate-800 mt-0.5 block">
                            {seg.clearance}
                          </span>
                          {seg.cause && (
                            <span className="text-[11px] text-amber-800 mt-1 block">
                              ⚠️ {seg.cause}
                            </span>
                          )}
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            Recommended Offline Bypass
                          </span>
                          <span className="font-medium text-slate-800 mt-0.5 block">
                            {seg.bypassRoute}
                          </span>
                        </div>
                      </div>

                      {/* Safe Shelter & Emergency Contact */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Shelter */}
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-emerald-700">
                              Safe Parking Shelter ({seg.nearestShelter.distanceKm} km away)
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 block mt-0.5">
                            {seg.nearestShelter.name}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {seg.nearestShelter.locationNote}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {seg.nearestShelter.amenities.map((a, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Emergency Hotline */}
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-rose-700 block">
                              Hill Corridor Emergency Desk
                            </span>
                            <span className="font-bold text-slate-900 block mt-0.5">
                              {seg.emergencyDesk}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-slate-500 text-[11px] font-mono">
                              {seg.emergencyPhone}
                            </span>
                            <a
                              href={`tel:${seg.emergencyPhone.split('/')[0].trim()}`}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">call</span>
                              <span>Dial Desk</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Select this road on map */}
                      {onSelectSegmentFromCache && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSegmentFromCache(seg);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-['Space_Grotesk'] font-bold text-xs flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                            <span>Locate Corridor on Digital Twin Map</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">
              check_circle
            </span>
            <span className="font-medium">
              Cached locally in browser storage • Accessible anywhere across the 8 NE states
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
