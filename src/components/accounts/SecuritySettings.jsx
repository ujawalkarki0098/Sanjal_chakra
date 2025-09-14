// src/components/accounts/SecuritySettings.jsx

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';

const SecuritySettings = () => {
  const { user, updatePrivacySettings } = useAuthContext();
  const [settings, setSettings] = useState({
    // Privacy Settings
    profileVisibility: 'public', // public, friends, private
    showEmail: false,
    showPhoneNumber: false,
    allowMessagesFromStrangers: true,
    showOnlineStatus: true,
    showLastSeen: true,
    
    // Security Settings
    twoFactorEnabled: false,
    loginNotifications: true,
    unusualActivityAlerts: true,
    
    // Content & Activity Privacy
    showActivity: true,
    showLikes: true,
    showFollowers: true,
    showFollowing: true,
    indexProfile: true, // Allow search engines to index profile
  });

  const [activeSessions, setActiveSessions] = useState([
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'Pokhara, Nepal',
      lastActive: '5 minutes ago',
      current: true,
      ip: '192.168.1.100'
    },
    {
      id: 2,
      device: 'Mobile App on iPhone',
      location: 'Kathmandu, Nepal',
      lastActive: '2 hours ago',
      current: false,
      ip: '10.0.0.50'
    },
    {
      id: 3,
      device: 'Safari on MacBook',
      location: 'Pokhara, Nepal',
      lastActive: '1 day ago',
      current: false,
      ip: '192.168.1.105'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState(null);

  useEffect(() => {
    // Load user's current privacy settings
    if (user?.privacySettings) {
      setSettings(prev => ({ ...prev, ...user.privacySettings }));
    }
  }, [user]);

  const handleToggleChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSelectChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      await updatePrivacySettings(settings);
      setSuccessMessage('Privacy settings updated successfully!');
    } catch (error) {
      console.error('Failed to update settings:', error);
      // You could add error handling here
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = (sessionId) => {
    const session = activeSessions.find(s => s.id === sessionId);
    setSessionToRevoke(session);
    setShowSessionModal(true);
  };

  const confirmRevokeSession = () => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionToRevoke.id));
    setShowSessionModal(false);
    setSessionToRevoke(null);
    setSuccessMessage('Session revoked successfully!');
  };

  const revokeAllSessions = () => {
    setActiveSessions(prev => prev.filter(s => s.current));
    setSuccessMessage('All other sessions revoked successfully!');
  };

  return (
    <div>
      <h3 className="text-md font-medium text-gray-900 mb-6">Privacy & Security Settings</h3>
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Profile Privacy */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">👤 Profile Privacy</h4>
          <div className="space-y-4">
            {/* Profile Visibility */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium">Profile Visibility</span>
                <p className="text-sm text-gray-500">Who can see your profile</p>
              </div>
              <select
                value={settings.profileVisibility}
                onChange={(e) => handleSelectChange('profileVisibility', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="public">🌍 Public</option>
                <option value="friends">👥 Friends Only</option>
                <option value="private">🔒 Private</option>
              </select>
            </div>

            {/* Show Email */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-700">Show Email Address</span>
                <p className="text-sm text-gray-500">Display your email on your profile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showEmail}
                  onChange={() => handleToggleChange('showEmail')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Allow Messages from Strangers */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-700">Allow Messages from Anyone</span>
                <p className="text-sm text-gray-500">Let non-followers send you messages</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowMessagesFromStrangers}
                  onChange={() => handleToggleChange('allowMessagesFromStrangers')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Show Online Status */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-700">Show Online Status</span>
                <p className="text-sm text-gray-500">Let others see when you're active</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showOnlineStatus}
                  onChange={() => handleToggleChange('showOnlineStatus')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Activity Privacy */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">📊 Activity Privacy</h4>
          <div className="space-y-4">
            {/* Show Activity */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-700">Show Activity Status</span>
                <p className="text-sm text-gray-500">Show your likes, comments, and interactions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showActivity}
                  onChange={() => handleToggleChange('showActivity')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Show Followers */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-700">Show Followers List</span>
                <p className="text-sm text-gray-500">Let others see who follows you</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showFollowers}
                  onChange={() => handleToggleChange('showFollowers')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Show Following */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-700">Show Following List</span>
                <p className="text-sm text-gray-500">Let others see who you follow</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showFollowing}
                  onChange={() => handleToggleChange('showFollowing')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Search Engine Indexing */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-700">Search Engine Indexing</span>
                <p className="text-sm text-gray-500">Allow search engines to index your profile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.indexProfile}
                  onChange={() => handleToggleChange('indexProfile')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">🔐 Security</h4>
          <div className="space-y-4">
            {/* Two-Factor Authentication */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-gray-700 font-medium">Two-Factor Authentication</span>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  settings.twoFactorEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {settings.twoFactorEnabled ? '✓ Enabled' : 'Disabled'}
                </span>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors">
                {settings.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
              </button>
            </div>

            {/* Login Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-700">Login Notifications</span>
                <p className="text-sm text-gray-500">Get notified of new logins to your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.loginNotifications}
                  onChange={() => handleToggleChange('loginNotifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Unusual Activity Alerts */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-700">Unusual Activity Alerts</span>
                <p className="text-sm text-gray-500">Get alerts for suspicious account activity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.unusualActivityAlerts}
                  onChange={() => handleToggleChange('unusualActivityAlerts')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">💻 Active Sessions</h4>
            <button 
              onClick={revokeAllSessions}
              className="px-3 py-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
            >
              Revoke All Others
            </button>
          </div>
          
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{session.device}</span>
                      {session.current && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Current Session
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span>{session.location}</span>
                      <span className="mx-2">•</span>
                      <span>{session.lastActive}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      IP: {session.ip}
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="px-3 py-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t">
          <button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className={`px-6 py-3 text-sm font-medium text-white rounded-lg transition-colors ${
              isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving Settings...
              </div>
            ) : (
              'Save Privacy Settings'
            )}
          </button>
        </div>
      </div>

      {/* Session Revoke Confirmation Modal */}
      {showSessionModal && sessionToRevoke && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revoke Session</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to revoke the session on <strong>{sessionToRevoke.device}</strong> from {sessionToRevoke.location}?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This will immediately log out this device and require re-authentication.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSessionModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRevokeSession}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Revoke Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;