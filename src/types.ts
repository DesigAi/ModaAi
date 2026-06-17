export type InterfaceLanguage = 'ru' | 'es';

export interface Model {
  id: string;
  name: string;
  gender: 'Женский' | 'Мужской' | 'Унисекс';
  age: '18-22' | '23-28' | '30-35';
  ethnotype: 'Европейский' | 'Азиатский' | 'Латино' | 'Афро' | 'Смешанный';
  bodyType: 'Стройная' | 'Атлетичная' | 'Песочные часы' | 'Полная';
  skinTone: string;
  notes: string;
  previewUrl: string; // Grayscale layout description or background placeholder
  timestamp: number;
}

export type WardrobeItemCategory = 
  | 'dress' | 'suit' | 'top' | 'bottom' | 'outerwear' 
  | 'belt' | 'glasses' | 'hat' | 'bag' | 'shoes' | 'jewelry';

export type WardrobeItemClassification = 'product item' | 'accessory item';

export interface WardrobeItem {
  id: string;
  name: string;
  category: WardrobeItemCategory;
  classification: WardrobeItemClassification;
  imageSrc: string; // grayscale wireframe representation
  sideType: 'front' | 'back' | 'side' | 'detail' | 'accessory' | 'closeup' | 'generic';
  usageStatus: 'active' | 'hidden';
  createdAt: string;
}

export interface WardrobeKit {
  id: string;
  name: string;
  items: WardrobeItem[];
  usageStatus: 'active' | 'hidden';
  createdAt: string;
}

export interface Look {
  id: string;
  name: string;
  modelId: string;
  modelName: string;
  kitId: string;
  kitName: string;
  previewUrl: string; // Grayscale or model snapshot
  createdAt: string;
}

export type PaymentState = 
  | 'pending'
  | 'submitted'
  | 'confirmed'
  | 'rejected'
  | 'expired'
  | 'invalid_tx'
  | 'wrong_amount'
  | 'wrong_network'
  | 'duplicate_tx';

export interface PaymentIntent {
  id: string;
  packageId: string;
  packageName: string;
  amount: string;
  network: string; // e.g. "USDT-TON"
  address: string;
  comment: string;
  status: PaymentState;
  txHash: string;
  timestamp: number;
}

export type LedgerEvent =
  | 'grant'
  | 'marketing_grant'
  | 'support_compensation'
  | 'reserve'
  | 'reserve_release'
  | 'spend_confirmed'
  | 'support_hold'
  | 'support_refund'
  | 'support_manual_fix';

export interface LedgerItem {
  id: string;
  date: string;
  event: LedgerEvent;
  creditType: 'photo' | 'kit';
  count: number;
  status: string; // Russian localized status (e.g. "Выполнено", "Ожидание")
  note: string;
}

export type ResultState =
  | 'queued'
  | 'processing'
  | 'quality_check'
  | 'archive_preparing'
  | 'ready'
  | 'failed'
  | 'regenerating'
  | 'support_required';

export interface ResultItem {
  id: string;
  name: string;
  type: 'photo' | 'kit';
  status: ResultState;
  date: string;
  location: string;
  posePack: string;
  videoTemplate?: string;
  lookId: string;
  lookName: string;
  modelName: string;
  images: string[]; // list of placeholders labels
  videoUrl?: string; // play thumbnail placeholder
  supportTicketId?: string;
  isHidden?: boolean;
  stepIndex?: number; // current processing step for visual timeline
  cancelAllowed: boolean;
}

export interface LocationCategory {
  id: string;
  name: string;
  locations: string[];
}

export interface ControlledLocationSettings {
  temperature: 'Теплый' | 'Холодный';
  hardness: 'Мягкий' | 'Контрастный';
  intensity: 'Приглушенный' | 'Яркий';
}

export interface ActiveProductionFlow {
  id: string;
  type: 'photo' | 'kit';
  currentStep: number; // 0: Model, 1: Wardrobe, 2: Look, 3: Location, 4: Poses, 5: Video (only for kit), 6: Review
  selectedModel?: Model;
  selectedKit?: WardrobeKit;
  lookName: string;
  lookId?: string;
  selectedLocation?: string;
  locationSettings: ControlledLocationSettings;
  selectedPosePack?: string;
  selectedVideoTemplate?: string;
}
