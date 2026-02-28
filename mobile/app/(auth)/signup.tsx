import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../../utils/api';
import { useTranslation } from '../../store/useLanguageStore';
import { useRTL } from '../../hooks/useRTL';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { rtlText, rtlRow, alignStart } = useRTL();

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('common.error'), t('signup.errorEmailRequired'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('signup.errorPasswordMatch'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('common.error'), t('signup.errorPasswordLength'));
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.signup({ email: email.trim(), password, phone: phone.trim() || undefined });
      const { userId, devOtp } = res.data;
      router.push({ pathname: '/(auth)/otp', params: { userId, email: email.trim(), devOtp: devOtp || '' } });
    } catch (err: any) {
      Alert.alert(t('signup.failedTitle'), err?.response?.data?.error || t('common.retry'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{t('common.back')}</Text>
        </TouchableOpacity>

        <Text style={[styles.title, rtlText]}>{t('signup.title')}</Text>
        <Text style={[styles.subtitle, rtlText]}>{t('signup.subtitle')}</Text>

        <View style={styles.form}>
          <Text style={[styles.label, rtlText]}>{t('signup.email')} *</Text>
          <TextInput
            style={[styles.input, rtlText]}
            placeholder={t('signup.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Text style={[styles.label, rtlText]}>{t('signup.password')} *</Text>
          <TextInput
            style={[styles.input, rtlText]}
            placeholder={t('signup.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={[styles.label, rtlText]}>{t('signup.confirmPassword')} *</Text>
          <TextInput
            style={[styles.input, rtlText]}
            placeholder={t('signup.confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Text style={[styles.label, rtlText]}>{t('signup.phone')}</Text>
          <TextInput
            style={[styles.input, rtlText]}
            placeholder={t('signup.phonePlaceholder')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>{t('signup.createAccount')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.loginLink}>
          <Text style={[styles.loginLinkText, rtlText]}>
            {t('signup.alreadyHaveAccount')} <Text style={styles.loginLinkBold}>{t('signup.login')}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  backBtn: { marginBottom: Spacing.lg },
  backText: { color: Colors.primary, fontSize: FontSizes.md },
  title: { fontSize: FontSizes.xxxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.xl },
  form: { gap: Spacing.sm, marginBottom: Spacing.lg },
  label: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: 2 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: Spacing.sm },
  loginLinkText: { fontSize: FontSizes.md, color: Colors.textSecondary },
  loginLinkBold: { color: Colors.primary, fontWeight: '700' },
});
