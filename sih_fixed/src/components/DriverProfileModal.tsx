import React from 'react';
import { DriverProfile, LanguageCode } from '../types';

interface DriverProfileModalProps {
  currentLang?: LanguageCode;
  profile: DriverProfile | null;
  onClose: () => void;
  onLogoutOrChange: () => void;
}

export const DriverProfileModal: React.FC<DriverProfileModalProps> = ({
  currentLang,
  profile,
  onClose,
  onLogoutOrChange,
}) => {
  const isGuest = !profile || profile.isGuest;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
              isGuest ? 'bg-slate-600' : 'bg-slate-900'
            }`}>
              <span className="material-symbols-outlined text-[24px]">
                {isGuest ? 'no_accounts' : 'badge'}
              </span>
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 uppercase tracking-tight">
                {isGuest ? 'Guest Driver Mode' : 'Driver Profile'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isGuest ? 'Temporary Session • No Login' : 'Verified Commercial Fleet Sarthi'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close driver profile"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Driver Name</span>
            <span className="text-sm font-bold text-slate-900">{profile?.name || 'Guest Driver'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</span>
            <span className="text-sm font-semibold text-slate-800">
              {profile?.phone ? `+91 ${profile.phone}` : 'Not linked (Guest)'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle Reg. No.</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-900">
              {profile?.vehicleNumber || 'GUEST-ROAD-USER'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle Class</span>
            <span className="text-xs font-medium text-slate-700">
              {profile?.vehicleType || 'Standard Highway Vehicle'}
            </span>
          </div>

          {profile?.homeHub && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Home Hub</span>
              <span className="text-xs font-medium text-slate-700">{profile.homeHub}</span>
            </div>
          )}
        </div>

        {/* Features Active in this mode */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col gap-1.5">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-slate-800 text-[18px]">verified</span>
            Active Safety Privileges
          </span>
          <p className="text-xs text-slate-700">
            ✓ 26 Indian Language Voice Co-Pilot Navigation
          </p>
          <p className="text-xs text-slate-700">
            ✓ Real-time Weather, Landslide & Siliguri Corridor Radar
          </p>
          <p className="text-xs text-slate-700">
            ✓ Direct 112 National Emergency Highway SOS Dispatch
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onLogoutOrChange();
            }}
            className="w-full min-h-[46px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isGuest ? 'login' : 'logout'}
            </span>
            <span>{isGuest ? 'Sign In with Driver Account' : 'Switch Driver / Sign Out'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full min-h-[42px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
