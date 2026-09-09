import React from 'react';
import { Modal, Button } from 'antd';
import { PrinterOutlined, TagOutlined } from '@ant-design/icons';
import type { Order } from '../types';

interface Props {
  order: Order | null;
  visible: boolean;
  onClose: () => void;
}

export const OrderStickerModal: React.FC<Props> = ({ order, visible, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    document.body.classList.add('print-sticker');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-sticker');
    }, 500);
  };

  const totalItemCount = order.items && order.items.length > 0 
    ? order.items.reduce((s, i) => s + (i.quantity || 1), 0)
    : 1;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold">
          <TagOutlined className="text-yellow-500 text-lg" />
          <span>Генератор термоэтикетки на упаковку — {order.order_number}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={560}
      footer={[
        <Button key="close" onClick={onClose}>
          Закрыть
        </Button>,
        <Button 
          key="print" 
          type="primary" 
          icon={<PrinterOutlined />} 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-500"
        >
          Печать этикетки (Термопринтер 100х150 мм)
        </Button>
      ]}
      style={{ top: 20 }}
    >
      <div className="flex flex-col items-center py-4 bg-slate-100 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 max-h-[75vh] overflow-y-auto">
        {/* Physical Sticker Container - simulated 100x150 mm format */}
        <div 
          id="printable-sticker" 
          className="w-[340px] bg-white text-slate-900 p-5 rounded-md border-2 border-slate-900 shadow-xl font-sans"
        >
          {/* Brand Header */}
          <div className="border-b-2 border-slate-900 pb-2 mb-2 flex justify-between items-center">
            <div>
              <div className="text-sm font-black tracking-wider uppercase text-slate-900">
                КАМЕННЫЙ РУЧЕЙ
              </div>
              <div className="text-[9px] text-slate-500 font-semibold tracking-tight uppercase">
                Полки из натурального камня
              </div>
            </div>
            <div className="text-right flex items-center gap-1">
              <span className="text-[10px] font-bold px-1.5 py-0.5 border border-slate-900 rounded bg-slate-100">
                {totalItemCount} {totalItemCount > 1 ? 'ИЗДЕЛИЯ' : 'ИЗДЕЛИЕ'}
              </span>
            </div>
          </div>

          {/* Barcode Simulation */}
          <div className="my-2 py-1 bg-slate-50 border border-slate-300 rounded text-center">
            {/* Barcode lines */}
            <div className="h-9 flex items-center justify-center gap-0.5 px-4 overflow-hidden">
              {[3,1,2,4,1,3,2,1,4,2,3,1,2,4,1,2,3,4,1,2,3,1,4,2,1,3,2,4,1,2,3,1,4].map((w, i) => (
                <div 
                  key={i} 
                  className="bg-black h-full" 
                  style={{ width: `${w * 1.5}px` }} 
                />
              ))}
            </div>
            <div className="text-xs font-mono font-bold tracking-widest mt-0.5 text-slate-900">
              *{order.tracking_number || order.order_number}*
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="space-y-1.5 border-b-2 border-slate-900 pb-2 mb-2 text-xs">
            <div className="max-h-28 overflow-y-auto pr-0.5">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="bg-slate-100 p-1.5 rounded mb-1 border border-slate-200 text-[11px]">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{idx + 1}. {item.stone_type}</span>
                      <span>{item.quantity} шт.</span>
                    </div>
                    <div className="font-mono text-[10px] text-blue-900">{item.dimensions}</div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-100 p-1.5 rounded border border-slate-200 text-[11px]">
                  <div className="font-bold text-slate-900">{order.stone_type}</div>
                  <div className="font-mono text-[10px] text-blue-900">{order.dimensions}</div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center bg-slate-100 p-1 rounded text-[11px]">
              <span className="text-[10px] text-slate-600 uppercase font-bold">Накладная:</span>
              <span className="font-mono font-bold text-slate-900">{order.order_number}</span>
            </div>

            <div className="text-[11px]">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Получатель:</span>
              <span className="font-bold text-slate-900">{order.client_name}</span>
              {order.client_phone && (
                <span className="text-slate-600 block text-[10px]">{order.client_phone}</span>
              )}
            </div>

            {order.tracking_number && (
              <div className="text-[11px]">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Трек СДЭК:</span>
                <span className="font-mono font-bold text-blue-900 text-xs">{order.tracking_number}</span>
              </div>
            )}
          </div>

          {/* Warning icons */}
          <div className="pt-0.5">
            <div className="text-center font-black text-[9px] uppercase text-red-700 tracking-wider mb-1.5">
              ▲ ОСТОРОЖНО: НАТУРАЛЬНЫЙ КАМЕНЬ / НЕ БРОСАТЬ ▲
            </div>

            <div className="grid grid-cols-3 gap-1 text-center text-[8px] font-bold text-slate-700">
              <div className="border border-slate-300 p-0.5 rounded">
                <div className="text-xs">⬆⬆</div>
                <div>ВЕРХ</div>
              </div>
              <div className="border border-slate-300 p-0.5 rounded">
                <div className="text-xs">🍷</div>
                <div>ХРУПКОЕ</div>
              </div>
              <div className="border border-slate-300 p-0.5 rounded">
                <div className="text-xs">☔</div>
                <div>НЕ МОЧИТЬ</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-2 pt-1.5 border-t border-slate-300 flex justify-between text-[8px] text-slate-500">
            <span>polkistone.ru</span>
            <span>Изделия из натурального камня</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
