import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UIStore {
  showCoachMarks: boolean;
  showTrialPrompt: boolean;
  showGuestPaywall: boolean;
  showTrialExpiredBanner: boolean;
  coachMarkStep: number;

  setShowCoachMarks: (v: boolean) => void;
  setShowTrialPrompt: (v: boolean) => void;
  setShowGuestPaywall: (v: boolean) => void;
  setShowTrialExpiredBanner: (v: boolean) => void;
  nextCoachMark: () => void;
  dismissCoachMarks: () => void;
  checkFirstLaunch: () => Promise<void>;
}

export const useUIStore = create<UIStore>((set, get) => ({
  showCoachMarks: false,
  showTrialPrompt: false,
  showGuestPaywall: false,
  showTrialExpiredBanner: false,
  coachMarkStep: 0,

  setShowCoachMarks: (v) => set({ showCoachMarks: v, coachMarkStep: 0 }),
  setShowTrialPrompt: (v) => set({ showTrialPrompt: v }),
  setShowGuestPaywall: (v) => set({ showGuestPaywall: v }),
  setShowTrialExpiredBanner: (v) => set({ showTrialExpiredBanner: v }),

  nextCoachMark: () => {
    const step = get().coachMarkStep + 1;
    if (step >= 4) {
      get().dismissCoachMarks();
    } else {
      set({ coachMarkStep: step });
    }
  },

  dismissCoachMarks: async () => {
    set({ showCoachMarks: false, coachMarkStep: 0 });
    await AsyncStorage.setItem('fitly_coach_marks_seen', 'true');
  },

  checkFirstLaunch: async () => {
    const seen = await AsyncStorage.getItem('fitly_coach_marks_seen');
    if (!seen) {
      set({ showCoachMarks: true });
    }
  },
}));
