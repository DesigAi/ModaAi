import { WardrobeItem, WardrobeKit, Model, Look, ResultItem, LedgerItem } from './types';

export const LOCATION_CATEGORIES = [
  {
    id: 'spain_street',
    name: 'Улица Испании',
    locations: ['Коста-дель-Соль', 'Валенсия', 'Страна Басков'],
    descriptions: [
      'Солнечная набережная, песчаный оттенок стен и брусчатки.',
      'Узкие исторические улочки с коваными балконами и зеленью.',
      'Атлантическое побережье, фактурные серые скалы и старый город.'
    ]
  },
  {
    id: 'studio',
    name: 'Минималистичная студия',
    locations: ['Классическая циклорама', 'Солнечные лучи', 'Фактурный бетон'],
    descriptions: [
      'Чистый бесшовный белый фон для максимального фокуса на одежде.',
      'Мягкие тени от оконной рамы на теплой бежевой стене.',
      'Грубая серая текстура, подчеркивающая минимализм образа.'
    ]
  },
  {
    id: 'hotel_interiors',
    name: 'Отель и интерьеры',
    locations: ['Вилла с бассейном', 'Дизайнерский лобби', 'Минималистичный люкс'],
    descriptions: [
      'Открытая терраса с бирюзовой гладью воды и шезлонгами.',
      'Высокие потолки, мрамор, дизайнерская мебель и теплое освещение.',
      'Современный интерьер в скандинавском стиле с окнами в пол.'
    ]
  },
  {
    id: 'wild_nature',
    name: 'Дикая природа',
    locations: ['Хвойный лес', 'Песчаные дюны', 'Горное озеро'],
    descriptions: [
      'Глубокий зеленый фон, стволы сосен и рассеянный лесной свет.',
      'Волнистый золотистый песок с минималистичными тенями ветвей.',
      'Зеркальная гладь воды, дымка и темные очертания горных хребтов.'
    ]
  },
  {
    id: 'neon_city',
    name: 'Неоновый город',
    locations: ['Азиатский переулок', 'Подземный паркинг', 'Крыша небоскреба'],
    descriptions: [
      'Влажный асфальт, вывески с иероглифами и динамические тени.',
      'Индустриальные бетонные колонны и жесткий направленный свет.',
      'Огни ночного города в боке на уровне облаков.'
    ]
  }
];

export const POSE_PACKS = [
  {
    id: 'classic',
    name: 'Классика',
    description: 'спокойный lookbook',
    frames: ['Прямо', 'Три четверти', 'Поворот спиной', 'Деталь кармана', 'В полный рост', 'Крупный план лица', 'Шаг вперед']
  },
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'выразительные high-fashion позы',
    frames: ['Динамичный излом', 'Рука у лица', 'Асимметрия плеч', 'Нижний ракурс', 'Полет ткани', 'Полуприсед', 'Геометричный силуэт']
  },
  {
    id: 'streetwear',
    name: 'Streetwear',
    description: 'позы в движении',
    frames: ['Бег / прыжок', 'Оглядываясь назад', 'Капюшон надет', 'Руки в карманах', 'Прислонившись к стене', 'Полуоборот на ходу', 'Кроссовки в фокусе']
  },
  {
    id: 'edgy',
    name: 'Edgy',
    description: 'дерзкий editorial',
    frames: ['Драматичный наклон', 'Взгляд сквозь пальцы', 'Жесткий контрапост', 'Лежа на кубах', 'Игра теней', 'Нестандартный ракурс', 'Размытый силуэт']
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    description: 'расслабленные естественные кадры',
    frames: ['Искренняя улыбка', 'С стаканчиком кофе', 'Поправление прически', 'Вдох / выдох', 'Сидя на ступенях', 'Легкий шаг', 'Повседневное движение']
  }
];

