import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode, RoadSegment } from '../types';
import {
  TOWN_NODES,
  CONVOY_LIST,
  I18N_TRANSLATIONS,
} from '../data/mockData';
import { speakSpeech } from '../utils/speech';
import {
  getCachedRouteSegments,
  getRouteCacheMeta,
  syncRouteCache,
  calculateOfflineRoute,
  EnrichedRoadSegment,
  RouteCacheMetadata,
} from '../utils/routeCache';
import { useConnectivity } from '../utils/useConnectivity';
import { OfflineRouteCacheModal } from './OfflineRouteCacheModal';

interface RouteScreenProps {
  currentLang: LanguageCode;
  onSelectTab: (tab: 'status' | 'route' | 'alerts' | 'sos') => void;
}

export const RouteScreen: React.FC<RouteScreenProps> = ({ currentLang }) => {
  const t = I18N_TRANSLATIONS[currentLang] || I18N_TRANSLATIONS.en;

  // Connectivity & Low-signal shadow zone simulation
  const { isOnline, isSimulatedOffline, isEffectiveOffline, toggleSimulatedOffline, connectionType } =
    useConnectivity();

  // Route segment persistent cache states
  const [cachedSegments, setCachedSegments] = useState<EnrichedRoadSegment[]>(() =>
    getCachedRouteSegments()
  );
  const [cacheMeta, setCacheMeta] = useState<RouteCacheMetadata>(() =>
    getRouteCacheMeta()
  );
  const [isCacheModalOpen, setIsCacheModalOpen] = useState<boolean>(false);
  const [isSyncingCache, setIsSyncingCache] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const [mode, setMode] = useState<'normal' | 'dis'>('normal');
  const [weatherOverlay, setWeatherOverlay] = useState(true);
  const [selectedRoad, setSelectedRoad] = useState<EnrichedRoadSegment | null>(null);
  const roads = cachedSegments;

  const [feedEvents, setFeedEvents] = useState<
    { id: string; time: string; sev: 'ok' | 'warn' | 'bad' | 'sys'; title: string; desc: string; source: string }[]
  >([
    {
      id: '1',
      time: '11:42:15',
      sev: 'ok',
      title: 'All priority corridors nominal',
      desc: '22 segments reporting; 2 on routine watch (NH-6 Sonapur, NH-27 Dima Hasao).',
      source: 'SYSTEM',
    },
    {
      id: '2',
      time: '11:40:02',
      sev: 'warn',
      title: 'IMD Nowcast: Light to Moderate rain',
      desc: '15-25 mm expected across Meghalaya plateau next 6 hours.',
      source: 'IMD RADAR',
    },
    {
      id: '3',
      time: '11:38:20',
      sev: 'sys',
      title: 'FOOD-117 cleared Nagaon checkpost',
      desc: 'On schedule via NH-27 → NH-29 with P1 priority.',
      source: 'GPS HUB',
    },
  ]);

  // Route calculation state
  const [searchFrom, setSearchFrom] = useState<string>('GHY');
  const [searchTo, setSearchTo] = useState<string>('KOH');
  const [computedRoute, setComputedRoute] = useState<{
    path: string[];
    distanceKm: number;
    hours: string;
    hasDisruption: boolean;
    avoided: string[];
    isFromOfflineCache?: boolean;
  } | null>(null);

  // Convoy positions state
  const [convoys, setConvoys] = useState(CONVOY_LIST);
  const animFrameRef = useRef<number | null>(null);

  // Switch simulation mode
  const toggleMode = (newMode: 'normal' | 'dis') => {
    setMode(newMode);
    if (newMode === 'dis') {
      const newFeedItem = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
        sev: 'bad' as const,
        title: 'Landslide at Pagla Pahar, NH-29',
        desc: '60m carriageway obstructed. Convoys safely rerouting to Dimapur staging.',
        source: 'PWD NAGALAND',
      };
      setFeedEvents((prev) => [newFeedItem, ...prev.slice(0, 15)]);

      speakSpeech(
        currentLang === 'hi'
          ? 'मानसून आपदा सक्रिय। NH-29 पगला पहाड़ और NH-27 जतिंगा बंद हैं। वैकल्पिक मार्ग निर्धारित किया गया है।'
          : currentLang === 'as'
          ? 'দুৰ্যোগ মোড সক্ৰিয়। NH-29 আৰু NH-27 বন্ধ। বিকল্প পথ বাছনি কৰা হৈছে।'
          : 'Monsoon Disruption active! NH-29 Pagla Pahar and NH-27 Jatinga are blocked. Convoys are rerouting.',
        currentLang,
        1.0
      );
    } else {
      speakSpeech(
        'Network restored to Normal conditions. Corridors clear.',
        currentLang,
        1.0
      );
    }
  };

  // Resilient Dijkstra path computation using local route cache (100% offline ready)
  const calculateRoute = (src: string, dst: string) => {
    const result = calculateOfflineRoute(src, dst, mode, cachedSegments);
    setComputedRoute(result);
  };

  // Re-sync local cache
  const handleQuickSync = () => {
    setIsSyncingCache(true);
    setSyncToast(null);
    setTimeout(() => {
      const res = syncRouteCache();
      const fresh = getCachedRouteSegments();
      setCachedSegments(fresh);
      setCacheMeta(res.meta);
      setIsSyncingCache(false);
      setSyncToast('Cache Synced: 22 Corridors Offline-Ready');
      setTimeout(() => setSyncToast(null), 3500);
    }, 450);
  };

  useEffect(() => {
    calculateRoute(searchFrom, searchTo);
  }, [searchFrom, searchTo, mode]);

  // Convoy movement loop simulation
  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      setConvoys((prev) =>
        prev.map((v) => {
          let nextT = v.t + dt * 0.04;
          let nextSeg = v.seg;
          if (nextT >= 1) {
            nextT = 0;
            nextSeg = (nextSeg + 1) % (v.path.length - 1 || 1);
          }
          return {
            ...v,
            t: nextT,
            seg: nextSeg,
            rerouted: mode === 'dis' && (v.id === 'FOOD-117' || v.id === 'MED-204'),
          };
        })
      );

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode]);

  const roadCounts = {
    ok: roads.filter((r) => r.st[mode] === 'ok').length,
    warn: roads.filter((r) => r.st[mode] === 'warn').length,
    bad: roads.filter((r) => r.st[mode] === 'bad').length,
  };

  const handleSpeakRoad = (road: EnrichedRoadSegment | RoadSegment) => {
    const statusLabel =
      road.st[mode] === 'ok'
        ? 'Open and clear'
        : road.st[mode] === 'warn'
        ? 'Caution: at risk of landslides'
        : 'Closed: blocked by heavy debris';

    const enriched = road as EnrichedRoadSegment;
    const bypassText = enriched.bypassRoute ? `Recommended bypass: ${enriched.bypassRoute}.` : '';
    const shelterText = enriched.nearestShelter
      ? `Nearest shelter: ${enriched.nearestShelter.name}, ${enriched.nearestShelter.distanceKm} kilometers away.`
      : '';

    const speech = `${road.name}, ${road.hw}. Current condition: ${statusLabel}. ${
      road.cause ? 'Reason: ' + road.cause + '.' : ''
    } Clearance advice: ${road.clearance}. ${bypassText} ${shelterText}`;

    speakSpeech(speech, currentLang, 1.0);
  };

  return (
    <div className="flex flex-col w-full gap-4 pb-16">
      {/* 1. Header & Live Simulation Controls */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-900 text-[24px]">
              map
            </span>
            <div className="flex flex-col">
              <h2 className="font-['Space_Grotesk'] text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight">
                {t.routeNetworkTitle || 'Live Highway Corridor Map'}
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {t.routeNetworkSub || 'North Eastern Region · 8 States Digital Twin'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Normal vs Disruption mode toggle */}
            <div
              className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200"
              role="group"
            >
              <button
                onClick={() => toggleMode('normal')}
                className={`px-3 py-1 rounded-lg text-xs font-['Space_Grotesk'] font-bold transition-all ${
                  mode === 'normal'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.normalWeather}
              </button>
              <button
                onClick={() => toggleMode('dis')}
                className={`px-3 py-1 rounded-lg text-xs font-['Space_Grotesk'] font-bold transition-all ${
                  mode === 'dis'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.monsoonDisrupt}
              </button>
            </div>
          </div>
        </div>

        {/* Offline Highway Segment Cache Console */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isEffectiveOffline
                    ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400/50'
                    : 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-400/30'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isEffectiveOffline ? 'cloud_off' : 'offline_pin'}
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-['Space_Grotesk'] text-xs sm:text-sm font-bold text-slate-900">
                    {isEffectiveOffline
                      ? '⚡ Offline Shadow Zone Active'
                      : t.offlineCacheTitle || 'Offline Highway Cache Active'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {cacheMeta.totalSegments} Corridors Cached
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">
                    ~{cacheMeta.sizeKb} KB Flash
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  {isEffectiveOffline
                    ? 'Running 100% offline from local device storage for Barail, Sela Pass & Sonapur zero-signal areas'
                    : 'Preloaded for North East India low-connectivity mountain passes & river gorges'}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsCacheModalOpen(true)}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-700">
                  folder_open
                </span>
                <span>{t.offlineDirectoryBtn || 'Offline Directory'}</span>
              </button>

              <button
                type="button"
                onClick={handleQuickSync}
                disabled={isSyncingCache}
                title="Refresh offline highway cache"
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[16px] ${isSyncingCache ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{isSyncingCache ? 'Syncing...' : t.offlineCacheSync || 'Sync'}</span>
              </button>

              <button
                type="button"
                onClick={toggleSimulatedOffline}
                title="Toggle test mode for zero-connectivity shadow zone"
                className={`px-2.5 py-1.5 rounded-xl text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                  isSimulatedOffline
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isSimulatedOffline ? 'sensors_off' : 'sensors'}
                </span>
                <span>{isSimulatedOffline ? 'Shadow Mode: ON' : 'Test Shadow Zone'}</span>
              </button>
            </div>
          </div>

          {syncToast && (
            <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg animate-in fade-in">
              ✅ {syncToast}
            </div>
          )}
        </div>

        {/* Telemetry KPI Strip */}
        <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100">
          <div className="flex flex-col items-center bg-slate-50 border border-slate-200 p-2 rounded-xl">
            <span className="text-[10px] font-bold text-slate-600 uppercase">
              {t.kpiClear || 'CLEAR'}
            </span>
            <span className="font-['Space_Grotesk'] text-lg font-bold text-slate-900">
              {roadCounts.ok}
            </span>
          </div>

          <div className="flex flex-col items-center bg-amber-50 border border-amber-100 p-2 rounded-xl">
            <span className="text-[10px] font-bold text-amber-800 uppercase">
              {t.kpiRisk || 'AT RISK'}
            </span>
            <span className="font-['Space_Grotesk'] text-lg font-bold text-amber-700">
              {roadCounts.warn}
            </span>
          </div>

          <div className="flex flex-col items-center bg-rose-50 border border-rose-100 p-2 rounded-xl">
            <span className="text-[10px] font-bold text-rose-800 uppercase">
              {t.kpiBlocked || 'BLOCKED'}
            </span>
            <span className="font-['Space_Grotesk'] text-lg font-bold text-rose-700">
              {roadCounts.bad}
            </span>
          </div>

          <div className="flex flex-col items-center bg-slate-50 border border-slate-200 p-2 rounded-xl">
            <span className="text-[10px] font-bold text-slate-600 uppercase">
              {t.kpiConvoys || 'CONVOYS'}
            </span>
            <span className="font-['Space_Grotesk'] text-lg font-bold text-slate-900">
              {convoys.length}
            </span>
          </div>
        </div>

        {/* Weather Overlay switch & hint */}
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          <label className="flex items-center gap-2 cursor-pointer font-medium select-none">
            <input
              type="checkbox"
              checked={weatherOverlay}
              onChange={(e) => setWeatherOverlay(e.target.checked)}
              className="rounded text-slate-900 focus:ring-slate-900 w-4 h-4"
            />
            <span>{t.weatherOverlay}</span>
          </label>
          <span className="text-[11px] text-slate-500">
            Tap any highway line for details &amp; speech
          </span>
        </div>
      </div>

      {/* 2. Interactive SVG Map Canvas */}
      <div className="w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-md relative">
        <svg viewBox="0 0 800 580" className="w-full h-auto select-none">
          <defs>
            {/* Grid background */}
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
            </pattern>
            {/* Weather blur filter */}
            <filter id="weatherBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="24" />
            </filter>
          </defs>

          {/* Map Base Grid */}
          <rect width="800" height="580" fill="#0b1317" />
          <rect width="800" height="580" fill="url(#gridPattern)" />

          {/* Elevation Contours */}
          <g opacity="0.35">
            {[
              [560, 420, 0.9],
              [690, 200, 1],
              [320, 110, 0.8],
              [140, 360, 0.6],
            ].map(([cx, cy, s], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={120 * s}
                fill="none"
                stroke="#1e3a47"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            ))}
          </g>

          {/* State Area Labels */}
          <g fill="#475569" fontSize="13" fontWeight="bold" fontFamily="Space Grotesk">
            <text x="35" y="140">SIKKIM</text>
            <text x="430" y="320">ASSAM</text>
            <text x="480" y="70">ARUNACHAL PRADESH</text>
            <text x="330" y="380">MEGHALAYA</text>
            <text x="630" y="270">NAGALAND</text>
            <text x="620" y="440">MANIPUR</text>
            <text x="450" y="550">MIZORAM</text>
            <text x="260" y="510">TRIPURA</text>
          </g>

          {/* River Brahmaputra Flow */}
          <path
            d="M -10 290 C 60 280, 120 300, 190 305 S 330 290, 390 262 S 500 220, 560 190 S 660 150, 720 130 S 790 110, 810 100"
            fill="none"
            stroke="#334155"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.6"
          />
          <text
            x="220"
            y="298"
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
            letterSpacing="2"
            transform="rotate(-3 220 298)"
          >
            BRAHMAPUTRA RIVER
          </text>

          {/* Weather Cloud Overlay */}
          {weatherOverlay && (
            <g opacity={mode === 'dis' ? 0.35 : 0.15} filter="url(#weatherBlur)">
              <circle cx="380" cy="350" r="100" fill="#94a3b8" />
              <circle cx="480" cy="400" r="90" fill="#64748b" />
              <circle cx="600" cy="330" r="85" fill="#94a3b8" />
              <circle cx="440" cy="180" r="70" fill="#64748b" />
            </g>
          )}

          {/* Road Segments */}
          <g>
            {roads.map((r) => {
              const nodeA = TOWN_NODES[r.a];
              const nodeB = TOWN_NODES[r.b];
              if (!nodeA || !nodeB) return null;

              const st = r.st[mode];
              const strokeColor =
                st === 'ok' ? '#64748b' : st === 'warn' ? '#f59e0b' : '#dc2626';

              const isSelected = selectedRoad?.id === r.id;
              const isComputedPath =
                computedRoute &&
                computedRoute.path.some(
                  (p, idx) =>
                    idx < computedRoute.path.length - 1 &&
                    ((computedRoute.path[idx] === r.a &&
                      computedRoute.path[idx + 1] === r.b) ||
                      (computedRoute.path[idx] === r.b &&
                        computedRoute.path[idx + 1] === r.a))
                );

              const mx = (nodeA.x + nodeB.x) / 2;
              const my = (nodeA.y + nodeB.y) / 2;

              return (
                <g
                  key={r.id}
                  className="cursor-pointer group"
                  onClick={() => setSelectedRoad(r)}
                >
                  {/* Broad clickable hit target */}
                  <line
                    x1={nodeA.x}
                    y1={nodeA.y}
                    x2={nodeB.x}
                    y2={nodeB.y}
                    stroke="transparent"
                    strokeWidth="20"
                  />

                  {/* Computed path highlight halo */}
                  {isComputedPath && (
                    <line
                      x1={nodeA.x}
                      y1={nodeA.y}
                      x2={nodeB.x}
                      y2={nodeB.y}
                      stroke="#f59e0b"
                      strokeWidth="9"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  )}

                  {/* Visual road line */}
                  <line
                    x1={nodeA.x}
                    y1={nodeA.y}
                    x2={nodeB.x}
                    y2={nodeB.y}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 6 : 3.5}
                    strokeDasharray={st === 'bad' ? '6 4' : undefined}
                    strokeLinecap="round"
                    className="transition-all"
                  />

                  {/* Blocked marker ✕ */}
                  {st === 'bad' && (
                    <g>
                      <circle cx={mx} cy={my} r="9" fill="#991b1b" stroke="#fff" strokeWidth="1.5" />
                      <text
                        x={mx}
                        y={my + 4}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        ✕
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Active Convoy Trucks */}
          <g>
            {convoys.map((conv) => {
              const fromNode = TOWN_NODES[conv.path[conv.seg] || conv.from];
              const toNode =
                TOWN_NODES[conv.path[conv.seg + 1] || conv.path[conv.seg] || conv.to];
              if (!fromNode || !toNode) return null;

              const cx = fromNode.x + (toNode.x - fromNode.x) * conv.t;
              const cy = fromNode.y + (toNode.y - fromNode.y) * conv.t;

              return (
                <g key={conv.id} transform={`translate(${cx}, ${cy})`}>
                  <circle r="12" fill={conv.color} opacity="0.25" className="animate-ping" />
                  <circle r="6" fill={conv.color} stroke="#fff" strokeWidth="1.5" />
                </g>
              );
            })}
          </g>

          {/* Town Nodes */}
          <g>
            {Object.values(TOWN_NODES).map((town) => (
              <g key={town.id} transform={`translate(${town.x}, ${town.y})`}>
                <circle
                  r={town.hub ? 6 : 4}
                  fill={town.hub ? '#f59e0b' : '#e2e8f0'}
                  stroke="#0f172a"
                  strokeWidth="2"
                />
                <text
                  x={town.x > 600 ? -8 : 8}
                  y={4}
                  textAnchor={town.x > 600 ? 'end' : 'start'}
                  fill="#f1f5f9"
                  fontSize={town.hub ? '11' : '9.5'}
                  fontWeight={town.hub ? 'bold' : 'normal'}
                  fontFamily="Work Sans"
                  className="pointer-events-none drop-shadow"
                >
                  {town.name}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {/* Floating Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-3 text-xs text-white">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            {t.legendClear || 'Clear'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            {t.legendCaution || 'Caution'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            {t.legendBlocked || 'Blocked'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            {t.legendActiveRoute || 'Active Route'}
          </span>
        </div>
      </div>

      {/* 3. Selected Road Detail Popup Modal / Bottom Card */}
      {selectedRoad && (
        <div className="w-full bg-white border border-slate-300 rounded-2xl p-4 shadow-md flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                  {selectedRoad.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">offline_pin</span>
                  <span>{t.cachedOfflineBadge || 'Offline Flash Cache Ready'}</span>
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500 mt-0.5">
                {selectedRoad.hw} • {selectedRoad.lenKm} km • {selectedRoad.state || 'North East Corridor'} • {selectedRoad.elevationFt ? `${selectedRoad.elevationFt.toLocaleString()} ft elevation` : 'Mountain Pass'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSpeakRoad(selectedRoad)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">
                  volume_up
                </span>
                <span>{t.listenRoadInfo || 'Listen Info'}</span>
              </button>
              <button
                onClick={() => setSelectedRoad(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                {t.roadConditionLabel || 'Condition'}
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {selectedRoad.st[mode] === 'ok'
                  ? t.allLanesOpen || 'All lanes open and flowing'
                  : selectedRoad.cause || t.cautionRequired || 'Caution required'}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                {t.clearanceStatusLabel || 'Clearance Status'}
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {selectedRoad.clearance}
              </span>
            </div>
          </div>

          {/* Enriched Offline Attributes (Bypass, Shelter, Emergency Hotline) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
            {/* Safe Parking & Fuel Hub */}
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/80 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  Nearest Safe Shelter ({selectedRoad.nearestShelter?.distanceKm || 12} km away)
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {selectedRoad.nearestShelter?.name || 'Local High-Ground Transport Nagar'}
                </span>
                <span className="text-[11px] text-slate-600 mt-0.5 block">
                  {selectedRoad.nearestShelter?.locationNote || 'Safe Staging Pad'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {(selectedRoad.nearestShelter?.amenities || ['Parking', 'Water', 'Medical']).map((a, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-white text-emerald-800 text-[10px] font-semibold border border-emerald-200"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Offline Bypass & Emergency Desk */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Recommended Bypass Route
                </span>
                <span className="font-medium text-slate-800 text-[11px] mt-0.5 block">
                  {selectedRoad.bypassRoute || 'Standard arterial corridor connection'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-rose-700 uppercase">
                    Corridor Emergency Desk
                  </span>
                  <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[170px]">
                    {selectedRoad.emergencyDesk || 'SDRF / NHIDCL Desk'}
                  </span>
                </div>
                <a
                  href={`tel:${(selectedRoad.emergencyPhone || '112').split('/')[0].trim()}`}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-[13px]">call</span>
                  <span>Dial Desk</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Safe Corridor Route Calculator */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-900 text-[22px]">
              route
            </span>
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 uppercase tracking-wide">
              {t.safeNavTitle || 'Safe Corridor Navigation'}
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Offline Dijkstra Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="font-bold text-slate-600 block mb-1">
              {t.startHubLabel || 'Start Hub'}
            </label>
            <select
              value={searchFrom}
              onChange={(e) => setSearchFrom(e.target.value)}
              className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-2.5 font-semibold text-slate-900 focus:ring-slate-900"
            >
              {Object.values(TOWN_NODES).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1">
              {t.destinationLabel || 'Destination'}
            </label>
            <select
              value={searchTo}
              onChange={(e) => setSearchTo(e.target.value)}
              className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-2.5 font-semibold text-slate-900 focus:ring-slate-900"
            >
              {Object.values(TOWN_NODES).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.state})
                </option>
              ))}
            </select>
          </div>
        </div>

        {computedRoute && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900">
                {t.safeRouteTitle || 'Safe Route'}: {computedRoute.path.map((n) => TOWN_NODES[n]?.name).join(' → ')}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-xs">
                {computedRoute.hours}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{t.totalDistanceLabel || 'Total Distance'}: {computedRoute.distanceKm} km</span>
              {computedRoute.avoided.length > 0 && (
                <span className="text-rose-600 font-semibold">
                  {t.avoidedLabel || 'Avoided'}: {computedRoute.avoided.join(', ')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/80">
              <span className="material-symbols-outlined text-[14px]">offline_bolt</span>
              <span>Computed 100% locally from offline route segment cache • Reliable in zero-connectivity shadow zones</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Live Alert Feed & Fleet Status */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-['Space_Grotesk'] text-base font-bold text-slate-900 uppercase tracking-wide">
            {t.liveEventsTitle || 'Live Field Event Log'}
          </span>
          <span className="text-xs font-bold text-slate-500">
            {feedEvents.length} {t.eventsCountLabel || 'Events'}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {feedEvents.slice(0, 4).map((evt) => (
            <div
              key={evt.id}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-1.5 py-0.5 rounded font-bold text-[10px] uppercase ${
                    evt.sev === 'bad'
                      ? 'bg-rose-100 text-rose-800'
                      : evt.sev === 'warn'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-slate-200 text-slate-900'
                  }`}
                >
                  {evt.sev}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  {evt.time} · {evt.source}
                </span>
              </div>
              <span className="font-bold text-slate-900">{evt.title}</span>
              <span className="text-slate-600">{evt.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Offline Route Segment Cache Inspection Modal */}
      <OfflineRouteCacheModal
        isOpen={isCacheModalOpen}
        onClose={() => setIsCacheModalOpen(false)}
        cachedSegments={cachedSegments}
        cacheMeta={cacheMeta}
        currentLang={currentLang}
        isEffectiveOffline={isEffectiveOffline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulateOffline={toggleSimulatedOffline}
        onCacheUpdated={(newSegs, newMeta) => {
          setCachedSegments(newSegs);
          setCacheMeta(newMeta);
        }}
        onSelectSegmentFromCache={(seg) => {
          setSelectedRoad(seg);
        }}
      />
    </div>
  );
};
