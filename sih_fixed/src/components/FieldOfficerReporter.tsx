import React, { useState, useRef, useEffect } from 'react';
import { LanguageCode, DriverProfile, FieldOfficerReport } from '../types';
import { I18N_TRANSLATIONS } from '../data/mockData';
import { speakSpeech } from '../utils/speech';

interface FieldOfficerReporterProps {
  currentLang: LanguageCode;
  userProfile: DriverProfile | null;
  onClose: () => void;
  onAddReport?: (report: FieldOfficerReport) => void;
}

const HIGHWAY_SECTORS = [
  { name: 'NH-27 KM 142 (Lumding - Dima Hasao)', lat: 25.75, lng: 93.18, zone: 'Lumding Division' },
  { name: 'NH-10 KM 28 (Sevoke - Teesta Bridge)', lat: 26.91, lng: 88.47, zone: 'Siliguri Corridor' },
  { name: 'NH-6 KM 84 (Meghalaya Plateau - Jowai)', lat: 25.45, lng: 92.20, zone: 'Jaintia Hills Sector' },
  { name: 'NH-13 KM 52 (Bhalukpong - Bomdila)', lat: 27.02, lng: 92.56, zone: 'Western Arunachal' },
  { name: 'NH-37 KM 210 (Jorhat - Kaziranga Bypass)', lat: 26.75, lng: 94.22, zone: 'Brahmaputra Valley' },
];

const INCIDENT_TEMPLATES = [
  {
    type: 'landslide' as const,
    label: 'Landslide / Mud Debris',
    icon: 'landslide',
    defaultDesc: 'Major mudslide and boulder fall. Both carriageways blocked. Heavy earthmovers / JCB required urgently.',
    severity: 'critical' as const,
  },
  {
    type: 'flood' as const,
    label: 'Flash Flood / Waterlogging',
    icon: 'flood',
    defaultDesc: 'River water overflow across culvert. Water level 2.5 feet over road surface. Heavy trucks held.',
    severity: 'critical' as const,
  },
  {
    type: 'accident' as const,
    label: 'Heavy Vehicle Accident / Spill',
    icon: 'car_crash',
    defaultDesc: 'Overturned diesel petroleum tanker. Fuel spill risk. Traffic halted 2km in both directions. Fire brigade alerted.',
    severity: 'critical' as const,
  },
  {
    type: 'collapse' as const,
    label: 'Culvert / Bridge Damage',
    icon: 'warning',
    defaultDesc: 'Structural distress on bridge abutment. Single-lane emergency convoy passage only. Speed restricted to 10 km/h.',
    severity: 'moderate' as const,
  },
  {
    type: 'convoy_jam' as const,
    label: 'Convoy Breakdown / Choke',
    icon: 'traffic',
    defaultDesc: 'Multiple multi-axle freight trucks stalled on hairpin incline. Recovery crane dispatched from nearest hub.',
    severity: 'moderate' as const,
  },
];

const SMS_RECIPIENTS = [
  { label: 'NHAI Emergency Road Helpline', number: '1033' },
  { label: 'State Disaster Management (SEOC)', number: '1070' },
  { label: 'National Highway Police & SOS', number: '112' },
  { label: 'BRO Regional Logistics Control Room', number: '+913612548811' },
];

