import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import RateLastService from './RateLastService';
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
  Building,
  Waves,
  X,
  PanelLeft,
  Clock,
  MessageCircle,
  PlayCircle
} from 'lucide-react';

interface Booking {
  date: string;
  service_type: string;
  notes?: string;
}

interface ActiveChat {
  id: string;
  service_type: string;
  status: 'draft' | 'pending_confirmation' | 'awaiting_details';
  last_updated: string;
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
  active_chats?: ActiveChat[];
  preferences?: unknown;
}

interface ServiceSidebarProps {
  trackingCode: string | null;
  userData?: UserData | null;
  onToggleCollapse?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onNewChat?: () => void;
}

const ServiceSidebar: React.FC<ServiceSidebarProps> = ({ trackingCode, userData, onToggleCollapse, isOpen = true, onClose, onNewChat }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [isActiveChatsExpanded, setIsActiveChatsExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState('new-booking');
  const [showImpactPopup, setShowImpactPopup] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onToggleCollapse?.();
  };

  const navigationItems = [
    { id: 'new-booking', icon: Plus, label: 'New Booking', path: '/new-booking', count: null },
    { id: 'history', icon: History, label: 'Service History', path: '/service-history', count: userData?.service_history?.length || 0 },
    { id: 'settings', icon: Settings, label: 'Account & Settings', path: '/account-settings', count: null },
  ];

  const handleNavigation = (item: any) => {
    if (item.path) {
      navigate(item.path);
      setActiveSection(item.id);
    } else {
      // For items without paths, just set active section (future functionality)
      setActiveSection(item.id);
      // You could show modals, different content, etc. here
      if (item.id === 'settings') {
        // Could trigger combined account & settings modal here
        console.log('Account & Settings clicked - could open profile editor and settings modal');
      } else if (item.id === 'history') {
        console.log('History clicked - could show detailed history view');
      }
    }
  };

  // Update active section based on current route
  React.useEffect(() => {
    if (location.pathname === '/new-booking') {
      setActiveSection('new-booking');
    }
  }, [location.pathname]);

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

  const getStatusBadge = (status: 'draft' | 'pending_confirmation' | 'awaiting_details') => {
    switch (status) {
      case 'draft':
        return { text: 'Draft', color: 'bg-amber-100 text-amber-700' };
      case 'pending_confirmation':
        return { text: 'Pending', color: 'bg-orange-100 text-orange-700' };
      case 'awaiting_details':
        return { text: 'Details', color: 'bg-yellow-100 text-yellow-700' };
      default:
        return { text: 'Active', color: 'bg-amber-100 text-amber-700' };
    }
  };

  const handleResumeChat = (chatId: string) => {
    // Navigate to chat interface with the specific chat ID
    console.log('Resuming chat:', chatId);
    // This would navigate to the chat interface in a real implementation
  };

  // Mock data for demonstration - replace with real data from props
  const mockActiveChats: ActiveChat[] = userData?.active_chats || [
    {
      id: 'chat-1',
      service_type: 'house cleaning',
      status: 'draft',
      last_updated: '2024-01-15T10:30:00Z',
      notes: 'Looking for weekly cleaning service'
    },
    {
      id: 'chat-2',
      service_type: 'plumbing repair',
      status: 'pending_confirmation',
      last_updated: '2024-01-14T15:45:00Z',
      notes: 'Kitchen sink needs fixing'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isCollapsed ? 'w-20' : 'w-80'} 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        bg-white/95 backdrop-blur-xl border-r border-slate-200/60 h-screen 
        flex flex-col shadow-2xl transition-all duration-300
        lg:${isCollapsed ? 'w-20' : 'w-80'}
      `}>
      {/* Header */}
      <div className={`${isCollapsed ? 'px-3 py-4' : 'px-6 py-4'} h-16 border-b border-slate-200/60 bg-gradient-to-r from-white via-blue-50/30 to-white flex items-center`}>
        {/* Header with Logo and Close Button */}
        <div className={`flex w-full ${isCollapsed ? 'flex-col items-center space-y-1' : 'justify-between items-center'}`}>
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">I</span>
              </div>
              <span className="text-lg font-bold text-slate-800">Ikiru</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">I</span>
            </div>
          )}
          <button 
            onClick={handleToggleCollapse}
            className="p-1 hover:bg-slate-100/50 rounded-md transition-colors group"
          >
            <PanelLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
          </button>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-5'} space-y-3`}>
        {/* Enhanced Quick Actions - Now on top */}
        {!isCollapsed && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-3">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  if (location.pathname === '/new-booking' && onNewChat) {
                    // If already on new-booking page, just reset the chat
                    onNewChat();
                  } else {
                    // Navigate to new-booking page normally
                    navigate('/new-booking');
                  }
                }} 
                className="w-full flex items-center justify-center space-x-3 px-4 py-4 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-xl shadow-green-500/25 hover:shadow-2xl hover:scale-105 transform"
              >
                <Plus className="w-5 h-5" />
                <span>Book New Service</span>
              </button>
              
              <RateLastService>
                <button className="w-full flex items-center justify-center space-x-3 px-4 py-4 text-sm font-semibold text-slate-600 bg-gradient-to-r from-slate-100 to-blue-50 rounded-2xl hover:from-slate-200 hover:to-blue-100 hover:text-slate-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 transform">
                  <Star className="w-5 h-5" />
                  <span>Rate Last Service</span>
                </button>
              </RateLastService>
            </div>
          </div>
        )}

        {!isCollapsed && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-3">
              Main Menu
            </h3>
            
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl text-sm font-medium transition-all duration-300 group ${
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
        )}
        
        {/* Collapsed Navigation - Only Icons */}
        {isCollapsed && (
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center justify-center p-3 rounded-xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl shadow-blue-500/25' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-blue-500'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'} transition-colors`} />
                </button>
              );
            })}
          </div>
        )}

        {/* Active Bookings Section - Only when expanded */}
        {!isCollapsed && mockActiveChats.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setIsActiveChatsExpanded(!isActiveChatsExpanded)}
              className="w-full flex items-center justify-between px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors group"
            >
              <span>Active Bookings</span>
              {isActiveChatsExpanded ? (
                <ChevronDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
              ) : (
                <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
              )}
            </button>
            
            {isActiveChatsExpanded && (
              <div className="mt-3 space-y-2">
                {mockActiveChats.map((chat) => {
                  const statusBadge = getStatusBadge(chat.status);
                  return (
                    <div 
                      key={chat.id} 
                      className="p-4 bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-amber-50/80 rounded-xl border border-amber-200/60 hover:border-amber-300 hover:shadow-lg transition-all duration-300 cursor-pointer group transform hover:scale-105"
                    >
                      <div className="flex items-start justify-between space-x-3">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <div className="text-xl mt-1 group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-semibold text-slate-800 capitalize truncate group-hover:text-amber-600 transition-colors">
                                {chat.service_type}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                {statusBadge.text}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(chat.last_updated)}</span>
                            </p>
                            {chat.notes && (
                              <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                {chat.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleResumeChat(chat.id)}
                          className="flex items-center space-x-1 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-xs font-medium transition-colors group-hover:scale-105 transform"
                          title="Resume Chat"
                        >
                          <PlayCircle className="w-3 h-3" />
                          <span>Resume</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Enhanced Service History Section - Only when expanded */}
        {!isCollapsed && (
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
        )}
      </div>

      {/* Fixed Your Impact Section at Bottom */}
      <div className={`${isCollapsed ? 'p-3' : 'p-5'} border-t border-slate-200/60 bg-white/95`}>
        <button
          onClick={() => setShowImpactPopup(true)}
          className={`w-full ${isCollapsed ? 'p-3' : 'p-4'} bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-blue-50/80 rounded-2xl border border-blue-100/60 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer group transform hover:scale-105`}
        >
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200" style={{background: 'linear-gradient(135deg, #0067E5, #4F46E5)'}}>
                <Waves className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-slate-800">Your Impact</p>
                <p className="text-xs font-medium" style={{color: '#0067E5'}}>80g Plastic Removed</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200" style={{background: 'linear-gradient(135deg, #0067E5, #4F46E5)'}}>
                <Waves className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </button>
        
        {/* Version Text - Only when expanded */}
        {!isCollapsed && (
          <div className="mt-3 text-center">
            <p className="text-xs text-slate-400 font-medium">v2.1.0 • AI Powered</p>
          </div>
        )}
      </div>

      {/* Impact Popup Modal - Using Portal to render outside sidebar */}
      {showImpactPopup && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowImpactPopup(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden z-10">
              {/* Header */}
              <div className="p-6 text-white relative" style={{background: 'linear-gradient(135deg, #0067E5, #4F46E5)'}}>
                <button
                  onClick={() => setShowImpactPopup(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Waves className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Your Impact</h3>
                </div>
              </div>
            
              {/* Content */}
              <div className="p-6">
                {/* Main Impact Stats */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{background: 'linear-gradient(135deg, #0067E5, #4F46E5)'}}>
                    <Waves className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-3xl font-bold text-slate-800 mb-1">80g</h4>
                  <p className="text-slate-600 font-medium">Plastic Removed</p>
                  <p className="text-sm text-slate-500">(4 bottles)</p>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold" style={{color: '#0067E5'}}>1.5%</p>
                    <p className="text-xs text-slate-600">Of Your Booking</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-xl">
                    <p className="text-2xl font-bold text-indigo-600">4</p>
                    <p className="text-xs text-slate-600">Cleaner Ocean</p>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-700 text-center leading-relaxed">
                    Together, we're working toward cleaner oceans. Thanks for being a part of it! 🌊
                  </p>
                </div>
               </div>
            </div>
        </div>,
        document.body
       )}
      </div>
    </>
  );
};

export default ServiceSidebar;