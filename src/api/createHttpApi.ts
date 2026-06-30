import {
  LaunchProductionRequest,
  ModaApi,
  ModaWorkspace,
  WebLaunchBlockedResponse,
  WebLaunchResponse,
} from './contracts';

export function createHttpApi(): ModaApi {
  const baseUrl = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const initData = import.meta.env.VITE_TELEGRAM_INIT_DATA || '';

  const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    if (!baseUrl) {
      throw new Error('VITE_API_BASE_URL is required for VITE_API_MODE=http');
    }
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(initData ? { 'X-Telegram-Init-Data': initData } : {}),
        ...(init.headers || {}),
      },
    });
    const data = (await response.json()) as T;
    if (!response.ok) {
      throw Object.assign(new Error(`ModaAI API ${response.status}`), { response: data });
    }
    return data;
  };

  const fail = async () => {
    throw new Error(
      'ModaAI HTTP adapter method is not implemented in this slice. Use VITE_API_MODE=demo for local UI state.',
    );
  };

  return {
    getWorkspace: () => request<ModaWorkspace>('/api/v1/web/workspace'),
    saveWorkspace: fail,
    resetWorkspace: fail,
    loginDemo: fail,
    logoutDemo: fail,
    startProductionFlow: fail,
    updateProductionFlow: fail,
    clearProductionFlow: fail,
    saveModel: fail,
    saveLook: fail,
    deleteLook: fail,
    updateLookName: fail,
    saveWardrobeKit: fail,
    deleteWardrobeItem: fail,
    deleteWardrobeKit: fail,
    toggleWardrobeItemVisibility: fail,
    toggleWardrobeKitVisibility: fail,
    async launchProduction(requestBody: LaunchProductionRequest) {
      if (!requestBody.canonicalLaunch) {
        throw Object.assign(new Error('canonicalLaunch is required for HTTP launch'), {
          response: {
            ok: false,
            error: 'invalid_launch_payload',
            message: 'canonicalLaunch is required for HTTP launch.',
          } satisfies WebLaunchBlockedResponse,
        });
      }
      const response = await request<WebLaunchResponse>('/api/v1/web/launch', {
        method: 'POST',
        body: JSON.stringify(requestBody.canonicalLaunch),
      });
      if (response.ok === false) {
        throw Object.assign(new Error(response.message), { response });
      }
      return response.workspace;
    },
    advanceResultStatus: fail,
    refundResult: fail,
    manualFixResult: fail,
    addLedgerEntry: fail,
    addCredits: fail,
    adminAdjustCredits: fail,
  };
}