export const VIDEO_TEMPLATES = [
  {
    id: 'vid_streetwear',
    name: 'Streetwear',
    description: 'streetwear / AI-продакшен',
    specs: '15 сек • vertical 9:16 • 1080p • динамичный бит'
  },
  {
    id: 'vid_lookbook',
    name: 'Lookbook',
    description: 'мультимодельный lookbook',
    specs: '15 сек • vertical 9:16 • 1080p • плавная анимация'
  },
  {
    id: 'vid_backstage',
    name: 'Backstage',
    description: 'закулисный формат / BTS',
    specs: '15 сек • vertical 9:16 • 1080p • пленочные фильтры'
  },
  {
    id: 'vid_studio',
    name: 'Studio',
    description: 'белая циклорама / студия',
    specs: '15 сек • vertical 9:16 • 1080p • чистые склейки'
  }
];

export const INITIAL_MODELS: Model[] = [
  {
    id: 'model_1',
    name: 'Мария Е.',
    gender: 'Женский',
    age: '23-28',
    ethnotype: 'Европейский',
    bodyType: 'Стройная',
    skinTone: '#E4C3AD',
    notes: 'Отлично подходит для минимализма и испанского стиля',
    previewUrl: 'Сохраненная модель • Женский • 23-28 • Европейский',
    timestamp: Date.now() - 36000000
  },
  {
    id: 'model_2',
    name: 'Марк О.',
    gender: 'Мужской',
    age: '23-28',
    ethnotype: 'Смешанный',
    bodyType: 'Атлетичная',
    skinTone: '#9E745A',
    notes: 'Идеален для casual и спортивной одежды',
    previewUrl: 'Сохраненная модель • Мужской • 23-28 • Смешанный',
    timestamp: Date.now() - 18000000
  }
];

export const INITIAL_WARDROBE_ITEMS: WardrobeItem[] = [
  {
    id: 'item_1',
    name: 'Шелковое платье миди черное',
    category: 'dress',
    classification: 'product item',
    imageSrc: 'Черное шелковое платье миди',
    sideType: 'front',
    usageStatus: 'active',
    createdAt: new Date(Date.now() - 72000000).toISOString().split('T')[0]
  },
  {
    id: 'item_2',
    name: 'Спина шелкового платья миди',
    category: 'dress',
    classification: 'product item',
    imageSrc: 'Черное шелковое платье миди (спина)',
    sideType: 'back',
    usageStatus: 'active',
    createdAt: new Date(Date.now() - 72000000).toISOString().split('T')[0]
  },
  {
    id: 'item_3',
    name: 'Дизайнерские кожаные очки',
    category: 'glasses',
    classification: 'accessory item',
    imageSrc: 'Очки в кожаной оправе',
    sideType: 'accessory',
    usageStatus: 'active',
    createdAt: new Date(Date.now() - 36000000).toISOString().split('T')[0]
  }
];

export const INITIAL_WARDROBE_KITS: WardrobeKit[] = [
  {
    id: 'kit_1',
    name: 'Вечерний шелковый образ',
    items: [
      INITIAL_WARDROBE_ITEMS[0],
      INITIAL_WARDROBE_ITEMS[1],
      INITIAL_WARDROBE_ITEMS[2]
    ],
    usageStatus: 'active',
    createdAt: new Date(Date.now() - 36000000).toISOString().split('T')[0]
  }
];

export const INITIAL_LOOKS: Look[] = [
  {
    id: 'look_1',
    name: 'Мария в Черном Шелке',
    modelId: 'model_1',
    modelName: 'Мария Е.',
    kitId: 'kit_1',
    kitName: 'Вечерний шелковый образ',
    previewUrl: 'Мария Е. • Вечерний шелковый образ',
    createdAt: new Date(Date.now() - 30000000).toISOString().split('T')[0]
  }
];

export const INITIAL_LEDGER: LedgerItem[] = [
  {
    id: 'ledger_1',
    date: '17.06.2026 12:00',
    event: 'marketing_grant',
    creditType: 'photo',
    count: 1,
    status: 'Выполнено',
    note: 'Стартовый бонус за регистрацию'
  }
];
