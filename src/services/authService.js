// src/services/authService.js

import apiClient from './apiClient';
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';

// Configuration flag - set to false to disable all API calls
const ENABLE_API_CALLS = false; // Change to true when backend is ready

// Authentication service
const authService = {
  // Login user
  login: async (credentials) => {
    try {
      console.log('AuthService: Login attempt for email:', credentials.email);

      // Always use mock for now (no API calls)
      if (!ENABLE_API_CALLS) {
        return await mockLogin(credentials);
      }

      // This code will only run when ENABLE_API_CALLS is true
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.success) {
        const { user, tokens } = response.data;
        
        // Save tokens to storage
        if (tokens) {
          apiClient.utils.saveAuthToken(tokens.accessToken);
          localStorage.setItem('refresh_token', tokens.refreshToken);
        }

        console.log('AuthService: Login successful');
        return {
          success: true,
          data: {
            user,
            tokens,
            message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
          },
        };
      }

      return response;
    } catch (error) {
      console.error('AuthService: Login error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }
  },

  // Register new user
  signup: async (userData) => {
    try {
      console.log('AuthService: Signup attempt for email:', userData.email);

      // Always use mock for now (no API calls)
      if (!ENABLE_API_CALLS) {
        return await mockSignup(userData);
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, {
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
      });

      if (response.success) {
        console.log('AuthService: Signup successful, OTP sent');
        return {
          success: true,
          data: {
            email: userData.email,
            message: SUCCESS_MESSAGES.SIGNUP_SUCCESS,
            otpSent: true,
          },
        };
      }

      return response;
    } catch (error) {
      console.error('AuthService: Signup error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    try {
      console.log('AuthService: OTP verification for email:', email);

      // Always use mock for now (no API calls)
      if (!ENABLE_API_CALLS) {
        return await mockVerifyOTP(email, otp);
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        email,
        otp,
      });

      if (response.success) {
        const { user, tokens } = response.data;
        
        // Save tokens to storage
        if (tokens) {
          apiClient.utils.saveAuthToken(tokens.accessToken);
          localStorage.setItem('refresh_token', tokens.refreshToken);
        }

        console.log('AuthService: OTP verification successful');
        return {
          success: true,
          data: {
            user,
            tokens,
            message: SUCCESS_MESSAGES.OTP_VERIFIED,
          },
        };
      }

      return response;
    } catch (error) {
      console.error('AuthService: OTP verification error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.INVALID_OTP,
      };
    }
  },

  // Resend OTP
  resendOTP: async (email) => {
    try {
      console.log('AuthService: Resending OTP for email:', email);

      // Always use mock for now (no API calls)
      if (!ENABLE_API_CALLS) {
        return await mockResendOTP(email);
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_OTP, {
        email,
      });

      if (response.success) {
        console.log('AuthService: OTP resent successfully');
        return {
          success: true,
          data: {
            message: SUCCESS_MESSAGES.OTP_SENT,
          },
        };
      }

      return response;
    } catch (error) {
      console.error('AuthService: Resend OTP error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.OTP_SEND_FAILED,
      };
    }
  },

  // Logout user - FIXED: No API calls, just local cleanup
  logout: async () => {
    try {
      console.log('AuthService: Logout attempt');

      // Skip API calls completely for now
      if (!ENABLE_API_CALLS) {
        console.log('AuthService: Performing frontend-only logout');
        
        // Clear tokens locally
        apiClient.utils.clearAuthTokens();
        
        console.log('AuthService: Logout successful');
        return {
          success: true,
          data: {
            message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
          },
        };
      }

      // This code will only run when ENABLE_API_CALLS is true
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);

      // Clear tokens regardless of response (logout should always work locally)
      apiClient.utils.clearAuthTokens();

      console.log('AuthService: Logout successful');
      return {
        success: true,
        data: {
          message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
        },
      };
    } catch (error) {
      console.error('AuthService: Logout error:', error);
      // Still clear tokens even if API call fails
      apiClient.utils.clearAuthTokens();
      
      return {
        success: true, // Return success since local logout worked
        data: {
          message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
        },
      };
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      const refreshToken = apiClient.utils.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('AuthService: Refreshing access token');

      // Skip API calls for now
      if (!ENABLE_API_CALLS) {
        console.log('AuthService: Skipping token refresh (no backend)');
        return {
          success: false,
          error: 'Token refresh not available without backend',
          shouldRedirectToLogin: true,
        };
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        refreshToken,
      }, { includeAuth: false });

      if (response.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Save new tokens
        apiClient.utils.saveAuthToken(accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        console.log('AuthService: Token refresh successful');
        return {
          success: true,
          data: {
            accessToken,
            refreshToken: newRefreshToken || refreshToken,
          },
        };
      }

      return response;
    } catch (error) {
      console.error('AuthService: Token refresh error:', error);
      // Clear tokens if refresh fails
      apiClient.utils.clearAuthTokens();
      
      return {
        success: false,
        error: error.message || 'Token refresh failed',
        shouldRedirectToLogin: true,
      };
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      console.log('AuthService: Getting current user');

      // Skip API calls for now
      if (!ENABLE_API_CALLS) {
        console.log('AuthService: Returning mock current user');
        
        // Try to get user from localStorage if available
        const token = apiClient.utils.getAuthToken();
        if (!token) {
          return {
            success: false,
            error: 'No authentication token',
          };
        }

        // Return mock user
        const mockUser = {
          id: 'current_user',
          fullName: 'Current User',
          email: 'current@test.com',
          isVerified: true,
          createdAt: new Date().toISOString(),
        };

        return {
          success: true,
          data: mockUser,
        };
      }

      const response = await apiClient.get(API_ENDPOINTS.USER.PROFILE);

      if (response.success) {
        console.log('AuthService: User profile retrieved');
        return {
          success: true,
          data: response.data.user,
        };
      }

      return response;
    } catch (error) {
      console.error('AuthService: Get current user error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      console.log('AuthService: Password reset request for email:', email);

      // Always use mock for now (no API calls)
      if (!ENABLE_API_CALLS) {
        return await mockRequestPasswordReset(email);
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET, {
        email,
      });

      if (response.success) {
        console.log('AuthService: Password reset request successful');
        return {
          success: true,
          data: {
            message: SUCCESS_MESSAGES.PASSWORD_RESET_SENT,
          },
        };
      }

      return response;
    } catch (error) {
      console.error('AuthService: Password reset request error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      console.log('AuthService: Password reset attempt');

      // Always use mock for now (no API calls)
      if (!ENABLE_API_CALLS) {
        return await mockResetPassword(token, newPassword);
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword,
      });

      if (response.success) {
        console.log('AuthService: Password reset successful');
        return {
          success: true,
          data: {
            message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
          },
        };
      }

      return response;
    } catch (error) {
      console.error('AuthService: Password reset error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }
  },

  // Verify token (for authentication checks)
  verifyToken: async () => {
    try {
      console.log('AuthService: Token verification');

      const token = apiClient.utils.getAuthToken();
      
      if (!token) {
        return {
          success: false,
          error: 'No token available',
        };
      }

      // Always use mock for now (no API calls)
      if (!ENABLE_API_CALLS) {
        return await mockVerifyToken();
      }

      const response = await apiClient.get(API_ENDPOINTS.AUTH.VERIFY_TOKEN);

      if (response.success) {
        console.log('AuthService: Token verification successful');
        return {
          success: true,
          data: response.data.user,
        };
      }

      return response;
    } catch (error) {
      console.error('AuthService: Token verification error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNAUTHORIZED,
      };
    }
  },

  // Change email (with verification)
  changeEmail: async (newEmail, password) => {
    try {
      console.log('AuthService: Email change request for:', newEmail);

      // Always use mock for now (no API calls)
      if (!ENABLE_API_CALLS) {
        return await mockChangeEmail(newEmail, password);
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_EMAIL, {
        newEmail,
        password,
      });

      if (response.success) {
        console.log('AuthService: Email change request successful');
        return {
          success: true,
          data: {
            message: SUCCESS_MESSAGES.EMAIL_CHANGE_REQUESTED,
            pendingEmail: newEmail,
          },
        };
      }

      return response;
    } catch (error) {
      console.error('AuthService: Email change error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }
  },

  // Verify email change
  verifyEmailChange: async (token) => {
    try {
      console.log('AuthService: Email change verification');

      // Always use mock for now (no API calls)
      if (!ENABLE_API_CALLS) {
        return await mockVerifyEmailChange(token);
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL_CHANGE, {
        token,
      });

      if (response.success) {
        console.log('AuthService: Email change verified successfully');
        return {
          success: true,
          data: {
            user: response.data.user,
            message: SUCCESS_MESSAGES.EMAIL_CHANGED,
          },
        };
      }

      return response;
    } catch (error) {
      console.error('AuthService: Email change verification error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
      };
    }
  },
};

// Mock functions for development
const mockLogin = async (credentials) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  // Simulate different scenarios based on email
  if (credentials.email === 'error@test.com') {
    return {
      success: false,
      error: ERROR_MESSAGES.INVALID_CREDENTIALS,
    };
  }

  if (credentials.email === 'unverified@test.com') {
    return {
      success: false,
      error: ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED,
    };
  }

  // Mock successful login
  const mockUser = {
    id: 'user_' + Date.now(),
    fullName: 'John Doe',
    email: credentials.email,
    isVerified: true,
    createdAt: new Date().toISOString(),
  };

  const mockTokens = {
    accessToken: 'mock_access_token_' + Date.now(),
    refreshToken: 'mock_refresh_token_' + Date.now(),
  };

  // Save tokens to localStorage for mock mode
  localStorage.setItem('auth_token', mockTokens.accessToken);
  localStorage.setItem('refresh_token', mockTokens.refreshToken);

  return {
    success: true,
    data: {
      user: mockUser,
      tokens: mockTokens,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    },
  };
};

const mockSignup = async (userData) => {
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate API delay

  // Simulate email already exists
  if (userData.email === 'existing@test.com') {
    return {
      success: false,
      error: ERROR_MESSAGES.USER_ALREADY_EXISTS,
    };
  }

  // Mock successful signup
  return {
    success: true,
    data: {
      email: userData.email,
      message: SUCCESS_MESSAGES.SIGNUP_SUCCESS,
      otpSent: true,
    },
  };
};

const mockVerifyOTP = async (email, otp) => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

  // Simulate invalid OTP
  if (otp === '000000') {
    return {
      success: false,
      error: ERROR_MESSAGES.INVALID_OTP,
    };
  }

  // Simulate expired OTP
  if (otp === '111111') {
    return {
      success: false,
      error: ERROR_MESSAGES.OTP_EXPIRED,
    };
  }

  // Mock successful verification
  const mockUser = {
    id: 'user_' + Date.now(),
    fullName: 'New User',
    email: email,
    isVerified: true,
    createdAt: new Date().toISOString(),
  };

  const mockTokens = {
    accessToken: 'mock_access_token_' + Date.now(),
    refreshToken: 'mock_refresh_token_' + Date.now(),
  };

  // Save tokens to localStorage for mock mode
  localStorage.setItem('auth_token', mockTokens.accessToken);
  localStorage.setItem('refresh_token', mockTokens.refreshToken);

  return {
    success: true,
    data: {
      user: mockUser,
      tokens: mockTokens,
      message: SUCCESS_MESSAGES.OTP_VERIFIED,
    },
  };
};

const mockResendOTP = async (email) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

  return {
    success: true,
    data: {
      message: SUCCESS_MESSAGES.OTP_SENT,
    },
  };
};

const mockLogout = async () => {
  return {
    success: true,
    data: {
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
    },
  };
};

const mockRequestPasswordReset = async (email) => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

  // Simulate user not found
  if (email === 'notfound@test.com') {
    return {
      success: false,
      error: ERROR_MESSAGES.USER_NOT_FOUND,
    };
  }

  return {
    success: true,
    data: {
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SENT,
    },
  };
};

const mockResetPassword = async (token, newPassword) => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay

  // Simulate invalid/expired token
  if (token === 'invalid_token') {
    return {
      success: false,
      error: ERROR_MESSAGES.INVALID_TOKEN,
    };
  }

  return {
    success: true,
    data: {
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
    },
  };
};

