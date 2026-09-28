import React, { useState } from 'react';
import { LanguageCode } from '../types';
import { I18N_TRANSLATIONS } from '../data/mockData';
import { speakSpeech } from '../utils/speech';

interface ReportRoadModalProps {
  currentLang: LanguageCode;
  onClose: () => void;
}

export const ReportRoadModal: React.FC<ReportRoadModalProps> = ({
  currentLang,
  onClose,
}) => {
  const t = I18N_TRANSLATIONS[currentLang] || I18N_TRANSLATIONS.en;
  const [hazardType, setHazardType] = useState<string>('landslide');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudio, setRecordedAudio] = useState<boolean>(false);
  const [photoAdded, setPhotoAdded] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordedAudio(true);
    } else {
      setIsRecording(true);
      setRecordedAudio(false);
      setTimeout(() => {
        setIsRecording(false);
        setRecordedAudio(true);
      }, 3500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    speakSpeech(
      currentLang === 'hi'
        ? 'सड़क रिपोर्ट सफलतापूर्वक दर्ज की गई। बीआरओ व पुलिस को सूचित कर दिया गया है।'
        : currentLang === 'as'
        ? 'বাট-পথৰ প্ৰতিবেদন দাখিল কৰা হ’ল। BRO আৰু আৰক্ষীক জনোৱা হৈছে।'
        : 'Road hazard report submitted successfully. Notified BRO and Highway Police.',
      currentLang,
      1.0
    );
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-[26px]">
              report_problem
            </span>
            <span className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 uppercase">
              {t.reportRoad}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center gap-2">
            <span className="material-symbols-outlined text-slate-900 text-[48px]">
              task_alt
            </span>
            <span className="font-['Space_Grotesk'] text-lg font-bold text-slate-900">
              Report Broadcasted!
            </span>
            <p className="text-xs text-slate-600">
              Your hazard report and GPS location have been transmitted to local
              highway authorities.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {/* Auto GPS Location */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-900 text-[20px]">
                  location_on
                </span>
                <span className="font-semibold text-slate-800">
                  NH-27 Mile 42, Haflong Pass
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                GPS ATTACHED
              </span>
            </div>

            {/* Hazard Type Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Hazard Type
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'landslide', label: 'Landslide Debris', icon: 'landslide' },
                  { id: 'mudslip', label: 'Heavy Mud Slip', icon: 'water_drop' },
                  { id: 'bridge', label: 'Bridge / Culvert Cut', icon: 'emergency' },
                  { id: 'pothole', label: 'Deep Waterlogged Hole', icon: 'waves' },
                ].map((h) => (
                  <button
                    type="button"
                    key={h.id}
                    onClick={() => setHazardType(h.id)}
                    className={`min-h-[46px] rounded-xl p-2 flex items-center gap-2 border text-left font-semibold ${
                      hazardType === h.id
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-400'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {h.icon}
                    </span>
                    <span className="text-xs">{h.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Note Recording */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Voice Note (Quickest for Drivers)
              </label>
              <button
                type="button"
                onClick={toggleRecording}
                className={`min-h-[52px] rounded-xl p-3 flex items-center justify-between border transition-all ${
                  isRecording
                    ? 'bg-rose-50 border-rose-500 text-rose-700 animate-pulse'
                    : recordedAudio
                    ? 'bg-slate-100 border-slate-400 text-slate-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[24px]">
                    {isRecording ? 'mic' : recordedAudio ? 'check_circle' : 'mic_none'}
                  </span>
                  <span className="text-xs font-bold">
                    {isRecording
                      ? 'Recording... speak now'
                      : recordedAudio
                      ? 'Voice note saved (0:03s)'
                      : 'Tap to record 5-sec voice message'}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-1 rounded text-slate-600">
                  {recordedAudio ? 'READY' : 'MIC'}
                </span>
              </button>
            </div>

            {/* Photo Capture */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Photo (Optional)
              </label>
              <button
                type="button"
                onClick={() => setPhotoAdded(!photoAdded)}
                className={`min-h-[48px] rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold ${
                  photoAdded
                    ? 'bg-slate-100 border-slate-400 text-slate-900'
                    : 'bg-white border-dashed border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {photoAdded ? 'image' : 'add_a_photo'}
                </span>
                <span>
                  {photoAdded ? 'Road snapshot attached' : 'Attach camera photo'}
                </span>
              </button>
            </div>

            <button
              type="submit"
              className="min-h-[50px] mt-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-['Space_Grotesk'] text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">
                send
              </span>
              <span>Submit Road Report</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
