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
  ORDERS: 'polki_crm_orders_v5',
  TRACKING: 'polki_crm_tracking_v4',
  REVIEWS: 'polki_crm_reviews_v4',
  QUESTIONS: 'polki_crm_questions_v4',
  CHATS: 'polki_crm_chats_v4',
  CURRENT_USER: 'polki_crm_current_user_v5',
  USERS: 'polki_crm_users_v5',
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
    id: 'chat-ozon-2',
    marketplace: 'ozon',
    buyer_name: 'Николай',
    product_title: 'Полка Гранит Габбро 60х15 см',
    last_message: 'Завтра сможете отправить?',
    last_message_date: '10.09.2026 10:15',
    unread_count: 1,
    messages: [
      {
        id: 'a1',
        sender: 'buyer',
        text: 'Здравствуйте! Завтра сможете отправить?',
        date: '10.09.2026 10:15',
      }
    ]
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-new-1',
    order_number: 'П-2026-001',
    client_name: 'Александр (Дизайнер)',
    client_phone: '+7 (999) 111-22-33',
    channel: 'telegram',
    client_contact: '@alex_design',
    product_description: 'Две полки из акрилового камня в душевую',
    stone_type: 'Акриловый камень (Белый)',
    dimensions: '400х150х12 мм',
    items: [],
    notes: 'Отправить СДЭКом как можно скорее',
    total_price: 15000,
    prepayment_amount: 15000,
    prepayment_received: true,
    remaining_paid: true,
    tracking_number: '1234567890',
    status: 'in_production',
    accepted_by: 'Руководитель',
    polisher: 'Алексей',
    photos: [],
    created_at: new Date().toISOString(),
  }
];

const INITIAL_TRACKINGS: TrackingItem[] = [
  {
    id: 'trk-new-1',
    tracking_number: '1234567890',
    order_id: 'ord-new-1',
    order_number: 'П-2026-001',
    recipient_name: 'Александр',
    destination_city: 'Москва, ПВЗ Арбат',
    label: 'Полки акрил 2 шт',
    status: 'created',
    estimated_date: '14.09.2026',
    history: [
      {
        date: new Date().toLocaleString('ru-RU'),
        status: 'Создана накладная',
        city: 'Санкт-Петербург',
        description: 'Готов к отправке'
      }
    ]
  }
];

const INITIAL_REVIEWS: MarketplaceReview[] = [];
const INITIAL_QUESTIONS: MarketplaceQuestion[] = [];

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
