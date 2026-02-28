import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from '../../store/useLanguageStore';
import { useRTL } from '../../hooks/useRTL';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';

export default function SubscriptionsScreen() {
  const { userState, trialExpiresAt, subscriptionEndDate, subscribe, restorePurchase } = useAuthStore();
  const [loading, setLoading] = useState<'MONTHLY' | 'ANNUAL' | 'RESTORE' | null>(null);
  const { t } = useTranslation();
  const { rtlRow, rtlText } = useRTL();

  const handleSubscribe = async (type: 'MONTHLY' | 'ANNUAL') => {
    setLoading(type);
    try {
      await subscribe(type);
      Alert.alert(t('subscriptions.subscribedTitle'), t('subscriptions.subscribedMsg', { type: type.toLowerCase() }), [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert(t('common.error'), t('subscriptions.errorGeneric'));
    } finally {
      setLoading(null);
    }
  };

  const handleRestore = async () => {
    setLoading('RESTORE');
    try {
      await restorePurchase();
      Alert.alert(t('subscriptions.restore'), t('subscriptions.restoreMsg'));
    } catch {
      Alert.alert(t('common.error'), t('subscriptions.errorGeneric'));
    } finally {
      setLoading(null);
    }
  };

  const isSubscriber = userState === 'SUBSCRIBER';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, rtlRow]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('subscriptions.title')}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, isSubscriber ? styles.statusActive : styles.statusInactive, rtlRow]}>
          <Text style={styles.statusIcon}>{isSubscriber ? '✅' : '🔒'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusTitle, rtlText]}>
              {isSubscriber ? t('subscriptions.activeSubscription') : userState === 'TRIAL_ACTIVE' ? t('subscriptions.trialActive') : t('subscriptions.noPlan')}
            </Text>
            {subscriptionEndDate && (
              <Text style={[styles.statusSub, rtlText]}>{t('subscriptions.renews')} {new Date(subscriptionEndDate).toLocaleDateString()}</Text>
            )}
            {trialExpiresAt && userState === 'TRIAL_ACTIVE' && (
              <Text style={[styles.statusSub, rtlText]}>{t('subscriptions.trialExpires')} {new Date(trialExpiresAt).toLocaleString()}</Text>
            )}
          </View>
        </View>

        {/* Features List */}
        <View style={styles.featuresBox}>
          <Text style={[styles.featuresTitle, rtlText]}>{t('subscriptions.whatsIncluded')}</Text>
          {(t('subscriptions.features') as unknown as string[]).map((f: string) => (
            <View key={f} style={[styles.featureRow, rtlRow]}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={[styles.featureText, rtlText]}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        {!isSubscriber && (
          <>
            {/* Monthly */}
            <TouchableOpacity
              style={styles.planCard}
              onPress={() => handleSubscribe('MONTHLY')}
              disabled={loading !== null}
              activeOpacity={0.85}
            >
              <View style={styles.planInfo}>
                <Text style={[styles.planName, rtlText]}>{t('subscriptions.monthly')}</Text>
                <Text style={[styles.planDesc, rtlText]}>{t('subscriptions.monthlyDesc')}</Text>
              </View>
              <View style={styles.planPriceBox}>
                {loading === 'MONTHLY' ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <>
                    <Text style={styles.planPrice}>{t('subscriptions.monthlyPrice')}</Text>
                    <Text style={styles.planPeriod}>{t('subscriptions.monthlyPeriod')}</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Annual */}
            <TouchableOpacity
              style={[styles.planCard, styles.planCardHighlight]}
              onPress={() => handleSubscribe('ANNUAL')}
              disabled={loading !== null}
              activeOpacity={0.85}
            >
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>{t('subscriptions.save33')}</Text>
              </View>
              <View style={styles.planInfo}>
                <Text style={[styles.planName, { color: '#fff' }, rtlText]}>{t('subscriptions.annual')}</Text>
                <Text style={[styles.planDesc, { color: 'rgba(255,255,255,0.8)' }, rtlText]}>{t('subscriptions.annualDesc')}</Text>
              </View>
              <View style={styles.planPriceBox}>
                {loading === 'ANNUAL' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={[styles.planPrice, { color: '#fff' }]}>{t('subscriptions.annualPrice')}</Text>
                    <Text style={[styles.planPeriod, { color: 'rgba(255,255,255,0.8)' }]}>{t('subscriptions.annualPeriod')}</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* Restore */}
        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore} disabled={loading !== null}>
          {loading === 'RESTORE' ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={styles.restoreBtnText}>{t('subscriptions.restore')}</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.legalText, rtlText]}>{t('subscriptions.legalText')}</Text>
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
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.lg },
  statusActive: { backgroundColor: '#D1FAE5' },
  statusInactive: { backgroundColor: Colors.primaryLight },
  statusIcon: { fontSize: 32 },
  statusTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary },
  statusSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  featuresBox: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  featuresTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 6 },
  featureCheck: { color: Colors.success, fontWeight: '800', fontSize: FontSizes.md },
  featureText: { fontSize: FontSizes.md, color: Colors.textPrimary },
  planCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md,
    marginBottom: Spacing.md, borderWidth: 1.5, borderColor: Colors.border,
  },
  planCardHighlight: { backgroundColor: Colors.primary, borderColor: Colors.primary, marginTop: Spacing.xs },
  saveBadge: { position: 'absolute', top: -10, right: 16, backgroundColor: Colors.secondary, borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 3 },
  saveBadgeText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '800', letterSpacing: 0.5 },
  planInfo: { flex: 1 },
  planName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary },
  planDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  planPriceBox: { alignItems: 'flex-end' },
  planPrice: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.primary },
  planPeriod: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  restoreBtn: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.lg,
    paddingVertical: 14, alignItems: 'center', marginBottom: Spacing.lg,
  },
  restoreBtnText: { color: Colors.primary, fontSize: FontSizes.md, fontWeight: '600' },
  legalText: { fontSize: FontSizes.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
