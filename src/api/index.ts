import { ModaApi } from './contracts';
import { createDemoApi } from './demoStore';

const apiMode = (import.meta.env.VITE_API_MODE || 'demo') as 'demo' | 'http';

function createHttpApi(): ModaApi {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const fail = async () => {
    throw new Error(
      `ModaAI live API is not wired yet. Set VITE_API_MODE=demo or implement the backend adapter at ${baseUrl || 'VITE_API_BASE_URL'}.`,
    );
  };

  return {
    getWorkspace: fail,
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
    launchProduction: fail,
    advanceResultStatus: fail,
    refundResult: fail,
    manualFixResult: fail,
    addLedgerEntry: fail,
    addCredits: fail,
    adminAdjustCredits: fail,
  };
}

export const modaApi: ModaApi = apiMode === 'demo' ? createDemoApi() : createHttpApi();
export type { ModaWorkspace } from './contracts';
