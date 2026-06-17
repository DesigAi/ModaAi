import React from 'react';
import { Camera, PackageOpen, LayoutGrid, HeartHandshake, Settings, LogOut, Sparkles, Coins, Users } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  photoCredits: number;
  kitCredits: number;
  reservedPhotoCredits: number;
  reservedKitCredits: number;
  userEmail: string;
  onLogout: () => void;
  onNewProductionClick: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  photoCredits,
  kitCredits,
  reservedPhotoCredits,
  reservedKitCredits,
  userEmail,
  onLogout,
  onNewProductionClick
}: SidebarProps) {
  const menuItems = [
    { id: 'create', label: 'Создать', icon: Sparkles },
    { id: 'looks', label: 'Образы', icon: Users },
    { id: 'results', label: 'Результаты', icon: LayoutGrid },
    { id: 'tariffs', label: 'Тарифы', icon: Coins },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="hidden md:flex w-[248px] bg-white border-r border-[#D7D7D7] flex-col h-full shrink-0">
      {/* Upper Area: Logo */}
      <div className="p-5 border-b border-[#F1F1F1] flex items-center justify-between">
        <div>
          <span className="font-bold text-lg tracking-tight text-[#111111]">ModAI Team</span>
          <span className="block text-[9px] font-mono leading-none tracking-widest text-[#888888] uppercase mt-0.5">
            work cabinet
          </span>
        </div>
        <span className="hidden md:inline bg-neutral-100 border border-[#D7D7D7] rounded px-1.5 py-0.5 text-[10px] font-mono text-neutral-500 uppercase">
          PROT
        </span>
      </div>

      {/* Primary Action Button */}
      <div className="p-4">
        <button
          onClick={onNewProductionClick}
          className="w-full bg-[#111111] hover:bg-neutral-800 text-white font-medium text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
        >
          <Camera size={15} />
          <span>Новый продакшен</span>
        </button>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${isActive ? 'bg-[#111111] text-white' : 'text-[#555555] hover:bg-[#F1F1F1] hover:text-[#111111]'}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Lower Area: Credit Balance Panel */}
      <div className="p-4 border-t border-[#F1F1F1] bg-[#F6F6F6] m-3 rounded-lg space-y-3">
        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
          Баланс аккаунта
        </div>
        
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-[#555555]">Фото-кредиты:</span>
          <div className="text-right">
            <span className="text-[#111111] font-bold font-mono">{photoCredits} кр.</span>
            {reservedPhotoCredits > 0 && (
              <span className="block text-[10px] text-neutral-400">({reservedPhotoCredits} в резерве)</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-medium pt-1.5 border-t border-dashed border-[#D7D7D7]">
          <span className="text-[#555555]">Комплекты:</span>
          <div className="text-right">
            <span className="text-[#111111] font-bold font-mono">{kitCredits} кр.</span>
            {reservedKitCredits > 0 && (
              <span className="block text-[10px] text-neutral-400">({reservedKitCredits} в резерве)</span>
            )}
          </div>
        </div>
      </div>

      {/* Profile & Logout section */}
      <div className="p-4 border-t border-[#F1F1F1] bg-white flex items-center justify-between gap-2 overflow-hidden shrink-0">
        <div className="min-w-0 pr-1">
          <span className="block text-xs font-semibold text-[#111111] truncate">{userEmail}</span>
          <span className="block text-[10px] text-neutral-400 uppercase">Брендовый аккаунт</span>
        </div>
        <button
          onClick={onLogout}
          title="Выйти из кабинета"
          className="p-1.5 hover:bg-neutral-100 rounded text-neutral-500 hover:text-red-600 transition-colors shrink-0"
        >
          <LogOut size={15} />
        </button>
      </div>
    </div>
  );
}
