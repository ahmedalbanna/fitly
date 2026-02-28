import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { useTranslation } from '../../store/useLanguageStore';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';

export default function TrialPromptModal() {
  const { activateTrial } = useAuthStore();
  const { setShowTrialPrompt } = useUIStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    try {
      await activateTrial();
      setShowTrialPrompt(false);
    } catch {
      setShowTrialPrompt(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLater = () => setShowTrialPrompt(false);

  return (
    <Modal transparent animationType="slide" visible>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🎁</Text>
          <Text style={styles.title}>{t('trialPrompt.title')}</Text>
          <Text style={styles.subtitle}>
            {t('trialPrompt.subtitle')}{' '}
            <Text style={styles.highlight}>{t('trialPrompt.highlight')}</Text>
          </Text>

          <View style={styles.featureList}>
            {(t('trialPrompt.features') as unknown as string[]).map((f: string) => (
              <View key={f} style={styles.featureRow}>
                <Text style={styles.featureCheck}>✓</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.activateBtn, loading && { opacity: 0.6 }]}
            onPress={handleActivate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.activateBtnText}>{t('trialPrompt.activateBtn')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterBtn} onPress={handleLater}>
            <Text style={styles.laterText}>{t('trialPrompt.later')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  card: {
    backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl, paddingBottom: Spacing.xxl, alignItems: 'center',
  },
  emoji: { fontSize: 52, marginBottom: Spacing.md },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg },
  highlight: { color: Colors.primary, fontWeight: '700' },
  featureList: { alignSelf: 'stretch', backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 6 },
  featureCheck: { color: Colors.primary, fontWeight: '800', fontSize: FontSizes.md },
  featureText: { fontSize: FontSizes.md, color: Colors.textPrimary },
  activateBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: BorderRadius.lg, alignItems: 'center', alignSelf: 'stretch', marginBottom: Spacing.md },
  activateBtnText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: '700' },
  laterBtn: { paddingVertical: Spacing.sm },
  laterText: { color: Colors.textMuted, fontSize: FontSizes.md },
});
