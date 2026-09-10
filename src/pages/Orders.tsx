import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Card, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Switch, 
  Popconfirm, 
  message, 
  Row, 
  Col, 
  Divider, 
  Tooltip,
  Upload,
  Image,
  Segmented,
  Dropdown
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  DollarCircleOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  ShopOutlined, 
  ApartmentOutlined, 
  UserOutlined, 
  ToolOutlined, 
  CameraOutlined,
  CopyOutlined,
  CheckOutlined,
  CrownOutlined,
  CalculatorOutlined,
  PrinterOutlined,
  CarOutlined,
  ScissorOutlined,
  CommentOutlined,
  DownOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { Link, useSearchParams } from 'react-router-dom';
import type { UploadFile } from 'antd';
import type { Order, OrderItem, OrderStatus, ContactChannel } from '../types';
import { dataStore, subscribeDataStore } from '../api/dataStore';
import { StoneCalculatorModal } from '../components/StoneCalculatorModal';
import type { CalculationResult } from '../components/StoneCalculatorModal';
import { OrderTechCardModal } from '../components/OrderTechCardModal';
import { CdekShippingModal } from '../components/CdekShippingModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const statusColors: Record<OrderStatus, string> = {
  'new': 'blue',
  'waiting_prepayment': 'orange',
  'in_production': 'cyan',
  'ready_to_ship': 'purple',
  'in_delivery': 'geekblue',
  'delivered': 'green',
  'completed': 'gold',
  'cancelled': 'red',
};

export const statusLabels: Record<OrderStatus, string> = {
  'new': 'Новый',
  'waiting_prepayment': 'Ждем предоплаты',
  'in_production': 'В производстве',
  'ready_to_ship': 'Готов к отправке',
  'in_delivery': 'В доставке',
  'delivered': 'Доставлен',
  'completed': 'Завершен',
  'cancelled': 'Отменен',
};

export const CHANNEL_CONFIG: Record<ContactChannel, { label: string; color: string; icon?: React.ReactNode }> = {
  telegram: { label: 'Telegram', color: '#229ED9' },
  max: { label: 'Max', color: '#7c3aed' },
  avito: { label: 'Авито', color: '#00AAFF' },
  call: { label: 'Звонок', color: '#10b981', icon: <PhoneOutlined /> },
  marketplace: { label: 'Маркетплейс', color: '#f59e0b', icon: <ShopOutlined /> },
  bitrix: { label: 'Битрикс24', color: '#2fc6f6', icon: <ApartmentOutlined /> },
  email: { label: 'Имейл', color: '#6366f1', icon: <MailOutlined /> },
};

