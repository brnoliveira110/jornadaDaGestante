import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Heart, Scale, Droplet, ArrowUpRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { PregnancyData, User } from '../types';
import { formatDate, calculateGestationalAge, calculateBMI, formatBloodType } from '../utils';
import { INITIAL_TIPS } from '../constants';
import { useData } from '../context/DataContext';

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
  const { exams } = useData();
  const gestationalAge = calculateGestationalAge(data.dum);
  const totalWeightGain = (currentWeight - data.initialWeight).toFixed(1);
  const currentBMI = calculateBMI(currentWeight, data.preGestationalHeight);

  // Selecionar dica baseada na semana (rotação consistente baseada na semana)
  const relevantTips = INITIAL_TIPS.filter(t => gestationalAge >= t.minWeek && gestationalAge <= t.maxWeek);
  const currentTip = relevantTips.length > 0 ? relevantTips[gestationalAge % relevantTips.length] : null;

  // Filter upcoming exams (REQUESTED or SCHEDULED)
  const upcomingExams = exams
    .filter(e => e.status === 'REQUESTED' || new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3); // Show top 3

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Datas */}
        <StatCard
          icon={Calendar}
          title="Idade Gestacional"
          value={`${gestationalAge} Semanas`}
          subtext={`DPP: ${formatDate(data.dpp)}`}
          colorClass="bg-primary-500 text-primary-500"
        />

        {/* Card Peso/Metas */}
        <StatCard
          icon={Scale}
          title="Controle de Peso"
          value={`${totalWeightGain} kg ganhos`}
          subtext={`Meta: ${data.weightGoalMin}kg - ${data.weightGoalMax}kg`}
          colorClass="bg-secondary-500 text-secondary-500"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tip of the Week */}
        <div className="lg:col-span-2 bg-gradient-to-br from-primary-50 to-white p-6 rounded-2xl border border-primary-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary-500" /> Olá, mamãe!
          </h2>
          <div className="text-slate-600 mt-4 text-sm leading-relaxed">
            <p className="mb-3">Você está na <strong className="text-primary-600 font-bold text-base">{gestationalAge}ª semana</strong> de gestação.</p>
            {currentTip && (
              <div className="bg-white p-4 rounded-xl border border-primary-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-400"></div>
                <strong className="block text-slate-800 mb-1 flex items-center gap-2">
                  💡 {currentTip.title}
                </strong>
                <p className="text-slate-500">{currentTip.content}</p>
              </div>
            )}
          </div>
        </div>

        {/* Agenda / Next Exams */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" /> Próximos Exames
          </h3>

          {upcomingExams.length > 0 ? (
            <div className="space-y-3 flex-1">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="flex gap-3 items-start p-3 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors border border-primary-100">
                  <div className="bg-white text-primary-600 p-2 rounded-lg shrink-0 shadow-sm">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm line-clamp-1">{exam.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{formatDate(exam.date)}</p>
                  </div>
                </div>
              ))}
              <div className="mt-auto pt-2">
                <Link to="/exams" className="block w-full text-xs text-center text-primary-600 font-semibold hover:underline">
                  Ver todos os exames
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="bg-slate-50 p-3 rounded-full mb-3">
                <CalendarIcon className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500">Nenhum exame pendente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;