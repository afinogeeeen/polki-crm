import type { 
  Order, 
  TrackingItem, 
  MarketplaceReview, 
  MarketplaceQuestion, 
  MarketplaceChat,
  DashboardStats,
  UserProfile,
  StoneSlab,
  Customer,
  CustomerMergeSuggestion,
  LoyaltyTier,
  TemplateItem,
  Master,
  StandardPieceworkRate,
  ProductionLogItem,
  FboItemRecommendation,
  FboSupply,
  FboMarketplace,
  FboSupplyStatus
} from '../types';

const STORAGE_KEYS = {
  ORDERS: 'polki_crm_orders_v9',
  CUSTOMERS: 'polki_crm_customers_v4',
  MERGE_SUGGESTIONS: 'polki_crm_merge_suggestions_v4',
  TRACKING: 'polki_crm_tracking_v9',
  REVIEWS: 'polki_crm_reviews_v8',
  QUESTIONS: 'polki_crm_questions_v8',
  CHATS: 'polki_crm_chats_v9',
  CURRENT_USER: 'polki_crm_current_user_v5',
  USERS: 'polki_crm_users_v5',
  SLABS: 'polki_crm_slabs_v1',
  CHAT_TEMPLATES: 'polki_crm_templates_chat_v2',
  REVIEW_TEMPLATES: 'polki_crm_templates_review_v2',
  QUESTION_TEMPLATES: 'polki_crm_templates_question_v2',
  MASTERS: 'polki_crm_masters_v1',
  STANDARD_RATES: 'polki_crm_standard_rates_v1',
  PRODUCTION_LOG: 'polki_crm_production_log_v1',
  FBO_SUPPLIES: 'polki_crm_fbo_supplies_v1',
  FBO_RECOMMENDATIONS: 'polki_crm_fbo_recommendations_v1',
};

export const DEFAULT_CHAT_TEMPLATES: string[] = [];
export const DEFAULT_REVIEW_TEMPLATES: string[] = [];
export const DEFAULT_QUESTION_TEMPLATES: string[] = [];

export const INITIAL_USERS: UserProfile[] = [
  { id: 'u-admin', name: 'Руководитель', role: 'admin', roleTitle: 'Руководитель' },
  { id: 'u-lera', name: 'Лера', role: 'admin', roleTitle: 'Администратор' },
  { id: 'u-anya', name: 'Аня', role: 'admin', roleTitle: 'Администратор' },
  { id: 'u-alina', name: 'Алина', role: 'admin', roleTitle: 'Администратор' },
];

