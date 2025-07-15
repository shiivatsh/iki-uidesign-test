import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, Sparkles, User, Bot, AlertCircle, WifiOff } from 'lucide-react';
import { useChatApi } from '@/hooks/useChatApi';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Message, ChatStatus } from '@/services/chatApi';
import { useToast } from '@/hooks/use-toast';

// Legacy message interface for compatibility
interface LegacyMessage {
    id: string;
    sender: 'user' | 'llm';
    content: string;
    timestamp: Date;
}

interface ChatInterfaceProps {
    trackingCode: string | null;
    userName?: string;
    rebookData?: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ trackingCode, userName, rebookData }) => {
    // Local state for input and UI
    const [input, setInput] = useState('');
    const [legacyMessages, setLegacyMessages] = useState<LegacyMessage[]>([]);
    const [useLegacyMode, setUseLegacyMode] = useState(true); // Start with legacy for compatibility
    const [rebookMessageSent, setRebookMessageSent] = useState(false);
    
    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    
    // Hooks
    const { toast } = useToast();
    const { handleError } = useErrorHandler();
    
    // Chat API hook (for new chat system)
    const {
        currentChat,
        messages: apiMessages,
        isLoading,
        isConnecting,
        lastError,
        sendMessage,
        sendLegacyMessage,
        createNewChat,
        canSendMessage
    } = useChatApi({
        userId: trackingCode || 'demo-user',
        onChatCreated: (chat) => {
            console.log('New chat created:', chat.id);
            setUseLegacyMode(false);
        },
        onMessageSent: (message) => {
            console.log('Message sent:', message.id);
        },
        onError: (error) => {
            console.error('Chat API error:', error);
        }
    });

    // Memoized messages for performance
    const displayMessages = useMemo(() => {
        if (useLegacyMode) {
            return legacyMessages.map(msg => ({
                ...msg,
                sender: msg.sender === 'llm' ? 'ai' as const : msg.sender
            }));
        }
        return apiMessages;
    }, [useLegacyMode, legacyMessages, apiMessages]);

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [displayMessages, scrollToBottom]);

    // Enhanced message sending with error handling
    const handleSendMessage = useCallback(async (messageToSend?: string) => {
        const messageContent = messageToSend || input.trim();
        if (messageContent === '' || !trackingCode) {
            if (!trackingCode) {
                toast({
                    title: 'Authentication Required',
                    description: "Please ensure you're properly authenticated to chat.",
                    variant: 'destructive',
                });
            }
            return;
        }

        if (!messageToSend) {
            setInput(''); // Only clear input if it's from user input
        }

        try {
            if (useLegacyMode) {
                // Legacy mode for backward compatibility
                const userMessage: LegacyMessage = {
                    id: `user-${Date.now()}`,
                    sender: 'user',
                    content: messageContent,
                    timestamp: new Date()
                };
                
                setLegacyMessages(prev => [...prev, userMessage]);

                const response = await sendLegacyMessage(trackingCode, messageContent);
                
                if (response) {
                    const aiMessage: LegacyMessage = {
                        id: `ai-${Date.now()}`,
                        sender: 'llm',
                        content: response,
                        timestamp: new Date()
                    };
                    setLegacyMessages(prev => [...prev, aiMessage]);
                } else {
                    // Error message already handled by useChatApi
                    const errorMessage: LegacyMessage = {
                        id: `error-${Date.now()}`,
                        sender: 'llm',
                        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
                        timestamp: new Date()
                    };
                    setLegacyMessages(prev => [...prev, errorMessage]);
                }
            } else {
                // New API mode
                await sendMessage(messageContent);
            }
        } catch (error) {
            handleError(error, {
                fallbackMessage: 'Failed to send message',
                showToast: true,
            });
            
            // Restore input if message failed
            setInput(messageContent);
        }
    }, [input, trackingCode, useLegacyMode, sendMessage, sendLegacyMessage, toast, handleError]);

    // Handle rebook data if present
    useEffect(() => {
        if (rebookData && rebookData.isRebook && !rebookMessageSent) {
            const rebookMessage = `I'd like to rebook the same service with ${rebookData.providerId}. Here are the previous details:
            
Service: ${rebookData.serviceType}
Provider: ${rebookData.providerId}
Duration: ${rebookData.duration}
Previous Cost: $${rebookData.cost}

Please help me schedule this service again. I'd like to keep the same provider if possible.`;
            
            setRebookMessageSent(true);
            
            // Auto-send the rebook request after a short delay
            setTimeout(() => {
                handleSendMessage(rebookMessage);
            }, 1000);
        }
    }, [rebookData, rebookMessageSent, handleSendMessage]);

    // Clear messages when tracking code changes
    useEffect(() => {
        if (trackingCode) {
            setLegacyMessages([]);
        }
    }, [trackingCode, userName]);

    // Keyboard handling
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    // Auto-resize textarea
    const autoResize = useCallback(() => {
        const textarea = inputRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    }, []);

    useEffect(() => {
        autoResize();
    }, [input, autoResize]);

    // Connection status indicator
    const getConnectionStatus = () => {
        if (isConnecting) return { status: 'connecting', text: 'Connecting...', icon: WifiOff };
        if (lastError) return { status: 'error', text: 'Connection error', icon: AlertCircle };
        if (!trackingCode) return { status: 'disconnected', text: 'Not authenticated', icon: WifiOff };
        return { status: 'connected', text: 'Connected', icon: null };
    };

    const connectionStatus = getConnectionStatus();
    const currentLoading = isLoading || isConnecting;

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Connection Status Bar */}
            {(connectionStatus.status !== 'connected' || lastError) && (
                <div className={`px-4 py-2 text-sm border-b flex items-center justify-center gap-2 ${
                    connectionStatus.status === 'error' 
                        ? 'bg-destructive/10 text-destructive border-destructive/20' 
                        : 'bg-muted text-muted-foreground border-border'
                }`}>
                    {connectionStatus.icon && <connectionStatus.icon className="w-4 h-4" />}
                    <span>{connectionStatus.text}</span>
                    {lastError && (
                        <button 
                            onClick={() => window.location.reload()}
                            className="ml-2 px-2 py-1 text-xs bg-background rounded border hover:bg-muted transition-colors"
                        >
                            Retry
                        </button>
                    )}
                </div>
            )}

            {/* Empty State / Welcome */}
            {displayMessages.length === 0 && !currentLoading && (
                <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center w-full max-w-4xl mx-auto animate-fade-in">
                        {/* Welcome Text */}
                        <h1 className="text-3xl md:text-4xl font-title font-medium text-foreground mb-3">
                            Hello {userName?.split(' ')[0] || 'Shiva'}
                        </h1>
                        
                        {/* Centered Chat Input */}
                        <div className="mb-12">
                            <div className="relative w-full max-w-[765px] mx-auto">
                                <div 
                                    className="relative bg-white border border-border shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200 px-6 py-4 w-full h-[116px]"
                                    style={{ 
                                        '--squircle': '32px',
                                        borderRadius: 'var(--squircle)',
                                        clipPath: `inset(0 round var(--squircle))`
                                    } as React.CSSProperties}
                                >
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Assign a task or ask anything"
                                        className="w-full pr-16 border-0 bg-transparent resize-none focus:outline-none font-body text-base text-foreground placeholder:text-muted-foreground h-full"
                                        disabled={!canSendMessage || !trackingCode}
                                        rows={1}
                                    />
                                    
                                    {/* Send Button */}
                                    <div className="absolute right-3 bottom-3">
                                        <button
                                            onClick={() => handleSendMessage()}
                                            disabled={!canSendMessage || !trackingCode || input.trim() === ''}
                                            className="w-10 h-10 flex items-center justify-center bg-foreground text-background hover:bg-foreground/90 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-full shadow-sm hover:scale-105 active:scale-95"
                                            title={currentLoading ? 'Sending...' : 'Send message'}
                                        >
                                            {currentLoading ? (
                                                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                            ) : (
                                                <svg 
                                                    className="w-4 h-4" 
                                                    fill="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M12 2L12 22M12 2L5 9M12 2L19 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Quick Action Service Options */}
                        <div className="w-full max-w-[765px] mx-auto mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex-1"></div>
                                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 group">
                                    <span>All services</span>
                                    <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12l-4.58 4.59z"/>
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { text: "Schedule a house cleaning", icon: "🧹" },
                                    { text: "Find a reliable electrician", icon: "⚡" }, 
                                    { text: "Book a plumbing service", icon: "🚿" },
                                    { text: "Request maintenance help", icon: "🔧" }
                                ].map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setInput(suggestion.text)}
                                        className="group relative p-5 text-left bg-white border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-primary/30"
                                        style={{ 
                                            '--squircle': '20px',
                                            borderRadius: 'var(--squircle)',
                                            clipPath: `inset(0 round var(--squircle))`
                                        } as React.CSSProperties}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="text-lg mt-0.5 group-hover:scale-110 transition-transform">
                                                {suggestion.icon}
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-body text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                                    {suggestion.text}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Subtle hover effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                                             style={{ 
                                                 borderRadius: 'var(--squircle)',
                                                 clipPath: `inset(0 round var(--squircle))`
                                             }}>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            {displayMessages.length > 0 && (
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="space-y-6 sm:space-y-8">
                            {displayMessages.map((msg, index) => (
                                <div
                                    key={msg.id}
                                    className={`group transition-all duration-300 animate-fade-in ${
                                        msg.sender === 'user' ? 'ml-auto' : 'mr-auto'
                                    }`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                        <div className={`flex items-start gap-3 sm:gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                            {/* Avatar */}
                                            <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-sm ${
                                                msg.sender === 'user' 
                                                    ? 'bg-primary text-primary-foreground' 
                                                    : 'bg-accent text-accent-foreground'
                                            }`}>
                                                {msg.sender === 'user' ? (
                                                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                                                ) : (
                                                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                                                )}
                                            </div>

                                        {/* Message Bubble */}
                                        <div className={`flex-1 max-w-xs sm:max-w-2xl ${msg.sender === 'user' ? 'text-right' : ''}`}>
                                            {/* Sender Name */}
                                            <div className={`text-xs font-body font-medium text-muted-foreground mb-2 ${
                                                msg.sender === 'user' ? 'text-right' : 'text-left'
                                            }`}>
                                                {msg.sender === 'user' ? 'You' : 'Ikiru AI'}
                                            </div>
                                            
                                            {/* Message Content */}
                                            <div className={`inline-block px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-sm ${
                                                msg.sender === 'user'
                                                    ? 'bg-primary text-primary-foreground rounded-br-md'
                                                    : 'bg-card border border-border rounded-bl-md'
                                            }`}>
                                                <div className={`font-body text-sm leading-relaxed whitespace-pre-wrap ${
                                                    msg.sender === 'user' ? 'text-primary-foreground' : 'text-card-foreground'
                                                }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                            
                                            {/* Timestamp */}
                                            <div className={`text-xs font-body text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                                                msg.sender === 'user' ? 'text-right' : 'text-left'
                                            }`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {currentLoading && (
                                <div className="animate-fade-in">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        {/* AI Avatar */}
                                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-sm">
                                            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>

                                        {/* Typing Animation */}
                                        <div className="flex-1 max-w-xs sm:max-w-2xl">
                                            <div className="text-xs font-body font-medium text-muted-foreground mb-2">
                                                Ikiru AI
                                            </div>
                                            <div className="inline-block px-4 py-3 sm:px-6 sm:py-4 bg-card border border-border rounded-2xl rounded-bl-md shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                    </div>
                                                    <span className="text-xs font-body text-muted-foreground ml-2">
                                                        {isConnecting ? 'Connecting...' : 'Thinking...'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>
            )}

            {/* Fixed Input at Bottom for Active Conversations */}
            {displayMessages.length > 0 && (
                <div className="border-t border-border bg-background">
                    <div className="w-full max-w-[765px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
                        <div 
                            className="relative bg-white border border-border shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200 px-6 py-4 w-full h-[116px]"
                            style={{ 
                                '--squircle': '32px',
                                borderRadius: 'var(--squircle)',
                                clipPath: `inset(0 round var(--squircle))`
                            } as React.CSSProperties}
                        >
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="w-full pr-16 border-0 bg-transparent resize-none focus:outline-none font-body text-base text-foreground placeholder:text-muted-foreground h-full"
                                disabled={!canSendMessage || !trackingCode}
                                rows={1}
                            />
                            
                            {/* Send Button */}
                            <div className="absolute right-3 bottom-3">
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!canSendMessage || !trackingCode || input.trim() === ''}
                                    className="w-10 h-10 flex items-center justify-center bg-foreground text-background hover:bg-foreground/90 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-full shadow-sm hover:scale-105 active:scale-95"
                                    title={currentLoading ? 'Sending...' : 'Send message'}
                                >
                                    {currentLoading ? (
                                        <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                    ) : (
                                        <svg 
                                            className="w-4 h-4"
                                            fill="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 2L12 22M12 2L5 9M12 2L19 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;