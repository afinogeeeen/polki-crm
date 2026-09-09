import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Row, 
  Col, 
  InputNumber, 
  Select, 
  Checkbox, 
  Card, 
  Typography, 
  Divider, 
  Button, 
  Tag 
} from 'antd';
import { 
  CalculatorOutlined, 
  CheckOutlined, 
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

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (result: CalculationResult) => void;
}

// Базовые ставки за м2 слэба с первичным распилом (Натуральный камень + Агломераты)
const STONE_PRICING: Record<string, { name: string; category: 'natural' | 'agglomerate'; pricePerM2: number; density: string }> = {
  // Натуральный камень
  marble_white: { name: 'Белый мрамор (Калакатта / Бьянко)', category: 'natural', pricePerM2: 24000, density: '2.7 г/см³' },
  granite_black: { name: 'Черный гранит (Габбро-Диабаз)', category: 'natural', pricePerM2: 18000, density: '3.1 г/см³' },
  onyx_honey: { name: 'Оникс Медовый (полупрозрачный)', category: 'natural', pricePerM2: 38000, density: '2.6 г/см³' },
  travertine_classic: { name: 'Травертин Классик / Ноче', category: 'natural', pricePerM2: 21000, density: '2.4 г/см³' },
  quartzite_patagonia: { name: 'Кварцит Патагония (Премиум)', category: 'natural', pricePerM2: 55000, density: '2.65 г/см³' },
  granite_gray: { name: 'Серый гранит (Покостовский)', category: 'natural', pricePerM2: 15000, density: '2.8 г/см³' },
  // Агломераты и композиты
  quartz_calacatta: { name: 'Кварцевый агломерат (под Калакатта/Мрамор)', category: 'agglomerate', pricePerM2: 26000, density: '2.4 г/см³' },
  quartz_monocolor: { name: 'Кварцевый агломерат (Моноколор Белый/Серый/Черный)', category: 'agglomerate', pricePerM2: 21000, density: '2.4 г/см³' },
  quartz_concrete: { name: 'Кварцевый агломерат (Лофт Бетон / Антрацит)', category: 'agglomerate', pricePerM2: 23000, density: '2.4 г/см³' },
  acrylic_stone: { name: 'Акриловый камень (Grandex / Staron / Corian)', category: 'agglomerate', pricePerM2: 19000, density: '1.75 г/см³' },
};

// Стоимость обработки фаски за погонный метр
const CHAMFER_PRICING: Record<string, { name: string; pricePerMeter: number }> = {
  euro: { name: 'Еврофаска (технологическая 2-3 мм + полировка)', pricePerMeter: 1200 },
  half_bullnose: { name: 'Полувал (скругление верхнего ребра R10-R15)', pricePerMeter: 2200 },
  full_bullnose: { name: 'Полный вал (полукруглый торец)', pricePerMeter: 3200 },
  curly: { name: 'Фигурная дизайнерская кромка (ОГЭ/Каскад)', pricePerMeter: 4500 },
};

