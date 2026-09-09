import type { 
  Order, 
  TrackingItem, 
  MarketplaceReview, 
  MarketplaceQuestion, 
  MarketplaceChat,
  DashboardStats,
  ContactChannel,
  UserProfile
} from '../types';

const STORAGE_KEYS = {
  ORDERS: 'polki_crm_orders_v4',
  TRACKING: 'polki_crm_tracking_v3',
  REVIEWS: 'polki_crm_reviews_v3',
  QUESTIONS: 'polki_crm_questions_v3',
  CHATS: 'polki_crm_chats_v3',
  CURRENT_USER: 'polki_crm_current_user_v4',
  USERS: 'polki_crm_users_v4',
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u-admin',
    name: 'Руководитель',
    role: 'admin',
    roleTitle: 'Руководитель',
  },
  {
    id: 'u-lera',
    name: 'Лера',
    role: 'admin',
    roleTitle: 'Администратор',
  },
  {
    id: 'u-anya',
    name: 'Аня',
    role: 'admin',
    roleTitle: 'Администратор',
  },
  {
    id: 'u-alina',
    name: 'Алина',
    role: 'admin',
    roleTitle: 'Администратор',
  },
];

const INITIAL_CHATS: MarketplaceChat[] = [
  {
    id: 'chat-ozon-1',
    marketplace: 'ozon',
    buyer_name: 'Екатерина В.',
    product_title: 'Полка из мрамора Калакатта 60х15 см',
    last_message: 'Добрый вечер! Подскажите, а в комплекте идет дюбель для пустотелого кирпича?',
    last_message_date: '09.09.2026 18:40',
    unread_count: 1,
    messages: [
      {
        id: 'm1',
        sender: 'buyer',
        text: 'Добрый день! Очень понравилась ваша полочка из белого мрамора.',
        date: '09.09.2026 17:15',
      },
      {
        id: 'm2',
        sender: 'seller',
        text: 'Здравствуйте, Екатерина! Рады, что вам понравилось наше изделие из натурального камня «Каменный Ручей».',
        date: '09.09.2026 17:30',
      },
      {
        id: 'm3',
        sender: 'buyer',
        text: 'Добрый вечер! Подскажите, а в комплекте идет дюбель для пустотелого кирпича?',
        date: '09.09.2026 18:40',
      }
    ]
  },
  {
    id: 'chat-wb-1',
    marketplace: 'wildberries',
    buyer_name: 'Артур Г.',
    product_title: 'Полка гранитная черная 80х20 см',
    last_message: 'Спасибо за оперативный ответ, оформил заказ на ВБ!',
    last_message_date: '09.09.2026 14:20',
    unread_count: 0,
    messages: [
      {
        id: 'w1',
        sender: 'buyer',
        text: 'Здравствуйте! Камень матовый или глянец?',
        date: '09.09.2026 13:50',
      },
      {
        id: 'w2',
        sender: 'seller',
        text: 'Здравствуйте! Полка имеет зеркальную алмазную полировку с защитной гидрофобной обработкой.',
        date: '09.09.2026 14:05',
      },
      {
        id: 'w3',
        sender: 'buyer',
        text: 'Спасибо за оперативный ответ, оформил заказ на ВБ!',
        date: '09.09.2026 14:20',
      }
    ]
  },
  {
    id: 'chat-yandex-1',
    marketplace: 'yandex',
    buyer_name: 'Ольга Васильева',
    product_title: 'Полка угловая Травертин 25х25 см',
    last_message: 'А можно сделать такую же, но радиусом 32 см?',
    last_message_date: '09.09.2026 16:05',
    unread_count: 1,
    messages: [
      {
        id: 'y1',
        sender: 'buyer',
        text: 'Здравствуйте! У вас потрясающий травертин в магазине.',
        date: '09.09.2026 15:40',
      },
      {
        id: 'y2',
        sender: 'buyer',
        text: 'А можно сделать такую же, но радиусом 32 см?',
        date: '09.09.2026 16:05',
      }
    ]
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-multi-test',
    order_number: 'П-1088',
    client_name: 'Дмитрий Романов (Дизайн-проект ЖК «Символ»)',
    client_phone: '+7 (915) 880-12-34',
    channel: 'telegram',
    client_contact: '@dmitriy_romanov_arch',
    product_description: 'Индивидуальный комплект каменных полок в ванную комнату и гостиную по дизайн-проекту',
    stone_type: 'Фотоподбор слэба (Калакатта + Гранит)',
    dimensions: 'Комплект из 6 изделий (см. спецификацию)',
    items: [
      {
        id: 'item-1',
        stone_type: 'По фотоподбору слэба (светлый мрамор)',
        dimensions: '1200х220х20 мм',
        quantity: 2,
        price: 9800,
        description: 'Лицевая еврофаска полированная, 3 отверстия под скрытый менсолодержатель',
      },
      {
        id: 'item-2',
        stone_type: 'По фотоподбору слэба (светлый мрамор)',
        dimensions: '800х180х20 мм',
        quantity: 1,
        price: 6400,
        description: 'Еврофаска по кругу, гидрофобная водоотталкивающая пропитка для душевой',
      },
      {
        id: 'item-3',
        stone_type: 'По фотоподбору слэба (темный кварцит/гранит)',
        dimensions: '600х150х20 мм',
        quantity: 2,
        price: 5200,
        description: 'Скругление углов R10, полировка торцов со всех видимых сторон',
      },
      {
        id: 'item-4',
        stone_type: 'По фотоподбору слэба (темный кварцит/гранит)',
        dimensions: '1400х250х30 мм',
        quantity: 1,
        price: 14600,
        description: 'Массивная полка под раковину, усиленный скрытый крепеж, вырез под сифон',
      },
    ],
    notes: 'Упаковать каждую полку в многослойную пупырчатую пленку и жесткую деревянную обрешетку',
    total_price: 51000,
    prepayment_amount: 25500,
    prepayment_received: true,
    remaining_paid: false,
    tracking_number: '10318956270',
    status: 'in_production',
    accepted_by: 'Лера',
    polisher: 'Михаил',
    photos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&auto=format&fit=crop&q=60',
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'ord-101',
    order_number: 'ORD-20260909-001',
    client_name: 'Иван Смирнов',
    client_phone: '+7 (916) 123-45-67',
    channel: 'telegram',
    client_contact: '@ivan_smirnov',
    product_description: 'Полка для ванной с закругленными углами и еврофаской',
    stone_type: 'Белый мрамор Калакатта Экстра (Италия)',
    dimensions: '600x150x20 мм',
    notes: 'Клиент просил дополнительную полировку кромки',
    total_price: 12500,
    prepayment_amount: 6000,
    prepayment_received: true,
    remaining_paid: false,
    tracking_number: '1489201934',
    status: 'in_delivery',
    accepted_by: 'Мария (Менеджер продаж)',
    polisher: 'Алексей Смирнов (Цех №1)',
    photos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=60',
    ],
    created_at: '2026-09-05T10:30:00Z',
  },
  {
    id: 'ord-102',
    order_number: 'ORD-20260909-002',
    client_name: 'Елена Васильева',
    client_phone: '+7 (921) 987-65-43',
    channel: 'avito',
    client_contact: 'Чат Авито: каменные полки СПб',
    product_description: 'Комплект из двух парящих полок под раковину',
    stone_type: 'Черный гранит Габбро-Диабаз (Карелия)',
    dimensions: '900x200x30 мм',
    notes: 'Скрытый монтаж в комплекте',
    total_price: 24000,
    prepayment_amount: 12000,
    prepayment_received: true,
    remaining_paid: false,
    status: 'in_production',
    accepted_by: 'Антон (Администратор)',
    polisher: 'Виктор Ковалев (Цех №2)',
    photos: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&auto=format&fit=crop&q=60',
    ],
    created_at: '2026-09-07T14:15:00Z',
  },
  {
    id: 'ord-103',
    order_number: 'ORD-20260909-003',
    client_name: 'Артем Мельников',
    client_phone: '+7 (903) 445-56-78',
    channel: 'call',
    client_contact: 'Входящий звонок с сайта polkistone.ru',
    product_description: 'Полка с подсветкой в нишу душевой',
    stone_type: 'Оникс Медовый полупрозрачный',
    dimensions: '450x120x15 мм',
    notes: 'Вырез под LED-профиль',
    total_price: 18500,
    prepayment_amount: 9000,
    prepayment_received: false,
    remaining_paid: false,
    status: 'waiting_prepayment',
    accepted_by: 'Мария (Менеджер продаж)',
    polisher: 'Алексей Смирнов (Цех №1)',
    photos: [],
    created_at: '2026-09-08T09:00:00Z',
  },
  {
    id: 'ord-104',
    order_number: 'ORD-20260909-004',
    client_name: 'Ольга Кузнецова',
    client_phone: '+7 (999) 333-22-11',
    channel: 'marketplace',
    client_contact: 'Чат покупателя Ozon (Каменный Ручей)',
    product_description: 'Угловая полочка для косметики',
    stone_type: 'Травертин Ноче (бежево-коричневый)',
    dimensions: '250x250x20 мм',
    notes: 'Матовая фактура',
    total_price: 7800,
    prepayment_amount: 7800,
    prepayment_received: true,
    remaining_paid: true,
    tracking_number: '1489201988',
    status: 'delivered',
    accepted_by: 'Антон (Администратор)',
    polisher: 'Сергей Баранов (Распил и фаска)',
    photos: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=60'
    ],
    created_at: '2026-09-01T11:20:00Z',
  },
  {
    id: 'ord-105',
    order_number: 'ORD-20260909-005',
    client_name: 'Михаил Захаров (Дизайн-бюро)',
    client_phone: '+7 (985) 555-11-22',
    channel: 'bitrix',
    client_contact: 'Лид из Битрикс24 #4892',
    product_description: 'Серия из 4-х полок для шоурума',
    stone_type: 'Кварцит Патагония натуральный с кристаллами',
    dimensions: '1100x250x30 мм',
    notes: 'Премиум полировка, безналичный расчет',
    total_price: 68000,
    prepayment_amount: 34000,
    prepayment_received: true,
    remaining_paid: false,
    status: 'in_production',
    accepted_by: 'Мария (Менеджер продаж)',
    polisher: 'Дмитрий Орлов (Полировка и гидрофоб)',
    photos: [],
    created_at: '2026-09-09T11:00:00Z',
  }
];

