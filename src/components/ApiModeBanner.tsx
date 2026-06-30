import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ApiMode } from '../api/contracts';

interface ApiModeBannerProps {
  mode: ApiMode;
}

export default function ApiModeBanner({ mode }: ApiModeBannerProps) {
  const isHttp = mode === 'http';
  const Icon = isHttp ? CheckCircle2 : AlertTriangle;

  return (
    <div
      className={`mx-auto mt-4 max-w-6xl rounded-[8px] border px-4 py-3 font-sans text-xs ${
        isHttp
          ? 'border-[rgba(120,169,138,0.30)] bg-[rgba(120,169,138,0.08)] text-[#D8E9DD]'
          : 'border-[rgba(201,163,95,0.34)] bg-[rgba(201,163,95,0.10)] text-[#E8D5AA]'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Icon size={15} className={isHttp ? 'text-[#78A98A]' : 'text-[#C9A35F]'} />
          <span className="font-mono font-semibold uppercase tracking-[0.16em]">
            API mode: {mode}
          </span>
        </div>
        <span className="text-[11px] leading-relaxed text-[#B5B5BC]">
          {isHttp
            ? 'Backend HTTP mode is active. D1 launches use the real local backend endpoint.'
            : 'Demo mode is active — this is local UI simulation, not the backend teammate test path.'}
        </span>
      </div>
    </div>
  );
}
