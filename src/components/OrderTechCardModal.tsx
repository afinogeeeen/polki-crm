import React, { useState } from 'react';
import { Modal, Button, Row, Col, Radio, Tooltip } from 'antd';
import { 
  PrinterOutlined, 
  FileTextOutlined, 
  BarcodeOutlined, 
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

  const getDimensionsStyle = () => {
    switch (labelSize) {
      case '58x40':
        return {
          width: '280px',
          minHeight: '190px',
          titleSize: 'text-xs',
          dimSize: 'text-sm',
          taskSize: 'text-[10px]',
          barcodeHeight: 'h-6'
        };
      case '100x60':
        return {
          width: '420px',
          minHeight: '260px',
          titleSize: 'text-base',
          dimSize: 'text-xl',
          taskSize: 'text-xs',
          barcodeHeight: 'h-10'
        };
      case '80x50':
      default:
        return {
          width: '360px',
          minHeight: '225px',
          titleSize: 'text-sm',
          dimSize: 'text-lg',
          taskSize: 'text-[11px]',
          barcodeHeight: 'h-8'
        };
    }
  };

  const sizeStyles = getDimensionsStyle();

  return (
    <Modal
      title={
        <div className="flex flex-wrap items-center justify-between gap-3 pr-8 text-slate-900 dark:text-slate-100">
          <div className="flex items-center gap-2">
            {viewMode === 'full' ? (
              <FileTextOutlined className="text-slate-900 dark:text-slate-100 text-lg" />
            ) : (
              <BarcodeOutlined className="text-slate-900 dark:text-slate-100 text-lg" />
            )}
            <span className="font-bold">
              {viewMode === 'full' 
                ? `Техкарта и паспорт изделия (Ч/Б А4) — ${order.order_number}`
                : `Стикер для резчика (Ч/Б) — ${order.order_number}`}
            </span>
          </div>

          <Radio.Group 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            size="small"
            buttonStyle="solid"
            className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700"
          >
            <Radio.Button value="full" className="text-xs font-semibold">
              <FileTextOutlined className="mr-1" />
              Паспорт / Карта (A4)
            </Radio.Button>
            <Radio.Button value="thermal" className="text-xs font-semibold">
              <ScissorOutlined className="mr-1" />
              Стикер для резчика ({thermalLabels.length} шт.)
            </Radio.Button>
          </Radio.Group>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={viewMode === 'full' ? 840 : 780}
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
            className="bg-black hover:bg-slate-800 text-white font-semibold border-black"
          >
            Печать паспорта (Ч/Б A4)
          </Button>
        ) : (
          <Button 
            key="print-thermal" 
            type="primary" 
            icon={<PrinterOutlined />} 
            onClick={handlePrintThermal}
            className="bg-black hover:bg-slate-800 text-white font-semibold border-black"
          >
            Печать наклеек (Ч/Б Термопринтер)
          </Button>
        )
      ]}
      style={{ top: 20 }}
    >
      {/* ===================== VIEW 1: FULL A4 TECH CARD / PASSPORT (100% B&W) ===================== */}
      {viewMode === 'full' && (
        <div>
          <div className="mb-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2.5 rounded-lg flex items-center justify-between text-xs text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-2">
              <ScissorOutlined className="text-black dark:text-white text-base" />
              <span>
                Строгий черно-белый формат без оттенков серого: идеален для лазерной печати и вложения в коробку.
              </span>
            </div>
            <Button 
              size="small" 
              onClick={() => setViewMode('thermal')}
              className="text-black dark:text-white border-black dark:border-slate-500 font-semibold"
            >
              Стикеры распила →
            </Button>
          </div>

          <div id="printable-tech-card" className="bg-white text-black p-8 rounded-none font-sans text-xs border-2 border-black">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
              <div>
                <div className="text-2xl font-black tracking-widest uppercase text-black font-serif">
                  «КАМЕННЫЙ РУЧЕЙ»
                </div>
                <div className="text-xs font-bold text-black tracking-wider uppercase mt-0.5">
                  МАСТЕРСКАЯ ИЗДЕЛИЙ ИЗ НАТУРАЛЬНОГО КАМНЯ
                </div>
                <div className="text-[11px] text-black mt-1 font-semibold">
                  ПАСПОРТ ИЗДЕЛИЯ И ТЕХНОЛОГИЧЕСКАЯ КАРТА ЗАКАЗА
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black font-mono text-black">№ {order.order_number}</div>
                <div className="text-xs text-black font-semibold mt-0.5">
                  Дата: {new Date(order.created_at).toLocaleDateString('ru-RU')}
                </div>
                <div className="text-[11px] text-black font-mono mt-0.5">
                  polkistone.ru
                </div>
              </div>
            </div>

            {/* Order & Client Info (Pure B&W Borders) */}
            <div className="p-3 border-2 border-black mb-4">
              <Row gutter={[24, 8]}>
                <Col span={12}>
                  <span className="text-black block text-[10px] uppercase font-black tracking-wider">Заказчик:</span>
                  <span className="text-sm font-bold text-black">{order.client_name || 'Частный заказчик'}</span>
                </Col>
                <Col span={12}>
                  <span className="text-black block text-[10px] uppercase font-black tracking-wider">Ответственный мастер / Полировщик:</span>
                  <span className="text-sm font-bold text-black">{order.polisher || 'Цех № 1'}</span>
                </Col>
                <Col span={24}>
                  <div className="border-t border-black pt-2 mt-1 flex justify-between items-center text-xs">
                    <span className="font-bold text-black">Комплектация заказа:</span>
                    <span className="font-black text-black font-mono">
                      {hasMultipleItems ? order.items!.reduce((s, i) => s + (i.quantity || 1), 0) : 1} шт.
                    </span>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Multi-item Shelves Table (Pure High-Contrast B&W) */}
            <div className="mb-5">
              <div className="font-black text-xs uppercase border-b-2 border-black pb-1 mb-2 text-black flex items-center justify-between tracking-wide">
                <span>СПЕЦИФИКАЦИЯ ИЗДЕЛИЙ ЗАКАЗА</span>
                <span className="text-[10px] font-bold text-black">
                  ТОЧНАЯ ГЕОМЕТРИЯ ±1 ММ · ЗЕРКАЛЬНАЯ ФАСКА
                </span>
              </div>
              <table className="w-full text-left border-collapse border-2 border-black">
                <thead>
                  <tr className="border-b-2 border-black bg-black text-white text-[11px]">
                    <th className="p-2 font-bold w-12 text-center border-r border-white">№</th>
                    <th className="p-2 font-bold border-r border-white">Порода и сорт камня</th>
                    <th className="p-2 font-bold border-r border-white">Габариты (Д × Ш × Т мм)</th>
                    <th className="p-2 font-bold w-16 text-center border-r border-white">Кол-во</th>
                    <th className="p-2 font-bold">Обработка кромки, фаска, крепеж</th>
                  </tr>
                </thead>
                <tbody>
                  {hasMultipleItems ? (
                    order.items!.map((item, idx) => (
                      <tr key={item.id || idx} className="border-b border-black text-xs text-black">
                        <td className="p-2 font-bold text-center border-r border-black">{idx + 1}</td>
                        <td className="p-2 font-black border-r border-black">{item.stone_type}</td>
                        <td className="p-2 font-mono font-black border-r border-black text-sm">{item.dimensions}</td>
                        <td className="p-2 text-center font-bold border-r border-black">{item.quantity} шт.</td>
                        <td className="p-2 font-medium">{item.description || 'Еврофаска полированная, скрытый менсолодержатель'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-black text-xs text-black">
                      <td className="p-2 font-bold text-center border-r border-black">1</td>
                      <td className="p-2 font-black border-r border-black">{order.stone_type}</td>
                      <td className="p-2 font-mono font-black border-r border-black text-sm">{order.dimensions}</td>
                      <td className="p-2 text-center font-bold border-r border-black">1 шт.</td>
                      <td className="p-2 font-medium">{order.product_description || 'Еврофаска полированная, скрытый менсолодержатель'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Quality & Care Certificate Guarantee (Pure B&W) */}
            <div className="mb-5 p-3.5 border-2 border-black text-black text-[11px] leading-relaxed">
              <div className="font-black uppercase tracking-wider mb-1">
                РЕКОМЕНДАЦИИ ПО ЭКСПЛУАТАЦИИ И УХОДУ:
              </div>
              <p className="mb-1 font-medium">
                Изделие прошло финишную обработку кромок и контроль геометрии. Поверхность обработана защитным гидрофобным составом.
              </p>
              <p className="font-bold mb-0">
                Уход: протирать влажной мягкой тканью или салфеткой из микрофибры. Не использовать абразивные губки, кислоты и агрессивные чистящие средства.
              </p>
            </div>

            {/* Signatures Footer */}
            <div className="pt-3 border-t-2 border-black flex justify-between items-center text-xs text-black">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black block">Контроль ОТК и упаковка:</span>
                <div className="font-bold flex items-center gap-2">
                  <span>Мастер ОТК:</span>
                  <span className="border-b-2 border-black w-28 inline-block">&nbsp;</span>
                  <span>/</span>
                  <span className="border-b-2 border-black w-36 inline-block">&nbsp;</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-base uppercase tracking-wider text-black">
                  «КАМЕННЫЙ РУЧЕЙ»
                </div>
                <div className="text-[10px] font-bold text-black">
                  Контроль качества пройден. Изделие готово к эксплуатации.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW 2: THERMAL PRINTER MINI-LABELS (100% B&W) ===================== */}
      {viewMode === 'thermal' && (
        <div className="space-y-4">
          {/* Controls toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-black dark:text-white font-bold">Размер этикетки:</span>
              <Radio.Group 
                value={labelSize} 
                onChange={(e) => setLabelSize(e.target.value)}
                size="small"
                className="bg-white dark:bg-slate-900 rounded border border-black dark:border-slate-700"
              >
                <Radio.Button value="58x40" className="font-semibold">58 × 40 мм</Radio.Button>
                <Radio.Button value="80x50" className="font-semibold">80 × 50 мм</Radio.Button>
                <Radio.Button value="100x60" className="font-semibold">100 × 60 мм</Radio.Button>
              </Radio.Group>
            </div>

            <div className="flex items-center gap-2 text-black dark:text-white font-bold">
              <span>Всего наклеек: {thermalLabels.length} шт.</span>
              <Tooltip title="100% Ч/Б термо-этикетка. Никаких серых растров. Четкий штрихкод и крупные размеры для мастера.">
                <InfoCircleOutlined className="cursor-pointer" />
              </Tooltip>
            </div>
          </div>

          {/* Notice banner */}
          <div className="border border-black dark:border-slate-700 p-2 rounded text-xs text-black dark:text-white flex items-center gap-2">
            <ScissorOutlined className="text-base shrink-0" />
            <span>
              <strong>Цеховой стикер заготовки:</strong> наклеивается резчиком на торец/тыльную сторону сразу после распила слэба, чтобы на полировке не перепутали детали.
            </span>
          </div>

          {/* Printable Labels List */}
          <div className="max-h-[65vh] overflow-y-auto pr-1">
            <div 
              id="printable-thermal-labels" 
              className="flex flex-col items-center gap-4 py-2"
            >
              {thermalLabels.map(lbl => (
                <div 
                  key={lbl.id}
                  className="bg-white text-black p-3.5 rounded-none border-2 border-black font-sans print-page-break select-text flex flex-col justify-between"
                  style={{
                    width: sizeStyles.width,
                    minHeight: sizeStyles.minHeight,
                  }}
                >
                  {/* Top Bar: Brand, Order and Piece Index */}
                  <div className="border-b-2 border-black pb-1.5 mb-2 flex justify-between items-center">
                    <div>
                      <div className="text-[11px] font-black tracking-wider uppercase text-black leading-tight">
                        КАМЕННЫЙ РУЧЕЙ
                      </div>
                      <div className="text-[8px] text-black font-bold uppercase leading-none">
                        ЦЕХ ОБРАБОТКИ КАМНЯ
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-1.5">
                      <span className="font-mono font-black text-sm bg-black text-white px-2 py-0.5">
                        {lbl.orderNumber}
                      </span>
                      <span className="text-[10px] font-black border-2 border-black px-1.5 py-0.5 bg-white text-black">
                        {lbl.itemNumber}/{lbl.totalItems}
                      </span>
                    </div>
                  </div>

                  {/* Simulated 1D Barcode for Thermal Scanner */}
                  <div className="border-2 border-black p-1 text-center mb-2 bg-white">
                    <div className={`${sizeStyles.barcodeHeight} flex items-center justify-center gap-0.5 px-2 overflow-hidden`}>
                      {[3,1,2,4,1,2,1,4,2,3,1,2,4,1,2,3,4,1,2,3,1,4,2,1,3,2,4,1,2,3,1,4].map((w, i) => (
                        <div key={i} className="bg-black h-full" style={{ width: `${w * 1.5}px` }} />
                      ))}
                    </div>
                    <div className="font-mono font-black text-[9px] tracking-widest text-black mt-0.5">
                      *{lbl.orderNumber}-ITEM{lbl.itemNumber}*
                    </div>
                  </div>

                  {/* Stone Type - High Contrast */}
                  <div className="border-2 border-black p-1.5 mb-1.5 bg-white">
                    <div className="text-[8px] uppercase font-black text-black leading-none mb-0.5">
                      ПОРОДА КАМНЯ:
                    </div>
                    <div className={`${sizeStyles.titleSize} font-black text-black leading-tight`}>
                      {lbl.stoneType}
                    </div>
                  </div>

                  {/* Dimensions - Extra Bold Mono */}
                  <div className="border-2 border-black p-1.5 mb-1.5 bg-white">
                    <div className="text-[8px] uppercase font-black text-black leading-none mb-0.5">
                      ГАБАРИТЫ (Д × Ш × Т):
                    </div>
                    <div className={`font-mono font-black ${sizeStyles.dimSize} text-black leading-tight tracking-wide`}>
                      {lbl.dimensions}
                    </div>
                  </div>

                  {/* Technical Task / Edge & Mounting */}
                  <div className="border-2 border-black p-1.5 mb-2 bg-white text-black">
                    <div className="text-[8px] uppercase font-black text-black leading-none mb-0.5">
                      ОБРАБОТКА / КРЕПЕЖ:
                    </div>
                    <div className={`font-bold text-black ${sizeStyles.taskSize} leading-snug`}>
                      {lbl.description}
                    </div>
                  </div>

                  {/* Footer Bar */}
                  <div className="bg-black text-white text-[8.5px] font-black uppercase tracking-tight py-1 px-1.5 text-center leading-tight">
                    Сразу после распила наклеить на торец изделия
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

export default OrderTechCardModal;
