import { api } from './client';

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
};

export async function login(phone: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/login', { phone, password });
  return res.data;
}
