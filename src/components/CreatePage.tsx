import React, { useState } from 'react';
import { Model, WardrobeKit, WardrobeItem, ControlledLocationSettings, ActiveProductionFlow, Look } from '../types';
import { LOCATION_CATEGORIES, POSE_PACKS, VIDEO_TEMPLATES } from '../mockData';
import { Sparkles, Users, Shirt, MapPin, CheckCircle, Info, RefreshCw, Trash2, Sliders, AlertTriangle, Play, ChevronRight, Check, UploadCloud } from 'lucide-react';

interface CreatePageProps {
  photoCredits: number;
  kitCredits: number;
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
  photoCredits,
  kitCredits,
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
      <div className="p-6 max-w-4xl mx-auto space-y-8 font-sans text-[#111111]">
        <div className="text-center py-10 max-w-2xl mx-auto space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">Создать AI-продакшен</h1>
          <p className="text-sm text-neutral-500">
            Для запуска съемок выберите подходящий формат в зависимости от доступных у вас кредитов.
          </p>
        </div>

        {photoCredits === 0 && kitCredits === 0 ? (
          <div className="bg-white border-2 border-[#D7D7D7] rounded-lg p-8 text-center max-w-md mx-auto space-y-4">
            <h3 className="text-sm font-bold">У вас пока нет активных кредитов.</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Посетите раздел тарифов, чтобы выбрать подходящий съемочный пакет и провести оплату.
            </p>
            <div className="pt-2">
              <button
                onClick={onNavigateToTariffs}
                className="bg-[#111111] hover:bg-neutral-800 text-white font-medium text-xs py-2 px-4 rounded"
              >
                Посмотреть тарифы →
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Choose 7 photos */}
            <div className="bg-white border-2 border-[#D7D7D7] hover:border-black rounded-lg p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-md font-bold">Пакет на 7 фотографий</h3>
                  <span className="text-[10px] font-mono bg-amber-50 text-amber-800 py-0.5 px-2 rounded font-bold border border-amber-200">
                    1 фото-кредит
                  </span>
                </div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Полноценная фотосессия для одного SKU на выбранной модели. Вы получаете 7 разноплановых кадров с высокой детализацией. Видео не входит.
                </p>
                <div className="bg-[#F6F6F6] p-3 rounded text-xs space-y-1 text-[#555555]">
                  <div>• Результат: <strong>7 готовых кадров в ZIP</strong></div>
                  <div>• Локация и свет: <strong>Контролируемые</strong></div>
                </div>
              </div>
              <button
                disabled={photoCredits === 0}
                onClick={() => onStartFlow('photo')}
                className="w-full bg-[#111111] disabled:bg-neutral-200 disabled:text-neutral-500 hover:bg-neutral-800 text-white text-xs font-bold py-2.5 rounded transition-all mt-4"
              >
                {photoCredits > 0 ? 'Запустить съемку (7 фото) →' : 'Недостаточно фото-кредитов'}
              </button>
            </div>

            {/* Choose kit (Photos + Video) */}
            <div className="bg-white border-2 border-[#D7D7D7] hover:border-black rounded-lg p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-md font-bold">Production-комплект</h3>
                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-800 py-0.5 px-2 rounded font-bold border border-indigo-200">
                    1 комплект-кредит
                  </span>
                </div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Полная фотосессия (7 снимков) плюс одно 15-секундное готовое вертикальное промо-видео (9:16). Идеально закрывает карточки маркетплейсов и социальные медиа за один клик.
                </p>
                <div className="bg-[#F6F6F6] p-3 rounded text-xs space-y-1 text-[#555555]">
                  <div>• Результат: <strong>7 кадров + 1 видеоролик</strong></div>
                  <div>• Шаблон видео: <strong>Интегрированный</strong></div>
                </div>
              </div>
              <button
                disabled={kitCredits === 0}
                onClick={() => onStartFlow('kit')}
                className="w-full bg-[#111111] disabled:bg-neutral-200 disabled:text-neutral-500 hover:bg-neutral-800 text-white text-xs font-bold py-2.5 rounded transition-all mt-4"
              >
                {kitCredits > 0 ? 'Запустить комплект (Фото + Видео) →' : 'Недостаточно комплект-кредитов'}
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
    <div className="h-full flex flex-col md:flex-row font-sans text-[#111111]">
      
      {/* 2. Middle Editor Content Area */}
      <div className="flex-1 p-6 bg-white overflow-y-auto min-w-0 border-r border-[#F1F1F1]">
        
        {/* Top Stepper Area (Above main headers) */}
        <div className="mb-6 pb-5 border-b border-[#F1F1F1] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {onCancelFlow && (
              <button
                onClick={onCancelFlow}
                id="back_to_formats_btn"
                className="flex items-center gap-2 text-xs text-[#111111] font-bold transition-all py-1.5 px-3.5 rounded-md border border-[#D7D7D7] hover:border-black bg-white select-none whitespace-nowrap self-start"
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
                    className={`flex items-center gap-2 text-left text-xs font-bold py-1.5 px-3 rounded-lg border select-none transition-all ${
                      isActive 
                        ? 'bg-[#111111] text-white border-black' 
                        : isCompleted 
                          ? 'text-neutral-700 bg-white border-[#D7D7D7] hover:border-black' 
                          : 'text-neutral-300 border-[#EFEFEF] pointer-events-none'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9px] leading-none ${isActive ? 'bg-white text-black' : isCompleted ? 'bg-neutral-200 text-neutral-700' : 'bg-neutral-100 text-neutral-300'}`}>
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
              <h2 className="text-lg font-bold">Шаг 1: Выберите AI-модель</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Используйте сохраненных манекенщиц из вашей базы или сгенерируйте новые параметры лица и расы.
              </p>
            </div>

            {/* Tab switchers */}
            <div className="flex gap-2 bg-[#F1F1F1] rounded-lg p-1 text-xs max-w-xs">
              <button
                onClick={() => setModelTab('saved')}
                className={`flex-1 py-1 px-3 rounded transition-all ${modelTab === 'saved' ? 'bg-white font-bold' : ''}`}
              >
                Сохраненные модели
              </button>
              <button
                onClick={() => setModelTab('create')}
                className={`flex-1 py-1 px-3 rounded transition-all ${modelTab === 'create' ? 'bg-white font-bold' : ''}`}
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
                      className={`border p-4 rounded-lg space-y-3 cursor-pointer transition-all ${activeFlow.selectedModel?.id === model.id ? 'border-[#111111] bg-neutral-50' : 'border-[#D7D7D7] hover:border-black'}`}
                      onClick={() => onUpdateFlowData({ selectedModel: model })}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono text-neutral-400">ID: {model.id}</span>
                        {activeFlow.selectedModel?.id === model.id && (
                          <span className="text-[10px] bg-[#111111] text-white px-2 py-0.5 rounded uppercase font-bold">Выбрана</span>
                        )}
                      </div>
                      <div className="aspect-[4/3] bg-neutral-100 rounded border border-neutral-200 flex items-center justify-center font-mono text-center text-[10px] text-neutral-500 p-2">
                        {model.previewUrl}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{model.name}</h4>
                        <div className="text-[11px] text-neutral-500 flex flex-wrap gap-x-2 mt-1">
                          <span>{model.gender} • {model.age} • {model.ethnotype} • {model.bodyType}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {savedModels.length === 0 && (
                  <p className="text-xs text-neutral-400 italic">Сохраненных моделей нет. Сгенерируйте новую.</p>
                )}
                
                {activeFlow.selectedModel && (
                  <button
                    onClick={() => onStepChange(1)}
                    className="bg-[#111111] hover:bg-neutral-800 text-white text-xs font-semibold py-2 px-4 rounded"
                  >
                    Выбрать эту модель и продолжить →
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start border border-[#D7D7D7] p-5 rounded-lg bg-neutral-50">
                {/* Form parameters creators */}
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Имя или ярлык новой модели</label>
                    <input
                      type="text"
                      placeholder="Например: Кристина С."
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      className="w-full bg-white border border-[#D7D7D7] rounded p-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">Пол</label>
                      <select
                        value={newModelGender}
                        onChange={(e: any) => setNewModelGender(e.target.value)}
                        className="w-full bg-white border border-[#D7D7D7] rounded p-2 text-xs"
                      >
                        <option value="Женский">Женский</option>
                        <option value="Мужской">Мужской</option>
                        <option value="Унисекс">Унисекс</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Возрастной диапазон</label>
                      <select
                        value={newModelAge}
                        onChange={(e: any) => setNewModelAge(e.target.value)}
                        className="w-full bg-white border border-[#D7D7D7] rounded p-2 text-xs"
                      >
                        <option value="18-22">18-22</option>
                        <option value="23-28">23-28</option>
                        <option value="30-35">30-35</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">Этнотип</label>
                      <select
                        value={newModelEthno}
                        onChange={(e: any) => setNewModelEthno(e.target.value)}
                        className="w-full bg-white border border-[#D7D7D7] rounded p-2 text-xs"
                      >
                        <option value="Европейский">Европейский</option>
                        <option value="Азиатский">Азиатский</option>
                        <option value="Латино">Латино</option>
                        <option value="Афро">Афро</option>
                        <option value="Смешанный">Смешанный</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Комплекция тела</label>
                      <select
                        value={newModelBody}
                        onChange={(e: any) => setNewModelBody(e.target.value)}
                        className="w-full bg-white border border-[#D7D7D7] rounded p-2 text-xs"
                      >
                        <option value="Стройная">Стройная</option>
                        <option value="Атлетичная">Атлетичная</option>
                        <option value="Песочные часы">Песочные часы</option>
                        <option value="Полная">Полная</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Заметки и уточнения по лицу / волосам</label>
                    <textarea
                      placeholder="Темно-русые волосы до плеч, карие глаза..."
                      value={newModelNotes}
                      onChange={(e) => setNewModelNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-[#D7D7D7] rounded p-2 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#D7D7D7]">
                    <span className="text-[10px] text-neutral-400 font-mono">Баланс preview: {previewAttempts} / 3 попыток</span>
                    <button
                      type="button"
                      onClick={handleGenerateModelPreview}
                      disabled={previewGenerating || previewAttempts >= 3}
                      className="bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-500 font-bold px-4 py-2 rounded transition-colors"
                    >
                      {previewGenerating ? 'Создание макета...' : 'Сгенерировать preview'}
                    </button>
                  </div>
                </div>

                {/* Preview Box Response Area */}
                <div className="space-y-4">
                  <span className="block text-xs font-bold text-neutral-500 uppercase">Сгенерированный preview-макет</span>
                  {previewModel ? (
                    <div className="bg-white border border-[#D7D7D7] rounded-lg p-4 text-center space-y-4">
                      
                      <div className="aspect-[3/4] bg-[#F1F1F1] border rounded flex flex-col items-center justify-center p-4 relative text-neutral-500">
                        <div className="w-16 h-16 border rounded-full bg-white flex items-center justify-center text-xs font-mono font-bold leading-none">
                          {previewModel.gender[0]}
                        </div>
                        <span className="text-xs font-semibold mt-4 text-[#111111]">{previewModel.name}</span>
                        <span className="text-[10px] font-mono mt-1 text-neutral-400 leading-normal block max-w-xs">
                          {previewModel.previewUrl}
                        </span>
                        
                        <div className="absolute inset-0 bg-neutral-900/5 mix-blend-overlay"></div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <button
                          onClick={selectGeneratedModel}
                          className="w-full bg-[#111111] hover:bg-neutral-800 text-white font-medium text-xs py-2 rounded"
                        >
                          Утвердить эту модель
                        </button>
                        <button
                          onClick={handleGenerateModelPreview}
                          className="w-full border border-[#D7D7D7] hover:bg-neutral-50 text-xs py-2 rounded text-[#555555]"
                        >
                          Перегенерировать (Попытка {previewAttempts + 1} из 3)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 border border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center text-center p-4 text-neutral-400 text-xs">
                      <Users size={20} className="mb-2 text-neutral-300" />
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
              <h2 className="text-lg font-bold">Шаг 2: Гардероб и комплект одежды</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Загрузите референсные фотографии вещей в специальные слоты для анализа масок (минимум 2 кадра).
              </p>
            </div>

            <div className="flex gap-2 bg-[#F1F1F1] rounded-lg p-1 text-xs max-w-xs">
              <button
                onClick={() => setWardrobeTab('upload')}
                className={`flex-1 py-1 px-3 rounded transition-all ${wardrobeTab === 'upload' ? 'bg-white font-bold' : ''}`}
              >
                Загрузить вещи
              </button>
              <button
                onClick={() => setWardrobeTab('select')}
                className={`flex-1 py-1 px-3 rounded transition-all ${wardrobeTab === 'select' ? 'bg-white font-bold' : ''}`}
              >
                База гардероба
              </button>
            </div>

            {wardrobeTab === 'upload' ? (
              <div className="space-y-6 border border-[#D7D7D7] p-5 rounded-lg bg-neutral-50">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-neutral-500">
                    Слоты классификации одежды
                  </span>
                  <span className="font-mono text-neutral-700">
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
                        className={`aspect-[3/4] border rounded-lg p-2.5 flex flex-col justify-between text-center relative overflow-hidden transition-all ${file ? 'bg-white border-[#111111]' : 'bg-neutral-50 border-dashed border-[#D7D7D7] hover:border-black'}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500">{slot.label}</span>
                          {file && (
                            <button
                              onClick={() => clearSlot(slot.id)}
                              className="text-red-500 hover:text-red-600 text-[10px]"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {file ? (
                          <div className="flex-1 flex flex-col justify-center items-center p-1 text-center">
                            <Shirt size={14} className="text-[#111111] mb-1" />
                            <span className="text-[10px] font-mono leading-none break-words text-neutral-600">{file.name}</span>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleSimulateUploadSlot(slot.id)}
                            className="flex-grow flex flex-col justify-center items-center cursor-pointer p-1 text-neutral-400 group"
                          >
                            <UploadCloud size={16} className="text-neutral-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[8px] mt-1 font-mono">{slot.desc}</span>
                          </div>
                        )}
                        
                        <span className="text-[9px] text-[#A8A8A8] font-mono italic block">Слот {slot.id}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Multi item inline validator summaries */}
                {Object.values(uploadSlots).filter(Boolean).length > 0 && (
                  <div className="p-3.5 bg-white border border-[#D7D7D7] rounded-lg text-xs space-y-1.5 font-sans leading-relaxed">
                    <span className="font-bold text-[#111111] tracking-wider uppercase text-[10px] block">Проверка совмещений ModAI:</span>
                    
                    {!uploadSlots[1] && (
                      <p className="text-amber-800 flex items-center gap-1">
                        ⚠️ <strong>Внимание: Слот 1 пуст.</strong> Передний ракурс необходим для усадки силуэта платья.
                      </p>
                    )}
                    {!uploadSlots[2] && (
                      <p className="text-amber-800 flex items-center gap-1">
                        ⚠️ <strong>Предупреждение: Слот 2 пуст.</strong> Спецификация спины будет смоделирована ИИ приближенно.
                      </p>
                    )}
                    {Object.values(uploadSlots).filter(Boolean).length >= 2 && uploadSlots[1] && (
                      <p className="text-neutral-900 font-semibold flex items-center gap-1">
                        ✓ Лимиты соблюдены. Вы можете продолжить упаковку комплекта одежды.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3 pt-3 border-t border-[#D7D7D7]">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Дайте название этому комплекту одежды
                    </label>
                    <input
                      type="text"
                      placeholder="Например: Осеннее серое шерстяное пальто с шарфом"
                      value={uploadKitName}
                      onChange={(e) => setUploadKitName(e.target.value)}
                      className="w-full bg-white border border-[#D7D7D7] rounded p-2 text-xs"
                    />
                  </div>

                  <button
                    disabled={Object.values(uploadSlots).filter(Boolean).length < 2}
                    onClick={handleSaveUploadedKit}
                    className="bg-[#111111] hover:bg-neutral-800 text-white text-xs font-semibold py-2 px-4 rounded disabled:bg-neutral-200 disabled:text-neutral-400"
                  >
                    Продолжить с этим комплектом одежды (Усадка маски) →
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wardrobeKits.map((kit) => (
                    <div
                      key={kit.id}
                      className={`border p-4 rounded-lg space-y-3 cursor-pointer transition-all ${activeFlow.selectedKit?.id === kit.id ? 'border-[#111111] bg-neutral-50' : 'border-[#D7D7D7] hover:border-black'}`}
                      onClick={() => onUpdateFlowData({ selectedKit: kit, lookName: `Образ с "${kit.name}"` })}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono text-neutral-400">ID: {kit.id}</span>
                        {activeFlow.selectedKit?.id === kit.id && (
                          <span className="text-[10px] bg-[#111111] text-white px-2 py-0.5 rounded uppercase font-bold">Выбран</span>
                        )}
                      </div>
                      
                      {/* Grid representation */}
                      <div className="grid grid-cols-4 gap-1.5 bg-[#F1F1F1] p-2 rounded">
                        {kit.items.map((i, idx) => (
                          <div key={idx} className="aspect-square bg-white border border-neutral-300 rounded flex items-center justify-center text-[9px] font-mono p-1">
                            {i.sideType[0].toUpperCase()}
                          </div>
                        ))}
                      </div>

                      <h4 className="text-sm font-semibold">{kit.name}</h4>
                      <p className="text-[10px] text-neutral-400 uppercase font-mono">Содержит вещей: {kit.items.length}</p>
                    </div>
                  ))}
                </div>

                {wardrobeKits.length === 0 && (
                  <p className="text-xs text-neutral-400 italic">База пуста. Попробуйте вкладку "Загрузить вещи".</p>
                )}

                {activeFlow.selectedKit && (
                  <button
                    onClick={() => onStepChange(2)}
                    className="bg-[#111111] hover:bg-neutral-800 text-white text-xs font-semibold py-2 px-4 rounded"
                  >
                    Использовать этот комплект одежды →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Dressed Model Look Card */}
        {currentStepIndex === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Шаг 3: Согласование Образа (Look)</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Образ соединяет макет выбранной модели и усадку комплекта вещей в единый черновик.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-[#D7D7D7] p-5 rounded-lg bg-neutral-50 text-xs">
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Задайте название Образа для истории (Look Name)
                  </label>
                  <input
                    type="text"
                    value={activeFlow.lookName}
                    onChange={(e) => onUpdateFlowData({ lookName: e.target.value })}
                    className="w-full bg-white border border-[#D7D7D7] rounded p-2 text-xs font-semibold"
                  />
                </div>

                <div className="p-4 bg-white border border-[#D7D7D7] rounded-lg space-y-2.5">
                  <span className="block text-[10px] uppercase font-bold text-neutral-400">Технологический паспорт образа</span>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">AI Модель:</span>
                    <span className="font-semibold">{activeFlow.selectedModel?.name} ({activeFlow.selectedModel?.gender})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Одежда каталога:</span>
                    <span className="font-semibold block max-w-[150px] truncate">{activeFlow.selectedKit?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Слоты ракурсов:</span>
                    <span className="font-mono font-semibold text-neutral-600">{activeFlow.selectedKit?.items.length} фото вещей</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmLook}
                  className="w-full bg-[#111111] hover:bg-neutral-800 text-white font-bold py-2.5 rounded text-xs transition-colors"
                >
                  Утвердить образ и продолжить →
                </button>
              </div>

              {/* Look Preview Wireframe Display */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-neutral-500 uppercase">Макет слияния (Wireframe)</span>
                
                <div className="aspect-[4/3] bg-white border border-[#C5C5C5] rounded-lg p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  {/* Grayscale mannequin dressing mockups styling */}
                  <div className="w-14 h-14 border border-[#A8A8A8] bg-[#F1F1F1] rounded-full text-xs font-mono font-bold flex items-center justify-center text-neutral-500">
                    O
                  </div>
                  <div className="w-24 h-12 border-2 border-dashed border-[#A8A8A8] bg-[#F6F6F6] rounded flex items-center justify-center font-mono font-bold text-[10px] text-[#111111] mt-2">
                    [Маска силуэта]
                  </div>

                  <span className="text-[10px] text-neutral-400 mt-3 font-mono">
                    Слияние: {activeFlow.selectedModel?.name} + {activeFlow.selectedKit?.name}
                  </span>
                  
                  <div className="absolute inset-x-0 bottom-0 bg-[#F1F1F1] py-1 border-t text-[10px] font-mono font-semibold tracking-wide text-neutral-600 text-center uppercase">
                    Образ готов к съемке
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Predefined Location & Controlled Light parameters */}
        {currentStepIndex === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Шаг 4: Выберите локацию и освещение</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Используйте предустановленные испанские пейзажи или минималистичные интерьеры для сопряжения кожи модели со светом.
              </p>
            </div>

            {/* Segmented geography tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-[#D7D7D7] pb-2">
              {LOCATION_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveGeoCategory(cat.id)}
                  className={`px-3 py-1 text-xs border rounded-full transition-all ${activeGeoCategory === cat.id ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-white border-[#D7D7D7] text-[#555555] hover:bg-neutral-50'}`}
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
                    className={`border p-4 rounded-lg space-y-3 cursor-pointer transition-all ${isSelected ? 'border-[#111111] bg-neutral-50' : 'border-[#D7D7D7] hover:border-black'}`}
                  >
                    <div className="aspect-[4/3] bg-[#F1F1F1] border rounded flex items-center justify-center p-2 relative overflow-hidden">
                      <MapPin size={16} className="text-neutral-400" />
                      <span className="text-[10px] font-mono font-semibold text-neutral-600 uppercase ml-1">{loc}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{loc}</h4>
                      <p className="text-[11px] text-neutral-500 leading-tight mt-1">{descs[idx]}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Controlled visual parameters lighting */}
            <div className="border border-[#D7D7D7] p-4 rounded-lg bg-neutral-50 text-xs space-y-4">
              <div className="flex justify-between items-center border-b border-[#D7D7D7] pb-2">
                <span className="font-bold uppercase tracking-wider text-neutral-500">
                  Управляемое освещение (Controlled Lighting)
                </span>
                <button
                  onClick={handleControlledSettingsReset}
                  className="text-[#555555] hover:text-[#111111] text-[10px] font-semibold underline uppercase"
                >
                  Сбросить к дефолту
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Temp */}
                <div className="space-y-1.5">
                  <span className="text-neutral-500 font-medium">Цветовой тон:</span>
                  <div className="flex gap-1.5 bg-white border border-[#D7D7D7] rounded p-1">
                    {['Теплый', 'Холодный'].map((t) => (
                      <button
                        key={t}
                        onClick={() => onUpdateFlowData({
                          locationSettings: { ...activeFlow.locationSettings, temperature: t as any }
                        })}
                        className={`flex-1 py-1 text-[10px] font-semibold rounded ${activeFlow.locationSettings.temperature === t ? 'bg-[#111111] text-white' : 'hover:bg-neutral-100'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Hardness */}
                <div className="space-y-1.5">
                  <span className="text-neutral-500 font-medium font-sans">Жесткость теней:</span>
                  <div className="flex gap-1.5 bg-white border border-[#D7D7D7] rounded p-1">
                    {['Мягкий', 'Контрастный'].map((h) => (
                      <button
                        key={h}
                        onClick={() => onUpdateFlowData({
                          locationSettings: { ...activeFlow.locationSettings, hardness: h as any }
                        })}
                        className={`flex-1 py-1 text-[10px] font-semibold rounded ${activeFlow.locationSettings.hardness === h ? 'bg-[#111111] text-white' : 'hover:bg-neutral-100'}`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Intensity */}
                <div className="space-y-1.5">
                  <span className="text-neutral-500 font-medium">Интенсивность лучей:</span>
                  <div className="flex gap-1.5 bg-white border border-[#D7D7D7] rounded p-1">
                    {['Приглушенный', 'Яркий'].map((i) => (
                      <button
                        key={i}
                        onClick={() => onUpdateFlowData({
                          locationSettings: { ...activeFlow.locationSettings, intensity: i as any }
                        })}
                        className={`flex-1 py-1 text-[10px] font-semibold rounded ${activeFlow.locationSettings.intensity === i ? 'bg-[#111111] text-white' : 'hover:bg-neutral-100'}`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Spain info footnote */}
              <p className="text-[10px] leading-relaxed text-neutral-400 border-t border-[#D7D7D7] pt-2">
                * Видео-шаблон сохраняет свой стиль; настройки света применяются как мягкое направление.
              </p>
            </div>

            {activeFlow.selectedLocation && (
              <button
                onClick={() => onStepChange(4)}
                className="bg-[#111111] hover:bg-neutral-800 text-white text-xs font-semibold py-2 px-4 rounded"
              >
                Выбрать эту локацию и продолжить →
              </button>
            )}
          </div>
        )}

        {/* Step 5: Pose Pack Selection (5 distinct formats) */}
        {currentStepIndex === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Шаг 5: Выберите пакет поз</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
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
                    className={`border p-4 rounded-lg rounded-lg cursor-pointer transition-all ${isSelected ? 'border-[#111111] bg-neutral-50' : 'border-[#D7D7D7] hover:border-black'}`}
                  >
                    <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                      <div>
                        <h4 className="text-xs font-bold">{pack.name}</h4>
                        <p className="text-[10.5px] text-slate-500 italic mt-0.5">Классификация: {pack.description}</p>
                      </div>
                      {isSelected && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                          Выбран
                        </span>
                      )}
                    </div>

                    {/* 7 skeleton thumbnails representations */}
                    <div className="grid grid-cols-7 gap-1 bg-[#F1F1F1] p-2 rounded">
                      {pack.frames.map((f, i) => (
                        <div key={i} className="aspect-[3/4] bg-white rounded border border-neutral-300 p-1 flex flex-col justify-between text-center relative overflow-hidden">
                          <span className="text-[8px] font-mono leading-none font-bold text-neutral-400">Ш{i + 1}</span>
                          <span className="text-[7.5px] font-sans scale-90 truncate max-w-full text-[#555555] font-semibold">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {activeFlow.selectedPosePack && (
              <button
                onClick={() => onStepChange(isKit ? 5 : 5)} // if kit: go to Step 5 (video), else Step 5 (review, but wait: index is 5 for video, 6 for review)
                className="bg-[#111111] hover:bg-neutral-800 text-white text-xs font-semibold py-2 px-4 rounded"
              >
                Выбрать этот пакет поз →
              </button>
            )}
          </div>
        )}

        {/* Step 6: Video Template (For kit credits only) */}
        {currentStepIndex === 5 && isKit && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Шаг 6: Видео-шаблон (15 секунд, 9:16)</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
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
                    className={`border p-4 rounded-lg space-y-3 cursor-pointer transition-all ${isSelected ? 'border-[#111111] bg-neutral-50' : 'border-[#D7D7D7] hover:border-black'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold">{tmpl.name}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-neutral-900 text-white rounded px-1.5 font-bold uppercase tracking-wider">Выбран</span>
                      )}
                    </div>
                    
                    <div className="aspect-[9/16] max-h-48 bg-[#F1F1F1] border rounded flex flex-col justify-center items-center text-center p-3 relative overflow-hidden">
                      <Play size={20} className="text-[#111111]" />
                      <span className="text-[10px] font-mono mt-2 text-neutral-400 uppercase tracking-widest">{tmpl.specs}</span>
                    </div>

                    <p className="text-[11px] text-[#555555] leading-relaxed">{tmpl.description}</p>
                  </div>
                );
              })}
            </div>

            {activeFlow.selectedVideoTemplate && (
              <button
                onClick={() => onStepChange(6)}
                className="bg-[#111111] hover:bg-neutral-800 text-white text-xs font-semibold py-2 px-4 rounded"
              >
                Выбрать этот видео-шаблон →
              </button>
            )}
          </div>
        )}

        {/* Step 7: Final Review Brief & Checkout Reservation launch trigger */}
        {((currentStepIndex === 5 && !isKit) || currentStepIndex === 6) && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Финальный обзор продакшена (Бриф)</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Пожалуйста, внимательно изучите состав заказа. Запуск зарезервирует один кредит с баланса Вашего аккаунта.
              </p>
            </div>

            <div className="border border-[#D7D7D7] rounded-lg p-5 bg-neutral-50 text-xs space-y-4">
              <span className="block font-bold text-neutral-500 uppercase tracking-widest text-[10px]">Сводный бриф заказа</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 divide-y sm:divide-y-0 divide-[#F1F1F1]">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Название образа:</span>
                    <span className="font-semibold">{activeFlow.lookName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Модель:</span>
                    <span className="font-semibold">{activeFlow.selectedModel?.name} ({activeFlow.selectedModel?.gender})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Комплект одежды:</span>
                    <span className="font-semibold truncate max-w-[120px]">{activeFlow.selectedKit?.name}</span>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 sm:pt-0">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Свет и локация:</span>
                    <span className="font-semibold">{activeFlow.selectedLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Управляемый свет:</span>
                    <div className="flex gap-1">
                      <span className="bg-white border text-[10px] px-1 rounded">{activeFlow.locationSettings.temperature}</span>
                      <span className="bg-white border text-[10px] px-1 rounded">{activeFlow.locationSettings.hardness}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Направление поз:</span>
                    <span className="font-semibold">{activeFlow.selectedPosePack}</span>
                  </div>
                  {isKit && (
                    <div className="flex justify-between border-t border-dashed border-[#D7D7D7] pt-1 mt-1">
                      <span className="text-neutral-500">Видео-шаблон (15c):</span>
                      <span className="font-semibold font-mono text-[#111111]">{activeFlow.selectedVideoTemplate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reserved accounts warning */}
              <div className="p-3.5 bg-neutral-900 text-white rounded-lg font-mono text-[11px] leading-relaxed flex justify-between items-center">
                <span>
                  Будет зарезервирован на время генерации: <strong className="text-amber-300">1 {isKit ? 'комплект' : 'фото'}-кредит</strong>
                </span>
                <span className="text-neutral-400">Списание только после Ready</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  onLaunchProduction(activeFlow.type);
                }}
                className="bg-[#111111] hover:bg-neutral-800 text-white font-bold py-3 px-6 rounded text-xs tracking-wider uppercase transition-all"
              >
                Создать {isKit ? 'production-комплект (Фото + Видео)' : '7 готовых фото'} →
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 3. Right Column: Overview Drawer panel */}
      <div className="w-full md:w-[280px] bg-neutral-50 border-t md:border-t-0 md:border-l border-[#D7D7D7] p-5 space-y-5 text-xs shrink-0 select-none">
        <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">Черновик в прямом эфире</span>

        {/* Selected model overview details */}
        <div className="space-y-3">
          <span className="block border-b border-[#D7D7D7] pb-1 font-bold text-neutral-500 uppercase tracking-widest text-[9px]">
            AI Модель
          </span>
          {activeFlow.selectedModel ? (
            <div className="bg-white p-2.5 border border-[#D7D7D7] rounded space-y-1">
              <div className="font-semibold text-neutral-800">{activeFlow.selectedModel.name}</div>
              <div className="text-[#555555] font-mono text-[10px]">
                {activeFlow.selectedModel.gender} • {activeFlow.selectedModel.age} • {activeFlow.selectedModel.ethnotype}
              </div>
            </div>
          ) : (
            <div className="text-[#888888] italic">Модель не зафиксирована</div>
          )}
        </div>

        {/* Wardrobe files status */}
        <div className="space-y-3">
          <span className="block border-b border-[#D7D7D7] pb-1 font-bold text-neutral-500 uppercase tracking-widest text-[9px]">
            Комплект вещей
          </span>
          {activeFlow.selectedKit ? (
            <div className="bg-white p-2.5 border border-[#D7D7D7] rounded space-y-1">
              <div className="font-semibold text-neutral-800 max-w-[180px] truncate">{activeFlow.selectedKit.name}</div>
              <div className="text-[#555555] font-mono text-[10px]">{activeFlow.selectedKit.items.length} фото в усадке</div>
            </div>
          ) : (
            <div className="text-[#888888] italic">Одежда не укомплектована</div>
          )}
        </div>

        {/* Selected location details */}
        <div className="space-y-3">
          <span className="block border-b border-[#D7D7D7] pb-1 font-bold text-neutral-500 uppercase tracking-widest text-[9px]">
            Локация и свет
          </span>
          {activeFlow.selectedLocation ? (
            <div className="bg-white p-2.5 border border-[#D7D7D7] rounded space-y-1.5 leading-normal">
              <div className="font-semibold text-neutral-800">{activeFlow.selectedLocation}</div>
              <div className="flex gap-1 flex-wrap">
                <span className="bg-neutral-100 border text-[9px] px-1 rounded">{activeFlow.locationSettings.temperature}</span>
                <span className="bg-neutral-100 border text-[9px] px-1 rounded">{activeFlow.locationSettings.hardness}</span>
                <span className="bg-neutral-100 border text-[9px] px-1 rounded">{activeFlow.locationSettings.intensity}</span>
              </div>
            </div>
          ) : (
            <div className="text-[#888888] italic">География не выбрана</div>
          )}
        </div>

        {/* pose direction check */}
        <div className="space-y-3">
          <span className="block border-b border-[#D7D7D7] pb-1 font-bold text-neutral-500 uppercase tracking-widest text-[9px]">
            Позы
          </span>
          {activeFlow.selectedPosePack ? (
            <div className="bg-white p-2.5 border border-[#D7D7D7] rounded font-semibold text-neutral-800">
              {activeFlow.selectedPosePack}
            </div>
          ) : (
            <div className="text-[#888888] italic">Позы не зафиксированы</div>
          )}
        </div>

        {/* missing indicators validator blocks */}
        <div className="pt-4 border-t border-[#D7D7D7] space-y-2">
          {getMissingItemsList().length > 0 ? (
            <div className="bg-[#FFFBEB] p-3 border border-[#F59E0B] rounded-lg space-y-1">
              <span className="font-semibold text-amber-900 block font-sans">Требуется заполнить:</span>
              <ul className="list-disc pl-4 text-[10.5px] font-mono text-amber-800 leading-normal">
                {getMissingItemsList().map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-[#ECFDF5] p-3 border border-[#10B981] rounded-lg text-emerald-800 font-semibold font-sans">
              ✓ Бриф заказа полностью укомплектован! Готов к списанию в очереди.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
