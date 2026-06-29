import React, { useState } from 'react';
import { Look } from '../types';
import { Sparkles, Users, Calendar, Trash2, ArrowRight, Pencil, Check, X, AlertTriangle, Camera, Film, ChevronLeft, ChevronRight } from 'lucide-react';

interface LooksPageProps {
  looks: Look[];
  onStartProductionWithLook: (look: Look, type: 'photo' | 'kit') => void;
  onDeleteLook: (id: string) => void;
  onUpdateLookName: (id: string, newName: string) => void;
  onNavigateToTariffs: () => void;
  hasCredits: boolean;
}

export default function LooksPage({
  looks,
  onStartProductionWithLook,
  onDeleteLook,
  onUpdateLookName,
  onNavigateToTariffs,
  hasCredits
}: LooksPageProps) {
  const [editingLookId, setEditingLookId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [lookIdToDelete, setLookIdToDelete] = useState<string | null>(null);
  const [selectedLookForAction, setSelectedLookForAction] = useState<Look | null>(null);
  const [activePage, setActivePage] = useState<number>(1);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(looks.length / itemsPerPage);
  const currentPageResolved = Math.min(activePage, Math.max(1, totalPages));
  const startIdx = (currentPageResolved - 1) * itemsPerPage;
  const paginatedLooks = looks.slice(startIdx, startIdx + itemsPerPage);

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

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans text-[#F8F8F8]">
      <div>
        <h1 className="text-2xl font-display font-medium tracking-tight text-[#F8F8F8]">Ваши сохраненные образы</h1>
        <p className="text-sm text-[#8B8B93] mt-1">
          Мгновенный перезапуск съемок. Образ объединяет готовую AI-модель и комплект вещей.
        </p>
      </div>

      {looks.length === 0 ? (
        <div className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 bg-[#16161A] rounded-full flex items-center justify-center mx-auto">
            <Users className="text-[#C9A35F]" size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-md font-display font-medium text-[#F8F8F8]">У вас пока нет сохраненных образов</h3>
            <p className="text-xs text-[#8B8B93]">
              Они автоматически создаются на шаге 3 во время прохождения нового продакшена.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onStartProductionWithLook({ id: 'dummy', name: 'temp', modelId: '', modelName: '', kitId: '', kitName: '', previewUrl: '', createdAt: '' }, 'photo')}
              className="bg-[#C9A35F] text-[#050505] hover:bg-[#D4B474] active:bg-[#A88444] text-xs font-semibold py-2 px-4 rounded-[6px] transition-colors cursor-pointer"
            >
              Запустить первый продакшен
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paginatedLooks.map((look) => (
              <div
                key={look.id}
                className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-5 flex flex-col justify-between hover:border-[#C9A35F] transition-all relative group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {editingLookId === look.id ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                               if (editingName.trim()) {
                                  onUpdateLookName(look.id, editingName.trim());
                                  setEditingLookId(null);
                                }
                              }
                              if (e.key === 'Escape') setEditingLookId(null);
                            }}
                            className="bg-[#16161A] border border-[#C9A35F] rounded-[4px] px-2 py-0.5 text-xs text-[#F8F8F8] focus:outline-none focus:ring-1 focus:ring-[#C9A35F] w-full font-display font-medium"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              if (editingName.trim()) {
                                onUpdateLookName(look.id, editingName.trim());
                                setEditingLookId(null);
                              }
                            }}
                            className="p-1 bg-[#C9A35F] text-[#050505] hover:bg-[#D4B474] rounded-[4px] cursor-pointer shrink-0 inline-flex items-center justify-center"
                            title="Сохранить"
                          >
                            <Check size={11} />
                          </button>
                          <button
                            onClick={() => setEditingLookId(null)}
                            className="p-1 bg-[#16161A] border border-[rgba(255,255,255,0.08)] hover:bg-[#1D1D21] rounded-[4px] text-[#8B8B93] hover:text-[#F8F8F8] cursor-pointer shrink-0 inline-flex items-center justify-center"
                            title="Отмена"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group/title cursor-pointer max-w-full">
                          <h3 
                            className="text-sm font-display font-medium text-[#F8F8F8] hover:text-[#C9A35F] transition-colors truncate"
                            onClick={() => {
                              setEditingName(look.name);
                              setEditingLookId(look.id);
                            }}
                          >
                            {look.name}
                          </h3>
                          <button
                            onClick={() => {
                              setEditingName(look.name);
                              setEditingLookId(look.id);
                            }}
                            className="p-0.5 rounded text-[#8B8B93] hover:text-[#C9A35F] hover:bg-[#16161A] lg:opacity-0 group-hover:opacity-100 transition-all cursor-pointer inline-flex items-center justify-center shrink-0"
                            title="Редактировать название"
                          >
                            <Pencil size={11} />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] text-[#8B8B93] font-mono mt-1">
                        <Calendar size={11} className="text-[#C9A35F]" />
                        <span>{look.createdAt}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setLookIdToDelete(look.id)}
                      className="p-1 text-[#8B8B93] hover:text-[#C97878] rounded-[4px] hover:bg-[#1D1D21] transition-all lg:opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer inline-flex items-center justify-center"
                      title="Удалить образ"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Simulated grayscale outfit preview box */}
                  <div className="aspect-[4/3] bg-[#16161A] border border-[rgba(255,255,255,0.08)] rounded-[6px] p-4 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
                    {/* Human shape skeleton styling in grayscale representation */}
                    <div className="w-12 h-12 rounded-full border border-[rgba(255,255,255,0.12)] bg-[#1A1A1D] text-[9px] flex items-center justify-center font-bold text-[#8B8B93]">
                      O
                    </div>
                    <div className="w-20 h-10 border border-[rgba(255,255,255,0.12)] bg-[#1A1A1D] rounded-[4px] text-[10px] flex items-center justify-center font-bold text-[#B5B5BC]">
                      [Ткань]
                    </div>
                    
                    <span className="text-[10px] font-semibold text-[#C9A35F] font-mono bg-[rgba(201,163,95,0.12)] border border-[rgba(201,163,95,0.15)] px-2 py-0.5 rounded-[4px] uppercase mt-2">
                      {look.previewUrl}
                    </span>
                  </div>

                  {/* Sub-item data summary */}
                  <div className="space-y-1.5 pt-2 border-t border-[rgba(255,255,255,0.08)] text-xs font-sans">
                    <div className="flex justify-between">
                      <span className="text-[#8B8B93]">Модель:</span>
                      <span className="font-semibold text-[#F8F8F8]">{look.modelName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8B8B93]">Комплект вещей:</span>
                      <span className="font-semibold text-[#F8F8F8] truncate max-w-[150px]">{look.kitName}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <button
                    onClick={() => setSelectedLookForAction(look)}
                    className="w-full h-[40px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] font-sans font-semibold text-sm rounded-[6px] flex items-center justify-center transition-all select-none active:translate-y-[1px] cursor-pointer"
                  >
                    <span>Ускоренная съемка образа</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.08)] pt-4 mt-6">
              <span className="text-[12px] text-[#8B8B93] select-none text-center sm:text-left">
                Показано {startIdx + 1}–{Math.min(startIdx + itemsPerPage, looks.length)} из {looks.length}
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

      {/* Speed dial informational banner */}
      <div className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] p-5 rounded-[8px] space-y-2 text-xs leading-relaxed max-w-3xl">
        <h4 className="font-display font-medium text-[#C9A35F]">Как это работает?</h4>
        <p className="text-[#B5B5BC]">
          Ускоренная съемка позволяет пропустить ручные этапы создания модели и подготовки черновиков гардероба. Вы сразу прыгаете на шаг выбора <strong className="text-[#F8F8F8]">Локации</strong>, настройки <strong className="text-[#F8F8F8]">Освещения</strong> и направления <strong className="text-[#F8F8F8]">Поз</strong>. Попробуйте этот сценарий, чтобы сократить время сборки следующих партий каталогов на 80%!
        </p>
      </div>

      {/* Deletion Confirmation Modal */}
      {lookIdToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div 
            className="w-full max-w-md bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(201,120,120,0.1)] border border-[rgba(201,120,120,0.2)] flex items-center justify-center text-[#C97878] shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-display font-medium text-[#F8F8F8]">
                  Удалить сохраненный образ?
                </h3>
                <p className="text-xs text-[#8B8B93] leading-relaxed">
                  Вы собираетесь удалить образ <strong className="text-[#F8F8F8]">«{looks.find(l => l.id === lookIdToDelete)?.name || ''}»</strong>. Это действие нельзя отменить.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLookIdToDelete(null)}
                className="px-4 py-2 bg-[#16161A] border border-[rgba(255,255,255,0.08)] hover:bg-[#1D1D21] text-xs font-semibold rounded-[6px] text-[#F8F8F8] transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteLook(lookIdToDelete);
                  setLookIdToDelete(null);
                }}
                className="px-4 py-2 bg-[#C97878] hover:bg-[#D98888] active:bg-[#A95858] text-[#F8F8F8] text-xs font-semibold rounded-[6px] transition-colors cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Choice Modal (Photo vs Kit) for Fast production */}
      {selectedLookForAction && (
        <div 
          onClick={() => setSelectedLookForAction(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div 
            className="w-full max-w-lg bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-lg font-display font-medium text-[#F8F8F8]">
                  Ускоренная съемка образа
                </h3>
                <p className="text-xs text-[#8B8B93]">
                  Выберите формат работы для образа: <strong className="text-[#F8F8F8]">«{selectedLookForAction.name}»</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedLookForAction(null)}
                className="p-1 rounded bg-[#16161A] text-[#8B8B93] hover:text-[#F8F8F8] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option Photo */}
              <div
                onClick={() => {
                  onStartProductionWithLook(selectedLookForAction, 'photo');
                  setSelectedLookForAction(null);
                }}
                className="border border-[rgba(255,255,255,0.08)] hover:border-[#C9A35F] bg-[#16161A] hover:bg-[rgba(201,163,95,0.04)] p-4 rounded-[8px] space-y-3 cursor-pointer transition-all group/opt flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#1D1D21] border border-[rgba(255,255,255,0.05)] text-[#8B8B93] group-hover/opt:text-[#C9A35F] group-hover/opt:border-[#C9A35F] flex items-center justify-center transition-colors">
                    <Camera size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#F8F8F8] group-hover/opt:text-[#C9A35F] transition-colors font-display">Фотосессия</h4>
                    <p className="text-[11px] text-[#8B8B93] leading-normal mt-1">
                      7 разноплановых кадров высокого качества. Идеально для каталогов.
                    </p>
                  </div>
                </div>
                <div className="pt-2 flex justify-between items-center border-t border-[rgba(255,255,255,0.05)] text-[10px] uppercase font-mono">
                  <span className="text-[#8B8B93]">Стоимость:</span>
                  <span className="text-[#C9A35F] font-bold">1 фото-кредит</span>
                </div>
              </div>

              {/* Option Kit */}
              <div
                onClick={() => {
                  onStartProductionWithLook(selectedLookForAction, 'kit');
                  setSelectedLookForAction(null);
                }}
                className="border border-[rgba(255,255,255,0.08)] hover:border-[#C9A35F] bg-[#16161A] hover:bg-[rgba(201,163,95,0.04)] p-4 rounded-[8px] space-y-3 cursor-pointer transition-all group/opt flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#1D1D21] border border-[rgba(255,255,255,0.05)] text-[#8B8B93] group-hover/opt:text-[#C9A35F] group-hover/opt:border-[#C9A35F] flex items-center justify-center transition-colors">
                    <Film size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#F8F8F8] group-hover/opt:text-[#C9A35F] transition-colors font-display">Комплект (Фото + Видео)</h4>
                    <p className="text-[11px] text-[#8B8B93] leading-normal mt-1">
                      7 кадров + 15с промо-видеоролик высокого разрешения.
                    </p>
                  </div>
                </div>
                <div className="pt-2 flex justify-between items-center border-t border-[rgba(255,255,255,0.05)] text-[10px] uppercase font-mono">
                  <span className="text-[#8B8B93]">Стоимость:</span>
                  <span className="text-[#C9A35F] font-bold">1 комплект-кредит</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
