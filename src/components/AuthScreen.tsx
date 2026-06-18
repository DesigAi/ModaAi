import React, { useState } from 'react';
import { InterfaceLanguage } from '../types';
import { Mail, Shield, AlertTriangle, CheckCircle, ArrowRight, RefreshCw, Globe } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (email: string, language: InterfaceLanguage) => void;
}

type AuthPageState = 'login' | 'sending' | 'sent' | 'expired' | 'invalid';

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState<InterfaceLanguage>('ru');
  const [pageState, setPageState] = useState<AuthPageState>('login');
  const [emailError, setEmailError] = useState('');
  const [cooldown, setCooldown] = useState(60);

  const validateEmail = (val: string) => {
    if (!val) {
      return 'Введите email.';
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      return 'Введите корректный email.';
    }
    return '';
  };

  const handleInstantRegister = () => {
    // If empty, let's auto-fill a realistic default Email
    const finalEmail = email.trim() || 'brand.owner@modai.team';
    onLoginSuccess(finalEmail, language);
  };

  const startMagicLinkFlow = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setEmailError('');
    setPageState('sending');
    setTimeout(() => {
      setPageState('sent');
      setCooldown(60);
    }, 1200);
  };

  // Cooldown simulation
  React.useEffect(() => {
    if (pageState === 'sent' && cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [pageState, cooldown]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F8F8F8] flex flex-col justify-between p-8 font-sans">
      {/* Top Header - Language Selector & Version */}
      <div className="flex justify-between items-center max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 font-mono text-xs tracking-wider text-[#8B8B93] uppercase">
          <span className="font-display font-medium text-[#F8F8F8]">ModAI Team</span>
          <span>v1.2</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[6px] p-1 text-xs">
          <Globe size={13} className="text-[#8B8B93]" />
          <button
            onClick={() => setLanguage('ru')}
            className={`px-2 py-0.5 rounded-[4px] font-sans font-medium transition-colors ${language === 'ru' ? 'bg-[#C9A35F] text-[#050505]' : 'hover:bg-[#1D1D21] text-[#B5B5BC]'}`}
          >
            RU
          </button>
          <button
            onClick={() => setLanguage('es')}
            className={`px-2 py-0.5 rounded-[4px] font-sans font-medium transition-colors ${language === 'es' ? 'bg-[#C9A35F] text-[#050505]' : 'hover:bg-[#1D1D21] text-[#B5B5BC]'}`}
          >
            ES
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="bg-[#0F0F11] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-8 w-full max-w-md shadow-lg">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-display font-medium tracking-tight text-[#F8F8F8]">ModAI Team</h1>
            <p className="text-[10px] font-mono leading-none tracking-widest text-[#8B8B93] uppercase mt-1">Fashion AI Production</p>
          </div>

          {pageState === 'login' && (
            <div>
              <h2 className="text-lg font-display font-medium text-center text-[#F8F8F8] mb-6">Войдите в ModAI Team</h2>
              
              <form onSubmit={startMagicLinkFlow} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-sans font-medium text-[#B5B5BC] mb-1.5">
                    Рабочий Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B93]" size={16} />
                    <input
                      type="text"
                      placeholder="company@brand.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      className={`w-full h-[40px] bg-[#16161A] border rounded-[6px] pl-10 pr-4 py-2.5 text-sm font-sans focus:outline-none focus:border-[#C9A35F] transition-all placeholder-[#8B8B93] ${emailError ? 'border-[#C97878] focus:box-shadow-[0_0_0_3px_rgba(201,120,120,0.12)]' : 'border-[rgba(255,255,255,0.12)] focus:shadow-[0_0_0_3px_rgba(201,163,95,0.12)]'}`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-[#C97878] mt-1.5 flex items-center gap-1 p-2 bg-[rgba(201,120,120,0.12)] border border-[rgba(201,120,120,0.2)] rounded-[6px]">
                      <AlertTriangle size={12} />
                      {emailError}
                    </p>
                  )}
                  <p className="text-[11px] text-[#8B8B93] mt-2 leading-relaxed font-sans">
                    Для входа вам будет отправлена одноразовая беспарольная ссылка.
                  </p>
                </div>

                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    className="w-full h-[40px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] rounded-[6px] font-sans font-medium text-sm transition-all flex items-center justify-center gap-2 active:translate-y-[1px]"
                  >
                    <span>Отправить ссылку для входа</span>
                    <ArrowRight size={14} />
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-[rgba(255,255,255,0.08)]"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-[#8B8B93] uppercase tracking-wider font-mono">или</span>
                    <div className="flex-grow border-t border-[rgba(255,255,255,0.08)]"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleInstantRegister}
                    className="w-full h-[40px] bg-[#16161A] border border-[rgba(255,255,255,0.12)] hover:bg-[#1D1D21] text-[#F8F8F8] rounded-[6px] font-sans font-medium text-sm transition-colors flex items-center justify-center gap-1.5 active:translate-y-[1px]"
                  >
                    Зарегистрироваться в 1 клик
                  </button>
                </div>
              </form>
            </div>
          )}

          {pageState === 'sending' && (
            <div className="text-center py-6 space-y-4">
              <RefreshCw className="animate-spin text-[#C9A35F] mx-auto" size={32} />
              <h3 className="text-md font-display font-medium text-[#F8F8F8]">Отправляем ссылку для входа...</h3>
              <p className="text-xs text-[#8B8B93] max-w-xs mx-auto font-sans">
                Проверяем адрес и готовим закрытый хэш для авторизации.
              </p>
            </div>
          )}

          {pageState === 'sent' && (
            <div className="space-y-4 font-sans">
              <div className="bg-[#16161A] p-4 border border-[rgba(255,255,255,0.08)] rounded-[6px] text-center space-y-2">
                <CheckCircle className="text-[#78A98A] mx-auto" size={28} />
                <h3 className="text-sm font-display font-medium text-[#F8F8F8]">Ссылка для входа отправлена</h3>
                <p className="text-xs text-[#B5B5BC] break-all leading-tight">
                  Письмо отправлено на: <strong className="text-[#C9A35F] font-mono">{email || 'brand.owner@modai.team'}</strong>
                </p>
                <p className="text-[11px] text-[#8B8B93]">
                  Пожалуйста, проверьте папку "Спам", если ссылка не придет в течение минуты.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  disabled={cooldown > 0}
                  onClick={() => {
                    setCooldown(60);
                    setPageState('sending');
                    setTimeout(() => setPageState('sent'), 800);
                  }}
                  className="w-full h-[36px] text-xs border border-[rgba(255,255,255,0.12)] hover:bg-[#1D1D21] bg-transparent disabled:bg-[#16161A] disabled:text-[#5F5F66] text-[#B5B5BC] rounded-[6px] transition-colors font-medium active:translate-y-[1px]"
                >
                  {cooldown > 0 ? `Повторить отправку (${cooldown}с)` : 'Отправить повторно'}
                </button>
                <button
                  type="button"
                  onClick={() => setPageState('login')}
                  className="w-full text-xs text-center text-[#8B8B93] hover:text-[#F8F8F8] transition-colors py-1"
                >
                  Изменить email
                </button>
              </div>
            </div>
          )}

          {pageState === 'expired' && (
            <div className="text-center py-4 space-y-4 font-sans">
              <div className="bg-[#16161A] border border-[rgba(255,255,255,0.08)] p-4 rounded-[6px] space-y-2">
                <AlertTriangle className="text-[#C9A35F] mx-auto" size={28} />
                <h3 className="text-sm font-display font-medium text-[#F8F8F8]">Ссылка устарела</h3>
                <p className="text-xs text-[#B5B5BC]">
                  Эта ссылка для входа больше не активна. Ссылки действительны в течение 10 минут.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPageState('login')}
                className="w-full h-[#40px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] rounded-[6px] font-sans font-medium text-sm transition-all flex items-center justify-center gap-2 active:translate-y-[1px]"
              >
                Отправить новую ссылку
              </button>
            </div>
          )}

          {pageState === 'invalid' && (
            <div className="text-center py-4 space-y-4 font-sans">
              <div className="bg-[#16161A] border border-[rgba(255,255,255,0.08)] p-4 rounded-[6px] space-y-2">
                <AlertTriangle className="text-[#C97878] mx-auto" size={28} />
                <h3 className="text-sm font-display font-medium text-[#F8F8F8]">Не удалось войти по этой ссылке</h3>
                <p className="text-xs text-[#B5B5BC]">
                  Ссылка недействительна или уже была использована ранее.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPageState('login')}
                className="w-full h-[#40px] bg-[#C9A35F] hover:bg-[#D4B474] active:bg-[#A88444] text-[#050505] rounded-[6px] font-sans font-medium text-sm transition-all flex items-center justify-center gap-2 active:translate-y-[1px]"
              >
                Получить новую ссылку
              </button>
            </div>
          )}

          {/* Test Control Center in Grayscale UI - Always Present for Sandbox Prototype Testing */}
          <div className="mt-8 pt-6 border-t border-dashed border-[rgba(255,255,255,0.12)]">
            <p className="text-[10px] font-sans font-bold text-[#8B8B93] uppercase tracking-widest text-center mb-3">
              Инструменты тестирования авторизации
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => onLoginSuccess(email.trim() || 'demo-brand@modai.team', language)}
                className="text-xs bg-[#16161A] hover:bg-[#1D1D21] text-[#F8F8F8] border border-[rgba(255,255,255,0.12)] py-2 px-3 rounded-[6px] text-left flex justify-between items-center transition-colors"
              >
                <span>Симулировать успешный вход</span>
                <span className="font-mono text-[9px] bg-[#78A98A] text-[#050505] px-1.5 py-0.5 rounded font-bold uppercase">Success</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('vintage.clothing@brand.es');
                  setPageState('expired');
                }}
                className="text-xs bg-[#16161A] hover:bg-[#1D1D21] text-[#F8F8F8] border border-[rgba(255,255,255,0.12)] py-2 px-3 rounded-[6px] text-left flex justify-between items-center transition-colors"
              >
                <span>Симулировать устаревшую ссылку</span>
                <span className="font-mono text-[9px] bg-[#C9A35F] text-[#050505] px-1.5 py-0.5 rounded font-bold uppercase">Expired</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('denim.market@brand.ru');
                  setPageState('invalid');
                }}
                className="text-xs bg-[#16161A] hover:bg-[#1D1D21] text-[#F8F8F8] border border-[rgba(255,255,255,0.12)] py-2 px-3 rounded-[6px] text-left flex justify-between items-center transition-colors"
              >
                <span>Симулировать невалидную ссылку</span>
                <span className="font-mono text-[9px] bg-[#C97878] text-[#050505] px-1.5 py-0.5 rounded font-bold uppercase">Invalid</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Utilities */}
      <div className="max-w-md mx-auto w-full text-center flex flex-col gap-2 font-sans">
        <p className="text-xs text-[#8B8B93]">
          Умный продакшен контента для брендинга одежды • Снизьте стоимость съемки в 10 раз
        </p>
        <div className="flex justify-center gap-4 text-xs font-medium text-[#B5B5BC]">
          <a href="#rules" className="hover:text-[#F8F8F8] transition-colors flex items-center gap-1">
            <Shield size={12} className="text-[#C9A35F]" />
            Условия и политики
          </a>
        </div>
      </div>
    </div>
  );
}
