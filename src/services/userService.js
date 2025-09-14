// src/services/userService.js

import apiClient from './apiClient';
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';

// User service for account management (excluding profile editing)
const userService = {
  // Get user profile
  getProfile: async (userId) => {
    try {
      console.log('UserService: Getting user profile:', userId);

      // For mock API
      if (apiClient === require('./apiClient').mockApiClient) {
        return await mockGetProfile(userId);
      }

      const endpoint = userId 
        ? `${API_ENDPOINTS.USER.PROFILE}/${userId}`
        : API_ENDPOINTS.USER.PROFILE;

      const response = await apiClient.get(endpoint);

      if (response.success) {
        console.log('UserService: Profile retrieved successfully');
        return {
          success: true,
          data: response.data.user,
        };
      }

      return response;
    } catch (error) {
      console.error('UserService: Get profile error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      console.log('UserService: Changing password');

      // For mock API
      if (apiClient === require('./apiClient').mockApiClient) {
        return await mockChangePassword(passwordData);
      }

      const response = await apiClient.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        console.log('UserService: Password changed successfully');
        return {
          success: true,
          data: {
            message: SUCCESS_MESSAGES.PASSWORD_CHANGED,
          },
        };
      }

      return response;
    } catch (error) {
      console.error('UserService: Change password error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.PASSWORD_CHANGE_FAILED,
      };
    }
  },

  // Delete user account
  deleteAccount: async (confirmationData) => {
    try {
      console.log('UserService: Deleting account');

      // For mock API
      if (apiClient === require('./apiClient').mockApiClient) {
        return await mockDeleteAccount(confirmationData);
      }

      const response = await apiClient.post(API_ENDPOINTS.USER.DELETE_ACCOUNT, {
        password: confirmationData.password,
        confirmation: confirmationData.confirmation,
        reason: confirmationData.reason,
      });

      if (response.success) {
        console.log('UserService: Account deleted successfully');
        
        // Clear tokens after successful deletion
        apiClient.utils.clearAuthTokens();
        
        return {
          success: true,
          data: {
            message: SUCCESS_MESSAGES.ACCOUNT_DELETED,
          },
        };
      }

      return response;
    } catch (error) {
      console.error('UserService: Delete account error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.ACCOUNT_DELETE_FAILED,
      };
    }
  },

  // Get user activity/stats
  getUserActivity: async () => {
    try {
      console.log('UserService: Getting user activity');

      // For mock API
      if (apiClient === require('./apiClient').mockApiClient) {
        return await mockGetUserActivity();
      }

      const response = await apiClient.get(API_ENDPOINTS.USER.ACTIVITY);

      if (response.success) {
        console.log('UserService: User activity retrieved');
        return {
          success: true,
          data: response.data,
        };
      }

      return response;
    } catch (error) {
      console.error('UserService: Get user activity error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }
  },

  // Update privacy settings
  updatePrivacySettings: async (privacyData) => {
    try {
      console.log('UserService: Updating privacy settings');

      // For mock API
      if (apiClient === require('./apiClient').mockApiClient) {
        return await mockUpdatePrivacySettings(privacyData);
      }

      const response = await apiClient.put(API_ENDPOINTS.USER.PRIVACY_SETTINGS, {
        profileVisibility: privacyData.profileVisibility,
        showEmail: privacyData.showEmail,
        showPhone: privacyData.showPhone,
        allowMessagesFromStrangers: privacyData.allowMessagesFromStrangers,
        showOnlineStatus: privacyData.showOnlineStatus,
        searchableByEmail: privacyData.searchableByEmail,
        searchableByPhone: privacyData.searchableByPhone,
      });

      if (response.success) {
        console.log('UserService: Privacy settings updated');
        return {
          success: true,
          data: {
            settings: response.data.settings,
            message: SUCCESS_MESSAGES.PRIVACY_SETTINGS_UPDATED,
          },
        };
      }

      return response;
    } catch (error) {
      console.error('UserService: Update privacy settings error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }
  },

  // Update notification settings
  updateNotificationSettings: async (notificationData) => {
    try {
      console.log('UserService: Updating notification settings');

      // For mock API
      if (apiClient === require('./apiClient').mockApiClient) {
        return await mockUpdateNotificationSettings(notificationData);
      }

      const response = await apiClient.put(API_ENDPOINTS.USER.NOTIFICATION_SETTINGS, {
        emailNotifications: notificationData.emailNotifications,
        pushNotifications: notificationData.pushNotifications,
        smsNotifications: notificationData.smsNotifications,
        marketingEmails: notificationData.marketingEmails,
        securityAlerts: notificationData.securityAlerts,
      });

      if (response.success) {
        console.log('UserService: Notification settings updated');
        return {
          success: true,
          data: {
            settings: response.data.settings,
            message: SUCCESS_MESSAGES.NOTIFICATION_SETTINGS_UPDATED,
          },
        };
      }

      return response;
    } catch (error) {
      console.error('UserService: Update notification settings error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }
  },

  // Get user's posts/content
  getUserPosts: async (userId, params = {}) => {
    try {
      console.log('UserService: Getting user posts');

      // For mock API
      if (apiClient === require('./apiClient').mockApiClient) {
        return await mockGetUserPosts(userId, params);
      }

      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        sort: params.sort || 'createdAt',
        order: params.order || 'desc',
      }).toString();

      const endpoint = userId 
        ? `${API_ENDPOINTS.USER.POSTS}/${userId}?${queryString}`
        : `${API_ENDPOINTS.USER.POSTS}?${queryString}`;

      const response = await apiClient.get(endpoint);

      if (response.success) {
        console.log('UserService: User posts retrieved');
        return {
          success: true,
          data: response.data,
        };
      }

      return response;
    } catch (error) {
      console.error('UserService: Get user posts error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }
  },

  // Export user data (GDPR compliance)
  exportUserData: async () => {
    try {
      console.log('UserService: Exporting user data');

      // For mock API
      if (apiClient === require('./apiClient').mockApiClient) {
        return await mockExportUserData();
      }

      const response = await apiClient.post(API_ENDPOINTS.USER.EXPORT_DATA);

      if (response.success) {
        console.log('UserService: User data export initiated');
        return {
          success: true,
          data: {
            exportId: response.data.exportId,
            message: SUCCESS_MESSAGES.DATA_EXPORT_INITIATED,
          },
        };
      }

      return response;
    } catch (error) {
      console.error('UserService: Export user data error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }
  },
};

// Mock functions for development
const mockGetProfile = async (userId) => {
  await new Promise(resolve => setTimeout(resolve, 600));

  const mockUser = {
    id: userId || 'current_user',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Software developer and tech enthusiast',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    phone: '+1-555-0123',
    dateOfBirth: '1990-05-15',
    isVerified: true,
    joinedAt: '2023-01-15T10:30:00Z',
    lastActiveAt: new Date().toISOString(),
    stats: {
      posts: 42,
      followers: 128,
      following: 89,
    },
  };

  return {
    success: true,
    data: mockUser,
  };
};

const mockChangePassword = async (passwordData) => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate wrong current password
  if (passwordData.currentPassword === 'wrongpassword') {
    return {
      success: false,
      error: ERROR_MESSAGES.INVALID_CURRENT_PASSWORD,
    };
  }

  return {
    success: true,
    data: {
      message: SUCCESS_MESSAGES.PASSWORD_CHANGED,
    },
  };
};

const mockDeleteAccount = async (confirmationData) => {
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Simulate wrong password
  if (confirmationData.password === 'wrongpassword') {
    return {
      success: false,
      error: ERROR_MESSAGES.INVALID_CREDENTIALS,
    };
  }

  // Simulate missing confirmation
  if (confirmationData.confirmation !== 'DELETE') {
    return {
      success: false,
      error: ERROR_MESSAGES.INVALID_CONFIRMATION,
    };
  }

  return {
    success: true,
    data: {
      message: SUCCESS_MESSAGES.ACCOUNT_DELETED,
    },
  };
};

const mockGetUserActivity = async () => {
  await new Promise(resolve => setTimeout(resolve, 700));

  const mockActivity = {
    stats: {
      totalPosts: 42,
      totalLikes: 186,
      totalComments: 73,
      totalShares: 29,
      profileViews: 1245,
    },
    recentActivity: [
      {
        id: 1,
        type: 'post',
        action: 'created',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        details: 'Created a new post',
      },
      {
        id: 2,
        type: 'profile',
        action: 'updated',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        details: 'Updated profile information',
      },
    ],
  };

  return {
    success: true,
    data: mockActivity,
  };
};

const mockUpdatePrivacySettings = async (privacyData) => {
  await new Promise(resolve => setTimeout(resolve, 600));

  return {
    success: true,
    data: {
      settings: privacyData,
      message: SUCCESS_MESSAGES.PRIVACY_SETTINGS_UPDATED,
    },
  };
};

const mockUpdateNotificationSettings = async (notificationData) => {
  await new Promise(resolve => setTimeout(resolve, 600));

  return {
    success: true,
    data: {
      settings: notificationData,
      message: SUCCESS_MESSAGES.NOTIFICATION_SETTINGS_UPDATED,
    },
  };
};

const mockGetUserPosts = async (userId, params) => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const mockPosts = [
    {
      id: 1,
      content: 'This is a sample post from the user',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      likes: 15,
      comments: 3,
      shares: 1,
    },
    {
      id: 2,
      content: 'Another post with some interesting content',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      likes: 8,
      comments: 2,
      shares: 0,
    },
  ];

  return {
    success: true,
    data: {
      posts: mockPosts,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 10,
        total: mockPosts.length,
        totalPages: 1,
      },
    },
  };
};

const mockExportUserData = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    success: true,
    data: {
      exportId: 'export_' + Date.now(),
      message: SUCCESS_MESSAGES.DATA_EXPORT_INITIATED,
    },
  };
};

export default userService;