// src/hooks/useLogout.js

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { auth } from '../utils/auth';
import { useAuthContext } from '../context/AuthContext';


const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingLogoutOptions, setPendingLogoutOptions] = useState(null);
  const navigate = useNavigate();
  const authContext = useAuthContext();


  // Enhanced token clearing - handles all possible token keys
  const clearAllAuthData = useCallback(() => {
    console.log('Clearing all authentication data...');
    
    try {
      // Use the unified auth utility first
      auth.clearTokens();
      auth.clearUserData();
      
      // Additional direct clearing for extra safety
      const allAuthKeys = [
        'access_token', 'accessToken', 'auth_token', 'token',
        'refresh_token', 'refreshToken', 
        'user', 'userData', 'user_data', 'currentUser', 'authUser',
        'token_expiry', 'tokenExpiry'
      ];
      
      allAuthKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          console.log(`Removing localStorage key: ${key}`);
          localStorage.removeItem(key);
        }
      });
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear app-specific data
      clearAppData();
      
      console.log('All authentication data cleared successfully');
      
    } catch (error) {
      console.error('Error clearing auth data:', error);
      
      // Fallback: Clear everything in localStorage that looks auth-related
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.toLowerCase().includes('token') || 
              key.toLowerCase().includes('user') || 
              key.toLowerCase().includes('auth')) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
      } catch (fallbackError) {
        console.error('Fallback clear also failed:', fallbackError);
      }
    }
  }, []);

  // Standard logout
  const logout = useCallback(async (options = {}) => {
    const {
      redirectTo = '/login',
      clearData = true,
      showConfirmation = false,
    } = options;

    console.log('Logout initiated with options:', options);

    if (showConfirmation) {
      console.log('Showing confirmation modal');
      setPendingLogoutOptions(options);
      setShowConfirmModal(true);
      return false;
    }

    setIsLoggingOut(true);
    setError(null);

    try {
      console.log('Calling authService.logout()...');
      
      // Call backend logout endpoint if available
      if (authService && authService.logout) {
        const response = await authService.logout();
        
        if (response.success) {
          console.log('Server logout successful');
        } else {
          console.warn('Server logout failed, proceeding with local cleanup:', response.error);
        }
      } else {
        console.log('No authService.logout available');
      }

    } catch (err) {
      console.error('Server logout error:', err);
      // Continue with local cleanup even if server call fails
    }

    // Always clear local authentication data
    if (clearData) {
      console.log('Clearing local authentication data...');
      clearAllAuthData();
      if (authContext?.setUser) {
  authContext.setUser(null); // 👈 Clear user from context immediately
       }
    }

    // Redirect with multiple fallback methods
    if (redirectTo) {
      console.log(`Redirecting to: ${redirectTo}`);
      
      try {
        // Primary redirect method
        navigate(redirectTo, { replace: true });
        
        // Backup redirect method with delay
        setTimeout(() => {
          if (window.location.pathname !== redirectTo) {
            console.log('Backup redirect triggered');
            window.location.href = redirectTo;
          }
        }, 100);
        
      } catch (redirectError) {
        console.error('Navigation error, using window.location:', redirectError);
        window.location.href = redirectTo;
      }
    }

    console.log('Logout completed successfully');
    setIsLoggingOut(false);
    return true;

  }, [navigate, clearAllAuthData]);

  // Handle confirmation modal confirm
  const handleConfirmLogout = useCallback(async () => {
    console.log('User confirmed logout');
    setShowConfirmModal(false);
    
    if (pendingLogoutOptions) {
      const result = await logout({ ...pendingLogoutOptions, showConfirmation: false });
      setPendingLogoutOptions(null);
      return result;
    }
    
    return false;
  }, [logout, pendingLogoutOptions]);

  // Handle confirmation modal cancel
  const handleCancelLogout = useCallback(() => {
    console.log('User cancelled logout');
    setShowConfirmModal(false);
    setPendingLogoutOptions(null);
  }, []);

  // Force logout (immediate, no server call)
  const forceLogout = useCallback((redirectTo = '/login') => {
    console.log('Force logout initiated');
    setIsLoggingOut(true);
    
    try {
      // Clear all local data immediately
      clearAllAuthData();
      
      console.log('Force logout: All data cleared');
      
      // Force redirect immediately
      if (redirectTo) {
        console.log(`Force logout: Redirecting to ${redirectTo}`);
        window.location.href = redirectTo;
      }
      
      return true;
      
    } catch (err) {
      console.error('Force logout error:', err);
      
      // Ultimate fallback
      try {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = redirectTo;
      } catch (fallbackError) {
        console.error('Force logout fallback failed:', fallbackError);
      }
      
      return false;
    } finally {
      setIsLoggingOut(false);
    }
  }, [clearAllAuthData]);

  // Logout from all devices (backend feature)
  const logoutFromAllDevices = useCallback(async (options = {}) => {
    const {
      redirectTo = '/login',
      showConfirmation = true,
    } = options;

    console.log('Logout from all devices requested');

    if (showConfirmation) {
      setPendingLogoutOptions({ ...options, isAllDevices: true });
      setShowConfirmModal(true);
      return false;
    }

    setIsLoggingOut(true);
    setError(null);

    try {
      // Call backend to invalidate all sessions
      if (authService && authService.logoutFromAllDevices) {
        console.log('Calling backend logoutFromAllDevices...');
        const response = await authService.logoutFromAllDevices();
        
        if (!response.success) {
          const errorMessage = response.error || 'Failed to logout from all devices';
          setError(errorMessage);
          console.error('Logout from all devices failed:', errorMessage);
          return false;
        }
        
        console.log('Backend logout from all devices successful');
      } else {
        console.warn('logoutFromAllDevices not available, falling back to regular logout');
        // Fallback to regular logout if all-devices logout not available
        return await logout({ redirectTo, showConfirmation: false });
      }

      // Clear local data
      clearAllAuthData();

      // Redirect
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        
        // Backup redirect
        setTimeout(() => {
          if (window.location.pathname !== redirectTo) {
            window.location.href = redirectTo;
          }
        }, 100);
      }

      console.log('Logout from all devices completed successfully');
      return true;

    } catch (err) {
      const errorMessage = err.message || 'Failed to logout from all devices';
      setError(errorMessage);
      console.error('Logout from all devices error:', err);
      
      // Even if all-devices logout fails, do local logout
      console.log('Falling back to local logout due to error');
      clearAllAuthData();
      
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      }
      
      return false;
    } finally {
      setIsLoggingOut(false);
    }
  }, [navigate, clearAllAuthData, logout]);

  // Session expired logout
  const handleSessionExpired = useCallback((message = 'Session expired. Please log in again.') => {
    console.log('Session expired, performing automatic logout');
    
    // Clear local data immediately
    clearAllAuthData();
    
    // Redirect to login with message
    navigate('/login', { 
      replace: true,
      state: { message }
    });
    
    // Backup redirect
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }, 100);
    
  }, [navigate, clearAllAuthData]);

  // Clear app-specific data
  const clearAppData = useCallback(() => {
    try {
      console.log('Clearing app-specific data...');
      
      const keysToRemove = [
        'user_preferences',
        'app_settings',
        'draft_posts',
        'cached_data',
        'theme_preference',
        'shopping_cart',
        'recent_searches',
        'notification_settings',
        'language_preference',
        'timezone_setting',
      ];
      
      keysToRemove.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          console.log(`Removing app data: ${key}`);
          localStorage.removeItem(key);
        }
      });
      
      console.log('App-specific data cleared');
      
    } catch (err) {
      console.error('Error clearing app data:', err);
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if user should be logged out
  const shouldLogout = useCallback(() => {
    const isAuth = auth.isAuthenticated();
    const isExpired = auth.isTokenExpired();
    
    console.log('Checking if should logout - authenticated:', isAuth, 'expired:', isExpired);
    
    return !isAuth || isExpired;
  }, []);

  // Auto logout when conditions are met
  const checkAndLogout = useCallback((customMessage) => {
    if (shouldLogout()) {
      console.log('Auto logout triggered');
      handleSessionExpired(customMessage);
      return true;
    }
    return false;
  }, [shouldLogout, handleSessionExpired]);

  // Logout with custom success callback
  const logoutWithCallback = useCallback(async (options = {}, onSuccess, onError) => {
    const {
      redirectTo = '/login',
      showConfirmation = false,
    } = options;

    try {
      const result = await logout({ redirectTo, showConfirmation });
      
      if (result && onSuccess) {
        onSuccess();
      }
      
      return result;
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        setError(error.message || 'Logout failed');
      }
      return false;
    }
  }, [logout]);

  // Silent logout (no redirects, just clear data)
  const silentLogout = useCallback(() => {
    console.log('Silent logout performed');
    
    try {
      clearAllAuthData();
      return true;
    } catch (error) {
      console.error('Silent logout error:', error);
      return false;
    }
  }, [clearAllAuthData]);

  // Get logout status info
  const getLogoutInfo = useCallback(() => {
    return {
      isLoggingOut,
      hasError: !!error,
      errorMessage: error,
      isAuthenticated: auth.isAuthenticated(),
      tokenExpired: auth.isTokenExpired(),
      shouldAutoLogout: shouldLogout(),
    };
  }, [isLoggingOut, error, shouldLogout]);

  return {
    // State
    isLoggingOut,
    error,
    showConfirmModal,
    pendingLogoutOptions,

    // Core logout actions
    logout,
    forceLogout,
    silentLogout,
    logoutWithCallback,

    // Advanced logout features
    logoutFromAllDevices,
    handleSessionExpired,
    checkAndLogout,
    shouldLogout,

    // Modal handling
    handleConfirmLogout,
    handleCancelLogout,

    // Utility functions
    clearError,
    clearAppData,
    clearAllAuthData,
    getLogoutInfo,
  };
};

export default useLogout;