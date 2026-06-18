import React, { useState } from 'react';
import { Model, WardrobeKit, WardrobeItem, ControlledLocationSettings, ActiveProductionFlow, Look } from '../types';
import { LOCATION_CATEGORIES, POSE_PACKS, VIDEO_TEMPLATES } from '../mockData';
import { Sparkles, Users, Shirt, MapPin, CheckCircle, Info, RefreshCw, Trash2, Sliders, AlertTriangle, Play, ChevronRight, Check, UploadCloud } from 'lucide-react';
import { formatCredits, formatCreditsWithLabel } from '../utils/creditFormatter';

interface CreatePageProps {
  creditBalance: number;
  savedModels: Model[];
  wardrobeItems: WardrobeItem[];
  wardrobeKits: WardrobeKit[];
  looks: Look[];
  activeFlow: ActiveProductionFlow | null;
  onStartFlow: (type: 'photo' | 'kit') => void;
  onStepChange: (step: number) => void;
  onUpdateFlowData: (data: Partial<ActiveProductionFlow>) => void;
  onSaveModel: (model: Model) => void;
  onSaveLook: (look: Look) => void;
  onLaunchProduction: (reserveType: 'photo' | 'kit') => void;
  onNavigateToTariffs: () => void;
  onCancelFlow?: () => void;
}

