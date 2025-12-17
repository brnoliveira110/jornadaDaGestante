import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { BloodType, PregnancyData } from '../types';
import { calculateDPP, calculateBMI, formatDate, formatBloodType } from '../utils';
import { Save, Calendar, Scale, Activity, Droplet, Calculator } from 'lucide-react';

interface PregnancySetupProps {
  onSave?: () => void;
}

const PregnancySetup: React.FC<PregnancySetupProps> = ({ onSave }) => {
  const { pregnancyData, updatePregnancyData, currentUser } = useData();

  // Local state for form
  const [formData, setFormData] = useState<Partial<PregnancyData>>({
    dum: '',
    initialWeight: 0,
    preGestationalHeight: 0,
    bloodType: BloodType.A_POS,
    spouseBloodType: undefined,
    weightGoalMin: 9,
    weightGoalMax: 12
  });

  const [calculatedInfo, setCalculatedInfo] = useState({
    dpp: '',
    bmi: 0,
    bmiStatus: ''
  });

  useEffect(() => {
    if (pregnancyData) {
      setFormData({
        dum: pregnancyData.dum ? new Date(pregnancyData.dum).toISOString().split('T')[0] : '',
        initialWeight: pregnancyData.initialWeight,
        preGestationalHeight: pregnancyData.preGestationalHeight,
        bloodType: pregnancyData.bloodType,
        spouseBloodType: pregnancyData.spouseBloodType,
        weightGoalMin: pregnancyData.weightGoalMin,
        weightGoalMax: pregnancyData.weightGoalMax
      });
    }
  }, [pregnancyData]);

  // Recalculate derived data whenever inputs change
  useEffect(() => {
    if (formData.dum) {
      const dppDate = calculateDPP(formData.dum);
      const bmi = calculateBMI(Number(formData.initialWeight), Number(formData.preGestationalHeight));

      let status = '';
      if (bmi > 0) {
        if (bmi < 18.5) status = 'Baixo Peso';
        else if (bmi < 24.9) status = 'Eutrófica (Normal)';
        else if (bmi < 29.9) status = 'Sobrepeso';
        else status = 'Obesidade';
      }

      setCalculatedInfo({
        dpp: formatDate(dppDate),
        bmi: bmi,
        bmiStatus: status
      });
    }
  }, [formData.dum, formData.initialWeight, formData.preGestationalHeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pregnancyData) return;

    const bmi = calculateBMI(Number(formData.initialWeight), Number(formData.preGestationalHeight));

    updatePregnancyData({
      dum: new Date(formData.dum!).toISOString(),
      dpp: calculateDPP(formData.dum!).toISOString(),
      initialWeight: Number(formData.initialWeight),
      preGestationalHeight: Number(formData.preGestationalHeight),
      preGestationalBMI: bmi,
      bloodType: formData.bloodType,
      spouseBloodType: formData.spouseBloodType,
      weightGoalMin: Number(formData.weightGoalMin),
      weightGoalMax: Number(formData.weightGoalMax)
    });

    alert('Dados clínicos atualizados com sucesso!');
    if (onSave) onSave();
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-teal-400" />
              Configuração Clínica da Gestação
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Preencha os dados iniciais para calibrar o acompanhamento da paciente.
            </p>
          </div>
          <div className="hidden md:block">
            <Calculator className="w-12 h-12 text-slate-700" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Coluna 1: Dados Biométricos */}
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Datação e Ciclo
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Data da Última Menstruação (DUM)</label>
              <input
                required
                type="date"
                value={formData.dum}
                onChange={e => setFormData({ ...formData, dum: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">Data Provável do Parto (DPP)</span>
              <div className="text-2xl font-bold text-teal-800 mt-1">
                {calculatedInfo.dpp || '--/--/----'}
              </div>
            </div>

            <h3 className="font-bold text-slate-800 border-b pb-2 mb-4 mt-8 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              Antropometria Inicial
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Peso Inicial (kg)</label>
                <input
                  required
                  type="number" step="0.1"
                  value={formData.initialWeight}
                  onChange={e => setFormData({ ...formData, initialWeight: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Altura (cm)</label>
                <input
                  required
                  type="number"
                  value={formData.preGestationalHeight}
                  onChange={e => setFormData({ ...formData, preGestationalHeight: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">IMC Inicial</span>
                <div className="text-2xl font-bold text-indigo-800">{calculatedInfo.bmi > 0 ? calculatedInfo.bmi : '--'}</div>
              </div>
              <div className="h-8 w-px bg-indigo-200"></div>
              <div className="text-sm font-medium text-indigo-700">
                {calculatedInfo.bmiStatus || 'Aguardando dados'}
              </div>
            </div>

          </div>

          {/* Coluna 2: Sangue e Metas */}
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-rose-500" />
              Tipagem Sanguínea
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Tipo Sanguíneo da Gestante</label>
              <select
                value={formData.bloodType}
                onChange={e => setFormData({ ...formData, bloodType: e.target.value as BloodType })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              >
                {Object.values(BloodType).map(t => (
                  <option key={t} value={t}>{formatBloodType(t)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Tipo Sanguíneo do Parceiro (Opcional)</label>
              <select
                value={formData.spouseBloodType || ''}
                onChange={e => setFormData({ ...formData, spouseBloodType: e.target.value as BloodType })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              >
                <option value="">Não informado</option>
                {Object.values(BloodType).map(t => (
                  <option key={t} value={t}>{formatBloodType(t)}</option>
                ))}
              </select>
            </div>

            <h3 className="font-bold text-slate-800 border-b pb-2 mb-4 mt-8 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Metas de Ganho de Peso
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Defina o intervalo recomendado de ganho de peso total para esta gestação.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mínimo (kg)</label>
                <input
                  type="number"
                  value={formData.weightGoalMin}
                  onChange={e => setFormData({ ...formData, weightGoalMin: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Máximo (kg)</label>
                <input
                  type="number"
                  value={formData.weightGoalMax}
                  onChange={e => setFormData({ ...formData, weightGoalMax: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Save className="w-5 h-5" />
                Salvar Dados Clínicos
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default PregnancySetup;