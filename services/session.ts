import api from './api';

export interface SessionUser {
    socketId: string;
    username: string;
}

export interface SessionMessage {
    user: string;
    message: string;
    timestamp: number;
}

export interface Session {
    id: string;
    users: SessionUser[];
    messages: SessionMessage[];
    editorContent: string;
}

export const createSession = (username: string) => api.post<Session>('/session/create', { username });
export const joinSession = (sessionId: string, username: string) => api.post<Session>('/session/join', { sessionId, username });
export const getSession = (sessionId: string) => api.get<Session>(`/session/${sessionId}`);
