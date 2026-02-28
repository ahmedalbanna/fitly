import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { useLanguageStore, useTranslation } from '../../store/useLanguageStore';
import { useRTL } from '../../hooks/useRTL';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';

export default function SettingsScreen() {
  const { user, userState, logout, deleteAccount } = useAuthStore();
  const { setShowCoachMarks } = useUIStore();
  const { locale, setLocale } = useLanguageStore();
  const { t } = useTranslation();
  const { rtlRow, rtlText } = useRTL();
  const isGuest = userState === 'GUEST';

  const handleLogout = () => {
    Alert.alert(t('settings.logoutTitle'), t('settings.logoutMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.logout'), style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/entry'); } },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccountTitle'),
      t('settings.deleteAccountMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteAccount'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              router.replace('/(auth)/entry');
            } catch {
              Alert.alert(t('common.error'), t('settings.deleteAccountError'));
            }
          },
        },
      ]
    );
  };

  const MenuItem = ({ icon, label, onPress, destructive = false, right }: any) => (
    <TouchableOpacity style={[styles.menuItem, rtlRow]} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, rtlText, destructive && styles.menuLabelDestructive]}>{label}</Text>
      {right || <Text style={styles.menuArrow}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, rtlRow]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Account Info */}
        {!isGuest && user && (
          <View style={[styles.accountCard, rtlRow]}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{user.email[0].toUpperCase()}</Text>
            </View>
            <View>
              <Text style={[styles.accountEmail, rtlText]}>{user.email}</Text>
              <Text style={[styles.accountStatus, rtlText]}>{userState.replace('_', ' ')}</Text>
            </View>
          </View>
        )}
        {isGuest && (
          <View style={[styles.guestBanner, rtlRow]}>
            <Text style={[styles.guestBannerText, rtlText]}>{t('settings.guestMode')}</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/entry')}>
              <Text style={styles.guestBannerCta}>{t('settings.loginSignup')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Language Toggle */}
        <Text style={[styles.sectionLabel, rtlText]}>{t('settings.language')}</Text>
        <View style={[styles.section, styles.langRow]}>
          <TouchableOpacity
            style={[styles.langBtn, locale === 'en' && styles.langBtnActive]}
            onPress={() => setLocale('en')}
          >
            <Text style={[styles.langBtnText, locale === 'en' && styles.langBtnTextActive]}>🇬🇧 English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, locale === 'ar' && styles.langBtnActive]}
            onPress={() => setLocale('ar')}
          >
            <Text style={[styles.langBtnText, locale === 'ar' && styles.langBtnTextActive]}>🇸🇦 العربية</Text>
          </TouchableOpacity>
        </View>

        {/* General */}
        <Text style={[styles.sectionLabel, rtlText]}>{t('settings.general')}</Text>
        <View style={styles.section}>
          <MenuItem icon="🏠" label={t('settings.home')} onPress={() => router.push('/(app)/home')} />
          <MenuItem icon="👤" label={t('settings.myAccount')} onPress={() => isGuest ? router.replace('/(auth)/entry') : router.push('/(app)/measurements')} />
          <MenuItem icon="💳" label={t('settings.subscriptions')} onPress={() => router.push('/(app)/subscriptions')} />
        </View>

        {/* App */}
        <Text style={[styles.sectionLabel, rtlText]}>{t('settings.app')}</Text>
        <View style={styles.section}>
          <MenuItem
            icon="🎯"
            label={t('settings.showTutorial')}
            onPress={() => { setShowCoachMarks(true); router.back(); }}
          />
        </View>

        {/* Info */}
        <Text style={[styles.sectionLabel, rtlText]}>{t('settings.info')}</Text>
        <View style={styles.section}>
          <MenuItem icon="📋" label={t('settings.privacyPolicy')} onPress={() => Alert.alert(t('settings.privacyPolicy'), t('settings.privacyPolicyMsg'))} />
          <MenuItem icon="ℹ️" label={t('settings.about')} onPress={() => Alert.alert(t('settings.about'), t('settings.aboutMsg'))} />
          <MenuItem icon="💬" label={t('settings.contactUs')} onPress={() => Alert.alert(t('settings.contactUs'), t('settings.contactMsg'))} />
        </View>

        {/* Account Actions */}
        {!isGuest && (
          <>
            <Text style={[styles.sectionLabel, rtlText]}>{t('settings.account')}</Text>
            <View style={styles.section}>
              <MenuItem icon="🚪" label={t('settings.logout')} onPress={handleLogout} />
              <MenuItem icon="🗑️" label={t('settings.deleteAccount')} onPress={handleDeleteAccount} destructive />
            </View>
          </>
        )}

        <Text style={styles.version}>{t('settings.version')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg },
  back: { color: Colors.primary, fontSize: FontSizes.md },
  title: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  accountCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg,
  },
  avatarCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: FontSizes.xl, fontWeight: '700' },
  accountEmail: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary },
  accountStatus: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  guestBanner: {
    backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.lg, padding: Spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg,
  },
  guestBannerText: { fontSize: FontSizes.md, color: Colors.textPrimary, fontWeight: '600' },
  guestBannerCta: { color: Colors.primary, fontWeight: '700', fontSize: FontSizes.md },
  sectionLabel: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textMuted, marginBottom: Spacing.sm, marginTop: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.8 },
  section: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { fontSize: 20, marginRight: Spacing.md },
  menuLabel: { flex: 1, fontSize: FontSizes.md, color: Colors.textPrimary },
  menuLabelDestructive: { color: Colors.error },
  menuArrow: { fontSize: FontSizes.lg, color: Colors.textMuted },
  version: { textAlign: 'center', color: Colors.textMuted, fontSize: FontSizes.sm, marginTop: Spacing.xl },
  langRow: { flexDirection: 'row', borderWidth: 0, padding: 0, overflow: 'hidden', marginBottom: Spacing.sm },
  langBtn: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md, margin: 4,
  },
  langBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  langBtnText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textSecondary },
  langBtnTextActive: { color: '#fff' },
});
