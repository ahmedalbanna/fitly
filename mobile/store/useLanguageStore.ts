import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import I18n, { SupportedLocale } from '../i18n';

interface LanguageStore {
  locale: SupportedLocale;
  isRTL: boolean;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  loadSavedLocale: () => Promise<void>;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  locale: 'en',
  isRTL: false,

  t: (key, options) => I18n.t(key, options),

  setLocale: async (locale) => {
    const isRTL = locale === 'ar';
    I18n.locale = locale;

    await AsyncStorage.setItem('fitly_locale', locale);

    // Apply RTL layout direction (full flip needs app restart, text direction is immediate)
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
    }

    set({ locale, isRTL });
  },

  loadSavedLocale: async () => {
    try {
      const saved = (await AsyncStorage.getItem('fitly_locale')) as SupportedLocale | null;
      if (saved && ['en', 'ar'].includes(saved)) {
        I18n.locale = saved;
        const isRTL = saved === 'ar';
        I18nManager.forceRTL(isRTL);
        set({ locale: saved, isRTL });
      } else {
        const deviceIsRTL = I18nManager.isRTL;
        set({ locale: I18n.locale as SupportedLocale, isRTL: deviceIsRTL });
      }
    } catch {
      // ignore
    }
  },
}));

/** Convenience hook: returns translate function + isRTL + locale */
export function useTranslation() {
  const { t, isRTL, locale } = useLanguageStore();
  return { t, isRTL, locale };
}
