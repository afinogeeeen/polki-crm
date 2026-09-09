import React, { useState } from 'react';
import { Modal, Button, Row, Col, Radio, Tag, Tooltip } from 'antd';
import { 
  PrinterOutlined, 
  FileTextOutlined, 
  BarcodeOutlined, 
  TagOutlined,
  ScissorOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import type { Order } from '../types';

interface Props {
  order: Order | null;
  visible: boolean;
  onClose: () => void;
  defaultView?: 'full' | 'thermal';
}

interface ThermalItem {
  id: string;
  itemNumber: number;
  totalItems: number;
  stoneType: string;
  dimensions: string;
  quantity: number;
  description: string;
  polisher: string;
  orderNumber: string;
  notes?: string;
  clientName?: string;
}

export const OrderTechCardModal: React.FC<Props> = ({ 
  order, 
  visible, 
  onClose,
  defaultView = 'full'
}) => {
  const [viewMode, setViewMode] = useState<'full' | 'thermal'>(defaultView);
  const [labelSize, setLabelSize] = useState<'80x50' | '58x40' | '100x60'>('80x50');

  // Reset or adjust view mode when opening
  React.useEffect(() => {
    if (visible && defaultView) {
      setViewMode(defaultView);
    }
  }, [visible, defaultView]);

  if (!order) return null;

  const handlePrintFull = () => {
    document.body.classList.add('print-tech-card');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-tech-card');
    }, 500);
  };

  const handlePrintThermal = () => {
    document.body.classList.add('print-thermal-labels');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-thermal-labels');
    }, 500);
  };

  const hasMultipleItems = order.items && order.items.length > 0;

  // Flatten items so each unit gets its own mini thermal sticker (e.g. if quantity = 2, produce 2 labels)
  const thermalLabels: ThermalItem[] = [];
  if (hasMultipleItems) {
    let currentGlobalIndex = 1;
    const totalPhysicalPieces = order.items!.reduce((sum, item) => sum + (item.quantity || 1), 0);

    order.items!.forEach((item) => {
      const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
      for (let piece = 1; piece <= qty; piece++) {
        thermalLabels.push({
          id: `${item.id || 'item'}-${piece}`,
          itemNumber: currentGlobalIndex++,
          totalItems: totalPhysicalPieces,
          stoneType: item.stone_type,
          dimensions: item.dimensions,
          quantity: 1,
          description: item.description || 'Еврофаска полированная, скрытый крепеж',
          polisher: order.polisher || '',
          orderNumber: order.order_number,
          notes: order.notes,
          clientName: order.client_name,
        });
      }
    });
  } else {
    thermalLabels.push({
      id: 'single-item-1',
      itemNumber: 1,
      totalItems: 1,
      stoneType: order.stone_type,
      dimensions: order.dimensions,
      quantity: 1,
      description: order.product_description || 'Еврофаска полированная, скрытый крепеж',
      polisher: order.polisher || '',
      orderNumber: order.order_number,
      notes: order.notes,
      clientName: order.client_name,
    });
  }

  // Dimension specs for label preview with enlarged text
  const sizeStyles = {
    '58x40': {
      width: '250px',
      minHeight: '170px',
      fontSize: 'text-[10px]',
      titleSize: 'text-sm',
      dimSize: 'text-xs',
      taskSize: 'text-[10.5px]',
    },
    '80x50': {
      width: '330px',
      minHeight: '210px',
      fontSize: 'text-xs',
      titleSize: 'text-base',
      dimSize: 'text-sm',
      taskSize: 'text-xs',
    },
    '100x60': {
      width: '390px',
      minHeight: '240px',
      fontSize: 'text-sm',
      titleSize: 'text-lg',
      dimSize: 'text-base',
      taskSize: 'text-sm',
    },
  }[labelSize];

  return (
    <Modal
      title={
        <div className="flex flex-wrap items-center justify-between gap-3 pr-8 text-slate-900 dark:text-slate-100">
          <div className="flex items-center gap-2">
            {viewMode === 'full' ? (
              <FileTextOutlined className="text-blue-500 text-lg" />
            ) : (
              <BarcodeOutlined className="text-amber-500 text-lg" />
            )}
            <span className="font-bold">
              {viewMode === 'full' 
                ? `Паспорт изделия и техкарта к отправке — ${order.order_number}`
                : `Мини-стикеры на заготовки — ${order.order_number}`}
            </span>
          </div>

          {/* Switch mode tabs */}
          <Radio.Group 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            size="small"
            buttonStyle="solid"
            className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <Radio.Button value="full" className="text-xs">
              <FileTextOutlined className="mr-1" />
              Паспорт / Техкарта (A4)
            </Radio.Button>
            <Radio.Button value="thermal" className="text-xs">
              <TagOutlined className="mr-1" />
              Мини-стикеры ({thermalLabels.length} шт.)
            </Radio.Button>
          </Radio.Group>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={viewMode === 'full' ? 820 : 760}
      footer={[
        <Button key="close" onClick={onClose}>
          Закрыть
        </Button>,
        viewMode === 'full' ? (
          <Button 
            key="print-full" 
            type="primary" 
            icon={<PrinterOutlined />} 
            onClick={handlePrintFull}
            className="bg-blue-600 hover:bg-blue-500 font-semibold"
          >
            Печать паспорта изделия (A4)
          </Button>
        ) : (
          <Button 
            key="print-thermal" 
            type="primary" 
            icon={<PrinterOutlined />} 
            onClick={handlePrintThermal}
            className="bg-amber-600 hover:bg-amber-500 font-semibold text-white"
          >
            Печать наклеек на изделия (Термопринтер)
          </Button>
        )
      ]}
      style={{ top: 20 }}
    >
      {/* ===================== VIEW 1: FULL A4 TECH CARD / PASSPORT ===================== */}
      {viewMode === 'full' && (
        <div>
          {/* Action notice banner */}
          <div className="mb-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <ScissorOutlined className="text-amber-500 text-base" />
              <span>
                Этот документ вкладывается в посылку клиенту и подтверждает премиальный статус производства.
              </span>
            </div>
            <Button 
              size="small" 
              type="dashed"
              onClick={() => setViewMode('thermal')}
              className="text-amber-600 dark:text-amber-400 border-amber-500/60 hover:text-amber-500 font-medium"
            >
              Стикеры для распила →
            </Button>
          </div>

          <div id="printable-tech-card" className="bg-white text-slate-900 p-8 rounded-lg font-sans text-xs border border-slate-300 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-5">
              <div>
                <div className="text-xl font-black tracking-widest uppercase text-slate-950 font-serif">
                  «КАМЕННЫЙ РУЧЕЙ»
                </div>
                <div className="text-xs font-semibold text-slate-700 tracking-wider uppercase mt-0.5">
                  МАСТЕРСКАЯ ИЗДЕЛИЙ ИЗ НАТУРАЛЬНОГО КАМНЯ
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">
                  ПАСПОРТ ИЗДЕЛИЯ И ТЕХНОЛОГИЧЕСКАЯ КАРТА ЗАКАЗА
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black font-mono text-slate-900">№ {order.order_number}</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Дата изготовления: {new Date(order.created_at).toLocaleDateString('ru-RU')}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  polkistone.ru
                </div>
              </div>
            </div>

            {/* Order & Client Info */}
            <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-5">
              <Row gutter={[24, 10]}>
                <Col span={12}>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Заказчик:</span>
                  <span className="text-sm font-bold text-slate-900">{order.client_name || 'Частный заказчик'}</span>
                </Col>
                <Col span={12}>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Ответственный менеджер / Отправка:</span>
                  <div className="text-sm font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <span>ФИО:</span>
                    <span className="border-b-2 border-dashed border-slate-400 w-44 inline-block">&nbsp;</span>
                  </div>
                </Col>
                <Col span={24}>
                  <div className="border-t border-slate-200 pt-2 mt-1 flex justify-between items-center text-xs">
                    <span className="text-slate-600">Количество предметов в комплекте:</span>
                    <span className="font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
                      {hasMultipleItems ? order.items!.reduce((s, i) => s + (i.quantity || 1), 0) : 1} шт.
                    </span>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Multi-item Shelves Table (No hardcoded stone names, focused on dimensions, processing, mounting) */}
            <div className="mb-6">
              <div className="font-bold text-xs uppercase border-b-2 border-slate-900 pb-1.5 mb-3 text-slate-900 flex items-center justify-between tracking-wide">
                <span>Спецификация каменных изделий заказа</span>
                <span className="text-[11px] font-normal text-slate-500">
                  Гарантия точной геометрии и ручной полировки
                </span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-400 bg-slate-100 text-[11px] text-slate-900">
                    <th className="p-2 font-bold w-12 text-center">№ поз.</th>
                    <th className="p-2 font-bold">Габариты изделия (Д × Ш × Т мм)</th>
                    <th className="p-2 font-bold w-20 text-center">Кол-во</th>
                    <th className="p-2 font-bold">Техническая обработка кромки, фаска, крепеж</th>
                  </tr>
                </thead>
                <tbody>
                  {hasMultipleItems ? (
                    order.items!.map((item, idx) => (
                      <tr key={item.id || idx} className="border-b border-slate-200 text-xs">
                        <td className="p-2.5 font-bold text-slate-600 text-center">{idx + 1}</td>
                        <td className="p-2.5 font-mono font-black text-slate-950 text-sm">{item.dimensions}</td>
                        <td className="p-2.5 text-center font-bold text-slate-900">{item.quantity} шт.</td>
                        <td className="p-2.5 text-slate-700 font-medium">{item.description || 'Еврофаска полированная, скрытый менсолодержатель'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-slate-200 text-xs">
                      <td className="p-2.5 font-bold text-slate-600 text-center">1</td>
                      <td className="p-2.5 font-mono font-black text-slate-950 text-sm">{order.dimensions}</td>
                      <td className="p-2.5 text-center font-bold text-slate-900">1 шт.</td>
                      <td className="p-2.5 text-slate-700 font-medium">{order.product_description || 'Еврофаска полированная, скрытый менсолодержатель'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Quality & Care Certificate Guarantee */}
            <div className="mb-6 p-4 rounded-lg bg-amber-50/50 border border-amber-200/80 text-slate-800 text-[11px] leading-relaxed">
              <div className="font-bold uppercase tracking-wider text-amber-950 mb-1 flex items-center gap-1.5">
                <span>Памятка по уходу и гарантия качества:</span>
              </div>
              <p className="mb-1">
                Все изделия выполнены из высококачественного камня по согласованному фотоподбору слэба, прошедшего распил на алмазном оборудовании, ручную прецизионную калибровку и многоступенчатую зеркальную полировку алмазным абразивом до 3000 grit. Поверхность обработана защитной водо- и грязеотталкивающей пропиткой глубокого проникновения.
              </p>
              <p className="text-slate-600 italic">
                Для сохранения зеркального блеска протирайте мягкой салфеткой без использования кислотных и абразивных чистящих средств.
              </p>
            </div>

            {/* Signatures Footer - Blank for handwritten signature and name */}
            <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center text-xs text-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Контроль качества и комплектация при отправке:</span>
                <div className="font-bold text-sm flex items-center gap-2">
                  <span>Менеджер / Отправитель:</span>
                  <span className="border-b-2 border-dashed border-slate-600 w-32 inline-block">&nbsp;</span>
                  <span className="text-xs font-normal text-slate-500">(подпись)</span>
                  <span className="border-b-2 border-dashed border-slate-600 w-36 inline-block">&nbsp;</span>
                  <span className="text-xs font-normal text-slate-500">(расшифровка)</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-base uppercase tracking-wider text-slate-950">
                  «КАМЕННЫЙ РУЧЕЙ»
                </div>
                <div className="text-[10px] text-slate-500">
                  Контроль качества пройден. Изделие готово к отправке.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW 2: THERMAL PRINTER MINI-LABELS ===================== */}
      {viewMode === 'thermal' && (
        <div className="space-y-4">
          {/* Controls toolbar */}
          <div className="bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Размер термоэтикетки:</span>
              <Radio.Group 
                value={labelSize} 
                onChange={(e) => setLabelSize(e.target.value)}
                size="small"
                className="bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700"
              >
                <Radio.Button value="58x40">58 × 40 мм (Компакт)</Radio.Button>
                <Radio.Button value="80x50">80 × 50 мм (Стандарт)</Radio.Button>
                <Radio.Button value="100x60">100 × 60 мм (Большой)</Radio.Button>
              </Radio.Group>
            </div>

            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Tag color="cyan" className="m-0 font-semibold">
                Всего наклеек: {thermalLabels.length} шт.
              </Tag>
              <Tooltip title="Каждое физическое изделие получает персональную термо-этикетку с крупным названием камня, размерами и ТЗ">
                <InfoCircleOutlined className="text-slate-400 cursor-pointer" />
              </Tooltip>
            </div>
          </div>

          {/* Explanatory banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
            <ScissorOutlined className="text-amber-500 text-sm mt-0.5 shrink-0" />
            <div>
              <strong>Инструкция для мастера-резчика:</strong> Распечатайте наклейки на термопринтере и сразу после распила слэба наклейте на торец или тыльную сторону заготовки перед передачей на полировку.
            </div>
          </div>

          {/* Preview list container */}
          <div className="max-h-[65vh] overflow-y-auto pr-1">
            <div 
              id="printable-thermal-labels" 
              className="flex flex-col items-center gap-4 py-2"
            >
              {thermalLabels.map(lbl => (
                <div 
                  key={lbl.id}
                  className="bg-white text-slate-900 p-3 rounded border-2 border-slate-900 shadow-md font-sans print-page-break select-text transition-all flex flex-col justify-between"
                  style={{
                    width: sizeStyles.width,
                    minHeight: sizeStyles.minHeight,
                  }}
                >
                  {/* Top Bar: Brand, Order and Piece Index */}
                  <div className="border-b-2 border-slate-900 pb-1 mb-2 flex justify-between items-center">
                    <div>
                      <div className="text-[11px] font-black tracking-wider uppercase text-slate-900 leading-tight">
                        КАМЕННЫЙ РУЧЕЙ
                      </div>
                      <div className="text-[8px] text-slate-500 font-bold uppercase leading-none">
                        ЦЕХ ОБРАБОТКИ КАМНЯ
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-1.5">
                      <span className="font-mono font-black text-sm bg-slate-900 text-white px-2 py-0.5 rounded">
                        {lbl.orderNumber}
                      </span>
                      <span className="text-[10px] font-black border-2 border-slate-900 px-1.5 py-0.5 rounded bg-amber-100 text-amber-950">
                        № {lbl.itemNumber}/{lbl.totalItems}
                      </span>
                    </div>
                  </div>

                  {/* Stone Type - Extra Large Prominent Heading */}
                  <div className="bg-slate-100 p-2 rounded border border-slate-300 mb-2">
                    <div className="text-[8.5px] uppercase tracking-wider text-slate-500 font-extrabold leading-none mb-1">
                      ПОРОДА И СОРТ КАМНЯ:
                    </div>
                    <div className={`${sizeStyles.titleSize} font-black text-slate-950 leading-tight`}>
                      {lbl.stoneType}
                    </div>
                  </div>

                  {/* Dimensions - Extra Bold Mono */}
                  <div className="bg-blue-50 border-2 border-blue-300 p-2 rounded mb-2">
                    <div className="text-[8.5px] uppercase font-bold text-blue-900 leading-none mb-0.5">
                      ТОЧНЫЕ ГАБАРИТЫ (Д×Ш×Т):
                    </div>
                    <div className={`font-mono font-black ${sizeStyles.dimSize} text-blue-950 leading-tight tracking-wide`}>
                      {lbl.dimensions}
                    </div>
                  </div>

                  {/* Technical Task / Edge & Mounting - Large Clear Block */}
                  <div className="bg-amber-50/70 border border-amber-300 p-2 rounded mb-2 text-slate-900">
                    <div className="text-[8.5px] uppercase font-bold text-amber-900 leading-none mb-1">
                      ТЕХНИЧЕСКОЕ ЗАДАНИЕ / ОБРАБОТКА:
                    </div>
                    <div className={`font-bold text-slate-950 ${sizeStyles.taskSize} leading-snug`}>
                      {lbl.description}
                    </div>
                  </div>

                  {/* Compact Sticker Footer Note */}
                  <div className="bg-slate-900 text-white text-[8px] font-bold uppercase tracking-tight py-1 px-1.5 rounded text-center leading-tight">
                    После распила наклеить на торец / тыльную сторону для полировки
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
