import React, { useState, useEffect, FunctionComponent, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ServiceSidebar from '../components/ServiceSidebar';
import ChatInterface from '../components/ChatInterface';
import ProfileDropdown from '../components/ProfileDropdown';
import SettingsModal from '../components/SettingsModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ikiru-backend-515600662686.us-central1.run.app';

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

    // State for profile dropdown
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    // State for Settings Modal
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
        console.log('[Dashboard] No user authenticated, redirecting to main site.');
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
        return <LoadingFallback />;
    }

    console.log(`[Dashboard] Rendering main dashboard with ChatInterface for user: ${currentUser.email}`);
    
    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <ServiceSidebar 
                trackingCode={currentUser.tracking_code} 
                userData={{
                    tracking_code: currentUser.tracking_code,
                    name: currentUser.name || currentUser.email,
                    email: currentUser.email,
                    phone_number: currentUser.phone_number,
                    address: currentUser.address,
                    bedrooms: currentUser.bedrooms,
                    bathrooms: currentUser.bathrooms,
                    service_history: (currentUser.service_history || []) as Array<{date: string; service_type: string; notes?: string}>,
                    preferences: currentUser.preferences
                }}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Enhanced Header */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0 z-40">
                    <div className="px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    {/* Ikiru Logo/Brand */}
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                            Welcome back, {currentUser.name?.split(' ')[0] || currentUser.email?.split('@')[0]}
                                        </h1>
                                        <p className="text-sm text-slate-600">Your AI home service assistant</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                {!showPasswordModal && (
                                    <button 
                                        onClick={() => { 
                                            setShowPasswordModal(true); 
                                            setPasswordSetError(null); 
                                            setPasswordSetSuccess(null); 
                                        }}
                                        className="hidden md:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white/60 border border-slate-200 rounded-full hover:bg-white/80 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span>Security</span>
                                    </button>
                                )}
                                {/* Enhanced Profile Avatar */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full text-white hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-3 focus:ring-blue-500/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        <span className="text-sm font-semibold">
                                            {(currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || 'U').toUpperCase()}
                                        </span>
                                    </button>
                                    {isProfileDropdownOpen && currentUser && (
                                        <ProfileDropdown
                                            email={currentUser.email}
                                            onSettingsClick={handleSettingsClick}
                                            onLogoutClick={handleLogoutClick}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Status Messages */}
                        {passwordSetSuccess && (
                            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg animate-fade-in">
                                <p className="text-sm text-emerald-800">{passwordSetSuccess}</p>
                            </div>
                        )}
                        {passwordSetError && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                                <p className="text-sm text-red-800">{passwordSetError}</p>
                            </div>
                        )}
                    </div>
                </header>

                {/* Password Modal */}
                {showPasswordModal && (
                    <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                        <div className="p-6 max-w-md mx-auto">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Set Your Password
                            </h3>
                            <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input 
                                        type="password" 
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter a secure password"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-3 pt-2">
                                    <button 
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        Save Password
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { setShowPasswordModal(false); setPasswordSetError(null); setNewPassword(''); setConfirmPassword(''); }}
                                        className="px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Chat Interface */}
                <div className="flex-1 overflow-hidden">
                    <ChatInterface 
                        trackingCode={currentUser.tracking_code} 
                        userName={currentUser.name || currentUser.email} 
                    />
                </div>
            </main>

            {/* Settings Modal */}
            {currentUser && (
                <SettingsModal 
                    isOpen={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}

const DashboardPage: FunctionComponent = () => {
    return <DashboardContent />;
};

export default DashboardPage;
