import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { Users, Play, MessageCircle, Copy } from 'lucide-react';
import SwipeEliminator from '@/components/features/SwipeEliminator';
import toast from 'react-hot-toast';

export default function Lobby() {
    const { socket, isConnected, joinRoom, startSession, sendMessage } = useSocket();
    const { user } = useAuth();
    const [roomId, setRoomId] = useState('');
    const [isInRoom, setIsInRoom] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [showSwipe, setShowSwipe] = useState(false);
    const [sessionMovies, setSessionMovies] = useState<any[]>([]);

    useEffect(() => {
        if (!socket) return;

        socket.on('user_joined', (roomUsers) => {
            setUsers(roomUsers);
            toast.success('A user joined the room!');
        });

        socket.on('receive_message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('session_started', (movies) => {
            setSessionMovies(movies);
            setShowSwipe(true);
            toast.success('Session started! Get ready to swipe.');
        });

        socket.on('match_found', (movieId) => {
            toast.success('IT\'S A MATCH!', { icon: '🎉', duration: 5000 });
            // You could trigger a confetti effect or show the match modal here
        });

        return () => {
            socket.off('user_joined');
            socket.off('receive_message');
            socket.off('session_started');
            socket.off('match_found');
        };
    }, [socket]);

    const handleCreateRoom = () => {
        const newRoomId = Math.random().toString(36).substring(7);
        setRoomId(newRoomId);
        joinRoom(newRoomId);
        setIsInRoom(true);
        toast.success(`Room created! ID: ${newRoomId}`);
    };

    const handleJoinRoom = () => {
        if (!roomId) return toast.error('Enter a room ID');
        joinRoom(roomId);
        setIsInRoom(true);
        toast.success('Joined room!');
    };

    const handleStartSession = () => {
        // In a real app, you'd fetch movies here or let the user pick a genre
        // For now, we'll let the SwipeEliminator component fetch its own initial movies
        // But to sync, the host should fetch and emit.
        // Let's trigger the SwipeEliminator to open, and it will fetch.
        // We need to modify SwipeEliminator to emit the movies it fetched.
        setShowSwipe(true);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        sendMessage(roomId, newMessage);
        setNewMessage('');
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        toast.success('Room ID copied!');
    };

    if (!isInRoom) {
        return (
            <div className="min-h-screen pt-24 px-6 flex flex-col items-center justify-center">
                <div className="max-w-md w-full bg-card border border-white/10 rounded-2xl p-8 space-y-6">
                    <h1 className="text-3xl font-bold text-center">Watch Party Lobby</h1>
                    <p className="text-center text-muted-foreground">Sync up with friends to find the perfect movie.</p>

                    <div className="space-y-4">
                        <button
                            onClick={handleCreateRoom}
                            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors"
                        >
                            Create New Room
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or join existing</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                placeholder="Enter Room ID"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 focus:outline-none focus:border-primary"
                            />
                            <button
                                onClick={handleJoinRoom}
                                className="px-6 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors"
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 px-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[70vh]">
                {/* Sidebar: Users & Info */}
                <div className="lg:col-span-1 bg-card border border-white/10 rounded-2xl p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Room: {roomId}</h2>
                        <button onClick={copyRoomId} className="p-2 hover:bg-white/10 rounded-lg">
                            <Copy size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                            <Users size={16} /> Connected Users ({users.length})
                        </h3>
                        <div className="space-y-2">
                            {users.map((u, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                                        {u.name[0]}
                                    </div>
                                    <span>{u.name}</span>
                                    {u.id === user?.id && <span className="text-xs text-muted-foreground">(You)</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleStartSession}
                        className="mt-6 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <Play size={20} /> Start Swipe Session
                    </button>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-2 bg-card border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h3 className="font-bold flex items-center gap-2">
                            <MessageCircle size={20} /> Chat
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.user.name === user?.name ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-xl ${msg.user.name === user?.name ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-white/10 rounded-tl-none'}`}>
                                    <p className="text-sm font-bold mb-1 opacity-70">{msg.user.name}</p>
                                    <p>{msg.text}</p>
                                </div>
                                <span className="text-xs text-muted-foreground mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary"
                        />
                        <button type="submit" className="px-6 bg-primary hover:bg-primary/90 rounded-xl font-bold transition-colors">
                            Send
                        </button>
                    </form>
                </div>
            </div>

            <SwipeEliminator
                isOpen={showSwipe}
                onClose={() => setShowSwipe(false)}
                onMovieSelect={() => { }}
                roomId={roomId} // Pass roomId to component
                initialMovies={sessionMovies} // Pass synced movies
            />
        </div>
    );
}
