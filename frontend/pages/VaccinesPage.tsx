import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Syringe, Plus, CheckCircle, Clock, X, FileBadge, CheckSquare, Square, Info } from 'lucide-react';
import { PREGNANCY_VACCINATION_CALENDAR } from '../constants';
import { Vaccine } from '../types';

const Vaccines: React.FC = () => {
  const { vaccines, addVaccine, toggleVaccineStatus } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [newVaccineName, setNewVaccineName] = useState('');

  // Merge calendar with user data
  const mergedVaccines = React.useMemo(() => {
    // 1. Process Calendar Items
    const calendarItems = PREGNANCY_VACCINATION_CALENDAR.flatMap(item => {
      const items: any[] = [];
      for (let i = 1; i <= item.requiredDoses; i++) {
        // Is there a matching user vaccine?
        // Match by name and dose
        const match = vaccines.find(v =>
          v.name.toLowerCase() === item.name.toLowerCase() && v.dose === i
        );

        if (match) {
          items.push({ ...match, description: item.description, isCalendar: true });
        } else {
          // Virtual item
          items.push({
            id: `virtual-${item.name}-${i}`,
            name: item.name,
            dose: i,
            totalDoses: item.requiredDoses,
            status: 'PENDING',
            description: item.description,
            isCalendar: true,
            isVirtual: true
          });
        }
      }
      return items;
    });

    // 2. Add extra items (User added manually that are not in calendar logic)
    // Simple filter: if name is NOT in calendar names
    const calendarNames = PREGNANCY_VACCINATION_CALENDAR.map(c => c.name.toLowerCase());
    const extraItems = vaccines.filter(v => !calendarNames.includes(v.name.toLowerCase()));

    return [...calendarItems, ...extraItems];
  }, [vaccines]);

  const handleToggle = async (vac: any) => {
    if (vac.isVirtual) {
      // Create it as 'DONE'
      await addVaccine({
        id: crypto.randomUUID(),
        patientId: '',
        name: vac.name,
        dose: vac.dose,
        totalDoses: vac.totalDoses,
        status: 'DONE',
        dateAdministered: new Date().toISOString()
      });
    } else {
      // Use existing ID
      toggleVaccineStatus(vac.id);
    }
  };

  const handleAddVaccine = () => {
    if (newVaccineName) {
      addVaccine({
        id: crypto.randomUUID(),
        patientId: '',
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 border-b border-slate-100 pb-6 gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Syringe className="w-6 h-6 text-rose-500" />
            </div>
            Minha Carteira de Vacinação
          </h3>
          <p className="text-sm md:text-base text-slate-500 mt-1 ml-11">Calendário Nacional de Vacinação da Gestante</p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full md:w-auto flex justify-center items-center gap-2 text-white bg-primary-500 hover:bg-primary-600 font-bold px-4 py-3 md:py-2 rounded-xl transition-all shadow-lg shadow-primary-200"
          >
            <Plus className="w-4 h-4" /> Outra Vacina
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-8 p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Vacina / Imunizante</label>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={newVaccineName}
              onChange={(e) => setNewVaccineName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              placeholder="Ex: Vacina da Gripe"
            />
            <div className="flex gap-2">
              <button onClick={handleAddVaccine} className="flex-1 md:flex-none px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 flex justify-center items-center gap-2 font-bold shadow-md">
                <FileBadge className="w-4 h-4" />
                Salvar
              </button>
              <button onClick={() => setIsAdding(false)} className="px-4 py-3 text-slate-400 hover:bg-slate-200 rounded-xl transition-colors border border-transparent hover:border-slate-300">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-1 gap-4">
        {mergedVaccines.map((vac) => (
          <div key={vac.id} className={`relative p-4 md:p-5 rounded-2xl border transition-all group ${vac.status === 'DONE' ? 'bg-green-50/50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4 w-full">
                <div className={`p-3 rounded-full flex-shrink-0 ${vac.status === 'DONE' ? 'bg-green-100 text-green-600' : vac.status === 'LATE' ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-400'}`}>
                  {vac.status === 'DONE' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Syringe className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-lg flex flex-wrap items-center gap-2">
                    {vac.name}
                    {vac.totalDoses > 1 && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full whitespace-nowrap">Dose {vac.dose}/{vac.totalDoses}</span>}
                  </h4>
                  {vac.description && (
                    <p className="text-sm text-slate-500 mt-1 flex items-start gap-1">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                      <span>{vac.description}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full md:w-auto flex md:flex-col items-center md:items-end gap-2 pl-14 md:pl-0">
                {/* Botão de Check */}
                <button
                  onClick={() => handleToggle(vac)}
                  className={`w-full md:w-auto justify-center flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold shadow-sm
                     ${vac.status === 'DONE'
                      ? 'bg-green-500 text-white hover:bg-green-600 ring-2 ring-green-200'
                      : 'bg-white border border-slate-200 text-slate-400 hover:border-teal-500 hover:text-teal-600'}`}
                >
                  {vac.status === 'DONE' ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  {vac.status === 'DONE' ? 'Tomada' : 'Marcar como tomada'}
                </button>
              </div>
            </div>
            {vac.status === 'DONE' && !vac.isVirtual && (
              <div className="mt-3 ml-14 pl-2 border-l-2 border-green-200">
                <p className="text-xs text-green-700 font-medium">Realizada em: {vac.dateAdministered ? new Date(vac.dateAdministered).toLocaleDateString() : 'Data não informada'}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vaccines;