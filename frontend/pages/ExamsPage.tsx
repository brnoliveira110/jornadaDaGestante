import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';
import { Upload, FileText, Image as ImageIcon, Eye, Plus, FileBadge, CheckCircle, CheckSquare } from 'lucide-react';

const ExamsWrapper: React.FC<any> = () => {
  const { exams, addExamRequest, toggleExamRealized, updateExam, deleteExam } = useData();

  // Estado para adicionar/editar exame
  const [requestName, setRequestName] = useState('');
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSaveRequest = async () => {
    if (requestName.trim()) {
      // Create date responsibly adjusting to local time to avoid timezone shifts
      const [year, month, day] = requestDate.split('-').map(Number);
      // Create date at noon to be safe or just standard local midnight construction
      // new Date(y, m-1, d) creates a local date at 00:00:00
      const localDate = new Date(year, month - 1, day);

      if (editingId) {
        // Edit mode
        const examToUpdate = exams.find(e => e.id === editingId);
        if (examToUpdate) {
          await updateExam({ ...examToUpdate, name: requestName, date: localDate.toISOString() });
        }
      } else {
        // Create mode
        // pass the string date directly or the ISO string from the local date
        await addExamRequest(requestName, localDate.toISOString());
      }
      resetForm();
    }
  };

  const startEditing = (exam: any) => {
    setRequestName(exam.name);
    setRequestDate(new Date(exam.date).toISOString().split('T')[0]);
    setEditingId(exam.id);
    setIsAdding(true);
  };

  const resetForm = () => {
    setRequestName('');
    setRequestDate(new Date().toISOString().split('T')[0]);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteExam(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-lg">Meus Exames</h3>
        <button
          onClick={() => { resetForm(); setIsAdding(!isAdding); }}
          className="px-4 py-2 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancelar' : 'Adicionar Novo Exame'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Nome do Exame</label>
              <input
                type="text"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                placeholder="Ex: Ultrassom Morfológico, Hemograma..."
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Data Prevista</label>
              <input
                type="date"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="px-6 py-2 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveRequest}
              className="px-6 py-2 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
            >
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {exams.map((exam) => (
            <li key={exam.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
              <div className="flex items-center gap-4">
                <div className={`
                  p-3 rounded-xl flex items-center justify-center
                  ${exam.status === 'REQUESTED' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                    exam.status === 'REALIZED' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                      exam.type === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}
                `}>
                  {exam.status === 'REQUESTED' || exam.status === 'REALIZED' ? <FileBadge className="w-6 h-6" /> :
                    exam.type === 'PDF' ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    {exam.name}
                  </h4>

                  <div className="flex flex-col mt-1 gap-0.5">
                    <p className="text-xs text-slate-500">
                      {new Date(exam.date).toLocaleDateString('pt-BR')} •
                      <span className={`ml-1 font-medium ${exam.status === 'REVIEWED' ? 'text-green-600' :
                        exam.status === 'REQUESTED' ? 'text-indigo-600' :
                          exam.status === 'REALIZED' ? 'text-purple-600' : 'text-amber-600'
                        }`}>
                        {exam.status === 'REVIEWED' ? 'Resultado Anexado' :
                          exam.status === 'REQUESTED' ? 'A realizar' :
                            exam.status === 'REALIZED' ? 'Realizado' : 'Enviado'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                {/* Delete Button (Only for requested/realized) */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(exam.id); }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remover exame"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>

                {/* Edit Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); startEditing(exam); }}
                  className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Editar exame"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>

                {/* Status Toggle Button */}
                {exam.status === 'REQUESTED' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleExamRealized(exam.id); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    <CheckSquare className="w-3 h-3" /> Já fiz
                  </button>
                )}

                {exam.status === 'REALIZED' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleExamRealized(exam.id); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg border border-purple-200 transition-colors"
                    title="Desfazer (Marcar como não realizado)"
                  >
                    <CheckCircle className="w-3 h-3" /> Feito
                  </button>
                )}
              </div>
            </li>
          ))}
          {exams.length === 0 && (
            <li className="p-6 text-center text-slate-400 text-sm">Nenhum exame registrado.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ExamsWrapper;