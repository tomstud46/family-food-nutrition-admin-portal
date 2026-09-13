import { http } from './http';
import type { NotificationPreferences } from '../types/notificationPreferences';

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const response = await http.get<{ data: NotificationPreferences }>(
    '/notification-preferences',
  );

  return response.data.data;
}

export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const response = await http.patch<{ data: NotificationPreferences }>(
    '/notification-preferences',
    preferences,
  );

  return response.data.data;
}
