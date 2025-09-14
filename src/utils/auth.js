// src/utils/auth.js

import { ERROR_MESSAGES } from './constants';

// ALL possible token storage keys (to handle inconsistencies)
const ALL_TOKEN_KEYS = [
  'access_token',
  'accessToken', 
  'auth_token',
  'token',
  'refresh_token',
  'refreshToken',
  'user_data',
  'userData',
  'user',
  'currentUser',
  'authUser',
  'token_expiry',
  'tokenExpiry',
];

// Primary token storage keys (what we'll use going forward)
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token', 
  USER_DATA: 'user_data',
  TOKEN_EXPIRY: 'token_expiry',
};

// Auth utility functions
export const auth = {
  // Token management - UNIFIED VERSION
  getAccessToken: () => {
    try {
      // Check all possible token keys
      const possibleKeys = ['access_token', 'accessToken', 'auth_token', 'token'];
      
      for (const key of possibleKeys) {
        const token = localStorage.getItem(key);
        if (token) {
          console.log(`Found token in: ${key}`);
          return token;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  getRefreshToken: () => {
    try {
      // Check all possible refresh token keys
      const possibleKeys = ['refresh_token', 'refreshToken'];
      
      for (const key of possibleKeys) {
        const token = localStorage.getItem(key);
        if (token) {
          console.log(`Found refresh token in: ${key}`);
          return token;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  setTokens: (accessToken, refreshToken, expiresIn) => {
    try {
      // Store in primary keys
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      
      // Also store in common alternative keys for compatibility
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('token', accessToken);
      
      if (refreshToken) {
        localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
      }
      
      // Set expiry time (in milliseconds)
      if (expiresIn) {
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());
      }
      
      console.log('Auth tokens stored successfully');
    } catch (error) {
      console.error('Error storing auth tokens:', error);
    }
  },

  clearTokens: () => {
    try {
      console.log('Clearing ALL possible auth tokens...');
      
      // Clear ALL possible token keys to ensure complete cleanup
      ALL_TOKEN_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          console.log(`Removing: ${key}`);
          localStorage.removeItem(key);
        }
      });
      
      // Also clear sessionStorage
      sessionStorage.clear();
      
      console.log('All auth tokens cleared successfully');
    } catch (error) {
      console.error('Error clearing auth tokens:', error);
    }
  },

  isTokenExpired: () => {
    try {
      const expiry = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
      if (!expiry) return true;
      
      return Date.now() > parseInt(expiry);
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  },

  // User data management
  setUserData: (userData) => {
    try {
      // Store in primary key
      localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
      
      // Store in alternative keys for compatibility
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  },

  getUserData: () => {
    try {
      // Check all possible user data keys
      const possibleKeys = ['user_data', 'userData', 'user', 'currentUser', 'authUser'];
      
      for (const key of possibleKeys) {
        const userData = localStorage.getItem(key);
        if (userData) {
          return JSON.parse(userData);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  clearUserData: () => {
    try {
      // Clear all possible user data keys
      const userKeys = ['user_data', 'userData', 'user', 'currentUser', 'authUser'];
      
      userKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          console.log(`Removing user data: ${key}`);
          localStorage.removeItem(key);
        }
      });
      
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  },

  // Authentication state - IMPROVED VERSION
  isAuthenticated: () => {
    const token = auth.getAccessToken();
    console.log('Checking authentication, token found:', !!token);
    
    if (!token) {
      console.log('No token found, user not authenticated');
      return false;
    }
    
    // For mock tokens, skip expiry check
    if (token.startsWith('mock_')) {
      console.log('Mock token detected, considering as authenticated');
      return true;
    }
    
    // Check if token is expired
    if (auth.isTokenExpired()) {
      console.log('Token expired, clearing tokens');
      auth.clearTokens();
      return false;
    }
    
    console.log('User is authenticated');
    return true;
  },

  // JWT utilities
  decodeToken: (token) => {
    try {
      if (!token) return null;
      
      // Skip decoding for mock tokens
      if (token.startsWith('mock_')) {
        return {
          sub: 'mock_user',
          email: 'mock@test.com',
          exp: Date.now() / 1000 + 3600, // 1 hour from now
        };
      }
      
      const payload = token.split('.')[1];
      if (!payload) return null;
      
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  getUserFromToken: () => {
    const token = auth.getAccessToken();
    if (!token) return null;
    
    const decoded = auth.decodeToken(token);
    return decoded ? {
      id: decoded.sub || decoded.userId,
      email: decoded.email,
      role: decoded.role,
      exp: decoded.exp,
      iat: decoded.iat,
    } : null;
  },

  // Authorization header
  formatAuthHeader: () => {
    const token = auth.getAccessToken();
    return token ? `Bearer ${token}` : null;
  },

  // Session management
  refreshSession: async () => {
    const refreshToken = auth.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      console.log('Refreshing session...');
      return {
        success: false,
        message: 'Session refresh not implemented yet',
      };
    } catch (error) {
      console.error('Session refresh failed:', error);
      auth.clearTokens();
      throw error;
    }
  },

  // FIXED Logout - Force clear everything and redirect
  logout: () => {
    console.log('Auth utility logout called');
    
    auth.clearTokens();
    auth.clearUserData();
    
    // Clear additional app data
    try {
      const appKeys = [
        'user_preferences',
        'app_settings', 
        'cached_data',
        'theme_preference'
      ];
      
      appKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
    } catch (error) {
      console.error('Error clearing app data:', error);
    }
    
    console.log('All auth data cleared, redirecting to login');
    
    // Force redirect
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
};

// Enhanced validation functions (keeping your existing ones)
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: ERROR_MESSAGES.EMAIL_REQUIRED };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);

  return {
    isValid,
    message: isValid ? '' : ERROR_MESSAGES.INVALID_EMAIL_FORMAT,
  };
};

export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options;

  if (!password) {
    return { isValid: false, message: ERROR_MESSAGES.PASSWORD_REQUIRED };
  }

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters long`,
    };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (requireNumbers && !/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character',
    };
  }

  return { isValid: true, message: 'Password is valid' };
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, message: ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED };
  }

  const isValid = password === confirmPassword;
  return {
    isValid,
    message: isValid ? '' : ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH,
  };
};

// Utility functions for backward compatibility and apiClient
export const getAuthToken = auth.getAccessToken;
export const getRefreshToken = auth.getRefreshToken;
export const saveAuthToken = (token) => {
  // Store token in all common formats
  localStorage.setItem('access_token', token);
  localStorage.setItem('auth_token', token);
  localStorage.setItem('token', token);
};
export const clearAuthTokens = auth.clearTokens;
export const isAuthenticated = auth.isAuthenticated;

// For apiClient compatibility
export const utils = {
  getAuthToken: auth.getAccessToken,
  getRefreshToken: auth.getRefreshToken,
  saveAuthToken: saveAuthToken,
  clearAuthTokens: auth.clearTokens,
};

// Export individual functions
export {
  auth as default,
};

// Debug function to see all stored keys
export const debugAuth = () => {
  console.log('=== AUTH DEBUG ===');
  ALL_TOKEN_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      console.log(`${key}: ${value.substring(0, 20)}...`);
    }
  });
  console.log('==================');
};