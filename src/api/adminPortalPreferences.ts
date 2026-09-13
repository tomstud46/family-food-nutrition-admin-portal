import { http } from './http';
import type { AdminPortalPreferences } from '../types/adminPortalPreferences';

interface AdminPortalPreferencesResponse {
  data: AdminPortalPreferences;
}

export type UpdateAdminPortalPreferencesPayload = Partial<
  Pick<
    AdminPortalPreferences,
    'theme' | 'page_size' | 'sidebar_collapsed'
  >
>;

export async function getAdminPortalPreferences(): Promise<AdminPortalPreferences> {
  const response =
    await http.get<AdminPortalPreferencesResponse>(
      '/admin-portal-preferences',
    );

  return response.data.data;
}

export async function updateAdminPortalPreferences(
  payload: UpdateAdminPortalPreferencesPayload,
): Promise<AdminPortalPreferences> {
  const response =
    await http.patch<AdminPortalPreferencesResponse>(
      '/admin-portal-preferences',
      payload,
    );

  return response.data.data;
}
