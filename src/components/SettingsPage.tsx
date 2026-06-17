import React from 'react';
import { InterfaceLanguage, LedgerItem } from '../types';
import { Settings, ShieldCheck, Mail, Sliders, RefreshCw, Trash2 } from 'lucide-react';

interface SettingsPageProps {
  userEmail: string;
  photoCredits: number;
  kitCredits: number;
  ledger: LedgerItem[];
  onLogout: () => void;
  onClearStorage: () => void;
}

export default function SettingsPage({
  userEmail,
  photoCredits,
  kitCredits,
  ledger,
  onLogout,
  onClearStorage
}: SettingsPageProps) {
  const [persistedBrandName, setPersistedBrandName] = React.useState(() => {
    return localStorage.getItem('modai_brand_name') || 'My Custom Apparel Brand';
  });
  const [brandName, setBrandName] = React.useState(persistedBrandName);
  const [showNotification, setShowNotification] = React.useState(false);

  const hasChanges = brandName.trim() !== persistedBrandName.trim();

  const handleSave = () => {
    if (hasChanges) {
      localStorage.setItem('modai_brand_name', brandName.trim());
      setPersistedBrandName(brandName.trim());
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 4000);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 font-sans text-[#111111]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Настройки кабинета</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Управление вашим брендом, доступом и историей операций.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white border border-[#D7D7D7] rounded-lg p-5 space-y-4 md:col-span-2">
          <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-neutral-100 pb-2">
            <Mail size={16} />
            Данные бренда
          </h3>

          <div className="space-y-4">
            {showNotification && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded p-3 flex items-center gap-2.5 animate-in fade-in duration-200">
                <ShieldCheck className="text-emerald-600 shrink-0" size={16} />
                <span className="font-medium">Изменения успешно сохранены!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Контактный Email
              </label>
              <input
                type="text"
                readOnly
                value={userEmail}
                className="w-full bg-neutral-50 border border-[#D7D7D7] rounded p-2 text-xs font-mono text-neutral-700 cursor-not-allowed"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Email используется для отправки уведомлений о готовности ZIP архивов.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Название бренда / Компании
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full bg-white border border-[#D7D7D7] focus:border-black focus:outline-none rounded p-2 text-xs transition-colors"
                placeholder="Введите название бренда"
              />
            </div>
            
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`font-semibold text-xs py-2 px-4 rounded transition-all select-none ${
                  hasChanges 
                    ? 'bg-[#111111] text-white hover:bg-neutral-800 cursor-pointer active:scale-95' 
                    : 'bg-neutral-100 text-neutral-400 border border-[#EDEDED] cursor-not-allowed'
                }`}
              >
                Сохранить настройки
              </button>
            </div>
          </div>
        </div>

        {/* Security / Stats Card */}
        <div className="space-y-6">
          <div className="bg-white border border-[#D7D7D7] rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-neutral-100 pb-2">
              <ShieldCheck size={16} />
              Статус тарифа
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Пакетный лимит:</span>
                <span className="font-semibold text-neutral-800">Безлимит на хранение</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Срок действия:</span>
                <span className="font-semibold text-[#111111]">17.06.2027</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Доступные фотосессии:</span>
                <span className="font-bold text-neutral-900">{photoCredits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Доступные комплекты:</span>
                <span className="font-bold text-neutral-900">{kitCredits}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#D7D7D7] rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-bold text-red-900 flex items-center gap-1.5 border-b border-red-50 pb-2">
              <Trash2 size={16} className="text-red-700" />
              Опасная зона
            </h3>
            <p className="text-[11px] text-[#555555] leading-relaxed">
              Вы можете полностью стереть локальные настройки прототипа для симуляции первого входа с нуля.
            </p>
            <button
              onClick={() => {
                if(confirm('Вы действительно хотите стереть все локальные данные прототипа, включая баланс и созданные модели?')) {
                  onClearStorage();
                }
              }}
              className="w-full bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold py-2 rounded transition-colors"
            >
              Сбросить прототип (localStorage)
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
