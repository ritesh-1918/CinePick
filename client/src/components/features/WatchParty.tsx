import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Play, Trophy, Film, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import SwipeEliminator from './SwipeEliminator';
import toast from 'react-hot-toast';
import axios from 'axios';

interface WatchPartyProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SessionUser {
    userId: string;
    name: string;
}

interface Session {
    code: string;
    hostId: string;
    users: SessionUser[];
    status: 'waiting' | 'voting' | 'completed';
    movies: any[];
}

export default function WatchParty({ isOpen, onClose }: WatchPartyProps) {
    const { user } = useAuth();
    const [mode, setMode] = useState<'menu' | 'lobby' | 'voting' | 'results'>('menu');
    const [sessionCode, setSessionCode] = useState('');
    const [session, setSession] = useState<Session | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [loading, setLoading] = useState(false);

    // Polling for session updates
    useEffect(() => {
        let interval: ReturnType<typeof setTimeout>;
        if (session && (mode === 'lobby' || mode === 'voting')) {
            interval = setInterval(fetchSessionStatus, 3000);
        }
        return () => clearInterval(interval);
    }, [session, mode]);

    const fetchSessionStatus = async () => {
        if (!session) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/session/${session.code}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setSession(res.data.session);
                if (res.data.session.status === 'voting' && mode === 'lobby') {
                    setMode('voting');
                }
                // Check for results (not implemented in backend yet, but logic would go here)
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    };

    const createSession = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // We could pass initial movies here, but let's rely on backend default for now
            const res = await axios.post('/api/session/create', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setSession(res.data.session);
                setSessionCode(res.data.session.code);
                setIsHost(true);
                setMode('lobby');
                toast.success('Session created!');
            }
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Failed to create session');
        } finally {
            setLoading(false);
        }
    };

    const joinSession = async () => {
        if (!sessionCode) return toast.error('Enter a code');
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/session/join', { code: sessionCode }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setSession(res.data.session);
                setIsHost(res.data.session.hostId === user?.id);
                setMode('lobby');
                toast.success('Joined session!');
            }
        } catch (error) {
            console.error('Join error:', error);
            toast.error('Failed to join session');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (likedMovieIds: number[]) => {
        if (!session) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/session/vote', {
                code: session.code,
                likedMovieIds
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Votes submitted!');
            // Wait for results or polling to update status
        } catch (error) {
            console.error('Vote error:', error);
            toast.error('Failed to submit votes');
        }
    };

    const startVoting = async () => {
        if (!session) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/session/start', { code: session.code }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Polling will catch the status change
            fetchSessionStatus(); // Immediate check
        } catch (error) {
            console.error('Start error:', error);
            toast.error('Failed to start voting');
        }
    };

    const copyCode = () => {
        if (session) {
            navigator.clipboard.writeText(session.code);
            toast.success('Code copied!');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl bg-card border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full z-10">
                    <ArrowRight size={24} className="rotate-45" />
                </button>

                <AnimatePresence mode="wait">
                    {mode === 'menu' && (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center text-center space-y-8"
                        >
                            <div className="p-4 bg-primary/20 rounded-full text-primary">
                                <Users size={48} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-2">Watch Party</h2>
                                <p className="text-muted-foreground">Swipe together, decide faster.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <button
                                    onClick={createSession}
                                    disabled={loading}
                                    className="p-6 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl hover:scale-105 transition-transform flex flex-col items-center gap-3"
                                >
                                    <Trophy size={32} />
                                    <span className="font-bold text-lg">Create Party</span>
                                </button>
                                <div className="p-6 bg-white/5 rounded-2xl flex flex-col items-center gap-3">
                                    <ArrowRight size={32} className="text-muted-foreground" />
                                    <div className="flex w-full gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter Code"
                                            value={sessionCode}
                                            onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-center font-mono tracking-widest uppercase"
                                        />
                                        <button
                                            onClick={joinSession}
                                            disabled={loading}
                                            className="bg-primary px-4 rounded-lg font-bold hover:bg-primary/90"
                                        >
                                            Join
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {mode === 'lobby' && session && (
                        <motion.div
                            key="lobby"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center space-y-6"
                        >
                            <h2 className="text-2xl font-bold">Lobby</h2>

                            <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                                <span className="text-4xl font-mono font-bold tracking-widest text-primary">{session.code}</span>
                                <button onClick={copyCode} className="p-2 hover:bg-white/10 rounded-lg">
                                    <Copy size={20} />
                                </button>
                            </div>
                            <p className="text-sm text-muted-foreground">Share this code with your friends</p>

                            <div className="w-full bg-black/20 rounded-xl p-4 min-h-[150px]">
                                <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Players ({session.users.length})</h3>
                                <div className="flex flex-wrap gap-3">
                                    {session.users.map((u, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            <span>{u.name} {u.userId === session.hostId && '(Host)'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {isHost ? (
                                <button
                                    onClick={startVoting}
                                    className="w-full py-4 bg-primary rounded-xl font-bold text-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                                >
                                    <Play size={24} fill="currentColor" />
                                    Start Swiping
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 size={20} className="animate-spin" />
                                    Waiting for host to start...
                                </div>
                            )}
                        </motion.div>
                    )}

                    {mode === 'voting' && (
                        <motion.div key="voting" className="w-full h-[60vh]">
                            <SwipeEliminator
                                isOpen={true}
                                onClose={onClose}
                                onMovieSelect={() => { }}
                                initialMovies={session?.movies}
                                onVote={handleVote}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
