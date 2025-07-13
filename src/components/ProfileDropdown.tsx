import React from 'react';
import { Settings, LogOut, User } from 'lucide-react';

interface ProfileDropdownProps {
  email: string;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ email, onSettingsClick, onLogoutClick }) => {
  return (
    <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl overflow-hidden z-50 animate-fade-in rounded-2xl">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-blue-50/80 px-5 py-4 border-b border-slate-200/60">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">Signed in as</p>
            <p className="text-sm text-slate-600 truncate font-medium">{email}</p>
          </div>
        </div>
      </div>
      
      {/* Enhanced Menu Items */}
      <div className="py-3">
        <button
          onClick={onSettingsClick}
          className="w-full flex items-center space-x-4 px-5 py-4 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/50 hover:text-slate-900 transition-all duration-200 group"
        >
          <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Settings className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
          </div>
          <span>Account Settings</span>
        </button>
        <button
          onClick={onLogoutClick}
          className="w-full flex items-center space-x-4 px-5 py-4 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:text-red-700 transition-all duration-200 group"
        >
          <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-600" />
          </div>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;