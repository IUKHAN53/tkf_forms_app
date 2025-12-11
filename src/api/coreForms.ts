import { api } from './client';

// Area Mapping
export interface AreaMapping {
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
  existing_committees?: string;
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
    const { data } = await api.post('/area-mappings', payload);
    return data;
  },
};

// Draft List
export interface DraftList {
  id?: number;
  division: string;
  district: string;
  town: string;
  uc: string;
  outreach: string;
  child_name: string;
  father_name: string;
  gender: string;
  date_of_birth: string;
  age_in_months: number;
  father_cnic?: string;
  house_number?: string;
  address: string;
  guardian_phone?: string;
  type: string;
  missed_vaccines: string[];
  reasons_of_missing: string;
  plan_for_coverage: string;
  latitude?: number;
  longitude?: number;
}

export const draftListApi = {
  list: async () => {
    const { data } = await api.get('/draft-lists');
    return data;
  },
  create: async (payload: DraftList) => {
    const { data } = await api.post('/draft-lists', payload);
    return data;
  },
};

// Participant type for forms with participants
export interface Participant {
  sr_no?: number;
  name: string;
  title_designation?: string;
  occupation?: string;
  address?: string;
  contact_no?: string;
  cnic?: string;
  gender?: string;
}

// Religious Leader
export interface ReligiousLeader {
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
export interface CommunityBarrier {
  id?: number;
  date: string;
  venue: string;
  uc: string;
  district: string;
  fix_site: string;
  outreach: string;
  community: string;
  group_type: string;
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
export interface HealthcareBarrier {
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
