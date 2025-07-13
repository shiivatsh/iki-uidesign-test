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
                <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:px-8">
                    <div className="text-center w-full max-w-2xl mx-auto animate-fade-in">
                        {/* Welcome Icon */}
                        <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        
                        {/* Welcome Text */}
                        <h1 className="text-3xl md:text-4xl font-title font-medium text-foreground mb-3">
                            Hello {userName?.split(' ')[0] || 'there'}
                        </h1>
                        <p className="text-lg font-body text-muted-foreground mb-12">
                            I'm your AI assistant for home services. How can I help you today?
                        </p>
                        
                        {/* Starter Suggestions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12 max-w-xl mx-auto">
                            {[
                                "Schedule a house cleaning",
                                "Book a plumbing service",
                                "Find a reliable electrician",
                                "Request maintenance help"
                            ].map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => setInput(suggestion)}
                                    className="p-4 text-left bg-card border border-border rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02] group"
                                >
                                    <span className="font-body text-sm text-foreground group-hover:text-accent-foreground">
                                        {suggestion}
                                    </span>
                                </button>
                            ))}
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

            {/* Input Area */}
            <div className="border-t border-border bg-background/80 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-body rounded-xl animate-fade-in">
                            {error}
                        </div>
                    )}
                    
                    {/* Input Field Container */}
                    <div className="relative">
                        <div className="relative bg-card border border-border rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-all duration-200">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={messages.length === 0 ? "Start your conversation..." : "Type your message..."}
                                className="w-full px-6 py-4 pr-16 border-0 bg-transparent resize-none focus:outline-none font-body text-base text-foreground placeholder:text-muted-foreground rounded-2xl min-h-[56px] max-h-32"
                                disabled={!trackingCode || isLoading}
                                rows={1}
                            />
                            
                            {/* Send Button */}
                            <div className="absolute right-3 bottom-3">
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !trackingCode || input.trim() === ''}
                                    className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-xl shadow-sm hover:scale-105 active:scale-95"
                                    title="Send message"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        {/* Input Helper Text */}
                        <div className="flex items-center justify-between mt-2 px-2">
                            <span className="text-xs font-body text-muted-foreground">
                                Press Enter to send, Shift + Enter for new line
                            </span>
                            {input.length > 0 && (
                                <span className="text-xs font-body text-muted-foreground">
                                    {input.length}/2000
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;