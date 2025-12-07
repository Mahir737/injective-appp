import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@/utils/storage';

interface SettingsContextType {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
  biometrics: boolean;
  setBiometrics: (enabled: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
  glassIntensity: 'low' | 'medium' | 'high';
  setGlassIntensity: (intensity: 'low' | 'medium' | 'high') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [notifications, setNotificationsState] = useState(true);
  const [biometrics, setBiometricsState] = useState(false);
  const [language, setLanguageState] = useState('en');
  const [glassIntensity, setGlassIntensityState] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const savedBiometrics = await AsyncStorage.getItem('biometrics');
      const savedLanguage = await AsyncStorage.getItem('language');
      const savedGlassIntensity = await AsyncStorage.getItem('glassIntensity');

      if (savedTheme) setThemeState(savedTheme as 'dark' | 'light');
      if (savedNotifications) setNotificationsState(savedNotifications === 'true');
      if (savedBiometrics) setBiometricsState(savedBiometrics === 'true');
      if (savedLanguage) setLanguageState(savedLanguage);
      if (savedGlassIntensity) setGlassIntensityState(savedGlassIntensity as 'low' | 'medium' | 'high');
    } catch (error) {
      console.log('Error loading settings');
    }
  };

  const setTheme = async (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  const setNotifications = async (enabled: boolean) => {
    setNotificationsState(enabled);
    await AsyncStorage.setItem('notifications', enabled.toString());
  };

  const setBiometrics = async (enabled: boolean) => {
    setBiometricsState(enabled);
    await AsyncStorage.setItem('biometrics', enabled.toString());
  };

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('language', lang);
  };

  const setGlassIntensity = async (intensity: 'low' | 'medium' | 'high') => {
    setGlassIntensityState(intensity);
    await AsyncStorage.setItem('glassIntensity', intensity);
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        notifications,
        setNotifications,
        biometrics,
        setBiometrics,
        language,
        setLanguage,
        glassIntensity,
        setGlassIntensity,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
