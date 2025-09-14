// src/components/accounts/DeleteAccount.jsx

import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DeleteAccount = () => {
  const { user, deleteAccount } = useAuthContext();
  const navigate = useNavigate();
  
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    password: '',
    confirmText: '',
    feedback: '',
    reason: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const deleteReasons = [
    'I no longer find this service useful',
    'I have privacy concerns',
    'I found a better alternative',
    'I spend too much time on social media',
    'Technical issues or bugs',
    'Account was hacked or compromised',
    'Other (please specify in feedback)'
  ];

  const confirmationText = `DELETE ${user?.username || 'ACCOUNT'}`;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.reason) {
        newErrors.reason = 'Please select a reason for deleting your account';
      }
    }

    if (step === 2) {
      if (!formData.password) {
        newErrors.password = 'Please enter your password to confirm';
      }
      
      if (formData.confirmText !== confirmationText) {
        newErrors.confirmText = `Please type exactly: ${confirmationText}`;
      }
    }

    return newErrors;
  };

  const handleNextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setErrors({});
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleDeleteAccount = async () => {
    const stepErrors = validateStep(2);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsLoading(true);

    try {
      await deleteAccount({
        password: formData.password,
        reason: formData.reason,
        feedback: formData.feedback
      });

      // Account deleted successfully, redirect to goodbye page or home
      navigate('/account-deleted');
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to delete account. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentStep(1);
    setFormData({
      password: '',
      confirmText: '',
      feedback: '',
      reason: ''
    });
    setErrors({});
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
      >
        Delete Account
      </button>

      {/* Delete Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-red-600">
                  ⚠️ Delete Account
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {/* Progress Indicator */}
              <div className="mt-4">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center ${currentStep >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 1 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      1
                    </div>
                    <span className="ml-2 text-sm">Reason</span>
                  </div>
                  <div className={`flex-1 h-1 rounded ${currentStep >= 2 ? 'bg-red-200' : 'bg-gray-200'}`}></div>
                  <div className={`flex items-center ${currentStep >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 2 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      2
                    </div>
                    <span className="ml-2 text-sm">Confirm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6">
              {/* Step 1: Reason Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">Before you go...</h4>
                    <p className="text-sm text-red-700">
                      Deleting your account is permanent and cannot be undone. All your data, posts, followers, and messages will be permanently removed.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Why are you deleting your account? <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {deleteReasons.map((reason, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="radio"
                            name="reason"
                            value={reason}
                            checked={formData.reason === reason}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                          />
                          <span className="ml-3 text-gray-700">{reason}</span>
                        </label>
                      ))}
                    </div>
                    {errors.reason && (
                      <p className="mt-2 text-sm text-red-600">{errors.reason}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Feedback (Optional)
                    </label>
                    <textarea
                      id="feedback"
                      name="feedback"
                      rows="4"
                      value={formData.feedback}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      placeholder="Help us improve by sharing your experience..."
                    />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Consider these alternatives:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Temporarily deactivate your account instead</li>
                      <li>• Adjust your privacy settings for more control</li>
                      <li>• Turn off notifications to reduce distractions</li>
                      <li>• Contact support if you're having technical issues</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 2: Final Confirmation */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">⚠️ Final Warning</h4>
                    <p className="text-sm text-red-700 mb-3">
                      This action is irreversible. Once deleted, you will lose:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• All your posts and content</li>
                      <li>• Your followers and following connections</li>
                      <li>• All messages and conversations</li>
                      <li>• Account settings and preferences</li>
                      <li>• Profile information and media</li>
                    </ul>
                  </div>

                  {/* Error Message */}
                  {errors.submit && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-red-600 mr-2">⚠</span>
                        <p className="text-sm text-red-700">{errors.submit}</p>
                      </div>
                    </div>
                  )}

                  {/* Password Confirmation */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your password to confirm <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                          errors.password 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirmation Text */}
                  <div>
                    <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-2">
                      Type <span className="font-mono bg-gray-100 px-2 py-1 rounded text-red-600">{confirmationText}</span> to confirm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="confirmText"
                      name="confirmText"
                      value={formData.confirmText}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                        errors.confirmText 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder={`Type "${confirmationText}" here`}
                    />
                    {errors.confirmText && (
                      <p className="mt-2 text-sm text-red-600">{errors.confirmText}</p>
                    )}
                  </div>

                  {/* Selected Reason Summary */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Reason for deletion:</h4>
                    <p className="text-sm text-gray-700">{formData.reason}</p>
                    {formData.feedback && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 font-medium">Additional feedback:</p>
                        <p className="text-sm text-gray-600 italic">"{formData.feedback}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between">
                <div className="flex space-x-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  {currentStep === 2 && (
                    <button
                      onClick={handlePreviousStep}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ← Back
                    </button>
                  )}
                </div>

                <div>
                  {currentStep === 1 ? (
                    <button
                      onClick={handleNextStep}
                      className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isLoading || !formData.password || formData.confirmText !== confirmationText}
                      className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                        isLoading || !formData.password || formData.confirmText !== confirmationText
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Deleting Account...
                        </div>
                      ) : (
                        'Delete My Account'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;