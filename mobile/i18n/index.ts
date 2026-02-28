import I18n from 'i18n-js';
import { getLocales } from 'expo-localization';
import en from './translations/en';
import ar from './translations/ar';

// Register translations
I18n.translations = { en, ar };

// Default to device locale, fallback to English
const deviceLocale = getLocales()[0]?.languageCode ?? 'en';
I18n.locale = ['ar', 'en'].includes(deviceLocale) ? deviceLocale : 'en';
I18n.fallbacks = true;
I18n.defaultLocale = 'en';

export default I18n;

export type SupportedLocale = 'en' | 'ar';