export default function CreatePage({
  creditBalance,
  savedModels,
  wardrobeItems,
  wardrobeKits,
  looks,
  activeFlow,
  onStartFlow,
  onStepChange,
  onUpdateFlowData,
  onSaveModel,
  onSaveLook,
  onLaunchProduction,
  onNavigateToTariffs,
  onCancelFlow
}: CreatePageProps) {

  // Step 1 states
  const [modelTab, setModelTab] = useState<'saved' | 'create'>('saved');
  const [newModelName, setNewModelName] = useState('');
  const [newModelGender, setNewModelGender] = useState<'Женский' | 'Мужской' | 'Унисекс'>('Женский');
  const [newModelAge, setNewModelAge] = useState<'18-22' | '23-28' | '30-35'>('23-28');
  const [newModelEthno, setNewModelEthno] = useState<'Европейский' | 'Азиатский' | 'Латино' | 'Афро' | 'Смешанный'>('Европейский');
  const [newModelBody, setNewModelBody] = useState<'Стройная' | 'Атлетичная' | 'Песочные часы' | 'Полная'>('Стройная');
  const [newModelSkin, setNewModelSkin] = useState('#E4C3AD');
  const [newModelNotes, setNewModelNotes] = useState('');
  const [previewGenerating, setPreviewGenerating] = useState(false);
  const [previewModel, setPreviewModel] = useState<Model | null>(null);
  const [previewAttempts, setPreviewAttempts] = useState(0);

  // Step 2 states
  const [wardrobeTab, setWardrobeTab] = useState<'upload' | 'select'>('upload');
  const [uploadSlots, setUploadSlots] = useState<{ [key: number]: WardrobeItem | null }>({
    1: null, // Перед
    2: null, // Зад
    3: null, // Деталь
    4: null, // Деталь
    5: null, // Деталь
    6: null, // Аксессуар
    7: null  // Аксессуар
  });
  const [uploadKitName, setUploadKitName] = useState('');
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadWarnings, setUploadWarnings] = useState<string[]>([]);

  // Step 4 state
  const [activeGeoCategory, setActiveGeoCategory] = useState('spain_street');

  // Multi attempt preview logic limit
  const handleGenerateModelPreview = () => {
    if (previewAttempts >= 3) {
      alert('Лимит попыток генерации preview (3 попытки) в этой сессии исчерпан.');
      return;
    }
    if (!newModelName.trim()) {
      alert('Пожалуйста, введите название или имя будущей модели.');
      return;
    }

    setPreviewGenerating(true);
    setTimeout(() => {
      const generated: Model = {
        id: `model_gen_${Date.now()}`,
        name: newModelName.trim(),
        gender: newModelGender,
        age: newModelAge,
        ethnotype: newModelEthno,
        bodyType: newModelBody,
        skinTone: newModelSkin,
        notes: newModelNotes.trim(),
        previewUrl: `Сгенерированный макет • ${newModelGender} • ${newModelAge} • ${newModelEthno}`,
        timestamp: Date.now()
      };
      setPreviewModel(generated);
      setPreviewGenerating(false);
      setPreviewAttempts(prev => prev + 1);
    }, 1200);
  };

  const selectGeneratedModel = () => {
    if (previewModel) {
      onSaveModel(previewModel);
      onUpdateFlowData({ selectedModel: previewModel });
      // Clear generated view state
      setPreviewModel(null);
      setNewModelName('');
      setNewModelNotes('');
      // Move to Step 2
      onStepChange(1);
    }
  };

  // Upload slots simulated handlers
  const handleSimulateUploadSlot = (slotIndex: number) => {
    const slotNames = {
      1: 'Передний вид платья',
      2: 'Вид сзади / Спина платья',
      3: 'Деталь кроя воротника',
      4: 'Деталь манжета / Рукав',
      5: 'Боковой ракурс',
      6: 'Декоративная цепочка',
      7: 'Поясной кожаный ремень'
    };
    
    const randomItem: WardrobeItem = {
      id: `itm_${slotIndex}_${Date.now()}`,
      name: (slotNames as any)[slotIndex],
      category: 'dress',
      classification: slotIndex > 5 ? 'accessory item' : 'product item',
      imageSrc: `Снимок ракурса #${slotIndex}`,
      sideType: slotIndex === 1 ? 'front' : slotIndex === 2 ? 'back' : slotIndex > 5 ? 'accessory' : 'detail',
      usageStatus: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const nextSlots = { ...uploadSlots, [slotIndex]: randomItem };
    setUploadSlots(nextSlots);

    // Dynamic warnings based on slot states
    const warns: string[] = [];
    if (!nextSlots[1]) warns.push('Рекомендуется загрузить фронтальный ракурс (Слот 1: "Перед")');
    if (!nextSlots[2]) warns.push('Рекомендуется загрузить спину одежды (Слот 2: "Зад")');
    setUploadWarnings(warns);
  };

  const clearSlot = (slotIndex: number) => {
    const nextSlots = { ...uploadSlots, [slotIndex]: null };
    setUploadSlots(nextSlots);
    const warns: string[] = [];
    if (!nextSlots[1]) warns.push('Рекомендуется загрузить фронтальный ракурс (Слот 1: "Перед")');
    if (!nextSlots[2]) warns.push('Рекомендуется загрузить спину одежды (Слот 2: "Зад")');
    setUploadWarnings(warns);
  };

  const handleSaveUploadedKit = () => {
    const uploadedItems = Object.values(uploadSlots).filter(Boolean) as WardrobeItem[];
    if (uploadedItems.length < 2) {
      alert('Гардеробный комплект должен состоять минимум из 2 фотографий одежды.');
      return;
    }
    const finalKitName = uploadKitName.trim() || `Комплект одежды от ${new Date().toLocaleDateString()}`;

    const newKit: WardrobeKit = {
      id: `kit_upload_${Date.now()}`,
      name: finalKitName,
      items: uploadedItems,
      usageStatus: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onUpdateFlowData({ selectedKit: newKit, lookName: `Образ с "${finalKitName}"` });
    // Reset local slots
    setUploadSlots({ 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null });
    setUploadKitName('');
    onStepChange(2); // Look step
  };

  // Step 3 creation Look
  const handleConfirmLook = () => {
    if (!activeFlow?.selectedModel || !activeFlow?.selectedKit) return;
    
    const finalLookName = activeFlow.lookName.trim() || `Образ ${activeFlow.selectedModel.name} - ${activeFlow.selectedKit.name}`;
    
    const newLook: Look = {
      id: `look_${Date.now()}`,
      name: finalLookName,
      modelId: activeFlow.selectedModel.id,
      modelName: activeFlow.selectedModel.name,
      kitId: activeFlow.selectedKit.id,
      kitName: activeFlow.selectedKit.name,
      previewUrl: `${activeFlow.selectedModel.name} в "${activeFlow.selectedKit.name}"`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onSaveLook(newLook);
    onUpdateFlowData({ lookName: finalLookName, lookId: newLook.id });
    onStepChange(3); // Geo step
  };

  const handleControlledSettingsReset = () => {
    onUpdateFlowData({
      locationSettings: {
        temperature: 'Теплый',
        hardness: 'Мягкий',
        intensity: 'Приглушенный'
      }
    });
  };

  const getMissingItemsList = () => {
    const missing: string[] = [];
    if (!activeFlow?.selectedModel) missing.push('Модель не выбрана');
    if (!activeFlow?.selectedKit) missing.push('Одежда не добавлена');
    if (activeFlow?.currentStep && activeFlow.currentStep >= 3) {
      if (!activeFlow?.selectedLocation) missing.push('Локация не выбрана');
    }
    if (activeFlow?.currentStep && activeFlow.currentStep >= 4) {
      if (!activeFlow?.selectedPosePack) missing.push('Направление поз не выбрано');
    }
    if (activeFlow?.type === 'kit' && activeFlow?.currentStep && activeFlow.currentStep >= 5) {
      if (!activeFlow?.selectedVideoTemplate) missing.push('Видео-шаблон не выбран');
    }
    return missing;
  };

  if (!activeFlow) {
    // Zero-state choice of flow
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8 font-sans text-[#F8F8F8]">
        <div className="text-center py-10 max-w-2xl mx-auto space-y-3">
          <h1 className="text-2xl font-display font-medium tracking-tight text-[#F8F8F8]">Создать AI-продакшен</h1>
          <p className="text-sm text-[#8B8B93]">
            Для запуска съемок выберите подходящий формат в зависимости от доступных у вас кредитов.
          </p>
        </div>

        {creditBalance < 0.5 ? (
          <div className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-8 text-center max-w-md mx-auto space-y-4">
            <h3 className="text-sm font-semibold text-[#F8F8F8]">У вас пока нет активных кредитов.</h3>
            <p className="text-xs text-[#8B8B93] leading-relaxed font-sans">
              Посетите раздел тарифов, чтобы выбрать подходящий съемочный пакет и провести оплату.
            </p>
            <div className="pt-2">
              <button
                onClick={onNavigateToTariffs}
                className="h-[40px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] font-sans font-semibold text-sm px-5 rounded-[6px] flex items-center justify-center transition-all select-none active:translate-y-[1px] cursor-pointer"
              >
                Посмотреть тарифы
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Choose 7 photos */}
            <div className="bg-[#0F0F11] border-2 border-[rgba(255,255,255,0.08)] hover:border-[#C9A35F] rounded-[12px] p-6 space-y-6 flex flex-col justify-between transition-all">
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <h3 className="text-md font-display font-medium text-[#F8F8F8]">Пакет на 7 фотографий</h3>
                  <span className="text-[10px] font-mono bg-[rgba(201,163,95,0.12)] text-[#C9A35F] py-1 px-2.5 rounded-[4px] font-bold border border-[rgba(201,163,95,0.2)]">
                    0,5 кредита
                  </span>
                </div>
                <p className="text-xs text-[#8B8B93] leading-relaxed font-sans">
                  Полноценная фотосессия для одного SKU на выбранной модели. Вы получаете 7 разноплановых кадров с высокой детализацией. Видео не входит.
                </p>
                <div className="bg-[#16161A] p-3.5 border border-[rgba(255,255,255,0.05)] rounded-[8px] text-xs space-y-1.5 text-[#B5B5BC] font-sans">
                  <div>• Результат: <strong className="text-[#F8F8F8]">7 готовых кадров в ZIP</strong></div>
                  <div>• Локация и свет: <strong className="text-[#F8F8F8]">Контролируемые</strong></div>
                </div>
              </div>
              <button
                disabled={creditBalance < 0.5}
                onClick={() => onStartFlow('photo')}
                className="w-full h-[40px] bg-[#C9A35F] disabled:bg-[#1A1A1D] disabled:text-[#8B8B93] disabled:border-transparent hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] font-sans font-semibold text-sm rounded-[6px] flex items-center justify-center transition-all mt-4 select-none active:translate-y-[1px] cursor-pointer"
              >
                {creditBalance >= 0.5 ? 'Запустить съемку (7 фото)' : 'Недостаточно кредитов'}
              </button>
            </div>

            {/* Choose kit (Photos + Video) */}
            <div className="bg-[#0F0F11] border-2 border-[rgba(255,255,255,0.08)] hover:border-[#C9A35F] rounded-[12px] p-6 space-y-6 flex flex-col justify-between transition-all">
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <h3 className="text-md font-display font-medium text-[#F8F8F8]">Production-комплект</h3>
                  <span className="text-[10px] font-mono bg-[rgba(255,255,255,0.08)] text-[#F8F8F8] py-1 px-2.5 rounded-[4px] font-bold border border-[rgba(255,255,255,0.12)]">
                    1 кредит
                  </span>
                </div>
                <p className="text-xs text-[#8B8B93] leading-relaxed font-sans">
                  Полная фотосессия (7 снимков) плюс одно 15-секундное готовое вертикальное промо-видео (9:16). Идеально закрывает карточки маркетплейсов и социальные медиа за один клик.
                </p>
                <div className="bg-[#16161A] p-3.5 border border-[rgba(255,255,255,0.05)] rounded-[8px] text-xs space-y-1.5 text-[#B5B5BC] font-sans">
                  <div>• Результат: <strong className="text-[#F8F8F8]">7 кадров + 1 видеоролик</strong></div>
                  <div>• Шаблон видео: <strong className="text-[#F8F8F8]">Интегрированный</strong></div>
                </div>
              </div>
              <button
                disabled={creditBalance < 1}
                onClick={() => onStartFlow('kit')}
                className="w-full h-[40px] bg-[#C9A35F] disabled:bg-[#1A1A1D] disabled:text-[#8B8B93] disabled:border-transparent hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] font-sans font-semibold text-sm rounded-[6px] flex items-center justify-center transition-all mt-4 select-none active:translate-y-[1px] cursor-pointer"
              >
                {creditBalance >= 1 ? 'Запустить комплект (Фото + Видео)' : 'Недостаточно кредитов'}
              </button>
            </div>

          </div>
        )}
      </div>
    );
  }

  // Active Wizard Stepper Details
  const isKit = activeFlow.type === 'kit';
  const stepperSteps = [
    { label: 'Модель', icon: Users },
    { label: 'Гардероб', icon: Shirt },
    { label: 'Образ', icon: Sparkles },
    { label: 'Локация', icon: MapPin },
    { label: 'Позы', icon: Sliders },
    ...(isKit ? [{ label: 'Видео', icon: Play }] : []),
    { label: 'Проверка', icon: CheckCircle }
  ];

  const currentStepIndex = activeFlow.currentStep;

  return (
    <div className="h-full flex flex-col md:flex-row font-sans text-[#F8F8F8] select-none">
      
      {/* 2. Middle Editor Content Area */}
      <div className="flex-1 p-6 pb-28 md:pb-24 bg-[#050505] overflow-y-auto min-w-0 border-r border-[rgba(255,255,255,0.08)]">
        
        {/* Top Stepper Area (Above main headers) */}
        <div className="mb-6 pb-5 border-b border-[rgba(255,255,255,0.08)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {onCancelFlow && (
              <button
                onClick={onCancelFlow}
                id="back_to_formats_btn"
                className="flex items-center gap-2 text-xs text-[#F8F8F8] font-bold transition-all py-1.5 px-3.5 rounded-[6px] border border-[rgba(255,255,255,0.12)] hover:border-[#C9A35F] bg-[#16161A] select-none whitespace-nowrap self-start cursor-pointer"
              >
                <span>← Назад к выбору</span>
              </button>
            )}

            {/* Stepper Steps Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-6 px-6 sm:mx-0 sm:px-0 scrollbar-none w-full sm:w-auto">
              {stepperSteps.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                const isCompleted = idx < currentStepIndex;
                return (
                  <button
                    key={step.label}
                    disabled={idx > currentStepIndex && getMissingItemsList().length > 0}
                    onClick={() => onStepChange(idx)}
                    className={`flex items-center gap-2 text-left text-xs font-semibold py-1.5 px-3 rounded-[6px] border select-none transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#C9A35F] text-[#050505] border-[#C9A35F]' 
                        : isCompleted 
                          ? 'text-[#F8F8F8] bg-[#16161A] border-[rgba(255,255,255,0.12)] hover:border-[#C9A35F]' 
                          : 'text-[#8B8B93] border-[rgba(255,255,255,0.05)] pointer-events-none'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9px] leading-none ${isActive ? 'bg-[#050505] text-[#C9A35F]' : isCompleted ? 'bg-[rgba(201,163,95,0.12)] text-[#C9A35F]' : 'bg-[#1A1A1D] text-[#8B8B93]'}`}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span className="whitespace-nowrap">{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Step 1: Model Choice */}
        {currentStepIndex === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-display font-medium text-[#F8F8F8]">Шаг 1: Выберите AI-модель</h2>
              <p className="text-xs text-[#8B8B93] mt-0.5">
                Используйте сохраненных манекенщиц из вашей базы или сгенерируйте новые параметры лица и расы.
              </p>
            </div>

            {/* Tab switchers */}
            <div className="flex gap-1 bg-[#16161A] rounded-[8px] p-1 text-xs max-w-xs">
              <button
                onClick={() => setModelTab('saved')}
                className={`flex-1 py-1.5 px-3 rounded-[6px] transition-all cursor-pointer ${modelTab === 'saved' ? 'bg-[#1D1D21] text-[#C9A35F] font-semibold' : 'text-[#8B8B93]'}`}
              >
                Сохраненные модели
              </button>
              <button
                onClick={() => setModelTab('create')}
                className={`flex-1 py-1.5 px-3 rounded-[6px] transition-all cursor-pointer ${modelTab === 'create' ? 'bg-[#1D1D21] text-[#C9A35F] font-semibold' : 'text-[#8B8B93]'}`}
              >
                Сгенерировать новую
              </button>
            </div>

            {modelTab === 'saved' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedModels.map((model) => (
                    <div
                      key={model.id}
                      className={`border p-4 rounded-[8px] space-y-3 cursor-pointer transition-all bg-[#0F0F11] ${activeFlow.selectedModel?.id === model.id ? 'border-[#C9A35F] bg-[rgba(201,163,95,0.04)]' : 'border-[rgba(255,255,255,0.08)] hover:border-white'}`}
                      onClick={() => onUpdateFlowData({ selectedModel: model })}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-[#8B8B93]">ID: {model.id}</span>
                        {activeFlow.selectedModel?.id === model.id && (
                          <span className="text-[9px] bg-[#C9A35F] text-[#050505] px-2 py-0.5 rounded font-bold uppercase font-sans">Выбрана</span>
                        )}
                      </div>
                      <div className="aspect-[4/3] bg-[#16161A] rounded-[6px] border border-[rgba(255,255,255,0.05)] flex items-center justify-center font-mono text-center text-[10px] text-[#8B8B93] p-2">
                        {model.previewUrl}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#F8F8F8]">{model.name}</h4>
                        <div className="text-[11px] text-[#8B8B93] flex flex-wrap gap-x-2 mt-1 font-sans">
                          <span>{model.gender} • {model.age} • {model.ethnotype} • {model.bodyType}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {savedModels.length === 0 && (
                  <p className="text-xs text-[#8B8B93] italic font-sans py-4">Сохраненных моделей нет. Сгенерируйте новую.</p>
                )}
                

              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start border border-[rgba(255,255,255,0.08)] p-5 rounded-[12px] bg-[#0F0F11]">
                {/* Form parameters creators */}
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[#B5B5BC] font-semibold mb-1">Имя или ярлык новой модели</label>
                    <input
                      type="text"
                      placeholder="Например: Кристина С."
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      className="w-full bg-[#16161A] border border-[rgba(255,255,255,0.08)] focus:border-[#C9A35F] focus:outline-none rounded-[6px] p-2.5 text-xs text-[#F8F8F8]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[#B5B5BC] font-semibold mb-1">Пол</label>
                      <select
                        value={newModelGender}
                        onChange={(e: any) => setNewModelGender(e.target.value)}
                        className="w-full bg-[#16161A] text-[#F8F8F8] border border-[rgba(255,255,255,0.08)] focus:border-[#C9A35F] rounded-[6px] p-2 text-xs"
                      >
                        <option value="Женский">Женский</option>
                        <option value="Мужской">Мужской</option>
                        <option value="Унисекс">Унисекс</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#B5B5BC] font-semibold mb-1">Возрастной диапазон</label>
                      <select
                        value={newModelAge}
                        onChange={(e: any) => setNewModelAge(e.target.value)}
                        className="w-full bg-[#16161A] text-[#F8F8F8] border border-[rgba(255,255,255,0.08)] focus:border-[#C9A35F] rounded-[6px] p-2 text-xs"
                      >
                        <option value="18-22">18-22</option>
                        <option value="23-28">23-28</option>
                        <option value="30-35">30-35</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[#B5B5BC] font-semibold mb-1">Этнотип</label>
                      <select
                        value={newModelEthno}
                        onChange={(e: any) => setNewModelEthno(e.target.value)}
                        className="w-full bg-[#16161A] text-[#F8F8F8] border border-[rgba(255,255,255,0.08)] focus:border-[#C9A35F] rounded-[6px] p-2 text-xs"
                      >
                        <option value="Европейский">Европейский</option>
                        <option value="Азиатский">Азиатский</option>
                        <option value="Латино">Латино</option>
                        <option value="Афро">Афро</option>
                        <option value="Смешанный">Смешанный</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#B5B5BC] font-semibold mb-1">Комплекция тела</label>
                      <select
                        value={newModelBody}
                        onChange={(e: any) => setNewModelBody(e.target.value)}
                        className="w-full bg-[#16161A] text-[#F8F8F8] border border-[rgba(255,255,255,0.08)] focus:border-[#C9A35F] rounded-[6px] p-2 text-xs"
                      >
                        <option value="Стройная">Стройная</option>
                        <option value="Атлетичная">Атлетичная</option>
                        <option value="Песочные часы">Песочные часы</option>
                        <option value="Полная">Полная</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#B5B5BC] font-semibold mb-1">Заметки и уточнения по лицу / волосам</label>
                    <textarea
                      placeholder="Темно-русые волосы до плеч, карие глаза..."
                      value={newModelNotes}
                      onChange={(e) => setNewModelNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-[#16161A] border border-[rgba(255,255,255,0.08)] focus:border-[#C9A35F] focus:outline-none rounded-[6px] p-2.5 text-xs text-[#F8F8F8]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.08)]">
                    <span className="text-[10px] text-[#8B8B93] font-mono">Баланс preview: {previewAttempts} / 3 попыток</span>
                    <button
                      type="button"
                      onClick={handleGenerateModelPreview}
                      disabled={previewGenerating || previewAttempts >= 3}
                      className="bg-[#C9A35F] hover:bg-[#D4B474] disabled:bg-[#1A1A1D] disabled:text-[#8B8B93] text-[#050505] font-semibold px-4 py-2 rounded-[6px] transition-colors cursor-pointer"
                    >
                      {previewGenerating ? 'Создание макета...' : 'Сгенерировать preview'}
                    </button>
                  </div>
                </div>

                {/* Preview Box Response Area */}
                <div className="space-y-4">
                  <span className="block text-xs font-bold text-[#8B8B93] uppercase tracking-wider">Сгенерированный preview-макет</span>
                  {previewModel ? (
                    <div className="bg-[#16161A] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-4 text-center space-y-4">
                      
                      <div className="aspect-[3/4] bg-[#0F0F11] border border-[rgba(255,255,255,0.05)] rounded-[6px] flex flex-col items-center justify-center p-4 relative text-[#8B8B93]">
                        <div className="w-16 h-16 border border-[rgba(255,255,255,0.12)] bg-[#16161A] text-[#C9A35F] rounded-full flex items-center justify-center text-xs font-mono font-bold leading-none">
                          {previewModel.gender[0]}
                        </div>
                        <span className="text-xs font-semibold mt-4 text-[#F8F8F8]">{previewModel.name}</span>
                        <span className="text-[10px] font-mono mt-1 text-[#8B8B93] leading-normal block max-w-xs">
                          {previewModel.previewUrl}
                        </span>
                      </div>

                      <div className="space-y-2 pt-1">
                        <button
                          onClick={selectGeneratedModel}
                          className="w-full bg-[#C9A35F] hover:bg-[#D4B474] text-[#050505] font-semibold text-xs py-2 rounded-[6px] cursor-pointer"
                        >
                          Утвердить эту модель
                        </button>
                        <button
                          onClick={handleGenerateModelPreview}
                          className="w-full border border-[rgba(255,255,255,0.12)] hover:bg-[#16161A] text-xs py-2 rounded-[6px] text-[#B5B5BC] cursor-pointer transition-colors"
                        >
                          Перегенерировать (Попытка {previewAttempts + 1} из 3)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 border border-dashed border-[rgba(255,255,255,0.12)] rounded-[8px] flex flex-col items-center justify-center text-center p-4 text-[#8B8B93] text-xs">
                      <Users size={20} className="mb-2 text-[#8B8B93]" />
                      <span>Параметры модели укомплектованы. Нажмите "Сгенерировать preview", чтобы увидеть макет.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Wardrobe Clothes Slots Grid */}
        {currentStepIndex === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-display font-medium text-[#F8F8F8]">Шаг 2: Гардероб и комплект одежды</h2>
              <p className="text-xs text-[#8B8B93] mt-0.5">
                Загрузите референсные фотографии вещей в специальные слоты для анализа масок (минимум 2 кадра).
              </p>
            </div>

            <div className="flex gap-1 bg-[#16161A] rounded-[8px] p-1 text-xs max-w-xs">
              <button
                onClick={() => setWardrobeTab('upload')}
                className={`flex-1 py-1.5 px-3 rounded-[6px] transition-all cursor-pointer ${wardrobeTab === 'upload' ? 'bg-[#1D1D21] text-[#C9A35F] font-semibold' : 'text-[#8B8B93]'}`}
              >
                Загрузить вещи
              </button>
              <button
                onClick={() => setWardrobeTab('select')}
                className={`flex-1 py-1.5 px-3 rounded-[6px] transition-all cursor-pointer ${wardrobeTab === 'select' ? 'bg-[#1D1D21] text-[#C9A35F] font-semibold' : 'text-[#8B8B93]'}`}
              >
                База гардероба
              </button>
            </div>

            {wardrobeTab === 'upload' ? (
              <div className="space-y-6 border border-[rgba(255,255,255,0.08)] p-5 rounded-[12px] bg-[#0F0F11]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#8B8B93]">
                    Слоты классификации одежды
                  </span>
                  <span className="font-mono text-[#F8F8F8]">
                    Загружено: {Object.values(uploadSlots).filter(Boolean).length} / 7
                  </span>
                </div>

                {/* Slots grids */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { id: 1, label: 'Перед', desc: 'фронт одежды' },
                    { id: 2, label: 'Зад', desc: 'спина' },
                    { id: 3, label: 'Деталь', desc: 'воротник' },
                    { id: 4, label: 'Деталь', desc: 'рукав' },
                    { id: 5, label: 'Деталь', desc: 'карман' },
                    { id: 6, label: 'Аксессуар', desc: 'очки' },
                    { id: 7, label: 'Аксессуар', desc: 'сумка' }
                  ].map((slot) => {
                    const file = uploadSlots[slot.id];
                    return (
                      <div
                        key={slot.id}
                        className={`aspect-[3/4] border rounded-[8px] p-2.5 flex flex-col justify-between text-center relative overflow-hidden transition-all ${file ? 'bg-[#16161A] border-[#C9A35F]' : 'bg-[#16161A] border-dashed border-[rgba(255,255,255,0.08)] hover:border-white'}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#8B8B93]">{slot.label}</span>
                          {file && (
                            <button
                              onClick={() => clearSlot(slot.id)}
                              className="text-[#C97878] hover:text-red-400 text-[10px] cursor-pointer font-bold"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {file ? (
                          <div className="flex-1 flex flex-col justify-center items-center p-1 text-center">
                            <Shirt size={14} className="text-[#C9A35F] mb-1" />
                            <span className="text-[10px] font-mono leading-none break-all text-[#B5B5BC]">{file.name}</span>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleSimulateUploadSlot(slot.id)}
                            className="flex-grow flex flex-col justify-center items-center cursor-pointer p-1 text-[#8B8B93] group"
                          >
                            <UploadCloud size={16} className="text-[#8B8B93] group-hover:scale-115 transition-transform group-hover:text-[#C9A35F]" />
                            <span className="text-[8px] mt-1.5 font-mono">{slot.desc}</span>
                          </div>
                        )}
                        
                        <span className="text-[9px] text-[#8B8B93] font-mono italic block">Слот {slot.id}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Multi item inline validator summaries */}
                {Object.values(uploadSlots).filter(Boolean).length > 0 && (
                  <div className="p-3.5 bg-[#16161A] border border-[rgba(255,255,255,0.08)] rounded-[8px] text-xs space-y-1.5 font-sans leading-relaxed">
                    <span className="font-bold text-[#C9A35F] tracking-wider uppercase text-[10px] block font-sans">Проверка совмещений ModAI:</span>
                    
                    {!uploadSlots[1] && (
                      <p className="text-[#C97878] flex items-center gap-1.5 font-sans">
                        ⚠️ <strong>Внимание: Слот 1 пуст.</strong> Передний ракурс необходим для усадки силуэта платья.
                      </p>
                    )}
                    {!uploadSlots[2] && (
                      <p className="text-[#C97878] flex items-center gap-1.5 font-sans">
                        ⚠️ <strong>Предупреждение: Слот 2 пуст.</strong> Спецификация спины будет смоделирована ИИ приближенно.
                      </p>
                    )}
                    {Object.values(uploadSlots).filter(Boolean).length >= 2 && uploadSlots[1] && (
                      <p className="text-[#78A98A] font-semibold flex items-center gap-1.5 font-sans">
                        ✓ Лимиты соблюдены. Вы можете продолжить упаковку комплекта одежды.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3 pt-3 border-t border-[rgba(255,255,255,0.08)] font-sans">
                  <div>
                    <label className="block text-xs font-semibold text-[#B5B5BC] mb-1.5">
                      Дайте название этому комплекту одежды
                    </label>
                    <input
                      type="text"
                      placeholder="Например: Осеннее серое шерстяное пальто с шарфом"
                      value={uploadKitName}
                      onChange={(e) => setUploadKitName(e.target.value)}
                      className="w-full bg-[#16161A] border border-[rgba(255,255,255,0.08)] focus:border-[#C9A35F] focus:outline-none rounded-[6px] p-2.5 text-xs text-[#F8F8F8]"
                    />
                  </div>


                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wardrobeKits.map((kit) => (
                    <div
                      key={kit.id}
                      className={`border p-4 rounded-[8px] bg-[#0F0F11] space-y-3 cursor-pointer transition-all ${activeFlow.selectedKit?.id === kit.id ? 'border-[#C9A35F] bg-[rgba(201,163,95,0.04)]' : 'border-[rgba(255,255,255,0.08)] hover:border-white'}`}
                      onClick={() => onUpdateFlowData({ selectedKit: kit, lookName: `Образ с "${kit.name}"` })}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-[#8B8B93]">ID: {kit.id}</span>
                        {activeFlow.selectedKit?.id === kit.id && (
                          <span className="text-[9px] bg-[#C9A35F] text-[#050505] px-2 py-0.5 rounded font-bold uppercase">Выбран</span>
                        )}
                      </div>
                      
                      {/* Grid representation */}
                      <div className="grid grid-cols-4 gap-1.5 bg-[#16161A] p-2 rounded-[6px]">
                        {kit.items.map((i, idx) => (
                          <div key={idx} className="aspect-square bg-[#1D1D21] border border-[rgba(255,255,255,0.05)] text-[#C9A35F] rounded flex items-center justify-center text-[9px] font-mono p-1">
                            {i.sideType[0].toUpperCase()}
                          </div>
                        ))}
                      </div>

                      <h4 className="text-sm font-semibold text-[#F8F8F8]">{kit.name}</h4>
                      <p className="text-[10px] text-[#8B8B93] uppercase font-mono">Содержит вещей: {kit.items.length}</p>
                    </div>
                  ))}
                </div>

                {wardrobeKits.length === 0 && (
                  <p className="text-xs text-[#8B8B93] italic font-sans py-4">База пуста. Попробуйте вкладку "Загрузить вещи".</p>
                )}


              </div>
            )}
          </div>
        )}

        {/* Step 3: Dressed Model Look Card */}
        {currentStepIndex === 2 && (
          <div className="space-y-6 font-sans">
            <div>
              <h2 className="text-lg font-display font-medium text-[#F8F8F8]">Шаг 3: Согласование Образа (Look)</h2>
              <p className="text-xs text-[#8B8B93] mt-0.5">
                Образ соединяет макет выбранной модели и усадку комплекта вещей в единый черновик.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-[rgba(255,255,255,0.08)] p-5 rounded-[12px] bg-[#0F0F11] text-xs">
              <div className="space-y-4">
                <div>
                  <label className="block text-[#B5B5BC] font-semibold mb-1.5">
                    Задайте название Образа для истории (Look Name)
                  </label>
                  <input
                    type="text"
                    value={activeFlow.lookName}
                    onChange={(e) => onUpdateFlowData({ lookName: e.target.value })}
                    className="w-full bg-[#16161A] border border-[rgba(255,255,255,0.08)] focus:border-[#C9A35F] focus:outline-none rounded-[6px] p-2.5 text-xs text-[#F8F8F8] font-semibold"
                  />
                </div>

                <div className="p-4 bg-[#16161A] border border-[rgba(255,255,255,0.08)] rounded-[8px] space-y-2.5">
                  <span className="block text-[9px] uppercase font-bold tracking-wider text-[#8B8B93]">Технологический паспорт образа</span>
                  <div className="flex justify-between items-center text-[#B5B5BC]">
                    <span className="text-[#8B8B93]">AI Модель:</span>
                    <span className="font-semibold text-[#F8F8F8]">{activeFlow.selectedModel?.name} ({activeFlow.selectedModel?.gender})</span>
                  </div>
                  <div className="flex justify-between items-center text-[#B5B5BC]">
                    <span className="text-[#8B8B93]">Одежда каталога:</span>
                    <span className="font-semibold text-[#F8F8F8] block max-w-[150px] truncate">{activeFlow.selectedKit?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#B5B5BC]">
                    <span className="text-[#8B8B93]">Слоты ракурсов:</span>
                    <span className="font-mono font-semibold text-[#C9A35F]">{activeFlow.selectedKit?.items.length} фото вещей</span>
                  </div>
                </div>


              </div>

              {/* Look Preview Wireframe Display */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-[#8B8B93] uppercase tracking-wider">Макет слияния (Wireframe)</span>
                
                <div className="aspect-[4/3] bg-[#16161A] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="w-14 h-14 border border-[rgba(255,255,255,0.12)] bg-[#1D1D21] text-[#C9A35F] rounded-full text-xs font-mono font-bold flex items-center justify-center">
                    O
                  </div>
                  <div className="w-24 h-12 border border-dashed border-[#C9A35F] bg-[rgba(201,163,95,0.04)] rounded flex items-center justify-center font-mono font-bold text-[10px] text-[#C9A35F] mt-3 uppercase tracking-wider">
                    [Маска силуэта]
                  </div>

                  <span className="text-[10px] text-[#8B8B93] mt-3 font-mono">
                    Слияние: {activeFlow.selectedModel?.name} + {activeFlow.selectedKit?.name}
                  </span>
                  
                  <div className="absolute inset-x-0 bottom-0 bg-[#1D1D21] py-1 border-t border-[rgba(255,255,255,0.05)] text-[9px] font-mono font-bold tracking-wider text-[#C9A35F] text-center uppercase">
                    Образ готов к съемке
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Predefined Location & Controlled Light parameters */}
        {currentStepIndex === 3 && (
          <div className="space-y-6 font-sans">
            <div>
              <h2 className="text-lg font-display font-medium text-[#F8F8F8]">Шаг 4: Выберите локацию и освещение</h2>
              <p className="text-xs text-[#8B8B93] mt-0.5">
                Используйте предустановленные испанские пейзажи или минималистичные интерьеры для сопряжения кожи модели со светом.
              </p>
            </div>

            {/* Segmented geography tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-[rgba(255,255,255,0.08)] pb-2 text-xs">
              {LOCATION_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveGeoCategory(cat.id)}
                  className={`px-3 py-1.5 border rounded-full transition-all cursor-pointer ${activeGeoCategory === cat.id ? 'bg-[#C9A35F] text-[#050505] border-[#C9A35F] font-semibold' : 'bg-[#16161A] border-[rgba(255,255,255,0.08)] text-[#8B8B93] hover:text-[#F8F8F8]'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Predefined cards list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {LOCATION_CATEGORIES.find((x) => x.id === activeGeoCategory)?.locations.map((loc, idx) => {
                const descs = LOCATION_CATEGORIES.find((x) => x.id === activeGeoCategory)?.descriptions || [];
                const isSelected = activeFlow.selectedLocation === loc;
                return (
                  <div
                    key={loc}
                    onClick={() => onUpdateFlowData({ selectedLocation: loc })}
                    className={`border p-4 rounded-[8px] space-y-3 cursor-pointer transition-all bg-[#0F0F11] ${isSelected ? 'border-[#C9A35F] bg-[rgba(201,163,95,0.04)]' : 'border-[rgba(255,255,255,0.08)] hover:border-white'}`}
                  >
                    <div className="aspect-[4/3] bg-[#16161A] border border-[rgba(255,255,255,0.05)] rounded-[6px] flex items-center justify-center p-2 relative overflow-hidden">
                      <MapPin size={16} className="text-[#C9A35F]" />
                      <span className="text-[10px] font-mono font-semibold text-[#8B8B93] uppercase ml-1.5 truncate">{loc}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#F8F8F8]">{loc}</h4>
                      <p className="text-[11px] text-[#8B8B93] leading-normal font-sans mt-1.5">{descs[idx]}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Controlled visual parameters lighting */}
            <div className="border border-[rgba(255,255,255,0.08)] p-4 rounded-[8px] bg-[#0F0F11] text-xs space-y-4">
              <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.08)] pb-2.5">
                <span className="font-bold uppercase tracking-wider text-[#8B8B93] text-[10px]">
                  Управляемое освещение (Controlled Lighting)
                </span>
                <button
                  onClick={handleControlledSettingsReset}
                  className="text-[#C9A35F] hover:text-[#D4B474] text-[10px] font-semibold underline uppercase cursor-pointer"
                >
                  Сбросить к дефолту
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Temp */}
                <div className="space-y-1.5">
                  <span className="text-[#8B8B93] font-medium">Цветовой тон:</span>
                  <div className="flex gap-1 bg-[#16161A] border border-[rgba(255,255,255,0.08)] rounded-[6px] p-1">
                    {['Теплый', 'Холодный'].map((t) => (
                      <button
                        key={t}
                        onClick={() => onUpdateFlowData({
                          locationSettings: { ...activeFlow.locationSettings, temperature: t as any }
                        })}
                        className={`flex-1 py-1 text-[10px] font-semibold rounded-[4px] cursor-pointer transition-colors ${activeFlow.locationSettings.temperature === t ? 'bg-[#C9A35F] text-[#050505]' : 'hover:bg-[#1D1D21] text-[#8B8B93]'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Hardness */}
                <div className="space-y-1.5">
                  <span className="text-[#8B8B93] font-medium font-sans">Жесткость теней:</span>
                  <div className="flex gap-1 bg-[#16161A] border border-[rgba(255,255,255,0.08)] rounded-[6px] p-1">
                    {['Мягкий', 'Контрастный'].map((h) => (
                      <button
                        key={h}
                        onClick={() => onUpdateFlowData({
                          locationSettings: { ...activeFlow.locationSettings, hardness: h as any }
                        })}
                        className={`flex-1 py-1 text-[10px] font-semibold rounded-[4px] cursor-pointer transition-colors ${activeFlow.locationSettings.hardness === h ? 'bg-[#C9A35F] text-[#050505]' : 'hover:bg-[#1D1D21] text-[#8B8B93]'}`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Intensity */}
                <div className="space-y-1.5">
                  <span className="text-[#8B8B93] font-medium">Интенсивность лучей:</span>
                  <div className="flex gap-1 bg-[#16161A] border border-[rgba(255,255,255,0.08)] rounded-[6px] p-1">
                    {['Приглушенный', 'Яркий'].map((i) => (
                      <button
                        key={i}
                        onClick={() => onUpdateFlowData({
                          locationSettings: { ...activeFlow.locationSettings, intensity: i as any }
                        })}
                        className={`flex-1 py-1 text-[10px] font-semibold rounded-[4px] cursor-pointer transition-colors ${activeFlow.locationSettings.intensity === i ? 'bg-[#C9A35F] text-[#050505]' : 'hover:bg-[#1D1D21] text-[#8B8B93]'}`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Spain info footnote */}
              <p className="text-[10px] leading-relaxed text-[#8B8B93] border-t border-[rgba(255,255,255,0.08)] pt-2.5">
                * Видео-шаблон сохраняет свой стиль; настройки света применяются как мягкое направление.
              </p>
            </div>


          </div>
        )}

        {/* Step 5: Pose Pack Selection (5 distinct formats) */}
        {currentStepIndex === 4 && (
          <div className="space-y-6 font-sans">
            <div>
              <h2 className="text-lg font-display font-medium text-[#F8F8F8]">Шаг 5: Выберите пакет поз</h2>
              <p className="text-xs text-[#8B8B93] mt-0.5">
                Пакеты поз задают направление силуэтов для всех 7 фото результатов в Вашем архиве.
              </p>
            </div>

            <div className="space-y-4">
              {POSE_PACKS.map((pack) => {
                const isSelected = activeFlow.selectedPosePack === pack.name;
                return (
                  <div
                    key={pack.id}
                    onClick={() => onUpdateFlowData({ selectedPosePack: pack.name })}
                    className={`border p-4 rounded-[12px] bg-[#0F0F11] cursor-pointer transition-all ${isSelected ? 'border-[#C9A35F] bg-[rgba(201,163,95,0.04)]' : 'border-[rgba(255,255,255,0.08)] hover:border-white'}`}
                  >
                    <div className="flex justify-between items-center flex-wrap gap-2 mb-2.5">
                      <div>
                        <h4 className="text-xs font-bold text-[#F8F8F8]">{pack.name}</h4>
                        <p className="text-[10.5px] text-[#8B8B93] italic mt-0.5">Классификация: {pack.description}</p>
                      </div>
                      {isSelected && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-[#C9A35F] text-[#050505] px-2 py-0.5 rounded-[4px]">
                          Выбран
                        </span>
                      )}
                    </div>

                    {/* 7 skeleton thumbnails representations */}
                    <div className="grid grid-cols-7 gap-1.5 bg-[#16161A] p-2.5 rounded-[8px]">
                      {pack.frames.map((f, i) => (
                        <div key={i} className="aspect-[3/4] bg-[#1D1D21] rounded border border-[rgba(255,255,255,0.05)] p-1.5 flex flex-col justify-between text-center relative overflow-hidden">
                          <span className="text-[8px] font-mono leading-none font-bold text-[#8B8B93]">Ш{i + 1}</span>
                          <span className="text-[8.5px] font-sans scale-90 truncate max-w-full text-[#B5B5BC] font-semibold text-center block mt-0.5">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>


          </div>
        )}

        {/* Step 6: Video Template (For kit credits only) */}
        {currentStepIndex === 5 && isKit && (
          <div className="space-y-6 font-sans">
            <div>
              <h2 className="text-lg font-display font-medium text-[#F8F8F8]">Шаг 6: Видео-шаблон (15 секунд, 9:16)</h2>
              <p className="text-xs text-[#8B8B93] mt-0.5">
                Выбранный комплект будет преобразован в плавный 15-секундный вертикальный ролик на выбранной циклораме.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VIDEO_TEMPLATES.map((tmpl) => {
                const isSelected = activeFlow.selectedVideoTemplate === tmpl.name;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => onUpdateFlowData({ selectedVideoTemplate: tmpl.name })}
                    className={`border p-4 rounded-[12px] bg-[#0F0F11] space-y-3 cursor-pointer transition-all ${isSelected ? 'border-[#C9A35F] bg-[rgba(201,163,95,0.04)]' : 'border-[rgba(255,255,255,0.08)] hover:border-white'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-[#F8F8F8]">{tmpl.name}</span>
                      {isSelected && (
                        <span className="text-[9px] bg-[#C9A35F] text-[#050505] rounded px-1.5 font-bold uppercase tracking-wider font-sans">Выбран</span>
                      )}
                    </div>
                    
                    <div className="aspect-[9/16] max-h-48 bg-[#16161A] border border-[rgba(255,255,255,0.05)] rounded-[6px] flex flex-col justify-center items-center text-center p-3 relative overflow-hidden">
                      <Play size={20} className="text-[#C9A35F]" />
                      <span className="text-[10px] font-mono mt-2 text-[#8B8B93] uppercase tracking-widest">{tmpl.specs}</span>
                    </div>

                    <p className="text-[11px] text-[#8B8B93] leading-relaxed font-sans">{tmpl.description}</p>
                  </div>
                );
              })}
            </div>


          </div>
        )}

        {/* Step 7: Final Review Brief & Checkout Reservation launch trigger */}
        {((currentStepIndex === 5 && !isKit) || currentStepIndex === 6) && (
          <div className="space-y-6 font-sans">
            <div>
              <h2 className="text-lg font-display font-medium text-[#F8F8F8]">Финальный обзор продакшена (Бриф)</h2>
              <p className="text-xs text-[#8B8B93] mt-0.5">
                Пожалуйста, внимательно изучите состав заказа. Запуск зарезервирует необходимую сумму кредитов с баланса Вашего аккаунта.
              </p>
            </div>

            <div className="border border-[rgba(255,255,255,0.08)] rounded-[12px] p-5 bg-[#0F0F11] text-xs space-y-4">
              <span className="block font-bold text-[#8B8B93] uppercase tracking-widest text-[9px]">Сводный бриф заказа</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 divide-y sm:divide-y-0 divide-[rgba(255,255,255,0.08)]">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B8B93]">Название образа:</span>
                    <span className="font-semibold text-[#F8F8F8]">{activeFlow.lookName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B8B93]">Модель:</span>
                    <span className="font-semibold text-[#F8F8F8]">{activeFlow.selectedModel?.name} ({activeFlow.selectedModel?.gender})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B8B93]">Комплект одежды:</span>
                    <span className="font-semibold text-[#F8F8F8] truncate max-w-[120px]">{activeFlow.selectedKit?.name}</span>
                  </div>
                </div>
                
                <div className="space-y-2.5 pt-4 sm:pt-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B8B93]">Свет и локация:</span>
                    <span className="font-semibold text-[#F8F8F8]">{activeFlow.selectedLocation}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B8B93]">Управляемый свет:</span>
                    <div className="flex gap-1">
                      <span className="bg-[#16161A] border border-[rgba(255,255,255,0.08)] text-[10px] px-1.5 py-0.5 text-[#C9A35F] rounded font-semibold">{activeFlow.locationSettings.temperature}</span>
                      <span className="bg-[#16161A] border border-[rgba(255,255,255,0.08)] text-[10px] px-1.5 py-0.5 text-[#C9A35F] rounded font-semibold">{activeFlow.locationSettings.hardness}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B8B93]">Направление поз:</span>
                    <span className="font-semibold text-[#F8F8F8]">{activeFlow.selectedPosePack}</span>
                  </div>
                  {isKit && (
                    <div className="flex justify-between items-center border-t border-dashed border-[rgba(255,255,255,0.08)] pt-2.5 mt-1">
                      <span className="text-[#8B8B93]">Видео-шаблон (15c):</span>
                      <span className="font-semibold font-mono text-[#C9A35F]">{activeFlow.selectedVideoTemplate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reserved accounts warning */}
              <div className="p-3.5 bg-[rgba(201,163,95,0.08)] border border-[rgba(201,163,95,0.2)] text-white rounded-[8px] font-mono text-[11px] leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5 font-sans">
                  <div className="text-[#C9A35F] font-bold">
                    {isKit ? 'Будет зарезервирован: 1 кредит' : 'Будет зарезервировано: 0,5 кредита'}
                  </div>
                  <div className="text-[#8B8B93] text-[10px]">
                    После запуска останется: {formatCreditsWithLabel(Math.max(0, creditBalance - (isKit ? 1 : 0.5)))}
                  </div>
                </div>
                <span className="text-[#8B8B93] text-[10px] uppercase font-bold tracking-wider">Списание только после Ready</span>
              </div>
            </div>


          </div>
        )}

      </div>

      {/* 3. Right Column: Overview Drawer panel */}
      <div className="w-full md:w-[280px] bg-[#0F0F11] border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.08)] p-5 space-y-5 text-xs shrink-0 select-none font-sans">
        <span className="text-[10px] font-mono text-[#8B8B93] uppercase tracking-wider block">Черновик в прямом эфире</span>

        {/* Selected model overview details */}
        <div className="space-y-3">
          <span className="block border-b border-[rgba(255,255,255,0.08)] pb-1.5 font-bold text-[#8B8B93] uppercase tracking-widest text-[9px]">
            AI Модель
          </span>
          {activeFlow.selectedModel ? (
            <div className="bg-[#16161A] p-2.5 border border-[rgba(255,255,255,0.05)] rounded-[6px] space-y-1">
              <div className="font-semibold text-[#F8F8F8]">{activeFlow.selectedModel.name}</div>
              <div className="text-[#8B8B93] font-mono text-[10px]">
                {activeFlow.selectedModel.gender} • {activeFlow.selectedModel.age} • {activeFlow.selectedModel.ethnotype}
              </div>
            </div>
          ) : (
            <div className="text-[#8B8B93] italic">Модель не зафиксирована</div>
          )}
        </div>

        {/* Wardrobe files status */}
        <div className="space-y-3">
          <span className="block border-b border-[rgba(255,255,255,0.08)] pb-1.5 font-bold text-[#8B8B93] uppercase tracking-widest text-[9px]">
            Комплект вещей
          </span>
          {activeFlow.selectedKit ? (
            <div className="bg-[#16161A] p-2.5 border border-[rgba(255,255,255,0.05)] rounded-[6px] space-y-1">
              <div className="font-semibold text-[#F8F8F8] max-w-[180px] truncate">{activeFlow.selectedKit.name}</div>
              <div className="text-[#8B8B93] font-mono text-[10px]">{activeFlow.selectedKit.items.length} фото в усадке</div>
            </div>
          ) : (
            <div className="text-[#8B8B93] italic">Одежда не укомплектована</div>
          )}
        </div>

        {/* Selected location details */}
        <div className="space-y-3">
          <span className="block border-b border-[rgba(255,255,255,0.08)] pb-1.5 font-bold text-[#8B8B93] uppercase tracking-widest text-[9px]">
            Локация и свет
          </span>
          {activeFlow.selectedLocation ? (
            <div className="bg-[#16161A] p-2.5 border border-[rgba(255,255,255,0.05)] rounded-[6px] space-y-1.5 leading-normal">
              <div className="font-semibold text-[#F8F8F8]">{activeFlow.selectedLocation}</div>
              <div className="flex gap-1 flex-wrap">
                <span className="bg-[#1D1D21] border border-[rgba(255,255,255,0.05)] text-[9px] px-1.5 py-0.5 text-[#C9A35F] rounded">{activeFlow.locationSettings.temperature}</span>
                <span className="bg-[#1D1D21] border border-[rgba(255,255,255,0.05)] text-[9px] px-1.5 py-0.5 text-[#C9A35F] rounded">{activeFlow.locationSettings.hardness}</span>
                <span className="bg-[#1D1D21] border border-[rgba(255,255,255,0.05)] text-[9px] px-1.5 py-0.5 text-[#C9A35F] rounded">{activeFlow.locationSettings.intensity}</span>
              </div>
            </div>
          ) : (
            <div className="text-[#8B8B93] italic">География не выбрана</div>
          )}
        </div>

        {/* pose direction check */}
        <div className="space-y-3">
          <span className="block border-b border-[rgba(255,255,255,0.08)] pb-1.5 font-bold text-[#8B8B93] uppercase tracking-widest text-[9px]">
            Позы
          </span>
          {activeFlow.selectedPosePack ? (
            <div className="bg-[#16161A] p-2.5 border border-[rgba(255,255,255,0.05)] rounded-[6px] font-semibold text-[#F8F8F8]">
              {activeFlow.selectedPosePack}
            </div>
          ) : (
            <div className="text-[#8B8B93] italic">Позы не зафиксированы</div>
          )}
        </div>

        {/* missing indicators validator blocks */}
        <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] space-y-2 font-sans">
          {getMissingItemsList().length > 0 ? (
            <div className="bg-[rgba(201,120,120,0.08)] p-3 border border-[rgba(201,120,120,0.15)] rounded-[8px] space-y-1">
              <span className="font-semibold text-[#C97878] block font-sans">Требуется заполнить:</span>
              <ul className="list-disc pl-4 text-[10.5px] font-mono text-[#C97878] leading-normal font-sans">
                {getMissingItemsList().map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-[rgba(120,169,138,0.08)] p-3 border border-[#78A98A] rounded-[8px] text-[#78A98A] font-medium font-sans">
              ✓ Бриф заказа полностью укомплектован! Готов к списанию в очереди.
            </div>
          )}
        </div>

      </div>

      {/* 4. Fixed Floating Bottom Confirmation Banner */}
      {(() => {
        let bottomBarAction: (() => void) | null = null;
        let bottomBarText = '';
        let bottomBarDescription = '';
        let showBottomBar = false;

        if (currentStepIndex === 0) {
          if (activeFlow.selectedModel) {
            showBottomBar = true;
            bottomBarDescription = `Выбрана модель: ${activeFlow.selectedModel.name}`;
            bottomBarAction = () => onStepChange(1);
            bottomBarText = 'Выбрать эту модель и продолжить';
          }
        } else if (currentStepIndex === 1) {
          if (wardrobeTab === 'upload') {
            const isUploadReady = Object.values(uploadSlots).filter(Boolean).length >= 2;
            if (isUploadReady) {
              showBottomBar = true;
              bottomBarDescription = `Комплект собран из ваших фото`;
              bottomBarAction = handleSaveUploadedKit;
              bottomBarText = 'Продолжить с этим комплектом';
            }
          } else {
            if (activeFlow.selectedKit) {
              showBottomBar = true;
              bottomBarDescription = `Выбрана одежда: ${activeFlow.selectedKit.name}`;
              bottomBarAction = () => onStepChange(2);
              bottomBarText = 'Использовать этот комплект';
            }
          }
        } else if (currentStepIndex === 2) {
          showBottomBar = true;
          bottomBarDescription = `Образ: ${activeFlow.lookName || 'Без названия'}`;
          bottomBarAction = handleConfirmLook;
          bottomBarText = 'Утвердить образ и продолжить';
        } else if (currentStepIndex === 3) {
          if (activeFlow.selectedLocation) {
            showBottomBar = true;
            bottomBarDescription = `Выбрана локация: ${activeFlow.selectedLocation}`;
            bottomBarAction = () => onStepChange(4);
            bottomBarText = 'Выбрать локацию и продолжить';
          }
        } else if (currentStepIndex === 4) {
          if (activeFlow.selectedPosePack) {
            showBottomBar = true;
            bottomBarDescription = `Выбраны позы: ${activeFlow.selectedPosePack}`;
            bottomBarAction = () => onStepChange(5);
            bottomBarText = 'Выбрать этот пакет поз';
          }
        } else if (currentStepIndex === 5 && isKit) {
          if (activeFlow.selectedVideoTemplate) {
            showBottomBar = true;
            bottomBarDescription = `Выбран шаблон: ${activeFlow.selectedVideoTemplate}`;
            bottomBarAction = () => onStepChange(6);
            bottomBarText = 'Выбрать этот видео-шаблон';
          }
        } else if ((currentStepIndex === 5 && !isKit) || currentStepIndex === 6) {
          showBottomBar = true;
          bottomBarDescription = `Бриф заполнен и готов`;
          bottomBarAction = () => onLaunchProduction(activeFlow.type);
          bottomBarText = `Создать ${isKit ? 'комплект (Фото + Видео)' : '7 готовых фото'}`;
        }

        if (!showBottomBar) return null;

        return (
          <div className="fixed bottom-[53px] md:bottom-0 left-0 md:left-[248px] right-0 md:right-[280px] z-40 bg-[#0A0A0C]/95 backdrop-blur-md border-t border-[rgba(255,255,255,0.08)] p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A35F] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C9A35F]"></span>
              </span>
              <span className="text-xs font-semibold text-[#8B8B93]">Шаг {currentStepIndex + 1}:</span>
              <span className="text-xs font-bold text-[#F8F8F8]">{bottomBarDescription}</span>
            </div>
            
            <button
              onClick={bottomBarAction || undefined}
              className="w-full sm:w-auto h-[40px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] font-sans font-semibold text-sm px-6 rounded-[6px] flex items-center justify-center transition-all select-none active:translate-y-[1px] cursor-pointer shadow-lg"
            >
              <span>{bottomBarText}</span>
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        );
      })()}

    </div>
  );
}