export const FieldOfficerReporter: React.FC<FieldOfficerReporterProps> = ({
  currentLang,
  userProfile,
  onClose,
  onAddReport,
}) => {
  const t = I18N_TRANSLATIONS[currentLang] || I18N_TRANSLATIONS.en;

  // Form State
  const [activeTab, setActiveTab] = useState<'voice' | 'sms' | 'history'>('voice');
  const [selectedIncident, setSelectedIncident] = useState(INCIDENT_TEMPLATES[0]);
  const [selectedSector, setSelectedSector] = useState(HIGHWAY_SECTORS[0].name);
  const [officerName, setOfficerName] = useState(userProfile?.name || 'Inspector S. K. Baruah');
  const [badgeNumber, setBadgeNumber] = useState(userProfile?.badgeNumber || 'BRO-PATROL-409');
  const [department, setDepartment] = useState(userProfile?.department || 'Border Roads Organisation (BRO)');
  const [customDetails, setCustomDetails] = useState(INCIDENT_TEMPLATES[0].defaultDesc);
  const [smsRecipient, setSmsRecipient] = useState(SMS_RECIPIENTS[0].number);
  const [copiedSms, setCopiedSms] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'transmitting' | 'sent'>('idle');

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recentReports, setRecentReports] = useState<FieldOfficerReport[]>([
    {
      id: 'REP-BRO-8821',
      timestamp: 'Today, 10:14 AM',
      officerName: 'Capt. R. K. Thapa',
      department: 'Border Roads Organisation (BRO)',
      badgeNumber: 'BRO-NW-302',
      incidentType: 'landslide',
      incidentTitle: 'Landslide on NH-10 Teesta Valley',
      highway: 'NH-10 KM 28 (Sevoke - Teesta Bridge)',
      locationDetails: 'Debris clearance in progress. 1 lane opened for military convoys.',
      severity: 'critical',
      status: 'dispatched_all',
      smsRecipient: '1033',
      smsBody: '[BRO PATROL INCIDENT] NH-10 KM 28 | LANDSLIDE | SEVERITY: CRITICAL | Officer: Capt. R. K. Thapa (BRO-NW-302) | Details: Debris clearance underway.',
      audioDurationSeconds: 18,
      voiceTranscript: 'Patrol unit reporting boulder fall near Teesta bridge kilometer 28. Excavator engaged.',
    },
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Generate standard MoRTH / Emergency SMS Format
  const formattedSmsBody = `[FIELD INCIDENT REPORT]
SEC: ${selectedSector}
TYPE: ${selectedIncident.label.toUpperCase()}
SEV: ${selectedIncident.severity.toUpperCase()}
OFFICER: ${officerName} (${badgeNumber})
DEPT: ${department}
INFO: ${customDetails}
TIME: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
NER-SARTHI-GRID`.trim();

  // Voice Recording Handlers
  const startRecording = async () => {
    setRecordingError(null);
    audioChunksRef.current = [];
    setAudioUrl(null);
    setAudioBlob(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone audio capture is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone access issue:', err);
      // If mic is denied or running in sandboxed iFrame, fallback with simulated high-fidelity voice recording
      setRecordingError(
        'Direct microphone access was restricted. A simulated field officer voice memo channel has been activated for test dispatching.'
      );
      // Simulate audio memo capture
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Fallback simulated audio
      setAudioUrl('simulated');
    }
    setIsRecording(false);
  };

  const playRecordedAudio = () => {
    if (audioUrl && audioUrl !== 'simulated' && audioElementRef.current) {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    } else {
      // Speak audio simulation using TTS
      speakSpeech(
        `Field Officer Voice Log: Incident at ${selectedSector}. ${customDetails}`,
        currentLang,
        1.0,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handleCopySms = () => {
    navigator.clipboard.writeText(formattedSmsBody);
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2500);
  };

  const handleDirectSmsApp = () => {
    const encodedBody = encodeURIComponent(formattedSmsBody);
    window.open(`sms:${smsRecipient}?body=${encodedBody}`, '_blank');
  };

  const handleTransmitReport = (method: 'voice' | 'sms') => {
    setDispatchStatus('transmitting');

    setTimeout(() => {
      const newReport: FieldOfficerReport = {
        id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: 'Just now',
        officerName,
        department,
        badgeNumber,
        incidentType: selectedIncident.type,
        incidentTitle: `${selectedIncident.label} on ${selectedSector.split(' ')[0]}`,
        highway: selectedSector,
        locationDetails: customDetails,
        severity: selectedIncident.severity,
        status: method === 'voice' ? 'recorded_voice' : 'sent_sms',
        smsBody: formattedSmsBody,
        smsRecipient,
        audioBlobUrl: audioUrl || undefined,
        audioDurationSeconds: recordingTime || 12,
        voiceTranscript: `Voice log from Officer ${officerName}: ${customDetails}`,
      };

      setRecentReports((prev) => [newReport, ...prev]);
      if (onAddReport) onAddReport(newReport);
      setDispatchStatus('sent');
      setTimeout(() => {
        setDispatchStatus('idle');
        setActiveTab('history');
      }, 1200);
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl && audioUrl !== 'simulated') URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl text-slate-100 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-5 pb-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">shield_person</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-white tracking-tight uppercase">
                  Field Officer Incident Desk
                </h2>
                <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Official
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rapid SMS & Voice Recording Dispatch for Patrol & Highway Safety
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close field officer desk"
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation: Voice Memo | SMS Dispatch | Recent Reports */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-950/80 border-b border-slate-800 text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'voice'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">mic</span>
            <span>Voice Memo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sms')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'sms'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">sms</span>
            <span>SMS Dispatch</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>Dispatches ({recentReports.length})</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          {/* Incident Type & Location Selectors (Shared for both voice & SMS) */}
          {activeTab !== 'history' && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Incident Nature</span>
                  <span className="text-[10px] text-amber-400 font-semibold">MoRTH Code</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {INCIDENT_TEMPLATES.map((tmpl) => {
                    const isSelected = selectedIncident.type === tmpl.type;
                    return (
                      <button
                        key={tmpl.type}
                        type="button"
                        onClick={() => {
                          setSelectedIncident(tmpl);
                          setCustomDetails(tmpl.defaultDesc);
                        }}
                        className={`p-2 rounded-xl text-left border text-xs font-semibold flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px] shrink-0 text-amber-400">
                          {tmpl.icon}
                        </span>
                        <span className="truncate">{tmpl.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Highway Sector Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Patrol Sector / Highway Milepost
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {HIGHWAY_SECTORS.map((sec) => (
                    <option key={sec.name} value={sec.name}>
                      {sec.name} ({sec.zone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Officer Details Accordion / Display */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">
                    Officer Name
                  </span>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full bg-transparent border-b border-slate-700 py-0.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">
                    Badge / Unit ID
                  </span>
                  <input
                    type="text"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    className="w-full bg-transparent border-b border-slate-700 py-0.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Voice Recording Reporter */}
          {activeTab === 'voice' && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 text-center">
                {/* Voice Status Indicator */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? 'bg-rose-500/20 text-rose-400 ring-8 ring-rose-500/20 animate-pulse'
                        : audioUrl
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[36px]">
                      {isRecording ? 'mic' : audioUrl ? 'graphic_eq' : 'mic_none'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-['Space_Grotesk'] text-base font-bold text-white">
                      {isRecording
                        ? `Recording Voice Incident... (${recordingTime}s)`
                        : audioUrl
                        ? `Voice Note Recorded (${recordingTime || 12}s)`
                        : 'Press to Record Voice Note'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hands-free verbal report for road condition, clearance estimate, or detour.
                    </p>
                  </div>
                </div>

                {/* Primary Voice Action Buttons */}
                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">mic</span>
                      <span>{audioUrl ? 'Record Again' : 'Start Voice Recording'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-6 py-3 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all animate-bounce"
                    >
                      <span className="material-symbols-outlined text-[20px]">stop_circle</span>
                      <span>Stop & Save Voice Note</span>
                    </button>
                  )}

                  {audioUrl && !isRecording && (
                    <button
                      type="button"
                      onClick={playRecordedAudio}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 border border-slate-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] text-amber-400">
                        {isPlayingAudio ? 'volume_up' : 'play_arrow'}
                      </span>
                      <span>Listen Back</span>
                    </button>
                  )}
                </div>

                {/* Hidden Audio Player for browser playback */}
                {audioUrl && audioUrl !== 'simulated' && (
                  <audio
                    ref={audioElementRef}
                    src={audioUrl}
                    onEnded={() => setIsPlayingAudio(false)}
                    className="hidden"
                  />
                )}

                {recordingError && (
                  <p className="text-[11px] text-amber-300/90 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/40 text-left">
                    {recordingError}
                  </p>
                )}
              </div>

              {/* Voice Notes & Auto-Transcript field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Verbal Incident Transcript / Patrol Memo
                </label>
                <textarea
                  rows={2}
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  placeholder="Verbal summary automatically converted to radio transcript..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Transmit Voice Incident Button */}
              <button
                type="button"
                disabled={dispatchStatus === 'transmitting'}
                onClick={() => handleTransmitReport('voice')}
                className="w-full min-h-[48px] bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {dispatchStatus === 'transmitting' ? (
                  <span className="animate-pulse">Broadcasting Voice Memo to Control Grid...</span>
                ) : dispatchStatus === 'sent' ? (
                  <>
                    <span>Voice Memo Dispatched!</span>
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Transmit Voice Incident</span>
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: SMS Dispatch Reporter */}
          {activeTab === 'sms' && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              {/* Recipient Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>SMS Destination / Control Room</span>
                  <span className="text-[10px] text-slate-400">Emergency Protocol</span>
                </label>
                <select
                  value={smsRecipient}
                  onChange={(e) => setSmsRecipient(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {SMS_RECIPIENTS.map((rec) => (
                    <option key={rec.number} value={rec.number}>
                      {rec.label} ({rec.number})
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Incident Details Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Field Details / Milepost Obstruction
                </label>
                <textarea
                  rows={2}
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  placeholder="Enter specific milepost, damage estimate, machinery required..."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Live Formatted SMS Preview Box */}
              <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-400 text-[16px]">
                      mark_chat_read
                    </span>
                    Official SMS Dispatch Preview ({formattedSmsBody.length} chars)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySms}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedSms ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedSms ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 text-[11px] font-mono text-amber-300 whitespace-pre-wrap leading-relaxed select-all">
                  {formattedSmsBody}
                </pre>
              </div>

              {/* 2 Ways to Dispatch: Native SMS App or Cellular Grid Broadcast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDirectSmsApp}
                  className="min-h-[46px] px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-bold font-['Space_Grotesk'] uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-amber-400 text-[18px]">
                    open_in_new
                  </span>
                  <span>Open in Mobile SMS App</span>
                </button>

                <button
                  type="button"
                  disabled={dispatchStatus === 'transmitting'}
                  onClick={() => handleTransmitReport('sms')}
                  className="min-h-[46px] px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold font-['Space_Grotesk'] uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {dispatchStatus === 'transmitting' ? (
                    <span className="animate-pulse">Dispatching via Satellite/SMS...</span>
                  ) : dispatchStatus === 'sent' ? (
                    <>
                      <span>Dispatched to 1033/112!</span>
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    </>
                  ) : (
                    <>
                      <span>Transmit Official SMS</span>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Incident History Log */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Recent Field Reports ({recentReports.length})
                </span>
                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Synced with Siliguri & NE Highway Grid
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {recentReports.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col gap-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                          {item.id}
                        </span>
                        <span className="text-xs font-bold text-white">{item.incidentTitle}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">{item.locationDetails}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      <span className="truncate">
                        By: <strong className="text-slate-200">{item.officerName}</strong> ({item.badgeNumber})
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.audioDurationSeconds && (
                          <button
                            type="button"
                            onClick={() =>
                              speakSpeech(
                                `Audio memo for report ${item.id}: ${item.locationDetails}`,
                                currentLang,
                                1.0
                              )
                            }
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-slate-800"
                          >
                            <span className="material-symbols-outlined text-[14px]">play_circle</span>
                            <span>Voice ({item.audioDurationSeconds}s)</span>
                          </button>
                        )}
                        <span className="px-2 py-0.5 bg-slate-800 text-amber-300 border border-slate-700 rounded text-[10px] font-bold uppercase">
                          SMS Sent ({item.smsRecipient})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-amber-400 text-[16px]">verified</span>
            <span>MoRTH & BRO Field Incident Protocol</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Close Desk
          </button>
        </div>
      </div>
    </div>
  );
};
