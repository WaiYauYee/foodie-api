import { getAuthHeaders } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface NotificationSettingsData {
  mealRemindersEnabled: boolean;
  waterReminderEnabled: boolean;
  weightRemindersEnabled: boolean;
  mealTimes: { mealType: 'breakfast' | 'lunch' | 'dinner'; time: string }[];
}

type Result =
  | { success: true; settings: NotificationSettingsData }
  | { success: false; message: string };

const NETWORK_ERROR = { success: false as const, message: 'Network error. Please try again.' };

export const getNotificationSettings = async (userId: string): Promise<Result> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/notifications/${userId}`, { headers: getAuthHeaders() });
    const body = await res.json();
    if (!res.ok) return { success: false, message: body.message || 'Failed to load settings' };
    return body;
  } catch (e) {
    console.error('Get Notifications Error:', e);
    return NETWORK_ERROR;
  }
};

export const saveNotificationSettings = async (
  userId: string,
  patch: Partial<NotificationSettingsData>
): Promise<Result> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/notifications/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(patch),
    });
    const body = await res.json();
    if (!res.ok) return { success: false, message: body.message || 'Failed to save settings' };
    return body;
  } catch (e) {
    console.error('Save Notifications Error:', e);
    return NETWORK_ERROR;
  }
};