import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Syringe, Plus, CheckCircle, Clock, X, FileBadge, CheckSquare, Square } from 'lucide-react';

const Vaccines: React.FC = () => {
  const { vaccines, addVaccine, toggleVaccineStatus } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [newVaccineName, setNewVaccineName] = useState('');

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Syringe className="w-6 h-6 text-rose-500" />
            </div>
            Minha Carteira de Vacinação
          </h3>
          <p className="text-slate-500 mt-1 ml-11">Controle sua imunização e datas importantes.</p>
        </div>
        
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-white bg-teal-600 hover:bg-teal-700 font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-teal-200"
          >
            <Plus className="w-4 h-4" /> Adicionar Vacina
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Vacina / Imunizante</label>
          <div className="flex gap-3">
            <input 
              type="text" 
              value={newVaccineName}
              onChange={(e) => setNewVaccineName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              placeholder="Ex: dTpa (Tríplice bacteriana acelular)"
            />
            <button onClick={handleAddVaccine} className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 flex items-center gap-2 font-bold shadow-md">
              <FileBadge className="w-4 h-4" />
              Salvar
            </button>
            <button onClick={() => setIsAdding(false)} className="p-3 text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {vaccines.map((vac) => (
          <div key={vac.id} className="relative p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${vac.status === 'DONE' ? 'bg-green-100 text-green-600' : vac.status === 'LATE' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {vac.status === 'DONE' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{vac.name}</h4>
                    <p className="text-xs text-slate-500">Dose {vac.dose} de {vac.totalDoses}</p>
                  </div>
               </div>
               
               <div className="flex flex-col items-end gap-2">
                 <div className={`
                    px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                    ${vac.status === 'DONE' ? 'bg-green-100 text-green-700' : ''}
                    ${vac.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : ''}
                    ${vac.status === 'LATE' ? 'bg-red-100 text-red-700' : ''}
                  `}>
                    {vac.status === 'DONE' ? 'Aplicada' : vac.status === 'LATE' ? 'Atrasada' : 'Pendente'}
                 </div>
                 
                 {/* Checkbox para Paciente marcar como realizado */}
                 <button 
                   onClick={() => toggleVaccineStatus(vac.id)}
                   className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors text-xs font-medium
                     ${vac.status === 'DONE' ? 'text-green-700 bg-green-50 hover:bg-green-100' : 'text-slate-400 hover:text-teal-600 hover:bg-slate-100'}`}
                   title={vac.status === 'DONE' ? 'Desmarcar' : 'Marcar como tomada'}
                 >
                    {vac.status === 'DONE' ? <CheckSquare className="w-4 h-4"/> : <Square className="w-4 h-4"/>}
                    {vac.status === 'DONE' ? 'Confirmado' : 'Já tomei'}
                 </button>
               </div>
            </div>

            <div className="flex justify-between items-end border-t border-slate-100 pt-3 mt-2">
              <p className="text-xs text-slate-500">
                 {vac.status === 'DONE' ? `Data: ${vac.dateAdministered}` : 'Aguardando aplicação'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vaccines;