const mockVerifyToken = async () => {
  await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay

  const mockUser = {
    id: 'user_verified',
    fullName: 'Verified User',
    email: 'verified@test.com',
    isVerified: true,
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    data: mockUser,
  };
};

const mockChangeEmail = async (newEmail, password) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  // Simulate wrong password
  if (password === 'wrongpassword') {
    return {
      success: false,
      error: ERROR_MESSAGES.INVALID_CREDENTIALS,
    };
  }

  // Simulate email already exists
  if (newEmail === 'existing@test.com') {
    return {
      success: false,
      error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
    };
  }

  return {
    success: true,
    data: {
      message: SUCCESS_MESSAGES.EMAIL_CHANGE_REQUESTED,
      pendingEmail: newEmail,
    },
  };
};

const mockVerifyEmailChange = async (token) => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay

  // Simulate invalid token
  if (token === 'invalid_token') {
    return {
      success: false,
      error: ERROR_MESSAGES.INVALID_TOKEN,
    };
  }

  const updatedUser = {
    id: 'user_updated',
    fullName: 'Updated User',
    email: 'newemail@test.com',
    isVerified: true,
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    data: {
      user: updatedUser,
      message: SUCCESS_MESSAGES.EMAIL_CHANGED,
    },
  };
};

export default authService;