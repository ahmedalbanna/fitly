import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../../utils/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from '../../store/useLanguageStore';
import { useRTL } from '../../hooks/useRTL';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const { t } = useTranslation();
  const { rtlText, selfEnd } = useRTL();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('common.error'), t('login.errorRequired'));
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({ email: email.trim(), password });
      const { token, user } = res.data;
      await login(token, user);
      router.replace('/(app)/home');
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === 'EMAIL_NOT_VERIFIED') {
        const userId = err.response.data.userId;
        Alert.alert(
          t('login.emailNotVerified'),
          t('login.emailNotVerifiedMsg'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('login.resendCode'),
              onPress: () => router.push({ pathname: '/(auth)/otp', params: { userId, email: email.trim() } }),
            },
          ]
        );
      } else {
        Alert.alert(t('login.failedTitle'), err?.response?.data?.error || t('common.retry'));
      }
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

        <Text style={[styles.title, rtlText]}>{t('login.title')}</Text>
        <Text style={[styles.subtitle, rtlText]}>{t('login.subtitle')}</Text>

        <View style={styles.form}>
          <Text style={[styles.label, rtlText]}>{t('login.email')}</Text>
          <TextInput
            style={[styles.input, rtlText]}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, rtlText]}>{t('login.password')}</Text>
          <TextInput
            style={[styles.input, rtlText]}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={[styles.forgotLink, selfEnd]}
          >
            <Text style={styles.forgotText}>{t('login.forgotPassword')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>{t('login.loginBtn')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/signup')} style={styles.signupLink}>
          <Text style={[styles.signupLinkText, rtlText]}>
            {t('login.noAccount')} <Text style={styles.signupBold}>{t('login.signUp')}</Text>
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
  form: { marginBottom: Spacing.lg },
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
    marginBottom: Spacing.md,
  },
  forgotLink: { alignSelf: 'flex-end' },
  forgotText: { color: Colors.primary, fontSize: FontSizes.sm, fontWeight: '600' },
  loginBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: '700' },
  signupLink: { alignItems: 'center', marginTop: Spacing.sm },
  signupLinkText: { fontSize: FontSizes.md, color: Colors.textSecondary },
  signupBold: { color: Colors.primary, fontWeight: '700' },
});
