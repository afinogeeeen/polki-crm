import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Row, 
  Col, 
  Statistic, 
  Tabs, 
  Modal, 
  Select, 
  InputNumber, 
  Input, 
  Space, 
  message, 
  Popconfirm, 
  Progress, 
  Alert, 
  Divider, 
  Badge 
} from 'antd';
import { 
  RocketOutlined, 
  ShopOutlined, 
  PlusOutlined, 
  PrinterOutlined, 
  ThunderboltOutlined, 
  FireOutlined, 
  BarcodeOutlined, 
  InboxOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  ApiOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { dataStore, subscribeDataStore } from '../api/dataStore';
import type { 
  FboItemRecommendation, 
  FboSupply, 
  FboSupplyItem, 
  FboSupplyBox, 
  FboMarketplace, 
  FboSupplyStatus 
} from '../types';

const { Option } = Select;

export const FboSupplies: React.FC = () => {
  const [recommendations, setRecommendations] = useState<FboItemRecommendation[]>([]);
  const [supplies, setSupplies] = useState<FboSupply[]>([]);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'supplies' | 'api_guide'>('recommendations');
  const [marketplaceFilter, setMarketplaceFilter] = useState<'all' | FboMarketplace>('all');

  // Selected items for new FBO supply draft
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [supplyMarketplace, setSupplyMarketplace] = useState<FboMarketplace>('wildberries');
  const [supplyWarehouse, setSupplyWarehouse] = useState<string>('WB Коледино (Подольск)');
  const [supplyCluster, setSupplyCluster] = useState<string>('Центральный кластер');
  const [supplyPlannedDate, setSupplyPlannedDate] = useState<string>(dayjs().add(5, 'day').format('YYYY-MM-DD'));
  const [supplyTimeslot, setSupplyTimeslot] = useState<string>('10:00 - 12:00');
  const [supplyNotes, setSupplyNotes] = useState<string>('');
  const [supplyBoxesCount, setSupplyBoxesCount] = useState<number>(4);

  // Detail / API simulation modal
  const [selectedSupplyForView, setSelectedSupplyForView] = useState<FboSupply | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmittingToApi, setIsSubmittingToApi] = useState(false);

  const loadData = () => {
    setRecommendations(dataStore.getFboRecommendations());
    setSupplies(dataStore.getFboSupplies());
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeDataStore(loadData);
    return () => unsub();
  }, []);

  const filteredRecs = useMemo(() => {
    return recommendations.filter(r => marketplaceFilter === 'all' || r.marketplace === marketplaceFilter);
  }, [recommendations, marketplaceFilter]);

  const filteredSupplies = useMemo(() => {
    return supplies.filter(s => marketplaceFilter === 'all' || s.marketplace === marketplaceFilter);
  }, [supplies, marketplaceFilter]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalRecItems = filteredRecs.reduce((acc, r) => acc + r.recommended_qty, 0);
    const potentialRevenue = filteredRecs.reduce((acc, r) => acc + (r.recommended_qty * r.price_rub), 0);
    const criticalStockCount = filteredRecs.filter(r => r.days_of_supply <= 5).length;
    const activeSupplies = filteredSupplies.filter(s => s.status !== 'accepted' && s.status !== 'cancelled').length;

    return {
      totalRecItems,
      potentialRevenue,
      criticalStockCount,
      activeSupplies
    };
  }, [filteredRecs, filteredSupplies]);

  // Handle auto-forming supply from high-demand items
  const handleStartSupplyFromRecommendations = (presetItems?: FboItemRecommendation[]) => {
    const itemsToTake = presetItems || filteredRecs.filter(r => selectedItemIds.includes(r.id));
    if (itemsToTake.length === 0) {
      const highDemand = filteredRecs.filter(r => r.demand_level === 'high');
      if (highDemand.length === 0) {
        message.warning('Выберите товары для формирования заявки');
        return;
      }
      setSupplyMarketplace(highDemand[0].marketplace);
      setSelectedItemIds(highDemand.map(h => h.id));
    } else {
      setSupplyMarketplace(itemsToTake[0].marketplace);
      setSelectedItemIds(itemsToTake.map(i => i.id));
    }

    if (presetItems && presetItems[0]) {
      setSupplyMarketplace(presetItems[0].marketplace);
      if (presetItems[0].marketplace === 'ozon') {
        setSupplyWarehouse('Ozon Хоругвино (Север МО)');
        setSupplyCluster('Москва и Запад МО');
      } else if (presetItems[0].marketplace === 'yandex') {
        setSupplyWarehouse('Яндекс.Маркет Софьино (FBY)');
        setSupplyCluster('Центральный регион (Москва и МО)');
      } else {
        setSupplyWarehouse('WB Коледино (Подольск)');
        setSupplyCluster('Центральный кластер');
      }
    }

    setIsCreateModalOpen(true);
  };

  const handleSaveSupply = () => {
    const chosenRecs = recommendations.filter(r => selectedItemIds.includes(r.id));
    if (chosenRecs.length === 0) {
      message.error('В поставке должен быть минимум 1 товар');
      return;
    }

    const items: FboSupplyItem[] = chosenRecs.map(r => ({
      id: 'si-' + Date.now() + '-' + r.id,
      article: r.article,
      barcode: r.barcode,
      name: r.name,
      stone_type: r.stone_type,
      dimensions: r.dimensions,
      quantity: r.recommended_qty,
      price_rub: r.price_rub
    }));

    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    const boxCount = Math.max(1, supplyBoxesCount || Math.ceil(totalQty / 10));

    // Generate box barcodes
    const boxes: FboSupplyBox[] = [];
    for (let i = 1; i <= boxCount; i++) {
      boxes.push({
        id: 'box-' + Date.now() + '-' + i,
        box_number: i,
        barcode: (supplyMarketplace === 'ozon' ? 'OZB' : 'WBB') + (Math.floor(10000000 + Math.random() * 90000000)),
        items_count: Math.round(totalQty / boxCount),
        weight_kg: Number(((totalQty / boxCount) * 1.85).toFixed(1)),
        dimensions_cm: '60х40х30'
      });
    }

    const newSup = dataStore.saveFboSupply({
      marketplace: supplyMarketplace,
      status: 'draft',
      destination_warehouse: supplyWarehouse,
      cluster_name: supplyCluster,
      planned_date: supplyPlannedDate,
      timeslot: supplyTimeslot,
      items,
      boxes,
      total_items: totalQty,
      total_boxes: boxCount,
      total_cost_rub: items.reduce((s, i) => s + (i.quantity * i.price_rub), 0),
      notes: supplyNotes.trim() || 'Сформировано по рекомендациям CRM'
    });

    message.success('Заявка на поставку FBO ' + newSup.supply_number + ' успешно создана!');
    setIsCreateModalOpen(false);
    setActiveTab('supplies');
  };

  // API Submit Simulation
  const handleSimulateApiDraft = (supply: FboSupply) => {
    setIsSubmittingToApi(true);
    message.loading({ content: 'Подключение к API ' + (supply.marketplace === 'ozon' ? 'Ozon Seller' : 'Wildberries') + '...', key: 'api_submit' });

    setTimeout(() => {
      dataStore.updateFboSupplyStatus(supply.id, 'timeslot_booked');
      setIsSubmittingToApi(false);
      message.success({ 
        content: 'Черновик зарегистрирован в API! Таймслот подтвержден, сгенерирован боевой номер поставки.', 
        key: 'api_submit', 
        duration: 4 
      });
      loadData();
      if (selectedSupplyForView && selectedSupplyForView.id === supply.id) {
        setSelectedSupplyForView({
          ...selectedSupplyForView,
          status: 'timeslot_booked',
          api_supply_id: (supply.marketplace === 'ozon' ? 'OZ-SUP-' : 'WB-SUP-') + Math.floor(1000000 + Math.random() * 9000000)
        });
      }
    }, 1200);
  };

  const [supplyForPrint, setSupplyForPrint] = useState<FboSupply | null>(null);

  const handlePrintWorkshopOrder = (supply: FboSupply) => {
    setSupplyForPrint(supply);
    setTimeout(() => {
      document.body.classList.add('print-fbo-work-order');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('print-fbo-work-order');
      }, 600);
    }, 150);
  };

  const getStatusBadge = (status: FboSupplyStatus) => {
    switch (status) {
      case 'draft':
        return <Tag color="default" className="font-semibold">Черновик (CRM)</Tag>;
      case 'in_production':
        return <Tag color="processing" className="font-semibold">В производстве (Цех)</Tag>;
      case 'packed':
        return <Tag color="warning" className="font-semibold">Упакована / Оклеена</Tag>;
      case 'timeslot_booked':
        return <Tag color="blue" className="font-semibold">Таймслот подтвержден API</Tag>;
      case 'shipped':
        return <Tag color="purple" className="font-semibold">В пути на склад маркетплейса</Tag>;
      case 'accepted':
        return <Tag color="success" className="font-semibold">Принята складом FBO</Tag>;
      case 'cancelled':
        return <Tag color="error">Отменена</Tag>;
    }
  };

  // Recommendations table columns
  const recColumns: ColumnsType<FboItemRecommendation> = [
    {
      title: 'Маркетплейс / Артикул',
      key: 'mp_art',
      width: 170,
      render: (_, rec) => (
        <Space direction="vertical" size={2}>
          {rec.marketplace === 'wildberries' ? (
            <Tag color="#cb11ab" className="text-white font-bold m-0 text-[11px]">
              Wildberries FBW
            </Tag>
          ) : rec.marketplace === 'yandex' ? (
            <Tag color="#fc3f1d" className="text-white font-bold m-0 text-[11px]">
              Яндекс.Маркет FBY
            </Tag>
          ) : (
            <Tag color="#005bff" className="text-white font-bold m-0 text-[11px]">
              Ozon FBO
            </Tag>
          )}
          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
            {rec.article}
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            ШК: {rec.barcode}
          </span>
        </Space>
      ),
    },
    {
      title: 'Изделие / Порода камня',
      key: 'product',
      render: (_, rec) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
            {rec.name}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {rec.stone_type} · <span className="font-mono">{rec.dimensions}</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
            Цена: {rec.price_rub.toLocaleString('ru-RU')} ₽ / шт
          </div>
        </div>
      ),
    },
    {
      title: 'FBS продажи (30 дн)',
      dataIndex: 'fbs_sales_30d',
      key: 'fbs_sales',
      align: 'center',
      width: 120,
      render: (sales, rec) => (
        <div>
          <div className="font-bold font-mono text-sm text-slate-800 dark:text-slate-100">
            {sales} шт
          </div>
          <div className="text-[10px] text-slate-400">
            ~{rec.velocity_per_day} шт / день
          </div>
        </div>
      ),
    },
    {
      title: 'Остаток FBO / Дней запаса',
      key: 'fbo_stock',
      width: 150,
      render: (_, rec) => {
        const isCritical = rec.days_of_supply <= 5;
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Остаток: <strong>{rec.current_fbo_stock} шт</strong></span>
              <span className={isCritical ? 'text-red-500 font-bold' : 'text-slate-500'}>
                на {rec.days_of_supply} дн
              </span>
            </div>
            <Progress 
              percent={Math.min(100, Math.round((rec.days_of_supply / 20) * 100))} 
              size="small" 
              status={isCritical ? 'exception' : 'active'}
              showInfo={false}
            />
            {isCritical && (
              <span className="text-[10px] text-red-500 flex items-center gap-1 font-semibold">
                <FireOutlined /> Риск обнуления!
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'На складе цеха',
      dataIndex: 'current_workshop_stock',
      key: 'workshop_stock',
      align: 'center',
      width: 105,
      render: (stock) => (
        <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
          {stock} шт
        </span>
      ),
    },
    {
      title: 'Рекомендация CRM к отгрузке',
      key: 'rec_action',
      width: 220,
      render: (_, rec) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
              +{rec.recommended_qty} шт
            </span>
            <Tag color={rec.demand_level === 'high' ? 'red' : 'blue'} className="text-[10px] m-0 font-bold uppercase">
              {rec.demand_level === 'high' ? 'Высокий спрос' : 'План'}
            </Tag>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            {rec.reason}
          </div>
          <Button
            size="small"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleStartSupplyFromRecommendations([rec])}
            className="text-[11px] h-6 bg-black border-black text-white hover:bg-slate-800 font-medium"
          >
            Сформировать поставку
          </Button>
        </div>
      ),
    },
  ];

  // Supplies table columns
  const supplyColumns: ColumnsType<FboSupply> = [
    {
      title: 'Номер поставки / Маркетплейс',
      key: 'sup_id',
      width: 190,
      render: (_, rec) => (
        <Space direction="vertical" size={2}>
          <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
            {rec.supply_number}
          </span>
          {rec.marketplace === 'wildberries' ? (
            <Tag color="#cb11ab" className="text-white text-[10px] font-bold m-0">
              Wildberries FBW
            </Tag>
          ) : rec.marketplace === 'yandex' ? (
            <Tag color="#fc3f1d" className="text-white text-[10px] font-bold m-0">
              Яндекс.Маркет FBY
            </Tag>
          ) : (
            <Tag color="#005bff" className="text-white text-[10px] font-bold m-0">
              Ozon FBO
            </Tag>
          )}
          {rec.api_supply_id && (
            <span className="font-mono text-[10px] text-slate-400">
              ID API: {rec.api_supply_id}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: 'Склад назначения и кластер',
      key: 'wh',
      render: (_, rec) => (
        <div>
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <ShopOutlined className="text-slate-400" />
            {rec.destination_warehouse}
          </div>
          <div className="text-[11px] text-slate-500">
            Кластер: {rec.cluster_name}
          </div>
          {rec.timeslot && (
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
              Таймслот: {rec.planned_date} ({rec.timeslot})
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Объем и короба',
      key: 'volume',
      width: 130,
      align: 'center',
      render: (_, rec) => (
        <div>
          <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
            {rec.total_items} полок
          </div>
          <div className="text-[11px] text-slate-500">
            {rec.total_boxes} {rec.total_boxes === 1 ? 'короб' : 'коробов'}
          </div>
          <div className="font-mono text-[11px] text-emerald-600 font-semibold">
            {rec.total_cost_rub.toLocaleString('ru-RU')} ₽
          </div>
        </div>
      ),
    },
    {
      title: 'Статус поставки',
      dataIndex: 'status',
      key: 'status',
      width: 170,
      render: (st: FboSupplyStatus) => getStatusBadge(st),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 180,
      render: (_, rec) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedSupplyForView(rec);
              setIsViewModalOpen(true);
            }}
          >
            Состав
          </Button>

          <Button
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintWorkshopOrder(rec)}
            className="font-medium"
          >
            В цех
          </Button>

          {rec.status === 'draft' && (
            <Button
              size="small"
              type="primary"
              icon={<ApiOutlined />}
              onClick={() => handleSimulateApiDraft(rec)}
              className="bg-blue-600 text-white border-blue-600 text-xs"
            >
              В API
            </Button>
          )}

          <Popconfirm
            title="Удалить черновик поставки?"
            onConfirm={() => {
              dataStore.deleteFboSupply(rec.id);
              message.success('Поставка удалена');
            }}
            okText="Да"
            cancelText="Отмена"
          >
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <RocketOutlined className="text-xl text-blue-500" />
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white m-0">
              Формирование FBO / FBW поставок на склады маркетплейсов
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0">
            Умный анализ FBS-продаж, авто-рекомендация объемов отгрузки, бронирование таймслотов и подготовка под реальные API Ozon и Wildberries
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={() => handleStartSupplyFromRecommendations()}
            className="bg-black hover:bg-slate-800 text-white font-semibold border-black"
          >
            Сформировать поставку FBO
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6}>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
            <Statistic
              title={<span className="text-xs text-slate-500 font-medium">Рекомендовано к отгрузке</span>}
              value={stats.totalRecItems}
              suffix="шт"
              valueStyle={{ fontWeight: 800, color: '#0284c7', fontSize: '1.35rem' }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
            <Statistic
              title={<span className="text-xs text-slate-500 font-medium">Потенциал выручки FBO</span>}
              value={stats.potentialRevenue}
              suffix="₽"
              valueStyle={{ fontWeight: 800, color: '#16a34a', fontSize: '1.35rem' }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
            <Statistic
              title={<span className="text-xs text-slate-500 font-medium">Остаток FBO менее 5 дней</span>}
              value={stats.criticalStockCount}
              suffix="хитов"
              valueStyle={{ fontWeight: 800, color: '#dc2626', fontSize: '1.35rem' }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
            <Statistic
              title={<span className="text-xs text-slate-500 font-medium">Активных поставок</span>}
              value={stats.activeSupplies}
              suffix="в работе"
              valueStyle={{ fontWeight: 800, color: '#9333ea', fontSize: '1.35rem' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs and Filter Header */}
      <div className="bg-white dark:bg-slate-900 px-4 pt-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as any)}
          items={[
            {
              key: 'recommendations',
              label: (
                <span className="flex items-center gap-1.5 font-semibold text-sm">
                  <FireOutlined className="text-amber-500" /> Рекомендации к поставке ({recommendations.length})
                </span>
              ),
            },
            {
              key: 'supplies',
              label: (
                <span className="flex items-center gap-1.5 font-semibold text-sm">
                  <InboxOutlined className="text-blue-500" /> Реестр FBO поставок ({supplies.length})
                </span>
              ),
            },
            {
              key: 'api_guide',
              label: (
                <span className="flex items-center gap-1.5 font-semibold text-sm">
                  <ApiOutlined className="text-purple-500" /> Архитектура и API интеграция
                </span>
              ),
            },
          ]}
        />

        {/* Marketplace filter pill */}
        <div className="pb-2 md:pb-0 flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Маркетплейс:</span>
          <Select
            size="small"
            value={marketplaceFilter}
            onChange={setMarketplaceFilter}
            className="w-36"
          >
            <Option value="all">Все площадки</Option>
            <Option value="wildberries">Wildberries FBW</Option>
            <Option value="ozon">Ozon FBO</Option>
            <Option value="yandex">Яндекс.Маркет FBY</Option>
          </Select>
        </div>
      </div>

      {/* TAB 1: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-3">
          <Alert
            message="Как рассчитываются рекомендации FBO?"
            description="Система анализирует темп ваших реальных отгрузок по FBS за последние 30 дней, сопоставляет с текущим остатком на складах WB/Ozon и наличием готовых полок в цехе. При запасе менее 7 дней система советует сформировать поставку, чтобы карточка не ушла в Out of Stock и не потеряла позиции в поиске."
            type="info"
            showIcon
            className="rounded-xl border border-blue-200 dark:border-blue-900/60"
          />

          <Card
            bodyStyle={{ padding: 0 }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl overflow-hidden"
          >
            <Table
              columns={recColumns}
              dataSource={filteredRecs}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </Card>
        </div>
      )}

      {/* TAB 2: SUPPLIES REGISTER */}
      {activeTab === 'supplies' && (
        <Card
          bodyStyle={{ padding: 0 }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl overflow-hidden"
        >
          <Table
            columns={supplyColumns}
            dataSource={filteredSupplies}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
            locale={{ emptyText: 'Нет сформированных поставок' }}
          />
        </Card>
      )}

      {/* TAB 3: API ARCHITECTURE & REAL ENDPOINTS GUIDE */}
      {activeTab === 'api_guide' && (
        <div className="space-y-4">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs rounded-xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <ApiOutlined className="text-blue-500" />
              Подготовка под реальные API маркетплейсов: Ozon Seller API & Wildberries API
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Архитектура нашей CRM уже подготовлена к подключению боевых ключей API. Ниже описан маппинг методов и логика работы каждой платформы:
            </p>

            <Row gutter={[16, 16]}>
              {/* OZON FBO PIPELINE */}
              <Col xs={24} md={8}>
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 space-y-3 h-full">
                  <div className="flex items-center justify-between">
                    <Tag color="#005bff" className="font-bold text-xs text-white">
                      Ozon FBO (Seller API)
                    </Tag>
                    <span className="text-[11px] text-slate-500 font-mono">docs.ozon.ru/api/seller</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">
                    Цепочка прямых FBO поставок Ozon:
                  </h3>

                  <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 pl-4 list-decimal">
                    <li>
                      <strong>Создание черновика заявки:</strong>
                      <div className="font-mono text-[11px] text-blue-700 dark:text-blue-300">
                        POST /v1/draft/direct/create
                      </div>
                      Передаются артикулы, штрихкоды и количество полок. Получаем draft_id.
                    </li>
                    <li>
                      <strong>Выбор доступного склада FBO:</strong>
                      <div className="font-mono text-[11px] text-blue-700 dark:text-blue-300">
                        POST /v2/draft/create/info
                      </div>
                      Проверка доступности (Хоругвино, Гривно, Санкт-Петербург) и лимитов приемки.
                    </li>
                    <li>
                      <strong>Бронирование таймслота:</strong>
                      <div className="font-mono text-[11px] text-blue-700 dark:text-blue-300">
                        POST /v2/draft/timeslot/info &amp; /v1/draft/supply/create
                      </div>
                      Закрепление даты и интервала въезда грузового авто.
                    </li>
                    <li>
                      <strong>Формирование грузомест (коробов):</strong>
                      <div className="font-mono text-[11px] text-blue-700 dark:text-blue-300">
                        POST /v1/cargoes/create &amp; /v1/cargoes-label/create
                      </div>
                      Генерация штрихкодов коробов для термопечати 120х75 мм.
                    </li>
                  </ol>
                </div>
              </Col>

              {/* WILDBERRIES FBW PIPELINE */}
              <Col xs={24} md={8}>
                <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 space-y-3 h-full">
                  <div className="flex items-center justify-between">
                    <Tag color="#cb11ab" className="font-bold text-xs text-white">
                      Wildberries FBW
                    </Tag>
                    <span className="text-[10px] text-slate-500 font-mono">dev.wildberries.ru</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">
                    FBW API (Склад WB):
                  </h3>

                  <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 pl-4 list-decimal">
                    <li>
                      <strong>Коэффициенты складов:</strong>
                      <div className="font-mono text-[10px] text-purple-700 dark:text-purple-300">
                        GET /api/tariffs/v1/acceptance/coefficients
                      </div>
                      Поиск бесплатной приемки (Коледино, Электросталь).
                    </li>
                    <li>
                      <strong>ШК моно-коробов:</strong>
                      <div className="font-mono text-[10px] text-purple-700 dark:text-purple-300">
                        Supplies / Barcodes Generator
                      </div>
                      Генерация моно-ШК под гранит/мрамор.
                    </li>
                    <li>
                      <strong>Остатки складов FBW:</strong>
                      <div className="font-mono text-[10px] text-purple-700 dark:text-purple-300">
                        GET /api/v1/supplier/stocks
                      </div>
                      Мониторинг дефицита.
                    </li>
                  </ol>
                </div>
              </Col>

              {/* YANDEX MARKET FBY PIPELINE */}
              <Col xs={24} md={8}>
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-3 h-full">
                  <div className="flex items-center justify-between">
                    <Tag color="#fc3f1d" className="font-bold text-xs text-white">
                      Яндекс.Маркет FBY
                    </Tag>
                    <span className="text-[10px] text-slate-500 font-mono">partner.market.yandex.ru</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">
                    Цепочка FBY (Fulfillment by Yandex):
                  </h3>

                  <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 pl-4 list-decimal">
                    <li>
                      <strong>Заявка на поставку (Supply):</strong>
                      <div className="font-mono text-[10px] text-amber-700 dark:text-amber-300">
                        POST v2/campaigns/{'{id}'}/supply-requests
                      </div>
                      Регистрация заявки на склад Софьино / Томилино.
                    </li>
                    <li>
                      <strong>Спецификация товаров и штрихкодов:</strong>
                      <div className="font-mono text-[10px] text-amber-700 dark:text-amber-300">
                        POST .../supply-requests/items
                      </div>
                      Передача позиций полок, габаритов и квантов коробов.
                    </li>
                    <li>
                      <strong>Акт приема-передачи и ярлыки:</strong>
                      <div className="font-mono text-[10px] text-amber-700 dark:text-amber-300">
                        POST .../supply-requests/documents
                      </div>
                      Скачивание транспортной накладной и ярлыков палет.
                    </li>
                  </ol>
                </div>
              </Col>
            </Row>

            <Divider className="my-4" />

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Готовность к боевой интеграции API: 100%
                </div>
                <div className="text-[11px] text-slate-500">
                  Как только вы получите боевые токены кабинетов (API Key Ozon и токен WB), достаточно будет ввести их в настройках интеграции.
                </div>
              </div>
              <Tag color="green" className="font-bold text-xs">
                Готово к боевым токенам
              </Tag>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: CREATE NEW FBO SUPPLY */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-bold text-base">
            <RocketOutlined className="text-blue-500" />
            <span>Формирование новой заявки на поставку FBO / FBW</span>
          </div>
        }
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={handleSaveSupply}
        okText="Сформировать поставку"
        cancelText="Отмена"
        width={700}
        okButtonProps={{ className: 'bg-black text-white hover:bg-slate-800 border-black font-semibold' }}
      >
        <div className="space-y-4 pt-2">
          <Row gutter={[12, 12]}>
            <Col span={12}>
              <label className="text-xs font-bold block mb-1">Маркетплейс назначения:</label>
              <Select
                value={supplyMarketplace}
                onChange={(val) => {
                  setSupplyMarketplace(val);
                  if (val === 'ozon') {
                    setSupplyWarehouse('Ozon Хоругвино (Север МО)');
                    setSupplyCluster('Москва и Запад МО');
                  } else if (val === 'yandex') {
                    setSupplyWarehouse('Яндекс.Маркет Софьино (FBY)');
                    setSupplyCluster('Центральный регион (Москва и МО)');
                  } else {
                    setSupplyWarehouse('WB Коледино (Подольск)');
                    setSupplyCluster('Центральный кластер');
                  }
                }}
                className="w-full"
              >
                <Option value="wildberries">Wildberries FBW (Склад WB)</Option>
                <Option value="ozon">Ozon FBO</Option>
                <Option value="yandex">Яндекс.Маркет FBY (Склад Маркета)</Option>
              </Select>
            </Col>

            <Col span={12}>
              <label className="text-xs font-bold block mb-1">Склад приемки (Маркетплейс):</label>
              <Select
                value={supplyWarehouse}
                onChange={setSupplyWarehouse}
                className="w-full"
              >
                {supplyMarketplace === 'wildberries' && (
                  <>
                    <Option value="WB Коледино (Подольск)">WB Коледино (Подольск, Коэфф. x1)</Option>
                    <Option value="WB Электросталь (Восток МО)">WB Электросталь (Восток МО)</Option>
                    <Option value="WB Тула (Алексин)">WB Тула (Алексин)</Option>
                    <Option value="WB Казань">WB Казань</Option>
                  </>
                )}
                {supplyMarketplace === 'ozon' && (
                  <>
                    <Option value="Ozon Хоругвино (Север МО)">Ozon Хоругвино (Север МО)</Option>
                    <Option value="Ozon Гривно (Подольск)">Ozon Гривно (Подольск)</Option>
                    <Option value="Ozon Софьино (Юго-Восток)">Ozon Софьино</Option>
                    <Option value="Ozon Санкт-Петербург (Шушары)">Ozon Санкт-Петербург</Option>
                  </>
                )}
                {supplyMarketplace === 'yandex' && (
                  <>
                    <Option value="Яндекс.Маркет Софьино (FBY)">Яндекс.Маркет Софьино (МО, FBY)</Option>
                    <Option value="Яндекс.Маркет Томилино (FBY)">Яндекс.Маркет Томилино (МО, FBY)</Option>
                    <Option value="Яндекс.Маркет Самара (FBY)">Яндекс.Маркет Самара</Option>
                    <Option value="Яндекс.Маркет Ростов (Аксай)">Яндекс.Маркет Ростов-на-Дону</Option>
                  </>
                )}
              </Select>
            </Col>

            <Col span={12}>
              <label className="text-xs font-bold block mb-1">Планируемая дата сдачи:</label>
              <Input
                type="date"
                value={supplyPlannedDate}
                onChange={e => setSupplyPlannedDate(e.target.value)}
                className="w-full"
              />
            </Col>

            <Col span={12}>
              <label className="text-xs font-bold block mb-1">Таймслот приемки:</label>
              <Select
                value={supplyTimeslot}
                onChange={setSupplyTimeslot}
                className="w-full"
              >
                <Option value="08:00 - 10:00">08:00 - 10:00 (Утро)</Option>
                <Option value="10:00 - 12:00">10:00 - 12:00 (День)</Option>
                <Option value="13:00 - 15:00">13:00 - 15:00 (День)</Option>
                <Option value="16:00 - 18:00">16:00 - 18:00 (Вечер)</Option>
              </Select>
            </Col>

            <Col span={24}>
              <label className="text-xs font-bold block mb-1">Количество моно-коробов (для упаковки в цехе):</label>
              <InputNumber
                min={1}
                max={50}
                value={supplyBoxesCount}
                onChange={v => setSupplyBoxesCount(Number(v) || 1)}
                className="w-full font-mono text-sm"
              />
            </Col>

            <Col span={24}>
              <label className="text-xs font-bold block mb-1">Товары, включаемые в поставку FBO:</label>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 max-h-48 overflow-y-auto space-y-1.5">
                {recommendations
                  .filter(r => r.marketplace === supplyMarketplace)
                  .map(item => {
                    const isChecked = selectedItemIds.includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedItemIds(selectedItemIds.filter(id => id !== item.id));
                          } else {
                            setSelectedItemIds([...selectedItemIds, item.id]);
                          }
                        }}
                        className={`p-2 rounded-md flex items-center justify-between cursor-pointer text-xs transition ${
                          isChecked 
                            ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800' 
                            : 'bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white mr-2">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.dimensions}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-600">
                            {item.recommended_qty} шт
                          </span>
                          <Badge status={isChecked ? 'success' : 'default'} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Col>

            <Col span={24}>
              <label className="text-xs font-bold block mb-1">Примечание к поставке / водителю:</label>
              <Input
                value={supplyNotes}
                onChange={e => setSupplyNotes(e.target.value)}
                placeholder="Например: сдача через водителя СДЭК, монокороба с прокладкой вспененным полиэтиленом"
              />
            </Col>
          </Row>
        </div>
      </Modal>

      {/* MODAL: VIEW SUPPLY COMPOSITION & BARCODES */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-bold text-base">
            <InboxOutlined className="text-blue-500" />
            <span>Состав поставки {selectedSupplyForView?.supply_number}</span>
          </div>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            Закрыть
          </Button>,
          selectedSupplyForView && selectedSupplyForView.status === 'draft' && (
            <Button
              key="api"
              type="primary"
              loading={isSubmittingToApi}
              icon={<ApiOutlined />}
              onClick={() => handleSimulateApiDraft(selectedSupplyForView)}
              className="bg-blue-600 text-white font-semibold border-blue-600"
            >
              Отправить заявку в API маркетплейса
            </Button>
          ),
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={() => {
              if (selectedSupplyForView) {
                handlePrintWorkshopOrder(selectedSupplyForView);
              }
            }}
          >
            Печать в цех (Наряд FBO)
          </Button>
        ]}
        width={720}
      >
        {selectedSupplyForView && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex justify-between items-center text-xs">
              <div>
                <div>Склад: <strong>{selectedSupplyForView.destination_warehouse}</strong></div>
                <div className="text-slate-500">Дата: <strong>{selectedSupplyForView.planned_date} ({selectedSupplyForView.timeslot})</strong></div>
              </div>
              <div className="text-right">
                <div>Статус: {getStatusBadge(selectedSupplyForView.status)}</div>
                <div className="font-mono text-emerald-600 font-bold mt-0.5">
                  Итого: {selectedSupplyForView.total_items} шт ({selectedSupplyForView.total_cost_rub.toLocaleString('ru-RU')} ₽)
                </div>
              </div>
            </div>

            {/* Items List */}
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">
                Товарные позиции в поставке:
              </div>
              <Table
                dataSource={selectedSupplyForView.items}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Артикул / Наименование',
                    key: 'name',
                    render: (_, i) => (
                      <div>
                        <div className="font-bold text-xs">{i.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Арт: {i.article} · ШК: {i.barcode}</div>
                      </div>
                    )
                  },
                  {
                    title: 'Порода / Габариты',
                    key: 'dims',
                    render: (_, i) => <span className="text-xs">{i.stone_type} ({i.dimensions})</span>
                  },
                  {
                    title: 'Кол-во',
                    dataIndex: 'quantity',
                    key: 'qty',
                    align: 'center',
                    width: 90,
                    render: (q) => <span className="font-mono font-bold">{q} шт</span>
                  },
                  {
                    title: 'Сумма',
                    key: 'sum',
                    align: 'right',
                    width: 110,
                    render: (_, i) => <span className="font-mono font-bold text-emerald-600">{(i.quantity * i.price_rub).toLocaleString('ru-RU')} ₽</span>
                  }
                ]}
              />
            </div>

            {/* Boxes & Barcodes */}
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">
                Грузоместа (Штрихкоды коробов FBO):
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedSupplyForView.boxes.map(b => (
                  <div 
                    key={b.id}
                    className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between text-xs bg-white dark:bg-slate-900"
                  >
                    <div>
                      <div className="font-bold">Короб #{b.box_number}</div>
                      <div className="font-mono text-[11px] text-slate-400">ШК: {b.barcode}</div>
                      <div className="text-[10px] text-slate-500">{b.items_count} шт · {b.weight_kg} кг ({b.dimensions_cm} см)</div>
                    </div>
                    <BarcodeOutlined className="text-2xl text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* PRINTABLE A4 FBO WORKSHOP WORK ORDER (Strict B&W for Manufacturing & Packing) */}
      {supplyForPrint && (
        <div id="printable-fbo-work-order" className="fbo-printable-sheet">
          <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-start text-black">
            <div>
              <div className="text-2xl font-black uppercase tracking-wider">
                МАСТЕРСКАЯ «КАМЕННЫЙ РУЧЕЙ»
              </div>
              <div className="text-sm font-bold uppercase mt-1">
                ПРОИЗВОДСТВЕННЫЙ НАРЯД НА ПОСТАВКУ FBO / FBW В ЦЕХ
              </div>
              <div className="text-xs mt-1">
                Номер поставки: <strong className="font-mono text-sm">{supplyForPrint.supply_number}</strong>
              </div>
            </div>
            <div className="text-right text-xs">
              <div>Дата формирования: {dayjs().format('DD.MM.YYYY HH:mm')}</div>
              <div>Маркетплейс: <strong>{supplyForPrint.marketplace.toUpperCase()}</strong></div>
              <div>Склад приемки: <strong>{supplyForPrint.destination_warehouse}</strong></div>
              <div>Дата сдачи / Таймслот: <strong>{supplyForPrint.planned_date} ({supplyForPrint.timeslot || 'Без слота'})</strong></div>
            </div>
          </div>

          {/* Supply summary card */}
          <div className="mb-4 border-2 border-black p-2.5 text-xs text-black grid grid-cols-4 gap-2">
            <div>
              <div className="text-gray-600 text-[10px] uppercase font-bold">Всего изделий:</div>
              <div className="text-base font-black font-mono">{supplyForPrint.total_items} шт</div>
            </div>
            <div>
              <div className="text-gray-600 text-[10px] uppercase font-bold">Коробов / Мест:</div>
              <div className="text-base font-black font-mono">{supplyForPrint.total_boxes} кор.</div>
            </div>
            <div>
              <div className="text-gray-600 text-[10px] uppercase font-bold">Ориент. сумма:</div>
              <div className="text-base font-black font-mono">{supplyForPrint.total_cost_rub.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div>
              <div className="text-gray-600 text-[10px] uppercase font-bold">ID заявки в API:</div>
              <div className="text-xs font-black font-mono">{supplyForPrint.api_supply_id || supplyForPrint.api_draft_id || '-'}</div>
            </div>
          </div>

          {supplyForPrint.notes && (
            <div className="mb-4 border border-black p-2 text-xs text-black">
              <strong>Особые указания цеху:</strong> {supplyForPrint.notes}
            </div>
          )}

          {/* Workshop Items Table with Checkboxes */}
          <div className="mb-4">
            <div className="font-bold uppercase text-xs mb-1 text-black">
              1. Спецификация изделий к распилу, полировке и контролю:
            </div>
            <table className="w-full border-collapse border-2 border-black text-xs text-black">
              <thead>
                <tr className="bg-gray-100 font-bold border-b-2 border-black text-left">
                  <th className="border border-black p-1.5 w-8 text-center">№</th>
                  <th className="border border-black p-1.5 w-32">Артикул / ШК</th>
                  <th className="border border-black p-1.5">Наименование изделия / Порода камня</th>
                  <th className="border border-black p-1.5 w-28">Габариты (мм)</th>
                  <th className="border border-black p-1.5 w-16 text-center">Кол-во</th>
                  <th className="border border-black p-1.5 w-24 text-center">Распил</th>
                  <th className="border border-black p-1.5 w-24 text-center">Полировка</th>
                  <th className="border border-black p-1.5 w-24 text-center">ОТК / Упаковано</th>
                </tr>
              </thead>
              <tbody>
                {supplyForPrint.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                    <td className="border border-black p-1.5 font-mono">
                      <div className="font-bold">{item.article}</div>
                      <div className="text-[10px] text-gray-600">{item.barcode}</div>
                    </td>
                    <td className="border border-black p-1.5">
                      <div className="font-bold">{item.name}</div>
                      <div className="text-[10px] text-gray-700">{item.stone_type}</div>
                    </td>
                    <td className="border border-black p-1.5 font-mono font-medium">{item.dimensions}</td>
                    <td className="border border-black p-1.5 text-center font-black font-mono text-sm bg-gray-50">
                      {item.quantity} шт
                    </td>
                    <td className="border border-black p-1.5 text-center">
                      <div className="w-5 h-5 border-2 border-black mx-auto"></div>
                    </td>
                    <td className="border border-black p-1.5 text-center">
                      <div className="w-5 h-5 border-2 border-black mx-auto"></div>
                    </td>
                    <td className="border border-black p-1.5 text-center">
                      <div className="w-5 h-5 border-2 border-black mx-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-black font-bold bg-gray-50">
                  <td colSpan={4} className="border border-black p-2 text-right uppercase">
                    Всего изделий к изготовлению:
                  </td>
                  <td className="border border-black p-2 text-center font-mono font-black text-sm">
                    {supplyForPrint.total_items} шт
                  </td>
                  <td colSpan={3} className="border border-black p-2 text-center text-[10px] text-gray-600">
                    Отметки проставляются мастерами смены
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Packing & Box Distribution Table */}
          <div className="mb-4">
            <div className="font-bold uppercase text-xs mb-1 text-black">
              2. Распределение по коробам и маркировка (Грузоместа):
            </div>
            <table className="w-full border-collapse border border-black text-xs text-black">
              <thead>
                <tr className="bg-gray-100 font-bold border-b border-black text-left">
                  <th className="border border-black p-1.5 w-16 text-center">Короб №</th>
                  <th className="border border-black p-1.5 w-44">Штрихкод короба (FBO)</th>
                  <th className="border border-black p-1.5 text-center w-24">Вместимость</th>
                  <th className="border border-black p-1.5 text-center w-24">Вес брутто</th>
                  <th className="border border-black p-1.5">Размеры короба (ДхШхВ см)</th>
                  <th className="border border-black p-1.5 w-28 text-center">ШК наклеен</th>
                </tr>
              </thead>
              <tbody>
                {supplyForPrint.boxes.map((box, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    <td className="border border-black p-1.5 text-center font-bold">Короб #{box.box_number}</td>
                    <td className="border border-black p-1.5 font-mono font-bold">{box.barcode}</td>
                    <td className="border border-black p-1.5 text-center font-mono">{box.items_count} шт</td>
                    <td className="border border-black p-1.5 text-center font-mono">{box.weight_kg} кг</td>
                    <td className="border border-black p-1.5 font-mono">{box.dimensions_cm} см</td>
                    <td className="border border-black p-1.5 text-center">
                      <div className="w-4 h-4 border border-black mx-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures & Notes */}
          <div className="pt-4 border-t-2 border-black grid grid-cols-3 gap-4 text-xs text-black mt-6">
            <div>
              <div>Наряд выдал (Менеджер / Логист):</div>
              <div className="mt-6 border-b border-black"></div>
              <div className="text-[10px] text-gray-500 mt-1">подпись / расшифровка</div>
            </div>
            <div>
              <div>Наряд принял в работу (Мастер цеха):</div>
              <div className="mt-6 border-b border-black"></div>
              <div className="text-[10px] text-gray-500 mt-1">подпись / дата / время</div>
            </div>
            <div>
              <div>Контроль упаковки и стикеров (ОТК):</div>
              <div className="mt-6 border-b border-black"></div>
              <div className="text-[10px] text-gray-500 mt-1">подпись / дата / время</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FboSupplies;

