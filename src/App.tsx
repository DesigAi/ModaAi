import React, { useEffect, useState } from 'react';
import { InterfaceLanguage, Model, WardrobeItem, WardrobeKit, Look, LedgerItem, ResultItem, ActiveProductionFlow, ResultState } from './types';
import { apiMode, modaApi, ModaWorkspace } from './api';
import { WebLaunchAcceptedResponse, WebLaunchBlockedResponse } from './api/contracts';
import { buildCanonicalLaunchFromFlow, CanonicalLaunchBuildBlocked } from './api/buildCanonicalLaunch';
import { INITIAL_MODELS, INITIAL_WARDROBE_ITEMS, INITIAL_WARDROBE_KITS, INITIAL_LOOKS, INITIAL_LEDGER } from './mockData';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import CreatePage from './components/CreatePage';
import LooksPage from './components/LooksPage';
import ResultsPage from './components/ResultsPage';
import AcceptedLaunchCard from './components/AcceptedLaunchCard';
import ApiModeBanner from './components/ApiModeBanner';
import TariffsPage from './components/TariffsPage';
import SettingsPage from './components/SettingsPage';
import { Coins, Sparkles, LayoutGrid, Users, Settings, LogOut, Camera, AlertOctagon, HelpCircle } from 'lucide-react';

type LaunchBlockedState = CanonicalLaunchBuildBlocked | WebLaunchBlockedResponse;

function isLaunchBlockedResponse(value: unknown): value is WebLaunchBlockedResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { ok?: unknown; error?: unknown; message?: unknown };
  return candidate.ok === false && typeof candidate.error === 'string' && typeof candidate.message === 'string';
}

function isLaunchAcceptedResponse(value: unknown): value is WebLaunchAcceptedResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { ok?: unknown; requestId?: unknown; jobId?: unknown; resultId?: unknown; status?: unknown; workspace?: unknown };
  return (
    candidate.ok === true &&
    typeof candidate.requestId === 'string' &&
    typeof candidate.jobId === 'string' &&
    typeof candidate.resultId === 'string' &&
    (candidate.status === 'queued' || candidate.status === 'processing') &&
    typeof candidate.workspace === 'object' &&
    candidate.workspace !== null
  );
}


function applyWorkspaceSnapshot(workspace: ModaWorkspace, setters: {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setUserEmail: React.Dispatch<React.SetStateAction<string>>;
  setInterfaceLanguage: React.Dispatch<React.SetStateAction<InterfaceLanguage>>;
  setPhotoSetCredits: React.Dispatch<React.SetStateAction<number>>;
  setKitCredits: React.Dispatch<React.SetStateAction<number>>;
  setReservedPhotoSetCredits: React.Dispatch<React.SetStateAction<number>>;
  setReservedKitCredits: React.Dispatch<React.SetStateAction<number>>;
  setSavedModels: React.Dispatch<React.SetStateAction<Model[]>>;
  setWardrobeItems: React.Dispatch<React.SetStateAction<WardrobeItem[]>>;
  setWardrobeKits: React.Dispatch<React.SetStateAction<WardrobeKit[]>>;
  setLooks: React.Dispatch<React.SetStateAction<Look[]>>;
  setResults: React.Dispatch<React.SetStateAction<ResultItem[]>>;
  setCreditLedger: React.Dispatch<React.SetStateAction<LedgerItem[]>>;
  setActiveProductionFlow: React.Dispatch<React.SetStateAction<ActiveProductionFlow | null>>;
}) {
  setters.setIsAuthenticated(workspace.session.isAuthenticated);
  setters.setUserEmail(workspace.session.email);
  setters.setInterfaceLanguage(workspace.session.interfaceLanguage);
  setters.setPhotoSetCredits(workspace.credits.photoSetCredits);
  setters.setKitCredits(workspace.credits.kitCredits);
  setters.setReservedPhotoSetCredits(workspace.credits.reservedPhotoSetCredits);
  setters.setReservedKitCredits(workspace.credits.reservedKitCredits);
  setters.setSavedModels(workspace.models);
  setters.setWardrobeItems(workspace.wardrobeItems);
  setters.setWardrobeKits(workspace.wardrobeKits);
  setters.setLooks(workspace.looks);
  setters.setResults(workspace.results);
  setters.setCreditLedger(workspace.ledger);
  setters.setActiveProductionFlow(workspace.activeProductionFlow);
}

