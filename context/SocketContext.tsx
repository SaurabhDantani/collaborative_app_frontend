"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    onlineUsers: Map<number, string>; // userId -> status (basic)
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    onlineUsers: new Map(),
    isConnected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState<Map<number, string>>(new Map());

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080');

        socketInstance.on('connect', () => {
            setIsConnected(true);
            console.log('Socket connected');
            socketInstance.emit('join-room', {
                userId: user.id,
                username: user.name,
            });
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket disconnected');
        });

        socketInstance.on('user-status', ({ userId, status }: { userId: number, status: string }) => {
            setOnlineUsers(prev => {
                const newMap = new Map(prev);
                if (status === 'offline') {
                    newMap.delete(userId);
                } else {
                    newMap.set(userId, status);
                }
                return newMap;
            });
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
