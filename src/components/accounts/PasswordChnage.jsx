// src/components/accounts/PasswordChange.jsx

import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';

const PasswordChange = () => {
  const { changePassword } = useAuthContext();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Current password validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = 'Password does not meet requirements';
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check if new password is same as current
    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      setSuccessMessage('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to change password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const passwordValidation = validatePassword(formData.newPassword);

  return (
    <div>
      <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠</span>
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.currentPassword 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
              }`}
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.currentPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.newPassword 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
              }`}
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
          )}
          
          {/* Password Requirements */}
          {formData.newPassword && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
              <div className="space-y-1 text-xs">
                <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="mr-2">{passwordValidation.minLength ? '✓' : '○'}</span>
                  At least 8 characters
                </div>
                <div className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="mr-2">{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
                  One uppercase letter
                </div>
                <div className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="mr-2">{passwordValidation.hasLowerCase ? '✓' : '○'}</span>
                  One lowercase letter
                </div>
                <div className={`flex items-center ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="mr-2">{passwordValidation.hasNumbers ? '✓' : '○'}</span>
                  One number
                </div>
                <div className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                  <span className="mr-2">{passwordValidation.hasSpecialChar ? '✓' : '○'}</span>
                  One special character
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.confirmPassword 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
              }`}
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
          
          {/* Password Match Indicator */}
          {formData.newPassword && formData.confirmPassword && (
            <div className="mt-2">
              {formData.newPassword === formData.confirmPassword ? (
                <div className="flex items-center text-green-600 text-sm">
                  <span className="mr-2">✓</span>
                  Passwords match
                </div>
              ) : (
                <div className="flex items-center text-red-600 text-sm">
                  <span className="mr-2">✗</span>
                  Passwords do not match
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={isLoading || !passwordValidation.isValid || formData.newPassword !== formData.confirmPassword}
            className={`px-6 py-3 text-sm font-medium text-white rounded-lg transition-colors ${
              isLoading || !passwordValidation.isValid || formData.newPassword !== formData.confirmPassword
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Changing Password...
              </div>
            ) : (
              'Change Password'
            )}
          </button>
        </div>
      </form>

      {/* Security Tips */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">🔒 Security Tips</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Use a unique password that you don't use on other websites</li>
          <li>• Consider using a password manager to generate strong passwords</li>
          <li>• Never share your password with anyone</li>
          <li>• Change your password regularly, especially if you suspect it's been compromised</li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordChange;