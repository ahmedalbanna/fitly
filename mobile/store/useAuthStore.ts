import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, subscriptionsApi } from '../utils/api';

export type UserState =
  | 'GUEST'
  | 'REGISTERED'
  | 'TRIAL_ACTIVE'
  | 'TRIAL_EXPIRED'
  | 'SUBSCRIBER';

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  userState: UserState;
  trialExpiresAt: string | null;
  subscriptionEndDate: string | null;
  isLoading: boolean;

  // Actions
  setGuest: () => void;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
  activateTrial: () => Promise<void>;
  subscribe: (type: 'MONTHLY' | 'ANNUAL') => Promise<void>;
  restorePurchase: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  userState: 'GUEST',
  trialExpiresAt: null,
  subscriptionEndDate: null,
  isLoading: true,

  setGuest: () => set({ userState: 'GUEST', user: null, token: null }),

  login: async (token, user) => {
    await AsyncStorage.setItem('fitly_token', token);
    await AsyncStorage.setItem('fitly_user', JSON.stringify(user));
    set({ token, user, userState: 'REGISTERED' });
    await get().refreshSubscriptionStatus();
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['fitly_token', 'fitly_user']);
    set({ token: null, user: null, userState: 'GUEST', trialExpiresAt: null, subscriptionEndDate: null });
  },

  refreshSubscriptionStatus: async () => {
    try {
      const res = await subscriptionsApi.getStatus();
      const { status, trialExpiresAt, endDate } = res.data;
      set({
        userState: status as UserState,
        trialExpiresAt: trialExpiresAt || null,
        subscriptionEndDate: endDate || null,
      });
    } catch {
      // keep current state
    }
  },

  activateTrial: async () => {
    const res = await subscriptionsApi.activateTrial();
    set({ userState: 'TRIAL_ACTIVE', trialExpiresAt: res.data.expiresAt });
  },

  subscribe: async (type) => {
    const res = await subscriptionsApi.subscribe(type);
    set({ userState: 'SUBSCRIBER', subscriptionEndDate: res.data.subscription.endDate });
  },

  restorePurchase: async () => {
    const res = await subscriptionsApi.restore();
    if (res.data.restored) {
      set({ userState: 'SUBSCRIBER', subscriptionEndDate: res.data.subscription.endDate });
    }
  },

  deleteAccount: async () => {
    await authApi.deleteAccount();
    await get().logout();
  },

  loadFromStorage: async () => {
    try {
      const [token, userStr] = await AsyncStorage.multiGet(['fitly_token', 'fitly_user']);
      const tok = token[1];
      const usr = userStr[1] ? JSON.parse(userStr[1]) : null;
      if (tok && usr) {
        set({ token: tok, user: usr });
        await get().refreshSubscriptionStatus();
      }
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },
}));
