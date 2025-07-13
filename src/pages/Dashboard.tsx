import React, { useState, useEffect, FunctionComponent, useRef } from 'react';
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
            <p className="text-slate-600 font-medium">Loading your Ikiru dashboard...</p>
        </div>
    </div>
);

function DashboardContent() {
    const [searchParams] = useSearchParams();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoadingToken, setIsLoadingToken] = useState(true);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    // State for password management
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordSetSuccess, setPasswordSetSuccess] = useState<string | null>(null);
    const [passwordSetError, setPasswordSetError] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State for profile dropdown
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const handleSettingsClick = () => {
        console.log('Settings clicked');
        setIsSettingsModalOpen(true);
        setIsProfileDropdownOpen(false);
    };

    console.log(`[Dashboard] Rendering. currentUser: ${JSON.stringify(currentUser?.email)}. isLoadingToken: ${isLoadingToken}.`);

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
        console.log(`[Dashboard] useEffect triggered. Starting authentication check...`);
        
        const urlToken = searchParams.get('token');
        const urlTokenFromWindow = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') : null;
        const actualToken = urlToken || urlTokenFromWindow;
        
        console.log(`[Dashboard] Token sources - searchParams: ${urlToken ? 'found' : 'not found'}, window: ${urlTokenFromWindow ? 'found' : 'not found'}`);
        console.log(`[Dashboard] Using token: ${actualToken ? 'found' : 'not found'}`);

        const storedUserSession = typeof window !== 'undefined' ? localStorage.getItem('ikiru_user_session') : null;
        if (storedUserSession && !currentUser) {
            try {
                const userData = JSON.parse(storedUserSession);
                console.log("\"[Dashboard] Restored user session from localStorage:\"", userData.email);
                console.log("\"[Dashboard] Restored user session complete data:\"", JSON.stringify(userData, null, 2));
                setCurrentUser(userData);
                setIsLoadingToken(false);
                setIsCheckingSession(false);
                
                if (!userData.phone_number && !userData.bedrooms && !userData.bathrooms && !userData.address) {
                    console.log("\"[Dashboard] Stored session missing profile data, fetching fresh data from backend\"");
                    
                    axios.get(`${API_BASE_URL}/user/${userData.tracking_code}`)
                        .then(response => {
                            console.log("\"[Dashboard] Fresh user data fetched:\"", JSON.stringify(response.data, null, 2));
                            const updatedUserData = {
                                ...userData,
                                phone_number: response.data.phone_number,
                                address: response.data.address,
                                bedrooms: response.data.bedrooms,
                                bathrooms: response.data.bathrooms,
                                service_history: response.data.service_history || [],
                                preferences: response.data.preferences || {}
                            };
                            
                            setCurrentUser(updatedUserData);
                            localStorage.setItem('ikiru_user_session', JSON.stringify(updatedUserData));
                            console.log("\"[Dashboard] User session updated with fresh profile data\"");
                        })
                        .catch(error => {
                            console.log("\"[Dashboard] Failed to fetch fresh profile data:\"", error);
                        });
                }
                
                if (actualToken && typeof window !== 'undefined') {
                    console.log("\"[Dashboard] Cleaning URL after session restoration (magic link token found)\"");
                    const url = new URL(window.location.href);
                    url.searchParams.delete('token');
                    url.searchParams.delete('email');
                    window.history.replaceState({}, '', url.toString());
                }
                
                return;
            } catch (e) {
                console.log("\"[Dashboard] Invalid stored session, removing:\"", e);
                localStorage.removeItem('ikiru_user_session');
            }
        }

        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('ikiru_dashboard_token') : null;
        const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('ikiru_user_email') : null;
        
        console.log(`[Dashboard] Stored token: ${storedToken ? 'found' : 'not found'}, stored email: ${storedEmail ? 'found' : 'not found'}`);

        const token = storedToken || actualToken;
        
        setIsCheckingSession(false);

        if (token) {
            console.log(`[Dashboard] Authenticating with ${storedToken ? 'stored' : 'URL'} token...`);
            console.log(`[Dashboard] Token value: ${token.substring(0, 20)}...`);
            setIsLoadingToken(true);
            
            if (storedToken) {
                localStorage.removeItem('ikiru_dashboard_token');
                console.log("\"[Dashboard] Cleared stored token after use\"");
            }
            
            axios.post(`${API_BASE_URL}/api/dashboard/verify-token`, { token })
                .then(response => {
                    console.log("\"[Dashboard] Token verification successful. User data received:\"", response.data.user?.email);
                    console.log("\"[Dashboard] Complete user data:\"", JSON.stringify(response.data.user, null, 2));
                    
                    const userData = response.data.user;
                    
                    if (!userData.phone_number && !userData.bedrooms && !userData.bathrooms && !userData.address) {
                        console.log("\"[Dashboard] Token verified but missing profile data, fetching fresh data from backend\"");
                        
                        axios.get(`${API_BASE_URL}/user/${userData.tracking_code}`)
                            .then(profileResponse => {
                                console.log("\"[Dashboard] Fresh profile data fetched:\"", JSON.stringify(profileResponse.data, null, 2));
                                const updatedUserData = {
                                    ...userData,
                                    phone_number: profileResponse.data.phone_number,
                                    address: profileResponse.data.address,
                                    bedrooms: profileResponse.data.bedrooms,
                                    bathrooms: profileResponse.data.bathrooms,
                                    service_history: profileResponse.data.service_history || [],
                                    preferences: profileResponse.data.preferences || {}
                                };
                                
                                setCurrentUser(updatedUserData);
                                
                                if (typeof window !== 'undefined') {
                                    localStorage.setItem('ikiru_user_session', JSON.stringify(updatedUserData));
                                    console.log("\"[Dashboard] User session stored with fresh profile data\"");
                                }
                            })
                            .catch(error => {
                                console.log("\"[Dashboard] Failed to fetch fresh profile data after token verification:\"", error);
                                setCurrentUser(userData);
                                
                                if (typeof window !== 'undefined') {
                                    localStorage.setItem('ikiru_user_session', JSON.stringify(userData));
                                    console.log("\"[Dashboard] User session stored (profile fetch failed)\"");
                                }
                            });
                    } else {
                        setCurrentUser(userData);
                        
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('ikiru_user_session', JSON.stringify(userData));
                            console.log("\"[Dashboard] User session stored for persistent login\"");
                        }
                    }
                    
                    if (actualToken && typeof window !== 'undefined') {
                        console.log("\"[Dashboard] Cleaning URL by removing token parameter\"");
                        const url = new URL(window.location.href);
                        url.searchParams.delete('token');
                        url.searchParams.delete('email');
                        console.log("\"[Dashboard] URL before cleaning:\"", window.location.href);
                        console.log("\"[Dashboard] URL after cleaning:\"", url.toString());
                        window.history.replaceState({}, '', url.toString());
                        console.log("\"[Dashboard] URL cleaning completed\"");
                    }
                })
                .catch(error => {
                    console.error("\"[Dashboard] Token verification failed:\"", error);
                    console.error("\"[Dashboard] Error details:\"", error.response?.data || error.message);
                    
                    if (actualToken && typeof window !== 'undefined') {
                        console.log("\"[Dashboard] Cleaning URL after authentication failure\"");
                        const url = new URL(window.location.href);
                        url.searchParams.delete('token');
                        url.searchParams.delete('email');
                        window.history.replaceState({}, '', url.toString());
                    }
                })
                .finally(() => {
                    setIsLoadingToken(false);
                });
        } else {
            console.log("\"[Dashboard] No token found. Checking for existing user session and stored email.\"");
            
            if (storedEmail && !currentUser) {
                console.log("\"[Dashboard] Found stored email from button click, bypassing tracking code...\"");
                setIsLoadingToken(true);
                
                axios.post(`${API_BASE_URL}/api/send-magic-link`, { email: storedEmail })
                    .then(async (magicResponse) => {
                        console.log("\"[Dashboard] Fresh Magic Link requested successfully\"");
                        if (magicResponse.data.token) {
                            console.log("\"[Dashboard] Got fresh token, verifying...\"");
                            return axios.post(`${API_BASE_URL}/api/dashboard/verify-token`, { token: magicResponse.data.token });
                        } else {
                            console.log("\"[Dashboard] No immediate token available, but Magic Link sent to email\"");
                            throw new Error("No immediate token available");
                        }
                    })
                    .then(response => {
                        console.log("\"[Dashboard] Fresh token verification successful:\"", response.data.user?.email);
                        setCurrentUser(response.data.user);
                        localStorage.removeItem('ikiru_user_email');
                    })
                    .catch(() => {
                        console.log("\"[Dashboard] Authentication via button flow - showing clean access message\"");
                        localStorage.removeItem('ikiru_user_email');
                    })
                    .finally(() => {
                        setIsLoadingToken(false);
                    });
            } else {
                setIsLoadingToken(false);
                if (!currentUser) {
                  console.log("\"[Dashboard] No authentication found, will redirect to main site.\"");
                }
            }
        }
    }, [searchParams]);

    if (isLoadingToken || isCheckingSession) {
        console.log('[Dashboard] Rendering LoadingFallback, isLoadingToken, or isCheckingSession is true.');
        return <LoadingFallback />;
    }

    if (!currentUser) {
        console.log('[Dashboard] No user authenticated, showing demo mode.');
        // Demo mode - create a sample user for UI demonstration
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
        
        // Set demo user and continue to render dashboard
        setCurrentUser(demoUser);
        return <LoadingFallback />;
    }

    console.log(`[Dashboard] Rendering main dashboard overview for user: ${currentUser.email}`);
    
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
                                Welcome back, {currentUser.name?.split(' ')[0] || 'User'}
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
                                    {currentUser.email || 'No email'}
                                </div>
                            </div>
                        </button>
                        
                        {isProfileDropdownOpen && (
                            <ProfileDropdown
                                email={currentUser.email || 'No email'}
                                onSettingsClick={handleSettingsClick}
                                onLogoutClick={handleLogoutClick}
                            />
                        )}
                    </div>
                </header>
                
                {/* Main Chat Interface */}
                <div className="flex-1 flex overflow-hidden bg-transparent">
                    <div className="flex-1 relative">
                        <ChatInterface 
                            trackingCode={currentUser.tracking_code} 
                            userName={currentUser.name} 
                        />
                        
                        {/* Subtle Background Pattern */}
                        <div className="absolute inset-0 -z-10 opacity-30">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50"></div>
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Enhanced Settings Modal */}
            <SettingsModal 
                isOpen={isSettingsModalOpen} 
                onClose={() => setIsSettingsModalOpen(false)} 
                currentUser={currentUser}
            />
        </div>
    );
}

export default function Dashboard() {
    return <DashboardContent />;
}