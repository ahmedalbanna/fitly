import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { router } from 'expo-router';
import { useUIStore } from '../../store/useUIStore';
import { useTranslation } from '../../store/useLanguageStore';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';

export default function GuestPaywallModal() {
  const { setShowGuestPaywall } = useUIStore();
  const { t } = useTranslation();

  const handleRegister = () => {
    setShowGuestPaywall(false);
    router.push('/(auth)/signup');
  };

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.title}>{t('guestPaywall.title')}</Text>
          <Text style={styles.subtitle}>{t('guestPaywall.subtitle')}</Text>

          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.85}>
            <Text style={styles.registerBtnText}>{t('guestPaywall.registerNow')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => { setShowGuestPaywall(false); router.push('/(auth)/login'); }}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>{t('guestPaywall.haveAccount')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowGuestPaywall(false)}>
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', padding: Spacing.lg },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.xl, alignItems: 'center',
  },
  icon: { fontSize: 52, marginBottom: Spacing.md },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  registerBtn: {
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: BorderRadius.lg,
    alignItems: 'center', alignSelf: 'stretch', marginBottom: Spacing.sm,
  },
  registerBtnText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: '700' },
  loginBtn: {
    borderWidth: 1.5, borderColor: Colors.primary, paddingVertical: 14, borderRadius: BorderRadius.lg,
    alignItems: 'center', alignSelf: 'stretch', marginBottom: Spacing.sm,
  },
  loginBtnText: { color: Colors.primary, fontSize: FontSizes.md, fontWeight: '600' },
  cancelBtn: { paddingVertical: Spacing.sm },
  cancelText: { color: Colors.textMuted, fontSize: FontSizes.md },
});
