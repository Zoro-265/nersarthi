import { RoadSegment, TownNode, RoadStatus } from '../types';
import { ROAD_SEGMENTS, TOWN_NODES } from '../data/mockData';

export interface ShelterInfo {
  name: string;
  distanceKm: number;
  phone: string;
  amenities: string[];
  locationNote: string;
}

export interface EnrichedRoadSegment extends RoadSegment {
  elevationFt: number;
  terrainType: 'plains' | 'hilly' | 'gorge' | 'high_altitude';
  state: string;
  stateCode: 'AS' | 'ML' | 'NL' | 'MN' | 'MZ' | 'TR' | 'AR' | 'SK';
  bypassRoute: string;
  nearestShelter: ShelterInfo;
  emergencyDesk: string;
  emergencyPhone: string;
  shadowZoneRisk: 'High' | 'Moderate' | 'Low';
  lastCachedAt: string;
}

export interface RouteCacheMetadata {
  version: string;
  totalSegments: number;
  totalNodes: number;
  totalKm: number;
  lastUpdated: string;
  sizeKb: number;
  offlineReady: boolean;
  shadowZonesCovered: string[];
}

const CACHE_KEY_SEGMENTS = 'sarthi_route_segments_cache_v2';
const CACHE_KEY_NODES = 'sarthi_route_nodes_cache_v2';
const CACHE_KEY_META = 'sarthi_route_cache_meta_v2';
const CACHE_KEY_OFFLINE_SIM = 'sarthi_offline_mode_override';

