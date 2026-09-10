import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Select, Tag, Avatar, Space, message, Tooltip } from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  CarOutlined,
  MessageOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined,
  AppstoreOutlined,
  GoldOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import Orders from './pages/Orders';
import Tracking from './pages/Tracking';
import Messages from './pages/Messages';
import Dashboard from './pages/Dashboard';
import Kanban from './pages/Kanban';
import Warehouse from './pages/Warehouse';
import Customers from './pages/Customers';
import Salaries from './pages/Salaries';
import FboSupplies from './pages/FboSupplies';
import ConnectionStatusBar from './components/ConnectionStatusBar';
import MobileBottomNav from './components/MobileBottomNav';
import { dataStore, subscribeDataStore } from './api/dataStore';
import type { UserProfile } from './types';
import { useTheme } from './context/ThemeContext';
import { DollarOutlined, RocketOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const users = dataStore.getUsers();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();

  // Sync user and unread messages across tabs and stores
  useEffect(() => {
    const refreshState = () => {
      setCurrentUser(dataStore.getCurrentUser());
      const chats = dataStore.getChats();
      const count = chats.reduce((sum, c) => sum + (c.unread_count || 0), 0);
      setUnreadCount(count);
    };

    refreshState();
    const unsubscribe = subscribeDataStore(refreshState);
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
      type: 'group' as const,
      label: <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">Обзор</span>,
      children: [
        {
          key: '/',
          icon: <DashboardOutlined className="text-base" />,
          label: <Link to="/">Дашборд</Link>,
        },
      ],
    },
    {
      type: 'group' as const,
      label: <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">Цех и Заказы</span>,
      children: [
        {
          key: '/kanban',
          icon: <AppstoreOutlined className="text-base" />,
          label: <Link to="/kanban">Канбан (Цех)</Link>,
        },
        {
          key: '/orders',
          icon: <BookOutlined className="text-base" />,
          label: <Link to="/orders">Реестр заказов</Link>,
        },
        {
          key: '/customers',
          icon: <TeamOutlined className="text-base" />,
          label: <Link to="/customers">Клиенты и LTV</Link>,
        },
        {
          key: '/warehouse',
          icon: <GoldOutlined className="text-base" />,
          label: <Link to="/warehouse">Склад камня</Link>,
        },
        {
          key: '/salaries',
          icon: <DollarOutlined className="text-base text-emerald-500" />,
          label: <Link to="/salaries">Зарплаты мастеров</Link>,
        },
      ],
    },
    {
      type: 'group' as const,
      label: <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">Логистика</span>,
      children: [
        {
          key: '/tracking',
          icon: <CarOutlined className="text-base" />,
          label: <Link to="/tracking">Доставка СДЭК</Link>,
        },
        {
          key: '/fbo',
          icon: <RocketOutlined className="text-base text-blue-500" />,
          label: <Link to="/fbo">Формирование FBO</Link>,
        },
        {
          key: '/messages',
          icon: <MessageOutlined className="text-base" />,
          label: <Link to="/messages">Маркетплейсы</Link>,
        },
      ],
    },
  ];

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return 'Аналитика и дашборд';
      case '/kanban': return 'Канбан-доска производства';
      case '/orders': return 'Реестр заказов полок';
      case '/customers': return 'База клиентов и LTV';
      case '/warehouse': return 'Склад камня и слэбов';
      case '/salaries': return 'Учет выработки и зарплат мастеров';
      case '/tracking': return 'Отслеживание доставок СДЭК';
      case '/fbo': return 'Формирование FBO / FBW поставок';
      case '/messages': return 'Единое окно маркетплейсов';
      default: return 'CRM «Каменный Ручей»';
    }
  };


  const siderBg = isDark ? '#0b0f19' : '#ffffff';
  const siderBorder = isDark ? 'border-slate-800' : 'border-slate-200';

  const siderContent = (
    <div className={`flex flex-col h-full ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      {/* Brand Header */}
      <div className={`flex flex-col items-center justify-center py-4 px-3 m-3 rounded-2xl border shrink-0 ${
        isDark 
          ? 'bg-slate-900/80 border-slate-800 shadow-sm' 
          : 'bg-slate-50 border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex items-center justify-center gap-2">
          <img 
            src="/polki-crm/logo.png" 
            alt="Logo" 
            className={`transition-all duration-300 object-contain ${collapsed ? 'h-7' : 'h-11'}`} 
          />
        </div>
        {!collapsed && (
          <span className={`text-[10px] mt-2 tracking-wider uppercase font-semibold text-center ${
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
    </div>
  );

  return (
    <Layout className={`min-h-screen ${isDark ? 'bg-[#0b0f19]' : 'bg-[#f5f5f7]'}`}>
      {/* Desktop Sider (Hidden on Mobile, replaced by Bottom Navigation Bar) */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        className={`hidden md:flex flex-col border-r ${siderBorder} z-30 sticky top-0 h-screen`} 
        width={230}
        style={{ background: siderBg }}
      >
        {siderContent}
      </Sider>

      <Layout className={`w-full min-w-0 ${isDark ? 'bg-[#0b0f19]' : 'bg-[#f5f5f7]'}`}>
        {/* App Header (Clean native-feel header with iOS notch safe area) */}
        <Header 
          className="flex items-center justify-between sticky top-0 z-30 px-3 sm:px-6 border-b transition-colors pt-[env(safe-area-inset-top)]"
          style={{ 
            height: 'calc(3.75rem + env(safe-area-inset-top, 0px))',
            padding: '0 16px',
            backgroundColor: isDark ? 'rgba(11, 15, 25, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
            color: isDark ? '#f1f5f9' : '#1d1d1f',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Desktop collapse toggle */}
            <div
              className={`cursor-pointer text-lg hover:text-blue-500 transition-colors hidden md:flex items-center justify-center w-8 h-8 rounded-lg ${
                isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
              }`}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>

            {/* Mobile App Brand Logo */}
            <img 
              src="/polki-crm/logo.png" 
              alt="Logo" 
              className="h-7 w-auto object-contain md:hidden shrink-0" 
            />

            <Title 
              level={4} 
              style={{ margin: 0 }}
              className="text-sm sm:text-lg font-bold tracking-tight truncate"
            >
              {getPageTitle(location.pathname)}
            </Title>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* API Connection Health Monitor Popover */}
            <ConnectionStatusBar mode="header" />

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

            {/* Desktop User Profile Selector */}
            <div className={`items-center gap-2 rounded-full px-3 py-1 border transition shadow-sm hidden md:flex ${
              isDark 
                ? 'bg-slate-800/90 border-slate-700' 
                : 'bg-white border-slate-300'
            }`}>
              <Avatar 
                size={26} 
                icon={<UserOutlined />} 
                className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shrink-0 font-bold text-xs" 
              />
              <div className="text-left leading-tight hidden lg:block mr-0.5">
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
                className="w-24 lg:w-36 text-xs font-semibold"
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
          </div>
        </Header>

        {/* Content Area with Mobile Bottom Nav Clearance */}
        <Content className="p-3 sm:p-6 overflow-x-hidden min-h-[calc(100vh-64px)] pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/warehouse" element={<Warehouse />} />
            <Route path="/salaries" element={<Salaries />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/fbo" element={<FboSupplies />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </Content>
      </Layout>

      {/* Native Mobile Bottom Navigation Bar (Tab Bar) with Sheet */}
      <MobileBottomNav unreadChatsCount={unreadCount} />
    </Layout>
  );
};

export default App;
