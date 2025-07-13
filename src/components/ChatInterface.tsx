import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Sparkles, User, Bot } from 'lucide-react';

// Use hardcoded API endpoint that works in Vite
const API_ENDPOINTS = {
    askLLM: 'https://ikiru-backend-515600662686.us-central1.run.app/ask-llm'
};

interface Message {
    id: string;
    sender: 'user' | 'llm';
    content: string;
    timestamp: Date;
}

interface ChatInterfaceProps {
    trackingCode: string | null;
    userName?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ trackingCode, userName }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // Welcome message
    useEffect(() => {
        if (trackingCode) {
            setMessages([]);
        }
    }, [trackingCode, userName]);

    const handleSendMessage = async () => {
        if (input.trim() === '' || !trackingCode) {
            if (!trackingCode) {
                setError("Please ensure you're properly authenticated to chat.");
            }
            return;
        }

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            sender: 'user',
            content: input,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(API_ENDPOINTS.askLLM, {
                tracking_code: trackingCode,
                question: userMessage.content
            });
            
            const llmResponseContent = response.data.response;

            const llmMessage: Message = {
                id: `llm-${Date.now()}`,
                sender: 'llm',
                content: llmResponseContent,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, llmMessage]);

        } catch (err) {
            console.error("Error fetching LLM response:", err);
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                sender: 'llm',
                content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setError("Failed to get a response from the assistant.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const autoResize = () => {
        const textarea = inputRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    };

    useEffect(() => {
        autoResize();
    }, [input]);

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Empty State / Welcome */}
            {messages.length === 0 && !isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
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
                                        disabled={!trackingCode || isLoading}
                                        rows={1}
                                    />
                                    
                                    {/* Send Button */}
                                    <div className="absolute right-3 bottom-3">
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={isLoading || !trackingCode || input.trim() === ''}
                                            className="w-10 h-10 flex items-center justify-center bg-foreground text-background hover:bg-foreground/90 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-full shadow-sm hover:scale-105 active:scale-95"
                                            title="Send message"
                                        >
                                            {isLoading ? (
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
                                
                                {/* Error Message */}
                                {error && (
                                    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-body rounded-xl animate-fade-in">
                                        {error}
                                    </div>
                                )}
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
                            
                            <div className="grid grid-cols-2 gap-3">
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
            {messages.length > 0 && (
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        <div className="space-y-8">
                            {messages.map((msg, index) => (
                                <div
                                    key={msg.id}
                                    className={`group transition-all duration-300 animate-fade-in ${
                                        msg.sender === 'user' ? 'ml-auto' : 'mr-auto'
                                    }`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`flex items-start gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                        {/* Avatar */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                                            msg.sender === 'user' 
                                                ? 'bg-primary text-primary-foreground' 
                                                : 'bg-accent text-accent-foreground'
                                        }`}>
                                            {msg.sender === 'user' ? (
                                                <User className="w-5 h-5" />
                                            ) : (
                                                <Bot className="w-5 h-5" />
                                            )}
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`flex-1 max-w-2xl ${msg.sender === 'user' ? 'text-right' : ''}`}>
                                            {/* Sender Name */}
                                            <div className={`text-xs font-body font-medium text-muted-foreground mb-2 ${
                                                msg.sender === 'user' ? 'text-right' : 'text-left'
                                            }`}>
                                                {msg.sender === 'user' ? 'You' : 'Ikiru AI'}
                                            </div>
                                            
                                            {/* Message Content */}
                                            <div className={`inline-block px-6 py-4 rounded-2xl shadow-sm ${
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
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isLoading && (
                                <div className="animate-fade-in">
                                    <div className="flex items-start gap-4">
                                        {/* AI Avatar */}
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-sm">
                                            <Bot className="w-5 h-5" />
                                        </div>

                                        {/* Typing Animation */}
                                        <div className="flex-1 max-w-2xl">
                                            <div className="text-xs font-body font-medium text-muted-foreground mb-2">
                                                Ikiru AI
                                            </div>
                                            <div className="inline-block px-6 py-4 bg-card border border-border rounded-2xl rounded-bl-md shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                    </div>
                                                    <span className="text-xs font-body text-muted-foreground ml-2">
                                                        Thinking...
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
            {messages.length > 0 && (
                <div className="border-t border-border bg-background">
                    <div className="w-full max-w-[765px] mx-auto px-6 py-6">
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
                                disabled={!trackingCode || isLoading}
                                rows={1}
                            />
                            
                            {/* Send Button */}
                            <div className="absolute right-3 bottom-3">
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !trackingCode || input.trim() === ''}
                                    className="w-10 h-10 flex items-center justify-center bg-foreground text-background hover:bg-foreground/90 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-full shadow-sm hover:scale-105 active:scale-95"
                                    title="Send message"
                                >
                                    {isLoading ? (
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