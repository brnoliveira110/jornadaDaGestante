import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConsultationCreateDto } from '@/types';

// Schema de validação
const consultationSchema = z.object({
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida").transform((str) => new Date(str).toISOString()),
    gestationalAgeWeeks: z.coerce.number().min(0).max(45, "Máximo 45 semanas"),
    currentWeight: z.coerce.number().min(0, "Peso deve ser positivo"),
    uterineHeight: z.union([z.string(), z.number()]).transform((val) => val === '' ? undefined : Number(val)).optional(),
    bloodPressure: z.string().regex(/^\d{2,3}x\d{2,3}$/, "Formato inválido (ex: 120x80)").optional().or(z.literal('')),
    fetalHeartRate: z.union([z.string(), z.number()]).transform((val) => val === '' ? undefined : Number(val)).optional(),
    edema: z.boolean().default(false),
    notes: z.string().optional(),
    prescription: z.string().optional(),
});

type FormValues = z.input<typeof consultationSchema>; // Input values (string dates etc)

interface Props {
    onSubmit: (data: Omit<ConsultationCreateDto, 'patientId' | 'requestedExams' | 'status'>) => void;
    isLoading: boolean;
}

export const ConsultationForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(consultationSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0], // Default today
            edema: false
        }
    });

    return (
        <form onSubmit={handleSubmit((data) => onSubmit(data as any))} className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-rose-600 mb-4">Nova Consulta</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Data</label>
                    <Input type="date" {...register('date')} />
                    {errors.date && <span className="text-red-500 text-xs">{errors.date.message}</span>}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">IG (Semanas)</label>
                    <Input type="number" {...register('gestationalAgeWeeks')} placeholder="Ex: 24" />
                    {errors.gestationalAgeWeeks && <span className="text-red-500 text-xs">{errors.gestationalAgeWeeks.message}</span>}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Peso (kg)</label>
                    <Input type="number" step="0.1" {...register('currentWeight')} placeholder="Ex: 70.5" />
                    {errors.currentWeight && <span className="text-red-500 text-xs">{errors.currentWeight.message}</span>}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">PA (120x80)</label>
                    <Input placeholder="120x80" {...register('bloodPressure')} />
                    {errors.bloodPressure && <span className="text-red-500 text-xs">{errors.bloodPressure.message}</span>}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Alt. Uterina (cm)</label>
                    <Input type="number" step="0.1" {...register('uterineHeight')} />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">BCF (bpm)</label>
                    <Input type="number" {...register('fetalHeartRate')} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="edema"
                    {...register('edema')}
                    className="w-4 h-4 text-rose-600 rounded border-gray-300 focus:ring-rose-500"
                />
                <label htmlFor="edema" className="text-sm font-medium text-gray-700">Edema (Inchaço)</label>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Anotações</label>
                <Input {...register('notes')} placeholder="Observações gerais..." />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Prescrição</label>
                <Input {...register('prescription')} placeholder="Medicamentos, orientações..." />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-rose-500 hover:bg-rose-600 text-white">
                {isLoading ? 'Salvando...' : 'Registrar Consulta'}
            </Button>
        </form>
    );
};