const INITIAL_TRACKINGS: TrackingItem[] = [
  {
    id: 'trk-01',
    tracking_number: '1489201934',
    order_id: 'ord-101',
    order_number: 'ORD-20260909-001',
    recipient_name: 'Иван Смирнов',
    destination_city: 'Москва, ПВЗ ул. Ленина 42',
    label: 'Полка Белый мрамор (Каменный Ручей)',
    status: 'in_transit',
    estimated_date: '10.09.2026',
    history: [
      {
        date: '08.09.2026 19:40',
        status: 'В пути в транзитный город',
        city: 'Москва Сортировочный',
        description: 'Отправление перемещается в город назначения'
      },
      {
        date: '07.09.2026 14:10',
        status: 'Принят на склад отправителя',
        city: 'Санкт-Петербург',
        description: 'Груз взвешен и упакован в защитную обрешетку'
      },
      {
        date: '06.09.2026 18:22',
        status: 'Создана накладная',
        city: 'Санкт-Петербург',
        description: 'Электронное оформление отправки в СДЭК'
      }
    ]
  },
  {
    id: 'trk-02',
    tracking_number: '1489201988',
    order_id: 'ord-104',
    order_number: 'ORD-20260909-004',
    recipient_name: 'Ольга Кузнецова',
    destination_city: 'Казань, ПВЗ пр. Победы 12',
    label: 'Угловая полка Травертин',
    status: 'delivered',
    estimated_date: '06.09.2026',
    history: [
      {
        date: '06.09.2026 16:30',
        status: 'Вручен получателю',
        city: 'Казань',
        description: 'Заказ успешно выдан клиенту'
      },
      {
        date: '05.09.2026 10:15',
        status: 'Прибыл в пункт выдачи',
        city: 'Казань',
        description: 'Готов к получению покупателем'
      },
      {
        date: '03.09.2026 11:00',
        status: 'Принят на склад',
        city: 'Санкт-Петербург',
        description: 'Приемка и подготовка к магистральной перевозке'
      }
    ]
  }
];

