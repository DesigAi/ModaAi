import React, { useState } from 'react';
import { Look } from '../types';
import { Sparkles, Users, Calendar, Trash2, ArrowRight, Pencil, Check, X, AlertTriangle } from 'lucide-react';

interface LooksPageProps {
  looks: Look[];
  onStartProductionWithLook: (look: Look) => void;
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
              onClick={() => onStartProductionWithLook({ id: 'dummy', name: 'temp', modelId: '', modelName: '', kitId: '', kitName: '', previewUrl: '', createdAt: '' })}
              className="bg-[#C9A35F] text-[#050505] hover:bg-[#D4B474] active:bg-[#A88444] text-xs font-semibold py-2 px-4 rounded-[6px] transition-colors cursor-pointer"
            >
              Запустить первый продакшен
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {looks.map((look) => (
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
                          className="p-0.5 rounded text-[#8B8B93] hover:text-[#C9A35F] hover:bg-[#16161A] md:opacity-0 group-hover:opacity-100 transition-all cursor-pointer inline-flex items-center justify-center shrink-0"
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
                    className="p-1 text-[#8B8B93] hover:text-[#C97878] rounded-[4px] hover:bg-[#1D1D21] transition-all opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer inline-flex items-center justify-center"
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
                  onClick={() => onStartProductionWithLook(look)}
                  className="w-full h-[40px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] font-sans font-semibold text-sm rounded-[6px] flex items-center justify-center transition-all select-none active:translate-y-[1px] cursor-pointer"
                >
                  <span>Ускоренная съемка образа</span>
                </button>
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
}
