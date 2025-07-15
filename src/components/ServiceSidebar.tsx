// frontend/src/components/ServiceSidebar.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Home, Calendar, DollarSign, User, MessageCircle, Clock, PlayCircle, ChevronDown, ChevronRight, Plus, Star, AlertCircle, WifiOff, CheckCircle, XCircle } from 'lucide-react'; // Added CheckCircle, XCircle
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming these are available
import { createPortal } from 'react-dom'; // Added createPortal

// Placeholder for mock data and utility functions (replace with actual data/logic)
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

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'draft': return { text: 'Draft', color: 'bg-blue-100 text-blue-700' }; // Changed to blue
        case 'pending_confirmation': return { text: 'Pending', color: 'bg-blue-100 text-blue-700' }; // Changed to blue
        case 'confirmed': return { text: 'Confirmed', color: 'bg-green-100 text-green-700' };
        default: return { text: 'Active', color: 'bg-blue-100 text-blue-700' }; // Changed to blue
    }
};

const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
        case 'standard_cleaning': return <Home />;
        case 'deep_cleaning': return <Sparkles />;
        case 'office_cleaning': return <Building />;
        default: return <Star />;
    }
};

const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

interface UserData {
    tracking_code: string;
    name: string;
    email: string;
    phone_number?: string;
    address?: string;
    bedrooms?: number;
    bathrooms?: number;
    service_history?: Array<{date: string; service_type: string; notes?: string}>;
    preferences?: unknown;
}

interface ServiceSidebarProps {
    trackingCode: string | null;
    userData?: UserData | null;
    onToggleCollapse?: () => void;
    isOpen?: boolean;
    onClose?: () => void;
    onNewChat?: () => void; // Added for new chat functionality
}

const ServiceSidebar: React.FC<ServiceSidebarProps> = ({ trackingCode, userData, onToggleCollapse, isOpen = true, onClose, onNewChat }) => {
    const [isCollapsed, setIsCollapsed] = useState(false); // Start collapsed if not explicitly open
    const [isActiveChatsExpanded, setIsActiveChatsExpanded] = useState(true);
    const [isUpcomingBookingsExpanded, setIsUpcomingBookingsExpanded] = useState(true);
    const [isServiceHistoryExpanded, setIsServiceHistoryExpanded] = useState(true);
    const [showImpactPopup, setShowImpactPopup] = useState(false); // Added state for Impact Popup

    const handleNewChatClick = useCallback(() => {
        if (onNewChat) {
            onNewChat();
            if (onClose) onClose(); // Close sidebar if it's a modal/overlay
        }
    }, [onNewChat, onClose]);

    // Use a ref for the sidebar to handle outside clicks for closing
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

    // Define the style for the squircle shape
    const squircleStyle = {
        '--squircle': '16px', // Adjust as needed for desired roundness
        borderRadius: 'var(--squircle)',
        clipPath: 'inset(0 round var(--squircle))',
    } as React.CSSProperties; // Type assertion for custom CSS properties

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
                            {isCollapsed ? (
                                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
                            ) : (
                                <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
                            )}
                        </button>
                    </div>
                </div>

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
                                style={squircleStyle} // Apply squircle style
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
                                style={squircleStyle} // Apply squircle style
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
                                                style={squircleStyle} // Apply squircle style
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
                                                        {chat.notes &&