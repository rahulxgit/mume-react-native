// src/theme/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
}

const lightColors = {
  primary: '#FF7A00',
  background: '#FFFFFF',
  card: '#F8F9FA',
  text: '#000000',
  border: '#E1E1E1',
  notification: '#FF3B30',
};

const darkColors = {
  primary: '#FF7A00',
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  border: '#2A2A2A',
  notification: '#FF453A',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('system');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme as ThemeType);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const handleSetTheme = async (newTheme: ThemeType) => {
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const getColors = () => {
    if (theme === 'system') {
      return systemScheme === 'dark' ? darkColors : lightColors;
    }
    return theme === 'dark' ? darkColors : lightColors;
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, colors: getColors() }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};