const INITIAL_REVIEWS: MarketplaceReview[] = [
  {
    id: 'rev-01',
    marketplace: 'ozon',
    product_name: 'Полка из мрамора Калакатта 50х15 см (Каменный Ручей)',
    author: 'Мария К.',
    rating: 5,
    text: 'Потрясающее качество обработки камня! Фаска идеальная, рисунок прожилок превзошел ожидания. Очень надежная упаковка в деревянный ящик.',
    pros: 'Натуральный камень, тяжелая, красивая',
    cons: 'Нет',
    review_date: '08.09.2026 16:45',
    is_answered: true,
    reply_text: 'Мария, здравствуйте! Большое спасибо за выбор мастерской «Каменный Ручей» и высокую оценку нашего труда. Пусть полочка радует вас каждый день!'
  },
  {
    id: 'rev-02',
    marketplace: 'wildberries',
    product_name: 'Полка гранитная черная 60х20 см (Каменный Ручей)',
    author: 'Дмитрий В.',
    rating: 4,
    text: 'Полка отличная, качественная. Снял одну звезду за задержку доставки на 1 день со стороны логистики маркетплейса.',
    pros: 'Камень прочный, глубокий черный цвет',
    cons: 'Доставка задержалась',
    review_date: '08.09.2026 11:10',
    is_answered: false,
  },
  {
    id: 'rev-03',
    marketplace: 'yandex',
    product_name: 'Полка угловая Травертин 25х25 см (Каменный Ручей)',
    author: 'Светлана Р.',
    rating: 5,
    text: 'Очень уютный теплый оттенок травертина. Идеально подошла под плитку в санузле!',
    review_date: '07.09.2026 20:30',
    is_answered: false,
  }
];

