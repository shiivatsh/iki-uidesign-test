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
        <div className="flex flex-col h-full bg-background">
            {/* Empty State / Welcome */}
            {messages.length === 0 && !isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-2xl font-body font-normal text-foreground mb-12">
                            What's on your mind today?
                        </h1>
                        
                        {/* ChatGPT Style Input Field */}
                        <div className="relative max-w-4xl mx-auto mb-8">
                            <div className="relative bg-background border-thin border-input rounded-3xl shadow-sm">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask anything"
                                    className="w-full px-4 py-4 pl-16 pr-20 border-0 bg-transparent rounded-3xl resize-none focus:outline-none font-body text-base text-foreground placeholder:text-muted-foreground"
                                    disabled={!trackingCode || isLoading}
                                    rows={1}
                                    style={{ minHeight: '56px' }}
                                />
                                
                                {/* Left Side - Plus and Tools */}
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                    <button
                                        disabled
                                        className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-40"
                                        title="Add attachment"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-muted-foreground font-body">Tools</span>
                                </div>

                                {/* Right Side - Mic and Audio */}
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                    <button
                                        disabled
                                        className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-40"
                                        title="Voice input"
                                    >
                                        <Mic className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isLoading || !trackingCode || input.trim() === ''}
                                        className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-40"
                                        title="Send or audio visualization"
                                    >
                                        <div className="flex items-center gap-0.5">
                                            <div className="w-1 h-2 bg-current rounded-full"></div>
                                            <div className="w-1 h-3 bg-current rounded-full"></div>
                                            <div className="w-1 h-2 bg-current rounded-full"></div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
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
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-secondary text-secondary-foreground'
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
                                    <div className="text-sm font-body font-medium text-foreground mb-1">
                                        {msg.sender === 'user' ? 'You' : 'Ikiru'}
                                    </div>
                                    <div className="text-foreground font-body text-sm leading-relaxed whitespace-pre-wrap">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading */}
                        {isLoading && (
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-secondary-foreground animate-pulse" />
                                </div>
                                <div>
                                    <div className="text-sm font-body font-medium text-foreground mb-1">Ikiru</div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}

            {/* Input Area - Only shown when there are messages */}
            {messages.length > 0 && (
                <div className="border-t-thin border-border bg-background p-4">
                    <div className="max-w-3xl mx-auto">
                        {error && (
                            <div className="mb-4 p-3 bg-destructive/10 border-thin border-destructive/20 rounded-lg text-destructive text-sm font-body">
                                {error}
                            </div>
                        )}
                        
                        <div className="relative">
                            {/* Input Field */}
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="w-full px-4 py-3 pr-20 border-thin border-input rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 bg-background font-body text-sm max-h-32 disabled:bg-muted text-foreground placeholder:text-muted-foreground"
                                disabled={!trackingCode || isLoading}
                                rows={1}
                                style={{ minHeight: '48px' }}
                            />
                            
                            {/* Action Buttons */}
                            <div className="absolute right-2 bottom-2 flex items-center gap-1">
                                <button
                                    disabled
                                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors duration-200 disabled:opacity-40"
                                    title="Attach file"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </button>
                                
                                <button
                                    disabled
                                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors duration-200 disabled:opacity-40"
                                    title="Add image"
                                >
                                    <Image className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !trackingCode || input.trim() === ''}
                                    className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
                                    title="Send message"
                                >
                                    <Send className="w-4 h-4" />
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