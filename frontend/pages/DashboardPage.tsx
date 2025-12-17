import React from 'react';
import { Calendar, Heart, Scale, Droplet, ArrowUpRight } from 'lucide-react';
import { PregnancyData, User } from '../types';
import { formatDate, calculateGestationalAge, calculateBMI, formatBloodType } from '../utils';

interface DashboardProps {
  data: PregnancyData;
  user: User;
  currentWeight: number;
  onViewTips: () => void;
}

const StatCard = ({ icon: Icon, title, value, subtext, colorClass }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start space-x-4">
    <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ data, currentWeight, onViewTips }) => {
  const gestationalAge = calculateGestationalAge(data.dum);
  const totalWeightGain = (currentWeight - data.initialWeight).toFixed(1);
  const currentBMI = calculateBMI(currentWeight, data.preGestationalHeight);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Datas */}
        <StatCard
          icon={Calendar}
          title="Idade Gestacional"
          value={`${gestationalAge} Semanas`}
          subtext={`DPP: ${formatDate(data.dpp)}`}
          colorClass="bg-rose-500 text-rose-500"
        />

        {/* Card Peso/Metas */}
        <StatCard
          icon={Scale}
          title="Controle de Peso"
          value={`${totalWeightGain} kg ganhos`}
          subtext={`Meta: ${data.weightGoalMin}kg - ${data.weightGoalMax}kg`}
          colorClass="bg-teal-500 text-teal-500"
        />

        {/* Card Antropometria Atual */}
        <StatCard
          icon={ArrowUpRight}
          title="IMC Atual"
          value={currentBMI}
          subtext={`Inicial: ${data.preGestationalBMI}`}
          colorClass="bg-indigo-500 text-indigo-500"
        />

        {/* Card Sanguíneo */}
        <StatCard
          icon={Droplet}
          title="Tipo Sanguíneo"
          value={formatBloodType(data.bloodType)}
          subtext={data.spouseBloodType ? `Cônjuge: ${formatBloodType(data.spouseBloodType)}` : 'Cônjuge: N/A'}
          colorClass="bg-red-500 text-red-500"
        />
      </div>

      <div className="bg-gradient-to-r from-rose-50 to-teal-50 p-6 rounded-2xl border border-rose-100 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Olá, mamãe!</h2>
          <p className="text-slate-600 mt-1 max-w-lg">
            Você está na <strong>{gestationalAge}ª semana</strong>. Lembre-se de beber bastante água e manter sua rotina de caminhadas leves se recomendado.
          </p>
        </div>
        <button
          onClick={onViewTips}
          className="mt-4 md:mt-0 px-6 py-2 bg-white text-rose-600 font-semibold rounded-full shadow-sm hover:shadow-md transition-all text-sm border border-rose-100"
        >
          Ver Dicas da Semana
        </button>
      </div>
    </div>
  );
};

export default Dashboard;