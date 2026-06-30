import {
  SeedanceResolution,
  WebB1LaunchRequest,
  WebC1LaunchRequest,
  WebLaunchLookRef,
  WebLaunchMode,
  WebLaunchRequest,
} from './contracts';

export type FiveLaunchLooks = [
  WebLaunchLookRef,
  WebLaunchLookRef,
  WebLaunchLookRef,
  WebLaunchLookRef,
  WebLaunchLookRef,
];

export type ThreeLaunchLooks = [WebLaunchLookRef, WebLaunchLookRef, WebLaunchLookRef];

export interface MultiLookLaunchDraftBase {
  requestId: string;
  mode?: WebLaunchMode;
  lookName?: string;
  seedanceResolution?: SeedanceResolution;
}

export interface B1LaunchDraft extends MultiLookLaunchDraftBase {
  templateId: 'B1';
  characterIdentityCardId: string;
  looks: FiveLaunchLooks;
}

export interface C1LaunchDraft extends MultiLookLaunchDraftBase {
  templateId: 'C1';
  looks: ThreeLaunchLooks;
}

export type MultiLookLaunchDraft = B1LaunchDraft | C1LaunchDraft;

export interface MultiLookLaunchDraftBuildSuccess {
  ok: true;
  canonicalLaunch: WebLaunchRequest;
}

export interface MultiLookLaunchDraftBuildBlocked {
  ok: false;
  error: 'invalid_launch_payload';
  message: string;
  details?: Record<string, unknown>;
}

export type MultiLookLaunchDraftBuildResult =
  | MultiLookLaunchDraftBuildSuccess
  | MultiLookLaunchDraftBuildBlocked;

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function missingLookFields(looks: WebLaunchLookRef[]): string[] {
  const missing: string[] = [];
  looks.forEach((look, index) => {
    if (!look.lookId) missing.push(`looks[${index}].lookId`);
    if (!look.modelId) missing.push(`looks[${index}].modelId`);
    if (!look.kitId) missing.push(`looks[${index}].kitId`);
    if (!look.characterIdentityCardId) missing.push(`looks[${index}].characterIdentityCardId`);
  });
  return missing;
}

export function buildCanonicalMultiLookLaunchDraft(
  draft: MultiLookLaunchDraft,
): MultiLookLaunchDraftBuildResult {
  if (!Array.isArray(draft.looks)) {
    return {
      ok: false,
      error: 'invalid_launch_payload',
      message: 'Multi-look launch draft requires a looks array.',
    };
  }

  if (draft.templateId === 'B1' && draft.looks.length !== 5) {
    return {
      ok: false,
      error: 'invalid_launch_payload',
      message: 'B1 launch draft requires exactly five looks.',
      details: { expected: 5, actual: draft.looks.length },
    };
  }

  if (draft.templateId === 'C1' && draft.looks.length !== 3) {
    return {
      ok: false,
      error: 'invalid_launch_payload',
      message: 'C1 launch draft requires exactly three looks.',
      details: { expected: 3, actual: draft.looks.length },
    };
  }

  const missing = missingLookFields(draft.looks);
  if (missing.length > 0) {
    return {
      ok: false,
      error: 'invalid_launch_payload',
      message: 'Every multi-look launch item must include look, model, kit, and character card ids.',
      details: { missing },
    };
  }

  if (draft.templateId === 'B1') {
    const characterIds = unique(draft.looks.map((look) => look.characterIdentityCardId));
    if (!draft.characterIdentityCardId) {
      return {
        ok: false,
        error: 'invalid_launch_payload',
        message: 'B1 launch draft requires a shared character identity card id.',
      };
    }
    if (characterIds.length !== 1 || characterIds[0] !== draft.characterIdentityCardId) {
      return {
        ok: false,
        error: 'invalid_launch_payload',
        message: 'B1 launch draft requires all five looks to use the shared character card.',
        details: { sharedCharacterIdentityCardId: draft.characterIdentityCardId, lookCharacterIdentityCardIds: characterIds },
      };
    }

    const launch: WebB1LaunchRequest = {
      requestId: draft.requestId,
      templateId: 'B1',
      mode: draft.mode ?? 'mock',
      reserveType: 'kit',
      lookName: draft.lookName,
      seedanceResolution: draft.seedanceResolution ?? '720p',
      characterIdentityCardId: draft.characterIdentityCardId,
      looks: draft.looks,
    };
    return { ok: true, canonicalLaunch: launch };
  }

  const characterIds = unique(draft.looks.map((look) => look.characterIdentityCardId));
  if (characterIds.length !== 3) {
    return {
      ok: false,
      error: 'invalid_launch_payload',
      message: 'C1 launch draft requires three unique character identity card ids.',
      details: { lookCharacterIdentityCardIds: characterIds },
    };
  }

  const launch: WebC1LaunchRequest = {
    requestId: draft.requestId,
    templateId: 'C1',
    mode: draft.mode ?? 'mock',
    reserveType: 'kit',
    lookName: draft.lookName,
    seedanceResolution: draft.seedanceResolution ?? '720p',
    looks: draft.looks,
  };
  return { ok: true, canonicalLaunch: launch };
}