// Comprehensive enriched North East India Highway Corridor Dataset
export const DEFAULT_ENRICHED_SEGMENTS: EnrichedRoadSegment[] = [
  {
    id: 'e1',
    a: 'SIL',
    b: 'GTK',
    hw: 'NH-10',
    name: 'Siliguri–Gangtok (Teesta Lifeline)',
    st: { normal: 'ok', dis: 'warn' },
    cause: 'Teesta valley slope cracks; single-lane near Rangpo and 29th Mile',
    clearance: 'Single lane open; heavy vehicles 15km/h escort',
    lenKm: 114,
    elevationFt: 5410,
    terrainType: 'gorge',
    state: 'Sikkim / West Bengal',
    stateCode: 'SK',
    bypassRoute: 'Alternative via Lava-Algarah-Reshi route (NH-717A) if 29th Mile washes out',
    nearestShelter: {
      name: 'Rangpo Border Staging Yard',
      distanceKm: 28,
      phone: '03592-202353',
      amenities: ['Emergency Fuel', 'Truck Pit Stop', 'Medical Outpost', 'Satellite Landline'],
      locationNote: 'NH-10 Rangpo Checkpost, North Bank',
    },
    emergencyDesk: 'BRO Project Swastik & Sikkim Disaster Management',
    emergencyPhone: '03592-202353 / 1070',
    shadowZoneRisk: 'High',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e2',
    a: 'SIL',
    b: 'GHY',
    hw: 'NH-27',
    name: 'Siliguri corridor–Guwahati (East-West Arterial)',
    st: { normal: 'ok', dis: 'ok' },
    cause: '',
    clearance: 'Fully open (4-lane national highway)',
    lenKm: 480,
    elevationFt: 180,
    terrainType: 'plains',
    state: 'Assam / West Bengal',
    stateCode: 'AS',
    bypassRoute: 'Alipurduar-Bongaigaon alternate spur',
    nearestShelter: {
      name: 'Bongaigaon Transport Nagar',
      distanceKm: 45,
      phone: '03664-228001',
      amenities: ['200-Truck Parking', '24/7 Diesel', 'Driver Rest House', 'Mechanic Pit'],
      locationNote: 'NH-27 km 142 Bypass Junction',
    },
    emergencyDesk: 'NHAI Control Room & Assam Police Highway Patrol',
    emergencyPhone: '1033 / 112',
    shadowZoneRisk: 'Low',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e3',
    a: 'GHY',
    b: 'SHL',
    hw: 'NH-6',
    name: 'Guwahati–Shillong (Khasi Hills Highway)',
    st: { normal: 'ok', dis: 'warn' },
    cause: 'IMD red alert: heavy cloudbursts, landslide probability 0.62 near Umsning',
    clearance: 'Drive with hazard lights; single file movement',
    lenKm: 98,
    elevationFt: 4908,
    terrainType: 'hilly',
    state: 'Meghalaya / Assam',
    stateCode: 'ML',
    bypassRoute: 'Umiam-Nongpoh old bypass lane with single escort',
    nearestShelter: {
      name: 'Nongpoh Safe Staging Point',
      distanceKm: 34,
      phone: '03638-232221',
      amenities: ['High-Bay Shelter', 'Drinking Water', 'Tire Repair', 'First Aid'],
      locationNote: 'Midway point NH-6 Ri-Bhoi district',
    },
    emergencyDesk: 'Meghalaya SDRF & Ri-Bhoi District Control',
    emergencyPhone: '03638-232221 / 1070',
    shadowZoneRisk: 'Moderate',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e4',
    a: 'SHL',
    b: 'JWI',
    hw: 'NH-6',
    name: 'Shillong–Jowai (East Meghalaya Link)',
    st: { normal: 'ok', dis: 'ok' },
    cause: '',
    clearance: 'All lanes open; morning fog between Mawryngkneng',
    lenKm: 65,
    elevationFt: 4520,
    terrainType: 'hilly',
    state: 'Meghalaya',
    stateCode: 'ML',
    bypassRoute: 'Mawryngkneng bypass to avoid Jowai municipal market congestion',
    nearestShelter: {
      name: 'Mawryngkneng Coal Depot Truck Stand',
      distanceKm: 18,
      phone: '0364-222410',
      amenities: ['Parking Yard', 'Emergency Telephone', 'Local Mechanics'],
      locationNote: 'NH-6 Mawryngkneng Tri-Junction',
    },
    emergencyDesk: 'West Jaintia Hills Emergency Operations Centre',
    emergencyPhone: '03652-220721',
    shadowZoneRisk: 'Moderate',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e5',
    a: 'JWI',
    b: 'SLC',
    hw: 'NH-6',
    name: 'Jowai–Silchar (Sonapur Tunnel Lifeline)',
    st: { normal: 'warn', dis: 'warn' },
    cause: 'Sonapur tunnel approach: loose mud debris & rockfall after continuous rains',
    clearance: 'Caution advised; BRO earthmovers clearing debris every 2 hours',
    lenKm: 135,
    elevationFt: 2200,
    terrainType: 'gorge',
    state: 'Meghalaya / Assam',
    stateCode: 'ML',
    bypassRoute: 'No direct road bypass; convoys hold at Umkiang until clearance signal',
    nearestShelter: {
      name: 'Umkiang BRO Staging Terminal',
      distanceKm: 22,
      phone: '03655-234101',
      amenities: ['Satellite Wireless Hub', 'Ration & Cookhouse', 'Medical Bunker', 'Covered Repair Shed'],
      locationNote: 'NH-6 km 88 before Sonapur tunnel',
    },
    emergencyDesk: 'BRO Project Pushpak & East Jaintia Hills Police',
    emergencyPhone: '03655-234101 / 112',
    shadowZoneRisk: 'High',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e6',
    a: 'GHY',
    b: 'NGN',
    hw: 'NH-27',
    name: 'Guwahati–Nagaon (Brahmaputra Valley Corridor)',
    st: { normal: 'ok', dis: 'ok' },
    cause: '',
    clearance: 'Fully open (4-lane smooth corridor)',
    lenKm: 120,
    elevationFt: 195,
    terrainType: 'plains',
    state: 'Assam',
    stateCode: 'AS',
    bypassRoute: 'Jagiroad-Morigaon state highway alternative',
    nearestShelter: {
      name: 'Jagiroad Paper Mill Highway Plaza',
      distanceKm: 48,
      phone: '03678-242200',
      amenities: ['Wide Parking Yard', '24h Fuel', 'Food Plaza', 'Restrooms'],
      locationNote: 'NH-27 Jagiroad junction',
    },
    emergencyDesk: 'Assam Highway Patrol Morigaon/Nagaon',
    emergencyPhone: '112 / 1033',
    shadowZoneRisk: 'Low',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e7',
    a: 'NGN',
    b: 'TZP',
    hw: 'NH-15',
    name: 'Nagaon–Tezpur (Kalia Bhomora River Bridge)',
    st: { normal: 'ok', dis: 'ok' },
    cause: '',
    clearance: 'Fully open across 3.015 km Brahmaputra span',
    lenKm: 55,
    elevationFt: 210,
    terrainType: 'plains',
    state: 'Assam',
    stateCode: 'AS',
    bypassRoute: 'Silghat ferry crossing only in emergency',
    nearestShelter: {
      name: 'Bhomoraguri Toll Plaza Staging',
      distanceKm: 12,
      phone: '03712-255010',
      amenities: ['24h Weighbridge', 'Towing Crane', 'Restroom', 'Water'],
      locationNote: 'South Bank approach to Brahmaputra',
    },
    emergencyDesk: 'Sonitpur District Disaster Authority',
    emergencyPhone: '03712-230978',
    shadowZoneRisk: 'Low',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e8',
    a: 'TZP',
    b: 'BOM',
    hw: 'NH-13',
    name: 'Tezpur–Bomdila (Bhalukpong Valley Route)',
    st: { normal: 'ok', dis: 'warn' },
    cause: 'Heavy dense fog and shooting stones reported near Tenga valley',
    clearance: 'Single file convoy escort between 06:00 to 18:00',
    lenKm: 155,
    elevationFt: 7200,
    terrainType: 'hilly',
    state: 'Arunachal Pradesh / Assam',
    stateCode: 'AR',
    bypassRoute: 'Balipara-Charduar-Tawang (BCT) older interior alignment',
    nearestShelter: {
      name: 'Bhalukpong Inner Line Gate Haven',
      distanceKm: 52,
      phone: '03782-234200',
      amenities: ['Armed Escort Post', 'Emergency Fuel Cans', 'Satellite Radio', 'Medical Camp'],
      locationNote: 'Arunachal Border Entry Gate',
    },
    emergencyDesk: 'BRO Project Vartak Headquarters',
    emergencyPhone: '03782-222123 / 112',
    shadowZoneRisk: 'High',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e9',
    a: 'BOM',
    b: 'TWG',
    hw: 'NH-13',
    name: 'Bomdila–Tawang (Sela Tunnel / Sela Pass 13,700 ft)',
    st: { normal: 'ok', dis: 'bad' },
    cause: 'Bailey bridge span at km 112 damaged by slope failure; Sela Tunnel approach cleared',
    clearance: 'Closed for heavy trailers; light 4x4 permitted; BRO repair underway',
    lenKm: 170,
    elevationFt: 13700,
    terrainType: 'high_altitude',
    state: 'Arunachal Pradesh',
    stateCode: 'AR',
    bypassRoute: 'Sela Twin-Tunnel route active for authorized emergency convoys',
    nearestShelter: {
      name: 'Dirang Valley Military & Civilian Staging',
      distanceKm: 42,
      phone: '03780-242220',
      amenities: ['Oxygen Refill Station', 'Anti-Freeze Fuel Supply', 'Heated Barrack', 'Snow Chains'],
      locationNote: 'Dirang Sub-Division, West Kameng',
    },
    emergencyDesk: 'BRO Project Vartak & Army 4 Corps Logistics',
    emergencyPhone: '03780-242220 / 1070',
    shadowZoneRisk: 'High',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e10',
    a: 'TZP',
    b: 'ITA',
    hw: 'NH-15',
    name: 'Tezpur–Itanagar (Holongi Capital Link)',
    st: { normal: 'ok', dis: 'ok' },
    cause: '',
    clearance: 'All 4 lanes open; airport corridor nominal',
    lenKm: 160,
    elevationFt: 1050,
    terrainType: 'hilly',
    state: 'Arunachal Pradesh / Assam',
    stateCode: 'AR',
    bypassRoute: 'Gohpur-Itanagar secondary road via Banderdewa',
    nearestShelter: {
      name: 'Holongi Gateway Truck Terminal',
      distanceKm: 25,
      phone: '0360-2212234',
      amenities: ['Weighbridge', 'Rest Station', 'Driver Canteen', 'EV & Diesel'],
      locationNote: 'Adjacent to Donyi Polo Airport entrance',
    },
    emergencyDesk: 'Papum Pare Police & Capital Disaster Control',
    emergencyPhone: '0360-2212234 / 112',
    shadowZoneRisk: 'Low',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e11',
    a: 'NGN',
    b: 'JRH',
    hw: 'NH-715',
    name: 'Nagaon–Jorhat (Kaziranga Wildlife Corridor)',
    st: { normal: 'ok', dis: 'warn' },
    cause: 'Brahmaputra high water levels; animal corridor active with automated speed traps (40 km/h)',
    clearance: 'Strict 40 km/h speed enforcement; speed cameras active',
    lenKm: 185,
    elevationFt: 280,
    terrainType: 'plains',
    state: 'Assam',
    stateCode: 'AS',
    bypassRoute: 'Bypass through Golaghat-Numaligarh bypass spur',
    nearestShelter: {
      name: 'Kohora Tourist & Cargo Safe Haven',
      distanceKm: 75,
      phone: '03776-262423',
      amenities: ['Forest Guard Security', 'Emergency Lighting', '24h Petrol Pump', 'Tea Canteen'],
      locationNote: 'Kaziranga Central Range, Kohora',
    },
    emergencyDesk: 'Assam Forest Police & Golaghat Highway Police',
    emergencyPhone: '03776-262423 / 112',
    shadowZoneRisk: 'Low',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e12',
    a: 'JRH',
    b: 'DIB',
    hw: 'NH-715',
    name: 'Jorhat–Dibrugarh (Upper Assam Trunk)',
    st: { normal: 'ok', dis: 'ok' },
    cause: '',
    clearance: 'Fully open; four-lane widening operational near Moran',
    lenKm: 138,
    elevationFt: 345,
    terrainType: 'plains',
    state: 'Assam',
    stateCode: 'AS',
    bypassRoute: 'Sivasagar town ring road bypass',
    nearestShelter: {
      name: 'Moran Junction Logistics Yard',
      distanceKm: 32,
      phone: '03754-226100',
      amenities: ['Heavy Crane', 'Tire Vulcanising', '24h Fuel', 'Lodging'],
      locationNote: 'NH-715 Moranhat intersection',
    },
    emergencyDesk: 'Dibrugarh Police Control Room',
    emergencyPhone: '0373-2324424 / 112',
    shadowZoneRisk: 'Low',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e13',
    a: 'DIB',
    b: 'PSG',
    hw: 'NH-515',
    name: 'Dibrugarh–Pasighat (Bogibeel Mega Bridge)',
    st: { normal: 'ok', dis: 'ok' },
    cause: '',
    clearance: 'Fully open across 4.94 km rail-cum-road bridge',
    lenKm: 155,
    elevationFt: 502,
    terrainType: 'plains',
    state: 'Assam / Arunachal Pradesh',
    stateCode: 'AR',
    bypassRoute: 'Sadiya / Dhola-Sadiya bridge diversion for eastern Arunachal',
    nearestShelter: {
      name: 'Bogibeel North Bank Truck Terminal',
      distanceKm: 22,
      phone: '03752-243100',
      amenities: ['Large Parking Bays', 'NF Railway Police Outpost', 'Drinking Water', 'Mechanics'],
      locationNote: 'Dhemaji side ramp of Bogibeel Bridge',
    },
    emergencyDesk: 'East Siang District Administration & Dhemaji Police',
    emergencyPhone: '0368-2222224 / 1070',
    shadowZoneRisk: 'Low',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e14',
    a: 'NGN',
    b: 'LMD',
    hw: 'NH-27',
    name: 'Nagaon–Lumding (Railway Junction Gap)',
    st: { normal: 'ok', dis: 'ok' },
    cause: '',
    clearance: 'Fully open; 4-lane median completed',
    lenKm: 95,
    elevationFt: 410,
    terrainType: 'plains',
    state: 'Assam',
    stateCode: 'AS',
    bypassRoute: 'Dabaka bypass route',
    nearestShelter: {
      name: 'Dabaka Crossroads Logistics Park',
      distanceKm: 38,
      phone: '03674-245100',
      amenities: ['Truck Parking', 'Weigh Bridge', 'Diesel Station', 'Dhaba'],
      locationNote: 'NH-27 Dabaka bypass',
    },
    emergencyDesk: 'Hojai District Disaster Emergency Desk',
    emergencyPhone: '03674-284100 / 112',
    shadowZoneRisk: 'Low',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e15',
    a: 'LMD',
    b: 'HFL',
    hw: 'NH-27',
    name: 'Lumding–Haflong (North Cachar Hill Gates)',
    st: { normal: 'ok', dis: 'warn' },
    cause: 'Saturated slopes in Dima Hasao hills; localized mud runoff during cloudbursts',
    clearance: 'Open with caution; patrol pilot vehicles guide heavy trucks',
    lenKm: 90,
    elevationFt: 3166,
    terrainType: 'hilly',
    state: 'Assam',
    stateCode: 'AS',
    bypassRoute: 'Lanka-Umrangso secondary road (paved single lane)',
    nearestShelter: {
      name: 'Maibang Hill Safe Staging Yard',
      distanceKm: 40,
      phone: '03673-282200',
      amenities: ['Emergency Satellite Phone', 'Mountain Towing', 'Safe High-Ground Staging', 'First Aid'],
      locationNote: 'Historical Maibang Valley gate',
    },
    emergencyDesk: 'Dima Hasao Disaster Management Cell & BRO',
    emergencyPhone: '03673-236324 / 1070',
    shadowZoneRisk: 'High',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e16',
    a: 'HFL',
    b: 'SLC',
    hw: 'NH-27',
    name: 'Haflong–Silchar (Jatinga Barail Gorge)',
    st: { normal: 'warn', dis: 'bad' },
    cause: 'Active landslide: 60m carriageway washed out at Jatinga Lampu slope',
    clearance: 'Estimated 18–24 h heavy clearing; NDRF & BRO earthmovers deployed',
    lenKm: 100,
    elevationFt: 1800,
    terrainType: 'gorge',
    state: 'Assam',
    stateCode: 'AS',
    bypassRoute: 'Diversion via Meghalaya NH-6 (Guwahati-Shillong-Jowai-Silchar) or railway flatcar shuttle',
    nearestShelter: {
      name: 'Haflong Circuit House Staging Shelter',
      distanceKm: 14,
      phone: '03673-236222',
      amenities: ['50-Truck Safe Pad', 'Government Medical Team', 'Cooked Food Supply', 'Satellite Dispatch'],
      locationNote: 'Upper Haflong Ridge (Zero Landslide Zone)',
    },
    emergencyDesk: 'BRO Project Pushpak & Dima Hasao Autonomous Council',
    emergencyPhone: '03673-236324 / 112',
    shadowZoneRisk: 'High',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e17',
    a: 'LMD',
    b: 'DMP',
    hw: 'NH-29',
    name: 'Lumding–Dimapur (Assam–Nagaland Gateway)',
    st: { normal: 'ok', dis: 'ok' },
    cause: '',
    clearance: 'Fully open; 4-lane stretch between Khatkhati and Dimapur checkpoint',
    lenKm: 70,
    elevationFt: 640,
    terrainType: 'plains',
    state: 'Assam / Nagaland',
    stateCode: 'NL',
    bypassRoute: 'Diphu-Manja-Bokajan interior state highway',
    nearestShelter: {
      name: 'Bokajan Cement Staging Haven',
      distanceKm: 18,
      phone: '03675-246100',
      amenities: ['24/7 Security', 'Weigh Station', 'Fuel', 'Truck Washing'],
      locationNote: 'Khatkhati Border Gate',
    },
    emergencyDesk: 'Karbi Anglong Police & Dimapur Traffic Cell',
    emergencyPhone: '03862-225010 / 112',
    shadowZoneRisk: 'Low',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e18',
    a: 'DMP',
    b: 'KOH',
    hw: 'NH-29',
    name: 'Dimapur–Kohima (Pagla Pahar Critical Defile)',
    st: { normal: 'ok', dis: 'bad' },
    cause: 'Massive landslide at Pagla Pahar rockface; boulders and mud across both lanes',
    clearance: 'Clearance estimated 6–8 hours; Nagaland PWD and SDRF teams deploying heavy loaders',
    lenKm: 74,
    elevationFt: 4737,
    terrainType: 'gorge',
    state: 'Nagaland',
    stateCode: 'NL',
    bypassRoute: 'Alternate via Niuland-Kohima bypass (light vehicles) or Chumukedima-Peducha bypass',
    nearestShelter: {
      name: 'Chumukedima Safe Truck Yard',
      distanceKm: 12,
      phone: '03862-240120',
      amenities: ['150-Truck Holding Ground', 'Nagaland Police Checkpoint', 'Water & Food Canteen', 'Medical Station'],
      locationNote: 'NH-29 Foot of the Hills',
    },
    emergencyDesk: 'Nagaland State Disaster Management Authority (NSDMA)',
    emergencyPhone: '0370-2244279 / 112',
    shadowZoneRisk: 'High',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e19',
    a: 'KOH',
    b: 'IMP',
    hw: 'NH-2',
    name: 'Kohima–Imphal (Trans-Manipur Mountain Road)',
    st: { normal: 'ok', dis: 'warn' },
    cause: 'Slope fissures and road depression near Mao Gate border checkpoint',
    clearance: 'Single lane escort for heavy commercial convoys; pilot vehicle mandatory',
    lenKm: 140,
    elevationFt: 2575,
    terrainType: 'hilly',
    state: 'Nagaland / Manipur',
    stateCode: 'MN',
    bypassRoute: 'Senapati valley arterial connection with security escort',
    nearestShelter: {
      name: 'Mao Gate Border Holding Yard',
      distanceKm: 32,
      phone: '03871-222110',
      amenities: ['Security Escort Base', 'Heated Common Hall', 'Satellite Radio Station', 'Diesel'],
      locationNote: 'Mao Inter-State Gate (Elevation 6,200 ft)',
    },
    emergencyDesk: 'Manipur Police Highway Escort & BRO Sevak',
    emergencyPhone: '0385-2450100 / 112',
    shadowZoneRisk: 'High',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e20',
    a: 'SLC',
    b: 'IMP',
    hw: 'NH-37',
    name: 'Silchar–Imphal (Jiribam Ghat Road)',
    st: { normal: 'ok', dis: 'ok' },
    cause: '',
    clearance: 'Fully open; Makru and Barak RCC bridges fully operational',
    lenKm: 215,
    elevationFt: 2575,
    terrainType: 'hilly',
    state: 'Assam / Manipur',
    stateCode: 'MN',
    bypassRoute: 'Nungba-Khongsang secondary track (emergency use only)',
    nearestShelter: {
      name: 'Jiribam Railhead & Cargo Terminal',
      distanceKm: 45,
      phone: '03876-223120',
      amenities: ['Railway Transshipment Bay', 'Armed Security Escort', 'Fuel Depot', 'Rest Station'],
      locationNote: 'Jiribam border crossing, Jiri River',
    },
    emergencyDesk: 'BRO Project Sevak & Jiribam District Administration',
    emergencyPhone: '03876-223120 / 112',
    shadowZoneRisk: 'Moderate',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e21',
    a: 'SLC',
    b: 'AIZ',
    hw: 'NH-306',
    name: 'Silchar–Aizawl (Mizoram Lifeline)',
    st: { normal: 'ok', dis: 'warn' },
    cause: 'Heavy rains caused subsidence near Kolasib hill slopes; single-lane shuttle traffic',
    clearance: 'One-lane traffic alternating every 45 mins; police regulating queues',
    lenKm: 175,
    elevationFt: 3730,
    terrainType: 'hilly',
    state: 'Assam / Mizoram',
    stateCode: 'MZ',
    bypassRoute: 'Vairengte to Bilkhawthlir secondary ridge road',
    nearestShelter: {
      name: 'Vairengte Entry Staging Depot',
      distanceKm: 38,
      phone: '03837-222300',
      amenities: ['Mizoram Police Checkpost', 'Sheltered Staging Area', 'Safe Drinking Water', 'Local Clinic'],
      locationNote: 'Vairengte Welcome Gate',
    },
    emergencyDesk: 'BRO Project Pushpak & Mizoram Disaster Management',
    emergencyPhone: '0389-2335842 / 1070',
    shadowZoneRisk: 'High',
    lastCachedAt: new Date().toISOString(),
  },
  {
    id: 'e22',
    a: 'SLC',
    b: 'AGT',
    hw: 'NH-8',
    name: 'Silchar–Agartala (Tripura Highway Corridor)',
    st: { normal: 'ok', dis: 'ok' },
    cause: '',
    clearance: 'Fully open; 2-lane with paved shoulders in Churaibari section',
    lenKm: 250,
    elevationFt: 42,
    terrainType: 'plains',
    state: 'Assam / Tripura',
    stateCode: 'TR',
    bypassRoute: 'Dharmanagar-Kailashahar secondary state loop',
    nearestShelter: {
      name: 'Churaibari Inter-State Terminal',
      distanceKm: 34,
      phone: '03822-261200',
      amenities: ['Modern Automated Weighbridge', '24/7 Security', 'Dhaba Yard', 'Medical Dispensary'],
      locationNote: 'Tripura Entry Checkpost',
    },
    emergencyDesk: 'Tripura State Disaster Management Authority & Police',
    emergencyPhone: '0381-2416045 / 112',
    shadowZoneRisk: 'Low',
    lastCachedAt: new Date().toISOString(),
  },
];

