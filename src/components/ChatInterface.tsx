'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User } from 'lucide-react';

const API_ENDPOINTS = {
    askLLM: (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ikiru-backend-515600662686.us-central1.run.app') + '/ask-llm'
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (trackingCode) {
            setMessages([
                {
                    id: 'welcome-1',
                    sender: 'llm',
                    content: `Hi ${userName?.split(' ')[0] || 'there'}! 👋 I'm your Ikiru home service assistant. I'm here to help you with bookings, service history, and any questions about your home services. What can I help you with today?`, 
                    timestamp: new Date()
                }
            ]);
        }
    }, [trackingCode, userName]);

    const handleSendMessage = async () => {
        if (input.trim() === '' || !trackingCode) return;

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
            const response = await fetch(API_ENDPOINTS.askLLM, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tracking_code: trackingCode,
                    question: userMessage.content
                })
            });
            
            const data = await response.json();
            const llmMessage: Message = {
                id: `llm-${Date.now()}`,
                sender: 'llm',
                content: data.response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, llmMessage]);
        } catch (err) {
            console.error("Error:", err);
            setError("Failed to get response. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-white to-slate-50">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            <div className={`flex items-start space-x-3 max-w-2xl ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                                    msg.sender === 'user' 
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                                        : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                }`}>
                                    {msg.sender === 'user' ? (
                                        <User className="w-4 h-4 text-white" />
                                    ) : (
                                        <Sparkles className="w-4 h-4 text-white" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                                    msg.sender === 'user'
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md' 
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md' 
                                }`}>
                                    <div className={`text-xs font-medium mb-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-600'}`}>
                                        {msg.sender === 'user' ? 'You' : 'Ikiru Assistant'}
                                    </div>
                                    <div className="text-sm leading-relaxed">{msg.content}</div>
                                    <div className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                                </div>
                                <div className="bg-white border rounded-2xl px-4 py-3 shadow-sm">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <span className="text-sm">Typing</span>
                                        <div className="flex space-x-1">
                                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="border-t bg-white/80 backdrop-blur-sm p-6">
                <div className="max-w-4xl mx-auto">
                    {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{error}</div>}
                    <div className="flex items-end space-x-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                            placeholder="Type your message... (Press Enter to send)"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none min-h-[48px] max-h-[120px]"
                            disabled={!trackingCode || isLoading}
                            rows={1}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !trackingCode || input.trim() === ''}
                            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;