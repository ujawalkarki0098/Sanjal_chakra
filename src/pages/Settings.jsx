// src/pages/Settings.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAccount from '../hooks/useAccountSettings';
import useLogout from '../hooks/useLogout';
import { validatePassword, validatePasswordMatch } from '../utils/auth';
import ProfileModal from '../components/ProfileModal'; 


const Settings = () => {
  const navigate = useNavigate();
  const { 
    user, 
    loading, 
    error, 
    changePassword, 
    updatePrivacySettings, 
    updateNotificationSettings,
    deleteAccount,
    exportUserData,
    clearError 
  } = useAccount();
  
  const { logout } = useLogout();

  // Tab state
  const [activeTab, setActiveTab] = useState('account');
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessagesFromStrangers: true,
    showOnlineStatus: true,
    searchableByEmail: false,
    searchableByPhone: false,
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    securityAlerts: true,
  });
  
  // Delete account state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    password: '',
    confirmation: '',
    reason: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Profile edit modal state
  const [showEditModal, setShowEditModal] = useState(false);

  // Success messages
  const [successMessage, setSuccessMessage] = useState('');

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    clearError();

    // Validate passwords
    const currentPasswordValidation = validatePassword(passwordData.currentPassword);
    const newPasswordValidation = validatePassword(passwordData.newPassword);
    const confirmPasswordValidation = validatePasswordMatch(
      passwordData.newPassword, 
      passwordData.confirmPassword
    );

    const errors = {};
    if (!currentPasswordValidation.isValid) {
      errors.currentPassword = currentPasswordValidation.message;
    }
    if (!newPasswordValidation.isValid) {
      errors.newPassword = newPasswordValidation.message;
    }
    if (!confirmPasswordValidation.isValid) {
      errors.confirmPassword = confirmPasswordValidation.message;
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    if (result) {
      setSuccessMessage('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  // Handle privacy settings update
  const handlePrivacyUpdate = async () => {
    clearError();
    const result = await updatePrivacySettings(privacySettings);
    if (result) {
      setSuccessMessage('Privacy settings updated successfully!');
    }
  };

  // Handle notification settings update
  const handleNotificationUpdate = async () => {
    clearError();
    const result = await updateNotificationSettings(notificationSettings);
    if (result) {
      setSuccessMessage('Notification settings updated successfully!');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    clearError();

    if (deleteConfirmation.confirmation !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion');
      return;
    }

    const confirmed = window.confirm(
      'This action cannot be undone. Your account and all data will be permanently deleted.'
    );
    
    if (!confirmed) return;

    const result = await deleteAccount(deleteConfirmation);
    if (result) {
      alert('Account deleted successfully. You will be logged out.');
      logout({ redirectTo: '/login' });
    }
  };

  // Handle data export
  const handleDataExport = async () => {
    clearError();
    const result = await exportUserData();
    if (result) {
      setSuccessMessage('Data export initiated! You will receive an email when ready.');
    }
  };

  // Tabs configuration
  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'data', label: 'Data & Privacy', icon: '📊' },
  ];

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
          >
            <span className="mr-2">←</span> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and privacy settings</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
                
                {user && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="mt-1 text-sm text-gray-900">{user.fullName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Member Since</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <p className="mt-1 text-sm text-gray-900">{user.location || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{user.phone || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Visibility
                    </label>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) => setPrivacySettings({
                        ...privacySettings,
                        profileVisibility: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  {[
                    { key: 'showEmail', label: 'Show email in profile' },
                    { key: 'showPhone', label: 'Show phone number in profile' },
                    { key: 'allowMessagesFromStrangers', label: 'Allow messages from strangers' },
                    { key: 'showOnlineStatus', label: 'Show online status' },
                    { key: 'searchableByEmail', label: 'Allow others to find me by email' },
                    { key: 'searchableByPhone', label: 'Allow others to find me by phone' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700">{setting.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings[setting.key]}
                          onChange={(e) => setPrivacySettings({
                            ...privacySettings,
                            [setting.key]: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={handlePrivacyUpdate}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Save Privacy Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email notifications', desc: 'Receive notifications via email' },
                    { key: 'pushNotifications', label: 'Push notifications', desc: 'Receive browser push notifications' },
                    { key: 'smsNotifications', label: 'SMS notifications', desc: 'Receive notifications via SMS' },
                    { key: 'marketingEmails', label: 'Marketing emails', desc: 'Receive promotional emails and updates' },
                    { key: 'securityAlerts', label: 'Security alerts', desc: 'Receive important security notifications' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <div className="text-sm font-medium text-gray-700">{setting.label}</div>
                        <div className="text-xs text-gray-500">{setting.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[setting.key]}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            [setting.key]: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={handleNotificationUpdate}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Save Notification Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                
                {/* Change Password */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </form>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Add an extra layer of security to your account.
                  </p>
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700">
                    Enable 2FA (Coming Soon)
                  </button>
                </div>
              </div>
            )}

            {/* Data & Privacy Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Data & Privacy</h2>
                
                {/* Export Data */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Export Your Data</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Download a copy of your data for your records.
                  </p>
                  <button
                    onClick={handleDataExport}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Preparing Export...' : 'Export Data'}
                  </button>
                </div>

                {/* Delete Account */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-red-900 mb-2">Delete Account</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-medium text-red-900 mb-4">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-4">
                This action will permanently delete your account and all associated data.
              </p>
              
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={deleteConfirmation.password}
                    onChange={(e) => setDeleteConfirmation({
                      ...deleteConfirmation,
                      password: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type "DELETE" to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation.confirmation}
                    onChange={(e) => setDeleteConfirmation({
                      ...deleteConfirmation,
                      confirmation: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for deletion (optional)
                  </label>
                  <textarea
                    value={deleteConfirmation.reason}
                    onChange={(e) => setDeleteConfirmation({
                      ...deleteConfirmation,
                      reason: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      {showEditModal && (
        <ProfileModal setShowEdit={setShowEditModal} />
      )}
    </div>
  );
};

export default Settings;