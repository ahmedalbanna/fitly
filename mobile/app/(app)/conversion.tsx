import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { conversionsApi } from '../../utils/api';
import { useTranslation } from '../../store/useLanguageStore';
import { useRTL } from '../../hooks/useRTL';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';

const PRODUCT_TYPES = ['Shirts', 'Pants', 'Shoes', 'Thobe'];
const SYSTEMS = ['EU', 'US', 'UK', 'CM'];

export default function ConversionScreen() {
  const [productType, setProductType] = useState('Shirts');
  const [system, setSystem] = useState('EU');
  const [value, setValue] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { rtlRow, rtlText } = useRTL();

  // Reset result when inputs change
  useEffect(() => { setResult(null); setNote(null); setError(null); }, [productType, system, value]);

  const handleConvert = async () => {
    const num = parseFloat(value);
    if (!value || isNaN(num)) { setError(t('conversion.errorNumber')); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await conversionsApi.convert({ type: productType, system, value: num });
      setResult(res.data.result);
      setNote(res.data.note || null);
    } catch (err: any) {
      setError(err?.response?.data?.error || t('conversion.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, rtlRow]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('conversion.title')}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Product Type */}
        <Text style={[styles.sectionLabel, rtlText]}>{t('conversion.productType')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {PRODUCT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, productType === type && styles.chipActive]}
              onPress={() => setProductType(type)}
            >
              <Text style={[styles.chipText, productType === type && styles.chipTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* System */}
        <Text style={[styles.sectionLabel, rtlText]}>{t('conversion.system')}</Text>
        <View style={[styles.systemRow, rtlRow]}>
          {SYSTEMS.map((sys) => (
            <TouchableOpacity
              key={sys}
              style={[styles.systemChip, system === sys && styles.systemChipActive]}
              onPress={() => setSystem(sys)}
            >
              <Text style={[styles.systemChipText, system === sys && styles.systemChipTextActive]}>{sys}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Value Input */}
        <Text style={[styles.sectionLabel, rtlText]}>{t('conversion.yourMeasurement')}</Text>
        <Text style={[styles.hint, rtlText]}>{t(`conversion.hints.${productType}`)}</Text>
        <View style={[styles.inputRow, rtlRow]}>
          <TextInput
            style={[styles.input, rtlText]}
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            placeholder="e.g. 90"
            placeholderTextColor={Colors.textMuted}
          />
          <Text style={styles.inputUnit}>cm</Text>
        </View>

        {error && <Text style={[styles.errorText, rtlText]}>{error}</Text>}

        {/* Convert Button */}
        <TouchableOpacity
          style={[styles.convertBtn, loading && styles.convertBtnDisabled]}
          onPress={handleConvert}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.convertBtnText}>{t('conversion.convertBtn')}</Text>}
        </TouchableOpacity>

        {/* Result */}
        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>{t('conversion.yourSize')}</Text>
            <Text style={styles.resultValue}>{result}</Text>
            <Text style={styles.resultSystem}>{system} · {productType}</Text>
            {note && <Text style={styles.resultNote}>⚠ {note}</Text>}
          </View>
        )}

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={[styles.infoTitle, rtlText]}>{t('conversion.howItWorks')}</Text>
          <Text style={[styles.infoText, rtlText]}>{t('conversion.howItWorksDesc')}</Text>
          <Text style={[styles.infoText, rtlText]}>{t('conversion.howItWorksDetails')}</Text>
        </View>
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
  sectionLabel: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  chipRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, marginRight: Spacing.sm,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: '#fff' },
  systemRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  systemChip: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center',
  },
  systemChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  systemChipText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textSecondary },
  systemChipTextActive: { color: Colors.primary },
  hint: { fontSize: FontSizes.sm, color: Colors.textMuted, marginBottom: Spacing.sm },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm,
  },
  input: { flex: 1, fontSize: 28, fontWeight: '700', color: Colors.primary, paddingVertical: 14 },
  inputUnit: { fontSize: FontSizes.lg, color: Colors.textMuted, fontWeight: '600' },
  errorText: { color: Colors.error, fontSize: FontSizes.sm, marginBottom: Spacing.sm },
  convertBtn: {
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: BorderRadius.lg,
    alignItems: 'center', marginBottom: Spacing.xl,
  },
  convertBtnDisabled: { opacity: 0.6 },
  convertBtnText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: '700' },
  resultBox: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.xl,
    padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.xl,
  },
  resultLabel: { fontSize: FontSizes.md, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  resultValue: { fontSize: 64, fontWeight: '900', color: '#fff', lineHeight: 72 },
  resultSystem: { fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.65)' },
  resultNote: { fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: Spacing.sm, textAlign: 'center' },
  infoBox: {
    backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.lg, padding: Spacing.md,
  },
  infoTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.primary, marginBottom: 6 },
  infoText: { fontSize: FontSizes.sm, color: Colors.textPrimary, lineHeight: 20, marginBottom: 4 },
});
