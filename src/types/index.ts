export type OrderStatus = 
  | 'new'
  | 'waiting_prepayment'
  | 'in_production'
  | 'ready_to_ship'
  | 'in_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type ContactChannel = 
  | 'telegram'
  | 'max'
  | 'avito'
  | 'call'
  | 'marketplace'
  | 'bitrix'
  | 'email';

export type UserRole = 'manager' | 'polisher' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  avatar?: string;
}

// Отдельное изделие (полка) внутри заказа
export interface OrderItem {
  id: string;
  stone_type: string;           // Порода камня
  dimensions: string;           // ДхШхТ мм
  quantity: number;             // Количество одинаковых изделий
  price: number;                // Цена за единицу
  description?: string;         // Конфигурация (фаска, вырезы, полировка)
}

export interface Order {
  id: string;
  order_number: string;
  client_name: string;
  client_phone?: string;
  channel?: ContactChannel;
  client_contact?: string;
  items?: OrderItem[];          // Список изделий в заказе
  product_description?: string; // Общее описание / комментарии
  stone_type: string;           // Основная порода (или сводное описание)
  dimensions: string;           // Основные габариты
  notes?: string;
  total_price: number;
  prepayment_amount: number;
  prepayment_received: boolean;
  remaining_paid: boolean;
  tracking_number?: string;
  status: OrderStatus;
  accepted_by?: string;         // Менеджер, принявший заказ
  polisher?: string;            // Мастер-полировщик
  photos?: string[];            // Фото заготовок / готовых полок
  customer_id?: string;         // Привязанный клиент в базе
  chat_id?: string;             // Привязанный диалог
  chat_marketplace?: MarketplaceType;
  delivery_city?: string;       // Город доставки
  delivery_address?: string;    // Полный адрес доставки
  created_at: string;
  updated_at?: string;
}

export interface TrackingHistoryItem {
  date: string;
  status: string;
  city: string;
  description: string;
}

export interface TrackingItem {
  id: string;
  tracking_number: string;
  order_id?: string;
  order_number?: string;
  recipient_name: string;
  destination_city: string;
  label?: string;
  status: 'created' | 'sent' | 'in_transit' | 'pvz_ready' | 'delivered' | 'returned';
  estimated_date?: string;
  history: TrackingHistoryItem[];
}

export type MarketplaceType = 'ozon' | 'wildberries' | 'yandex';

export interface MarketplaceReview {
  id: string;
  marketplace: MarketplaceType;
  product_name: string;
  author: string;
  rating: number;
  text: string;
  pros?: string;
  cons?: string;
  review_date: string;
  is_answered: boolean;
  reply_text?: string;
}

export interface MarketplaceQuestion {
  id: string;
  marketplace: MarketplaceType;
  product_name: string;
  author: string;
  question_text: string;
  question_date: string;
  is_answered: boolean;
  answer_text?: string;
}

export interface MarketplaceChat {
  id: string;
  marketplace: MarketplaceType;
  buyer_name: string;
  buyer_phone?: string;
  buyer_city?: string;
  customer_id?: string;
  linked_order_id?: string;
  linked_order_number?: string;
  product_title?: string;
  last_message: string;
  last_message_date: string;
  unread_count: number;
  messages: {
    id: string;
    sender: 'buyer' | 'seller';
    text: string;
    date: string;
    photos?: string[];
  }[];
}

export type LoyaltyTier = 'new' | 'repeat' | 'vip' | 'designer';

export interface CustomerChannelIdentity {
  channel: ContactChannel;
  identifier: string;          // телефон, username, Ozon Buyer ID, etc.
  marketplace?: MarketplaceType;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  normalized_phone?: string;    // только цифры, например "79161234567"
  email?: string;
  city?: string;
  address?: string;
  orders_count: number;
  total_spent: number;          // LTV в рублях
  first_order_date: string;
  last_order_date: string;
  loyalty_tier: LoyaltyTier;
  channels: ContactChannel[];
  channel_identities?: CustomerChannelIdentity[];
  notes?: string;
  tags?: string[];              // ['VIP', 'Дизайнер', 'Оптовик', 'Постоянный']
  linked_order_ids: string[];
  linked_chat_ids: string[];
}

export interface CustomerMergeSuggestion {
  id: string;
  primaryCustomerId: string;
  candidateCustomerId: string;
  matchType: 'address' | 'name_city' | 'phone_partial';
  matchReason: string;
  confidence: 'high' | 'medium';
  created_at: string;
}

export interface DashboardStats {
  total_orders: number;
  active_orders: number;
  total_revenue: number;
  new_reviews_count: number;
  unanswered_questions_count: number;
  deliveries_in_progress: number;
  orders_by_status: Record<string, number>;
  stone_popularity: { stone: string; count: number; percentage: number }[];
  orders_by_channel?: Record<string, number>;
}

export type MaterialCategory = 'marble' | 'granite' | 'onyx' | 'quartz' | 'acrylic' | 'travertine';

