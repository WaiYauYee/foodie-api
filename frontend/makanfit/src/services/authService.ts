// frontend/src/services/authService.ts

import {
  User,
  AuthResponse,
  LoginResponse,
  SignUpData,
  UpdateProfileData,
  UpdateProfileGoalsData,
  OnboardingData
} from '../types/types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

console.log('API_BASE_URL:', API_BASE_URL);

// export interface User {
//   userId: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   profile?: UserProfile;
// }

// export interface UserProfile {
//   profileId: string;
//   userId: string;
//   startWeightKg?: number;
//   currentWeightKg?: number;
//   goalWeightKg?: number;
//   activityLevel?: string;
//   dietaryGoal?: string;
//   goalOrigin?: string;
//   targetCalories?: number;
//   targetProteinG?: number;
//   targetCarbsG?: number;
//   targetFatG?: number;
//   targetFiberG?: number;
//   macroGoalOrigin?: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// ============================================
// SIGNUP
// ============================================

/**
 * Register a new user account
 * @param data - User signup information
 * @returns Promise with signup result
 */
export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = (await response.json()) as AuthResponse;

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Sign up failed',
      };
    }

    // After signup, user needs onboarding
    localStorage.setItem('makanfit_onboarding_done', 'false');

    return result;
  } catch (error) {
    console.error('SignUp Error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
};

// ============================================
// LOGIN
// ============================================

/**
 * Log in with email and password
 * @param email - User email
 * @param password - User password
 * @returns Promise with login result and token
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = (await response.json()) as LoginResponse;

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Login failed',
      };
    }

    // Store user data and JWT token
    if (result.user && result.token) {
      localStorage.setItem('makanfit_user', JSON.stringify(result.user));
      localStorage.setItem('makanfit_userId', result.user.userId);
      localStorage.setItem('makanfit_token', result.token);
      localStorage.setItem('makanfit_auth', 'true');

      // FIXED: Use backend's onboarding status to set localStorage flag
      // The backend returns onboardingRequired = true if onboarding_completed = false
      if (result.onboardingRequired) {
        localStorage.setItem('makanfit_onboarding_done', 'false');
      } else {
        localStorage.setItem('makanfit_onboarding_done', 'true');
      }
    }

    return result;
  } catch (error) {
    console.error('Login Error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
};

// ============================================
// ONBOARDING
// ============================================

export const completeOnboarding = async (
  userId: string,
  data: OnboardingData
): Promise<AuthResponse> => {
  const token = localStorage.getItem('makanfit_token');
  if (!token) {
    return { success: false, message: 'Unauthorized. Please log in.' };
  }

  try {
  const response = await fetch(`${API_BASE_URL}/api/auth/onboarding/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  // FIXED: After successful onboarding, update localStorage
    if (response.ok && result.user) {
      // Update user object with onboarding_completed = true
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('makanfit_user') || '{}'),
        ...result.user,
        onboardingComplete: true,
      };
      localStorage.setItem('makanfit_user', JSON.stringify(updatedUser));
      localStorage.setItem('makanfit_onboarding_done', 'true');
    }

  return { success: response.ok, message: result.message, ...result };
  } catch (error) {
    console.error('Onboarding Error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
};

// ============================================
// LOGOUT
// ============================================

/**
 * Log out the current user and clear stored data
 */
export const logOut = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('makanfit_token');
    if (token) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      });
    }
  } catch (err) {
    console.error('Backend logout failed:', err);
  } finally {
    // Clear local storage anyway
    localStorage.removeItem('makanfit_user');
    localStorage.removeItem('makanfit_userId');
    localStorage.removeItem('makanfit_token');
    localStorage.removeItem('makanfit_auth');
    localStorage.removeItem('makanfit_onboarding_done');
  }
};


// ============================================
// GET AUTH HEADERS
// ============================================

/**
 * Get headers with authorization token for API requests
 * @returns Object with authorization header if token exists
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('makanfit_token'); // JWT from login/signup
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ============================================
// GET CURRENT USER
// ============================================

/**
 * Get the currently logged-in user from localStorage
 * @returns User object or null if not logged in
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('makanfit_user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Error parsing user:', error);
    return null;
  }
};

// ============================================
// GET CURRENT TOKEN
// ============================================

/**
 * Get the current auth token from localStorage
 * @returns Auth token or null if not logged in
 */
