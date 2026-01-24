import { api } from './api';
import { Tip } from '../types';

export const tipService = {
    getTips: async (): Promise<Tip[]> => {
        const { data } = await api.get<Tip[]>('/tips');
        return data;
    },
};
