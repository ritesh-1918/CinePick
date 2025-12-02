import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    joinRoom: (roomId: string) => void;
    startSession: (roomId: string, movies: any[]) => void;
    voteMovie: (roomId: string, movieId: number, vote: 'like' | 'dislike') => void;
    sendMessage: (roomId: string, message: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        // Remove /api from URL if present for socket connection
        const baseUrl = socketUrl.replace('/api', '');

        const newSocket = io(baseUrl, {
            withCredentials: true,
            autoConnect: true
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const joinRoom = (roomId: string) => {
        if (socket && user) {
            socket.emit('join_room', { roomId, user: { id: user.id, name: user.name } });
        }
    };

    const startSession = (roomId: string, movies: any[]) => {
        if (socket) {
            socket.emit('start_session', { roomId, movies });
        }
    };

    const voteMovie = (roomId: string, movieId: number, vote: 'like' | 'dislike') => {
        if (socket && user) {
            socket.emit('vote_movie', { roomId, movieId, userId: user.id, vote });
        }
    };

    const sendMessage = (roomId: string, message: string) => {
        if (socket && user) {
            socket.emit('send_message', { roomId, message, user: { name: user.name } });
        }
    };

    return (
        <SocketContext.Provider value={{ socket, isConnected, joinRoom, startSession, voteMovie, sendMessage }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
