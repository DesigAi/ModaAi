import React, { useState } from 'react';
import { PaymentIntent, PaymentState, LedgerItem } from '../types';
import { Coins, Copy, QrCode, ArrowRight, CheckCircle, AlertOctagon, HelpCircle, Activity, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { formatCredits, getCreditNoun, formatCreditsWithLabel } from '../utils/creditFormatter';

interface TariffsPageProps {
  creditBalance: number;
  reservedCredits: number;
  ledger: LedgerItem[];
  addLedgerEntry: (event: string, type: 'photo' | 'kit', count: number, note: string) => void;
  incrementCredits: (type: 'photo' | 'kit', count: number) => void;
  onStartProduction: (type: 'photo' | 'kit') => void;
  onAdminAction?: (action: 'add' | 'spend' | 'return_reserve', amount?: number, customEvent?: string) => void;
}

export default function TariffsPage({
  creditBalance,
  reservedCredits,
  ledger,
  addLedgerEntry,
  incrementCredits,
  onStartProduction,
  onAdminAction
}: TariffsPageProps) {
  const [selectedPack, setSelectedPack] = useState<{ id: string; name: string; price: string; creditsToAdd: number; type: 'photo' | 'kit' } | null>(null);
  const [checkoutIntent, setCheckoutIntent] = useState<PaymentIntent | null>(null);
  const [txHash, setTxHash] = useState('');
  const [searchTxUrl, setSearchTxUrl] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastPaymentStatus, setLastPaymentStatus] = useState<string>('Нет недавних оплат');
  const [currentPage, setCurrentPage] = useState(1);

  // Admin simulation helper options
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const packages = [
    {
      id: 'pack_7_photos',
      name: 'Попробовать съемку на одном образе',
      creditsLabel: '7 фото (на баланс: +0,5 кредита)',
      price: '5 USDT',
      creditsCount: 0.5,
      type: 'photo' as const,
      description: 'После оплаты откроется flow создания фото. На выходе - один набор из 7 качественных fashion изображений без видео.',
      bestFor: 'первый тест качества, один товарный SKU',
      badge: 'Простой старт',
      visualType: 'photo'
    },
    {
      id: 'pack_3_kits',
      name: 'Запустить мини-кампанию',
      creditsLabel: '3 комплекта (на баланс: +3 кредита)',
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
      creditsLabel: '30 комплектов (на баланс: +30 кредитов)',
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
    <div className="p-6 max-w-6xl mx-auto space-y-8 font-sans text-[#F8F8F8]">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium tracking-tight text-[#F8F8F8]">Тарифы и пакеты</h1>
          <p className="text-sm text-[#8B8B93] mt-1">
            Купите credits, чтобы запустить AI fashion-фотосессии и генерацию 15-секундных комплектов.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-4 py-2 text-xs">
            <span className="text-[#8B8B93] block uppercase font-bold text-[9px] tracking-wider mb-0.5">Доступные кредиты</span>
            <span className="text-base font-semibold text-[#F8F8F8] font-mono">
              {formatCredits(creditBalance)} {getCreditNoun(creditBalance)}{' '}
              {reservedCredits > 0 && (
                <span className="text-[10px] text-[#8B8B93] font-normal font-sans ml-1">
                  ({formatCredits(reservedCredits)} в работе)
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Package Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pk) => (
          <div
            key={pk.id}
            className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px] flex flex-col justify-between overflow-hidden hover:border-[#C9A35F] transition-all relative"
          >
            <div className="p-6 space-y-4">
              {pk.badge && (
                <div className="flex justify-start">
                  <span className="bg-[#16161A] border border-[rgba(255,255,255,0.08)] text-[#C9A35F] font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded-[4px]">
                    {pk.badge}
                  </span>
                </div>
              )}
              
              <div className="space-y-1">
                <h3 className="text-md font-display font-medium text-[#F8F8F8] leading-tight min-h-[40px]">{pk.name}</h3>
                <span className="inline-block bg-[rgba(201,163,95,0.12)] text-[#C9A35F] text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {pk.creditsLabel}
                </span>
                <span className="block text-[11px] text-[#8B8B93] font-medium mt-1.5 font-mono">
                  После оплаты: +{formatCredits(pk.creditsCount)} {getCreditNoun(pk.creditsCount)}
                </span>
              </div>

              {/* Price */}
              <div className="py-2">
                <span className="text-3xl font-display font-medium tracking-tight text-[#F8F8F8]">{pk.price}</span>
              </div>



              <div className="space-y-2 text-xs text-[#B5B5BC]">
                <p className="leading-relaxed">{pk.description}</p>
                <div className="pt-2 border-t border-[rgba(255,255,255,0.08)] text-[11px]">
                  <strong className="text-[#F8F8F8]">Подходит для:</strong> {pk.bestFor}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => handleSelectPackage(pk)}
                className="w-full h-[40px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] font-sans font-semibold text-sm rounded-[6px] flex items-center justify-center transition-all select-none active:translate-y-[1px] cursor-pointer"
              >
                Выбрать пакет
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Emulation Container (if package is active) */}
      {checkoutIntent && (
        <div id="checkout_container" className="bg-[#0F0F11] border border-[#C9A35F] rounded-[8px] p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-display font-medium text-[#F8F8F8]">Оформление платежа (USDT-TON)</h2>
              <p className="text-xs text-[#8B8B93] mt-1">
                Заказ {checkoutIntent.id} • Выбран пакет: <strong className="text-[#F8F8F8]">{checkoutIntent.packageName}</strong>
              </p>
            </div>
            <button
              onClick={() => {
                setCheckoutIntent(null);
                setSelectedPack(null);
              }}
              className="text-[#8B8B93] hover:text-[#F8F8F8] text-xs underline font-medium transition-colors"
            >
              Отменить
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Payment instruction details border-subtle bg-surface-2 */}
            <div className="space-y-4">
              <div className="bg-[#16161A] border border-[rgba(255,255,255,0.08)] p-4 rounded-[8px] space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="text-[#8B8B93] uppercase text-[9px] font-bold block mb-0.5">Сумма к отправке</span>
                  <span className="text-lg font-bold text-[#F8F8F8] font-mono">{checkoutIntent.amount}</span>
                </div>
                
                <div>
                  <span className="text-[#8B8B93] uppercase text-[9px] font-bold block mb-0.5">Валюта сети / Сеть</span>
                  <span className="font-semibold text-[#F8F8F8] font-mono">Tether Gold (USDT) on TON blockchain</span>
                </div>

                <div>
                  <span className="text-[#8B8B93] uppercase text-[9px] font-bold block mb-1">Адрес получателя (TON Wallet)</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={checkoutIntent.address}
                      className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] px-2.5 py-1.5 rounded-[6px] font-mono text-[10px] flex-1 text-[#B5B5BC]"
                    />
                    <button
                      onClick={() => copyToClipboard(checkoutIntent.address)}
                      className="p-1.5 border border-[rgba(255,255,255,0.08)] bg-[#1A1A1D] hover:bg-[#1D1D21] rounded-[6px] text-[#F8F8F8] transition-colors"
                      title="Копировать адрес"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[#8B8B93] uppercase text-[9px] font-bold block mb-1">Обязательный комментарий (Payload)</span>
                  <div className="flex items-center gap-1.5 mt-1 bg-[rgba(201,163,95,0.12)] p-2.5 border border-[#C9A35F] rounded-[6px]">
                    <input
                      type="text"
                      readOnly
                      value={checkoutIntent.comment}
                      className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] p-1.5 rounded-[4px] font-mono text-[10px] font-bold text-[#C9A35F] flex-1"
                    />
                    <button
                      onClick={() => copyToClipboard(checkoutIntent.comment)}
                      className="p-1.5 border border-[rgba(255,255,255,0.08)] bg-[#242428] hover:bg-neutral-800 rounded-[4px] text-[#C9A35F]"
                      title="Копировать комментарий"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                  <span className="text-[10px] text-[#C9A35F] mt-1.5 block leading-normal">
                    ВНИМАНИЕ! Без этого комментария платеж не сможет зачислиться автоматически.
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#B5B5BC]">
                  Хэш транзакции (Transaction Hash, TX)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Введите хэш, например: 7a31f0e4..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="flex-1 bg-[#16161A] border border-[rgba(255,255,255,0.12)] rounded-[6px] px-3 py-2 text-xs font-mono text-[#F8F8F8] focus:outline-none focus:border-[#C9A35F]"
                  />
                  <button
                    onClick={handleVerifyManualTx}
                    className="bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] font-sans font-semibold text-xs px-4 rounded-[6px] transition-all select-none active:translate-y-[1px] cursor-pointer flex items-center justify-center whitespace-nowrap"
                  >
                    Я оплатил, проверить
                  </button>
                </div>
              </div>
            </div>

            {/* QR block and simulated states */}
            <div className="bg-[#16161A] border border-[rgba(255,255,255,0.08)] p-6 rounded-[8px] flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-xs font-bold font-mono text-[#8B8B93] uppercase tracking-widest">
                QR-код для перевода
              </span>
              
              {/* Fake QR square */}
              <div className="w-36 h-36 border border-[rgba(255,255,255,0.12)] bg-[#0F0F11] rounded-[6px] flex flex-col justify-center items-center relative overflow-hidden">
                <QrCode size={40} className="text-[#C9A35F]" />
                <span className="text-[8px] font-mono text-[#8B8B93] mt-2">USDT-TON GATEWAY</span>
                {/* Visual grid look alike */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={i} className="border border-white"></div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-[#8B8B93] max-w-xs font-sans">
                Отсканируйте с помощью TON-кошелька (Tonkeeper, Telegram Wallet etc.) для мгновенного заполнения реквизитов.
              </p>

              <div className="w-full border-t border-[rgba(255,255,255,0.08)] pt-3">
                <span className="block text-[10px] font-bold text-[#8B8B93] uppercase mb-2 text-center">
                  Симуляция статусов оплаты (Кликните для тестов):
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleSimulatePaymentState('confirmed')}
                    className="text-[9px] bg-[#1A1A1D] border border-[rgba(255,255,255,0.05)] text-green-300 hover:border-[#78A98A] p-1.5 rounded-[4px] font-mono text-center transition-colors cursor-pointer"
                  >
                    🟢 Подтвержден
                  </button>
                  <button
                    onClick={() => handleSimulatePaymentState('rejected')}
                    className="text-[9px] bg-[#1A1A1D] border border-[rgba(255,255,255,0.05)] text-[#C97878] hover:border-[#C97878] p-1.5 rounded-[4px] font-mono text-center transition-colors cursor-pointer"
                  >
                    🔴 Отклонен
                  </button>
                  <button
                    onClick={() => handleSimulatePaymentState('expired')}
                    className="text-[9px] bg-[#1A1A1D] border border-[rgba(255,255,255,0.05)] text-[#8B8B93] hover:border-white p-1.5 rounded-[4px] font-mono text-center transition-colors cursor-pointer"
                  >
                    ⏳ Истек
                  </button>
                  <button
                    onClick={() => handleSimulatePaymentState('invalid_tx')}
                    className="text-[9px] bg-[#1A1A1D] border border-[rgba(255,255,255,0.05)] text-[#C9A35F] hover:border-[#C9A35F] p-1.5 rounded-[4px] font-mono text-center transition-colors cursor-pointer"
                  >
                    ⚠️ Неверный TX
                  </button>
                  <button
                    onClick={() => handleSimulatePaymentState('wrong_amount')}
                    className="text-[9px] bg-[#1A1A1D] border border-[rgba(255,255,255,0.05)] text-amber-500 hover:border-amber-500 p-1.5 rounded-[4px] font-mono text-center transition-colors cursor-pointer"
                  >
                    💰 Не сумма
                  </button>
                  <button
                    onClick={() => handleSimulatePaymentState('wrong_network')}
                    className="text-[9px] bg-[#1A1A1D] border border-[rgba(255,255,255,0.05)] text-blue-400 hover:border-blue-400 p-1.5 rounded-[4px] font-mono text-center transition-colors cursor-pointer"
                  >
                    🌐 Не сеть
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Inline alert boxes for simulated payment responses */}
          {checkoutIntent.status !== 'pending' && (
            <div className="p-4 rounded-[6px] text-xs font-medium border border-[rgba(255,255,255,0.08)] bg-[#1A1A1D]">
              {checkoutIntent.status === 'rejected' && (
                <div className="text-[#C97878] bg-[rgba(201,120,120,0.12)] p-2 rounded-[4px]">
                  ⚠️ <strong>Платеж отклонен:</strong> Сеть зафиксировала сбой валидации. Создайте новый платеж или свяжитесь с поддержкой.
                </div>
              )}
              {checkoutIntent.status === 'expired' && (
                <div className="text-[#B5B5BC] bg-[#16161A] p-2 rounded-[4px]">
                  ⏳ <strong>Сессия платежа истекла:</strong> Резервирование адреса TON прекращено. Пожалуйста, запросите новые реквизиты.
                </div>
              )}
              {checkoutIntent.status === 'invalid_tx' && (
                <div className="text-[#C97878] bg-[rgba(201,120,120,0.12)] p-2 rounded-[4px]">
                  ⚠️ <strong>Не удалось проверить хэш транзакции:</strong> Транзакция не найдена в эксплорере TON. Попробуйте еще раз.
                </div>
              )}
              {checkoutIntent.status === 'wrong_amount' && (
                <div className="text-[#C9A35F] bg-[rgba(201,163,95,0.12)] p-2 rounded-[4px]">
                  ⚠️ <strong>Несоответствие суммы:</strong> Сумма в транзакции отличается от выбранного тарифа. Обратитесь в техподдержку.
                </div>
              )}
              {checkoutIntent.status === 'wrong_network' && (
                <div className="text-blue-400 bg-blue-950/20 p-2 rounded-[4px] border border-blue-900/40">
                  🌐 <strong>Ошибка сети перевода:</strong> Платеж отправлен в неверной сети (например, ERC-20 вместо TON). Свяжитесь с техподдержкой.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Credit Ledger Table */}
      {(() => {
        const totalPages = Math.ceil(ledger.length / 10) || 1;
        const activePage = Math.min(currentPage, totalPages);
        const startIdx = (activePage - 1) * 10;
        const paginatedLedger = ledger.slice(startIdx, startIdx + 10);

        const getPageNumbers = () => {
          const pages: (number | string)[] = [];
          const range = 1; // Number of pages on each side of the active page
          for (let i = 1; i <= totalPages; i++) {
            if (
              i === 1 ||
              i === totalPages ||
              (i >= activePage - range && i <= activePage + range)
            ) {
              pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
              pages.push('...');
            }
          }
          return pages;
        };

        return (
          <div className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-5 space-y-4">
            <h2 className="text-md font-display font-medium text-[#F8F8F8]">
              История операций
            </h2>
            
            <div className="overflow-x-auto text-[13px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.08)] text-[#8B8B93] uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Дата</th>
                    <th className="py-2.5 px-3">Событие</th>
                    <th className="py-2.5 px-3">Кол-во</th>
                    <th className="py-2.5 px-3">Статус</th>
                    <th className="py-2.5 px-3">Заметка</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {paginatedLedger.map((item) => {
                    const isPositive = ['grant', 'marketing_grant', 'support_compensation', 'reserve_release', 'support_refund'].includes(item.event);
                    return (
                      <tr key={item.id} className="hover:bg-[#1D1D21] transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[#8B8B93]">{item.date}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#F8F8F8]">{getLedgerEventLabel(item.event)}</td>
                        <td className={`py-2.5 px-3 font-bold font-mono ${isPositive ? 'text-[#78A98A]' : 'text-[#C97878]'}`}>
                          {isPositive ? '+' : '-'}
                          {formatCredits(item.count)} кр.
                        </td>
                        <td className="py-2.5 px-3 text-[#B5B5BC]">{item.status}</td>
                        <td className="py-2.5 px-3 text-[#B5B5BC] truncate max-w-[240px]" title={item.note}>{item.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.08)] pt-4 mt-2">
                <span className="text-[12px] text-[#8B8B93] select-none text-center sm:text-left">
                  Показано {startIdx + 1}–{Math.min(startIdx + 10, ledger.length)} из {ledger.length}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    disabled={activePage === 1}
                    onClick={() => setCurrentPage(activePage - 1)}
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
                        onClick={() => setCurrentPage(Number(pg))}
                        className={`min-w-[28px] h-7 px-2 text-xs font-semibold rounded-[4px] cursor-pointer transition-colors ${
                          activePage === pg
                            ? 'bg-[#C9A35F] text-[#050505]'
                            : 'text-[#B5B5BC] bg-[#16161A] border border-[rgba(255,255,255,0.08)] hover:text-[#F8F8F8] hover:bg-[#1D1D21]'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  <button
                    disabled={activePage === totalPages}
                    onClick={() => setCurrentPage(activePage + 1)}
                    className="p-1.5 text-[#B5B5BC] bg-[#16161A] border border-[rgba(255,255,255,0.08)] hover:text-[#F8F8F8] hover:bg-[#1D1D21] disabled:opacity-40 disabled:hover:bg-[#16161A] disabled:hover:text-[#B5B5BC] rounded-[4px] cursor-pointer transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Admin Test Controller - Always Present For Testing State Changes */}
      <div className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px] overflow-hidden">
        <button
          onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
          className="w-full bg-[#16161A] p-4 border-b border-[rgba(255,255,255,0.08)] hover:bg-[#1D1D21] transition-colors flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#B5B5BC]"
        >
          <span>🛠️ Инструменты кредитов прототипа (Тестовая панель администратора)</span>
          <ChevronRight size={16} className={`transform transition-transform ${isAdminPanelOpen ? 'rotate-90' : ''}`} />
        </button>

        {isAdminPanelOpen && (
          <div className="p-5 bg-[#0F0F11] space-y-4 text-xs">
            <p className="text-[#8B8B93] leading-relaxed">
              Используйте эти ручные переключатели для мгновенного изменения баланса кредитов и отладки ограничений доступа без прохождения реальных цепочек оплаты в кабинете.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onAdminAction?.('add', 0.5)}
                className="bg-[#16161A] border border-[rgba(255,255,255,0.12)] hover:border-[#C9A35F] text-[#F8F8F8] rounded-[6px] px-3 py-1.5 font-medium transition-colors cursor-pointer"
              >
                Добавить 0,5 кредита
              </button>
              <button
                onClick={() => onAdminAction?.('add', 1.0)}
                className="bg-[#16161A] border border-[rgba(255,255,255,0.12)] hover:border-[#C9A35F] text-[#F8F8F8] rounded-[6px] px-3 py-1.5 font-medium transition-colors cursor-pointer"
              >
                Добавить 1 кредит
              </button>
              <button
                onClick={() => onAdminAction?.('add', 3.0)}
                className="bg-[#16161A] border border-[rgba(255,255,255,0.12)] hover:border-[#C9A35F] text-[#F8F8F8] rounded-[6px] px-3 py-1.5 font-medium transition-colors cursor-pointer"
              >
                Добавить 3 кредита
              </button>
              <button
                onClick={() => onAdminAction?.('add', 30.0)}
                className="bg-[#16161A] border border-[rgba(255,255,255,0.12)] hover:border-[#C9A35F] text-[#F8F8F8] rounded-[6px] px-3 py-1.5 font-medium transition-colors cursor-pointer"
              >
                Добавить 30 кредитов
              </button>
              <button
                disabled={creditBalance < 0.5}
                onClick={() => onAdminAction?.('spend', 0.5)}
                className="bg-[#16161A] border border-[rgba(255,255,255,0.12)] hover:border-[#C97878] text-[#F8F8F8] rounded-[6px] px-3 py-1.5 font-medium transition-colors disabled:opacity-40 cursor-pointer"
              >
                Списать 0,5 кредита
              </button>
              <button
                disabled={creditBalance < 1}
                onClick={() => onAdminAction?.('spend', 1.0)}
                className="bg-[#16161A] border border-[rgba(255,255,255,0.12)] hover:border-[#C97878] text-[#F8F8F8] rounded-[6px] px-3 py-1.5 font-medium transition-colors disabled:opacity-40 cursor-pointer"
              >
                Списать 1 кредит
              </button>
              <button
                disabled={reservedCredits === 0}
                onClick={() => onAdminAction?.('return_reserve')}
                className="bg-[#16161A] border border-[rgba(255,255,255,0.12)] hover:border-[#C9A35F] text-[#F8F8F8] rounded-[6px] px-3 py-1.5 font-medium transition-colors disabled:opacity-40 cursor-pointer"
              >
                Вернуть резерв
              </button>
              <button
                onClick={() => onAdminAction?.('add', 5, 'marketing_grant')}
                className="bg-[#16161A] border border-dashed border-[#C9A35F] text-[#C9A35F] rounded-[6px] px-3 py-1.5 font-medium transition-colors cursor-pointer"
              >
                Начислить старт-маркетинг (+5 кр.)
              </button>
              <button
                onClick={() => onAdminAction?.('add', 3, 'support_compensation')}
                className="bg-[#16161A] border border-dashed border-blue-400 text-blue-300 rounded-[6px] px-3 py-1.5 font-medium transition-colors cursor-pointer"
              >
                Выдать компенсацию поддержки (+3 кр.)
              </button>
              <button
                onClick={() => {
                  addLedgerEntry('support_manual_fix', 'photo', 1, 'Исправление брака кадра в наборе №8');
                }}
                className="bg-[#16161A] border border-[rgba(255,255,255,0.12)] hover:border-[#C9A35F] text-[#F8F8F8] rounded-[6px] px-3 py-1.5 font-medium transition-colors cursor-pointer"
              >
                Отметить ручное исправление (логирует)
              </button>
              <button
                onClick={() => onAdminAction?.('spend', creditBalance)}
                className="bg-[rgba(201,120,120,0.12)] text-[#C97878] border border-[rgba(201,120,120,0.3)] rounded-[6px] px-3 py-1.5 font-medium hover:bg-[rgba(201,120,120,0.2)] transition-colors cursor-pointer"
              >
                Сбросить баланс в 0
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Success Modal Container */}
      {showSuccessModal && selectedPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 font-sans">
          <div className="bg-[#0F0F11] border border-[rgba(255,255,255,0.12)] rounded-[8px] p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="text-center space-y-2">
              <CheckCircle className="text-[#78A98A] mx-auto" size={40} />
              <h3 className="text-lg font-display font-medium text-[#F8F8F8]">Оплата подтверждена</h3>
              <p className="text-xs text-[#8B8B93]">
                Заказ {checkoutIntent?.id} успешно зачислен. Баланс вашего аккаунта обновлен!
              </p>
            </div>

            <div className="bg-[#16161A] p-3 rounded-[6px] border border-[rgba(255,255,255,0.08)] text-center text-xs font-bold text-[#C9A35F]">
              {selectedPack.id === 'pack_7_photos' 
                ? 'Пакет активирован. На баланс добавлено 0,5 кредита.' 
                : selectedPack.id === 'pack_3_kits'
                ? 'Пакет активирован. На баланс добавлено 3 кредита.'
                : 'Пакет активирован. На баланс добавлено 30 кредитов.'
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
                className="w-full h-[40px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] font-sans font-semibold text-sm rounded-[6px] flex items-center justify-center transition-all select-none active:translate-y-[1px] cursor-pointer"
              >
                Начать продакшен
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setCheckoutIntent(null);
                  setSelectedPack(null);
                }}
                className="w-full h-[40px] border border-[rgba(255,255,255,0.12)] hover:bg-[#1D1D21] text-[#F8F8F8] font-sans font-medium text-sm rounded-[6px] transition-colors text-center cursor-pointer"
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