const INITIAL_QUESTIONS: MarketplaceQuestion[] = [
  {
    id: 'q-01',
    marketplace: 'ozon',
    product_name: 'Полка из мрамора Калакатта 60х15 см (Каменный Ручей)',
    author: 'Алексей',
    question_text: 'Подскажите, идут ли в комплекте скрытые кронштейны для монтажа на гипсокартонную стену?',
    question_date: '09.09.2026 12:15',
    is_answered: false,
  },
  {
    id: 'q-02',
    marketplace: 'wildberries',
    product_name: 'Полка гранитная черная 80х20 см (Каменный Ручей)',
    author: 'Виктория',
    question_text: 'Какую максимальную нагрузку выдерживает эта полка при стандартном крепеже?',
    question_date: '08.09.2026 18:40',
    is_answered: true,
    answer_text: 'Здравствуйте, Виктория! При монтаже в бетонную или кирпичную стену полка «Каменный Ручей» выдерживает до 25 кг распределенной нагрузки.',
  },
  {
    id: 'q-03',
    marketplace: 'yandex',
    product_name: 'Полка из оникса 40х15 см (Каменный Ручей)',
    author: 'Константин',
    question_text: 'Возможно ли заказать полочку нестандартной длины 73 см?',
    question_date: '07.09.2026 15:20',
    is_answered: false,
  }
];

type DataStoreListener = (key: string) => void;
const listeners = new Set<DataStoreListener>();

export function subscribeDataStore(cb: DataStoreListener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function notifyListeners(key: string) {
  listeners.forEach(cb => {
    try {
      cb(key);
    } catch (e) {
      console.error('Error in dataStore listener:', e);
    }
  });
}

// Listen to other browser tabs changing localStorage
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key) {
      notifyListeners(event.key);
    }
  });
}

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyListeners(key);
  } catch (e) {
    console.error(`Failed to save to localStorage for key ${key}:`, e);
  }
}

