import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import CoachMarks from '../../components/overlays/CoachMarks';
import { useTranslation } from '../../store/useLanguageStore';
import { useRTL } from '../../hooks/useRTL';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';

export default function EntryScreen() {
  const setGuest = useAuthStore((s) => s.setGuest);
  const showCoachMarks = useUIStore((s) => s.showCoachMarks);
  const { t } = useTranslation();
  const { rtlText, centerText } = useRTL();
  const handleGuest = () => {
    setGuest();
    router.replace('/(app)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      {showCoachMarks && <CoachMarks />}

      <View style={styles.hero}>
        <Text style={styles.logo}>{t('app.name')}</Text>
        <Text style={styles.logoAr}>{t('app.nameAr')}</Text>
        <Text style={[styles.subtitle, centerText]}>{t('entry.subtitle')}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>{t('entry.loginSignup')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleGuest}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>{t('entry.startAsGuest')}</Text>
        </TouchableOpacity>

        <Text style={[styles.hint, centerText]}>{t('entry.guestHint')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xxl,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 56,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 6,
  },
  logoAr: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primaryDark,
    marginTop: 4,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: Spacing.md,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
