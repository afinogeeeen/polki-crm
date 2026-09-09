import React, { useState } from 'react';
import { 
  Modal, 
  Button, 
  Input, 
  InputNumber, 
  Alert, 
  Tag, 
  Row, 
  Col, 
  Radio, 
  message 
} from 'antd';
import { 
  ApiOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ThunderboltOutlined, 
  CalculatorOutlined, 
  LinkOutlined, 
  SafetyCertificateOutlined,
  BarcodeOutlined
} from '@ant-design/icons';
import { cdekApi, type CdekTariffResult } from '../api/cdekApi';
import { dataStore } from '../api/dataStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const CdekApiTestModal: React.FC<Props> = ({ visible, onClose }) => {
  const config = cdekApi.getConfig();
  const [clientId, setClientId] = useState(config.clientId);
  const [clientSecret, setClientSecret] = useState(config.clientSecret);
  const [isTestMode, setIsTestMode] = useState(config.isTest);

  // Test states
  const [testingAuth, setTestingAuth] = useState(false);
  const [authResult, setAuthResult] = useState<{ success: boolean; message: string; tokenPreview?: string } | null>(null);

  // Tariff test states
  const [weightGrams, setWeightGrams] = useState<number>(12000); // 12 кг каменная полка
  const [lengthCm, setLengthCm] = useState<number>(80);
  const [widthCm, setWidthCm] = useState<number>(20);
  const [heightCm, setHeightCm] = useState<number>(5);
  const [tariffCode, setTariffCode] = useState<number>(136); // Склад-Склад
  const [testingTariff, setTestingTariff] = useState(false);
  const [tariffResult, setTariffResult] = useState<CdekTariffResult | null>(null);
  const [tariffError, setTariffError] = useState<string | null>(null);

  // Generate order & track states
  const [generatingOrder, setGeneratingOrder] = useState(false);
  const [orderRecipient, setOrderRecipient] = useState('Алексей Смирнов');
  const [orderCity, setOrderCity] = useState('Санкт-Петербург');
  const [orderAddress, setOrderAddress] = useState('Невский проспект, дом 25, кв 12');
  const [orderShelf, setOrderShelf] = useState('Полка из черного гранита 800х200х20 мм');
  const [generatedOrder, setGeneratedOrder] = useState<{
    cdekNumber: string;
    orderNumber: string;
    uuid: string;
    status: string;
  } | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const handleSaveConfig = () => {
    cdekApi.saveConfig({
      clientId,
      clientSecret,
      isTest: isTestMode,
    });
  };

  const handleRunAuthTest = async () => {
    handleSaveConfig();
    setTestingAuth(true);
    setAuthResult(null);
    try {
      const res = await cdekApi.testConnection();
      setAuthResult(res);
    } catch (e: any) {
      setAuthResult({
        success: false,
        message: e?.message || 'Ошибка соединения',
      });
    } finally {
      setTestingAuth(false);
    }
  };

  const handleRunTariffTest = async () => {
    handleSaveConfig();
    setTestingTariff(true);
    setTariffResult(null);
    setTariffError(null);
    try {
      const res = await cdekApi.calculateTariff({
        fromCityCode: 44,  // Москва
        toCityCode: 137,   // Санкт-Петербург
        weightGrams,
        lengthCm,
        widthCm,
        heightCm,
        tariffCode,
      });
      setTariffResult(res);
    } catch (e: any) {
      setTariffError(e?.message || 'Ошибка расчета тарифа СДЭК');
    } finally {
      setTestingTariff(false);
    }
  };

  const handleGenerateRealCdekOrder = async () => {
    handleSaveConfig();
    setGeneratingOrder(true);
    setGeneratedOrder(null);
    setOrderError(null);

    try {
      const orderNum = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
      const result = await cdekApi.createOrder({
        orderNumber: orderNum,
        recipientName: orderRecipient,
        destinationCity: orderCity,
        destinationAddress: orderAddress,
        shelfLabel: orderShelf,
        weightGrams: 14000,
        lengthCm: 80,
        widthCm: 20,
        heightCm: 6,
        costRub: 9500,
      });

      // Сохраняем прямо в список отслеживаний Polki CRM
      dataStore.addTracking({
        tracking_number: result.cdekNumber,
        order_number: orderNum,
        recipient_name: orderRecipient,
        destination_city: `${orderCity}, ${orderAddress}`,
        label: orderShelf,
        status: 'created',
        estimated_date: result.estimatedDelivery || 'Через 2-3 дня',
      });

      setGeneratedOrder({
        cdekNumber: result.cdekNumber,
        orderNumber: orderNum,
        uuid: result.uuid,
        status: result.status,
      });

      message.success(`Сгенерирован трек-номер СДЭК: ${result.cdekNumber}! Добавлен в список доставок.`);
    } catch (e: any) {
      setOrderError(e?.message || 'Ошибка генерации заказа в СДЭК');
    } finally {
      setGeneratingOrder(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold">
          <ApiOutlined className="text-blue-500 text-lg" />
          <span>Интеграция и тестирование API СДЭК v2 (apidoc.cdek.ru)</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Закрыть
        </Button>,
      ]}
      width={720}
      style={{ top: 20 }}
    >
      <div className="space-y-4 text-xs mt-3 max-h-[75vh] overflow-y-auto pr-1">
        {/* Info Banner */}
        <Alert
          type="info"
          showIcon
          icon={<SafetyCertificateOutlined />}
          message="Подключение к официальному тестовому стенду СДЭК"
          description={
            <div className="space-y-1 text-[11px]">
              <div>
                Используется среда <code>https://api.edu.cdek.ru/v2</code> с протоколом OAuth 2.0 (Client Credentials).
              </div>
              <div>
                Документация и методы API: <a href="https://apidoc.cdek.ru/" target="_blank" rel="noreferrer" className="text-blue-500 font-medium inline-flex items-center gap-0.5">apidoc.cdek.ru <LinkOutlined /></a>
              </div>
            </div>
          }
          className="rounded-xl border-blue-500/20"
        />

        {/* Credentials Form */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
              Учетные данные интеграции:
            </span>
            <Tag color={isTestMode ? 'orange' : 'green'} className="rounded-full m-0 font-medium">
              {isTestMode ? 'Тестовая среда (api.edu.cdek.ru)' : 'Боевая среда (api.cdek.ru)'}
            </Tag>
          </div>

          <Row gutter={[12, 8]}>
            <Col xs={24} sm={12}>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                Client ID (Account / Идентификатор):
              </div>
              <Input 
                value={clientId} 
                onChange={e => setClientId(e.target.value)}
                placeholder="wqGwiQx0gg8mLtiEKsUinjVSICCjtTEP"
                className="font-mono text-xs"
              />
            </Col>
            <Col xs={24} sm={12}>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                Client Secret (Secure password):
              </div>
              <Input.Password 
                value={clientSecret} 
                onChange={e => setClientSecret(e.target.value)}
                placeholder="RmAmgvSgSl1yirlz9QupbzOJVqhCxcP5"
                className="font-mono text-xs"
              />
            </Col>
          </Row>

          <div className="flex justify-between items-center pt-1">
            <Radio.Group 
              value={isTestMode} 
              onChange={e => setIsTestMode(e.target.value)}
              size="small"
            >
              <Radio value={true}>Тестовый стенд (EDU)</Radio>
              <Radio value={false}>Боевой контракт</Radio>
            </Radio.Group>

            <Button 
              type="primary" 
              icon={<ThunderboltOutlined />} 
              loading={testingAuth}
              onClick={handleRunAuthTest}
              className="bg-blue-600 hover:bg-blue-500 font-semibold"
              size="small"
            >
              Тест авторизации (OAuth token)
            </Button>
          </div>

          {authResult && (
            <div className={`mt-2 p-2.5 rounded-lg border text-xs ${
              authResult.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
            }`}>
              <div className="flex items-center gap-1.5 font-semibold">
                {authResult.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                <span>{authResult.message}</span>
              </div>
              {authResult.tokenPreview && (
                <div className="mt-1 text-[11px] font-mono opacity-80 truncate">
                  JWT Bearer: {authResult.tokenPreview}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Tariff Calculator Test */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
              <CalculatorOutlined className="text-amber-500" />
              Тестовый расчет доставки каменной полки (Москва → СПб):
            </span>
          </div>

          <Row gutter={[10, 8]}>
            <Col xs={12} sm={6}>
              <div className="text-[11px] text-slate-500 mb-0.5">Вес посылки (грамм):</div>
              <InputNumber 
                value={weightGrams} 
                onChange={v => setWeightGrams(Number(v) || 12000)}
                step={1000}
                className="w-full font-mono text-xs"
              />
            </Col>
            <Col xs={12} sm={6}>
              <div className="text-[11px] text-slate-500 mb-0.5">Длина (см):</div>
              <InputNumber 
                value={lengthCm} 
                onChange={v => setLengthCm(Number(v) || 80)}
                className="w-full font-mono text-xs"
              />
            </Col>
            <Col xs={12} sm={6}>
              <div className="text-[11px] text-slate-500 mb-0.5">Ширина (см):</div>
              <InputNumber 
                value={widthCm} 
                onChange={v => setWidthCm(Number(v) || 20)}
                className="w-full font-mono text-xs"
              />
            </Col>
            <Col xs={12} sm={6}>
              <div className="text-[11px] text-slate-500 mb-0.5">Высота упаковки (см):</div>
              <InputNumber 
                value={heightCm} 
                onChange={v => setHeightCm(Number(v) || 5)}
                className="w-full font-mono text-xs"
              />
            </Col>
          </Row>

          <div className="flex justify-between items-center pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Тариф:</span>
              <Radio.Group 
                value={tariffCode} 
                onChange={e => setTariffCode(e.target.value)}
                size="small"
              >
                <Radio value={136}>Склад-Склад (ПВЗ #136)</Radio>
                <Radio value={137}>Склад-Дверь (Курьер #137)</Radio>
              </Radio.Group>
            </div>

            <Button 
              type="primary" 
              icon={<CalculatorOutlined />} 
              loading={testingTariff}
              onClick={handleRunTariffTest}
              className="bg-amber-600 hover:bg-amber-500 font-semibold text-white"
              size="small"
            >
              Рассчитать через API
            </Button>
          </div>

          {tariffResult && (
            <div className="mt-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-slate-800 dark:text-slate-100">
              <div className="flex items-center justify-between font-semibold pb-1.5 border-b border-emerald-500/20">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircleOutlined /> Расчет успешно получен от сервера СДЭК:
                </span>
                <span className="font-mono text-base text-emerald-600 dark:text-emerald-400 font-bold">
                  {tariffResult.total_sum} ₽
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Базовая доставка:</span>
                  <strong className="font-mono">{tariffResult.delivery_sum} ₽</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Сроки доставки:</span>
                  <strong>{tariffResult.period_min}–{tariffResult.period_max} раб. дня</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Расчетный вес:</span>
                  <strong className="font-mono">{(tariffResult.weight_calc || weightGrams) / 1000} кг</strong>
                </div>
              </div>
            </div>
          )}

          {tariffError && (
            <Alert
              type="error"
              message="Ошибка расчета тарифа"
              description={tariffError}
              className="mt-2 text-xs"
              showIcon
            />
          )}
        </div>

        {/* Real CDEK Tracking Number Generator Section */}
        <div className="p-3.5 rounded-xl border border-blue-500/30 dark:border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
              <BarcodeOutlined className="text-blue-500 text-base" />
              Генератор накладных и трек-номеров через СДЭК API:
            </span>
            <Tag color="blue" className="rounded-full m-0 font-medium">
              POST /v2/orders
            </Tag>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Регистрирует заказ в тестовой базе СДЭК, генерирует официальный номер отправления и автоматически добавляет его в список трекинга Polki CRM.
          </div>

          <Row gutter={[10, 8]}>
            <Col xs={24} sm={12}>
              <div className="text-[11px] text-slate-500 mb-0.5">Получатель (ФИО):</div>
              <Input 
                value={orderRecipient} 
                onChange={e => setOrderRecipient(e.target.value)}
                placeholder="Алексей Смирнов"
                className="text-xs"
              />
            </Col>
            <Col xs={24} sm={12}>
              <div className="text-[11px] text-slate-500 mb-0.5">Город назначения:</div>
              <Input 
                value={orderCity} 
                onChange={e => setOrderCity(e.target.value)}
                placeholder="Санкт-Петербург"
                className="text-xs"
              />
            </Col>
            <Col xs={24} sm={14}>
              <div className="text-[11px] text-slate-500 mb-0.5">Адрес доставки:</div>
              <Input 
                value={orderAddress} 
                onChange={e => setOrderAddress(e.target.value)}
                placeholder="Невский проспект, дом 25, кв 12"
                className="text-xs"
              />
            </Col>
            <Col xs={24} sm={10}>
              <div className="text-[11px] text-slate-500 mb-0.5">Изделие:</div>
              <Input 
                value={orderShelf} 
                onChange={e => setOrderShelf(e.target.value)}
                placeholder="Полка из гранита Габбро"
                className="text-xs"
              />
            </Col>
          </Row>

          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-slate-400">
              Габариты: 80×20×6 см · 14 кг
            </span>

            <Button 
              type="primary" 
              icon={<BarcodeOutlined />} 
              loading={generatingOrder}
              onClick={handleGenerateRealCdekOrder}
              className="bg-blue-600 hover:bg-blue-500 font-semibold text-white"
            >
              Сгенерировать трек СДЭК в CRM
            </Button>
          </div>

          {generatedOrder && (
            <div className="mt-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-slate-800 dark:text-slate-100 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircleOutlined /> Накладная СДЭК успешно зарегистрирована!
                </span>
                <span className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">
                  {generatedOrder.cdekNumber}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                Номер заказа: <strong className="font-mono">{generatedOrder.orderNumber}</strong> · Статус: <Tag color="cyan" className="text-[10px] m-0 ml-1">{generatedOrder.status}</Tag>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Отправление уже появилось в левой колонке на странице «СДЭК Трекинг». Закройте окно и проверьте его таймлайн!
              </div>
            </div>
          )}

          {orderError && (
            <Alert
              type="error"
              message="Ошибка создания накладной СДЭК"
              description={orderError}
              className="mt-2 text-xs"
              showIcon
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