export default function App() {
  // ----------------------------------------
  // AUTHENTICATION STATE
  // ----------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('brand.director@modai.team');
  const [interfaceLanguage, setInterfaceLanguage] = useState<InterfaceLanguage>('ru');

  // ----------------------------------------
  // PORTFOLIO / PLATFORM WORKSPACE STATE
  // ----------------------------------------
  const [photoSetCredits, setPhotoSetCredits] = useState<number>(1);
  const [kitCredits, setKitCredits] = useState<number>(1);
  const [reservedPhotoSetCredits, setReservedPhotoSetCredits] = useState<number>(0);
  const [reservedKitCredits, setReservedKitCredits] = useState<number>(0);
  const [savedModels, setSavedModels] = useState<Model[]>(INITIAL_MODELS);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>(INITIAL_WARDROBE_ITEMS);
  const [wardrobeKits, setWardrobeKits] = useState<WardrobeKit[]>(INITIAL_WARDROBE_KITS);
  const [looks, setLooks] = useState<Look[]>(INITIAL_LOOKS);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [creditLedger, setCreditLedger] = useState<LedgerItem[]>(INITIAL_LEDGER);
  const [activeProductionFlow, setActiveProductionFlow] = useState<ActiveProductionFlow | null>(null);

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<string>('create');

  // Modal alert rules
  const [showAccessModal, setShowAccessModal] = useState<boolean>(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState<boolean>(false);
  const [launchBlocked, setLaunchBlocked] = useState<LaunchBlockedState | null>(null);
  const [acceptedLaunch, setAcceptedLaunch] = useState<WebLaunchAcceptedResponse | null>(null);
  const [launchRefreshInFlight, setLaunchRefreshInFlight] = useState<boolean>(false);
  const [launchLastRefreshedAt, setLaunchLastRefreshedAt] = useState<number | null>(null);
  const [launchRefreshError, setLaunchRefreshError] = useState<string | null>(null);
  const [workspaceReady, setWorkspaceReady] = useState<boolean>(false);

  const applyWorkspace = (workspace: ModaWorkspace) => {
    applyWorkspaceSnapshot(workspace, {
      setIsAuthenticated,
      setUserEmail,
      setInterfaceLanguage,
      setPhotoSetCredits,
      setKitCredits,
      setReservedPhotoSetCredits,
      setReservedKitCredits,
      setSavedModels,
      setWardrobeItems,
      setWardrobeKits,
      setLooks,
      setResults,
      setCreditLedger,
      setActiveProductionFlow,
    });
  };

  useEffect(() => {
    let isMounted = true;
    modaApi.getWorkspace().then((workspace) => {
      if (!isMounted) return;
      applyWorkspace(workspace);
      setWorkspaceReady(true);
    }).catch((error) => {
      console.error('Failed to load ModaAI workspace', error);
      setWorkspaceReady(true);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!workspaceReady) return;
    modaApi.saveWorkspace({
      session: { isAuthenticated, email: userEmail, interfaceLanguage },
      credits: { photoSetCredits, kitCredits, reservedPhotoSetCredits, reservedKitCredits },
      models: savedModels,
      wardrobeItems,
      wardrobeKits,
      looks,
      results,
      ledger: creditLedger,
      activeProductionFlow,
      updatedAt: Date.now(),
    }).catch((error) => console.error('Failed to persist ModaAI workspace', error));
  }, [
    workspaceReady,
    isAuthenticated, userEmail, interfaceLanguage,
    photoSetCredits, kitCredits, reservedPhotoSetCredits, reservedKitCredits,
    savedModels, wardrobeItems, wardrobeKits, looks, results, creditLedger,
    activeProductionFlow
  ]);

  // ----------------------------------------
  // ACTIONS HANDLERS
  // ----------------------------------------
  const handleLoginSuccess = async (email: string, language: InterfaceLanguage) => {
    const workspace = await modaApi.loginDemo({ email, interfaceLanguage: language });
    applyWorkspace(workspace);
    setCurrentTab('create');
  };

  const handleLogout = async () => {
    const workspace = await modaApi.logoutDemo();
    applyWorkspace(workspace);
  };

  const handleClearStorage = async () => {
    const workspace = await modaApi.resetWorkspace();
    applyWorkspace(workspace);
    setCurrentTab('create');
  };

  const incrementCredits = async (type: 'photo' | 'kit', count: number) => {
    const workspace = await modaApi.addCredits(type, count);
    applyWorkspace(workspace);
  };

  const addLedgerEntry = async (event: string, type: 'photo' | 'kit', count: number, note: string) => {
    const workspace = await modaApi.addLedgerEntry({ event, type, count, note });
    applyWorkspace(workspace);
  };

  const getAvailableCredits = (type: 'photo' | 'kit') => (
    type === 'photo' ? photoSetCredits : kitCredits
  );

  const hasAnyCredits = photoSetCredits > 0 || kitCredits > 0;

  // Click on "Новый продакшен" shortcut
  const handleNewProductionClick = () => {
    if (!hasAnyCredits) {
      // If 0 credits, trigger blocked access modal prompt
      setShowAccessModal(true);
      return;
    }

    // Always reset active flow to null to show the choice/start page ("Создать AI-продакшен")
    setActiveProductionFlow(null);
    setCurrentTab('create');
  };

  const handleStartFlow = async (type: 'photo' | 'kit') => {
    if (getAvailableCredits(type) < 1) {
      setShowInsufficientModal(true);
      return;
    }
    const workspace = await modaApi.startProductionFlow({ type });
    applyWorkspace(workspace);
  };

  const handleStepChange = async (nextStep: number) => {
    const workspace = await modaApi.updateProductionFlow({ currentStep: nextStep });
    applyWorkspace(workspace);
  };

  const handleUpdateFlowData = async (data: Partial<ActiveProductionFlow>) => {
    const workspace = await modaApi.updateProductionFlow(data);
    applyWorkspace(workspace);
  };

  const handleSaveModel = async (model: Model) => {
    const workspace = await modaApi.saveModel(model);
    applyWorkspace(workspace);
  };

  const handleSaveLook = async (look: Look) => {
    const workspace = await modaApi.saveLook(look);
    applyWorkspace(workspace);
  };

  // Direct fast track production trigger from an existing Look card!
  const handleStartProductionWithLook = (look: Look, typeOverride?: 'photo' | 'kit') => {
    if (look.id === 'dummy') {
      // Direct jump starter
      const defaultModel = savedModels[0] || INITIAL_MODELS[0];
      const defaultKit = wardrobeKits[0] || INITIAL_WARDROBE_KITS[0];
      
      const typeChoice: 'photo' | 'kit' = typeOverride || (kitCredits > 0 ? 'kit' : 'photo');
      onStartFlowWithPreset(typeChoice, defaultModel, defaultKit, 'Ускоренная съемка образов');
      return;
    }

    const matchedModel = savedModels.find((m) => m.id === look.modelId) || savedModels[0];
    const matchedKit = wardrobeKits.find((k) => k.id === look.kitId) || wardrobeKits[0];

    const typeChoice: 'photo' | 'kit' = typeOverride || (kitCredits > 0 ? 'kit' : 'photo');
    onStartFlowWithPreset(typeChoice, matchedModel, matchedKit, look.name);
  };

  const onStartFlowWithPreset = async (type: 'photo' | 'kit', model: Model, kit: WardrobeKit, lookName: string) => {
    if (getAvailableCredits(type) < 1) {
      setShowInsufficientModal(true);
      return;
    }
    const workspace = await modaApi.startProductionFlow({
      type,
      preset: { model, kit, lookName: `${lookName} (Быстрый перезапуск)`, startStep: 3 },
    });
    applyWorkspace(workspace);
    setCurrentTab('create');
  };

  const handleDeleteLook = async (lookId: string) => {
    const workspace = await modaApi.deleteLook(lookId);
    applyWorkspace(workspace);
  };

  const handleUpdateLookName = async (lookId: string, newName: string) => {
    const workspace = await modaApi.updateLookName(lookId, newName);
    applyWorkspace(workspace);
  };

  // Final review checkout trigger launch!
  const handleLaunchProduction = async (reserveType: 'photo' | 'kit') => {
    if (!activeProductionFlow || !activeProductionFlow.selectedModel || !activeProductionFlow.selectedKit) return;

    if (getAvailableCredits(reserveType) < 1) {
      setShowInsufficientModal(true);
      return;
    }
    const launchPayload = buildCanonicalLaunchFromFlow(activeProductionFlow, reserveType);
    if (launchPayload.ok === false) {
      setLaunchBlocked(launchPayload);
      return;
    }

    try {
      const launchResponse = await modaApi.launchProduction({
        reserveType,
        flow: activeProductionFlow,
        canonicalLaunch: launchPayload.canonicalLaunch,
      });
      if (isLaunchAcceptedResponse(launchResponse)) {
        applyWorkspace(launchResponse.workspace);
        setAcceptedLaunch(launchResponse);
        setLaunchLastRefreshedAt(Date.now());
        setLaunchRefreshError(null);
      } else {
        applyWorkspace(launchResponse);
        setAcceptedLaunch(null);
      }
      setLaunchBlocked(null);
      setCurrentTab('results');
    } catch (error) {
      const response = (error as { response?: unknown }).response;
      if (isLaunchBlockedResponse(response)) {
        setLaunchBlocked(response);
        if (response.workspace) {
          applyWorkspace(response.workspace);
        }
        return;
      }
      throw error;
    }
  };

  const refreshAcceptedLaunch = async () => {
    if (!acceptedLaunch) return;
    setLaunchRefreshInFlight(true);
    setLaunchRefreshError(null);
    try {
      const { workspace } = await modaApi.refreshLaunchContext(acceptedLaunch.resultId);
      applyWorkspace(workspace);
      setLaunchLastRefreshedAt(Date.now());
    } catch (error) {
      setLaunchRefreshError(error instanceof Error ? error.message : 'unknown_refresh_error');
    } finally {
      setLaunchRefreshInFlight(false);
    }
  };

  useEffect(() => {
    if (apiMode !== 'http' || !acceptedLaunch) return;
    const observed = results.find((result) => result.id === acceptedLaunch.resultId);
    const terminalStatuses: ResultState[] = ['ready', 'failed', 'support_required'];
    if (observed && terminalStatuses.includes(observed.status)) return;

    const timer = window.setTimeout(() => {
      refreshAcceptedLaunch();
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [acceptedLaunch, results]);

  // Demo backend-compatible production lifecycle simulator.
  useEffect(() => {
    if (apiMode !== 'demo') return;
    if (!workspaceReady) return;
    const nextRunning = results.find((result) =>
      ['queued', 'processing', 'quality_check', 'archive_preparing'].includes(result.status)
    );
    if (!nextRunning) return;

    const statusOrder: ResultState[] = ['queued', 'processing', 'quality_check', 'archive_preparing', 'ready'];
    const currentIndex = statusOrder.indexOf(nextRunning.status);
    const nextStatus = statusOrder[Math.min(currentIndex + 1, statusOrder.length - 1)];
    const timer = window.setTimeout(async () => {
      const workspace = await modaApi.advanceResultStatus({
        id: nextRunning.id,
        status: nextStatus,
        extraData: { stepIndex: Math.max(0, currentIndex + 1) },
      });
      applyWorkspace(workspace);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [workspaceReady, results]);

  // Admin / Support ticket resolution handlers
  const handleUpdateResultStatus = async (id: string, status: ResultState, extraData?: Partial<ResultItem>) => {
    const workspace = await modaApi.advanceResultStatus({ id, status, extraData });
    applyWorkspace(workspace);
  };

  const handleRefundCredit = async (result: ResultItem) => {
    const workspace = await modaApi.refundResult(result);
    applyWorkspace(workspace);
  };

  const handleManualFixComplete = async (result: ResultItem) => {
    const workspace = await modaApi.manualFixResult(result);
    applyWorkspace(workspace);
  };

  const handleWardrobeKitCreate = async (newKit: WardrobeKit) => {
    const workspace = await modaApi.saveWardrobeKit(newKit);
    applyWorkspace(workspace);
  };

  const handleDeleteItem = async (itemId: string) => {
    const workspace = await modaApi.deleteWardrobeItem(itemId);
    applyWorkspace(workspace);
  };

  const handleDeleteKit = async (kitId: string) => {
    const workspace = await modaApi.deleteWardrobeKit(kitId);
    applyWorkspace(workspace);
  };

  const handleToggleHideItem = async (itemId: string) => {
    const workspace = await modaApi.toggleWardrobeItemVisibility(itemId);
    applyWorkspace(workspace);
  };

  const handleToggleHideKit = async (kitId: string) => {
    const workspace = await modaApi.toggleWardrobeKitVisibility(kitId);
    applyWorkspace(workspace);
  };

  // ----------------------------------------
  // ROUTING RENDERER SWITCHER
  // ----------------------------------------
  const renderTabContent = () => {
    switch (currentTab) {
      case 'create':
        return (
          <CreatePage
            photoSetCredits={photoSetCredits}
            kitCredits={kitCredits}
            savedModels={savedModels}
            wardrobeItems={wardrobeItems}
            wardrobeKits={wardrobeKits}
            looks={looks}
            activeFlow={activeProductionFlow}
            onStartFlow={handleStartFlow}
            onStepChange={handleStepChange}
            onUpdateFlowData={handleUpdateFlowData}
            onSaveModel={handleSaveModel}
            onSaveLook={handleSaveLook}
            onLaunchProduction={handleLaunchProduction}
            onNavigateToTariffs={() => setCurrentTab('tariffs')}
            onCancelFlow={async () => applyWorkspace(await modaApi.clearProductionFlow())}
          />
        );
      case 'looks':
        return (
          <LooksPage
            looks={looks}
            onStartProductionWithLook={handleStartProductionWithLook}
            onDeleteLook={handleDeleteLook}
            onUpdateLookName={handleUpdateLookName}
            onNavigateToTariffs={() => setCurrentTab('tariffs')}
            hasCredits={hasAnyCredits}
          />
        );
      case 'results':
        return (
          <ResultsPage
            results={results}
            onUpdateResultStatus={handleUpdateResultStatus}
            onRefundCredit={handleRefundCredit}
            onManualFixComplete={handleManualFixComplete}
            onGrantCompensation={async (typeChoice) => {
              const count = 1;
              applyWorkspace(await modaApi.addCredits(typeChoice, count));
              applyWorkspace(await modaApi.addLedgerEntry({
                event: 'support_compensation',
                type: typeChoice,
                count,
                note: 'Ручное начисление компенсации',
              }));
            }}
            onConfirmSpendDirect={(res) => {
              handleUpdateResultStatus(res.id, 'ready');
            }}
            onStartWithLookId={async (lookId, resultItem) => {
              let matchingLook = looks.find((l) => l.id === lookId);
              if (!matchingLook && resultItem) {
                matchingLook = looks.find((l) => l.name === resultItem.lookName);
              }

              const matchedModel = (matchingLook ? savedModels.find((m) => m.id === matchingLook.modelId) : null) || (resultItem ? savedModels.find((m) => m.name === resultItem.modelName) : null) || savedModels[0];
              const matchedKit = (matchingLook ? wardrobeKits.find((k) => k.id === matchingLook.kitId) : null) || (resultItem ? wardrobeKits.find((k) => k.name === resultItem.lookName || resultItem.name.includes(k.name)) : null) || wardrobeKits[0];

              const typeChoice: 'photo' | 'kit' = resultItem ? (resultItem.type as 'photo' | 'kit') : (kitCredits > 0 ? 'kit' : 'photo');
              const finalLookName = matchingLook ? matchingLook.name : (resultItem ? resultItem.lookName : 'Новый образ');
              const workspace = await modaApi.startProductionFlow({
                type: typeChoice,
                preset: {
                  model: matchedModel,
                  kit: matchedKit,
                  lookName: `${finalLookName} (Перезапуск)`,
                  startStep: 3,
                  selectedLocation: resultItem?.location || 'Коста-дель-Соль',
                  selectedPosePack: resultItem?.posePack || 'Классика',
                  selectedVideoTemplate: resultItem?.videoTemplate,
                },
              });
              applyWorkspace(workspace);
              setCurrentTab('create');
            }}
          />
        );
      case 'tariffs':
        return (
          <TariffsPage
            photoSetCredits={photoSetCredits}
            kitCredits={kitCredits}
            reservedPhotoSetCredits={reservedPhotoSetCredits}
            reservedKitCredits={reservedKitCredits}
            ledger={creditLedger}
            addLedgerEntry={addLedgerEntry}
            incrementCredits={incrementCredits}
            onStartProduction={(typeChosen) => {
              handleStartFlow(typeChosen);
              setCurrentTab('create');
            }}
            onAdminAction={async (action, amount, customEvent, type) => {
              const workspace = await modaApi.adminAdjustCredits({ action, amount, customEvent, type });
              applyWorkspace(workspace);
            }}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            userEmail={userEmail}
            photoSetCredits={photoSetCredits}
            kitCredits={kitCredits}
            ledger={creditLedger}
            onLogout={handleLogout}
            onClearStorage={handleClearStorage}
          />
        );
      default:
        return <div className="p-6">Страница не найдена.</div>;
    }
  };

  // ----------------------------------------
  // ROOT COMPONENT RETURN LISTENER
  // ----------------------------------------
  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Loaded logged-in desktop view
  return (
    <div className="min-h-screen lg:h-screen bg-[#050505] text-[#F8F8F8] flex flex-col lg:flex-row font-sans overflow-x-hidden lg:overflow-hidden">
      
      {/* Sidebar - responsive desktop drawer / collapses to rail on iPad limits */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        photoSetCredits={photoSetCredits}
        kitCredits={kitCredits}
        reservedPhotoSetCredits={reservedPhotoSetCredits}
        reservedKitCredits={reservedKitCredits}
        userEmail={userEmail}
        onLogout={handleLogout}
        onNewProductionClick={handleNewProductionClick}
      />

      {/* Main viewport Container space */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0 lg:h-full bg-[#050505]">
        
        {/* Mobile sticky top bar header header */}
        <div className="lg:hidden bg-[#0F0F11] border-b border-[rgba(255,255,255,0.08)] p-4 flex items-center justify-between">
          <div>
            <span className="font-display font-medium text-lg tracking-tight text-[#F8F8F8]">ModaAI</span>
          </div>
          
          {/* Hidden on mobile top bar per request */}
        </div>

        {/* Content switchboards nested rendering */}
        <div className="flex-1 overflow-y-auto bg-[#050505]">
          <ApiModeBanner mode={apiMode} />
          {currentTab === 'results' && acceptedLaunch && (
            <AcceptedLaunchCard
              launch={acceptedLaunch}
              observedResult={results.find((result) => result.id === acceptedLaunch.resultId)}
              isRefreshing={launchRefreshInFlight}
              lastRefreshedAt={launchLastRefreshedAt}
              refreshError={launchRefreshError}
              onRefresh={refreshAcceptedLaunch}
              onDismiss={() => setAcceptedLaunch(null)}
            />
          )}
          {renderTabContent()}
        </div>

        {/* Mobile Navigation fallback bar bottom */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#0F0F11] border-t border-[rgba(255,255,255,0.08)] grid grid-cols-5 text-center p-1.5 z-40 text-[10px]">
          <button
            onClick={() => setCurrentTab('create')}
            className={`flex flex-col items-center gap-0.5 py-1.5 cursor-pointer ${currentTab === 'create' ? 'text-[#C9A35F] font-bold' : 'text-[#8B8B93]'}`}
          >
            <Sparkles size={16} />
            <span>Создать</span>
          </button>
          <button
            onClick={() => setCurrentTab('looks')}
            className={`flex flex-col items-center gap-0.5 py-1.5 cursor-pointer ${currentTab === 'looks' ? 'text-[#C9A35F] font-bold' : 'text-[#8B8B93]'}`}
          >
            <Users size={16} />
            <span>Образы</span>
          </button>
          <button
            onClick={() => setCurrentTab('results')}
            className={`flex flex-col items-center gap-0.5 py-1.5 cursor-pointer ${currentTab === 'results' ? 'text-[#C9A35F] font-bold' : 'text-[#8B8B93]'}`}
          >
            <LayoutGrid size={16} />
            <span>Результаты</span>
          </button>
          <button
            onClick={() => setCurrentTab('tariffs')}
            className={`flex flex-col items-center gap-0.5 py-1.5 cursor-pointer ${currentTab === 'tariffs' ? 'text-[#C9A35F] font-bold' : 'text-[#8B8B93]'}`}
          >
            <Coins size={16} />
            <span>Тарифы</span>
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex flex-col items-center gap-0.5 py-1.5 cursor-pointer ${currentTab === 'settings' ? 'text-[#C9A35F] font-bold' : 'text-[#8B8B93]'}`}
          >
            <Settings size={16} />
            <span>Настройки</span>
          </button>
        </div>

      </div>

      {/* ----------------------------------------
          MODALS & BLOCKED DIALOGS SYSTEM
         ---------------------------------------- */}
      
      {/* 1. Locked Access Modal: "Сначала выберите тариф" */}
      {showAccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 font-sans">
          <div className="bg-[#16161A] border border-[rgba(255,255,255,0.12)] rounded-[12px] p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="text-center space-y-2">
              <AlertOctagon className="text-[#C9A35F] mx-auto animate-pulse" size={40} />
              <h3 className="text-lg font-display font-medium text-[#F8F8F8]">Сначала выберите тариф</h3>
              <p className="text-xs text-[#8B8B93] leading-relaxed font-sans">
                Чтобы запустить создание нового продакшена AI-фотосессии, сначала выберите и оплатите подходящий пакет кредитов в Вашем кабинете.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAccessModal(false);
                  setCurrentTab('tariffs');
                  
                  // Smoothly scroll down to the checkout container if needed
                  setTimeout(() => {
                    document.getElementById('checkout_container')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="w-full h-[40px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] font-sans font-semibold text-sm rounded-[6px] flex items-center justify-center transition-all select-none active:translate-y-[1px] cursor-pointer"
              >
                Смотреть доступные тарифы
              </button>
              <button
                onClick={() => setShowAccessModal(false)}
                className="w-full border border-[rgba(255,255,255,0.12)] hover:bg-[#1D1D21] text-[#F8F8F8] font-semibold text-xs py-2.5 rounded-[6px] transition-colors text-center cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Insufficient Credits Modal */}
      {showInsufficientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 font-sans">
          <div className="bg-[#16161A] border border-[rgba(255,255,255,0.12)] rounded-[12px] p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="text-center space-y-2">
              <AlertOctagon className="text-[#C9A35F] mx-auto" size={40} />
              <h3 className="text-lg font-display font-medium text-[#F8F8F8]">Недостаточно кредитов</h3>
              <p className="text-xs text-[#8B8B93] leading-relaxed font-sans">
                Для выбранного типа съемки у Вас на балансе нет подходящего типа кредита. Пожалуйста, пополните баланс в тарифах.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowInsufficientModal(false);
                  setCurrentTab('tariffs');
                }}
                className="w-full h-[40px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] font-sans font-semibold text-sm rounded-[6px] flex items-center justify-center transition-all select-none active:translate-y-[1px] cursor-pointer"
              >
                Смотреть подходящие пакеты
              </button>
              <button
                onClick={() => setShowInsufficientModal(false)}
                className="w-full border border-[rgba(255,255,255,0.12)] hover:bg-[#1D1D21] text-[#F8F8F8] font-semibold text-xs py-2.5 rounded-[6px] transition-colors text-center cursor-pointer"
              >
                Изучить имеющиеся
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Canonical launch blocked state */}
      {launchBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 font-sans">
          <div className="bg-[#16161A] border border-[rgba(255,255,255,0.12)] rounded-[12px] p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="text-center space-y-2">
              <AlertOctagon className="text-[#C9A35F] mx-auto" size={40} />
              <h3 className="text-lg font-display font-medium text-[#F8F8F8]">Запуск пока недоступен</h3>
              <p className="text-xs text-[#B5B5BC] leading-relaxed font-sans">
                {launchBlocked.message}
              </p>
            </div>

            <div className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between gap-3">
                <span className="text-[#8B8B93]">canonical error</span>
                <span className="text-[#C9A35F] text-right">{launchBlocked.error}</span>
              </div>
              {launchBlocked.details && (
                <pre className="max-h-36 overflow-auto whitespace-pre-wrap break-words text-[#8B8B93] text-[10px] leading-relaxed">
                  {JSON.stringify(launchBlocked.details, null, 2)}
                </pre>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setLaunchBlocked(null)}
                className="w-full h-[40px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] font-sans font-semibold text-sm rounded-[6px] flex items-center justify-center transition-all select-none active:translate-y-[1px] cursor-pointer"
              >
                Вернуться к настройке запуска
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
