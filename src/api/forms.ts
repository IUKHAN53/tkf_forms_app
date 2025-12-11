import { api } from './client';

export type FieldOption = { label: string; value: string };
export type FormField = {
  id: number;
  form_id: number;
  label: string;
  name: string;
  type: string;
  required: boolean;
  options?: FieldOption[] | null;
  validation_rules?: string[] | Record<string, unknown> | null;
  order: number;
};

export type Form = {
  id: number;
  name: string;
  description?: string | null;
  version: string;
  is_active: boolean;
  fields: FormField[];
};

export type SubmissionInput = {
  data: Record<string, any>;
  latitude?: number | null;
  longitude?: number | null;
};

export async function fetchForms(): Promise<Form[]> {
  const res = await api.get<{ data: Form[] }>('/forms');
  return res.data?.data ?? [];
}

export async function fetchForm(id: number): Promise<Form> {
  const res = await api.get<{ data: Form }>(`/forms/${id}`);
  return res.data?.data;
}

export async function submitForm(formId: number, payload: SubmissionInput): Promise<void> {
  const formData = new FormData();

  if (payload.latitude !== undefined) formData.append('latitude', String(payload.latitude ?? ''));
  if (payload.longitude !== undefined) formData.append('longitude', String(payload.longitude ?? ''));

  Object.entries(payload.data).forEach(([key, value]) => {
    const dataKey = `data[${key}]`;
    if (value && typeof value === 'object' && 'uri' in value) {
      const file = value as { uri: string; name?: string; type?: string };
      formData.append(dataKey, {
        uri: file.uri,
        name: file.name ?? `${key}.jpg`,
        type: file.type ?? 'image/jpeg',
      } as any);
    } else {
      formData.append(dataKey, value == null ? '' : String(value));
    }
  });

  await api.post(`/forms/${formId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
