import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatbotProps {
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
}

export default function Chatbot({ isOpen: externalIsOpen, onToggle }: ChatbotProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    const isChatOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

    const toggleChat = (value: boolean) => {
        if (onToggle) {
            onToggle(value);
        } else {
            setInternalIsOpen(value);
        }
    };
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I\'m CinePick Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMessage
                })
            });

            const data = await response.json();
            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const quickQuestions = [
        "🎬 Recommend a movie for tonight",
        "🔥 Show me trending action movies",
        "😂 I need a good comedy",
        "🧠 Mind-bending thrillers please"
    ];

    // Helper to parse markdown links [text](url)
    const renderContent = (content: string) => {
        const parts = content.split(/(\[.*?\]\(.*?\))/g);
        return parts.map((part, index) => {
            const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
            if (match) {
                return (
                    <Link
                        key={index}
                        to={match[2]}
                        className="text-blue-400 hover:text-blue-300 underline font-medium"
                        onClick={() => {
                            // Optional: Close chat on navigation if desired
                            // toggleChat(false);
                        }}
                    >
                        {match[1]}
                    </Link>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <>
            {/* Chat Button */}
            {!isChatOpen && (
                <button
                    onClick={() => toggleChat(true)}
                    className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-full shadow-2xl hover:shadow-primary/50 transition-all hover:scale-110 z-50 group"
                >
                    <Bot size={28} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                </button>
            )}

            {/* Chat Window */}
            {isChatOpen && (
                <div className="fixed bottom-8 right-8 w-[400px] h-[600px] bg-gray-900 border border-white/20 rounded-2xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-8 duration-300 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/20 bg-gradient-to-r from-primary/20 to-purple-600/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-full">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">CinePick AI</h3>
                                <p className="text-xs text-gray-300 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleChat(false)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-gray-300" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/95 backdrop-blur-sm scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user'
                                    ? 'bg-primary text-white rounded-br-none'
                                    : 'bg-gray-800 text-gray-100 border border-white/10 rounded-bl-none'
                                    }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {renderContent(msg.content)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 border border-white/10 rounded-2xl rounded-bl-none px-4 py-3">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions (show only on first message) */}
                    {messages.length === 1 && (
                        <div className="px-4 pb-2 space-y-2 bg-gray-900/95">
                            <p className="text-xs text-gray-400 font-medium ml-1">Suggested:</p>
                            <div className="flex flex-wrap gap-2">
                                {quickQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setInput(q);
                                            // Optional: auto-send
                                            // handleSend(); 
                                        }}
                                        className="text-xs px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-full transition-colors text-gray-200"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-white/10 bg-gray-900">
                        <div className="flex gap-2 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about movies..."
                                className="flex-1 bg-gray-800 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="absolute right-2 top-1.5 p-1.5 bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
