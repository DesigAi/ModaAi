import {
  ActiveProductionFlow,
  LedgerEvent,
  LedgerItem,
  ResultItem,
  ResultState,
} from '../types';
import {
  INITIAL_LEDGER,
  INITIAL_LOOKS,
  INITIAL_MODELS,
  INITIAL_WARDROBE_ITEMS,
  INITIAL_WARDROBE_KITS,
} from '../mockData';
import {
  AddLedgerEntryRequest,
  AdminCreditAdjustmentRequest,
  AdvanceResultStatusRequest,
  CreditsState,
  DemoLoginRequest,
  LaunchProductionRequest,
  ModaApi,
  ModaWorkspace,
  StartProductionFlowRequest,
} from './contracts';

const STORAGE_KEY = 'modai_demo_workspace_v2';
const LEGACY_STORAGE_KEY = 'modai_demo_workspace_v1';
const DEFAULT_EMAIL = 'brand.director@modai.team';

const READY_IMAGES = [
  'Поза 1: Фронтальный ракурс',
  'Поза 2: Левый полуоборот',
  'Поза 3: Правый полуоборот',
  'Поза 4: Ракурс спины',
  'Поза 5: Портретная деталь',
  'Поза 6: Фокус на ткань',
  'Поза 7: Динамичный шаг',
];

function nowDateTime() {
  return `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString().slice(0, 5)}`;
}

function uniqueId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function defaultResult(): ResultItem {
  return {
    id: 'res_demo_ready',
    name: 'Летний шелковый рендер платья миди №1',
    type: 'kit',
    status: 'ready',
    date: '17.06.2026 12:15',
    location: 'Коста-дель-Соль',
    posePack: 'Классика',
    videoTemplate: 'Streetwear',
    lookId: 'look_1',
    lookName: 'Мария в Черном Шелке',
    modelName: 'Мария Е.',
    images: READY_IMAGES,
    videoUrl: '15-секундное вертикальное AI-видео (1080p)',
    cancelAllowed: false,
  };
}

function defaultCredits(): CreditsState {
  return {
    photoSetCredits: 1,
    kitCredits: 1,
    reservedPhotoSetCredits: 0,
    reservedKitCredits: 0,
  };
}

function availableCredits(credits: CreditsState, type: 'photo' | 'kit') {
  return type === 'photo' ? credits.photoSetCredits : credits.kitCredits;
}

function reservedCredits(credits: CreditsState, type: 'photo' | 'kit') {
  return type === 'photo' ? credits.reservedPhotoSetCredits : credits.reservedKitCredits;
}

function creditLabel(type: 'photo' | 'kit') {
  return type === 'photo' ? 'фото-кредит' : 'комплект-кредит';
}

function addAvailableCredit(credits: CreditsState, type: 'photo' | 'kit', amount: number): CreditsState {
  return type === 'photo'
    ? { ...credits, photoSetCredits: credits.photoSetCredits + amount }
    : { ...credits, kitCredits: credits.kitCredits + amount };
}

function spendAvailableCredit(credits: CreditsState, type: 'photo' | 'kit', amount: number): CreditsState {
  return type === 'photo'
    ? { ...credits, photoSetCredits: Math.max(0, credits.photoSetCredits - amount) }
    : { ...credits, kitCredits: Math.max(0, credits.kitCredits - amount) };
}

function reserveCredit(credits: CreditsState, type: 'photo' | 'kit'): CreditsState {
  return type === 'photo'
    ? {
        ...credits,
        photoSetCredits: Math.max(0, credits.photoSetCredits - 1),
        reservedPhotoSetCredits: credits.reservedPhotoSetCredits + 1,
      }
    : {
        ...credits,
        kitCredits: Math.max(0, credits.kitCredits - 1),
        reservedKitCredits: credits.reservedKitCredits + 1,
      };
}

function releaseReserve(credits: CreditsState, type: 'photo' | 'kit', returnToBalance: boolean): CreditsState {
  if (type === 'photo') {
    const released = credits.reservedPhotoSetCredits > 0 ? 1 : 0;
    return {
      ...credits,
      photoSetCredits: returnToBalance ? credits.photoSetCredits + released : credits.photoSetCredits,
      reservedPhotoSetCredits: Math.max(0, credits.reservedPhotoSetCredits - released),
    };
  }
  const released = credits.reservedKitCredits > 0 ? 1 : 0;
  return {
    ...credits,
    kitCredits: returnToBalance ? credits.kitCredits + released : credits.kitCredits,
    reservedKitCredits: Math.max(0, credits.reservedKitCredits - released),
  };
}

