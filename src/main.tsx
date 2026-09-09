import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import './index.css'
import App from './App.tsx'
import { ThemeProvider, useTheme } from './context/ThemeContext'

const ThemedApp: React.FC = () => {
  const { isDark, designVariant } = useTheme();

  const getTokens = () => {
    switch (designVariant) {
      case 'v2': // Minimalist / Linear
        return {
          colorPrimary: '#5e6ad2',
          colorInfo: '#5e6ad2',
          colorSuccess: '#43a047',
          colorWarning: '#fb8c00',
          colorError: '#e53935',
          borderRadius: 4,
          fontFamily: "'Inter', system-ui, sans-serif",
          colorBgBase: isDark ? '#121212' : '#ffffff',
          colorBgContainer: isDark ? '#1a1a1a' : '#f9f9f9',
          colorBorder: isDark ? '#333333' : '#e0e0e0',
        };
      case 'v3': // Brutalist / Industrial
        return {
          colorPrimary: '#FF5722',
          colorInfo: '#FF5722',
          colorSuccess: '#4CAF50',
          colorWarning: '#FFC107',
          colorError: '#F44336',
          borderRadius: 0, // Sharp corners
          fontFamily: "'Space Grotesk', 'Courier New', monospace",
          colorBgBase: isDark ? '#000000' : '#ffffff',
          colorBgContainer: isDark ? '#111111' : '#f0f0f0',
          colorBorder: isDark ? '#444444' : '#000000',
          lineWidth: 2,
        };
      case 'v4': // Glassmorphism / Premium
        return {
          colorPrimary: '#d4af37', // Gold
          colorInfo: '#d4af37',
          colorSuccess: '#34c759',
          colorWarning: '#ff9f0a',
          colorError: '#ff3b30',
          borderRadius: 24, // Extra rounded
          fontFamily: "'SF Pro Display', 'Helvetica Neue', sans-serif",
          colorBgBase: isDark ? '#000000' : '#f0f4f8',
          colorBgContainer: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.6)',
          colorBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        };
      case 'v1':
      default: // Apple-style
        return {
          colorPrimary: '#0071e3', // Apple Accent Blue
          colorInfo: '#0071e3',
          colorSuccess: '#34c759', // Apple Green
          colorWarning: '#ff9f0a', // Apple Amber
          colorError: '#ff3b30',   // Apple Red
          borderRadius: 12,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif",
          colorBgBase: isDark ? '#0f172a' : '#ffffff',
          colorBgContainer: isDark ? '#1e293b' : '#ffffff',
        };
    }
  };

  const getComponents = () => {
    switch (designVariant) {
      case 'v2':
        return {
          Card: { borderRadiusLG: 6 },
          Button: { borderRadius: 4, controlHeight: 36, fontWeight: 500 },
          Modal: { borderRadiusLG: 8 },
          Table: { borderRadiusLG: 6 },
          Input: { borderRadius: 4, controlHeight: 36 },
          Select: { borderRadius: 4, controlHeight: 36 },
        };
      case 'v3':
        return {
          Card: { borderRadiusLG: 0 },
          Button: { borderRadius: 0, controlHeight: 44, fontWeight: 800 },
          Modal: { borderRadiusLG: 0 },
          Table: { borderRadiusLG: 0 },
          Input: { borderRadius: 0, controlHeight: 44 },
          Select: { borderRadius: 0, controlHeight: 44 },
        };
      case 'v4':
        return {
          Card: { borderRadiusLG: 24 },
          Button: { borderRadius: 16, controlHeight: 42, fontWeight: 600 },
          Modal: { borderRadiusLG: 32 },
          Table: { borderRadiusLG: 24 },
          Input: { borderRadius: 16, controlHeight: 42 },
          Select: { borderRadius: 16, controlHeight: 42 },
        };
      case 'v1':
      default:
        return {
          Card: { borderRadiusLG: 16 },
          Button: { borderRadius: 10, controlHeight: 38, fontWeight: 500 },
          Modal: { borderRadiusLG: 20 },
          Table: { borderRadiusLG: 16 },
          Input: { borderRadius: 10, controlHeight: 38 },
          Select: { borderRadius: 10, controlHeight: 38 },
        };
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: getTokens(),
        components: getComponents(),
      }}
    >
      <App />
    </ConfigProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
)
