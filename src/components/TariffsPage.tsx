import React, { useState } from 'react';
import { PaymentIntent, PaymentState, LedgerItem } from '../types';
import { Coins, Copy, QrCode, ArrowRight, CheckCircle, AlertOctagon, HelpCircle, Activity, ChevronRight, Check } from 'lucide-react';

interface TariffsPageProps {
  photoCredits: number;
  kitCredits: number;
  reservedPhotoCredits: number;
  reservedKitCredits: number;
  ledger: LedgerItem[];
  addLedgerEntry: (event: string, type: 'photo' | 'kit', count: number, note: string) => void;
  incrementCredits: (type: 'photo' | 'kit', count: number) => void;
  onStartProduction: (type: 'photo' | 'kit') => void;
}

export default function TariffsPage({
  photoCredits,
  kitCredits,
  reservedPhotoCredits,
  reservedKitCredits,
  ledger,
  addLedgerEntry,
  incrementCredits,
  onStartProduction
}: TariffsPageProps) {
  const [selectedPack, setSelectedPack] = useState<{ id: string; name: string; price: string; creditsToAdd: number; type: 'photo' | 'kit' } | null>(null);
  const [checkoutIntent, setCheckoutIntent] = useState<PaymentIntent | null>(null);
  const [txHash, setTxHash] = useState('');
  const [searchTxUrl, setSearchTxUrl] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastPaymentStatus, setLastPaymentStatus] = useState<string>('Нет недавних оплат');

  // Admin simulation helper options
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const packages = [
    {
      id: 'pack_7_photos',
      name: 'Попробовать съемку на одном образе',
      creditsLabel: '7 фото (1 credit)',
      price: '5 USDT',
      creditsCount: 1,
      type: 'photo' as const,
      description: 'После оплаты откроется flow создания фото. На выходе - один набор из 7 качественных fashion изображений без видео.',
      bestFor: 'первый тест качества, один товарный SKU',
      badge: 'Простой старт',
      visualType: 'photo'
    },
    {
      id: 'pack_3_kits',
      name: 'Запустить мини-кампанию',
      creditsLabel: '3 комплекта (3 credits)',
      price: '100 USDT',
      creditsCount: 3,
      type: 'kit' as const,
      description: 'Каждый комплект включает 7 фото и одно готовое 15-секундное вертикальное AI-видео для карточек товаров и соцсетей.',
      bestFor: 'капсульная коллекция, небольшой дроп, 3 образа',
      badge: 'Популярно',
      visualType: 'kit'
    },
    {
      id: 'pack_30_kits',
      name: 'Собрать контент для коллекции',
      creditsLabel: '30 комплектов (30 credits)',
      price: '1500 USDT',
      creditsCount: 30,
      type: 'kit' as const,
      description: 'Собирайте полноценный объем контента для каталога, повторно используя модели и сохраненные образы без наценок.',
      bestFor: 'бренд, шоурум, регулярная сезонная съемка',
      badge: 'Выгодно',
      visualType: 'kit'
    }
  ];

  const handleSelectPackage = (pk: typeof packages[0]) => {
    const randomAddress = 'EQCQ_..._TON_RECIPIENT_ADDRESS';
    const randomComment = `MODAI-${Math.floor(100000 + Math.random() * 900000)}`;
    
    setSelectedPack({
      id: pk.id,
      name: pk.name,
      price: pk.price,
      creditsToAdd: pk.creditsCount,
      type: pk.type
    });

    setCheckoutIntent({
      id: `pay_${Date.now()}`,
      packageId: pk.id,
      packageName: pk.name,
      amount: pk.price,
      network: 'USDT-TON',
      address: 'UQAhS_modai_team_prod_ton_wallet_9m2a',
      comment: randomComment,
      status: 'pending',
      txHash: '',
      timestamp: Date.now()
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSimulatePaymentState = (state: PaymentState) => {
    if (!checkoutIntent) return;

    const updated = { ...checkoutIntent, status: state };
    if (state === 'confirmed') {
      updated.txHash = txHash || 'tx_hash_simulated_ok_' + Math.floor(Math.random() * 10000);
      setCheckoutIntent(updated);
      
      // Update account credits
      if (selectedPack) {
        incrementCredits(selectedPack.type, selectedPack.creditsToAdd);
        addLedgerEntry(
          'grant',
          selectedPack.type,
          selectedPack.creditsToAdd,
          `Оплата пакета "${selectedPack.name}" через TON`
        );
      }
      setLastPaymentStatus('Оплата подтверждена');
      setShowSuccessModal(true);
    } else {
      setCheckoutIntent(updated);
      if (state === 'rejected') setLastPaymentStatus('Платеж отклонен');
      if (state === 'expired') setLastPaymentStatus('Срок действия адреса истек');
      if (state === 'wrong_amount') setLastPaymentStatus('Неверная сумма');
      if (state === 'wrong_network') setLastPaymentStatus('Неверная сеть TON');
      if (state === 'invalid_tx') setLastPaymentStatus('Недействительный TX хэш');
      if (state === 'duplicate_tx') setLastPaymentStatus('Повторная транзакция');
    }
  };

  const handleVerifyManualTx = () => {
    if (!txHash.trim()) {
      alert('Пожалуйста, введите хэш транзакции (Transaction Hash)');
      return;
    }
    // Simulate verification
    handleSimulatePaymentState('confirmed');
  };

  // Convert ledger event type to Russian label
  const getLedgerEventLabel = (evt: string) => {
    switch (evt) {
      case 'grant': return 'Начисление (покупка)';
      case 'marketing_grant': return 'Стартовый бонус';
      case 'support_compensation': return 'Компенсация поддержки';
      case 'reserve': return 'Зарезервировано под продакшен';
      case 'reserve_release': return 'Резерв снят (возврат)';
      case 'spend_confirmed': return 'Списание (выполнено)';
      case 'support_hold': return 'Удержано техподдержкой';
      case 'support_refund': return 'Возврат техподдержки';
      case 'support_manual_fix': return 'Ручное исправление';
      default: return evt;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 font-sans text-[#111111]">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#D7D7D7] pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Тарифы и пакеты</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Купите credits, чтобы запустить AI fashion-фотосессии и генерацию 15-секундных комплектов.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border border-[#D7D7D7] rounded-lg px-4 py-2 text-xs">
            <span className="text-neutral-500 block uppercase font-bold text-[9px]">Ваш баланс фото</span>
            <span className="text-base font-bold text-[#111111]">{photoCredits} кр. <span className="text-[10px] text-neutral-400 font-normal">({reservedPhotoCredits} в работе)</span></span>
          </div>
          <div className="bg-white border border-[#D7D7D7] rounded-lg px-4 py-2 text-xs">
            <span className="text-neutral-500 block uppercase font-bold text-[9px]">Ваш баланс комплектов</span>
            <span className="text-base font-bold text-[#111111]">{kitCredits} кр. <span className="text-[10px] text-neutral-400 font-normal">({reservedKitCredits} в работе)</span></span>
          </div>
        </div>
      </div>

      {/* Package Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pk) => (
          <div
            key={pk.id}
            className="bg-white border-2 border-[#D7D7D7] rounded-lg flex flex-col justify-between overflow-hidden shadow-sm hover:border-[#111111] transition-all relative"
          >
            <div className="p-6 space-y-4">
              {pk.badge && (
                <div className="flex justify-start">
                  <span className="bg-neutral-100 border border-[#D7D7D7] text-[#111111] font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded">
                    {pk.badge}
                  </span>
                </div>
              )}
              
              <div className="space-y-1">
                <h3 className="text-md font-bold text-neutral-900 leading-tight min-h-[40px]">{pk.name}</h3>
                <span className="inline-block bg-neutral-100 text-neutral-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {pk.creditsLabel}
                </span>
              </div>

              {/* Price */}
              <div className="py-2">
                <span className="text-3xl font-extrabold tracking-tight">{pk.price}</span>
              </div>

              {/* Grayscale visual model strips */}
              <div className="bg-[#F1F1F1] border border-[#D7D7D7] rounded-lg p-3 space-y-2">
                <span className="text-[10px] font-mono uppercase text-neutral-500 block">Пример комплекта (Wireframe)</span>
                {pk.visualType === 'photo' ? (
                  <div className="flex gap-1 justify-between">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <div key={num} className="w-5 h-7 bg-[#D7D7D7] rounded flex items-center justify-center text-[8px] text-neutral-500 font-mono">
                        {num}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-1 justify-between">
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <div key={num} className="w-4 h-6 bg-[#D7D7D7] rounded flex items-center justify-center text-[7px] text-neutral-500 font-mono">
                          {num}
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#A8A8A8] py-1 text-center text-[9px] font-mono rounded text-[#111111] uppercase flex items-center justify-center gap-1">
                      <span>▶ 15с Вертикальное AI-Видео</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs text-[#555555]">
                <p className="leading-relaxed">{pk.description}</p>
                <div className="pt-2 border-t border-[#F1F1F1] text-[11px]">
                  <strong>Подходит для:</strong> {pk.bestFor}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => handleSelectPackage(pk)}
                className="w-full bg-[#111111] hover:bg-neutral-800 text-white font-medium text-sm py-2 px-4 rounded transition-colors text-center"
              >
                Выбрать {pk.creditsCount} {pk.type === 'photo' ? 'фото-кр.' : 'компл.'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Emulation Container (if package is active) */}
      {checkoutIntent && (
        <div id="checkout_container" className="bg-white border-2 border-[#111111] rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold">Оформление платежа (USDT-TON)</h2>
              <p className="text-xs text-neutral-500">
                Заказ {checkoutIntent.id} • Выбран пакет: <strong>{checkoutIntent.packageName}</strong>
              </p>
            </div>
            <button
              onClick={() => {
                setCheckoutIntent(null);
                setSelectedPack(null);
              }}
              className="text-[#555555] hover:text-[#111111] text-xs underline font-medium"
            >
              Отменить
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Payment instruction details */}
            <div className="space-y-4">
              <div className="bg-neutral-50 border border-[#D7D7D7] p-4 rounded-lg space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="text-[#888888] uppercase text-[9px] font-bold block">Сумма к отправке</span>
                  <span className="text-lg font-bold text-[#111111] font-mono">{checkoutIntent.amount}</span>
                </div>
                
                <div>
                  <span className="text-[#888888] uppercase text-[9px] font-bold block">Валюта сети / Сеть</span>
                  <span className="font-semibold text-[#111111] font-mono">Tether Gold (USDT) on TON blockchain</span>
                </div>

                <div>
                  <span className="text-[#888888] uppercase text-[9px] font-bold block">Адрес получателя (TON Wallet)</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={checkoutIntent.address}
                      className="bg-white border border-[#D7D7D7] p-1.5 rounded font-mono text-[10px] flex-1 text-neutral-700"
                    />
                    <button
                      onClick={() => copyToClipboard(checkoutIntent.address)}
                      className="p-1.5 border border-[#D7D7D7] bg-white hover:bg-neutral-100 rounded"
                      title="Копировать адрес"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[#888888] uppercase text-[9px] font-bold block">Обязательный комментарий (Payload)</span>
                  <div className="flex items-center gap-1.5 mt-1 bg-[#FFFBEB] p-2 border border-[#F59E0B] rounded">
                    <input
                      type="text"
                      readOnly
                      value={checkoutIntent.comment}
                      className="bg-white border border-[#D7D7D7] p-1.5 rounded font-mono text-[10px] font-bold text-amber-900 flex-1"
                    />
                    <button
                      onClick={() => copyToClipboard(checkoutIntent.comment)}
                      className="p-1.5 border border-[#D7D7D7] bg-white hover:bg-neutral-100 rounded"
                      title="Копировать комментарий"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                  <span className="text-[10px] text-amber-700 mt-1 block">
                    ВНИМАНИЕ! Без этого комментария платеж не сможет зачислиться автоматически.
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-700">
                  Хэш транзакции (Transaction Hash, TX)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Введите хэш, например: 7a31f0e4..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="flex-1 bg-white border border-[#D7D7D7] rounded p-2 text-xs font-mono"
                  />
                  <button
                    onClick={handleVerifyManualTx}
                    className="bg-[#111111] hover:bg-neutral-800 text-white font-medium text-xs px-4 rounded transition-colors"
                  >
                    Я оплатил, проверить
                  </button>
                </div>
              </div>
            </div>

            {/* QR block and simulated states */}
            <div className="bg-neutral-50 border border-[#D7D7D7] p-6 rounded-lg flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-xs font-bold font-mono text-neutral-500 uppercase tracking-widest">
                QR-код для перевода
              </span>
              
              {/* Fake QR square */}
              <div className="w-36 h-36 border-2 border-dashed border-[#A8A8A8] bg-[#E1E1E1] rounded flex flex-col justify-center items-center relative overflow-hidden">
                <QrCode size={40} className="text-[#555555]" />
                <span className="text-[8px] font-mono text-neutral-500 mt-2">USDT-TON GATEWAY</span>
                {/* Visual grid look alike */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={i} className="border border-black"></div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 max-w-xs">
                Отсканируйте с помощью TON-кошелька (Tonkeeper, Telegram Wallet etc.) для мгновенного заполнения реквизитов.
              </p>

              <div className="w-full border-t border-[#D7D7D7] pt-3">
                <span className="block text-[10px] font-bold text-neutral-500 uppercase mb-2">
                  Симуляция статусов оплаты (Кликните для тестов):
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleSimulatePaymentState('confirmed')}
                    className="text-[10px] bg-white border border-[#D7D7D7] hover:border-[#111111] p-1.5 rounded text-left font-mono"
                  >
                    🟢 Подтвержден
                  </button>
                  <button
                    onClick={() => handleSimulatePaymentState('rejected')}
                    className="text-[10px] bg-white border border-[#D7D7D7] hover:border-[#111111] p-1.5 rounded text-left font-mono"
                  >
                    🔴 Отклонен
                  </button>
                  <button
                    onClick={() => handleSimulatePaymentState('expired')}
                    className="text-[10px] bg-white border border-[#D7D7D7] hover:border-[#111111] p-1.5 rounded text-left font-mono"
                  >
                    ⏳ Истек адрес
                  </button>
                  <button
                    onClick={() => handleSimulatePaymentState('invalid_tx')}
                    className="text-[10px] bg-white border border-[#D7D7D7] hover:border-[#111111] p-1.5 rounded text-left font-mono"
                  >
                    ⚠️ Неверный TX
                  </button>
                  <button
                    onClick={() => handleSimulatePaymentState('wrong_amount')}
                    className="text-[10px] bg-white border border-[#D7D7D7] hover:border-[#111111] p-1.5 rounded text-left font-mono"
                  >
                    💰 Не та сумма
                  </button>
                  <button
                    onClick={() => handleSimulatePaymentState('wrong_network')}
                    className="text-[10px] bg-white border border-[#D7D7D7] hover:border-[#111111] p-1.5 rounded text-left font-mono"
                  >
                    🌐 Не та сеть
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Inline alert boxes for simulated payment responses */}
          {checkoutIntent.status !== 'pending' && (
            <div className="p-4 rounded-lg text-xs font-medium border">
              {checkoutIntent.status === 'rejected' && (
                <div className="text-red-700 bg-red-50 border-red-200">
                  ⚠️ <strong>Платеж отклонен:</strong> Сеть зафиксировала сбой валидации. Создайте новый платеж или свяжитесь с поддержкой.
                </div>
              )}
              {checkoutIntent.status === 'expired' && (
                <div className="text-neutral-700 bg-neutral-100 border-neutral-300">
                  ⏳ <strong>Сессия платежа истекла:</strong> Резервирование адреса TON прекращено. Пожалуйста, запросите новые реквизиты.
                </div>
              )}
              {checkoutIntent.status === 'invalid_tx' && (
                <div className="text-red-700 bg-red-50 border-red-200">
                  ⚠️ <strong>Не удалось проверить хэш транзакции:</strong> Транзакция не найдена в эксплорере TON. Попробуйте еще раз.
                </div>
              )}
              {checkoutIntent.status === 'wrong_amount' && (
                <div className="text-amber-800 bg-amber-50 border-amber-200">
                  ⚠️ <strong>Несоответствие суммы:</strong> Сумма в транзакции отличается от выбранного тарифа. Обратитесь в техподдержку.
                </div>
              )}
              {checkoutIntent.status === 'wrong_network' && (
                <div className="text-amber-800 bg-amber-50 border-amber-200">
                  🌐 <strong>Ошибка сети перевода:</strong> Платеж отправлен в неверной сети (например, ERC-20 вместо TON). Свяжитесь с техподдержкой.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Credit Ledger Table */}
      <div className="bg-white border border-[#D7D7D7] rounded-lg p-5 space-y-4">
        <h2 className="text-md font-bold flex items-center gap-2">
          <Activity size={18} />
          История операций по кредитам (Ledger)
        </h2>
        
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D7D7D7] text-neutral-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Дата</th>
                <th className="py-2.5 px-3">Событие</th>
                <th className="py-2.5 px-3">Тип кредита</th>
                <th className="py-2.5 px-3">Кол-во</th>
                <th className="py-2.5 px-3">Статус</th>
                <th className="py-2.5 px-3">Заметка</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F1F1]">
              {ledger.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50">
                  <td className="py-2.5 px-3 font-mono text-[#555555]">{item.date}</td>
                  <td className="py-2.5 px-3 font-semibold">{getLedgerEventLabel(item.event)}</td>
                  <td className="py-2.5 px-3 uppercase text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded font-mono ${item.creditType === 'photo' ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-indigo-50 border border-indigo-200 text-indigo-800'}`}>
                      {item.creditType === 'photo' ? '7 фото' : 'комплект'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold font-mono">+{item.count} кр.</td>
                  <td className="py-2.5 px-3 text-[#555555]">{item.status}</td>
                  <td className="py-2.5 px-3 text-neutral-500 truncate max-w-[240px]">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Test Controller - Always Present For Testing State Changes */}
      <div className="bg-white border border-[#D7D7D7] rounded-lg overflow-hidden">
        <button
          onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
          className="w-full bg-neutral-100 p-4 border-b border-[#D7D7D7] hover:bg-neutral-200 transition-colors flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-700"
        >
          <span>🛠️ Инструменты кредитов прототипа (Тестовая панель администратора)</span>
          <ChevronRight size={16} className={`transform transition-transform ${isAdminPanelOpen ? 'rotate-90' : ''}`} />
        </button>

        {isAdminPanelOpen && (
          <div className="p-5 bg-neutral-50 space-y-4 text-xs">
            <p className="text-[#555555] leading-relaxed">
              Используйте эти ручные переключатели для мгновенного изменения баланса кредитов и отладки ограничений доступа без прохождения реальных цепочек оплаты в кабинете.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  incrementCredits('photo', 1);
                  addLedgerEntry('grant', 'photo', 1, 'Ручное тестовое начисление 1 фото-кредита');
                }}
                className="bg-white border border-[#D7D7D7] hover:border-[#111111] rounded px-3 py-1.5 font-medium transition-colors"
              >
                +1 Фото-кредит (за 7 фото)
              </button>
              <button
                onClick={() => {
                  incrementCredits('kit', 1);
                  addLedgerEntry('grant', 'kit', 1, 'Ручное тестовое начисление 1 комплект-кредита');
                }}
                className="bg-white border border-[#D7D7D7] hover:border-[#111111] rounded px-3 py-1.5 font-medium transition-colors"
              >
                +1 Комплект-кредит (фото + видео)
              </button>
              <button
                onClick={() => {
                  incrementCredits('photo', 5);
                  addLedgerEntry('marketing_grant', 'photo', 5, 'Маркетинговые промо-кредиты (фото)');
                }}
                className="bg-white border border-[#D7D7D7] hover:border-[#111111] rounded px-3 py-1.5 font-medium transition-colors"
              >
                Начислить старт-маркетинг
              </button>
              <button
                onClick={() => {
                  incrementCredits('kit', 3);
                  addLedgerEntry('support_compensation', 'kit', 3, 'Компенсация техподдержки за технический перезапуск');
                }}
                className="bg-white border border-[#D7D7D7] hover:border-[#111111] rounded px-3 py-1.5 font-medium transition-colors"
              >
                Выдать компенсацию поддержки
              </button>
              <button
                onClick={() => {
                  // Simulate support manual fix logs
                  addLedgerEntry('support_manual_fix', 'kit', 1, 'Исправление брака кадра в наборе №8');
                }}
                className="bg-white border border-[#D7D7D7] hover:border-[#111111] rounded px-3 py-1.5 font-medium transition-colors"
              >
                Отметить ручное исправление
              </button>
              <button
                onClick={() => {
                  // Flush all credits for state restriction testing
                  alert('Сбрасываем баланс кредитов в 0 для проверки ограничений...');
                }}
                style={{ cursor: 'not-allowed' }}
                className="bg-white text-neutral-400 border border-[#D7D7D7] rounded px-3 py-1.5 font-medium"
              >
                Заморозить баланс
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Success Modal Container */}
      {showSuccessModal && selectedPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
          <div className="bg-white border-2 border-[#111111] rounded-lg p-6 max-w-sm w-full space-y-4">
            <div className="text-center space-y-2">
              <CheckCircle className="text-neutral-900 mx-auto" size={40} />
              <h3 className="text-lg font-bold">Оплата подтверждена</h3>
              <p className="text-xs text-neutral-500">
                Заказ {checkoutIntent?.id} успешно зачислен. Баланс вашего аккаунта обновлен!
              </p>
            </div>

            <div className="bg-[#F6F6F6] p-3 rounded-lg border border-[#D7D7D7] text-center text-xs font-bold text-neutral-800">
              {selectedPack.type === 'photo' 
                ? `Активирован: Добавлен 1 фото-кредит (7 готовых фото).` 
                : `Активирован: Добавлены ${selectedPack.creditsToAdd} комплект-кредитов (фото + видео 15с).`
              }
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setCheckoutIntent(null);
                  setSelectedPack(null);
                  onStartProduction(selectedPack.type);
                }}
                className="w-full bg-[#111111] hover:bg-neutral-800 text-white font-medium text-sm py-2 rounded transition-colors text-center"
              >
                Начать продакшен →
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setCheckoutIntent(null);
                  setSelectedPack(null);
                }}
                className="w-full border border-[#D7D7D7] hover:bg-neutral-100 text-[#111111] font-medium text-sm py-2 rounded transition-colors text-center"
              >
                Остаться в тарифах
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
