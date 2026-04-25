import api from './api';

export interface Message {
    id: number;
    senderId: number;
    recipientId: number;
    content: string;
    createdAt: string;
}

export const getConversation = (selectedUserId: number, currentUserId: number) =>
    api.get<Message[]>(`/messages/${selectedUserId}?currentUserId=${currentUserId}`);
