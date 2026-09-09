import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';
export type DesignVariant = 'v1' | 'v2' | 'v3' | 'v4';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
  designVariant: DesignVariant;
  setDesignVariant: (v: DesignVariant) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: true,
  designVariant: 'v1',
  setDesignVariant: () => {},
});

const THEME_STORAGE_KEY = 'polki_crm_theme_mode';
const VARIANT_STORAGE_KEY = 'polki_crm_design_variant';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  const [designVariant, setDesignVariantState] = useState<DesignVariant>(() => {
    const saved = localStorage.getItem(VARIANT_STORAGE_KEY) as DesignVariant;
    return ['v1', 'v2', 'v3', 'v4'].includes(saved) ? saved : 'v1';
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(VARIANT_STORAGE_KEY, designVariant);
    const root = document.documentElement;
    root.classList.remove('theme-v1', 'theme-v2', 'theme-v3', 'theme-v4');
    root.classList.add(`theme-${designVariant}`);
  }, [designVariant]);

  const toggleTheme = () => {
    setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const setDesignVariant = (newVariant: DesignVariant) => {
    setDesignVariantState(newVariant);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme, isDark: mode === 'dark', designVariant, setDesignVariant }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
