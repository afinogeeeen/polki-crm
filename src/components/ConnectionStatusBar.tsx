import React, { useState, useEffect, useMemo } from 'react';
import { 
  Popover, 
  Button, 
  Tag, 
  Tooltip, 
  message,
  Modal,
  Form,
  Input,
  Switch,
  Row,
  Col
} from 'antd';
import { 
  ApiOutlined, 
  SyncOutlined, 
  LinkOutlined, 
  BugOutlined,
  KeyOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { 
  connectionService, 
  subscribeApiStatus 
} from '../api/connectionStatus';
import type { 
  ApiServiceStatus, 
  ApiCredentials 
} from '../api/connectionStatus';
import { useTheme } from '../context/ThemeContext';

interface Props {
  mode?: 'header' | 'banner';
  onOpenSettings?: () => void;
}

export const ConnectionStatusBar: React.FC<Props> = ({ mode = 'header' }) => {
  const [services, setServices] = useState<ApiServiceStatus[]>(connectionService.getServices());
  const [checking, setChecking] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  
  const [creds, setCreds] = useState<ApiCredentials>(connectionService.getCredentials());
  const [form] = Form.useForm();

  const { isDark } = useTheme();

  useEffect(() => {
    const unsub = subscribeApiStatus(newServices => setServices([...newServices]));
    return () => unsub();
  }, []);

  const offlineCount = useMemo(() => services.filter(s => s.status === 'offline').length, [services]);
  const unconfiguredCount = useMemo(() => services.filter(s => s.status === 'unconfigured').length, [services]);
  const sandboxCount = useMemo(() => services.filter(s => s.status === 'sandbox').length, [services]);

  const handleOpenSettings = () => {
    const current = connectionService.getCredentials();
    setCreds(current);
    form.setFieldsValue(current);
    setSettingsModalOpen(true);
    setPopoverOpen(false);
  };

  const handleSaveSettings = (values: ApiCredentials) => {
    connectionService.saveCredentials(values);
    message.success('Настройки API-ключей сохранены');
    setSettingsModalOpen(false);
  };

  const handlePopulateDemoKeys = () => {
    const demo = connectionService.populateDemoCredentials();
    setServices([...demo]);
    const updatedCreds = connectionService.getCredentials();
    setCreds(updatedCreds);
    form.setFieldsValue(updatedCreds);
    message.success('Заполнены тестовые демо-ключи (режим Online)');
  };

  const handleClearAllKeys = () => {
    const cleared = connectionService.clearAllCredentials();
    setServices([...cleared]);
    const updatedCreds = connectionService.getCredentials();
    setCreds(updatedCreds);
    form.setFieldsValue(updatedCreds);
    message.info('Все ключи очищены. Возвращен честный исходный режим.');
  };

  const handleCheckAll = async () => {
    setChecking(true);
    try {
      await connectionService.checkAll();
      message.success('Статусы соединений проверены');
    } catch (e) {
      console.error(e);
      message.error('Ошибка проверки соединений');
    } finally {
      setChecking(false);
    }
  };

  const handleSimulateOutage = (serviceId: string) => {
    connectionService.toggleServiceStatus(
      serviceId, 
      'offline', 
      'HTTP 504 Gateway Timeout: шлюз API не отвечает'
    );
    message.warning('Имитация сбоя включена. Проверьте реакцию системы.');
  };

  const handleRestoreService = (serviceId: string) => {
    connectionService.toggleServiceStatus(serviceId, 'online');
    message.success('Соединение восстановлено');
  };

  // 1. BANNER MODE (used inside Messages.tsx)
  if (mode === 'banner') {
    const marketplaceServices = services.filter(s => s.category === 'marketplace');
    const problemServices = marketplaceServices.filter(s => s.status === 'offline' || s.status === 'degraded');
    const unconfServices = marketplaceServices.filter(s => s.status === 'unconfigured');

    // Если есть авария на маркетплейсе
    if (problemServices.length > 0) {
      return (
        <div className={`p-4 rounded-2xl border transition shadow-sm ${
          isDark ? 'bg-rose-950/40 border-rose-900/60' : 'bg-rose-50 border-rose-200'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="relative flex h-3 w-3 mt-1 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <div>
                <div className="font-bold text-sm text-rose-800 dark:text-rose-200 flex items-center gap-2">
                  <ExclamationCircleOutlined />
                  Сбой интеграции с маркетплейсом ({problemServices.map(s => s.name).join(', ')})
                </div>
                <div className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                  {problemServices[0]?.error || 'Шлюз API недоступен. Автоматическая загрузка чатов остановлена.'}
                  <span className="ml-1 font-semibold">Перейдите к ручной обработке в кабинете:</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {problemServices.map(s => (
                <a
                  key={s.id}
                  href={s.manualUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition shadow-sm flex items-center gap-1.5"
                >
                  {s.manualActionText} <LinkOutlined />
                </a>
              ))}
              <Button 
                size="small" 
                icon={<SyncOutlined spin={checking} />}
                onClick={handleCheckAll}
                className="rounded-xl text-xs font-medium"
              >
                Повторить
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Если ключи не настроены (честный стартовый режим)
    if (unconfServices.length > 0) {
      return (
        <div className={`p-4 rounded-2xl border transition shadow-sm ${
          isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
                <KeyOutlined className="text-base" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>API маркетплейсов не привязаны (Ручной режим)</span>
                  <Tag color="warning" className="rounded-md font-semibold text-[11px] m-0">
                    Требуются ключи
                  </Tag>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  API-ключи Ozon, Wildberries и Яндекс.Маркета пока не внесены. Сообщения, отзывы и вопросы обрабатываются вручную через официальные кабинеты селлеров.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Button
                type="primary"
                icon={<SettingOutlined />}
                onClick={handleOpenSettings}
                className="rounded-xl font-medium text-xs bg-blue-600 hover:bg-blue-500 shadow-sm"
              >
                Настроить ключи API
              </Button>

              <a
                href="https://seller.ozon.ru/chat"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-slate-700 dark:text-slate-300"
              >
                ЛК Ozon <LinkOutlined />
              </a>
              <a
                href="https://seller.wildberries.ru/communications/feedback"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-slate-700 dark:text-slate-300"
              >
                ЛК WB <LinkOutlined />
              </a>
              <a
                href="https://partner.market.yandex.ru/"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-slate-700 dark:text-slate-300"
              >
                ЛК Яндекс <LinkOutlined />
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Если все маркетплейсы подключены и онлайн
    return (
      <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs transition ${
        isDark 
          ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300' 
          : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-800'
      }`}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold">Шлюзы маркетплейсов активны:</span>
          <span className="opacity-90">Ozon ({services.find(s => s.id === 'ozon')?.pingMs} мс), WB ({services.find(s => s.id === 'wildberries')?.pingMs} мс), Яндекс ({services.find(s => s.id === 'yandex')?.pingMs} мс)</span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            type="text" 
            size="small" 
            icon={<SettingOutlined />}
            onClick={handleOpenSettings}
            className="text-xs h-6 px-2 rounded-lg"
          >
            Ключи
          </Button>
          <Button 
            type="text" 
            size="small" 
            icon={<SyncOutlined spin={checking} />} 
            onClick={handleCheckAll}
            className="text-xs h-6 px-2 rounded-lg"
          >
            Проверить
          </Button>
        </div>
      </div>
    );
  }

  // 2. HEADER POPOVER MODE
  const popoverContent = (
    <div className="w-[360px] sm:w-[420px] max-w-[95vw] p-1">
      {/* Header inside popover */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
            offlineCount > 0 
              ? 'bg-rose-500/10 text-rose-500' 
              : unconfiguredCount > 0
              ? 'bg-amber-500/10 text-amber-500'
              : 'bg-emerald-500/10 text-emerald-500'
          }`}>
            <ApiOutlined />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
              Интеграции и API сервисы
            </div>
            <div className="text-[11px] text-slate-400">
              {offlineCount > 0 
                ? `Сбоев: ${offlineCount}, требуется ручной режим`
                : unconfiguredCount > 0
                ? `Ручной режим (${unconfiguredCount} не настроено, ${sandboxCount} sandbox)`
                : 'Все соединения активны (Online)'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip title="Настройки API-ключей">
            <Button
              size="small"
              type="text"
              icon={<SettingOutlined />}
              onClick={handleOpenSettings}
              className="rounded-lg text-slate-500 hover:text-blue-500"
            />
          </Tooltip>
          <Tooltip title="Проверить отклик всех шлюзов">
            <Button
              size="small"
              type="text"
              icon={<SyncOutlined spin={checking} />}
              onClick={handleCheckAll}
              className="rounded-lg text-slate-500 hover:text-blue-500"
            />
          </Tooltip>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {services.map(item => {
          const isOff = item.status === 'offline';
          const isDeg = item.status === 'degraded';
          const isUnconf = item.status === 'unconfigured';
          const isSb = item.status === 'sandbox';

          let statusTag = <Tag color="success" className="m-0 rounded-md text-[10px] font-bold">Онлайн · {item.pingMs} мс</Tag>;
          if (isOff) {
            statusTag = <Tag color="error" className="m-0 rounded-md text-[10px] font-bold">Сбой API</Tag>;
          } else if (isDeg) {
            statusTag = <Tag color="warning" className="m-0 rounded-md text-[10px] font-bold">Задержка · {item.pingMs} мс</Tag>;
          } else if (isUnconf) {
            statusTag = <Tag color="default" className="m-0 rounded-md text-[10px] font-semibold text-slate-500">Ключи не заданы</Tag>;
          } else if (isSb) {
            statusTag = <Tag color="cyan" className="m-0 rounded-md text-[10px] font-bold">Тестовый Sandbox</Tag>;
          }

          return (
            <div 
              key={item.id} 
              className={`p-3 rounded-xl border transition-all text-xs ${
                isOff 
                  ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60' 
                  : isUnconf
                  ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800'
                  : isSb
                  ? 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-200/70 dark:border-sky-900/50'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.name}
                  </span>
                  {item.category === 'marketplace' && (
                    <span className="text-[9px] px-1 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold uppercase">
                      MP
                    </span>
                  )}
                  {item.category === 'logistics' && (
                    <span className="text-[9px] px-1 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                      СДЭК
                    </span>
                  )}
                </div>

                {statusTag}
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                {item.error ? (
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    ⚠️ {item.error}
                  </span>
                ) : (
                  item.details
                )}
              </div>

              {/* Bottom Actions for service */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                <span className="text-slate-400 truncate max-w-[150px]">
                  {item.endpoint}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Direct link to seller cabinet for manual operation */}
                  <a
                    href={item.manualUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition"
                  >
                    ЛК <LinkOutlined />
                  </a>

                  {/* Dev / Test toggles */}
                  {isOff ? (
                    <button
                      type="button"
                      onClick={() => handleRestoreService(item.id)}
                      className="text-emerald-600 hover:text-emerald-700 font-bold transition ml-1"
                    >
                      Восстановить
                    </button>
                  ) : (
                    <Tooltip title="Смоделировать сбой API (для проверки ручного режима)">
                      <button
                        type="button"
                        onClick={() => handleSimulateOutage(item.id)}
                        className="text-slate-400 hover:text-rose-500 transition ml-1 p-0.5"
                      >
                        <BugOutlined />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer controls inside popover */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <Button
          size="small"
          type="primary"
          icon={<SettingOutlined />}
          onClick={handleOpenSettings}
          className="rounded-xl text-xs bg-blue-600 hover:bg-blue-500 shadow-sm"
        >
          Настройки ключей API
        </Button>

        <div className="flex items-center gap-2">
          {unconfiguredCount > 0 ? (
            <button
              type="button"
              onClick={handlePopulateDemoKeys}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Демо-ключи (Online)
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClearAllKeys}
              className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition cursor-pointer"
            >
              Сброс ключей
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Popover
        content={popoverContent}
        trigger="click"
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        placement="bottomRight"
        arrow={false}
        overlayInnerStyle={{
          borderRadius: 20,
          padding: 16,
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <button
          type="button"
          aria-label="API Connection Health"
          className={`px-2.5 sm:px-3 py-1.5 rounded-full border transition flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-sm ${
            offlineCount > 0
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
              : unconfiguredCount > 0
              ? isDark 
                ? 'bg-slate-800/90 border-slate-700 text-amber-300 hover:bg-slate-800' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              : isDark 
              ? 'bg-slate-800/90 border-slate-700 text-emerald-400 hover:bg-slate-800' 
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {offlineCount > 0 ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </>
            ) : unconfiguredCount > 0 ? (
              <>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            )}
          </span>

          <span className="hidden sm:inline">
            {offlineCount > 0 
              ? `Сбой API (${offlineCount})`
              : unconfiguredCount > 0
              ? 'API: Ручной режим'
              : 'API Онлайн'}
          </span>
        </button>
      </Popover>

      {/* Modal: Настройки интеграций и API ключей */}
      <Modal
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-base">
              <KeyOutlined />
            </div>
            <div>
              <div className="font-bold text-base text-slate-900 dark:text-white">
                Настройки интеграций и API-ключей
              </div>
              <div className="text-xs font-normal text-slate-400">
                Привязка официальных токенов маркетплейсов и логистики
              </div>
            </div>
          </div>
        }
        open={settingsModalOpen}
        onCancel={() => setSettingsModalOpen(false)}
        footer={null}
        width={680}
        destroyOnClose
      >
        <div className="py-2">
          <div className={`p-3 rounded-xl border text-xs mb-4 flex items-start gap-2.5 ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-blue-50/60 border-blue-100 text-blue-900'
          }`}>
            <InfoCircleOutlined className="text-blue-500 mt-0.5 text-sm shrink-0" />
            <div>
              <span className="font-bold">Честный режим работы CRM:</span> ключи хранятся локально в браузере в <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">localStorage</code>. Если ключи не указаны, система работает в ручном режиме с прямыми переходами в официальные кабинеты селлеров.
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={creds}
            onFinish={handleSaveSettings}
          >
            {/* Ozon */}
            <div className="mb-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#005bff] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-[#005bff] text-white flex items-center justify-center text-xs font-black">O</span>
                  Ozon Seller API
                </span>
                <a 
                  href="https://seller.ozon.ru/app/settings/api-keys" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                >
                  Где взять ключи в Ozon <LinkOutlined />
                </a>
              </div>
              <Row gutter={12}>
                <Col xs={24} sm={10}>
                  <Form.Item label="Client ID" name="ozonClientId" className="mb-2">
                    <Input placeholder="Например: 89412" className="rounded-lg text-xs" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={14}>
                  <Form.Item label="API Key (Администратор)" name="ozonApiKey" className="mb-2">
                    <Input.Password placeholder="api-key-xxxxxxxx" className="rounded-lg text-xs" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Wildberries */}
            <div className="mb-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#cb11ab] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-[#cb11ab] text-white flex items-center justify-center text-xs font-black">W</span>
                  Wildberries API
                </span>
                <a 
                  href="https://seller.wildberries.ru/supplier-settings/access-to-api" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-purple-500 hover:underline flex items-center gap-1"
                >
                  Создать токен WB <LinkOutlined />
                </a>
              </div>
              <Form.Item label="API Токен (категория: Отзывы и вопросы / Контент)" name="wbToken" className="mb-1">
                <Input.Password placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." className="rounded-lg text-xs" />
              </Form.Item>
            </div>

            {/* Yandex */}
            <div className="mb-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#fc3f1d] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-[#fc3f1d] text-white flex items-center justify-center text-xs font-black">Я</span>
                  Яндекс.Маркет Partner API
                </span>
                <a 
                  href="https://partner.market.yandex.ru/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-amber-600 hover:underline flex items-center gap-1"
                >
                  Кабинет разработчика Яндекса <LinkOutlined />
                </a>
              </div>
              <Row gutter={12}>
                <Col xs={24} sm={14}>
                  <Form.Item label="OAuth Токен" name="yandexOAuth" className="mb-2">
                    <Input.Password placeholder="y0_AgAAAAA..." className="rounded-lg text-xs" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={10}>
                  <Form.Item label="ID кампании (Campaign ID)" name="yandexCampaignId" className="mb-2">
                    <Input placeholder="Например: 21948123" className="rounded-lg text-xs" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* СДЭК */}
            <div className="mb-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-emerald-600 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs font-black">С</span>
                  СДЭК API v2 (Доставка)
                </span>
                <Form.Item name="cdekIsSandbox" valuePropName="checked" className="m-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Тестовая песочница (Sandbox):</span>
                    <Switch defaultChecked size="small" />
                  </div>
                </Form.Item>
              </div>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Client ID / Account" name="cdekAccount" className="mb-1">
                    <Input placeholder="Идентификатор клиента СДЭК" className="rounded-lg text-xs" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Пароль / Client Secret" name="cdekPassword" className="mb-1">
                    <Input.Password placeholder="Секретный пароль СДЭК" className="rounded-lg text-xs" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handlePopulateDemoKeys}
                  icon={<ThunderboltOutlined />}
                  className="rounded-xl text-xs font-medium"
                >
                  Заполнить демо-ключами
                </Button>
                <Button 
                  onClick={handleClearAllKeys}
                  danger
                  className="rounded-xl text-xs font-medium"
                >
                  Очистить всё
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setSettingsModalOpen(false)}
                  className="rounded-xl text-xs font-medium"
                >
                  Отмена
                </Button>
                <Button 
                  type="primary"
                  htmlType="submit"
                  icon={<SafetyCertificateOutlined />}
                  className="rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 shadow-sm"
                >
                  Сохранить настройки
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default ConnectionStatusBar;
