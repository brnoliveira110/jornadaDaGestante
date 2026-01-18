import { api } from './api';
import { User } from '../types';

export const userService = {
    getUsers: async (): Promise<User[]> => {
        const { data } = await api.get<User[]>('/users');
        return data;
    },
    getUser: async (id: string): Promise<User> => {
        const { data } = await api.get<User>(`/users/${id}`);
        return data;
    },
    createUser: async (user: User): Promise<User> => {
        const { data } = await api.post<User>('/users', user);
        return data;
    },
    updateUser: async (user: User): Promise<void> => {
        await api.put(`/users/${user.id}`, user);
    }
};
