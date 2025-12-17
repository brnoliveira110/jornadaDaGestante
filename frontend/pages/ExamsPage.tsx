import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';
import { Upload, FileText, Image as ImageIcon, Eye, Plus, FileBadge, CheckCircle, CheckSquare } from 'lucide-react';

const ExamsWrapper: React.FC<any> = () => {
  const { exams, addExamRequest, toggleExamRealized, uploadExamResult } = useData();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Estado para adicionar exame manualmente
  const [requestName, setRequestName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleFileUpload(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Determine a name if not prompted. We can just use the filename for now or prompt user.
    // For specific UIUX, maybe prompt? Let's use filename as default without extension.
    const name = file.name.split('.').slice(0, -1).join('.');
    await uploadExamResult(file, name);
  };

  const handleCreateRequest = () => {
    if (requestName.trim()) {
      addExamRequest(requestName);
      setRequestName('');
      setIsAdding(false);
    }
  };

  const handleViewExam = (exam: any) => {
    if (exam.fileUrl) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5167/api';
      const baseUrl = apiUrl.replace('/api', '');
      window.open(`${baseUrl}${exam.fileUrl}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-lg">Meus Exames</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Adicionar Novo Exame
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-2">
          <label className="block text-xs font-bold text-slate-500 mb-1">Nome do Exame</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              placeholder="Ex: Ultrassom Morfológico, Hemograma..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleCreateRequest}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
          ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800">
            Arquivar Resultado
          </h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            Arraste e solte arquivos PDF ou fotos dos seus exames aqui para guardar no seu histórico.
          </p>
        </div>
      </div>

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
                      {exam.date} •
                      <span className={`ml-1 font-medium ${exam.status === 'REVIEWED' ? 'text-green-600' :
                        exam.status === 'REQUESTED' ? 'text-indigo-600' :
                          exam.status === 'REALIZED' ? 'text-purple-600' : 'text-amber-600'
                        }`}>
                        {exam.status === 'REVIEWED' ? 'Resultado Anexado' :
                          exam.status === 'REQUESTED' ? 'A realizar' :
                            exam.status === 'REALIZED' ? 'Realizado (Aguardando Resultado)' : 'Enviado'}
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
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    <CheckSquare className="w-3 h-3" /> Já fiz
                  </button>
                )}

                {exam.status === 'REALIZED' && (
                  <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-100 rounded-lg border border-purple-200">
                    <CheckCircle className="w-3 h-3" /> Feito
                  </span>
                )}

                <button
                  onClick={() => handleViewExam(exam)}
                  className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Visualizar Exame"
                >
                  <Eye className="w-5 h-5" />
                </button>
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