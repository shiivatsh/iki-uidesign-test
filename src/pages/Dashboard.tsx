import React, { useState, useEffect, FunctionComponent, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
                                Welcome, {currentUser.name?.split(' ')[0] || 'User'}!
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
                
                {/* Simple Dashboard Overview */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-2xl">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        
                        <h2 className="text-4xl font-bold text-slate-800 mb-4">
                            Welcome to your Dashboard
                        </h2>
                        
                        <p className="text-xl text-slate-600 mb-8">
                            Your AI-powered home service management center
                        </p>
                        
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 shadow-lg">
                            <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                                Hello, {currentUser.name || 'User'}!
                            </h3>
                            <p className="text-slate-600 mb-6">
                                Use the sidebar to navigate and explore your home service options.
                                Start a new booking to chat with our AI assistant or view your service history.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a 
                                    href="/new-booking"
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Start New Booking
                                </a>
                            </div>
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