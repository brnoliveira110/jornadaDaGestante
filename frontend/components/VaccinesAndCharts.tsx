import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { UserRole } from '../types';
import { useData } from '../context/DataContext';
import { generateChartData } from '../utils';
import { Syringe, Activity, Plus, CheckCircle, Clock, Save, X, FileBadge, ShieldCheck, CheckSquare, Square } from 'lucide-react';

const VaccinesAndCharts: React.FC = () => {
  const { consultations, vaccines, currentUser, addVaccine, toggleVaccineStatus, pregnancyData } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [newVaccineName, setNewVaccineName] = useState('');

  if (!pregnancyData) return <div>Selecione um paciente</div>;

  const chartData = generateChartData(consultations, pregnancyData.preGestationalHeight);

  const handleAddVaccine = () => {
    if (newVaccineName) {
      addVaccine({
        id: Math.random().toString(),
        name: newVaccineName,
        dose: 1,
        totalDoses: 1,
        status: 'PENDING'
      });
      setNewVaccineName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Coluna 1: Gráfico Nutricional - ÁREA DESTACADA */}
      <div className="bg-white rounded-2xl shadow-lg shadow-teal-50 border border-teal-100 p-6 flex flex-col h-[450px] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Activity className="w-24 h-24 text-teal-600" />
        </div>
        
        <div className="relative z-10 mb-4">
          <h3 className="text-xl font-bold text-teal-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600" />
            Curva Nutricional (IMC)
          </h3>
          <p className="text-sm text-slate-500">Monitoramento do ganho de peso x Idade Gestacional.</p>
        </div>
        
        <div className="flex-1 w-full min-h-0 border rounded-xl p-2 bg-slate-50/50">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="week" name="Semana" label={{ value: 'Semanas', position: 'insideBottomRight', offset: -5, fontSize: 12 }} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line 
                type="monotone" 
                dataKey="maxNormal" 
                stroke="#94a3b8" 
                strokeDasharray="5 5" 
                dot={false} 
                name="Limite Superior Esperado" 
              />
              <Line 
                type="monotone" 
                dataKey="bmi" 
                stroke="#0d9488" 
                strokeWidth={3} 
                activeDot={{ r: 8 }} 
                name="IMC da Paciente"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Coluna 2: Carteira de Vacinação */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[450px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Syringe className="w-5 h-5 text-rose-500" />
            Vacinação Digital
          </h3>
          {currentUser?.role === UserRole.DOCTOR && !isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-xs font-bold px-3 py-1.5 bg-teal-50 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" /> Prescrever
            </button>
          )}
        </div>

        {isAdding && (
          <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nome da Vacina</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newVaccineName}
                onChange={(e) => setNewVaccineName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-teal-500"
                placeholder="Ex: Hepatite B"
              />
              <button onClick={handleAddVaccine} className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-1 px-3">
                <FileBadge className="w-3 h-3" />
                <span className="text-xs font-bold">Assinar</span>
              </button>
              <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="overflow-y-auto pr-2 space-y-3 flex-1 custom-scrollbar">
          {vaccines.map((vac) => (
            <div key={vac.id} className="relative p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm transition-all group">
              <div className="flex items-center justify-between mb-1">
                 <div className="flex items-center gap-2">
                    {vac.status === 'DONE' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className={`w-4 h-4 ${vac.status === 'LATE' ? 'text-red-500' : 'text-amber-500'}`} />
                    )}
                    <h4 className="font-semibold text-slate-800 text-sm">{vac.name}</h4>
                 </div>
                 
                 <div className="flex items-center gap-2">
                   <div className={`
                      px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                      ${vac.status === 'DONE' ? 'bg-green-100 text-green-700' : ''}
                      ${vac.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : ''}
                      ${vac.status === 'LATE' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {vac.status === 'DONE' ? 'Aplicada' : vac.status === 'LATE' ? 'Atrasada' : 'Prevista'}
                   </div>
                   
                   {/* Checkbox para Paciente marcar como realizado */}
                   <button 
                     onClick={() => toggleVaccineStatus(vac.id)}
                     className={`p-1 rounded hover:bg-slate-100 transition-colors ${vac.status === 'DONE' ? 'text-green-600' : 'text-slate-300'}`}
                     title="Marcar como tomada"
                   >
                      {vac.status === 'DONE' ? <CheckSquare className="w-5 h-5"/> : <Square className="w-5 h-5"/>}
                   </button>
                 </div>
              </div>

              <div className="flex justify-between items-end">
                <p className="text-xs text-slate-500 pl-6">
                   Dose {vac.dose}/{vac.totalDoses} • {vac.status === 'DONE' ? vac.dateAdministered : 'Pendente'}
                </p>
                
                {/* Visualização da Assinatura Digital */}
                {vac.digitalSignature && (
                  <div className="flex items-center gap-1 text-[9px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100" title={`Assinado por: ${vac.prescribedBy}`}>
                    <ShieldCheck className="w-3 h-3" />
                    <span className="font-bold">CRM {vac.doctorCrm}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VaccinesAndCharts;