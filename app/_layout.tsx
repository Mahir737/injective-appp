import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { WalletProvider } from '@/context/WalletContext';
import { PointsProvider } from '@/context/PointsContext';
import { SettingsProvider } from '@/context/SettingsContext';
import IntroAnimation from '@/components/IntroAnimation';
import AsyncStorage from '@/utils/storage';

export default function RootLayout() {
  useFrameworkReady();
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        setShowIntro(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        setShowIntro(false);
      }
    } catch {
      setShowIntro(false);
    }
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (showIntro === null) {
    return null;
  }

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <SettingsProvider>
      <WalletProvider>
        <PointsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="light" />
        </PointsProvider>
      </WalletProvider>
    </SettingsProvider>
  );
}
