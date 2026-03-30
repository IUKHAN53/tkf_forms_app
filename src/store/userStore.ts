import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

interface UserState {
  token: string | null;
  user: User | null;
  _hasHydrated: boolean;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
}

const secureStorage: StateStorage = {
  getItem: async (name: string) => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      _hasHydrated: false,
      setSession: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    {
      name: 'user-session',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => () => {
        useUserStore.setState({ _hasHydrated: true });
      },
    },
  ),
);