function migrateCredits(input: unknown): CreditsState {
  const parsed = input as Partial<CreditsState> & { balance?: number; reserved?: number } | undefined;
  if (!parsed) return defaultCredits();

  const modern: CreditsState = {
    photoSetCredits: Number(parsed.photoSetCredits ?? 0),
    kitCredits: Number(parsed.kitCredits ?? 0),
    reservedPhotoSetCredits: Number(parsed.reservedPhotoSetCredits ?? 0),
    reservedKitCredits: Number(parsed.reservedKitCredits ?? 0),
  };

  if (
    parsed.photoSetCredits !== undefined ||
    parsed.kitCredits !== undefined ||
    parsed.reservedPhotoSetCredits !== undefined ||
    parsed.reservedKitCredits !== undefined
  ) {
    return modern;
  }

  const legacyBalance = Math.max(0, Number(parsed.balance ?? 0));
  const legacyReserved = Math.max(0, Number(parsed.reserved ?? 0));
  const photoFromBalanceFraction = legacyBalance % 1 >= 0.5 ? 1 : 0;
  const photoFromReservedFraction = legacyReserved % 1 >= 0.5 ? 1 : 0;

  return {
    photoSetCredits: photoFromBalanceFraction,
    kitCredits: Math.floor(legacyBalance),
    reservedPhotoSetCredits: photoFromReservedFraction,
    reservedKitCredits: Math.floor(legacyReserved),
  };
}

function createInitialWorkspace(): ModaWorkspace {
  return {
    session: {
      isAuthenticated: false,
      email: DEFAULT_EMAIL,
      interfaceLanguage: 'ru',
    },
    credits: defaultCredits(),
    models: INITIAL_MODELS,
    wardrobeItems: INITIAL_WARDROBE_ITEMS,
    wardrobeKits: INITIAL_WARDROBE_KITS,
    looks: INITIAL_LOOKS,
    results: [defaultResult()],
    ledger: normalizeLedger(INITIAL_LEDGER),
    activeProductionFlow: null,
    updatedAt: Date.now(),
  };
}

function normalizeLedger(items: LedgerItem[]): LedgerItem[] {
  const seen = new Set<string>();
  return items.map((item, index) => {
    const id = item.id && !seen.has(item.id) ? item.id : uniqueId(`led_col_${index}`);
    seen.add(id);
    return { ...item, id };
  });
}

function readWorkspace(): ModaWorkspace {
  const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
  const initial = createInitialWorkspace();
  if (!raw) return initial;
  try {
    const parsed = JSON.parse(raw) as ModaWorkspace;
    return {
      ...initial,
      ...parsed,
      session: { ...initial.session, ...parsed.session },
      credits: migrateCredits((parsed as ModaWorkspace).credits),
      ledger: normalizeLedger(parsed.ledger || []),
    };
  } catch {
    return initial;
  }
}

