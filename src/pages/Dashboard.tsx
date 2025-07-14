import React, { useState, useEffect, FunctionComponent, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Clock, Home, TrendingUp, CheckCircle, MapPin, Phone, User as UserIcon } from 'lucide-react';
import ServiceSidebar from '../components/ServiceSidebar';
import ProfileDropdown from '../components/ProfileDropdown';
import SettingsModal from '../components/SettingsModal';

interface Booking {
    date: string;
    service_type: string;
    notes?: string;
}

interface User {
    tracking_code: string;
    name: string;
    email: string;
    address?: string;
    service_history: Booking[];
    preferences?: unknown;
    phone_number?: string;
    bedrooms?: number;
    bathrooms?: number;
}

const LoadingFallback = () => (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
    </div>
);

function DashboardContent() {
    const [searchParams] = useSearchParams();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoadingToken, setIsLoadingToken] = useState(true);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    // State for profile dropdown
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const handleSettingsClick = () => {
        console.log('Settings clicked');
        setIsSettingsModalOpen(true);
        setIsProfileDropdownOpen(false);
    };

    const handleLogoutClick = () => {
        console.log('[Dashboard] Logout clicked');
        if (typeof window !== 'undefined') {
            localStorage.removeItem('ikiru_user_session');
            localStorage.removeItem('ikiru_dashboard_token');
            localStorage.removeItem('ikiru_user_email');
        }
        setCurrentUser(null);
        setIsProfileDropdownOpen(false);
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    };

    useEffect(() => {
        // Check for stored user session first
        const storedUserSession = typeof window !== 'undefined' ? localStorage.getItem('ikiru_user_session') : null;
        if (storedUserSession && !currentUser) {
            try {
                const userData = JSON.parse(storedUserSession);
                setCurrentUser(userData);
                setIsLoadingToken(false);
                setIsCheckingSession(false);
                return;
            } catch (e) {
                localStorage.removeItem('ikiru_user_session');
            }
        }

        // Demo mode fallback
        setIsLoadingToken(false);
        setIsCheckingSession(false);
        
        if (!currentUser) {
            const demoUser: User = {
                tracking_code: 'DEMO123',
                name: 'Demo User',
                email: 'demo@ikiru.com',
                address: '123 Demo Street, Demo City',
                phone_number: '+1 (555) 123-4567',
                bedrooms: 3,
                bathrooms: 2,
                service_history: [
                    {
                        date: '2024-01-15',
                        service_type: 'House Cleaning',
                        notes: 'Deep cleaning service completed successfully'
                    },
                    {
                        date: '2024-01-08',
                        service_type: 'Plumbing Repair',
                        notes: 'Fixed kitchen sink leak'
                    },
                    {
                        date: '2024-01-05',
                        service_type: 'Electrical Repair',
                        notes: 'Fixed kitchen outlet'
                    }
                ],
                preferences: {}
            };
            setCurrentUser(demoUser);
        }
    }, [searchParams]);

    if (isLoadingToken || isCheckingSession) {
        return <LoadingFallback />;
    }

    if (!currentUser) {
        return <LoadingFallback />;
    }

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

    const recentServices = currentUser.service_history?.slice(0, 3) || [];
    const totalServices = currentUser.service_history?.length || 0;
    
    return (
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Enhanced Service Sidebar */}
            <ServiceSidebar trackingCode={currentUser.tracking_code} userData={currentUser} />
            
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Sleek Header */}
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 relative z-10">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h1 className="text-lg font-semibold text-slate-800">
                                Dashboard Overview
                            </h1>
                        </div>
                    </div>
                    
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100/80 transition-all duration-200 group"
                        >
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-medium shadow-lg group-hover:shadow-xl transition-all duration-200">
                                {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="text-left hidden sm:block">
                                <div className="text-sm font-medium text-slate-800">
                                    {currentUser.name || 'User'}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {currentUser.email || 'user@example.com'}
                                </div>
                            </div>
                            <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        {isProfileDropdownOpen && (
                            <ProfileDropdown 
                                email={currentUser.email}
                                onSettingsClick={handleSettingsClick}
                                onLogoutClick={handleLogoutClick}
                            />
                        )}
                    </div>
                </header>
                
                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">
                            Welcome back, {currentUser.name?.split(' ')[0] || 'User'}!
                        </h2>
                        <p className="text-slate-600">Here's an overview of your home services and account.</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Services */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">{totalServices}</h3>
                            <p className="text-sm text-slate-600">Total Services</p>
                        </div>

                        {/* Property Info */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                                    <Home className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">{currentUser.bedrooms || 0}</h3>
                            <p className="text-sm text-slate-600">Bedrooms</p>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Home className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">{currentUser.bathrooms || 0}</h3>
                            <p className="text-sm text-slate-600">Bathrooms</p>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">
                                {recentServices.length > 0 ? formatDate(recentServices[0].date) : 'No services'}
                            </h3>
                            <p className="text-sm text-slate-600">Last Service</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Profile Information */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <UserIcon className="w-5 h-5 mr-2" />
                                Profile Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-medium">
                                        {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">{currentUser.name}</p>
                                        <p className="text-sm text-slate-600">{currentUser.email}</p>
                                    </div>
                                </div>
                                
                                {currentUser.address && (
                                    <div className="flex items-start space-x-3 pt-2">
                                        <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                                        <p className="text-sm text-slate-600">{currentUser.address}</p>
                                    </div>
                                )}
                                
                                {currentUser.phone_number && (
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-5 h-5 text-slate-400" />
                                        <p className="text-sm text-slate-600">{currentUser.phone_number}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Services */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                Recent Services
                            </h3>
                            {recentServices.length > 0 ? (
                                <div className="space-y-4">
                                    {recentServices.map((service, index) => (
                                        <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50/50 rounded-xl border border-slate-200/40">
                                            <div className="text-2xl mt-1">
                                                {getServiceIcon(service.service_type)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-slate-800">{service.service_type}</h4>
                                                <p className="text-sm text-slate-500 mb-1">{formatDate(service.date)}</p>
                                                {service.notes && (
                                                    <p className="text-sm text-slate-600">{service.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500">No services yet</p>
                                    <p className="text-sm text-slate-400">Your service history will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Settings Modal */}
            {isSettingsModalOpen && (
                <SettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}

const Dashboard: FunctionComponent = () => {
    return <DashboardContent />;
};

export default Dashboard;