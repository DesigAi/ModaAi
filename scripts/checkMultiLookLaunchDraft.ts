import {
  buildCanonicalMultiLookLaunchDraft,
  MultiLookLaunchDraftBuildBlocked,
  MultiLookLaunchDraftBuildResult,
} from '../src/api/multiLookLaunchDraft';
import { WebLaunchLookRef } from '../src/api/contracts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function expectBlocked(
  result: MultiLookLaunchDraftBuildResult,
  message: string,
): MultiLookLaunchDraftBuildBlocked {
  if (result.ok === true) throw new Error(message);
  return result;
}

function look(index: number, cardId: string): WebLaunchLookRef {
  return {
    lookId: `look-${index}`,
    modelId: `model-${index}`,
    kitId: `kit-${index}`,
    characterIdentityCardId: cardId,
  };
}

const b1 = buildCanonicalMultiLookLaunchDraft({
  requestId: 'req-b1',
  templateId: 'B1',
  characterIdentityCardId: 'card-shared',
  looks: [1, 2, 3, 4, 5].map((index) => look(index, 'card-shared')) as [
    WebLaunchLookRef,
    WebLaunchLookRef,
    WebLaunchLookRef,
    WebLaunchLookRef,
    WebLaunchLookRef,
  ],
});
assert(b1.ok, 'B1 canonical draft should build');
assert(b1.canonicalLaunch.templateId === 'B1', 'B1 template expected');
assert(b1.canonicalLaunch.looks.length === 5, 'B1 must keep exactly five looks');
assert(b1.canonicalLaunch.characterIdentityCardId === 'card-shared', 'B1 shared card expected');

const b1TooShort = expectBlocked(
  buildCanonicalMultiLookLaunchDraft({
    requestId: 'req-b1-short',
    templateId: 'B1',
    characterIdentityCardId: 'card-shared',
    looks: [
      look(1, 'card-shared'),
      look(2, 'card-shared'),
      look(3, 'card-shared'),
      look(4, 'card-shared'),
    ],
  } as any),
  'B1 draft with four looks should be blocked',
);
assert(b1TooShort.error === 'invalid_launch_payload', 'B1 short draft must be invalid payload');
assert(b1TooShort.details?.expected === 5, 'B1 short draft should report expected length');
assert(b1TooShort.details?.actual === 4, 'B1 short draft should report actual length');

const b1Mismatch = expectBlocked(
  buildCanonicalMultiLookLaunchDraft({
    requestId: 'req-b1-bad',
    templateId: 'B1',
    characterIdentityCardId: 'card-shared',
    looks: [
      look(1, 'card-shared'),
      look(2, 'card-shared'),
      look(3, 'card-other'),
      look(4, 'card-shared'),
      look(5, 'card-shared'),
    ],
  }),
  'B1 mismatched card draft should be blocked',
);
assert(b1Mismatch.error === 'invalid_launch_payload', 'B1 mismatch must be invalid payload');

const c1 = buildCanonicalMultiLookLaunchDraft({
  requestId: 'req-c1',
  templateId: 'C1',
  looks: [look(1, 'card-a'), look(2, 'card-b'), look(3, 'card-c')],
});
assert(c1.ok, 'C1 canonical draft should build');
assert(c1.canonicalLaunch.templateId === 'C1', 'C1 template expected');
assert(c1.canonicalLaunch.looks.length === 3, 'C1 must keep exactly three looks');

const c1TooShort = expectBlocked(
  buildCanonicalMultiLookLaunchDraft({
    requestId: 'req-c1-short',
    templateId: 'C1',
    looks: [look(1, 'card-a'), look(2, 'card-b')],
  } as any),
  'C1 draft with two looks should be blocked',
);
assert(c1TooShort.error === 'invalid_launch_payload', 'C1 short draft must be invalid payload');
assert(c1TooShort.details?.expected === 3, 'C1 short draft should report expected length');
assert(c1TooShort.details?.actual === 2, 'C1 short draft should report actual length');

const c1Duplicate = expectBlocked(
  buildCanonicalMultiLookLaunchDraft({
    requestId: 'req-c1-bad',
    templateId: 'C1',
    looks: [look(1, 'card-a'), look(2, 'card-b'), look(3, 'card-b')],
  }),
  'C1 duplicate-card draft should be blocked',
);
assert(c1Duplicate.error === 'invalid_launch_payload', 'C1 duplicate cards must be invalid payload');

console.log('multi-look canonical launch draft checks passed');
