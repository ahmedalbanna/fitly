import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useUIStore } from '../../store/useUIStore';
import { useTranslation } from '../../store/useLanguageStore';
import { useRTL } from '../../hooks/useRTL';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';

export default function TrialExpiredBanner() {
  const { setShowTrialExpiredBanner } = useUIStore();
  const { t } = useTranslation();
  const { rtlRow } = useRTL();

  return (
    <View style={styles.banner}>
      <View style={[styles.content, rtlRow]}>
        <Text style={styles.icon}>⏱</Text>
        <Text style={styles.text}>{t('trialExpired.message')}</Text>
      </View>
      <View style={[styles.actions, rtlRow]}>
        <TouchableOpacity
          style={styles.subscribeBtn}
          onPress={() => { setShowTrialExpiredBanner(false); router.push('/(app)/subscriptions'); }}
        >
          <Text style={styles.subscribeBtnText}>{t('trialExpired.subscribe')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowTrialExpiredBanner(false)} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    zIndex: 100,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 6 },
  icon: { fontSize: 18 },
  text: { flex: 1, fontSize: FontSizes.sm, color: '#fff', fontWeight: '600', lineHeight: 18 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: Spacing.sm },
  subscribeBtn: {
    backgroundColor: '#fff', paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  subscribeBtnText: { color: Colors.warning, fontWeight: '800', fontSize: FontSizes.sm },
  dismissBtn: { padding: 4 },
  dismissText: { color: '#fff', fontSize: FontSizes.md, fontWeight: '700' },
});
