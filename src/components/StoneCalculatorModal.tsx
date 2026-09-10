import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Row, 
  Col, 
  Input,
  InputNumber, 
  Select, 
  Card, 
  Typography, 
  Divider, 
  Button, 
  Tag,
  Space
} from 'antd';
import { 
  CalculatorOutlined, 
  CheckOutlined, 
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

export interface CalculationResult {
  stoneType: string;
  dimensions: string;
  totalPrice: number;
  prepaymentAmount: number;
  description: string;
}

export interface CustomOption {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (result: CalculationResult) => void;
}

export const StoneCalculatorModal: React.FC<Props> = ({ visible, onClose, onApply }) => {
  // 1. Материал: свободный ввод
  const [materialName, setMaterialName] = useState<string>('Белый мрамор (Калакатта)');
  const [pricePerM2, setPricePerM2] = useState<number>(24000);

  // 2. Размеры изделия
  const [lengthMm, setLengthMm] = useState<number>(800);
  const [widthMm, setWidthMm] = useState<number>(200);
  const [thicknessMm, setThicknessMm] = useState<number>(20);

  // 3. Динамические пользовательские дополнительные опции
  const [customOptions, setCustomOptions] = useState<CustomOption[]>([
    { id: '1', name: 'Скрытые менсолодержатели (комплект)', price: 1800, enabled: true },
    { id: '2', name: 'Влагостойкая гидрофобная пропитка', price: 1200, enabled: true },
    { id: '3', name: 'Скругление углов R10', price: 800, enabled: false },
  ]);

  // Поля для добавления новой опции
  const [newOptionName, setNewOptionName] = useState<string>('');
  const [newOptionPrice, setNewOptionPrice] = useState<number | null>(null);

  // Расчетные величины
  const [areaM2, setAreaM2] = useState<number>(0);
  const [weightKg, setWeightKg] = useState<number>(0);
  const [costStone, setCostStone] = useState<number>(0);
  const [costExtras, setCostExtras] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    // 1. Площадь в м2 (с коэффициентом делового запаса на распил слэба 1.25)
    const rawArea = (lengthMm / 1000) * (widthMm / 1000);
    const calculatedArea = Math.max(rawArea, 0.01);
    setAreaM2(Number(rawArea.toFixed(3)));

    // 2. Расчетный вес: V (м3) * плотность камня (~2700 кг/м3)
    const volumeM3 = (lengthMm / 1000) * (widthMm / 1000) * (thicknessMm / 1000);
    const weight = Math.round(volumeM3 * 2700 * 10) / 10;
    setWeightKg(weight);

    // 3. Стоимость камня (площадь * цена м2 * коэф толщины)
    const thicknessCoeff = thicknessMm > 25 ? 1.35 : 1.0;
    const stoneCost = Math.round(calculatedArea * 1.25 * (pricePerM2 || 0) * thicknessCoeff);
    setCostStone(stoneCost);

    // 4. Сумма активных дополнительных опций
    const extrasTotal = customOptions
      .filter(opt => opt.enabled)
      .reduce((sum, opt) => sum + (Number(opt.price) || 0), 0);
    setCostExtras(extrasTotal);

    // 5. Итоговая цена с округлением до 100 руб
    const total = Math.ceil((stoneCost + extrasTotal) / 100) * 100;
    setTotalPrice(total);
  }, [
    lengthMm, 
    widthMm, 
    thicknessMm, 
    pricePerM2,
    customOptions
  ]);

  const handleAddCustomOption = () => {
    if (!newOptionName.trim()) return;
    const newOpt: CustomOption = {
      id: Date.now().toString(),
      name: newOptionName.trim(),
      price: newOptionPrice || 0,
      enabled: true
    };
    setCustomOptions([...customOptions, newOpt]);
    setNewOptionName('');
    setNewOptionPrice(null);
  };

  const handleRemoveOption = (id: string) => {
    setCustomOptions(customOptions.filter(o => o.id !== id));
  };

  const handleToggleOption = (id: string, checked: boolean) => {
    setCustomOptions(customOptions.map(o => o.id === id ? { ...o, enabled: checked } : o));
  };

  const handleUpdateOptionPrice = (id: string, newPrice: number | null) => {
    setCustomOptions(customOptions.map(o => o.id === id ? { ...o, price: newPrice || 0 } : o));
  };

  const handleApply = () => {
    const activeOptions = customOptions.filter(o => o.enabled);
    const activeLabels = activeOptions.map(o => `${o.name} (${o.price.toLocaleString('ru-RU')} ₽)`);

    const descParts = [];
    if (activeLabels.length > 0) {
      descParts.push(`Опции: ${activeLabels.join(', ')}`);
    }
    descParts.push(`Вес ~${weightKg} кг`);

    onApply({
      stoneType: materialName.trim() || 'Индивидуальный материал',
      dimensions: `${lengthMm}х${widthMm}х${thicknessMm} мм`,
      totalPrice,
      prepaymentAmount: Math.round(totalPrice * 0.5), // 50% предоплата
      description: descParts.join('. '),
    });
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold">
          <CalculatorOutlined className="text-blue-500 text-lg" />
          <span>Калькулятор стоимости изделия</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={780}
      footer={[
        <Button key="close" onClick={onClose}>
          Отмена
        </Button>,
        <Button 
          key="apply" 
          type="primary" 
          icon={<CheckOutlined />} 
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-500"
        >
          Применить расчет ({totalPrice.toLocaleString('ru-RU')} ₽)
        </Button>
      ]}
      style={{ top: 20 }}
    >
      <div className="space-y-4 text-xs mt-3 max-h-[75vh] overflow-y-auto pr-1">
        <Row gutter={[16, 16]}>
          {/* Left: Input parameters */}
          <Col xs={24} md={14} className="space-y-3">
            {/* 1. Свободный ввод материала */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <Text className="text-slate-800 dark:text-slate-200 font-bold block">
                Материал изделия (свободный ввод):
              </Text>
              <Row gutter={8}>
                <Col span={15}>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Название камня / материала:</div>
                  <Input 
                    value={materialName} 
                    onChange={e => setMaterialName(e.target.value)}
                    placeholder="Например: Гранит Блэк Гэлакси, Кварцит, Мрамор..."
                    className="w-full"
                  />
                </Col>
                <Col span={9}>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Цена за м² (₽):</div>
                  <InputNumber 
                    min={0}
                    step={500}
                    value={pricePerM2} 
                    onChange={v => setPricePerM2(Number(v) || 0)}
                    className="w-full font-mono"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  />
                </Col>
              </Row>
            </div>

            {/* 2. Габариты изделия */}
            <div>
              <Text className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Габариты изделия (миллиметры):</Text>
              <Row gutter={8}>
                <Col span={8}>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Длина (мм):</div>
                  <InputNumber 
                    min={50} 
                    max={5000} 
                    step={10} 
                    value={lengthMm} 
                    onChange={v => setLengthMm(Number(v) || 800)}
                    className="w-full font-mono"
                  />
                </Col>
                <Col span={8}>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Ширина / глубина:</div>
                  <InputNumber 
                    min={50} 
                    max={3000} 
                    step={10} 
                    value={widthMm} 
                    onChange={v => setWidthMm(Number(v) || 200)}
                    className="w-full font-mono"
                  />
                </Col>
                <Col span={8}>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Толщина (мм):</div>
                  <Select 
                    value={thicknessMm} 
                    onChange={v => setThicknessMm(v)}
                    className="w-full"
                  >
                    <Option value={12}>12 мм</Option>
                    <Option value={20}>20 мм (стандарт)</Option>
                    <Option value={30}>30 мм</Option>
                    <Option value={40}>40 мм</Option>
                  </Select>
                </Col>
              </Row>
            </div>

            {/* 3. Дополнительные опции (кастомное добавление) */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <Text className="text-slate-800 dark:text-slate-200 font-semibold block">
                  Дополнительные опции:
                </Text>
                <span className="text-[11px] text-slate-500">
                  Выбрано на: {costExtras.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              {/* Список добавленных опций */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto">
                {customOptions.length === 0 ? (
                  <div className="text-center py-2 text-slate-400 text-xs">
                    Нет добавленных опций. Добавьте нужные опции ниже.
                  </div>
                ) : (
                  customOptions.map((opt) => (
                    <div 
                      key={opt.id} 
                      className={`flex items-center justify-between gap-2 p-1.5 rounded border transition-colors ${
                        opt.enabled 
                          ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700' 
                          : 'bg-slate-100/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <label className="flex items-center gap-2 flex-1 cursor-pointer select-none text-xs m-0">
                        <input 
                          type="checkbox" 
                          checked={opt.enabled} 
                          onChange={e => handleToggleOption(opt.id, e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 cursor-pointer"
                        />
                        <span className={`font-medium ${opt.enabled ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}>
                          {opt.name}
                        </span>
                      </label>

                      <div className="flex items-center gap-1.5">
                        <InputNumber 
                          size="small"
                          min={0}
                          step={100}
                          value={opt.price}
                          onChange={val => handleUpdateOptionPrice(opt.id, val)}
                          className="w-24 font-mono text-xs"
                          formatter={value => `${value} ₽`}
                        />
                        <Button 
                          type="text" 
                          danger 
                          size="small"
                          icon={<DeleteOutlined />} 
                          onClick={() => handleRemoveOption(opt.id)}
                          title="Удалить опцию"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Форма добавления новой кастомной опции */}
              <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                  + Добавить новую опцию:
                </div>
                <Space.Compact style={{ width: '100%' }}>
                  <Input 
                    placeholder="Название опции (например: вырез под розетку, фаска ОГЭ...)"
                    value={newOptionName}
                    onChange={e => setNewOptionName(e.target.value)}
                    onPressEnter={handleAddCustomOption}
                    className="text-xs"
                  />
                  <InputNumber 
                    placeholder="Цена, ₽"
                    min={0}
                    step={100}
                    value={newOptionPrice}
                    onChange={setNewOptionPrice}
                    onPressEnter={handleAddCustomOption}
                    style={{ width: '130px' }}
                    className="font-mono text-xs"
                  />
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleAddCustomOption}
                    disabled={!newOptionName.trim()}
                    className="bg-blue-600 hover:bg-blue-500 text-xs"
                  >
                    Добавить
                  </Button>
                </Space.Compact>
              </div>
            </div>
          </Col>

          {/* Right: Calculation summary card */}
          <Col xs={24} md={10}>
            <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">Спецификация</span>
                  <Tag color="blue">{thicknessMm} мм</Tag>
                </div>

                <div className="space-y-2 py-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Материал:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-semibold truncate block">
                      {materialName || 'Не указан'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Габариты:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-mono font-medium">{lengthMm} × {widthMm} мм</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Площадь изделия:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-mono font-medium">{areaM2} м²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Расчетный вес:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-mono font-medium">~{weightKg} кг</span>
                  </div>

                  <Divider className="!my-2 !border-slate-200 dark:!border-slate-800" />

                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Материал и распил:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-medium">{costStone.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Выбранные опции:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-medium">{costExtras.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 -mx-6 -mb-6 p-4 rounded-b-lg">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">Итоговая расчетная стоимость:</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  {totalPrice.toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Предоплата 50%: <strong className="text-slate-900 dark:text-slate-200">{Math.round(totalPrice * 0.5).toLocaleString('ru-RU')} ₽</strong>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

