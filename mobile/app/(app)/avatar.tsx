import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Ellipse, Rect } from 'react-native-svg';
import { useProfileStore } from '../../store/useProfileStore';
import { useTranslation } from '../../store/useLanguageStore';
import { useRTL } from '../../hooks/useRTL';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';

/** Rules-based BMI / body shape classifier */
function classifyBody(height: number | null, weight: number | null, chest: number | null, waist: number | null, hip: number | null) {
  if (!height || !weight) return { shape: 'unknown', bmi: null, recommendation: 'Enter height and weight to see your body shape.' };

  const bmi = weight / ((height / 100) ** 2);
  let shape = 'average';
  if (bmi < 18.5) shape = 'slim';
  else if (bmi < 25) shape = 'average';
  else if (bmi < 30) shape = 'overweight';
  else shape = 'obese';

  let recommendation = '';
  if (shape === 'slim') recommendation = 'You are in the slim range. Focus on nutrient-rich foods and strength training.';
  else if (shape === 'average') recommendation = 'Great! You are in a healthy BMI range. Maintain your current lifestyle.';
  else if (shape === 'overweight') recommendation = 'Consider increasing physical activity and moderating caloric intake.';
  else recommendation = 'Consult a healthcare provider for a personalized fitness plan.';

  return { shape, bmi: Math.round(bmi * 10) / 10, recommendation };
}

/** Simple SVG avatar body shape */
function AvatarSvg({ shape, gender }: { shape: string; gender?: string | null }) {
  const isFemale = gender === 'female';
  const scale = shape === 'slim' ? 0.75 : shape === 'overweight' ? 1.15 : shape === 'obese' ? 1.3 : 1.0;
  const bodyColor = Colors.primary;
  const skinColor = '#FDBCB4';

  const bodyW = Math.round(60 * scale);
  const bodyH = Math.round(80 * scale);
  const hipW = isFemale ? Math.round(bodyW * 1.2) : bodyW;

  return (
    <Svg width={160} height={220} viewBox="0 0 160 220">
      {/* Head */}
      <Ellipse cx="80" cy="28" rx="22" ry="24" fill={skinColor} />
      {/* Neck */}
      <Rect x="72" y="50" width="16" height="14" fill={skinColor} />
      {/* Body */}
      <Ellipse cx="80" cy={100 + bodyH / 4} rx={bodyW / 2} ry={bodyH / 2} fill={bodyColor} />
      {/* Hips */}
      {isFemale && <Ellipse cx="80" cy={140} rx={hipW / 2} ry={20} fill={Colors.primaryDark} />}
      {/* Left Arm */}
      <Rect x={80 - bodyW / 2 - 14} y="68" width="14" height={bodyH * 0.7} rx="7" fill={bodyColor} />
      {/* Right Arm */}
      <Rect x={80 + bodyW / 2} y="68" width="14" height={bodyH * 0.7} rx="7" fill={bodyColor} />
      {/* Left Leg */}
      <Rect x="62" y={140 + (isFemale ? 20 : 15)} width="18" height="60" rx="9" fill={bodyColor} />
      {/* Right Leg */}
      <Rect x="80" y={140 + (isFemale ? 20 : 15)} width="18" height="60" rx="9" fill={bodyColor} />
    </Svg>
  );
}

export default function AvatarScreen() {
  const { profiles, selectedProfileId, measurements, fetchMeasurements } = useProfileStore();
  const profile = profiles.find((p) => p.id === selectedProfileId) || profiles.find((p) => p.isMain);
  const [gender, setGender] = useState<string>(profile?.gender || '');
  const { t } = useTranslation();
  const { rtlRow, rtlText, alignStart } = useRTL();

  useEffect(() => {
    if (profile) fetchMeasurements(profile.id);
  }, [profile?.id]);

  const latest = profile ? measurements[profile.id]?.[0] : null;
  const { shape, bmi } = classifyBody(
    latest?.height ?? null, latest?.weight ?? null,
    latest?.chest ?? null, latest?.waist ?? null, latest?.hip ?? null
  );
  const recommendation = t(`avatar.recommendations.${shape}`);

  const shapeColors: Record<string, string> = {
    slim: Colors.success, average: Colors.primary,
    overweight: Colors.warning, obese: Colors.error, unknown: Colors.textMuted,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, rtlRow]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('avatar.title')}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Gender selector */}
        <Text style={[styles.sectionLabel, rtlText, alignStart]}>{t('avatar.selectGender')}</Text>
        <View style={[styles.genderRow, rtlRow]}>
          {[{ value: 'male', label: t('avatar.genderMale') }, { value: 'female', label: t('avatar.genderFemale') }, { value: '', label: t('avatar.genderSkip') }].map((g) => (
            <TouchableOpacity
              key={g.value || 'none'}
              style={[styles.genderChip, gender === g.value && styles.genderChipActive]}
              onPress={() => setGender(g.value)}
            >
              <Text style={[styles.genderChipText, gender === g.value && styles.genderChipTextActive]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <AvatarSvg shape={shape} gender={gender || profile?.gender} />
          <View style={[styles.shapeBadge, { backgroundColor: shapeColors[shape] }]}>
            <Text style={styles.shapeBadgeText}>{t(`avatar.shapes.${shape}`)}</Text>
          </View>
        </View>

        {/* Stats */}
        {bmi && (
          <View style={[styles.statsRow, rtlRow]}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{bmi}</Text>
              <Text style={styles.statLabel}>{t('avatar.bmi')}</Text>
            </View>
            {latest?.height && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{latest.height}</Text>
                <Text style={styles.statLabel}>{t('avatar.height')}</Text>
              </View>
            )}
            {latest?.weight && (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{latest.weight}</Text>
                <Text style={styles.statLabel}>{t('avatar.weight')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Recommendation */}
        <View style={styles.recommendationBox}>
          <Text style={[styles.recommendationTitle, rtlText]}>{t('avatar.recommendation')}</Text>
          <Text style={[styles.recommendationText, rtlText]}>{recommendation}</Text>
        </View>

        {!latest && (
          <TouchableOpacity style={styles.addMeasurementsBtn} onPress={() => router.push('/(app)/measurements')}>
            <Text style={styles.addMeasurementsBtnText}>{t('avatar.addMeasurements')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg },
  back: { color: Colors.primary, fontSize: FontSizes.md },
  title: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary },
  scroll: { padding: Spacing.lg, alignItems: 'center', paddingBottom: Spacing.xxl },
  sectionLabel: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm, alignSelf: 'flex-start' },
  genderRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, alignSelf: 'stretch' },
  genderChip: {
    flex: 1, paddingVertical: 10, borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center',
  },
  genderChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  genderChipText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  genderChipTextActive: { color: Colors.primary },
  avatarContainer: { alignItems: 'center', marginBottom: Spacing.lg },
  shapeBadge: { borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 4, marginTop: Spacing.sm },
  shapeBadgeText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm, letterSpacing: 1 },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  statBox: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  statValue: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  recommendationBox: {
    backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.lg, padding: Spacing.md,
    alignSelf: 'stretch', marginBottom: Spacing.lg,
  },
  recommendationTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.primary, marginBottom: 6 },
  recommendationText: { fontSize: FontSizes.md, color: Colors.textPrimary, lineHeight: 22 },
  addMeasurementsBtn: {
    backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg, alignItems: 'center',
  },
  addMeasurementsBtnText: { color: '#fff', fontSize: FontSizes.md, fontWeight: '700' },
});
