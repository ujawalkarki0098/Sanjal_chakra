// src/hooks/useAuth.js

import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES, SUCCESS_MESSAGES } from '../utils/constants';
import { validateLoginForm, validateSignupForm, validateOTP } from '../utils/validation';
import { useEffect, useState } from 'react';

const useAuth = () => {
  const authContext = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // ✅ Added loading state

  const {
    // State
    user,
    isAuthenticated,
    isLoading,
    authState,
    error,
    successMessage,
    pendingVerificationEmail,
    rememberEmail,

    // Context actions
    login: contextLogin,
    signup: contextSignup,
    logout: contextLogout,
    verifyOTP: contextVerifyOTP,
    resendOTP: contextResendOTP,
    setError,
    setSuccessMessage,
    clearMessages,
    setRememberEmail,
  } = authContext;

  // ✅ Initial auth resolution (e.g., from localStorage or backend)
  useEffect(() => {
    const resolveAuth = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && !user) {
          authContext.setUser(storedUser);
        }
      } catch (err) {
        console.error('Auth resolution error:', err);
      } finally {
        setLoading(false);
      }
    };

    resolveAuth();
  }, []);

  // ✅ Login function without redirect
  const login = async (formData) => {
    try {
      clearMessages();

      const validation = validateLoginForm(formData);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0][0];
        setError(firstError);
        return { success: false, errors: validation.errors };
      }

      const result = await contextLogin({
        email: formData.email,
        password: formData.password,
        rememberEmail: formData.rememberEmail || false,
      });

      if (result.success) {
        setSuccessMessage(SUCCESS_MESSAGES.LOGIN_SUCCESS);
        // ❌ Removed navigate() to prevent flicker
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  // Signup function (unchanged)
  const signup = async (formData) => {
    try {
      clearMessages();

      const validation = validateSignupForm(formData);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0][0];
        setError(firstError);
        return { success: false, errors: validation.errors };
      }

      const result = await contextSignup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      console.log('Signup result:', result);

      if (result.success || (!result.error && !result.errors)) {
        setSuccessMessage(SUCCESS_MESSAGES.SIGNUP_SUCCESS);
        setTimeout(() => navigate(ROUTES.OTP_VERIFICATION), 1500);
        return { success: true };
      }

      return result;
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Signup failed');
      return { success: false, error: error.message };
    }
  };

  // OTP verification (unchanged)
  const verifyOTP = async (otpValue) => {
    try {
      clearMessages();

      const validation = validateOTP(otpValue);
      if (!validation.isValid) {
        setError(validation.errors[0]);
        return { success: false, errors: validation.errors };
      }

      if (!pendingVerificationEmail) {
        setError('No pending verification found. Please sign up again.');
        return { success: false, error: 'No pending verification' };
      }

      const result = await contextVerifyOTP(pendingVerificationEmail, otpValue);

      if (result.success) {
        setSuccessMessage(SUCCESS_MESSAGES.OTP_VERIFIED);
        setTimeout(() => navigate(ROUTES.DASHBOARD), 1500);
      }

      return result;
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.message || 'OTP verification failed');
      return { success: false, error: error.message };
    }
  };

  // Resend OTP (unchanged)
  const resendOTP = async () => {
    try {
      if (!pendingVerificationEmail) {
        setError('No pending verification found. Please sign up again.');
        return { success: false, error: 'No pending verification' };
      }

      const result = await contextResendOTP(pendingVerificationEmail);

      if (result.success) {
        setSuccessMessage(SUCCESS_MESSAGES.OTP_SENT);
      }

      return result;
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.message || 'Failed to resend OTP');
      return { success: false, error: error.message };
    }
  };

  // Logout (unchanged)
  const logout = async (options = {}) => {
    try {
      const result = await contextLogout();

      if (result.success) {
        if (!options.silent) {
          setSuccessMessage(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
        }
        const redirectTo = options.redirectTo || ROUTES.LOGIN;
        navigate(redirectTo);
      }

      return result;
    } catch (error) {
      console.error('Logout error:', error);
      if (!options.silent) {
        setError(error.message || 'Logout failed');
      }
      return { success: false, error: error.message };
    }
  };

  // Helpers (unchanged)
  const hasPermission = (permission) => {
    if (!isAuthenticated || !user) return false;
    return true;
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.fullName || user.email || 'User';
  };

  const getUserInitials = () => {
    if (!user || !user.fullName) return 'U';
    return user.fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const requiresAuth = (pathname) => {
    const publicRoutes = [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.OTP_VERIFICATION, ROUTES.FORGOT_PASSWORD];
    return !publicRoutes.includes(pathname);
  };

  const redirectToLogin = (currentPath) => {
    navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(currentPath)}`);
  };

  const clearMessagesWithTimeout = (timeout = 5000) => {
    setTimeout(() => clearMessages(), timeout);
  };

  // ✅ Final return with loading included
  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    loading,
    authState,
    error,
    successMessage,
    pendingVerificationEmail,
    rememberEmail,

    // Actions
    login,
    signup,
    logout,
    verifyOTP,
    resendOTP,

    // Helpers
    hasPermission,
    getUserDisplayName,
    getUserInitials,
    requiresAuth,
    redirectToLogin,

    // Message management
    setError,
    setSuccessMessage,
    clearMessages,
    clearMessagesWithTimeout,
    setRememberEmail,

    // Computed
    isLoggedIn: isAuthenticated && !!user,
    isEmailPending: !!pendingVerificationEmail,
    userName: getUserDisplayName(),
    userInitials: getUserInitials(),
  };
};

export default useAuth;
