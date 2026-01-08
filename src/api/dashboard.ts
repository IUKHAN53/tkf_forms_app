import { api } from './client';

export interface DashboardStats {
  weekly_data: number[];
  recent_activity: RecentActivity[];
  totals: FormTotals;
  today: {
    count: number;
    percent_change: number;
  };
  this_week: number;
}

export interface RecentActivity {
  type: string;
  action: string;
  icon: string;
  time: string;
}

export interface FormTotals {
  child_line_lists: number;
  fgds_community: number;
  fgds_health_workers: number;
  bridging_the_gap: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>('/dashboard/stats');
  return response.data;
}