export const dataStore = {
  // Profiles
  getUsers(): UserProfile[] {
    const users = getStorage<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    // If legacy list contains polishers or outdated profiles, reset to INITIAL_USERS
    if (!users || !Array.isArray(users) || users.length === 0 || users.some(u => u.role === 'polisher' || u.id.startsWith('u-1'))) {
      setStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
      return INITIAL_USERS;
    }
    return users;
  },
  getCurrentUser(): UserProfile {
    const users = this.getUsers();
    const saved = getStorage<UserProfile>(STORAGE_KEYS.CURRENT_USER, users[0]);
    // Ensure current user is one of the valid active user profiles
    const matched = users.find(u => u.id === saved?.id);
    if (!matched) {
      this.setCurrentUser(users[0]);
      return users[0];
    }
    return matched;
  },
  setCurrentUser(user: UserProfile): void {
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
  },

  // Orders
  getOrders(): Order[] {
    return getStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },
  saveOrder(orderData: Partial<Order> & { id?: string }): Order {
    const list = this.getOrders();
    const currentUser = this.getCurrentUser();

    if (orderData.id) {
      const idx = list.findIndex(o => o.id === orderData.id);
      if (idx !== -1) {
        const updated: Order = {
          ...list[idx],
          ...orderData,
          updated_at: new Date().toISOString(),
        } as Order;
        list[idx] = updated;
        setStorage(STORAGE_KEYS.ORDERS, list);
        return updated;
      }
    }
    // Create new
    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, '');
    const num = (list.length + 1).toString().padStart(3, '0');
    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      order_number: `ORD-${datePrefix}-${num}`,
      client_name: orderData.client_name || 'Клиент',
      client_phone: orderData.client_phone || '',
      channel: (orderData.channel as ContactChannel) || 'telegram',
      client_contact: orderData.client_contact || '',
      product_description: orderData.product_description || '',
      stone_type: orderData.stone_type || 'Натуральный камень',
      dimensions: orderData.dimensions || '600x150x20 мм',
      notes: orderData.notes || '',
      total_price: Number(orderData.total_price) || 0,
      prepayment_amount: Number(orderData.prepayment_amount) || 0,
      prepayment_received: Boolean(orderData.prepayment_received),
      remaining_paid: Boolean(orderData.remaining_paid),
      tracking_number: orderData.tracking_number || '',
      status: orderData.status || 'new',
      accepted_by: orderData.accepted_by || currentUser.name,
      polisher: orderData.polisher || '',
      photos: orderData.photos || [],
      created_at: now.toISOString(),
    };
    list.unshift(newOrder);
    setStorage(STORAGE_KEYS.ORDERS, list);
    return newOrder;
  },
  deleteOrder(id: string): void {
    const list = this.getOrders().filter(o => o.id !== id);
    setStorage(STORAGE_KEYS.ORDERS, list);
  },
  updateOrderStatus(id: string, status: Order['status']): Order | null {
    const list = this.getOrders();
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return null;
    list[idx].status = status;
    list[idx].updated_at = new Date().toISOString();
    setStorage(STORAGE_KEYS.ORDERS, list);
    return list[idx];
  },

  // Tracking
  getTrackings(): TrackingItem[] {
    return getStorage<TrackingItem[]>(STORAGE_KEYS.TRACKING, INITIAL_TRACKINGS);
  },
  findTracking(query: string): TrackingItem | null {
    const list = this.getTrackings();
    const q = query.trim().toLowerCase();
    return list.find(t => 
      t.tracking_number.toLowerCase() === q || 
      (t.order_number && t.order_number.toLowerCase() === q)
    ) || null;
  },
  addTracking(item: Omit<TrackingItem, 'id' | 'history'>): TrackingItem {
    const list = this.getTrackings();
    const newTrk: TrackingItem = {
      ...item,
      id: 'trk-' + Date.now(),
      history: [
        {
          date: new Date().toLocaleString('ru-RU'),
          status: 'Создана накладная СДЭК',
          city: 'Санкт-Петербург',
          description: 'Отправление готово к передаче курьеру СДЭК',
        }
      ]
    };
    list.unshift(newTrk);
    setStorage(STORAGE_KEYS.TRACKING, list);
    return newTrk;
  },
  refreshTracking(id: string): TrackingItem | null {
    const list = this.getTrackings();
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) return null;
    
    const current = list[idx];
    if (current.status === 'created') {
      current.status = 'sent';
      current.history.unshift({
        date: new Date().toLocaleString('ru-RU'),
        status: 'Принят на склад отправителя',
        city: 'Санкт-Петербург',
        description: 'Груз поступил на терминал СДЭК',
      });
    } else if (current.status === 'sent') {
      current.status = 'in_transit';
      current.history.unshift({
        date: new Date().toLocaleString('ru-RU'),
        status: 'В пути между терминалами',
        city: 'Транзитный узел',
        description: 'Транспортировка в региональный сортировочный центр',
      });
    } else if (current.status === 'in_transit') {
      current.status = 'pvz_ready';
      current.history.unshift({
        date: new Date().toLocaleString('ru-RU'),
        status: 'Прибыл в пункт выдачи (ПВЗ)',
        city: current.destination_city.split(',')[0] || 'Город назначения',
        description: 'Посылка готова к выдаче клиенту',
      });
    } else if (current.status === 'pvz_ready') {
      current.status = 'delivered';
      current.history.unshift({
        date: new Date().toLocaleString('ru-RU'),
        status: 'Вручен получателю',
        city: current.destination_city.split(',')[0] || 'Город назначения',
        description: 'Успешно доставлено и вручено',
      });
    }
    setStorage(STORAGE_KEYS.TRACKING, list);
    return current;
  },

  updateTrackingStatus(id: string, newStatus: TrackingItem['status']): TrackingItem | null {
    const list = this.getTrackings();
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) return null;
    
    const current = list[idx];
    current.status = newStatus;
    const statusTitlesMap: Record<TrackingItem['status'], string> = {
      created: 'Создана накладная',
      sent: 'Принят в СДЭК',
      in_transit: 'В пути между городами',
      pvz_ready: 'Готов к выдаче в ПВЗ',
      delivered: 'Вручен получателю',
      returned: 'Возврат',
    };
    current.history.unshift({
      date: new Date().toLocaleString('ru-RU'),
      status: statusTitlesMap[newStatus],
      city: current.destination_city.split(',')[0] || 'СДЭК',
      description: `Статус изменен на «${statusTitlesMap[newStatus]}»`,
    });
    setStorage(STORAGE_KEYS.TRACKING, list);
    return current;
  },

  // Reviews
  getReviews(): MarketplaceReview[] {
    return getStorage<MarketplaceReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },
  replyReview(id: string, replyText: string): MarketplaceReview | null {
    const list = this.getReviews();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return null;
    list[idx].is_answered = true;
    list[idx].reply_text = replyText;
    setStorage(STORAGE_KEYS.REVIEWS, list);
    return list[idx];
  },

  // Questions
  getQuestions(): MarketplaceQuestion[] {
    return getStorage<MarketplaceQuestion[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  },
  answerQuestion(id: string, answerText: string): MarketplaceQuestion | null {
    const list = this.getQuestions();
    const idx = list.findIndex(q => q.id === id);
    if (idx === -1) return null;
    list[idx].is_answered = true;
    list[idx].answer_text = answerText;
    setStorage(STORAGE_KEYS.QUESTIONS, list);
    return list[idx];
  },

  // Marketplace Direct Chats
  getChats(): MarketplaceChat[] {
    return getStorage<MarketplaceChat[]>(STORAGE_KEYS.CHATS, INITIAL_CHATS);
  },
  sendChatMessage(chatId: string, text: string): MarketplaceChat | null {
    const list = this.getChats();
    const idx = list.findIndex(c => c.id === chatId);
    if (idx === -1) return null;
    const msg = {
      id: 'm-' + Date.now(),
      sender: 'seller' as const,
      text,
      date: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    list[idx].messages.push(msg);
    list[idx].last_message = text;
    list[idx].last_message_date = msg.date;
    list[idx].unread_count = 0;
    setStorage(STORAGE_KEYS.CHATS, list);
    return list[idx];
  },

  // Dashboard stats
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
  }
};
