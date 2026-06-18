import React, { useState } from 'react';
import { WardrobeItem, WardrobeKit, WardrobeItemCategory } from '../types';
import { Shirt, Trash2, EyeOff, Eye, Plus, FolderHeart, Info, Image, UploadCloud } from 'lucide-react';

interface WardrobePageProps {
  wardrobeItems: WardrobeItem[];
  wardrobeKits: WardrobeKit[];
  onAddKit: (kit: WardrobeKit) => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteKit: (kitId: string) => void;
  onToggleHideItem: (itemId: string) => void;
  onToggleHideKit: (kitId: string) => void;
}

export default function WardrobePage({
  wardrobeItems,
  wardrobeKits,
  onAddKit,
  onDeleteItem,
  onDeleteKit,
  onToggleHideItem,
  onToggleHideKit
}: WardrobePageProps) {
  const [filterType, setFilterType] = useState<'all' | 'items' | 'kits' | 'hidden'>('all');
  const [activeItemCategory, setActiveItemCategory] = useState<string>('all');
  const [showKitBuilder, setShowKitBuilder] = useState(false);

  // New kit creation state
  const [newKitName, setNewKitName] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  
  // Simulated file upload for simple sandbox addition
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState<WardrobeItemCategory>('dress');
  const [customItemSideType, setCustomItemSideType] = useState<any>('front');

  const categories = [
    { value: 'dress', label: 'Платье' },
    { value: 'suit', label: 'Костюм' },
    { value: 'top', label: 'Верх' },
    { value: 'bottom', label: 'Низ' },
    { value: 'outerwear', label: 'Верхняя одежда' },
    { value: 'belt', label: 'Ремень' },
    { value: 'glasses', label: 'Очки' },
    { value: 'hat', label: 'Головной убор' },
    { value: 'bag', label: 'Сумка' },
    { value: 'shoes', label: 'Обувь' },
    { value: 'jewelry', label: 'Украшение' },
  ];

  // Logic to calculate active item filters
  const filteredItems = wardrobeItems.filter((item) => {
    if (filterType === 'hidden') {
      return item.usageStatus === 'hidden';
    }
    if (item.usageStatus === 'hidden') return false;
    
    if (activeItemCategory !== 'all' && item.category !== activeItemCategory) return false;
    return filterType === 'all' || filterType === 'items';
  });

  const filteredKits = wardrobeKits.filter((kit) => {
    if (filterType === 'hidden') {
      return kit.usageStatus === 'hidden';
    }
    if (kit.usageStatus === 'hidden') return false;
    return filterType === 'all' || filterType === 'kits';
  });

  const handleCreateKit = () => {
    if (!newKitName.trim()) {
      alert('Пожалуйста, введите название комплекта одежды.');
      return;
    }
    if (selectedItemIds.length === 0) {
      alert('Выберите хотя бы одну вещь для создания комплекта.');
      return;
    }

    const itemsToAssemble = wardrobeItems.filter((itm) => selectedItemIds.includes(itm.id));
    const newKit: WardrobeKit = {
      id: `kit_${Date.now()}`,
      name: newKitName.trim(),
      items: itemsToAssemble,
      usageStatus: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddKit(newKit);
    setNewKitName('');
    setSelectedItemIds([]);
    setShowKitBuilder(false);
  };

  const toggleSelectToKit = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter((x) => x !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans text-[#F8F8F8]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium tracking-tight text-[#F8F8F8]">Гардероб и комплекты</h1>
          <p className="text-sm text-[#8B8B93] mt-1">
            Загружайте фотографии одежды, классифицируйте ракурсы съемки и собирайте готовые комплекты.
          </p>
        </div>
        <button
          onClick={() => setShowKitBuilder(!showKitBuilder)}
          className="h-[36px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] font-sans font-medium text-xs px-4 rounded-[6px] flex items-center gap-1.5 self-start transition-colors cursor-pointer"
        >
          <FolderHeart size={14} />
          <span>Собрать новый комплект</span>
        </button>
      </div>

      {/* Kit Constructor Sandbox Dialog */}
      {showKitBuilder && (
        <div className="bg-[#0F0F11] border-2 border-[#C9A35F] p-5 rounded-[8px] space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-medium text-[#F8F8F8] text-sm">Конструктор комплекта вещей</h3>
            <button
              onClick={() => setShowKitBuilder(false)}
              className="text-[#8B8B93] hover:text-[#F8F8F8] text-xs underline cursor-pointer transition-colors"
            >
              Закрыть
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#B5B5BC] mb-1.5">
                  Название комплекта вещей в каталоге
                </label>
                <input
                  type="text"
                  placeholder="Например: Летний костюм с шортами и очками"
                  value={newKitName}
                  onChange={(e) => setNewKitName(e.target.value)}
                  className="w-full bg-[#16161A] border border-[rgba(255,255,255,0.12)] p-2.5 text-xs text-[#F8F8F8] rounded-[6px] focus:outline-none focus:border-[#C9A35F]"
                />
              </div>

              <div className="p-3 bg-[#16161A] border border-[rgba(255,255,255,0.08)] rounded-[6px] text-xs space-y-1.5">
                <p className="text-[#8B8B93] text-[10px] uppercase font-bold tracking-wider">Выбрано вещей: {selectedItemIds.length}</p>
                {selectedItemIds.length === 0 ? (
                  <p className="text-[#8B8B93] italic">Сначала выберите вещи из списка справа.</p>
                ) : (
                  <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px] text-[#B5B5BC]">
                    {wardrobeItems
                      .filter((x) => selectedItemIds.includes(x.id))
                      .map((x) => (
                        <li key={x.id}>{x.name} ({x.sideType})</li>
                      ))}
                  </ul>
                )}
              </div>

              <button
                onClick={handleCreateKit}
                className="w-full h-[36px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] text-xs font-medium rounded-[6px] transition-colors cursor-pointer"
              >
                Сохранить комплект одежды
              </button>
            </div>

            {/* Select items lists from library */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-[#8B8B93] uppercase tracking-wider">Доступные вещи в библиотеке</span>
              <div className="max-h-[160px] overflow-y-auto border border-[rgba(255,255,255,0.08)] bg-[#16161A] rounded-[6px] divide-y divide-[rgba(255,255,255,0.05)]">
                {wardrobeItems
                  .filter((itm) => itm.usageStatus !== 'hidden')
                  .map((item) => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelectToKit(item.id)}
                        className={`p-2.5 font-sans text-xs transition-colors cursor-pointer flex items-center justify-between ${isSelected ? 'bg-[rgba(201,163,95,0.12)] text-[#F8F8F8] font-semibold' : 'hover:bg-[#1D1D21] text-[#B5B5BC]'}`}
                      >
                        <div>
                          <span>{item.name}</span>
                          <span className="text-[10px] text-[#8B8B93] block font-mono">Category: {item.category} • {item.sideType}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="mr-1 accent-[#C9A35F]"
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs and filter panel */}
      <div className="flex border-b border-[rgba(255,255,255,0.08)] -mb-1 overflow-x-auto gap-4">
        {[
          { id: 'all', label: 'Все элементы' },
          { id: 'items', label: 'Только вещи' },
          { id: 'kits', label: 'Комплекты' },
          { id: 'hidden', label: 'Скрытые / Архив' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`pb-2.5 px-1 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${filterType === tab.id ? 'border-[#C9A35F] text-[#C9A35F]' : 'border-transparent text-[#8B8B93] hover:text-[#F8F8F8]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-categories row (only active when displaying items) */}
      {(filterType === 'all' || filterType === 'items') && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveItemCategory('all')}
            className={`px-3 py-1 text-xs border rounded-full transition-all cursor-pointer ${activeItemCategory === 'all' ? 'bg-[#C9A35F] text-[#050505] border-[#C9A35F]' : 'bg-[#16161A] border-[rgba(255,255,255,0.08)] text-[#B5B5BC] hover:bg-[#1D1D21]'}`}
          >
            Все типы вещи
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveItemCategory(cat.value)}
              className={`px-3 py-1 text-xs border rounded-full transition-all cursor-pointer ${activeItemCategory === cat.value ? 'bg-[#C9A35F] text-[#050505] border-[#C9A35F]' : 'bg-[#16161A] border-[rgba(255,255,255,0.08)] text-[#B5B5BC] hover:bg-[#1D1D21]'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Primary Grid Area */}
      <div className="space-y-6">
        
        {/* Kits Sections */}
        {filteredKits.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#8B8B93] uppercase tracking-widest">Комплекты одежды в работе ({filteredKits.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredKits.map((kit) => (
                <div
                  key={kit.id}
                  className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-4 space-y-4 hover:border-[#C9A35F] transition-all relative group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-display font-medium text-[#F8F8F8]">{kit.name}</h4>
                      <span className="text-[10px] font-mono text-[#8B8B93] block mt-0.5">{kit.createdAt} • {kit.items.length} фото вещей</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onToggleHideKit(kit.id)}
                        className="p-1.5 border border-[rgba(255,255,255,0.08)] bg-[#16161A] text-[#8B8B93] hover:text-[#F8F8F8] transition-colors rounded-[4px]"
                        title={kit.usageStatus === 'hidden' ? 'Восстановить в библиотеке' : 'Скрыть из библиотеки'}
                      >
                        {kit.usageStatus === 'hidden' ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                      <button
                        onClick={() => onDeleteKit(kit.id)}
                        className="p-1.5 border border-[rgba(255,255,255,0.08)] bg-[#16161A] text-[#8B8B93] hover:bg-[rgba(201,120,120,0.12)] hover:text-[#C97878] hover:border-[rgba(201,120,120,0.2)] rounded-[4px] transition-colors"
                        title="Удалить навсегда"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Wireframe components list inside kit */}
                  <div className="grid grid-cols-4 gap-1.5 bg-[#16161A] p-2.5 rounded-[6px] border border-[rgba(255,255,255,0.08)]">
                    {kit.items.map((itm, index) => (
                      <div key={index} className="aspect-square bg-[#1A1A1D] border border-[rgba(255,255,255,0.05)] rounded-[4px] flex flex-col items-center justify-center text-center p-1 relative">
                        <span className="text-[9px] font-mono font-bold leading-none scale-90 text-[#C9A35F]">{itm.sideType}</span>
                        <Shirt size={10} className="text-[#8B8B93] mt-1" />
                      </div>
                    ))}
                    {kit.items.length === 0 && (
                      <span className="text-[10px] text-[#8B8B93] italic col-span-4 block text-center">Пустой комплект</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individual Items section */}
        {filteredItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#8B8B93] uppercase tracking-widest">Индивидуальные кадры заготовок ({filteredItems.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-3 flex flex-col justify-between hover:border-[#C9A35F] transition-all relative group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center gap-1">
                      <span className="text-[10px] bg-[#16161A] font-mono text-neutral-400 px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.08)] truncate max-w-[80px]">
                        {item.category}
                      </span>
                      
                      {/* Action buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => onToggleHideItem(item.id)}
                          className="p-1 border border-[rgba(255,255,255,0.08)] bg-[#16161A] text-[#8B8B93] hover:text-[#F8F8F8] transition-colors rounded-[4px]"
                          title={item.usageStatus === 'hidden' ? 'Восстановить' : 'Скрыть'}
                        >
                          {item.usageStatus === 'hidden' ? <Eye size={10} /> : <EyeOff size={10} />}
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1 border border-[rgba(255,255,255,0.08)] bg-[#16161A] text-[#8B8B93] hover:text-[#C97878] transition-colors rounded-[4px]"
                          title="Удалить"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Grayscale drawing placeholder */}
                    <div className="aspect-[4/3] bg-[#16161A] border border-[rgba(255,255,255,0.05)] rounded-[6px] flex flex-col items-center justify-center p-2 text-center text-[#B5B5BC] relative overflow-hidden">
                      <Shirt size={18} className="text-[#8B8B93] mb-1" />
                      <span className="text-[10px] font-mono leading-tight text-[#8B8B93]">{item.imageSrc}</span>
                      <span className="absolute bottom-1 right-1 bg-[#1A1A1D] px-1.5 rounded-[4px] text-[8px] font-mono border border-[rgba(255,255,255,0.08)] text-[#F8F8F8]">
                        {item.sideType}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-[#F8F8F8] leading-tight truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <p className="text-[9px] text-[#8B8B93] font-mono tracking-wide mt-0.5 uppercase">
                        {item.classification}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredItems.length === 0 && filteredKits.length === 0 && (
          <div className="text-center py-12 bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px]">
            <Info size={24} className="text-[#8B8B93] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#F8F8F8]">Нет подходящих элементов гардероба.</p>
            <p className="text-xs text-[#8B8B93] mt-1.5">
              Попробуйте изменить настройки фильтров или выполните первый продакшен.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
