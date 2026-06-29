import React from 'react';
import { LayoutGrid, Settings, LogOut, Sparkles, Coins, Users } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  photoSetCredits: number;
  kitCredits: number;
  reservedPhotoSetCredits: number;
  reservedKitCredits: number;
  userEmail: string;
  onLogout: () => void;
  onNewProductionClick: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  photoSetCredits,
  kitCredits,
  reservedPhotoSetCredits,
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
    <div className="hidden lg:flex w-[248px] bg-[#0F0F11] border-r border-[rgba(255,255,255,0.08)] flex-col h-full shrink-0">
      {/* Upper Area: Logo */}
      <div className="p-5 border-b border-[rgba(255,255,255,0.08)] flex items-center">
        <span className="font-display font-medium text-lg tracking-tight text-[#F8F8F8]">ModaAI</span>
      </div>

      {/* Primary Action Button */}
      <div className="p-4">
        <button
          onClick={onNewProductionClick}
          className="w-full h-[40px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] font-sans font-semibold text-sm rounded-[6px] flex items-center justify-center transition-all select-none active:translate-y-[1px] cursor-pointer"
        >
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
              className={`relative w-full h-[40px] flex items-center gap-3 px-3 rounded-[6px] text-sm font-sans font-medium transition-colors text-left ${
                isActive 
                  ? 'bg-[rgba(201,163,95,0.12)] text-[#F8F8F8]' 
                  : 'text-[#8B8B93] hover:bg-[#1D1D21] hover:text-[#F8F8F8]'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#C9A35F] rounded-r" />
              )}
              <Icon size={16} className={isActive ? 'text-[#C9A35F]' : 'text-[#8B8B93]'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Lower Area: Credit Balance Panel */}
      <div className="p-4 border border-[rgba(255,255,255,0.08)] bg-[#16161A] m-3 rounded-[8px] space-y-3">
        <div className="text-[10px] font-sans font-bold text-[#8B8B93] uppercase tracking-wider">
          Баланс аккаунта
        </div>
        
        <div className="space-y-2 text-xs font-sans font-medium">
          <div className="flex items-center justify-between">
            <span className="text-[#B5B5BC]">Фото-кредиты:</span>
            <div className="text-right">
              <span className="text-[#F8F8F8] font-bold font-mono">{photoSetCredits}</span>
              {reservedPhotoSetCredits > 0 && (
                <span className="block text-[10px] text-[#8B8B93] font-normal">({reservedPhotoSetCredits} в резерве)</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#B5B5BC]">Комплект-кредиты:</span>
            <div className="text-right">
              <span className="text-[#F8F8F8] font-bold font-mono">{kitCredits}</span>
              {reservedKitCredits > 0 && (
                <span className="block text-[10px] text-[#8B8B93] font-normal">({reservedKitCredits} в резерве)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile & Logout section */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#0F0F11] flex items-center justify-between gap-2 overflow-hidden shrink-0">
        <div className="min-w-0 pr-1">
          <span className="block text-xs font-sans font-semibold text-[#F8F8F8] truncate">{userEmail}</span>
          <span className="block text-[10px] text-[#8B8B93] uppercase font-sans">Брендовый аккаунт</span>
        </div>
        <button
          onClick={onLogout}
          title="Выйти из кабинета"
          className="p-1.5 hover:bg-[#1D1D21] rounded-[6px] text-[#8B8B93] hover:text-[#C97878] transition-colors shrink-0"
        >
          <LogOut size={15} />
        </button>
      </div>
    </div>
  );
}
