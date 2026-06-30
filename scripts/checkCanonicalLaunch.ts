import {
  buildCanonicalLaunchFromFlow,
  CanonicalLaunchBuildBlocked,
  CanonicalLaunchBuildResult,
} from '../src/api/buildCanonicalLaunch';
import { ActiveProductionFlow } from '../src/types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function expectBlocked(result: CanonicalLaunchBuildResult, message: string): CanonicalLaunchBuildBlocked {
  if (result.ok === true) {
    throw new Error(message);
  }
  return result;
}

const d1Flow: ActiveProductionFlow = {
  id: 'flow-1',
  type: 'photo',
  currentStep: 6,
  selectedModel: {
    id: 'model-1',
    name: 'Model One',
    gender: 'Женский',
    age: '23-28',
    ethnotype: 'Европейский',
    bodyType: 'Стройная',
    skinTone: '#E4C3AD',
    notes: 'test',
    previewUrl: 'preview',
    characterIdentityCardId: 'card-1',
    timestamp: 1,
  },
  selectedKit: {
    id: 'kit-1',
    name: 'Kit One',
    items: [],
    usageStatus: 'active',
    createdAt: '2026-06-30',
  },
  lookName: 'Look One',
  lookId: 'look-1',
  selectedLocation: 'Коста-дель-Соль',
  selectedPosePack: 'Классика',
  selectedVideoTemplate: 'Streetwear',
  locationSettings: {
    temperature: 'Теплый',
    hardness: 'Мягкий',
    intensity: 'Приглушенный',
  },
};

const d1 = buildCanonicalLaunchFromFlow(d1Flow, 'photo', {
  requestId: 'req-1',
  seedanceResolution: '720p',
});
assert(d1.ok, 'D1 flow should build');
assert(d1.canonicalLaunch.templateId === 'D1', 'D1 template expected');
assert(d1.canonicalLaunch.mode === 'mock', 'mock mode expected');
assert(d1.canonicalLaunch.reserveType === 'photo', 'photo reserve expected');
assert(d1.canonicalLaunch.look.lookId === 'look-1', 'look id expected');
assert(d1.canonicalLaunch.look.characterIdentityCardId === 'card-1', 'character card expected');
assert(d1.canonicalLaunch.scene?.frontendId === 'Коста-дель-Соль', 'scene frontend id expected');

const b1Fallback = expectBlocked(
  buildCanonicalLaunchFromFlow({ ...d1Flow, type: 'kit' }, 'kit', {
    requestId: 'req-b1',
  }),
  'kit/B1-ish flow should remain blocked in this slice',
);
assert(b1Fallback.error === 'unsupported_template', 'unsupported_template expected for kit flow');

const missingCard = expectBlocked(
  buildCanonicalLaunchFromFlow(
    {
      ...d1Flow,
      selectedModel: { ...d1Flow.selectedModel!, characterIdentityCardId: null },
    },
    'photo',
  ),
  'model without backend card must be blocked',
);
assert(missingCard.error === 'invalid_launch_payload', 'invalid payload expected for missing card');

console.log('canonical launch builder checks passed');
