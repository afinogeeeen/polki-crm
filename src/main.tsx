import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import './index.css'
import App from './App.tsx'
import { ThemeProvider, useTheme } from './context/ThemeContext'

const ThemedApp: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0071e3', // Apple Accent Blue
          colorInfo: '#0071e3',
          colorSuccess: '#34c759', // Apple Green
          colorWarning: '#ff9f0a', // Apple Amber
          colorError: '#ff3b30',   // Apple Red
          borderRadius: 12,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif",
          colorBgBase: isDark ? '#0f172a' : '#ffffff',
          colorBgContainer: isDark ? '#1e293b' : '#ffffff',
        },
        components: {
          Card: {
            borderRadiusLG: 16,
          },
          Button: {
            borderRadius: 10,
            controlHeight: 38,
            fontWeight: 500,
          },
          Modal: {
            borderRadiusLG: 20,
          },
          Table: {
            borderRadiusLG: 16,
          },
          Input: {
            borderRadius: 10,
            controlHeight: 38,
          },
          Select: {
            borderRadius: 10,
            controlHeight: 38,
          }
        }
      }}
    >
      <App />
    </ConfigProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