/**
 * Initialize Route Segment Cache in persistent browser storage.
 * If cache does not exist or version is outdated, saves the full North East India dataset.
 */
export function initRouteCache(): { segments: EnrichedRoadSegment[]; meta: RouteCacheMetadata } {
  try {
    const rawSegments = localStorage.getItem(CACHE_KEY_SEGMENTS);
    const rawMeta = localStorage.getItem(CACHE_KEY_META);

    if (rawSegments && rawMeta) {
      const parsedSegments = JSON.parse(rawSegments) as EnrichedRoadSegment[];
      const parsedMeta = JSON.parse(rawMeta) as RouteCacheMetadata;
      if (parsedSegments && parsedSegments.length === DEFAULT_ENRICHED_SEGMENTS.length) {
        return { segments: parsedSegments, meta: parsedMeta };
      }
    }
  } catch (err) {
    console.warn('Could not read existing route cache, initializing fresh:', err);
  }

  // Populate fresh default cache
  const totalKm = DEFAULT_ENRICHED_SEGMENTS.reduce((sum, seg) => sum + seg.lenKm, 0);
  const now = new Date().toISOString();
  const meta: RouteCacheMetadata = {
    version: '2.4.0-ne-corridors',
    totalSegments: DEFAULT_ENRICHED_SEGMENTS.length,
    totalNodes: Object.keys(TOWN_NODES).length,
    totalKm,
    lastUpdated: now,
    sizeKb: Math.round(JSON.stringify(DEFAULT_ENRICHED_SEGMENTS).length / 1024),
    offlineReady: true,
    shadowZonesCovered: [
      'Barail Range (Dima Hasao)',
      'Sela Pass & Tawang (NH-13)',
      'Sonapur Tunnel (NH-6)',
      'Pagla Pahar (NH-29)',
      'Mao–Senapati Hills (NH-2)',
      'Jiribam–Imphal Ghats (NH-37)',
      'Kolasib (NH-306)',
      'Teesta Valley (NH-10)',
    ],
  };

  try {
    localStorage.setItem(CACHE_KEY_SEGMENTS, JSON.stringify(DEFAULT_ENRICHED_SEGMENTS));
    localStorage.setItem(CACHE_KEY_NODES, JSON.stringify(TOWN_NODES));
    localStorage.setItem(CACHE_KEY_META, JSON.stringify(meta));
  } catch (err) {
    console.warn('Failed to write to localStorage for route cache:', err);
  }

  return { segments: DEFAULT_ENRICHED_SEGMENTS, meta };
}

