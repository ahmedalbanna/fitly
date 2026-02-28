import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, FlatList, ActivityIndicator, Share,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useUIStore } from '../../store/useUIStore';
import { useTranslation } from '../../store/useLanguageStore';
import { useRTL } from '../../hooks/useRTL';
import { bannersApi, cardsApi } from '../../utils/api';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';
import TrialPromptModal from '../../components/overlays/TrialPromptModal';
import GuestPaywallModal from '../../components/overlays/GuestPaywallModal';
import TrialExpiredBanner from '../../components/overlays/TrialExpiredBanner';
import CoachMarks from '../../components/overlays/CoachMarks';

export default function HomeScreen() {
  const { user, userState } = useAuthStore();
  const { profiles, fetchProfiles } = useProfileStore();
  const { showTrialPrompt, showGuestPaywall, showTrialExpiredBanner, showCoachMarks } = useUIStore();
  const { t } = useTranslation();
  const { rtlRow, rtlText, isRTL } = useRTL();

  const [banners, setBanners] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  const isGuest = userState === 'GUEST';
  const isLocked = userState === 'TRIAL_EXPIRED';

  useEffect(() => {
    bannersApi.getActive().then((r) => setBanners(r.data)).catch(() => {});
    if (!isGuest) {
      loadCards();
      fetchProfiles();
    }
  }, [isGuest]);

  const loadCards = async () => {
    setCardsLoading(true);
    try {
      const res = await cardsApi.getAll();
      setCards(res.data);
    } catch { }
    finally { setCardsLoading(false); }
  };

  const handleGuestAction = () => {
    useUIStore.getState().setShowGuestPaywall(true);
  };

  const handleShareCard = async (card: any) => {
    try {
      await Share.share({
        message: `Check out my FITLY measurements card!\n${card.data?.summary || ''}`,
        title: 'My FITLY Card',
      });
    } catch { }
  };

  const handleGenerateCard = async (profileId: string) => {
    if (isGuest) { handleGuestAction(); return; }
    try {
      await cardsApi.generate(profileId);
      loadCards();
    } catch { }
  };

  const mainProfile = profiles.find((p) => p.isMain);
  const dependents = profiles.filter((p) => !p.isMain);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {showCoachMarks && <CoachMarks />}
      {showTrialPrompt && <TrialPromptModal />}
      {showGuestPaywall && <GuestPaywallModal />}
      {showTrialExpiredBanner && <TrialExpiredBanner />}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>FITLY</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/settings')} style={styles.menuBtn}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        </View>

        {/* Ad Banner Slider */}
        {banners.length > 0 && (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.bannerSlider}>
            {banners.map((b) => (
              <View key={b.id} style={styles.bannerItem}>
                <Image source={{ uri: b.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
        )}

        {/* Account Boxes */}
        <View style={[styles.sectionRow, rtlRow]}>
          <TouchableOpacity
            style={styles.accountBox}
            onPress={() => isGuest ? handleGuestAction() : router.push('/(app)/measurements')}
            activeOpacity={0.8}
          >
            <Text style={styles.accountBoxIcon}>👤</Text>
            <Text style={styles.accountBoxLabel}>{t('home.myAccount')}</Text>
            <Text style={styles.accountBoxSub}>{t('home.myMeasurements')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.accountBox, styles.addBox]}
            onPress={() => isGuest ? handleGuestAction() : router.push({ pathname: '/(app)/measurements', params: { addDependent: '1' } })}
            activeOpacity={0.8}
          >
            <Text style={styles.accountBoxIcon}>➕</Text>
            <Text style={[styles.accountBoxLabel, { color: Colors.primary }]}>{t('home.addDependent')}</Text>
            <Text style={[styles.accountBoxSub, { color: Colors.textSecondary }]}>{t('home.familyFriends')}</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Boxes */}
        <Text style={[styles.sectionTitle, rtlText]}>{t('home.features')}</Text>
        <View style={[styles.featureRow, rtlRow]}>
          <TouchableOpacity
            style={styles.featureBox}
            onPress={() => isGuest ? handleGuestAction() : router.push('/(app)/measurements')}
            activeOpacity={0.8}
          >
            <Text style={styles.featureIcon}>📏</Text>
            <Text style={styles.featureLabel}>{t('home.measurements')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.featureBox}
            onPress={() => isGuest ? handleGuestAction() : router.push('/(app)/avatar')}
            activeOpacity={0.8}
          >
            <Text style={styles.featureIcon}>🧍</Text>
            <Text style={styles.featureLabel}>{t('home.avatar')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.featureBox}
            onPress={() => router.push('/(app)/conversion')}
            activeOpacity={0.8}
          >
            <Text style={styles.featureIcon}>🔄</Text>
            <Text style={styles.featureLabel}>{t('home.convert')}</Text>
          </TouchableOpacity>
        </View>

        {/* My Cards Section */}
        <View style={[styles.cardsSectionHeader, rtlRow]}>
          <Text style={[styles.sectionTitle, rtlText]}>{t('home.myCards')}</Text>
          {!isGuest && mainProfile && (
            <TouchableOpacity onPress={() => handleGenerateCard(mainProfile.id)}>
              <Text style={styles.refreshText}>{t('home.refresh')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {isGuest ? (
          <TouchableOpacity style={styles.guestCardPrompt} onPress={handleGuestAction} activeOpacity={0.8}>
            <Text style={styles.guestCardIcon}>🔒</Text>
            <Text style={[styles.guestCardText, rtlText]}>{t('home.loginToView')}</Text>
          </TouchableOpacity>
        ) : cardsLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.lg }} />
        ) : cards.length === 0 ? (
          <View style={styles.emptyCards}>
            <Text style={[styles.emptyCardsText, rtlText]}>{t('home.noCards')}</Text>
            <TouchableOpacity style={styles.generateBtn} onPress={() => mainProfile && handleGenerateCard(mainProfile.id)}>
              <Text style={styles.generateBtnText}>{t('home.generateCard')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={cards}
            keyExtractor={(c) => c.id}
            horizontal={!isRTL}
            inverted={isRTL}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.md }}
            renderItem={({ item: card }) => (
              <View style={styles.card}>
                <View style={[styles.cardHeader, rtlRow]}>
                  <Text style={styles.cardName}>{card.profile?.name || card.data?.profileName}</Text>
                  <Text style={styles.cardGender}>{card.profile?.gender === 'male' ? '♂' : card.profile?.gender === 'female' ? '♀' : '⚥'}</Text>
                </View>
                {isLocked ? (
                  <View style={styles.lockedOverlay}>
                    <Text style={styles.lockedIcon}>🔒</Text>
                    <Text style={styles.lockedText}>{t('home.subscribeToUnlock')}</Text>
                    <TouchableOpacity onPress={() => router.push('/(app)/subscriptions')}>
                      <Text style={styles.lockedCta}>{t('home.subscribeNow')}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.cardMeasurements}>
                    {card.data?.measurements && Object.entries(card.data.measurements)
                      .filter(([, v]) => v !== null)
                      .map(([key, val]) => (
                        <Text key={key} style={[styles.cardMeasurementRow, rtlText]}>
                          <Text style={styles.cardMeasurementKey}>{formatKey(key, t)}: </Text>
                          {String(val)} {getUnit(key)}
                        </Text>
                      ))}
                  </View>
                )}
                <TouchableOpacity style={styles.shareBtn} onPress={() => handleShareCard(card)}>
                  <Text style={styles.shareBtnText}>{t('home.share')}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatKey(key: string, t: (k: string) => string): string {
  const keyMap: Record<string, string> = {
    height: 'measurements.fields.height',
    weight: 'measurements.fields.weight',
    chest: 'measurements.fields.chest',
    waist: 'measurements.fields.waist',
    hip: 'measurements.fields.hip',
    armLength: 'measurements.fields.armLength',
    legLength: 'measurements.fields.legLength',
    shoeSize: 'measurements.fields.shoeSize',
  };
  return keyMap[key] ? t(keyMap[key]) : key;
}

function getUnit(key: string): string {
  if (key === 'weight') return 'kg';
  if (key === 'shoeSize') return 'cm';
  return 'cm';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  logo: { fontSize: 26, fontWeight: '800', color: Colors.primary, letterSpacing: 3 },
  menuBtn: { padding: Spacing.sm },
  menuIcon: { fontSize: 22 },
  bannerSlider: { height: 140, marginBottom: Spacing.md },
  bannerItem: { width: 360, height: 140, paddingHorizontal: Spacing.lg },
  bannerImage: { width: '100%', height: '100%', borderRadius: BorderRadius.lg },
  sectionRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.md, marginBottom: Spacing.md },
  accountBox: {
    flex: 1, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg,
    padding: Spacing.md, alignItems: 'center', minHeight: 100, justifyContent: 'center',
  },
  addBox: { backgroundColor: Colors.primaryLight },
  accountBoxIcon: { fontSize: 28, marginBottom: 4 },
  accountBoxLabel: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.surface },
  accountBoxSub: { fontSize: FontSizes.xs, color: Colors.primary, marginTop: 2 },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm, marginTop: Spacing.md },
  featureRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.md, marginBottom: Spacing.md },
  featureBox: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  featureIcon: { fontSize: 28, marginBottom: 6 },
  featureLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textPrimary },
  cardsSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: Spacing.lg },
  refreshText: { color: Colors.primary, fontSize: FontSizes.md, fontWeight: '600' },
  guestCardPrompt: {
    marginHorizontal: Spacing.lg, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.xl, alignItems: 'center', borderStyle: 'dashed',
  },
  guestCardIcon: { fontSize: 40, marginBottom: Spacing.sm },
  guestCardText: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center' },
  emptyCards: { marginHorizontal: Spacing.lg, alignItems: 'center', padding: Spacing.xl },
  emptyCardsText: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.md },
  generateBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: 12, borderRadius: BorderRadius.lg },
  generateBtnText: { color: '#fff', fontWeight: '700' },
  card: {
    width: 260, backgroundColor: Colors.primary, borderRadius: BorderRadius.xl,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  cardName: { fontSize: FontSizes.lg, fontWeight: '700', color: '#fff' },
  cardGender: { fontSize: FontSizes.lg },
  cardMeasurements: { gap: 4, marginBottom: Spacing.md },
  cardMeasurementRow: { fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.9)' },
  cardMeasurementKey: { fontWeight: '600' },
  lockedOverlay: { alignItems: 'center', paddingVertical: Spacing.md },
  lockedIcon: { fontSize: 32 },
  lockedText: { color: 'rgba(255,255,255,0.8)', fontSize: FontSizes.sm, marginTop: 4 },
  lockedCta: { color: '#fff', fontWeight: '700', fontSize: FontSizes.md, marginTop: 8, textDecorationLine: 'underline' },
  shareBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BorderRadius.md, padding: 10, alignItems: 'center' },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
});
