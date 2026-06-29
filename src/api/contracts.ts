import {
  ActiveProductionFlow,
  InterfaceLanguage,
  LedgerEvent,
  LedgerItem,
  Look,
  Model,
  ResultItem,
  ResultState,
  WardrobeItem,
  WardrobeKit,
} from '../types';

export type ApiMode = 'demo' | 'http';

export interface DemoSession {
  isAuthenticated: boolean;
  email: string;
  interfaceLanguage: InterfaceLanguage;
}

export interface CreditsState {
  balance: number;
  reserved: number;
}

export interface ModaWorkspace {
  session: DemoSession;
  credits: CreditsState;
  models: Model[];
  wardrobeItems: WardrobeItem[];
  wardrobeKits: WardrobeKit[];
  looks: Look[];
  results: ResultItem[];
  ledger: LedgerItem[];
  activeProductionFlow: ActiveProductionFlow | null;
  updatedAt: number;
}

export interface DemoLoginRequest {
  email: string;
  interfaceLanguage: InterfaceLanguage;
}

export interface StartProductionFlowRequest {
  type: 'photo' | 'kit';
  preset?: {
    model: Model;
    kit: WardrobeKit;
    lookName: string;
    lookId?: string;
    startStep?: number;
    selectedLocation?: string;
    selectedPosePack?: string;
    selectedVideoTemplate?: string;
  };
}

export interface LaunchProductionRequest {
  reserveType: 'photo' | 'kit';
  flow: ActiveProductionFlow;
}

export interface AdvanceResultStatusRequest {
  id: string;
  status: ResultState;
  extraData?: Partial<ResultItem>;
}

export interface AddLedgerEntryRequest {
  event: LedgerEvent | string;
  type: 'photo' | 'kit';
  count: number;
  note: string;
}

export interface AdminCreditAdjustmentRequest {
  action: 'add' | 'spend' | 'return_reserve';
  amount?: number;
  customEvent?: LedgerEvent | string;
}

export interface ModaApi {
  getWorkspace(): Promise<ModaWorkspace>;
  saveWorkspace(workspace: ModaWorkspace): Promise<ModaWorkspace>;
  resetWorkspace(): Promise<ModaWorkspace>;
  loginDemo(request: DemoLoginRequest): Promise<ModaWorkspace>;
  logoutDemo(): Promise<ModaWorkspace>;
  startProductionFlow(request: StartProductionFlowRequest): Promise<ModaWorkspace>;
  updateProductionFlow(data: Partial<ActiveProductionFlow>): Promise<ModaWorkspace>;
  clearProductionFlow(): Promise<ModaWorkspace>;
  saveModel(model: Model): Promise<ModaWorkspace>;
  saveLook(look: Look): Promise<ModaWorkspace>;
  deleteLook(lookId: string): Promise<ModaWorkspace>;
  updateLookName(lookId: string, name: string): Promise<ModaWorkspace>;
  saveWardrobeKit(kit: WardrobeKit): Promise<ModaWorkspace>;
  deleteWardrobeItem(itemId: string): Promise<ModaWorkspace>;
  deleteWardrobeKit(kitId: string): Promise<ModaWorkspace>;
  toggleWardrobeItemVisibility(itemId: string): Promise<ModaWorkspace>;
  toggleWardrobeKitVisibility(kitId: string): Promise<ModaWorkspace>;
  launchProduction(request: LaunchProductionRequest): Promise<ModaWorkspace>;
  advanceResultStatus(request: AdvanceResultStatusRequest): Promise<ModaWorkspace>;
  refundResult(result: ResultItem): Promise<ModaWorkspace>;
  manualFixResult(result: ResultItem): Promise<ModaWorkspace>;
  addLedgerEntry(request: AddLedgerEntryRequest): Promise<ModaWorkspace>;
  addCredits(type: 'photo' | 'kit', count: number): Promise<ModaWorkspace>;
  adminAdjustCredits(request: AdminCreditAdjustmentRequest): Promise<ModaWorkspace>;
}
