// frontend/src/services/dashboardService.ts
import { WeightEntry } from '../types/types';
import { getAuthHeaders } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export type DashboardRange = 7 | 30 | 90;

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  waterMl: number;
  mealCount: number;
  logged: boolean;
}

export interface DashboardData {
  range: DashboardRange;
  today: DailyPoint;
  history: DailyPoint[]; // oldest -> today, always `range` items
  averages: {
    daysLogged: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  weight: {
    start: number | null;
    current: number | null;
    goal: number | null;
    remaining: number | null;
    bmi: number | null;
    entries: WeightEntry[]; // newest first
  };
}

type Fail = { success: false; message: string };

const NETWORK_ERROR: Fail = { success: false, message: 'Network error. Please try again.' };

export const getDashboard = async (
  userId: string,
  range: DashboardRange
): Promise<({ success: true } & DashboardData) | Fail> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dashboard/${userId}?range=${range}`, {
      headers: getAuthHeaders(),
    });
    const body = await res.json();
    if (!res.ok) return { success: false, message: body.message || 'Failed to load dashboard' };
    return body;
  } catch (error) {
    console.error('Get Dashboard Error:', error);
    return NETWORK_ERROR;
  }
};

export const addWeight = async (
  userId: string,
  weight: number,
  recordedAt?: number
): Promise<
  { success: true; entry: WeightEntry; currentWeight: number; bmi: number | null } | Fail
> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/weight/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ weight, recordedAt }),
    });
    const body = await res.json();
    if (!res.ok) return { success: false, message: body.message || 'Failed to log weight' };
    return body;
  } catch (error) {
    console.error('Add Weight Error:', error);
    return NETWORK_ERROR;
  }
};

export const deleteWeight = async (
  userId: string,
  entryId: string
): Promise<{ success: true; currentWeight: number | null } | Fail> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/weight/${userId}/${entryId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const body = await res.json();
    if (!res.ok) return { success: false, message: body.message || 'Failed to delete entry' };
    return body;
  } catch (error) {
    console.error('Delete Weight Error:', error);
    return NETWORK_ERROR;
  }
};