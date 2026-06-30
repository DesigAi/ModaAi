import { ActiveProductionFlow } from '../types';
import {
  WebLaunchBlockedError,
  WebLaunchRequest,
  WebSingleLookLaunchRequest,
} from './contracts';

export interface BuildCanonicalLaunchOptions {
  mode?: 'mock' | 'production';
  requestId?: string;
  seedanceResolution?: '480p' | '720p' | '1080p';
}

export interface CanonicalLaunchBuildSuccess {
  ok: true;
  canonicalLaunch: WebLaunchRequest;
}

export interface CanonicalLaunchBuildBlocked {
  ok: false;
  error: WebLaunchBlockedError;
  message: string;
  details?: Record<string, unknown>;
}

export type CanonicalLaunchBuildResult = CanonicalLaunchBuildSuccess | CanonicalLaunchBuildBlocked;

function requestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `web_launch_${Date.now()}`;
}

export function buildCanonicalLaunchFromFlow(
  flow: ActiveProductionFlow,
  reserveType: 'photo' | 'kit',
  options: BuildCanonicalLaunchOptions = {},
): CanonicalLaunchBuildResult {
  if (reserveType !== 'photo' || flow.type !== 'photo') {
    return {
      ok: false,
      error: 'unsupported_template',
      message: 'This frontend slice can build only the D1/streetwear single-look launch payload.',
      details: {
        reserveType,
        flowType: flow.type,
        nextRequiredTemplateSupport: 'B1/C1 full-parity mapping',
      },
    };
  }

  if (!flow.selectedModel || !flow.selectedKit) {
    return {
      ok: false,
      error: 'invalid_launch_payload',
      message: 'Select a model and wardrobe kit before launch.',
    };
  }

  if (!flow.lookId) {
    return {
      ok: false,
      error: 'invalid_launch_payload',
      message: 'Save the look before launch so backend can validate owned look bindings.',
    };
  }

  if (!flow.selectedModel.characterIdentityCardId) {
    return {
      ok: false,
      error: 'invalid_launch_payload',
      message: 'Selected model is not linked to a backend CharacterIdentityCard yet.',
      details: { modelId: flow.selectedModel.id },
    };
  }

  const launch: WebSingleLookLaunchRequest = {
    requestId: options.requestId ?? requestId(),
    templateId: 'D1',
    mode: options.mode ?? 'mock',
    reserveType: 'photo',
    lookName: flow.lookName,
    look: {
      lookId: flow.lookId,
      modelId: flow.selectedModel.id,
      kitId: flow.selectedKit.id,
      characterIdentityCardId: flow.selectedModel.characterIdentityCardId,
    },
    seedanceResolution: options.seedanceResolution ?? '720p',
  };

  if (flow.selectedLocation) {
    launch.scene = { frontendId: flow.selectedLocation };
  }
  if (flow.selectedPosePack) {
    launch.posePack = { frontendId: flow.selectedPosePack };
  }
  if (flow.selectedVideoTemplate) {
    launch.videoTemplate = { frontendId: flow.selectedVideoTemplate };
  }

  return { ok: true, canonicalLaunch: launch };
}
