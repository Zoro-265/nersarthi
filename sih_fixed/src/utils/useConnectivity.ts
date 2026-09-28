import { useState, useEffect } from 'react';
import { isShadowZoneSimulated, setShadowZoneSimulated } from './routeCache';

export interface ConnectivityState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isEffectiveOffline: boolean;
  connectionType: string;
  isLowBandwidth: boolean;
  toggleSimulatedOffline: () => void;
  setSimulatedOffline: (val: boolean) => void;
}

export function useConnectivity(): ConnectivityState {
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [isSimulatedOffline, setIsSimulatedOfflineState] = useState<boolean>(() => {
    return isShadowZoneSimulated();
  });

  const [connectionType, setConnectionType] = useState<string>('4G / Broadband');
  const [isLowBandwidth, setIsLowBandwidth] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network Information API if supported
    const nav = navigator as unknown as {
      connection?: {
        effectiveType?: string;
        saveData?: boolean;
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
    };

    const updateConnectionInfo = () => {
      if (nav.connection && nav.connection.effectiveType) {
        const type = nav.connection.effectiveType;
        setConnectionType(type.toUpperCase());
        setIsLowBandwidth(type === '2g' || type === 'slow-2g' || type === '3g');
      }
    };

    if (nav.connection) {
      updateConnectionInfo();
      if (nav.connection.addEventListener) {
        nav.connection.addEventListener('change', updateConnectionInfo);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (nav.connection && nav.connection.removeEventListener) {
        nav.connection.removeEventListener('change', updateConnectionInfo);
      }
    };
  }, []);

  const toggleSimulatedOffline = () => {
    const nextVal = !isSimulatedOffline;
    setIsSimulatedOfflineState(nextVal);
    setShadowZoneSimulated(nextVal);
  };

  const setSimulatedOffline = (val: boolean) => {
    setIsSimulatedOfflineState(val);
    setShadowZoneSimulated(val);
  };

  const isEffectiveOffline = !isBrowserOnline || isSimulatedOffline;

  return {
    isOnline: isBrowserOnline,
    isSimulatedOffline,
    isEffectiveOffline,
    connectionType: isEffectiveOffline ? 'Offline (Cached Mode)' : connectionType,
    isLowBandwidth: isEffectiveOffline || isLowBandwidth,
    toggleSimulatedOffline,
    setSimulatedOffline,
  };
}
