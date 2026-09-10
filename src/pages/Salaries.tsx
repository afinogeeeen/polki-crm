import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Select, 
  DatePicker, 
  InputNumber, 
  Input, 
  Modal, 
  Row, 
  Col, 
  Statistic, 
  Space, 
  message, 
  Popconfirm,
  Tabs,
  Divider,
  Avatar
} from 'antd';
import { 
  DollarOutlined, 
  UserOutlined, 
  PrinterOutlined, 
  PlusOutlined, 
  ShopOutlined, 
  DeleteOutlined, 
  ThunderboltOutlined,
  SearchOutlined,
  TeamOutlined,
  TagsOutlined,
  PercentageOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { ColumnsType } from 'antd/es/table';
import { dataStore, subscribeDataStore } from '../api/dataStore';
import type { Master, StandardPieceworkRate, ProductionLogItem, Order } from '../types';

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;
const { Option } = Select;

// Менеджеры, получающие сдельную премию 5% от суммы индивидуальных заказов
const MANAGERS = [
  { id: 'mgr-alina', name: 'Алина', role: 'Менеджер по работе с клиентами' },
  { id: 'mgr-anya', name: 'Аня', role: 'Менеджер по работе с клиентами' },
  { id: 'mgr-lera', name: 'Лера', role: 'Менеджер по работе с клиентами' },
];

export const Salaries: React.FC = () => {
  const [masters, setMasters] = useState<Master[]>([]);
  const [standardRates, setStandardRates] = useState<StandardPieceworkRate[]>([]);
  const [logs, setLogs] = useState<ProductionLogItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Active Main Tab: 'statement' | 'polishers' | 'rates'
  const [activeTab, setActiveTab] = useState<'statement' | 'polishers' | 'rates'>('statement');

  // Filter states
  const [selectedMasterId, setSelectedMasterId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal: Fast Production Entry
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<'preset' | 'manual'>('preset');
  const [selectedRateId, setSelectedRateId] = useState<string>('');
  const [selectedMasterForEntry, setSelectedMasterForEntry] = useState<string>('');
  const [entryQuantity, setEntryQuantity] = useState<number>(10);
  const [entryRateRub, setEntryRateRub] = useState<number>(350);
  const [entryProductName, setEntryProductName] = useState<string>('');
  const [entryStoneType, setEntryStoneType] = useState<string>('Черный Гранит');
  const [entryDimensions, setEntryDimensions] = useState<string>('400х150х20 мм');
  const [entryOrderNumber, setEntryOrderNumber] = useState<string>('');
  const [entryComment, setEntryComment] = useState<string>('');
  const [entryDate, setEntryDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

  // Modal: Add/Edit Polisher
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [newMasterName, setNewMasterName] = useState('');
  const [newMasterPhone, setNewMasterPhone] = useState('');

  // Modal: Add/Edit Standard Rate
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [newRateName, setNewRateName] = useState('');
  const [newRateCategory, setNewRateCategory] = useState<'marketplace_serial' | 'individual'>('marketplace_serial');
  const [newRateDimensions, setNewRateDimensions] = useState('');
  const [newRateStone, setNewRateStone] = useState('');
  const [newRateAmount, setNewRateAmount] = useState<number>(400);
  const [newRateDesc, setNewRateDesc] = useState('');

  const loadData = () => {
    setMasters(dataStore.getMasters());
    setStandardRates(dataStore.getStandardRates());
    setLogs(dataStore.getProductionLog());
    setOrders(dataStore.getOrders());
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeDataStore(loadData);
    return () => unsub();
  }, []);

  const handleRateSelect = (rateId: string) => {
    setSelectedRateId(rateId);
    const rate = standardRates.find(r => r.id === rateId);
    if (rate) {
      setEntryProductName(rate.name);
      setEntryDimensions(rate.dimensions);
      setEntryStoneType(rate.stone_type);
      setEntryRateRub(rate.rate_rub);
    }
  };

  const handleOpenAddModal = (masterId?: string) => {
    if (masterId) {
      setSelectedMasterForEntry(masterId);
    } else if (masters.length > 0 && !selectedMasterForEntry) {
      setSelectedMasterForEntry(masters[0].id);
    }

    if (standardRates.length > 0 && !selectedRateId) {
      handleRateSelect(standardRates[0].id);
    }

    setIsAddModalOpen(true);
  };

  const handleSaveProductionEntry = () => {
    if (!selectedMasterForEntry) {
      message.error('Выберите полировщика');
      return;
    }
    if (!entryProductName.trim()) {
      message.error('Укажите наименование изделия');
      return;
    }
    if (entryQuantity <= 0) {
      message.error('Укажите количество больше 0');
      return;
    }

    const masterObj = masters.find(m => m.id === selectedMasterForEntry);

    dataStore.addProductionLogItem({
      date: entryDate,
      master_id: selectedMasterForEntry,
      master_name: masterObj ? masterObj.name : 'Полировщик',
      item_type: entryMode === 'preset' ? 'marketplace_serial' : 'individual',
      order_number: entryOrderNumber.trim() || undefined,
      product_name: entryProductName.trim(),
      stone_type: entryStoneType.trim() || 'Гранит / Мрамор',
      dimensions: entryDimensions.trim() || 'Стандарт',
      quantity: entryQuantity,
      rate_per_unit: entryRateRub || 0,
      comment: entryComment.trim() || undefined,
    });

    message.success('Запись внесена в ведомость выработки!');
    setIsAddModalOpen(false);

    setEntryComment('');
    setEntryOrderNumber('');
  };

  const handleDeleteLogItem = (id: string) => {
    dataStore.deleteProductionLogItem(id);
    message.success('Запись удалена');
  };

  // Add polisher handler
  const handleSaveMaster = () => {
    if (!newMasterName.trim()) {
      message.error('Введите ФИО мастера');
      return;
    }
    dataStore.saveMaster({
      name: newMasterName.trim(),
      phone: newMasterPhone.trim(),
      specialty: 'полировщик',
      isActive: true
    });
    message.success('Полировщик ' + newMasterName + ' успешно добавлен в систему!');
    setNewMasterName('');
    setNewMasterPhone('');
    setIsMasterModalOpen(false);
  };

  const handleDeleteMaster = (id: string) => {
    dataStore.deleteMaster(id);
    message.success('Профиль мастера удален');
  };

  // Add standard rate handler
  const handleSaveStandardRate = () => {
    if (!newRateName.trim()) {
      message.error('Укажите наименование изделия');
      return;
    }
    dataStore.saveStandardRate({
      name: newRateName.trim(),
      category: newRateCategory,
      dimensions: newRateDimensions.trim() || 'Стандартный размер',
      stone_type: newRateStone.trim() || 'Любой камень',
      rate_rub: Number(newRateAmount) || 350,
      description: newRateDesc.trim() || 'Поточная серия'
    });
    message.success('Типовое изделие добавлено в прайс!');
    setNewRateName('');
    setNewRateDimensions('');
    setNewRateStone('');
    setNewRateDesc('');
    setIsRateModalOpen(false);
  };

  const handleDeleteRate = (id: string) => {
    dataStore.deleteStandardRate(id);
    message.success('Расценка удалена');
  };

  // Filtered polisher logs
  const filteredLogs = useMemo(() => {
    return logs.filter(item => {
      if (selectedMasterId !== 'all' && item.master_id !== selectedMasterId) {
        return false;
      }
      if (dateRange && dateRange[0] && dateRange[1]) {
        const itemDate = dayjs(item.date);
        const start = dateRange[0].startOf('day');
        const end = dateRange[1].endOf('day');
        if (itemDate.isBefore(start) || itemDate.isAfter(end)) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          item.product_name.toLowerCase().includes(q) ||
          item.master_name.toLowerCase().includes(q) ||
          (item.order_number && item.order_number.toLowerCase().includes(q)) ||
          item.stone_type.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [logs, selectedMasterId, dateRange, searchQuery]);

  // Polishers calculation statistics
  const polisherStats = useMemo(() => {
    const totalItems = filteredLogs.reduce((acc, cur) => acc + (cur.quantity || 0), 0);
    const totalPayout = filteredLogs.reduce((acc, cur) => acc + (cur.total_salary || 0), 0);
    const serialCount = filteredLogs
      .filter(l => l.item_type === 'marketplace_serial')
      .reduce((acc, cur) => acc + cur.quantity, 0);
    const individualCount = filteredLogs
      .filter(l => l.item_type === 'individual')
      .reduce((acc, cur) => acc + cur.quantity, 0);

    const perMasterMap: Record<string, { id: string; name: string; serialQty: number; indivQty: number; totalQty: number; salary: number }> = {};
    
    // ensure all known masters are present
    masters.forEach(m => {
      perMasterMap[m.id] = { id: m.id, name: m.name, serialQty: 0, indivQty: 0, totalQty: 0, salary: 0 };
    });

    filteredLogs.forEach(log => {
      if (!perMasterMap[log.master_id]) {
        perMasterMap[log.master_id] = { id: log.master_id, name: log.master_name, serialQty: 0, indivQty: 0, totalQty: 0, salary: 0 };
      }
      if (log.item_type === 'marketplace_serial') {
        perMasterMap[log.master_id].serialQty += log.quantity;
      } else {
        perMasterMap[log.master_id].indivQty += log.quantity;
      }
      perMasterMap[log.master_id].totalQty += log.quantity;
      perMasterMap[log.master_id].salary += log.total_salary;
    });

    return {
      totalItems,
      totalPayout,
      serialCount,
      individualCount,
      perMaster: Object.values(perMasterMap).filter(pm => selectedMasterId === 'all' || pm.id === selectedMasterId)
    };
  }, [filteredLogs, masters, selectedMasterId]);

  // Managers 5% calculation from individual orders for the period
  const managerStats = useMemo(() => {
    // Individual orders in the period (direct individual orders, not mass serial marketplace)
    const filteredIndivOrders = orders.filter(order => {
      const isIndiv = order.channel !== 'marketplace';
      if (!isIndiv) return false;

      if (dateRange && dateRange[0] && dateRange[1]) {
        const orderDate = dayjs(order.created_at);
        const start = dateRange[0].startOf('day');
        const end = dateRange[1].endOf('day');
        if (orderDate.isValid() && (orderDate.isBefore(start) || orderDate.isAfter(end))) {
          return false;
        }
      }
      return true;
    });

    const totalIndividualSum = filteredIndivOrders.reduce((sum, ord) => sum + (Number(ord.total_price) || 0), 0);
    const totalBonusPool = Math.round(totalIndividualSum * 0.05);
    const perManagerShare = Math.round(totalBonusPool / MANAGERS.length);

    return {
      ordersCount: filteredIndivOrders.length,
      totalIndividualSum,
      totalBonusPool,
      perManagerShare,
      managers: MANAGERS.map(m => ({
        ...m,
        share: perManagerShare
      }))
    };
  }, [orders, dateRange]);

  const handlePrintSalaryReport = () => {
    document.body.classList.add('print-salary-report');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-salary-report');
    }, 600);
  };

  const selectedMasterName = useMemo(() => {
    if (selectedMasterId === 'all') return 'Все полировщики';
    const m = masters.find(item => item.id === selectedMasterId);
    return m ? m.name : 'Полировщик';
  }, [selectedMasterId, masters]);

  const logColumns: ColumnsType<ProductionLogItem> = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      width: 105,
      render: (val) => dayjs(val).format('DD.MM.YYYY'),
    },
    {
      title: 'Полировщик',
      dataIndex: 'master_name',
      key: 'master_name',
      width: 160,
      render: (name) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <UserOutlined className="text-blue-500 text-xs" />
          {name}
        </span>
      ),
    },
    {
      title: 'Тип / Назначение',
      dataIndex: 'item_type',
      key: 'item_type',
      width: 160,
      render: (type, rec) => (
        <Space direction="vertical" size={2}>
          {type === 'marketplace_serial' ? (
            <Tag color="purple" className="m-0 text-[11px] font-semibold">
              <ShopOutlined className="mr-1" /> Поток (Фикс WB/Ozon)
            </Tag>
          ) : (
            <Tag color="gold" className="m-0 text-[11px] font-semibold">
              Индивидуальный расчет
            </Tag>
          )}
          {rec.order_number && (
            <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              Заказ #{rec.order_number}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: 'Изделие / Камень / Габариты',
      key: 'product_details',
      render: (_, rec) => (
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
            {rec.product_name}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {rec.stone_type} · <span className="font-mono">{rec.dimensions}</span>
          </div>
          {rec.comment && (
            <div className="text-[10px] text-amber-600 dark:text-amber-400 italic">
              «{rec.comment}»
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Кол-во',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 85,
      render: (q) => (
        <span className="font-mono font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
          {q} шт
        </span>
      ),
    },
    {
      title: 'Ставка (за шт)',
      dataIndex: 'rate_per_unit',
      key: 'rate_per_unit',
      align: 'right',
      width: 110,
      render: (rate) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
          {rate.toLocaleString('ru-RU')} ₽
        </span>
      ),
    },
    {
      title: 'Сумма к выплате',
      dataIndex: 'total_salary',
      key: 'total_salary',
      align: 'right',
      width: 140,
      render: (sum) => (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
          {sum.toLocaleString('ru-RU')} ₽
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, rec) => (
        <Popconfirm
          title="Удалить запись о начислении?"
          onConfirm={() => handleDeleteLogItem(rec.id)}
          okText="Да"
          cancelText="Отмена"
        >
          <Button 
            type="text" 
            danger 
            size="small" 
            icon={<DeleteOutlined />} 
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <DollarOutlined className="text-xl text-emerald-500" />
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white m-0">
              Расчет сдельной заработной платы и премий
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0">
            Сдельная система для <strong>полировщиков</strong> (фикс за поток + расчет за инд. заказы) и <strong>менеджеров</strong> (5% от индивидуальных заказов поровну на Алину, Аню и Леру)
          </p>
        </div>

        <div className="flex orientation-row gap-2 flex-wrap">
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrintSalaryReport}
            className="font-medium"
          >
            Печать ведомости (А4)
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenAddModal()}
            className="bg-black hover:bg-slate-800 text-white font-semibold border-black"
          >
            Внести изделия полировщика
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 px-4 pt-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as any)}
          items={[
            {
              key: 'statement',
              label: (
                <span className="flex items-center gap-1.5 font-semibold text-sm">
                  <FileTextOutlined /> Ведомость и расчет
                </span>
              ),
            },
            {
              key: 'polishers',
              label: (
                <span className="flex items-center gap-1.5 font-semibold text-sm">
                  <TeamOutlined /> Полировщики ({masters.length})
                </span>
              ),
            },
            {
              key: 'rates',
              label: (
                <span className="flex items-center gap-1.5 font-semibold text-sm">
                  <TagsOutlined /> Прайс-лист сдельщины ({standardRates.length})
                </span>
              ),
            },
          ]}
        />
      </div>

      {activeTab === 'statement' && (
        <>
          {/* SECTION 1: POLISHERS SUMMARY */}
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1">
            <UserOutlined className="text-blue-500" />
            1. Выработка и начисления полировщиков (Поток + Индивидуальные заказы)
          </div>

          {/* Polishers Stats Cards */}
          <Row gutter={[12, 12]}>
            <Col xs={12} sm={6}>
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
                <Statistic
                  title={<span className="text-xs text-slate-500 font-medium">Всего изделий</span>}
                  value={polisherStats.totalItems}
                  suffix="шт"
                  valueStyle={{ fontWeight: 800, color: '#0284c7', fontSize: '1.35rem' }}
                />
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
                <Statistic
                  title={<span className="text-xs text-slate-500 font-medium">Поток (Фикс WB/Ozon)</span>}
                  value={polisherStats.serialCount}
                  suffix="шт"
                  valueStyle={{ fontWeight: 800, color: '#9333ea', fontSize: '1.35rem' }}
                />
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
                <Statistic
                  title={<span className="text-xs text-slate-500 font-medium">Индивидуальные</span>}
                  value={polisherStats.individualCount}
                  suffix="шт"
                  valueStyle={{ fontWeight: 800, color: '#d97706', fontSize: '1.35rem' }}
                />
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
                <Statistic
                  title={<span className="text-xs text-slate-500 font-medium">Начислено полировщикам</span>}
                  value={polisherStats.totalPayout}
                  suffix="₽"
                  valueStyle={{ fontWeight: 800, color: '#16a34a', fontSize: '1.35rem' }}
                />
              </Card>
            </Col>
          </Row>

          {/* SECTION 2: MANAGERS 5% BONUS POOL */}
          <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/40 dark:from-slate-900 dark:to-blue-950/20 border border-blue-200 dark:border-blue-900/60 shadow-xs rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 border-b border-blue-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <PercentageOutlined className="text-base text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    2. Премиальный фонд менеджеров (5% от суммы индивидуальных заказов)
                  </span>
                  <Tag color="blue" className="m-0 font-semibold text-[11px]">
                    Делится поровну на 3 менеджера
                  </Tag>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
                  Заказы за период: <strong>{managerStats.ordersCount} шт</strong> на сумму{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{managerStats.totalIndividualSum.toLocaleString('ru-RU')} ₽</strong>.
                  Премиальный пул 5% = <strong className="text-blue-600 dark:text-blue-400">{managerStats.totalBonusPool.toLocaleString('ru-RU')} ₽</strong>.
                </p>
              </div>

              <div className="text-left md:text-right">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-bold">
                  Выплата на каждого менеджера:
                </span>
                <span className="text-lg font-mono font-extrabold text-blue-600 dark:text-blue-400">
                  {managerStats.perManagerShare.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            {/* Manager Cards */}
            <Row gutter={[12, 12]}>
              {managerStats.managers.map((mgr) => (
                <Col xs={24} sm={8} key={mgr.id}>
                  <div className="p-3 bg-white dark:bg-slate-800/90 border border-blue-200/70 dark:border-slate-700 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="bg-blue-600 text-white font-bold text-xs">
                        {mgr.name[0]}
                      </Avatar>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          {mgr.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {mgr.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        +{mgr.share.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-[10px] text-slate-400">1/3 пула (5%)</div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Filter Bar */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} md={6}>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Полировщик:
                </label>
                <Select
                  value={selectedMasterId}
                  onChange={setSelectedMasterId}
                  className="w-full"
                >
                  <Option value="all">Все полировщики ({masters.length})</Option>
                  {masters.map(m => (
                    <Option key={m.id} value={m.id}>
                      {m.name}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} md={10}>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Период расчета:
                </label>
                <RangePicker
                  value={dateRange}
                  onChange={(val) => {
                    if (val && val[0] && val[1]) {
                      setDateRange([val[0], val[1]]);
                    }
                  }}
                  format="DD.MM.YYYY"
                  className="w-full"
                  allowClear={false}
                />
              </Col>

              <Col xs={24} md={8}>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Поиск по журналу:
                </label>
                <Input
                  prefix={<SearchOutlined className="text-slate-400" />}
                  placeholder="Порода, изделие, заказ..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  allowClear
                />
              </Col>
            </Row>
          </Card>

          {/* Polisher pills */}
          {polisherStats.perMaster.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {polisherStats.perMaster.map((pm, idx) => (
                <div 
                  key={idx}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 text-xs"
                >
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{pm.name}:</span>
                  <Tag color="purple" className="m-0 font-mono text-[10px] font-semibold">{pm.serialQty} поток</Tag>
                  <Tag color="gold" className="m-0 font-mono text-[10px] font-semibold">{pm.indivQty} инд.</Tag>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {pm.salary.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Production Log Table */}
          <Card 
            bodyStyle={{ padding: 0 }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl overflow-hidden"
          >
            <Table
              columns={logColumns}
              dataSource={filteredLogs}
              rowKey="id"
              pagination={{ pageSize: 15, showSizeChanger: true }}
              size="middle"
              locale={{ emptyText: 'Нет записей о выработке за выбранный период' }}
            />
          </Card>
        </>
      )}

      {/* TAB 2: POLISHERS PROFILES MANAGEMENT */}
      {activeTab === 'polishers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-base font-bold m-0 text-slate-900 dark:text-white">
                Профили полировщиков
              </h2>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Мастера, которым назначаются заказы в канбане, при создании заказа и в ведомости выработки
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsMasterModalOpen(true)}
              className="bg-black hover:bg-slate-800 text-white font-semibold border-black"
            >
              Добавить полировщика
            </Button>
          </div>

          <Row gutter={[12, 12]}>
            {masters.map(master => {
              const masterLogs = logs.filter(l => l.master_id === master.id);
              const totalItems = masterLogs.reduce((acc, l) => acc + l.quantity, 0);
              const totalEarned = masterLogs.reduce((acc, l) => acc + l.total_salary, 0);

              return (
                <Col xs={24} sm={12} md={8} key={master.id}>
                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar size="large" className="bg-slate-900 dark:bg-slate-800 text-white font-bold">
                          {master.name[0]}
                        </Avatar>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {master.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {master.phone || 'Телефон не указан'}
                          </div>
                        </div>
                      </div>
                      <Popconfirm
                        title="Удалить полировщика?"
                        onConfirm={() => handleDeleteMaster(master.id)}
                        okText="Да"
                        cancelText="Отмена"
                      >
                        <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>

                    <Divider className="my-3" />

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="text-slate-400 text-[10px]">Всего готово</div>
                        <div className="font-bold font-mono text-slate-800 dark:text-slate-100 text-sm">
                          {totalItems} шт
                        </div>
                      </div>
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                        <div className="text-emerald-600 dark:text-emerald-400 text-[10px]">Всего начислено</div>
                        <div className="font-bold font-mono text-emerald-700 dark:text-emerald-300 text-sm">
                          {totalEarned.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Button
                        size="small"
                        block
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenAddModal(master.id)}
                      >
                        Внести выработку
                      </Button>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}

      {/* TAB 3: PIECEWORK STANDARD RATES */}
      {activeTab === 'rates' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h2 className="text-base font-bold m-0 text-slate-900 dark:text-white">
                Прайс-лист типовых изделий и расценок полировки
              </h2>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Фиксированные ставки за поточные изделия WB/Ozon и базовые нормативы индивидуальных заказов
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsRateModalOpen(true)}
              className="bg-black hover:bg-slate-800 text-white font-semibold border-black"
            >
              Добавить расценку в прайс
            </Button>
          </div>

          <Card 
            bodyStyle={{ padding: 0 }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl overflow-hidden"
          >
            <Table
              dataSource={standardRates}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: 'Наименование типового изделия',
                  key: 'name',
                  render: (_, rec) => (
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {rec.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{rec.description}</div>
                    </div>
                  ),
                },
                {
                  title: 'Категория',
                  dataIndex: 'category',
                  key: 'category',
                  width: 170,
                  render: (cat) => (
                    cat === 'marketplace_serial' ? (
                      <Tag color="purple" className="font-semibold text-[11px]">Поток (WB/Ozon)</Tag>
                    ) : (
                      <Tag color="gold" className="font-semibold text-[11px]">Индивидуальный</Tag>
                    )
                  ),
                },
                {
                  title: 'Габариты',
                  dataIndex: 'dimensions',
                  key: 'dimensions',
                  width: 160,
                  render: (dim) => <span className="font-mono text-xs">{dim}</span>,
                },
                {
                  title: 'Порода камня',
                  dataIndex: 'stone_type',
                  key: 'stone_type',
                  width: 170,
                  render: (st) => <span className="text-xs">{st}</span>,
                },
                {
                  title: 'Ставка полировщику',
                  dataIndex: 'rate_rub',
                  key: 'rate_rub',
                  align: 'right',
                  width: 160,
                  render: (rate) => (
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {rate.toLocaleString('ru-RU')} ₽ / шт
                    </span>
                  ),
                },
                {
                  title: '',
                  key: 'actions',
                  width: 60,
                  render: (_, rec) => (
                    <Popconfirm
                      title="Удалить расценку?"
                      onConfirm={() => handleDeleteRate(rec.id)}
                      okText="Да"
                      cancelText="Отмена"
                    >
                      <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      )}

      {/* MODAL: ADD PRODUCTION LOG ENTRY */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-bold text-base">
            <ThunderboltOutlined className="text-amber-500" />
            <span>Внесение выполненных изделий полировщика</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={handleSaveProductionEntry}
        okText="Внести в ведомость"
        cancelText="Отмена"
        width={620}
        okButtonProps={{ className: 'bg-black text-white hover:bg-slate-800 border-black font-semibold' }}
      >
        <div className="space-y-4 pt-2">
          {/* Mode Switcher */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex">
            <button
              type="button"
              onClick={() => setEntryMode('preset')}
              className={'flex-1 py-1.5 text-xs font-semibold rounded-md transition ' + (
                entryMode === 'preset'
                  ? 'bg-white dark:bg-slate-900 text-black dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <ShopOutlined className="mr-1" /> Поточная полка (Маркетплейсы WB/Ozon)
            </button>
            <button
              type="button"
              onClick={() => {
                setEntryMode('manual');
                setEntryRateRub(800);
                setEntryProductName('Индивидуальная полка');
              }}
              className={'flex-1 py-1.5 text-xs font-semibold rounded-md transition ' + (
                entryMode === 'manual'
                  ? 'bg-white dark:bg-slate-900 text-black dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              Индивидуальный заказ
            </button>
          </div>

          <Row gutter={[12, 12]}>
            {/* Polisher and Date */}
            <Col span={14}>
              <label className="text-xs font-bold block mb-1">Полировщик цеха:</label>
              <Select
                value={selectedMasterForEntry}
                onChange={setSelectedMasterForEntry}
                className="w-full"
              >
                {masters.map(m => (
                  <Option key={m.id} value={m.id}>
                    {m.name}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col span={10}>
              <label className="text-xs font-bold block mb-1">Дата изготовления:</label>
              <Input
                type="date"
                value={entryDate}
                onChange={e => setEntryDate(e.target.value)}
                className="w-full"
              />
            </Col>

            {/* If Marketplace Preset Selected */}
            {entryMode === 'preset' ? (
              <Col span={24}>
                <label className="text-xs font-bold block mb-1">Типовое изделие из прайс-листа сдельщины:</label>
                <Select
                  value={selectedRateId}
                  onChange={handleRateSelect}
                  className="w-full"
                >
                  {standardRates.map(r => (
                    <Option key={r.id} value={r.id}>
                      {r.name} · {r.dimensions} — {r.rate_rub} ₽/шт
                    </Option>
                  ))}
                </Select>
              </Col>
            ) : (
              <>
                <Col span={16}>
                  <label className="text-xs font-bold block mb-1">Наименование изделия:</label>
                  <Input
                    value={entryProductName}
                    onChange={e => setEntryProductName(e.target.value)}
                    placeholder="Например: Полка в ванную с вырезом под смеситель"
                  />
                </Col>
                <Col span={8}>
                  <label className="text-xs font-bold block mb-1">Номер заказа (CRM):</label>
                  <Input
                    value={entryOrderNumber}
                    onChange={e => setEntryOrderNumber(e.target.value)}
                    placeholder="КР-305"
                  />
                </Col>
              </>
            )}

            {/* Material and Dimensions */}
            <Col span={12}>
              <label className="text-xs font-bold block mb-1">Порода камня:</label>
              <Input
                value={entryStoneType}
                onChange={e => setEntryStoneType(e.target.value)}
                placeholder="Гранит Габбро, Мрамор Calacatta..."
              />
            </Col>

            <Col span={12}>
              <label className="text-xs font-bold block mb-1">Габариты (ДхШхТ):</label>
              <Input
                value={entryDimensions}
                onChange={e => setEntryDimensions(e.target.value)}
                placeholder="400х150х20 мм"
              />
            </Col>

            {/* Quantity and Rate */}
            <Col span={12}>
              <label className="text-xs font-bold block mb-1">Количество готовых штук:</label>
              <InputNumber
                min={1}
                max={500}
                value={entryQuantity}
                onChange={v => setEntryQuantity(Number(v) || 1)}
                className="w-full font-mono text-base"
              />
            </Col>

            <Col span={12}>
              <label className="text-xs font-bold block mb-1">Ставка за 1 штуку (₽):</label>
              <InputNumber
                min={0}
                step={50}
                value={entryRateRub}
                onChange={v => setEntryRateRub(Number(v) || 0)}
                className="w-full font-mono text-base"
              />
            </Col>

            <Col span={24}>
              <label className="text-xs font-bold block mb-1">Комментарий / Особенности смены:</label>
              <Input
                value={entryComment}
                onChange={e => setEntryComment(e.target.value)}
                placeholder="Например: партия под маркетплейс, сложная гидрофобизация..."
              />
            </Col>
          </Row>

          {/* Quick Calculated Preview */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                Итого к начислению полировщику:
              </div>
              <div className="text-xs text-slate-500">
                {entryQuantity} шт × {entryRateRub} ₽
              </div>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {((entryQuantity || 1) * (entryRateRub || 0)).toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL: ADD POLISHER */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-bold text-base">
            <UserOutlined className="text-blue-500" />
            <span>Добавление профиля полировщика</span>
          </div>
        }
        open={isMasterModalOpen}
        onCancel={() => setIsMasterModalOpen(false)}
        onOk={handleSaveMaster}
        okText="Сохранить профиль"
        cancelText="Отмена"
        okButtonProps={{ className: 'bg-black text-white hover:bg-slate-800 border-black font-semibold' }}
      >
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-xs font-bold block mb-1">ФИО полировщика:</label>
            <Input
              placeholder="Например: Иванов Иван Иванович"
              value={newMasterName}
              onChange={e => setNewMasterName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">Контактный телефон:</label>
            <Input
              placeholder="+7 (999) 000-00-00"
              value={newMasterPhone}
              onChange={e => setNewMasterPhone(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* MODAL: ADD STANDARD PIECEWORK RATE */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-bold text-base">
            <TagsOutlined className="text-emerald-500" />
            <span>Добавление типового изделия в прайс-лист</span>
          </div>
        }
        open={isRateModalOpen}
        onCancel={() => setIsRateModalOpen(false)}
        onOk={handleSaveStandardRate}
        okText="Добавить в прайс"
        cancelText="Отмена"
        okButtonProps={{ className: 'bg-black text-white hover:bg-slate-800 border-black font-semibold' }}
      >
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-xs font-bold block mb-1">Наименование изделия:</label>
            <Input
              placeholder="Например: Полка маркетплейс 700х150 мм"
              value={newRateName}
              onChange={e => setNewRateName(e.target.value)}
            />
          </div>
          <Row gutter={[12, 12]}>
            <Col span={12}>
              <label className="text-xs font-bold block mb-1">Категория:</label>
              <Select
                value={newRateCategory}
                onChange={setNewRateCategory}
                className="w-full"
              >
                <Option value="marketplace_serial">Поток (Маркетплейсы WB/Ozon)</Option>
                <Option value="individual">Индивидуальный заказ</Option>
              </Select>
            </Col>
            <Col span={12}>
              <label className="text-xs font-bold block mb-1">Ставка полировщику (₽/шт):</label>
              <InputNumber
                min={0}
                step={50}
                value={newRateAmount}
                onChange={v => setNewRateAmount(Number(v) || 0)}
                className="w-full font-mono font-bold"
              />
            </Col>
            <Col span={12}>
              <label className="text-xs font-bold block mb-1">Габариты:</label>
              <Input
                placeholder="700х150х20 мм"
                value={newRateDimensions}
                onChange={e => setNewRateDimensions(e.target.value)}
              />
            </Col>
            <Col span={12}>
              <label className="text-xs font-bold block mb-1">Порода камня:</label>
              <Input
                placeholder="Гранит / Мрамор"
                value={newRateStone}
                onChange={e => setNewRateStone(e.target.value)}
              />
            </Col>
            <Col span={24}>
              <label className="text-xs font-bold block mb-1">Описание / Особенности:</label>
              <Input
                placeholder="Стандартный цикл полировки торца и фаски"
                value={newRateDesc}
                onChange={e => setNewRateDesc(e.target.value)}
              />
            </Col>
          </Row>
        </div>
      </Modal>

      {/* PRINTABLE A4 SALARY STATEMENT (Strict B&W for Paper Printout) */}
      <div id="printable-salary-statement" className="salary-printable-sheet">
        <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-start">
          <div>
            <div className="text-2xl font-black uppercase tracking-wider">
              МАСТЕРСКАЯ «КАМЕННЫЙ РУЧЕЙ»
            </div>
            <div className="text-sm font-bold uppercase mt-1">
              ВЕДОМОСТЬ РАСЧЕТА ЗАРАБОТНОЙ ПЛАТЫ И ПРЕМИЙ
            </div>
            <div className="text-xs mt-1">
              Период: <strong>{dateRange[0].format('DD.MM.YYYY')} — {dateRange[1].format('DD.MM.YYYY')}</strong>
            </div>
          </div>
          <div className="text-right text-xs">
            <div>Дата формирования: {dayjs().format('DD.MM.YYYY HH:mm')}</div>
            <div>Фильтр: <strong>{selectedMasterName}</strong></div>
            <div className="font-bold border border-black px-2 py-1 mt-1 inline-block">
              ИТОГО СДЕЛЬНО ПОЛИРОВЩИКАМ: {polisherStats.totalPayout.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>

        {/* Managers Bonus Summary on Paper */}
        <div className="mb-4 border border-black p-2 text-xs">
          <div className="font-bold uppercase border-b border-black pb-1 mb-1 flex justify-between">
            <span>Премиальный фонд менеджеров (5% от суммы индивидуальных заказов):</span>
            <span className="font-mono font-bold">Итого фонд: {managerStats.totalBonusPool.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="text-[11px] mb-2 text-gray-700">
            Оборот по индивидуальным заказам за период: {managerStats.totalIndividualSum.toLocaleString('ru-RU')} ₽ ({managerStats.ordersCount} заказов). 5% делится поровну между 3 менеджерами.
          </div>
          <div className="grid grid-cols-3 gap-2">
            {managerStats.managers.map((mgr) => (
              <div key={mgr.id} className="border border-black p-1.5 flex justify-between">
                <span><strong>{mgr.name}</strong> ({mgr.role})</span>
                <span className="font-mono font-bold">+{mgr.share.toLocaleString('ru-RU')} ₽</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary per polisher on paper */}
        <div className="mb-4 border border-black p-2 text-xs">
          <div className="font-bold uppercase border-b border-black pb-1 mb-1">
            Сводка выработки полировщиков цеха:
          </div>
          <div className="grid grid-cols-3 gap-2">
            {polisherStats.perMaster.map((pm, i) => (
              <div key={i} className="flex justify-between border-b border-dashed border-gray-400 py-0.5">
                <span>{pm.name}:</span>
                <span className="font-mono font-bold">
                  {pm.totalQty} шт ({pm.serialQty} поток / {pm.indivQty} инд) — {pm.salary.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Statement Detail Table */}
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100 font-bold text-left border-b border-black">
              <th className="border border-black p-1.5 w-16">Дата</th>
              <th className="border border-black p-1.5 w-32">Полировщик</th>
              <th className="border border-black p-1.5">Изделие / Камень / Габариты</th>
              <th className="border border-black p-1.5 w-28">Тип</th>
              <th className="border border-black p-1.5 w-14 text-center">Кол-во</th>
              <th className="border border-black p-1.5 w-16 text-right">Ставка</th>
              <th className="border border-black p-1.5 w-20 text-right">Сумма, ₽</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-300">
                <td className="border border-black p-1.5 font-mono">{dayjs(item.date).format('DD.MM.YY')}</td>
                <td className="border border-black p-1.5 font-bold">{item.master_name}</td>
                <td className="border border-black p-1.5">
                  <div className="font-bold">{item.product_name}</div>
                  <div className="text-[10px]">{item.stone_type} ({item.dimensions}) {item.comment ? '— ' + item.comment : ''}</div>
                </td>
                <td className="border border-black p-1.5 text-[10px]">
                  {item.item_type === 'marketplace_serial' ? 'Поток WB/Ozon' : ('Инд. заказ #' + (item.order_number || '-'))}
                </td>
                <td className="border border-black p-1.5 text-center font-bold font-mono">{item.quantity}</td>
                <td className="border border-black p-1.5 text-right font-mono">{item.rate_per_unit}</td>
                <td className="border border-black p-1.5 text-right font-mono font-bold">
                  {item.total_salary.toLocaleString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold text-sm bg-gray-50">
              <td colSpan={4} className="border border-black p-2 text-right uppercase">
                Всего изготовлено изделий / Итого начислено полировщикам:
              </td>
              <td className="border border-black p-2 text-center font-mono">{polisherStats.totalItems} шт</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2 text-right font-mono">
                {polisherStats.totalPayout.toLocaleString('ru-RU')} ₽
              </td>
            </tr>
          </tfoot>
        </table>


      </div>
    </div>
  );
};

export default Salaries;
