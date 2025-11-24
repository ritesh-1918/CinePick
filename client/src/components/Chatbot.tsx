import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';

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
            const response = await fetch('http://localhost:5000/api/chatbot', {
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

    return (
        <>
            {/* Chat Button */}
            {!isChatOpen && (
                <button
                    onClick={() => toggleChat(true)}
                    className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-full shadow-2xl hover:shadow-primary/50 transition-all hover:scale-110 z-50 group"
                >
                    <MessageCircle size={28} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                </button>
            )}

            {/* Chat Window */}
            {isChatOpen && (
                <div className="fixed bottom-8 right-8 w-[400px] h-[600px] bg-gray-900 border border-white/20 rounded-2xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-8 duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/20 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-full">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">CinePick Assistant</h3>
                                <p className="text-xs text-gray-300">Always here to help</p>
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
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.role === 'user'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-800 text-gray-100 border border-white/20'
                                    }`}>
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 border border-white/20 rounded-2xl px-4 py-3">
                                    <Loader2 className="animate-spin text-primary" size={20} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions (show only on first message) */}
                    {messages.length === 1 && (
                        <div className="px-4 pb-2 space-y-2 bg-gray-900">
                            <p className="text-xs text-gray-400">Quick questions:</p>
                            {quickQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setInput(q);
                                    }}
                                    className="block w-full text-left text-xs px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-white/20 rounded-lg transition-colors text-gray-200"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-white/20 bg-gray-900 rounded-b-2xl">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-gray-800 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="p-2.5 bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={20} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