export function normalizePhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return '7' + digits.slice(1);
  }
  return digits;
}

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
  } catch (e) {
    console.error(e);
  }
  return fallback;
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notify();
  } catch (e) {
    console.error(e);
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeDataStore(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function notify() {
  listeners.forEach(cb => {
    try { cb(); } catch (e) { console.error(e); }
  });
}

// 1. Initial Customers
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    "id": "cust-1",
    "name": "Екатерина Воронина",
    "phone": "+7 (916) 450-12-89",
    "normalized_phone": "79164501289",
    "email": "voronina.ek@gmail.com",
    "city": "Москва",
    "address": "г. Москва, ул. Мосфильмовская 70к2, кв. 115",
    "orders_count": 3,
    "total_spent": 42800,
    "first_order_date": "14.04.2026",
    "last_order_date": "08.09.2026",
    "loyalty_tier": "repeat",
    "channels": [
      "marketplace",
      "telegram"
    ],
    "channel_identities": [
      {
        "channel": "marketplace",
        "identifier": "ozon-user-49210",
        "marketplace": "ozon"
      }
    ],
    "notes": "Заказывает полки в ванную и хаммам. Любит белый итальянский мрамор Calacatta Gold.",
    "tags": [
      "Постоянный",
      "Ванные комнаты"
    ],
    "linked_order_ids": [
      "ord-101",
      "ord-125",
      "ord-180"
    ],
    "linked_chat_ids": [
      "chat-ozon-1"
    ]
  },
  {
    "id": "cust-2",
    "name": "Диана Соколова",
    "phone": "+7 (926) 883-91-20",
    "normalized_phone": "79268839120",
    "email": "diana.design@artstone-studio.ru",
    "city": "Москва",
    "address": "г. Москва, Кутузовский пр-т 36с4, офис 208",
    "orders_count": 6,
    "total_spent": 198400,
    "first_order_date": "10.03.2026",
    "last_order_date": "06.09.2026",
    "loyalty_tier": "designer",
    "channels": [
      "call",
      "telegram",
      "bitrix"
    ],
    "notes": "Ведущий дизайнер интерьеров студии ArtStone. Регулярные оптовые заказы на объекты премиум-класса.",
    "tags": [
      "VIP",
      "Дизайнер",
      "Оптовик"
    ],
    "linked_order_ids": [
      "ord-102",
      "ord-114",
      "ord-132",
      "ord-149",
      "ord-168",
      "ord-182"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-3",
    "name": "Артем Демидов",
    "phone": "+7 (981) 712-33-40",
    "normalized_phone": "79817123340",
    "email": "a.demidov@yandex.ru",
    "city": "Санкт-Петербург",
    "address": "г. Санкт-Петербург, Приморский пр-т 137к1, кв. 42",
    "orders_count": 2,
    "total_spent": 31800,
    "first_order_date": "22.05.2026",
    "last_order_date": "10.09.2026",
    "loyalty_tier": "repeat",
    "channels": [
      "marketplace",
      "call"
    ],
    "channel_identities": [
      {
        "channel": "marketplace",
        "identifier": "wb-buyer-8831",
        "marketplace": "wildberries"
      }
    ],
    "notes": "Любит черный гранит Габбро и матовую обработку.",
    "tags": [
      "Постоянный"
    ],
    "linked_order_ids": [
      "ord-130",
      "ord-185"
    ],
    "linked_chat_ids": [
      "chat-wb-1"
    ]
  },
  {
    "id": "cust-4",
    "name": "Михаил Белов",
    "phone": "+7 (987) 229-84-11",
    "normalized_phone": "79872298411",
    "city": "Казань",
    "address": "г. Казань, ул. Чистопольская 86, кв. 73",
    "orders_count": 2,
    "total_spent": 46500,
    "first_order_date": "02.06.2026",
    "last_order_date": "04.09.2026",
    "loyalty_tier": "repeat",
    "channels": [
      "marketplace"
    ],
    "channel_identities": [
      {
        "channel": "marketplace",
        "identifier": "ym-user-119",
        "marketplace": "yandex"
      }
    ],
    "notes": "Заказывал угловую полку из оникса с подсветкой и консоль.",
    "tags": [
      "Оникс"
    ],
    "linked_order_ids": [
      "ord-138",
      "ord-176"
    ],
    "linked_chat_ids": [
      "chat-ym-1"
    ]
  },
  {
    "id": "cust-5",
    "name": "Сергей Кузнецов",
    "phone": "+7 (913) 915-00-66",
    "normalized_phone": "79139150066",
    "city": "Новосибирск",
    "address": "г. Новосибирск, Красный пр-т 179, кв. 51",
    "orders_count": 3,
    "total_spent": 67200,
    "first_order_date": "18.03.2026",
    "last_order_date": "28.08.2026",
    "loyalty_tier": "vip",
    "channels": [
      "telegram",
      "call"
    ],
    "notes": "Заказывает полки под акустику и в каминную зону из травертина и гранита.",
    "tags": [
      "VIP",
      "Травертин"
    ],
    "linked_order_ids": [
      "ord-106",
      "ord-142",
      "ord-171"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-6",
    "name": "Ольга Романова",
    "phone": "+7 (922) 104-55-90",
    "normalized_phone": "79221045590",
    "city": "Екатеринбург",
    "address": "г. Екатеринбург, ул. Радищева 33, кв. 104",
    "orders_count": 2,
    "total_spent": 27900,
    "first_order_date": "11.05.2026",
    "last_order_date": "19.08.2026",
    "loyalty_tier": "repeat",
    "channels": [
      "marketplace"
    ],
    "channel_identities": [
      {
        "channel": "marketplace",
        "identifier": "ozon-romanova",
        "marketplace": "ozon"
      }
    ],
    "notes": "Комплект полок из зеленого мрамора Bidasar Green.",
    "tags": [
      "Постоянный"
    ],
    "linked_order_ids": [
      "ord-122",
      "ord-165"
    ],
    "linked_chat_ids": [
      "chat-ozon-2"
    ]
  },
  {
    "id": "cust-7",
    "name": "Игорь Васильев",
    "phone": "+7 (918) 441-28-90",
    "normalized_phone": "79184412890",
    "city": "Краснодар",
    "address": "г. Краснодар, ул. Кубанская Набережная 39, кв. 88",
    "orders_count": 2,
    "total_spent": 39000,
    "first_order_date": "25.04.2026",
    "last_order_date": "02.09.2026",
    "loyalty_tier": "repeat",
    "channels": [
      "marketplace",
      "telegram"
    ],
    "notes": "Полки в нишу ванной комнаты, сложный распил под 45 градусов.",
    "tags": [
      "Постоянный"
    ],
    "linked_order_ids": [
      "ord-117",
      "ord-174"
    ],
    "linked_chat_ids": [
      "chat-wb-2"
    ]
  },
  {
    "id": "cust-alexey-ozon",
    "name": "Алексей Смирнов",
    "phone": "",
    "city": "Москва",
    "address": "г. Москва, Ломоносовский пр-т 29к1, кв. 84",
    "orders_count": 1,
    "total_spent": 18500,
    "first_order_date": "15.06.2026",
    "last_order_date": "15.06.2026",
    "loyalty_tier": "new",
    "channels": [
      "marketplace"
    ],
    "channel_identities": [
      {
        "channel": "marketplace",
        "identifier": "ozon-alex-sm",
        "marketplace": "ozon"
      }
    ],
    "notes": "Заказ на Ozon полки из черного мрамора Nero Marquina.",
    "tags": [
      "Ozon"
    ],
    "linked_order_ids": [
      "ord-145"
    ],
    "linked_chat_ids": [
      "chat-ozon-3"
    ]
  },
  {
    "id": "cust-alexey-site",
    "name": "Алексей С.",
    "phone": "+7 (903) 771-44-12",
    "normalized_phone": "79037714412",
    "city": "Москва",
    "address": "г. Москва, Ломоносовский пр-т 29к1, кв. 84",
    "orders_count": 1,
    "total_spent": 24500,
    "first_order_date": "29.08.2026",
    "last_order_date": "29.08.2026",
    "loyalty_tier": "new",
    "channels": [
      "bitrix"
    ],
    "notes": "Заявка с сайта polkistone.ru. Тот же адрес доставки, что у Алексея Смирнова с Ozon!",
    "tags": [
      "Сайт",
      "Кандидат на объединение"
    ],
    "linked_order_ids": [
      "ord-173"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-dmitry-ym",
    "name": "Дмитрий Морозов",
    "phone": "",
    "city": "Москва",
    "address": "г. Москва, ул. Удальцова 46, кв. 19",
    "orders_count": 1,
    "total_spent": 16200,
    "first_order_date": "04.07.2026",
    "last_order_date": "04.07.2026",
    "loyalty_tier": "new",
    "channels": [
      "marketplace"
    ],
    "channel_identities": [
      {
        "channel": "marketplace",
        "identifier": "ym-morozov",
        "marketplace": "yandex"
      }
    ],
    "notes": "Заказ на Яндекс.Маркете. Полка из белого кварца.",
    "tags": [
      "Яндекс"
    ],
    "linked_order_ids": [
      "ord-152"
    ],
    "linked_chat_ids": [
      "chat-ym-2"
    ]
  },
  {
    "id": "cust-dmitry-call",
    "name": "Дмитрий М.",
    "phone": "+7 (925) 301-99-04",
    "normalized_phone": "79253019904",
    "city": "Москва",
    "address": "г. Москва, ул. Удальцова 46, кв. 19",
    "orders_count": 1,
    "total_spent": 19800,
    "first_order_date": "07.09.2026",
    "last_order_date": "07.09.2026",
    "loyalty_tier": "new",
    "channels": [
      "call"
    ],
    "notes": "Звонок по дозаказу еще одной полки в тот же адрес.",
    "tags": [
      "Звонок",
      "Кандидат на объединение"
    ],
    "linked_order_ids": [
      "ord-179"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-10",
    "name": "Студия «StoneDesign» (Ксения)",
    "phone": "+7 (903) 111-99-00",
    "normalized_phone": "79031119900",
    "city": "Москва",
    "address": "г. Москва, Саввинская наб. 12с1",
    "orders_count": 5,
    "total_spent": 174000,
    "first_order_date": "20.03.2026",
    "last_order_date": "09.09.2026",
    "loyalty_tier": "designer",
    "channels": [
      "bitrix",
      "call",
      "telegram"
    ],
    "tags": [
      "VIP",
      "Дизайнер"
    ],
    "linked_order_ids": [
      "ord-108",
      "ord-126",
      "ord-144",
      "ord-162",
      "ord-184"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-1",
    "name": "Павел Орлов",
    "phone": "+7 (916) 120-33-44",
    "normalized_phone": "+7 (916) 120-33-44",
    "city": "Москва",
    "address": "г. Москва, Ленинский пр-т 82, кв. 45",
    "orders_count": 1,
    "total_spent": 13500,
    "first_order_date": "01.03.2026",
    "last_order_date": "01.03.2026",
    "loyalty_tier": "new",
    "channels": [
      "marketplace"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-1"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-2",
    "name": "Наталья Захарова",
    "phone": "+7 (927) 601-99-12",
    "normalized_phone": "+7 (927) 601-99-12",
    "city": "Самара",
    "address": "г. Самара, Волжский пр-т 19, кв. 12",
    "orders_count": 1,
    "total_spent": 14450,
    "first_order_date": "04.04.2026",
    "last_order_date": "04.04.2026",
    "loyalty_tier": "new",
    "channels": [
      "telegram"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-2"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-3",
    "name": "Константин Фролов",
    "phone": "+7 (904) 390-11-22",
    "normalized_phone": "+7 (904) 390-11-22",
    "city": "Нижний Новгород",
    "address": "г. Н.Новгород, ул. Белинского 58, кв. 30",
    "orders_count": 1,
    "total_spent": 15400,
    "first_order_date": "07.05.2026",
    "last_order_date": "07.05.2026",
    "loyalty_tier": "new",
    "channels": [
      "bitrix"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-3"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-4",
    "name": "Елена Кравцова",
    "phone": "+7 (918) 200-88-77",
    "normalized_phone": "+7 (918) 200-88-77",
    "city": "Сочи",
    "address": "г. Сочи, Курортный пр-т 92, кв. 6",
    "orders_count": 1,
    "total_spent": 16350,
    "first_order_date": "10.06.2026",
    "last_order_date": "10.06.2026",
    "loyalty_tier": "new",
    "channels": [
      "call"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-4"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-5",
    "name": "Андрей Мельников",
    "phone": "+7 (926) 345-67-89",
    "normalized_phone": "+7 (926) 345-67-89",
    "city": "Москва",
    "address": "г. Москва, ул. Профсоюзная 104, кв. 77",
    "orders_count": 1,
    "total_spent": 17300,
    "first_order_date": "13.07.2026",
    "last_order_date": "13.07.2026",
    "loyalty_tier": "new",
    "channels": [
      "marketplace"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-5"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-6",
    "name": "Татьяна Гусева",
    "phone": "+7 (988) 512-34-56",
    "normalized_phone": "+7 (988) 512-34-56",
    "city": "Ростов-на-Дону",
    "address": "г. Ростов-на-Дону, ул. Пушкинская 144, кв. 18",
    "orders_count": 1,
    "total_spent": 18250,
    "first_order_date": "16.08.2026",
    "last_order_date": "16.08.2026",
    "loyalty_tier": "new",
    "channels": [
      "telegram"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-6"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-7",
    "name": "Илья Ковалев",
    "phone": "+7 (951) 850-22-33",
    "normalized_phone": "+7 (951) 850-22-33",
    "city": "Воронеж",
    "address": "г. Воронеж, Московский пр-т 120, кв. 54",
    "orders_count": 1,
    "total_spent": 19200,
    "first_order_date": "19.03.2026",
    "last_order_date": "19.03.2026",
    "loyalty_tier": "new",
    "channels": [
      "bitrix"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-7"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-8",
    "name": "Светлана Беляева",
    "phone": "+7 (922) 480-11-22",
    "normalized_phone": "+7 (922) 480-11-22",
    "city": "Тюмень",
    "address": "г. Тюмень, ул. Республики 142, кв. 89",
    "orders_count": 1,
    "total_spent": 20150,
    "first_order_date": "22.04.2026",
    "last_order_date": "22.04.2026",
    "loyalty_tier": "new",
    "channels": [
      "call"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-8"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-9",
    "name": "Роман Давыдов",
    "phone": "+7 (903) 890-12-45",
    "normalized_phone": "+7 (903) 890-12-45",
    "city": "Москва",
    "address": "г. Москва, Рублевское шоссе 28к1, кв. 102",
    "orders_count": 1,
    "total_spent": 21100,
    "first_order_date": "25.05.2026",
    "last_order_date": "25.05.2026",
    "loyalty_tier": "new",
    "channels": [
      "marketplace"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-9"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-10",
    "name": "Марина Полякова",
    "phone": "+7 (911) 450-88-99",
    "normalized_phone": "+7 (911) 450-88-99",
    "city": "Калининград",
    "address": "г. Калининград, ул. Театральная 30, кв. 15",
    "orders_count": 1,
    "total_spent": 22050,
    "first_order_date": "03.06.2026",
    "last_order_date": "03.06.2026",
    "loyalty_tier": "new",
    "channels": [
      "telegram"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-10"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-11",
    "name": "Олег Григорьев",
    "phone": "+7 (917) 750-11-33",
    "normalized_phone": "+7 (917) 750-11-33",
    "city": "Уфа",
    "address": "г. Уфа, пр-т Октября 68, кв. 41",
    "orders_count": 1,
    "total_spent": 23000,
    "first_order_date": "06.07.2026",
    "last_order_date": "06.07.2026",
    "loyalty_tier": "new",
    "channels": [
      "bitrix"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-11"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-12",
    "name": "Юлия Ситникова",
    "phone": "+7 (902) 830-44-55",
    "normalized_phone": "+7 (902) 830-44-55",
    "city": "Пермь",
    "address": "г. Пермь, ул. Ленина 76, кв. 23",
    "orders_count": 1,
    "total_spent": 23950,
    "first_order_date": "09.08.2026",
    "last_order_date": "09.08.2026",
    "loyalty_tier": "new",
    "channels": [
      "call"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-12"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-13",
    "name": "Денис Матвеев",
    "phone": "+7 (908) 210-99-88",
    "normalized_phone": "+7 (908) 210-99-88",
    "city": "Красноярск",
    "address": "г. Красноярск, ул. Мира 91, кв. 37",
    "orders_count": 1,
    "total_spent": 24900,
    "first_order_date": "12.03.2026",
    "last_order_date": "12.03.2026",
    "loyalty_tier": "new",
    "channels": [
      "marketplace"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-13"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-14",
    "name": "Валентина Чернова",
    "phone": "+7 (916) 777-88-99",
    "normalized_phone": "+7 (916) 777-88-99",
    "city": "Москва",
    "address": "г. Москва, Мичуринский пр-т 16, кв. 60",
    "orders_count": 1,
    "total_spent": 25850,
    "first_order_date": "15.04.2026",
    "last_order_date": "15.04.2026",
    "loyalty_tier": "new",
    "channels": [
      "telegram"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-14"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-15",
    "name": "Григорий Лисицын",
    "phone": "+7 (904) 810-22-33",
    "normalized_phone": "+7 (904) 810-22-33",
    "city": "Челябинск",
    "address": "г. Челябинск, пр-т Ленина 55, кв. 82",
    "orders_count": 1,
    "total_spent": 26800,
    "first_order_date": "18.05.2026",
    "last_order_date": "18.05.2026",
    "loyalty_tier": "new",
    "channels": [
      "bitrix"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-15"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-16",
    "name": "Борис Карпов",
    "phone": "+7 (902) 330-14-22",
    "normalized_phone": "+7 (902) 330-14-22",
    "city": "Ярославль",
    "address": "г. Ярославль, ул. Свободы 42, кв. 9",
    "orders_count": 1,
    "total_spent": 27750,
    "first_order_date": "21.06.2026",
    "last_order_date": "21.06.2026",
    "loyalty_tier": "new",
    "channels": [
      "call"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-16"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-17",
    "name": "Алина Федорова",
    "phone": "+7 (914) 700-11-55",
    "normalized_phone": "+7 (914) 700-11-55",
    "city": "Владивосток",
    "address": "г. Владивосток, Океанский пр-т 69, кв. 11",
    "orders_count": 1,
    "total_spent": 28700,
    "first_order_date": "24.07.2026",
    "last_order_date": "24.07.2026",
    "loyalty_tier": "new",
    "channels": [
      "marketplace"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-17"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-18",
    "name": "Максим Исаев",
    "phone": "+7 (902) 360-77-88",
    "normalized_phone": "+7 (902) 360-77-88",
    "city": "Волгоград",
    "address": "г. Волгоград, пр-т Ленина 41, кв. 33",
    "orders_count": 1,
    "total_spent": 29650,
    "first_order_date": "02.08.2026",
    "last_order_date": "02.08.2026",
    "loyalty_tier": "new",
    "channels": [
      "telegram"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-18"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-19",
    "name": "Полина Козлова",
    "phone": "+7 (926) 990-12-12",
    "normalized_phone": "+7 (926) 990-12-12",
    "city": "Москва",
    "address": "г. Москва, Ходынский б-р 19, кв. 240",
    "orders_count": 1,
    "total_spent": 30600,
    "first_order_date": "05.03.2026",
    "last_order_date": "05.03.2026",
    "loyalty_tier": "new",
    "channels": [
      "bitrix"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-19"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-20",
    "name": "Ярослав Новиков",
    "phone": "+7 (987) 410-55-66",
    "normalized_phone": "+7 (987) 410-55-66",
    "city": "Казань",
    "address": "г. Казань, ул. Баумана 29, кв. 4",
    "orders_count": 1,
    "total_spent": 31550,
    "first_order_date": "08.04.2026",
    "last_order_date": "08.04.2026",
    "loyalty_tier": "new",
    "channels": [
      "call"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-20"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-21",
    "name": "Станислав Баранов",
    "phone": "+7 (921) 940-33-22",
    "normalized_phone": "+7 (921) 940-33-22",
    "city": "Санкт-Петербург",
    "address": "г. Санкт-Петербург, Московский пр-т 180, кв. 15",
    "orders_count": 1,
    "total_spent": 32500,
    "first_order_date": "11.05.2026",
    "last_order_date": "11.05.2026",
    "loyalty_tier": "new",
    "channels": [
      "marketplace"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-21"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-22",
    "name": "Ангелина Савина",
    "phone": "+7 (905) 710-88-11",
    "normalized_phone": "+7 (905) 710-88-11",
    "city": "Москва",
    "address": "г. Москва, ул. Вавилова 69к1, кв. 92",
    "orders_count": 1,
    "total_spent": 33450,
    "first_order_date": "14.06.2026",
    "last_order_date": "14.06.2026",
    "loyalty_tier": "new",
    "channels": [
      "telegram"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-22"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-23",
    "name": "Тимофей Щербаков",
    "phone": "+7 (903) 340-99-00",
    "normalized_phone": "+7 (903) 340-99-00",
    "city": "Саратов",
    "address": "г. Саратов, ул. Чапаева 68, кв. 17",
    "orders_count": 1,
    "total_spent": 34400,
    "first_order_date": "17.07.2026",
    "last_order_date": "17.07.2026",
    "loyalty_tier": "new",
    "channels": [
      "bitrix"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-23"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-24",
    "name": "Вероника Климова",
    "phone": "+7 (902) 510-44-33",
    "normalized_phone": "+7 (902) 510-44-33",
    "city": "Иркутск",
    "address": "г. Иркутск, ул. Карла Маркса 25, кв. 8",
    "orders_count": 1,
    "total_spent": 35350,
    "first_order_date": "20.08.2026",
    "last_order_date": "20.08.2026",
    "loyalty_tier": "new",
    "channels": [
      "call"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-24"
    ],
    "linked_chat_ids": []
  },
  {
    "id": "cust-ext-25",
    "name": "Аркадий Соловьев",
    "phone": "+7 (916) 330-55-77",
    "normalized_phone": "+7 (916) 330-55-77",
    "city": "Москва",
    "address": "г. Москва, Осенний б-р 12к1, кв. 51",
    "orders_count": 1,
    "total_spent": 36300,
    "first_order_date": "23.03.2026",
    "last_order_date": "23.03.2026",
    "loyalty_tier": "new",
    "channels": [
      "marketplace"
    ],
    "tags": [
      "Новый"
    ],
    "linked_order_ids": [
      "ord-ext-25"
    ],
    "linked_chat_ids": []
  }
];

// 2. Initial Orders
export const INITIAL_ORDERS: Order[] = [
  {
    "id": "ord-101",
    "order_number": "КР-301",
    "client_name": "Екатерина Воронина",
    "client_phone": "+7 (916) 450-12-89",
    "client_contact": "+7 (916) 450-12-89",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-101-1",
        "stone_type": "Мрамор Nero Marquina (Испания)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 14300,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Nero Marquina (Испания), размер 600х150х20 мм",
    "stone_type": "Мрамор Nero Marquina (Испания)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 14300,
    "prepayment_amount": 7150,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023013",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Павел Семенов",
    "customer_id": "cust-1",
    "chat_id": "chat-ozon-1",
    "chat_marketplace": "wildberries",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, ул. Мосфильмовская 70к2, кв. 115",
    "created_at": "02.04.2026 14:20"
  },
  {
    "id": "ord-125",
    "order_number": "КР-302",
    "client_name": "Екатерина Воронина",
    "client_phone": "+7 (916) 450-12-89",
    "client_contact": "+7 (916) 450-12-89",
    "channel": "telegram",
    "items": [
      {
        "id": "item-ord-125-1",
        "stone_type": "Мрамор Bidasar Green (Индия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 14300,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Bidasar Green (Индия), размер 600х150х20 мм",
    "stone_type": "Мрамор Bidasar Green (Индия)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 14300,
    "prepayment_amount": 7150,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023023",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-1",
    "chat_id": "chat-ozon-1",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, ул. Мосфильмовская 70к2, кв. 115",
    "created_at": "09.05.2026 14:20"
  },
  {
    "id": "ord-180",
    "order_number": "КР-303",
    "client_name": "Екатерина Воронина",
    "client_phone": "+7 (916) 450-12-89",
    "client_contact": "+7 (916) 450-12-89",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-180-1",
        "stone_type": "Гранит Габбро-Диабаз (Карелия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 14300,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Гранит Габбро-Диабаз (Карелия), размер 600х150х20 мм",
    "stone_type": "Гранит Габбро-Диабаз (Карелия)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 14300,
    "prepayment_amount": 7150,
    "prepayment_received": true,
    "remaining_paid": false,
    "status": "in_production",
    "accepted_by": "Лера",
    "polisher": "Сергей Волков",
    "customer_id": "cust-1",
    "chat_id": "chat-ozon-1",
    "chat_marketplace": "ozon",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, ул. Мосфильмовская 70к2, кв. 115",
    "created_at": "08.09.2026 11:30"
  },
  {
    "id": "ord-102",
    "order_number": "КР-304",
    "client_name": "Диана Соколова",
    "client_phone": "+7 (926) 883-91-20",
    "client_contact": "+7 (926) 883-91-20",
    "channel": "call",
    "items": [
      {
        "id": "item-ord-102-1",
        "stone_type": "Гранит Absolute Black (Индия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 33100,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Гранит Absolute Black (Индия), размер 600х150х20 мм",
    "stone_type": "Гранит Absolute Black (Индия)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 33100,
    "prepayment_amount": 16550,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023043",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Иван Морозов",
    "customer_id": "cust-2",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Кутузовский пр-т 36с4, офис 208",
    "created_at": "23.07.2026 14:20"
  },
  {
    "id": "ord-114",
    "order_number": "КР-305",
    "client_name": "Диана Соколова",
    "client_phone": "+7 (926) 883-91-20",
    "client_contact": "+7 (926) 883-91-20",
    "channel": "telegram",
    "items": [
      {
        "id": "item-ord-114-1",
        "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 33100,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Оникс Verde с LED-подсветкой (Иран), размер 600х150х20 мм",
    "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 33100,
    "prepayment_amount": 16550,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023053",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Павел Семенов",
    "customer_id": "cust-2",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Кутузовский пр-т 36с4, офис 208",
    "created_at": "03.08.2026 14:20"
  },
  {
    "id": "ord-132",
    "order_number": "КР-306",
    "client_name": "Диана Соколова",
    "client_phone": "+7 (926) 883-91-20",
    "client_contact": "+7 (926) 883-91-20",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-ord-132-1",
        "stone_type": "Кварцевый агломерат Pure White",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 33100,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Кварцевый агломерат Pure White, размер 600х150х20 мм",
    "stone_type": "Кварцевый агломерат Pure White",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 33100,
    "prepayment_amount": 16550,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023063",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-2",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Кутузовский пр-т 36с4, офис 208",
    "created_at": "10.03.2026 14:20"
  },
  {
    "id": "ord-149",
    "order_number": "КР-307",
    "client_name": "Диана Соколова",
    "client_phone": "+7 (926) 883-91-20",
    "client_contact": "+7 (926) 883-91-20",
    "channel": "call",
    "items": [
      {
        "id": "item-ord-149-1",
        "stone_type": "Травертин Noce матовый (Турция)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 33100,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Травертин Noce матовый (Турция), размер 600х150х20 мм",
    "stone_type": "Травертин Noce матовый (Турция)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 33100,
    "prepayment_amount": 16550,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023073",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Сергей Волков",
    "customer_id": "cust-2",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Кутузовский пр-т 36с4, офис 208",
    "created_at": "17.04.2026 14:20"
  },
  {
    "id": "ord-168",
    "order_number": "КР-308",
    "client_name": "Диана Соколова",
    "client_phone": "+7 (926) 883-91-20",
    "client_contact": "+7 (926) 883-91-20",
    "channel": "telegram",
    "items": [
      {
        "id": "item-ord-168-1",
        "stone_type": "Мрамор Calacatta Gold (Италия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 33100,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Calacatta Gold (Италия), размер 600х150х20 мм",
    "stone_type": "Мрамор Calacatta Gold (Италия)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 33100,
    "prepayment_amount": 16550,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023083",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Иван Морозов",
    "customer_id": "cust-2",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Кутузовский пр-т 36с4, офис 208",
    "created_at": "24.05.2026 14:20"
  },
  {
    "id": "ord-182",
    "order_number": "КР-309",
    "client_name": "Диана Соколова",
    "client_phone": "+7 (926) 883-91-20",
    "client_contact": "+7 (926) 883-91-20",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-ord-182-1",
        "stone_type": "Мрамор Nero Marquina (Испания)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 33100,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Nero Marquina (Испания), размер 600х150х20 мм",
    "stone_type": "Мрамор Nero Marquina (Испания)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 33100,
    "prepayment_amount": 16550,
    "prepayment_received": true,
    "remaining_paid": false,
    "status": "ready_to_ship",
    "accepted_by": "Лера",
    "polisher": "Павел Семенов",
    "customer_id": "cust-2",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Кутузовский пр-т 36с4, офис 208",
    "created_at": "08.09.2026 11:30"
  },
  {
    "id": "ord-130",
    "order_number": "КР-310",
    "client_name": "Артем Демидов",
    "client_phone": "+7 (981) 712-33-40",
    "client_contact": "+7 (981) 712-33-40",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-130-1",
        "stone_type": "Травертин Noce матовый (Турция)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 15900,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Травертин Noce матовый (Турция), размер 600х150х20 мм",
    "stone_type": "Травертин Noce матовый (Турция)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 15900,
    "prepayment_amount": 7950,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023103",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-3",
    "chat_id": "chat-wb-1",
    "chat_marketplace": "wildberries",
    "delivery_city": "Санкт-Петербург",
    "delivery_address": "г. Санкт-Петербург, Приморский пр-т 137к1, кв. 42",
    "created_at": "11.07.2026 14:20"
  },
  {
    "id": "ord-185",
    "order_number": "КР-311",
    "client_name": "Артем Демидов",
    "client_phone": "+7 (981) 712-33-40",
    "client_contact": "+7 (981) 712-33-40",
    "channel": "call",
    "items": [
      {
        "id": "item-ord-185-1",
        "stone_type": "Мрамор Calacatta Gold (Италия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 15900,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Calacatta Gold (Италия), размер 600х150х20 мм",
    "stone_type": "Мрамор Calacatta Gold (Италия)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 15900,
    "prepayment_amount": 7950,
    "prepayment_received": false,
    "remaining_paid": false,
    "status": "waiting_prepayment",
    "accepted_by": "Алина",
    "polisher": "Сергей Волков",
    "customer_id": "cust-3",
    "chat_id": "chat-wb-1",
    "delivery_city": "Санкт-Петербург",
    "delivery_address": "г. Санкт-Петербург, Приморский пр-т 137к1, кв. 42",
    "created_at": "08.09.2026 11:30"
  },
  {
    "id": "ord-138",
    "order_number": "КР-312",
    "client_name": "Михаил Белов",
    "client_phone": "+7 (987) 229-84-11",
    "client_contact": "+7 (987) 229-84-11",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-138-1",
        "stone_type": "Мрамор Calacatta Gold (Италия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 23300,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Calacatta Gold (Италия), размер 600х150х20 мм",
    "stone_type": "Мрамор Calacatta Gold (Италия)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 23300,
    "prepayment_amount": 11650,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023123",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Иван Морозов",
    "customer_id": "cust-4",
    "chat_id": "chat-ym-1",
    "chat_marketplace": "ozon",
    "delivery_city": "Казань",
    "delivery_address": "г. Казань, ул. Чистопольская 86, кв. 73",
    "created_at": "25.03.2026 14:20"
  },
  {
    "id": "ord-176",
    "order_number": "КР-313",
    "client_name": "Михаил Белов",
    "client_phone": "+7 (987) 229-84-11",
    "client_contact": "+7 (987) 229-84-11",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-176-1",
        "stone_type": "Мрамор Nero Marquina (Испания)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 23300,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Nero Marquina (Испания), размер 600х150х20 мм",
    "stone_type": "Мрамор Nero Marquina (Испания)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 23300,
    "prepayment_amount": 11650,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023133",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Павел Семенов",
    "customer_id": "cust-4",
    "chat_id": "chat-ym-1",
    "chat_marketplace": "wildberries",
    "delivery_city": "Казань",
    "delivery_address": "г. Казань, ул. Чистопольская 86, кв. 73",
    "created_at": "05.04.2026 14:20"
  },
  {
    "id": "ord-106",
    "order_number": "КР-314",
    "client_name": "Сергей Кузнецов",
    "client_phone": "+7 (913) 915-00-66",
    "client_contact": "+7 (913) 915-00-66",
    "channel": "telegram",
    "items": [
      {
        "id": "item-ord-106-1",
        "stone_type": "Мрамор Nero Marquina (Испания)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 22400,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Nero Marquina (Испания), размер 600х150х20 мм",
    "stone_type": "Мрамор Nero Marquina (Испания)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 22400,
    "prepayment_amount": 11200,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023143",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-5",
    "delivery_city": "Новосибирск",
    "delivery_address": "г. Новосибирск, Красный пр-т 179, кв. 51",
    "created_at": "12.05.2026 14:20"
  },
  {
    "id": "ord-142",
    "order_number": "КР-315",
    "client_name": "Сергей Кузнецов",
    "client_phone": "+7 (913) 915-00-66",
    "client_contact": "+7 (913) 915-00-66",
    "channel": "call",
    "items": [
      {
        "id": "item-ord-142-1",
        "stone_type": "Мрамор Bidasar Green (Индия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 22400,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Bidasar Green (Индия), размер 600х150х20 мм",
    "stone_type": "Мрамор Bidasar Green (Индия)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 22400,
    "prepayment_amount": 11200,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023153",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Сергей Волков",
    "customer_id": "cust-5",
    "delivery_city": "Новосибирск",
    "delivery_address": "г. Новосибирск, Красный пр-т 179, кв. 51",
    "created_at": "19.06.2026 14:20"
  },
  {
    "id": "ord-171",
    "order_number": "КР-316",
    "client_name": "Сергей Кузнецов",
    "client_phone": "+7 (913) 915-00-66",
    "client_contact": "+7 (913) 915-00-66",
    "channel": "telegram",
    "items": [
      {
        "id": "item-ord-171-1",
        "stone_type": "Гранит Габбро-Диабаз (Карелия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 22400,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Гранит Габбро-Диабаз (Карелия), размер 600х150х20 мм",
    "stone_type": "Гранит Габбро-Диабаз (Карелия)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 22400,
    "prepayment_amount": 11200,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023163",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Иван Морозов",
    "customer_id": "cust-5",
    "delivery_city": "Новосибирск",
    "delivery_address": "г. Новосибирск, Красный пр-т 179, кв. 51",
    "created_at": "26.07.2026 14:20"
  },
  {
    "id": "ord-122",
    "order_number": "КР-317",
    "client_name": "Ольга Романова",
    "client_phone": "+7 (922) 104-55-90",
    "client_contact": "+7 (922) 104-55-90",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-122-1",
        "stone_type": "Гранит Absolute Black (Индия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 14000,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Гранит Absolute Black (Индия), размер 600х150х20 мм",
    "stone_type": "Гранит Absolute Black (Индия)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 14000,
    "prepayment_amount": 7000,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023173",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Павел Семенов",
    "customer_id": "cust-6",
    "chat_id": "chat-ozon-2",
    "chat_marketplace": "yandex",
    "delivery_city": "Екатеринбург",
    "delivery_address": "г. Екатеринбург, ул. Радищева 33, кв. 104",
    "created_at": "06.08.2026 14:20"
  },
  {
    "id": "ord-165",
    "order_number": "КР-318",
    "client_name": "Ольга Романова",
    "client_phone": "+7 (922) 104-55-90",
    "client_contact": "+7 (922) 104-55-90",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-165-1",
        "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 14000,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Оникс Verde с LED-подсветкой (Иран), размер 600х150х20 мм",
    "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 14000,
    "prepayment_amount": 7000,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023183",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-6",
    "chat_id": "chat-ozon-2",
    "chat_marketplace": "ozon",
    "delivery_city": "Екатеринбург",
    "delivery_address": "г. Екатеринбург, ул. Радищева 33, кв. 104",
    "created_at": "13.03.2026 14:20"
  },
  {
    "id": "ord-117",
    "order_number": "КР-319",
    "client_name": "Игорь Васильев",
    "client_phone": "+7 (918) 441-28-90",
    "client_contact": "+7 (918) 441-28-90",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-117-1",
        "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 19500,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Оникс Verde с LED-подсветкой (Иран), размер 600х150х20 мм",
    "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 19500,
    "prepayment_amount": 9750,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023193",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Сергей Волков",
    "customer_id": "cust-7",
    "chat_id": "chat-wb-2",
    "chat_marketplace": "wildberries",
    "delivery_city": "Краснодар",
    "delivery_address": "г. Краснодар, ул. Кубанская Набережная 39, кв. 88",
    "created_at": "20.04.2026 14:20"
  },
  {
    "id": "ord-174",
    "order_number": "КР-320",
    "client_name": "Игорь Васильев",
    "client_phone": "+7 (918) 441-28-90",
    "client_contact": "+7 (918) 441-28-90",
    "channel": "telegram",
    "items": [
      {
        "id": "item-ord-174-1",
        "stone_type": "Кварцевый агломерат Pure White",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 19500,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Кварцевый агломерат Pure White, размер 600х150х20 мм",
    "stone_type": "Кварцевый агломерат Pure White",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 19500,
    "prepayment_amount": 9750,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023203",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Иван Морозов",
    "customer_id": "cust-7",
    "chat_id": "chat-wb-2",
    "delivery_city": "Краснодар",
    "delivery_address": "г. Краснодар, ул. Кубанская Набережная 39, кв. 88",
    "created_at": "27.05.2026 14:20"
  },
  {
    "id": "ord-145",
    "order_number": "КР-321",
    "client_name": "Алексей Смирнов",
    "client_phone": "+7 (999) 000-00-00",
    "client_contact": "",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-145-1",
        "stone_type": "Кварцевый агломерат Pure White",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 18500,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Кварцевый агломерат Pure White, размер 600х150х20 мм",
    "stone_type": "Кварцевый агломерат Pure White",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 18500,
    "prepayment_amount": 9250,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023213",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Павел Семенов",
    "customer_id": "cust-alexey-ozon",
    "chat_id": "chat-ozon-3",
    "chat_marketplace": "ozon",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Ломоносовский пр-т 29к1, кв. 84",
    "created_at": "07.06.2026 14:20"
  },
  {
    "id": "ord-173",
    "order_number": "КР-322",
    "client_name": "Алексей С.",
    "client_phone": "+7 (903) 771-44-12",
    "client_contact": "+7 (903) 771-44-12",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-ord-173-1",
        "stone_type": "Кварцевый агломерат Calacatta Extra",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 24500,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Кварцевый агломерат Calacatta Extra, размер 600х150х20 мм",
    "stone_type": "Кварцевый агломерат Calacatta Extra",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 24500,
    "prepayment_amount": 12250,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023223",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-alexey-site",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Ломоносовский пр-т 29к1, кв. 84",
    "created_at": "14.07.2026 14:20"
  },
  {
    "id": "ord-152",
    "order_number": "КР-323",
    "client_name": "Дмитрий Морозов",
    "client_phone": "+7 (999) 000-00-00",
    "client_contact": "",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-152-1",
        "stone_type": "Травертин Noce матовый (Турция)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 16200,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Травертин Noce матовый (Турция), размер 600х150х20 мм",
    "stone_type": "Травертин Noce матовый (Турция)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 16200,
    "prepayment_amount": 8100,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023233",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Сергей Волков",
    "customer_id": "cust-dmitry-ym",
    "chat_id": "chat-ym-2",
    "chat_marketplace": "yandex",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, ул. Удальцова 46, кв. 19",
    "created_at": "21.08.2026 14:20"
  },
  {
    "id": "ord-179",
    "order_number": "КР-324",
    "client_name": "Дмитрий М.",
    "client_phone": "+7 (925) 301-99-04",
    "client_contact": "+7 (925) 301-99-04",
    "channel": "call",
    "items": [
      {
        "id": "item-ord-179-1",
        "stone_type": "Акриловый камень Corian Glacier",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 19800,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Акриловый камень Corian Glacier, размер 600х150х20 мм",
    "stone_type": "Акриловый камень Corian Glacier",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 19800,
    "prepayment_amount": 9900,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023243",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Иван Морозов",
    "customer_id": "cust-dmitry-call",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, ул. Удальцова 46, кв. 19",
    "created_at": "01.03.2026 14:20"
  },
  {
    "id": "ord-108",
    "order_number": "КР-325",
    "client_name": "Студия «StoneDesign» (Ксения)",
    "client_phone": "+7 (903) 111-99-00",
    "client_contact": "+7 (903) 111-99-00",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-ord-108-1",
        "stone_type": "Мрамор Calacatta Gold (Италия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 34800,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Calacatta Gold (Италия), размер 600х150х20 мм",
    "stone_type": "Мрамор Calacatta Gold (Италия)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 34800,
    "prepayment_amount": 17400,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023253",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Павел Семенов",
    "customer_id": "cust-10",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Саввинская наб. 12с1",
    "created_at": "08.04.2026 14:20"
  },
  {
    "id": "ord-126",
    "order_number": "КР-326",
    "client_name": "Студия «StoneDesign» (Ксения)",
    "client_phone": "+7 (903) 111-99-00",
    "client_contact": "+7 (903) 111-99-00",
    "channel": "call",
    "items": [
      {
        "id": "item-ord-126-1",
        "stone_type": "Мрамор Nero Marquina (Испания)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 34800,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Nero Marquina (Испания), размер 600х150х20 мм",
    "stone_type": "Мрамор Nero Marquina (Испания)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 34800,
    "prepayment_amount": 17400,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023263",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-10",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Саввинская наб. 12с1",
    "created_at": "15.05.2026 14:20"
  },
  {
    "id": "ord-144",
    "order_number": "КР-327",
    "client_name": "Студия «StoneDesign» (Ксения)",
    "client_phone": "+7 (903) 111-99-00",
    "client_contact": "+7 (903) 111-99-00",
    "channel": "telegram",
    "items": [
      {
        "id": "item-ord-144-1",
        "stone_type": "Мрамор Bidasar Green (Индия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 34800,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Bidasar Green (Индия), размер 600х150х20 мм",
    "stone_type": "Мрамор Bidasar Green (Индия)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 34800,
    "prepayment_amount": 17400,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023273",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Сергей Волков",
    "customer_id": "cust-10",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Саввинская наб. 12с1",
    "created_at": "22.06.2026 14:20"
  },
  {
    "id": "ord-162",
    "order_number": "КР-328",
    "client_name": "Студия «StoneDesign» (Ксения)",
    "client_phone": "+7 (903) 111-99-00",
    "client_contact": "+7 (903) 111-99-00",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-ord-162-1",
        "stone_type": "Гранит Габбро-Диабаз (Карелия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 34800,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Гранит Габбро-Диабаз (Карелия), размер 600х150х20 мм",
    "stone_type": "Гранит Габбро-Диабаз (Карелия)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 34800,
    "prepayment_amount": 17400,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023283",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Иван Морозов",
    "customer_id": "cust-10",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Саввинская наб. 12с1",
    "created_at": "02.07.2026 14:20"
  },
  {
    "id": "ord-184",
    "order_number": "КР-329",
    "client_name": "Студия «StoneDesign» (Ксения)",
    "client_phone": "+7 (903) 111-99-00",
    "client_contact": "+7 (903) 111-99-00",
    "channel": "call",
    "items": [
      {
        "id": "item-ord-184-1",
        "stone_type": "Оникс Miele медовый (Турция)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 34800,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Оникс Miele медовый (Турция), размер 600х150х20 мм",
    "stone_type": "Оникс Miele медовый (Турция)",
    "dimensions": "600х150х20 мм",
    "notes": "★ Повторный заказ постоянного клиента",
    "total_price": 34800,
    "prepayment_amount": 17400,
    "prepayment_received": true,
    "remaining_paid": false,
    "tracking_number": "1489023293",
    "status": "in_delivery",
    "accepted_by": "Алина",
    "polisher": "Павел Семенов",
    "customer_id": "cust-10",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Саввинская наб. 12с1",
    "created_at": "08.09.2026 11:30"
  },
  {
    "id": "ord-ext-1",
    "order_number": "КР-330",
    "client_name": "Павел Орлов",
    "client_phone": "+7 (916) 120-33-44",
    "client_contact": "+7 (916) 120-33-44",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-ext-1-1",
        "stone_type": "Гранит Absolute Black (Индия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 13500,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Гранит Absolute Black (Индия), размер 600х150х20 мм",
    "stone_type": "Гранит Absolute Black (Индия)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 13500,
    "prepayment_amount": 6750,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023303",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-ext-1",
    "chat_id": "chat-ozon-1",
    "chat_marketplace": "ozon",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Ленинский пр-т 82, кв. 45",
    "created_at": "16.03.2026 14:20"
  },
  {
    "id": "ord-ext-2",
    "order_number": "КР-331",
    "client_name": "Наталья Захарова",
    "client_phone": "+7 (927) 601-99-12",
    "client_contact": "+7 (927) 601-99-12",
    "channel": "telegram",
    "items": [
      {
        "id": "item-ord-ext-2-1",
        "stone_type": "Гранит Габбро-Диабаз (Карелия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 14500,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Гранит Габбро-Диабаз (Карелия), размер 600х150х20 мм",
    "stone_type": "Гранит Габбро-Диабаз (Карелия)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 14500,
    "prepayment_amount": 7250,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023313",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Сергей Волков",
    "customer_id": "cust-ext-2",
    "delivery_city": "Самара",
    "delivery_address": "г. Самара, Волжский пр-т 19, кв. 12",
    "created_at": "23.04.2026 14:20"
  },
  {
    "id": "ord-ext-3",
    "order_number": "КР-332",
    "client_name": "Константин Фролов",
    "client_phone": "+7 (904) 390-11-22",
    "client_contact": "+7 (904) 390-11-22",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-ord-ext-3-1",
        "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 15400,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Оникс Verde с LED-подсветкой (Иран), размер 600х150х20 мм",
    "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 15400,
    "prepayment_amount": 7700,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023323",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Иван Морозов",
    "customer_id": "cust-ext-3",
    "delivery_city": "Нижний Новгород",
    "delivery_address": "г. Н.Новгород, ул. Белинского 58, кв. 30",
    "created_at": "03.05.2026 14:20"
  },
  {
    "id": "ord-ext-4",
    "order_number": "КР-333",
    "client_name": "Елена Кравцова",
    "client_phone": "+7 (918) 200-88-77",
    "client_contact": "+7 (918) 200-88-77",
    "channel": "call",
    "items": [
      {
        "id": "item-ord-ext-4-1",
        "stone_type": "Оникс Miele медовый (Турция)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 16400,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Оникс Miele медовый (Турция), размер 600х150х20 мм",
    "stone_type": "Оникс Miele медовый (Турция)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 16400,
    "prepayment_amount": 8200,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023333",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Павел Семенов",
    "customer_id": "cust-ext-4",
    "delivery_city": "Сочи",
    "delivery_address": "г. Сочи, Курортный пр-т 92, кв. 6",
    "created_at": "10.06.2026 14:20"
  },
  {
    "id": "ord-ext-5",
    "order_number": "КР-334",
    "client_name": "Андрей Мельников",
    "client_phone": "+7 (926) 345-67-89",
    "client_contact": "+7 (926) 345-67-89",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-ext-5-1",
        "stone_type": "Кварцевый агломерат Pure White",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 17300,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Кварцевый агломерат Pure White, размер 600х150х20 мм",
    "stone_type": "Кварцевый агломерат Pure White",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 17300,
    "prepayment_amount": 8650,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023343",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-ext-5",
    "chat_id": "chat-ozon-5",
    "chat_marketplace": "wildberries",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, ул. Профсоюзная 104, кв. 77",
    "created_at": "17.07.2026 14:20"
  },
  {
    "id": "ord-ext-6",
    "order_number": "КР-335",
    "client_name": "Татьяна Гусева",
    "client_phone": "+7 (988) 512-34-56",
    "client_contact": "+7 (988) 512-34-56",
    "channel": "telegram",
    "items": [
      {
        "id": "item-ord-ext-6-1",
        "stone_type": "Кварцевый агломерат Calacatta Extra",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 18300,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Кварцевый агломерат Calacatta Extra, размер 600х150х20 мм",
    "stone_type": "Кварцевый агломерат Calacatta Extra",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 18300,
    "prepayment_amount": 9150,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023353",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Сергей Волков",
    "customer_id": "cust-ext-6",
    "delivery_city": "Ростов-на-Дону",
    "delivery_address": "г. Ростов-на-Дону, ул. Пушкинская 144, кв. 18",
    "created_at": "24.08.2026 14:20"
  },
  {
    "id": "ord-ext-7",
    "order_number": "КР-336",
    "client_name": "Илья Ковалев",
    "client_phone": "+7 (951) 850-22-33",
    "client_contact": "+7 (951) 850-22-33",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-ord-ext-7-1",
        "stone_type": "Травертин Noce матовый (Турция)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 19200,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Травертин Noce матовый (Турция), размер 600х150х20 мм",
    "stone_type": "Травертин Noce матовый (Турция)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 19200,
    "prepayment_amount": 9600,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023363",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Иван Морозов",
    "customer_id": "cust-ext-7",
    "delivery_city": "Воронеж",
    "delivery_address": "г. Воронеж, Московский пр-т 120, кв. 54",
    "created_at": "04.03.2026 14:20"
  },
  {
    "id": "ord-ext-8",
    "order_number": "КР-337",
    "client_name": "Светлана Беляева",
    "client_phone": "+7 (922) 480-11-22",
    "client_contact": "+7 (922) 480-11-22",
    "channel": "call",
    "items": [
      {
        "id": "item-ord-ext-8-1",
        "stone_type": "Акриловый камень Corian Glacier",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 20200,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Акриловый камень Corian Glacier, размер 600х150х20 мм",
    "stone_type": "Акриловый камень Corian Glacier",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 20200,
    "prepayment_amount": 10100,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023373",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Павел Семенов",
    "customer_id": "cust-ext-8",
    "delivery_city": "Тюмень",
    "delivery_address": "г. Тюмень, ул. Республики 142, кв. 89",
    "created_at": "11.04.2026 14:20"
  },
  {
    "id": "ord-ext-9",
    "order_number": "КР-338",
    "client_name": "Роман Давыдов",
    "client_phone": "+7 (903) 890-12-45",
    "client_contact": "+7 (903) 890-12-45",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-ext-9-1",
        "stone_type": "Мрамор Calacatta Gold (Италия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 21100,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Calacatta Gold (Италия), размер 600х150х20 мм",
    "stone_type": "Мрамор Calacatta Gold (Италия)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 21100,
    "prepayment_amount": 10550,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023383",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-ext-9",
    "chat_id": "chat-ozon-4",
    "chat_marketplace": "yandex",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Рублевское шоссе 28к1, кв. 102",
    "created_at": "18.05.2026 14:20"
  },
  {
    "id": "ord-ext-10",
    "order_number": "КР-339",
    "client_name": "Марина Полякова",
    "client_phone": "+7 (911) 450-88-99",
    "client_contact": "+7 (911) 450-88-99",
    "channel": "telegram",
    "items": [
      {
        "id": "item-ord-ext-10-1",
        "stone_type": "Мрамор Bianco Carrara (Италия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 22100,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Bianco Carrara (Италия), размер 600х150х20 мм",
    "stone_type": "Мрамор Bianco Carrara (Италия)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 22100,
    "prepayment_amount": 11050,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023393",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Сергей Волков",
    "customer_id": "cust-ext-10",
    "delivery_city": "Калининград",
    "delivery_address": "г. Калининград, ул. Театральная 30, кв. 15",
    "created_at": "25.06.2026 14:20"
  },
  {
    "id": "ord-ext-11",
    "order_number": "КР-340",
    "client_name": "Олег Григорьев",
    "client_phone": "+7 (917) 750-11-33",
    "client_contact": "+7 (917) 750-11-33",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-ord-ext-11-1",
        "stone_type": "Мрамор Nero Marquina (Испания)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 23000,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Nero Marquina (Испания), размер 600х150х20 мм",
    "stone_type": "Мрамор Nero Marquina (Испания)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 23000,
    "prepayment_amount": 11500,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023403",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Иван Морозов",
    "customer_id": "cust-ext-11",
    "delivery_city": "Уфа",
    "delivery_address": "г. Уфа, пр-т Октября 68, кв. 41",
    "created_at": "05.07.2026 14:20"
  },
  {
    "id": "ord-ext-12",
    "order_number": "КР-341",
    "client_name": "Юлия Ситникова",
    "client_phone": "+7 (902) 830-44-55",
    "client_contact": "+7 (902) 830-44-55",
    "channel": "call",
    "items": [
      {
        "id": "item-ord-ext-12-1",
        "stone_type": "Мрамор Crema Marfil (Испания)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 24000,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Crema Marfil (Испания), размер 600х150х20 мм",
    "stone_type": "Мрамор Crema Marfil (Испания)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 24000,
    "prepayment_amount": 12000,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023413",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Павел Семенов",
    "customer_id": "cust-ext-12",
    "delivery_city": "Пермь",
    "delivery_address": "г. Пермь, ул. Ленина 76, кв. 23",
    "created_at": "12.08.2026 14:20"
  },
  {
    "id": "ord-ext-13",
    "order_number": "КР-342",
    "client_name": "Денис Матвеев",
    "client_phone": "+7 (908) 210-99-88",
    "client_contact": "+7 (908) 210-99-88",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-ext-13-1",
        "stone_type": "Мрамор Bidasar Green (Индия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 24900,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Bidasar Green (Индия), размер 600х150х20 мм",
    "stone_type": "Мрамор Bidasar Green (Индия)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 24900,
    "prepayment_amount": 12450,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023423",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-ext-13",
    "chat_id": "chat-ozon-3",
    "chat_marketplace": "ozon",
    "delivery_city": "Красноярск",
    "delivery_address": "г. Красноярск, ул. Мира 91, кв. 37",
    "created_at": "19.03.2026 14:20"
  },
  {
    "id": "ord-ext-14",
    "order_number": "КР-343",
    "client_name": "Валентина Чернова",
    "client_phone": "+7 (916) 777-88-99",
    "client_contact": "+7 (916) 777-88-99",
    "channel": "telegram",
    "items": [
      {
        "id": "item-ord-ext-14-1",
        "stone_type": "Гранит Absolute Black (Индия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 25900,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Гранит Absolute Black (Индия), размер 600х150х20 мм",
    "stone_type": "Гранит Absolute Black (Индия)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 25900,
    "prepayment_amount": 12950,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023433",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Сергей Волков",
    "customer_id": "cust-ext-14",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Мичуринский пр-т 16, кв. 60",
    "created_at": "26.04.2026 14:20"
  },
  {
    "id": "ord-ext-15",
    "order_number": "КР-344",
    "client_name": "Григорий Лисицын",
    "client_phone": "+7 (904) 810-22-33",
    "client_contact": "+7 (904) 810-22-33",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-ord-ext-15-1",
        "stone_type": "Гранит Габбро-Диабаз (Карелия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 26800,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Гранит Габбро-Диабаз (Карелия), размер 600х150х20 мм",
    "stone_type": "Гранит Габбро-Диабаз (Карелия)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 26800,
    "prepayment_amount": 13400,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023443",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Иван Морозов",
    "customer_id": "cust-ext-15",
    "delivery_city": "Челябинск",
    "delivery_address": "г. Челябинск, пр-т Ленина 55, кв. 82",
    "created_at": "06.05.2026 14:20"
  },
  {
    "id": "ord-ext-16",
    "order_number": "КР-345",
    "client_name": "Борис Карпов",
    "client_phone": "+7 (902) 330-14-22",
    "client_contact": "+7 (902) 330-14-22",
    "channel": "call",
    "items": [
      {
        "id": "item-ord-ext-16-1",
        "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 27800,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Оникс Verde с LED-подсветкой (Иран), размер 600х150х20 мм",
    "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 27800,
    "prepayment_amount": 13900,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023453",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Павел Семенов",
    "customer_id": "cust-ext-16",
    "delivery_city": "Ярославль",
    "delivery_address": "г. Ярославль, ул. Свободы 42, кв. 9",
    "created_at": "13.06.2026 14:20"
  },
  {
    "id": "ord-ext-17",
    "order_number": "КР-346",
    "client_name": "Алина Федорова",
    "client_phone": "+7 (914) 700-11-55",
    "client_contact": "+7 (914) 700-11-55",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-ext-17-1",
        "stone_type": "Оникс Miele медовый (Турция)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 28700,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Оникс Miele медовый (Турция), размер 600х150х20 мм",
    "stone_type": "Оникс Miele медовый (Турция)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 28700,
    "prepayment_amount": 14350,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023463",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-ext-17",
    "chat_id": "chat-ozon-2",
    "chat_marketplace": "wildberries",
    "delivery_city": "Владивосток",
    "delivery_address": "г. Владивосток, Океанский пр-т 69, кв. 11",
    "created_at": "20.07.2026 14:20"
  },
  {
    "id": "ord-ext-18",
    "order_number": "КР-347",
    "client_name": "Максим Исаев",
    "client_phone": "+7 (902) 360-77-88",
    "client_contact": "+7 (902) 360-77-88",
    "channel": "telegram",
    "items": [
      {
        "id": "item-ord-ext-18-1",
        "stone_type": "Кварцевый агломерат Pure White",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 29700,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Кварцевый агломерат Pure White, размер 600х150х20 мм",
    "stone_type": "Кварцевый агломерат Pure White",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 29700,
    "prepayment_amount": 14850,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023473",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Сергей Волков",
    "customer_id": "cust-ext-18",
    "delivery_city": "Волгоград",
    "delivery_address": "г. Волгоград, пр-т Ленина 41, кв. 33",
    "created_at": "27.08.2026 14:20"
  },
  {
    "id": "ord-ext-19",
    "order_number": "КР-348",
    "client_name": "Полина Козлова",
    "client_phone": "+7 (926) 990-12-12",
    "client_contact": "+7 (926) 990-12-12",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-ord-ext-19-1",
        "stone_type": "Кварцевый агломерат Calacatta Extra",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 30600,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Кварцевый агломерат Calacatta Extra, размер 600х150х20 мм",
    "stone_type": "Кварцевый агломерат Calacatta Extra",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 30600,
    "prepayment_amount": 15300,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023483",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Иван Морозов",
    "customer_id": "cust-ext-19",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Ходынский б-р 19, кв. 240",
    "created_at": "07.03.2026 14:20"
  },
  {
    "id": "ord-ext-20",
    "order_number": "КР-349",
    "client_name": "Ярослав Новиков",
    "client_phone": "+7 (987) 410-55-66",
    "client_contact": "+7 (987) 410-55-66",
    "channel": "call",
    "items": [
      {
        "id": "item-ord-ext-20-1",
        "stone_type": "Травертин Noce матовый (Турция)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 31600,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Травертин Noce матовый (Турция), размер 600х150х20 мм",
    "stone_type": "Травертин Noce матовый (Турция)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 31600,
    "prepayment_amount": 15800,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023493",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Павел Семенов",
    "customer_id": "cust-ext-20",
    "delivery_city": "Казань",
    "delivery_address": "г. Казань, ул. Баумана 29, кв. 4",
    "created_at": "14.04.2026 14:20"
  },
  {
    "id": "ord-ext-21",
    "order_number": "КР-350",
    "client_name": "Станислав Баранов",
    "client_phone": "+7 (921) 940-33-22",
    "client_contact": "+7 (921) 940-33-22",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-ext-21-1",
        "stone_type": "Акриловый камень Corian Glacier",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 32500,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Акриловый камень Corian Glacier, размер 600х150х20 мм",
    "stone_type": "Акриловый камень Corian Glacier",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 32500,
    "prepayment_amount": 16250,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023503",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-ext-21",
    "chat_id": "chat-ozon-1",
    "chat_marketplace": "yandex",
    "delivery_city": "Санкт-Петербург",
    "delivery_address": "г. Санкт-Петербург, Московский пр-т 180, кв. 15",
    "created_at": "21.05.2026 14:20"
  },
  {
    "id": "ord-ext-22",
    "order_number": "КР-351",
    "client_name": "Ангелина Савина",
    "client_phone": "+7 (905) 710-88-11",
    "client_contact": "+7 (905) 710-88-11",
    "channel": "telegram",
    "items": [
      {
        "id": "item-ord-ext-22-1",
        "stone_type": "Мрамор Calacatta Gold (Италия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 33500,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Calacatta Gold (Италия), размер 600х150х20 мм",
    "stone_type": "Мрамор Calacatta Gold (Италия)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 33500,
    "prepayment_amount": 16750,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023513",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Сергей Волков",
    "customer_id": "cust-ext-22",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, ул. Вавилова 69к1, кв. 92",
    "created_at": "01.06.2026 14:20"
  },
  {
    "id": "ord-ext-23",
    "order_number": "КР-352",
    "client_name": "Тимофей Щербаков",
    "client_phone": "+7 (903) 340-99-00",
    "client_contact": "+7 (903) 340-99-00",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-ord-ext-23-1",
        "stone_type": "Мрамор Bianco Carrara (Италия)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 34400,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Bianco Carrara (Италия), размер 600х150х20 мм",
    "stone_type": "Мрамор Bianco Carrara (Италия)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 34400,
    "prepayment_amount": 17200,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023523",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Иван Морозов",
    "customer_id": "cust-ext-23",
    "delivery_city": "Саратов",
    "delivery_address": "г. Саратов, ул. Чапаева 68, кв. 17",
    "created_at": "08.07.2026 14:20"
  },
  {
    "id": "ord-ext-24",
    "order_number": "КР-353",
    "client_name": "Вероника Климова",
    "client_phone": "+7 (902) 510-44-33",
    "client_contact": "+7 (902) 510-44-33",
    "channel": "call",
    "items": [
      {
        "id": "item-ord-ext-24-1",
        "stone_type": "Мрамор Nero Marquina (Испания)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 35400,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Nero Marquina (Испания), размер 600х150х20 мм",
    "stone_type": "Мрамор Nero Marquina (Испания)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 35400,
    "prepayment_amount": 17700,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023533",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Павел Семенов",
    "customer_id": "cust-ext-24",
    "delivery_city": "Иркутск",
    "delivery_address": "г. Иркутск, ул. Карла Маркса 25, кв. 8",
    "created_at": "15.08.2026 14:20"
  },
  {
    "id": "ord-ext-25",
    "order_number": "КР-354",
    "client_name": "Аркадий Соловьев",
    "client_phone": "+7 (916) 330-55-77",
    "client_contact": "+7 (916) 330-55-77",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-ord-ext-25-1",
        "stone_type": "Мрамор Crema Marfil (Испания)",
        "dimensions": "600х150х20 мм",
        "quantity": 1,
        "price": 36300,
        "description": "Ручная полировка, фаска 1/4 круга (2 мм), скрытый монтаж"
      }
    ],
    "product_description": "Полка из камня Мрамор Crema Marfil (Испания), размер 600х150х20 мм",
    "stone_type": "Мрамор Crema Marfil (Испания)",
    "dimensions": "600х150х20 мм",
    "notes": "",
    "total_price": 36300,
    "prepayment_amount": 18150,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1489023543",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-ext-25",
    "chat_id": "chat-ozon-5",
    "chat_marketplace": "ozon",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Осенний б-р 12к1, кв. 51",
    "created_at": "22.03.2026 14:20"
  },
  {
    "id": "ord-gen-355",
    "order_number": "КР-355",
    "client_name": "Олег Григорьев",
    "client_phone": "+7 (917) 750-11-33",
    "client_contact": "+7 (917) 750-11-33",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-gen-355",
        "stone_type": "Мрамор Bidasar Green (Индия)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 36500,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Мрамор Bidasar Green (Индия)",
    "stone_type": "Мрамор Bidasar Green (Индия)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 36500,
    "prepayment_amount": 18250,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283555",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Сергей Волков",
    "customer_id": "cust-ext-11",
    "delivery_city": "Уфа",
    "delivery_address": "г. Уфа, пр-т Октября 68, кв. 41",
    "created_at": "13.04.2026 15:00"
  },
  {
    "id": "ord-gen-356",
    "order_number": "КР-356",
    "client_name": "Юлия Ситникова",
    "client_phone": "+7 (902) 830-44-55",
    "client_contact": "+7 (902) 830-44-55",
    "channel": "telegram",
    "items": [
      {
        "id": "item-gen-356",
        "stone_type": "Гранит Absolute Black (Индия)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 37200,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Гранит Absolute Black (Индия)",
    "stone_type": "Гранит Absolute Black (Индия)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 37200,
    "prepayment_amount": 18600,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283565",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Иван Морозов",
    "customer_id": "cust-ext-12",
    "delivery_city": "Пермь",
    "delivery_address": "г. Пермь, ул. Ленина 76, кв. 23",
    "created_at": "16.05.2026 15:00"
  },
  {
    "id": "ord-gen-357",
    "order_number": "КР-357",
    "client_name": "Денис Матвеев",
    "client_phone": "+7 (908) 210-99-88",
    "client_contact": "+7 (908) 210-99-88",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-gen-357",
        "stone_type": "Гранит Габбро-Диабаз (Карелия)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 37900,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Гранит Габбро-Диабаз (Карелия)",
    "stone_type": "Гранит Габбро-Диабаз (Карелия)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 37900,
    "prepayment_amount": 18950,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283575",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Павел Семенов",
    "customer_id": "cust-ext-13",
    "delivery_city": "Красноярск",
    "delivery_address": "г. Красноярск, ул. Мира 91, кв. 37",
    "created_at": "19.06.2026 15:00"
  },
  {
    "id": "ord-gen-358",
    "order_number": "КР-358",
    "client_name": "Валентина Чернова",
    "client_phone": "+7 (916) 777-88-99",
    "client_contact": "+7 (916) 777-88-99",
    "channel": "call",
    "items": [
      {
        "id": "item-gen-358",
        "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 38600,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Оникс Verde с LED-подсветкой (Иран)",
    "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 38600,
    "prepayment_amount": 19300,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283585",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-ext-14",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Мичуринский пр-т 16, кв. 60",
    "created_at": "22.07.2026 15:00"
  },
  {
    "id": "ord-gen-359",
    "order_number": "КР-359",
    "client_name": "Григорий Лисицын",
    "client_phone": "+7 (904) 810-22-33",
    "client_contact": "+7 (904) 810-22-33",
    "channel": "avito",
    "items": [
      {
        "id": "item-gen-359",
        "stone_type": "Оникс Miele медовый (Турция)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 39300,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Оникс Miele медовый (Турция)",
    "stone_type": "Оникс Miele медовый (Турция)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 39300,
    "prepayment_amount": 19650,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283595",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Сергей Волков",
    "customer_id": "cust-ext-15",
    "delivery_city": "Челябинск",
    "delivery_address": "г. Челябинск, пр-т Ленина 55, кв. 82",
    "created_at": "25.08.2026 15:00"
  },
  {
    "id": "ord-gen-360",
    "order_number": "КР-360",
    "client_name": "Борис Карпов",
    "client_phone": "+7 (902) 330-14-22",
    "client_contact": "+7 (902) 330-14-22",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-gen-360",
        "stone_type": "Кварцевый агломерат Pure White",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 12000,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Кварцевый агломерат Pure White",
    "stone_type": "Кварцевый агломерат Pure White",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 12000,
    "prepayment_amount": 6000,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283605",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Иван Морозов",
    "customer_id": "cust-ext-16",
    "delivery_city": "Ярославль",
    "delivery_address": "г. Ярославль, ул. Свободы 42, кв. 9",
    "created_at": "01.03.2026 15:00"
  },
  {
    "id": "ord-gen-361",
    "order_number": "КР-361",
    "client_name": "Алина Федорова",
    "client_phone": "+7 (914) 700-11-55",
    "client_contact": "+7 (914) 700-11-55",
    "channel": "telegram",
    "items": [
      {
        "id": "item-gen-361",
        "stone_type": "Кварцевый агломерат Calacatta Extra",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 12700,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Кварцевый агломерат Calacatta Extra",
    "stone_type": "Кварцевый агломерат Calacatta Extra",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 12700,
    "prepayment_amount": 6350,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283615",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Павел Семенов",
    "customer_id": "cust-ext-17",
    "delivery_city": "Владивосток",
    "delivery_address": "г. Владивосток, Океанский пр-т 69, кв. 11",
    "created_at": "04.04.2026 15:00"
  },
  {
    "id": "ord-gen-362",
    "order_number": "КР-362",
    "client_name": "Максим Исаев",
    "client_phone": "+7 (902) 360-77-88",
    "client_contact": "+7 (902) 360-77-88",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-gen-362",
        "stone_type": "Травертин Noce матовый (Турция)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 13400,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Травертин Noce матовый (Турция)",
    "stone_type": "Травертин Noce матовый (Турция)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 13400,
    "prepayment_amount": 6700,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283625",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-ext-18",
    "delivery_city": "Волгоград",
    "delivery_address": "г. Волгоград, пр-т Ленина 41, кв. 33",
    "created_at": "07.05.2026 15:00"
  },
  {
    "id": "ord-gen-363",
    "order_number": "КР-363",
    "client_name": "Полина Козлова",
    "client_phone": "+7 (926) 990-12-12",
    "client_contact": "+7 (926) 990-12-12",
    "channel": "call",
    "items": [
      {
        "id": "item-gen-363",
        "stone_type": "Акриловый камень Corian Glacier",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 14100,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Акриловый камень Corian Glacier",
    "stone_type": "Акриловый камень Corian Glacier",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 14100,
    "prepayment_amount": 7050,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283635",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Сергей Волков",
    "customer_id": "cust-ext-19",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Ходынский б-р 19, кв. 240",
    "created_at": "10.06.2026 15:00"
  },
  {
    "id": "ord-gen-364",
    "order_number": "КР-364",
    "client_name": "Ярослав Новиков",
    "client_phone": "+7 (987) 410-55-66",
    "client_contact": "+7 (987) 410-55-66",
    "channel": "avito",
    "items": [
      {
        "id": "item-gen-364",
        "stone_type": "Мрамор Calacatta Gold (Италия)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 14800,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Мрамор Calacatta Gold (Италия)",
    "stone_type": "Мрамор Calacatta Gold (Италия)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 14800,
    "prepayment_amount": 7400,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283645",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Иван Морозов",
    "customer_id": "cust-ext-20",
    "delivery_city": "Казань",
    "delivery_address": "г. Казань, ул. Баумана 29, кв. 4",
    "created_at": "13.07.2026 15:00"
  },
  {
    "id": "ord-gen-365",
    "order_number": "КР-365",
    "client_name": "Станислав Баранов",
    "client_phone": "+7 (921) 940-33-22",
    "client_contact": "+7 (921) 940-33-22",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-gen-365",
        "stone_type": "Мрамор Bianco Carrara (Италия)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 15500,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Мрамор Bianco Carrara (Италия)",
    "stone_type": "Мрамор Bianco Carrara (Италия)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 15500,
    "prepayment_amount": 7750,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283655",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Павел Семенов",
    "customer_id": "cust-ext-21",
    "delivery_city": "Санкт-Петербург",
    "delivery_address": "г. Санкт-Петербург, Московский пр-т 180, кв. 15",
    "created_at": "16.08.2026 15:00"
  },
  {
    "id": "ord-gen-366",
    "order_number": "КР-366",
    "client_name": "Ангелина Савина",
    "client_phone": "+7 (905) 710-88-11",
    "client_contact": "+7 (905) 710-88-11",
    "channel": "telegram",
    "items": [
      {
        "id": "item-gen-366",
        "stone_type": "Мрамор Nero Marquina (Испания)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 16200,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Мрамор Nero Marquina (Испания)",
    "stone_type": "Мрамор Nero Marquina (Испания)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 16200,
    "prepayment_amount": 8100,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283665",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-ext-22",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, ул. Вавилова 69к1, кв. 92",
    "created_at": "19.03.2026 15:00"
  },
  {
    "id": "ord-gen-367",
    "order_number": "КР-367",
    "client_name": "Тимофей Щербаков",
    "client_phone": "+7 (903) 340-99-00",
    "client_contact": "+7 (903) 340-99-00",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-gen-367",
        "stone_type": "Мрамор Crema Marfil (Испания)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 16900,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Мрамор Crema Marfil (Испания)",
    "stone_type": "Мрамор Crema Marfil (Испания)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 16900,
    "prepayment_amount": 8450,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283675",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Сергей Волков",
    "customer_id": "cust-ext-23",
    "delivery_city": "Саратов",
    "delivery_address": "г. Саратов, ул. Чапаева 68, кв. 17",
    "created_at": "22.04.2026 15:00"
  },
  {
    "id": "ord-gen-368",
    "order_number": "КР-368",
    "client_name": "Вероника Климова",
    "client_phone": "+7 (902) 510-44-33",
    "client_contact": "+7 (902) 510-44-33",
    "channel": "call",
    "items": [
      {
        "id": "item-gen-368",
        "stone_type": "Мрамор Bidasar Green (Индия)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 17600,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Мрамор Bidasar Green (Индия)",
    "stone_type": "Мрамор Bidasar Green (Индия)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 17600,
    "prepayment_amount": 8800,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283685",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Иван Морозов",
    "customer_id": "cust-ext-24",
    "delivery_city": "Иркутск",
    "delivery_address": "г. Иркутск, ул. Карла Маркса 25, кв. 8",
    "created_at": "25.05.2026 15:00"
  },
  {
    "id": "ord-gen-369",
    "order_number": "КР-369",
    "client_name": "Аркадий Соловьев",
    "client_phone": "+7 (916) 330-55-77",
    "client_contact": "+7 (916) 330-55-77",
    "channel": "avito",
    "items": [
      {
        "id": "item-gen-369",
        "stone_type": "Гранит Absolute Black (Индия)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 18300,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Гранит Absolute Black (Индия)",
    "stone_type": "Гранит Absolute Black (Индия)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 18300,
    "prepayment_amount": 9150,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283695",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Павел Семенов",
    "customer_id": "cust-ext-25",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Осенний б-р 12к1, кв. 51",
    "created_at": "01.06.2026 15:00"
  },
  {
    "id": "ord-gen-370",
    "order_number": "КР-370",
    "client_name": "Екатерина Воронина",
    "client_phone": "+7 (916) 450-12-89",
    "client_contact": "+7 (916) 450-12-89",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-gen-370",
        "stone_type": "Гранит Габбро-Диабаз (Карелия)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 19000,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Гранит Габбро-Диабаз (Карелия)",
    "stone_type": "Гранит Габбро-Диабаз (Карелия)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 19000,
    "prepayment_amount": 9500,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283705",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-1",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, ул. Мосфильмовская 70к2, кв. 115",
    "created_at": "04.07.2026 15:00"
  },
  {
    "id": "ord-gen-371",
    "order_number": "КР-371",
    "client_name": "Диана Соколова",
    "client_phone": "+7 (926) 883-91-20",
    "client_contact": "+7 (926) 883-91-20",
    "channel": "telegram",
    "items": [
      {
        "id": "item-gen-371",
        "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 19700,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Оникс Verde с LED-подсветкой (Иран)",
    "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 19700,
    "prepayment_amount": 9850,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283715",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Сергей Волков",
    "customer_id": "cust-2",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Кутузовский пр-т 36с4, офис 208",
    "created_at": "07.08.2026 15:00"
  },
  {
    "id": "ord-gen-372",
    "order_number": "КР-372",
    "client_name": "Артем Демидов",
    "client_phone": "+7 (981) 712-33-40",
    "client_contact": "+7 (981) 712-33-40",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-gen-372",
        "stone_type": "Оникс Miele медовый (Турция)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 20400,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Оникс Miele медовый (Турция)",
    "stone_type": "Оникс Miele медовый (Турция)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 20400,
    "prepayment_amount": 10200,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283725",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Иван Морозов",
    "customer_id": "cust-3",
    "delivery_city": "Санкт-Петербург",
    "delivery_address": "г. Санкт-Петербург, Приморский пр-т 137к1, кв. 42",
    "created_at": "10.03.2026 15:00"
  },
  {
    "id": "ord-gen-373",
    "order_number": "КР-373",
    "client_name": "Михаил Белов",
    "client_phone": "+7 (987) 229-84-11",
    "client_contact": "+7 (987) 229-84-11",
    "channel": "call",
    "items": [
      {
        "id": "item-gen-373",
        "stone_type": "Кварцевый агломерат Pure White",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 21100,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Кварцевый агломерат Pure White",
    "stone_type": "Кварцевый агломерат Pure White",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 21100,
    "prepayment_amount": 10550,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283735",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Павел Семенов",
    "customer_id": "cust-4",
    "delivery_city": "Казань",
    "delivery_address": "г. Казань, ул. Чистопольская 86, кв. 73",
    "created_at": "13.04.2026 15:00"
  },
  {
    "id": "ord-gen-374",
    "order_number": "КР-374",
    "client_name": "Сергей Кузнецов",
    "client_phone": "+7 (913) 915-00-66",
    "client_contact": "+7 (913) 915-00-66",
    "channel": "avito",
    "items": [
      {
        "id": "item-gen-374",
        "stone_type": "Кварцевый агломерат Calacatta Extra",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 21800,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Кварцевый агломерат Calacatta Extra",
    "stone_type": "Кварцевый агломерат Calacatta Extra",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 21800,
    "prepayment_amount": 10900,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283745",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-5",
    "delivery_city": "Новосибирск",
    "delivery_address": "г. Новосибирск, Красный пр-т 179, кв. 51",
    "created_at": "16.05.2026 15:00"
  },
  {
    "id": "ord-gen-375",
    "order_number": "КР-375",
    "client_name": "Ольга Романова",
    "client_phone": "+7 (922) 104-55-90",
    "client_contact": "+7 (922) 104-55-90",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-gen-375",
        "stone_type": "Травертин Noce матовый (Турция)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 22500,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Травертин Noce матовый (Турция)",
    "stone_type": "Травертин Noce матовый (Турция)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 22500,
    "prepayment_amount": 11250,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283755",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Сергей Волков",
    "customer_id": "cust-6",
    "delivery_city": "Екатеринбург",
    "delivery_address": "г. Екатеринбург, ул. Радищева 33, кв. 104",
    "created_at": "19.06.2026 15:00"
  },
  {
    "id": "ord-gen-376",
    "order_number": "КР-376",
    "client_name": "Игорь Васильев",
    "client_phone": "+7 (918) 441-28-90",
    "client_contact": "+7 (918) 441-28-90",
    "channel": "telegram",
    "items": [
      {
        "id": "item-gen-376",
        "stone_type": "Акриловый камень Corian Glacier",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 23200,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Акриловый камень Corian Glacier",
    "stone_type": "Акриловый камень Corian Glacier",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 23200,
    "prepayment_amount": 11600,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283765",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Иван Морозов",
    "customer_id": "cust-7",
    "delivery_city": "Краснодар",
    "delivery_address": "г. Краснодар, ул. Кубанская Набережная 39, кв. 88",
    "created_at": "22.07.2026 15:00"
  },
  {
    "id": "ord-gen-377",
    "order_number": "КР-377",
    "client_name": "Алексей Смирнов",
    "client_phone": "+7 (903) 123-45-67",
    "client_contact": "",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-gen-377",
        "stone_type": "Мрамор Calacatta Gold (Италия)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 23900,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Мрамор Calacatta Gold (Италия)",
    "stone_type": "Мрамор Calacatta Gold (Италия)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 23900,
    "prepayment_amount": 11950,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283775",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Павел Семенов",
    "customer_id": "cust-alexey-ozon",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Ломоносовский пр-т 29к1, кв. 84",
    "created_at": "25.08.2026 15:00"
  },
  {
    "id": "ord-gen-378",
    "order_number": "КР-378",
    "client_name": "Алексей С.",
    "client_phone": "+7 (903) 771-44-12",
    "client_contact": "+7 (903) 771-44-12",
    "channel": "call",
    "items": [
      {
        "id": "item-gen-378",
        "stone_type": "Мрамор Bianco Carrara (Италия)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 24600,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Мрамор Bianco Carrara (Италия)",
    "stone_type": "Мрамор Bianco Carrara (Италия)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 24600,
    "prepayment_amount": 12300,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283785",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-alexey-site",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Ломоносовский пр-т 29к1, кв. 84",
    "created_at": "01.03.2026 15:00"
  },
  {
    "id": "ord-gen-379",
    "order_number": "КР-379",
    "client_name": "Дмитрий Морозов",
    "client_phone": "+7 (903) 123-45-67",
    "client_contact": "",
    "channel": "avito",
    "items": [
      {
        "id": "item-gen-379",
        "stone_type": "Мрамор Nero Marquina (Испания)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 25300,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Мрамор Nero Marquina (Испания)",
    "stone_type": "Мрамор Nero Marquina (Испания)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 25300,
    "prepayment_amount": 12650,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283795",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Сергей Волков",
    "customer_id": "cust-dmitry-ym",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, ул. Удальцова 46, кв. 19",
    "created_at": "04.04.2026 15:00"
  },
  {
    "id": "ord-gen-380",
    "order_number": "КР-380",
    "client_name": "Дмитрий М.",
    "client_phone": "+7 (925) 301-99-04",
    "client_contact": "+7 (925) 301-99-04",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-gen-380",
        "stone_type": "Мрамор Crema Marfil (Испания)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 26000,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Мрамор Crema Marfil (Испания)",
    "stone_type": "Мрамор Crema Marfil (Испания)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 26000,
    "prepayment_amount": 13000,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283805",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Иван Морозов",
    "customer_id": "cust-dmitry-call",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, ул. Удальцова 46, кв. 19",
    "created_at": "07.05.2026 15:00"
  },
  {
    "id": "ord-gen-381",
    "order_number": "КР-381",
    "client_name": "Студия «StoneDesign» (Ксения)",
    "client_phone": "+7 (903) 111-99-00",
    "client_contact": "+7 (903) 111-99-00",
    "channel": "telegram",
    "items": [
      {
        "id": "item-gen-381",
        "stone_type": "Мрамор Bidasar Green (Индия)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 26700,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Мрамор Bidasar Green (Индия)",
    "stone_type": "Мрамор Bidasar Green (Индия)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 26700,
    "prepayment_amount": 13350,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283815",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Павел Семенов",
    "customer_id": "cust-10",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Саввинская наб. 12с1",
    "created_at": "10.06.2026 15:00"
  },
  {
    "id": "ord-gen-382",
    "order_number": "КР-382",
    "client_name": "Павел Орлов",
    "client_phone": "+7 (916) 120-33-44",
    "client_contact": "+7 (916) 120-33-44",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-gen-382",
        "stone_type": "Гранит Absolute Black (Индия)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 27400,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Гранит Absolute Black (Индия)",
    "stone_type": "Гранит Absolute Black (Индия)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 27400,
    "prepayment_amount": 13700,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283825",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-ext-1",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, Ленинский пр-т 82, кв. 45",
    "created_at": "13.07.2026 15:00"
  },
  {
    "id": "ord-gen-383",
    "order_number": "КР-383",
    "client_name": "Наталья Захарова",
    "client_phone": "+7 (927) 601-99-12",
    "client_contact": "+7 (927) 601-99-12",
    "channel": "call",
    "items": [
      {
        "id": "item-gen-383",
        "stone_type": "Гранит Габбро-Диабаз (Карелия)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 28100,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Гранит Габбро-Диабаз (Карелия)",
    "stone_type": "Гранит Габбро-Диабаз (Карелия)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 28100,
    "prepayment_amount": 14050,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283835",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Сергей Волков",
    "customer_id": "cust-ext-2",
    "delivery_city": "Самара",
    "delivery_address": "г. Самара, Волжский пр-т 19, кв. 12",
    "created_at": "16.08.2026 15:00"
  },
  {
    "id": "ord-gen-384",
    "order_number": "КР-384",
    "client_name": "Константин Фролов",
    "client_phone": "+7 (904) 390-11-22",
    "client_contact": "+7 (904) 390-11-22",
    "channel": "avito",
    "items": [
      {
        "id": "item-gen-384",
        "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 28800,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Оникс Verde с LED-подсветкой (Иран)",
    "stone_type": "Оникс Verde с LED-подсветкой (Иран)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 28800,
    "prepayment_amount": 14400,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283845",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Иван Морозов",
    "customer_id": "cust-ext-3",
    "delivery_city": "Нижний Новгород",
    "delivery_address": "г. Н.Новгород, ул. Белинского 58, кв. 30",
    "created_at": "19.03.2026 15:00"
  },
  {
    "id": "ord-gen-385",
    "order_number": "КР-385",
    "client_name": "Елена Кравцова",
    "client_phone": "+7 (918) 200-88-77",
    "client_contact": "+7 (918) 200-88-77",
    "channel": "marketplace",
    "items": [
      {
        "id": "item-gen-385",
        "stone_type": "Оникс Miele медовый (Турция)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 29500,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Оникс Miele медовый (Турция)",
    "stone_type": "Оникс Miele медовый (Турция)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 29500,
    "prepayment_amount": 14750,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283855",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Павел Семенов",
    "customer_id": "cust-ext-4",
    "delivery_city": "Сочи",
    "delivery_address": "г. Сочи, Курортный пр-т 92, кв. 6",
    "created_at": "22.04.2026 15:00"
  },
  {
    "id": "ord-gen-386",
    "order_number": "КР-386",
    "client_name": "Андрей Мельников",
    "client_phone": "+7 (926) 345-67-89",
    "client_contact": "+7 (926) 345-67-89",
    "channel": "telegram",
    "items": [
      {
        "id": "item-gen-386",
        "stone_type": "Кварцевый агломерат Pure White",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 30200,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Кварцевый агломерат Pure White",
    "stone_type": "Кварцевый агломерат Pure White",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 30200,
    "prepayment_amount": 15100,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283865",
    "status": "completed",
    "accepted_by": "Алина",
    "polisher": "Алексей Кузнецов",
    "customer_id": "cust-ext-5",
    "delivery_city": "Москва",
    "delivery_address": "г. Москва, ул. Профсоюзная 104, кв. 77",
    "created_at": "25.05.2026 15:00"
  },
  {
    "id": "ord-gen-387",
    "order_number": "КР-387",
    "client_name": "Татьяна Гусева",
    "client_phone": "+7 (988) 512-34-56",
    "client_contact": "+7 (988) 512-34-56",
    "channel": "bitrix",
    "items": [
      {
        "id": "item-gen-387",
        "stone_type": "Кварцевый агломерат Calacatta Extra",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 30900,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Кварцевый агломерат Calacatta Extra",
    "stone_type": "Кварцевый агломерат Calacatta Extra",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 30900,
    "prepayment_amount": 15450,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283875",
    "status": "completed",
    "accepted_by": "Лера",
    "polisher": "Сергей Волков",
    "customer_id": "cust-ext-6",
    "delivery_city": "Ростов-на-Дону",
    "delivery_address": "г. Ростов-на-Дону, ул. Пушкинская 144, кв. 18",
    "created_at": "01.06.2026 15:00"
  },
  {
    "id": "ord-gen-388",
    "order_number": "КР-388",
    "client_name": "Илья Ковалев",
    "client_phone": "+7 (951) 850-22-33",
    "client_contact": "+7 (951) 850-22-33",
    "channel": "call",
    "items": [
      {
        "id": "item-gen-388",
        "stone_type": "Травертин Noce матовый (Турция)",
        "dimensions": "750х180х20 мм",
        "quantity": 1,
        "price": 31600,
        "description": "Снятие фаски 2 мм, защитная пропитка Akemi"
      }
    ],
    "product_description": "Полка каменная: Травертин Noce матовый (Турция)",
    "stone_type": "Травертин Noce матовый (Турция)",
    "dimensions": "750х180х20 мм",
    "notes": "Заказ выполнен по чертежу заказчика",
    "total_price": 31600,
    "prepayment_amount": 15800,
    "prepayment_received": true,
    "remaining_paid": true,
    "tracking_number": "1490283885",
    "status": "completed",
    "accepted_by": "Аня",
    "polisher": "Иван Морозов",
    "customer_id": "cust-ext-7",
    "delivery_city": "Воронеж",
    "delivery_address": "г. Воронеж, Московский пр-т 120, кв. 54",
    "created_at": "04.07.2026 15:00"
  }
];

// 3. Initial Chats
export const INITIAL_CHATS: MarketplaceChat[] = [
  {
    "id": "chat-ozon-1",
    "marketplace": "ozon",
    "buyer_name": "Екатерина Воронина",
    "buyer_phone": "+7 (916) 450-12-89",
    "buyer_city": "Москва",
    "customer_id": "cust-1",
    "linked_order_id": "ord-180",
    "linked_order_number": "КР-303",
    "product_title": "Полка из мрамора Calacatta Gold 60х15 см",
    "last_message": "Отлично, спасибо! Жду изготовление полочки.",
    "last_message_date": "08.09.2026 16:40",
    "unread_count": 0,
    "messages": [
      {
        "id": "m1",
        "sender": "buyer",
        "text": "Здравствуйте! Я уже заказывала у вас весной полочку в санузел. Теперь хочу точно такую же в душевую зону хаммама. Скрытый крепеж выдержит влажность?",
        "date": "08.09.2026 11:15"
      },
      {
        "id": "m2",
        "sender": "seller",
        "text": "Здравствуйте, Екатерина! Рады снова видеть вас! Да, все наши менсолодержатели из нержавеющей стали с антикоррозийным покрытием, а сам мрамор мы гидрофобизируем специальным составом Akemi для влажных зон.",
        "date": "08.09.2026 11:22"
      },
      {
        "id": "m3",
        "sender": "buyer",
        "text": "Прекрасно! Оформите мне, пожалуйста, еще одну полку 60х15 см с золотистыми прожилками, как в прошлый раз.",
        "date": "08.09.2026 11:30"
      },
      {
        "id": "m4",
        "sender": "seller",
        "text": "Заказ КР-303 сформирован и передан мастеру на распил! Срок готовности — 3 рабочих дня.",
        "date": "08.09.2026 11:45"
      },
      {
        "id": "m5",
        "sender": "buyer",
        "text": "Отлично, спасибо! Жду изготовление полочки.",
        "date": "08.09.2026 16:40"
      }
    ]
  },
  {
    "id": "chat-wb-1",
    "marketplace": "wildberries",
    "buyer_name": "Артем Демидов",
    "buyer_phone": "+7 (981) 712-33-40",
    "buyer_city": "Санкт-Петербург",
    "customer_id": "cust-3",
    "linked_order_id": "ord-185",
    "linked_order_number": "КР-305",
    "product_title": "Полка гранитная черная Габбро 80х20 см",
    "last_message": "Понял, спасибо! Жду подтверждения отправки.",
    "last_message_date": "10.09.2026 09:45",
    "unread_count": 1,
    "messages": [
      {
        "id": "w1",
        "sender": "buyer",
        "text": "Добрый день! Камень матовый или глянец? Водоотталкивающая пропитка уже нанесена?",
        "date": "09.09.2026 18:20"
      },
      {
        "id": "w2",
        "sender": "seller",
        "text": "Добрый день, Артем! Полировка зеркальная глубокая, по вашему желанию можем сделать лощение (сатин/матовый). Водоотталкивающая пропитка нанесена в 2 слоя.",
        "date": "09.09.2026 18:40"
      },
      {
        "id": "w3",
        "sender": "buyer",
        "text": "Сделайте сатин, пожалуйста! Длина нужна ровно 80 см под нишу.",
        "date": "10.09.2026 09:10"
      },
      {
        "id": "w4",
        "sender": "seller",
        "text": "Договорились, заказ КР-305 принят в работу с матовой шлифовкой.",
        "date": "10.09.2026 09:30"
      },
      {
        "id": "w5",
        "sender": "buyer",
        "text": "Понял, спасибо! Жду подтверждения отправки.",
        "date": "10.09.2026 09:45"
      }
    ]
  },
  {
    "id": "chat-ym-1",
    "marketplace": "yandex",
    "buyer_name": "Михаил Белов",
    "buyer_phone": "+7 (987) 229-84-11",
    "buyer_city": "Казань",
    "customer_id": "cust-4",
    "product_title": "Угловая полка из оникса Verde с LED подсветкой",
    "last_message": "Подскажите, блок питания 12В идет в комплекте?",
    "last_message_date": "09.09.2026 19:15",
    "unread_count": 1,
    "messages": [
      {
        "id": "y1",
        "sender": "buyer",
        "text": "Здравствуйте! Очень красивый оникс на фото. Просвечивает равномерно?",
        "date": "09.09.2026 18:50"
      },
      {
        "id": "y2",
        "sender": "seller",
        "text": "Здравствуйте, Михаил! Да, оникс полупрозрачный, толщина 20 мм с выборкой паза под светорассеиватель. Свечение мягкое и ровное.",
        "date": "09.09.2026 19:05"
      },
      {
        "id": "y3",
        "sender": "buyer",
        "text": "Подскажите, блок питания 12В идет в комплекте?",
        "date": "09.09.2026 19:15"
      }
    ]
  },
  {
    "id": "chat-ozon-lead-new",
    "marketplace": "ozon",
    "buyer_name": "Полина Козлова",
    "buyer_phone": "+7 (926) 990-12-12",
    "buyer_city": "Москва",
    "product_title": "Полка из бежевого мрамора Crema Marfil 80х18 см",
    "last_message": "Готова заказать 2 штуки, сделайте счет пожалуйста!",
    "last_message_date": "10.09.2026 11:05",
    "unread_count": 2,
    "messages": [
      {
        "id": "pk1",
        "sender": "buyer",
        "text": "Здравствуйте! Делаете ли вы полки 80х18 см из Crema Marfil? У нас плитка в ванной испанская такого же тона.",
        "date": "10.09.2026 10:45"
      },
      {
        "id": "pk2",
        "sender": "seller",
        "text": "Здравствуйте, Полина! Да, слэб Crema Marfil первого сорта у нас в цеху. Можем изготовить за 3 дня с полированным торцом.",
        "date": "10.09.2026 10:55"
      },
      {
        "id": "pk3",
        "sender": "buyer",
        "text": "Готова заказать 2 штуки, сделайте счет пожалуйста!",
        "date": "10.09.2026 11:05"
      }
    ]
  },
  {
    "id": "chat-extra-1",
    "marketplace": "wildberries",
    "buyer_name": "Мария Семенова",
    "product_title": "Полка из зеленого мрамора Bidasar Green",
    "last_message": "Подскажите точный вес полки? Выдержит ли гипсокартонная стена?",
    "last_message_date": "01.09.2026 10:20",
    "unread_count": 1,
    "messages": [
      {
        "id": "m-ex-0-1",
        "sender": "buyer",
        "text": "Подскажите точный вес полки? Выдержит ли гипсокартонная стена?",
        "date": "01.09.2026 10:20"
      }
    ]
  },
  {
    "id": "chat-extra-2",
    "marketplace": "ozon",
    "buyer_name": "Константин Волков",
    "product_title": "Гранитная полка 90х20 см для бокалов",
    "last_message": "Здравствуйте, можно сделать вырезы под ножки бокалов снизу?",
    "last_message_date": "02.09.2026 11:20",
    "unread_count": 0,
    "messages": [
      {
        "id": "m-ex-1-1",
        "sender": "buyer",
        "text": "Здравствуйте, можно сделать вырезы под ножки бокалов снизу?",
        "date": "02.09.2026 11:20"
      }
    ]
  },
  {
    "id": "chat-extra-3",
    "marketplace": "yandex",
    "buyer_name": "Ольга Смирнова",
    "product_title": "Полка из травертина Noce 60 см",
    "last_message": "Здравствуйте! Камень матовый? Поры заполнены мастикой?",
    "last_message_date": "03.09.2026 12:20",
    "unread_count": 0,
    "messages": [
      {
        "id": "m-ex-2-1",
        "sender": "buyer",
        "text": "Здравствуйте! Камень матовый? Поры заполнены мастикой?",
        "date": "03.09.2026 12:20"
      }
    ]
  },
  {
    "id": "chat-extra-4",
    "marketplace": "wildberries",
    "buyer_name": "Виталий Гришин",
    "product_title": "Полка для душевой из белого мрамора",
    "last_message": "Подскажите, крепеж идет в комплекте с дюбелями Fisher?",
    "last_message_date": "04.09.2026 13:20",
    "unread_count": 1,
    "messages": [
      {
        "id": "m-ex-3-1",
        "sender": "buyer",
        "text": "Подскажите, крепеж идет в комплекте с дюбелями Fisher?",
        "date": "04.09.2026 13:20"
      }
    ]
  },
  {
    "id": "chat-extra-5",
    "marketplace": "ozon",
    "buyer_name": "Юлия Рогова",
    "product_title": "Полка из оникса медового Miele",
    "last_message": "Добрый день! Хочу сделать подсветку от выключателя в ванной, провод куда выводить?",
    "last_message_date": "05.09.2026 14:20",
    "unread_count": 0,
    "messages": [
      {
        "id": "m-ex-4-1",
        "sender": "buyer",
        "text": "Добрый день! Хочу сделать подсветку от выключателя в ванной, провод куда выводить?",
        "date": "05.09.2026 14:20"
      }
    ]
  },
  {
    "id": "chat-extra-6",
    "marketplace": "yandex",
    "buyer_name": "Андрей Самойлов",
    "product_title": "Комплект полок из черного гранита 3 шт",
    "last_message": "Здравствуйте! Есть ли скидка при заказе комплекта из 3 полок?",
    "last_message_date": "06.09.2026 15:20",
    "unread_count": 0,
    "messages": [
      {
        "id": "m-ex-5-1",
        "sender": "buyer",
        "text": "Здравствуйте! Есть ли скидка при заказе комплекта из 3 полок?",
        "date": "06.09.2026 15:20"
      }
    ]
  },
  {
    "id": "chat-extra-7",
    "marketplace": "ozon",
    "buyer_name": "Татьяна Лукина",
    "product_title": "Полка из белого кварца Calacatta Gold",
    "last_message": "А можно заказать нестандартную длину 67 см ровно по плитке?",
    "last_message_date": "07.09.2026 16:20",
    "unread_count": 1,
    "messages": [
      {
        "id": "m-ex-6-1",
        "sender": "buyer",
        "text": "А можно заказать нестандартную длину 67 см ровно по плитке?",
        "date": "07.09.2026 16:20"
      }
    ]
  },
  {
    "id": "chat-extra-8",
    "marketplace": "wildberries",
    "buyer_name": "Сергей Федотов",
    "product_title": "Консольная полка из мрамора 100 см",
    "last_message": "Какой вылет у скрытого кронштейна? 150 мм выдержит?",
    "last_message_date": "08.09.2026 17:20",
    "unread_count": 0,
    "messages": [
      {
        "id": "m-ex-7-1",
        "sender": "buyer",
        "text": "Какой вылет у скрытого кронштейна? 150 мм выдержит?",
        "date": "08.09.2026 17:20"
      }
    ]
  },
  {
    "id": "chat-extra-9",
    "marketplace": "yandex",
    "buyer_name": "Наталья Власова",
    "product_title": "Полка угловая радиусная из камня",
    "last_message": "Делаете ли скругленный передний угол радиусом R50?",
    "last_message_date": "01.09.2026 18:20",
    "unread_count": 0,
    "messages": [
      {
        "id": "m-ex-8-1",
        "sender": "buyer",
        "text": "Делаете ли скругленный передний угол радиусом R50?",
        "date": "01.09.2026 18:20"
      }
    ]
  },
  {
    "id": "chat-extra-10",
    "marketplace": "ozon",
    "buyer_name": "Игорь Панин",
    "product_title": "Полка из итальянского мрамора Bianco Carrara",
    "last_message": "Здравствуйте, рисунок прожилок можно согласовать по фото до распила?",
    "last_message_date": "02.09.2026 19:20",
    "unread_count": 1,
    "messages": [
      {
        "id": "m-ex-9-1",
        "sender": "buyer",
        "text": "Здравствуйте, рисунок прожилок можно согласовать по фото до распила?",
        "date": "02.09.2026 19:20"
      }
    ]
  },
  {
    "id": "chat-extra-11",
    "marketplace": "wildberries",
    "buyer_name": "Елена Архипова",
    "product_title": "Полка в баню и сауну из талькохлорита",
    "last_message": "Подскажите, выдерживает ли камень перепады температуры до 90 градусов?",
    "last_message_date": "03.09.2026 110:20",
    "unread_count": 0,
    "messages": [
      {
        "id": "m-ex-10-1",
        "sender": "buyer",
        "text": "Подскажите, выдерживает ли камень перепады температуры до 90 градусов?",
        "date": "03.09.2026 110:20"
      }
    ]
  },
  {
    "id": "chat-extra-12",
    "marketplace": "ozon",
    "buyer_name": "Дмитрий Зуев",
    "product_title": "Полка из черного кварца с золотыми жилами",
    "last_message": "Добрый день! Доставка в Сочи СДЭКом сколько по времени займет?",
    "last_message_date": "04.09.2026 111:20",
    "unread_count": 0,
    "messages": [
      {
        "id": "m-ex-11-1",
        "sender": "buyer",
        "text": "Добрый день! Доставка в Сочи СДЭКом сколько по времени займет?",
        "date": "04.09.2026 111:20"
      }
    ]
  }
];

// 4. Initial Deduplication Suggestions
export const INITIAL_MERGE_SUGGESTIONS: CustomerMergeSuggestion[] = [
  {
    "id": "merge-sugg-1",
    "primaryCustomerId": "cust-alexey-ozon",
    "candidateCustomerId": "cust-alexey-site",
    "matchType": "address",
    "matchReason": "Полное совпадение адреса доставки: «г. Москва, Ломоносовский пр-т 29к1, кв. 84». Предыдущий заказ на Ozon (КР-308), новый заказ через Сайт (КР-309).",
    "confidence": "high",
    "created_at": "29.08.2026 14:15"
  },
  {
    "id": "merge-sugg-2",
    "primaryCustomerId": "cust-dmitry-ym",
    "candidateCustomerId": "cust-dmitry-call",
    "matchType": "address",
    "matchReason": "Совпадение адреса доставки: «г. Москва, ул. Удальцова 46, кв. 19» и схожее имя (Дмитрий Морозов с Яндекс.Маркета и Дмитрий М. по телефону).",
    "confidence": "high",
    "created_at": "07.09.2026 11:20"
  },
  {
    "id": "merge-sugg-3",
    "primaryCustomerId": "cust-4",
    "candidateCustomerId": "cust-ext-20",
    "matchType": "name_city",
    "matchReason": "Совпадение города Казань и фамилии в новом обращении через Telegram.",
    "confidence": "medium",
    "created_at": "09.09.2026 16:30"
  }
];

// 5. Initial Tracking
export const INITIAL_TRACKING: TrackingItem[] = [
  {
    id: 'track-1',
    tracking_number: '1489023033',
    order_id: 'ord-180',
    order_number: 'КР-303',
    recipient_name: 'Екатерина Воронина',
    destination_city: 'Москва',
    label: 'СДЭК До двери',
    status: 'in_transit',
    estimated_date: '12.09.2026',
    history: [
      { date: '08.09.2026 18:00', status: 'Принят в ПВЗ отправителя', city: 'Москва', description: 'Груз упакован в жесткий защитный короб' },
      { date: '09.09.2026 04:30', status: 'В пути', city: 'Москва СЦ', description: 'Сортировочный центр Домодедово' }
    ]
  },
  {
    id: 'track-2',
    tracking_number: '1489023053',
    order_id: 'ord-184',
    order_number: 'КР-312',
    recipient_name: 'Студия «StoneDesign»',
    destination_city: 'Москва',
    label: 'СДЭК Экспресс',
    status: 'sent',
    estimated_date: '11.09.2026',
    history: [
      { date: '09.09.2026 17:15', status: 'Создан заказ в СДЭК', city: 'Москва', description: 'Ожидает передачи курьеру' }
    ]
  },
  {
    id: 'track-3',
    tracking_number: '1489023011',
    order_id: 'ord-145',
    order_number: 'КР-308',
    recipient_name: 'Алексей Смирнов',
    destination_city: 'Москва',
    label: 'СДЭК ПВЗ',
    status: 'delivered',
    estimated_date: '20.06.2026',
    history: [
      { date: '20.06.2026 14:10', status: 'Вручен получателю', city: 'Москва', description: 'Успешно выдан в ПВЗ Ломоносовский' }
    ]
  }
];

// 6. Initial Reviews
export const INITIAL_REVIEWS: MarketplaceReview[] = [
  {
    id: 'rev-1',
    marketplace: 'ozon',
    product_name: 'Полка из мрамора Calacatta Gold 60х15 см',
    author: 'Елена К.',
    rating: 5,
    text: 'Полка просто произведение искусства! Настоящий цельный мрамор, красивейшие прожилки. Скрытый крепеж держит намертво. Упакована была в деревянный ящик с пенопластом, доехала идеально.',
    pros: 'Натуральный камень, идеальная фаска и полировка, прочный крепеж',
    cons: 'Тяжелая (около 5 кг), крепить надо строго на надежные дюбели',
    review_date: '02.09.2026',
    is_answered: true,
    reply_text: 'Елена, благодарим вас за высокую оценку! Мы вручную отбираем каждый слэб и полируем фаски. Пусть полочка радует вас долгие годы!',
  },
  {
    id: 'rev-2',
    marketplace: 'wildberries',
    product_name: 'Полка гранитная черная Габбро 80х20 см',
    author: 'Максим Д.',
    rating: 5,
    text: 'Брал в зону душевой. Гранит идеально ровный, полировка как зеркало. Вода скатывается каплями, пропитка работает на ура.',
    pros: 'Глубокий черный цвет, защита от воды, точная геометрия',
    review_date: '05.09.2026',
    is_answered: true,
    reply_text: 'Максим, спасибо за подробный отзыв! Гранит Габбро — один из самых прочных камней для влажных зон. Приятного пользования!',
  },
  {
    id: 'rev-3',
    marketplace: 'yandex',
    product_name: 'Угловая полка из оникса Verde 25х25 см',
    author: 'Ольга В.',
    rating: 5,
    text: 'Очень нежный зеленый оникс! Сделали подсветку снизу — в полумраке ванной смотрится просто волшебно.',
    pros: 'Просвечивающийся природный рисунок, эксклюзивный вид',
    review_date: '09.09.2026',
    is_answered: false,
  }
];

// 7. Initial Questions
export const INITIAL_QUESTIONS: MarketplaceQuestion[] = [
  {
    id: 'q-1',
    marketplace: 'ozon',
    product_name: 'Полка из мрамора Bianco Carrara 60х15 см',
    author: 'Дмитрий С.',
    question_text: 'Добрый день! Подскажите, идет ли в комплекте крепеж для стены из керамогранита?',
    question_date: '10.09.2026',
    is_answered: false,
  },
  {
    id: 'q-2',
    marketplace: 'wildberries',
    product_name: 'Полка угловая из гранита 30х30 см',
    author: 'Анна М.',
    question_text: 'Здравствуйте! Можно ли заказать такую полку с вырезом под душевую трубку?',
    question_date: '09.09.2026',
    is_answered: true,
    answer_text: 'Здравствуйте, Анна! Да, мы выполняем гидроабразивные технологические вырезы любого диаметра под трубы. Свяжитесь с нами в чате для согласования чертежа.',
  }
];

// 8. Initial Slabs
export const INITIAL_SLABS: StoneSlab[] = [
  {
    id: 'slab-1',
    name: 'Слэб Calacatta Gold Extra',
    category: 'marble',
    origin: 'Италия, Каррара',
    dimensions: '2800х1600х20 мм',
    length_mm: 2800,
    width_mm: 1600,
    thickness_mm: 20,
    area_m2: 4.48,
    quantity: 3,
    is_offcut: false,
    price_per_m2: 32000,
    location: 'Стеллаж A-1',
    status: 'in_stock',
    notes: 'Премиальный белый мрамор с выраженными золотистыми и серыми прожилками',
    created_at: '01.03.2026',
  },
  {
    id: 'slab-2',
    name: 'Слэб Nero Marquina',
    category: 'marble',
    origin: 'Испания',
    dimensions: '2600х1500х20 мм',
    length_mm: 2600,
    width_mm: 1500,
    thickness_mm: 20,
    area_m2: 3.90,
    quantity: 2,
    is_offcut: false,
    price_per_m2: 26500,
    location: 'Стеллаж A-3',
    status: 'in_stock',
    notes: 'Глубокий черный фон с тонкими белыми кальцитовыми нитями',
    created_at: '15.03.2026',
  },
  {
    id: 'slab-3',
    name: 'Деловой обрезок Оникс Verde Green',
    category: 'onyx',
    origin: 'Иран',
    dimensions: '1100х450х20 мм',
    length_mm: 1100,
    width_mm: 450,
    thickness_mm: 20,
    area_m2: 0.50,
    quantity: 4,
    is_offcut: true,
    price_per_m2: 45000,
    location: 'Зона обрезков C-2',
    status: 'in_stock',
    notes: 'Отличный остаток под 3-4 угловые полки с подсветкой',
    created_at: '20.04.2026',
  }
];

export const dataStore = {
  // --- USERS ---
  getCurrentUser(): UserProfile {
    return getStorage<UserProfile>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },
  setCurrentUser(user: UserProfile): void {
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
  },
  getUsers(): UserProfile[] {
    return getStorage<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  // --- ORDERS ---
  getOrders(): Order[] {
    return getStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },
  saveOrder(orderData: Partial<Order> & { id?: string }): Order {
    const list = this.getOrders();
    const now = new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    // Check/link Customer automatically
    let linkedCustomer: Customer | undefined;
    if (orderData.customer_id) {
      linkedCustomer = this.getCustomerById(orderData.customer_id);
    } else if (orderData.client_name) {
      linkedCustomer = this.findOrCreateCustomer(orderData);
      orderData.customer_id = linkedCustomer.id;
    }

    if (orderData.id) {
      const idx = list.findIndex(o => o.id === orderData.id);
      if (idx !== -1) {
        const updated: Order = {
          ...list[idx],
          ...orderData,
          updated_at: now,
        } as Order;
        list[idx] = updated;
        setStorage(STORAGE_KEYS.ORDERS, list);
        if (linkedCustomer) this.syncCustomerStats(linkedCustomer.id);
        if (updated.polisher) this.syncOrderToPolisherSalary(updated);
        return updated;
      }
    }

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      order_number: orderData.order_number || ('КР-' + (list.length + 301)),
      client_name: orderData.client_name || 'Клиент',
      client_phone: orderData.client_phone || '',
      client_contact: orderData.client_contact || orderData.client_phone || '',
      channel: orderData.channel || 'telegram',
      items: orderData.items || [],
      product_description: orderData.product_description || 'Полка каменная',
      stone_type: orderData.stone_type || 'Мрамор',
      dimensions: orderData.dimensions || '600х150х20 мм',
      notes: orderData.notes || '',
      total_price: Number(orderData.total_price) || 0,
      prepayment_amount: Number(orderData.prepayment_amount) || 0,
      prepayment_received: Boolean(orderData.prepayment_received),
      remaining_paid: Boolean(orderData.remaining_paid),
      tracking_number: orderData.tracking_number,
      status: orderData.status || 'new',
      accepted_by: orderData.accepted_by || 'Менеджер',
      polisher: orderData.polisher,
      photos: orderData.photos || [],
      customer_id: linkedCustomer?.id,
      chat_id: orderData.chat_id,
      chat_marketplace: orderData.chat_marketplace,
      delivery_city: orderData.delivery_city,
      delivery_address: orderData.delivery_address,
      created_at: orderData.created_at || now,
      updated_at: now,
    };

    list.unshift(newOrder);
    setStorage(STORAGE_KEYS.ORDERS, list);

    if (linkedCustomer) {
      this.syncCustomerStats(linkedCustomer.id);
    }

    if (newOrder.polisher) {
      this.syncOrderToPolisherSalary(newOrder);
    }

    // If created from a chat, link order in chat
    if (orderData.chat_id) {
      this.linkChatToOrder(orderData.chat_id, newOrder.id, newOrder.order_number);
    }

    return newOrder;
  },

  deleteOrder(id: string): void {
    const list = this.getOrders().filter(o => o.id !== id);
    setStorage(STORAGE_KEYS.ORDERS, list);
  },

  updateOrderStatus(id: string, status: Order['status']): Order | undefined {
    const list = this.getOrders();
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    list[idx].status = status;
    list[idx].updated_at = new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    setStorage(STORAGE_KEYS.ORDERS, list);
    return list[idx];
  },

  // --- CUSTOMERS & CRM ---
  getCustomers(): Customer[] {
    return getStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },

  saveCustomers(customers: Customer[]): void {
    setStorage(STORAGE_KEYS.CUSTOMERS, customers);
  },

  getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find(c => c.id === id);
  },

  saveCustomer(custData: Partial<Customer> & { id?: string }): Customer {
    const list = this.getCustomers();
    const norm = normalizePhone(custData.phone);

    if (custData.id) {
      const idx = list.findIndex(c => c.id === custData.id);
      if (idx !== -1) {
        const updated: Customer = {
          ...list[idx],
          ...custData,
          normalized_phone: norm || list[idx].normalized_phone,
        } as Customer;
        list[idx] = updated;
        this.saveCustomers(list);
        return updated;
      }
    }

    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      name: custData.name || 'Клиент',
      phone: custData.phone || '',
      normalized_phone: norm,
      email: custData.email,
      city: custData.city,
      address: custData.address,
      orders_count: custData.orders_count || 1,
      total_spent: custData.total_spent || 0,
      first_order_date: custData.first_order_date || new Date().toLocaleDateString('ru-RU'),
      last_order_date: custData.last_order_date || new Date().toLocaleDateString('ru-RU'),
      loyalty_tier: custData.loyalty_tier || 'new',
      channels: custData.channels || ['call'],
      channel_identities: custData.channel_identities || [],
      notes: custData.notes || '',
      tags: custData.tags || ['Новый'],
      linked_order_ids: custData.linked_order_ids || [],
      linked_chat_ids: custData.linked_chat_ids || [],
    };
    list.unshift(newCust);
    this.saveCustomers(list);
    return newCust;
  },

  // Automatic match by phone / email / channel ID
  findOrCreateCustomer(order: Partial<Order>): Customer {
    const list = this.getCustomers();
    const orderPhone = normalizePhone(order.client_phone || order.client_contact);
    const orderName = (order.client_name || '').trim().toLowerCase();

    // 1. Exact phone match (Automatic unification)
    if (orderPhone) {
      const byPhone = list.find(c => c.normalized_phone && c.normalized_phone === orderPhone);
      if (byPhone) {
        if (order.channel && !byPhone.channels.includes(order.channel)) {
          byPhone.channels.push(order.channel);
        }
        if (order.delivery_city && !byPhone.city) byPhone.city = order.delivery_city;
        if (order.delivery_address && !byPhone.address) byPhone.address = order.delivery_address;
        this.saveCustomers(list);
        return byPhone;
      }
    }

    // 2. Exact name + city match
    if (orderName && order.delivery_city) {
      const byNameCity = list.find(c => c.name.toLowerCase() === orderName && c.city?.toLowerCase() === order.delivery_city?.toLowerCase());
      if (byNameCity) {
        return byNameCity;
      }
    }

    // 3. Create new customer
    const newCustomer = this.saveCustomer({
      name: order.client_name || 'Клиент',
      phone: order.client_phone,
      city: order.delivery_city,
      address: order.delivery_address,
      channels: order.channel ? [order.channel] : ['telegram'],
      total_spent: order.total_price || 0,
      orders_count: 1,
      loyalty_tier: 'new',
      tags: ['Новый клиент'],
    });

    return newCustomer;
  },

  syncCustomerStats(customerId: string): void {
    const customers = this.getCustomers();
    const orders = this.getOrders();
    const custIdx = customers.findIndex(c => c.id === customerId);
    if (custIdx === -1) return;

    const custOrders = orders.filter(o => o.customer_id === customerId);
    const totalSpent = custOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
    const count = custOrders.length;

    let tier: LoyaltyTier = 'new';
    if (count >= 4 || totalSpent >= 100000) tier = 'vip';
    else if (count >= 2) tier = 'repeat';
    if (customers[custIdx].tags?.includes('Дизайнер')) tier = 'designer';

    customers[custIdx].orders_count = count;
    customers[custIdx].total_spent = totalSpent;
    customers[custIdx].loyalty_tier = tier;
    customers[custIdx].linked_order_ids = custOrders.map(o => o.id);

    this.saveCustomers(customers);
  },

  // --- DEDUPLICATION ENGINE ---
  getMergeSuggestions(): CustomerMergeSuggestion[] {
    return getStorage<CustomerMergeSuggestion[]>(STORAGE_KEYS.MERGE_SUGGESTIONS, INITIAL_MERGE_SUGGESTIONS);
  },

  dismissMergeSuggestion(id: string): void {
    const list = this.getMergeSuggestions().filter(s => s.id !== id);
    setStorage(STORAGE_KEYS.MERGE_SUGGESTIONS, list);
  },

  mergeCustomers(primaryId: string, candidateId: string): void {
    const customers = this.getCustomers();
    const primaryIdx = customers.findIndex(c => c.id === primaryId);
    const candidateIdx = customers.findIndex(c => c.id === candidateId);
    if (primaryIdx === -1 || candidateIdx === -1) return;

    const primary = customers[primaryIdx];
    const candidate = customers[candidateIdx];

    if (!primary.phone && candidate.phone) primary.phone = candidate.phone;
    if (!primary.normalized_phone && candidate.normalized_phone) primary.normalized_phone = candidate.normalized_phone;
    if (!primary.email && candidate.email) primary.email = candidate.email;
    if (!primary.address && candidate.address) primary.address = candidate.address;
    if (!primary.city && candidate.city) primary.city = candidate.city;

    candidate.channels.forEach(ch => {
      if (!primary.channels.includes(ch)) primary.channels.push(ch);
    });

    if (candidate.channel_identities) {
      primary.channel_identities = [...(primary.channel_identities || []), ...candidate.channel_identities];
    }

    const allTags = new Set([...(primary.tags || []), ...(candidate.tags || [])]);
    allTags.add('Объединенный профиль');
    allTags.add('Постоянный');
    primary.tags = Array.from(allTags);

    const orders = this.getOrders();
    orders.forEach(o => {
      if (o.customer_id === candidateId) {
        o.customer_id = primaryId;
      }
    });
    setStorage(STORAGE_KEYS.ORDERS, orders);

    const chats = this.getChats();
    chats.forEach(ch => {
      if (ch.customer_id === candidateId) {
        ch.customer_id = primaryId;
      }
    });
    setStorage(STORAGE_KEYS.CHATS, chats);

    customers.splice(candidateIdx, 1);
    this.saveCustomers(customers);
    this.syncCustomerStats(primaryId);

    const suggestions = this.getMergeSuggestions().filter(
      s => !(s.primaryCustomerId === primaryId && s.candidateCustomerId === candidateId) &&
           !(s.primaryCustomerId === candidateId && s.candidateCustomerId === primaryId)
    );
    setStorage(STORAGE_KEYS.MERGE_SUGGESTIONS, suggestions);
  },

  // --- CHATS & MESSAGES ---
  getChats(): MarketplaceChat[] {
    return getStorage<MarketplaceChat[]>(STORAGE_KEYS.CHATS, INITIAL_CHATS);
  },

  addChatMessage(chatId: string, text: string, photos?: string[]): MarketplaceChat | undefined {
    const list = this.getChats();
    const idx = list.findIndex(c => c.id === chatId);
    if (idx === -1) return undefined;

    const msg = {
      id: 'm-' + Date.now(),
      sender: 'seller' as const,
      text,
      photos: photos && photos.length > 0 ? photos : undefined,
      date: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    list[idx].messages.push(msg);
    list[idx].last_message = text || (photos && photos.length > 0 ? '📷 [Фотография]' : '');
    list[idx].last_message_date = msg.date;
    list[idx].unread_count = 0;
    setStorage(STORAGE_KEYS.CHATS, list);
    return list[idx];
  },

  sendChatMessage(chatId: string, text: string, photos?: string[]): MarketplaceChat | undefined {
    return this.addChatMessage(chatId, text, photos);
  },

  linkChatToOrder(chatId: string, orderId: string, orderNumber?: string): void {
    const chats = this.getChats();
    const idx = chats.findIndex(c => c.id === chatId);
    if (idx !== -1) {
      chats[idx].linked_order_id = orderId;
      if (orderNumber) chats[idx].linked_order_number = orderNumber;
      setStorage(STORAGE_KEYS.CHATS, chats);
    }
  },

  // --- TRACKING ---
  getTrackings(): TrackingItem[] {
    return getStorage<TrackingItem[]>(STORAGE_KEYS.TRACKING, INITIAL_TRACKING);
  },
  saveTracking(item: TrackingItem): void {
    const list = this.getTrackings();
    const idx = list.findIndex(t => t.id === item.id);
    if (idx !== -1) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    setStorage(STORAGE_KEYS.TRACKING, list);
  },
  addTracking(item: Partial<TrackingItem>): TrackingItem {
    const full: TrackingItem = {
      id: item.id || ('tr-' + Date.now()),
      tracking_number: item.tracking_number || '',
      order_id: item.order_id,
      order_number: item.order_number,
      recipient_name: item.recipient_name || '',
      destination_city: item.destination_city || '',
      label: item.label || 'СДЭК',
      status: item.status || 'created',
      estimated_date: item.estimated_date,
      history: item.history || [
        {
          date: new Date().toLocaleDateString('ru-RU'),
          status: 'Создан',
          city: item.destination_city || 'Москва',
          description: 'Накладная зарегистрирована в системе СДЭК'
        }
      ]
    };
    this.saveTracking(full);
    return full;
  },
  findTracking(query: string): TrackingItem | undefined {
    const list = this.getTrackings();
    const q = query.trim().toLowerCase();
    return list.find(t => t.tracking_number.toLowerCase().includes(q) || t.order_number?.toLowerCase().includes(q) || t.recipient_name.toLowerCase().includes(q));
  },
  refreshTracking(id: string): TrackingItem | undefined {
    const list = this.getTrackings();
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    return list[idx];
  },
  updateTrackingStatus(id: string, status: TrackingItem['status']): TrackingItem | undefined {
    const list = this.getTrackings();
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    list[idx].status = status;
    this.saveTracking(list[idx]);
    return list[idx];
  },
  deleteTracking(id: string): void {
    const list = this.getTrackings().filter(t => t.id !== id);
    setStorage(STORAGE_KEYS.TRACKING, list);
  },

  // --- REVIEWS & QUESTIONS ---
  getReviews(): MarketplaceReview[] {
    return getStorage<MarketplaceReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },
  saveReviewReply(id: string, replyText: string): MarketplaceReview | undefined {
    const list = this.getReviews();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    list[idx].reply_text = replyText;
    list[idx].is_answered = true;
    setStorage(STORAGE_KEYS.REVIEWS, list);
    return list[idx];
  },
  replyReview(id: string, replyText: string): MarketplaceReview | undefined {
    return this.saveReviewReply(id, replyText);
  },

  getQuestions(): MarketplaceQuestion[] {
    return getStorage<MarketplaceQuestion[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  },
  saveQuestionAnswer(id: string, answerText: string): MarketplaceQuestion | undefined {
    const list = this.getQuestions();
    const idx = list.findIndex(q => q.id === id);
    if (idx === -1) return undefined;
    list[idx].answer_text = answerText;
    list[idx].is_answered = true;
    setStorage(STORAGE_KEYS.QUESTIONS, list);
    return list[idx];
  },
  answerQuestion(id: string, answerText: string): MarketplaceQuestion | undefined {
    return this.saveQuestionAnswer(id, answerText);
  },

  // --- SLABS ---
  getSlabs(): StoneSlab[] {
    return getStorage<StoneSlab[]>(STORAGE_KEYS.SLABS, INITIAL_SLABS);
  },
  saveSlab(slabData: Partial<StoneSlab> & { id?: string }): StoneSlab {
    const list = this.getSlabs();
    if (slabData.id) {
      const idx = list.findIndex(s => s.id === slabData.id);
      if (idx !== -1) {
        const updated: StoneSlab = {
          ...list[idx],
          ...slabData,
        } as StoneSlab;
        list[idx] = updated;
        setStorage(STORAGE_KEYS.SLABS, list);
        return updated;
      }
    }
    const len = Number(slabData.length_mm) || 1000;
    const wid = Number(slabData.width_mm) || 500;
    const calcArea = Number(((len * wid) / 1000000).toFixed(2));
    const newSlab: StoneSlab = {
      id: 'slab-' + Date.now(),
      name: slabData.name || 'Слэб натурального камня',
      category: slabData.category || 'marble',
      origin: slabData.origin || 'Россия',
      dimensions: slabData.dimensions || (len + 'х' + wid + 'х' + (slabData.thickness_mm || 20) + ' мм'),
      length_mm: len,
      width_mm: wid,
      thickness_mm: Number(slabData.thickness_mm) || 20,
      area_m2: slabData.area_m2 ? Number(slabData.area_m2) : calcArea,
      quantity: Number(slabData.quantity) || 1,
      is_offcut: Boolean(slabData.is_offcut),
      price_per_m2: Number(slabData.price_per_m2) || 15000,
      location: slabData.location || 'Склад цеха',
      status: slabData.status || 'in_stock',
      reserved_for_order: slabData.reserved_for_order,
      photo_url: slabData.photo_url,
      notes: slabData.notes || '',
      created_at: new Date().toISOString(),
    };
    list.unshift(newSlab);
    setStorage(STORAGE_KEYS.SLABS, list);
    return newSlab;
  },
  deleteSlab(id: string): void {
    const list = this.getSlabs().filter(s => s.id !== id);
    setStorage(STORAGE_KEYS.SLABS, list);
  },

  // --- TEMPLATES & FOLDERS ---
  getTemplateFolders(type: 'chat' | 'review' | 'question'): string[] {
    const defaultFolders = ['Общие', 'Доставка и сроки', 'Материалы и камень', 'Монтаж и крепления', 'Оплата'];
    const key = `polki_crm_template_folders_${type}_v2`;
    return getStorage<string[]>(key, defaultFolders);
  },
  saveTemplateFolders(type: 'chat' | 'review' | 'question', folders: string[]): void {
    const key = `polki_crm_template_folders_${type}_v2`;
    setStorage(key, folders);
  },
  addTemplateFolder(type: 'chat' | 'review' | 'question', name: string): string[] {
    const list = this.getTemplateFolders(type);
    const trimmed = name.trim();
    if (!trimmed || list.includes(trimmed)) return list;
    const updated = [...list, trimmed];
    this.saveTemplateFolders(type, updated);
    return updated;
  },
  deleteTemplateFolder(type: 'chat' | 'review' | 'question', folderName: string): string[] {
    const list = this.getTemplateFolders(type);
    const updated = list.filter(f => f !== folderName);
    this.saveTemplateFolders(type, updated);
    const items = this.getTemplateItems(type);
    const updatedItems = items.map(it => it.folder === folderName ? { ...it, folder: 'Общие' } : it);
    this.saveTemplateItems(type, updatedItems);
    return updated;
  },

  getTemplateItems(type: 'chat' | 'review' | 'question'): TemplateItem[] {
    const key = `polki_crm_template_items_${type}_v2`;
    const stored = getStorage<TemplateItem[] | null>(key, null);
    if (stored && Array.isArray(stored)) return stored;

    const legacy = this.getTemplates(type);
    const initial: TemplateItem[] = legacy.map((txt, idx) => ({
      id: `tpl-${Date.now()}-${idx}`,
      text: txt,
      folder: 'Общие'
    }));
    setStorage(key, initial);
    return initial;
  },
  saveTemplateItems(type: 'chat' | 'review' | 'question', items: TemplateItem[]): void {
    const key = `polki_crm_template_items_${type}_v2`;
    setStorage(key, items);
    this.saveTemplates(type, items.map(i => i.text));
  },
  addTemplateItem(type: 'chat' | 'review' | 'question', text: string, folder: string = 'Общие'): TemplateItem[] {
    const list = this.getTemplateItems(type);
    if (!text.trim()) return list;
    const newItem: TemplateItem = {
      id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: text.trim(),
      folder: folder || 'Общие'
    };
    const updated = [newItem, ...list];
    this.saveTemplateItems(type, updated);
    return updated;
  },
  deleteTemplateItem(type: 'chat' | 'review' | 'question', id: string): TemplateItem[] {
    const list = this.getTemplateItems(type);
    const updated = list.filter(it => it.id !== id);
    this.saveTemplateItems(type, updated);
    return updated;
  },
  reorderTemplateItems(type: 'chat' | 'review' | 'question', sourceIndex: number, destinationIndex: number): TemplateItem[] {
    const list = [...this.getTemplateItems(type)];
    if (sourceIndex < 0 || sourceIndex >= list.length || destinationIndex < 0 || destinationIndex >= list.length) {
      return list;
    }
    const [moved] = list.splice(sourceIndex, 1);
    list.splice(destinationIndex, 0, moved);
    this.saveTemplateItems(type, list);
    return list;
  },
  clearAllTemplateItems(type: 'chat' | 'review' | 'question', folder?: string): TemplateItem[] {
    if (folder) {
      const list = this.getTemplateItems(type);
      const updated = list.filter(it => it.folder !== folder);
      this.saveTemplateItems(type, updated);
      return updated;
    }
    this.saveTemplateItems(type, []);
    return [];
  },

  // Legacy compatibility helpers
  getTemplates(type: 'chat' | 'review' | 'question'): string[] {
    if (type === 'chat') return getStorage<string[]>(STORAGE_KEYS.CHAT_TEMPLATES, DEFAULT_CHAT_TEMPLATES);
    if (type === 'review') return getStorage<string[]>(STORAGE_KEYS.REVIEW_TEMPLATES, DEFAULT_REVIEW_TEMPLATES);
    return getStorage<string[]>(STORAGE_KEYS.QUESTION_TEMPLATES, DEFAULT_QUESTION_TEMPLATES);
  },
  saveTemplates(type: 'chat' | 'review' | 'question', templates: string[]): void {
    const key = type === 'chat' 
      ? STORAGE_KEYS.CHAT_TEMPLATES 
      : type === 'review' 
      ? STORAGE_KEYS.REVIEW_TEMPLATES 
      : STORAGE_KEYS.QUESTION_TEMPLATES;
    setStorage(key, templates);
  },
  addTemplate(type: 'chat' | 'review' | 'question', text: string): string[] {
    this.addTemplateItem(type, text, 'Общие');
    return this.getTemplates(type);
  },
  deleteTemplate(type: 'chat' | 'review' | 'question', index: number): string[] {
    const items = this.getTemplateItems(type);
    if (items[index]) {
      this.deleteTemplateItem(type, items[index].id);
    }
    return this.getTemplates(type);
  },
  clearAllTemplates(type: 'chat' | 'review' | 'question'): string[] {
    this.clearAllTemplateItems(type);
    return [];
  },
  resetTemplates(type: 'chat' | 'review' | 'question'): string[] {
    return this.clearAllTemplates(type);
  },

  // --- DASHBOARD STATS ---
  getDashboardStats(): DashboardStats {
    const orders = this.getOrders();
    const trackings = this.getTrackings();
    const reviews = this.getReviews();
    const questions = this.getQuestions();

    const active_orders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
    const total_revenue = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
    const new_reviews_count = reviews.filter(r => !r.is_answered).length;
    const unanswered_questions_count = questions.filter(q => !q.is_answered).length;
    const deliveries_in_progress = trackings.filter(t => t.status !== 'delivered' && t.status !== 'returned').length;

    const orders_by_status: Record<string, number> = {};
    const stoneCounts: Record<string, number> = {};
    const orders_by_channel: Record<string, number> = {};

    orders.forEach(o => {
      orders_by_status[o.status] = (orders_by_status[o.status] || 0) + 1;
      const stone = o.stone_type.split('(')[0].trim() || 'Прочее';
      stoneCounts[stone] = (stoneCounts[stone] || 0) + 1;
      const ch = o.channel || 'telegram';
      orders_by_channel[ch] = (orders_by_channel[ch] || 0) + 1;
    });

    const totalOrdersCount = orders.length || 1;
    const stone_popularity = Object.entries(stoneCounts).map(([stone, count]) => ({
      stone,
      count,
      percentage: Math.round((count / totalOrdersCount) * 100),
    }));

    return {
      total_orders: orders.length,
      active_orders,
      total_revenue,
      new_reviews_count,
      unanswered_questions_count,
      deliveries_in_progress,
      orders_by_status,
      stone_popularity,
      orders_by_channel,
    };
  },

  resetAllDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.MERGE_SUGGESTIONS);
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.TRACKING);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.MASTERS);
    localStorage.removeItem(STORAGE_KEYS.STANDARD_RATES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTION_LOG);
    notify();
  },

  // --- ПОДСИСТЕМА УЧЕТА ЗАРПЛАТ И СДЕЛЬЩИНЫ МАСТЕРОВ-ПОЛИРОВЩИКОВ ---
  getMasters(): Master[] {
    const defaultMasters: Master[] = [
      { id: 'm-1', name: 'Алексей Морозов', specialty: 'полировщик', phone: '+7 (926) 345-67-89', isActive: true },
      { id: 'm-2', name: 'Сергей Николаев', specialty: 'полировщик', phone: '+7 (915) 234-56-78', isActive: true },
      { id: 'm-3', name: 'Дмитрий Власов', specialty: 'полировщик', phone: '+7 (903) 456-78-90', isActive: true },
    ];
    return getStorage<Master[]>(STORAGE_KEYS.MASTERS, defaultMasters);
  },
  saveMaster(masterData: Partial<Master> & { name: string }): Master {
    const list = this.getMasters();
    if (masterData.id) {
      const idx = list.findIndex(m => m.id === masterData.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...masterData } as Master;
        setStorage(STORAGE_KEYS.MASTERS, list);
        return list[idx];
      }
    }
    const newMaster: Master = {
      id: masterData.id || `polisher-${Date.now()}`,
      name: masterData.name.trim(),
      specialty: 'полировщик',
      phone: masterData.phone || '',
      isActive: masterData.isActive !== false,
    };
    list.push(newMaster);
    setStorage(STORAGE_KEYS.MASTERS, list);
    return newMaster;
  },

  deleteMaster(id: string): void {
    const list = this.getMasters().filter(m => m.id !== id);
    setStorage(STORAGE_KEYS.MASTERS, list);
  },

  getStandardRates(): StandardPieceworkRate[] {
    const defaultRates: StandardPieceworkRate[] = [
      { id: 'rate-1', name: 'Полка маркетплейс 300х150 мм (WB/Ozon)', category: 'marketplace_serial', dimensions: '300х150х20 мм', stone_type: 'Гранит Габбро / Мрамор', rate_rub: 300, description: 'Распил, фаска 2 мм, полировка торца' },
      { id: 'rate-2', name: 'Полка маркетплейс 400х150 мм (WB/Ozon)', category: 'marketplace_serial', dimensions: '400х150х20 мм', stone_type: 'Гранит Габбро / Мрамор', rate_rub: 350, description: 'Стандартный поток WB/Ozon' },
      { id: 'rate-3', name: 'Полка маркетплейс 500х150 мм (WB/Ozon)', category: 'marketplace_serial', dimensions: '500х150х20 мм', stone_type: 'Гранит / Агломерат', rate_rub: 400, description: 'Стандартный поток WB/Ozon' },
      { id: 'rate-4', name: 'Полка маркетплейс 600х150 мм (WB/Ozon)', category: 'marketplace_serial', dimensions: '600х150х20 мм', stone_type: 'Любой камень', rate_rub: 450, description: 'Поточная серия' },
      { id: 'rate-5', name: 'Полка маркетплейс 800х200 мм (WB/Ozon)', category: 'marketplace_serial', dimensions: '800х200х20 мм', stone_type: 'Любой камень', rate_rub: 600, description: 'Крупная поточная полка' },
      { id: 'rate-6', name: 'Индивидуальный заказ (прямая полка до 1м)', category: 'individual', dimensions: 'до 1000х250 мм', stone_type: 'Натуральный камень', rate_rub: 800, description: 'Индивидуальный заказ по чертежу' },
      { id: 'rate-7', name: 'Индивидуальный заказ (крупногабарит / сложная форма)', category: 'individual', dimensions: 'от 1000 мм', stone_type: 'Кварцит / Оникс / Мрамор', rate_rub: 1300, description: 'Сложный распил и криволинейная кромка' },
    ];
    return getStorage<StandardPieceworkRate[]>(STORAGE_KEYS.STANDARD_RATES, defaultRates);
  },
  saveStandardRate(rateData: Partial<StandardPieceworkRate> & { name: string; rate_rub: number }): StandardPieceworkRate {
    const list = this.getStandardRates();
    if (rateData.id) {
      const idx = list.findIndex(r => r.id === rateData.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...rateData } as StandardPieceworkRate;
        setStorage(STORAGE_KEYS.STANDARD_RATES, list);
        return list[idx];
      }
    }
    const newRate: StandardPieceworkRate = {
      id: rateData.id || `rate-${Date.now()}`,
      name: rateData.name.trim(),
      category: rateData.category || 'marketplace_serial',
      dimensions: rateData.dimensions || 'Поточный размер',
      stone_type: rateData.stone_type || 'Любой камень',
      rate_rub: Number(rateData.rate_rub) || 350,
      description: rateData.description || 'Поточная серия'
    };
    list.push(newRate);
    setStorage(STORAGE_KEYS.STANDARD_RATES, list);
    return newRate;
  },
  deleteStandardRate(id: string): void {
    const list = this.getStandardRates().filter(r => r.id !== id);
    setStorage(STORAGE_KEYS.STANDARD_RATES, list);
  },

  getProductionLog(): ProductionLogItem[] {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);   // YYYY-MM-DD

    const defaultLogs: ProductionLogItem[] = [
      {
        id: 'log-1',
        date: today,
        master_id: 'm-1',
        master_name: 'Алексей Морозов',
        item_type: 'marketplace_serial',
        product_name: 'Полка маркетплейс 400х150 мм (WB/Ozon)',
        stone_type: 'Гранит Черный Габбро',
        dimensions: '400х150х20 мм',
        quantity: 12,
        rate_per_unit: 350,
        total_salary: 4200,
        comment: 'Партия под поставку WB Коледино',
        created_at: new Date().toISOString()
      },
      {
        id: 'log-2',
        date: today,
        master_id: 'm-2',
        master_name: 'Сергей Николаев',
        item_type: 'marketplace_serial',
        product_name: 'Полка маркетплейс 500х150 мм (WB/Ozon)',
        stone_type: 'Мрамор Белый Calacatta',
        dimensions: '500х150х20 мм',
        quantity: 8,
        rate_per_unit: 400,
        total_salary: 3200,
        comment: 'Полировка торцов и гидрофобизация',
        created_at: new Date().toISOString()
      },
      {
        id: 'log-3',
        date: today,
        master_id: 'm-3',
        master_name: 'Дмитрий Власов',
        item_type: 'individual',
        order_number: 'КР-301',
        product_name: 'Индивидуальная полка в ванную',
        stone_type: 'Оникс Медовый',
        dimensions: '850х220х20 мм',
        quantity: 2,
        rate_per_unit: 1100,
        total_salary: 2200,
        comment: 'Сложный рез под скрытые штоки',
        created_at: new Date().toISOString()
      }
    ];
    return getStorage<ProductionLogItem[]>(STORAGE_KEYS.PRODUCTION_LOG, defaultLogs);
  },

  addProductionLogItem(item: Omit<ProductionLogItem, 'id' | 'created_at' | 'total_salary'> & { id?: string; total_salary?: number }): ProductionLogItem {
    const list = this.getProductionLog();
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.rate_per_unit) || 0;
    const total = item.total_salary !== undefined ? item.total_salary : qty * rate;

    const newItem: ProductionLogItem = {
      id: item.id || `plog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: item.date || new Date().toISOString().slice(0, 10),
      master_id: item.master_id,
      master_name: item.master_name,
      item_type: item.item_type,
      order_number: item.order_number,
      product_name: item.product_name,
      stone_type: item.stone_type,
      dimensions: item.dimensions,
      quantity: qty,
      rate_per_unit: rate,
      total_salary: total,
      comment: item.comment || '',
      created_at: new Date().toISOString(),
    };

    list.unshift(newItem);
    setStorage(STORAGE_KEYS.PRODUCTION_LOG, list);
    return newItem;
  },

  deleteProductionLogItem(id: string): void {
    const list = this.getProductionLog().filter(l => l.id !== id);
    setStorage(STORAGE_KEYS.PRODUCTION_LOG, list);
  },

  /**
   * Автоматическая привязка индивидуального заказа к полировщику в ведомости сдельной зарплаты
   */
  syncOrderToPolisherSalary(order: Order, polisherName?: string): void {
    const targetPolisher = (polisherName || order.polisher || '').trim();
    if (!targetPolisher) return;

    const masters = this.getMasters();
    const masterObj = masters.find(m => m.name.toLowerCase() === targetPolisher.toLowerCase());
    const masterId = masterObj ? masterObj.id : `m-${Date.now()}`;
    if (!masterObj) {
      this.saveMaster({ id: masterId, name: targetPolisher, specialty: 'полировщик', isActive: true });
    }

    const logs = this.getProductionLog();
    const existingIndex = logs.findIndex(l => l.order_number === order.order_number);

    // Расчет ставки полировщика: ~15-20% от стоимости изделия или фикс от сложности
    const qty = (order.items && order.items.length > 0)
      ? order.items.reduce((s, i) => s + (i.quantity || 1), 0)
      : 1;
    const orderTotal = Number(order.total_price) || 8000;
    // Базовая сдельная расценка полировщика за индивидуальное изделие (20% от суммы или мин 900 руб)
    const ratePerUnit = Math.max(800, Math.round((orderTotal * 0.18) / qty / 50) * 50);

    const logEntry: ProductionLogItem = {
      id: existingIndex !== -1 ? logs[existingIndex].id : `plog-ord-${order.id}`,
      date: new Date().toISOString().slice(0, 10),
      master_id: masterId,
      master_name: targetPolisher,
      item_type: 'individual',
      order_number: order.order_number,
      product_name: `Индивидуальный заказ #${order.order_number}`,
      stone_type: order.stone_type || 'Натуральный камень',
      dimensions: order.dimensions || 'По чертежу',
      quantity: qty,
      rate_per_unit: ratePerUnit,
      total_salary: ratePerUnit * qty,
      comment: `Автоматически привязан из заказа CRM (${order.client_name || ''})`,
      created_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      logs[existingIndex] = { ...logs[existingIndex], ...logEntry };
      setStorage(STORAGE_KEYS.PRODUCTION_LOG, logs);
    } else {
      logs.unshift(logEntry);
      setStorage(STORAGE_KEYS.PRODUCTION_LOG, logs);
    }
  },

  // --- FBO ПОДСИСТЕМА: РЕКОМЕНДАЦИИ И ПОСТАВКИ ---
  getFboRecommendations(): FboItemRecommendation[] {
    const defaultRecs: FboItemRecommendation[] = [
      {
        id: 'rec-1',
        article: 'WB-PLK-GABBRO-400',
        barcode: '4670018290112',
        name: 'Полка из гранита Габбро 400х150 мм (в ванную/душевую)',
        stone_type: 'Черный Гранит Габбро',
        dimensions: '400х150х20 мм',
        marketplace: 'wildberries',
        price_rub: 3200,
        fbs_sales_30d: 48,
        current_fbo_stock: 4,
        current_workshop_stock: 18,
        velocity_per_day: 1.6,
        days_of_supply: 3,
        recommended_qty: 35,
        demand_level: 'high',
        reason: 'Хит продаж! Остаток на складе WB всего на 3 дня. Риск упущенной выручки 112 000 ₽.',
      },
      {
        id: 'rec-2',
        article: 'OZ-PLK-CALAC-500',
        barcode: '4670018290235',
        name: 'Полка из белого мрамора Calacatta 500х150 мм',
        stone_type: 'Мрамор Белый Calacatta',
        dimensions: '500х150х20 мм',
        marketplace: 'ozon',
        price_rub: 3850,
        fbs_sales_30d: 32,
        current_fbo_stock: 6,
        current_workshop_stock: 12,
        velocity_per_day: 1.1,
        days_of_supply: 5,
        recommended_qty: 25,
        demand_level: 'high',
        reason: 'Высокая конверсия в корзину на Ozon. Скорость доставки FBO поднимет карточку в топ выдачи.',
      },
      {
        id: 'rec-3',
        article: 'WB-PLK-GABBRO-500',
        barcode: '4670018290341',
        name: 'Полка из гранита Габбро 500х150 мм',
        stone_type: 'Черный Гранит Габбро',
        dimensions: '500х150х20 мм',
        marketplace: 'wildberries',
        price_rub: 3600,
        fbs_sales_30d: 26,
        current_fbo_stock: 8,
        current_workshop_stock: 10,
        velocity_per_day: 0.9,
        days_of_supply: 9,
        recommended_qty: 20,
        demand_level: 'medium',
        reason: 'Стабильный спрос по FBS. Рекомендуется отгрузка на склад Коледино для снижения логистического тарифа.',
      },
      {
        id: 'rec-4',
        article: 'OZ-PLK-GABBRO-300',
        barcode: '4670018290458',
        name: 'Компактная полка Гранит Габбро 300х150 мм',
        stone_type: 'Черный Гранит Габбро',
        dimensions: '300х150х20 мм',
        marketplace: 'ozon',
        price_rub: 2650,
        fbs_sales_30d: 22,
        current_fbo_stock: 2,
        current_workshop_stock: 15,
        velocity_per_day: 0.7,
        days_of_supply: 3,
        recommended_qty: 20,
        demand_level: 'high',
        reason: 'Критически низкий остаток на FBO. Товар часто берут парами по 2 штуки.',
      },
      {
        id: 'rec-5',
        article: 'OZ-PLK-ONYX-400',
        barcode: '4670018290565',
        name: 'Премиум полка из медового оникса 400х150 мм',
        stone_type: 'Оникс Медовый',
        dimensions: '400х150х20 мм',
        marketplace: 'ozon',
        price_rub: 5900,
        fbs_sales_30d: 14,
        current_fbo_stock: 3,
        current_workshop_stock: 5,
        velocity_per_day: 0.5,
        days_of_supply: 6,
        recommended_qty: 10,
        demand_level: 'medium',
        reason: 'Высокомаржинальная позиция. Быстрая доставка FBO стимулирует импульсивные покупки в подарок.',
      },
      {
        id: 'rec-6',
        article: 'WB-PLK-AGLOM-600',
        barcode: '4670018290672',
        name: 'Полка из кварцевого агломерата Бетон Серый 600х150 мм',
        stone_type: 'Кварцевый агломерат',
        dimensions: '600х150х20 мм',
        marketplace: 'wildberries',
        price_rub: 4200,
        fbs_sales_30d: 18,
        current_fbo_stock: 12,
        current_workshop_stock: 8,
        velocity_per_day: 0.6,
        days_of_supply: 20,
        recommended_qty: 10,
        demand_level: 'low',
        reason: 'Остатка достаточно на 20 дней. Достаточно минимальной подсортировки в плановую поставку.',
      },
      {
        id: 'rec-7',
        article: 'YM-PLK-GABBRO-400',
        barcode: '4670018290789',
        name: 'Полка гранитная Габбро Диабаз 400х150 мм (Яндекс.Маркет)',
        stone_type: 'Черный Гранит Габбро',
        dimensions: '400х150х20 мм',
        marketplace: 'yandex',
        price_rub: 3350,
        fbs_sales_30d: 28,
        current_fbo_stock: 5,
        current_workshop_stock: 14,
        velocity_per_day: 0.95,
        days_of_supply: 5,
        recommended_qty: 25,
        demand_level: 'high',
        reason: 'Яндекс FBY склад Софьино дает бесплатную экспресс-доставку Яндекс Плюс. Осталось на 5 дней!',
      },
      {
        id: 'rec-8',
        article: 'YM-PLK-CALAC-400',
        barcode: '4670018290895',
        name: 'Полка из белого мрамора Calacatta 400х150 мм (Яндекс.Маркет)',
        stone_type: 'Мрамор Белый Calacatta',
        dimensions: '400х150х20 мм',
        marketplace: 'yandex',
        price_rub: 3700,
        fbs_sales_30d: 19,
        current_fbo_stock: 4,
        current_workshop_stock: 9,
        velocity_per_day: 0.65,
        days_of_supply: 6,
        recommended_qty: 15,
        demand_level: 'medium',
        reason: 'Стабильные заказы дизайнеров интерьеров. Рекомендуется отгрузка в FBY для участия в сезонных акциях.',
      },
    ];
    return getStorage<FboItemRecommendation[]>(STORAGE_KEYS.FBO_RECOMMENDATIONS, defaultRecs);
  },

  getFboSupplies(): FboSupply[] {
    const defaultSupplies: FboSupply[] = [
      {
        id: 'fbo-1',
        supply_number: 'FBO-WB-2026-004',
        marketplace: 'wildberries',
        status: 'accepted',
        destination_warehouse: 'WB Коледино (Подольск)',
        warehouse_id: 'wb-wh-koledino-1',
        cluster_name: 'Центральный кластер (Москва и МО)',
        created_at: '2026-08-20T10:00:00.000Z',
        planned_date: '2026-08-24',
        timeslot: '09:00 - 11:00',
        total_items: 60,
        total_boxes: 6,
        total_cost_rub: 198000,
        api_draft_id: 'wb-draft-984102',
        api_supply_id: 'WB-SUP-5920194',
        notes: 'Принято без расхождений, поставка моно-коробами',
        boxes: [
          { id: 'b-1', box_number: 1, barcode: 'WBB100829101', items_count: 10, weight_kg: 18.5, dimensions_cm: '60х40х25' },
          { id: 'b-2', box_number: 2, barcode: 'WBB100829102', items_count: 10, weight_kg: 18.5, dimensions_cm: '60х40х25' },
          { id: 'b-3', box_number: 3, barcode: 'WBB100829103', items_count: 10, weight_kg: 18.5, dimensions_cm: '60х40х25' },
          { id: 'b-4', box_number: 4, barcode: 'WBB100829104', items_count: 10, weight_kg: 19.0, dimensions_cm: '60х40х25' },
          { id: 'b-5', box_number: 5, barcode: 'WBB100829105', items_count: 10, weight_kg: 19.0, dimensions_cm: '60х40х25' },
          { id: 'b-6', box_number: 6, barcode: 'WBB100829106', items_count: 10, weight_kg: 19.0, dimensions_cm: '60х40х25' },
        ],
        items: [
          { id: 'si-1', article: 'WB-PLK-GABBRO-400', barcode: '4670018290112', name: 'Полка из гранита Габбро 400х150 мм', stone_type: 'Черный Гранит Габбро', dimensions: '400х150х20 мм', quantity: 30, price_rub: 3200 },
          { id: 'si-2', article: 'WB-PLK-GABBRO-500', barcode: '4670018290341', name: 'Полка из гранита Габбро 500х150 мм', stone_type: 'Черный Гранит Габбро', dimensions: '500х150х20 мм', quantity: 20, price_rub: 3600 },
          { id: 'si-3', article: 'WB-PLK-AGLOM-600', barcode: '4670018290672', name: 'Полка из кварцевого агломерата 600х150 мм', stone_type: 'Кварцевый агломерат', dimensions: '600х150х20 мм', quantity: 10, price_rub: 4200 },
        ]
      },
      {
        id: 'fbo-2',
        supply_number: 'FBO-OZ-2026-005',
        marketplace: 'ozon',
        status: 'timeslot_booked',
        destination_warehouse: 'Ozon Хоругвино (Север МО)',
        warehouse_id: 'ozon-wh-khorugvino-2',
        cluster_name: 'Москва и Запад МО',
        created_at: '2026-09-02T14:30:00.000Z',
        planned_date: '2026-09-14',
        timeslot: '13:00 - 15:00',
        total_items: 45,
        total_boxes: 4,
        total_cost_rub: 168250,
        api_draft_id: 'oz-drf-7719204',
        api_supply_id: 'OZ-SUP-2026-0914',
        notes: 'Таймслот подтвержден Ozon API. Готова к сдаче водителю.',
        boxes: [
          { id: 'ob-1', box_number: 1, barcode: 'OZB99018411', items_count: 12, weight_kg: 21.0, dimensions_cm: '60х40х30' },
          { id: 'ob-2', box_number: 2, barcode: 'OZB99018412', items_count: 13, weight_kg: 22.0, dimensions_cm: '60х40х30' },
          { id: 'ob-3', box_number: 3, barcode: 'OZB99018413', items_count: 10, weight_kg: 17.5, dimensions_cm: '60х40х30' },
          { id: 'ob-4', box_number: 4, barcode: 'OZB99018414', items_count: 10, weight_kg: 19.5, dimensions_cm: '60х40х30' },
        ],
        items: [
          { id: 'osi-1', article: 'OZ-PLK-CALAC-500', barcode: '4670018290235', name: 'Полка из белого мрамора Calacatta 500х150 мм', stone_type: 'Мрамор Белый Calacatta', dimensions: '500х150х20 мм', quantity: 25, price_rub: 3850 },
          { id: 'osi-2', article: 'OZ-PLK-GABBRO-300', barcode: '4670018290458', name: 'Компактная полка Гранит Габбро 300х150 мм', stone_type: 'Черный Гранит Габбро', dimensions: '300х150х20 мм', quantity: 20, price_rub: 2650 },
        ]
      }
    ];
    return getStorage<FboSupply[]>(STORAGE_KEYS.FBO_SUPPLIES, defaultSupplies);
  },

  saveFboSupply(supplyData: Partial<FboSupply> & { marketplace: FboMarketplace }): FboSupply {
    const list = this.getFboSupplies();
    if (supplyData.id) {
      const idx = list.findIndex(s => s.id === supplyData.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...supplyData } as FboSupply;
        setStorage(STORAGE_KEYS.FBO_SUPPLIES, list);
        return list[idx];
      }
    }

    const mpCode = supplyData.marketplace === 'ozon' ? 'OZ' : (supplyData.marketplace === 'yandex' ? 'YM' : 'WB');
    const defaultWh = supplyData.marketplace === 'ozon' 
      ? 'Ozon Хоругвино' 
      : (supplyData.marketplace === 'yandex' ? 'Яндекс.Маркет Софьино (FBY)' : 'WB Коледино');

    const newSupply: FboSupply = {
      id: supplyData.id || 'fbo-' + Date.now(),
      supply_number: supplyData.supply_number || ('FBO-' + mpCode + '-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900)),
      marketplace: supplyData.marketplace,
      status: supplyData.status || 'draft',
      destination_warehouse: supplyData.destination_warehouse || defaultWh,
      warehouse_id: supplyData.warehouse_id,
      cluster_name: supplyData.cluster_name || 'Центральный регион',
      created_at: supplyData.created_at || new Date().toISOString(),
      planned_date: supplyData.planned_date || new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
      timeslot: supplyData.timeslot || '10:00 - 12:00',
      total_items: supplyData.total_items || (supplyData.items ? supplyData.items.reduce((acc, i) => acc + i.quantity, 0) : 0),
      total_boxes: supplyData.total_boxes || (supplyData.boxes ? supplyData.boxes.length : 1),
      total_cost_rub: supplyData.total_cost_rub || (supplyData.items ? supplyData.items.reduce((acc, i) => acc + (i.quantity * i.price_rub), 0) : 0),
      items: supplyData.items || [],
      boxes: supplyData.boxes || [],
      api_draft_id: supplyData.api_draft_id || ('api-drf-' + Math.random().toString(36).slice(2, 9)),
      api_supply_id: supplyData.api_supply_id,
      notes: supplyData.notes || '',
    };

    list.unshift(newSupply);
    setStorage(STORAGE_KEYS.FBO_SUPPLIES, list);
    return newSupply;
  },

  deleteFboSupply(id: string): void {
    const list = this.getFboSupplies().filter(s => s.id !== id);
    setStorage(STORAGE_KEYS.FBO_SUPPLIES, list);
  },

  updateFboSupplyStatus(id: string, status: FboSupplyStatus): void {
    const list = this.getFboSupplies();
    const target = list.find(s => s.id === id);
    if (target) {
      target.status = status;
      if (status === 'timeslot_booked' && !target.api_supply_id) {
        const prefix = target.marketplace === 'ozon' ? 'OZ-SUP-' : (target.marketplace === 'yandex' ? 'YM-REQ-' : 'WB-SUP-');
        target.api_supply_id = prefix + Math.floor(1000000 + Math.random() * 9000000);
      }
      setStorage(STORAGE_KEYS.FBO_SUPPLIES, list);
    }
  },

};