export const getCurrentToken = (): string | null => {
  return localStorage.getItem('makanfit_token');
};

// ============================================
// IS AUTHENTICATED
// ============================================

/**
 * Check if user is currently authenticated
 * @returns true if user is logged in, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('makanfit_auth') === 'true';
};

// ============================================
// GET USER PROFILE
// ============================================

/**
 * Fetch user profile and health data
 * @param userId - The user ID to fetch
 * @returns Promise with user profile data
 */
export const getUserProfile = async (
  userId: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/profile/${userId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = (await response.json()) as AuthResponse;

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to fetch profile',
      };
    }

    return result;
  } catch (error) {
    console.error('Get Profile Error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
};

// ============================================
// UPDATE USER PROFILE
// ============================================

/**
 * Update user profile information (name, gender, height, birth date)
 * @param userId - The user ID to update
 * @param data - Profile data to update
 * @returns Promise with updated user profile
 */
export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileData
): Promise<AuthResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/profile/${userId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    const result = (await response.json()) as AuthResponse;

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to update profile',
      };
    }

    // Update cached user data if it exists
    if (result.user) {
      localStorage.setItem('makanfit_user', JSON.stringify(result.user));
    }

    return result;
  } catch (error) {
    console.error('Update Profile Error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
};

// ============================================
// UPDATE USER PROFILE GOALS
// ============================================

/**
 * Update user health and nutrition goals
 * @param userId - The user ID to update
 * @param data - Goals data to update
 * @returns Promise with updated profile goals
 */
export const updateUserProfileGoals = async (
  userId: string,
  data: UpdateProfileGoalsData
): Promise<AuthResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/profile/${userId}/goals`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    const result = (await response.json()) as AuthResponse;

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to update goals',
      };
    }

    return result;
  } catch (error) {
    console.error('Update Goals Error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
};

// ============================================
// VERIFY EMAIL
// ============================================

/**
 * Check if email is already registered
 * @param email - Email to check
 * @returns Promise with availability status
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/check-email?email=${encodeURIComponent(email)}`
    );

    if (!response.ok) {
      return false;
    }

    const result = (await response.json()) as { exists: boolean };
    return result.exists;
  } catch (error) {
    console.error('Check Email Error:', error);
    return false;
  }
};

// ============================================
// VERIFY TOKEN
// ============================================

/**
 * Verify if stored token is still valid
 * @returns Promise with validation result
 */
export const verifyToken = async (): Promise<boolean> => {
  try {
    const token = getCurrentToken();
    if (!token) return false;

    const response = await fetch(
      `${API_BASE_URL}/api/auth/verify-token`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Verify Token Error:', error);
    return false;
  }
};

// ============================================
// REFRESH TOKEN
// ============================================

/**
 * Refresh authentication token
 * @returns Promise with new token
 */
export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const result = (await response.json()) as AuthResponse;

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to refresh token',
      };
    }

    // Update token
    if (result.token) {
      localStorage.setItem('makanfit_token', result.token);
    }

    return result;
  } catch (error) {
    console.error('Refresh Token Error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
};

// ============================================
// REQUEST PASSWORD RESET
// ============================================

/**
 * Request password reset email
 * @param email - Email to reset password for
 * @returns Promise with reset request result
 */
export const requestPasswordReset = async (
  email: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/request-password-reset`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    );

    const result = (await response.json()) as AuthResponse;

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to request password reset',
      };
    }

    return result;
  } catch (error) {
    console.error('Request Password Reset Error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
};

// ============================================
// RESET PASSWORD
// ============================================

/**
 * Reset password with reset token
 * @param token - Password reset token
 * @param newPassword - New password
 * @returns Promise with reset result
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/reset-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      }
    );

    const result = (await response.json()) as AuthResponse;

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to reset password',
      };
    }

    return result;
  } catch (error) {
    console.error('Reset Password Error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
};