/**
 * Retrieve cached route segments with automatic initialization if empty.
 */
export function getCachedRouteSegments(): EnrichedRoadSegment[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY_SEGMENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached route segments:', err);
  }
  return initRouteCache().segments;
}

/**
 * Retrieve cached town nodes
 */
export function getCachedTownNodes(): Record<string, TownNode> {
  try {
    const raw = localStorage.getItem(CACHE_KEY_NODES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return TOWN_NODES;
}

/**
 * Get route cache metadata
 */
export function getRouteCacheMeta(): RouteCacheMetadata {
  try {
    const raw = localStorage.getItem(CACHE_KEY_META);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return initRouteCache().meta;
}

/**
 * Update an individual segment in local cache (e.g. from field reports or officer updates)
 */
export function updateCachedSegment(
  segmentId: string,
  updates: Partial<EnrichedRoadSegment>
): EnrichedRoadSegment[] {
  const current = getCachedRouteSegments();
  const updated = current.map((seg) => {
    if (seg.id === segmentId) {
      return {
        ...seg,
        ...updates,
        lastCachedAt: new Date().toISOString(),
      };
    }
    return seg;
  });

  try {
    localStorage.setItem(CACHE_KEY_SEGMENTS, JSON.stringify(updated));
    const currentMeta = getRouteCacheMeta();
    const updatedMeta: RouteCacheMetadata = {
      ...currentMeta,
      lastUpdated: new Date().toISOString(),
      sizeKb: Math.round(JSON.stringify(updated).length / 1024),
    };
    localStorage.setItem(CACHE_KEY_META, JSON.stringify(updatedMeta));
  } catch (err) {
    console.error('Failed updating cached segment:', err);
  }

  return updated;
}

/**
 * Manually force re-sync or update route cache with fresh timestamp
 */
export function syncRouteCache(): { success: boolean; meta: RouteCacheMetadata } {
  const segments = getCachedRouteSegments();
  const now = new Date().toISOString();
  const updatedSegments = segments.map((s) => ({
    ...s,
    lastCachedAt: now,
  }));

  const totalKm = updatedSegments.reduce((sum, seg) => sum + seg.lenKm, 0);
  const meta: RouteCacheMetadata = {
    version: '2.4.0-ne-corridors',
    totalSegments: updatedSegments.length,
    totalNodes: Object.keys(TOWN_NODES).length,
    totalKm,
    lastUpdated: now,
    sizeKb: Math.round(JSON.stringify(updatedSegments).length / 1024),
    offlineReady: true,
    shadowZonesCovered: [
      'Barail Range (Dima Hasao)',
      'Sela Pass & Tawang (NH-13)',
      'Sonapur Tunnel (NH-6)',
      'Pagla Pahar (NH-29)',
      'Mao–Senapati Hills (NH-2)',
      'Jiribam–Imphal Ghats (NH-37)',
      'Kolasib (NH-306)',
      'Teesta Valley (NH-10)',
    ],
  };

  try {
    localStorage.setItem(CACHE_KEY_SEGMENTS, JSON.stringify(updatedSegments));
    localStorage.setItem(CACHE_KEY_META, JSON.stringify(meta));
  } catch (err) {
    console.warn('Sync failed to write storage:', err);
  }

  return { success: true, meta };
}

/**
 * Offline Mode / Shadow Zone simulation toggle
 */
export function isShadowZoneSimulated(): boolean {
  try {
    return localStorage.getItem(CACHE_KEY_OFFLINE_SIM) === 'true';
  } catch {
    return false;
  }
}

export function setShadowZoneSimulated(simulated: boolean): void {
  try {
    localStorage.setItem(CACHE_KEY_OFFLINE_SIM, simulated ? 'true' : 'false');
  } catch {
    // ignore
  }
}

/**
 * Dijkstra shortest path routing that executes 100% locally from the offline cache.
 */
export function calculateOfflineRoute(
  src: string,
  dst: string,
  mode: 'normal' | 'dis',
  segments: EnrichedRoadSegment[]
): {
  path: string[];
  distanceKm: number;
  hours: string;
  hasDisruption: boolean;
  avoided: string[];
  isFromOfflineCache: boolean;
} {
  const nodes = getCachedTownNodes();
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const Q = new Set(Object.keys(nodes));

  Object.keys(nodes).forEach((k) => {
    dist[k] = Infinity;
    prev[k] = null;
  });
  dist[src] = 0;

  const riskMultiplier: Record<'ok' | 'warn' | 'bad', number> = {
    ok: 1,
    warn: 1.8,
    bad: 999999,
  };

  while (Q.size > 0) {
    let u: string | null = null;
    Q.forEach((q) => {
      if (u === null || dist[q] < dist[u]) u = q;
    });

    if (!u || dist[u] === Infinity) break;
    Q.delete(u);
    if (u === dst) break;

    segments.forEach((edge) => {
      if (edge.a !== u && edge.b !== u) return;
      const v = edge.a === u ? edge.b : edge.a;
      const status = edge.st[mode];
      const weight = edge.lenKm * riskMultiplier[status];

      if (dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight;
        prev[v] = u;
      }
    });
  }

  if (dist[dst] === Infinity || !prev[dst]) {
    return {
      path: [src, dst],
      distanceKm: 0,
      hours: 'No Safe Path',
      hasDisruption: true,
      avoided: ['NH-29 Pagla Pahar Blocked'],
      isFromOfflineCache: true,
    };
  }

  const path: string[] = [dst];
  let curr: string | null = dst;
  while (curr && curr !== src) {
    curr = prev[curr];
    if (curr) path.unshift(curr);
  }

  let totalKm = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = segments.find(
      (r) =>
        (r.a === path[i] && r.b === path[i + 1]) ||
        (r.a === path[i + 1] && r.b === path[i])
    );
    if (edge) totalKm += edge.lenKm;
  }

  const estHours = Math.floor(totalKm / 38);
  const estMins = Math.round((totalKm / 38 - estHours) * 60);

  return {
    path,
    distanceKm: totalKm,
    hours: `${estHours}h ${estMins}m`,
    hasDisruption: mode === 'dis',
    avoided: mode === 'dis' ? ['NH-29 Pagla Pahar / Jatinga NH-27'] : [],
    isFromOfflineCache: true,
  };
}

/**
 * Filter cached segments by State or Shadow Zone risk
 */
export function filterCachedSegments(
  segments: EnrichedRoadSegment[],
  filter: {
    stateCode?: string;
    shadowZoneOnly?: boolean;
    statusMode?: 'normal' | 'dis';
    statusFilter?: RoadStatus | 'all';
    searchQuery?: string;
  }
): EnrichedRoadSegment[] {
  return segments.filter((seg) => {
    if (filter.stateCode && filter.stateCode !== 'all' && seg.stateCode !== filter.stateCode) {
      return false;
    }
    if (filter.shadowZoneOnly && seg.shadowZoneRisk !== 'High') {
      return false;
    }
    if (filter.statusFilter && filter.statusFilter !== 'all' && filter.statusMode) {
      if (seg.st[filter.statusMode] !== filter.statusFilter) {
        return false;
      }
    }
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      const matchName = seg.name.toLowerCase().includes(q);
      const matchHw = seg.hw.toLowerCase().includes(q);
      const matchState = seg.state.toLowerCase().includes(q);
      const matchBypass = seg.bypassRoute.toLowerCase().includes(q);
      const matchShelter = seg.nearestShelter.name.toLowerCase().includes(q);
      if (!matchName && !matchHw && !matchState && !matchBypass && !matchShelter) {
        return false;
      }
    }
    return true;
  });
}
