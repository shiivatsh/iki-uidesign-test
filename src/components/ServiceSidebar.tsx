import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Plus, 
  History, 
  Settings, 
  Home,
  User,
  CreditCard,
  Star,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Building
} from 'lucide-react';

interface Booking {
  date: string;
  service_type: string;
  notes?: string;
}

interface UserData {
  tracking_code?: string;
  name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  service_history: Booking[];
  preferences?: unknown;
}

interface ServiceSidebarProps {
  trackingCode: string | null;
  userData?: UserData | null;
}

const ServiceSidebar: React.FC<ServiceSidebarProps> = ({ trackingCode, userData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);

  const navigationItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/dashboard', count: null },
    { id: 'new-booking', icon: Plus, label: 'New Booking', path: '/new-booking', count: null },
    { id: 'history', icon: History, label: 'Service History', path: '/dashboard', count: userData?.service_history?.length || 0 },
    { id: 'profile', icon: User, label: 'My Profile', path: '/dashboard', count: null },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/dashboard', count: null },
  ];

  const handleNavigation = (item: any) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const getServiceIcon = (serviceType: string) => {
    const type = serviceType.toLowerCase();
    if (type.includes('clean')) return '🧹';
    if (type.includes('repair')) return '🔧';
    if (type.includes('plumb')) return '🚿';
    if (type.includes('electric')) return '⚡';
    if (type.includes('garden')) return '🌿';
    return '🏠';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-80 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 h-screen flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-white via-blue-50/30 to-white">
        <div className="flex items-center space-x-3 mb-1">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Ikiru</h1>
            <p className="text-xs text-slate-500 font-medium">AI Home Assistant</p>
          </div>
        </div>
        
        {/* Enhanced User Info Card */}
        {userData && (
          <div className="mt-5 p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-blue-50/80 rounded-2xl border border-blue-100/60 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-medium shadow-lg">
                {userData.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {userData.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {userData.address ? (
                    <span className="flex items-center">
                      <Building className="w-3 h-3 mr-1.5" />
                      {userData.address}
                    </span>
                  ) : (
                    <span className="flex items-center text-slate-400">
                      <Building className="w-3 h-3 mr-1.5" />
                      Add your address
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Navigation */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-3">
            Main Menu
          </h3>
          
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl shadow-blue-500/25 scale-105' 
                    : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/50 hover:text-slate-800 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'} transition-colors`} />
                  <span className="font-semibold">{item.label}</span>
                </div>
                {item.count !== null && item.count > 0 && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isActive 
                      ? 'bg-white/25 text-white' 
                      : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                  } transition-colors`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Enhanced Service History Section */}
        <div className="mb-8">
          <button
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="w-full flex items-center justify-between px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors group"
          >
            <span>Recent Services</span>
            {isHistoryExpanded ? (
              <ChevronDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
            ) : (
              <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
          </button>
          
          {isHistoryExpanded && (
            <div className="mt-3 space-y-2">
              {userData?.service_history && userData.service_history.length > 0 ? (
                userData.service_history.slice(0, 5).map((booking, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-gradient-to-r from-white via-blue-50/20 to-white rounded-xl border border-slate-200/60 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer group transform hover:scale-105"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-xl mt-1 group-hover:scale-110 transition-transform">
                        {getServiceIcon(booking.service_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800 capitalize truncate group-hover:text-blue-600 transition-colors">
                          {booking.service_type}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          {formatDate(booking.date)}
                        </p>
                        {booking.notes && (
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                            {booking.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200/60">
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Calendar className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-1">No services yet</p>
                  <p className="text-xs text-slate-400 leading-relaxed">Book your first service to get started on your home journey</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Quick Actions */}
        <div className="border-t border-slate-200/60 pt-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-3">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center space-x-3 px-4 py-4 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-xl shadow-green-500/25 hover:shadow-2xl hover:scale-105 transform">
              <Plus className="w-5 h-5" />
              <span>Book New Service</span>
            </button>
            
            <button className="w-full flex items-center justify-center space-x-3 px-4 py-4 text-sm font-semibold text-slate-600 bg-gradient-to-r from-slate-100 to-blue-50 rounded-2xl hover:from-slate-200 hover:to-blue-100 hover:text-slate-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 transform">
              <Star className="w-5 h-5" />
              <span>Rate Last Service</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="p-5 border-t border-slate-200/60 bg-gradient-to-r from-white via-blue-50/20 to-white">
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-400">Ikiru Dashboard</p>
          <p className="text-xs text-slate-300 mt-1 font-medium">v2.1.0 • AI Powered</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceSidebar;