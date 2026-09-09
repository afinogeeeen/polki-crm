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
  Image
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
  TagOutlined,
  ScissorOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import type { Order, OrderItem, OrderStatus, ContactChannel } from '../types';
import { dataStore, subscribeDataStore } from '../api/dataStore';
import { StoneCalculatorModal } from '../components/StoneCalculatorModal';
import type { CalculationResult } from '../components/StoneCalculatorModal';
import { OrderTechCardModal } from '../components/OrderTechCardModal';
import { OrderStickerModal } from '../components/OrderStickerModal';

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

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
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
  const [stickerOrder, setStickerOrder] = useState<Order | null>(null);

  // Multi-item shelves in current order
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

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

  // Filtered list
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchText.toLowerCase()) ||
      order.client_name.toLowerCase().includes(searchText.toLowerCase()) ||
      (order.stone_type && order.stone_type.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.client_contact && order.client_contact.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.polisher && order.polisher.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.accepted_by && order.accepted_by.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.tracking_number && order.tracking_number.includes(searchText));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || order.channel === channelFilter;
    const matchesPolisher = polisherFilter === 'all' || order.polisher === polisherFilter;

    return matchesSearch && matchesStatus && matchesChannel && matchesPolisher;
  });

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
      title: '№ Заказа',
      dataIndex: 'order_number',
      key: 'order_number',
      width: 140,
      render: (text: string, record: Order) => (
        <div>
          <span className="font-semibold text-blue-400 block">{text}</span>
          <span className="text-[11px] text-slate-400">
            {new Date(record.created_at).toLocaleDateString('ru-RU')}
          </span>
        </div>
      ),
    },
    {
      title: 'Клиент и канал связи',
      dataIndex: 'client_name',
      key: 'client_name',
      width: 200,
      render: (name: string, record: Order) => {
        const ch = record.channel ? CHANNEL_CONFIG[record.channel] : CHANNEL_CONFIG.telegram;
        return (
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
              <span>{name}</span>
              <Tag color={ch.color} className="text-[10px] py-0 px-1.5 m-0 font-normal">
                {ch.icon && <span className="mr-1">{ch.icon}</span>}
                {ch.label}
              </Tag>
            </div>
            {record.client_phone && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{record.client_phone}</div>
            )}
            {record.client_contact && (
              <div className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[180px]" title={record.client_contact}>
                {record.client_contact}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Камень и фото изделия',
      key: 'product',
      width: 230,
      render: (_: unknown, record: Order) => {
        const isLux = isLuxuryStone(record.stone_type);
        return (
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-900 dark:text-slate-200">{record.stone_type || 'Камень не указан'}</span>
              {isLux && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full emerald-vein-badge text-emerald-700 dark:text-emerald-300 font-medium inline-flex items-center gap-0.5">
                  <CrownOutlined className="text-[9px]" /> премиум камень
                </span>
              )}
            </div>
            <div className="text-xs text-blue-600 dark:text-cyan-400 font-mono mt-0.5">{record.dimensions}</div>
            {record.product_description && (
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[210px] mt-0.5" title={record.product_description}>
                {record.product_description}
              </div>
            )}
            {record.photos && record.photos.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <Image.PreviewGroup>
                  {record.photos.map((url, i) => (
                    <Image
                      key={i}
                      src={url}
                      width={38}
                      height={38}
                      className="rounded-lg object-cover border border-slate-300 dark:border-slate-700 cursor-pointer shadow-sm hover:opacity-90"
                      fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='38' height='38'><rect width='38' height='38' fill='%23334155'/></svg>"
                    />
                  ))}
                </Image.PreviewGroup>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Сотрудники',
      key: 'staff',
      width: 190,
      render: (_: unknown, record: Order) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <UserOutlined className="text-blue-500" />
            <span className="text-slate-500 dark:text-slate-400">Принял:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">{record.accepted_by || 'Не указан'}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <ToolOutlined className="text-amber-500" />
            <span className="text-slate-500 dark:text-slate-400">Мастер:</span>
            <span className="font-semibold text-amber-600 dark:text-amber-300 truncate max-w-[120px]">
              {record.polisher || 'Не назначен'}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Расчет и оплата',
      key: 'payment',
      width: 190,
      render: (_: unknown, record: Order) => {
        const remaining = Math.max(0, record.total_price - record.prepayment_amount);
        const percentPaid = record.total_price > 0 
          ? Math.round(((record.prepayment_received ? record.prepayment_amount : 0) + (record.remaining_paid ? remaining : 0)) / record.total_price * 100)
          : 0;

        return (
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Итого:</span>
              <strong className="text-slate-900 dark:text-slate-100 font-mono text-sm">{record.total_price.toLocaleString('ru-RU')} ₽</strong>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Аванс: {record.prepayment_amount.toLocaleString('ru-RU')} ₽</span>
              {record.prepayment_received ? (
                <Tag color="success" className="m-0 text-[9px] py-0 px-1">Оплачен</Tag>
              ) : (
                <Tag color="warning" className="m-0 text-[9px] py-0 px-1">Ждем</Tag>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600 dark:text-slate-400">Остаток: {remaining.toLocaleString('ru-RU')} ₽</span>
              {record.remaining_paid ? (
                <Tag color="success" className="m-0 text-[9px] py-0 px-1">Закрыт</Tag>
              ) : (
                <Tag color="default" className="m-0 text-[9px] py-0 px-1">Доплата</Tag>
              )}
            </div>
            {/* Quick mini-indicator of payment progress */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className={`h-full transition-all duration-300 ${percentPaid === 100 ? 'bg-emerald-400' : 'bg-blue-400'}`} 
                style={{ width: `${percentPaid}%` }} 
              />
            </div>
          </div>
        );
      },
    },
    {
      title: 'Статус и СДЭК',
      key: 'status',
      width: 180,
      render: (_: unknown, record: Order) => (
        <div>
          <Select
            value={record.status}
            size="small"
            style={{ width: '100%' }}
            onChange={(val) => handleQuickStatusChange(record.id, val as OrderStatus)}
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <Option key={key} value={key}>
                <Tag color={statusColors[key as OrderStatus] || 'default'} className="mr-0">
                  {label}
                </Tag>
              </Option>
            ))}
          </Select>
          {record.tracking_number && (
            <div className="mt-1.5 flex items-center gap-1">
              <Tooltip title="Нажмите, чтобы скопировать трек СДЭК">
                <button
                  type="button"
                  onClick={(e) => record.tracking_number && handleCopyTracking(record.tracking_number, e)}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-[11px] text-blue-700 dark:text-cyan-300 font-mono cursor-pointer transition active:scale-95"
                >
                  {copiedTrack === record.tracking_number ? (
                    <>
                      <CheckOutlined className="text-emerald-500 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <CopyOutlined className="text-slate-400" />
                      <span>{record.tracking_number}</span>
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
      title: 'Действия и бланки',
      key: 'action',
      width: 140,
      render: (_: unknown, record: Order) => (
        <Space size="small">
          <Tooltip title="Печать техкарты цеха (A4)">
            <Button 
              type="text" 
              icon={<PrinterOutlined />} 
              onClick={() => {
                setTechCardDefaultView('full');
                setTechCardOrder(record);
              }} 
              className="text-amber-400 hover:text-amber-300 px-1" 
            />
          </Tooltip>
          <Tooltip title="Печать мини-стикеров для резчика (термопринтер на каждое изделие)">
            <Button 
              type="text" 
              icon={<ScissorOutlined />} 
              onClick={() => {
                setTechCardDefaultView('thermal');
                setTechCardOrder(record);
              }} 
              className="text-orange-400 hover:text-orange-300 px-1" 
            />
          </Tooltip>
          <Tooltip title="Печать термоэтикетки со штрихкодом (СДЭК/МП)">
            <Button 
              type="text" 
              icon={<TagOutlined />} 
              onClick={() => setStickerOrder(record)} 
              className="text-yellow-400 hover:text-yellow-300 px-1" 
            />
          </Tooltip>
          <Tooltip title="Редактировать заказ">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleOpenEditModal(record)} 
              className="text-blue-400 hover:text-blue-300 px-1" 
            />
          </Tooltip>
          <Popconfirm
            title="Удалить заказ?"
            description="Это действие необратимо."
            okText="Да, удалить"
            cancelText="Отмена"
            onConfirm={() => handleDeleteOrder(record.id)}
          >
            <Button type="text" icon={<DeleteOutlined />} danger className="px-1" />
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button 
            icon={<CalculatorOutlined />} 
            size="large"
            className="border-emerald-500/80 text-emerald-400 bg-emerald-950/20 hover:!border-emerald-400 hover:!text-emerald-300 font-medium"
            onClick={() => setIsCalcOpen(true)}
          >
            Калькулятор полки
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            className="bg-blue-600 hover:bg-blue-500 font-medium"
            onClick={handleOpenCreateModal}
          >
            Новый заказ
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      <Card className="apple-card rounded-2xl" styles={{ body: { padding: '16px' } }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={8} lg={7}>
            <Input
              placeholder="Поиск по клиенту, камню, мастеру, треку..."
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
          <Col xs={24} sm={8} md={5} lg={6}>
            <Select
              value={polisherFilter}
              onChange={val => setPolisherFilter(val)}
              className="w-full"
            >
              <Option value="all">Все исполнители / мастера</Option>
              {uniquePolishers.map(p => (
                <Option key={p} value={p}>
                  {p} ({orders.filter(o => o.polisher === p).length})
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6} lg={6}>
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

      {/* Table */}
      <Card className="apple-card rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={filteredOrders} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: true, responsive: true }}
          scroll={{ x: 1050 }}
        />
      </Card>

      {/* Modal create/edit order */}
      <Modal
        title={
          <div className="text-base sm:text-lg font-semibold text-slate-100 pr-6">
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
                <Input placeholder="Имя исполнителя / полировщика" allowClear />
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
      <OrderStickerModal
        order={stickerOrder}
        visible={!!stickerOrder}
        onClose={() => setStickerOrder(null)}
      />
    </div>
  );
};

export default Orders;
