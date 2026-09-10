import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Input, 
  Select, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Drawer, 
  Tooltip, 
  message 
} from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  DollarOutlined, 
  CrownOutlined, 
  BranchesOutlined, 
  SearchOutlined, 
  LinkOutlined, 
  StarOutlined, 
  ThunderboltOutlined,
  CommentOutlined,
  EyeOutlined,
  SwapOutlined
} from '@ant-design/icons';
import type { Customer, CustomerMergeSuggestion, LoyaltyTier, Order } from '../types';
import { dataStore, subscribeDataStore } from '../api/dataStore';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(dataStore.getCustomers());
  const [suggestions, setSuggestions] = useState<CustomerMergeSuggestion[]>(dataStore.getMergeSuggestions());
  const [orders, setOrders] = useState<Order[]>(dataStore.getOrders());
  const [searchText, setSearchText] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { isDark } = useTheme();
  const navigate = useNavigate();

  const loadData = () => {
    setCustomers([...dataStore.getCustomers()]);
    setSuggestions([...dataStore.getMergeSuggestions()]);
    setOrders([...dataStore.getOrders()]);
  };

  useEffect(() => {
    const unsub = subscribeDataStore(loadData);
    return () => unsub();
  }, []);

  // Metrics
  const totalCustomers = customers.length;
  const repeatCustomersCount = useMemo(() => customers.filter(c => c.orders_count > 1).length, [customers]);
  const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomersCount / totalCustomers) * 100) : 0;
  const totalLTV = useMemo(() => customers.reduce((sum, c) => sum + (c.total_spent || 0), 0), [customers]);
  const avgLTV = totalCustomers > 0 ? Math.round(totalLTV / totalCustomers) : 0;
  const vipCount = useMemo(() => customers.filter(c => c.loyalty_tier === 'vip' || c.loyalty_tier === 'designer').length, [customers]);

  // Unique cities
  const cities = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => {
      if (c.city) set.add(c.city);
    });
    return Array.from(set).sort();
  }, [customers]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (tierFilter !== 'all' && c.loyalty_tier !== tierFilter) return false;
      if (cityFilter !== 'all' && c.city !== cityFilter) return false;
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchPhone = (c.phone || '').includes(q);
        const matchCity = (c.city || '').toLowerCase().includes(q);
        const matchAddress = (c.address || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCity && !matchAddress) return false;
      }
      return true;
    });
  }, [customers, tierFilter, cityFilter, searchText]);

  const handleMerge = (sugg: CustomerMergeSuggestion) => {
    dataStore.mergeCustomers(sugg.primaryCustomerId, sugg.candidateCustomerId);
    message.success('Профили клиентов успешно объединены! Заказы и история привязаны воедино.');
    loadData();
  };

  const handleDismissSuggestion = (id: string) => {
    dataStore.dismissMergeSuggestion(id);
    message.info('Предложение отклонено. Клиенты сохранены раздельно.');
    loadData();
  };

  const handleOpenCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  };

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(o => o.customer_id === selectedCustomer.id || selectedCustomer.linked_order_ids.includes(o.id));
  }, [selectedCustomer, orders]);

  // Tag helper
  const renderTierTag = (tier: LoyaltyTier) => {
    switch (tier) {
      case 'vip':
        return <Tag color="gold" className="font-bold rounded-md"><CrownOutlined /> VIP Клиент</Tag>;
      case 'designer':
        return <Tag color="purple" className="font-bold rounded-md"><StarOutlined /> Дизайнер / Партнер</Tag>;
      case 'repeat':
        return <Tag color="cyan" className="font-bold rounded-md"><ThunderboltOutlined /> Постоянный</Tag>;
      default:
        return <Tag color="default" className="rounded-md">Новый</Tag>;
    }
  };

  const columns = [
    {
      title: 'Клиент',
      key: 'name',
      render: (_: any, record: Customer) => (
        <div>
          <div className="flex items-center gap-2">
            <span 
              onClick={() => handleOpenCustomer(record)}
              className="font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {record.name}
            </span>
            {renderTierTag(record.loyalty_tier)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1">
            {record.phone && (
              <span className="flex items-center gap-1">
                <PhoneOutlined /> {record.phone}
              </span>
            )}
            {record.city && (
              <span className="flex items-center gap-1">
                <EnvironmentOutlined /> {record.city}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Каналы связи',
      dataIndex: 'channels',
      key: 'channels',
      render: (channels: string[]) => (
        <div className="flex flex-wrap gap-1">
          {channels.map((ch, i) => {
            let label = ch;
            let color = 'blue';
            if (ch === 'marketplace') { label = 'Маркетплейс'; color = 'orange'; }
            if (ch === 'telegram') { label = 'Telegram'; color = 'cyan'; }
            if (ch === 'bitrix') { label = 'Сайт'; color = 'blue'; }
            if (ch === 'call') { label = 'Звонок'; color = 'green'; }
            return (
              <Tag key={i} color={color} className="text-[10px] m-0 rounded-md font-semibold">
                {label}
              </Tag>
            );
          })}
        </div>
      ),
    },
    {
      title: 'Заказов',
      dataIndex: 'orders_count',
      key: 'orders_count',
      sorter: (a: Customer, b: Customer) => a.orders_count - b.orders_count,
      render: (count: number) => (
        <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${
          count > 1 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
        }`}>
          {count} {count === 1 ? 'заказ' : count < 5 ? 'заказа' : 'заказов'}
        </span>
      ),
    },
    {
      title: 'LTV (Сумма покупок)',
      dataIndex: 'total_spent',
      key: 'total_spent',
      sorter: (a: Customer, b: Customer) => a.total_spent - b.total_spent,
      render: (val: number) => (
        <span className="font-bold text-sm text-slate-900 dark:text-white">
          {val.toLocaleString('ru-RU')} ₽
        </span>
      ),
    },
    {
      title: 'Период',
      key: 'dates',
      render: (_: any, r: Customer) => (
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          <div>С: {r.first_order_date}</div>
          <div>До: {r.last_order_date}</div>
        </div>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Customer) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleOpenCustomer(record)}
          className="rounded-xl text-xs font-medium"
        >
          История
        </Button>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }} className="text-slate-900 dark:text-white font-bold tracking-tight">
            База клиентов и LTV
          </Title>
          <Text className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Управление покупателями каменных полок, сквозной учет LTV, распознавание повторных заказов
          </Text>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card className={`rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-lg">
                <UserOutlined />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Всего клиентов</div>
                <div className="text-xl font-black text-slate-900 dark:text-white">{totalCustomers}</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className={`rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-lg">
                <ThunderboltOutlined />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Повторные заказы</div>
                <div className="text-xl font-black text-emerald-600">{repeatRate}% <span className="text-xs font-normal text-slate-400">({repeatCustomersCount})</span></div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className={`rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-lg">
                <DollarOutlined />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Средний чек LTV</div>
                <div className="text-xl font-black text-slate-900 dark:text-white">{avgLTV.toLocaleString('ru-RU')} ₽</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className={`rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center text-lg">
                <CrownOutlined />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">VIP и Дизайнеры</div>
                <div className="text-xl font-black text-purple-600">{vipCount}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Smart Deduplication Alert Banner (if suggestions exist) */}
      {suggestions.length > 0 && (
        <div className={`p-4 sm:p-5 rounded-2xl border transition shadow-sm ${
          isDark ? 'bg-amber-950/30 border-amber-800/60' : 'bg-amber-50/90 border-amber-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
              <BranchesOutlined />
            </span>
            <div>
              <div className="font-bold text-sm text-amber-900 dark:text-amber-200">
                Интеллектуальное распознавание клиентов ({suggestions.length} совпадения)
              </div>
              <div className="text-xs text-amber-800/80 dark:text-amber-300/80">
                Система проанализировала адреса доставки, города и имена в разных каналах и нашла вероятных повторных заказчиков
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {suggestions.map(sugg => {
              const primary = customers.find(c => c.id === sugg.primaryCustomerId);
              const candidate = customers.find(c => c.id === sugg.candidateCustomerId);
              if (!primary || !candidate) return null;

              return (
                <div 
                  key={sugg.id}
                  className={`p-3.5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-100 shadow-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{primary.name}</span>
                      <span className="text-slate-400">↔</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{candidate.name}</span>
                      <Tag color="warning" className="m-0 text-[10px] rounded-md font-bold">
                        {sugg.matchType === 'address' ? 'Совпадение адреса' : 'Совпадение ФИО и города'}
                      </Tag>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      💡 {sugg.matchReason}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Общий LTV после объединения: <strong className="text-emerald-600">{(primary.total_spent + candidate.total_spent).toLocaleString('ru-RU')} ₽</strong> ({primary.orders_count + candidate.orders_count} заказов)
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="primary"
                      size="small"
                      icon={<SwapOutlined />}
                      onClick={() => handleMerge(sugg)}
                      className="bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold text-xs shadow-sm"
                    >
                      Объединить профили
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleDismissSuggestion(sugg.id)}
                      className="rounded-xl text-xs"
                    >
                      Разные люди
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80'
      }`}>
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <Input
            placeholder="Поиск по имени, телефону, адресу..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            className="rounded-xl w-full sm:w-72"
          />

          <Select
            value={tierFilter}
            onChange={setTierFilter}
            className="w-full sm:w-44 rounded-xl"
          >
            <Option value="all">Все статусы лояльности</Option>
            <Option value="vip">VIP клиенты</Option>
            <Option value="designer">Дизайнеры / Опт</Option>
            <Option value="repeat">Постоянные (2+)</Option>
            <Option value="new">Новые</Option>
          </Select>

          <Select
            value={cityFilter}
            onChange={setCityFilter}
            className="w-full sm:w-40 rounded-xl"
          >
            <Option value="all">Все города</Option>
            {cities.map(c => (
              <Option key={c} value={c}>{c}</Option>
            ))}
          </Select>
        </div>

        <div className="text-xs text-slate-400">
          Найдено клиентов: <strong className="text-slate-700 dark:text-slate-200">{filteredCustomers.length}</strong>
        </div>
      </div>

      {/* Customers Table */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/80'
      }`}>
        <Table
          dataSource={filteredCustomers}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 12, showSizeChanger: false }}
          scroll={{ x: 900 }}
        />
      </div>

      {/* Customer Detail Drawer */}
      <Drawer
        title={
          selectedCustomer ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                <UserOutlined />
              </div>
              <div>
                <div className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                  {selectedCustomer.name}
                </div>
                <div className="text-xs font-normal text-slate-400">
                  Карточка покупателя · LTV: {selectedCustomer.total_spent.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            </div>
          ) : 'Клиент'
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={540}
      >
        {selectedCustomer && (
          <div className="space-y-5 text-xs">
            {/* Loyalty & Metrics Card */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-slate-500">Статус клиента:</span>
                {renderTierTag(selectedCustomer.loyalty_tier)}
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="text-[11px] text-slate-400">Количество заказов</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {selectedCustomer.orders_count}
                  </div>
                </div>
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="text-[11px] text-slate-400">Суммарный LTV</div>
                  <div className="text-lg font-black text-emerald-600 mt-0.5">
                    {selectedCustomer.total_spent.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>
            </div>

            {/* Contacts Info */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 dark:text-white text-sm">Контакты и доставка</div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div><strong>Телефон:</strong> {selectedCustomer.phone || 'Не указан'}</div>
                {selectedCustomer.email && <div><strong>Email:</strong> {selectedCustomer.email}</div>}
                <div><strong>Город:</strong> {selectedCustomer.city || 'Не указан'}</div>
                <div><strong>Адрес доставки:</strong> {selectedCustomer.address || 'Не указан'}</div>
                {selectedCustomer.notes && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                    <strong>Заметка:</strong> {selectedCustomer.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Orders History */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                История заказов ({customerOrders.length})
              </div>
              <div className="space-y-2">
                {customerOrders.map(ord => (
                  <div 
                    key={ord.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition hover:shadow-sm ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-blue-600 dark:text-blue-400">
                        {ord.order_number} · {ord.total_price.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {ord.stone_type} ({ord.dimensions})
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Дата: {ord.created_at}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tag color={ord.status === 'completed' ? 'gold' : ord.status === 'in_production' ? 'cyan' : 'blue'} className="text-[10px] font-bold rounded-md m-0">
                        {ord.status}
                      </Tag>

                      {ord.chat_id && (
                        <Tooltip title="Открыть диалог с клиентом">
                          <Button 
                            size="small" 
                            type="text" 
                            icon={<CommentOutlined />} 
                            onClick={() => {
                              setDrawerOpen(false);
                              navigate(`/messages?chatId=${ord.chat_id}`);
                            }}
                            className="text-blue-500 hover:text-blue-600"
                          />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked Chats */}
            {selectedCustomer.linked_chat_ids.length > 0 && (
              <div className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  Привязанные чаты маркетплейсов
                </div>
                <div className="space-y-1.5">
                  {selectedCustomer.linked_chat_ids.map(cid => (
                    <Button
                      key={cid}
                      icon={<CommentOutlined />}
                      onClick={() => {
                        setDrawerOpen(false);
                        navigate(`/messages?chatId=${cid}`);
                      }}
                      className="w-full text-left flex items-center justify-between rounded-xl text-xs"
                    >
                      <span>Открыть переписку ({cid})</span>
                      <LinkOutlined />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Customers;
