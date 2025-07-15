// frontend/src/components/ServiceSidebar.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Home, Calendar, DollarSign, User, MessageCircle, Clock, PlayCircle, ChevronDown, ChevronRight, Plus, Star, AlertCircle, WifiOff, CheckCircle, XCircle, PanelLeft, ChevronLeft } from 'lucide-react'; // Ensure all Lucide icons are imported
import { Button } from '@/components/ui/button'; // Assuming these UI components are correctly imported
import { Switch } from '@/components/ui/switch'; // Assuming this UI component is correctly imported
import { Badge } from '@/components/ui/badge'; // Assuming this UI component is correctly imported
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming these UI components are correctly imported
import { createPortal } from 'react-dom'; // createPortal is needed for the Impact Popup Modal

// --- Utility and Mock Data Functions (Ensure these are present) ---
// These functions are crucial for the component to work.
// If your actual data structure is different, you'll connect real data later.

const mockActiveChats = [
    { id: 'chat1', service_type: 'deep cleaning', last_updated: new Date(), status: 'draft', notes: 'Initial discussion about deep cleaning requirements.' },
    { id: 'chat2', service_type: 'office cleaning', last_updated: new Date(Date.now() - 3600000), status: 'pending_confirmation', notes: 'Waiting for customer confirmation on schedule.' },
];

const mockUpcomingBookings = [
    { id: 'job1', type: 'Standard Cleaning', location: '123 Main St', time: '10:00 AM', earnings: '$60', date: 'Jul 15' },
    { id: 'job2', type: 'Window Cleaning', location: '456 Oak Ave', time: '2:00 PM', earnings: '$80', date: 'Jul 16' },
];

const mockServiceHistory = [
    { id: 'hist1', service_type: 'standard cleaning', date: 'Jun 20', notes: 'Completed on time.', rating: 5 },
    { id: 'hist2', service_type: 'carpet cleaning', date: 'Jun 15', notes: 'Customer provided great feedback.', rating: 4 },
];

// Helper function to get status badge styling
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'draft': return { text: 'Draft', color: 'bg-blue-100 text-blue-700' }; // Changed to blue
        case 'pending_confirmation': return { text: 'Pending', color: 'bg-blue-100 text-blue-700' }; // Changed to blue
        case 'confirmed': return { text: 'Confirmed', color: 'bg-green-100 text-green-700' };
        default: return { text: 'Active', color: 'bg-blue-100 text-blue-700' }; // Default to blue for active
    }
};

// Helper function to get service icons
const getServiceIcon = (serviceType: string) => {
    const type = serviceType.toLowerCase();
    if (type.includes('clean')) return '🧹';
    if (type.includes('repair')) return '🔧';
    if (type.includes('plumb')) return '🚿';
    if (type.includes('electric')) return '⚡';
    if (type.includes('garden')) return '🌿';
    return '�';
};

// Helper function to format dates
const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    } catch {
        return dateString; // Return original string if date is invalid
    }
};

// --- Component Interfaces (Ensure these are present) ---
interface ActiveChat {
    id: string;
    service_type: string;
    status: 'draft' | 'pending_confirmation' | 'awaiting_details' | 'confirmed' | 'completed'; // Added more statuses
    last_updated: Date; // Changed to Date object for consistency
    notes?: string;
}

interface Booking {
    date: string;
    service_type: string;
    notes?: string;
}

