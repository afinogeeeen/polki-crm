import React, { useEffect, useState, useMemo } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Table, 
  Tag, 
  Button, 
  DatePicker,
} from 'antd';
import { 
  ShoppingOutlined, 
  CarOutlined, 
  StarOutlined, 
  PlusOutlined, 
  ShopOutlined, 
  ArrowRightOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { Order } from '../types';
import { dataStore, subscribeDataStore } from '../api/dataStore';
import { statusColors, statusLabels, CHANNEL_CONFIG } from './Orders';
import { MARKETPLACE_LINKS } from './Messages';
import { useTheme } from '../context/ThemeContext';
import dayjs, { type Dayjs } from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

type PeriodType = 'all' | 'today' | 'week' | 'month' | 'custom';

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<PeriodType>('all');
  const [customRange, setCustomRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const { isDark } = useTheme();

  // Load orders and subscribe to real-time storage & tab focus events
  useEffect(() => {
    const refreshData = () => {
      setOrders(dataStore.getOrders());
      setNowTick(Date.now());
    };

    refreshData();

    // Re-sync when tab regains focus or window is activated
    window.addEventListener('focus', refreshData);
    // Periodically update nowTick every 60 seconds so today/week filters never get stale
    const interval = setInterval(() => setNowTick(Date.now()), 60000);
    // Subscribe to in-tab and cross-tab data store mutations
    const unsubscribe = subscribeDataStore(() => refreshData());

    return () => {
      window.removeEventListener('focus', refreshData);
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // Filter orders by selected period
  const filteredOrders = useMemo(() => {
    if (period === 'all') return orders;

    const now = dayjs(nowTick);
    return orders.filter(o => {
      const orderDate = dayjs(o.created_at);
      if (period === 'today') {
        return orderDate.isSame(now, 'day');
      }
      if (period === 'week') {
        return orderDate.isAfter(now.subtract(7, 'day').startOf('day'));
      }
      if (period === 'month') {
        return orderDate.isAfter(now.subtract(30, 'day').startOf('day'));
      }
      if (period === 'custom' && customRange && customRange[0] && customRange[1]) {
        const start = customRange[0].startOf('day');
        const end = customRange[1].endOf('day');
        return (orderDate.isAfter(start) || orderDate.isSame(start)) && 
               (orderDate.isBefore(end) || orderDate.isSame(end));
      }
      return true;
    });
  }, [orders, period, customRange, nowTick]);

  // Compute metrics from filtered orders
  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const activeOrders = filteredOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
    const deliveriesInProgress = filteredOrders.filter(o => ['sent_cdek', 'in_production'].includes(o.status)).length;

    // Channels breakdown
    const channelCounts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const ch = o.channel || 'direct';
      channelCounts[ch] = (channelCounts[ch] || 0) + 1;
    });

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    const reviews = dataStore.getReviews().filter(r => !r.is_answered).length;
    const questions = dataStore.getQuestions().filter(q => !q.is_answered).length;

    return {
      totalOrders,
      activeOrders,
      totalRevenue,
      deliveriesInProgress,
      channelCounts,
      statusCounts,
      pendingMP: reviews + questions,
    };
  }, [filteredOrders]);

  const recentOrders = useMemo(() => {
    return [...filteredOrders].slice(0, 6);
  }, [filteredOrders]);

  const orderColumns = [
    {
      title: '№ Заказа',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text: string) => <span className="font-mono font-bold text-blue-500">{text}</span>,
    },
    {
      title: 'Клиент и канал',
      key: 'client',
      render: (_: unknown, record: Order) => {
        const ch = record.channel && CHANNEL_CONFIG[record.channel] 
          ? CHANNEL_CONFIG[record.channel] 
          : { label: 'Прямой', color: 'blue' };
        return (
          <div>
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{record.client_name}</div>
            <Tag color={ch.color} className="text-[10px] m-0 font-medium rounded-full px-2 mt-0.5">
              {ch.label}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Камень / Агломерат и габариты',
      key: 'stone',
      render: (_: unknown, record: Order) => (
        <div>
          <div className="font-semibold text-sm truncate max-w-[220px] text-slate-900 dark:text-slate-100">
            {record.stone_type}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{record.dimensions}</div>
        </div>
      ),
    },
    {
      title: 'Сумма',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (val: number) => (
        <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
          {val.toLocaleString('ru-RU')} ₽
        </span>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: Order['status']) => (
        <Tag color={statusColors[status] || 'default'} className="rounded-full font-medium px-2.5">
          {statusLabels[status] || status}
        </Tag>
      ),
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Welcome Banner */}
      <div className={`p-5 sm:p-7 rounded-3xl border transition-all ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border-slate-800 shadow-lg' 
          : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <Title level={2} style={{ margin: 0 }} className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                Polki CRM — «Каменный Ручей»
              </Title>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                Цех каменных полок и агломерата
              </span>
            </div>
            <p className={`text-xs sm:text-sm m-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Центр управления заказами: polkistone.ru, Ozon, Wildberries, Яндекс.Маркет, СДЭК и прямые каналы
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Direct Marketplace Buttons with Clear Legible Contrast */}
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(MARKETPLACE_LINKS).map(([key, item]) => {
                const bgStyle = key === 'ozon' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20' 
                  : key === 'wildberries'
                  ? 'bg-fuchsia-700 hover:bg-fuchsia-800 text-white shadow-fuchsia-600/20'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20';

                return (
                  <a
                    key={key}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition transform active:scale-95 ${bgStyle}`}
                  >
                    <ShopOutlined />
                    <span>{item.name}</span>
                  </a>
                );
              })}
            </div>

            <Link to="/orders" className="w-full sm:w-auto">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                className="bg-blue-600 hover:bg-blue-500 rounded-full font-semibold px-5 w-full sm:w-auto h-9 shadow-md shadow-blue-600/20"
              >
                Новый заказ
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Period Filter Bar */}
      <Card className="apple-card rounded-2xl" styles={{ body: { padding: '12px 18px' } }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-blue-500 text-base" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Период аналитики:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full p-1 bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700">
              {(
                [
                  { key: 'all', label: 'Все время' },
                  { key: 'today', label: 'Сегодня' },
                  { key: 'week', label: 'Неделя' },
                  { key: 'month', label: 'Месяц' },
                  { key: 'custom', label: 'Свободный' },
                ] as const
              ).map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPeriod(item.key)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition cursor-pointer ${
                    period === item.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {period === 'custom' && (
              <RangePicker
                format="DD.MM.YYYY"
                onChange={dates => setCustomRange(dates as [Dayjs | null, Dayjs | null] | null)}
                className="rounded-full text-xs"
                placeholder={['От даты', 'До даты']}
              />
            )}
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="apple-card rounded-2xl" styles={{ body: { padding: '20px' } }}>
            <Statistic
              title={<span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Всего заказов</span>}
              value={metrics.totalOrders}
              prefix={<ShoppingOutlined className="text-blue-500 mr-1.5" />}
              valueStyle={{ fontWeight: 700, fontSize: '1.75rem' }}
              suffix={
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1.5">
                  (в работе: {metrics.activeOrders})
                </span>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="apple-card rounded-2xl" styles={{ body: { padding: '20px' } }}>
            <Statistic
              title={<span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Объем заказов</span>}
              value={metrics.totalRevenue}
              precision={0}
              prefix={<span className="text-emerald-500 font-sans font-bold text-xl mr-1.5">₽</span>}
              suffix="₽"
              valueStyle={{ fontWeight: 700, fontSize: '1.75rem', color: '#10b981' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="apple-card rounded-2xl" styles={{ body: { padding: '20px' } }}>
            <Statistic
              title={<span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Доставки СДЭК в пути</span>}
              value={metrics.deliveriesInProgress}
              prefix={<CarOutlined className="text-amber-500 mr-1.5" />}
              valueStyle={{ fontWeight: 700, fontSize: '1.75rem', color: '#f59e0b' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="apple-card rounded-2xl" styles={{ body: { padding: '20px' } }}>
            <Statistic
              title={<span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Обращения на МП</span>}
              value={metrics.pendingMP}
              prefix={<StarOutlined className="text-purple-500 mr-1.5" />}
              suffix={
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1.5">
                  ждут ответа
                </span>
              }
              valueStyle={{ 
                color: metrics.pendingMP > 0 ? '#ef4444' : '#8b5cf6', 
                fontWeight: 700,
                fontSize: '1.75rem' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Analytics Details: Channels & Order Statuses (Stone popularity removed as requested) */}
      <Row gutter={[16, 16]}>
        {/* Contact Channels Breakdown */}
        <Col xs={24} lg={12}>
          <Card 
            title={<span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">Каналы поступления обращений</span>}
            className="apple-card rounded-2xl h-full"
          >
            <div className="space-y-2">
              {Object.entries(CHANNEL_CONFIG).map(([key, config]) => {
                const count = metrics.channelCounts[key] || 0;
                const percent = metrics.totalOrders > 0 ? Math.round((count / metrics.totalOrders) * 100) : 0;
                return (
                  <div key={key} className={`flex items-center justify-between text-xs p-3 rounded-xl border transition ${
                    isDark 
                      ? 'bg-slate-900/50 border-slate-800 text-slate-200' 
                      : 'bg-slate-50/80 border-slate-200/70 text-slate-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Tag color={config.color} className="mr-0 rounded-full font-medium px-2.5 py-0.5">
                        {config.icon && <span className="mr-1">{config.icon}</span>}
                        {config.label}
                      </Tag>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold font-mono text-sm">{count}</span>
                      <span className="text-slate-600 dark:text-slate-400 w-10 text-right font-semibold">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* Production Funnel */}
        <Col xs={24} lg={12}>
          <Card 
            title={<span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">Воронка производства и статусы</span>}
            className="apple-card rounded-2xl h-full"
          >
            <div className="space-y-2">
              {Object.entries(statusLabels).map(([key, label]) => {
                const count = metrics.statusCounts[key] || 0;
                const percent = metrics.totalOrders > 0 ? Math.round((count / metrics.totalOrders) * 100) : 0;
                return (
                  <div key={key} className={`flex items-center justify-between text-xs p-3 rounded-xl border transition ${
                    isDark 
                      ? 'bg-slate-900/50 border-slate-800 text-slate-200' 
                      : 'bg-slate-50/80 border-slate-200/70 text-slate-800'
                  }`}>
                    <Tag color={statusColors[key as Order['status']] || 'default'} className="mr-0 rounded-full font-medium px-2.5 py-0.5">
                      {label}
                    </Tag>
                    <div className="flex items-center gap-3">
                      <span className="font-bold font-mono text-sm">{count}</span>
                      <span className="text-slate-600 dark:text-slate-400 w-10 text-right font-semibold">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Card 
        title={
          <div className="flex justify-between items-center py-1">
            <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-slate-100">
              {period === 'all' ? 'Последние заказы полок' : `Заказы за выбранный период (${metrics.totalOrders})`}
            </span>
            <Link to="/orders" className="text-xs font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1">
              Все заказы <ArrowRightOutlined className="text-[10px]" />
            </Link>
          </div>
        }
        className="apple-card rounded-2xl overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <Table 
          columns={orderColumns} 
          dataSource={recentOrders} 
          rowKey="id" 
          pagination={false}
          size="middle"
          scroll={{ x: 700 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
