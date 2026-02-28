import { create } from 'zustand';
import { profilesApi, measurementsApi } from '../utils/api';

export interface Profile {
  id: string;
  userId: string;
  name: string;
  isMain: boolean;
  gender: string | null;
}

export interface Measurement {
  id: string;
  profileId: string;
  height: number | null;
  weight: number | null;
  chest: number | null;
  waist: number | null;
  hip: number | null;
  armLength: number | null;
  legLength: number | null;
  shoeSize: number | null;
  recordedAt: string;
}

interface ProfileStore {
  profiles: Profile[];
  selectedProfileId: string | null;
  measurements: Record<string, Measurement[]>; // profileId -> measurements
  isLoading: boolean;

  fetchProfiles: () => Promise<void>;
  addDependent: (name: string, gender?: string) => Promise<Profile>;
  updateProfile: (id: string, data: { name?: string; gender?: string | null }) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  selectProfile: (id: string) => void;
  getMainProfile: () => Profile | undefined;
  getSelectedProfile: () => Profile | undefined;

  fetchMeasurements: (profileId: string) => Promise<void>;
  saveMeasurement: (profileId: string, data: Record<string, number>) => Promise<void>;
  reset: () => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profiles: [],
  selectedProfileId: null,
  measurements: {},
  isLoading: false,

  fetchProfiles: async () => {
    set({ isLoading: true });
    try {
      const res = await profilesApi.getAll();
      const profiles: Profile[] = res.data;
      const main = profiles.find((p) => p.isMain);
      set({
        profiles,
        selectedProfileId: get().selectedProfileId || main?.id || null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addDependent: async (name, gender) => {
    const res = await profilesApi.create({ name, gender });
    const newProfile: Profile = res.data;
    set((s) => ({ profiles: [...s.profiles, newProfile] }));
    return newProfile;
  },

  updateProfile: async (id, data) => {
    const res = await profilesApi.update(id, { name: data.name, gender: data.gender ?? undefined });
    set((s) => ({
      profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...res.data } : p)),
    }));
  },

  deleteProfile: async (id) => {
    await profilesApi.delete(id);
    set((s) => ({
      profiles: s.profiles.filter((p) => p.id !== id),
      selectedProfileId: s.selectedProfileId === id ? s.profiles.find((p) => p.isMain)?.id || null : s.selectedProfileId,
    }));
  },

  selectProfile: (id) => set({ selectedProfileId: id }),

  getMainProfile: () => get().profiles.find((p) => p.isMain),

  getSelectedProfile: () => {
    const { profiles, selectedProfileId } = get();
    return profiles.find((p) => p.id === selectedProfileId);
  },

  fetchMeasurements: async (profileId) => {
    const res = await measurementsApi.getAll(profileId);
    set((s) => ({ measurements: { ...s.measurements, [profileId]: res.data } }));
  },

  saveMeasurement: async (profileId, data) => {
    const res = await measurementsApi.create(profileId, data as any);
    set((s) => ({
      measurements: {
        ...s.measurements,
        [profileId]: [res.data, ...(s.measurements[profileId] || [])],
      },
    }));
  },

  reset: () => set({ profiles: [], selectedProfileId: null, measurements: {} }),
}));
