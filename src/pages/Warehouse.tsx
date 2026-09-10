import React, { useState, useEffect, useMemo } from 'react';
import { 
  Button, 
  Tag, 
  Typography, 
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
  Tooltip, 
  Radio 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  CalculatorOutlined 
} from '@ant-design/icons';
import type { StoneSlab, MaterialCategory } from '../types';
import { dataStore, subscribeDataStore } from '../api/dataStore';
import { StoneCalculatorModal } from '../components/StoneCalculatorModal';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const CATEGORY_CONFIG: Record<MaterialCategory, { label: string; color: string }> = {
  marble: { label: 'Мрамор', color: '#0284c7' },
  granite: { label: 'Гранит', color: '#475569' },
  onyx: { label: 'Оникс', color: '#d97706' },
  quartz: { label: 'Кварцит', color: '#7c3aed' },
  acrylic: { label: 'Акрил', color: '#059669' },
  travertine: { label: 'Травертин', color: '#ea580c' },
};

export const Warehouse: React.FC = () => {
  const [slabs, setSlabs] = useState<StoneSlab[]>([]);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'slabs' | 'offcuts'>('all');
  
  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSlab, setEditingSlab] = useState<StoneSlab | null>(null);
  const [form] = Form.useForm();

  // Calculator modal
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  const { isDark } = useTheme();

  const loadSlabs = () => {
    try {
      setSlabs(dataStore.getSlabs());
    } catch (e) {
      console.error(e);
      message.error('Ошибка загрузки данных склада');
    }
  };

  useEffect(() => {
    loadSlabs();
    const unsub = subscribeDataStore(() => loadSlabs());
    return () => unsub();
  }, []);

  const filteredSlabs = useMemo(() => {
    return slabs.filter(s => {
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
      if (typeFilter === 'slabs' && s.is_offcut) return false;
      if (typeFilter === 'offcuts' && !s.is_offcut) return false;
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchLoc = s.location?.toLowerCase().includes(q);
        const matchDim = s.dimensions.toLowerCase().includes(q);
        const matchOrder = s.reserved_for_order?.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchDim && !matchOrder) return false;
      }
      return true;
    });
  }, [slabs, categoryFilter, typeFilter, searchText]);

  // Statistics
  const stats = useMemo(() => {
    let totalArea = 0;
    let totalValue = 0;
    let slabsCount = 0;
    let offcutsCount = 0;

    slabs.forEach(s => {
      const area = s.area_m2 * s.quantity;
      totalArea += area;
      totalValue += area * s.price_per_m2;
      if (s.is_offcut) {
        offcutsCount += s.quantity;
      } else {
        slabsCount += s.quantity;
      }
    });

    return {
      totalArea: Number(totalArea.toFixed(2)),
      totalValue: Math.round(totalValue),
      slabsCount,
      offcutsCount,
    };
  }, [slabs]);

  const handleOpenModal = (slab?: StoneSlab) => {
    if (slab) {
      setEditingSlab(slab);
      form.setFieldsValue({
        ...slab,
      });
    } else {
      setEditingSlab(null);
      form.resetFields();
      form.setFieldsValue({
        category: 'marble',
        length_mm: 1200,
        width_mm: 600,
        thickness_mm: 20,
        quantity: 1,
        price_per_m2: 15000,
        status: 'in_stock',
        is_offcut: false,
        location: 'Стеллаж цеха',
      });
    }
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const length_mm = Number(values.length_mm) || 1000;
      const width_mm = Number(values.width_mm) || 500;
      const thickness_mm = Number(values.thickness_mm) || 20;
      const area_m2 = Number(((length_mm * width_mm) / 1000000).toFixed(2));
      const dimensions = `${length_mm}х${width_mm}х${thickness_mm} мм`;

      dataStore.saveSlab({
        ...(editingSlab ? { id: editingSlab.id } : {}),
        ...values,
        length_mm,
        width_mm,
        thickness_mm,
        area_m2,
        dimensions,
      });

      message.success(editingSlab ? 'Материал обновлен' : 'Материал добавлен на склад');
      setIsModalVisible(false);
      loadSlabs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (id: string) => {
    dataStore.deleteSlab(id);
    message.success('Запись удалена со склада');
    loadSlabs();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }} className="text-slate-900 dark:text-white font-bold tracking-tight">
            Склад камня и слэбов
          </Title>
          <Text className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Учет натурального и акрилового камня, контроль целых слэбов и деловых обрезков (остатков)
          </Text>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            icon={<CalculatorOutlined />}
            onClick={() => setIsCalcOpen(true)}
            className="rounded-xl font-medium"
          >
            Калькулятор камня
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-500 rounded-xl font-medium shadow-sm"
          >
            Добавить материал
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Общий остаток камня
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalArea} <span className="text-sm font-semibold text-slate-500">м²</span>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6}>
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Целые слэбы
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
              {stats.slabsCount} <span className="text-sm font-semibold text-slate-500">шт.</span>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6}>
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Деловой обрез (остатки)
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.offcutsCount} <span className="text-sm font-semibold text-slate-500">шт.</span>
            </div>
          </div>
        </Col>

        <Col xs={12} sm={6}>
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Оценочная стоимость склада
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
              {stats.totalValue.toLocaleString('ru-RU')} <span className="text-sm font-semibold text-slate-500">₽</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters bar */}
      <div className={`p-4 rounded-2xl border ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Input
              placeholder="Поиск материала, стеллажа или заказа..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              className="w-full sm:w-64 rounded-xl"
            />

            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              className="w-36 sm:w-44 rounded-xl"
              popupMatchSelectWidth={false}
            >
              <Option value="all">Все породы</Option>
              {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => (
                <Option key={key} value={key}>{conf.label}</Option>
              ))}
            </Select>

            <Radio.Group 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)}
              buttonStyle="solid"
              className="rounded-xl"
            >
              <Radio.Button value="all">Все</Radio.Button>
              <Radio.Button value="slabs">Слэбы</Radio.Button>
              <Radio.Button value="offcuts">Обрезки</Radio.Button>
            </Radio.Group>
          </div>

          <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Найдено позиций: <span className="font-bold text-slate-800 dark:text-slate-200">{filteredSlabs.length}</span>
          </Text>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSlabs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            Ничего не найдено по заданным фильтрам
          </div>
        ) : (
          filteredSlabs.map(slab => {
            const cat = CATEGORY_CONFIG[slab.category] || { label: 'Камень', color: '#64748b' };
            const itemTotal = Math.round(slab.area_m2 * slab.price_per_m2 * slab.quantity);

            return (
              <div 
                key={slab.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between group hover:shadow-md ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200' 
                    : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-800 shadow-sm'
                }`}
              >
                <div>
                  {/* Category & Status badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Tag 
                      className="text-xs font-semibold m-0 px-2.5 py-0.5 rounded-full border-0"
                      style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
                    >
                      {cat.label} {slab.origin ? `· ${slab.origin}` : ''}
                    </Tag>

                    {slab.status === 'reserved' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        Бронь: {slab.reserved_for_order || 'Заказ'}
                      </span>
                    ) : slab.is_offcut ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        Деловой обрез
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        Целый слэб
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h4 className="font-bold text-base text-slate-900 dark:text-white tracking-tight mb-1">
                    {slab.name}
                  </h4>

                  {/* Dimensions Box */}
                  <div className={`p-3 rounded-xl border mb-3 text-xs space-y-1.5 ${
                    isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200/70 text-slate-700'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Габариты:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{slab.dimensions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Площадь единицы:</span>
                      <span className="font-semibold">{slab.area_m2} м²</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Количество в наличии:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{slab.quantity} шт.</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">Место хранения:</span>
                      <span className="font-medium truncate">{slab.location || 'Склад'}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {slab.notes && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic mb-3 line-clamp-2">
                      «{slab.notes}»
                    </div>
                  )}
                </div>

                {/* Footer price & actions */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">
                      Стоимость (м² / всего)
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {slab.price_per_m2.toLocaleString('ru-RU')} ₽ <span className="text-xs font-normal text-slate-400">({itemTotal.toLocaleString('ru-RU')} ₽)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Tooltip title="Редактировать">
                      <Button
                        size="small"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenModal(slab)}
                        className="text-slate-500 hover:text-blue-500"
                      />
                    </Tooltip>
                    <Popconfirm
                      title="Удалить со склада?"
                      description="Данная позиция будет безвозвратно удалена."
                      onConfirm={() => handleDelete(slab.id)}
                      okText="Удалить"
                      cancelText="Отмена"
                    >
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        title={editingSlab ? 'Редактирование материала на складе' : 'Добавить материал / слэб на склад'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        okText={editingSlab ? 'Сохранить изменения' : 'Добавить на склад'}
        cancelText="Отмена"
        width={600}
        centered
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Название камня / слэба"
                rules={[{ required: true, message: 'Укажите название' }]}
              >
                <Input placeholder="Например: Мрамор Calacatta Extra" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="category" label="Порода камня" rules={[{ required: true }]}>
                <Select>
                  {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                    <Option key={k} value={k}>{v.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="length_mm" label="Длина (мм)" rules={[{ required: true }]}>
                <InputNumber min={50} max={6000} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="width_mm" label="Ширина (мм)" rules={[{ required: true }]}>
                <InputNumber min={50} max={3000} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="thickness_mm" label="Толщина (мм)" rules={[{ required: true }]}>
                <InputNumber min={5} max={100} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="quantity" label="Количество (шт.)" rules={[{ required: true }]}>
                <InputNumber min={1} max={500} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="price_per_m2" label="Цена за м² (₽)" rules={[{ required: true }]}>
                <InputNumber min={0} step={500} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="is_offcut" label="Тип позиции" valuePropName="checked">
                <Switch checkedChildren="Обрезок" unCheckedChildren="Целый слэб" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="location" label="Место хранения (стеллаж / ячейка)">
                <Input placeholder="Например: Стеллаж А-2 или Полка остатков" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Статус">
                <Select>
                  <Option value="in_stock">В наличии на складе</Option>
                  <Option value="reserved">Забронирован под заказ</Option>
                  <Option value="low_stock">Мало остатка</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="origin" label="Страна происхождения">
                <Input placeholder="Италия, Россия, Турция, Китай..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reserved_for_order" label="Номер заказа (если забронирован)">
                <Input placeholder="Например: П-2026-004" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Заметки / Особенности распила">
            <TextArea rows={2} placeholder="Особенности рисунка, трещиноватость, рекомендации..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Stone Calculator Modal */}
      <StoneCalculatorModal
        visible={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        onApply={(res) => {
          setIsCalcOpen(false);
          message.info(`Расчет: ${res.stoneType} (${res.totalPrice.toLocaleString('ru-RU')} ₽)`);
        }}
      />
    </div>
  );
};

export default Warehouse;
