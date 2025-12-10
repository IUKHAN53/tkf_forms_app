import { api } from './client';

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/login', { email, password });
  return res.data;
}
