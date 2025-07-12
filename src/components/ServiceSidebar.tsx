import React, { useState } from 'react';
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
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  const navigationItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', count: null },
    { id: 'new-booking', icon: Plus, label: 'New Booking', count: null },
    { id: 'history', icon: History, label: 'Service History', count: userData?.service_history?.length || 0 },
    { id: 'profile', icon: User, label: 'My Profile', count: null },
    { id: 'settings', icon: Settings, label: 'Settings', count: null },
  ];

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
    <div className="w-80 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 h-screen flex flex-col shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center space-x-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Ikiru</h1>
            <p className="text-xs text-slate-500">Your AI Assistant</p>
          </div>
        </div>
        
        {/* User Info Card */}
        {userData && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                {userData.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {userData.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {userData.address ? (
                    <span className="flex items-center">
                      <Building className="w-3 h-3 mr-1" />
                      {userData.address}
                    </span>
                  ) : 'No address set'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
            Navigation
          </h3>
          
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && item.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Service History Section */}
        <div className="mb-6">
          <button
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
          >
            <span>Recent Services</span>
            {isHistoryExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
          
          {isHistoryExpanded && (
            <div className="mt-2 space-y-1">
              {userData?.service_history && userData.service_history.length > 0 ? (
                userData.service_history.slice(0, 5).map((booking, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-lg mt-0.5">
                        {getServiceIcon(booking.service_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-800 capitalize truncate group-hover:text-blue-600 transition-colors">
                          {booking.service_type}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDate(booking.date)}
                        </p>
                        {booking.notes && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {booking.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 mb-1">No services yet</p>
                  <p className="text-xs text-slate-400">Book your first service to get started</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border-t border-slate-200 pt-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-green-500/25">
              <Plus className="w-4 h-4" />
              <span>Book New Service</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 hover:text-slate-800 transition-all duration-200">
              <Star className="w-4 h-4" />
              <span>Rate Last Service</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200/60 bg-white/50">
        <div className="text-center">
          <p className="text-xs text-slate-400">Ikiru Dashboard</p>
          <p className="text-xs text-slate-300 mt-0.5">v2.0.1</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceSidebar;