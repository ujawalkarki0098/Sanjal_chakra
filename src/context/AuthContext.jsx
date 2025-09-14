// src/context/AuthContext.js

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AUTH_STATES, STORAGE_KEYS, ERROR_MESSAGES } from '../utils/constants';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check existing auth
  authState: AUTH_STATES.IDLE,
  error: null,
  successMessage: null,
  pendingVerificationEmail: null, // For OTP flow
  rememberEmail: '', // For login form
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_AUTH_STATE: 'SET_AUTH_STATE',
  SET_ERROR: 'SET_ERROR',
  SET_SUCCESS_MESSAGE: 'SET_SUCCESS_MESSAGE',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
  OTP_PENDING: 'OTP_PENDING',
  OTP_VERIFIED: 'OTP_VERIFIED',
  SET_REMEMBER_EMAIL: 'SET_REMEMBER_EMAIL',
  RESTORE_AUTH: 'RESTORE_AUTH',
  // NEW Account Management Actions
  UPDATE_PROFILE_SUCCESS: 'UPDATE_PROFILE_SUCCESS',
  PASSWORD_CHANGE_SUCCESS: 'PASSWORD_CHANGE_SUCCESS',
  AVATAR_UPDATE_SUCCESS: 'AVATAR_UPDATE_SUCCESS',
  ACCOUNT_DELETE_SUCCESS: 'ACCOUNT_DELETE_SUCCESS',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.SET_AUTH_STATE:
      return {
        ...state,
        authState: action.payload,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        successMessage: null,
      };

    case AUTH_ACTIONS.SET_SUCCESS_MESSAGE:
      return {
        ...state,
        successMessage: action.payload,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_MESSAGES:
      return {
        ...state,
        error: null,
        successMessage: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        authState: AUTH_STATES.SUCCESS,
        error: null,
        pendingVerificationEmail: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authState: AUTH_STATES.IDLE,
        error: null,
        successMessage: null,
        pendingVerificationEmail: null,
      };

    case AUTH_ACTIONS.SIGNUP_SUCCESS:
      return {
        ...state,
        isLoading: false,
        authState: AUTH_STATES.OTP_PENDING,
        error: null,
        pendingVerificationEmail: action.payload.email,
      };

    case AUTH_ACTIONS.OTP_PENDING:
      return {
        ...state,
        authState: AUTH_STATES.OTP_PENDING,
        pendingVerificationEmail: action.payload.email,
        isLoading: false,
      };

    case AUTH_ACTIONS.OTP_VERIFIED:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        authState: AUTH_STATES.OTP_VERIFIED,
        isLoading: false,
        error: null,
        pendingVerificationEmail: null,
      };

    case AUTH_ACTIONS.SET_REMEMBER_EMAIL:
      return {
        ...state,
        rememberEmail: action.payload,
      };

    case AUTH_ACTIONS.RESTORE_AUTH:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: action.payload.isAuthenticated,
        isLoading: false,
        authState: action.payload.isAuthenticated ? AUTH_STATES.SUCCESS : AUTH_STATES.IDLE,
      };

    // NEW Account Management Cases
    case AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        user: { ...state.user, ...action.payload.user },
        isLoading: false,
        error: null,
        successMessage: 'Profile updated successfully!',
      };

    case AUTH_ACTIONS.PASSWORD_CHANGE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        successMessage: 'Password changed successfully!',
      };

    case AUTH_ACTIONS.AVATAR_UPDATE_SUCCESS:
      return {
        ...state,
        user: { ...state.user, avatar: action.payload.avatar },
        isLoading: false,
        error: null,
        successMessage: 'Profile picture updated successfully!',
      };

    case AUTH_ACTIONS.ACCOUNT_DELETE_SUCCESS:
      return {
        ...initialState, // Reset to initial state
        isLoading: false,
        successMessage: 'Account deleted successfully!',
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Helper functions
  const setLoading = (loading) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error });
  };

  const setSuccessMessage = (message) => {
    dispatch({ type: AUTH_ACTIONS.SET_SUCCESS_MESSAGE, payload: message });
  };

  const clearMessages = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_MESSAGES });
  };

  const setAuthState = (authState) => {
    dispatch({ type: AUTH_ACTIONS.SET_AUTH_STATE, payload: authState });
  };
  // ✅ Add this directly below
const setUser = (user) => {
  dispatch({
    type: user ? AUTH_ACTIONS.LOGIN_SUCCESS : AUTH_ACTIONS.LOGOUT,
    payload: { user },
  });
};

  // Storage helper functions
  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const getFromStorage = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  };

  const removeFromStorage = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  };

  // EXISTING Auth action functions
  const login = async (credentials) => {
    try {
      setLoading(true);
      clearMessages();

      // Mock API call - replace with real API later
      await new Promise(resolve => setTimeout(resolve, 0)); // Simulate API delay reduced to 0ms

      // Mock successful login response
      const mockUser = {
        id: '1',
        fullName: 'John Doe',
        email: credentials.email,
        isVerified: true,
      };

      const mockTokens = {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
      };

      // Save to localStorage
      saveToStorage(STORAGE_KEYS.USER_DATA, mockUser);
      saveToStorage(STORAGE_KEYS.AUTH_TOKEN, mockTokens.accessToken);
      saveToStorage(STORAGE_KEYS.REFRESH_TOKEN, mockTokens.refreshToken);

      // Save remember email if provided
      if (credentials.rememberEmail) {
        saveToStorage(STORAGE_KEYS.REMEMBER_EMAIL, credentials.email);
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: mockUser, tokens: mockTokens },
      });

      return { success: true, user: mockUser };
    } catch (error) {
      setError(error.message || ERROR_MESSAGES.UNEXPECTED_ERROR);
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      clearMessages();

      // Mock API call - replace with real API later
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      dispatch({
        type: AUTH_ACTIONS.SIGNUP_SUCCESS,
        payload: { email: userData.email },
      });

      return { success: true, email: userData.email };
    } catch (error) {
      setError(error.message || ERROR_MESSAGES.UNEXPECTED_ERROR);
      return { success: false, error: error.message };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      setLoading(true);
      clearMessages();

      // Mock API call - replace with real API later
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      // Mock successful verification response
      const mockUser = {
        id: '2',
        fullName: 'New User',
        email: email,
        isVerified: true,
      };

      const mockTokens = {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
      };

      // Save to localStorage
      saveToStorage(STORAGE_KEYS.USER_DATA, mockUser);
      saveToStorage(STORAGE_KEYS.AUTH_TOKEN, mockTokens.accessToken);
      saveToStorage(STORAGE_KEYS.REFRESH_TOKEN, mockTokens.refreshToken);

      dispatch({
        type: AUTH_ACTIONS.OTP_VERIFIED,
        payload: { user: mockUser, tokens: mockTokens },
      });

      return { success: true, user: mockUser };
    } catch (error) {
      setError(error.message || ERROR_MESSAGES.INVALID_OTP);
      return { success: false, error: error.message };
    }
  };

  const resendOTP = async (email) => {
    try {
      setLoading(true);
      clearMessages();

      // Mock API call - replace with real API later
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      setSuccessMessage('Verification code sent successfully!');
      setLoading(false);

      return { success: true };
    } catch (error) {
      setError(error.message || ERROR_MESSAGES.OTP_SEND_FAILED);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Clear localStorage
      removeFromStorage(STORAGE_KEYS.USER_DATA);
      removeFromStorage(STORAGE_KEYS.AUTH_TOKEN);
      removeFromStorage(STORAGE_KEYS.REFRESH_TOKEN);

      dispatch({ type: AUTH_ACTIONS.LOGOUT });

      return { success: true };
    } catch (error) {
      setError(error.message || ERROR_MESSAGES.UNEXPECTED_ERROR);
      return { success: false, error: error.message };
    }
  };

  // NEW Account Management Functions
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      clearMessages();

      // Mock API call - replace with real API later
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful update
      const updatedUser = {
        ...state.user,
        ...profileData,
        updatedAt: new Date().toISOString(),
      };

      // Update localStorage
      saveToStorage(STORAGE_KEYS.USER_DATA, updatedUser);

      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS,
        payload: { user: updatedUser },
      });

      return { success: true, user: updatedUser };
    } catch (error) {
      setError(error.message || 'Profile update failed');
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      clearMessages();

      // Mock API call - replace with real API later
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In real implementation, you would:
      // 1. Verify current password
      // 2. Hash new password on backend
      // 3. Update password in database

      dispatch({
        type: AUTH_ACTIONS.PASSWORD_CHANGE_SUCCESS,
      });

      return { success: true };
    } catch (error) {
      setError(error.message || 'Password change failed');
      return { success: false, error: error.message };
    }
  };

  const updateAvatar = async (avatarFile) => {
    try {
      setLoading(true);
      clearMessages();

      // Mock API call - replace with real API later
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock avatar URL (in real app, you'd upload to cloud storage)
      const mockAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;

      const updatedUser = {
        ...state.user,
        avatar: mockAvatarUrl,
        updatedAt: new Date().toISOString(),
      };

      // Update localStorage
      saveToStorage(STORAGE_KEYS.USER_DATA, updatedUser);

      dispatch({
        type: AUTH_ACTIONS.AVATAR_UPDATE_SUCCESS,
        payload: { avatar: mockAvatarUrl },
      });

      return { success: true, avatar: mockAvatarUrl };
    } catch (error) {
      setError(error.message || 'Avatar update failed');
      return { success: false, error: error.message };
    }
  };

  const deleteAccount = async (confirmationData) => {
    try {
      setLoading(true);
      clearMessages();

      // Mock API call - replace with real API later
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In real implementation, you would:
      // 1. Verify user password/confirmation
      // 2. Mark account as deleted or remove from database
      // 3. Clean up user data, posts, etc.

      // Clear all storage
      removeFromStorage(STORAGE_KEYS.USER_DATA);
      removeFromStorage(STORAGE_KEYS.AUTH_TOKEN);
      removeFromStorage(STORAGE_KEYS.REFRESH_TOKEN);
      removeFromStorage(STORAGE_KEYS.REMEMBER_EMAIL);

      dispatch({
        type: AUTH_ACTIONS.ACCOUNT_DELETE_SUCCESS,
      });

      return { success: true };
    } catch (error) {
      setError(error.message || 'Account deletion failed');
      return { success: false, error: error.message };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      clearMessages();

      // Mock API call - replace with real API later
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMessage('Password reset link sent to your email!');
      setLoading(false);

      return { success: true };
    } catch (error) {
      setError(error.message || 'Failed to send reset email');
      return { success: false, error: error.message };
    }
  };

  const setRememberEmail = (email) => {
    dispatch({ type: AUTH_ACTIONS.SET_REMEMBER_EMAIL, payload: email });
    if (email) {
      saveToStorage(STORAGE_KEYS.REMEMBER_EMAIL, email);
    } else {
      removeFromStorage(STORAGE_KEYS.REMEMBER_EMAIL);
    }
  };

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const userData = getFromStorage(STORAGE_KEYS.USER_DATA);
      const authToken = getFromStorage(STORAGE_KEYS.AUTH_TOKEN);
      const rememberEmail = getFromStorage(STORAGE_KEYS.REMEMBER_EMAIL);

      if (userData && authToken) {
        dispatch({
          type: AUTH_ACTIONS.RESTORE_AUTH,
          payload: {
            user: userData,
            isAuthenticated: true,
          },
        });
      } else {
        dispatch({
          type: AUTH_ACTIONS.RESTORE_AUTH,
          payload: {
            user: null,
            isAuthenticated: false,
          },
        });
      }

      if (rememberEmail) {
        setRememberEmail(rememberEmail);
      }
    };

    checkAuth();
  }, []);

  // Context value
  const value = {
    // State
    ...state,
    
    // Existing Authentication Actions
    login,
    signup,
    logout,
    verifyOTP,
    resendOTP,
    
    // NEW Account Management Actions
    updateProfile,
    changePassword,
    updateAvatar,
    deleteAccount,
    requestPasswordReset,
    
    // Helpers
    setLoading,
    setError,
    setSuccessMessage,
    clearMessages,
    setAuthState,
    setRememberEmail,
    
    // Storage helpers
    saveToStorage,
    getFromStorage,
    removeFromStorage,

     // ✅ Newly added
  setUser,
};
  

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;