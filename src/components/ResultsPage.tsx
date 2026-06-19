import React, { useState } from 'react';
import { ResultItem, ResultState, LedgerItem } from '../types';
import { LayoutGrid, Download, Play, RefreshCw, AlertTriangle, MessageSquare, Info, Star, ShieldCheck, X, CheckSquare, Plus, Activity, ExternalLink, Pencil, Check, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [activePage, setActivePage] = useState<number>(1);
  const [selectedResult, setSelectedResult] = useState<ResultItem | null>(null);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const activeResult = selectedResult ? (results.find(r => r.id === selectedResult.id) || selectedResult) : null;

  const filteredResults = results.filter((res) => {
    if (res.isHidden) return false;
    if (filter === 'photo') return res.type === 'photo';
    if (filter === 'kit') return res.type === 'kit';
    if (filter === 'processing') return ['queued', 'processing', 'quality_check', 'archive_preparing', 'regenerating'].includes(res.status);
    if (filter === 'failed') return ['failed', 'support_required'].includes(res.status);
    return true;
  });

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const currentPageResolved = Math.min(activePage, Math.max(1, totalPages));
  const startIdx = (currentPageResolved - 1) * itemsPerPage;
  const paginatedResults = filteredResults.slice(startIdx, startIdx + itemsPerPage);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const range = 1; // Number of pages on each side of the active page
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPageResolved - range && i <= currentPageResolved + range)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const getStatusBadge = (status: ResultState) => {
    switch (status) {
      case 'queued':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#16161A] border border-[rgba(255,255,255,0.08)] text-[#8B8B93] font-mono">В очереди</span>;
      case 'processing':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#16161A] border border-[rgba(255,255,255,0.12)] text-[#C9A35F] animate-pulse font-mono">Генерация</span>;
      case 'quality_check':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#16161A] border border-[rgba(255,255,255,0.12)] text-[#78A98A] font-mono">Проверка качества</span>;
      case 'archive_preparing':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#16161A] border border-[rgba(255,255,255,0.08)] text-[#B5B5BC] font-mono">Подготовка ZIP</span>;
      case 'ready':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[rgba(201,163,95,0.12)] border border-[rgba(201,163,95,0.2)] text-[#C9A35F] font-mono font-bold">Готово</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[rgba(201,120,120,0.12)] border border-[rgba(201,120,120,0.2)] text-[#C97878] font-mono">Ошибка</span>;
      case 'regenerating':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#16161A] border border-[rgba(201,163,95,0.2)] text-[#C9A35F] animate-pulse font-mono">Перегенерация</span>;
      case 'support_required':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[rgba(201,120,120,0.12)] border border-[rgba(201,120,120,0.2)] text-[#C97878] font-mono font-bold">Техподдержка</span>;
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
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans text-[#F8F8F8]">
      
      {/* Header and Counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium tracking-tight text-[#F8F8F8]">История результатов</h1>
          <p className="text-sm text-[#8B8B93] mt-1">
            Скачивайте готовые fashion-фото и 15-секундные вертикальные видео.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 md:gap-3 border-b border-[rgba(255,255,255,0.08)] pb-4">
        {[
          { id: 'all', label: 'Все' },
          { id: 'photo', label: '7 фото' },
          { id: 'kit', label: 'Комплекты' },
          { id: 'processing', label: 'В процессе' },
          { id: 'failed', label: 'Ошибка' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setFilter(tab.id as any);
              setActivePage(1);
            }}
            className={`px-3.5 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-semibold rounded-[6px] transition-all cursor-pointer border ${
              filter === tab.id
                ? 'bg-[#C9A35F] border-[#C9A35F] text-[#050505] shadow-lg shadow-[rgba(201,163,95,0.15)] font-bold'
                : 'bg-[#16161A] border-[rgba(255,255,255,0.08)] text-[#8B8B93] hover:text-[#F8F8F8] hover:border-[rgba(255,255,255,0.2)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results Listing Grid */}
      <div className="pt-2">
        {filteredResults.length === 0 ? (
          <div className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-12 text-center max-w-md mx-auto space-y-4">
            <LayoutGrid className="text-[#8B8B93] mx-auto animate-pulse" size={32} />
            <div>
              <h3 className="text-sm font-semibold text-[#F8F8F8]">Результатов пока нет</h3>
              <p className="text-xs text-[#8B8B93] leading-relaxed mt-1.5 font-sans">
                Запустите новый продакшен или воспользуйтесь инструментами начисления кредитов в тарифах.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paginatedResults.map((res) => (
                <div
                  key={res.id}
                  onClick={() => setSelectedResult(res)}
                  className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-5 space-y-4 hover:border-[#C9A35F] cursor-pointer select-none transition-all relative flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-sm font-display font-medium leading-tight text-[#F8F8F8]">{res.name}</h3>
                        <span className="text-[10px] text-[#8B8B93] font-mono block mt-1">{res.date}</span>
                      </div>
                      <div>
                        {getStatusBadge(res.status)}
                      </div>
                    </div>
    
                    {/* Main representation preview based on state */}
                    <div className="aspect-[4/3] bg-[#16161A] border border-[rgba(255,255,255,0.08)] rounded-[6px] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                      
                      {res.status === 'ready' ? (
                        <div className="w-full h-full flex flex-col justify-between p-1">
                          <div className="grid grid-cols-4 gap-1 flex-1">
                            {[1, 2, 3, 4].map((num) => (
                              <div key={num} className="bg-[#1A1A1D] border border-[rgba(255,255,255,0.05)] rounded-[4px] flex items-center justify-center text-[10px] font-mono font-bold text-[#8B8B93]">
                                F{num}
                              </div>
                            ))}
                          </div>
                          
                          {res.type === 'kit' && (
                            <div className="bg-[rgba(201,163,95,0.12)] border border-[rgba(201,163,95,0.2)] text-[#C9A35F] py-1.5 text-center text-[9px] font-mono rounded-[4px] font-bold mt-2 uppercase flex items-center justify-center gap-1.5">
                              <span>▶ 15с Видео-комплект</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <RefreshCw size={20} className={`text-[#8B8B93] mx-auto ${['processing', 'quality_check', 'archive_preparing', 'regenerating'].includes(res.status) ? 'animate-spin' : ''}`} />
                          <span className="text-[10px] font-mono text-[#8B8B93] block uppercase tracking-wider">
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
                    <div className="pt-2 border-t border-[rgba(255,255,255,0.08)] grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] leading-tight text-[#B5B5BC] font-sans">
                      <div>
                        <span className="text-[#8B8B93] block font-light">Образ:</span>
                        <span className="font-semibold block text-[#F8F8F8] truncate">{res.lookName}</span>
                      </div>
                      <div>
                        <span className="text-[#8B8B93] block font-light">Локация:</span>
                        <span className="font-semibold block text-[#F8F8F8] truncate">{res.location}</span>
                      </div>
                      <div>
                        <span className="text-[#8B8B93] block font-light">Модель:</span>
                        <span className="font-semibold block text-[#F8F8F8] truncate">{res.modelName}</span>
                      </div>
                      <div>
                        <span className="text-[#8B8B93] block font-light">Тип:</span>
                        <span className="font-semibold block text-[#F8F8F8] uppercase font-mono text-[9px]">
                          {res.type === 'photo' ? '7 фото' : 'комплект'}
                        </span>
                      </div>
                    </div>
                  </div>
    
                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-[rgba(255,255,255,0.08)] flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResult(res);
                      }}
                      className="flex-1 bg-[#16161A] hover:bg-[#1D1D21] border border-[rgba(255,255,255,0.08)] text-[#F8F8F8] font-sans font-medium text-xs py-2 px-3 rounded-[6px] text-center transition-colors"
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
                        className="p-2 border border-[rgba(255,255,255,0.08)] bg-[#16161A] text-[#8B8B93] hover:text-[#C9A35F] rounded-[6px] transition-colors"
                        title="Скачать ZIP"
                      >
                        <Download size={13} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.08)] pt-4 mt-6">
                <span className="text-[12px] text-[#8B8B93] select-none text-center sm:text-left">
                  Показано {startIdx + 1}–{Math.min(startIdx + itemsPerPage, filteredResults.length)} из {filteredResults.length}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    disabled={currentPageResolved === 1}
                    onClick={() => setActivePage(currentPageResolved - 1)}
                    className="p-1.5 text-[#B5B5BC] bg-[#16161A] border border-[rgba(255,255,255,0.08)] hover:text-[#F8F8F8] hover:bg-[#1D1D21] disabled:opacity-40 disabled:hover:bg-[#16161A] disabled:hover:text-[#B5B5BC] rounded-[4px] cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {getPageNumbers().map((pg, idx) => {
                    if (pg === '...') {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="min-w-[28px] h-7 px-2 text-xs font-semibold text-[#8B8B93] flex items-center justify-center select-none"
                        >
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={pg}
                        onClick={() => setActivePage(Number(pg))}
                        className={`min-w-[28px] h-7 px-2 text-xs font-semibold rounded-[4px] cursor-pointer transition-colors ${
                          currentPageResolved === pg
                            ? 'bg-[#C9A35F] text-[#050505]'
                            : 'text-[#B5B5BC] bg-[#16161A] border border-[rgba(255,255,255,0.08)] hover:text-[#F8F8F8] hover:bg-[#1D1D21]'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  <button
                    disabled={currentPageResolved === totalPages}
                    onClick={() => setActivePage(currentPageResolved + 1)}
                    className="p-1.5 text-[#B5B5BC] bg-[#16161A] border border-[rgba(255,255,255,0.08)] hover:text-[#F8F8F8] hover:bg-[#1D1D21] disabled:opacity-40 disabled:hover:bg-[#16161A] disabled:hover:text-[#B5B5BC] rounded-[4px] cursor-pointer transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Slide-over Detail Drawer Container */}
      {selectedResult && (
        <div 
          onClick={() => setSelectedResult(null)}
          className="fixed inset-0 z-50 bg-black/80 flex justify-end font-sans cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F0F11] w-full max-w-2xl h-full flex flex-col justify-between overflow-y-auto border-l border-[rgba(255,255,255,0.12)] p-6 shadow-2xl relative animate-in slide-in-from-right duration-200 text-[#F8F8F8] cursor-default"
          >
            <div className="space-y-6">
              
              {/* Header drawer controls */}
              <div className="flex justify-between items-start border-b border-[rgba(255,255,255,0.08)] pb-4">
                <div className="flex-1 mr-4">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (activeResult && tempName.trim()) {
                              onUpdateResultStatus(activeResult.id, activeResult.status, { name: tempName.trim() });
                              setIsEditingName(false);
                            }
                          }
                          if (e.key === 'Escape') setIsEditingName(false);
                        }}
                        className="bg-[#16161A] border border-[#C9A35F] rounded-[6px] px-3 py-1 text-sm text-[#F8F8F8] focus:outline-none focus:ring-1 focus:ring-[#C9A35F] w-full max-w-[400px] font-display font-medium"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          if (activeResult && tempName.trim()) {
                            onUpdateResultStatus(activeResult.id, activeResult.status, { name: tempName.trim() });
                            setIsEditingName(false);
                          }
                        }}
                        className="p-1.5 bg-[#C9A35F] text-[#050505] hover:bg-[#D4B474] rounded-[4px] cursor-pointer inline-flex items-center justify-center"
                        title="Сохранить"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setIsEditingName(false)}
                        className="p-1.5 bg-[#16161A] border border-[rgba(255,255,255,0.08)] hover:bg-[#1D1D21] rounded-[4px] text-[#8B8B93] hover:text-[#F8F8F8] cursor-pointer inline-flex items-center justify-center"
                        title="Отмена"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group mt-1">
                      <h2 
                        className="text-base font-display font-medium text-[#F8F8F8] cursor-pointer hover:text-[#C9A35F] transition-colors"
                        onClick={() => {
                          if (activeResult) {
                            setTempName(activeResult.name);
                            setIsEditingName(true);
                          }
                        }}
                      >
                        {activeResult ? activeResult.name : selectedResult.name}
                      </h2>
                      <button
                        onClick={() => {
                          if (activeResult) {
                            setTempName(activeResult.name);
                            setIsEditingName(true);
                          }
                        }}
                        className="p-1 hover:bg-[#16161A] hover:text-[#C9A35F] rounded text-[#8B8B93] transition-all cursor-pointer inline-flex items-center justify-center"
                        title="Редактировать название"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  )}
                  <span className="text-[11px] font-mono text-[#8B8B93] block mt-1">ID операции: {selectedResult.id} • {selectedResult.date}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedResult(null);
                    setIsEditingName(false);
                  }}
                  className="p-1.5 hover:bg-[#1D1D21] rounded-[6px] text-[#8B8B93] transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Info card */}
              <div className="p-4 rounded-[8px] bg-[#16161A] border border-[rgba(255,255,255,0.08)] flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B8B93]">Статус</span>
                {selectedResult.status === 'ready' ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-[4px] text-xs font-bold bg-[rgba(201,163,95,0.12)] border border-[rgba(201,163,95,0.2)] text-[#C9A35F] font-mono">Готово</span>
                ) : ['failed', 'support_required'].includes(selectedResult.status) ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-[4px] text-xs font-bold bg-[rgba(201,120,120,0.12)] border border-[rgba(201,120,120,0.2)] text-[#C97878] font-mono">Ошибка</span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-[4px] text-xs font-bold bg-[rgba(201,163,95,0.05)] border border-[rgba(201,163,95,0.15)] text-[#C9A35F] animate-pulse font-mono">В процессе</span>
                )}
              </div>

              {/* Main Content Layout Depending on Status */}
              <div className="space-y-4">
                <span className="block text-xs font-bold text-[#8B8B93] uppercase tracking-wider">Обзор контента продакшена</span>

                {selectedResult.status === 'ready' ? (
                  <div className="space-y-4 bg-[#16161A] border border-[rgba(255,255,255,0.08)] p-4 rounded-[8px]">
                    {/* Skeleton photos lists */}
                    <div className="grid grid-cols-3 gap-2 pb-2">
                      {selectedResult.images.map((caption, index) => (
                        <div key={index} className="aspect-[4/5] bg-[#1A1A1D] border border-[rgba(255,255,255,0.05)] rounded-[6px] p-2 flex flex-col justify-between items-center relative overflow-hidden">
                          <CheckSquare className="text-[#C9A35F] self-end" size={13} />
                          <span className="text-[9px] text-[#B5B5BC] font-medium text-center leading-tight py-1 font-mono">{caption}</span>
                          <span className="text-[9px] text-[#8B8B93] font-mono tracking-wide uppercase">Кадр {index + 1}</span>
                        </div>
                      ))}
                    </div>

                    {selectedResult.type === 'kit' && selectedResult.videoUrl && (
                      <div className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] p-4 rounded-[8px] text-white space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono tracking-widest text-[#8B8B93] uppercase">15-секундный видео-шаблон (9:16)</span>
                          <span className="text-[10px] bg-[rgba(201,163,95,0.12)] border border-[rgba(201,163,95,0.2)] text-[#C9A35F] font-bold px-2 py-0.5 rounded uppercase">MP4</span>
                        </div>
                        <div className="border border-[rgba(255,255,255,0.05)] rounded-[6px] p-6 flex flex-col items-center justify-center text-center space-y-2 bg-[#16161A]">
                          <Play size={20} className="text-[#C9A35F] fill-current" />
                          <span className="text-xs font-semibold text-[#F8F8F8]">{selectedResult.videoUrl}</span>
                          <span className="text-[10px] text-[#8B8B93] font-mono">Применены настройки: {selectedResult.location} • Spain Lights Direction</span>
                        </div>
                        <div className="flex justify-end gap-1.5 pt-2">
                          <button
                            onClick={() => alert('Скачивание 15-секундного видеофайла')}
                            className="bg-[#C9A35F] hover:bg-[#D4B474] text-[#050505] font-semibold text-xs py-1.5 px-3 rounded-[6px]"
                          >
                            Скачать со звуком
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-[rgba(255,255,255,0.08)] flex flex-wrap justify-between items-center gap-2">
                      <span className="text-xs text-[#8B8B93]">Все 7 изображений прошли автоматическую проверку ModAI Quality Check</span>
                      <button
                        onClick={() => alert('Скачивание архива ZIP (симуляция)')}
                        className="h-[32px] bg-[#C9A35F] hover:bg-[#D4B474] text-[#050505] font-medium text-xs px-4 rounded-[6px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Download size={14} />
                        <span>Скачать все фото (ZIP)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-[rgba(255,255,255,0.12)] bg-[#16161A] rounded-[8px] p-10 flex flex-col items-center justify-center text-center space-y-3 text-[#8B8B93]">
                    <RefreshCw size={24} className="animate-spin text-[#C9A35F]" />
                    <h4 className="text-sm font-semibold text-[#F8F8F8]">Идет подготовка AI материалов</h4>
                    <p className="text-xs text-[#8B8B93] max-w-sm leading-relaxed">
                      Как только роботы закончат рендеринг складок одежды и совмещение конечностей, здесь появится готовый пак.
                    </p>
                  </div>
                )}
              </div>

              {/* Parameters List Detail */}
              <div className="space-y-3 bg-[#16161A] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-5 text-xs">
                <span className="block font-bold text-[#8B8B93] uppercase tracking-widest text-[9px]">Параметры съемки</span>
                <div className="grid grid-cols-2 gap-4 text-[#B5B5BC] font-sans">
                  <div>
                    <span className="text-[#8B8B93] font-light block">Образ:</span>
                    <span className="font-semibold block text-[#F8F8F8]">{selectedResult.lookName}</span>
                  </div>
                  <div>
                    <span className="text-[#8B8B93] font-light block">Локация / Настройка:</span>
                    <span className="font-semibold block text-[#F8F8F8]">{selectedResult.location}</span>
                  </div>
                  <div>
                    <span className="text-[#8B8B93] font-light block">Направление поз:</span>
                    <span className="font-semibold block text-[#F8F8F8]">{selectedResult.posePack}</span>
                  </div>
                  <div>
                    <span className="text-[#8B8B93] font-light block">Связанная модель:</span>
                    <span className="font-semibold block text-[#F8F8F8]">{selectedResult.modelName}</span>
                  </div>
                </div>
              </div>

              {/* SUPPORT REQUIRED NOTICES BLOCK */}
              {selectedResult.status === 'support_required' && (
                <div className="bg-[rgba(201,120,120,0.12)] border border-[rgba(201,120,120,0.2)] rounded-[8px] p-4 space-y-3 text-xs text-[#B5B5BC]">
                  <div className="flex gap-2.5 text-[#C97878] font-medium">
                    <AlertTriangle size={18} className="shrink-0 text-[#C97878]" />
                    <div>
                      <p className="font-bold">Генерация перенаправлена инженерам поддержки</p>
                      <p className="text-[11px] leading-relaxed mt-0.5">
                        Автоматический рендер выдал критическое смещение узора на складках или деформацию пальцев (ModAI Quality Check 0.74). Мы перепроверим съемку вручную. Выполнять повторное списание не требуется.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[rgba(201,120,120,0.15)]">
                    <span className="block text-[10px] font-bold text-[#C97878] uppercase mb-2">
                      Решение поддержки (Инструменты тестов):
                    </span>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      <button
                        onClick={() => {
                          onRefundCredit(selectedResult);
                          alert('Резерв отменен: Кредит возвращен на баланс аккаунта!');
                          setSelectedResult(null);
                        }}
                        className="bg-[#16161A] border border-[rgba(255,255,255,0.08)] hover:border-[#C97878] text-[#C97878] px-2.5 py-1.5 rounded-[4px] cursor-pointer transition-colors"
                      >
                        Вернуть кредит на баланс
                      </button>
                      <button
                        onClick={() => {
                          onManualFixComplete(selectedResult);
                          alert('Ручное исправление завершено: Результат помечен как готовый!');
                          setSelectedResult(null);
                        }}
                        className="bg-[#C9A35F] hover:bg-[#D4B474] text-[#050505] px-2.5 py-1.5 rounded-[4px] cursor-pointer transition-colors"
                      >
                        Подтвердить ручное исправление
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Fast Track Simulator Options at the very bottom */}
              <div className="bg-[rgba(201,163,95,0.08)] p-4 border border-[rgba(201,163,95,0.2)] rounded-[8px] space-y-3">
                <span className="block text-[10px] font-bold text-[#C9A35F] uppercase tracking-wider">
                  Симулировать действия процессинга (Sandbox)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => simulateStatusChange(selectedResult.id, 'ready')}
                    className="text-[10px] bg-[#16161A] border border-[rgba(255,255,255,0.08)] text-[#B5B5BC] hover:border-[#C9A35F] p-1.5 rounded-[4px] font-mono cursor-pointer transition-colors"
                  >
                    Готово (Ready)
                  </button>
                  <button
                    onClick={() => simulateStatusChange(selectedResult.id, 'failed')}
                    className="text-[10px] bg-[#16161A] border border-[rgba(255,255,255,0.08)] text-[#B5B5BC] hover:border-[#C9A35F] p-1.5 rounded-[4px] font-mono cursor-pointer transition-colors"
                  >
                    Ошибка (Failed)
                  </button>
                  <button
                    onClick={() => simulateStatusChange(selectedResult.id, 'quality_check')}
                    className="text-[10px] bg-[#16161A] border border-[rgba(255,255,255,0.08)] text-[#B5B5BC] hover:border-[#C9A35F] p-1.5 rounded-[4px] font-mono cursor-pointer transition-colors"
                  >
                    Проверка качества
                  </button>
                  <button
                    onClick={() => simulateStatusChange(selectedResult.id, 'regenerating')}
                    className="text-[10px] bg-[#16161A] border border-[rgba(255,255,255,0.08)] text-[#B5B5BC] hover:border-[#C9A35F] p-1.5 rounded-[4px] font-mono cursor-pointer transition-colors"
                  >
                    Перегенерация
                  </button>
                  <button
                    onClick={() => simulateStatusChange(selectedResult.id, 'support_required')}
                    className="text-[10px] bg-[#16161A] border border-[rgba(255,255,255,0.08)] text-[#B5B5BC] hover:border-[#C97878] p-1.5 rounded-[4px] font-mono cursor-pointer transition-colors"
                  >
                    Статус поддержки
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
