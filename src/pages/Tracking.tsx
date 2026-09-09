import React, { useState } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Timeline, 
  Tag, 
  Typography, 
  Row, 
  Col, 
  Modal, 
  Form, 
  Select, 
  message, 
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  SyncOutlined, 
  CarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  EnvironmentOutlined,
  CopyOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  ApiOutlined
} from '@ant-design/icons';
import type { TrackingItem } from '../types';
import { dataStore, subscribeDataStore } from '../api/dataStore';
import { CdekApiTestModal } from '../components/CdekApiTestModal';

const { Title, Text } = Typography;
const { Option } = Select;

const statusBadgeColors: Record<TrackingItem['status'], string> = {
  created: 'default',
  sent: 'blue',
  in_transit: 'cyan',
  pvz_ready: 'orange',
  delivered: 'green',
  returned: 'red',
};

const statusTitles: Record<TrackingItem['status'], string> = {
  created: 'Создана накладная',
  sent: 'Принят в СДЭК',
  in_transit: 'В пути между городами',
  pvz_ready: 'Готов к выдаче в ПВЗ',
  delivered: 'Вручен получателю',
  returned: 'Возврат',
};

const Tracking: React.FC = () => {
  const [trackings, setTrackings] = useState<TrackingItem[]>(dataStore.getTrackings());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTracking, setSelectedTracking] = useState<TrackingItem | null>(
    trackings.length > 0 ? trackings[0] : null
  );
  const [mobileDetailView, setMobileDetailView] = useState(false);
  const [copiedTrack, setCopiedTrack] = useState<string | null>(null);

  // Modal create tracking
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApiTestOpen, setIsApiTestOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCopy = (trackNum: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(trackNum);
    setCopiedTrack(trackNum);
    message.success(`Трек СДЭК ${trackNum} скопирован!`);
    setTimeout(() => setCopiedTrack(null), 2000);
  };

  const loadList = () => {
    const list = dataStore.getTrackings();
    setTrackings(list);
    if (selectedTracking) {
      const updated = list.find(t => t.id === selectedTracking.id);
      if (updated) setSelectedTracking(updated);
    }
  };

  React.useEffect(() => {
    loadList();
    window.addEventListener('focus', loadList);
    const unsubscribe = subscribeDataStore(() => {
      loadList();
    });
    return () => {
      window.removeEventListener('focus', loadList);
      unsubscribe();
    };
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      message.warning('Введите трек-номер или номер заказа для поиска');
      return;
    }
    const found = dataStore.findTracking(searchQuery);
    if (found) {
      setSelectedTracking(found);
      setMobileDetailView(true);
      message.success(`Найдено отправление: ${found.tracking_number}`);
    } else {
      message.error('Отправление с таким трек-номером или заказом не найдено');
    }
  };

  const handleRefresh = (id: string) => {
    const updated = dataStore.refreshTracking(id);
    if (updated) {
      message.info(`Статус СДЭК обновлен: ${statusTitles[updated.status]}`);
      loadList();
    }
  };

  const handleCreateTracking = async () => {
    try {
      const values = await form.validateFields();
      dataStore.addTracking(values);
      message.success('Отправление СДЭК добавлено');
      setIsModalOpen(false);
      form.resetFields();
      loadList();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Title level={3} style={{ margin: 0 }} className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            <CarOutlined className="mr-2 text-blue-500" />
            Интеграция со СДЭК: Отслеживание доставок
          </Title>
          <Text className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Контроль перемещения каменных полок покупателям, проверка статусов ПВЗ и вручения
          </Text>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Button 
            icon={<ApiOutlined />} 
            size="large"
            className="border-blue-500 text-blue-600 dark:text-blue-400 hover:!border-blue-400 font-medium"
            onClick={() => setIsApiTestOpen(true)}
          >
            Тест API СДЭК v2
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            className="bg-blue-600 hover:bg-blue-500 w-full sm:w-auto font-medium"
            onClick={() => setIsModalOpen(true)}
          >
            Добавить трек СДЭК
          </Button>
        </div>
      </div>

      {/* Quick Search */}
      <Card className="apple-card rounded-2xl" styles={{ body: { padding: '16px' } }}>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Input 
            size="large"
            placeholder="Введите трек СДЭК (например 1489201934) или номер заказа..." 
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="flex-1"
          />
          <Button 
            type="primary" 
            size="large" 
            icon={<SearchOutlined />} 
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl px-6"
          >
            Найти
          </Button>
        </div>
      </Card>

      {/* Main Grid: List on Left, Timeline Details on Right */}
      <Row gutter={[16, 16]}>
        {/* Left Column: Tracking Items List */}
        <Col 
          xs={24} 
          lg={9}
          className={mobileDetailView ? 'hidden lg:block' : 'block'}
        >
          <Card 
            title={
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-slate-100">
                Активные отправления ({trackings.length})
              </span>
            } 
            className="apple-card rounded-2xl"
            styles={{ body: { padding: '14px' } }}
          >
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {trackings.map(t => {
                const isSelected = selectedTracking?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTracking(t);
                      setMobileDetailView(true);
                    }}
                    className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500/10 shadow-sm' 
                        : 'border-slate-200/60 dark:border-slate-800 hover:border-blue-400/50 bg-white/40 dark:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1 gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-blue-500 text-sm font-mono">
                          {t.tracking_number}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(t.tracking_number, e)}
                          className="text-slate-400 hover:text-blue-500 p-0.5 cursor-pointer"
                          title="Копировать трек"
                        >
                          {copiedTrack === t.tracking_number ? <CheckOutlined className="text-emerald-500" /> : <CopyOutlined />}
                        </button>
                      </div>
                      <Tag color={statusBadgeColors[t.status]} className="text-[10px] m-0 rounded-full font-medium px-2">
                        {statusTitles[t.status]}
                      </Tag>
                    </div>

                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{t.recipient_name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-1">
                      <EnvironmentOutlined className="text-slate-400 shrink-0" />
                      <span className="truncate">{t.destination_city}</span>
                    </div>

                    {t.order_number && (
                      <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between border-t border-slate-200/60 dark:border-slate-800 pt-1.5 font-medium">
                        <span>Заказ: <strong className="font-mono text-slate-900 dark:text-slate-100">{t.order_number}</strong></span>
                        <span className="text-blue-600 dark:text-cyan-400 truncate max-w-[150px]">{t.label}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* Right Column: Detailed Timeline */}
        <Col 
          xs={24} 
          lg={15}
          className={!mobileDetailView ? 'hidden lg:block' : 'block'}
        >
          {selectedTracking ? (
            <Card 
              className="apple-card rounded-2xl"
              styles={{ body: { padding: '20px' } }}
              title={
                <div className="flex justify-between items-center flex-wrap gap-2 py-1">
                  <div className="flex items-center gap-2">
                    {/* Back to list button on mobile */}
                    <Button
                      icon={<ArrowLeftOutlined />}
                      size="small"
                      onClick={() => setMobileDetailView(false)}
                      className="lg:hidden rounded-lg"
                    >
                      К списку
                    </Button>
                    <div>
                      <span className="text-sm sm:text-base mr-2 font-bold font-mono text-blue-500">
                        {selectedTracking.tracking_number}
                      </span>
                      <Tag color={statusBadgeColors[selectedTracking.status]} className="text-[10px] rounded-full font-medium px-2">
                        {statusTitles[selectedTracking.status]}
                      </Tag>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Official CDEK Live Tracking Link */}
                    <a
                      href={`https://www.cdek.ru/ru/tracking?order_id=${encodeURIComponent(selectedTracking.tracking_number)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-semibold inline-flex items-center gap-1 transition"
                      title="Проверить статус на официальном сайте СДЭК"
                    >
                      <EnvironmentOutlined /> СДЭК Онлайн
                    </a>

                    {/* Quick status selector */}
                    <Select
                      size="small"
                      value={selectedTracking.status}
                      onChange={(newStatus) => {
                        const updated = dataStore.updateTrackingStatus(selectedTracking.id, newStatus as TrackingItem['status']);
                        if (updated) {
                          setSelectedTracking(updated);
                          loadList();
                          message.success(`Статус обновлен: ${statusTitles[newStatus as TrackingItem['status']]}`);
                        }
                      }}
                      className="w-36 text-xs"
                    >
                      {Object.entries(statusTitles).map(([stKey, stTitle]) => (
                        <Option key={stKey} value={stKey}>
                          <Tag color={statusBadgeColors[stKey as TrackingItem['status']]} className="mr-0 text-[10px]">
                            {stTitle}
                          </Tag>
                        </Option>
                      ))}
                    </Select>

                    <Button 
                      icon={<SyncOutlined />} 
                      onClick={() => handleRefresh(selectedTracking.id)}
                      className="text-xs rounded-full font-medium"
                      size="small"
                    >
                      Шаг статуса
                    </Button>
                  </div>
                </div>
              }
            >
              <div className="mb-6 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 block">Получатель</Text>
                    <Text className="font-semibold text-slate-900 dark:text-slate-100">{selectedTracking.recipient_name}</Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 block">Пункт назначения</Text>
                    <Text className="font-semibold text-slate-900 dark:text-slate-100">{selectedTracking.destination_city}</Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 block">Содержимое отправления</Text>
                    <Text className="font-semibold text-blue-600 dark:text-cyan-300">{selectedTracking.label || 'Каменная полка'}</Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 block">Расчетная дата доставки</Text>
                    <Text className="font-semibold text-slate-900 dark:text-slate-100">{selectedTracking.estimated_date || 'В пути'}</Text>
                  </Col>
                </Row>
              </div>

              <Title level={5} className="!text-slate-900 dark:!text-slate-100 mb-4">История перемещения груза</Title>
              
              <Timeline
                mode="left"
                items={selectedTracking.history.map((hist, idx) => ({
                  color: idx === 0 ? 'green' : 'blue',
                  dot: idx === 0 ? <CheckCircleOutlined className="text-sm" /> : <ClockCircleOutlined />,
                  children: (
                    <div className="pb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{hist.status}</span>
                        <Tag className="text-[10px]">{hist.city}</Tag>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{hist.description}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{hist.date}</div>
                    </div>
                  )
                }))}
              />
            </Card>
          ) : (
            <Card className="apple-card border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-center py-12 rounded-2xl">
              <CarOutlined className="text-5xl text-slate-400 dark:text-slate-600 mb-3" />
              <div className="text-slate-600 dark:text-slate-400 font-medium">Выберите отправление из списка слева или введите трек-номер в поиске</div>
            </Card>
          )}
        </Col>
      </Row>

      {/* Modal Add Tracking */}
      <Modal
        title="Добавление трек-номера СДЭК"
        open={isModalOpen}
        onOk={handleCreateTracking}
        onCancel={() => setIsModalOpen(false)}
        okText="Добавить отправление"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item 
            name="tracking_number" 
            label="Трек-номер накладной СДЭК"
            rules={[{ required: true, message: 'Укажите номер накладной' }]}
          >
            <Input placeholder="Например: 1489201999" />
          </Form.Item>

          <Form.Item name="order_number" label="Связанный заказ Polki CRM">
            <Input placeholder="ORD-20260909-001" />
          </Form.Item>

          <Form.Item 
            name="recipient_name" 
            label="ФИО Получателя"
            rules={[{ required: true, message: 'Укажите получателя' }]}
          >
            <Input placeholder="Иванов Иван Иванович" />
          </Form.Item>

          <Form.Item 
            name="destination_city" 
            label="Город и ПВЗ назначения"
            rules={[{ required: true, message: 'Укажите город/адрес ПВЗ' }]}
          >
            <Input placeholder="г. Екатеринбург, ПВЗ ул. Мира 15" />
          </Form.Item>

          <Form.Item name="label" label="Наименование груза">
            <Input placeholder="Полка мраморная Калакатта 80х20 см" />
          </Form.Item>

          <Form.Item name="status" label="Начальный статус">
            <Select defaultValue="created">
              <Option value="created">Создана накладная</Option>
              <Option value="sent">Принят на склад</Option>
              <Option value="in_transit">В пути</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* CDEK API v2 Testing and Diagnostics Modal */}
      <CdekApiTestModal 
        visible={isApiTestOpen} 
        onClose={() => setIsApiTestOpen(false)} 
      />
    </div>
  );
};

export default Tracking;
