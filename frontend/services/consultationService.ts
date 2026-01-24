import { api } from './api';
import { ConsultationResponseDto, ConsultationCreateDto } from '../types';

export const consultationService = {
    getAllByPatient: async (patientId: string): Promise<ConsultationResponseDto[]> => {
        const { data } = await api.get<ConsultationResponseDto[]>(`/consultations/patient/${patientId}`);
        return data;
    },

    getById: async (id: string): Promise<ConsultationResponseDto> => {
        const { data } = await api.get<ConsultationResponseDto>(`/consultations/${id}`);
        return data;
    },

    create: async (dto: ConsultationCreateDto): Promise<ConsultationResponseDto> => {
        const { data } = await api.post<ConsultationResponseDto>('/consultations', dto);
        return data;
    },

    update: async (id: string, dto: ConsultationCreateDto): Promise<void> => {
        await api.put(`/consultations/${id}`, dto);
    }
};
