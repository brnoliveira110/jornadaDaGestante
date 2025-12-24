import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';
import { Upload, FileText, Image as ImageIcon, Eye, Plus, FileBadge, CheckCircle, CheckSquare } from 'lucide-react';

const ExamsWrapper: React.FC<any> = () => {
  const { exams, addExamRequest, toggleExamRealized } = useData();

  // Estado para adicionar exame manualmente
  const [requestName, setRequestName] = useState('');
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAdding, setIsAdding] = useState(false);


  const handleCreateRequest = () => {
    if (requestName.trim()) {
      addExamRequest(requestName, requestDate);
      setRequestName('');
      setRequestDate(new Date().toISOString().split('T')[0]);
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-lg">Meus Exames</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Adicionar Novo Exame
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
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCreateRequest}
              className="px-6 py-2 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {exams.map((exam) => (
            <li key={exam.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
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

              <div className="flex items-center gap-2">
                {/* Botão para Marcar como Realizado */}
                {exam.status === 'REQUESTED' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleExamRealized(exam.id); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    <CheckSquare className="w-3 h-3" /> Já fiz
                  </button>
                )}

                {exam.status === 'REALIZED' && (
                  <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-100 rounded-lg border border-purple-200">
                    <CheckCircle className="w-3 h-3" /> Feito
                  </span>
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