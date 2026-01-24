import React from 'react';
import { Consultation } from '../types';
import { formatDate } from '../utils';
import { CheckSquare, Square, Edit2 } from 'lucide-react';

interface Props {
    data: Consultation[];
    onToggleStatus?: (id: string) => void;
    onEdit?: (consultation: Consultation) => void;
}

export const ConsultationList: React.FC<Props> = ({ data, onToggleStatus, onEdit }) => {
    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center text-slate-400">
                Nenhum registro ainda. Adicione os dados da sua última consulta.
            </div>
        );
    }

    return (
        <>
            <div className="md:hidden space-y-3 mb-4">
                {data.map((c) => (
                    <div key={c.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm relative">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(c)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-primary-500"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                        <div className="flex justify-between items-start mb-2 pr-8">
                            <div>
                                <div className="font-bold text-slate-800 text-base">{formatDate(c.date)}</div>
                                <div className="text-xs text-slate-500 font-medium">{c.gestationalAgeWeeks} semanas</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-primary-600 text-base">{c.currentWeight ? `${c.currentWeight} kg` : '-'}</div>
                                <div className="text-xs text-slate-400">{c.bloodPressure || 'PA --/--'}</div>
                            </div>
                        </div>
                        {c.notes && (
                            <div className="mb-3 text-sm text-slate-600 italic bg-white p-2 rounded border border-slate-100">
                                "{c.notes}"
                            </div>
                        )}
                        {onToggleStatus && (
                            <button
                                onClick={() => onToggleStatus(c.id)}
                                className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all
                        ${c.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                            >
                                {c.status === 'COMPLETED' ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                {c.status === 'COMPLETED' ? 'Consulta Realizada' : 'Marcar como Feita'}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <table className="w-full text-sm text-left hidden md:table">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 w-10">Feito</th>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">IG (Sem)</th>
                        <th className="px-6 py-4">Peso (kg)</th>
                        <th className="px-6 py-4">PA (mmHg)</th>
                        <th className="px-6 py-4">Minhas Anotações</th>
                        <th className="px-6 py-4 w-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.map((consultation) => (
                        <tr key={consultation.id} className={`hover:bg-slate-50 transition-colors ${consultation.status === 'SCHEDULED' ? 'bg-slate-50/50' : ''}`}>
                            <td className="px-6 py-4">
                                {onToggleStatus && (
                                    <button
                                        onClick={() => onToggleStatus(consultation.id)}
                                        className={`transition-colors ${consultation.status === 'COMPLETED' ? 'text-teal-600' : 'text-slate-300 hover:text-teal-500'}`}
                                        title={consultation.status === 'COMPLETED' ? 'Realizada' : 'Marcar como realizada'}
                                    >
                                        {consultation.status === 'COMPLETED' ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                    </button>
                                )}
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-900">{formatDate(consultation.date)}</td>
                            <td className="px-6 py-4">{consultation.gestationalAgeWeeks}</td>
                            <td className="px-6 py-4 font-bold text-primary-600">{consultation.currentWeight || '-'}</td>
                            <td className="px-6 py-4">{consultation.bloodPressure || '-'}</td>
                            <td className="px-6 py-4 max-w-xs truncate">
                                <div className="flex flex-col gap-1">
                                    <span className="truncate" title={consultation.notes}>{consultation.notes || (consultation.status === 'SCHEDULED' ? 'Agendada' : '')}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {onEdit && (
                                    <button onClick={() => onEdit(consultation)} className="text-slate-400 hover:text-primary-500 transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};