export interface StoneSlab {
  id: string;
  name: string;
  category: MaterialCategory;
  origin?: string;             // Страна происхождения (Италия, Карелия, Турция, etc.)
  dimensions: string;          // ДхШхТ мм
  length_mm: number;
  width_mm: number;
  thickness_mm: number;
  area_m2: number;             // Площадь в м²
  quantity: number;            // Количество штук
  is_offcut: boolean;          // Деловой обрезок (остаток) или целый слэб
  price_per_m2: number;        // Цена/себестоимость за м²
  location?: string;           // Стеллаж / зона склада
  status: 'in_stock' | 'reserved' | 'low_stock';
  reserved_for_order?: string; // Номер заказа
  photo_url?: string;
  notes?: string;
  created_at: string;
}

export interface TemplateItem {
  id: string;
  text: string;
  folder: string;
}

// --- УЧЕТ ЗАРПЛАТ И СДЕЛЬЩИНЫ МАСТЕРОВ ---
export interface Master {
  id: string;
  name: string;
  specialty: 'резчик' | 'полировщик' | 'универсал' | 'упаковщик';
  phone?: string;
  isActive: boolean;
}

// Шаблоны типовых серийных изделий с маркетплейсов с фиксированной ставкой сдельной оплаты
export interface StandardPieceworkRate {
  id: string;
  name: string;             // например "Полка Ozon/WB 400x150 мм"
  category: 'marketplace_serial' | 'individual' | 'processing';
  dimensions: string;       // "400х150х20 мм"
  stone_type: string;       // "Гранит / Мрамор / Агломерат"
  rate_rub: number;         // Ставка оплаты мастеру за 1 шт (например 350 руб)
  description?: string;
}

// Запись о выполненном изделии
export interface ProductionLogItem {
  id: string;
  date: string;             // YYYY-MM-DD или DD.MM.YYYY
  master_id: string;
  master_name: string;
  item_type: 'marketplace_serial' | 'individual'; // Серийное с маркетплейса или Индивидуальный заказ
  order_number?: string;    // Если привязано к заказу (например КР-305)
  product_name: string;     // Наименование (например "Полка прямая WB 500x150")
  stone_type: string;       // Порода камня
  dimensions: string;       // Размеры ДхШхТ мм
  quantity: number;         // Количество штук
  rate_per_unit: number;    // Ставка за единицу (руб)
  total_salary: number;     // Итого начислено: quantity * rate_per_unit
  comment?: string;         // Комментарий (сложная фаска, скол, переделка и т.п.)
  created_at: string;
}


// --- ПОДСИСТЕМА ФОРМИРОВАНИЯ ПОСТАВОК FBO (FBW) ---
export type FboMarketplace = 'ozon' | 'wildberries' | 'yandex';
export type FboSupplyStatus = 
  | 'draft'          // Формируется в CRM
  | 'in_production' // На распиле/полировке в цехе
  | 'packed'        // Упаковано в короба/палеты, оклеено
  | 'timeslot_booked' // Забронирован таймслот
  | 'shipped'       // Передано водителю / СДЭК Кросс-докинг
  | 'accepted'      // Принято складом маркетплейса
  | 'cancelled';

export interface FboItemRecommendation {
  id: string;
  article: string;            // Артикул WB/Ozon (например "POLKA-GABBRO-400")
  barcode: string;            // Штрихкод EAN-13
  name: string;               // Наименование полки
  stone_type: string;         // Порода камня
  dimensions: string;         // 400х150х20 мм
  marketplace: FboMarketplace;
  price_rub: number;          // Розничная цена на маркетплейсе
  fbs_sales_30d: number;      // Продано по FBS за 30 дней (шт)
  current_fbo_stock: number;  // Текущий остаток на складе FBO (шт)
  current_workshop_stock: number; // Наличие готовых на складе цеха (шт)
  velocity_per_day: number;   // Скорость продаж (шт/день)
  days_of_supply: number;     // На сколько дней хватит остатка
  recommended_qty: number;    // Рекомендуемое количество к поставке
  demand_level: 'high' | 'medium' | 'low'; // Уровень спроса
  reason: string;             // Причина рекомендации (хит продаж, остаток на 3 дня и т.п.)
}

export interface FboSupplyItem {
  id: string;
  article: string;
  barcode: string;
  name: string;
  stone_type: string;
  dimensions: string;
  quantity: number;           // Количество к поставке
  box_number?: number;        // Номер короба (для ШК коробов)
  price_rub: number;
}

export interface FboSupplyBox {
  id: string;
  box_number: number;
  barcode: string;            // Штрихкод короба (Ozon Box Barcode / WB ШК короба)
  items_count: number;
  weight_kg: number;
  dimensions_cm: string;      // ДхШхВ (например 60х40х30)
}

export interface FboSupply {
  id: string;
  supply_number: string;      // Например FBO-OZ-2026-04
  marketplace: FboMarketplace;
  status: FboSupplyStatus;
  destination_warehouse: string; // Например "Ozon Гривно (Хоругвино)" или "WB Коледино"
  warehouse_id?: string;
  cluster_name?: string;      // Кластер назначения
  created_at: string;
  planned_date: string;       // Дата отгрузки
  timeslot?: string;          // Время таймслота (например "10:00 - 12:00")
  total_items: number;
  total_boxes: number;
  total_cost_rub: number;
  items: FboSupplyItem[];
  boxes: FboSupplyBox[];
  api_draft_id?: string;      // ID черновика Ozon API / WB Draft ID
  api_supply_id?: string;     // Боевой Supply ID маркетплейса
  notes?: string;
}
