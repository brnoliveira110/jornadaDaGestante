import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Heart, Scale, Droplet, ArrowUpRight, Clock, Calendar as CalendarIcon, Activity, Ruler } from 'lucide-react';
import { PregnancyData, User } from '../types';
import { formatDate, calculateGestationalAge, calculateBMI, formatBloodType, getFetalImageUrl } from '../utils';
import { INITIAL_TIPS, WEEKLY_DEVELOPMENT } from '../constants';
import { useData } from '../context/DataContext';

interface DashboardProps {
  data: PregnancyData;
  user: User;
  currentWeight: number;
  onViewTips: () => void;
}

const StatCard = ({ icon: Icon, title, value, subtext, colorClass }: any) => (
  <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-xs lg:text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
      <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ data, currentWeight, onViewTips }) => {
  const { exams, currentUser } = useData();
  const gestationalAge = calculateGestationalAge(data.dum);
  const totalWeightGain = (currentWeight - data.initialWeight).toFixed(1);
  const currentBMI = calculateBMI(currentWeight, data.preGestationalHeight);

  // Selecionar info da semana
  const currentDevelopment = WEEKLY_DEVELOPMENT.find(w => w.week === gestationalAge) || WEEKLY_DEVELOPMENT[WEEKLY_DEVELOPMENT.length - 1];

  // Selecionar dica
  const relevantTips = INITIAL_TIPS.filter(t => gestationalAge >= t.minWeek && gestationalAge <= t.maxWeek);
  const currentTip = relevantTips.length > 0 ? relevantTips[gestationalAge % relevantTips.length] : null;

  // Filter upcoming exams
  const upcomingExams = exams
    .filter(e => e.status === 'REQUESTED' || new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
          <p className="text-slate-500 text-sm">Acompanhe o progresso da sua gestação</p>
        </div>
        <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full border border-rose-100">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span className="text-rose-700 font-semibold text-sm">Semana {gestationalAge}</span>
        </div>
      </div>

      {/* Main Feature: Fetal Development (The "GIF" Highlight) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 p-8 lg:p-12 gap-8 items-center">

          {/* Visual Highlight - Center Stage */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative group">
              {/* Glowing effect backend the image */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 to-rose-500 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>

              <div className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-full border-4 border-white/10 shadow-2xl overflow-hidden bg-black/20 backdrop-blur-sm">
                <img
                  /* Using a timestamp to avoid caching if image updates */
                  src={currentDevelopment?.imageUrl || getFetalImageUrl(currentDevelopment?.week || 1)}
                  alt="Desenvolvimento Fetal"
                  className="w-full h-full object-cover transform hover:scale-105 transition duration-700 ease-in-out"
                />

                {/* Overlay Tag */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                  {currentDevelopment?.sizeComparison || 'Em desenvolvimento'}
                </div>
              </div>
            </div>
          </div>

          {/* Info Side */}
          <div className="order-2 lg:order-1 space-y-6 text-center lg:text-left">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-200 to-white mb-2">
                Olá {currentUser?.name?.split(' ')[0] || 'Gestante'}
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                {currentDevelopment?.description || 'O bebê continua crescendo e se desenvolvendo a cada dia.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-primary-300 mb-1">
                  <Scale className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">Peso</span>
                </div>
                <p className="text-xl font-bold">{currentDevelopment?.weight}</p>
              </div>
              <div className="text-center border-l border-white/10">
                <div className="flex items-center justify-center gap-1 text-primary-300 mb-1">
                  <Ruler className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">Tamanho</span>
                </div>
                <p className="text-xl font-bold">{currentDevelopment?.length}</p>
              </div>
              <div className="text-center border-l border-white/10">
                <div className="flex items-center justify-center gap-1 text-primary-300 mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">Coração</span>
                </div>
                <p className="text-xl font-bold">{currentDevelopment?.heartRate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Secondary Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          title="Idade Gestacional"
          value={`${gestationalAge} Semanas`}
          subtext={`DPP: ${formatDate(data.dpp)}`}
          colorClass="bg-primary-500 text-primary-500"
        />
        <StatCard
          icon={Scale}
          title="Controle de Peso"
          value={`${totalWeightGain} kg ganhos`}
          subtext={`Meta: ${data.weightGoalMin}kg - ${data.weightGoalMax}kg`}
          colorClass="bg-secondary-500 text-secondary-500"
        />
        <StatCard
          icon={ArrowUpRight}
          title="IMC Atual"
          value={currentBMI}
          subtext={`Inicial: ${data.preGestationalBMI}`}
          colorClass="bg-indigo-500 text-indigo-500"
        />
        <StatCard
          icon={Droplet}
          title="Tipo Sanguíneo"
          value={formatBloodType(data.bloodType)}
          subtext={data.spouseBloodType ? `Cônjuge: ${formatBloodType(data.spouseBloodType)}` : 'Cônjuge: N/A'}
          colorClass="bg-red-500 text-red-500"
        />
      </div>

      {/* Bottom Grid: Tips & Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Tip */}
        <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-2xl border border-primary-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary-100 p-2 rounded-lg text-primary-600">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Dica do Dia</h3>
          </div>
          {currentTip ? (
            <div>
              <h4 className="font-bold text-primary-900 mb-2">{currentTip.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{currentTip.content}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhuma dica para hoje.</p>
          )}
        </div>

        {/* Agenda */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-slate-400" /> Próximos Exames
            </h3>
            <Link to="/exams" className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline">
              Ver todos
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingExams.length > 0 ? (
              upcomingExams.map((exam) => (
                <div key={exam.id} className="flex gap-4 items-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                  <div className="bg-white p-3 rounded-lg shadow-sm text-slate-500 text-center min-w-[3.5rem]">
                    <span className="block text-xs font-bold uppercase">{new Date(exam.date).toLocaleString('default', { month: 'short' }).replace('.', '')}</span>
                    <span className="block text-xl font-bold text-slate-800">{new Date(exam.date).getDate()}</span>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-bold text-slate-700">{exam.name}</h4>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p>Você não tem exames agendados para os próximos dias.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;