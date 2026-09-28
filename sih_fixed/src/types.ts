export type TabType = 'status' | 'route' | 'alerts' | 'sos';

export type LanguageCode =
  | 'en'
  | 'as'
  | 'hi'
  | 'bn'
  | 'pa'
  | 'gu'
  | 'mr'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'or'
  | 'ur'
  | 'ne'
  | 'brx'
  | 'mni'
  | 'mzo'
  | 'mai'
  | 'doi'
  | 'ks'
  | 'kok'
  | 'sd'
  | 'sat'
  | 'sa'
  | 'kha'
  | 'grt';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  ttsLang: string;
  region: string;
  flag: string;
  sampleGreeting: string;
}

export type RoadStatus = 'ok' | 'warn' | 'bad';

export interface RoadSegment {
  id: string;
  a: string;
  b: string;
  hw: string;
  name: string;
  st: {
    normal: RoadStatus;
    dis: RoadStatus;
  };
  cause: string;
  clearance: string;
  lenKm: number;
}

export interface TownNode {
  id: string;
  name: string;
  state: string;
  x: number;
  y: number;
  hub?: boolean;
}

export interface ConvoyVehicle {
  id: string;
  cargo: string;
  color: string;
  from: string;
  to: string;
  pri: 'P1' | 'P2' | 'P3';
  path: string[];
  seg: number;
  t: number;
  state: 'moving' | 'holding' | 'held' | 'holdnext' | 'arrived';
  rerouted: boolean;
  holdAt?: string;
}

export interface AudioAlertItem {
  id: string;
  category: 'blocked' | 'rain' | 'clear' | 'bro';
  categoryLabel: string;
  categoryNative: string;
  duration: string;
  title: string;
  titleNative: string;
  subtitle: string;
  audioText: string;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
  iconBgClass: string;
  icon: string;
}

export interface EmergencyDial {
  number: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
  badge?: string;
}

export interface ShelterItem {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  desc: string;
  distance: string;
  subDist: string;
  icon: string;
  iconBg: string;
}

export type UserRole = 'driver' | 'civilian' | 'field_officer';

export interface DriverProfile {
  role?: UserRole;
  name: string;
  phone: string;
  vehicleNumber?: string;
  vehicleType?: 'Heavy Commercial Truck' | 'Medium Cargo' | 'Light Commercial' | 'Passenger / Private' | 'Emergency Fleet';
  licenseNumber?: string;
  homeHub?: string;
  // Civilian specifics:
  travelMode?: 'Personal Vehicle' | 'Interstate Bus' | 'Tourist Taxi' | 'Local Resident';
  destination?: string;
  // Field Officer specifics:
  department?: 'Border Roads Organisation (BRO)' | 'NHAI Highway Patrol' | 'State Traffic Police' | 'PWD Disaster Wing' | 'NDRF Emergency Unit';
  badgeNumber?: string;
  patrolSector?: string;
  isGuest?: boolean;
}

export type UserProfile = DriverProfile;

export interface FieldOfficerReport {
  id: string;
  timestamp: string;
  officerName: string;
  department: string;
  badgeNumber: string;
  incidentType: 'landslide' | 'flood' | 'accident' | 'collapse' | 'weather' | 'convoy_jam';
  incidentTitle: string;
  highway: string;
  locationDetails: string;
  severity: 'critical' | 'moderate' | 'cleared';
  status: 'sent_sms' | 'recorded_voice' | 'dispatched_all';
  smsBody: string;
  smsRecipient: string;
  audioBlobUrl?: string;
  audioDurationSeconds?: number;
  voiceTranscript?: string;
}


