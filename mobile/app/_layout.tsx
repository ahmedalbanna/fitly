import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nManager } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useLanguageStore } from '../store/useLanguageStore';

export default function RootLayout() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  const checkFirstLaunch = useUIStore((s) => s.checkFirstLaunch);
  const loadSavedLocale = useLanguageStore((s) => s.loadSavedLocale);
  const isRTL = useLanguageStore((s) => s.isRTL);

  useEffect(() => {
    loadFromStorage();
    checkFirstLaunch();
    loadSavedLocale();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          // Apply RTL direction to all screens
          contentStyle: { direction: isRTL ? 'rtl' : 'ltr' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </SafeAreaProvider>
  );
}
