import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, Badge, Tag, Avatar, message } from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  AppstoreOutlined,
  MessageOutlined,
  MenuOutlined,
  TeamOutlined,
  GoldOutlined,
  CarOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined,
  RightOutlined,
  DollarOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { dataStore } from '../api/dataStore';
import { useTheme } from '../context/ThemeContext';
import ConnectionStatusBar from './ConnectionStatusBar';

interface MobileBottomNavProps {
  unreadChatsCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ unreadChatsCount = 0 }) => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const currentUser = dataStore.getCurrentUser();
  const users = dataStore.getUsers();

  const handleUserChange = (userId: string) => {
    const selected = users.find(u => u.id === userId);
    if (selected) {
      dataStore.setCurrentUser(selected);
      message.success(`Вы переключились на профиль: ${selected.name}`);
      setDrawerOpen(false);
    }
  };

  const navItems = [
    {
      key: '/',
      label: 'Дашборд',
      icon: <DashboardOutlined className="text-lg" />,
      path: '/',
    },
    {
      key: '/orders',
      label: 'Заказы',
      icon: <BookOutlined className="text-lg" />,
      path: '/orders',
    },
    {
      key: '/kanban',
      label: 'Цех',
      icon: <AppstoreOutlined className="text-lg" />,
      path: '/kanban',
    },
    {
      key: '/messages',
      label: 'Чаты',
      icon: (
        <Badge count={unreadChatsCount} size="small" offset={[4, -2]}>
          <MessageOutlined className="text-lg" />
        </Badge>
      ),
      path: '/messages',
    },
  ];

  const isMoreActive = ['/customers', '/warehouse', '/tracking', '/salaries'].includes(location.pathname);

  return (
    <>
      {/* Native App Floating Bottom Navigation Bar */}
      <nav 
        aria-label="Мобильная навигация"
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden border-t backdrop-blur-2xl transition-all ${
          isDark 
            ? 'bg-slate-950/92 border-slate-800/90 text-slate-400' 
            : 'bg-white/92 border-slate-200/90 text-slate-500 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
        }`}
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
        }}
      >
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all rounded-xl select-none active:scale-95 ${
                  active 
                    ? isDark 
                      ? 'text-sky-400 font-bold' 
                      : 'text-blue-600 font-bold' 
                    : 'hover:text-slate-700 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <div className={`transition-transform duration-150 ${active ? 'scale-110 -translate-y-0.5' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 leading-tight">
                  {item.label}
                </span>
                {active && (
                  <span className={`w-1 h-1 rounded-full mt-0.5 ${isDark ? 'bg-sky-400' : 'bg-blue-600'}`} />
                )}
              </Link>
            );
          })}

          {/* More Tab */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all rounded-xl select-none cursor-pointer active:scale-95 ${
              isMoreActive 
                ? isDark 
                  ? 'text-sky-400 font-bold' 
                  : 'text-blue-600 font-bold' 
                : 'hover:text-slate-700 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <div className={`transition-transform duration-150 ${isMoreActive ? 'scale-110 -translate-y-0.5' : ''}`}>
              <MenuOutlined className="text-lg" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-tight">
              Еще
            </span>
            {isMoreActive && (
              <span className={`w-1 h-1 rounded-full mt-0.5 ${isDark ? 'bg-sky-400' : 'bg-blue-600'}`} />
            )}
          </button>
        </div>
      </nav>

      {/* "Еще" Native Mobile Action Sheet / Drawer */}
      <Drawer
        placement="bottom"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        height="auto"
        styles={{
          body: {
            padding: '16px 20px 32px 20px',
            backgroundColor: isDark ? '#090d16' : '#f8fafc',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
          },
          header: { display: 'none' }
        }}
        className="rounded-t-3xl overflow-hidden"
      >
        {/* Handle pill */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />

        <div className="space-y-4">
          {/* Header in Sheet */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Дополнительные разделы
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                CRM «Каменный Ручей»
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition ${
                isDark 
                  ? 'bg-slate-900 border-slate-700 text-amber-400' 
                  : 'bg-white border-slate-200 text-slate-700 shadow-xs'
              }`}
            >
              {isDark ? <SunOutlined /> : <MoonOutlined />}
              <span>{isDark ? 'Светлая' : 'Темная'}</span>
            </button>
          </div>

          {/* Navigation Links List */}
          <div className={`rounded-2xl border divide-y overflow-hidden shadow-xs ${
            isDark 
              ? 'bg-slate-900/80 border-slate-800 divide-slate-800/80' 
              : 'bg-white border-slate-200 divide-slate-100'
          }`}>
            <Link
              to="/customers"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-3.5 text-slate-800 dark:text-slate-100 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition font-medium"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
                  <TeamOutlined />
                </div>
                <div>
                  <div className="text-sm font-semibold">База клиентов и LTV</div>
                  <div className="text-[11px] text-slate-400">История повторных заказов, адреса, телефоны</div>
                </div>
              </div>
              <RightOutlined className="text-xs text-slate-400" />
            </Link>

            <Link
              to="/warehouse"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-3.5 text-slate-800 dark:text-slate-100 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition font-medium"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
                  <GoldOutlined />
                </div>
                <div>
                  <div className="text-sm font-semibold">Склад камня и слэбов</div>
                  <div className="text-[11px] text-slate-400">Остатки мрамора, гранита, обрезков и брони</div>
                </div>
              </div>
              <RightOutlined className="text-xs text-slate-400" />
            </Link>

            <Link
              to="/salaries"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-3.5 text-slate-800 dark:text-slate-100 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition font-medium"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
                  <DollarOutlined />
                </div>
                <div>
                  <div className="text-sm font-semibold">Зарплаты мастеров</div>
                  <div className="text-[11px] text-slate-400">Сдельная оплата, серийные полки и ведомости</div>
                </div>
              </div>
              <RightOutlined className="text-xs text-slate-400" />
            </Link>

            <Link
              to="/tracking"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-3.5 text-slate-800 dark:text-slate-100 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition font-medium"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-lg">
                  <CarOutlined />
                </div>
                <div>
                  <div className="text-sm font-semibold">Доставка СДЭК</div>
                  <div className="text-[11px] text-slate-400">Трек-номера, статусы посылок в пути</div>
                </div>
              </div>
              <RightOutlined className="text-xs text-slate-400" />
            </Link>

            <Link
              to="/fbo"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-3.5 text-slate-800 dark:text-slate-100 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition font-medium"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
                  <RocketOutlined />
                </div>
                <div>
                  <div className="text-sm font-semibold">Формирование FBO</div>
                  <div className="text-[11px] text-slate-400">Рекомендации поставок, таймслоты WB/Ozon</div>
                </div>
              </div>
              <RightOutlined className="text-xs text-slate-400" />
            </Link>
          </div>

          {/* User profile selection */}
          <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Текущий сотрудник</span>
              <Tag color="blue" className="text-[10px] m-0 rounded-full px-2">
                {currentUser.roleTitle}
              </Tag>
            </div>

            <div className="space-y-1.5">
              {users.map(u => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleUserChange(u.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar 
                        size={26} 
                        icon={<UserOutlined />} 
                        className={isSelected ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'} 
                      />
                      <span className="text-xs font-semibold">{u.name}</span>
                    </div>
                    <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {u.roleTitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Health Monitor in Mobile Sheet */}
          <div className="pt-1">
            <ConnectionStatusBar mode="banner" />
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default MobileBottomNav;
