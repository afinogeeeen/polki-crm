import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Tag, 
  Button, 
  Input, 
  Select, 
  Tooltip, 
  message, 
  Dropdown
} from 'antd';
import type { MenuProps } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  UserOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CarOutlined, 
  PrinterOutlined, 
  TagOutlined, 
  EditOutlined, 
  ArrowRightOutlined, 
  ArrowLeftOutlined,
  ToolOutlined,
  ScissorOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import type { Order, OrderStatus } from '../types';
import { dataStore, subscribeDataStore } from '../api/dataStore';
import { OrderTechCardModal } from '../components/OrderTechCardModal';
import { CdekShippingModal } from '../components/CdekShippingModal';
import { CHANNEL_CONFIG } from './Orders';
import { useTheme } from '../context/ThemeContext';

const { Text } = Typography;
const { Option } = Select;

interface KanbanColumnConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  statuses: OrderStatus[];
  defaultNextStatus?: OrderStatus;
  nextButtonLabel?: string;
  defaultPrevStatus?: OrderStatus;
  accentColor: string;
  badgeBg: string;
  headerBgDark: string;
  headerBgLight: string;
}

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    id: 'col_new',
    title: 'Принят / Ожидание',
    icon: <ClockCircleOutlined />,
    statuses: ['new', 'waiting_prepayment'],
    defaultNextStatus: 'in_production',
    nextButtonLabel: 'В производство',
    accentColor: '#0284c7',
    badgeBg: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    headerBgDark: 'bg-sky-950/30 border-sky-900/50',
    headerBgLight: 'bg-sky-50/80 border-sky-200/80',
  },
  {
    id: 'col_production',
    title: 'В цехе (Распил / Полировка)',
    icon: <ToolOutlined />,
    statuses: ['in_production'],
    defaultNextStatus: 'ready_to_ship',
    nextButtonLabel: 'Готов к отправке',
    defaultPrevStatus: 'waiting_prepayment',
    accentColor: '#0d9488',
    badgeBg: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800',
    headerBgDark: 'bg-teal-950/30 border-teal-900/50',
    headerBgLight: 'bg-teal-50/80 border-teal-200/80',
  },
  {
    id: 'col_ready',
    title: 'Готовы (Упаковка / ОТК)',
    icon: <TagOutlined />,
    statuses: ['ready_to_ship'],
    defaultNextStatus: 'in_delivery',
    nextButtonLabel: 'Передать в СДЭК',
    defaultPrevStatus: 'in_production',
    accentColor: '#7c3aed',
    badgeBg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    headerBgDark: 'bg-purple-950/30 border-purple-900/50',
    headerBgLight: 'bg-purple-50/80 border-purple-200/80',
  },
  {
    id: 'col_delivery',
    title: 'В доставке (СДЭК)',
    icon: <CarOutlined />,
    statuses: ['in_delivery'],
    defaultNextStatus: 'delivered',
    nextButtonLabel: 'Вручен клиенту',
    defaultPrevStatus: 'ready_to_ship',
    accentColor: '#2563eb',
    badgeBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    headerBgDark: 'bg-blue-950/30 border-blue-900/50',
    headerBgLight: 'bg-blue-50/80 border-blue-200/80',
  },
  {
    id: 'col_done',
    title: 'Доставлены (<3 дн)',
    icon: <CheckCircleOutlined />,
    statuses: ['delivered', 'completed'],
    defaultPrevStatus: 'in_delivery',
    accentColor: '#059669',
    badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    headerBgDark: 'bg-emerald-950/30 border-emerald-900/50',
    headerBgLight: 'bg-emerald-50/80 border-emerald-200/80',
  },
];

interface KanbanProps {
  onOpenOrderModal?: (order?: Order) => void;
}

function parseOrderDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (parts) {
    const [, d, m, y] = parts;
    const timeMatch = dateStr.match(/(\d{2}):(\d{2})/);
    const hour = timeMatch ? parseInt(timeMatch[1], 10) : 12;
    const min = timeMatch ? parseInt(timeMatch[2], 10) : 0;
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10), hour, min);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export const Kanban: React.FC<KanbanProps> = ({ onOpenOrderModal }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchText, setSearchText] = useState('');
  const [masterFilter, setMasterFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  
  // Drag state
  const [draggingOrderId, setDraggingOrderId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Modals
  const [techCardOrder, setTechCardOrder] = useState<Order | null>(null);
  const [techCardDefaultView, setTechCardDefaultView] = useState<'full' | 'thermal'>('full');
  const [cdekShippingOrder, setCdekShippingOrder] = useState<Order | null>(null);

  // Viewed Done Orders (<3 days filter & hiding)
  const [viewedOrderIds, setViewedOrderIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('polki_crm_viewed_done_orders_v1') || '[]');
    } catch {
      return [];
    }
  });
  const [showViewedDone, setShowViewedDone] = useState(false);

  const { isDark } = useTheme();

  const saveViewedOrderIds = (ids: string[]) => {
    setViewedOrderIds(ids);
    try {
      localStorage.setItem('polki_crm_viewed_done_orders_v1', JSON.stringify(ids));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsViewed = (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!viewedOrderIds.includes(orderId)) {
      const next = [...viewedOrderIds, orderId];
      saveViewedOrderIds(next);
      message.success('Заказ скрыт с канбан-доски');
    }
  };

  const handleUnmarkViewed = (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = viewedOrderIds.filter(id => id !== orderId);
    saveViewedOrderIds(next);
    message.info('Заказ возвращен на доску');
  };

  const loadOrders = () => {
    try {
      setOrders(dataStore.getOrders());
    } catch (e) {
      console.error(e);
      message.error('Ошибка при загрузке заказов');
    }
  };

  useEffect(() => {
    loadOrders();
    const unsub = subscribeDataStore(() => loadOrders());
    return () => unsub();
  }, []);

  const uniqueMasters = useMemo(() => {
    const set = new Set<string>();
    orders.forEach(o => {
      if (o.polisher?.trim()) set.add(o.polisher.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (masterFilter !== 'all' && o.polisher !== masterFilter) return false;
      if (channelFilter !== 'all' && o.channel !== channelFilter) return false;
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        const matchNumber = o.order_number?.toLowerCase().includes(q);
        const matchName = o.client_name?.toLowerCase().includes(q);
        const matchStone = o.stone_type?.toLowerCase().includes(q);
        const matchPhone = o.client_phone?.toLowerCase().includes(q);
        if (!matchNumber && !matchName && !matchStone && !matchPhone) return false;
      }
      return true;
    });
  }, [orders, masterFilter, channelFilter, searchText]);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = dataStore.updateOrderStatus(orderId, newStatus);
    if (updated) {
      message.success(`Заказ ${updated.order_number} перемещен`);
      loadOrders();
    }
  };

  const handleReassignMaster = (orderId: string, newMaster: string) => {
    dataStore.saveOrder({ id: orderId, polisher: newMaster });
    message.success(`Мастер изменен на «${newMaster}»`);
    loadOrders();
  };

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('text/plain', orderId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingOrderId(orderId);
  };

  const handleDragEnd = () => {
    setDraggingOrderId(null);
    setDragOverColId(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = (colId: string) => {
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, col: KanbanColumnConfig) => {
    e.preventDefault();
    setDragOverColId(null);
    const orderId = e.dataTransfer.getData('text/plain') || draggingOrderId;
    if (!orderId) return;

    const targetStatus = col.statuses[0];
    const order = orders.find(o => o.id === orderId);
    if (order && !col.statuses.includes(order.status)) {
      handleUpdateStatus(orderId, targetStatus);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Filters, search, stats */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Input
              placeholder="Поиск по номеру, клиенту или камню..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              className="w-full sm:w-64 rounded-xl"
            />

            <Select
              value={masterFilter}
              onChange={setMasterFilter}
              className="w-36 sm:w-44 rounded-xl"
              popupMatchSelectWidth={false}
            >
              <Option value="all">Все мастера</Option>
              {uniqueMasters.map(m => (
                <Option key={m} value={m}>🛠️ {m}</Option>
              ))}
            </Select>

            <Select
              value={channelFilter}
              onChange={setChannelFilter}
              className="w-36 sm:w-44 rounded-xl"
              popupMatchSelectWidth={false}
            >
              <Option value="all">Все каналы</Option>
              {Object.entries(CHANNEL_CONFIG).map(([key, conf]) => (
                <Option key={key} value={key}>{conf.label}</Option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              Показано заказов: <span className="font-bold text-slate-800 dark:text-slate-200">{filteredOrders.length}</span>
            </Text>
            {onOpenOrderModal && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => onOpenOrderModal()}
                className="bg-blue-600 hover:bg-blue-500 rounded-xl font-medium shadow-sm"
              >
                Новый заказ
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[calc(100vh-230px)]">
        {KANBAN_COLUMNS.map(col => {
          let colOrders: Order[];
          let hiddenViewedCount = 0;

          // Reference date for "today": latest order in dataset or browser now
          const referenceNow = orders.reduce((max, o) => {
            const d = parseOrderDate(o.created_at);
            return d && d.getTime() > max ? d.getTime() : max;
          }, Date.now());

          if (col.id === 'col_done') {
            const doneOrders = filteredOrders.filter(o => col.statuses.includes(o.status));
            // Keep only completed/delivered within the last 3 days
            const recentDone = doneOrders.filter(o => {
              const d = parseOrderDate(o.created_at);
              const diffDays = d ? (referenceNow - d.getTime()) / (1000 * 60 * 60 * 24) : 999;
              return diffDays <= 3.2;
            });
            hiddenViewedCount = recentDone.filter(o => viewedOrderIds.includes(o.id)).length;
            colOrders = showViewedDone ? recentDone : recentDone.filter(o => !viewedOrderIds.includes(o.id));
          } else {
            colOrders = filteredOrders.filter(o => col.statuses.includes(o.status));
          }

          const colTotalRevenue = colOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
          const isOver = dragOverColId === col.id;

          const handleMarkAllDoneAsViewed = () => {
            if (colOrders.length === 0) return;
            const ids = colOrders.map(o => o.id);
            const merged = Array.from(new Set([...viewedOrderIds, ...ids]));
            saveViewedOrderIds(merged);
            message.success(`Отмечено просмотренными: ${ids.length} заказов`);
          };

          return (
            <div
              key={col.id}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={() => handleDragLeave(col.id)}
              onDrop={e => handleDrop(e, col)}
              className={`flex-shrink-0 w-80 md:w-84 rounded-2xl border transition-all duration-200 flex flex-col max-h-[calc(100vh-220px)] ${
                isDark 
                  ? 'bg-slate-900/40 border-slate-800/80' 
                  : 'bg-slate-100/70 border-slate-200/80'
              } ${
                isOver 
                  ? isDark 
                    ? 'ring-2 ring-blue-500/70 bg-blue-950/20' 
                    : 'ring-2 ring-blue-400 bg-blue-50/50' 
                  : ''
              }`}
            >
              {/* Column Header */}
              <div className={`p-3.5 border-b rounded-t-2xl transition-colors ${
                isDark ? col.headerBgDark : col.headerBgLight
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ color: col.accentColor }} className="text-base">
                      {col.icon}
                    </span>
                    <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
                      {col.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {col.id === 'col_done' && colOrders.length > 0 && !showViewedDone && (
                      <Tooltip title="Отметить все заказы в колонке как просмотренные и скрыть">
                        <Button
                          size="small"
                          type="text"
                          icon={<CheckCircleOutlined className="text-emerald-600 dark:text-emerald-400" />}
                          onClick={handleMarkAllDoneAsViewed}
                          className="text-[11px] h-6 px-1.5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 rounded-lg flex items-center font-medium"
                        >
                          Все просмотрены
                        </Button>
                      </Tooltip>
                    )}
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${col.badgeBg}`}>
                      {colOrders.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>{col.id === 'col_done' ? 'Сумма свежих:' : 'Сумма этапа:'}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {colTotalRevenue.toLocaleString('ru-RU')} ₽
                  </span>
                </div>

                {/* Subtitle toggle for viewed done orders */}
                {col.id === 'col_done' && hiddenViewedCount > 0 && (
                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Скрыто просмотренных: <strong className="text-slate-800 dark:text-slate-200">{hiddenViewedCount}</strong></span>
                    <button
                      type="button"
                      onClick={() => setShowViewedDone(!showViewedDone)}
                      className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-semibold"
                    >
                      {showViewedDone ? 'Скрыть просмотренные' : 'Показать'}
                    </button>
                  </div>
                )}
              </div>

              {/* Cards list (Scrollable) */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-[140px]">
                {colOrders.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-8 rounded-xl border border-dashed text-xs ${
                    isDark ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'
                  }`}>
                    <span>Нет заказов на этапе</span>
                    <span className="text-[10px] mt-1 opacity-70">Перетащите карточку сюда</span>
                  </div>
                ) : (
                  colOrders.map(order => {
                    const isDraggingThis = draggingOrderId === order.id;
                    const channelInfo = order.channel ? CHANNEL_CONFIG[order.channel] : CHANNEL_CONFIG.telegram;
                    const itemsCount = order.items?.length || 1;
                    const isFullyPaid = order.prepayment_received && order.remaining_paid;

                    const allAvailableMasters = Array.from(new Set([
                      ...dataStore.getMasters().map(m => m.name),
                      ...uniqueMasters
                    ]));

                    const masterMenuItems: MenuProps['items'] = [
                      { key: 'unassigned', label: '— Без мастера —', onClick: () => handleReassignMaster(order.id, '') },
                      { type: 'divider' },
                      ...allAvailableMasters.map(m => ({
                        key: m,
                        label: `🛠️ ${m}`,
                        onClick: () => handleReassignMaster(order.id, m)
                      }))
                    ];

                    return (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={e => handleDragStart(e, order.id)}
                        onDragEnd={handleDragEnd}
                        className={`p-3.5 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing group hover:shadow-md ${
                          isDark 
                            ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200' 
                            : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-800 shadow-sm'
                        } ${isDraggingThis ? 'opacity-40 scale-95 border-dashed border-blue-500' : ''}`}
                      >
                        {/* Top: Order # & Channel Tag */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span 
                            onClick={() => {
                              if (onOpenOrderModal) {
                                onOpenOrderModal(order);
                              } else {
                                navigate(`/orders?search=${encodeURIComponent(order.order_number)}&openId=${encodeURIComponent(order.id)}`);
                              }
                            }}
                            className="font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            title="Открыть заказ в реестре"
                          >
                            {order.order_number}
                          </span>
                          <Tag 
                            className="text-[10px] font-semibold m-0 px-2 py-0.5 rounded-full border-0"
                            style={{ backgroundColor: `${channelInfo?.color}22`, color: channelInfo?.color }}
                          >
                            {channelInfo?.label || order.channel}
                          </Tag>
                        </div>

                        {/* Client Name */}
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate mb-1">
                          {order.client_name}
                        </div>

                        {/* Stone Type & Dimensions */}
                        <div className={`p-2 rounded-lg text-xs mb-2 border ${
                          isDark 
                            ? 'bg-slate-950/60 border-slate-800/80 text-slate-300' 
                            : 'bg-slate-50 border-slate-200/70 text-slate-700'
                        }`}>
                          <div className="font-semibold truncate text-[11px] text-slate-900 dark:text-slate-100">
                            🪨 {order.stone_type}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            <span>{order.dimensions}</span>
                            <span className="font-bold text-slate-600 dark:text-slate-300">
                              {itemsCount} {itemsCount === 1 ? 'изделие' : 'изделия'}
                            </span>
                          </div>
                        </div>

                        {/* Price & Payment badge */}
                        <div className="flex items-center justify-between mb-2.5 pt-1 text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {order.total_price.toLocaleString('ru-RU')} ₽
                          </span>
                          {isFullyPaid ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              ✓ 100% оплачен
                            </span>
                          ) : order.prepayment_received ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              Аванс 50%
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                              Без оплаты
                            </span>
                          )}
                        </div>

                        {/* Master assignment & print buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
                          {/* Master Dropdown */}
                          <Dropdown menu={{ items: masterMenuItems }} trigger={['click']}>
                            <button 
                              type="button"
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                                order.polisher 
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 hover:bg-blue-100' 
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                              }`}
                            >
                              <UserOutlined className="text-[10px]" />
                              <span className="truncate max-w-[100px]">{order.polisher || 'Назначить'}</span>
                            </button>
                          </Dropdown>

                          {/* Action icons */}
                          <div className="flex items-center gap-1">
                            {/* Стикер для резчика */}
                            <Tooltip title="Стикер для резчика (на заготовку)">
                              <button 
                                type="button"
                                onClick={() => {
                                  setTechCardDefaultView('thermal');
                                  setTechCardOrder(order);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              >
                                <ScissorOutlined />
                              </button>
                            </Tooltip>

                            {/* Техкарта А4 */}
                            <Tooltip title="Техкарта и паспорт изделия (А4)">
                              <button 
                                type="button"
                                onClick={() => {
                                  setTechCardDefaultView('full');
                                  setTechCardOrder(order);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              >
                                <PrinterOutlined />
                              </button>
                            </Tooltip>

                            {/* СДЭК ШК */}
                            <Tooltip title={order.tracking_number ? `ШК СДЭК: ${order.tracking_number} (Печать)` : "Создать накладную и ШК СДЭК"}>
                              <button 
                                type="button"
                                onClick={() => setCdekShippingOrder(order)}
                                className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                                  order.tracking_number 
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 font-bold' 
                                    : 'text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                <CarOutlined />
                              </button>
                            </Tooltip>

                            <Tooltip title="Открыть заказ в реестре">
                              <button 
                                type="button"
                                onClick={() => {
                                  if (onOpenOrderModal) {
                                    onOpenOrderModal(order);
                                  } else {
                                    navigate(`/orders?search=${encodeURIComponent(order.order_number)}&openId=${encodeURIComponent(order.id)}`);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              >
                                <EditOutlined />
                              </button>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Stage Quick Advance buttons */}
                        <div className="flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                          {col.defaultPrevStatus ? (
                            <Button
                              size="small"
                              type="text"
                              icon={<ArrowLeftOutlined className="text-[10px]" />}
                              onClick={() => handleUpdateStatus(order.id, col.defaultPrevStatus!)}
                              className="text-[11px] h-6 px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              Назад
                            </Button>
                          ) : <div />}

                          {col.id === 'col_done' && !order.tracking_number && (
                            <button
                              type="button"
                              onClick={() => setCdekShippingOrder(order)}
                              className="text-[11px] px-2 py-0.5 rounded bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black font-semibold cursor-pointer mr-1"
                            >
                              + ШК СДЭК
                            </button>
                          )}

                          {col.id === 'col_done' && (
                            <div className="ml-auto">
                              {viewedOrderIds.includes(order.id) ? (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <EyeInvisibleOutlined /> Просмотрен
                                  <button
                                    type="button"
                                    onClick={(e) => handleUnmarkViewed(order.id, e)}
                                    className="text-blue-500 hover:underline ml-1 cursor-pointer font-medium"
                                  >
                                    вернуть
                                  </button>
                                </span>
                              ) : (
                                <Button
                                  size="small"
                                  type="text"
                                  icon={<CheckCircleOutlined className="text-emerald-600" />}
                                  onClick={(e) => handleMarkAsViewed(order.id, e)}
                                  className="text-[11px] h-6 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg font-medium"
                                >
                                  Просмотрено
                                </Button>
                              )}
                            </div>
                          )}

                          {col.defaultNextStatus && (
                            <Button
                              size="small"
                              type="primary"
                              icon={<ArrowRightOutlined className="text-[10px]" />}
                              iconPosition="end"
                              onClick={() => handleUpdateStatus(order.id, col.defaultNextStatus!)}
                              style={{ backgroundColor: col.accentColor }}
                              className="text-[11px] h-6 px-2.5 rounded-lg font-medium shadow-none hover:opacity-90 ml-auto"
                            >
                              {col.nextButtonLabel || 'Вперед'}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tech Card Modal */}
      {techCardOrder && (
        <OrderTechCardModal
          visible={!!techCardOrder}
          order={techCardOrder}
          onClose={() => setTechCardOrder(null)}
          defaultView={techCardDefaultView}
        />
      )}

      {/* CDEK Shipping & Official Barcode Modal */}
      {cdekShippingOrder && (
        <CdekShippingModal
          visible={!!cdekShippingOrder}
          order={cdekShippingOrder}
          onClose={() => setCdekShippingOrder(null)}
          onSuccess={() => loadOrders()}
        />
      )}
    </div>
  );
};

export default Kanban;
