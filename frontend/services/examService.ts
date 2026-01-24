import { api } from './api';
import { ExamResult } from '../types';

export const examService = {
    getExams: async (patientId: string): Promise<ExamResult[]> => {
        const { data } = await api.get<ExamResult[]>(`/exams/patient/${patientId}`);
        return data;
    },
    createExam: async (data: ExamResult): Promise<ExamResult> => {
        const res = await api.post<ExamResult>('/exams', data);
        return res.data;
    },
    updateExam: async (data: ExamResult): Promise<void> => {
        await api.put(`/exams/${data.id}`, data);
    },
    deleteExam: async (id: string): Promise<void> => {
        await api.delete(`/exams/${id}`);
    }
};
