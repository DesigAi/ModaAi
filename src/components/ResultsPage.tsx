import React, { useState } from 'react';
import { ResultItem, ResultState, LedgerItem } from '../types';
import { LayoutGrid, Download, Play, RefreshCw, AlertTriangle, MessageSquare, Info, Star, ShieldCheck, X, CheckSquare, Plus, Activity, ExternalLink } from 'lucide-react';

interface ResultsPageProps {
  results: ResultItem[];
  onUpdateResultStatus: (id: string, status: ResultState, extraData?: Partial<ResultItem>) => void;
  onRefundCredit: (result: ResultItem) => void;
  onManualFixComplete: (result: ResultItem) => void;
  onGrantCompensation: (type: 'photo' | 'kit') => void;
  onConfirmSpendDirect: (result: ResultItem) => void;
  onStartWithLookId: (lookId: string, resultItem?: ResultItem) => void;
}

export default function ResultsPage({
  results,
  onUpdateResultStatus,
  onRefundCredit,
  onManualFixComplete,
  onGrantCompensation,
  onConfirmSpendDirect,
  onStartWithLookId
}: ResultsPageProps) {
  const [filter, setFilter] = useState<'all' | 'photo' | 'kit' | 'processing' | 'failed'>('all');
  const [selectedResult, setSelectedResult] = useState<ResultItem | null>(null);

  const filteredResults = results.filter((res) => {
    if (res.isHidden) return false;
    if (filter === 'photo') return res.type === 'photo';
    if (filter === 'kit') return res.type === 'kit';
    if (filter === 'processing') return ['queued', 'processing', 'quality_check', 'archive_preparing', 'regenerating'].includes(res.status);
    if (filter === 'failed') return ['failed', 'support_required'].includes(res.status);
    return true;
  });

  const getStatusBadge = (status: ResultState) => {
    switch (status) {
      case 'queued':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 border border-neutral-300 text-neutral-800">В очереди</span>;
      case 'processing':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 border border-neutral-300 text-neutral-800 animate-pulse">Генерация</span>;
      case 'quality_check':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 border border-amber-200 text-amber-800 font-mono">Проверка качества</span>;
      case 'archive_preparing':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-50 border border-neutral-200 text-neutral-700">Подготовка ZIP</span>;
      case 'ready':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-900 text-white font-semibold">Готово</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 border border-red-200 text-red-800">Ошибка</span>;
      case 'regenerating':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 border border-amber-300 text-amber-900 animate-pulse">Перегенерация</span>;
      case 'support_required':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 border border-red-300 text-red-900">Техподдержка</span>;
    }
  };

  const simulateStatusChange = (resultId: string, status: ResultState) => {
    let extra: Partial<ResultItem> = {};
    if (status === 'ready') {
      // Mock images
      extra.images = [
        'Поза 1: Фронтальный ракурс',
        'Поза 2: Левый полуоборот',
        'Поза 3: Правый полуоборот',
        'Поза 4: Ракурс спины',
        'Поза 5: Портретная деталь',
        'Поза 6: Фокус на ткань',
        'Поза 7: Динамичный шаг'
      ];
      if (selectedResult?.type === 'kit') {
        extra.videoUrl = '15-секундное вертикальное AI-видео (1080p)';
      }
    }
    
    onUpdateResultStatus(resultId, status, extra);
    
    // update state locally inside drawer
    if (selectedResult && selectedResult.id === resultId) {
      setSelectedResult((prev) => prev ? { ...prev, status, ...extra } : null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans text-[#111111]">
      
      {/* Header and Counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#D7D7D7] pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">История результатов</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Скачивайте готовые fashion-фото и 15-секундные вертикальные видео.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[#D7D7D7] -mb-1 overflow-x-auto gap-4">
        {[
          { id: 'all', label: 'Все' },
          { id: 'photo', label: '7 фото' },
          { id: 'kit', label: 'Комплекты' },
          { id: 'processing', label: 'В процессе' },
          { id: 'failed', label: 'Ошибка' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${filter === tab.id ? 'border-[#111111] text-[#111111]' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results Listing Grid */}
      <div className="pt-6">
        {filteredResults.length === 0 ? (
          <div className="bg-white border border-[#D7D7D7] rounded-lg p-12 text-center max-w-md mx-auto space-y-4">
            <LayoutGrid className="text-neutral-400 mx-auto" size={32} />
            <div>
              <h3 className="text-sm font-bold">Результатов пока нет</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                Запустите новый продакшен или воспользуйтесь инструментами начисления кредитов в тарифах.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredResults.map((res) => (
              <div
                key={res.id}
                onClick={() => setSelectedResult(res)}
                className="bg-white border border-[#D7D7D7] rounded-lg p-5 space-y-4 hover:border-black cursor-pointer select-none transition-all relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-sm font-bold leading-tight">{res.name}</h3>
                      <span className="text-[10px] text-neutral-400 font-mono block mt-1">{res.date}</span>
                    </div>
                    <div>
                      {getStatusBadge(res.status)}
                    </div>
                  </div>
  
                  {/* Main representation preview based on state */}
                  <div className="aspect-[4/3] bg-[#F1F1F1] border border-[#D7D7D7] rounded flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    
                    {res.status === 'ready' ? (
                      <div className="w-full h-full flex flex-col justify-between p-1">
                        <div className="grid grid-cols-4 gap-1 flex-1">
                          {[1, 2, 3, 4].map((num) => (
                            <div key={num} className="bg-white border border-[#D7D7D7] rounded flex items-center justify-center text-[9px] font-mono font-bold text-neutral-500">
                              F{num}
                            </div>
                          ))}
                        </div>
                        
                        {res.type === 'kit' && (
                          <div className="bg-[#111111] text-white opacity-90 py-1.5 text-center text-[9px] font-mono rounded font-bold mt-2 uppercase flex items-center justify-center gap-1.5">
                            <Play size={11} className="fill-current text-white" />
                            <span>▶ 15с Видео-комплект</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <RefreshCw size={20} className={`text-neutral-400 mx-auto ${['processing', 'quality_check', 'archive_preparing', 'regenerating'].includes(res.status) ? 'animate-spin' : ''}`} />
                        <span className="text-[10px] font-mono text-neutral-500 block uppercase tracking-wider">
                          {res.status === 'queued' && 'Ожидание места в очереди...'}
                          {res.status === 'processing' && 'Маскирование и наложение...'}
                          {res.status === 'quality_check' && 'Проверка сопряжений кожи...'}
                          {res.status === 'archive_preparing' && 'Сборка фотоархива...'}
                          {res.status === 'failed' && 'Генерация прервана'}
                          {res.status === 'regenerating' && 'Автоисправление брака...'}
                          {res.status === 'support_required' && 'Решается инженером поддержки'}
                        </span>
                      </div>
                    )}
                  </div>
  
                  {/* Parameters list metadata summary */}
                  <div className="pt-2 border-t border-[#F1F1F1] grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] leading-tight text-[#555555]">
                    <div>
                      <span className="text-neutral-400 block font-light">Образ:</span>
                      <span className="font-semibold block text-[#111111] truncate">{res.lookName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block font-light">Локация:</span>
                      <span className="font-semibold block text-[#111111] truncate">{res.location}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block font-light">Модель:</span>
                      <span className="font-semibold block text-[#111111] truncate">{res.modelName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block font-light">Тип:</span>
                      <span className="font-semibold block text-[#111111] uppercase font-mono text-[9px]">
                        {res.type === 'photo' ? '7 фото' : 'комплект'}
                      </span>
                    </div>
                  </div>
                </div>
  
                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-[#F1F1F1] flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedResult(res);
                    }}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200 border border-[#D7D7D7] text-[#111111] font-semibold text-xs py-2 px-3 rounded text-center"
                  >
                    Открыть
                  </button>
                  {res.status === 'ready' && (
                    <a
                      href="#zip-download"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert('Скачивание ZIP-архива с исходными 7 фотографиями (симуляция)');
                      }}
                      className="p-2 border border-[#D7D7D7] bg-white hover:bg-neutral-50 rounded"
                      title="Скачать ZIP"
                    >
                      <Download size={13} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Detail Drawer Container */}
      {selectedResult && (
        <div 
          onClick={() => setSelectedResult(null)}
          className="fixed inset-0 z-50 bg-black/60 flex justify-end font-sans cursor-pointer animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-2xl h-full flex flex-col justify-between overflow-y-auto border-l border-[#D7D7D7] p-6 shadow-xl relative animate-in slide-in-from-right duration-200 text-[#111111] cursor-default"
          >
            <div className="space-y-6">
              
              {/* Header drawer controls */}
              <div className="flex justify-between items-start border-b border-[#D7D7D7] pb-4">
                <div>
                  <h2 className="text-base font-bold">{selectedResult.name}</h2>
                  <span className="text-[11px] font-mono text-neutral-400">ID операции: {selectedResult.id} • {selectedResult.date}</span>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="p-1 hover:bg-neutral-100 rounded text-neutral-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Info cards */}
              <div className="p-4 rounded-lg bg-[#F6F6F6] border border-[#D7D7D7] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Текущее состояние</span>
                  {getStatusBadge(selectedResult.status)}
                </div>

                {/* Progress Timelines for Photos vs Kits */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-mono text-neutral-500 uppercase">Лог технологических этапов</span>
                  
                  {selectedResult.type === 'photo' ? (
                    <div className="grid grid-cols-7 gap-1 font-mono text-[9px] text-center text-neutral-400 leading-none">
                      <div className={`p-1 border rounded ${['queued', 'processing', 'quality_check', 'archive_preparing', 'ready'].includes(selectedResult.status) ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-neutral-50 border-neutral-200'}`}>В очереди</div>
                      <div className={`p-1 border rounded ${['processing', 'quality_check', 'archive_preparing', 'ready'].includes(selectedResult.status) ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-neutral-50 border-neutral-200'}`}>Подготовка</div>
                      <div className={`p-1 border rounded ${['processing', 'quality_check', 'archive_preparing', 'ready'].includes(selectedResult.status) ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-neutral-50 border-neutral-200'}`}>Образ</div>
                      <div className={`p-1 border rounded ${['processing', 'quality_check', 'archive_preparing', 'ready'].includes(selectedResult.status) ? 'bg-[#111111] text-white border-black font-semibold animate-pulse' : 'bg-neutral-50 border-neutral-200'}`}>Ген 7 ф.</div>
                      <div className={`p-1 border rounded ${['quality_check', 'archive_preparing', 'ready'].includes(selectedResult.status) ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-neutral-50 border-neutral-200'}`}>Контроль</div>
                      <div className={`p-1 border rounded ${['archive_preparing', 'ready'].includes(selectedResult.status) ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-neutral-50 border-neutral-200'}`}>ZIP</div>
                      <div className={`p-1 border rounded ${selectedResult.status === 'ready' ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-neutral-50 border-neutral-200'}`}>Готово</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-8 gap-1 font-mono text-[8px] text-center text-neutral-400 leading-none">
                      <div className={`p-1 border rounded ${['queued', 'processing', 'quality_check', 'archive_preparing', 'ready'].includes(selectedResult.status) ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-neutral-50 border-neutral-200'}`}>В очереди</div>
                      <div className={`p-1 border rounded ${['processing', 'quality_check', 'archive_preparing', 'ready'].includes(selectedResult.status) ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-neutral-50 border-neutral-200'}`}>Подготовка</div>
                      <div className={`p-1 border rounded ${['processing', 'quality_check', 'archive_preparing', 'ready'].includes(selectedResult.status) ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-neutral-50 border-neutral-200'}`}>Образ</div>
                      <div className={`p-1 border rounded ${['processing', 'quality_check', 'archive_preparing', 'ready'].includes(selectedResult.status) ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-neutral-50 border-neutral-200'}`}>Ген 7 ф.</div>
                      <div className={`p-1 border rounded ${['processing', 'quality_check', 'archive_preparing', 'ready'].includes(selectedResult.status) ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-neutral-50 border-neutral-200'}`}>Видео 15с</div>
                      <div className={`p-1 border rounded ${['quality_check', 'archive_preparing', 'ready'].includes(selectedResult.status) ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-neutral-50 border-neutral-200'}`}>Контроль</div>
                      <div className={`p-1 border rounded ${['archive_preparing', 'ready'].includes(selectedResult.status) ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-neutral-50 border-neutral-200'}`}>Сборка ZIP</div>
                      <div className={`p-1 border rounded ${selectedResult.status === 'ready' ? 'bg-[#111111] text-white border-black font-semibold' : 'bg-neutral-50 border-neutral-200'}`}>Готово</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content Layout Depending on Status */}
              <div className="space-y-4">
                <span className="block text-xs font-bold text-neutral-500 uppercase">Обзор контента продакшена</span>

                {selectedResult.status === 'ready' ? (
                  <div className="space-y-4 bg-neutral-50 border border-[#D7D7D7] p-4 rounded-lg">
                    {/* Skeleton photos lists */}
                    <div className="grid grid-cols-3 gap-2">
                      {selectedResult.images.map((caption, index) => (
                        <div key={index} className="aspect-[4/5] bg-white border border-[#D3D3D3] rounded p-2 flex flex-col justify-between items-center relative overflow-hidden">
                          <CheckSquare className="text-neutral-500 self-end" size={13} />
                          <span className="text-[9px] text-[#555555] font-semibold text-center leading-tight py-1 font-mono">{caption}</span>
                          <span className="text-[9px] text-neutral-400 font-mono tracking-wide uppercase">Кадр {index + 1}</span>
                        </div>
                      ))}
                    </div>

                    {selectedResult.type === 'kit' && selectedResult.videoUrl && (
                      <div className="bg-neutral-950 p-4 rounded-lg text-white space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono tracking-widest text-[#888888] uppercase">15-секундный видео-шаблон (9:16)</span>
                          <span className="text-[10px] bg-[#A8A8A8] text-neutral-900 font-bold px-2 py-0.5 rounded uppercase">MP4</span>
                        </div>
                        <div className="border border-neutral-800 rounded p-6 flex flex-col items-center justify-center text-center space-y-2 bg-neutral-900/60">
                          <Play size={20} className="text-white fill-current" />
                          <span className="text-xs font-semibold">{selectedResult.videoUrl}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">Применены настройки: {selectedResult.location} • Spain Lights Direction</span>
                        </div>
                        <div className="flex justify-end gap-1.5 pt-2">
                          <button
                            onClick={() => alert('Скачивание 15-секундного видеофайла')}
                            className="bg-white text-neutral-900 hover:bg-neutral-100 font-bold text-xs py-1.5 px-3 rounded flex items-center gap-1"
                          >
                            Скачать со звуком
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#D7D7D7] flex flex-wrap justify-between items-center gap-2">
                      <span className="text-xs text-neutral-500">Все 7 изображений прошли автоматическую проверку ModAI Quality Check</span>
                      <button
                        onClick={() => alert('Скачивание архива ZIP (симуляция)')}
                        className="bg-[#111111] hover:bg-neutral-800 text-white font-medium text-xs py-2 px-4 rounded flex items-center gap-1"
                      >
                        <Download size={14} />
                        Скачать все фото (ZIP)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-[#A8A8A8] rounded-lg p-10 flex flex-col items-center justify-center text-center space-y-3 text-neutral-500 bg-neutral-50">
                    <RefreshCw size={24} className={`animate-spin text-neutral-400`} />
                    <h4 className="text-sm font-bold text-neutral-900">Идет подготовка AI материалов</h4>
                    <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
                      Как только роботы закончат рендеринг складок одежды и совмещение конечностей, здесь появится готовый пак.
                    </p>
                  </div>
                )}
              </div>

              {/* Parameters List Detail */}
              <div className="space-y-3 bg-[#F6F6F6] border border-[#D7D7D7] rounded-lg p-5 text-xs">
                <span className="block font-bold text-neutral-500 uppercase tracking-widest text-[9px]">Параметры съемки</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-neutral-400 font-light block">Образ:</span>
                    <span className="font-semibold block">{selectedResult.lookName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-light block">Локация / Настройка:</span>
                    <span className="font-semibold block">{selectedResult.location}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-light block">Направление поз:</span>
                    <span className="font-semibold block">{selectedResult.posePack}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-light block">Связанная модель:</span>
                    <span className="font-semibold block">{selectedResult.modelName}</span>
                  </div>
                </div>
              </div>

              {/* SUPPORT REQUIRED NOTICES BLOCK */}
              {selectedResult.status === 'support_required' && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-4 space-y-3 text-xs">
                  <div className="flex gap-2 text-red-800 font-medium">
                    <AlertTriangle size={18} className="shrink-0 text-red-600" />
                    <div>
                      <p className="font-bold">Генерация перенаправлена инженерам поддержки</p>
                      <p className="text-[11px] leading-relaxed mt-0.5">
                        Автоматический рендер выдал критическое смещение узора на складках или деформацию пальцев (ModAI Quality Check 0.74). Мы перепроверим съемку вручную. Выполнять повторное списание не требуется.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-red-200">
                    <span className="block text-[10px] font-bold text-red-900 uppercase mb-2">
                      Решение поддержки (Инструменты тестов):
                    </span>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      <button
                        onClick={() => {
                          onRefundCredit(selectedResult);
                          alert('Резерв отменен: Кредит возвращен на баланс аккаунта!');
                          setSelectedResult(null);
                        }}
                        className="bg-white border border-red-200 hover:bg-neutral-100 text-red-700 px-2.5 py-1.5 rounded"
                      >
                        Вернуть кредит на баланс
                      </button>
                      <button
                        onClick={() => {
                          onManualFixComplete(selectedResult);
                          alert('Ручное исправление завершено: Результат помечен как готовый!');
                          setSelectedResult(null);
                        }}
                        className="bg-neutral-900 text-white hover:bg-neutral-800 px-2.5 py-1.5 rounded"
                      >
                        Подтвердить ручное исправление
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Fast Track Simulator Options at the very bottom */}
              <div className="bg-[#FFFBEB] p-4 border border-amber-300 rounded-lg space-y-3">
                <span className="block text-[11px] font-bold text-amber-900 uppercase">
                  Симулировать действия процессинга (Sandbox)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => simulateStatusChange(selectedResult.id, 'ready')}
                    className="text-[10px] bg-white border border-amber-400 hover:bg-neutral-50 p-1 rounded font-mono"
                  >
                    Готово (Ready)
                  </button>
                  <button
                    onClick={() => simulateStatusChange(selectedResult.id, 'failed')}
                    className="text-[10px] bg-white border border-amber-400 hover:bg-neutral-50 p-1 rounded font-mono"
                  >
                    Ошибка (Failed)
                  </button>
                  <button
                    onClick={() => simulateStatusChange(selectedResult.id, 'quality_check')}
                    className="text-[10px] bg-white border border-amber-400 hover:bg-neutral-50 p-1 rounded font-mono"
                  >
                    Проверка качества
                  </button>
                  <button
                    onClick={() => simulateStatusChange(selectedResult.id, 'regenerating')}
                    className="text-[10px] bg-white border border-amber-400 hover:bg-neutral-50 p-1 rounded font-mono"
                  >
                    Перегенерация
                  </button>
                  <button
                    onClick={() => simulateStatusChange(selectedResult.id, 'support_required')}
                    className="text-[10px] bg-white border border-amber-400 hover:bg-neutral-50 p-1 rounded font-mono"
                  >
                    Статус поддержки
                  </button>
                </div>
              </div>

            </div>

            <div className="border-t border-[#D7D7D7] pt-4 mt-6 flex justify-between">
              {selectedResult.status === 'ready' && (
                <button
                  onClick={() => {
                    onStartWithLookId(selectedResult.lookId, selectedResult);
                    setSelectedResult(null);
                  }}
                  className="bg-[#111111] hover:bg-neutral-800 text-white font-medium text-xs py-2 px-4 rounded"
                >
                  Создать еще из этого образа →
                </button>
              )}
              <button
                onClick={() => setSelectedResult(null)}
                className="border border-[#D7D7D7] hover:bg-neutral-100 text-xs py-2 px-4 rounded ml-auto"
              >
                Вернуться к результатам
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
