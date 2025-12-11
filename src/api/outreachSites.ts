import { api } from './client';

export interface OutreachSite {
  id: number;
  district: string;
  union_council: string;
  fix_site: string;
  outreach_site: string;
  coordinates: string | null;
}

export const outreachSiteApi = {
  getDistricts: async (): Promise<string[]> => {
    const { data } = await api.get('/outreach-sites/districts');
    return data;
  },

  getUnionCouncils: async (district?: string): Promise<string[]> => {
    const params = district ? { district } : {};
    const { data } = await api.get('/outreach-sites/union-councils', { params });
    return data;
  },

  getFixSites: async (district?: string, unionCouncil?: string): Promise<string[]> => {
    const params: Record<string, string> = {};
    if (district) params.district = district;
    if (unionCouncil) params.union_council = unionCouncil;
    const { data } = await api.get('/outreach-sites/fix-sites', { params });
    return data;
  },

  getOutreachSites: async (district?: string, unionCouncil?: string, fixSite?: string): Promise<{ id: number; outreach_site: string; coordinates: string | null }[]> => {
    const params: Record<string, string> = {};
    if (district) params.district = district;
    if (unionCouncil) params.union_council = unionCouncil;
    if (fixSite) params.fix_site = fixSite;
    const { data } = await api.get('/outreach-sites/outreach', { params });
    return data;
  },

  create: async (site: Omit<OutreachSite, 'id'>): Promise<OutreachSite> => {
    const { data } = await api.post('/outreach-sites', site);
    return data.data;
  },
};
