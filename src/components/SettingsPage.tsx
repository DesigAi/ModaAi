import React from 'react';
import { InterfaceLanguage, LedgerItem } from '../types';
import { ShieldCheck, Mail, Trash2 } from 'lucide-react';

interface SettingsPageProps {
  userEmail: string;
  photoSetCredits: number;
  kitCredits: number;
  ledger: LedgerItem[];
  onLogout: () => void;
  onClearStorage: () => void;
}

export default function SettingsPage({
  userEmail,
  photoSetCredits,
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
    <div className="p-6 max-w-4xl mx-auto space-y-8 font-sans text-[#F8F8F8]">
      <div>
        <h1 className="text-2xl font-display font-medium tracking-tight text-[#F8F8F8]">Настройки кабинета</h1>
        <p className="text-sm text-[#8B8B93] mt-1">
          Управление вашим брендом, доступом и историей операций.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-5 space-y-4 md:col-span-2">
          <h3 className="text-sm font-display font-medium flex items-center gap-1.5 border-b border-[rgba(255,255,255,0.08)] pb-2 text-[#F8F8F8]">
            <Mail size={16} className="text-[#C9A35F]" />
            Данные бренда
          </h3>

          <div className="space-y-4">
            {showNotification && (
              <div className="bg-[rgba(120,169,138,0.12)] border border-[rgba(120,169,138,0.2)] text-[#78A98A] text-xs rounded-[6px] p-3 flex items-center gap-2.5 animate-in fade-in duration-200 font-medium">
                <ShieldCheck className="text-[#78A98A] shrink-0" size={16} />
                <span>Изменения успешно сохранены!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#B5B5BC] mb-1.5">
                Контактный Email
              </label>
              <input
                type="text"
                readOnly
                value={userEmail}
                className="w-full bg-[#16161A] border border-[rgba(255,255,255,0.08)] rounded-[6px] p-2.5 text-xs font-mono text-[#8B8B93] cursor-not-allowed"
              />
              <span className="text-[10px] text-[#818188] mt-1.5 block leading-normal">
                Email используется для отправки уведомлений о готовности ZIP архивов.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B5B5BC] mb-1.5">
                Название бренда / Компании
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full bg-[#16161A] border border-[rgba(255,255,255,0.12)] focus:border-[#C9A35F] focus:outline-none focus:shadow-[0_0_0_3px_rgba(201,163,95,0.12)] rounded-[6px] p-2.5 text-xs text-[#F8F8F8] placeholder-[#8B8B93] transition-all"
                placeholder="Введите название бренда"
              />
            </div>
            
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`h-[36px] px-4 rounded-[6px] text-xs font-medium transition-all select-none cursor-pointer ${
                  hasChanges 
                    ? 'bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] active:translate-y-[1px]' 
                    : 'bg-[#16161A] text-[#5F5F66] border border-[rgba(255,255,255,0.08)] cursor-not-allowed'
                }`}
              >
                Сохранить настройки
              </button>
            </div>
          </div>
        </div>

        {/* Security / Stats Card */}
        <div className="space-y-6">
          <div className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-5 space-y-3">
            <h3 className="text-sm font-display font-medium flex items-center gap-1.5 border-b border-[rgba(255,255,255,0.08)] pb-2 text-[#F8F8F8]">
              <ShieldCheck size={16} className="text-[#C9A35F]" />
              Статус тарифа
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#B5B5BC]">Пакетный лимит:</span>
                <span className="font-semibold text-[#F8F8F8]">Безлимит на хранение</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B5B5BC]">Срок действия:</span>
                <span className="font-semibold text-[#F8F8F8]">17.06.2027</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B5B5BC]">Фото-кредиты:</span>
                <span className="font-bold text-[#C9A35F] font-mono">{photoSetCredits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B5B5BC]">Комплект-кредиты:</span>
                <span className="font-bold text-[#C9A35F] font-mono">{kitCredits}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-5 space-y-3">
            <h3 className="text-sm font-display font-medium text-[#C97878] flex items-center gap-1.5 border-b border-[rgba(201,120,120,0.12)] pb-2">
              <Trash2 size={16} className="text-[#C97878]" />
              Опасная зона
            </h3>
            <p className="text-[11px] text-[#8B8B93] leading-relaxed font-sans">
              Вы можете полностью стереть локальные настройки прототипа для симуляции первого входа с нуля.
            </p>
            <button
              onClick={() => {
                if(confirm('Вы действительно хотите стереть все локальные данные прототипа, включая баланс и созданные модели?')) {
                  onClearStorage();
                }
              }}
              className="w-full bg-[rgba(201,120,120,0.12)] hover:bg-[rgba(201,120,120,0.2)] text-[#C97878] border border-[rgba(201,120,120,0.3)] text-xs font-semibold py-2 rounded-[6px] transition-colors cursor-pointer"
            >
              Сбросить прототип (localStorage)
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
