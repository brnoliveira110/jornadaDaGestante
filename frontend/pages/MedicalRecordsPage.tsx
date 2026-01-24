import React, { useEffect, useState } from 'react';
import { UserRole } from '../types';
import { FileText, Plus, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useConsultations } from '../hooks/useConsultations';
import { ConsultationList } from '../components/ConsultationList';
import { ConsultationForm } from '../components/forms/ConsultationForm';
import { ConsultationCreateDto } from '../types';

interface MedicalRecordsProps {
  consultations?: any[];
  userRole?: UserRole;
}

const MedicalRecordsPage: React.FC<MedicalRecordsProps> = () => {
  const { currentUser } = useData();
  const { consultations, loading, fetchConsultations, createConsultation } = useConsultations(currentUser?.id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const handleAddConsultation = async (data: Omit<ConsultationCreateDto, 'patientId' | 'requestedExams' | 'status'>) => {
    if (!currentUser) return;

    const dto: ConsultationCreateDto = {
      ...data,
      patientId: currentUser.id,
      requestedExams: [],
      status: 'COMPLETED'
    };

    const success = await createConsultation(dto);
    if (success) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
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

        <div className="overflow-x-auto min-h-[200px]">
          {loading && consultations.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <ConsultationList data={consultations} />
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 relative p-1">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <ConsultationForm onSubmit={handleAddConsultation} isLoading={loading} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsPage;