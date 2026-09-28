/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, LanguageCode, DriverProfile, UserRole } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { StatusScreen } from './components/StatusScreen';
import { RouteScreen } from './components/RouteScreen';
import { AlertsScreen } from './components/AlertsScreen';
import { SosScreen } from './components/SosScreen';
import { LanguageModal } from './components/LanguageModal';
import { ReportRoadModal } from './components/ReportRoadModal';
import { LoginScreen } from './components/LoginScreen';
import { DriverProfileModal } from './components/DriverProfileModal';
import { FieldOfficerReporter } from './components/FieldOfficerReporter';
import { initRouteCache } from './utils/routeCache';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('status');

  // Pre-warm offline highway route cache on startup for low-connectivity zones
  useEffect(() => {
    try {
      initRouteCache();
    } catch (err) {
      console.warn('Failed pre-warming route cache:', err);
    }
  }, []);
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('sarthi_lang') as LanguageCode;
      if (saved) return saved;
    } catch {
      // fallback
    }
    return 'as';
  });
  const [showLangModal, setShowLangModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showFieldOfficerModal, setShowFieldOfficerModal] = useState<boolean>(false);

  const handleSelectLang = (lang: LanguageCode) => {
    setCurrentLang(lang);
    try {
      localStorage.setItem('sarthi_lang', lang);
    } catch {
      // ignore
    }
  };

  // Driver Login & Session State
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(() => {
    try {
      const saved = localStorage.getItem('sarthi_driver_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isSkipped, setIsSkipped] = useState<boolean>(false);

  // If user hasn't logged in and hasn't skipped, show Login Page
  const showLogin = !driverProfile && !isSkipped;

  const handleLoginSuccess = (profile: DriverProfile) => {
    setDriverProfile(profile);
    setIsSkipped(false);
  };

  const handleSkipLogin = (role: UserRole = 'civilian') => {
    setIsSkipped(true);
    const guestProfile: DriverProfile = {
      role,
      name:
        role === 'field_officer'
          ? 'Patrol Officer (Guest)'
          : role === 'civilian'
          ? 'Local Commuter (Guest)'
          : 'Fleet Driver (Guest)',
      phone: '',
      vehicleNumber:
        role === 'field_officer'
          ? 'GOV-PATROL-GUEST'
          : role === 'civilian'
          ? 'LOCAL-COMMUTER'
          : 'GUEST-ROAD-USER',
      vehicleType:
        role === 'field_officer'
          ? 'Emergency Fleet'
          : role === 'civilian'
          ? 'Passenger / Private'
          : 'Heavy Commercial Truck',
      travelMode: role === 'civilian' ? 'Local Resident' : undefined,
      department:
        role === 'field_officer' ? 'Border Roads Organisation (BRO)' : undefined,
      badgeNumber: role === 'field_officer' ? 'BRO-PATROL-GUEST' : undefined,
      homeHub: 'NH Highway Corridor',
      isGuest: true,
    };
    setDriverProfile(guestProfile);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setDriverProfile((prev) => {
      const updated: DriverProfile = prev
        ? {
            ...prev,
            role: newRole,
            department:
              newRole === 'field_officer'
                ? prev.department || 'Border Roads Organisation (BRO)'
                : undefined,
            badgeNumber:
              newRole === 'field_officer'
                ? prev.badgeNumber || 'BRO-PATROL-409'
                : undefined,
          }
        : {
            role: newRole,
            name:
              newRole === 'field_officer'
                ? 'Field Officer'
                : newRole === 'civilian'
                ? 'Civilian Traveler'
                : 'Commercial Driver',
            phone: '',
            vehicleNumber: newRole === 'field_officer' ? 'GOV-BRO-409' : 'AS-01-EC-9921',
            vehicleType:
              newRole === 'field_officer'
                ? 'Emergency Fleet'
                : newRole === 'civilian'
                ? 'Passenger / Private'
                : 'Heavy Commercial Truck',
            department:
              newRole === 'field_officer'
                ? 'Border Roads Organisation (BRO)'
                : undefined,
            badgeNumber:
              newRole === 'field_officer' ? 'BRO-PATROL-409' : undefined,
            homeHub: 'North East Corridor',
            isGuest: true,
          };
      localStorage.setItem('sarthi_driver_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogoutOrChange = () => {
    localStorage.removeItem('sarthi_driver_profile');
    setDriverProfile(null);
    setIsSkipped(false);
  };

  if (showLogin) {
    return (
      <>
        <LoginScreen
          currentLang={currentLang}
          onSelectLang={handleSelectLang}
          onOpenLangModal={() => setShowLangModal(true)}
          onLoginSuccess={handleLoginSuccess}
          onSkipLogin={handleSkipLogin}
        />

        {showLangModal && (
          <LanguageModal
            currentLang={currentLang}
            onClose={() => setShowLangModal(false)}
            onSelectLang={handleSelectLang}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Work_Sans'] selection:bg-slate-900 selection:text-white">
      {/* Top Fixed Header with Profile Avatar & Language */}
      <Header
        currentLang={currentLang}
        driverProfile={driverProfile}
        onOpenLangModal={() => setShowLangModal(true)}
        onOpenProfileModal={() => setShowProfileModal(true)}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto pt-24 px-3 sm:px-4 pb-20">
        {activeTab === 'status' && (
          <StatusScreen
            currentLang={currentLang}
            userProfile={driverProfile}
            onSelectRole={handleRoleChange}
            onOpenReportModal={() => setShowReportModal(true)}
            onOpenRouteModal={() => setActiveTab('route')}
            onOpenFieldOfficerModal={() => setShowFieldOfficerModal(true)}
            onSelectTab={(tab) => setActiveTab(tab)}
            onSelectLang={handleSelectLang}
            onOpenLangModal={() => setShowLangModal(true)}
          />
        )}

        {activeTab === 'route' && (
          <RouteScreen
            currentLang={currentLang}
            onSelectTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsScreen
            currentLang={currentLang}
            onSelectLang={handleSelectLang}
            onOpenLangModal={() => setShowLangModal(true)}
          />
        )}

        {activeTab === 'sos' && <SosScreen currentLang={currentLang} />}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentLang={currentLang}
      />

      {/* Language Dialect Selection Modal */}
      {showLangModal && (
        <LanguageModal
          currentLang={currentLang}
          onClose={() => setShowLangModal(false)}
          onSelectLang={handleSelectLang}
        />
      )}

      {/* Report Broken Road Modal */}
      {showReportModal && (
        <ReportRoadModal
          currentLang={currentLang}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Field Officer Incident Reporting Modal (SMS + Voice Recordings) */}
      {showFieldOfficerModal && (
        <FieldOfficerReporter
          currentLang={currentLang}
          userProfile={driverProfile}
          onClose={() => setShowFieldOfficerModal(false)}
        />
      )}

      {/* Driver Profile / Change Driver Modal */}
      {showProfileModal && (
        <DriverProfileModal
          currentLang={currentLang}
          profile={driverProfile}
          onClose={() => setShowProfileModal(false)}
          onLogoutOrChange={handleLogoutOrChange}
        />
      )}
    </div>
  );
}
