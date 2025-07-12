import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  CreditCard, 
  Shield, 
  Bell, 
  Palette,
  Save,
  Check,
  AlertCircle,
  Home,
  Phone,
  Mail,
  Bed,
  Bath,
  MapPin,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface UserData {
  tracking_code?: string;
  name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  service_history?: unknown[];
  preferences?: unknown;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserData | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Profile state
  const [profileData, setProfileData] = useState<UserData>({});
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Notification state
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    marketing: false
  });

  // Initialize profile data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        tracking_code: currentUser.tracking_code || '',
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone_number: currentUser.phone_number || '',
        address: currentUser.address || '',
        bedrooms: currentUser.bedrooms || 1,
        bathrooms: currentUser.bathrooms || 1,
        service_history: currentUser.service_history || [],
        preferences: currentUser.preferences || {}
      });
    }
  }, [currentUser]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette }
  ];

  const handleSave = async () => {
    setLoading(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess('Settings saved successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      setSaveError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setSaveError('New passwords do not match.');
      return;
    }
    if (passwordData.new.length < 8) {
      setSaveError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess('Password updated successfully!');
      setPasswordData({ current: '', new: '', confirm: '' });
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      setSaveError('Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Account Settings</h2>
              <p className="text-sm text-slate-500">Manage your profile and preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success/Error Messages */}
        {(saveSuccess || saveError) && (
          <div className="px-6 py-3 border-b border-slate-200">
            {saveSuccess && (
              <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">{saveSuccess}</span>
              </div>
            )}
            {saveError && (
              <div className="flex items-center space-x-2 text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{saveError}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-white hover:text-slate-800 hover:shadow-sm'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Personal Information</h3>
                  <p className="text-sm text-slate-500 mb-6">Update your personal details and contact information.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                      <User className="w-4 h-4" />
                      <span>Full Name</span>
                    </label>
                    <input 
                      type="text" 
                      value={profileData.name || ''}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </label>
                    <input 
                      type="email" 
                      value={profileData.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                      placeholder="Email cannot be changed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </label>
                    <input 
                      type="tel" 
                      value={profileData.phone_number || ''}
                      onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                      <MapPin className="w-4 h-4" />
                      <span>Service Address</span>
                    </label>
                    <input 
                      type="text" 
                      value={profileData.address || ''}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your service address"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                      <Bed className="w-4 h-4" />
                      <span>Bedrooms</span>
                    </label>
                    <select 
                      value={profileData.bedrooms || 1}
                      onChange={(e) => setProfileData({...profileData, bedrooms: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num} Bedroom{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                      <Bath className="w-4 h-4" />
                      <span>Bathrooms</span>
                    </label>
                    <select 
                      value={profileData.bathrooms || 1}
                      onChange={(e) => setProfileData({...profileData, bathrooms: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num} Bathroom{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Security Settings</h3>
                  <p className="text-sm text-slate-500 mb-6">Manage your password and security preferences.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                      <Lock className="w-4 h-4" />
                      <span>Current Password</span>
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                        className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                      <Lock className="w-4 h-4" />
                      <span>New Password</span>
                    </label>
                    <input 
                      type="password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                      <Lock className="w-4 h-4" />
                      <span>Confirm New Password</span>
                    </label>
                    <input 
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <button 
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>{loading ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Notification Preferences</h3>
                  <p className="text-sm text-slate-500 mb-6">Choose how you want to receive notifications.</p>
                </div>

                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <h4 className="text-sm font-medium text-slate-800 capitalize">
                          {key === 'sms' ? 'SMS' : key} Notifications
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Receive {key} notifications about your services
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications({...notifications, [key]: !value})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-blue-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">App Preferences</h3>
                  <p className="text-sm text-slate-500 mb-6">Customize your app experience.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="text-sm font-medium text-slate-800 mb-2">Theme</h4>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Light
                      </button>
                      <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium">
                        Dark
                      </button>
                      <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Auto
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="text-sm font-medium text-slate-800 mb-2">Language</h4>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                  >
                    <Palette className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;