interface UserData {
    tracking_code?: string;
    name?: string; // Made optional
    email?: string; // Made optional
    phone_number?: string;
    address?: string;
    bedrooms?: number;
    bathrooms?: number;
    service_history?: Booking[];
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

// --- Main ServiceSidebar Component ---
const ServiceSidebar: React.FC<ServiceSidebarProps> = ({ trackingCode, userData, onToggleCollapse, isOpen = true, onClose, onNewChat }) => {
    const [isCollapsed, setIsCollapsed] = useState(false); 
    const [isActiveChatsExpanded, setIsActiveChatsExpanded] = useState(true);
    const [isUpcomingBookingsExpanded, setIsUpcomingBookingsExpanded] = useState(true);
    const [isServiceHistoryExpanded, setIsServiceHistoryExpanded] = useState(true);
    const [showImpactPopup, setShowImpactPopup] = useState(false);

    const handleToggleCollapse = useCallback(() => {
        setIsCollapsed(prev => !prev);
        onToggleCollapse?.();
    }, [onToggleCollapse]);

    const handleNewChatClick = useCallback(() => {
        if (onNewChat) {
            onNewChat();
            if (onClose) onClose();
        }
    }, [onNewChat, onClose]);

    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
                if (onClose) onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Define the style for the squircle shape (used for various cards/buttons)
    const squircleStyle = {
        '--squircle': '16px', 
        borderRadius: 'var(--squircle)',
        clipPath: 'inset(0 round var(--squircle))',
    } as React.CSSProperties;

    return (
        <>
            {/* Mobile Overlay (for when sidebar is open on small screens) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" 
                    onClick={onClose}
                />
            )}
            
            {/* Sidebar Container */}
            <div 
                ref={sidebarRef}
                className={`
                    ${isCollapsed ? 'w-20' : 'w-80'} 
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
                    fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
                    bg-white/95 backdrop-blur-xl border-r border-slate-200/60 h-screen 
                    flex flex-col shadow-2xl transition-all duration-300
                    lg:${isCollapsed ? 'w-20' : 'w-80'}
                `}
            >
                {/* Header Section */}
                <div className={`${isCollapsed ? 'px-3 py-4' : 'px-6 py-4'} h-16 border-b border-slate-200/60 bg-gradient-to-r from-white via-blue-50/30 to-white flex items-center`}>
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
                            {isCollapsed ? (
                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
                            ) : (
                                <PanelLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-700" /> // Changed to PanelLeft for consistency
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Content Area of Sidebar */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* User Profile Summary */}
                    {!isCollapsed && userData && (
                        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 text-2xl font-semibold mb-2">
                                {userData.name?.charAt(0).toUpperCase() || userData.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <p className="text-sm font-semibold text-blue-800">{userData.name || userData.email}</p>
                            <p className="text-xs text-blue-600">{userData.tracking_code}</p>
                        </div>
                    )}

                    {/* Quick Actions Section */}
                    <div className="space-y-3">
                        <h3 className={`text-[10px] font-bold text-slate-500 uppercase tracking-wider ${isCollapsed ? 'text-center' : ''}`}>
                            {isCollapsed ? 'ACTIONS' : 'QUICK ACTIONS'}
                        </h3>
                        <div className="space-y-2">
                            <Button 
                                onClick={handleNewChatClick}
                                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-4 py-4 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-xl shadow-green-500/25 hover:shadow-2xl hover:scale-105 transform`}
                                style={squircleStyle}
                            >
                                <Plus className={`w-5 h-5 ${isCollapsed ? '' : 'mr-2'}`} />
                                {!isCollapsed && 'New Booking'}
                            </Button>
                            <Button variant="outline" className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-4 py-4 text-sm font-semibold rounded-2xl`} style={squircleStyle}>
                                <Star className={`w-5 h-5 ${isCollapsed ? '' : 'mr-2'}`} />
                                {!isCollapsed && 'Rate Service'}
                            </Button>
                        </div>
                    </div>

                    {/* My Services Section */}
                    <div className="space-y-3">
                        <h3 className={`text-[10px] font-bold text-slate-500 uppercase tracking-wider ${isCollapsed ? 'text-center' : ''}`}>
                            {isCollapsed ? 'MENU' : 'MY SERVICES'}
                        </h3>
                        <div className="space-y-2">
                            <Button variant="ghost" className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-100`}>
                                <MessageCircle className={`w-5 h-5 ${isCollapsed ? '' : 'mr-2'}`} />
                                {!isCollapsed && 'Chat & Booking History'}
                            </Button>
                            <Button variant="ghost" className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-100`}>
                                <Calendar className={`w-5 h-5 ${isCollapsed ? '' : 'mr-2'}`} />
                                {!isCollapsed && 'Upcoming Bookings'}
                            </Button>
                            <Button variant="ghost" className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-100`}>
                                <User className={`w-5 h-5 ${isCollapsed ? '' : 'mr-2'}`} />
                                {!isCollapsed && 'Account & Settings'}
                            </Button>
                            <Button variant="ghost" className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-100`}>
                                <AlertCircle className={`w-5 h-5 ${isCollapsed ? '' : 'mr-2'}`} />
                                {!isCollapsed && 'Support'}
                            </Button>
                        </div>
                    </div>

                    {/* Active Bookings Section - Only when expanded */}
                    {!isCollapsed && mockActiveChats.length > 0 && (
                        <div className="mb-8">
                            <button
                                onClick={() => setIsActiveChatsExpanded(!isActiveChatsExpanded)}
                                className="w-full flex items-center justify-between px-3 py-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:text-blue-800 transition-colors group" // Changed text-xs to text-[10px] and color
                                style={squircleStyle}
                            >
                                <span>ACTIVE BOOKINGS</span> {/* Changed to CAPS */}
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
                                                className="p-4 bg-blue-50 rounded-[var(--squircle)] border border-blue-200 hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
                                                style={squircleStyle}
                                            >
                                                <div className="flex items-start justify-between space-x-3">
                                                    <div className="text-xl mt-1 group-hover:scale-110 transition-transform">
                                                        <MessageCircle className="w-5 h-5 text-blue-600" /> {/* Changed color */}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h4 className="text-sm font-semibold text-blue-800 capitalize truncate group-hover:text-blue-600 transition-colors"> {/* Changed color */}
                                                                {chat.service_type}
                                                            </h4>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                                                {statusBadge.text}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-blue-600 mt-1 font-medium flex items-center space-x-1"> {/* Changed color */}
                                                            <Clock className="w-3 h-3" />
                                                            <span>{formatDate(chat.last_updated)}</span>
                                                        </p>
                                                        {chat.notes && (
                                                            <p className="text-xs text-blue-500 mt-2 line-clamp-2 leading-relaxed"> {/* Changed color */}
                                                                {chat.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => console.log('Resume chat:', chat.id)} // Placeholder for actual resume logic
                                                    className="flex items-center space-x-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium transition-colors group-hover:scale-105 transform" // Changed color
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
                                {mockServiceHistory.length > 0 ? (
                                    mockServiceHistory.slice(0, 5).map((booking, index) => (
                                        <div 
                                            key={index} 
                                            className="p-4 bg-slate-100 rounded-[var(--squircle)] border border-blue-200 hover:bg-blue-100 transition-colors duration-200 cursor-pointer" // Changed border and hover bg
                                            style={squircleStyle}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="text-xl mt-1 group-hover:scale-110 transition-transform">
                                                    {getServiceIcon(booking.service_type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-blue-800 capitalize truncate group-hover:text-blue-600 transition-colors"> {/* Changed color */}
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
        </>
    );
};

export default ServiceSidebar;
