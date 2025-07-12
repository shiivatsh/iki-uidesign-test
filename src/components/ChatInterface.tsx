import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Sparkles, Plus, Paperclip, Image, Mic } from 'lucide-react';

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
        <div className="flex flex-col h-full bg-white">
            {/* Empty State / Welcome */}
            {messages.length === 0 && !isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="text-center max-w-2xl mx-auto">
                        <h1 className="text-4xl font-title font-semibold text-gray-900 mb-3">
                            Hello {userName?.split(' ')[0] || 'there'}
                        </h1>
                        <p className="text-xl font-body text-gray-500 mb-8">
                            What can I do for you?
                        </p>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8 max-w-2xl w-full">
                        <button
                            onClick={() => setInput("Book a cleaning service for next week")}
                            className="p-4 border-thin border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-left"
                        >
                            <div className="text-sm font-body font-medium text-gray-900 mb-1">📅 Book Service</div>
                            <div className="text-xs font-body text-gray-500">Schedule cleaning</div>
                        </button>
                        
                        <button
                            onClick={() => setInput("Show me my service history")}
                            className="p-4 border-thin border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-left"
                        >
                            <div className="text-sm font-body font-medium text-gray-900 mb-1">📋 History</div>
                            <div className="text-xs font-body text-gray-500">View past services</div>
                        </button>
                        
                        <button
                            onClick={() => setInput("Update my profile information")}
                            className="p-4 border-thin border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-left"
                        >
                            <div className="text-sm font-body font-medium text-gray-900 mb-1">👤 Profile</div>
                            <div className="text-xs font-body text-gray-500">Manage account</div>
                        </button>
                        
                        <button
                            onClick={() => setInput("What services do you offer?")}
                            className="p-4 border-thin border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-left"
                        >
                            <div className="text-sm font-body font-medium text-gray-900 mb-1">🏠 Services</div>
                            <div className="text-xs font-body text-gray-500">What we offer</div>
                        </button>
                        
                        <button
                            onClick={() => setInput("Help me with pricing")}
                            className="p-4 border-thin border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-left"
                        >
                            <div className="text-sm font-body font-medium text-gray-900 mb-1">💰 Pricing</div>
                            <div className="text-xs font-body text-gray-500">Get quotes</div>
                        </button>
                        
                        <button
                            onClick={() => setInput("How do I contact support?")}
                            className="p-4 border-thin border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-left"
                        >
                            <div className="text-sm font-body font-medium text-gray-900 mb-1">📞 Support</div>
                            <div className="text-xs font-body text-gray-500">Get help</div>
                        </button>
                    </div>
                </div>
            )}

            {/* Messages */}
            {messages.length > 0 && (
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                    msg.sender === 'user' 
                                        ? 'bg-gray-900 text-white' 
                                        : 'bg-orange-500 text-white'
                                }`}>
                                    {msg.sender === 'user' ? (
                                        <span className="text-xs font-body font-medium">
                                            {userName?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                </div>

                                {/* Message */}
                                <div className={`flex-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                                    <div className="text-sm font-body font-medium text-gray-900 mb-1">
                                        {msg.sender === 'user' ? 'You' : 'Ikiru'}
                                    </div>
                                    <div className="text-gray-800 font-body text-sm leading-relaxed whitespace-pre-wrap">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading */}
                        {isLoading && (
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                                </div>
                                <div>
                                    <div className="text-sm font-body font-medium text-gray-900 mb-1">Ikiru</div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t-thin border-gray-200 bg-white p-4">
                <div className="max-w-3xl mx-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border-thin border-red-200 rounded-lg text-red-600 text-sm font-body">
                            {error}
                        </div>
                    )}
                    
                    <div className="relative">
                        {/* Input Field */}
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={messages.length === 0 ? "Assign a task or ask anything" : "Type a message..."}
                            className="w-full px-4 py-3 pr-20 border-thin border-gray-300 rounded-xl resize-none focus:outline-none focus:border-gray-400 transition-colors duration-200 bg-white font-body text-sm max-h-32 disabled:bg-gray-50"
                            disabled={!trackingCode || isLoading}
                            rows={1}
                            style={{ minHeight: '48px' }}
                        />
                        
                        {/* Action Buttons */}
                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                            <button
                                disabled
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-40"
                                title="Attach file (coming soon)"
                            >
                                <Paperclip className="w-4 h-4" />
                            </button>
                            
                            <button
                                disabled
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-40"
                                title="Add image (coming soon)"
                            >
                                <Image className="w-4 h-4" />
                            </button>

                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !trackingCode || input.trim() === ''}
                                className="w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
                                title="Send message"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Additional Options */}
                    {messages.length === 0 && (
                        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500 font-body">
                            <button disabled className="flex items-center gap-2 opacity-50">
                                <Plus className="w-4 h-4" />
                                Slides
                            </button>
                            <button disabled className="flex items-center gap-2 opacity-50">
                                <Image className="w-4 h-4" />
                                Image
                            </button>
                            <button disabled className="flex items-center gap-2 opacity-50">
                                <Mic className="w-4 h-4" />
                                Audio
                            </button>
                            <button disabled className="flex items-center gap-2 opacity-50">
                                📄 Webpage
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;