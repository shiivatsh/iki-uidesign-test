import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2, Sparkles, Mic, Paperclip, MoreHorizontal } from 'lucide-react';

// Use hardcoded API endpoint that works in Vite (removed process.env reference)
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
            setMessages([
                {
                    id: 'welcome-1',
                    sender: 'llm',
                    content: `Hello ${userName?.split(' ')[0] || 'there'}! 👋 I'm your Ikiru AI assistant. I can help you:\n\n• Book new cleaning or maintenance services\n• Check your service history and upcoming appointments\n• Answer questions about your account\n• Update your preferences and settings\n\nWhat would you like to do today?`, 
                    timestamp: new Date()
                }
            ]);
        } else {
            setMessages([
                {
                    id: 'prompt-enter-code',
                    sender: 'llm',
                    content: "Welcome to Ikiru! Please ensure you're properly authenticated to start our conversation.",
                    timestamp: new Date()
                }
            ]);
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
                content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or contact support if the issue persists.",
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

    const formatTimestamp = (timestamp: Date) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        <div className="flex flex-col h-full bg-white">
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-slate-50/50 to-white">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                            msg.sender === 'user' 
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                                : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                        }`}>
                            {msg.sender === 'user' ? (
                                <User className="w-4 h-4 text-white" />
                            ) : (
                                <Sparkles className="w-4 h-4 text-white" />
                            )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            {/* Sender Label */}
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium text-slate-600">
                                    {msg.sender === 'user' ? 'You' : 'Ikiru AI'}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {formatTimestamp(msg.timestamp)}
                                </span>
                            </div>

                            {/* Message Content */}
                            <div className={`px-4 py-3 rounded-2xl shadow-sm border ${
                                msg.sender === 'user'
                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-blue-200'
                                    : 'bg-white text-slate-800 border-slate-200 shadow-md'
                            }`}>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium text-slate-600">Ikiru AI</span>
                                <span className="text-xs text-slate-400">typing...</span>
                            </div>
                            <div className="px-4 py-3 bg-white rounded-2xl shadow-md border border-slate-200">
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {error && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-200">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t border-slate-200 bg-white p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Quick Actions */}
                    <div className="flex items-center space-x-2 mb-3 overflow-x-auto pb-2">
                        {trackingCode && (
                            <>
                                <button 
                                    onClick={() => setInput("Book a cleaning service for next week")}
                                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors duration-200"
                                >
                                    📅 Book Service
                                </button>
                                <button 
                                    onClick={() => setInput("Show me my service history")}
                                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors duration-200"
                                >
                                    📋 View History
                                </button>
                                <button 
                                    onClick={() => setInput("Update my profile information")}
                                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors duration-200"
                                >
                                    👤 Update Profile
                                </button>
                            </>
                        )}
                    </div>

                    {/* Input Row */}
                    <div className="flex items-end space-x-3">
                        {/* Additional Action Buttons */}
                        <div className="flex items-center space-x-1">
                            <button 
                                disabled
                                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Attach file (coming soon)"
                            >
                                <Paperclip className="w-4 h-4" />
                            </button>
                            <button 
                                disabled
                                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Voice input (coming soon)"
                            >
                                <Mic className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Input Field */}
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={trackingCode ? "Ask me anything about your home services..." : "Please authenticate to start chatting..."}
                                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm max-h-[120px] disabled:bg-slate-50 disabled:text-slate-500"
                                disabled={!trackingCode || isLoading}
                                rows={1}
                                style={{ minHeight: '48px' }}
                            />
                            
                            {/* Character count for long messages */}
                            {input.length > 100 && (
                                <div className="absolute -top-6 right-0 text-xs text-slate-400">
                                    {input.length}/500
                                </div>
                            )}
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !trackingCode || input.trim() === ''}
                            className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                            title="Send message"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {/* Helper Text */}
                    <div className="mt-2 text-center">
                        <p className="text-xs text-slate-400">
                            {trackingCode ? (
                                <>Press <kbd className="px-1 py-0.5 text-xs bg-slate-100 border border-slate-300 rounded">Enter</kbd> to send, <kbd className="px-1 py-0.5 text-xs bg-slate-100 border border-slate-300 rounded">Shift + Enter</kbd> for new line</>
                            ) : (
                                "Authentication required to start chatting"
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;