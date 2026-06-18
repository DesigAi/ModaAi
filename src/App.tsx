import React, { useState, useEffect } from 'react';
import { InterfaceLanguage, Model, WardrobeItem, WardrobeKit, Look, LedgerItem, ResultItem, ActiveProductionFlow, ResultState } from './types';
import { INITIAL_MODELS, INITIAL_WARDROBE_ITEMS, INITIAL_WARDROBE_KITS, INITIAL_LOOKS, INITIAL_LEDGER } from './mockData';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import CreatePage from './components/CreatePage';
import LooksPage from './components/LooksPage';
import ResultsPage from './components/ResultsPage';
import TariffsPage from './components/TariffsPage';
import SettingsPage from './components/SettingsPage';
import { Coins, Sparkles, LayoutGrid, Users, Settings, LogOut, Camera, AlertOctagon, HelpCircle } from 'lucide-react';

export default function App() {
  // ----------------------------------------
  // AUTHENTICATION STATE
  // ----------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('modai_auth') === 'true';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('modai_email') || 'brand.director@modai.team';
  });
  const [interfaceLanguage, setInterfaceLanguage] = useState<InterfaceLanguage>(() => {
    return (localStorage.getItem('modai_lang') as InterfaceLanguage) || 'ru';
  });

  // ----------------------------------------
  // PORTFOLIO / PLATFORM WORKSPACE STATE
  // ----------------------------------------
  const [creditBalance, setCreditBalance] = useState<number>(() => {
    const saved = localStorage.getItem('modai_credit_balance');
    if (saved !== null) {
      return parseFloat(saved);
    }
    // Perform state migration from legacy variables if they exist
    const legacyPhotoRaw = localStorage.getItem('modai_photo_credits');
    const legacyKitRaw = localStorage.getItem('modai_kit_credits');
    if (legacyPhotoRaw !== null || legacyKitRaw !== null) {
      const legacyPhoto = legacyPhotoRaw ? parseFloat(legacyPhotoRaw) : 0;
      const legacyKit = legacyKitRaw ? parseFloat(legacyKitRaw) : 0;
      return (legacyPhoto * 0.5) + (legacyKit * 1.0);
    }
    // Default starting balance of 1.0 credit per user instructions
    return 1.0;
  });

  const [reservedCredits, setReservedCredits] = useState<number>(() => {
    const saved = localStorage.getItem('modai_reserved_credits');
    if (saved !== null) {
      return parseFloat(saved);
    }
    // Perform state migration from legacy reserved variables if they exist
    const legacyPhotoResRaw = localStorage.getItem('modai_res_photo_credits');
    const legacyKitResRaw = localStorage.getItem('modai_res_kit_credits');
    if (legacyPhotoResRaw !== null || legacyKitResRaw !== null) {
      const legacyPhotoRes = legacyPhotoResRaw ? parseFloat(legacyPhotoResRaw) : 0;
      const legacyKitRes = legacyKitResRaw ? parseFloat(legacyKitResRaw) : 0;
      return (legacyPhotoRes * 0.5) + (legacyKitRes * 1.0);
    }
    return 0;
  });

  const [savedModels, setSavedModels] = useState<Model[]>(() => {
    const saved = localStorage.getItem('modai_models');
    return saved ? JSON.parse(saved) : INITIAL_MODELS;
  });
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>(() => {
    const saved = localStorage.getItem('modai_wardrobe_items');
    return saved ? JSON.parse(saved) : INITIAL_WARDROBE_ITEMS;
  });
  const [wardrobeKits, setWardrobeKits] = useState<WardrobeKit[]>(() => {
    const saved = localStorage.getItem('modai_wardrobe_kits');
    return saved ? JSON.parse(saved) : INITIAL_WARDROBE_KITS;
  });
  const [looks, setLooks] = useState<Look[]>(() => {
    const saved = localStorage.getItem('modai_looks');
    return saved ? JSON.parse(saved) : INITIAL_LOOKS;
  });
  
  // Start results with one ready item so the user can test download instantly
  const [results, setResults] = useState<ResultItem[]>(() => {
    const saved = localStorage.getItem('modai_results');
    if (saved) return JSON.parse(saved);
    
    // Default initial template results
    const defaultItem: ResultItem = {
      id: 'res_demo_ready',
      name: 'Летний шелковый рендер платья миди №1',
      type: 'kit',
      status: 'ready',
      date: '17.06.2026 12:15',
      location: 'Коста-дель-Соль',
      posePack: 'Классика',
      videoTemplate: 'Streetwear',
      lookId: 'look_1',
      lookName: 'Мария в Черном Шелке',
      modelName: 'Мария Е.',
      images: [
        'Поза 1: Фронтальный ракурс',
        'Поза 2: Левый полуоборот',
        'Поза 3: Правый полуоборот',
        'Поза 4: Ракурс спины',
        'Поза 5: Портретная деталь',
        'Поза 6: Фокус на ткань',
        'Поза 7: Динамичный шаг'
      ],
      videoUrl: '15-секундное вертикальное AI-видео (1080p)',
      cancelAllowed: false
    };
    return [defaultItem];
  });

  const [creditLedger, setCreditLedger] = useState<LedgerItem[]>(() => {
    const saved = localStorage.getItem('modai_ledger');
    const rawList: LedgerItem[] = saved ? JSON.parse(saved) : INITIAL_LEDGER;
    const seenIds = new Set<string>();
    return rawList.map((item, idx) => {
      let uniqueId = item.id;
      if (!uniqueId || seenIds.has(uniqueId)) {
        uniqueId = `led_col_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
      }
      seenIds.add(uniqueId);
      return { ...item, id: uniqueId };
    });
  });

  const [activeProductionFlow, setActiveProductionFlow] = useState<ActiveProductionFlow | null>(() => {
    const saved = localStorage.getItem('modai_active_flow');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<string>('create');

  // Modal alert rules
  const [showAccessModal, setShowAccessModal] = useState<boolean>(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState<boolean>(false);

  // ----------------------------------------
  // SYNC TO LOCAL STORAGE
  // ----------------------------------------
  useEffect(() => {
    localStorage.setItem('modai_auth', isAuthenticated.toString());
    localStorage.setItem('modai_email', userEmail);
    localStorage.setItem('modai_lang', interfaceLanguage);
    localStorage.setItem('modai_credit_balance', creditBalance.toString());
    localStorage.setItem('modai_reserved_credits', reservedCredits.toString());
    localStorage.setItem('modai_models', JSON.stringify(savedModels));
    localStorage.setItem('modai_wardrobe_items', JSON.stringify(wardrobeItems));
    localStorage.setItem('modai_wardrobe_kits', JSON.stringify(wardrobeKits));
    localStorage.setItem('modai_looks', JSON.stringify(looks));
    localStorage.setItem('modai_results', JSON.stringify(results));
    localStorage.setItem('modai_ledger', JSON.stringify(creditLedger));
    localStorage.setItem('modai_active_flow', activeProductionFlow ? JSON.stringify(activeProductionFlow) : '');
  }, [
    isAuthenticated, userEmail, interfaceLanguage,
    creditBalance, reservedCredits,
    savedModels, wardrobeItems, wardrobeKits, looks, results, creditLedger,
    activeProductionFlow
  ]);

  // ----------------------------------------
  // ACTIONS HANDLERS
  // ----------------------------------------
  const handleLoginSuccess = (email: string, language: InterfaceLanguage) => {
    setUserEmail(email);
    setInterfaceLanguage(language);
    setIsAuthenticated(true);
    setCurrentTab('create');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('modai_auth');
  };

  const handleClearStorage = () => {
    localStorage.clear();
    setCreditBalance(1.0); // Reset to standard starting balance
    setReservedCredits(0);
    setSavedModels(INITIAL_MODELS);
    setWardrobeItems(INITIAL_WARDROBE_ITEMS);
    setWardrobeKits(INITIAL_WARDROBE_KITS);
    setLooks(INITIAL_LOOKS);
    setResults([]);
    setCreditLedger(INITIAL_LEDGER);
    setActiveProductionFlow(null);
    setCurrentTab('create');
    setIsAuthenticated(false);
  };

  const incrementCredits = (type: 'photo' | 'kit', count: number) => {
    setCreditBalance((prev) => prev + count);
  };

  const addLedgerEntry = (event: string, type: 'photo' | 'kit', count: number, note: string) => {
    const timestamp = new Date();
    const formattedDate = `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString().slice(0, 5)}`;
    
    const newItem: LedgerItem = {
      id: `led_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: formattedDate,
      event: event as any,
      creditType: type,
      count,
      status: 'Выполнено',
      note
    };
    setCreditLedger((prev) => [newItem, ...prev]);
  };

  // Click on "Новый продакшен" shortcut
  const handleNewProductionClick = () => {
    const hasAnyCredits = creditBalance >= 0.5;
    if (!hasAnyCredits) {
      // If 0 credits, trigger blocked access modal prompt
      setShowAccessModal(true);
      return;
    }

    // Always reset active flow to null to show the choice/start page ("Создать AI-продакшен")
    setActiveProductionFlow(null);
    setCurrentTab('create');
  };

  const handleStartFlow = (type: 'photo' | 'kit') => {
    // Check if the user has enough credits of that type
    const cost = type === 'photo' ? 0.5 : 1.0;
    if (creditBalance < cost) {
      setShowInsufficientModal(true);
      return;
    }

    setActiveProductionFlow({
      id: `flow_${Date.now()}`,
      type,
      currentStep: 0,
      lookName: 'Черновик Образа ' + new Date().toLocaleDateString(),
      locationSettings: {
        temperature: 'Теплый',
        hardness: 'Мягкий',
        intensity: 'Приглушенный'
      }
    });
  };

  const handleStepChange = (nextStep: number) => {
    setActiveProductionFlow((prev) => {
      if (!prev) return null;
      return { ...prev, currentStep: nextStep };
    });
  };

  const handleUpdateFlowData = (data: Partial<ActiveProductionFlow>) => {
    setActiveProductionFlow((prev) => {
      if (!prev) return null;
      return { ...prev, ...data };
    });
  };

  const handleSaveModel = (model: Model) => {
    setSavedModels((prev) => [model, ...prev]);
  };

  const handleSaveLook = (look: Look) => {
    setLooks((prev) => {
      // Keep only unique saves to avoid duplicates
      if (prev.some((x) => x.name.toLowerCase() === look.name.toLowerCase())) return prev;
      return [look, ...prev];
    });
  };

  // Direct fast track production trigger from an existing Look card!
  const handleStartProductionWithLook = (look: Look) => {
    if (look.id === 'dummy') {
      // Direct jump starter
      const defaultModel = savedModels[0] || INITIAL_MODELS[0];
      const defaultKit = wardrobeKits[0] || INITIAL_WARDROBE_KITS[0];
      
      const typeChoice: 'photo' | 'kit' = creditBalance >= 1.0 ? 'kit' : 'photo';
      onStartFlowWithPreset(typeChoice, defaultModel, defaultKit, 'Ускоренная съемка образов');
      return;
    }

    const matchedModel = savedModels.find((m) => m.id === look.modelId) || savedModels[0];
    const matchedKit = wardrobeKits.find((k) => k.id === look.kitId) || wardrobeKits[0];

    const typeChoice: 'photo' | 'kit' = creditBalance >= 1.0 ? 'kit' : 'photo';
    onStartFlowWithPreset(typeChoice, matchedModel, matchedKit, look.name);
  };

  const onStartFlowWithPreset = (type: 'photo' | 'kit', model: Model, kit: WardrobeKit, lookName: string) => {
    const cost = type === 'photo' ? 0.5 : 1.0;
    if (creditBalance < cost) {
      setShowInsufficientModal(true);
      return;
    }

    setActiveProductionFlow({
      id: `flow_fast_${Date.now()}`,
      type,
      currentStep: 3, // Directly starts with step 4: Location! Fulfilling fast production specs
      selectedModel: model,
      selectedKit: kit,
      lookName: `${lookName} (Быстрый перезапуск)`,
      locationSettings: {
        temperature: 'Теплый',
        hardness: 'Мягкий',
        intensity: 'Приглушенный'
      }
    });
    setCurrentTab('create');
  };

  const handleDeleteLook = (lookId: string) => {
    setLooks(looks.filter((x) => x.id !== lookId));
  };

  const handleUpdateLookName = (lookId: string, newName: string) => {
    setLooks(looks.map((l) => l.id === lookId ? { ...l, name: newName } : l));
  };

  // Final review checkout trigger launch!
  const handleLaunchProduction = (reserveType: 'photo' | 'kit') => {
    if (!activeProductionFlow || !activeProductionFlow.selectedModel || !activeProductionFlow.selectedKit) return;

    const cost = reserveType === 'photo' ? 0.5 : 1.0;
    if (creditBalance < cost) {
      alert('Недостаточно доступных кредитов для запуска.');
      return;
    }
    setCreditBalance((prev) => prev - cost);
    setReservedCredits((prev) => prev + cost);
    addLedgerEntry('reserve', reserveType, cost, `Блокировка ${cost.toString().replace('.', ',')} кр. под запуск "${activeProductionFlow.lookName}"`);

    // Insert to active running results database
    const newResult: ResultItem = {
      id: `res_order_${Date.now()}`,
      name: `Съемка: ${activeProductionFlow.lookName}`,
      type: reserveType,
      status: 'queued', // first state as specified
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0, 5),
      location: activeProductionFlow.selectedLocation || 'Минималистичный люкс',
      posePack: activeProductionFlow.selectedPosePack || 'Классика',
      videoTemplate: activeProductionFlow.selectedVideoTemplate,
      lookId: activeProductionFlow.lookId || 'look_any',
      lookName: activeProductionFlow.lookName,
      modelName: activeProductionFlow.selectedModel.name,
      images: [],
      cancelAllowed: true
    };

    setResults((prev) => [newResult, ...prev]);

    // Clear active production flow to avoid lockout
    setActiveProductionFlow(null);
    // Move layout focus immediately to the Results board so they watch the timeline loader progress!
    setCurrentTab('results');
  };

  // Admin / Support ticket resolution handlers
  const handleUpdateResultStatus = (id: string, status: ResultState, extraData?: Partial<ResultItem>) => {
    setResults((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const oldStatus = r.status;
          const nextItem = { ...r, status, ...extraData };
          
          // If moving from process reservation state to finished ready state, officially spend the credits
          if (status === 'ready' && oldStatus !== 'ready') {
            const cost = r.type === 'photo' ? 0.5 : 1.0;
            setReservedCredits((k) => Math.max(0, k - cost));
            addLedgerEntry('spend_confirmed', r.type, cost, `Подтверждение списания ${cost.toString().replace('.', ',')} кр. для пака "${r.name}"`);
          }
          return nextItem;
        }
        return r;
      })
    );
  };

  const handleRefundCredit = (result: ResultItem) => {
    // Release reserve, return to cash balance
    const cost = result.type === 'photo' ? 0.5 : 1.0;
    setReservedCredits((p) => Math.max(0, p - cost));
    setCreditBalance((p) => p + cost);
    addLedgerEntry('reserve_release', result.type, cost, `Резерв снят: Возврат ${cost.toString().replace('.', ',')} кр. за тикет "${result.name}"`);

    handleUpdateResultStatus(result.id, 'failed');
  };

  const handleManualFixComplete = (result: ResultItem) => {
    // Keep spend reserved but turn result ready!
    let mockImages = [
      'Поза 1: Ручная ретушь складок',
      'Поза 2: Левый полуоборот ретушь',
      'Поза 3: Правый полуоборот ретушь',
      'Поза 4: Ракурс спины (исправлен)',
      'Поза 5: Портретная деталь ретушь',
      'Поза 6: Фокус на ткань ретушь',
      'Поза 7: Динамичный шаг ретушь'
    ];
    let extra: Partial<ResultItem> = {
      images: mockImages
    };
    if (result.type === 'kit') {
      extra.videoUrl = '15-секундное видео (Ручная склейка кадров поддержки)';
    }

    handleUpdateResultStatus(result.id, 'ready', extra);
  };

  const handleWardrobeKitCreate = (newKit: WardrobeKit) => {
    setWardrobeKits([newKit, ...wardrobeKits]);
  };

  const handleDeleteItem = (itemId: string) => {
    setWardrobeItems(wardrobeItems.filter((x) => x.id !== itemId));
  };

  const handleDeleteKit = (kitId: string) => {
    setWardrobeKits(wardrobeKits.filter((x) => x.id !== kitId));
  };

  const handleToggleHideItem = (itemId: string) => {
    setWardrobeItems(
      wardrobeItems.map((itm) => {
        if (itm.id === itemId) {
          const nextStatus = itm.usageStatus === 'hidden' ? 'active' : 'hidden';
          return { ...itm, usageStatus: nextStatus };
        }
        return itm;
      })
    );
  };

  const handleToggleHideKit = (kitId: string) => {
    setWardrobeKits(
      wardrobeKits.map((kit) => {
        if (kit.id === kitId) {
          const nextStatus = kit.usageStatus === 'hidden' ? 'active' : 'hidden';
          return { ...kit, usageStatus: nextStatus };
        }
        return kit;
      })
    );
  };

  // ----------------------------------------
  // ROUTING RENDERER SWITCHER
  // ----------------------------------------
  const renderTabContent = () => {
    switch (currentTab) {
      case 'create':
        return (
          <CreatePage
            creditBalance={creditBalance}
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
            onCancelFlow={() => setActiveProductionFlow(null)}
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
            hasCredits={creditBalance >= 0.5}
          />
        );
      case 'results':
        return (
          <ResultsPage
            results={results}
            onUpdateResultStatus={handleUpdateResultStatus}
            onRefundCredit={handleRefundCredit}
            onManualFixComplete={handleManualFixComplete}
            onGrantCompensation={(typeChoice) => {
              const count = typeChoice === 'photo' ? 0.5 : 1.0;
              setCreditBalance((p) => p + count);
              addLedgerEntry('support_compensation', typeChoice, count, 'Ручное начисление компенсации');
            }}
            onConfirmSpendDirect={(res) => {
              handleUpdateResultStatus(res.id, 'ready');
            }}
            onStartWithLookId={(lookId, resultItem) => {
              let matchingLook = looks.find((l) => l.id === lookId);
              if (!matchingLook && resultItem) {
                matchingLook = looks.find((l) => l.name === resultItem.lookName);
              }
              
              const matchedModel = (matchingLook ? savedModels.find((m) => m.id === matchingLook.modelId) : null) || (resultItem ? savedModels.find((m) => m.name === resultItem.modelName) : null) || savedModels[0];
              const matchedKit = (matchingLook ? wardrobeKits.find((k) => k.id === matchingLook.kitId) : null) || (resultItem ? wardrobeKits.find((k) => k.name === resultItem.lookName || resultItem.name.includes(k.name)) : null) || wardrobeKits[0];
              
              const typeChoice: 'photo' | 'kit' = resultItem ? (resultItem.type as 'photo' | 'kit') : (creditBalance >= 1.0 ? 'kit' : 'photo');
              const finalLookName = matchingLook ? matchingLook.name : (resultItem ? resultItem.lookName : 'Новый образ');
              
              setActiveProductionFlow({
                id: `flow_fast_${Date.now()}`,
                type: typeChoice,
                currentStep: 3, // Starts with step 4: Location for high speed edits
                selectedModel: matchedModel,
                selectedKit: matchedKit,
                lookName: `${finalLookName} (Перезапуск)`,
                selectedLocation: resultItem?.location || 'Коста-дель-Соль',
                selectedPosePack: resultItem?.posePack || 'Классика',
                selectedVideoTemplate: resultItem?.videoTemplate,
                locationSettings: {
                  temperature: 'Теплый',
                  hardness: 'Мягкий',
                  intensity: 'Приглушенный'
                }
              });
              setCurrentTab('create');
            }}
          />
        );
      case 'tariffs':
        return (
          <TariffsPage
            creditBalance={creditBalance}
            reservedCredits={reservedCredits}
            ledger={creditLedger}
            addLedgerEntry={addLedgerEntry}
            incrementCredits={incrementCredits}
            onStartProduction={(typeChosen) => {
              handleStartFlow(typeChosen);
              setCurrentTab('create');
            }}
            onAdminAction={(action, amount, customEvent) => {
              if (action === 'add' && amount) {
                setCreditBalance((prev) => prev + amount);
                const eventType = customEvent || 'grant';
                const note = eventType === 'marketing_grant' 
                  ? 'Маркетинговые промо-кредиты (начисление)' 
                  : eventType === 'support_compensation'
                  ? 'Компенсация техподдержки за технический перезапуск'
                  : `Ручное начисление ${amount.toString().replace('.', ',')} кр. администратором`;
                addLedgerEntry(eventType, 'photo', amount, note);
              } else if (action === 'spend' && amount) {
                if (amount === creditBalance) {
                  setCreditBalance(0);
                  addLedgerEntry('support_hold', 'photo', creditBalance, 'Полное списание баланса администратором');
                } else {
                  setCreditBalance((prev) => Math.max(0, prev - amount));
                  addLedgerEntry('support_hold', 'photo', amount, `Ручное списание ${amount.toString().replace('.', ',')} кр. администратором`);
                }
              } else if (action === 'return_reserve') {
                if (reservedCredits > 0) {
                  setCreditBalance((prev) => prev + reservedCredits);
                  addLedgerEntry('reserve_release', 'photo', reservedCredits, `Возврат оставшегося резерва в объеме ${reservedCredits.toString().replace('.', ',')} кр.`);
                  setReservedCredits(0);
                }
              }
            }}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            userEmail={userEmail}
            creditBalance={creditBalance}
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
        creditBalance={creditBalance}
        reservedCredits={reservedCredits}
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

    </div>
  );
}