export type QuickSegment = 'all' | 'active' | 'in_delivery' | 'completed' | 'attention';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickSegment, setQuickSegment] = useState<QuickSegment>('all');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [polisherFilter, setPolisherFilter] = useState<string>('all');
  
  // Modals state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  // Generator & Calculator Modals
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [activeCalcItemIndex, setActiveCalcItemIndex] = useState<number | null>(null);
  const [techCardOrder, setTechCardOrder] = useState<Order | null>(null);
  const [techCardDefaultView, setTechCardDefaultView] = useState<'full' | 'thermal'>('full');
  const [cdekShippingOrder, setCdekShippingOrder] = useState<Order | null>(null);

  // Multi-item shelves in current order
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchParams] = useSearchParams();

  // URL Deep-linking: auto-filter and open order modal if passed from Kanban or other screens
  useEffect(() => {
    const searchParam = searchParams.get('search');
    const openId = searchParams.get('openId');
    if (searchParam) {
      setSearchText(searchParam);
      setQuickSegment('all');
      setStatusFilter('all');
    }
    if (openId && orders.length > 0) {
      const found = orders.find(o => o.id === openId || o.order_number === openId);
      if (found) {
        handleOpenEditModal(found);
      }
    }
  }, [searchParams, orders]);

  const currentUser = dataStore.getCurrentUser();
  const users = dataStore.getUsers();

  const uniquePolishers = useMemo(() => {
    const set = new Set<string>();
    orders.forEach(o => {
      if (o.polisher && o.polisher.trim()) {
        set.add(o.polisher.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const loadOrders = () => {
    setLoading(true);
    try {
      const data = dataStore.getOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
      message.error('Не удалось загрузить заказы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('focus', loadOrders);
    const unsubscribe = subscribeDataStore(() => {
      loadOrders();
    });
    return () => {
      window.removeEventListener('focus', loadOrders);
      unsubscribe();
    };
  }, []);

  const handleOpenCreateModal = () => {
    setEditingOrder(null);
    setFileList([]);
    const initialItem: OrderItem = {
      id: 'item-1',
      stone_type: 'Белый мрамор Калакатта',
      dimensions: '800х200х20 мм',
      quantity: 1,
      price: 10000,
      description: 'Еврофаска полированная, скрытый крепеж',
    };
    setOrderItems([initialItem]);
    form.resetFields();
    form.setFieldsValue({
      channel: 'telegram',
      status: 'new',
      total_price: 10000,
      prepayment_amount: 5000,
      prepayment_received: false,
      remaining_paid: false,
      accepted_by: currentUser.name,
      polisher: '',
    });
    setIsModalVisible(true);
  };

  const handleOpenEditModal = (order: Order) => {
    setEditingOrder(order);
    const existingPhotos: UploadFile[] = (order.photos || []).map((url, idx) => ({
      uid: `photo-${idx}`,
      name: `Фото-${idx + 1}.jpg`,
      status: 'done',
      url,
      thumbUrl: url,
    }));
    setFileList(existingPhotos);

    if (order.items && order.items.length > 0) {
      setOrderItems(order.items);
    } else {
      setOrderItems([
        {
          id: 'item-1',
          stone_type: order.stone_type || 'Натуральный камень',
          dimensions: order.dimensions || '600х150х20 мм',
          quantity: 1,
          price: order.total_price || 0,
          description: order.product_description || '',
        }
      ]);
    }

    form.setFieldsValue({
      ...order,
      accepted_by: order.accepted_by || currentUser.name,
      polisher: order.polisher || '',
    });
    setIsModalVisible(true);
  };

  // Helper: recalculate total price from items
  const recalculateFromItems = (items: OrderItem[]) => {
    const total = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
    form.setFieldsValue({
      total_price: total,
      prepayment_amount: Math.round(total * 0.5),
    });
  };

  // Convert upload files to base64 / URL list
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const photoUrls: string[] = fileList.map(f => {
        if (f.url) return f.url;
        if (f.thumbUrl) return f.thumbUrl;
        return '';
      }).filter(Boolean);

      // Primary stone and dimensions summary from items
      const primaryStone = orderItems.length > 0 
        ? orderItems.map(i => `${i.stone_type} (${i.quantity} шт.)`).join('; ')
        : (values.stone_type || 'Натуральный камень');

      const primaryDimensions = orderItems.length > 0
        ? orderItems.map(i => i.dimensions).join(' | ')
        : (values.dimensions || '');

      const payload: Partial<Order> & { id?: string } = {
        ...values,
        id: editingOrder ? editingOrder.id : undefined,
        items: orderItems,
        stone_type: primaryStone,
        dimensions: primaryDimensions,
        photos: photoUrls,
      };

      dataStore.saveOrder(payload);
      message.success(editingOrder ? 'Заказ успешно обновлен' : 'Новый заказ успешно сохранен');
      setIsModalVisible(false);
      loadOrders();
    } catch (e) {
      console.error('Validation failed:', e);
    }
  };

  const handleDeleteOrder = (id: string) => {
    dataStore.deleteOrder(id);
    message.success('Заказ удален');
    loadOrders();
  };

  const handleQuickStatusChange = (orderId: string, newStatus: OrderStatus) => {
    dataStore.updateOrderStatus(orderId, newStatus);
    message.info(`Статус изменен: ${statusLabels[newStatus]}`);
    loadOrders();
  };

  // Handle local file preview in Upload
  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    const processedList = newFileList.map(file => {
      if (file.originFileObj && !file.thumbUrl && !file.url) {
        file.thumbUrl = URL.createObjectURL(file.originFileObj);
        file.url = file.thumbUrl;
      }
      return file;
    });
    setFileList(processedList);
  };

  // Quick segment counts
  const segmentCounts = useMemo(() => {
    return {
      all: orders.length,
      active: orders.filter(o => ['new', 'waiting_prepayment', 'in_production', 'ready_to_ship'].includes(o.status)).length,
      in_delivery: orders.filter(o => o.status === 'in_delivery' || (!!o.tracking_number && !['completed', 'delivered', 'cancelled'].includes(o.status))).length,
      completed: orders.filter(o => ['completed', 'delivered'].includes(o.status)).length,
      attention: orders.filter(o => {
        if (o.status === 'cancelled') return false;
        const unpaidPrepayment = !o.prepayment_received || o.status === 'waiting_prepayment';
        const unpaidRemaining = !o.remaining_paid && (o.total_price > o.prepayment_amount) && ['ready_to_ship', 'in_delivery', 'delivered'].includes(o.status);
        return unpaidPrepayment || unpaidRemaining;
      }).length,
    };
  }, [orders]);

  // Filtered list
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Quick Segment
      if (quickSegment === 'active') {
        if (!['new', 'waiting_prepayment', 'in_production', 'ready_to_ship'].includes(order.status)) return false;
      } else if (quickSegment === 'in_delivery') {
        const isDelivery = order.status === 'in_delivery' || (!!order.tracking_number && !['completed', 'delivered', 'cancelled'].includes(order.status));
        if (!isDelivery) return false;
      } else if (quickSegment === 'completed') {
        if (!['completed', 'delivered'].includes(order.status)) return false;
      } else if (quickSegment === 'attention') {
        if (order.status === 'cancelled') return false;
        const unpaidPrepayment = !order.prepayment_received || order.status === 'waiting_prepayment';
        const unpaidRemaining = !order.remaining_paid && (order.total_price > order.prepayment_amount) && ['ready_to_ship', 'in_delivery', 'delivered'].includes(order.status);
        if (!unpaidPrepayment && !unpaidRemaining) return false;
      }

      // 2. Status dropdown
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // 3. Channel filter
      if (channelFilter !== 'all' && order.channel !== channelFilter) {
        return false;
      }

      // 4. Polisher filter
      if (polisherFilter !== 'all' && order.polisher !== polisherFilter) {
        return false;
      }

      // 5. Search text filter
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        const matchNumber = order.order_number.toLowerCase().includes(q);
        const matchClient = order.client_name.toLowerCase().includes(q);
        const matchStone = !!order.stone_type && order.stone_type.toLowerCase().includes(q);
        const matchPhone = !!order.client_contact && order.client_contact.toLowerCase().includes(q);
        const matchClientPhone = !!order.client_phone && order.client_phone.toLowerCase().includes(q);
        const matchCity = !!order.delivery_city && order.delivery_city.toLowerCase().includes(q);
        const matchPolisher = !!order.polisher && order.polisher.toLowerCase().includes(q);
        const matchAccepted = !!order.accepted_by && order.accepted_by.toLowerCase().includes(q);
        const matchTrack = !!order.tracking_number && order.tracking_number.toLowerCase().includes(q);

        if (!matchNumber && !matchClient && !matchStone && !matchPhone && !matchClientPhone && !matchCity && !matchPolisher && !matchAccepted && !matchTrack) {
          return false;
        }
      }

      return true;
    });
  }, [orders, quickSegment, statusFilter, channelFilter, polisherFilter, searchText]);

  const [copiedTrack, setCopiedTrack] = useState<string | null>(null);

  const handleCopyTracking = (trackNum: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(trackNum);
    setCopiedTrack(trackNum);
    message.success(`Трек-номер ${trackNum} скопирован в буфер обмена!`);
    setTimeout(() => setCopiedTrack(null), 2500);
  };

  const isLuxuryStone = (stoneName?: string) => {
    if (!stoneName) return false;
    const lower = stoneName.toLowerCase();
    return lower.includes('мрамор') || lower.includes('калакатта') || lower.includes('оникс') || lower.includes('травертин') || lower.includes('гранит');
  };

  const columns = [
    {
      title: 'Заказ и статус',
      key: 'order_and_status',
      width: 175,
      render: (_: unknown, record: Order) => (
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-1">
            <button
              type="button"
              onClick={() => handleOpenEditModal(record)}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-left text-sm cursor-pointer p-0 bg-transparent border-0"
              title="Открыть редактирование заказа"
            >
              {record.order_number}
            </button>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              {new Date(record.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <Dropdown
              menu={{
                items: Object.entries(statusLabels).map(([key, label]) => ({
                  key,
                  label: (
                    <div className="flex items-center gap-2 py-0.5">
                      <Tag color={statusColors[key as OrderStatus] || 'default'} className="m-0 text-xs">
                        {label}
                      </Tag>
                    </div>
                  ),
                  onClick: () => handleQuickStatusChange(record.id, key as OrderStatus),
                })),
              }}
              trigger={['click']}
            >
              <Tag
                color={statusColors[record.status] || 'default'}
                className="cursor-pointer hover:opacity-85 transition m-0 text-xs px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1 border-0 shadow-sm"
              >
                <span>{statusLabels[record.status]}</span>
                <DownOutlined className="text-[9px] opacity-60 ml-0.5" />
              </Tag>
            </Dropdown>
          </div>

          {record.tracking_number && (
            <div className="pt-0.5">
              <Tooltip title="Нажмите, чтобы скопировать трек СДЭК">
                <button
                  type="button"
                  onClick={(e) => record.tracking_number && handleCopyTracking(record.tracking_number, e)}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-cyan-300 font-mono cursor-pointer transition active:scale-95"
                >
                  {copiedTrack === record.tracking_number ? (
                    <>
                      <CheckOutlined className="text-emerald-500 text-[10px]" />
                      <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">Скопирован</span>
                    </>
                  ) : (
                    <>
                      <CopyOutlined className="text-slate-400 text-[10px]" />
                      <span>СДЭК: {record.tracking_number}</span>
                    </>
                  )}
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Клиент',
      key: 'client',
      width: 220,
      render: (_: unknown, record: Order) => {
        const ch = record.channel ? CHANNEL_CONFIG[record.channel] : CHANNEL_CONFIG.telegram;
        const customer = record.customer_id ? dataStore.getCustomerById(record.customer_id) : undefined;
        const isRepeat = (customer && customer.orders_count > 1) || record.notes?.includes('Повторный');
        const isVip = customer?.loyalty_tier === 'vip' || customer?.loyalty_tier === 'designer';

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {record.client_name}
              </span>
              {isVip && (
                <Tag color="gold" className="text-[9px] py-0 px-1 m-0 font-bold border-amber-300">
                  ★ VIP
                </Tag>
              )}
              {!isVip && isRepeat && (
                <Tag color="cyan" className="text-[9px] py-0 px-1 m-0 font-bold">
                  ★ Повторный
                </Tag>
              )}
              <Tag color={ch.color} className="text-[10px] py-0 px-1.5 m-0 font-normal inline-flex items-center gap-1">
                {ch.icon}
                <span>{ch.label}</span>
              </Tag>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
              {record.delivery_city && (
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <EnvironmentOutlined className="text-slate-400 text-[10px]" />
                  г. {record.delivery_city}
                </span>
              )}
              {(record.client_phone || record.client_contact) && (
                <span className="inline-flex items-center gap-1 font-mono text-slate-600 dark:text-slate-300">
                  <PhoneOutlined className="text-slate-400 text-[10px]" />
                  {record.client_phone || record.client_contact}
                </span>
              )}
            </div>

            {record.chat_id && (
              <div className="pt-0.5">
                <Link
                  to={`/messages?chatId=${record.chat_id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900 transition hover:bg-blue-100 dark:hover:bg-blue-900/60"
                >
                  <CommentOutlined className="text-[10px]" />
                  <span>Чат маркетплейса</span>
                </Link>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Изделие',
      key: 'product',
      width: 220,
      render: (_: unknown, record: Order) => {
        const isLux = isLuxuryStone(record.stone_type);
        const photos = record.photos || [];
        const hasPhotos = photos.length > 0;

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-900 dark:text-slate-200 text-xs sm:text-sm">
                {record.stone_type || 'Камень не указан'}
              </span>
              {isLux && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full emerald-vein-badge text-emerald-700 dark:text-emerald-300 font-medium inline-flex items-center gap-0.5">
                  <CrownOutlined className="text-[9px]" /> премиум
                </span>
              )}
            </div>

            {record.dimensions && (
              <div className="text-xs text-blue-600 dark:text-cyan-400 font-mono">
                {record.dimensions}
              </div>
            )}

            {record.product_description && (
              <div 
                className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[210px]" 
                title={record.product_description}
              >
                {record.product_description}
              </div>
            )}

            {hasPhotos && (
              <div className="pt-0.5 flex items-center gap-2">
                <Image.PreviewGroup>
                  <div className="relative inline-block cursor-pointer group">
                    <Image
                      src={photos[0]}
                      width={32}
                      height={32}
                      className="rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-sm transition group-hover:opacity-85"
                      fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><rect width='32' height='32' fill='%23334155'/></svg>"
                    />
                    {photos.length > 1 && (
                      <span className="absolute -bottom-1 -right-1 bg-slate-800 text-slate-100 dark:bg-slate-100 dark:text-slate-900 text-[9px] font-bold px-1 rounded-full border border-white dark:border-slate-900 leading-tight">
                        +{photos.length - 1}
                      </span>
                    )}
                  </div>
                  {photos.slice(1).map((url, i) => (
                    <Image key={i} src={url} style={{ display: 'none' }} />
                  ))}
                </Image.PreviewGroup>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  📷 {photos.length} фото
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Оплата',
      key: 'payment',
      width: 160,
      render: (_: unknown, record: Order) => {
        const remaining = Math.max(0, record.total_price - record.prepayment_amount);
        const isFullyPaid = record.remaining_paid || (record.prepayment_received && record.prepayment_amount >= record.total_price);
        const isPrepaid = record.prepayment_received;

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <strong className="text-slate-900 dark:text-slate-100 font-mono text-sm">
                {record.total_price.toLocaleString('ru-RU')} ₽
              </strong>
              {isFullyPaid ? (
                <Tag color="success" className="m-0 text-[10px] py-0 px-1.5 font-medium border-0">
                  Оплачен
                </Tag>
              ) : isPrepaid ? (
                <Tag color="warning" className="m-0 text-[10px] py-0 px-1.5 font-medium border-0">
                  Аванс
                </Tag>
              ) : (
                <Tag color="default" className="m-0 text-[10px] py-0 px-1.5 font-medium text-slate-500 border-0">
                  Ожидание
                </Tag>
              )}
            </div>

            <div className="text-[11px]">
              {isFullyPaid ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Оплачен 100%
                </span>
              ) : isPrepaid ? (
                <span className="text-slate-500 dark:text-slate-400">
                  Остаток: <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{remaining.toLocaleString('ru-RU')} ₽</span>
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">
                  Аванс: <span className="font-semibold font-mono">{record.prepayment_amount.toLocaleString('ru-RU')} ₽</span>
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Цех и мастер',
      key: 'staff',
      width: 170,
      render: (_: unknown, record: Order) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <ToolOutlined className="text-amber-500 text-[11px] shrink-0" />
            <span className="text-slate-500 dark:text-slate-400">Мастер:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]" title={record.polisher || 'Не назначен'}>
              {record.polisher || '—'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <UserOutlined className="text-blue-500 text-[11px] shrink-0" />
            <span className="text-slate-500 dark:text-slate-400">Принял:</span>
            <span className="text-slate-600 dark:text-slate-300 truncate max-w-[110px]" title={record.accepted_by || 'Не указан'}>
              {record.accepted_by || '—'}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Действия',
      key: 'action',
      width: 135,
      render: (_: unknown, record: Order) => (
        <Space size={2}>
          {/* 1. Стикер для резчика */}
          <Tooltip title="Стикер для резчика (на заготовку)">
            <Button 
              type="text" 
              size="small"
              icon={<ScissorOutlined />} 
              onClick={() => {
                setTechCardDefaultView('thermal');
                setTechCardOrder(record);
              }} 
              className="text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 p-1" 
            />
          </Tooltip>

          {/* 2. Техкарта А4 */}
          <Tooltip title="Техкарта и паспорт изделия (А4)">
            <Button 
              type="text" 
              size="small"
              icon={<PrinterOutlined />} 
              onClick={() => {
                setTechCardDefaultView('full');
                setTechCardOrder(record);
              }} 
              className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 p-1" 
            />
          </Tooltip>

          {/* 3. ШК СДЭК через API */}
          <Tooltip title={record.tracking_number ? `ШК СДЭК: ${record.tracking_number} (Печать)` : "Создать накладную и ШК СДЭК"}>
            <Button 
              type="text" 
              size="small"
              icon={<CarOutlined />} 
              onClick={() => setCdekShippingOrder(record)} 
              className={`p-1 ${
                record.tracking_number 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`} 
            />
          </Tooltip>

          <Tooltip title="Редактировать">
            <Button 
              type="text" 
              size="small"
              icon={<EditOutlined />} 
              onClick={() => handleOpenEditModal(record)} 
              className="text-blue-500 hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 p-1" 
            />
          </Tooltip>

          <Popconfirm
            title="Удалить заказ?"
            description="Это действие необратимо."
            okText="Да, удалить"
            cancelText="Отмена"
            onConfirm={() => handleDeleteOrder(record.id)}
          >
            <Tooltip title="Удалить заказ">
              <Button type="text" size="small" icon={<DeleteOutlined />} danger className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Title level={3} style={{ margin: 0 }} className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Заказы каменных полок — «Каменный Ручей»
          </Title>
          <Text className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Учет заказчиков, назначение полировщиков, фиксация принявшего сотрудника и фото изделий
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <Button 
            icon={<CalculatorOutlined />} 
            size="large"
            className="border-emerald-500/80 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 font-medium rounded-xl"
            onClick={() => setIsCalcOpen(true)}
          >
            Калькулятор
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            className="bg-blue-600 hover:bg-blue-500 font-medium rounded-xl"
            onClick={handleOpenCreateModal}
          >
            Новый заказ
          </Button>
        </div>
      </div>


          {/* Quick Segment Tabs */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
            <Segmented
              value={quickSegment}
              onChange={val => {
                setQuickSegment(val as QuickSegment);
                setStatusFilter('all');
              }}
              options={[
                {
                  value: 'all',
                  label: (
                    <span className="flex items-center gap-1.5 py-1 px-1 text-xs sm:text-sm font-medium">
                      <span>Все заказы</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                        {segmentCounts.all}
                      </span>
                    </span>
                  ),
                },
                {
                  value: 'active',
                  label: (
                    <span className="flex items-center gap-1.5 py-1 px-1 text-xs sm:text-sm font-medium">
                      <span>В работе (активные)</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-mono font-semibold">
                        {segmentCounts.active}
                      </span>
                    </span>
                  ),
                },
                {
                  value: 'in_delivery',
                  label: (
                    <span className="flex items-center gap-1.5 py-1 px-1 text-xs sm:text-sm font-medium">
                      <span>В доставке (СДЭК)</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300 font-mono font-semibold">
                        {segmentCounts.in_delivery}
                      </span>
                    </span>
                  ),
                },
                {
                  value: 'completed',
                  label: (
                    <span className="flex items-center gap-1.5 py-1 px-1 text-xs sm:text-sm font-medium">
                      <span>Завершенные</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 font-mono">
                        {segmentCounts.completed}
                      </span>
                    </span>
                  ),
                },
                {
                  value: 'attention',
                  label: (
                    <span className="flex items-center gap-1.5 py-1 px-1 text-xs sm:text-sm font-medium">
                      <span>Требуют внимания</span>
                      {segmentCounts.attention > 0 ? (
                        <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 font-mono font-bold">
                          {segmentCounts.attention}
                        </span>
                      ) : (
                        <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-mono">
                          0
                        </span>
                      )}
                    </span>
                  ),
                },
              ]}
              className="w-full sm:w-auto overflow-x-auto p-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm"
            />
          </div>

          {/* Secondary Filters Bar */}
          <Card className="apple-card rounded-2xl" styles={{ body: { padding: '14px 16px' } }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} md={10} lg={9}>
                <Input
                  placeholder="Поиск по клиенту, городу, номеру, камню, треку..."
                  prefix={<SearchOutlined className="text-slate-400" />}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  allowClear
                  className="w-full"
                />
              </Col>
              <Col xs={24} sm={8} md={5} lg={5}>
                <Select
                  value={channelFilter}
                  onChange={val => setChannelFilter(val)}
                  className="w-full"
                >
                  <Option value="all">Все каналы ({orders.length})</Option>
                  {Object.entries(CHANNEL_CONFIG).map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.label} ({orders.filter(o => o.channel === key).length})
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={8} md={5} lg={5}>
                <Select
                  value={polisherFilter}
                  onChange={val => setPolisherFilter(val)}
                  className="w-full"
                >
                  <Option value="all">Все мастера</Option>
                  {uniquePolishers.map(p => (
                    <Option key={p} value={p}>
                      {p} ({orders.filter(o => o.polisher === p).length})
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={8} md={4} lg={5}>
                <Select
                  value={statusFilter}
                  onChange={val => setStatusFilter(val)}
                  className="w-full"
                >
                  <Option value="all">Все статусы ({orders.length})</Option>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <Option key={key} value={key}>
                      {label} ({orders.filter(o => o.status === key).length})
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>

          {/* Decluttered Table */}
          <Card className="apple-card rounded-2xl overflow-hidden shadow-sm" styles={{ body: { padding: 0 } }}>
            <Table 
              columns={columns} 
              dataSource={filteredOrders} 
              rowKey="id" 
              loading={loading}
              pagination={{ 
                pageSize: 8, 
                showSizeChanger: true, 
                responsive: true,
                showTotal: (total, range) => `Показано ${range[0]}–${range[1]} из ${total} заказов`,
              }}
              scroll={{ x: 1040 }}
            />
          </Card>

      {/* Modal create/edit order */}
      <Modal
        title={
          <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 pr-6">
            {editingOrder ? `Редактирование заказа ${editingOrder.order_number}` : 'Оформление индивидуального заказа'}
          </div>
        }
        open={isModalVisible}
        onOk={handleFormSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={780}
        style={{ top: 20, maxWidth: 'calc(100vw - 20px)' }}
        styles={{ 
          body: { maxHeight: 'calc(80vh - 60px)', overflowY: 'auto', paddingRight: '8px' } 
        }}
        okText={editingOrder ? 'Сохранить изменения' : 'Создать заказ'}
        cancelText="Отмена"
        okButtonProps={{ className: 'bg-blue-600 hover:bg-blue-500' }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Divider titlePlacement="start" className="!text-blue-400 !m-0 !mb-3">
            Ответственные сотрудники
          </Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="accepted_by" 
                label="Заказ принял (Менеджер / Администратор)"
                rules={[{ required: true, message: 'Укажите, кто принял заказ' }]}
              >
                <Select placeholder="Кто принял заказ">
                  {users.map(u => (
                    <Option key={u.id} value={u.name}>
                      {u.name} — {u.roleTitle}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="polisher" 
                label="Исполнитель / Мастер-полировщик"
              >
                <Select 
                  placeholder="Выберите мастера-полировщика" 
                  allowClear
                  showSearch
                >
                  {dataStore.getMasters().map(m => (
                    <Option key={m.id} value={m.name}>
                      🛠️ {m.name} ({m.specialty})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="start" className="!text-blue-400 !m-0 !mb-3">
            Клиент и канал связи
          </Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="client_name" 
                label="ФИО / Имя заказчика" 
                rules={[{ required: true, message: 'Укажите имя клиента' }]}
              >
                <Input placeholder="Например: Иван Смирнов" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="channel" 
                label="Канал связи / Источник обращения"
                rules={[{ required: true, message: 'Выберите канал связи' }]}
              >
                <Select placeholder="Откуда поступил заказ">
                  {Object.entries(CHANNEL_CONFIG).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <span className="flex items-center gap-1.5">
                        {config.icon}
                        {config.label}
                      </span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="client_phone" label="Номер телефона">
                <Input placeholder="+7 (999) 000-00-00" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="client_contact" label="Детали контакта / Логин / Чат">
                <Input placeholder="@telegram, чат Авито, номер лида Битрикс24..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="start" className="!text-blue-400 !m-0 !mb-3">
            <span className="flex items-center justify-between w-full flex-wrap gap-2">
              <span>Изделия в заказе ({orderItems.length} поз.)</span>
              <div className="flex gap-1.5">
                <Button 
                  type="dashed" 
                  size="small" 
                  icon={<CalculatorOutlined />} 
                  onClick={() => {
                    setActiveCalcItemIndex(null);
                    setIsCalcOpen(true);
                  }}
                  className="text-emerald-400 border-emerald-500/60 bg-emerald-950/30 hover:!text-emerald-300 hover:!border-emerald-400 text-xs"
                >
                  Калькулятор полки
                </Button>
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<PlusOutlined />} 
                  onClick={() => {
                    const newItem: OrderItem = {
                      id: 'item-' + Date.now(),
                      stone_type: 'Черный гранит Габбро',
                      dimensions: '600х150х20 мм',
                      quantity: 1,
                      price: 6500,
                      description: 'Еврофаска полированная',
                    };
                    const updated = [...orderItems, newItem];
                    setOrderItems(updated);
                    recalculateFromItems(updated);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-xs"
                >
                  Добавить еще изделие
                </Button>
              </div>
            </span>
          </Divider>

          {/* Dynamic list of shelves */}
          <div className="space-y-3 mb-4">
            {orderItems.map((item, idx) => (
              <div key={item.id || idx} className="p-3 bg-slate-900/70 rounded-lg border border-slate-700 relative">
                <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-800">
                  <span className="text-xs font-bold text-blue-400">
                    Позиция #{idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="small" 
                      type="text" 
                      icon={<CalculatorOutlined className="text-emerald-400" />} 
                      onClick={() => {
                        setActiveCalcItemIndex(idx);
                        setIsCalcOpen(true);
                      }}
                      className="text-[11px] text-slate-300"
                    >
                      Пересчитать
                    </Button>
                    {orderItems.length > 1 && (
                      <Button 
                        size="small" 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => {
                          const updated = orderItems.filter((_, i) => i !== idx);
                          setOrderItems(updated);
                          recalculateFromItems(updated);
                        }}
                      />
                    )}
                  </div>
                </div>

                <Row gutter={[12, 10]}>
                  <Col xs={24} sm={12}>
                    <div className="text-[11px] text-slate-400 mb-0.5">Порода и сорт камня:</div>
                    <Input 
                      placeholder="Белый мрамор Калакатта, Гранит..." 
                      value={item.stone_type}
                      onChange={e => {
                        const updated = [...orderItems];
                        updated[idx].stone_type = e.target.value;
                        setOrderItems(updated);
                      }}
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="text-[11px] text-slate-400 mb-0.5">Габариты (ДхШхТ мм):</div>
                    <Input 
                      placeholder="800х200х20 мм" 
                      value={item.dimensions}
                      onChange={e => {
                        const updated = [...orderItems];
                        updated[idx].dimensions = e.target.value;
                        setOrderItems(updated);
                      }}
                    />
                  </Col>
                  <Col xs={12} sm={4}>
                    <div className="text-[11px] text-slate-400 mb-0.5">Кол-во:</div>
                    <InputNumber 
                      min={1} 
                      max={99} 
                      value={item.quantity}
                      onChange={v => {
                        const updated = [...orderItems];
                        updated[idx].quantity = v || 1;
                        setOrderItems(updated);
                        recalculateFromItems(updated);
                      }}
                      className="w-full"
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <div className="text-[11px] text-slate-400 mb-0.5">Цена за 1 шт. (₽):</div>
                    <InputNumber 
                      min={0} 
                      step={500} 
                      value={item.price}
                      onChange={v => {
                        const updated = [...orderItems];
                        updated[idx].price = v || 0;
                        setOrderItems(updated);
                        recalculateFromItems(updated);
                      }}
                      className="w-full"
                    />
                  </Col>
                  <Col xs={24} sm={16}>
                    <div className="text-[11px] text-slate-400 mb-0.5">Обработка кромки / крепление / вырезы:</div>
                    <Input 
                      placeholder="Еврофаска, скрытый крепеж, вырез..." 
                      value={item.description}
                      onChange={e => {
                        const updated = [...orderItems];
                        updated[idx].description = e.target.value;
                        setOrderItems(updated);
                      }}
                    />
                  </Col>
                </Row>
              </div>
            ))}
          </div>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label="Фотографии заготовок / готовых изделий (до 5 шт.)">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={() => false}
                  multiple
                >
                  {fileList.length < 5 && (
                    <div className="text-center text-slate-400">
                      <CameraOutlined className="text-xl" />
                      <div className="text-xs mt-1">Добавить фото</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="notes" label="Внутренние заметки мастера-полировщика">
                <TextArea rows={2} placeholder="Пожелания по гидрофобной пропитке, особенности структуры слэба, упаковка..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="start" className="!text-blue-400 !m-0 !mb-3">
            Финансы и доставка СДЭК
          </Divider>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item 
                name="total_price" 
                label="Общая стоимость (₽)" 
                rules={[{ required: true, message: 'Укажите цену' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  prefix={<DollarCircleOutlined />} 
                  min={0} 
                  step={500} 
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="prepayment_amount" label="Сумма аванса (₽)">
                <InputNumber style={{ width: '100%' }} min={0} step={500} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="tracking_number" label="Накладная СДЭК">
                <Input placeholder="Трек-номер СДЭК" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="prepayment_received" 
                label="Предоплата получена" 
                valuePropName="checked"
              >
                <Switch checkedChildren="Получена" unCheckedChildren="Ожидается" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                name="remaining_paid" 
                label="Полная оплата закрыта" 
                valuePropName="checked"
              >
                <Switch checkedChildren="Да, полностью" unCheckedChildren="Есть остаток" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="status" label="Текущий производственный статус">
                <Select>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <Option key={key} value={key}>{label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Stone Calculator Modal */}
      <StoneCalculatorModal
        visible={isCalcOpen}
        onClose={() => {
          setIsCalcOpen(false);
          setActiveCalcItemIndex(null);
        }}
        onApply={(result: CalculationResult) => {
          if (activeCalcItemIndex !== null && orderItems[activeCalcItemIndex]) {
            // Update targeted shelf item
            const updated = [...orderItems];
            updated[activeCalcItemIndex] = {
              ...updated[activeCalcItemIndex],
              stone_type: result.stoneType,
              dimensions: result.dimensions,
              price: result.totalPrice,
              description: result.description,
            };
            setOrderItems(updated);
            recalculateFromItems(updated);
          } else {
            // Either add a new item or replace if orderItems has only 1 default empty item
            const newItem: OrderItem = {
              id: 'item-' + Date.now(),
              stone_type: result.stoneType,
              dimensions: result.dimensions,
              quantity: 1,
              price: result.totalPrice,
              description: result.description,
            };
            const updated = orderItems.length === 0 ? [newItem] : [...orderItems, newItem];
            setOrderItems(updated);
            recalculateFromItems(updated);
          }

          if (!isModalVisible) {
            setIsModalVisible(true);
          }
          setActiveCalcItemIndex(null);
          message.success('Параметры и расчет стоимости перенесены в заказ!');
        }}
      />

      {/* Workshop Tech Card & Thermal Sticker Modal */}
      <OrderTechCardModal
        order={techCardOrder}
        visible={!!techCardOrder}
        onClose={() => setTechCardOrder(null)}
        defaultView={techCardDefaultView}
      />

      {/* Thermal Shipping Sticker Modal */}
      <CdekShippingModal
        order={cdekShippingOrder}
        visible={!!cdekShippingOrder}
        onClose={() => setCdekShippingOrder(null)}
        onSuccess={() => loadOrders()}
      />
    </div>
  );
};

export default Orders;
