import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useUIStore } from '../../store/useUIStore';
import { useTranslation } from '../../store/useLanguageStore';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';

export default function CoachMarks() {
  const { coachMarkStep, nextCoachMark, dismissCoachMarks } = useUIStore();
  const { t } = useTranslation();
  const steps = t('coachMarks.steps') as unknown as Array<{ icon: string; title: string; description: string }>;
  const step = steps[coachMarkStep];
  const isLast = coachMarkStep === steps.length - 1;

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Progress dots */}
          <View style={styles.dots}>
            {steps.map((_, i) => (
              <View key={i} style={[styles.dot, i === coachMarkStep && styles.dotActive]} />
            ))}
          </View>

          <Text style={styles.icon}>{step.icon}</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.skipBtn} onPress={dismissCoachMarks}>
              <Text style={styles.skipText}>{t('common.skip')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={nextCoachMark}>
              <Text style={styles.nextText}>{isLast ? t('common.done') : t('common.next')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: 6, marginBottom: Spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 20 },
  icon: { fontSize: 52, marginBottom: Spacing.md },
  title: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.sm, textAlign: 'center' },
  description: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  buttons: { flexDirection: 'row', gap: Spacing.md, alignSelf: 'stretch' },
  skipBtn: {
    flex: 1, paddingVertical: 14, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center',
  },
  skipText: { color: Colors.textSecondary, fontWeight: '600', fontSize: FontSizes.md },
  nextBtn: { flex: 2, paddingVertical: 14, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary, alignItems: 'center' },
  nextText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.md },
});
