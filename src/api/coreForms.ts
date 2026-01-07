import { api } from './client';

// Generate unique form ID
export type FormType = 'fgds_community' | 'fgds_health_workers' | 'child_line_list' | 'bridging_the_gap';

export const generateFormId = async (formType: FormType): Promise<string> => {
  const { data } = await api.post('/form-id/generate', { form_type: formType });
  return data.unique_id;
};

// Form Metadata - sent with every form submission
export interface FormMetadata {
  unique_id?: string;
  device_info?: {
    platform: string;
    os_version: string;
    device_name: string;
    device_model: string;
    device_brand: string;
    app_version: string;
    app_build: string;
    is_device: boolean;
    device_year: number | null;
  };
  started_at?: string;
  submitted_at?: string;
}

// Participant type for forms with participants
export interface Participant {
  sr_no?: number;
  name: string;
  title_designation?: string;
  designation?: string;
  occupation?: string;
  address?: string;
  contact_no?: string;
  cnic?: string;
  gender?: string;
}

// FGDs-Community (formerly Community Barriers)
export interface FgdsCommunity extends FormMetadata {
  id?: number;
  date: string;
  venue: string;
  uc: string;
  district: string;
  fix_site: string;
  outreach: string;
  community: string[];
  participants_males: number;
  participants_females: number;
  facilitator_tkf: string;
  latitude?: number;
  longitude?: number;
  participants: Participant[];
}

export const fgdsCommunityApi = {
  list: async () => {
    const { data } = await api.get('/fgds-community');
    return data;
  },
  create: async (payload: FgdsCommunity) => {
    const { data } = await api.post('/fgds-community', payload);
    return data;
  },
};

// FGDs-Health Workers (formerly Healthcare Barriers)
export interface FgdsHealthWorkers extends FormMetadata {
  id?: number;
  date: string;
  hfs: string;
  address: string;
  uc: string;
  participants_males: number;
  participants_females: number;
  group_type: string;
  facilitator_tkf: string;
  latitude?: number;
  longitude?: number;
  participants: Participant[];
}

export const fgdsHealthWorkersApi = {
  list: async () => {
    const { data } = await api.get('/fgds-health-workers');
    return data;
  },
  create: async (payload: FgdsHealthWorkers) => {
    const { data } = await api.post('/fgds-health-workers', payload);
    return data;
  },
};

// Child Line List (formerly Draft Lists)
export interface ChildLineList extends FormMetadata {
  id?: number;
  division: string;
  district: string;
  town: string;
  uc: string;
  outreach: string;
  child_name: string;
  father_name: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  age_in_months: number;
  father_cnic?: string;
  house_number?: string;
  address: string;
  guardian_phone?: string;
  type: 'Zero Dose' | 'Defaulter';
  missed_vaccines: string[];
  reasons_of_missing: string;
  plan_for_coverage: string;
  latitude?: number;
  longitude?: number;
}

export const childLineListApi = {
  list: async () => {
    const { data } = await api.get('/child-line-lists');
    return data;
  },
  create: async (payload: ChildLineList) => {
    const { data } = await api.post('/child-line-lists', payload);
    return data;
  },
};

// Bridging The Gap - Attendance Participant (simpler than other participants)
export interface BridgingTheGapParticipant {
  sr_no?: number;
  name: string;
  occupation: string;
  contact_no: string;
}

// IIT Team Member - reference to participant from other forms
export interface IITTeamMember {
  participant_id: number;
  source_type: 'fgds_community' | 'fgds_health_workers';
  source_id: number;
}

// Searched participant from other forms
export interface SearchedParticipant {
  id: number;
  name: string;
  contact_no: string;
  occupation?: string;
  designation?: string;
  source_type: 'fgds_community' | 'fgds_health_workers';
  source_id: number;
  source_label: string;
}

// Bridging The Gap
export interface BridgingTheGap extends FormMetadata {
  id?: number;
  date: string;
  venue: string;
  district: string;
  uc: string;
  fix_site: string;
  participants_males: number;
  participants_females: number;
  latitude?: number;
  longitude?: number;
  participants: BridgingTheGapParticipant[];
  team_members: IITTeamMember[];
}

export const bridgingTheGapApi = {
  list: async () => {
    const { data } = await api.get('/bridging-the-gap');
    return data;
  },
  create: async (payload: BridgingTheGap) => {
    const { data } = await api.post('/bridging-the-gap', payload);
    return data;
  },
  searchParticipants: async (uc: string, search?: string) => {
    const params = new URLSearchParams({ uc });
    if (search) {
      params.append('search', search);
    }
    const { data } = await api.get(`/bridging-the-gap/search-participants?${params}`);
    return data as { data: SearchedParticipant[]; total: number };
  },
};
