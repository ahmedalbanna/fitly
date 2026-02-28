import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useUIStore } from '../../store/useUIStore';

export default function AppLayout() {
  const { user, userState } = useAuthStore();
  const fetchProfiles = useProfileStore((s) => s.fetchProfiles);
  const setShowTrialExpiredBanner = useUIStore((s) => s.setShowTrialExpiredBanner);

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  useEffect(() => {
    if (userState === 'TRIAL_EXPIRED') {
      setShowTrialExpiredBanner(true);
    }
  }, [userState]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="measurements" />
      <Stack.Screen name="avatar" />
      <Stack.Screen name="conversion" />
      <Stack.Screen name="subscriptions" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