export const StoneCalculatorModal: React.FC<Props> = ({ visible, onClose, onApply }) => {
  const [stoneKey, setStoneKey] = useState<string>('marble_white');
  const [lengthMm, setLengthMm] = useState<number>(800);
  const [widthMm, setWidthMm] = useState<number>(200);
  const [thicknessMm, setThicknessMm] = useState<number>(20);
  const [chamferKey, setChamferKey] = useState<string>('euro');

  // Дополнительные опции
  const [withHiddenMounts, setWithHiddenMounts] = useState<boolean>(true); // Скрытые кронштейны
  const [withHydrophobic, setWithHydrophobic] = useState<boolean>(true);   // Влагостойкая пропитка
  const [withLedGroove, setWithLedGroove] = useState<boolean>(false);       // Вырез под LED-ленту
  const [withRoundedCorners, setWithRoundedCorners] = useState<boolean>(true); // Скругление углов R10

  // Расчетные величины
  const [areaM2, setAreaM2] = useState<number>(0);
  const [perimeterMeters, setPerimeterMeters] = useState<number>(0);
  const [weightKg, setWeightKg] = useState<number>(0);
  const [costStone, setCostStone] = useState<number>(0);
  const [costChamfer, setCostChamfer] = useState<number>(0);
  const [costExtras, setCostExtras] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    // 1. Площадь в м2 (с коэффициентом делового запаса на слэб 1.25)
    const rawArea = (lengthMm / 1000) * (widthMm / 1000);
    const calculatedArea = Math.max(rawArea, 0.05); // мин. 0.05 м2
    setAreaM2(Number(rawArea.toFixed(3)));

    // 2. Периметр лицевой обработки: передняя грань + 2 боковые = (Длина + 2 * Ширина) / 1000
    const visiblePerimeter = (lengthMm + 2 * widthMm) / 1000;
    setPerimeterMeters(Number(visiblePerimeter.toFixed(2)));

    // 3. Вес: V (м3) * плотность
    // Акриловый камень ~1750 кг/м3, кварцевый агломерат ~2400 кг/м3, натуральный мрамор/гранит ~2700 кг/м3
    const stoneCat = STONE_PRICING[stoneKey]?.category;
    const density = stoneKey.includes('acrylic') ? 1750 : stoneCat === 'agglomerate' ? 2400 : 2700;
    const volumeM3 = (lengthMm / 1000) * (widthMm / 1000) * (thicknessMm / 1000);
    const weight = Math.round(volumeM3 * density * 10) / 10;
    setWeightKg(weight);

    // 4. Стоимость камня (слэб + распил)
    const stoneRate = STONE_PRICING[stoneKey]?.pricePerM2 || 20000;
    // Учитываем толщину: стандарт 20мм, при 30мм коэффициент 1.35
    const thicknessCoeff = thicknessMm > 25 ? 1.35 : 1.0;
    const stoneCost = Math.round(calculatedArea * 1.25 * stoneRate * thicknessCoeff);
    setCostStone(stoneCost);

    // 5. Стоимость фаски
    const chamferRate = CHAMFER_PRICING[chamferKey]?.pricePerMeter || 1200;
    const chamferCost = Math.round(visiblePerimeter * chamferRate);
    setCostChamfer(chamferCost);

    // 6. Доп. опции
    let extras = 0;
    if (withHiddenMounts) extras += 1800; // Пара усиленных стальных штоков менсолодержателей
    if (withHydrophobic) extras += 1200;  // Гидрофобный нано-состав Akemi/Bellinzoni
    if (withLedGroove) extras += 2500;    // Фрезеровка паза под алюминиевый LED-профиль
    if (withRoundedCorners) extras += 800; // Ручное скругление углов
    setCostExtras(extras);

    // 7. Итоговая розничная цена с округлением до 100 руб
    const total = Math.ceil((stoneCost + chamferCost + extras) / 100) * 100;
    setTotalPrice(total);
  }, [
    stoneKey, 
    lengthMm, 
    widthMm, 
    thicknessMm, 
    chamferKey, 
    withHiddenMounts, 
    withHydrophobic, 
    withLedGroove, 
    withRoundedCorners
  ]);

  const handleApply = () => {
    const stoneInfo = STONE_PRICING[stoneKey]?.name || 'Натуральный камень';
    const chamferInfo = CHAMFER_PRICING[chamferKey]?.name.split('(')[0].trim() || 'Еврофаска';
    
    const extraLabels = [];
    if (withHiddenMounts) extraLabels.push('скрытые менсолодержатели');
    if (withHydrophobic) extraLabels.push('гидрофобная пропитка');
    if (withLedGroove) extraLabels.push('вырез под LED');
    if (withRoundedCorners) extraLabels.push('скругленные углы');

    const desc = `Обработка: ${chamferInfo}. Комплектация: ${extraLabels.join(', ')}. Расчетный вес ~${weightKg} кг.`;

    onApply({
      stoneType: stoneInfo,
      dimensions: `${lengthMm}х${widthMm}х${thicknessMm} мм`,
      totalPrice,
      prepaymentAmount: Math.round(totalPrice * 0.5), // 50% предоплата
      description: desc,
    });
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold">
          <CalculatorOutlined className="text-blue-500 text-lg" />
          <span>Калькулятор полок из камня и агломерата («Каменный Ручей»)</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={760}
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
          Применить расчет к заказу ({totalPrice.toLocaleString('ru-RU')} ₽)
        </Button>
      ]}
      style={{ top: 20 }}
    >
      <div className="space-y-4 text-xs mt-3 max-h-[75vh] overflow-y-auto pr-1">
        <Row gutter={[16, 16]}>
          {/* Left: Input parameters */}
          <Col xs={24} md={14} className="space-y-3">
            <div>
              <Text className="text-slate-700 dark:text-slate-300 font-medium block mb-1">Материал (натуральный камень / кварцевый агломерат):</Text>
              <Select 
                value={stoneKey} 
                onChange={setStoneKey} 
                className="w-full"
              >
                <Select.OptGroup label="Натуральный камень">
                  {Object.entries(STONE_PRICING)
                    .filter(([_, item]) => item.category === 'natural')
                    .map(([key, item]) => (
                      <Option key={key} value={key}>
                        {item.name} — {item.pricePerM2.toLocaleString('ru-RU')} ₽/м²
                      </Option>
                    ))}
                </Select.OptGroup>
                <Select.OptGroup label="Кварцевые агломераты и акрил">
                  {Object.entries(STONE_PRICING)
                    .filter(([_, item]) => item.category === 'agglomerate')
                    .map(([key, item]) => (
                      <Option key={key} value={key}>
                        {item.name} — {item.pricePerM2.toLocaleString('ru-RU')} ₽/м²
                      </Option>
                    ))}
                </Select.OptGroup>
              </Select>
            </div>

            <div>
              <Text className="text-slate-700 dark:text-slate-300 font-medium block mb-1">Габариты изделия (миллиметры):</Text>
              <Row gutter={8}>
                <Col span={8}>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Длина (мм):</div>
                  <InputNumber 
                    min={100} 
                    max={3200} 
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
                    max={1200} 
                    step={10} 
                    value={widthMm} 
                    onChange={v => setWidthMm(Number(v) || 200)}
                    className="w-full font-mono"
                  />
                </Col>
                <Col span={8}>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Толщина камня:</div>
                  <Select 
                    value={thicknessMm} 
                    onChange={v => setThicknessMm(v)}
                    className="w-full"
                  >
                    <Option value={12}>12 мм (тонкий)</Option>
                    <Option value={20}>20 мм (стандарт)</Option>
                    <Option value={30}>30 мм (массив)</Option>
                  </Select>
                </Col>
              </Row>
            </div>

            <div>
              <Text className="text-slate-700 dark:text-slate-300 font-medium block mb-1">Тип обработки лицевой кромки (фаски):</Text>
              <Select 
                value={chamferKey} 
                onChange={setChamferKey} 
                className="w-full"
              >
                {Object.entries(CHAMFER_PRICING).map(([key, item]) => (
                  <Option key={key} value={key}>
                    {item.name} — {item.pricePerMeter} ₽/пог.м
                  </Option>
                ))}
              </Select>
            </div>

            <div className="pt-1">
              <Text className="text-slate-700 dark:text-slate-300 font-medium block mb-1.5">Дополнительные опции и оснащение:</Text>
              <div className="space-y-1.5 bg-slate-100 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <Checkbox 
                  checked={withHiddenMounts} 
                  onChange={e => setWithHiddenMounts(e.target.checked)}
                >
                  <span className="text-xs text-slate-700 dark:text-slate-200">Комплект скрытого крепежа в стену (+1 800 ₽)</span>
                </Checkbox>
                <br />
                <Checkbox 
                  checked={withHydrophobic} 
                  onChange={e => setWithHydrophobic(e.target.checked)}
                >
                  <span className="text-xs text-slate-700 dark:text-slate-200">Влагостойкая гидрофобная пропитка для ванной (+1 200 ₽)</span>
                </Checkbox>
                <br />
                <Checkbox 
                  checked={withRoundedCorners} 
                  onChange={e => setWithRoundedCorners(e.target.checked)}
                >
                  <span className="text-xs text-slate-700 dark:text-slate-200">Безопасное скругление передних углов R10 (+800 ₽)</span>
                </Checkbox>
                <br />
                <Checkbox 
                  checked={withLedGroove} 
                  onChange={e => setWithLedGroove(e.target.checked)}
                >
                  <span className="text-xs text-slate-700 dark:text-slate-200">Фрезеровка паза под LED-ленту подсветки (+2 500 ₽)</span>
                </Checkbox>
              </div>
            </div>
          </Col>

          {/* Right: Calculation summary card */}
          <Col xs={24} md={10}>
            <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-md h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">Спецификация изделия</span>
                  <Tag color="cyan">{thicknessMm} мм</Tag>
                </div>

                <div className="space-y-2 py-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Площадь полки:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-mono font-medium">{areaM2} м²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Периметр фаски:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-mono font-medium">{perimeterMeters} пог. м</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Расчетный вес:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-mono font-medium">~{weightKg} кг</span>
                  </div>

                  <Divider className="!my-2 !border-slate-200 dark:!border-slate-800" />

                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Слэб и распил:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-medium">{costStone.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Полировка фаски:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-medium">{costChamfer.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Опции и крепеж:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-medium">{costExtras.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 -mx-6 -mb-6 p-4 rounded-b-lg">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">Рекомендуемая розничная цена:</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="font-sans font-bold text-xl">₽</span>
                  {totalPrice.toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Аванс 50%: <strong className="text-slate-900 dark:text-slate-200">{Math.round(totalPrice * 0.5).toLocaleString('ru-RU')} ₽</strong>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};