function writeWorkspace(workspace: ModaWorkspace): ModaWorkspace {
  const next = { ...workspace, updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  return next;
}

function mutate(mutator: (workspace: ModaWorkspace) => ModaWorkspace): ModaWorkspace {
  const current = readWorkspace();
  return writeWorkspace(mutator(current));
}

function ledgerEntry({ event, type, count, note }: AddLedgerEntryRequest): LedgerItem {
  return {
    id: uniqueId('led'),
    date: nowDateTime(),
    event: event as LedgerEvent,
    creditType: type,
    count,
    status: 'Выполнено',
    note,
  };
}

function addLedger(workspace: ModaWorkspace, request: AddLedgerEntryRequest): ModaWorkspace {
  return {
    ...workspace,
    ledger: [ledgerEntry(request), ...workspace.ledger],
  };
}

function readyExtra(type: 'photo' | 'kit'): Partial<ResultItem> {
  return {
    images: READY_IMAGES,
    ...(type === 'kit' ? { videoUrl: '15-секундное вертикальное AI-видео (1080p)' } : {}),
    cancelAllowed: false,
  };
}

function withStatusTransition(
  workspace: ModaWorkspace,
  id: string,
  status: ResultState,
  extraData: Partial<ResultItem> = {},
): ModaWorkspace {
  let nextWorkspace = workspace;
  const results = workspace.results.map((result) => {
    if (result.id !== id) return result;
    const oldStatus = result.status;
    const finalExtra = status === 'ready' ? { ...readyExtra(result.type), ...extraData } : extraData;
    if (status === 'ready' && oldStatus !== 'ready') {
      nextWorkspace = addLedger(
        {
          ...nextWorkspace,
          credits: releaseReserve(nextWorkspace.credits, result.type, false),
        },
        {
          event: 'spend_confirmed',
          type: result.type,
          count: 1,
          note: `Подтверждение списания 1 ${creditLabel(result.type)} для пака "${result.name}"`,
        },
      );
    }
    return { ...result, status, ...finalExtra };
  });
  return { ...nextWorkspace, results };
}

export function createDemoApi(): ModaApi {
  return {
    async getWorkspace() {
      return readWorkspace();
    },

    async saveWorkspace(workspace) {
      return writeWorkspace({ ...workspace, credits: migrateCredits(workspace.credits) });
    },

    async resetWorkspace() {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return writeWorkspace(createInitialWorkspace());
    },

    async loginDemo({ email, interfaceLanguage }: DemoLoginRequest) {
      return mutate((workspace) => ({
        ...workspace,
        session: { isAuthenticated: true, email, interfaceLanguage },
      }));
    },

    async logoutDemo() {
      return mutate((workspace) => ({
        ...workspace,
        session: { ...workspace.session, isAuthenticated: false },
      }));
    },

    async startProductionFlow({ type, preset }: StartProductionFlowRequest) {
      return mutate((workspace) => {
        if (availableCredits(workspace.credits, type) < 1) return workspace;
        const activeProductionFlow: ActiveProductionFlow = {
          id: uniqueId(preset ? 'flow_fast' : 'flow'),
          type,
          currentStep: preset?.startStep ?? 0,
          selectedModel: preset?.model,
          selectedKit: preset?.kit,
          lookName: preset?.lookName || `Черновик Образа ${new Date().toLocaleDateString()}`,
          lookId: preset?.lookId,
          selectedLocation: preset?.selectedLocation,
          selectedPosePack: preset?.selectedPosePack,
          selectedVideoTemplate: preset?.selectedVideoTemplate,
          locationSettings: {
            temperature: 'Теплый',
            hardness: 'Мягкий',
            intensity: 'Приглушенный',
          },
        };
        return { ...workspace, activeProductionFlow };
      });
    },

    async updateProductionFlow(data) {
      return mutate((workspace) => ({
        ...workspace,
        activeProductionFlow: workspace.activeProductionFlow
          ? { ...workspace.activeProductionFlow, ...data }
          : null,
      }));
    },

    async clearProductionFlow() {
      return mutate((workspace) => ({ ...workspace, activeProductionFlow: null }));
    },

    async saveModel(model) {
      return mutate((workspace) => ({ ...workspace, models: [model, ...workspace.models] }));
    },

    async saveLook(look) {
      return mutate((workspace) => {
        if (workspace.looks.some((item) => item.name.toLowerCase() === look.name.toLowerCase())) {
          return workspace;
        }
        return { ...workspace, looks: [look, ...workspace.looks] };
      });
    },

    async deleteLook(lookId) {
      return mutate((workspace) => ({ ...workspace, looks: workspace.looks.filter((look) => look.id !== lookId) }));
    },

    async updateLookName(lookId, name) {
      return mutate((workspace) => ({
        ...workspace,
        looks: workspace.looks.map((look) => (look.id === lookId ? { ...look, name } : look)),
      }));
    },

    async saveWardrobeKit(kit) {
      return mutate((workspace) => ({ ...workspace, wardrobeKits: [kit, ...workspace.wardrobeKits] }));
    },

    async deleteWardrobeItem(itemId) {
      return mutate((workspace) => ({
        ...workspace,
        wardrobeItems: workspace.wardrobeItems.filter((item) => item.id !== itemId),
      }));
    },

    async deleteWardrobeKit(kitId) {
      return mutate((workspace) => ({
        ...workspace,
        wardrobeKits: workspace.wardrobeKits.filter((kit) => kit.id !== kitId),
      }));
    },

    async toggleWardrobeItemVisibility(itemId) {
      return mutate((workspace) => ({
        ...workspace,
        wardrobeItems: workspace.wardrobeItems.map((item) =>
          item.id === itemId
            ? { ...item, usageStatus: item.usageStatus === 'hidden' ? 'active' : 'hidden' }
            : item,
        ),
      }));
    },

    async toggleWardrobeKitVisibility(kitId) {
      return mutate((workspace) => ({
        ...workspace,
        wardrobeKits: workspace.wardrobeKits.map((kit) =>
          kit.id === kitId
            ? { ...kit, usageStatus: kit.usageStatus === 'hidden' ? 'active' : 'hidden' }
            : kit,
        ),
      }));
    },

    async launchProduction({ reserveType, flow }: LaunchProductionRequest) {
      return mutate((workspace) => {
        if (!flow.selectedModel || !flow.selectedKit) return workspace;
        if (availableCredits(workspace.credits, reserveType) < 1) return workspace;
        const result: ResultItem = {
          id: uniqueId('res_order'),
          name: `Съемка: ${flow.lookName}`,
          type: reserveType,
          status: 'queued',
          date: nowDateTime(),
          location: flow.selectedLocation || 'Минималистичный люкс',
          posePack: flow.selectedPosePack || 'Классика',
          videoTemplate: flow.selectedVideoTemplate,
          lookId: flow.lookId || 'look_any',
          lookName: flow.lookName,
          modelName: flow.selectedModel.name,
          images: [],
          cancelAllowed: true,
          stepIndex: 0,
        };
        const debited = addLedger(
          {
            ...workspace,
            credits: reserveCredit(workspace.credits, reserveType),
            results: [result, ...workspace.results],
            activeProductionFlow: null,
          },
          {
            event: 'reserve',
            type: reserveType,
            count: 1,
            note: `Блокировка 1 ${creditLabel(reserveType)} под запуск "${flow.lookName}"`,
          },
        );
        return debited;
      });
    },

    async advanceResultStatus({ id, status, extraData }: AdvanceResultStatusRequest) {
      return mutate((workspace) => withStatusTransition(workspace, id, status, extraData));
    },

    async refundResult(result) {
      return mutate((workspace) => {
        const refunded = addLedger(
          {
            ...workspace,
            credits: releaseReserve(workspace.credits, result.type, true),
          },
          {
            event: 'reserve_release',
            type: result.type,
            count: 1,
            note: `Резерв снят: Возврат 1 ${creditLabel(result.type)} за тикет "${result.name}"`,
          },
        );
        return withStatusTransition(refunded, result.id, 'failed');
      });
    },

    async manualFixResult(result) {
      return mutate((workspace) => withStatusTransition(workspace, result.id, 'ready', readyExtra(result.type)));
    },

    async addLedgerEntry(request) {
      return mutate((workspace) => addLedger(workspace, request));
    },

    async addCredits(type, count) {
      return mutate((workspace) => ({
        ...workspace,
        credits: addAvailableCredit(workspace.credits, type, count),
      }));
    },

    async adminAdjustCredits({ action, type = 'photo', amount = 1, customEvent }: AdminCreditAdjustmentRequest) {
      return mutate((workspace) => {
        if (action === 'add') {
          const event = customEvent || 'grant';
          const note =
            event === 'marketing_grant'
              ? `Маркетинговое начисление ${amount} ${creditLabel(type)}`
              : event === 'support_compensation'
                ? `Компенсация техподдержки: ${amount} ${creditLabel(type)}`
                : `Ручное начисление ${amount} ${creditLabel(type)} администратором`;
          return addLedger(
            { ...workspace, credits: addAvailableCredit(workspace.credits, type, amount) },
            { event, type, count: amount, note },
          );
        }
        if (action === 'spend') {
          return addLedger(
            { ...workspace, credits: spendAvailableCredit(workspace.credits, type, amount) },
            {
              event: 'support_hold',
              type,
              count: Math.min(amount, availableCredits(workspace.credits, type)),
              note: `Ручное удержание ${amount} ${creditLabel(type)} администратором`,
            },
          );
        }
        if (action === 'return_reserve' && reservedCredits(workspace.credits, type) > 0) {
          return addLedger(
            {
              ...workspace,
              credits: releaseReserve(workspace.credits, type, true),
            },
            {
              event: 'reserve_release',
              type,
              count: 1,
              note: `Возврат 1 ${creditLabel(type)} из резерва`,
            },
          );
        }
        return workspace;
      });
    },
  };
}
