import React, { useState, useEffect, FunctionComponent, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ServiceSidebar from '../components/ServiceSidebar';
import ChatInterface from '../components/ChatInterface';
import ProfileDropdown from '../components/ProfileDropdown';
import SettingsModal from '../components/SettingsModal';

const API_BASE_URL = 'https://ikiru-backend-515600662686.us-central1.run.app';

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
            <p className="text-slate-600 font-medium">Loading your chat interface...</p>
        </div>
    </div>
);

function NewBookingContent() {
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
        console.log('[NewBooking] Logout clicked');
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
                                New Booking - Chat with AI Assistant
                            </h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {/* Notification Icon */}
                        <button className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <Bell className="w-5 h-5 text-slate-600" />
                            {/* Notification Badge */}
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                        </button>
                        
                        {/* User Profile Circle */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 group"
                            >
                                {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                            </button>
                            
                            {isProfileDropdownOpen && (
                                <ProfileDropdown 
                                    email={currentUser.email}
                                    onSettingsClick={handleSettingsClick}
                                    onLogoutClick={handleLogoutClick}
                                />
                            )}
                        </div>
                    </div>
                </header>
                
                {/* Chat Interface */}
                <div className="flex-1 overflow-hidden relative">
                    <ChatInterface trackingCode={currentUser.tracking_code} userName={currentUser.name} />
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

const NewBooking: FunctionComponent = () => {
    return <NewBookingContent />;
};

export default NewBooking;