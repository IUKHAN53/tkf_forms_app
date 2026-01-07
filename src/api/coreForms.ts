import { api } from './client';

// Generate unique form ID
export type FormType = 'area_mapping' | 'draft_list' | 'religious_leader' | 'community_barrier' | 'healthcare_barrier' | 'bridging_the_gap';

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

// Area Mapping
export interface AreaMapping extends FormMetadata {
  id?: number;
  district: string;
  town: string;
  uc_name: string;
  fix_site: string;
  outreach_name: string;
  outreach_coordinates?: string;
  area_name: string;
  assigned_aic: string;
  aic_contact?: string;
  assigned_cm: string;
  cm_contact?: string;
  total_population: number;
  total_under_2_years: number;
  total_zero_dose: number;
  total_defaulter: number;
  total_refusal: number;
  total_boys_under_2?: number;
  total_girls_under_2?: number;
  major_ethnicity?: string;
  major_languages?: string;
  nearest_phf?: string;
  hf_incharge_name?: string;
  latitude?: number;
  longitude?: number;
}

export const areaMappingApi = {
  list: async () => {
    const { data } = await api.get('/area-mappings');
    return data;
  },
  create: async (payload: AreaMapping) => {
    const { data} = await api.post('/area-mappings', payload);
    return data;
  },
};

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

// Religious Leader
export interface ReligiousLeader extends FormMetadata {
  id?: number;
  date: string;
  attached_hf: string;
  uc: string;
  district: string;
  outreach: string;
  group_type: string;
  facilitator_tkf: string;
  latitude?: number;
  longitude?: number;
  participants: Participant[];
}

export const religiousLeaderApi = {
  list: async () => {
    const { data } = await api.get('/religious-leaders');
    return data;
  },
  create: async (payload: ReligiousLeader) => {
    const { data } = await api.post('/religious-leaders', payload);
    return data;
  },
};

// Community Barrier
export interface CommunityBarrier extends FormMetadata {
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

export const communityBarrierApi = {
  list: async () => {
    const { data } = await api.get('/community-barriers');
    return data;
  },
  create: async (payload: CommunityBarrier) => {
    const { data } = await api.post('/community-barriers', payload);
    return data;
  },
};

// Healthcare Barrier
export interface HealthcareBarrier extends FormMetadata {
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

export const healthcareBarrierApi = {
  list: async () => {
    const { data } = await api.get('/healthcare-barriers');
    return data;
  },
  create: async (payload: HealthcareBarrier) => {
    const { data } = await api.post('/healthcare-barriers', payload);
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
  source_type: 'community_barrier' | 'healthcare_barrier';
  source_id: number;
}

// Searched participant from other forms
export interface SearchedParticipant {
  id: number;
  name: string;
  contact_no: string;
  occupation?: string;
  designation?: string;
  source_type: 'community_barrier' | 'healthcare_barrier';
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
