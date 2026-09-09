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
  product_title?: string;
  last_message: string;
  last_message_date: string;
  unread_count: number;
  messages: {
    id: string;
    sender: 'buyer' | 'seller';
    text: string;
    date: string;
  }[];
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
