import React, { useState, useEffect, FunctionComponent, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import ServiceSidebar from '../components/ServiceSidebar';
import ChatInterface from '../components/ChatInterface';
import ProfileDropdown from '../components/ProfileDropdown';
import SettingsModal from '../components/SettingsModal';
import { Menu } from 'lucide-react';

const API_BASE_URL = 'https://ikiru-backend-515600662686.us-central1.run.app';

interface User {
    tracking_code: string;
    name: string;
    email: string;
    address?: string;
    service_history?: unknown[];
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

    // State for profile dropdown and chat mode
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [showChat, setShowChat] = useState(false);

    const handleNewChat = () => {
        setShowChat(true);
        console.log('New chat started - switching to chat view');
    };

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

    const handleSetPasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPasswordSetError(null);
        setPasswordSetSuccess(null);

        if (newPassword !== confirmPassword) {
            setPasswordSetError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            setPasswordSetError("Password must be at least 8 characters long.");
            return;
        }
        if (!currentUser?.email) {
            setPasswordSetError("User email not found. Cannot set password.");
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/api/user/set-password`, {
                email: currentUser.email,
                new_password: newPassword
            });
            setPasswordSetSuccess("Password successfully updated!");
            setShowPasswordModal(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'detail' in err.response.data ? String(err.response.data.detail) : 'Failed to set password. Please try again';
            console.error("Error setting password:", errorMessage);
            setPasswordSetError(errorMessage + ".");
        }
    };

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
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <AppSidebar onNewChat={handleNewChat} userData={currentUser} />
                
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Unified responsive header */}
                    <header className="bg-background border-b-[0.5px] border-border sticky top-0 z-50 flex-shrink-0">
                        <div className="flex items-center justify-between h-14 md:h-16 px-4 md:px-6">
                            {/* Left side - Mobile sidebar trigger and branding */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <SidebarTrigger className="md:hidden" />
                                <div className="md:hidden flex items-center gap-2">
                                    <h1 className="text-lg font-semibold text-foreground">Ikiru</h1>
                                </div>
                                <div className="hidden md:block">
                                    <h1 className="text-xl lg:text-2xl font-bold text-foreground">Dashboard</h1>
                                </div>
                            </div>
                            
                            {/* Right side - Actions and profile */}
                            <div className="flex items-center gap-2 md:gap-3">
                                {/* Security button */}
                                {!showPasswordModal && (
                                    <button 
                                        onClick={() => { 
                                            setShowPasswordModal(true); 
                                            setPasswordSetError(null); 
                                            setPasswordSetSuccess(null); 
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-background border-[0.5px] border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                                        style={{ borderRadius: 'var(--squircle, 8px)' }}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span className="hidden sm:inline">Security</span>
                                    </button>
                                )}

                                {/* Mobile menu for additional options */}
                                <div className="md:hidden relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-background border-[0.5px] border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                                        style={{ borderRadius: 'var(--squircle, 8px)' }}
                                    >
                                        <Menu className="w-4 h-4" />
                                    </button>
                                    
                                    {isProfileDropdownOpen && (
                                        <ProfileDropdown
                                            email={currentUser.email}
                                            onSettingsClick={handleSettingsClick}
                                            onLogoutClick={handleLogoutClick}
                                        />
                                    )}
                                </div>

                                {/* Desktop profile section */}
                                <div className="hidden md:flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
                                        <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                                    </div>
                                    
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                                            style={{ borderRadius: 'var(--squircle, 50%)' }}
                                        >
                                            <span className="text-sm font-semibold">
                                                {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
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
                            </div>
                        </div>
                    </header>

                    {/* Main Dashboard Content */}
                    {!showChat ? (
                        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
                        {/* Quick Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-card rounded-xl border p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <span className="text-xl">🏠</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">{currentUser.service_history?.length || 0}</h3>
                                        <p className="text-sm text-muted-foreground">Total Services</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card rounded-xl border p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="text-xl">🌊</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">80g</h3>
                                        <p className="text-sm text-muted-foreground">Plastic Removed</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card rounded-xl border p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <span className="text-xl">⭐</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">4.8</h3>
                                        <p className="text-sm text-muted-foreground">Avg Rating</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Action - Book Service */}
                        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-8">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-foreground mb-2">Need a service?</h2>
                                <p className="text-muted-foreground mb-6">Start a conversation to book your next home service</p>
                                <button 
                                    onClick={handleNewChat}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium text-lg"
                                >
                                    <span className="text-xl">💬</span>
                                    Start Service Booking
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-card rounded-xl border p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                            {currentUser.service_history && currentUser.service_history.length > 0 ? (
                                <div className="space-y-4">
                                    {currentUser.service_history.slice(0, 3).map((service: any, index: number) => (
                                        <div key={index} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                                            <div className="text-2xl">
                                                {service.service_type.toLowerCase().includes('clean') ? '🧹' : 
                                                 service.service_type.toLowerCase().includes('plumb') ? '🚿' : 
                                                 service.service_type.toLowerCase().includes('electric') ? '⚡' : '🏠'}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-foreground capitalize">{service.service_type}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(service.date).toLocaleDateString('en-US', { 
                                                        month: 'long', 
                                                        day: 'numeric', 
                                                        year: 'numeric' 
                                                    })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm text-primary font-medium">View Chat →</span>
                                            </div>
                                        </div>
                                    ))
                                    }
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">📝</div>
                                    <p className="text-muted-foreground">No service history yet</p>
                                    <p className="text-sm text-muted-foreground mt-1">Your completed services will appear here</p>
                                </div>
                            )}
                        </div>

                        {/* Your Impact Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-xl text-white">🌊</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-900">Your Environmental Impact</h3>
                                    <p className="text-sm text-blue-700">Making a difference, one service at a time</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-white/50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">80g</div>
                                    <div className="text-sm text-blue-700">Plastic Removed</div>
                                </div>
                                <div className="text-center p-4 bg-white/50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">4</div>
                                    <div className="text-sm text-blue-700">Bottles Worth</div>
                                </div>
                            </div>
                        </div>
                    </main>
                    ) : (
                        <div className="flex-1 flex flex-col">
                            <div className="flex-1 flex items-center justify-center p-6">
                                <div className="w-full max-w-4xl h-full max-h-[calc(100vh-200px)] bg-background rounded-xl">
                                    <ChatInterface 
                                        trackingCode={currentUser.tracking_code}
                                        userName={currentUser.name}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings Modal */}
                    <SettingsModal 
                        isOpen={isSettingsModalOpen}
                        onClose={() => setIsSettingsModalOpen(false)}
                        currentUser={currentUser}
                    />
                </div>
            </div>
        </SidebarProvider>
    );
}

export default function Dashboard() {
    return <DashboardContent />;
}
