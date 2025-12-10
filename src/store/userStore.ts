import { create } from 'zustand';

interface UserState {
  token: string | null;
  user: { id: number; name: string; email: string } | null;
  setSession: (token: string, user: { id: number; name: string; email: string }) => void;
  clearSession: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  token: null,
  user: null,
  setSession: (token, user) => set({ token, user }),
  clearSession: () => set({ token: null, user: null }),
}));
