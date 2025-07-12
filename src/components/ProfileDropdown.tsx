import React from 'react';
import { Settings, LogOut, User } from 'lucide-react';

interface ProfileDropdownProps {
  email: string;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ email, onSettingsClick, onLogoutClick }) => {
  return (
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Signed in as</p>
            <p className="text-sm text-gray-600 truncate max-w-48">{email}</p>
          </div>
        </div>
      </div>
      
      {/* Menu Items */}
      <div className="py-2">
        <button
          onClick={onSettingsClick}
          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
        >
          <Settings className="w-4 h-4 text-gray-500" />
          <span>Account Settings</span>
        </button>
        <button
          onClick={onLogoutClick}
          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;