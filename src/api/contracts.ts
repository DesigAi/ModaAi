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
  photoSetCredits: number;
  kitCredits: number;
  reservedPhotoSetCredits: number;
  reservedKitCredits: number;
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

export type WebLaunchTemplate = 'D1' | 'streetwear' | 'B1' | 'C1';
export type WebLaunchMode = 'mock' | 'production';
export type WebCreditReserveType = 'photo' | 'kit';
export type SeedanceResolution = '480p' | '720p' | '1080p';

export interface WebSceneSelection {
  frontendId?: string;
  backendLocationId?: string;
  backendSlot?: string;
}

export interface WebPosePackSelection {
  frontendId?: string;
  backendPosePackId?: string;
}

export interface WebVideoTemplateSelection {
  frontendId?: string;
  backendVideoTemplateId?: string;
}

export interface WebLaunchRequestBase {
  requestId: string;
  templateId: WebLaunchTemplate;
  mode: WebLaunchMode;
  reserveType: WebCreditReserveType;
  lookName?: string;
  scene?: WebSceneSelection;
  posePack?: WebPosePackSelection;
  videoTemplate?: WebVideoTemplateSelection;
  seedanceResolution?: SeedanceResolution;
}

export interface WebLaunchLookRef {
  lookId: string;
  modelId: string;
  kitId: string;
  characterIdentityCardId: string;
}

export interface WebSingleLookLaunchRequest extends WebLaunchRequestBase {
  templateId: 'D1' | 'streetwear';
  reserveType: 'photo';
  look: WebLaunchLookRef;
}

export interface WebB1LaunchRequest extends WebLaunchRequestBase {
  templateId: 'B1';
  reserveType: 'kit';
  characterIdentityCardId: string;
  looks: [WebLaunchLookRef, WebLaunchLookRef, WebLaunchLookRef, WebLaunchLookRef, WebLaunchLookRef];
}

export interface WebC1LaunchLookRef extends WebLaunchLookRef {
  characterIdentityCardId: string;
}

export interface WebC1LaunchRequest extends WebLaunchRequestBase {
  templateId: 'C1';
  reserveType: 'kit';
  looks: [WebC1LaunchLookRef, WebC1LaunchLookRef, WebC1LaunchLookRef];
}

export type WebLaunchRequest = WebSingleLookLaunchRequest | WebB1LaunchRequest | WebC1LaunchRequest;

export type WebLaunchBlockedError =
  | 'unsupported_template'
  | 'unsupported_mapping'
  | 'invalid_launch_payload'
  | 'insufficient_credits'
  | 'not_found'
  | 'paid_generation_disabled'
  | 'launch_unavailable';

export interface WebLaunchBlockedResponse {
  ok: false;
  error: WebLaunchBlockedError;
  message: string;
  details?: Record<string, unknown>;
  workspace?: ModaWorkspace;
}

export interface WebLaunchAcceptedResponse {
  ok: true;
  requestId: string;
  jobId: string;
  resultId: string;
  status: 'queued' | 'processing';
  workspace: ModaWorkspace;
}

export type WebLaunchResponse = WebLaunchAcceptedResponse | WebLaunchBlockedResponse;

export type LaunchProductionResponse = WebLaunchAcceptedResponse | ModaWorkspace;

export interface LaunchProductionRequest {
  reserveType: 'photo' | 'kit';
  flow: ActiveProductionFlow;
  canonicalLaunch?: WebLaunchRequest;
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
  type?: 'photo' | 'kit';
  amount?: number;
  customEvent?: LedgerEvent | string;
}

export interface LaunchContextRefreshResponse {
  workspace: ModaWorkspace;
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
  launchProduction(request: LaunchProductionRequest): Promise<LaunchProductionResponse>;
  refreshLaunchContext(resultId: string): Promise<LaunchContextRefreshResponse>;
  advanceResultStatus(request: AdvanceResultStatusRequest): Promise<ModaWorkspace>;
  refundResult(result: ResultItem): Promise<ModaWorkspace>;
  manualFixResult(result: ResultItem): Promise<ModaWorkspace>;
  addLedgerEntry(request: AddLedgerEntryRequest): Promise<ModaWorkspace>;
  addCredits(type: 'photo' | 'kit', count: number): Promise<ModaWorkspace>;
  adminAdjustCredits(request: AdminCreditAdjustmentRequest): Promise<ModaWorkspace>;
}
