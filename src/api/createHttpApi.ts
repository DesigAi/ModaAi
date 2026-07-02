import {
  LaunchContextRefreshResponse,
  LaunchProductionRequest,
  ModaApi,
  ModaWorkspace,
  WebLaunchBlockedResponse,
  WebLaunchResponse,
} from './contracts';

export function createHttpApi(): ModaApi {
  const baseUrl = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const initData = String(import.meta.env.VITE_TELEGRAM_INIT_DATA || '');
  const devUserId = String(import.meta.env.VITE_MODAAI_DEV_USER_ID || '');
  const devAdmin = String(import.meta.env.VITE_MODAAI_DEV_ADMIN || '');

  const authHeaders = () => ({
    ...(devUserId ? { 'X-ModaAI-Dev-User-Id': devUserId } : {}),
    ...(devAdmin ? { 'X-ModaAI-Dev-Admin': devAdmin } : {}),
    ...(!devUserId && initData ? { 'X-Telegram-Init-Data': initData } : {}),
  });

  const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    if (!baseUrl) {
      throw new Error('VITE_API_BASE_URL is required for VITE_API_MODE=http');
    }
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...(init.headers || {}),
      },
    });
    const data = (await response.json()) as T;
    if (!response.ok) {
      throw Object.assign(new Error(`ModaAI API ${response.status}`), { response: data });
    }
    return data;
  };

  const getWorkspace = () => request<ModaWorkspace>('/api/v1/web/workspace');

  const refreshWorkspaceAfter = async <T>(path: string, init: RequestInit = {}): Promise<ModaWorkspace> => {
    await request<T>(path, init);
    return getWorkspace();
  };

  const fail = async () => {
    throw new Error(
      'ModaAI HTTP adapter method is not implemented in this slice. Use VITE_API_MODE=demo for local UI state.',
    );
  };

  return {
    getWorkspace,
    async saveWorkspace(workspace: ModaWorkspace) {
      return refreshWorkspaceAfter('/api/v1/web/auth/session', {
        method: 'POST',
        body: JSON.stringify({
          email: workspace.session.email,
          interfaceLanguage: workspace.session.interfaceLanguage,
        }),
      });
    },
    resetWorkspace: fail,
    async loginDemo({ email, interfaceLanguage }) {
      return request<ModaWorkspace>('/api/v1/web/auth/session', {
        method: 'POST',
        body: JSON.stringify({ email, interfaceLanguage }),
      });
    },
    logoutDemo: fail,
    startProductionFlow: fail,
    updateProductionFlow: fail,
    clearProductionFlow: fail,
    async saveModel(model) {
      return refreshWorkspaceAfter('/api/v1/web/models', {
        method: 'POST',
        body: JSON.stringify(model),
      });
    },
    async saveLook(look) {
      return refreshWorkspaceAfter('/api/v1/web/looks', {
        method: 'POST',
        body: JSON.stringify(look),
      });
    },
    deleteLook: fail,
    updateLookName: fail,
    async saveWardrobeKit(kit) {
      return refreshWorkspaceAfter('/api/v1/web/wardrobe/kits', {
        method: 'POST',
        body: JSON.stringify(kit),
      });
    },
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
      return response;
    },
    async refreshLaunchContext(_resultId: string): Promise<LaunchContextRefreshResponse> {
      return { workspace: await request<ModaWorkspace>('/api/v1/web/workspace') };
    },
    advanceResultStatus: fail,
    refundResult: fail,
    manualFixResult: fail,
    addLedgerEntry: fail,
    addCredits: fail,
    adminAdjustCredits: fail,
  };
}
