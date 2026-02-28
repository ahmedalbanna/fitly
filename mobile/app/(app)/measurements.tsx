import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useTranslation } from '../../store/useLanguageStore';
import { useRTL } from '../../hooks/useRTL';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';

const FIELD_KEYS = ['height', 'weight', 'chest', 'waist', 'hip', 'armLength', 'legLength', 'shoeSize'];

export default function MeasurementsScreen() {
  const { addDependent: addDep } = useLocalSearchParams<{ addDependent?: string }>();
  const { userState } = useAuthStore();
  const { profiles, selectedProfileId, selectProfile, saveMeasurement, measurements, fetchMeasurements, addDependent } = useProfileStore();

  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showAddDependent, setShowAddDependent] = useState(addDep === '1');
  const [newDepName, setNewDepName] = useState('');
  const [newDepGender, setNewDepGender] = useState('');
  const { t } = useTranslation();
  const { rtlRow, rtlText } = useRTL();

  const FIELDS = FIELD_KEYS.map((key) => ({
    key,
    label: t(`measurements.fields.${key}`),
    unit: t(`measurements.units.${key}`),
    placeholder: t(`measurements.placeholders.${key}`),
  }));

  const mainProfile = profiles.find((p) => p.isMain);
  const dependents = profiles.filter((p) => !p.isMain);
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || mainProfile;

  useEffect(() => {
    if (selectedProfile) {
      fetchMeasurements(selectedProfile.id);
    }
  }, [selectedProfile?.id]);

  useEffect(() => {
    if (selectedProfile) {
      const latest = measurements[selectedProfile.id]?.[0];
      if (latest) {
        const pre: Record<string, string> = {};
        FIELDS.forEach(({ key }) => {
          const val = (latest as any)[key];
          if (val !== null && val !== undefined) pre[key] = String(val);
        });
        setValues(pre);
      } else {
        setValues({});
      }
    }
  }, [selectedProfile?.id, measurements]);

  const handleSave = async () => {
    if (!selectedProfile) return;
    const data: Record<string, number> = {};
    FIELDS.forEach(({ key }) => {
      const v = parseFloat(values[key]);
      if (!isNaN(v)) data[key] = v;
    });
    if (Object.keys(data).length === 0) {
      Alert.alert(t('common.error'), t('measurements.noData'));
      return;
    }
    setSaving(true);
    try {
      await saveMeasurement(selectedProfile.id, data);
      Alert.alert(t('measurements.savedSuccess'), t('measurements.savedMsg'));
    } catch {
      Alert.alert(t('common.error'), t('measurements.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddDependent = async () => {
    if (!newDepName.trim()) { Alert.alert(t('common.error'), t('measurements.noData')); return; }
    try {
      const profile = await addDependent(newDepName.trim(), newDepGender || undefined);
      selectProfile(profile.id);
      setShowAddDependent(false);
      setNewDepName('');
      setNewDepGender('');
    } catch {
      Alert.alert(t('common.error'), t('measurements.errorAddDep'));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, rtlRow]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('measurements.title')}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Profile Selector */}
        <Text style={[styles.sectionLabel, rtlText]}>{t('measurements.selectPerson')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.profileSelector}>
          {profiles.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.profileChip, selectedProfileId === p.id && styles.profileChipActive]}
              onPress={() => selectProfile(p.id)}
            >
              <Text style={[styles.profileChipText, selectedProfileId === p.id && styles.profileChipTextActive]}>
                {p.isMain ? '👤 ' : '👥 '}{p.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addProfileChip} onPress={() => setShowAddDependent(true)}>
            <Text style={styles.addProfileChipText}>+ {t('measurements.add')}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Add Dependent Form */}
        {showAddDependent && (
          <View style={styles.addDepForm}>
            <Text style={[styles.sectionLabel, rtlText]}>{t('measurements.newDependent')}</Text>
            <TextInput
              style={[styles.input, rtlText]}
              placeholder={t('measurements.namePlaceholder')}
              value={newDepName}
              onChangeText={setNewDepName}
            />
            <View style={[styles.genderRow, rtlRow]}>
              {['male', 'female', ''].map((g) => (
                <TouchableOpacity
                  key={g || 'none'}
                  style={[styles.genderChip, newDepGender === g && styles.genderChipActive]}
                  onPress={() => setNewDepGender(g)}
                >
                  <Text style={[styles.genderChipText, newDepGender === g && styles.genderChipTextActive]}>
                    {g === 'male' ? t('measurements.genderMale') : g === 'female' ? t('measurements.genderFemale') : t('measurements.genderSkip')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.addDepButtons, rtlRow]}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddDependent(false)}>
                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveDepBtn} onPress={handleAddDependent}>
                <Text style={styles.saveDepBtnText}>{t('measurements.add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Measurement Form */}
        <Text style={[styles.sectionLabel, rtlText]}>
          {t('measurements.measurementsFor')} {selectedProfile?.name || '—'}
        </Text>
        {FIELDS.map(({ key, label, unit, placeholder }) => (
          <View key={key} style={[styles.fieldRow, rtlRow]}>
            <Text style={[styles.fieldLabel, rtlText]}>{label}</Text>
            <View style={[styles.fieldInputWrapper, rtlRow]}>
              <TextInput
                style={[styles.fieldInput, rtlText]}
                placeholder={placeholder}
                value={values[key] || ''}
                onChangeText={(v) => setValues((prev) => ({ ...prev, [key]: v }))}
                keyboardType="decimal-pad"
              />
              <Text style={styles.fieldUnit}>{unit}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{t('measurements.saveMeasurements')}</Text>}
        </TouchableOpacity>
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
  profileSelector: { flexDirection: 'row', marginBottom: Spacing.md },
  profileChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, marginRight: Spacing.sm,
  },
  profileChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  profileChipText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  profileChipTextActive: { color: '#fff' },
  addProfileChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight, borderWidth: 1.5, borderColor: Colors.primary, marginRight: Spacing.sm,
  },
  addProfileChipText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '700' },
  addDepForm: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: FontSizes.md, marginBottom: Spacing.sm,
  },
  genderRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  genderChip: {
    flex: 1, paddingVertical: 10, borderRadius: BorderRadius.md,
    backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center',
  },
  genderChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  genderChipText: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  genderChipTextActive: { color: Colors.primary },
  addDepButtons: { flexDirection: 'row', gap: Spacing.sm },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md,
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' },
  saveDepBtn: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md, backgroundColor: Colors.primary, alignItems: 'center' },
  saveDepBtnText: { color: '#fff', fontWeight: '700' },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  fieldLabel: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  fieldInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldInput: {
    width: 90, textAlign: 'right', fontSize: FontSizes.md, fontWeight: '700',
    color: Colors.primary, borderBottomWidth: 1.5, borderColor: Colors.primary, paddingVertical: 4,
  },
  fieldUnit: { fontSize: FontSizes.sm, color: Colors.textMuted, width: 28 },
  saveBtn: {
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: BorderRadius.lg,
    alignItems: 'center', marginTop: Spacing.lg,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: '700' },
});
