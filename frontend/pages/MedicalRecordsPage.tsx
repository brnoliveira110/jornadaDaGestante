import React, { useState } from 'react';
import { Consultation, UserRole } from '../types';
import { formatDate } from '../utils';
import { FileText, Plus, AlertCircle, X, Save, CheckSquare, Square, Edit2 } from 'lucide-react';
import { useData } from '../context/DataContext';

interface MedicalRecordsProps {
  consultations: Consultation[];
  userRole: UserRole;
  onAddConsultation?: () => void;
}

const MedicalRecords: React.FC<MedicalRecordsProps> = ({ consultations }) => {
  const { addConsultation, toggleConsultationStatus } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [weight, setWeight] = useState('');
  const [pressure, setPressure] = useState('');
  const [ig, setIg] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !ig) return;

    const newConsultation: Consultation = {
      id: crypto.randomUUID(),
      patientId: '',
      date: new Date().toISOString(),
      gestationalAgeWeeks: parseInt(ig),
      currentWeight: parseFloat(weight),
      bloodPressure: pressure,
      uterineHeight: undefined,
      fetalHeartRate: undefined,
      edema: false,
      notes: notes,
      prescription: '',
      requestedExams: [],
      status: 'COMPLETED'
    };

    addConsultation(newConsultation);
    setIsModalOpen(false);
    // Reset form
    setWeight(''); setPressure(''); setIg(''); setNotes('');
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-rose-500" />
            Histórico de Consultas & Peso
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Registrar Dados
          </button>
        </div>

        <div className="overflow-x-auto">
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 mb-4">
            {consultations.map((c) => (
              <div key={c.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-slate-800 text-base">{formatDate(c.date)}</div>
                    <div className="text-xs text-slate-500 font-medium">{c.gestationalAgeWeeks} semanas</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-rose-600 text-base">{c.currentWeight ? `${c.currentWeight} kg` : '-'}</div>
                    <div className="text-xs text-slate-400">{c.bloodPressure || 'PA --/--'}</div>
                  </div>
                </div>
                {c.notes && (
                  <div className="mb-3 text-sm text-slate-600 italic bg-white p-2 rounded border border-slate-100">
                    "{c.notes}"
                  </div>
                )}
                <button
                  onClick={() => toggleConsultationStatus(c.id)}
                  className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all
                        ${c.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                >
                  {c.status === 'COMPLETED' ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  {c.status === 'COMPLETED' ? 'Consulta Realizada' : 'Marcar como Feita'}
                </button>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consultations.map((consultation) => (
                <tr key={consultation.id} className={`hover:bg-slate-50 transition-colors ${consultation.status === 'SCHEDULED' ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleConsultationStatus(consultation.id)}
                      className={`transition-colors ${consultation.status === 'COMPLETED' ? 'text-teal-600' : 'text-slate-300 hover:text-teal-500'}`}
                      title={consultation.status === 'COMPLETED' ? 'Realizada' : 'Marcar como realizada'}
                    >
                      {consultation.status === 'COMPLETED' ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{formatDate(consultation.date)}</td>
                  <td className="px-6 py-4">{consultation.gestationalAgeWeeks}</td>
                  <td className="px-6 py-4 font-bold text-rose-600">{consultation.currentWeight || '-'}</td>
                  <td className="px-6 py-4">{consultation.bloodPressure || '-'}</td>
                  <td className="px-6 py-4 max-w-xs truncate">
                    <div className="flex flex-col gap-1">
                      <span className="truncate" title={consultation.notes}>{consultation.notes || (consultation.status === 'SCHEDULED' ? 'Agendada' : '')}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {consultations.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              Nenhum registro ainda. Adicione os dados da sua última consulta.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Registro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Registrar Evolução</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Registre os dados obtidos na sua consulta médica para manter seu histórico atualizado.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Idade Gestacional (Semanas)*</label>
                  <input required type="number" value={ig} onChange={e => setIg(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Ex: 24" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Peso Atual (kg)*</label>
                  <input required type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Ex: 65.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">PA (mmHg) - Opcional</label>
                <input type="text" value={pressure} onChange={e => setPressure(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="120/80" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Anotações Pessoais</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none h-24 resize-none"
                  placeholder="O que o médico disse? Como você se sentiu?"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Salvar no Diário
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MedicalRecords;