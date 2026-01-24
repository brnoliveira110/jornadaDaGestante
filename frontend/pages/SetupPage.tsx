import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { BloodType, PregnancyData } from '../types';
import { calculateDPP, calculateBMI, formatDate, formatBloodType } from '../utils';
import { Save, Calendar, Scale, Activity, Droplet, Calculator, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

// --- Componente do Formulário ---
export const PregnancySetupForm: React.FC<{ onSave?: () => void, className?: string }> = ({ onSave, className }) => {
  const { pregnancyData, updatePregnancyData } = useData();

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
        weightGoalMax: pregnancyData.weightGoalMax,
        theme: pregnancyData.theme || 'NEUTRAL'
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
      weightGoalMax: Number(formData.weightGoalMax),
      theme: formData.theme || 'NEUTRAL'
    });

    toast.success('Dados clínicos atualizados com sucesso!');
    if (onSave) onSave();
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Coluna 1: Dados Biométricos */}
        <div className="space-y-6">
          <div className="border-l-4 border-teal-500 pl-4 py-1 bg-slate-50/50 rounded-r-xl">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Datação da Gestação
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Data da Última Menstruação (DUM)</label>
              <input
                required
                type="date"
                value={formData.dum}
                onChange={e => setFormData({ ...formData, dum: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-shadow shadow-sm"
              />
            </div>

            <div className="p-5 bg-gradient-to-br from-teal-50 to-white rounded-xl border border-teal-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">Data Provável do Parto</span>
                <div className="text-2xl font-bold text-teal-800 mt-1">
                  {calculatedInfo.dpp || '--/--/----'}
                </div>
              </div>
              <Calendar className="w-8 h-8 text-teal-200" />
            </div>
          </div>

          <div className="border-l-4 border-indigo-500 pl-4 py-1 bg-slate-50/50 rounded-r-xl mt-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              Dados Antropométricos Iniciais
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Peso Inicial (kg)</label>
              <div className="relative">
                <input
                  required
                  type="number" step="0.1"
                  value={formData.initialWeight}
                  onChange={e => setFormData({ ...formData, initialWeight: Number(e.target.value) })}
                  className="w-full pl-4 pr-8 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm"
                  placeholder="Ex: 60"
                />
                <span className="absolute right-3 top-3.5 text-xs text-slate-400 font-bold">KG</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Altura (cm)</label>
              <div className="relative">
                <input
                  required
                  type="number"
                  value={formData.preGestationalHeight}
                  onChange={e => setFormData({ ...formData, preGestationalHeight: Number(e.target.value) })}
                  className="w-full pl-4 pr-8 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow shadow-sm"
                  placeholder="Ex: 165"
                />
                <span className="absolute right-3 top-3.5 text-xs text-slate-400 font-bold">CM</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-indigo-50 rounded-xl border border-indigo-100">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">IMC Inicial</span>
              <div className="text-3xl font-bold text-indigo-800">{calculatedInfo.bmi > 0 ? calculatedInfo.bmi : '--'}</div>
            </div>
            <div className="h-10 w-px bg-indigo-200 mx-2"></div>
            <div className="flex flex-col">
              <span className="text-xs text-indigo-400 font-bold uppercase">Classificação</span>
              <div className="text-base font-bold text-indigo-700">
                {calculatedInfo.bmiStatus || 'Aguardando dados'}
              </div>
            </div>
          </div>

        </div>

        {/* Coluna 2: Sangue e Metas */}
        <div className="space-y-6">
          <div className="border-l-4 border-rose-500 pl-4 py-1 bg-slate-50/50 rounded-r-xl">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-rose-500" />
              Dados Sanguíneos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo Sanguíneo (Ela)</label>
              <select
                value={formData.bloodType}
                onChange={e => setFormData({ ...formData, bloodType: e.target.value as BloodType })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white transition-shadow shadow-sm"
              >
                {Object.values(BloodType).map(t => (
                  <option key={t} value={t}>{formatBloodType(t)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Parceiro (Opcional)</label>
              <select
                value={formData.spouseBloodType || ''}
                onChange={e => setFormData({ ...formData, spouseBloodType: e.target.value as BloodType })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white transition-shadow shadow-sm"
              >
                <option value="">Não informado</option>
                {Object.values(BloodType).map(t => (
                  <option key={t} value={t}>{formatBloodType(t)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Seção Tema */}
          <div className="border-l-4 border-slate-500 pl-4 py-1 bg-slate-50/50 rounded-r-xl mt-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-slate-600" />
              Tema do Sistema
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, theme: 'NEUTRAL' })}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.theme === 'NEUTRAL' || !formData.theme ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200' : 'bg-white border-slate-200 hover:bg-amber-50/50'}`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-500"></div>
              <span className="text-xs font-bold text-slate-700">Neutro</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, theme: 'BOY' })}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.theme === 'BOY' ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-200' : 'bg-white border-slate-200 hover:bg-sky-50/50'}`}
            >
              <div className="w-6 h-6 rounded-full bg-sky-400"></div>
              <span className="text-xs font-bold text-slate-700">Menino</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, theme: 'GIRL' })}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.theme === 'GIRL' ? 'bg-pink-50 border-pink-400 ring-2 ring-pink-200' : 'bg-white border-slate-200 hover:bg-pink-50/50'}`}
            >
              <div className="w-6 h-6 rounded-full bg-pink-400"></div>
              <span className="text-xs font-bold text-slate-700">Menina</span>
            </button>
          </div>

          <div className="border-l-4 border-green-500 pl-4 py-1 bg-slate-50/50 rounded-r-xl mt-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Meta de Ganho de Peso
            </h3>
          </div>

          <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Defina o intervalo recomendado de ganho de peso total para esta gestação com base no IMC inicial.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-green-700 mb-1 uppercase">Mínimo (kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.weightGoalMin}
                    onChange={e => setFormData({ ...formData, weightGoalMin: Number(e.target.value) })}
                    className="w-full pl-4 pr-8 py-2.5 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 outline-none bg-white font-bold text-green-800"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-green-500 font-bold">KG</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-green-700 mb-1 uppercase">Máximo (kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.weightGoalMax}
                    onChange={e => setFormData({ ...formData, weightGoalMax: Number(e.target.value) })}
                    className="w-full pl-4 pr-8 py-2.5 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 outline-none bg-white font-bold text-green-800"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-green-500 font-bold">KG</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-1"
            >
              <Save className="w-5 h-5" />
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

const PregnancySetupPage: React.FC = () => {
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
        <PregnancySetupForm className="p-6 md:p-8" />
      </div>
    </div>
  );
};

export default PregnancySetupPage;