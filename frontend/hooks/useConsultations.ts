import { useState, useCallback } from 'react';
import { consultationService } from '../services/consultationService';
import { ConsultationResponseDto, ConsultationCreateDto } from '../types';
import { toast } from 'sonner';

export const useConsultations = (patientId?: string) => {
    const [data, setData] = useState<ConsultationResponseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConsultations = useCallback(async () => {
        if (!patientId) return;
        setLoading(true);
        try {
            const result = await consultationService.getAllByPatient(patientId);
            setData(result);
        } catch (err) {
            console.error(err);
            setError('Falha ao carregar consultas');
            toast.error('Não foi possível carregar os dados.');
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    const createConsultation = async (dto: ConsultationCreateDto) => {
        setLoading(true);
        try {
            const newItem = await consultationService.create(dto);
            // Add to list (assuming desc order or handle sort elsewhere)
            setData(prev => [newItem, ...prev]);
            toast.success('Consulta registrada com sucesso.');
            return true;
        } catch (err) {
            console.error(err);
            toast.error('Falha ao salvar consulta.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        consultations: data,
        loading,
        error,
        fetchConsultations,
        createConsultation
    };
};
