export type AdminPortalTheme = 'system' | 'light' | 'dark';

export type AdminPortalPageSize = 10 | 25 | 50 | 100;

export interface AdminPortalPreferences {
  id: number;
  user_id: number;
  theme: AdminPortalTheme;
  page_size: AdminPortalPageSize;
  sidebar_collapsed: boolean;
  created_at?: string;
  updated_at?: string;
}
