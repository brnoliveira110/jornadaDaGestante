import { api } from './api';
import { PregnancyData } from '../types';

export const pregnancyService = {
    getPregnancyData: async (patientId: string): Promise<PregnancyData> => {
        const { data } = await api.get<PregnancyData>(`/pregnancydata/patient/${patientId}`);
        return data;
    },
    createPregnancyData: async (data: PregnancyData): Promise<PregnancyData> => {
        const res = await api.post<PregnancyData>('/pregnancydata', data);
        return res.data;
    },
    updatePregnancyData: async (data: PregnancyData): Promise<void> => {
        await api.put(`/pregnancydata/${data.id}`, data);
    }
};
