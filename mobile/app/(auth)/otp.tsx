import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../../utils/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { useTranslation } from '../../store/useLanguageStore';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/Colors';

export default function OtpScreen() {
  const { userId, email, devOtp } = useLocalSearchParams<{ userId: string; email: string; devOtp: string }>();
  const [otp, setOtp] = useState(devOtp || '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const login = useAuthStore((s) => s.login);
  const setShowTrialPrompt = useUIStore((s) => s.setShowTrialPrompt);
  const { t } = useTranslation();

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert(t('common.error'), t('otp.errorInvalid'));
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ userId, otp });
      const { token, user } = res.data;
      await login(token, user);
      setShowTrialPrompt(true);
      router.replace('/(app)/home');
    } catch (err: any) {
      Alert.alert(t('otp.failedTitle'), err?.response?.data?.error || t('common.retry'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendOtp(userId);
      setCountdown(60);
      Alert.alert(t('otp.sentSuccess'), t('otp.sentMessage'));
    } catch {
      Alert.alert(t('common.error'), t('otp.resendError'));
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>{t('common.back')}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{t('otp.title')}</Text>
        <Text style={styles.subtitle}>
          {t('otp.subtitle')}{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor={Colors.textMuted}
          textAlign="center"
        />

        <TouchableOpacity
          style={[styles.verifyBtn, loading && styles.verifyBtnDisabled]}
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyBtnText}>{t('otp.verify')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResend}
          disabled={countdown > 0 || resending}
          style={styles.resendBtn}
        >
          <Text style={[styles.resendText, countdown > 0 && styles.resendDisabled]}>
            {countdown > 0 ? t('otp.resendCountdown', { count: countdown }) : t('otp.resend')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  backBtn: { marginBottom: Spacing.lg },
  backText: { color: Colors.primary, fontSize: FontSizes.md },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSizes.xxxl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  email: { color: Colors.primary, fontWeight: '700' },
  otpInput: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 12,
    color: Colors.primary,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    marginBottom: Spacing.xl,
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.md,
  },
  verifyBtnDisabled: { opacity: 0.6 },
  verifyBtnText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: '700' },
  resendBtn: { marginTop: Spacing.sm },
  resendText: { color: Colors.primary, fontSize: FontSizes.md },
  resendDisabled: { color: Colors.textMuted },
});
