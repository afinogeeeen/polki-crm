import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Select, Tag, Avatar, Space, message, Drawer, Button, Tooltip } from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  CarOutlined,
  MessageOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
  UserOutlined,
  MenuOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import Orders from './pages/Orders';
import Tracking from './pages/Tracking';
import Messages, { MARKETPLACE_LINKS } from './pages/Messages';
import Dashboard from './pages/Dashboard';
import { dataStore, subscribeDataStore } from './api/dataStore';
import type { UserProfile } from './types';
import { useTheme } from './context/ThemeContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const users = dataStore.getUsers();
  const { toggleTheme, isDark } = useTheme();

  const location = useLocation();

  // Close mobile drawer on route change & sync current user across tabs
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = subscribeDataStore(() => {
      setCurrentUser(dataStore.getCurrentUser());
    });
    return () => unsubscribe();
  }, []);

  const handleUserChange = (userId: string) => {
    const selected = users.find(u => u.id === userId);
    if (selected) {
      dataStore.setCurrentUser(selected);
      setCurrentUser(selected);
      message.success(`Вы переключились на профиль: ${selected.name}`);
    }
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined className="text-base" />,
      label: <Link to="/">Дашборд</Link>,
    },
    {
      key: '/orders',
      icon: <BookOutlined className="text-base" />,
      label: <Link to="/orders">Заказы</Link>,
    },
    {
      key: '/tracking',
      icon: <CarOutlined className="text-base" />,
      label: <Link to="/tracking">СДЭК Трекинг</Link>,
    },
    {
      key: '/messages',
      icon: <MessageOutlined className="text-base" />,
      label: <Link to="/messages">Маркетплейсы</Link>,
    },
  ];

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return 'Аналитика и дашборд';
      case '/orders': return 'Индивидуальные заказы';
      case '/tracking': return 'Отслеживание доставок СДЭК';
      case '/messages': return 'Единое окно маркетплейсов';
      default: return 'CRM «Каменный Ручей»';
    }
  };

  const siderBg = isDark ? '#0b0f19' : '#ffffff';
  const siderBorder = isDark ? 'border-slate-800' : 'border-slate-200';
  const brandGradient = isDark 
    ? 'from-blue-400 via-sky-300 to-emerald-400' 
    : 'from-blue-600 via-indigo-600 to-emerald-600';

  const siderContent = (
    <div className={`flex flex-col h-full ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      {/* Brand Header */}
      <div className={`flex flex-col items-center justify-center py-4 px-3 m-3 rounded-2xl border shrink-0 ${
        isDark 
          ? 'bg-slate-900/80 border-slate-800 shadow-sm' 
          : 'bg-slate-50 border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className={`text-sm font-bold bg-gradient-to-r ${brandGradient} bg-clip-text text-transparent tracking-wide text-center uppercase`}>
            {collapsed ? 'ПОЛКИ' : 'КАМЕННЫЙ РУЧЕЙ'}
          </span>
        </div>
        {!collapsed && (
          <span className={`text-[10px] mt-1 tracking-wider uppercase font-semibold ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Мастерская камня · CRM
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-none bg-transparent font-medium"
        />
      </div>

      {!collapsed && (
        <div className={`p-3 m-3 mt-auto shrink-0 rounded-2xl border text-xs space-y-2.5 ${
          isDark 
            ? 'bg-slate-900/70 border-slate-800 text-slate-300' 
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div>
            <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Сайт мастерской:
            </div>
            <a 
              href="https://polkistone.ru/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-emerald-500 hover:text-emerald-400 flex items-center gap-1 font-semibold truncate"
            >
              <GlobalOutlined /> polkistone.ru
            </a>
          </div>

          <div className={`pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Витрины маркетплейсов:
            </div>
            <div className="flex flex-col gap-1 text-[11px]">
              {Object.entries(MARKETPLACE_LINKS).map(([key, item]) => (
                <a
                  key={key}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-between py-1 px-2 rounded-lg transition font-medium ${
                    isDark 
                      ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                  <span 
                    className="text-[9px] px-1.5 py-0.5 rounded font-bold text-white shrink-0 ml-1 shadow-sm" 
                    style={{ backgroundColor: item.color }}
                  >
                    магазин
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout className={`min-h-screen ${isDark ? 'bg-[#0b0f19]' : 'bg-[#f5f5f7]'}`}>
      {/* Desktop Sider */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        className={`hidden md:flex flex-col h-screen sticky top-0 border-r ${siderBorder} z-30`} 
        width={230}
        style={{ background: siderBg }}
      >
        {siderContent}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        styles={{ 
          body: { padding: 0, background: siderBg, height: '100%' },
          header: { display: 'none' } 
        }}
        width={270}
      >
        {siderContent}
      </Drawer>

      <Layout className={`w-full min-w-0 ${isDark ? 'bg-[#0b0f19]' : 'bg-[#f5f5f7]'}`}>
        <Header 
          className="flex items-center justify-between sticky top-0 z-20 px-3 sm:px-6 h-16 border-b transition-colors"
          style={{ 
            padding: '0 16px',
            backgroundColor: isDark ? 'rgba(11, 15, 25, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
            color: isDark ? '#f1f5f9' : '#1d1d1f',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Desktop collapse toggle */}
            <div
              className={`cursor-pointer text-lg hover:text-blue-500 transition-colors hidden md:flex items-center justify-center w-8 h-8 rounded-lg ${
                isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
              }`}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>

            {/* Mobile hamburger button */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
              className="text-base md:hidden p-1.5 h-auto rounded-lg"
            />

            <Title 
              level={4} 
              style={{ margin: 0 }}
              className="text-base sm:text-lg font-semibold tracking-tight truncate"
            >
              {getPageTitle(location.pathname)}
            </Title>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Apple-style Theme Switcher */}
            <Tooltip title={isDark ? 'Включить светлую тему' : 'Включить темную тему'}>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={`p-2 rounded-full border transition flex items-center justify-center cursor-pointer ${
                  isDark 
                    ? 'bg-slate-800/90 border-slate-700 text-amber-400 hover:bg-slate-700' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'
                }`}
              >
                {isDark ? <SunOutlined className="text-base" /> : <MoonOutlined className="text-base" />}
              </button>
            </Tooltip>

            {/* User Profile Selector (Apple Capsule Style) */}
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 border transition shadow-sm ${
              isDark 
                ? 'bg-slate-800/90 border-slate-700' 
                : 'bg-white border-slate-300'
            }`}>
              <Avatar 
                size={26} 
                icon={<UserOutlined />} 
                className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shrink-0 font-bold text-xs" 
              />
              <div className="text-left leading-tight hidden sm:block mr-0.5">
                <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Сотрудник
                </span>
              </div>
              <Select
                value={currentUser.id}
                onChange={handleUserChange}
                variant="borderless"
                className="w-36 sm:w-48 text-xs font-semibold"
                popupMatchSelectWidth={false}
                dropdownStyle={{
                  borderRadius: 14,
                  padding: 6,
                }}
              >
                {users.map(u => (
                  <Option key={u.id} value={u.id}>
                    <Space size="small" className="whitespace-nowrap">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</span>
                      <Tag color="blue" className="text-[10px] m-0 font-medium rounded-full px-2">
                        {u.roleTitle}
                      </Tag>
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>

            {/* External website link */}
            <a 
              href="https://polkistone.ru/" 
              target="_blank" 
              rel="noreferrer" 
              className={`text-xs font-semibold hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition ${
                isDark 
                  ? 'bg-slate-800/90 border-slate-700 text-emerald-400 hover:border-emerald-500' 
                  : 'bg-white border-slate-300 text-emerald-600 hover:border-emerald-500 shadow-sm'
              }`}
            >
              <GlobalOutlined /> polkistone.ru
            </a>
          </div>
        </Header>

        <Content className="p-3 sm:p-6 overflow-x-hidden min-h-[calc(100vh-64px)]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
