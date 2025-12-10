import { useQuery } from '@tanstack/react-query';
import { fetchForm, fetchForms } from '../api/forms';

export function useForms() {
  return useQuery({ queryKey: ['forms'], queryFn: fetchForms });
}

export function useForm(id: number) {
  return useQuery({ queryKey: ['forms', id], queryFn: () => fetchForm(id) });
}
