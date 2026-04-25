import api from './api';

export interface User {
    id: number;
    username: string;
    name: string;
    avatar?: string;
}

export const fetchUsers = () => api.get<User[]>('/users');
