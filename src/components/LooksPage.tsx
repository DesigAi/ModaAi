import React from 'react';
import { Look } from '../types';
import { Sparkles, Users, Calendar, Trash2, ArrowRight } from 'lucide-react';

interface LooksPageProps {
  looks: Look[];
  onStartProductionWithLook: (look: Look) => void;
  onDeleteLook: (id: string) => void;
  onNavigateToTariffs: () => void;
  hasCredits: boolean;
}

export default function LooksPage({
  looks,
  onStartProductionWithLook,
  onDeleteLook,
  onNavigateToTariffs,
  hasCredits
}: LooksPageProps) {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans text-[#111111]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ваши сохраненные образы</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Мгновенный перезапуск съемок. Образ объединяет готовую AI-модель и комплект вещей.
        </p>
      </div>

      {looks.length === 0 ? (
        <div className="bg-white border border-[#D7D7D7] rounded-lg p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 bg-[#F1F1F1] rounded-full flex items-center justify-center mx-auto">
            <Users className="text-neutral-500" size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-md font-bold">У вас пока нет сохраненных образов</h3>
            <p className="text-xs text-neutral-400">
              Они автоматически создаются на шаге 3 во время прохождения нового продакшена.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onStartProductionWithLook({ id: 'dummy', name: 'temp', modelId: '', modelName: '', kitId: '', kitName: '', previewUrl: '', createdAt: '' })}
              className="bg-[#111111] text-white hover:bg-neutral-800 text-xs font-semibold py-2 px-4 rounded"
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
              className="bg-white border border-[#D7D7D7] rounded-lg p-5 flex flex-col justify-between hover:border-[#111111] transition-all relative group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#111111] transition-colors">
                      {look.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono mt-1">
                      <Calendar size={11} />
                      <span>{look.createdAt}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteLook(look.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 rounded hover:bg-neutral-50 transition-all opacity-0 group-hover:opacity-100"
                    title="Удалить образ"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Simulated grayscale outfit preview box */}
                <div className="aspect-[4/3] bg-[#F1F1F1] border border-[#D7D7D7] rounded p-4 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
                  {/* Human shape skeleton styling in grayscale representation */}
                  <div className="w-12 h-12 rounded-full border border-[#A8A8A8] bg-[#F6F6F6] text-[9px] flex items-center justify-center font-bold text-neutral-500">
                    O
                  </div>
                  <div className="w-20 h-10 border border-[#A8A8A8] bg-white rounded text-[10px] flex items-center justify-center font-bold text-[#555555]">
                    [Ткань]
                  </div>
                  
                  <span className="text-[10px] font-semibold text-neutral-500 font-mono bg-[#E5E5E5] px-2 py-0.5 rounded uppercase mt-2">
                    {look.previewUrl}
                  </span>
                </div>

                {/* Sub-item data summary */}
                <div className="space-y-1.5 pt-2 border-t border-[#F1F1F1] text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Модель:</span>
                    <span className="font-semibold">{look.modelName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Комплект вещей:</span>
                    <span className="font-semibold truncate max-w-[150px]">{look.kitName}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => onStartProductionWithLook(look)}
                  className="w-full bg-[#111111] hover:bg-neutral-800 text-white font-medium text-xs py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles size={13} />
                  Ускоренная съемка образа →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Speed dial informational banner */}
      <div className="bg-neutral-50 border border-[#D7D7D7] p-5 rounded-lg space-y-2 text-xs leading-relaxed max-w-3xl">
        <h4 className="font-bold text-neutral-900">Как это работает?</h4>
        <p className="text-neutral-600">
          Ускоренная съемка позволяет пропустить ручные этапы создания модели и подготовки черновиков гардероба. Вы сразу прыгаете на шаг выбора <strong>Локации</strong>, настройки <strong>Освещения</strong> и направления <strong>Поз</strong>. Попробуйте этот сценарий, чтобы сократить время сборки следующих партий каталогов на 80%!
        </p>
      </div>
    </div>
  );
}
