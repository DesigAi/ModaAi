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
  const [photoCredits, setPhotoCredits] = useState<number>(() => {
    const saved = localStorage.getItem('modai_photo_credits');
    return saved ? parseInt(saved, 10) : 0; // Starts with 0 default, tester can add in tariffs
  });
  const [kitCredits, setKitCredits] = useState<number>(() => {
    const saved = localStorage.getItem('modai_kit_credits');
    return saved ? parseInt(saved, 10) : 0; // Starts with 0 default
  });
  const [reservedPhotoCredits, setReservedPhotoCredits] = useState<number>(() => {
    const saved = localStorage.getItem('modai_res_photo_credits');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [reservedKitCredits, setReservedKitCredits] = useState<number>(() => {
    const saved = localStorage.getItem('modai_res_kit_credits');
    return saved ? parseInt(saved, 10) : 0;
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
    localStorage.setItem('modai_photo_credits', photoCredits.toString());
    localStorage.setItem('modai_kit_credits', kitCredits.toString());
    localStorage.setItem('modai_res_photo_credits', reservedPhotoCredits.toString());
    localStorage.setItem('modai_res_kit_credits', reservedKitCredits.toString());
    localStorage.setItem('modai_models', JSON.stringify(savedModels));
    localStorage.setItem('modai_wardrobe_items', JSON.stringify(wardrobeItems));
    localStorage.setItem('modai_wardrobe_kits', JSON.stringify(wardrobeKits));
    localStorage.setItem('modai_looks', JSON.stringify(looks));
    localStorage.setItem('modai_results', JSON.stringify(results));
    localStorage.setItem('modai_ledger', JSON.stringify(creditLedger));
    localStorage.setItem('modai_active_flow', activeProductionFlow ? JSON.stringify(activeProductionFlow) : '');
  }, [
    isAuthenticated, userEmail, interfaceLanguage,
    photoCredits, kitCredits, reservedPhotoCredits, reservedKitCredits,
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
    setPhotoCredits(0);
    setKitCredits(0);
    setReservedPhotoCredits(0);
    setReservedKitCredits(0);
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
    if (type === 'photo') {
      setPhotoCredits((prev) => prev + count);
    } else {
      setKitCredits((prev) => prev + count);
    }
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
    const hasAnyCredits = photoCredits > 0 || kitCredits > 0;
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
    if (type === 'photo' && photoCredits < 1) {
      setShowInsufficientModal(true);
      return;
    }
    if (type === 'kit' && kitCredits < 1) {
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
      
      const typeChoice: 'photo' | 'kit' = kitCredits > 0 ? 'kit' : 'photo';
      onStartFlowWithPreset(typeChoice, defaultModel, defaultKit, 'Ускоренная съемка образов');
      return;
    }

    const matchedModel = savedModels.find((m) => m.id === look.modelId) || savedModels[0];
    const matchedKit = wardrobeKits.find((k) => k.id === look.kitId) || wardrobeKits[0];

    const typeChoice: 'photo' | 'kit' = kitCredits > 0 ? 'kit' : 'photo';
    onStartFlowWithPreset(typeChoice, matchedModel, matchedKit, look.name);
  };

  const onStartFlowWithPreset = (type: 'photo' | 'kit', model: Model, kit: WardrobeKit, lookName: string) => {
    if (type === 'photo' && photoCredits < 1) {
      setShowInsufficientModal(true);
      return;
    }
    if (type === 'kit' && kitCredits < 1) {
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

  // Final review checkout trigger launch!
  const handleLaunchProduction = (reserveType: 'photo' | 'kit') => {
    if (!activeProductionFlow || !activeProductionFlow.selectedModel || !activeProductionFlow.selectedKit) return;

    if (reserveType === 'photo') {
      if (photoCredits < 1) {
        alert('Недостаточно доступных фото-кредитов для запуска.');
        return;
      }
      setPhotoCredits((prev) => prev - 1);
      setReservedPhotoCredits((prev) => prev + 1);
      addLedgerEntry('reserve', 'photo', 1, `Блокировка 1 кр. под запуск "${activeProductionFlow.lookName}"`);
    } else {
      if (kitCredits < 1) {
        alert('Недостаточно доступных комплект-кредитов для запуска.');
        return;
      }
      setKitCredits((prev) => prev - 1);
      setReservedKitCredits((prev) => prev + 1);
      addLedgerEntry('reserve', 'kit', 1, `Блокировка 1 кр. под запуск "${activeProductionFlow.lookName}"`);
    }

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
            if (r.type === 'photo') {
              setReservedPhotoCredits((p) => Math.max(0, p - 1));
              addLedgerEntry('spend_confirmed', 'photo', 1, `Подтверждение списания 1 фото-кредита для пака "${r.name}"`);
            } else {
              setReservedKitCredits((k) => Math.max(0, k - 1));
              addLedgerEntry('spend_confirmed', 'kit', 1, `Подтверждение списания 1 комплект-кредита для пака "${r.name}"`);
            }
          }
          return nextItem;
        }
        return r;
      })
    );
  };

  const handleRefundCredit = (result: ResultItem) => {
    // Release reserve, return to cash balance
    if (result.type === 'photo') {
      setReservedPhotoCredits((p) => Math.max(0, p - 1));
      setPhotoCredits((p) => p + 1);
      addLedgerEntry('reserve_release', 'photo', 1, `Резерв снят: Возврат 1 фото-кредита за тикет "${result.name}"`);
    } else {
      setReservedKitCredits((k) => Math.max(0, k - 1));
      setKitCredits((k) => k + 1);
      addLedgerEntry('reserve_release', 'kit', 1, `Резерв снят: Возврат 1 комплект-кредита за тикет "${result.name}"`);
    }

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
            photoCredits={photoCredits}
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
            onCancelFlow={() => setActiveProductionFlow(null)}
          />
        );
      case 'looks':
        return (
          <LooksPage
            looks={looks}
            onStartProductionWithLook={handleStartProductionWithLook}
            onDeleteLook={handleDeleteLook}
            onNavigateToTariffs={() => setCurrentTab('tariffs')}
            hasCredits={photoCredits > 0 || kitCredits > 0}
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
              incrementCredits(typeChoice, 1);
              addLedgerEntry('support_compensation', typeChoice, 1, 'Ручное начисление компенсации');
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
              
              const typeChoice: 'photo' | 'kit' = resultItem ? (resultItem.type as 'photo' | 'kit') : (kitCredits > 0 ? 'kit' : 'photo');
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
            photoCredits={photoCredits}
            kitCredits={kitCredits}
            reservedPhotoCredits={reservedPhotoCredits}
            reservedKitCredits={reservedKitCredits}
            ledger={creditLedger}
            addLedgerEntry={addLedgerEntry}
            incrementCredits={incrementCredits}
            onStartProduction={(typeChosen) => {
              handleStartFlow(typeChosen);
              setCurrentTab('create');
            }}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            userEmail={userEmail}
            photoCredits={photoCredits}
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
    <div className="min-h-screen md:h-screen bg-[#F6F6F6] text-[#111111] flex flex-col md:flex-row font-sans overflow-x-hidden md:overflow-hidden">
      
      {/* Sidebar - responsive desktop drawer / collapses to rail on iPad limits */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        photoCredits={photoCredits}
        kitCredits={kitCredits}
        reservedPhotoCredits={reservedPhotoCredits}
        reservedKitCredits={reservedKitCredits}
        userEmail={userEmail}
        onLogout={handleLogout}
        onNewProductionClick={handleNewProductionClick}
      />

      {/* Main viewport Container space */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 md:h-full">
        
        {/* Mobile sticky top bar header header */}
        <div className="md:hidden bg-white border-b border-[#D7D7D7] p-4 flex items-center justify-between">
          <div>
            <span className="font-bold text-sm tracking-tight">ModAI Team</span>
            <span className="block text-[8px] font-mono text-neutral-400">MOBILE WORK cabinet</span>
          </div>
          
          <button
            onClick={handleNewProductionClick}
            className="bg-[#111111] text-white p-2 rounded-full"
            title="Новый продакшен"
          >
            <Camera size={15} />
          </button>
        </div>

        {/* Content switchboards nested rendering */}
        <div className="flex-1 overflow-y-auto">
          {renderTabContent()}
        </div>

        {/* Mobile Navigation fallback bar bottom */}
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#D7D7D7] grid grid-cols-5 text-center p-1.5 z-40 text-[10px]">
          <button
            onClick={() => setCurrentTab('create')}
            className={`flex flex-col items-center gap-0.5 py-1 ${currentTab === 'create' ? 'text-[#111111] font-bold' : 'text-neutral-400'}`}
          >
            <Sparkles size={16} />
            <span>Создать</span>
          </button>
          <button
            onClick={() => setCurrentTab('looks')}
            className={`flex flex-col items-center gap-0.5 py-1 ${currentTab === 'looks' ? 'text-[#111111] font-bold' : 'text-neutral-400'}`}
          >
            <Users size={16} />
            <span>Образы</span>
          </button>
          <button
            onClick={() => setCurrentTab('results')}
            className={`flex flex-col items-center gap-0.5 py-1 ${currentTab === 'results' ? 'text-[#111111] font-bold' : 'text-neutral-400'}`}
          >
            <LayoutGrid size={16} />
            <span>Результаты</span>
          </button>
          <button
            onClick={() => setCurrentTab('tariffs')}
            className={`flex flex-col items-center gap-0.5 py-1 ${currentTab === 'tariffs' ? 'text-[#111111] font-bold' : 'text-neutral-400'}`}
          >
            <Coins size={16} />
            <span>Тарифы</span>
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex flex-col items-center gap-0.5 py-1 ${currentTab === 'settings' ? 'text-[#111111] font-bold' : 'text-neutral-400'}`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
          <div className="bg-white border-2 border-[#111111] rounded-lg p-6 max-w-sm w-full space-y-4">
            <div className="text-center space-y-2">
              <AlertOctagon className="text-neutral-800 mx-auto" size={40} />
              <h3 className="text-lg font-bold">Сначала выберите тариф</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
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
                className="w-full bg-[#111111] hover:bg-neutral-800 text-white font-semibold text-xs py-2.5 rounded transition-colors text-center"
              >
                Смотреть доступные тарифы →
              </button>
              <button
                onClick={() => setShowAccessModal(false)}
                className="w-full border border-[#D7D7D7] hover:bg-neutral-100 text-[#111111] font-semibold text-xs py-2.5 rounded transition-colors text-center"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Insufficient Credits Modal */}
      {showInsufficientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
          <div className="bg-white border-2 border-[#111111] rounded-lg p-6 max-w-sm w-full space-y-4">
            <div className="text-center space-y-2">
              <AlertOctagon className="text-neutral-800 mx-auto" size={40} />
              <h3 className="text-lg font-bold">Недостаточно кредитов</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Для выбранного типа съемки у Вас на балансе нет подходящего типа кредита. Пожалуйста, пополните баланс в тарифах.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowInsufficientModal(false);
                  setCurrentTab('tariffs');
                }}
                className="w-full bg-[#111111] hover:bg-neutral-800 text-white font-semibold text-xs py-2.5 rounded transition-colors text-center"
              >
                Смотреть подходящие пакеты →
              </button>
              <button
                onClick={() => setShowInsufficientModal(false)}
                className="w-full border border-[#D7D7D7] hover:bg-neutral-100 text-[#111111] font-semibold text-xs py-2.5 rounded transition-colors text-center"
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
