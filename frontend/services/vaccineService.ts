import { api } from './api';
import { Vaccine } from '../types';

export const vaccineService = {
    getVaccines: async (patientId: string): Promise<Vaccine[]> => {
        const { data } = await api.get<Vaccine[]>(`/vaccines/patient/${patientId}`);
        return data;
    },
    createVaccine: async (data: Vaccine): Promise<Vaccine> => {
        const res = await api.post<Vaccine>('/vaccines', data);
        return res.data;
    },
    updateVaccine: async (data: Vaccine): Promise<void> => {
        await api.put(`/vaccines/${data.id}`, data);
    }
};
