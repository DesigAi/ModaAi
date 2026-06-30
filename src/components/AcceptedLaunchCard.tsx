import React from 'react';
import { CheckCircle2, Copy, RefreshCw, X } from 'lucide-react';
import { WebLaunchAcceptedResponse } from '../api/contracts';
import { ResultItem } from '../types';

interface AcceptedLaunchCardProps {
  launch: WebLaunchAcceptedResponse;
  observedResult?: ResultItem;
  isRefreshing: boolean;
  lastRefreshedAt: number | null;
  refreshError: string | null;
  onRefresh: () => void;
  onDismiss: () => void;
}

function formatValue(value: string | null | undefined) {
  return value && value.length > 0 ? value : 'ожидается';
}

function formatRefreshTime(value: number | null) {
  if (!value) return 'ещё не обновляли';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function AcceptedLaunchCard({
  launch,
  observedResult,
  isRefreshing,
  lastRefreshedAt,
  refreshError,
  onRefresh,
  onDismiss,
}: AcceptedLaunchCardProps) {
  const copyRequestId = async () => {
    try {
      await navigator.clipboard.writeText(launch.requestId);
    } catch (error) {
      console.warn('Failed to copy launch requestId', error);
    }
  };

  return (
    <section
      role="status"
      aria-live="polite"
      className="mx-auto mt-6 max-w-6xl rounded-[12px] border border-[rgba(201,163,95,0.28)] bg-[#0F0F11] p-4 shadow-lg shadow-[rgba(201,163,95,0.08)] font-sans"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(201,163,95,0.12)] text-[#C9A35F]">
            <CheckCircle2 size={20} />
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#C9A35F]">D1 · streetwear · mock-safe</p>
              <h2 className="mt-1 text-lg font-display font-medium text-[#F8F8F8]">Запуск принят в очередь</h2>
            </div>
            <p className="max-w-2xl text-xs leading-relaxed text-[#B5B5BC]">
              Backend HTTP принял canonical launch и создал mock-safe job. Это не готовый результат генерации:
              ниже показан последний честный status из backend workspace/results.
            </p>
          </div>
        </div>

        <div className="flex gap-2 md:justify-end">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-[rgba(255,255,255,0.10)] bg-[#16161A] px-3 text-xs font-semibold text-[#F8F8F8] transition-colors hover:border-[#C9A35F] hover:text-[#C9A35F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Обновить
          </button>
          <button
            type="button"
            onClick={copyRequestId}
            className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-[rgba(255,255,255,0.10)] bg-[#16161A] px-3 text-xs font-semibold text-[#F8F8F8] transition-colors hover:border-[#C9A35F] hover:text-[#C9A35F]"
          >
            <Copy size={14} />
            Copy requestId
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Скрыть карточку принятого запуска"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-[rgba(255,255,255,0.10)] bg-[#16161A] text-[#8B8B93] transition-colors hover:border-[#C9A35F] hover:text-[#F8F8F8]"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 border-t border-[rgba(255,255,255,0.08)] pt-4 text-xs md:grid-cols-5">
        <div className="rounded-[8px] bg-[#050505] p-3">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-[#8B8B93]">accepted</span>
          <span className="mt-1 block font-mono font-semibold text-[#C9A35F]">{launch.status}</span>
        </div>
        <div className="rounded-[8px] bg-[#050505] p-3">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-[#8B8B93]">backend result</span>
          <span className="mt-1 block font-mono font-semibold text-[#F8F8F8]">
            {observedResult ? observedResult.status : 'not_found_yet'}
          </span>
        </div>
        <div className="rounded-[8px] bg-[#050505] p-3">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-[#8B8B93]">requestId</span>
          <span className="mt-1 block break-all font-mono text-[#F8F8F8]">{launch.requestId}</span>
        </div>
        <div className="rounded-[8px] bg-[#050505] p-3">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-[#8B8B93]">jobId</span>
          <span className="mt-1 block break-all font-mono text-[#F8F8F8]">{launch.jobId}</span>
        </div>
        <div className="rounded-[8px] bg-[#050505] p-3">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-[#8B8B93]">resultId</span>
          <span className="mt-1 block break-all font-mono text-[#F8F8F8]">{formatValue(launch.resultId)}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 rounded-[8px] border border-[rgba(255,255,255,0.08)] bg-[#050505] p-3 text-xs text-[#B5B5BC] md:flex-row md:items-center md:justify-between">
        <span>
          Last refresh: <span className="font-mono text-[#F8F8F8]">{formatRefreshTime(lastRefreshedAt)}</span>
        </span>
        {observedResult?.status === 'queued' && (
          <span className="font-mono text-[#C9A35F]">backend still reports queued — no fake completion shown</span>
        )}
        {refreshError && <span className="font-mono text-[#C97878]">refresh failed: {refreshError}</span>}
      </div>
    </section>
  );
}
