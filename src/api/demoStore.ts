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
  DemoLoginRequest,
  LaunchProductionRequest,
  ModaApi,
  ModaWorkspace,
  StartProductionFlowRequest,
} from './contracts';

const STORAGE_KEY = 'modai_demo_workspace_v1';
const DEFAULT_EMAIL = 'brand.director@modai.team';
const CREDIT_COST = {
  photo: 0.5,
  kit: 1,
} as const;

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

function createInitialWorkspace(): ModaWorkspace {
  return {
    session: {
      isAuthenticated: false,
      email: DEFAULT_EMAIL,
      interfaceLanguage: 'ru',
    },
    credits: {
      balance: 1,
      reserved: 0,
    },
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
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createInitialWorkspace();
  try {
    const parsed = JSON.parse(raw) as ModaWorkspace;
    return {
      ...createInitialWorkspace(),
      ...parsed,
      session: { ...createInitialWorkspace().session, ...parsed.session },
      credits: { ...createInitialWorkspace().credits, ...parsed.credits },
      ledger: normalizeLedger(parsed.ledger || []),
    };
  } catch {
    return createInitialWorkspace();
  }
}

function writeWorkspace(workspace: ModaWorkspace): ModaWorkspace {
  const next = { ...workspace, updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
      const cost = CREDIT_COST[result.type];
      nextWorkspace = addLedger(
        {
          ...nextWorkspace,
          credits: {
            ...nextWorkspace.credits,
            reserved: Math.max(0, nextWorkspace.credits.reserved - cost),
          },
        },
        {
          event: 'spend_confirmed',
          type: result.type,
          count: cost,
          note: `Подтверждение списания ${String(cost).replace('.', ',')} кр. для пака "${result.name}"`,
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
      return writeWorkspace(workspace);
    },

    async resetWorkspace() {
      localStorage.removeItem(STORAGE_KEY);
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
      const cost = CREDIT_COST[type];
      return mutate((workspace) => {
        if (workspace.credits.balance < cost) return workspace;
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
        const cost = CREDIT_COST[reserveType];
        if (workspace.credits.balance < cost) return workspace;
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
            credits: {
              balance: workspace.credits.balance - cost,
              reserved: workspace.credits.reserved + cost,
            },
            results: [result, ...workspace.results],
            activeProductionFlow: null,
          },
          {
            event: 'reserve',
            type: reserveType,
            count: cost,
            note: `Блокировка ${String(cost).replace('.', ',')} кр. под запуск "${flow.lookName}"`,
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
        const cost = CREDIT_COST[result.type];
        const refunded = addLedger(
          {
            ...workspace,
            credits: {
              balance: workspace.credits.balance + cost,
              reserved: Math.max(0, workspace.credits.reserved - cost),
            },
          },
          {
            event: 'reserve_release',
            type: result.type,
            count: cost,
            note: `Резерв снят: Возврат ${String(cost).replace('.', ',')} кр. за тикет "${result.name}"`,
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
        credits: { ...workspace.credits, balance: workspace.credits.balance + count },
      }));
    },

    async adminAdjustCredits({ action, amount, customEvent }: AdminCreditAdjustmentRequest) {
      return mutate((workspace) => {
        if (action === 'add' && amount) {
          const event = customEvent || 'grant';
          const note =
            event === 'marketing_grant'
              ? 'Маркетинговые промо-кредиты (начисление)'
              : event === 'support_compensation'
                ? 'Компенсация техподдержки за технический перезапуск'
                : `Ручное начисление ${String(amount).replace('.', ',')} кр. администратором`;
          return addLedger(
            { ...workspace, credits: { ...workspace.credits, balance: workspace.credits.balance + amount } },
            { event, type: 'photo', count: amount, note },
          );
        }
        if (action === 'spend' && amount) {
          return addLedger(
            { ...workspace, credits: { ...workspace.credits, balance: Math.max(0, workspace.credits.balance - amount) } },
            {
              event: 'support_hold',
              type: 'photo',
              count: amount,
              note:
                amount === workspace.credits.balance
                  ? 'Полное списание баланса администратором'
                  : `Ручное списание ${String(amount).replace('.', ',')} кр. администратором`,
            },
          );
        }
        if (action === 'return_reserve' && workspace.credits.reserved > 0) {
          const returned = workspace.credits.reserved;
          return addLedger(
            {
              ...workspace,
              credits: {
                balance: workspace.credits.balance + returned,
                reserved: 0,
              },
            },
            {
              event: 'reserve_release',
              type: 'photo',
              count: returned,
              note: `Возврат оставшегося резерва в объеме ${String(returned).replace('.', ',')} кр.`,
            },
          );
        }
        return workspace;
      });
    },
  };
}
