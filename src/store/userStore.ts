import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

interface UserState {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  token: null,
  user: null,
  setSession: (token, user) => set({ token, user }),
  setUser: (user) => set({ user }),
  clearSession: () => set({ token: null, user: null }),
}));
