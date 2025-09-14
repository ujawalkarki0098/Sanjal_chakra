// src/components/accounts/AccountSettings.jsx

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PasswordChange from './PasswordChange';
import SecuritySettings from './SecuritySettings';
import DeleteAccount from './DeleteAccount';

const AccountSettings = () => {
  const { user, isLoading, logout } = useAuthContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const settingsTabs = [
    {
      id: 'general',
      title: 'General',
      icon: '⚙️',
      description: 'Account information and preferences'
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: '🔒',
      description: 'Password, privacy settings, and security options'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: '🔔',
      description: 'Email and push notification preferences'
    },
    {
      id: 'danger',
      title: 'Account Actions',
      icon: '⚠️',
      description: 'Logout, export data, or delete account'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            </div>
            {user && (
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-700">{user.fullName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <nav className="space-y-2">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{tab.icon}</span>
                    <div>
                      <div className="font-medium">{tab.title}</div>
                      <div className="text-sm text-gray-500">{tab.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="mt-8 lg:mt-0 lg:col-span-9">
            <div className="bg-white shadow rounded-lg">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">General Settings</h2>
                  
                  {/* Account Info */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                        alt={user?.fullName}
                        className="w-16 h-16 rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{user?.fullName}</h3>
                        <p className="text-gray-600">{user?.email}</p>
                        <p className="text-sm text-gray-500">
                          Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate('/edit-profile')} // Navigate to your existing edit profile page
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit Profile
                      </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {user?.stats?.posts || 0}
                        </div>
                        <div className="text-sm text-gray-600">Posts</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {user?.stats?.followers || 0}
                        </div>
                        <div className="text-sm text-gray-600">Followers</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {user?.stats?.following || 0}
                        </div>
                        <div className="text-sm text-gray-600">Following</div>
                      </div>
                    </div>

                    {/* Account Status */}
                    <div className="border-t pt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Account Status</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Email Verification</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user?.isVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user?.isVerified ? '✓ Verified' : '⚠ Pending'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Two-Factor Authentication</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            Disabled
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Last Activity</span>
                          <span className="text-sm text-gray-600">
                            {user?.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : 'Now'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Security & Privacy</h2>
                  <div className="space-y-8">
                    <PasswordChange />
                    <hr className="border-gray-200" />
                    <SecuritySettings />
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Notification Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Email Notifications</h4>
                      <div className="space-y-3">
                        {[
                          { id: 'likes', label: 'Likes on your posts', enabled: true },
                          { id: 'comments', label: 'Comments on your posts', enabled: true },
                          { id: 'follows', label: 'New followers', enabled: true },
                          { id: 'messages', label: 'Direct messages', enabled: true },
                          { id: 'marketing', label: 'Marketing emails', enabled: false },
                        ].map((notification) => (
                          <div key={notification.id} className="flex items-center justify-between">
                            <span className="text-gray-700">{notification.label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                defaultChecked={notification.enabled}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Push Notifications</h4>
                      <div className="space-y-3">
                        {[
                          { id: 'push-likes', label: 'Likes and reactions', enabled: true },
                          { id: 'push-comments', label: 'Comments and replies', enabled: true },
                          { id: 'push-messages', label: 'Direct messages', enabled: true },
                          { id: 'push-live', label: 'Live notifications', enabled: false },
                        ].map((notification) => (
                          <div key={notification.id} className="flex items-center justify-between">
                            <span className="text-gray-700">{notification.label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                defaultChecked={notification.enabled}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                      Save Notification Settings
                    </button>
                  </div>
                </div>
              )}

              {/* Account Actions */}
              {activeTab === 'danger' && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Account Actions</h2>
                  
                  <div className="space-y-6">
                    {/* Logout Section */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-md font-medium text-blue-900 mb-2">Logout</h4>
                      <p className="text-sm text-blue-700 mb-4">
                        Sign out of your account on this device.
                      </p>
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        Logout
                      </button>
                    </div>

                    {/* Export Data Section */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="text-md font-medium text-gray-900 mb-2">Export Your Data</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Download a copy of all your data including posts, profile information, and activity.
                      </p>
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Request Data Export
                      </button>
                    </div>

                    {/* Delete Account Section */}
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="text-md font-medium text-red-900 mb-2">Delete Account</h4>
                      <p className="text-sm text-red-700 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <DeleteAccount />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;