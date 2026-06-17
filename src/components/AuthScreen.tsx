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
    <div className="min-h-screen bg-[#F6F6F6] text-[#111111] flex flex-col justify-between p-8 font-sans">
      {/* Top Header - Language Selector & Version */}
      <div className="flex justify-between items-center max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 font-mono text-xs tracking-wider text-neutral-500 uppercase">
          <span>ModAI Team</span>
          <span>v1.2</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-[#D7D7D7] rounded-lg p-1 text-xs">
          <Globe size={13} className="text-[#555555]" />
          <button
            onClick={() => setLanguage('ru')}
            className={`px-2 py-1 rounded transition-colors ${language === 'ru' ? 'bg-[#111111] text-white' : 'hover:bg-neutral-100 text-[#555555]'}`}
          >
            RU
          </button>
          <button
            onClick={() => setLanguage('es')}
            className={`px-2 py-1 rounded transition-colors ${language === 'es' ? 'bg-[#111111] text-white' : 'hover:bg-neutral-100 text-[#555555]'}`}
          >
            ES
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="bg-white border border-[#D7D7D7] rounded-lg p-8 w-full max-w-md shadow-sm">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight">ModAI Team</h1>
            <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">Fashion AI Production</p>
          </div>

          {pageState === 'login' && (
            <div>
              <h2 className="text-lg font-semibold text-center mb-6">Войдите в ModAI Team</h2>
              
              <form onSubmit={startMagicLinkFlow} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#555555] mb-1.5 uppercase tracking-wider">
                    Рабочий Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input
                      type="text"
                      placeholder="company@brand.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      className={`w-full bg-white border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#111111] transition-colors ${emailError ? 'border-red-500' : 'border-[#D7D7D7]'}`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1 p-1 bg-red-50 rounded">
                      <AlertTriangle size={12} />
                      {emailError}
                    </p>
                  )}
                  <p className="text-[11px] text-[#888888] mt-1.5 leading-relaxed">
                    Для входа вам будет отправлена одноразовая беспарольная ссылка.
                  </p>
                </div>

                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    className="w-full bg-[#111111] hover:bg-neutral-800 text-white rounded-lg py-2.5 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    Отправить ссылку для входа
                    <ArrowRight size={14} />
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-[#D7D7D7]"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-neutral-400 uppercase tracking-wider">или</span>
                    <div className="flex-grow border-t border-[#D7D7D7]"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleInstantRegister}
                    className="w-full border border-[#111111] hover:bg-neutral-50 text-[#111111] rounded-lg py-2.5 font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    Зарегистрироваться в 1 клик
                  </button>
                </div>
              </form>
            </div>
          )}

          {pageState === 'sending' && (
            <div className="text-center py-6 space-y-4">
              <RefreshCw className="animate-spin text-neutral-400 mx-auto" size={32} />
              <h3 className="text-md font-semibold">Отправляем ссылку для входа...</h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Проверяем адрес и готовим закрытый хэш для авторизации.
              </p>
            </div>
          )}

          {pageState === 'sent' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 border border-[#D1D1D1] rounded-lg text-center space-y-2">
                <CheckCircle className="text-neutral-700 mx-auto" size={28} />
                <h3 className="text-sm font-semibold">Ссылка для входа отправлена</h3>
                <p className="text-xs text-[#555555] break-all leading-tight">
                  Письмо отправлено на: <strong className="text-[#111111] font-mono">{email || 'brand.owner@modai.team'}</strong>
                </p>
                <p className="text-[11px] text-neutral-500">
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
                  className="w-full text-xs border border-[#D7D7D7] disabled:bg-neutral-100 disabled:text-neutral-400 text-neutral-700 py-2 rounded transition-colors"
                >
                  {cooldown > 0 ? `Повторить отправку (${cooldown}с)` : 'Отправить повторно'}
                </button>
                <button
                  type="button"
                  onClick={() => setPageState('login')}
                  className="w-full text-xs text-center text-[#555555] hover:underline py-1"
                >
                  Изменить email
                </button>
              </div>
            </div>
          )}

          {pageState === 'expired' && (
            <div className="text-center py-4 space-y-4">
              <div className="bg-neutral-50 border border-neutral-300 p-4 rounded-lg space-y-2">
                <AlertTriangle className="text-neutral-600 mx-auto" size={28} />
                <h3 className="text-sm font-semibold">Ссылка устарела</h3>
                <p className="text-xs text-[#555555]">
                  Эта ссылка для входа больше не активна. Ссылки действительны в течение 10 минут.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPageState('login')}
                className="w-full bg-[#111111] hover:bg-neutral-800 text-white rounded-lg py-2.5 font-medium text-sm transition-colors"
              >
                Отправить новую ссылку
              </button>
            </div>
          )}

          {pageState === 'invalid' && (
            <div className="text-center py-4 space-y-4">
              <div className="bg-neutral-50 border border-neutral-300 p-4 rounded-lg space-y-2">
                <AlertTriangle className="text-neutral-600 mx-auto" size={28} />
                <h3 className="text-sm font-semibold">Не удалось войти по этой ссылке</h3>
                <p className="text-xs text-[#555555]">
                  Ссылка недействительна или уже была использована ранее.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPageState('login')}
                className="w-full bg-[#111111] hover:bg-neutral-800 text-white rounded-lg py-2.5 font-medium text-sm transition-colors"
              >
                Получить новую ссылку
              </button>
            </div>
          )}

          {/* Test Control Center in Grayscale UI - Always Present for Sandbox Prototype Testing */}
          <div className="mt-8 pt-6 border-t border-dashed border-[#D7D7D7]">
            <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest text-center mb-3">
              Инструменты тестирования авторизации
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => onLoginSuccess(email.trim() || 'demo-brand@modai.team', language)}
                className="text-xs bg-neutral-100 hover:bg-neutral-200 text-[#111111] border border-[#D7D7D7] py-1.5 px-3 rounded text-left flex justify-between items-center"
              >
                <span>Симулировать успешный вход</span>
                <span className="font-mono text-[9px] bg-[#A8A8A8] text-white px-1.5 rounded uppercase">Success</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('vintage.clothing@brand.es');
                  setPageState('expired');
                }}
                className="text-xs bg-neutral-100 hover:bg-neutral-200 text-[#111111] border border-[#D7D7D7] py-1.5 px-3 rounded text-left flex justify-between items-center"
              >
                <span>Симулировать устаревшую ссылку</span>
                <span className="font-mono text-[9px] bg-neutral-400 text-white px-1.5 rounded uppercase">Expired</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('denim.market@brand.ru');
                  setPageState('invalid');
                }}
                className="text-xs bg-neutral-100 hover:bg-neutral-200 text-[#111111] border border-[#D7D7D7] py-1.5 px-3 rounded text-left flex justify-between items-center"
              >
                <span>Симулировать невалидную ссылку</span>
                <span className="font-mono text-[9px] bg-neutral-400 text-white px-1.5 rounded uppercase">Invalid</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Utilities */}
      <div className="max-w-md mx-auto w-full text-center flex flex-col gap-2">
        <p className="text-xs text-neutral-500">
          Умный продакшен контента для брендинга одежды • Снизьте стоимость съемки в 10 раз
        </p>
        <div className="flex justify-center gap-4 text-xs font-medium text-neutral-600">
          <a href="#rules" className="hover:underline flex items-center gap-1">
            <Shield size={12} />
            Условия и политики
          </a>
        </div>
      </div>
    </div>
  );
}
