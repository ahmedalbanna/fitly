import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../../utils/api';
import { useTranslation } from '../../store/useLanguageStore';
import { useRTL } from '../../hooks/useRTL';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useTranslation();
  const { rtlText, centerText } = useRTL();

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('forgotPassword.errorRequired'));
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch {
      Alert.alert(t('common.error'), t('forgotPassword.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>{t('common.back')}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {sent ? (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={[styles.title, centerText]}>{t('forgotPassword.checkEmailTitle')}</Text>
            <Text style={[styles.subtitle, centerText]}>
              {t('forgotPassword.checkEmailMsg')} <Text style={styles.emailText}>{email}</Text>{'\n'}{t('forgotPassword.checkEmailMsg2')}
            </Text>
            <TouchableOpacity style={styles.backToLoginBtn} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.backToLoginText}>{t('forgotPassword.backToLogin')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[styles.title, rtlText]}>{t('forgotPassword.title')}</Text>
            <Text style={[styles.subtitle, rtlText]}>{t('forgotPassword.subtitle')}</Text>

            <Text style={[styles.label, rtlText]}>{t('forgotPassword.emailLabel')}</Text>
            <TextInput
              style={[styles.input, rtlText]}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>{t('forgotPassword.sendLink')}</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  backBtn: { marginBottom: Spacing.lg },
  backText: { color: Colors.primary, fontSize: FontSizes.md },
  content: { flex: 1, justifyContent: 'center' },
  title: { fontSize: FontSizes.xxxl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.xl, lineHeight: 22 },
  label: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: 4 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: '700' },
  successContainer: { alignItems: 'center' },
  successIcon: { fontSize: 64, marginBottom: Spacing.lg },
  emailText: { color: Colors.primary, fontWeight: '700' },
  backToLoginBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  backToLoginText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: '700' },
});
