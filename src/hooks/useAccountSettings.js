// src/hooks/useAccount.js

import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import { auth } from '../utils/auth';

const useAccount = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = auth.isAuthenticated();
      setIsAuthenticated(authStatus);
      
      if (authStatus) {
        const userData = auth.getUserData();
        if (userData) {
          setUser(userData);
        } else {
          // If no user data in storage, fetch from token or API
          fetchUserProfile();
        }
      }
    };

    checkAuthStatus();
  }, []);

  // Fetch user profile
  const fetchUserProfile = useCallback(async (userId = null) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getProfile(userId);
      
      if (response.success) {
        setUser(response.data);
        // Store user data in localStorage
        auth.setUserData(response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch user profile';
      setError(errorMessage);
      console.error('Profile fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (passwordData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.changePassword(passwordData);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to change password';
      setError(errorMessage);
      console.error('Password change error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete account
  const deleteAccount = useCallback(async (confirmationData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.deleteAccount(confirmationData);
      
      if (response.success) {
        // Clear all user data
        setUser(null);
        setIsAuthenticated(false);
        auth.clearTokens();
        auth.clearUserData();
        
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete account';
      setError(errorMessage);
      console.error('Account deletion error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user activity
  const getUserActivity = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getUserActivity();
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch user activity';
      setError(errorMessage);
      console.error('User activity error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update privacy settings
  const updatePrivacySettings = useCallback(async (privacyData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.updatePrivacySettings(privacyData);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update privacy settings';
      setError(errorMessage);
      console.error('Privacy settings error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update notification settings
  const updateNotificationSettings = useCallback(async (notificationData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.updateNotificationSettings(notificationData);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update notification settings';
      setError(errorMessage);
      console.error('Notification settings error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user posts
  const getUserPosts = useCallback(async (userId = null, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getUserPosts(userId, params);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch user posts';
      setError(errorMessage);
      console.error('User posts error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Export user data
  const exportUserData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.exportUserData();
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to export user data';
      setError(errorMessage);
      console.error('Data export error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (isAuthenticated) {
      await fetchUserProfile();
    }
  }, [isAuthenticated, fetchUserProfile]);

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,

    // Actions
    fetchUserProfile,
    changePassword,
    deleteAccount,
    getUserActivity,
    updatePrivacySettings,
    updateNotificationSettings,
    getUserPosts,
    exportUserData,
    refreshUser,
    clearError,
  };
};

export default useAccount;